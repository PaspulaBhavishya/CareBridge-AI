import os
import sys
import io

if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from app.database import SessionLocal
from app.seed_data import init_db
from app.agent import CareBridgeAgent
from app.main import get_users

def test_member_privacy():
    db = SessionLocal()
    init_db(db)

    print("\n--- 1. Testing GET /api/users for PATIENT (Ravi Kumar, id=1) ---")
    patient_view = get_users(actor_role="patient", current_user_id=1, db=db)
    patient_ids = [u["id"] for u in patient_view]
    patient_roles = [u["role"] for u in patient_view]
    print(f"Total returned users for patient: {len(patient_view)}")
    print(f"Returned IDs: {patient_ids}")
    print(f"Returned Roles: {patient_roles}")

    # Patient should only see themselves (id=1) and doctors (role='doctor')
    assert 1 in patient_ids, "Patient should see their own record"
    assert 2 not in patient_ids, "Patient MUST NOT see other patients (Sunitha Reddy id=2)!"
    for u in patient_view:
        if u["id"] != 1:
            assert u["role"] == "doctor", f"Non-self user should only be a doctor, got: {u}"
    print(">>> PASS: Patient cannot view other registered patients' records!")

    print("\n--- 2. Testing GET /api/users for ADMIN (Dr. Varma) ---")
    admin_view = get_users(actor_role="admin", current_user_id=4, db=db)
    admin_ids = [u["id"] for u in admin_view]
    print(f"Total returned users for admin: {len(admin_view)}")
    assert len(admin_view) >= 4, "Admin should see full member directory"
    assert 1 in admin_ids and 2 in admin_ids, "Admin should see all registered members"
    print(">>> PASS: Admin has full clearance to view registered network members!")

    print("\n--- 3. Testing Chat Agent Guardrail for Patient Asking in Telugu ---")
    agent = CareBridgeAgent(db)
    res_te = agent.process_message(
        "registered members data chupinchu", 
        patient_id=1, 
        actor_name="Ravi Kumar", 
        actor_role="patient"
    )
    print(f"Telugu Query Intent: {res_te['intent']}")
    assert res_te["intent"] == "SECURITY_GUARDRAIL_BLOCKED"
    print(">>> PASS: Agent blocked unauthorized member data request in Telugu!")

    print("\n--- 4. Testing Chat Agent for Admin Querying Member Registry ---")
    res_admin = agent.process_message(
        "registered members list", 
        patient_id=4, 
        actor_name="Dr. Varma", 
        actor_role="admin"
    )
    print(f"Admin Query Intent: {res_admin['intent']}")
    assert res_admin["intent"] == "AUTHORIZED_DIRECTORY_ACCESS"
    print(">>> PASS: Admin receives authorized directory summary!")

    print("\n=== ALL PRIVACY TESTS PASSED 100%! ===")

if __name__ == "__main__":
    test_member_privacy()
