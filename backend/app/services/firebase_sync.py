"""
CareBridge AI — Firebase Realtime Database Synchronizer
Provides live two-way synchronization between FastAPI backend & Google Firebase Realtime Database.
"""

import os
import json
import logging
from typing import Dict, Any, Optional, List
import requests
from pathlib import Path
from dotenv import load_dotenv

# Ensure .env is loaded reliably whether run from root or backend directory
_backend_dir = Path(__file__).resolve().parent.parent.parent
load_dotenv(dotenv_path=_backend_dir / ".env")
load_dotenv(dotenv_path=_backend_dir.parent / ".env")
load_dotenv()

logger = logging.getLogger("carebridge.firebase")

def get_database_url() -> str:
    url = os.getenv("FIREBASE_DATABASE_URL", "").strip().rstrip("/")
    return url

def is_configured() -> bool:
    return bool(get_database_url())

def _make_url(path: str) -> str:
    base = get_database_url()
    clean_path = path.strip("/")
    url = f"{base}/{clean_path}.json"
    token = os.getenv("FIREBASE_AUTH_SECRET", "")
    if token:
        url += f"?auth={token}"
    return url

def test_connection() -> Dict[str, Any]:
    url = get_database_url()
    if not url:
        return {
            "status": "unconfigured",
            "connected": False,
            "message": "FIREBASE_DATABASE_URL is not configured in backend .env"
        }
    try:
        test_endpoint = _make_url("carebridge") + "?shallow=true"
        resp = requests.get(test_endpoint, timeout=4)
        if resp.status_code in [200, 401, 403]:
            # 200 means open/successful, 401/403 means Firebase is reachable but needs auth
            return {
                "status": "active" if resp.status_code == 200 else "permission_denied",
                "connected": resp.status_code == 200,
                "url": url,
                "status_code": resp.status_code,
                "message": "Connected to Firebase Realtime Database" if resp.status_code == 200 else "Firebase reachable; check read/write rules or auth secret"
            }
        return {
            "status": "error",
            "connected": False,
            "url": url,
            "status_code": resp.status_code,
            "message": f"Unexpected status code: {resp.status_code}"
        }
    except Exception as e:
        logger.warning(f"Firebase connection test failed: {e}")
        return {
            "status": "unreachable",
            "connected": False,
            "url": url,
            "message": str(e)
        }

def sync_appointment_to_firebase(appointment_data: Dict[str, Any]) -> bool:
    """Sync a single appointment to Firebase Realtime Database"""
    if not is_configured() or not appointment_data:
        return False
    try:
        appt_id = appointment_data.get("id") or appointment_data.get("appointment_id")
        if not appt_id:
            appt_id = f"appt_{int(requests.utils.time.time())}"
            
        endpoint = _make_url(f"carebridge/appointments/{appt_id}")
        resp = requests.put(endpoint, json=appointment_data, timeout=3)
        return resp.status_code == 200
    except Exception as err:
        logger.warning(f"Failed to sync appointment to Firebase Realtime DB: {err}")
        return False

def delete_appointment_from_firebase(appointment_id: int | str) -> bool:
    """Delete an appointment from Firebase Realtime Database upon cancellation"""
    if not is_configured():
        return False
    try:
        endpoint = _make_url(f"carebridge/appointments/{appointment_id}")
        resp = requests.delete(endpoint, timeout=3)
        return resp.status_code == 200
    except Exception as err:
        logger.warning(f"Failed to delete appointment from Firebase: {err}")
        return False

def sync_queue_to_firebase(queue_data: Dict[str, Any]) -> bool:
    """Update live OPD Token Queue status in Firebase"""
    if not is_configured():
        return False
    try:
        endpoint = _make_url("carebridge/queue")
        resp = requests.patch(endpoint, json=queue_data, timeout=3)
        return resp.status_code == 200
    except Exception as err:
        logger.warning(f"Failed to sync queue to Firebase: {err}")
        return False

def sync_emergency_sos_to_firebase(sos_data: Dict[str, Any]) -> bool:
    """Post an emergency SOS dispatch alert to Firebase Realtime Database"""
    if not is_configured():
        return False
    try:
        endpoint = _make_url("carebridge/emergency_sos")
        resp = requests.post(endpoint, json=sos_data, timeout=3)
        return resp.status_code == 200
    except Exception as err:
        logger.warning(f"Failed to push emergency SOS to Firebase: {err}")
        return False

def seed_full_state_to_firebase(appointments: List[Dict[str, Any]], queue: Optional[Dict[str, Any]] = None) -> bool:
    """Seed all baseline hospital data to Firebase Realtime Database"""
    if not is_configured():
        return False
    try:
        appts_map = {}
        for appt in appointments:
            if isinstance(appt, dict) and "id" in appt:
                appts_map[str(appt["id"])] = appt

        default_queue = queue or {
            "serving_token": "GM-022",
            "upcoming_tokens": ["GM-023", "GM-024", "GM-025", "GM-026"],
            "current_room": "Room OPD-03",
            "dept": "General Medicine",
            "active_doctor": "Dr. Priya",
            "estimated_wait_min": 10,
            "patients_waiting": 4
        }

        payload = {
            "appointments": appts_map,
            "queue": default_queue,
            "hospital_name": "CareBridge AI Metro Network"
        }

        endpoint = _make_url("carebridge")
        resp = requests.put(endpoint, json=payload, timeout=5)
        return resp.status_code == 200
    except Exception as err:
        logger.warning(f"Failed to seed full state to Firebase: {err}")
        return False
