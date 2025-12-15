import os
import json
from dotenv import load_dotenv
from lib.db import SupabaseDB

# Load env from project root
load_dotenv(dotenv_path='../.env.local')

def run_pilot():
    print("🚀 Starting Pilot Ingestion...")
    
    try:
        db = SupabaseDB()
    except Exception as e:
        print(f"❌ Failed to connect to DB: {e}")
        print("💡 Hint: Make sure SUPABASE_URL and SUPABASE_SERVICE_KEY are in .env.local")
        return

    # 1. Ensure Source exists
    source_id = db.get_source_id("Pilot Manual Test", "test_script")
    print(f"✅ Source ID: {source_id}")

    # 2. Mock Data (Simulating a scraper)
    mock_courts = [
        {
            "external_id": "pilot-001",
            "source_id": source_id,
            "source_url": "http://example.com/court1",
            "name": "Austin High Tennis Center",
            "address1": "1715 W Cesar Chavez St",
            "city": "Austin",
            "region": "TX",
            "postal_code": "78703",
            "country": "US",
            "latitude": 30.2729,
            "longitude": -97.7733,
            "indoor_outdoor": "outdoor",
            "court_count": 8,
            "surface": "asphalt",
            "lights": True,
            "confidence_score": 90
        },
        {
            "external_id": "pilot-002",
            "source_id": source_id,
            "source_url": "http://example.com/court2",
            "name": "Pan Am Neighborhood Park",
            "address1": "2100 E 3rd St",
            "city": "Austin",
            "region": "TX",
            "postal_code": "78702",
            "country": "US",
            "latitude": 30.2618,
            "longitude": -97.7176,
            "indoor_outdoor": "outdoor",
            "court_count": 3,
            "surface": "concrete",
            "lights": True,
            "confidence_score": 85
        },
        # A duplicate test (Close to Austin High but different details)
        {
            "external_id": "pilot-003",
            "source_id": source_id,
            "source_url": "http://example.com/court3",
            "name": "Austin High School Courts", # Similar name
            "address1": "1715 West Cesar Chavez", # Slight diff address
            "city": "Austin",
            "region": "TX",
            "country": "US",
            "latitude": 30.2730, # Close lat
            "longitude": -97.7732, # Close lng
            "indoor_outdoor": "outdoor",
            "confidence_score": 75
            # Should hopefully match pilot-001 via dedupe logic
        }
    ]

    # 3. Ingest
    for i, court_data in enumerate(mock_courts):
        print(f"\nProcessing {i+1}/{len(mock_courts)}: {court_data['name']}...")
        court_id = db.upsert_court(court_data)
        
        if court_id:
            print(f"  🎉 Upserted! ID: {court_id}")
        else:
            print("  ⚠️ Failed to upsert.")

    print("\n🏁 Pilot Complete.")

if __name__ == "__main__":
    run_pilot()
