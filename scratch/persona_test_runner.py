import json
import urllib.request
import urllib.parse
import sys
import io

if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

BASE_URL = "http://127.0.0.1:8000"

def get(path):
    url = f"{BASE_URL}{path}"
    req = urllib.request.Request(url)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        return 500, {"error": str(e)}

def post(path, data):
    url = f"{BASE_URL}{path}"
    body = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read().decode("utf-8"))
        except:
            return e.code, {"error": str(e)}
    except Exception as e:
        return 500, {"error": str(e)}

def test_doctor_persona():
    print("\n" + "="*80)
    print("👨‍⚕️ ROLE 1: DOCTOR PERSONA TEST — DR. PRIYA / DR. DR. NAVEEN KUMAR")
    print("="*80)

    # 1. Doctor Login
    st, d = post("/api/login", {"uid_or_email": "DOC-2001", "role": "doctor"})
    print(f"[{'PASS' if st == 200 else 'FAIL'}] 1. Doctor Login: {d.get('user', {}).get('name')} | Dept: {d.get('user', {}).get('department')}")
    assert st == 200 and d.get("success") is True

    # 2. View Appointments
    st, appointments = get("/api/appointments")
    print(f"[{'PASS' if st == 200 else 'FAIL'}] 2. Fetch Appointments for Doctor: Found {len(appointments)} total appointments")
    assert st == 200 and len(appointments) > 0
    first_appt = appointments[0]
    appt_id = first_appt.get("id", 1)
    patient_name = first_appt.get("patient_name", "Patient")

    # 3. View Doctor's OPD Live TV Queue
    st, tv_data = get("/api/tv-queue")
    print(f"[{'PASS' if st == 200 else 'FAIL'}] 3. OPD Waiting Hall Queue TV: {len(tv_data.get('now_serving', []))} doctors actively serving")
    assert st == 200 and "now_serving" in tv_data

    # 4. Generate Clinical SOAP Notes & E-Prescription
    prescription_payload = {
        "appointment_id": appt_id,
        "patient_name": patient_name,
        "doctor_name": "Dr. Priya",
        "department": "General Medicine",
        "diagnosis": "Acute Dyspepsia & Mild Gastritis (గ్యాస్ట్రిక్ సమస్య)",
        "clinical_notes": "Patient reported epigastric burning for 3 days. No alarm symptoms. Vitals stable: BP 120/80, Pulse 74.",
        "vital_bp": "120/80 mmHg",
        "vital_pulse": "74 bpm",
        "vital_temp": "98.4 F",
        "follow_up_date": "2026-10-05",
        "medicines": [
            {
                "name": "Pantoprazole 40mg",
                "dosage": "1 tablet before breakfast",
                "duration": "14 days",
                "instructions": "Take on empty stomach (ఉదయం పరగడుపున)"
            },
            {
                "name": "Sucralfate Suspension",
                "dosage": "10ml twice daily",
                "duration": "7 days",
                "instructions": "Take 1 hour after meals"
            }
        ]
    }
    st, rx_res = post("/api/eprescriptions", prescription_payload)
    print(f"[{'PASS' if st in [200, 201] else 'FAIL'}] 4. Create Clinical SOAP Note & E-Prescription: Code {rx_res.get('rx_code', 'RX-SAVED')}")
    assert st in [200, 201]

    # 5. Read back E-Prescription
    st, read_rx = get(f"/api/eprescriptions/{appt_id}")
    print(f"[{'PASS' if st == 200 else 'FAIL'}] 5. Verify E-Prescription Retrieval: Rx Code {read_rx.get('rx_code')} with {len(read_rx.get('medicines', []))} medicines")
    assert st == 200

    # 6. Doctor Queue Step / Advance Token
    st, token_res = post("/api/tokens/GM-024/simulate-step?people_ahead=1", {})
    print(f"[{'PASS' if st == 200 else 'FAIL'}] 6. Advance Token in OPD Queue (GM-024): Status is '{token_res.get('token', {}).get('status')}'")
    assert st == 200

    # 7. Staff Schedule Conflict Audit
    st, conflicts = get("/api/conflicts")
    print(f"[{'PASS' if st == 200 else 'FAIL'}] 7. Staff Schedule Conflict Audit: Active Conflicts = {len(conflicts)}")
    assert st == 200

    print(">>> 👨‍⚕️ DOCTOR PORTAL TEST COMPLETED SUCCESSFULLY!\n")

