import json
from app.database import get_db
from app.main import (
    scan_medical_report, ScanReportRequest,
    save_eprescription, get_eprescription, EPrescriptionRequest,
    get_waiting_hall_tv_queue,
    create_walkin_token, WalkinTokenRequest,
    send_live_alert, SendAlertRequest
)

db = next(get_db())

def test_scan_report():
    print("Testing scan_medical_report...")
    req = ScanReportRequest(report_type="diabetes", patient_name="Sunitha Reddy")
    res = scan_medical_report(req, db)
    assert "HbA1c" in json.dumps(res)
    assert "summary_te" in res
    print(f"  [PASS] Diabetes scan passed.")

    req2 = ScanReportRequest(report_type="prescription", patient_name="Sunitha Reddy")
    res2 = scan_medical_report(req2, db)
    assert "Metformin" in json.dumps(res2)
    print("  [PASS] Prescription scan passed.")

def test_eprescriptions():
    print("Testing save_eprescription and get_eprescription...")
    req = EPrescriptionRequest(
        appointment_id=1,
        diagnosis="Type 2 Diabetes Mellitus & Hypertension",
        medicines=[
            {"name": "Tab Metformin 500mg", "dosage": "1-0-1", "timing": "After Meals", "duration": "30 Days"},
            {"name": "Tab Atorvastatin 20mg", "dosage": "0-0-1", "timing": "Night", "duration": "30 Days"}
        ],
        follow_up_days=14,
        follow_up_date="Thu, Oct 1, 2026",
        doctor_notes="Low sugar diet, brisk walk 30 mins daily."
    )
    res = save_eprescription(req, db)
    assert res["success"] == True
    print("  [PASS] E-Prescription creation passed.")

    # Read back
    res_get = get_eprescription(1, db)
    assert res_get["prescription"]["diagnosis"] == "Type 2 Diabetes Mellitus & Hypertension"
    print(f"  [PASS] E-Prescription read back verified: {len(res_get['prescription']['medicines'])} medicines attached.")

def test_tv_queue():
    print("Testing get_waiting_hall_tv_queue...")
    res = get_waiting_hall_tv_queue(db)
    assert len(res["now_serving"]) >= 2
    assert "voice_announcement_te" in res["now_serving"][0]
    print(f"  [PASS] TV Queue returned {len(res['now_serving'])} serving doctors with bilingual voice scripts.")

def test_walkin_token():
    print("Testing create_walkin_token...")
    req = WalkinTokenRequest(
        patient_name="Ramesh Gupta",
        phone="+91 98480 11223",
        age=52,
        gender="Male",
        department_name="Cardiology",
        priority="NORMAL"
    )
    res = create_walkin_token(req, db)
    assert res["success"] == True
    assert "token_number" in res
    assert "slip_instructions_te" in res
    print(f"  [PASS] 15-Sec Walk-in token created: Token #{res['token_number']} Code: {res['confirmation_code']}")

def test_send_alert():
    print("Testing send_live_alert...")
    req = SendAlertRequest(
        alert_type="TOKEN_UPDATE",
        recipient_phone="+91 98480 22334",
        patient_name="Sunitha Reddy",
        message_en="Your token #14 is now active at Room 204 with Dr. Ananya Sen.",
        message_te="మీ టోకెన్ #14 రూమ్ 204 వద్ద ప్రారంభమైంది."
    )
    res = send_live_alert(req, db)
    assert res["success"] == True
    print("  [PASS] Live SMS & WhatsApp simulation alert dispatched.")

if __name__ == "__main__":
    print("--- Running CareBridge AI Expansion Direct Tests ---")
    test_scan_report()
    test_eprescriptions()
    test_tv_queue()
    test_walkin_token()
    test_send_alert()
    print("\n[SUCCESS] ALL EXPANSION BACKEND TESTS PASSED SUCCESSFULLY!")
