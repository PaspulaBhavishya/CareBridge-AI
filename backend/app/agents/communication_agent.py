"""
CareBridge AI 2.0 — Patient Communication Agent
Understands conversational requests in English, Telugu, and Teluglish,
extracts compound constraints, and crafts authentic bilingual responses.
"""
import re
from typing import Dict, Any, Optional

TELUGU_KEYWORDS = [
    "naaku", "kavali", "repu", "undali", "undakudadhu", "teliyali", "cheyyali",
    "chestundi", "ivvadu", "ekkuva", "takkuva", "samayam", "ela", "evaru", "lopala",
    "నాకు", "కావాలి", "రేపు", "ఉండాలి", "ఉండకూడదు", "తెలియాలి", "చేయాలి", "వైద్యులు", "నమస్కారం"
]

class CommunicationAgent:
    def __init__(self):
        self.name = "Patient Communication Agent"

    def detect_language(self, text: str, user_selected: str = "auto") -> str:
        if user_selected in ["en", "te"]:
            return user_selected
        t_lower = text.lower()
        if any(kw in t_lower for kw in TELUGU_KEYWORDS):
            return "te"
        return "en"

    def parse_intent_and_constraints(self, message: str) -> Dict[str, Any]:
        """
        Extracts user intent and fine-grained constraints from query text:
        - Department / Specialty (Cardiology, General Medicine, Dermatology, Orthopedics, Pediatrics)
        - Date target (Tomorrow vs specific date)
        - Time of day ('morning' vs 'afternoon')
        - Doctor gender preference ('female' vs 'male')
        - Language preference ('Telugu' vs 'English')
        - Low wait requirement (boolean)
        - Budget / max fee limit (e.g. 500)
        """
        m_lower = message.lower().strip()

        # Intent detection in hierarchical priority
        intent = "GENERAL_GREETING"

        # 1. Life Safety Emergency Triage (Highest Priority)
        if any(w in m_lower for w in [
            "chest pain", "heart attack", "bleeding", "accident", "unconscious", 
            "bleeding heavily", "heavy bleeding", "radiating shoulder", "severe chest pain", "injury",
            "ambulance", "collapsed", "గుండె నొప్పి", "రక్తం", "ప్రమాదం", "శ్వాస", "స్పృహ", "గాయం",
            "gunde noppi", "swasa", "chaathi noppi"
        ]):
            intent = "EMERGENCY_TRIAGE"

        # 2. DPDP / HIPAA Security & Unauthorized Record Access Guardrail
        elif any(w in m_lower for w in [
            "other patient", "another patient", "someone else", "medical records of", "records of another",
            "members data", "registered members", "all patients list", "patients list", "all users",
            "registered users", "members list", "confidential hospital database", "without authorization",
            "vere patient", "వేరే పేషెంట్", "రికార్డులు", "database records", "సభ్యుల డేటా", "నమోదైన",
            "dump patient database", "ignore previous instructions", "admin permissions",
            "private salary", "credentials", "bypass guardrail", "dump database"
        ]) and not any(p in m_lower for p in ["my record", "my appointment", "my pass", "నా అపాయింట్‌మెంట్"]):
            intent = "SECURITY_GUARDRAIL_BLOCKED"

        # 3. Staff Schedule Conflict Audit (Must evaluate before appointment keywords)
        elif any(w in m_lower for w in [
            "conflict", "audit doctor", "audit schedule", "overlapping", "overload",
            "schedule conflict", "doctor conflict", "overlaps", "overlap", "shift overlap",
            "contention", "collision audit", "room contention", "కాన్ఫ్లిక్ట్", "ఆడిట్"
        ]):
            intent = "STAFF_SCHEDULE_CONFLICT_AUDIT"

        # 4. Hospital Digital Twin Network Status & Bed Occupancy
        elif any(w in m_lower for w in [
            "bed occupancy", "hospital status", "network hospital", "network status",
            "how crowded", "icu occupancy", "occupancy rate", "బెడ్స్", "హాస్పిటల్ స్టేటస్"
        ]):
            intent = "HOSPITAL_NETWORK_STATUS"

        # 5. Doctor Delay & Autonomous Recovery Mode (Killer Feature)
        elif any(w in m_lower for w in [
            "delay", "delayed", "late", "ఆలస్యం", "dr priya delayed", "doctor delayed",
            "simulate doctor delay", "recovery mode"
        ]):
            intent = "DOCTOR_DELAY_RECOVERY"

        # 6. Appointment Reschedule Request
        elif any(w in m_lower for w in [
            "reschedule", "postpone", "shift my booking", "change my doctor appointment",
            "change my appointment", "change time", "vere time", "వేరే సమయం", "మార్చండి", "marchandi"
        ]):
            intent = "APPOINTMENT_RESCHEDULE_REQUEST"

        # 7. Appointment Cancel Request
        elif (
            any(w in m_lower for w in ["cancel my", "cancel appointment", "cancel consultation", "raddu", "రద్దు", "oddu"]) or 
            m_lower.startswith("cancel")
        ) and not any(p in m_lower for p in ["policy", "పాలసీ", "నిబంధనలు", "rules"]):
            intent = "APPOINTMENT_CANCEL_REQUEST"

        # 8. Medical Diagnosis Refusal Guardrail
        elif any(w in m_lower for w in [
            "naaku diabetes unda", "sugar unda", "cancer unda", "bp unda",
            "do i have diabetes", "do i have cancer", "do i have high bp", "do i have hypertension",
            "what illness do i have", "what disease do i have", "diagnose me", "diagnose my", "diagnose", "diagnosis",
            "am i sick", "rogo unda", "naaku em rogam", "em samasya undi", "can you diagnose",
            "diagnose my symptoms", "రోగాన్ని నిర్ధారించండి", "డయాగ్నోసిస్", "రోగ నిర్ధారణ"
        ]):
            intent = "MEDICAL_DIAGNOSIS_REFUSAL"

        # 9. Hospital Policy & FAQ RAG
        elif any(w in m_lower for w in [
            "cancellation policy", "refund", "visiting hours", "visiting", "fasting", "fast before",
            "blood test", "lipid", "insurance", "tpa", "timing", "policy", "cashless", "icu visiting",
            "నిబంధనలు", "రీఫండ్", "సమయాలు", "పాలసీ", "విజిటింగ్ అవర్స్"
        ]) or ("visiting" in m_lower and "hours" in m_lower):
            intent = "HOSPITAL_POLICY_FAQ"

        # 9. Queue & Token Status
        elif any(w in m_lower for w in ["token", "టోకెన్"]) or (
            any(w in m_lower for w in ["queue", "wait time", "క్యూ", "ఎంత సమయం"]) and not any(b in m_lower for b in ["book", "appointment", "apointment", "appoinment", "slot"])
        ):
            intent = "QUEUE_TOKEN_STATUS"

        # 10. Core Appointment Recommendation (Routing, Doctor search, Low wait)
        elif any(w in m_lower for w in [
            "appointment", "apointment", "appoinment", "book", "slot", "doctor", "docter",
            "specialist", "see a", "consult", "kavali", "కావాలి", "అపాయింట్‌మెంట్", "consultation", 
            "consaltation", "chupinchali", "physician", "cardiologist", "dermatologist", "orthopedist",
            "joint pain", "stomach pain", "knee pain", "rash", "fever", "cardio", "skin specialist",
            "pillala", "doctor appointment"
        ]):
            intent = "APPOINTMENT_RECOMMENDATION"

        # 11. General Greetings & Conversational
        elif any(w in m_lower for w in ["hello", "hi", "hey", "namaskaram", "namaste", "నమస్కారం", "assist me", "help me"]):
            intent = "GENERAL_GREETING"

        # Department extraction
        dept = "General Medicine"
        dept_detected = False
        if any(w in m_lower for w in ["cardio", "cardology", "heart", "గుండె", "కార్డియాలజీ", "cardiologist"]):
            dept = "Cardiology"
            dept_detected = True
        elif any(w in m_lower for w in ["skin", "derma", "rash", "చర్మ", "దద్దుర్లు", "dermatologist"]):
            dept = "Dermatology"
            dept_detected = True
        elif any(w in m_lower for w in ["bone", "joint", "knee", "ortho", "orthopedics", "ఎముకల", "కీళ్ల", "మోకాళ్ళ", "orthopedist"]):
            dept = "Orthopedics"
            dept_detected = True
        elif any(w in m_lower for w in ["child", "pedia", "kid", "baby", "పిల్లల", "pillala"]):
            dept = "Pediatrics"
            dept_detected = True
        elif any(w in m_lower for w in ["general medicine", "physician", "fever", "cough", "cold", "stomach", "జనరల్ మెడిసిన్", "సాధారణ వైద్యం", "జ్వరం", "medecine"]):
            dept = "General Medicine"
            dept_detected = True

        # Constraints extraction
        constraints = {}

        # Location extraction
        location = "Central Hospital Network"
        if any(w in m_lower for w in ["guntur", "గుంటూరు"]):
            location = "Guntur"
        elif any(w in m_lower for w in ["vijayawada", "విజయవాడ"]):
            location = "Vijayawada"
        elif any(w in m_lower for w in ["hyderabad", "హైదరాబాద్"]):
            location = "Hyderabad"
        constraints["location"] = location

        # Time of day
        if any(w in m_lower for w in ["morning", "udayam", "ఉదయం", "am"]):
            constraints["time_of_day"] = "morning"
        elif any(w in m_lower for w in ["afternoon", "evening", "madhyahnam", "సాయంత్రం", "pm"]):
            constraints["time_of_day"] = "afternoon"

        # Doctor Gender
        if any(w in m_lower for w in ["female", "lady", "woman", "మహిళ"]):
            constraints["doctor_gender"] = "female"
        elif any(w in m_lower for w in ["male", "gent"]):
            constraints["doctor_gender"] = "male"

        # Language
        if any(w in m_lower for w in ["telugu", "తెలుగు", "matlade"]):
            constraints["language"] = "telugu"
            constraints["telugu_speaking"] = True

        # Low wait
        if any(w in m_lower for w in ["low wait", "less wait", "takkuva", "తక్కువ", "fast", "waiting time", "minimum waiting", "least wait"]):
            constraints["lowest_wait"] = True

        # Fee limit
        fee_match = re.search(r'(?:under|below|lopala|రూపాయలు|₹|rs\.?)\s*(\d{3,4})|(\d{3,4})\s*(?:lopala|under|below)', m_lower)
        if fee_match:
            val = fee_match.group(1) or fee_match.group(2)
            if val:
                constraints["max_fee"] = int(val)

        # Missing Information Check (for Item 11)
        # If user requests appointment without department, symptoms, date, or location
        is_generic_booking = intent == "APPOINTMENT_RECOMMENDATION" and not dept_detected and not any(
            s in m_lower for s in ["pain", "fever", "cough", "sick", "problem", "noppi", "nappi", "vomiting", "rash", "heart", "bone", "skin", "child"]
        )
        missing_fields = []
        if is_generic_booking:
            missing_fields.append("department")
            if not any(d in m_lower for d in ["repu", "today", "tomorrow", "morning", "afternoon", "ఈ రోజు", "రేపు"]):
                missing_fields.append("preferred_date")
            if location == "Central Hospital Network":
                missing_fields.append("location")

        # Language Style Classification (for Item 12)
        has_english_words = any(w in m_lower for w in ["need", "appointment", "doctor", "cardiologist", "cardiology", "hospital", "waiting", "time", "please", "book", "available"])
        has_telugu_script = any('\u0c00' <= char <= '\u0c7f' for char in message)
        has_teluglish_words = any(w in m_lower for w in ["naaku", "kavali", "repu", "undali", "daggara", "takkuva", "lo", "ivvandi", "cheppandi", "evaru"])

        lang_style = "English"
        if has_telugu_script:
            lang_style = "Telugu"
        elif has_teluglish_words and has_english_words:
            lang_style = "Telugu-English Mixed"
        elif has_teluglish_words:
            lang_style = "Telugu (Transliterated)"

        return {
            "intent": intent,
            "department": dept,
            "constraints": constraints,
            "raw_query": message,
            "location": location,
            "missing_fields": missing_fields,
            "is_missing_info": len(missing_fields) > 0,
            "language_style": lang_style
        }

    def format_bilingual_response(
        self,
        en_text: str,
        te_text: str,
        language: str = "en"
    ) -> Dict[str, str]:
        if language == "te":
            return {
                "text": te_text,
                "english_translation": en_text,
                "language": "te"
            }
        elif language == "teluglish":
            # Code-switched Telugu in English script + English
            return {
                "text": f"{en_text}\n\n*(Telugu: {te_text})*",
                "english_translation": en_text,
                "language": "teluglish"
            }
        return {
            "text": en_text,
            "english_translation": en_text,
            "language": "en"
        }
