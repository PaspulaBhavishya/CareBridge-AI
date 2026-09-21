import datetime
from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base

class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, index=True) # e.g., "HOSP-A"
    name = Column(String(100), nullable=False)
    short_name = Column(String(50), nullable=False)
    city = Column(String(50), default="Hyderabad")
    area = Column(String(100), nullable=False)
    total_beds = Column(Integer, default=250)
    occupied_beds = Column(Integer, default=180)
    active_icu_units = Column(Integer, default=24)
    avg_admin_wait_min = Column(Integer, default=25)
    contact_phone = Column(String(20), default="+91 40 2345 6789")
    emergency_phone = Column(String(20), default="+91 40 2345 9999")
    map_link = Column(String(255), default="https://maps.google.com")

    doctors = relationship("Doctor", back_populates="hospital")
    policies = relationship("HospitalPolicy", back_populates="hospital")

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True) # e.g., "Cardiology"
    telugu_name = Column(String(100), default="") # గుండె విభాగం
    code = Column(String(20), unique=True)
    description = Column(Text, default="")
    avg_consult_duration_min = Column(Integer, default=15)
    floor = Column(String(20), default="2nd Floor")

    doctors = relationship("Doctor", back_populates="department")

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"))
    department_id = Column(Integer, ForeignKey("departments.id"))
    name = Column(String(100), nullable=False)
    title = Column(String(50), default="Dr.")
    specialization = Column(String(150), nullable=False)
    experience_years = Column(Integer, default=8)
    consultation_fee = Column(Integer, default=600) # In INR ₹
    room_number = Column(String(20), default="Room 204")
    rating = Column(Float, default=4.8)
    languages_spoken = Column(String(100), default="English, Telugu, Hindi")
    daily_patient_limit = Column(Integer, default=20)
    current_active_patients = Column(Integer, default=6)

    hospital = relationship("Hospital", back_populates="doctors")
    department = relationship("Department", back_populates="doctors")
    slots = relationship("ScheduleSlot", back_populates="doctor")
    appointments = relationship("Appointment", back_populates="doctor")

class ScheduleSlot(Base):
    __tablename__ = "schedule_slots"

    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"))
    date = Column(String(20), nullable=False) # YYYY-MM-DD
    start_time = Column(String(10), nullable=False) # e.g. "10:30 AM"
    end_time = Column(String(10), nullable=False) # e.g. "11:00 AM"
    is_booked = Column(Boolean, default=False)
    simulated_wait_min = Column(Integer, default=15) # Simulated queue wait
    token_number = Column(String(50), default="GM-024")
    current_serving_token = Column(String(50), default="GM-022")
    simulation_mode = Column(Boolean, default=True)

    doctor = relationship("Doctor", back_populates="slots")
    appointment = relationship("Appointment", back_populates="slot", uselist=False)

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    patient_uid = Column(String(20), unique=True, index=True) # e.g., "PAT-1001"
    name = Column(String(100), nullable=False)
    phone = Column(String(20), default="")
    email = Column(String(100), default="")
    age = Column(Integer, nullable=True)
    gender = Column(String(20), default="Other")
    preferred_hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=True)
    language_pref = Column(String(20), default="English") # English or Telugu
    role = Column(String(20), default="patient") # patient, receptionist, admin, doctor
    authorized_for_records = Column(Boolean, default=False)

    appointments = relationship("Appointment", back_populates="patient")

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    confirmation_code = Column(String(30), unique=True, index=True) # e.g., "CB-2026-9812"
    patient_id = Column(Integer, ForeignKey("patients.id"))
    doctor_id = Column(Integer, ForeignKey("doctors.id"))
    slot_id = Column(Integer, ForeignKey("schedule_slots.id"))
    status = Column(String(30), default="CONFIRMED") # CONFIRMED, COMPLETED, CANCELLED, RESCHEDULED
    reason = Column(String(255), default="General Consultation")
    priority = Column(String(20), default="NORMAL") # NORMAL, URGENT, ROUTINE
    simulated_wait_min = Column(Integer, default=15)
    smartflow_score = Column(Float, default=0.88)
    token_number = Column(String(50), default="GM-024")
    consultation_fee = Column(Integer, default=600)
    clinical_soap_notes = Column(Text, nullable=True)
    prescription_json = Column(Text, nullable=True)
    follow_up_date = Column(String(50), nullable=True)
    vitals_json = Column(Text, nullable=True)
    simulation_mode = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="appointments")
    doctor = relationship("Doctor", back_populates="appointments")
    slot = relationship("ScheduleSlot", back_populates="appointment")

class ScheduleConflict(Base):
    __tablename__ = "schedule_conflicts"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String(20), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"))
    conflict_type = Column(String(50), default="OVERLAPPING_BOOKING") # DOUBLE_BOOKED, OVERLAPPING_BOOKING, CAPACITY_BREACH
    description = Column(String(255), nullable=False)
    suggested_resolution = Column(String(255), nullable=False)
    status = Column(String(20), default="PENDING") # PENDING, RESOLVED, DISMISSED
    resolved_at = Column(DateTime, nullable=True)

