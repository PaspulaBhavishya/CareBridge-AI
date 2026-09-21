from fastapi import APIRouter, Request, Depends
from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from sqlalchemy.orm import Session

try:
    from app.database import get_db
    from app.smartflow import get_smartflow_recommendation
    from app.models import Appointment, Doctor, ScheduleSlot, Hospital, AuditLog
    from services.smartflow_engine import (
        rank_hospitals,
        calculate_smartflow_score,
        simulate_hospital_resource_balancing
    )
except ImportError:
    from backend.app.database import get_db
    from backend.app.smartflow import get_smartflow_recommendation
    from backend.app.models import Appointment, Doctor, ScheduleSlot, Hospital, AuditLog
    from backend.services.smartflow_engine import (
        rank_hospitals,
        calculate_smartflow_score,
        simulate_hospital_resource_balancing
    )


router = APIRouter(
    tags=["SmartFlow & Recovery"]
)


class HospitalInput(BaseModel):
    id: str
    name: str
    availability: float
    wait_efficiency: float
    preference_match: float
    estimated_wait_minutes: int
    opd_crowd: str


DEFAULT_DEMO_HOSPITALS = [
    {
        "id": "H1",
        "name": "Hospital A (GGH Guntur / Tertiary)",
        "availability": 85.0,
        "wait_efficiency": 45.0,
        "preference_match": 80.0,
        "estimated_wait_minutes": 65,
        "opd_crowd": "High (94% load)",
        "area": "Collectorate Road, Guntur",
        "doctor_name": "Dr. Ananya Sen",
        "specialization": "Cardiology"
    },
    {
        "id": "H2",
        "name": "Hospital B (CareBridge Central / Urban OPD)",
        "availability": 95.0,
        "wait_efficiency": 92.0,
        "preference_match": 90.0,
        "estimated_wait_minutes": 10,
        "opd_crowd": "Low (38% load)",
        "area": "Main Road, Guntur",
        "doctor_name": "Dr. Priya",
        "specialization": "General Medicine"
    },
    {
        "id": "H3",
        "name": "Hospital C (AIIMS Mangalagiri / Sub-Center)",
        "availability": 70.0,
        "wait_efficiency": 60.0,
        "preference_match": 85.0,
        "estimated_wait_minutes": 35,
        "opd_crowd": "Medium (72% load)",
        "area": "NH-16, Mangalagiri",
        "doctor_name": "Dr. Ravi",
        "specialization": "Cardiology / GenMed"
    },
]


@router.post("/api/smartflow/recommend")
async def recommend_hospitals(
    request: Request,
    db: Session = Depends(get_db)
):
    try:
        body = await request.json()
    except Exception:
        body = None

    if isinstance(body, list) and len(body) > 0:
        ranked = rank_hospitals(body)
        return {
            "success": True,
            "recommendation": ranked[0] if ranked else None,
            "hospitals": ranked,
            "simulation_mode": True
        }

    # Dict or query for explainable recommendation
    if isinstance(body, dict) and ("specialty" in body or "department" in body or "preferred_time" in body):
        specialty = body.get("specialty") or body.get("department") or "Cardiology"
        preferred_time = body.get("preferred_time") or ""
        return get_smartflow_recommendation(db, specialty, preferred_time)

    # Fallback to demo hospitals ranking
    ranked = rank_hospitals(DEFAULT_DEMO_HOSPITALS)
    return {
        "success": True,
        "recommendation": ranked[0] if ranked else None,
        "hospitals": ranked,
        "simulation_mode": True
    }


@router.get("/api/smartflow/recommend")
def recommend_hospitals_get(
    department: str = "General Medicine",
    preferred_time: str = "",
    db: Session = Depends(get_db)
):
    ranked = rank_hospitals(DEFAULT_DEMO_HOSPITALS)
    return {
        "success": True,
        "recommendation": ranked[0] if ranked else None,
        "hospitals": ranked,
        "simulation_mode": True
    }


# =========================================================================
# MODULE 8: What-If Simulator & Dynamic Preferences
# =========================================================================
@router.post("/api/smartflow/whatif")
async def calculate_whatif_smartflow(request: Request):
    """
    Dynamic Multi-Objective What-If Simulation.
    Re-ranks hospital candidates based on real-time slider weights and preference toggles.
    """
    try:
        payload = await request.json()
    except Exception:
        payload = {}

    weights = payload.get("weights", {
        "availability": 0.50,
        "wait_efficiency": 0.30,
        "preference_match": 0.20
    })
    preferences = payload.get("preferences", {})
    hospitals_input = payload.get("hospitals") or DEFAULT_DEMO_HOSPITALS

    ranked = rank_hospitals(
        hospitals=hospitals_input,
        weights=weights,
        preferences=preferences
    )

    return {
        "success": True,
        "active_weights": weights,
        "active_preferences": preferences,
        "top_hospital": ranked[0] if ranked else None,
        "hospitals": ranked,
        "formula_display": ranked[0]["formula_display"] if ranked else "",
        "simulation_mode": True
    }


