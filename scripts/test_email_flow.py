import requests

BASE_URL = "http://localhost:8000"

def test_email_flow():
    phone = input("Enter phone number: ")
    email = input("Enter email: ")
    mpin = input("Enter 4-digit mPIN: ")

    # 1. Register
    print("\n1. Registering...")
    payload = {
        "phone": phone,
        "email": email,
        "mpin": mpin
    }
    resp = requests.post(f"{BASE_URL}/auth/register", json=payload)
    print(f"Status: {resp.status_code}, Response: {resp.json()}")
    if resp.status_code != 200:
        return

    # 2. Verify OTP
    otp = input("\nEnter the OTP received in your email: ")
    print("\n2. Verifying OTP...")
    resp = requests.post(f"{BASE_URL}/auth/verify-otp", json={"phone": phone, "otp": otp})
    print(f"Status: {resp.status_code}, Response: {resp.json()}")
    if resp.status_code != 200:
        return
    
    # 3. Login
    print("\n3. Testing Login...")
    resp = requests.post(f"{BASE_URL}/auth/login", json={"phone": phone, "mpin": mpin})
    print(f"Status: {resp.status_code}, Response: {resp.json()}")
    if resp.status_code == 200:
        print("\nSUCCESS: Complete Email OTP & mPIN flow verified!")

if __name__ == "__main__":
    test_email_flow()
