import uuid
import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from .models import (
    Hospital, Department, Doctor, ScheduleSlot, Appointment,
    Patient, ScheduleConflict, HospitalPolicy, AuditLog
)
from .smartflow import calculate_smartflow_score, get_network_simulation_metrics

def search_doctors_and_slots(
    db: Session,
    department_name: Optional[str] = None,
    date_str: Optional[str] = None,
    preference: str = "",
    hospital_code: Optional[str] = None
) -> Dict[str, Any]:
    """
    Finds available doctor slots across the hospital network,
    evaluates them via SmartFlow simulation, and ranks them by lowest wait / best efficiency.
    """
    today = datetime.date.today()
    if not date_str:
        # Default to tomorrow for demo requests
        date_str = (today + datetime.timedelta(days=1)).strftime("%Y-%m-%d")
    elif date_str.lower() in ["tomorrow", "repu", "రేపు"]:
        date_str = (today + datetime.timedelta(days=1)).strftime("%Y-%m-%d")
    elif date_str.lower() in ["today", "ee roju", "ఈ రోజు"]:
        date_str = today.strftime("%Y-%m-%d")

    # Match department
    dept_query = db.query(Department)
    if department_name:
        dept_lower = department_name.lower().strip()
        matched_dept = None
        for d in dept_query.all():
            if (dept_lower in d.name.lower() or 
                dept_lower in d.code.lower() or 
                dept_lower in d.telugu_name.lower() or
                d.name.lower() in dept_lower):
                matched_dept = d
                break
        if not matched_dept:
            # Fallback fuzzy matching for common variants
            if any(w in dept_lower for w in ["heart", "cardio", "కార్డియాలజీ", "గుండె"]):
                matched_dept = db.query(Department).filter(Department.code == "CARD").first()
            elif any(w in dept_lower for w in ["general", "medicine", "physician", "జనరల్", "వైద్యం"]):
                matched_dept = db.query(Department).filter(Department.code == "GENMED").first()
            elif any(w in dept_lower for w in ["skin", "derma", "చర్మ"]):
                matched_dept = db.query(Department).filter(Department.code == "DERM").first()
            elif any(w in dept_lower for w in ["bone", "ortho", "ఎముక"]):
                matched_dept = db.query(Department).filter(Department.code == "ORTHO").first()
            elif any(w in dept_lower for w in ["child", "pedia", "పిల్లల"]):
                matched_dept = db.query(Department).filter(Department.code == "PED").first()
            elif any(w in dept_lower for w in ["brain", "neuro", "నాడీ", "న్యూరాలజీ"]):
                matched_dept = db.query(Department).filter(Department.code == "NEUR").first()
    else:
        matched_dept = None

    # Query Doctors
    doc_query = db.query(Doctor)
    if matched_dept:
        doc_query = doc_query.filter(Doctor.department_id == matched_dept.id)
    if hospital_code:
        hosp = db.query(Hospital).filter(Hospital.code == hospital_code).first()
        if hosp:
            doc_query = doc_query.filter(Doctor.hospital_id == hosp.id)

    doctors = doc_query.all()
    if not doctors:
        return {
            "success": False,
            "message": f"No doctors found matching criteria '{department_name}' for date {date_str}.",
            "slots": [],
            "recommended_slot": None
        }

    scored_slots = []
    for doc in doctors:
        hosp = db.query(Hospital).filter(Hospital.id == doc.hospital_id).first()
        slots = db.query(ScheduleSlot).filter(
            ScheduleSlot.doctor_id == doc.id,
            ScheduleSlot.date == date_str,
            ScheduleSlot.is_booked == False
        ).all()

        for slot in slots:
            score_data = calculate_smartflow_score(
                slot=slot,
                doctor=doc,
                hospital=hosp,
                preferred_time=preference
            )
            dept = db.query(Department).filter(Department.id == doc.department_id).first()
            scored_slots.append({
                "slot_id": slot.id,
                "doctor_id": doc.id,
                "doctor_name": doc.name,
                "doctor_title": doc.title,
                "doctor_rating": doc.rating,
                "specialization": doc.specialization,
                "experience_years": doc.experience_years,
                "consultation_fee": doc.consultation_fee,
                "languages_spoken": doc.languages_spoken,
                "room_number": doc.room_number,
                "department_name": dept.name if dept else "General",
                "department_telugu": dept.telugu_name if dept else "",
                "hospital_id": hosp.id,
                "hospital_name": hosp.name,
                "hospital_short": hosp.short_name,
                "hospital_code": hosp.code,
                "hospital_area": hosp.area,
                "map_link": hosp.map_link,
                "date": slot.date,
                "start_time": slot.start_time,
                "end_time": slot.end_time,
                "simulated_wait_min": slot.simulated_wait_min,
                "token_number": slot.token_number,
                "current_serving_token": slot.current_serving_token,
                "patients_ahead": max(0, int(''.join(c for c in str(slot.token_number) if c.isdigit()) or 0) - int(''.join(c for c in str(slot.current_serving_token) if c.isdigit()) or 0)) if any(c.isdigit() for c in str(slot.token_number)) else 2,
                "smartflow_score": score_data["overall_score"],
                "score_percentage": score_data["score_percentage"],
                "score_breakdown": score_data,
            })

    # Sort slots by SmartFlow score (highest efficiency / lowest wait first)
    scored_slots.sort(key=lambda s: s["smartflow_score"], reverse=True)

    recommended = scored_slots[0] if scored_slots else None

    return {
        "success": True,
        "date": date_str,
        "department_queried": matched_dept.name if matched_dept else (department_name or "All"),
        "total_available_slots": len(scored_slots),
        "recommended_slot": recommended,
        "slots": scored_slots[:6] # return top 6 candidates
    }

