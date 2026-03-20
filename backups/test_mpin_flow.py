import os
import sys
import requests

# Set backend URL
BASE_URL = "http://localhost:8000"

def test_full_flow(phone):
    print(f"\n--- Testing Flow for {phone} ---")
    
    # 1. Request OTP
    print("\n1. Requesting OTP...")
    resp = requests.post(f"{BASE_URL}/auth/request-otp", json={"phone": phone})
    print(f"Status: {resp.status_code}, Response: {resp.json()}")
    
    # User needs to look at terminal logs for the OTP
    otp = input("\nEnter the OTP seen in the backend terminal: ")
    
    # 2. Verify OTP
    print("\n2. Verifying OTP...")
    resp = requests.post(f"{BASE_URL}/auth/verify-otp", json={"phone": phone, "otp": otp})
    if resp.status_code != 200:
        print(f"Verification Failed: {resp.text}")
        return
    
    data = resp.json()
    print(f"OTP Verified! Result: {data}")
    token = data["access_token"]
    needs_mpin = data.get("needs_mpin")
    
    # 3. Set mPIN (if needed)
    if needs_mpin:
        print("\n3. Setting mPIN...")
        mpin = "1234"
        resp = requests.post(f"{BASE_URL}/auth/set-mpin", json={"phone": phone, "mpin": mpin})
        print(f"Set mPIN Result: {resp.json()}")
    else:
        print("\n3. mPIN already set, skipping set-mpin.")
    
    # 4. Login with mPIN
    print("\n4. Logging in with mPIN...")
    resp = requests.post(f"{BASE_URL}/auth/login-mpin", json={"phone": phone, "mpin": "1234"})
    if resp.status_code == 200:
        print(f"Login Successful! New Token: {resp.json()['access_token'][:20]}...")
    else:
        print(f"Login Failed: {resp.text}")

if __name__ == "__main__":
    phone_num = input("Enter phone number to test: ")
    test_full_flow(phone_num)
