import requests
from geopy.geocoders import Nominatim
from lib.db import SupabaseDB
import time

def harvest_osm(location_name):
    print(f"🚀 Starting OSM Harvest for: {location_name}")
    
    # 1. Get Bounding Box
    geolocator = Nominatim(user_agent="pickleball_players_app_v1", timeout=10)
    location = geolocator.geocode(location_name)
    
    if not location:
        print("❌ Could not find location.")
        return

    # Extract bounding box (Nominatim returns [min_lat, max_lat, min_lon, max_lon] usually, or similar)
    # Actually Nominatim raw returns 'boundingbox': ['30.0986646', '30.516863', '-97.9367663', '-97.5684293']
    # Overpass expects: (south, west, north, east) -> (min_lat, min_lon, max_lat, max_lon)
    
    bbox = location.raw.get('boundingbox')
    if not bbox:
        print("❌ No bounding box found.")
        return
        
    min_lat, max_lat, min_lon, max_lon = bbox
    # Nominatim bbox is [min_lat, max_lat, min_lon, max_lon] strings
    
    print(f"📍 Bounding Box: {min_lat}, {min_lon}, {max_lat}, {max_lon}")

    # 2. Query Overpass API
    overpass_url = "http://overpass-api.de/api/interpreter"
    
    # Query for distinct pickleball courts OR tennis courts with pickleball lines (often tagged sport=pickleball)
    overpass_query = f"""
    [out:json];
    (
      node["sport"="pickleball"]({min_lat},{min_lon},{max_lat},{max_lon});
      way["sport"="pickleball"]({min_lat},{min_lon},{max_lat},{max_lon});
      relation["sport"="pickleball"]({min_lat},{min_lon},{max_lat},{max_lon});
    );
    out center;
    """
    
    print("📡 Querying OpenStreetMap (Overpass API)...")
    try:
        response = requests.get(overpass_url, params={'data': overpass_query})
        response.raise_for_status()
        data = response.json()
    except Exception as e:
        print(f"❌ Overpass Error: {e}")
        return

    elements = data.get('elements', [])
    print(f"✅ Found {len(elements)} items. Processing...")
    
    db = SupabaseDB()
    source_id = db.get_source_id("OpenStreetMap", "aggregation", "https://www.openstreetmap.org")
    
    count = 0
    for el in elements:
        tags = el.get('tags', {})
        lat = el.get('lat') or el.get('center', {}).get('lat')
        lng = el.get('lon') or el.get('center', {}).get('lon')
        
        if not lat or not lng:
            continue
            
        # Extract metadata
        raw_name = tags.get('name')
        
        # Helper for reverse geocoding (lazy load)
        rev_info = None
        def get_rev_info():
            nonlocal rev_info
            if rev_info: return rev_info
            try:
                time.sleep(1.1)
                rev = geolocator.reverse((lat, lng), exactly_one=True)
                if rev and 'address' in rev.raw:
                    rev_info = rev.raw['address']
            except Exception as e:
                print(f"⚠️ RevGeo Error: {e}")
            return rev_info

        # Name Heuristics
        if raw_name:
            name = raw_name
        else:
            # Try to infer name from location or operator
            operator = tags.get('operator')
            if operator:
                name = f"{operator} Pickleball Courts"
            else:
                 # Fallback to reverse geocoding
                 addr = get_rev_info()
                 if addr:
                     # Look for park, leisure, or building names
                     # print(f"DEBUG ADDR KEYS: {addr.keys()}") # Uncomment to debug
                     candidates = [
                         addr.get('leisure'), addr.get('park'), 
                         addr.get('recreation_ground'), addr.get('pitch'), 
                         addr.get('sport_centre'), addr.get('community_centre'),
                         addr.get('stadium'), addr.get('building'), 
                         addr.get('amenity'), addr.get('resort'), 
                         addr.get('centre'), addr.get('school'), 
                         addr.get('university'), addr.get('college'),
                         addr.get('hamlet'), addr.get('village') # Last resort location names
                     ]
                     site_name = next((c for c in candidates if c), None)

                     if site_name:
                         # e.g. "Riverside Park" -> "Riverside Park Pickleball Courts"
                         if "pickleball" in site_name.lower():
                             name = site_name
                         else:
                             name = f"{site_name} Pickleball Courts"
                     elif addr.get('road'):
                         name = f"Courts at {addr.get('road')}"
                     else:
                         name = "Unnamed Pickleball Court"
                         print(f"⚠️ Could not identify name from reverse geo. Tags: {tags} | Addr: {addr}")
                 else:
                     name = "Unnamed Pickleball Court"
                     print(f"⚠️ No address info found for {lat}, {lng}")
        
        # State/Region Logic
        state = tags.get('addr:state')
        if not state:
            # Try Reverse Geo
            addr = get_rev_info()
            if addr:
                state = addr.get('state')
        
        if not state:
            # Try Input String Fallback
            parts = location_name.split(',')
            if len(parts) > 1:
                # e.g. "Denver, CO" -> "CO"
                state = parts[-1].strip()
        
        # Address construction
        addr_parts = [tags.get(k) for k in ['addr:housenumber', 'addr:street', 'addr:city'] if tags.get(k)]
        if not addr_parts and get_rev_info():
             # Use full address from reverse geo if OSM tags are empty
             rev_a = get_rev_info()
             # Construct address from rev geo
             p = [rev_a.get(k) for k in ['house_number', 'road', 'city'] if rev_a.get(k)]
             if p: address = ", ".join(p)
             else: address = f"{lat:.4f}, {lng:.4f}"
        else:
             address = ", ".join(addr_parts) if addr_parts else f"{lat:.4f}, {lng:.4f}"
        
        features = []
        if tags.get('lit') == 'yes': features.append('Lighted')
        if tags.get('access') == 'private': features.append('Private')
        if tags.get('indoor') == 'yes': features.append('Indoor')

        # Fix Access Type Enum
        access = tags.get('access', 'public').lower()
        if access in ['yes', 'permissive', 'customers']: access = 'public'
        if access not in ['public', 'private', 'membership']: access = 'public' 

        # Upsert
        court_data = {
            "source_id": source_id,
            "external_id": str(el['id']),
            "name": name,
            "address1": address,
            "city": tags.get('addr:city') or location_name.split(',')[0],
            "region": state or "Unknown",
            "country": "USA", # Assumption for now
            "latitude": lat,
            "longitude": lng,
            "court_count": 1, 
            "indoor_outdoor": "indoor" if tags.get('indoor') == 'yes' else "outdoor",
            "surface": tags.get('surface', 'Hard'),
            "access_type": access,
            "is_claimed": False,
            "confidence_score": 80,
            "scraped_data": tags
        }
        
        try:
            db.upsert_court(court_data)
            count += 1
            if count % 10 == 0:
                print(f"  Imported {count}...")
        except Exception as e:
            print(f"  Error: {e}")
            
    print(f"🎉 Finished. Imported {count} new locations.")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        city = sys.argv[1]
    else:
        city = input("Enter city to harvest (e.g. 'Dallas, TX'): ") or "Austin, TX"
    
    harvest_osm(city)
