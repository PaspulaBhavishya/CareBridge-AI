import datetime
from sqlalchemy.orm import Session
from .database import engine, Base, SessionLocal
from .models import (
    Hospital, Department, Doctor, ScheduleSlot, Appointment,
    Patient, ScheduleConflict, HospitalPolicy, AuditLog,
    QueueToken, HospitalResource, AgentSession, AgentToolCall,
    ApprovalRequest, KnowledgeDocument
)

def init_db(db: Session):
    # Recreate tables cleanly
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    today = datetime.date.today()
    tomorrow = today + datetime.timedelta(days=1)
    today_str = today.strftime("%Y-%m-%d")
    tomorrow_str = tomorrow.strftime("%Y-%m-%d")

    # 1. Seed Hospitals
    hosp_a = Hospital(
        code="HOSP-A",
        name="Apex Super Speciality Hospital",
        short_name="Hospital A (Apex)",
        city="Hyderabad",
        area="Banjara Hills, Road No. 2",
        total_beds=320,
        occupied_beds=272, # 85% occupancy
        active_icu_units=28,
        avg_admin_wait_min=25,
        contact_phone="+91 40 2340 1111",
        emergency_phone="+91 40 2340 9999",
        map_link="https://maps.google.com/?q=Banjara+Hills+Hyderabad"
    )
    hosp_b = Hospital(
        code="HOSP-B",
        name="CareBridge Metro Health Center",
        short_name="Hospital B (Metro)",
        city="Hyderabad",
        area="Gachibowli, Financial District",
        total_beds=200,
        occupied_beds=124, # 62% occupancy (optimal headroom)
        active_icu_units=18,
        avg_admin_wait_min=15,
        contact_phone="+91 40 4567 2222",
        emergency_phone="+91 40 4567 9999",
        map_link="https://maps.google.com/?q=Gachibowli+Hyderabad"
    )
    hosp_c = Hospital(
        code="HOSP-C",
        name="City Community Healthcare",
        short_name="Hospital C (City)",
        city="Hyderabad",
        area="Secunderabad, Clock Tower",
        total_beds=150,
        occupied_beds=138, # 92% occupancy (congested)
        active_icu_units=10,
        avg_admin_wait_min=40,
        contact_phone="+91 40 2789 3333",
        emergency_phone="+91 40 2789 9999",
        map_link="https://maps.google.com/?q=Secunderabad+Hyderabad"
    )
    db.add_all([hosp_a, hosp_b, hosp_c])
    db.commit()

    # 2. Seed Departments
    dept_cardio = Department(
        name="Cardiology",
        telugu_name="గుండె విభాగం (కార్డియాలజీ)",
        code="CARD",
        description="Heart and vascular clinical management and diagnostics",
        avg_consult_duration_min=20,
        floor="3rd Floor, Wing A"
    )
    dept_genmed = Department(
        name="General Medicine",
        telugu_name="జనరల్ మెడిసిన్ (సాధారణ వైద్యం)",
        code="GENMED",
        description="Primary adult health, acute illnesses, and comprehensive care",
        avg_consult_duration_min=15,
        floor="1st Floor, OPD Block"
    )
    dept_derma = Department(
        name="Dermatology",
        telugu_name="చర్మ వ్యాధుల విభాగం",
        code="DERM",
        description="Skin, hair, and nail clinical consultations",
        avg_consult_duration_min=15,
        floor="2nd Floor, Wing B"
    )
    dept_ortho = Department(
        name="Orthopedics",
        telugu_name="ఎముకల విభాగం (ఆర్థోపెడిక్స్)",
        code="ORTHO",
        description="Bones, joints, sports injuries, and spine health",
        avg_consult_duration_min=20,
        floor="Ground Floor, Trauma Block"
    )
    dept_pedia = Department(
        name="Pediatrics",
        telugu_name="పిల్లల వైద్య విభాగం",
        code="PED",
        description="Child and infant preventive care and acute treatment",
        avg_consult_duration_min=15,
        floor="2nd Floor, Child Wing"
    )
    dept_neuro = Department(
        name="Neurology",
        telugu_name="నాడీ సంబంధిత విభాగం (న్యూరాలజీ)",
        code="NEUR",
        description="Brain, spine, nerves, and neurological assessments",
        avg_consult_duration_min=25,
        floor="4th Floor, Wing C"
    )
    db.add_all([dept_cardio, dept_genmed, dept_derma, dept_ortho, dept_pedia, dept_neuro])
    db.commit()

    # 3. Seed Doctors
    docs = [
        # Hospital A Doctors
        Doctor(
            hospital_id=hosp_a.id,
            department_id=dept_cardio.id,
            name="Dr. K. S. Rao",
            title="Senior Interventional Cardiologist",
            specialization="Coronary Angioplasty & Heart Failure",
            experience_years=16,
            consultation_fee=800,
            room_number="Room 301 (3rd Floor)",
            rating=4.9,
            languages_spoken="English, Telugu",
            daily_patient_limit=25,
            current_active_patients=12
        ),
        Doctor(
            hospital_id=hosp_a.id,
            department_id=dept_genmed.id,
            name="Dr. Harika Varma",
            title="Consultant Physician",
            specialization="Internal Medicine & Diabetes Care",
            experience_years=10,
            consultation_fee=500,
            room_number="Room 105 (1st Floor)",
            rating=4.7,
            languages_spoken="English, Telugu, Hindi",
            daily_patient_limit=22,
            current_active_patients=9
        ),
        Doctor(
            hospital_id=hosp_a.id,
            department_id=dept_ortho.id,
            name="Dr. Pradeep Chandra",
            title="Senior Orthopedic Surgeon",
            specialization="Joint Replacement & Arthroscopy",
            experience_years=14,
            consultation_fee=700,
            room_number="Room 012 (Ground Floor)",
            rating=4.8,
            languages_spoken="English, Telugu",
            daily_patient_limit=18,
            current_active_patients=8
        ),
        Doctor(
            hospital_id=hosp_a.id,
            department_id=dept_neuro.id,
            name="Dr. N. Sudhakar",
            title="Consultant Neurologist",
            specialization="Stroke Care & Clinical Neurology",
            experience_years=12,
            consultation_fee=700,
            room_number="Room 402 (4th Floor)",
            rating=4.8,
            languages_spoken="English, Telugu",
            daily_patient_limit=18,
            current_active_patients=5
        ),

        # Hospital B Doctors (Optimal wait times & SmartFlow winners!)
        Doctor(
            hospital_id=hosp_b.id,
            department_id=dept_cardio.id,
            name="Dr. Anil Kumar",
            title="Senior Interventional Cardiologist",
            specialization="Cardiology",
            experience_years=15,
            consultation_fee=500,
            room_number="Room 102 (1st Floor)",
            rating=4.95,
            languages_spoken="English, Telugu",
            daily_patient_limit=25,
            current_active_patients=3
        ),
        Doctor(
            hospital_id=hosp_b.id,
            department_id=dept_cardio.id,
            name="Dr. Ananya Sen",
            title="Lead Cardiologist",
            specialization="Preventive Cardiology & Arrhythmia",
            experience_years=12,
            consultation_fee=600,
            room_number="Room 204 (2nd Floor)",
            rating=4.95,
            languages_spoken="English, Telugu, Hindi",
            daily_patient_limit=20,
            current_active_patients=4
        ),
        Doctor(
            hospital_id=hosp_b.id,
            department_id=dept_genmed.id,
            name="Dr. Priya",
            title="Consultant Physician",
            specialization="General Medicine",
            experience_years=8,
            consultation_fee=500,
            room_number="OPD-03",
            rating=4.9,
            languages_spoken="English, Telugu, Hindi",
            daily_patient_limit=25,
            current_active_patients=2
        ),
        Doctor(
            hospital_id=hosp_b.id,
            department_id=dept_genmed.id,
            name="Dr. Ravi",
            title="General Physician",
            specialization="General Medicine",
            experience_years=6,
            consultation_fee=500,
            room_number="OPD-04",
            rating=4.8,
            languages_spoken="English, Telugu",
            daily_patient_limit=20,
            current_active_patients=3
        ),
        Doctor(
            hospital_id=hosp_b.id,
            department_id=dept_genmed.id,
            name="Dr. Vikram Verma",
            title="Senior Physician",
            specialization="General Medicine & Geriatrics",
            experience_years=15,
            consultation_fee=500,
            room_number="Room 110 (1st Floor)",
            rating=4.85,
            languages_spoken="English, Telugu, Hindi",
            daily_patient_limit=24,
            current_active_patients=5
        ),
        Doctor(
            hospital_id=hosp_b.id,
            department_id=dept_derma.id,
            name="Dr. Sneha Pillai",
            title="Consultant Dermatologist",
            specialization="Clinical Dermatology & Aesthetics",
            experience_years=9,
            consultation_fee=650,
            room_number="Room 215 (2nd Floor)",
            rating=4.75,
            languages_spoken="English, Telugu",
            daily_patient_limit=18,
            current_active_patients=3
        ),
        Doctor(
            hospital_id=hosp_b.id,
            department_id=dept_pedia.id,
            name="Dr. Meera Nambiar",
            title="Consultant Pediatrician",
            specialization="Neonatal & Pediatric Care",
            experience_years=11,
            consultation_fee=550,
            room_number="Room 201 (2nd Floor)",
            rating=4.9,
            languages_spoken="English, Telugu",
            daily_patient_limit=20,
            current_active_patients=6
        ),
        Doctor(
            hospital_id=hosp_b.id,
            department_id=dept_ortho.id,
            name="Dr. K. Srinivas",
            title="Senior Orthopedic & Trauma Surgeon",
            specialization="Acute Trauma, Complex Fractures & Joint Reconstruction",
            experience_years=16,
            consultation_fee=650,
            room_number="Trauma Bay 01 (Ground Floor)",
            rating=4.95,
            languages_spoken="English, Telugu",
            daily_patient_limit=22,
            current_active_patients=4
        ),
        Doctor(
            hospital_id=hosp_b.id,
            department_id=dept_neuro.id,
            name="Dr. Sunitha Reddy",
            title="Consultant Neurologist",
            specialization="Acute Stroke Care, Neuro ICU & Epilepsy",
            experience_years=14,
            consultation_fee=700,
            room_number="Room 302 (3rd Floor)",
            rating=4.9,
            languages_spoken="English, Telugu, Hindi",
            daily_patient_limit=20,
            current_active_patients=3
        ),

        # Hospital C Doctors (City Community - busier, longer wait)
        Doctor(
            hospital_id=hosp_c.id,
            department_id=dept_cardio.id,
            name="Dr. Rajesh Gupta",
            title="Consultant Cardiologist",
            specialization="Clinical Cardiology",
            experience_years=8,
            consultation_fee=600,
            room_number="Room 102 (1st Floor)",
            rating=4.5,
            languages_spoken="English, Hindi",
            daily_patient_limit=15,
            current_active_patients=11
        ),
        Doctor(
            hospital_id=hosp_c.id,
            department_id=dept_genmed.id,
            name="Dr. Bhavani Prasad",
            title="Senior Medical Officer",
            specialization="General Health & Infectious Diseases",
            experience_years=18,
            consultation_fee=400,
            room_number="Room 101 (1st Floor)",
            rating=4.6,
            languages_spoken="English, Telugu",
            daily_patient_limit=30,
            current_active_patients=18
        ),
        Doctor(
            hospital_id=hosp_c.id,
            department_id=dept_neuro.id,
            name="Dr. Arvind Swamy",
            title="Consultant Neurologist",
            specialization="Epilepsy & Neuro-Rehabilitation",
            experience_years=13,
            consultation_fee=750,
            room_number="Room 401 (4th Floor)",
            rating=4.7,
            languages_spoken="English, Telugu",
            daily_patient_limit=14,
            current_active_patients=9
        ),
        Doctor(
            hospital_id=hosp_c.id,
            department_id=dept_ortho.id,
            name="Dr. M. Ramesh",
            title="Consultant Orthopedic Surgeon",
            specialization="Trauma Care & General Orthopedics",
            experience_years=10,
            consultation_fee=500,
            room_number="Room 008 (Ground Floor)",
            rating=4.6,
            languages_spoken="English, Telugu",
            daily_patient_limit=20,
            current_active_patients=10
        ),
    ]
    db.add_all(docs)
    db.commit()

    # Find Dr. Priya, Dr. Ravi, Dr. Ananya Sen, Dr. K. S. Rao, Dr. Rajesh Gupta
    doc_priya = next(d for d in docs if d.name == "Dr. Priya")
    doc_ravi = next(d for d in docs if d.name == "Dr. Ravi")
    doc_ananya = next(d for d in docs if d.name == "Dr. Ananya Sen")
    doc_rao = next(d for d in docs if d.name == "Dr. K. S. Rao")
    doc_gupta = next(d for d in docs if d.name == "Dr. Rajesh Gupta")
    doc_vikram = next(d for d in docs if d.name == "Dr. Vikram Verma")
    doc_harika = next(d for d in docs if d.name == "Dr. Harika Varma")

    # 4. Seed Schedule Slots
    slots = []

    # Dr. Priya (Hospital B General Medicine - Winner for prompt scenario!)
    # Available: 10:30 AM, 11:15 AM
    slot_priya_1 = ScheduleSlot(doctor_id=doc_priya.id, date=today_str, start_time="10:30 AM", end_time="11:00 AM", is_booked=True, simulated_wait_min=10, token_number="GM-024", current_serving_token="GM-022")
    slot_priya_2 = ScheduleSlot(doctor_id=doc_priya.id, date=today_str, start_time="11:15 AM", end_time="11:45 AM", is_booked=False, simulated_wait_min=15, token_number="GM-025", current_serving_token="GM-022")
    slot_priya_3 = ScheduleSlot(doctor_id=doc_priya.id, date=tomorrow_str, start_time="10:30 AM", end_time="11:00 AM", is_booked=False, simulated_wait_min=10, token_number="GM-024", current_serving_token="GM-022")
    slot_priya_4 = ScheduleSlot(doctor_id=doc_priya.id, date=tomorrow_str, start_time="11:15 AM", end_time="11:45 AM", is_booked=False, simulated_wait_min=15, token_number="GM-025", current_serving_token="GM-022")
    slots.extend([slot_priya_1, slot_priya_2, slot_priya_3, slot_priya_4])

    # Dr. Ravi (Hospital B General Medicine)
    # Available: 12:00 PM
    slot_ravi_1 = ScheduleSlot(doctor_id=doc_ravi.id, date=today_str, start_time="12:00 PM", end_time="12:30 PM", is_booked=False, simulated_wait_min=12, token_number="GM-028", current_serving_token="GM-022")
    slot_ravi_2 = ScheduleSlot(doctor_id=doc_ravi.id, date=tomorrow_str, start_time="12:00 PM", end_time="12:30 PM", is_booked=False, simulated_wait_min=12, token_number="GM-028", current_serving_token="GM-022")
    slots.extend([slot_ravi_1, slot_ravi_2])

    # Dr. Ananya Sen (Hospital B) - Tomorrow: 5 slots, 10:30 AM is lowest wait (12 min)!
    # Exactly matching prompt demo scenario!
    slot_ananya_1 = ScheduleSlot(doctor_id=doc_ananya.id, date=tomorrow_str, start_time="09:30 AM", end_time="10:00 AM", is_booked=False, simulated_wait_min=18, token_number="12", current_serving_token="11")
    slot_ananya_2 = ScheduleSlot(doctor_id=doc_ananya.id, date=tomorrow_str, start_time="10:30 AM", end_time="11:00 AM", is_booked=False, simulated_wait_min=12, token_number="14", current_serving_token="11") # BEST SLOT!
    slot_ananya_3 = ScheduleSlot(doctor_id=doc_ananya.id, date=tomorrow_str, start_time="11:30 AM", end_time="12:00 PM", is_booked=False, simulated_wait_min=15, token_number="16", current_serving_token="11")
    slot_ananya_4 = ScheduleSlot(doctor_id=doc_ananya.id, date=tomorrow_str, start_time="02:30 PM", end_time="03:00 PM", is_booked=False, simulated_wait_min=20, token_number="22", current_serving_token="18")
    slot_ananya_5 = ScheduleSlot(doctor_id=doc_ananya.id, date=tomorrow_str, start_time="03:30 PM", end_time="04:00 PM", is_booked=False, simulated_wait_min=22, token_number="25", current_serving_token="18")
    slots.extend([slot_ananya_1, slot_ananya_2, slot_ananya_3, slot_ananya_4, slot_ananya_5])

    # Dr. K.S. Rao (Hospital A) - Tomorrow: 3 slots, ~25 min wait
    slot_rao_1 = ScheduleSlot(doctor_id=doc_rao.id, date=tomorrow_str, start_time="10:00 AM", end_time="10:30 AM", is_booked=False, simulated_wait_min=25, token_number="15", current_serving_token="10")
    slot_rao_2 = ScheduleSlot(doctor_id=doc_rao.id, date=tomorrow_str, start_time="11:00 AM", end_time="11:30 AM", is_booked=False, simulated_wait_min=28, token_number="18", current_serving_token="10")
    slot_rao_3 = ScheduleSlot(doctor_id=doc_rao.id, date=tomorrow_str, start_time="04:00 PM", end_time="04:30 PM", is_booked=False, simulated_wait_min=26, token_number="24", current_serving_token="16")
    slots.extend([slot_rao_1, slot_rao_2, slot_rao_3])

    # Dr. Rajesh Gupta (Hospital C) - Tomorrow: 1 slot, 40 min wait
    slot_gupta_1 = ScheduleSlot(doctor_id=doc_gupta.id, date=tomorrow_str, start_time="11:30 AM", end_time="12:00 PM", is_booked=False, simulated_wait_min=42, token_number="28", current_serving_token="19")
    slots.append(slot_gupta_1)

    # Dr. Vikram Verma (Hospital B General Medicine) - Tomorrow
    slot_vikram_1 = ScheduleSlot(doctor_id=doc_vikram.id, date=tomorrow_str, start_time="10:00 AM", end_time="10:30 AM", is_booked=False, simulated_wait_min=14, token_number="8", current_serving_token="6")
    slot_vikram_2 = ScheduleSlot(doctor_id=doc_vikram.id, date=tomorrow_str, start_time="11:00 AM", end_time="11:30 AM", is_booked=True, simulated_wait_min=20, token_number="10", current_serving_token="6") # Booked for Conflict demo
    slot_vikram_3 = ScheduleSlot(doctor_id=doc_vikram.id, date=tomorrow_str, start_time="11:30 AM", end_time="12:00 PM", is_booked=False, simulated_wait_min=15, token_number="12", current_serving_token="6")
    slot_vikram_4 = ScheduleSlot(doctor_id=doc_vikram.id, date=tomorrow_str, start_time="03:00 PM", end_time="03:30 PM", is_booked=False, simulated_wait_min=16, token_number="19", current_serving_token="14")
    slots.extend([slot_vikram_1, slot_vikram_2, slot_vikram_3, slot_vikram_4])

    # Dr. Harika Varma (Hospital A General Medicine)
    slot_harika_1 = ScheduleSlot(doctor_id=doc_harika.id, date=tomorrow_str, start_time="10:30 AM", end_time="11:00 AM", is_booked=False, simulated_wait_min=24)
    slot_harika_2 = ScheduleSlot(doctor_id=doc_harika.id, date=tomorrow_str, start_time="02:00 PM", end_time="02:30 PM", is_booked=False, simulated_wait_min=22)
    slots.extend([slot_harika_1, slot_harika_2])

    # Seed slots for other doctors (both today and tomorrow)
    for d in docs:
        slots.append(ScheduleSlot(doctor_id=d.id, date=today_str, start_time="11:00 AM", end_time="11:30 AM", is_booked=False, simulated_wait_min=18))
        slots.append(ScheduleSlot(doctor_id=d.id, date=today_str, start_time="03:00 PM", end_time="03:30 PM", is_booked=False, simulated_wait_min=25))
        slots.append(ScheduleSlot(doctor_id=d.id, date=tomorrow_str, start_time="11:00 AM", end_time="11:30 AM", is_booked=False, simulated_wait_min=15))
        slots.append(ScheduleSlot(doctor_id=d.id, date=tomorrow_str, start_time="03:00 PM", end_time="03:30 PM", is_booked=False, simulated_wait_min=20))

    db.add_all(slots)
    db.commit()

    # 5. Seed Patients & Roles
    patient_bhavishya = Patient(
        patient_uid="PAT-1000",
        name="Bhavishya",
        phone="+91 98765 01234",
        email="bhavishya@carebridge.org",
        age=26,
        gender="Female",
        preferred_hospital_id=hosp_b.id,
        language_pref="English",
        role="patient",
        authorized_for_records=False
    )
    patient_sunitha = Patient(
        patient_uid="PAT-1002",
        name="Sunitha Reddy",
        phone="+91 98480 12345",
        email="sunitha.reddy@example.com",
        age=45,
        gender="Female",
        preferred_hospital_id=hosp_b.id,
        language_pref="Telugu",
        role="patient",
        authorized_for_records=False
    )
    staff_priya = Patient(
        patient_uid="STAFF-2001",
        name="Priya Sharma",
        phone="+91 91234 56789",
        email="priya.reception@carebridge.org",
        age=29,
        gender="Female",
        preferred_hospital_id=hosp_b.id,
        language_pref="English",
        role="receptionist",
        authorized_for_records=True
    )
    admin_varma = Patient(
        patient_uid="ADMIN-3001",
        name="Dr. Varma",
        phone="+91 99999 88888",
        email="admin@carebridge.org",
        age=52,
        gender="Male",
        preferred_hospital_id=hosp_b.id,
        language_pref="English",
        role="admin",
        authorized_for_records=True
    )
    doctor_anil = Patient(
        patient_uid="DOC-2041",
        name="Dr. Anil Kumar",
        phone="+91 98480 22334",
        email="dr.anil@carebridge.org",
        age=45,
        gender="Male",
        preferred_hospital_id=hosp_b.id,
        language_pref="Telugu / English",
        role="doctor",
        authorized_for_records=True
    )
    patient_ravi = Patient(
        patient_uid="PAT-1001",
        name="Ravi Kumar",
        phone="+91 98765 43210",
        email="ravi.kumar@example.com",
        age=32,
        gender="Male",
        preferred_hospital_id=hosp_b.id,
        language_pref="English",
        role="patient",
        authorized_for_records=False
    )
    db.add_all([patient_bhavishya, patient_sunitha, staff_priya, admin_varma, doctor_anil, patient_ravi])
    db.commit()

    # 6. Seed Existing Appointments & Conflict Demo Setup
    # Bhavishya's confirmed appointment for Today at 10:30 AM (Token GM-024)
    app_bhavishya = Appointment(
        confirmation_code="CB-2026-GM024",
        patient_id=patient_bhavishya.id,
        doctor_id=doc_priya.id,
        slot_id=slot_priya_1.id,
        status="CONFIRMED",
        reason="General Consultation & Stomach Discomfort",
        priority="NORMAL",
        simulated_wait_min=10,
        smartflow_score=0.92,
        token_number="GM-024",
        consultation_fee=500
    )
    db.add(app_bhavishya)

    # Queue Token for Live Token Tracker Demo (Token GM-024, 2 people ahead, 10 min wait)
    token_gm024 = QueueToken(
        token_number="GM-024",
        patient_id=patient_bhavishya.id,
        doctor_id=doc_priya.id,
        department="General Medicine",
        department_name="General Medicine",
        patient_name="Bhavishya",
        patient_uid="PAT-1000",
        phone="+91 98765 01234",
        status="ALMOST_YOUR_TURN",
        people_ahead=2,
        estimated_wait_minutes=10,
        room_number="OPD-03",
        simulated_wait_min=10,
        consultation_fee=500,
        confirmation_code="CB-2026-GM024",
        priority="NORMAL",
        simulation_mode=True
    )
    db.add(token_gm024)

    # 6. Seed Existing Appointments & Conflict Demo Setup
    # Double-booked / overlapping appointment for Scenario 2
    app1 = Appointment(
        confirmation_code="CB-2026-1011",
        patient_id=patient_ravi.id,
        doctor_id=doc_vikram.id,
        slot_id=slot_vikram_2.id,
        status="CONFIRMED",
        reason="Follow-up Blood Pressure Consultation",
        priority="NORMAL",
        simulated_wait_min=20,
        smartflow_score=0.84
    )
    db.add(app1)

    # Conflict Record for Staff Demo
    conflict = ScheduleConflict(
        date=tomorrow_str,
        doctor_id=doc_vikram.id,
        conflict_type="OVERLAPPING_BOOKING",
        description=f"Double booking detected for Dr. Vikram Verma at 11:00 AM on {tomorrow_str}. Slots and walk-in queue exceed room capacity.",
        suggested_resolution="Move the elective review appointment to 11:30 AM open slot (Slot #3) to relieve room congestion.",
        status="PENDING"
    )
    db.add(conflict)

    # 7. Seed Hospital Policies & FAQs for RAG Tool
    policies = [
        HospitalPolicy(
            hospital_id=hosp_b.id,
            category="OPD_TIMINGS",
            title="Outpatient Consultation & Registration Timings",
            content="Morning OPD runs from 08:30 AM to 01:00 PM. Evening OPD runs from 04:00 PM to 08:00 PM (Monday through Saturday). Emergency and Urgent Care are active 24/7.",
            telugu_summary="ఓపీడీ ఉదయం 8:30 నుండి 1:00 వరకు, సాయంత్రం 4:00 నుండి 8:00 వరకు అందుబాటులో ఉంటుంది. ఎమర్జెన్సీ 24/7 నడుస్తుంది.",
            keywords="opd timings hours schedule open timing general consultation"
        ),
        HospitalPolicy(
            hospital_id=hosp_b.id,
            category="VISITING_HOURS",
            title="Inpatient & ICU Visitor Regulations",
            content="ICU Visiting Hours are strictly 04:00 PM to 05:00 PM (1 attendant only with sterile pass). General Ward visiting hours are 11:00 AM to 01:00 PM and 05:00 PM to 07:00 PM. Children under 12 are not permitted in ICU corridors.",
            telugu_summary="ఐసీయూ విజిటింగ్ సమయం సాయంత్రం 4 నుండి 5 గంటల వరకు (1 సహాయకుడు మాత్రమే). జనరల్ వార్డ్ 11:00-1:00 & 5:00-7:00.",
            keywords="visiting hours icu visit timing attendants visitor pass"
        ),
        HospitalPolicy(
            hospital_id=hosp_b.id,
            category="INSURANCE",
            title="Cashless TPA & Government Health Schemes",
            content="CareBridge Health is empanelled with Star Health, HDFC ERGO, Care Health, ICICI Lombard, Aarogyasri, and CGHS. Cashless pre-authorization desk is located at Ground Floor Wing A (Open 24 hours). Please carry original Government ID and Insurance e-Card.",
            telugu_summary="స్టార్ హెల్త్, ఆరోగ్యశ్రీ, హెచ్‌డీఎఫ్‌సీ, మరియు సిజిహెచ్ఎస్ ద్వారా క్యాష్‌లెస్ సౌకర్యం కలదు. గ్రౌండ్ ఫ్లోర్ వద్ద ఇన్సూరెన్స్ డెస్క్ ఉంది.",
            keywords="insurance cashless claim tpa aarogyasri cghs star health hdfc mediclaim"
        ),
        HospitalPolicy(
            hospital_id=hosp_b.id,
            category="FASTING_RULES",
            title="Diagnostic & Pre-Procedure Fasting Guidelines",
            content="Fasting Blood Glucose and Comprehensive Lipid Profile require 10 to 12 hours of strict overnight fasting. Plain water is permitted. Ultrasound Abdomen requires 6 hours fasting with a full bladder.",
            telugu_summary="బ్లడ్ షుగర్ మరియు లిపిడ్ ప్రొఫైల్ పరీక్షలకు 10-12 గంటల ఉపవాసం (ఫాస్టింగ్) అవసరం. మంచినీరు తాగవచ్చు.",
            keywords="fasting blood test lipid sugar profile ultrasound empty stomach test lab"
        ),
        HospitalPolicy(
            hospital_id=hosp_b.id,
            category="CANCELLATION_POLICY",
            title="Appointment Rescheduling & Cancellation Policy",
            content="Appointments can be rescheduled or cancelled up to 2 hours prior to the scheduled slot with zero administrative charges. Confirmed slots are automatically released back to the SmartFlow scheduling pool.",
            telugu_summary="అపాయింట్‌మెంట్‌ను సమయానికి 2 గంటల ముందు వరకు ఎటువంటి రుసుము లేకుండా రీషెడ్యూల్ లేదా రద్దు చేసుకోవచ్చు.",
            keywords="cancel cancellation reschedule refund change timing slot"
        )
    ]
    db.add_all(policies)

    # 8. Seed Initial Audit Logs
    initial_logs = [
        AuditLog(
            actor_name="System Orchestrator",
            actor_role="system",
            action_type="SYSTEM_INITIALIZATION",
            status="SUCCESS",
            details="CareBridge Hospital Network synchronized: 3 hospitals, 6 departments, 12 specialists initialized.",
            risk_level="LOW"
        ),
        AuditLog(
            actor_name="Priya Sharma",
            actor_role="receptionist",
            action_type="SCHEDULE_AUDIT",
            status="SUCCESS",
            details="Automated schedule audit executed for tomorrow. Flagged 1 double-booking conflict for Dr. Vikram Verma.",
            risk_level="LOW"
        )
    ]
    db.add_all(initial_logs)

    # 9. Seed Hospital Resources (Baseline Queues: Hosp A=18 High, Hosp B=6 Moderate, Hosp C=3 Low)
    resources = [
        HospitalResource(
            hospital_id=hosp_a.id,
            total_beds=320,
            occupied_beds=272,
            active_icu_units=28,
            queue_length=18, # High queue baseline
            staff_workload_pct=85,
            avg_wait_min=28,
            simulation_mode=True
        ),
        HospitalResource(
            hospital_id=hosp_b.id,
            total_beds=200,
            occupied_beds=124,
            active_icu_units=18,
            queue_length=6, # Moderate queue baseline (optimal headroom)
            staff_workload_pct=52,
            avg_wait_min=12,
            simulation_mode=True
        ),
        HospitalResource(
            hospital_id=hosp_c.id,
            total_beds=150,
            occupied_beds=138,
            active_icu_units=10,
            queue_length=3, # Low queue baseline
            staff_workload_pct=35,
            avg_wait_min=15,
            simulation_mode=True
        )
    ]
    db.add_all(resources)

    # 10. Seed Initial Queue Tokens
    tokens = [
        QueueToken(
            token_number=14,
            confirmation_code="CB-WLK-1001-14",
            patient_name="Ravi Kumar",
            patient_uid="WLK-1001",
            phone="+91 98765 43210",
            age=45,
            gender="Male",
            department_name="Cardiology",
            priority="NORMAL",
            simulated_wait_min=12,
            consultation_fee=600,
            status="SERVING",
            simulation_mode=True
        ),
        QueueToken(
            token_number=15,
            confirmation_code="CB-WLK-1002-15",
            patient_name="Sunitha Reddy",
            patient_uid="WLK-1002",
            phone="+91 98480 12345",
            age=52,
            gender="Female",
            department_name="Cardiology",
            priority="NORMAL",
            simulated_wait_min=18,
            consultation_fee=600,
            status="ISSUED",
            simulation_mode=True
        ),
        QueueToken(
            token_number=8,
            confirmation_code="CB-WLK-1003-08",
            patient_name="Sita Devi",
            patient_uid="WLK-1003",
            phone="+91 91234 56789",
            age=68,
            gender="Female",
            department_name="General Medicine",
            priority="SENIOR",
            simulated_wait_min=8,
            consultation_fee=500,
            status="SERVING",
            simulation_mode=True
        )
    ]
    db.add_all(tokens)

    # 11. Seed Knowledge Documents (RAG)
    knowledge_docs = [
        KnowledgeDocument(
            category="OPD_TIMINGS",
            title="General Outpatient Department (OPD) Schedule",
            content="Regular Outpatient Consultations operate Monday through Saturday from 08:30 AM to 01:30 PM (Morning Session) and 04:30 PM to 08:00 PM (Evening Session). Emergency Trauma services operate 24x7.",
            telugu_summary="ఓపీడీ సమయాలు సోమవారం నుండి శనివారం వరకు ఉదయం 8:30 నుండి మధ్యాహ్నం 1:30 వరకు మరియు సాయంత్రం 4:30 నుండి రాత్రి 8:00 వరకు అందుబాటులో ఉంటాయి.",
            source_citation="CareBridge Hospital Operations Manual, Sec 2.1",
            keywords="opd timings morning evening hours schedule timing"
        ),
        KnowledgeDocument(
            category="INSURANCE",
            title="Cashless Health Insurance & TPA Network",
            content="CareBridge Network hospitals support cashless hospitalization and OPD reimbursement for major TPAs including Star Health, HDFC ERGO, ICICI Lombard, MediAssist, Vidal Health, and State Arogyasri Scheme.",
            telugu_summary="స్టార్ హెల్త్, హెచ్‌డిఎఫ్‌సి ఎర్గో, ఆరోగ్యశ్రీ వంటి అన్ని ప్రధాన బీమా సంస్థల ద్వారా నగదు రహిత చికిత్స అందుబాటులో ఉంది.",
            source_citation="Insurance Desk Desk Guidelines v4",
            keywords="insurance tpa cashless arogyasri claim policy mediclaim"
        ),
        KnowledgeDocument(
            category="FASTING_RULES",
            title="Pre-Investigation Fasting Guidelines for Blood Tests",
            content="Fasting Blood Sugar (FBS) and Comprehensive Lipid Profiles require a strict 8 to 10 hours overnight fasting. Water is permitted. Thyroid profile and HbA1c do not require fasting.",
            telugu_summary="షుగర్ (FBS) మరియు లిపిడ్ ప్రొఫైల్ రక్త పరీక్షలకు 8 నుండి 10 గంటల ఉపవాసం అవసరం. నీరు త్రాగవచ్చు. HbA1cకి ఉపవాసం అవసరం లేదు.",
            source_citation="Central Laboratory Diagnostics Standard Protocol",
            keywords="fasting blood test sugar fbs lipid profile empty stomach"
        )
    ]
    db.add_all(knowledge_docs)

    db.commit()

if __name__ == "__main__":
    db = SessionLocal()
    init_db(db)
    print("Database initialized successfully with synthetic hospital network data.")
    db.close()
