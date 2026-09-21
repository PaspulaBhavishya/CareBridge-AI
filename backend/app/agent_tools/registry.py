"""
CareBridge AI 2.0 — Central Agent Tool Registry
Defines the dynamic tool execution registry. The Supervisor and domain agents select
tools dynamically based on parsed user goals and constraints.
"""
from typing import Dict, Any, Callable, Optional
from .hospital_tools import search_hospitals, search_doctors, calculate_smartflow
from .scheduling_tools import (
    check_doctor_slots,
    create_appointment,
    cancel_appointment,
    reschedule_appointment
)
from .queue_tools import get_token_status, generate_opd_pass
from .document_tools import search_policies_rag
from .notification_tools import send_notification
from .safety_tools import check_access_permission, detect_emergency_triage

TOOLS: Dict[str, Callable] = {
    "search_hospitals": search_hospitals,
    "search_doctors": search_doctors,
    "calculate_smartflow": calculate_smartflow,
    "check_doctor_slots": check_doctor_slots,
    "create_appointment": create_appointment,
    "cancel_appointment": cancel_appointment,
    "reschedule_appointment": reschedule_appointment,
    "get_token_status": get_token_status,
    "generate_opd_pass": generate_opd_pass,
    "send_notification": send_notification,
    "check_access_permission": check_access_permission,
    "search_policies_rag": search_policies_rag,
    "detect_emergency_triage": detect_emergency_triage,
}

TOOL_METADATA: Dict[str, Dict[str, Any]] = {
    "search_hospitals": {
        "description": "Searches simulated hospital network nodes and returns capacity metrics.",
        "risk_level": "LOW",
        "domain": "Hospital Coordination Agent"
    },
    "search_doctors": {
        "description": "Searches doctors by department, language, and budget across simulated hospitals.",
        "risk_level": "LOW",
        "domain": "Hospital Coordination Agent"
    },
    "calculate_smartflow": {
        "description": "Calculates multi-factor SmartFlow 2.0 efficiency score with user preferences.",
        "risk_level": "LOW",
        "domain": "Hospital Coordination Agent"
    },
    "check_doctor_slots": {
        "description": "Queries doctor schedule slots applying multi-dimensional constraints.",
        "risk_level": "LOW",
        "domain": "Scheduling Agent"
    },
    "create_appointment": {
        "description": "Performs atomic slot booking and confirmation code generation.",
        "risk_level": "MEDIUM",
        "requires_approval": True,
        "domain": "Scheduling Agent"
    },
    "cancel_appointment": {
        "description": "Cancels an existing appointment and releases slot back to pool.",
        "risk_level": "MEDIUM",
        "requires_approval": True,
        "domain": "Scheduling Agent"
    },
    "reschedule_appointment": {
        "description": "Transfers an existing appointment to a new validated slot.",
        "risk_level": "MEDIUM",
        "requires_approval": True,
        "domain": "Scheduling Agent"
    },
    "get_token_status": {
        "description": "Queries real-time token position, wait estimation, and queue depth.",
        "risk_level": "LOW",
        "domain": "Queue Management Agent"
    },
    "generate_opd_pass": {
        "description": "Generates structured Digital OPD Pass with security QR and room details.",
        "risk_level": "LOW",
        "domain": "Queue Management Agent"
    },
    "send_notification": {
        "description": "Dispatches simulated WhatsApp and SMS multi-channel notifications.",
        "risk_level": "LOW",
        "domain": "Notification Agent"
    },
    "check_access_permission": {
        "description": "Validates RBAC and HIPAA/DPDP patient data privacy permissions.",
        "risk_level": "HIGH",
        "domain": "Safety & Privacy Agent"
    },
    "search_policies_rag": {
        "description": "Retrieves grounded hospital administrative policies with document citations.",
        "risk_level": "LOW",
        "domain": "Document Explanation Agent"
    },
    "detect_emergency_triage": {
        "description": "Scans patient message for life-threatening symptoms and triggers emergency triage.",
        "risk_level": "HIGH",
        "domain": "Safety & Privacy Agent"
    }
}

def get_tool(tool_name: str) -> Optional[Callable]:
    return TOOLS.get(tool_name)

def list_tools() -> Dict[str, Dict[str, Any]]:
    return TOOL_METADATA