def book_appointment(
    db: Session,
    patient_id: int,
    slot_id: int,
    reason: str = "General Consultation",
    actor_name: str = "Patient",
    actor_role: str = "patient"
) -> Dict[str, Any]:
    """
    Safely executes an appointment booking, records confirmation, and writes to audit log.
    Generates full digital pass information.
    """
    slot = db.query(ScheduleSlot).filter(ScheduleSlot.id == slot_id).first()
    if not slot:
        return {"success": False, "message": f"Slot ID {slot_id} not found."}
    if slot.is_booked:
        return {"success": False, "message": "This slot was just booked by another patient. Please choose an alternative."}

    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        patient = db.query(Patient).filter(Patient.role == "patient").first()

    doctor = db.query(Doctor).filter(Doctor.id == slot.doctor_id).first()
    hospital = db.query(Hospital).filter(Hospital.id == doctor.hospital_id).first()
    dept = db.query(Department).filter(Department.id == doctor.department_id).first()

    # Generate confirmation code
    random_suffix = str(uuid.uuid4().hex)[:6].upper()
    confirmation_code = f"CB-2026-{random_suffix}"

    # Calculate score
    score_data = calculate_smartflow_score(slot, doctor, hospital)

    # Create appointment with assigned token and fee
    appt = Appointment(
        confirmation_code=confirmation_code,
        patient_id=patient.id,
        doctor_id=doctor.id,
        slot_id=slot.id,
        status="CONFIRMED",
        reason=reason,
        priority="NORMAL",
        simulated_wait_min=slot.simulated_wait_min,
        smartflow_score=score_data["overall_score"],
        token_number=slot.token_number,
        consultation_fee=doctor.consultation_fee
    )
    db.add(appt)

    # Mark slot booked & update doctor stats
    slot.is_booked = True
    doctor.current_active_patients += 1
    hospital.occupied_beds = min(hospital.total_beds, hospital.occupied_beds + 1)

    # Immutable Audit Log
    audit_entry = AuditLog(
        actor_name=actor_name,
        actor_role=actor_role,
        action_type="BOOKING",
        status="SUCCESS",
        details=f"Booked appointment {confirmation_code} (Token #{slot.token_number}) with {doctor.name} ({dept.name}) at {hospital.short_name} for {slot.date} at {slot.start_time}. Fee: ₹{doctor.consultation_fee}. Est wait: {slot.simulated_wait_min}m.",
        risk_level="LOW"
    )
    db.add(audit_entry)
    db.commit()
    db.refresh(appt)

    patients_ahead = 2
    try:
        t_int = int(str(slot.token_number).replace("GM-", "").replace("GM", ""))
        s_int = int(str(slot.current_serving_token).replace("GM-", "").replace("GM", ""))
        patients_ahead = max(0, t_int - s_int)
    except Exception:
        patients_ahead = 2

    # Formatted token string (e.g., GM-024)
    tok_str = str(slot.token_number)
    if not tok_str.startswith("GM-") and dept.name == "General Medicine":
        tok_str = f"GM-{str(slot.token_number).zfill(3)}"

    return {
        "success": True,
        "appointment": {
            "id": appt.id,
            "patient_name": patient.name,
            "hospital_name": hospital.short_name,
            "doctor_name": doctor.name,
            "department": dept.name,
            "date": slot.date,
            "time": slot.start_time,
            "token_number": tok_str,
            "room_number": doctor.room_number or "OPD-03"
        },
        "digital_opd_pass": True,
        "simulation_mode": True,
        "confirmation_code": confirmation_code,
        "appointment_id": appt.id,
        "patient_name": patient.name,
        "patient_uid": patient.patient_uid,
        "doctor_name": doctor.name,
        "specialization": doctor.specialization,
        "experience_years": doctor.experience_years,
        "consultation_fee": doctor.consultation_fee,
        "languages_spoken": doctor.languages_spoken,
        "department": dept.name,
        "telugu_department": dept.telugu_name,
        "hospital_name": hospital.name,
        "hospital_short": hospital.short_name,
        "hospital_area": hospital.area,
        "room_number": doctor.room_number,
        "map_link": hospital.map_link,
        "date": slot.date,
        "time": slot.start_time,
        "token_number": tok_str,
        "current_serving_token": slot.current_serving_token,
        "patients_ahead": patients_ahead,
        "simulated_wait_min": slot.simulated_wait_min,
        "smartflow_score": score_data["overall_score"],
        "instructions": "Please arrive 10 minutes prior to your scheduled slot. Show this Digital OPD Pass at the reception kiosk."
    }

