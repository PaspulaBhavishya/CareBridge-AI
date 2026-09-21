"""
CareBridge AI 2.0 — Multi-Agent System
Houses the central Supervisor Agent and domain-specialized coordination agents.
"""
from .supervisor_agent import SupervisorAgent
from .communication_agent import CommunicationAgent
from .hospital_agent import HospitalAgent
from .scheduling_agent import SchedulingAgent
from .queue_agent import QueueAgent
from .document_agent import DocumentAgent
from .safety_agent import SafetyAgent
from .notification_agent import NotificationAgent

__all__ = [
    "SupervisorAgent",
    "CommunicationAgent",
    "HospitalAgent",
    "SchedulingAgent",
    "QueueAgent",
    "DocumentAgent",
    "SafetyAgent",
    "NotificationAgent"
]
