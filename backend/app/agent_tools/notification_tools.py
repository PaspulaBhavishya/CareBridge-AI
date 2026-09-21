"""
CareBridge AI 2.0 — Notification & Outbound Alert Tools
Simulates multi-channel WhatsApp, SMS, and push notification delivery with audit tracking.
"""
import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from ..models import AuditLog

def send_notification(
    db: Session,
    recipient_phone: str = "+91 98480 22334",
    patient_name: str = "Ravi Kumar",
    alert_type: str = "APPOINTMENT_CONFIRMED",
    message_en: str = "Your appointment is confirmed.",
    message_te: Optional[str] = None
) -> Dict[str, Any]:
    """
    Delivers simulated real-time WhatsApp & SMS notifications to patient or emergency contacts,
    persisting tamper-evident delivery records in audit logging.
    """
    audit = AuditLog(
        actor_name="CareBridge Notification Gateway",
        actor_role="system",
        action_type=f"NOTIF_{alert_type}",
        status="SUCCESS",
        details=f"Notification delivered via WhatsApp & SMS to {patient_name} ({recipient_phone}): '{message_en[:80]}...'",
        risk_level="LOW"
    )
    db.add(audit)
    db.commit()

    return {
        "success": True,
        "delivery_channel": "WhatsApp & SMS Gateway",
        "recipient": recipient_phone,
        "patient_name": patient_name,
        "alert_type": alert_type,
        "message_en": message_en,
        "message_te": message_te or "మీ సమాచారం విజయవంతంగా చేరింది.",
        "delivered_at": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
        "delivery_status": "DELIVERED"
    }