def cancel_appointment(
    db: Session,
    appointment_id: int,
    reason: str = "Patient requested cancellation",
    actor_name: str = "Patient",
    actor_role: str = "patient"
) -> Dict[str, Any]:
    """
    Cancels an appointment, releases the slot back to the SmartFlow scheduling pool, and logs to audit.
    """
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        return {"success": False, "message": "Appointment not found."}

    appt.status = "CANCELLED"
    slot = db.query(ScheduleSlot).filter(ScheduleSlot.id == appt.slot_id).first()
    if slot:
        slot.is_booked = False

    doctor = db.query(Doctor).filter(Doctor.id == appt.doctor_id).first()
    if doctor and doctor.current_active_patients > 0:
        doctor.current_active_patients -= 1

    # Audit Log
    audit_entry = AuditLog(
        actor_name=actor_name,
        actor_role=actor_role,
        action_type="CANCEL",
        status="SUCCESS",
        details=f"Cancelled appointment {appt.confirmation_code}. Slot {slot.date if slot else ''} {slot.start_time if slot else ''} released to scheduling pool.",
        risk_level="LOW"
    )
    db.add(audit_entry)
    db.commit()

    return {
        "success": True,
        "message": f"Appointment {appt.confirmation_code} has been successfully cancelled. Slot released to pool.",
        "confirmation_code": appt.confirmation_code
    }

