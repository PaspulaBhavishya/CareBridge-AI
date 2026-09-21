"""
CareBridge AI 2.0 — Notification Agent
Delivers simulated multi-channel WhatsApp, SMS, and delay notifications with delivery receipts.
"""
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from ..agent_tools.notification_tools import send_notification

class NotificationAgent:
    def __init__(self, db: Session):
        self.db = db
        self.name = "Notification Agent"

    def dispatch_alert(
        self,
        recipient_phone: str,
        patient_name: str,
        alert_type: str,
        message_en: str,
        message_te: Optional[str] = None
    ) -> Dict[str, Any]:
        return send_notification(
            self.db, recipient_phone, patient_name, alert_type, message_en, message_te
        )