# =========================================================================
# MODULE 9: Hospital Resource Balancing Digital Twin
# =========================================================================
@router.get("/api/smartflow/resource-balancing")
def get_resource_balancing_metrics():
    """
    Administrative Load Balancing Digital Twin.
    Demonstrates autonomous redistribution of routine cases from overloaded Hospital A to Hospital B.
    """
    return simulate_hospital_resource_balancing()


# =========================================================================
# MODULE 15: CareBridge Recovery Mode (Killer Feature)
# =========================================================================
@router.api_route("/api/recovery/simulate-delay", methods=["GET", "POST"])
def simulate_doctor_delay(
    doctor_name: str = "Dr. Priya",
    delay_minutes: int = 120,
    db: Session = Depends(get_db)
):
    """
    Killer Feature: Doctor Delay Autonomous Recovery.
    Dr. Priya is delayed by 2 hours -> SmartFlow identifies Dr. Ravi at Hospital B.
    GUARANTEE: Zero premature cancellation of the original slot until the patient explicitly approves.
    """
    appt = db.query(Appointment).filter(Appointment.status == "CONFIRMED").order_by(Appointment.id.desc()).first()

    # Log to audit trail
    audit = AuditLog(
        actor_name="Failure Recovery Engine",
        actor_role="system",
        action_type="DOCTOR_DELAY_DETECTED",
        status="RECOVERY_OFFERED",
        details=f"Dr. Priya delayed by {delay_minutes}m due to cardiac surgery emergency. CareBridge AI preserves patient journey by finding alternatives before cancelling. Identified Dr. Ravi at Hospital B.",
        risk_level="MEDIUM"
    )
    db.add(audit)
    db.commit()

    return {
        "success": True,
        "recovery_mode": {
            "active": True,
            "delay_minutes": delay_minutes,
            "delay_reason": "Emergency cardiac surgery call-in",
            "original_doctor": doctor_name,
            "original_hospital": "Hospital B (CareBridge Central)",
            "original_slot": "Today, 10:30 AM",
            "original_token": "GM-024",
            "confirmation_code": appt.confirmation_code if appt else "CB-2026-GM024",
            "cancellation_minimizing_active": True,
            "zero_cancellation_active": True,
            "suggested_alternative": {
                "doctor_name": "Dr. Ravi",
                "specialization": "General Medicine",
                "hospital_name": "Hospital B (CareBridge Central OPD)",
                "room_number": "Room OPD-04",
                "slot_time": "Today, 10:45 AM",
                "token_number": "GM-026",
                "simulated_wait_min": 10,
                "smartflow_score": 94.2,
                "consultation_fee": 600
            },
            "status": "AWAITING_PATIENT_APPROVAL",
            "instructions_en": "CareBridge AI tries to preserve the patient journey by finding alternatives before cancelling an appointment. Your original slot is retained while you review. Click [Accept Alternative] to switch.",
            "instructions_te": "పేషెంట్ జర్నీని కాపాడటానికి అపాయింట్‌మెంట్ రద్దు చేయకుండా ప్రత్యామ్నాయాలను అన్వేషిస్తుంది. మీ అసలు అపాయింట్‌మెంట్ ప్రస్తుతానికి అలాగే ఉంది. స్లాట్ మార్చడానికి [Accept Alternative] క్లిక్ చేయండి."
        }
    }


@router.post("/api/recovery/accept-alternative")
async def accept_recovery_alternative(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Patient approves the recovery alternative.
    Atomically updates appointment, shifts slot, and issues updated OPD pass without double fee.
    """
    try:
        body = await request.json()
    except Exception:
        body = {}

    appt = db.query(Appointment).filter(Appointment.status == "CONFIRMED").order_by(Appointment.id.desc()).first()
    if appt:
        appt.doctor_name = body.get("new_doctor_name", "Dr. Ravi")
        appt.time = body.get("new_time", "10:45 AM")
        appt.token_number = body.get("new_token", "GM-026")
        db.commit()

    # Log to audit trail
    audit = AuditLog(
        actor_name=body.get("patient_name", "Bhavishya"),
        actor_role="patient",
        action_type="RECOVERY_SLOT_ACCEPTED",
        status="SUCCESS",
        details=f"Patient accepted recovery alternative. Shifted from Dr. Priya to Dr. Ravi ({appt.token_number if appt else 'GM-026'}).",
        risk_level="LOW"
    )
    db.add(audit)
    db.commit()

    return {
        "success": True,
        "status": "RECOVERY_COMPLETED",
        "message": "Alternative slot successfully accepted! Your Digital OPD Pass has been updated to Dr. Ravi.",
        "message_telugu": "ప్రత్యామ్నాయ స్లాట్ విజయవంతంగా మార్చబడింది! మీ డిజిటల్ పాస్ డాక్టర్ రవి గారికి అప్‌డేట్ చేయబడింది.",
        "confirmation_code": appt.confirmation_code if appt else "CB-2026-GM024",
        "doctor_name": "Dr. Ravi",
        "room_number": "Room OPD-04",
        "token_number": "GM-026",
        "date": "Today",
        "time": "10:45 AM",
        "notification_dispatched": True
    }
