"""
CareBridge AI 2.0 — Scheduling Agent
Implements multi-constraint calendar matching, atomic bookings, reschedules, and cancellations.
"""
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from ..agent_tools.scheduling_tools import (
    check_doctor_slots,
    create_appointment,
    cancel_appointment,
    reschedule_appointment
)
from ..tools import detect_schedule_conflicts, resolve_schedule_conflict

class SchedulingAgent:
    def __init__(self, db: Session):
        self.db = db
        self.name = "Scheduling Agent"

    def find_best_slots(
        self,
        department: str = "Cardiology",
        date_str: Optional[str] = None,
        constraints: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Retrieves matching slots strictly satisfying user constraints.
        """
        return check_doctor_slots(self.db, department, date_str, constraints)

    def execute_booking(
        self,
        slot_id: int,
        patient_id: int = 1,
        reason: str = "General Consultation",
        actor_name: str = "Ravi Kumar",
        actor_role: str = "patient"
    ) -> Dict[str, Any]:
        return create_appointment(
            self.db, slot_id, patient_id, reason, actor_name, actor_role
        )

    def execute_cancellation(
        self,
        appointment_id: int,
        reason: str = "Patient requested cancellation",
        actor_name: str = "Patient",
        actor_role: str = "patient"
    ) -> Dict[str, Any]:
        return cancel_appointment(
            self.db, appointment_id, reason, actor_name, actor_role
        )

    def execute_reschedule(
        self,
        appointment_id: int,
        new_slot_id: int,
        actor_name: str = "Patient",
        actor_role: str = "patient"
    ) -> Dict[str, Any]:
        return reschedule_appointment(
            self.db, appointment_id, new_slot_id, actor_name, actor_role
        )

    def check_conflicts(self) -> Dict[str, Any]:
        return detect_schedule_conflicts(self.db)

    def resolve_conflict(
        self,
        conflict_id: int,
        actor_name: str = "Priya Sharma",
        actor_role: str = "receptionist"
    ) -> Dict[str, Any]:
        return resolve_schedule_conflict(self.db, conflict_id, actor_name, actor_role)
