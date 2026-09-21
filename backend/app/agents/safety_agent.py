"""
CareBridge AI 2.0 — Safety & Privacy Agent
Enforces Role-Based Access Control, patient privacy guardrails, and life-safety triage.
"""
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from ..agent_tools.safety_tools import check_access_permission, detect_emergency_triage

class SafetyAgent:
    def __init__(self, db: Session):
        self.db = db
        self.name = "Safety & Privacy Agent"

    def validate_action_permissions(
        self,
        actor_name: str,
        actor_role: str,
        requested_action: str
    ) -> Dict[str, Any]:
        """
        Validates whether actor possesses authorized privileges for action.
        """
        return check_access_permission(self.db, actor_name, actor_role, requested_action)

    def scan_for_emergency(self, text: str) -> Optional[Dict[str, Any]]:
        """
        Checks for acute emergency symptoms requiring immediate 108/112 guidance.
        """
        return detect_emergency_triage(text)
