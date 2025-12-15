import requests
from bs4 import BeautifulSoup
from geopy.geocoders import Nominatim
from lib.db import SupabaseDB
import time
import re

def scrape():
    url = "https://www.austintexas.gov/department/pickleball"
    print(f"Fetching {url}...")
    try:
        resp = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
        resp.raise_for_status()
    except Exception as e:
        print(f"Failed to fetch: {e}")
        return

    soup = BeautifulSoup(resp.text, 'html.parser')
    
    geolocator = Nominatim(user_agent="pickleball_players_app_v1", timeout=10)
    db = SupabaseDB()
    source_id = db.get_source_id("Austin Parks & Rec", "municipal", url)

    # Find the container with the list. It seems to be in <dd> after <dt>Pickleball Locations</dt>
    # traversing is risky, let's just iterate all <p> tags with <strong> and <br>
    
    courts_found = 0
    
    for p in soup.find_all('p'):
        strong = p.find('strong')
        if not strong:
            continue
        
        name = strong.get_text(strip=True)
        # Check if address follows
        full_text = p.get_text(" ", strip=True)
        # Address is usually after the name
        address_part = full_text.replace(name, "").strip()
        
        if "Austin" not in address_part and "TX" not in address_part:
            # Maybe the address is cleaner
            pass

        if len(address_part) < 5:
            continue
            
        print(f"Found: {name} | {address_part}")
        
        # Features in next <ul>
        features = []
        court_count = 1
        indoor = False
        
        ul = p.find_next_sibling('ul')
        if ul:
            for li in ul.find_all('li'):
                text = li.get_text(strip=True)
                features.append(text)
                if "Indoor" in text:
                    indoor = True
                # Try to extract number of courts
                # "3 Dedicated Outdoor Courts"
                match = re.search(r'(\d+)\s+(Dedicated|Multi-purpose|Outdoor|Indoor)', text, re.IGNORECASE)
                if match:
                    court_count = int(match.group(1))

        # Geocode
        try:
            print(f"  Geocoding '{address_part}'...")
            time.sleep(1.1) # Rate limit
            location = geolocator.geocode(address_part)
            if location:
                lat = location.latitude
                lng = location.longitude
            else:
                print("  Could not geocode address, trying name...")
                time.sleep(1.1)
                location = geolocator.geocode(f"{name}, Austin, TX")
                if location:
                     lat = location.latitude
                     lng = location.longitude
                else:
                    lat, lng = None, None
        except Exception as e:
            print(f"  Geocoding error: {e}")
            lat, lng = None, None

        if not lat:
            print("  Skipping due to no location.")
            continue
            
        # Upsert
        court_data = {
            "source_id": source_id,
            "external_id": name, # Use name as external ID for this simple scrape
            "name": name,
            "address1": address_part,
            "city": "Austin",
            "region": "TX",
            "country": "USA",
            "latitude": lat,
            "longitude": lng,
            "court_count": court_count,
            "indoor_outdoor": "indoor" if indoor else "outdoor",
            "surface": "Hard", # Default
            "access_type": "public",
            "is_claimed": False,
            "confidence_score": 90, # High confidence
            "scraped_data": {"features": features, "raw_address": address_part}
        }
        
        try:
            res = db.upsert_court(court_data)
            print(f"  Saved ({res})")
            courts_found += 1
        except Exception as e:
            print(f"  DB Error: {e}")

    print(f"Done. Imported {courts_found} courts.")

if __name__ == "__main__":
    scrape()
