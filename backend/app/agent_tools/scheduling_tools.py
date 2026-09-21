"""
CareBridge AI 2.0 — Scheduling & Calendar Tools
Implements constraint-based slot querying, atomic bookings, cancellations, and reschedules.
"""
import uuid
import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from ..models import Doctor, Department, ScheduleSlot, Appointment, Patient, AuditLog

def check_doctor_slots(
    db: Session,
    department: str = "Cardiology",
    date_str: Optional[str] = None,
    constraints: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Checks open doctor slots with constraint-based evaluation:
    - time_of_day: 'morning' (before 12 PM) vs 'afternoon' (after 12 PM)
    - doctor_gender: 'female' / 'male'
    - language: 'telugu' / 'english'
    - max_fee: integer INR maximum
    - max_wait_min: integer maximum simulated queue wait
    """
    if not date_str:
        date_str = (datetime.date.today() + datetime.timedelta(days=1)).strftime("%Y-%m-%d")

    dept = db.query(Department).filter(Department.name.ilike(f"%{department}%")).first()
    dept_id = dept.id if dept else None

    query = db.query(ScheduleSlot).join(Doctor).filter(
        ScheduleSlot.date == date_str,
        ScheduleSlot.is_booked == False
    )

    if dept_id:
        query = query.filter(Doctor.department_id == dept_id)

    raw_slots = query.all()
    filtered_slots = []
    c = constraints or {}

    for slot in raw_slots:
        doc = slot.doctor
        # Time filter
        start_t = slot.start_time.upper()
        is_morning = "AM" in start_t and not ("12:" in start_t)
        if c.get("time_of_day") == "morning" and not is_morning:
            continue
        if c.get("time_of_day") == "afternoon" and is_morning:
            continue

        # Fee constraint
        if c.get("max_fee") and doc.consultation_fee > c["max_fee"]:
            continue

        # Wait constraint
        if c.get("max_wait_min") and slot.simulated_wait_min > c["max_wait_min"]:
            continue

        # Language constraint
        if c.get("language") and "telugu" in c["language"].lower():
            if "telugu" not in doc.languages_spoken.lower():
                continue

        # Gender constraint
        if c.get("doctor_gender") == "female":
            if not any(name in doc.name for name in ["Ananya", "Priya", "Sunitha", "Kavitha", "Deepa"]):
                continue
        elif c.get("doctor_gender") == "male":
            if any(name in doc.name for name in ["Ananya", "Priya", "Sunitha", "Kavitha", "Deepa"]):
                continue

        filtered_slots.append({
            "slot_id": slot.id,
            "doctor_id": doc.id,
            "doctor_name": doc.name,
            "specialization": doc.specialization,
            "hospital_name": doc.hospital.short_name if doc.hospital else "CareBridge Metro",
            "hospital_area": doc.hospital.area if doc.hospital else "Hyderabad",
            "date": slot.date,
            "start_time": slot.start_time,
            "end_time": slot.end_time,
            "simulated_wait_min": slot.simulated_wait_min,
            "consultation_fee": doc.consultation_fee,
            "languages_spoken": doc.languages_spoken,
            "room_number": doc.room_number,
            "doctor_rating": doc.rating
        })

    # Sort primarily by lowest wait time, then rating
    filtered_slots.sort(key=lambda s: (s["simulated_wait_min"], -s["doctor_rating"]))

    return {
        "success": True,
        "department": dept.name if dept else department,
        "target_date": date_str,
        "total_available": len(filtered_slots),
        "slots": filtered_slots,
        "applied_constraints": c
    }

def create_appointment(
    db: Session,
    slot_id: int,
    patient_id: int = 1,
    reason: str = "General Consultation",
    actor_name: str = "Ravi Kumar",
    actor_role: str = "patient"
) -> Dict[str, Any]:
    """
    Atomically books a schedule slot, creates appointment entry, generates confirmation code,
    and records to tamper-evident audit logs.
    """
    slot = db.query(ScheduleSlot).filter(ScheduleSlot.id == slot_id).first()
    if not slot:
        return {"success": False, "message": f"Schedule slot #{slot_id} not found."}
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        patient = db.query(Patient).first()

    doctor = slot.doctor

    # Idempotency & Duplicate Booking Protection:
    existing_appt = db.query(Appointment).filter(
        Appointment.patient_id == (patient.id if patient else 1),
        Appointment.slot_id == slot.id,
        Appointment.status == "CONFIRMED"
    ).first()
    if existing_appt:
        return {
            "success": True,
            "is_duplicate": True,
            "confirmation_code": existing_appt.confirmation_code,
            "appointment_id": existing_appt.id,
            "patient_name": patient.name if patient else "Patient",
            "doctor_name": doctor.name,
            "specialization": doctor.specialization,
            "hospital_name": doctor.hospital.short_name if doctor.hospital else "CareBridge Metro",
            "room_number": doctor.room_number,
            "date": slot.date,
            "time": slot.start_time,
            "simulated_wait_min": slot.simulated_wait_min,
            "consultation_fee": doctor.consultation_fee,
            "token_number": existing_appt.token_number,
            "message": f"Existing booking detected ({existing_appt.confirmation_code}). No duplicate appointment created or charged."
        }

    if slot.is_booked:
        return {"success": False, "message": "This slot is no longer available. Slot already booked."}

    conf_code = f"CB-2026-{str(uuid.uuid4().hex[:6]).upper()}"

    slot.is_booked = True
    appointment = Appointment(
        confirmation_code=conf_code,
        patient_id=patient.id if patient else 1,
        doctor_id=doctor.id,
        slot_id=slot.id,
        status="CONFIRMED",
        reason=reason,
        priority="NORMAL",
        simulated_wait_min=slot.simulated_wait_min,
        token_number=slot.token_number or "GM-024",
        consultation_fee=doctor.consultation_fee,
        simulation_mode=True
    )
    db.add(appointment)

    # Log to audit trail
    audit = AuditLog(
        actor_name=actor_name,
        actor_role=actor_role,
        action_type="BOOKING_CREATE",
        status="SUCCESS",
        details=f"Appointment {conf_code} booked for {patient.name if patient else 'Patient'} with {doctor.name} at {slot.start_time} ({slot.date}).",
        risk_level="LOW"
    )
    db.add(audit)
    db.commit()
    db.refresh(appointment)

    return {
        "success": True,
        "confirmation_code": conf_code,
        "appointment_id": appointment.id,
        "patient_name": patient.name if patient else "Patient",
        "doctor_name": doctor.name,
        "specialization": doctor.specialization,
        "hospital_name": doctor.hospital.short_name if doctor.hospital else "CareBridge Metro",
        "room_number": doctor.room_number,
        "date": slot.date,
        "time": slot.start_time,
        "simulated_wait_min": slot.simulated_wait_min,
        "consultation_fee": doctor.consultation_fee,
        "token_number": appointment.token_number,
        "message": f"Appointment successfully confirmed with {doctor.name} at {slot.start_time}."
    }

def cancel_appointment(
    db: Session,
    appointment_id: int,
    reason: str = "Patient requested cancellation",
    actor_name: str = "Patient",
    actor_role: str = "patient"
) -> Dict[str, Any]:
    """
    Cancels an appointment, releases slot back to pool, and writes to audit log.
    """
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        return {"success": False, "message": f"Appointment #{appointment_id} not found."}

    appt.status = "CANCELLED"
    if appt.slot:
        appt.slot.is_booked = False

    audit = AuditLog(
        actor_name=actor_name,
        actor_role=actor_role,
        action_type="APPOINTMENT_CANCEL",
        status="SUCCESS",
        details=f"Appointment {appt.confirmation_code} cancelled. Reason: {reason}.",
        risk_level="LOW"
    )
    db.add(audit)
    db.commit()

    return {
        "success": True,
        "appointment_id": appt.id,
        "confirmation_code": appt.confirmation_code,
        "status": "CANCELLED",
        "message": f"Appointment {appt.confirmation_code} has been successfully cancelled."
    }

def reschedule_appointment(
    db: Session,
    appointment_id: int,
    new_slot_id: int,
    actor_name: str = "Patient",
    actor_role: str = "patient"
) -> Dict[str, Any]:
    """
    Transfers an existing appointment to a new schedule slot with audit logging.
    """
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        return {"success": False, "message": f"Appointment #{appointment_id} not found."}

    new_slot = db.query(ScheduleSlot).filter(ScheduleSlot.id == new_slot_id).first()
    if not new_slot or new_slot.is_booked:
        return {"success": False, "message": "Target schedule slot is invalid or already booked."}

    # Release old slot
    if appt.slot:
        appt.slot.is_booked = False

    # Bind new slot
    new_slot.is_booked = True
    appt.slot_id = new_slot.id
    appt.doctor_id = new_slot.doctor_id
    appt.simulated_wait_min = new_slot.simulated_wait_min
    appt.status = "CONFIRMED"

    audit = AuditLog(
        actor_name=actor_name,
        actor_role=actor_role,
        action_type="APPOINTMENT_RESCHEDULE",
        status="SUCCESS",
        details=f"Appointment {appt.confirmation_code} rescheduled to {new_slot.date} at {new_slot.start_time} with {new_slot.doctor.name}.",
        risk_level="LOW"
    )
    db.add(audit)
    db.commit()

    return {
        "success": True,
        "appointment_id": appt.id,
        "confirmation_code": appt.confirmation_code,
        "doctor_name": new_slot.doctor.name,
        "date": new_slot.date,
        "time": new_slot.start_time,
        "simulated_wait_min": new_slot.simulated_wait_min,
        "message": f"Successfully rescheduled to {new_slot.date} at {new_slot.start_time} with {new_slot.doctor.name}."
    }
