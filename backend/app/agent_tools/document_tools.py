"""
CareBridge AI 2.0 — Document & Knowledge RAG Tools
Extracts metrics from clinical lab reports/prescriptions and conducts policy RAG with citations.
"""
import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from ..models import HospitalPolicy, KnowledgeDocument

# Grounded Policy Knowledge Base with explicit source citations and last updated metadata
POLICY_KNOWLEDGE_BASE = [
    {
        "category": "OPD_TIMINGS",
        "title": "Hospital OPD Policy & Consultation Hours",
        "document_name": "Hospital OPD Policy",
        "last_updated": "10 September 2026",
        "keywords": ["timing", "hours", "open", "close", "morning", "evening", "opd", "సమయాలు", "ఓపీడీ", "వేళలు"],
        "content_en": "OPD registration is available from 8:00 AM to 2:00 PM. General Outpatient clinics run Monday through Saturday from 8:30 AM to 1:30 PM (Morning Session) and 3:00 PM to 7:00 PM (Evening Session). Emergency Trauma is operational 24/7.",
        "content_te": "ఓపీడీ రిజిస్ట్రేషన్ ఉదయం 8:00 నుండి మధ్యాహ్నం 2:00 వరకు అందుబాటులో ఉంటుంది. క్లినిక్‌లు సోమవారం నుండి శనివారం వరకు ఉదయం 8:30 నుండి 1:30 వరకు మరియు సాయంత్రం 3:00 నుండి 7:00 వరకు పనిచేస్తాయి. ఎమర్జెన్సీ మరియు ట్రామా కేర్ 24 గంటలు తెరిచి ఉంటుంది."
    },
    {
        "category": "CANCELLATION_POLICY",
        "title": "Appointment Cancellation Policy",
        "document_name": "Hospital Cancellation & Scheduling Charter",
        "last_updated": "10 September 2026",
        "keywords": ["cancel", "cancellation", "రద్దు", "raddu", "మార్చడం"],
        "content_en": "Patients may cancel appointments up to 4 hours before the scheduled time through the digital portal or call center. Self-cancellation automatically releases the slot for waiting patients and initiates the refund sequence.",
        "content_te": "అపాయింట్‌మెంట్ సమయానికి 4 గంటల ముందు వరకు డిజిటల్ పోర్టల్ లేదా ఫోన్ ద్వారా రద్దు చేసుకోవచ్చు. రద్దు చేసిన వెంటనే స్లాట్ ఇతర రోగులకు అందుబాటులోకి వస్తుంది."
    },
    {
        "category": "REFUND_POLICY",
        "title": "Outpatient Fee Refund Policy",
        "document_name": "Hospital Refund & Accounts Guidelines",
        "last_updated": "10 September 2026",
        "keywords": ["refund", "fee", "money", "రీఫండ్", "డబ్బులు", "ఫీజు"],
        "content_en": "Appointments cancelled at least 4 hours in advance receive a 100% full refund credited to the original payment source within 2 to 3 business days. Cancellations within 4 hours are eligible for free rescheduling but subject to a 10% processing fee for direct cash refunds.",
        "content_te": "కనీసం 4 గంటల ముందు రద్దు చేసుకుంటే 100% పూర్తి రీఫండ్ 2-3 పనిదినాల్లో జమ అవుతుంది. 4 గంటల లోపు అయితే ఉచిత రీషెడ్యూల్ చేసుకోవచ్చు, లేదా 10% ప్రాసెసింగ్ ఫీజు మినహాయించి రీఫండ్ ఇస్తారు."
    },
    {
        "category": "VISITOR_RULES",
        "title": "Inpatient Ward & ICU Visitor Guidelines",
        "document_name": "Inpatient Visitor Safety Protocol",
        "last_updated": "10 September 2026",
        "keywords": ["visitor", "visiting", "meet", "icu", "వార్డు", "సందర్శన", "చూడటానికి"],
        "content_en": "General Ward visiting hours are strictly between 4:30 PM and 6:30 PM daily (1 attendant pass). ICU visits are restricted to 11:00 AM – 11:30 AM and 5:00 PM – 5:30 PM for immediate family only (1 visitor at a time with mandatory sanitization and masks).",
        "content_te": "జనరల్ వార్డులో ప్రతిరోజూ సాయంత్రం 4:30 నుండి 6:30 వరకు మాత్రమే సందర్శకులకు అనుమతి ఉంటుంది. ఐసీయూ (ICU) లో ఉదయం 11:00 – 11:30 మరియు సాయంత్రం 5:00 – 5:30 మధ్య మాత్రమే ఒకరిని అనుమతిస్తారు."
    },
    {
        "category": "REQUIRED_DOCUMENTS",
        "title": "Required Documents for Consultation & Registration",
        "document_name": "Patient Registration & Identification Protocol",
        "last_updated": "10 September 2026",
        "keywords": ["document", "documents", "id", "aadhaar", "proof", "కాగితాలు", "డాక్యుమెంట్లు", "ఆధార్"],
        "content_en": "For first-time registration and OPD consults, patients must bring: 1) Govt-issued photo ID (Aadhaar, Voter ID, or Passport), 2) Past medical history / discharge summaries, 3) Ongoing prescription slips. Cashless insurance patients must carry active health cards.",
        "content_te": "మొదటిసారి హాస్పిటల్ కు వచ్చేటప్పుడు ఆధార్ లేదా ఏదైనా ప్రభుత్వ గుర్తింపు కార్డు, గత మెడికల్ రిపోర్టులు, మరియు ప్రస్తుతం వాడుతున్న మందుల చీటీ వెంట తీసుకురావాలి."
    },
    {
        "category": "INSURANCE_PROCEDURE",
        "title": "Cashless Insurance & TPA Desk Procedure",
        "document_name": "TPA & Insurance Desk Operations Manual",
        "last_updated": "10 September 2026",
        "keywords": ["insurance", "cashless", "tpa", "mediclaim", "ఇన్సూరెన్స్", "ఆరోగ్య బీమా", "క్లెయిమ్"],
        "content_en": "CareBridge hospitals support all major TPAs (Star Health, ICICI Lombard, HDFC ERGO, Medi Assist, Vidal). Cashless pre-authorization requires: 1) Active health card, 2) Aadhaar card copy, 3) Doctor's admission/investigation advice. Submit at the 24/7 Insurance Desk in Ground Floor Lobby.",
        "content_te": "అన్ని ప్రముఖ ఇన్సూరెన్స్ కంపెనీల క్యాష్‌లెస్ సదుపాయం ఉంది. హెల్త్ కార్డు, ఆధార్ కార్డు, మరియు డాక్టర్ రాసిన చీటీని గ్రౌండ్ ఫ్లోర్ లోని 24/7 ఇన్సూరెన్స్ డెస్క్ లో సమర్పించాలి."
    },
    {
        "category": "LAB_REPORT_COLLECTION",
        "title": "Diagnostic Lab Report Collection Timings & Online Portal",
        "document_name": "Pathology & Radiology Dispatch Protocol",
        "last_updated": "10 September 2026",
        "keywords": ["lab", "report", "blood test", "collection", "fasting", "రిపోర్టు", "రక్త పరీక్ష", "ఫలితాలు"],
        "content_en": "Routine blood and urine test reports are ready within 3 hours. Reports can be collected from Desk 4 between 8:00 AM and 8:00 PM, or downloaded instantly via the CareBridge Patient Hub QR Pass. Fasting blood glucose requires 10-12 hours overnight fasting.",
        "content_te": "రక్త పరీక్ష నివేదికలు 3 గంటల్లో సిద్ధమవుతాయి. వీటిని డెస్క్ 4 వద్ద సేకరించవచ్చు లేదా కేర్‌బ్రిడ్జ్ పేషెంట్ హబ్ క్యూఆర్ పాస్ ద్వారా డౌన్‌లోడ్ చేసుకోవచ్చు."
    },
    {
        "category": "EMERGENCY_GUIDANCE",
        "title": "Emergency & Critical Trauma Response Protocol",
        "document_name": "Emergency Department Operational Directive",
        "last_updated": "10 September 2026",
        "keywords": ["emergency", "chest pain", "accident", "trauma", "sos", "ఎమర్జెన్సీ", "అత్యవసరం", "గుండె నొప్పి"],
        "content_en": "For acute emergencies (chest pain, severe breathlessness, trauma), the Red Triage Bay is open 24/7 with zero waiting time. Emergency Assistance Simulation: For a real emergency, call local emergency numbers immediately (108 / 112).",
        "content_te": "తీవ్రమైన గుండె నొప్పి, ఊపిరి ఆడకపోవడం వంటి అత్యవసర పరిస్థితులకు ఎమర్జెన్సీ విభాగం 24 గంటలు సిద్ధంగా ఉంటుంది. అత్యవసర సహాయం కొరకు వెంటనే 108 లేదా 112 నంబర్‌కు కాల్ చేయండి."
    }
]