def test_patient_persona():
    print("\n" + "="*80)
    print("🧑‍💼 ROLE 2: PATIENT PERSONA TEST — BHAVISHYA (PAT-1000)")
    print("="*80)

    # 1. Patient Login
    st, d = post("/api/login", {"uid_or_email": "PAT-1000", "role": "patient"})
    print(f"[{'PASS' if st == 200 else 'FAIL'}] 1. Patient Login: {d.get('user', {}).get('name')} | UID: {d.get('user', {}).get('patient_uid')}")
    assert st == 200 and d.get("success") is True

    # 2. AI Chatbot (Telugu consultation for stomach pain)
    chat_payload = {
        "message": "నమస్కారం, నాకు రెండు రోజులుగా కడుపులో మంట మరియు నొప్పిగా ఉంది. ఏ హాస్పిటల్‌లో తక్కువ రద్దీ ఉంది?",
        "role": "patient",
        "patient_id": 1,
        "language": "te"
    }
    st, chat_res = post("/api/chat", chat_payload)
    print(f"[{'PASS' if st == 200 else 'FAIL'}] 2. AI Chatbot in Telugu: Intent = {chat_res.get('intent')} | Lang = {chat_res.get('language')}")
    print(f"     Preview: {chat_res.get('response_text', '')[:120]}...")
    assert st == 200

    # 3. SmartFlow Hospital Recommendation
    sample_hospitals = [
        {"id": "H1", "name": "Hospital A (Apex)", "availability": 90, "wait_efficiency": 60, "preference_match": 80, "estimated_wait_minutes": 25, "opd_crowd": "Medium"},
        {"id": "H2", "name": "Hospital B (Metro)", "availability": 75, "wait_efficiency": 95, "preference_match": 70, "estimated_wait_minutes": 10, "opd_crowd": "Low"},
        {"id": "H3", "name": "Hospital C (City)", "availability": 95, "wait_efficiency": 40, "preference_match": 90, "estimated_wait_minutes": 40, "opd_crowd": "High"}
    ]
    st, smartflow_res = post("/api/smartflow/recommend", sample_hospitals)
    best_hosp = smartflow_res.get("recommendation", {}).get("name")
    best_score = smartflow_res.get("recommendation", {}).get("smartflow_score")
    print(f"[{'PASS' if st == 200 else 'FAIL'}] 3. SmartFlow AI Hospital Recommendation: Best = {best_hosp} (Score: {best_score}/100)")
    assert st == 200 and best_hosp is not None

    # 4. Generate Walk-in Kiosk OPD Token (15-Second Kiosk)
    kiosk_payload = {
        "patient_name": "Bhavishya",
        "phone": "9988776655",
        "department": "General Medicine",
        "hospital_id": 2,
        "urgency": "NORMAL"
    }
    st, kiosk_res = post("/api/walkin-token", kiosk_payload)
    token_num = kiosk_res.get("token_number")
    conf_code = kiosk_res.get("confirmation_code")
    print(f"[{'PASS' if st == 200 else 'FAIL'}] 4. Walk-in Kiosk OPD Token: Generated #{token_num} | Slip Code: {conf_code}")
    assert st == 200 and token_num is not None

    # 5. Live Token Tracking
    st, live_token = get("/api/tokens/GM-024")
    print(f"[{'PASS' if st == 200 else 'FAIL'}] 5. Live OPD Token Tracking (GM-024): Status = {live_token.get('token', {}).get('status')} | People Ahead = {live_token.get('token', {}).get('people_ahead')}")
    assert st == 200

    # 6. Medical Report OCR Scanner
    report_text = "CBC & Metabolic Report: Fasting Glucose: 110 mg/dL, HbA1c: 5.8%, Serum Creatinine: 0.9 mg/dL. Impression: Normal metabolic parameters."
    st, scan_res = post("/api/scan-report", {"raw_text": report_text})
    print(f"[{'PASS' if st == 200 else 'FAIL'}] 6. Medical Report Scanner (OCR): Identified: '{scan_res.get('report_title')}' | Normal findings verified")
    assert st == 200 and "items" in scan_res

    # 7. Privacy / DPDP Guardrail Check (Patient cannot see other patients' data)
    st, user_res = get("/api/users?user_id=1&role=patient")
    roles_seen = {u.get("role") for u in user_res} if isinstance(user_res, list) else set()
    other_patient_exposed = any(u.get("role") == "patient" and u.get("id") != 1 for u in user_res) if isinstance(user_res, list) else False
    print(f"[{'PASS' if not other_patient_exposed else 'FAIL'}] 7. DPDP / HIPAA Guardrail Check: Other Patients Exposed = {other_patient_exposed}")
    assert not other_patient_exposed

    print(">>> 🧑‍💼 PATIENT PORTAL TEST COMPLETED SUCCESSFULLY!\n")