def reschedule_appointment(
    db: Session,
    appointment_id: int,
    new_slot_id: int,
    actor_name: str = "Patient",
    actor_role: str = "patient"
) -> Dict[str, Any]:
    """
    Reschedules an appointment by releasing the previous slot and reserving the new slot.
    """
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        return {"success": False, "message": "Appointment not found."}

    new_slot = db.query(ScheduleSlot).filter(ScheduleSlot.id == new_slot_id).first()
    if not new_slot:
        return {"success": False, "message": "Selected new slot not found."}
    if new_slot.is_booked:
        return {"success": False, "message": "Selected new slot is already booked. Please choose an alternative."}

    # Release old slot
    old_slot = db.query(ScheduleSlot).filter(ScheduleSlot.id == appt.slot_id).first()
    if old_slot:
        old_slot.is_booked = False

    # Reserve new slot
    new_slot.is_booked = True
    appt.slot_id = new_slot.id
    appt.doctor_id = new_slot.doctor_id
    appt.status = "CONFIRMED"
    appt.simulated_wait_min = new_slot.simulated_wait_min

    doctor = db.query(Doctor).filter(Doctor.id == new_slot.doctor_id).first()
    hospital = db.query(Hospital).filter(Hospital.id == doctor.hospital_id).first() if doctor else None
    dept = db.query(Department).filter(Department.id == doctor.department_id).first() if doctor else None

    audit_entry = AuditLog(
        actor_name=actor_name,
        actor_role=actor_role,
        action_type="RESCHEDULE",
        status="SUCCESS",
        details=f"Rescheduled appointment {appt.confirmation_code} to {new_slot.date} at {new_slot.start_time} with {doctor.name if doctor else 'Doctor'}.",
        risk_level="LOW"
    )
    db.add(audit_entry)
    db.commit()

    return {
        "success": True,
        "message": f"Appointment {appt.confirmation_code} has been successfully rescheduled to {new_slot.date} at {new_slot.start_time} with {doctor.name if doctor else ''}.",
        "confirmation_code": appt.confirmation_code,
        "appointment_id": appt.id,
        "date": new_slot.date,
        "time": new_slot.start_time,
        "doctor_name": doctor.name if doctor else "",
        "department": dept.name if dept else "",
        "hospital_name": hospital.name if hospital else "",
        "room_number": doctor.room_number if doctor else "",
        "token_number": new_slot.token_number,
        "simulated_wait_min": new_slot.simulated_wait_min
    }

def detect_schedule_conflicts(db: Session, date_str: Optional[str] = None) -> Dict[str, Any]:
    """
    Scans hospital schedule for conflicts, overlapping bookings, and doctor overload.
    """
    today = datetime.date.today()
    if not date_str:
        date_str = (today + datetime.timedelta(days=1)).strftime("%Y-%m-%d")

    conflicts = db.query(ScheduleConflict).filter(
        ScheduleConflict.date == date_str,
        ScheduleConflict.status == "PENDING"
    ).all()

    results = []
    for c in conflicts:
        doc = db.query(Doctor).filter(Doctor.id == c.doctor_id).first()
        hosp = db.query(Hospital).filter(Hospital.id == doc.hospital_id).first() if doc else None
        dept = db.query(Department).filter(Department.id == doc.department_id).first() if doc else None

        results.append({
            "conflict_id": c.id,
            "date": c.date,
            "doctor_id": doc.id if doc else None,
            "doctor_name": doc.name if doc else "Specialist",
            "hospital_name": hosp.short_name if hosp else "Main Hospital",
            "department": dept.name if dept else "OPD",
            "conflict_type": c.conflict_type,
            "description": c.description,
            "suggested_resolution": c.suggested_resolution,
            "status": c.status
        })

    return {
        "success": True,
        "date": date_str,
        "conflicts_count": len(results),
        "conflicts": results
    }

def resolve_schedule_conflict(
    db: Session,
    conflict_id: int,
    resolution_action: str = "APPLY_SUGGESTED",
    actor_name: str = "Priya Sharma",
    actor_role: str = "receptionist"
) -> Dict[str, Any]:
    """
    Staff / Receptionist one-click resolution of flagged schedule conflicts.
    """
    conflict = db.query(ScheduleConflict).filter(ScheduleConflict.id == conflict_id).first()
    if not conflict:
        return {"success": False, "message": "Conflict not found."}

    conflict.status = "RESOLVED"
    conflict.resolved_at = datetime.datetime.utcnow()

    doc = db.query(Doctor).filter(Doctor.id == conflict.doctor_id).first()
    doc_name = doc.name if doc else "Physician"

    # Audit Log
    audit_entry = AuditLog(
        actor_name=actor_name,
        actor_role=actor_role,
        action_type="CONFLICT_RESOLUTION",
        status="SUCCESS",
        details=f"Resolved schedule conflict #{conflict.id} for {doc_name}. Action: {conflict.suggested_resolution}",
        risk_level="LOW"
    )
    db.add(audit_entry)
    db.commit()

    return {
        "success": True,
        "conflict_id": conflict.id,
        "status": "RESOLVED",
        "message": f"Conflict successfully resolved! Applied resolution: {conflict.suggested_resolution}",
        "resolved_by": actor_name
    }