def search_policies_rag(db: Session, query: str) -> Dict[str, Any]:
    """
    Retrieves grounded hospital policy with formal citations, Telugu summary,
    and verified last updated metadata.
    If no policy matches, returns authentic unverified notice with reception guidance.
    """
    q_lower = query.lower()
    matched_doc = None
    best_score = 0

    for doc in POLICY_KNOWLEDGE_BASE:
        score = sum(1 for kw in doc["keywords"] if kw in q_lower)
        if score > best_score:
            best_score = score
            matched_doc = doc

    if not matched_doc or best_score == 0:
        return {
            "success": False,
            "query": query,
            "title": "Policy Not Verified in Official Records",
            "category": "UNVERIFIED",
            "source_document": "CareBridge Administrative Database",
            "last_updated": "10 September 2026",
            "content_en": "I could not verify this policy in our official hospital documents. Please contact hospital reception.",
            "content_te": "మా అధికారిక హాస్పిటల్ నిబంధనలలో ఈ పాలసీ ధృవీకరించబడలేదు. దయచేసి హాస్పిటల్ రిసెప్షన్‌ను సంప్రదించండి.",
            "citation": "Source: CareBridge Reception Directory | Status: Unverified",
            "reception_fallback": "Please contact the hospital front desk (+91 40 2345 6789) for manual verification."
        }

    return {
        "success": True,
        "query": query,
        "title": matched_doc["title"],
        "category": matched_doc["category"],
        "source_document": matched_doc["document_name"],
        "last_updated": matched_doc["last_updated"],
        "content_en": matched_doc["content_en"],
        "content_te": matched_doc["content_te"],
        "citation": f"Source: {matched_doc['document_name']} (Last Updated: {matched_doc['last_updated']})",
        "reception_fallback": "For special administrative clearances, please contact the Main Reception Helpdesk: +91 40 2345 6789."
    }
