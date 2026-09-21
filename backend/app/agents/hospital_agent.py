"""
CareBridge AI 2.0 — Hospital Coordination Agent
Manages multi-hospital network comparisons and executes SmartFlow 2.0 explainable recommendations.
"""
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from ..agent_tools.hospital_tools import search_hospitals, calculate_smartflow

class HospitalAgent:
    def __init__(self, db: Session):
        self.db = db
        self.name = "Hospital Coordination Agent"

    def compare_hospitals(self, specialty: Optional[str] = None) -> Dict[str, Any]:
        """
        Gathers capacity and queue data across the simulated network nodes.
        """
        return search_hospitals(self.db, specialty)

    def evaluate_smartflow_pathway(
        self,
        department: str = "Cardiology",
        preferences: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Executes SmartFlow 2.0 multi-hospital scoring and ranking.
        """
        return calculate_smartflow(self.db, department, preferences)

    def explain_recommendation(self, recommendation: Dict[str, Any]) -> str:
        """
        Generates human-readable explainability paragraph detailing why the top option was chosen.
        """
        top_hosp = recommendation.get("recommended_hospital", {})
        top_slot = recommendation.get("recommended_slot", {})
        explanations = recommendation.get("preference_explanations", [])

        bullets = "\n".join([f"  • {e}" for e in explanations])
        return (
            f"Recommended {top_hosp.get('name', 'Hospital B')} with {top_slot.get('doctor_name', 'Attending Specialist')} because:\n"
            f"{bullets}\n"
            f"Overall SmartFlow Score: {top_slot.get('score_percentage', 85)}% (Estimated Wait: {top_slot.get('simulated_wait_min', 12)} mins)."
        )
