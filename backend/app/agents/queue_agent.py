"""
CareBridge AI 2.0 — Queue Management Agent
Tracks live token status, OPD waiting queue depth, and generates digital passes.
"""
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from ..agent_tools.queue_tools import get_token_status, generate_opd_pass

class QueueAgent:
    def __init__(self, db: Session):
        self.db = db
        self.name = "Queue Management Agent"

    def check_live_status(self, token_identifier: str = "GM-024") -> Dict[str, Any]:
        return get_token_status(self.db, token_identifier)

    def issue_digital_pass(self, appointment_id: int) -> Dict[str, Any]:
        return generate_opd_pass(self.db, appointment_id)
