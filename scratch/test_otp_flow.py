import os
import sys
import io

if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Ensure backend path is included
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from fastapi.testclient import TestClient
from app.main import app, ACTIVE_OTP_STORE

client = TestClient(app)

def test_mobile_and_email_verification():
    print("\n--- 1. Testing Invalid Starting Digits (0, 1, 2, 3, 4, 5) ---")
    for digit in ["0", "1", "2", "3", "4", "5"]:
        invalid_phone = f"{digit}876543210"
        res = client.post("/api/auth/send-otp", json={
            "phone": invalid_phone,
            "email": "test@carebridge.org",
            "purpose": "login"
        })
        assert res.status_code == 400, f"Expected 400 for phone starting with {digit}, got {res.status_code}"
        detail = res.json().get("detail", "")
        assert digit in detail or "చెల్లని మొబైల్ నంబర్" in detail, f"Expected invalid phone warning, got: {detail}"
        print(f"  [PASS] Number starting with '{digit}' ({invalid_phone}) successfully rejected: {detail[:60]}...")

    print("\n--- 2. Testing Missing Email Rejection Before Login ---")
    res_no_email = client.post("/api/auth/send-otp", json={
        "phone": "+91 98765 01234",
        "purpose": "login"
    })
    assert res_no_email.status_code == 400, f"Expected 400 when email is missing, got {res_no_email.status_code}"
    print(f"  [PASS] Missing email rejected: {res_no_email.json().get('detail')[:60]}...")

    print("\n--- 3. Testing Invalid Email Format Rejection ---")
    res_bad_email = client.post("/api/auth/send-otp", json={
        "phone": "+91 98765 01234",
        "email": "not-an-email",
        "purpose": "login"
    })
    assert res_bad_email.status_code == 400, f"Expected 400 for bad email, got {res_bad_email.status_code}"
    print(f"  [PASS] Bad email format rejected: {res_bad_email.json().get('detail')}")

    print("\n--- 4. Testing Mismatched Email Rejection ---")
    res_mismatch = client.post("/api/auth/send-otp", json={
        "phone": "+91 98765 01234",
        "email": "wrong.email@example.com",
        "purpose": "login"
    })
    assert res_mismatch.status_code == 400, f"Expected 400 for wrong email, got {res_mismatch.status_code}"
    print(f"  [PASS] Mismatched email rejected: {res_mismatch.json().get('detail')[:70]}...")

    print("\n--- 5. Testing Unregistered Phone (with Valid Start Digit 9) ---")
    unreg_phone = "+91 98480 99999"
    res_unreg = client.post("/api/auth/send-otp", json={
        "phone": unreg_phone,
        "email": "nobody@carebridge.org",
        "purpose": "login"
    })
    assert res_unreg.status_code == 404, f"Expected 404 for unregistered phone, got {res_unreg.status_code}"
    print(f"  [PASS] Unregistered phone rejected with 404: {res_unreg.json().get('detail')[:70]}...")

    print("\n--- 6. Testing Valid Starting Digit (6, 7, 8, 9) & Verified Email OTP Dispatch ---")
    chips_res = client.get("/api/auth/demo-chips")
    first_chip = chips_res.json()["chips"][0]
    registered_phone = first_chip["phone"]
    registered_email = first_chip["email"]
    norm_phone = "".join([c for c in registered_phone if c.isdigit()])[-10:]

    res_valid = client.post("/api/auth/send-otp", json={
        "phone": registered_phone,
        "email": registered_email,
        "purpose": "login"
    })
    assert res_valid.status_code == 200, f"Expected 200, got {res_valid.status_code}: {res_valid.text}"
    valid_data = res_valid.json()
    assert valid_data["success"] is True
    assert valid_data["phone_verified"] is True
    assert valid_data["email_verified"] is True
    assert "otp" not in valid_data, "OTP must not be leaked"
    print(f"  [PASS] Valid phone (starts with 9) & verified email accepted! SMS sent.")

    # Check store
    assert norm_phone in ACTIVE_OTP_STORE
    actual_otp = ACTIVE_OTP_STORE[norm_phone]["otp"]
    print(f"  [PASS] OTP recorded in secure backend: {actual_otp}")

    print("\n--- 7. Testing OTP Verification ---")
    verify_res = client.post("/api/auth/verify-otp", json={
        "phone": registered_phone,
        "otp": actual_otp,
        "purpose": "login"
    })
    assert verify_res.status_code == 200
    verify_data = verify_res.json()
    assert verify_data["success"] is True
    assert "Bhavishya" in verify_data["user"]["name"]
    print(f"  [PASS] OTP verified successfully! Logged in as: {verify_data['user']['name']}")

    print("\n[SUCCESS] ALL MOBILE & EMAIL VALIDATION + OTP VERIFICATION TESTS PASSED!")

if __name__ == "__main__":
    test_mobile_and_email_verification()