def search_hospital_policies_rag(db: Session, query: str) -> Dict[str, Any]:
    """
    RAG-style retrieval from hospital policy and FAQ knowledge base.
    """
    q_tokens = [w.lower().strip() for w in query.split() if len(w) > 2]
    policies = db.query(HospitalPolicy).all()

    matches = []
    for pol in policies:
        score = 0
        searchable_text = f"{pol.title} {pol.content} {pol.keywords} {pol.category}".lower()
        for token in q_tokens:
            if token in searchable_text:
                score += 1
        if score > 0:
            matches.append((score, pol))

    matches.sort(key=lambda x: x[0], reverse=True)

    if not matches:
        # Return default general guidance
        return {
            "success": True,
            "query": query,
            "policies": [{
                "title": "General Hospital Administration & Support",
                "category": "GENERAL_DESK",
                "content": "For specific clinical queries or emergency admissions, please contact the 24/7 CareBridge Central Helpdesk at +91 40 4567 2222 or visit the Ground Floor Information Kiosk.",
                "telugu_summary": "మరిన్ని వివరాలకు 24/7 కేర్‌బ్రిడ్జ్ హెల్ప్‌డెస్క్ నంబర్ +91 40 4567 2222 కు సంప్రదించండి."
            }]
        }

    top_policies = [
        {
            "id": p.id,
            "title": p.title,
            "category": p.category,
            "content": p.content,
            "telugu_summary": p.telugu_summary,
            "relevance_score": s
        }
        for s, p in matches[:3]
    ]

    return {
        "success": True,
        "query": query,
        "policies": top_policies
    }

def check_patient_records_access(
    db: Session,
    actor_id: int,
    actor_name: str,
    actor_role: str,
    target_patient_id: Optional[int] = None,
    query_text: str = ""
) -> Dict[str, Any]:
    """
    Role-Based Access Control (RBAC) & Safety Guardrail.
    Patient role cannot view other patients' private health records.
    """
    is_asking_for_others = (
        "another" in query_text.lower() or 
        "other" in query_text.lower() or 
        "someone else" in query_text.lower() or
        "records" in query_text.lower() or
        "history" in query_text.lower() or
        "member" in query_text.lower() or
        "registered" in query_text.lower() or
        "user" in query_text.lower() or
        "సభ్యుల" in query_text or
        "నమోదైన" in query_text
    )

    if actor_role == "patient":
        # Patients are restricted from viewing records of other patients or the member directory
        audit_entry = AuditLog(
            actor_name=actor_name,
            actor_role=actor_role,
            action_type="RECORD_ACCESS",
            status="BLOCKED_UNAUTHORIZED",
            details=f"Unauthorized access attempt blocked: Patient '{actor_name}' attempted to access private member records/directory. Query: '{query_text}'. DPDP/HIPAA safety protocol triggered.",
            risk_level="HIGH"
        )
        db.add(audit_entry)
        db.commit()

        return {
            "allowed": False,
            "status": "BLOCKED_UNAUTHORIZED",
            "message": "Registered members' personal data and medical records are confidential under DPDP & HIPAA regulations. Only authorized hospital staff can access member records.",
            "telugu_message": "నమోదైన సభ్యుల వ్యక్తిగత డేటా మరియు రికార్డులు DPDP & HIPAA నిబంధనల ప్రకారం అత్యంత గోప్యమైనవి. కేవలం అధీకృత హాస్పిటల్ సిబ్బందికి మాత్రమే యాక్సెస్ ఉంటుంది.",
            "safety_reason": "Role-Based Access Control (RBAC) & DPDP/HIPAA patient privacy standard violation."
        }

    # Staff / Admin role is permitted
    audit_entry = AuditLog(
        actor_name=actor_name,
        actor_role=actor_role,
        action_type="RECORD_ACCESS",
        status="SUCCESS",
        details=f"Authorized clinical records access granted to {actor_role.upper()} '{actor_name}'.",
        risk_level="LOW"
    )
    db.add(audit_entry)
    db.commit()

    return {
        "allowed": True,
        "status": "AUTHORIZED",
        "message": f"Authorized access verified for {actor_role.upper()} ({actor_name}). Retrieving authorized operational records.",
        "safety_reason": "Authorized Role: Staff / Administrator"
    }
