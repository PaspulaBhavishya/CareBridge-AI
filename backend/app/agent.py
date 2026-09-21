"""
CareBridge AI 2.0 — Agent Orchestration Bridge
Provides backward-compatible interface delegating to the Supervisor Agent.
"""
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from .agents.supervisor_agent import SupervisorAgent

TELUGU_PATTERNS = {
    "is_telugu": [
        "naaku", "kavali", "repu", "undali", "undakudadhu", "teliyali", "cheyyali",
        "chestundi", "ivvadu", "ekkuva", "takkuva", "samayam", "ela", "evaru",
        "నాకు", "కావాలి", "రేపు", "ఉండాలి", "ఉండకూడదు", "తెలియాలి", "చేయాలి"
    ],
    "cardiology": ["cardio", "heart", "గుండె", "కార్డియాలజీ"],
    "general_medicine": ["general medicine", "physician", "జనరల్ మెడిసిన్", "సాధారణ వైద్యం"],
    "dermatology": ["skin", "derma", "చర్మ"],
    "ortho": ["bone", "ortho", "joint", "knee", "ఎముకల", "కీళ్ల", "మోకాళ్ళ"],
    "pediatrics": ["child", "pedia", "పిల్లల"],
    "tomorrow": ["repu", "tomorrow", "రేపు"]
}

def detect_language(text: str) -> str:
    lower = text.lower()
    for kw in TELUGU_PATTERNS["is_telugu"]:
        if kw in lower:
            return "te"
    return "en"

class CareBridgeAgent:
    """
    CareBridge AI 2.0 Agent Bridge.
    Delegates user interactions to the 5-layer multi-agent supervisor architecture.
    """
    def __init__(self, db: Session):
        self.db = db
        self.supervisor = SupervisorAgent(db)

    def process_message(
        self,
        message: str,
        patient_id: int = 1,
        actor_name: str = "Ravi Kumar",
        actor_role: str = "patient",
        selected_language: str = "auto"
    ) -> Dict[str, Any]:
        return self.supervisor.process_message(
            message=message,
            patient_id=patient_id,
            actor_name=actor_name,
            actor_role=actor_role,
            selected_language=selected_language
        )

    def execute_confirmed_action(
        self,
        action_type: str,
        payload: Dict[str, Any],
        actor_name: str = "Ravi Kumar",
        actor_role: str = "patient",
        patient_id: int = 1
    ) -> Dict[str, Any]:
        return self.supervisor.execute_confirmed_action(
            action_type=action_type,
            payload=payload,
            actor_name=actor_name,
            actor_role=actor_role,
            patient_id=patient_id
        )
