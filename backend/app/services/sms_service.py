import os
import re
import logging
import requests
from typing import Tuple, Dict, Any

logger = logging.getLogger("carebridge.sms")

def extract_phone_formats(phone: str) -> Tuple[str, str]:
    """
    Extracts 10-digit clean number and international E.164 formatted number.
    Defaulting to Indian country code (+91) if not explicitly prefixed.
    """
    digits = re.sub(r"\D", "", phone or "")
    if len(digits) >= 10:
        ten_digits = digits[-10:]
    else:
        ten_digits = digits.zfill(10)
    
    if phone.strip().startswith("+"):
        e164 = f"+{digits}"
    else:
        e164 = f"+91{ten_digits}"
        
    return ten_digits, e164

def dispatch_sms_otp(phone: str, otp_code: str) -> Dict[str, Any]:
    """
    Dispatches a 6-digit OTP verification code to the target mobile phone number.
    Supports Fast2SMS (India), Twilio (Global), MSG91, and fallback development logger.
    """
    ten_digits, e164 = extract_phone_formats(phone)
    sms_message = (
        f"CareBridge AI Security: Your OTP verification code is {otp_code}. "
        f"Valid for 5 minutes. Do not share this OTP with anyone."
    )

    # 1. Option: Fast2SMS (India - https://www.fast2sms.com)
    fast2sms_api_key = os.getenv("FAST2SMS_API_KEY", "").strip()
    if fast2sms_api_key:
        headers = {
            "authorization": fast2sms_api_key,
            "Content-Type": "application/json"
        }
        url = "https://www.fast2sms.com/dev/bulkV2"
        
        # Attempt 1: Fast2SMS Dedicated OTP Route
        try:
            payload_otp = {
                "route": "otp",
                "variables_values": otp_code,
                "numbers": ten_digits
            }
            res_otp = requests.post(url, json=payload_otp, headers=headers, timeout=10)
            data_otp = res_otp.json()
            if data_otp.get("return") is True:
                logger.info(f"[Fast2SMS OTP Route] Successfully sent OTP to {ten_digits}")
                return {
                    "sent": True,
                    "provider": "fast2sms",
                    "status": "DELIVERED",
                    "details": f"Dispatched via Fast2SMS (OTP Route) to {ten_digits}"
                }
            else:
                logger.warning(f"[Fast2SMS OTP Route Notice] {data_otp.get('message') or data_otp}")
        except Exception as e:
            logger.error(f"[Fast2SMS OTP Route] Exception: {e}")

        # Attempt 2: Fast2SMS Quick Transactional Route ('q')
        try:
            payload_q = {
                "route": "q",
                "message": sms_message,
                "language": "english",
                "flash": 0,
                "numbers": ten_digits
            }
            res_q = requests.post(url, json=payload_q, headers=headers, timeout=10)
            data_q = res_q.json()
            if data_q.get("return") is True:
                logger.info(f"[Fast2SMS Quick Route] Successfully sent SMS to {ten_digits}")
                return {
                    "sent": True,
                    "provider": "fast2sms",
                    "status": "DELIVERED",
                    "details": f"Dispatched via Fast2SMS (Quick Route) to {ten_digits}"
                }
            else:
                logger.warning(f"[Fast2SMS Quick Route Notice] {data_q.get('message') or data_q}")
        except Exception as e:
            logger.error(f"[Fast2SMS Quick Route] Exception: {e}")

    # 2. Option: Twilio (Global - https://www.twilio.com)
    twilio_sid = os.getenv("TWILIO_ACCOUNT_SID", "").strip()
    twilio_token = os.getenv("TWILIO_AUTH_TOKEN", "").strip()
    twilio_from = os.getenv("TWILIO_PHONE_NUMBER", "").strip()
    if twilio_sid and twilio_token and twilio_from:
        try:
            logger.info(f"Attempting Twilio SMS dispatch to {e164}...")
            twilio_url = f"https://api.twilio.com/2010-04-01/Accounts/{twilio_sid}/Messages.json"
            payload = {
                "From": twilio_from,
                "To": e164,
                "Body": sms_message
            }
            res = requests.post(twilio_url, data=payload, auth=(twilio_sid, twilio_token), timeout=10)
            if res.status_code in [200, 201]:
                logger.info(f"[Twilio] Successfully dispatched SMS to {e164}")
                return {
                    "sent": True,
                    "provider": "twilio",
                    "status": "DELIVERED",
                    "details": f"Dispatched via Twilio to {e164}"
                }
            else:
                logger.warning(f"[Twilio] Failed with status {res.status_code}: {res.text}")
        except Exception as e:
            logger.error(f"[Twilio] Exception while sending SMS: {e}")

    # 3. Development / Local Environment Dispatch Notice
    # Prominently print in backend terminal so developer/tester can see the OTP
    # without exposing it on the client web browser
    banner = "=" * 76
    print(f"\n{banner}")
    print(" [CAREBRIDGE AI SECURE SMS GATEWAY]")
    print(f"  Mobile Recipient : {phone} (Normalized: {e164} / {ten_digits})")
    print(f"  OTP Verification : {otp_code}")
    print(f"  Status           : DISPATCHED (Valid for 5 minutes)")
    print("  Note: To deliver real carrier SMS to your mobile phone, set")
    print("        FAST2SMS_API_KEY in backend/.env (for Indian mobile numbers) or")
    print("        TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN in backend/.env")
    print(f"{banner}\n", flush=True)

    return {
        "sent": False,
        "provider": "console_local",
        "status": "DISPATCHED_TO_CONSOLE",
        "details": f"Logged to secure server terminal for {e164}"
    }
