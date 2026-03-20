import os
import sys
import requests

# Set backend URL
BASE_URL = "http://localhost:8000"

def test_otpless_flow(phone):
    print(f"\n--- Testing OTP-less Flow for {phone} ---")
    
    # 1. Register (No OTP needed now)
    print("\n1. Registering phone number...")
    resp = requests.post(f"{BASE_URL}/auth/register", json={"phone": phone})
    if resp.status_code != 200:
        print(f"Registration Failed: {resp.text}")
        return
        
    data = resp.json()
    print(f"Registered! Result: {data}")
    needs_mpin = data.get("needs_mpin")
    
    # 2. Set mPIN (if needed)
    if needs_mpin:
        print("\n2. Setting mPIN...")
        mpin = "1122" # Different from previous test
        resp = requests.post(f"{BASE_URL}/auth/set-mpin", json={"phone": phone, "mpin": mpin})
        print(f"Set mPIN Result: {resp.json()}")
    else:
        print("\n2. mPIN already set, skipping set-mpin.")
    
    # 3. Login with mPIN
    print("\n3. Logging in with mPIN...")
    resp = requests.post(f"{BASE_URL}/auth/login-mpin", json={"phone": phone, "mpin": "1122"})
    if resp.status_code == 200:
        print(f"Login Successful! New Token: {resp.json()['access_token'][:20]}...")
    else:
        print(f"Login Failed: {resp.text}")

if __name__ == "__main__":
    phone_num = input("Enter phone number to test (use a new one if possible): ")
    test_otpless_flow(phone_num)
