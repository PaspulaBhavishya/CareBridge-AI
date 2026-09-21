"""
CareBridge AI 2.0 — Human-in-the-Loop Approval Service
Enforces strict healthcare safety gating where sensitive actions require explicit human consent.
States:
PLANNED ➔ WAITING_FOR_APPROVAL ➔ APPROVED ➔ EXECUTING ➔ COMPLETED (or CANCELLED/FAILED)
"""
import uuid
import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from ..models import AuditLog

APPROVAL_REQUIRED_ACTIONS = [
    "FINAL_APPOINTMENT_BOOKING",
    "APPOINTMENT_CANCELLATION",
    "MEDICAL_REPORT_SHARE",
    "CARETAKER_ACCESS_GRANT",
    "PRESCRIPTION_PUBLISH",
    "CHANGE_DOCTOR_OVERRIDE",
    "RECOVERY_SWAP_DOCTOR"
]

class ApprovalService:
    def __init__(self, db: Session):
        self.db = db

    def requires_approval(self, action_type: str) -> bool:
        return any(act in action_type.upper() for act in [
            "BOOK", "CANCEL", "RESCHEDULE", "SHARE", "GRANT", "PRESCRIPTION", "OVERRIDE", "SWAP"
        ])

    def create_approval_request(
        self,
        action_type: str,
        actor_name: str,
        actor_role: str,
        summary: str,
        payload: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Creates a pending approval card payload with a unique ID and structured choices.
        """
        approval_id = f"APPR-{str(uuid.uuid4().hex[:6]).upper()}"

        audit = AuditLog(
            actor_name=actor_name,
            actor_role=actor_role,
            action_type=f"APPROVAL_REQUESTED_{action_type}",
            status="WAITING_FOR_APPROVAL",
            details=f"Human approval requested for '{action_type}': {summary}",
            risk_level="LOW"
        )
        self.db.add(audit)
        self.db.commit()

        return {
            "approval_id": approval_id,
            "action_type": action_type,
            "state": "WAITING_FOR_APPROVAL",
            "summary": summary,
            "payload": payload,
            "requested_at": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
            "options": ["APPROVE", "CHANGE", "CANCEL"]
        }

    def record_decision(
        self,
        approval_id: str,
        action_type: str,
        decision: str, # 'APPROVE' or 'CANCEL'
        actor_name: str,
        actor_role: str
    ) -> Dict[str, Any]:
        """
        Records human approval decision into immutable audit trail.
        """
        status = "APPROVED" if decision.upper() == "APPROVE" else "CANCELLED"
        audit = AuditLog(
            actor_name=actor_name,
            actor_role=actor_role,
            action_type=f"APPROVAL_DECISION_{action_type}",
            status=status,
            details=f"Human {decision.upper()} received for {approval_id} ({action_type}).",
            risk_level="LOW"
        )
        self.db.add(audit)
        self.db.commit()

        return {
            "approval_id": approval_id,
            "decision": decision.upper(),
            "state": status,
            "timestamp": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        }
