import sqlite3

conn = sqlite3.connect('backend/app/carebridge.db')
cur = conn.cursor()

# 1. Update doctors table
cur.execute("UPDATE doctors SET name = 'Dr. Naveen Kumar' WHERE name LIKE '%Anil%'")
print(f"Updated doctors: {cur.rowcount}")

# 2. Update patients table
cur.execute("UPDATE patients SET name = 'Dr. Naveen Kumar', email = 'dr.naveen@carebridge.org' WHERE name LIKE '%Anil%' OR email LIKE '%anil%'")
print(f"Updated patients: {cur.rowcount}")

# 3. Update doctor_patient_messages table
cur.execute("UPDATE doctor_patient_messages SET doctor_name = 'Dr. Naveen Kumar' WHERE doctor_name LIKE '%Anil%'")
print(f"Updated doctor_patient_messages doctor_name: {cur.rowcount}")

cur.execute("UPDATE doctor_patient_messages SET sender_name = 'Dr. Naveen Kumar' WHERE sender_name LIKE '%Anil%'")
print(f"Updated doctor_patient_messages sender_name: {cur.rowcount}")

cur.execute("UPDATE doctor_patient_messages SET message = REPLACE(message, 'అనిల్', 'నవీన్') WHERE message LIKE '%అనిల్%'")
print(f"Updated doctor_patient_messages message (Telugu): {cur.rowcount}")

cur.execute("UPDATE doctor_patient_messages SET message = REPLACE(message, 'Anil', 'Naveen') WHERE message LIKE '%Anil%'")
print(f"Updated doctor_patient_messages message (English): {cur.rowcount}")

# 4. Check any appointments
cur.execute("UPDATE appointments SET reason = REPLACE(reason, 'Anil', 'Naveen') WHERE reason LIKE '%Anil%'")

conn.commit()
conn.close()
print("Database update completed successfully!")