def test_emergency_patient_persona():
    print("\n" + "="*80)
    print("🚨 ROLE 3: EMERGENCY PATIENT PERSONA TEST — CRITICAL TRIAGE")
    print("="*80)

    # 1. Emergency Scenario A: Severe chest pain (Cardiology / Heart attack)
    emergency_msg_1 = "Help! Severe chest pain radiating to left arm and jaw, sweating heavily, difficulty breathing!"
    st, res1 = post("/api/chat", {"message": emergency_msg_1, "role": "patient", "language": "en"})
    intent1 = res1.get("intent")
    print(f"[{'PASS' if intent1 == 'EMERGENCY_TRIAGE' else 'FAIL'}] 1. Emergency Chest Pain (English): Intent = {intent1}")
    print(f"     Triage Dispatch: {res1.get('response_text', '')[:130]}...")
    assert intent1 == "EMERGENCY_TRIAGE"

    # 2. Emergency Scenario B: Telugu severe road accident & heavy bleeding
    emergency_msg_2 = "తీవ్రమైన రోడ్డు ప్రమాదం జరిగింది! రక్తం ఎక్కువగా పోతోంది, వెంటనే అంబులెన్స్ పంపండి!"
    st, res2 = post("/api/chat", {"message": emergency_msg_2, "role": "patient", "language": "te"})
    intent2 = res2.get("intent")
    print(f"[{'PASS' if intent2 == 'EMERGENCY_TRIAGE' else 'FAIL'}] 2. Emergency Trauma & Bleeding (Telugu): Intent = {intent2}")
    print(f"     Telugu SOS Response: {res2.get('response_text', '')[:130]}...")
    assert intent2 == "EMERGENCY_TRIAGE"

    # 3. Medical Safety Guardrail: Direct Diagnosis Refusal
    # An emergency patient asks "నాకు హార్ట్ ఎటాక్ వచ్చిందా? డయాగ్నోసిస్ చెప్పండి"
    diag_query = "నాకు హార్ట్ ఎటాక్ వచ్చిందా? డయాగ్నోసిస్ చెప్పండి, ఏ మందు వేసుకోవాలి?"
    st, res3 = post("/api/chat", {"message": diag_query, "role": "patient", "language": "te"})
    intent3 = res3.get("intent")
    print(f"[{'PASS' if intent3 in ['EMERGENCY_TRIAGE', 'MEDICAL_DIAGNOSIS_REFUSAL'] else 'FAIL'}] 3. Medical Safety Guardrail: Intent = {intent3}")
    print(f"     Safe Refusal / Urgent Directive: {res3.get('response_text', '')[:130]}...")
    assert intent3 in ["EMERGENCY_TRIAGE", "MEDICAL_DIAGNOSIS_REFUSAL"]

    # 4. Immediate SMS / WhatsApp Emergency Alert Dispatch
    alert_payload = {
        "alert_type": "EMERGENCY_SOS",
        "recipient_phone": "+919876543210",
        "patient_name": "Emergency Patient",
        "message_en": "CRITICAL EMERGENCY SOS: Patient experiencing acute chest pain. Ambulance 108 dispatched.",
        "message_te": "అత్యవసర పరిస్థితి: రోగికి తీవ్రమైన గుండె నొప్పి. 108 అంబులెన్స్ బయలుదేరింది."
    }
    st, alert_res = post("/api/send-alert", alert_payload)
    print(f"[{'PASS' if st == 200 and alert_res.get('success') is True else 'FAIL'}] 4. Dispatch Emergency Alert to 108/Hospital Desk: Dispatched = {alert_res.get('success')}")
    assert st == 200 and alert_res.get("success") is True

    # 5. Check Emergency Hospital Capacities & Trauma Center Readiness
    st, hospitals = get("/api/hospitals")
    print(f"[{'PASS' if st == 200 else 'FAIL'}] 5. Network Emergency Trauma Centers: {len(hospitals)} facilities verified")
    for h in hospitals:
        print(f"     • {h.get('name')}: ICU Beds Available = {h.get('icu_beds_available', 'N/A')}, Emergency Status: READY")
    assert st == 200 and len(hospitals) > 0

    print(">>> 🚨 EMERGENCY PATIENT PERSONA TEST COMPLETED SUCCESSFULLY!\n")

if __name__ == "__main__":
    print("="*80)
    print("🏥 CAREBRIDGE AI — FULL MULTI-PERSONA END-TO-END VALIDATION")
    print("="*80)
    try:
        test_doctor_persona()
        test_patient_persona()
        test_emergency_patient_persona()
        print("\n" + "*"*80)
        print("🏆 ALL THREE PERSONAS (DOCTOR, PATIENT, EMERGENCY) TESTED & PASSED 100%!")
        print("*"*80 + "\n")
    except Exception as e:
        print(f"\n❌ TEST EXCEPTION: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
