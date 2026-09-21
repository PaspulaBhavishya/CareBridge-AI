"""
CareBridge AI 2.0 — Safety, RBAC & Emergency Guardrails Tools
Enforces Role-Based Access Control, HIPAA/DPDP patient privacy, and emergency triage detection.
"""
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from ..models import AuditLog

EMERGENCY_KEYWORDS = [
    "chest pain", "heart attack", "bleeding heavily", "heavy bleeding", "severe accident",
    "unconscious", "cannot breathe", "stroke", "ambulance", "collapsed", "bleeding", "accident",
    "severe chest pain", "radiating shoulder", "gunde noppi", "swasa",
    "గుండె నొప్పి", "రక్తం కారుతోంది", "శ్వాస ఆడట్లేదు", "స్పృహ తప్పింది", "ప్రమాదం", "రక్తం"
]

def check_access_permission(
    db: Session,
    actor_name: str = "Patient",
    actor_role: str = "patient",
    requested_action: str = "VIEW_OTHER_PATIENT_RECORDS"
) -> Dict[str, Any]:
    """
    Enforces RBAC and DPDP/HIPAA patient privacy standards.
    Non-staff actors attempting to view other patient records or export member registries
    are blocked with a HIGH RISK audit record.
    """
    role_lower = (actor_role or "patient").lower()
    is_staff = role_lower in ["admin", "receptionist", "doctor"]

    if not is_staff and ("record" in requested_action.lower() or "member" in requested_action.lower() or "other" in requested_action.lower()):
        # Log High Risk Violation
        audit = AuditLog(
            actor_name=actor_name,
            actor_role=actor_role,
            action_type="SECURITY_ACCESS_VIOLATION",
            status="BLOCKED",
            details=f"Unauthorized access blocked: '{actor_name}' ({actor_role}) attempted '{requested_action}'. Blocked under Zero-Tolerance HIPAA/DPDP RBAC policy.",
            risk_level="HIGH"
        )
        db.add(audit)
        db.commit()

        return {
            "authorized": False,
            "status": "BLOCKED_UNAUTHORIZED",
            "policy": "Role-Based Access Control (RBAC) & DPDP Act 2023 Compliance",
            "reason": "Patients cannot view other patients' protected clinical or registration records.",
            "risk_level": "HIGH",
            "audit_logged": True
        }

    return {
        "authorized": True,
        "status": "ALLOWED",
        "actor_role": actor_role,
        "risk_level": "LOW"
    }

def detect_emergency_triage(text: str) -> Optional[Dict[str, Any]]:
    """
    Identifies acute life-threatening medical emergencies from natural language.
    Produces immediate triage guidance and legal simulation disclaimers.
    """
    t_lower = text.lower()
    is_emergency = any(kw in t_lower for kw in EMERGENCY_KEYWORDS)
    if not is_emergency:
        return None

    return {
        "is_emergency": True,
        "triage_priority": "CRITICAL_RED",
        "condition_flag": "Potential Acute Cardiac or Trauma Emergency",
        "disclaimer": "Emergency Assistance Simulation: The system captures location, displays emergency guidance and simulates an ambulance coordination workflow. It does not automatically dispatch a real ambulance. For a real emergency, call the local emergency number immediately (108 / 112).",
        "immediate_action_en": "Call 108 or 112 immediately. Sit upright, loosen clothing, avoid any physical strain.",
        "immediate_action_te": "వెంటనే 108 లేదా 112 కి కాల్ చేయండి. నిటారుగా కూర్చోండి, విశ్రాంతి తీసుకోండి, శ్రమ పడకండి."
    }
