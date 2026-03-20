import requests
import json

BASE_URL = "http://localhost:8000"
phone = "9987705206" # Fallback phone for tests

def test_booking_error():
    print("Fetching stations...")
    resp = requests.get(f"{BASE_URL}/stations/")
    if resp.status_code != 200:
        print("Failed to get stations:", resp.text)
        return
    
    stations = resp.json()
    source = stations[0]['id']
    dest = stations[2]['id']
    
    print(f"Booking from {source} to {dest}...")
    payload = {
        "phone": phone,
        "source_station_id": source,
        "destination_station_id": dest,
        "passengers": 3,
        "journey_type": "single"
    }
    
    res = requests.post(f"{BASE_URL}/tickets/book", json=payload)
    print(f"Status Code: {res.status_code}")
    print(f"Response: {res.text}")

if __name__ == "__main__":
    test_booking_error()
