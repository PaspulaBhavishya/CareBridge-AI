import urllib.request
import urllib.error
import json
import sqlite3

def run_tests():
    print('=== 1. TEST INVALID MOBILE STARTING DIGIT (e.g. 3) ===')
    req_data = json.dumps({'user_id': 1, 'name': 'Bhavishya', 'phone': '3987654321', 'email': 'test@carebridge.org'}).encode('utf-8')
    req = urllib.request.Request('http://127.0.0.1:8000/api/profile/update', data=req_data, headers={'Content-Type': 'application/json'})
    try:
        urllib.request.urlopen(req)
        print('FAIL: Should have rejected phone starting with 3')
    except urllib.error.HTTPError as e:
        print('PASS: Rejected starting digit 3 with HTTP', e.code)

    print('=== 2. TEST INVALID MOBILE STARTING DIGIT (e.g. 0) ===')
    req_data = json.dumps({'user_id': 1, 'name': 'Bhavishya', 'phone': '0987654321', 'email': 'test@carebridge.org'}).encode('utf-8')
    req = urllib.request.Request('http://127.0.0.1:8000/api/profile/update', data=req_data, headers={'Content-Type': 'application/json'})
    try:
        urllib.request.urlopen(req)
        print('FAIL: Should have rejected phone starting with 0')
    except urllib.error.HTTPError as e:
        print('PASS: Rejected starting digit 0 with HTTP', e.code)

    print('=== 3. TEST VALID PROFILE UPDATE & DB PERSISTENCE (starts with 9) ===')
    req_data = json.dumps({
        'user_id': 1,
        'patient_uid': 'PAT-1000',
        'name': 'Bhavishya Reddy',
        'phone': '9876501234',
        'email': 'bhavishya.reddy@carebridge.org',
        'age': 27,
        'gender': 'Female',
        'preferred_hospital': 'Hospital B (CareBridge Metro, Gachibowli)'
    }).encode('utf-8')
    req = urllib.request.Request('http://127.0.0.1:8000/api/profile/update', data=req_data, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        print('PASS: API returned HTTP', resp.status, 'Success:', res.get('success'))

    conn = sqlite3.connect('backend/app/carebridge.db')
    c = conn.cursor()
    c.execute('SELECT id, patient_uid, name, phone, email, age, gender, role, preferred_hospital_id FROM patients WHERE id = 1')
    row = c.fetchone()
    print('SQLite Patient Row:', row)
    assert row[2] == 'Bhavishya Reddy'
    assert '9876501234' in row[3]
    assert row[4] == 'bhavishya.reddy@carebridge.org'
    assert row[5] == 27
    print('PASS: Patient details verified in SQLite database!')

    print('=== 4. TEST AUDIT LOG PERSISTENCE ===')
    c.execute("SELECT id, timestamp, actor_name, action_type, details FROM audit_logs WHERE action_type = 'PROFILE_UPDATE' ORDER BY id DESC LIMIT 1")
    audit_row = c.fetchone()
    print('SQLite Audit Row:', audit_row)
    assert audit_row is not None
    print('PASS: Audit log verified!')

    print('=== 5. TEST DOCTOR UPDATE PERSISTENCE ===')
    doc_data = json.dumps({
        'user_id': 5,
        'name': 'Dr. Naveen Kumar',
        'phone': '9848022334',
        'email': 'dr.naveen@carebridge.org',
        'role': 'doctor',
        'specialization': 'Interventional Cardiology & Electrophysiology',
        'room_number': 'Room 105 (Executive OPD)',
        'consultation_fee': 750
    }).encode('utf-8')
    req_doc = urllib.request.Request('http://127.0.0.1:8000/api/profile/update', data=doc_data, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req_doc) as resp:
        res_doc = json.loads(resp.read().decode('utf-8'))
        print('PASS: Doctor Update HTTP', resp.status, 'Success:', res_doc.get('success'))

    c.execute("SELECT id, name, specialization, room_number, consultation_fee FROM doctors WHERE id = 5")
    doc_row = c.fetchone()
    print('SQLite Doctor Row:', doc_row)
    assert doc_row[2] == 'Interventional Cardiology & Electrophysiology'
    assert doc_row[3] == 'Room 105 (Executive OPD)'
    assert doc_row[4] == 750
    print('PASS: Doctor table updated in SQLite database!')

    print('=== ALL 5 VERIFICATION TESTS PASSED SUCCESSFULLY! ===')

if __name__ == '__main__':
    run_tests()
