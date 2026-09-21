import os
import sys
import io

if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from app.database import SessionLocal
from app.seed_data import init_db
from app.main import login_user, LoginRequest

def test_login():
    db = SessionLocal()
    init_db(db)

    print("\n--- 1. Testing login with role 'patient' ---")
    req = LoginRequest(role="patient")
    res = login_user(req, db=db)
    assert res["success"] is True
    assert res["user"]["name"] == "Bhavishya"
    assert res["user"]["role"] == "patient"
    print(f"Logged in as: {res['user']['name']} ({res['user']['role']})")

    print("\n--- 2. Testing login with role 'patient_telugu' ---")
    req_te = LoginRequest(role="patient_telugu")
    res_te = login_user(req_te, db=db)
    assert res_te["success"] is True
    assert res_te["user"]["name"] == "Sunitha Reddy"
    assert res_te["user"]["languagePref"] == "Telugu"
    print(f"Logged in as: {res_te['user']['name']} ({res_te['user']['languagePref']})")

    print("\n--- 3. Testing login with role 'doctor' ---")
    req_doc = LoginRequest(role="doctor")
    res_doc = login_user(req_doc, db=db)
    assert res_doc["success"] is True
    assert res_doc["user"]["role"] == "doctor"
    print(f"Logged in as: {res_doc['user']['name']} ({res_doc['user']['specialization']})")

    print("\n--- 4. Testing login with UID 'ADMIN-3001' ---")
    req_uid = LoginRequest(uid_or_email="ADMIN-3001")
    res_uid = login_user(req_uid, db=db)
    assert res_uid["success"] is True
    assert res_uid["user"]["name"] == "Dr. Varma"
    assert res_uid["user"]["role"] == "admin"
    print(f"Logged in as: {res_uid['user']['name']} ({res_uid['user']['patient_uid']})")

    print("\n=== ALL LOGIN TESTS PASSED 100%! ===")

if __name__ == "__main__":
    test_login()
