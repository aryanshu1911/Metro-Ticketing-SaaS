import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_phase2():
    phone = "9987705206" # Using the already verified phone
    
    print("\n--- Phase 2: Full Backend Verification ---")

    # 1. Get Stations
    print("\n1. Fetching stations...")
    resp = requests.get(f"{BASE_URL}/stations/")
    stations = resp.json()
    if resp.status_code == 200:
        print(f"SUCCESS: Found {len(stations)} stations.")
        # Print a few
        for s in stations[:3]:
            print(f"  - {s['name']} (ID: {s['id']})")
    else:
        print(f"FAILED: {resp.status_code} {resp.text}")
        return

    versova_id = stations[0]['id']
    ghatkopar_id = stations[-1]['id']

    # 2. Check initial balance
    print("\n2. Checking wallet balance...")
    resp = requests.get(f"{BASE_URL}/wallet/balance/{phone}")
    balance = resp.json()['balance']
    print(f"Current balance: {balance} INR")

    # 3. Top-up if needed (ensure enough for Ghatkopar trip - 40 INR)
    if balance < 100:
        print("\n3. Performing top-up...")
        topup_payload = {"phone": phone, "amount": 100}
        resp = requests.post(f"{BASE_URL}/wallet/top-up", json=topup_payload)
        new_balance = resp.json()['new_balance']
        print(f"SUCCESS: New balance is {new_balance} INR")
    else:
        print("\n3. Skipping top-up (balance sufficient).")

    # 4. Book a ticket (Versova to Ghatkopar)
    print(f"\n4. Booking ticket: {stations[0]['name']} to {stations[-1]['name']}...")
    booking_payload = {
        "phone": phone,
        "source_station_id": versova_id,
        "destination_station_id": ghatkopar_id
    }
    resp = requests.post(f"{BASE_URL}/tickets/book", json=booking_payload)
    if resp.status_code == 200:
        booking_data = resp.json()
        ticket_id = booking_data['ticket_id']
        fare = booking_data['fare']
        print(f"SUCCESS: Ticket booked! ID: {ticket_id}, Fare: {fare} INR")
    else:
        print(f"FAILED: {resp.status_code} {resp.text}")
        return

    # 5. Verify Balance again
    print("\n5. Verifying balance deduction...")
    resp = requests.get(f"{BASE_URL}/wallet/balance/{phone}")
    final_balance = resp.json()['balance']
    print(f"Final balance: {final_balance} INR")

    # 6. Simulate Entry Scan
    print(f"\n6. Simulating Entry Scan for {ticket_id}...")
    resp = requests.post(f"{BASE_URL}/tickets/scan-entry/{ticket_id}")
    print(f"Entry status: {resp.json()['message']}")

    # 7. Simulate Exit Scan
    print(f"\n7. Simulating Exit Scan for {ticket_id}...")
    resp = requests.post(f"{BASE_URL}/tickets/scan-exit/{ticket_id}")
    print(f"Exit status: {resp.json()['message']}")

    print("\n--- PHASE 2 VERIFICATION COMPLETE ---")

if __name__ == "__main__":
    test_phase2()