class HospitalPolicy(Base):
    __tablename__ = "hospital_policies"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=True)
    category = Column(String(50), nullable=False) # OPD_TIMINGS, INSURANCE, VISITING_HOURS, REGISTRATION, FASTING_RULES
    title = Column(String(150), nullable=False)
    content = Column(Text, nullable=False)
    telugu_summary = Column(Text, default="")
    keywords = Column(String(255), default="")

    hospital = relationship("Hospital", back_populates="policies")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    actor_name = Column(String(100), default="Patient")
    actor_role = Column(String(30), default="patient")
    action_type = Column(String(50), nullable=False) # BOOKING, CANCEL, RESCHEDULE, RECORD_ACCESS, CONFLICT_RESOLUTION, POLICY_SEARCH
    status = Column(String(20), default="SUCCESS") # SUCCESS, BLOCKED, PENDING, FAILED
    details = Column(Text, nullable=False)
    risk_level = Column(String(20), default="LOW") # LOW, MEDIUM, HIGH (for unauthorized attempts)

class QueueToken(Base):
    __tablename__ = "queue_tokens"

    id = Column(Integer, primary_key=True, index=True)
    token_number = Column(String(50), unique=True, index=True)
    patient_id = Column(Integer, nullable=True)
    doctor_id = Column(Integer, nullable=True)
    department = Column(String(100), nullable=False, default="General Medicine")
    department_name = Column(String(100), default="General Medicine")
    patient_name = Column(String(100), default="Bhavishya")
    patient_uid = Column(String(30), default="PAT-1000")
    phone = Column(String(20), default="")
    age = Column(Integer, nullable=True)
    gender = Column(String(20), default="Other")
    status = Column(
        String(30),
        default="WAITING",
        nullable=False
    )
    people_ahead = Column(Integer, default=0)
    estimated_wait_minutes = Column(Integer, default=0)
    room_number = Column(String(50), nullable=True, default="OPD-03")
    simulated_wait_min = Column(Integer, default=10)
    consultation_fee = Column(Integer, default=500)
    confirmation_code = Column(String(30), nullable=True)
    priority = Column(String(20), default="NORMAL")
    simulation_mode = Column(Boolean, default=True)
    created_at = Column(
        DateTime,
        default=datetime.datetime.utcnow
    )
    updated_at = Column(
        DateTime,
        default=datetime.datetime.utcnow,
        onupdate=datetime.datetime.utcnow
    )

class HospitalResource(Base):
    __tablename__ = "hospital_resources"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=False)
    total_beds = Column(Integer, default=200)
    occupied_beds = Column(Integer, default=150)
    active_icu_units = Column(Integer, default=15)
    queue_length = Column(Integer, default=10)
    staff_workload_pct = Column(Integer, default=65) # e.g. 85%, 55%, 35%
    avg_wait_min = Column(Integer, default=20)
    simulation_mode = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

class AgentSession(Base):
    __tablename__ = "agent_sessions"

    id = Column(Integer, primary_key=True, index=True)
    session_uid = Column(String(50), unique=True, index=True)
    patient_id = Column(Integer, nullable=True)
    actor_name = Column(String(100), default="Ravi Kumar")
    actor_role = Column(String(30), default="patient")
    language = Column(String(20), default="en")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AgentToolCall(Base):
    __tablename__ = "agent_tool_calls"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, nullable=True)
    agent_domain = Column(String(50), nullable=False) # Appointment Agent, Coordination Agent, Information Agent, Safety Agent
    tool_name = Column(String(100), nullable=False)
    arguments_json = Column(Text, default="{}")
    status = Column(String(20), default="SUCCESS") # SUCCESS, BLOCKED, FAILED
    latency_ms = Column(Float, default=0.0)
    result_summary = Column(Text, default="")
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class ApprovalRequest(Base):
    __tablename__ = "approval_requests"

    id = Column(Integer, primary_key=True, index=True)
    action_type = Column(String(50), nullable=False) # PRESCRIPTION_SIGN, CONFLICT_RESOLUTION, RESCHEDULE_OVERRIDE
    requested_by = Column(String(100), nullable=False)
    requester_role = Column(String(30), default="doctor")
    approved_by = Column(String(100), nullable=True)
    status = Column(String(20), default="PENDING") # PENDING, APPROVED, REJECTED
    payload_json = Column(Text, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(50), nullable=False) # POLICY, FAQ, CLINICAL_PROTOCOL, INSURANCE
    title = Column(String(150), nullable=False)
    content = Column(Text, nullable=False)
    telugu_summary = Column(Text, default="")
    source_citation = Column(String(255), default="CareBridge Hospital Operations Manual")
    keywords = Column(String(255), default="")
    simulation_mode = Column(Boolean, default=True)

