import sqlite3

conn = sqlite3.connect('backend/app/carebridge.db')
cursor = conn.cursor()

cursor.execute("SELECT id, patient_uid, name, role, phone, email, age, gender, language_pref FROM patients ORDER BY id DESC LIMIT 5;")
for r in cursor.fetchall():
    print(r)

print("\nAll audit logs related to registration/new user:")
cursor.execute("SELECT id, timestamp, actor_name, actor_role, action_type, details FROM audit_logs WHERE details LIKE '%register%' OR details LIKE '%PAT-D7F2%' OR details LIKE '%Mythri%' OR details LIKE '%created%' ORDER BY id DESC LIMIT 10;")
for r in cursor.fetchall():
    print(r)
