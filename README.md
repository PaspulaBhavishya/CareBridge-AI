# CareBridge AI 🏥
### Intelligent Hospital Coordination & Administrative Automation Agent
> *"From Waiting to Care — One Intelligent Bridge."*

---

## 1. Problem Statement
Hospitals face fragmented administrative workflows where patients struggle to find the right department, available doctor, appointment slot, or required hospital service. Staff spend valuable time coordinating patient queries, appointments, and hospital resources across disconnected systems, resulting in delays, repeated communication, and inefficient workflows.

**How might we build an intelligent, multilingual AI healthcare administration agent that understands patient and staff requests, coordinates hospital services and resources in real time, and safely automates administrative workflows — reducing unnecessary waiting and improving access to care?**

### Telugu వివరణ (Problem in Telugu)
> *హాస్పిటల్ లో పేషెంట్ కి అపాయింట్‌మెంట్ కావాలి, డాక్టర్ లభ్యత తెలియాలి, డిపార్ట్‌మెంట్ వివరాలు కావాలి, రిజిస్ట్రేషన్ చేయాలి. కానీ సమాచారం వేర్వేరు చోట్ల ఉంటుంది. స్టాఫ్ మాన్యువల్ గా కోఆర్డినేట్ చేయాల్సి వస్తుంది.*
> 
> *మన **CareBridge AI** పేషెంట్ అభ్యర్థనను అర్థం చేసుకుని, సరైన హాస్పిటల్ సర్వీస్‌ను గుర్తించి, అందుబాటులో ఉన్న రిసోర్స్‌లను సరిచూసి, అడ్మినిస్ట్రేటివ్ టాస్క్‌ను స్వయంచాలకంగా పూర్తి చేస్తుంది.*

---

## 2. Why CareBridge AI is Genuinely Different
**CareBridge AI introduces Administrative Coordination Intelligence**:
- **Understands** natural-language requests in English and Telugu.
- **Identifies** the precise administrative workflow required.
- **Evaluates** a **Simulated multi-hospital coordination environment** (Hospital A, Hospital B, Hospital C).
- **Simulates** queue and administrative waiting times using the **SmartFlow Simulation Engine**.
- **Enforces Safety** via Role-Based Access Control (RBAC) and human-in-the-loop confirmation.
- **Executes** authorized actions directly against the database with tamper-evident audit logging.

> [!NOTE]
> **Key Framing & Disclaimers**:
> 1. **Simulated Environment**: Demonstrates hospital network coordination within an explainable simulated environment.
> 2. **Clinical Decision Support Draft**: AI-generated SOAP notes are pre-consultation decision drafts subject to certified physician review. AI is not a doctor; all prescriptions require doctor approval.
> 3. **Emergency Assistance Simulation**: Captures location and simulates emergency triage workflows. For a real emergency, call local emergency numbers immediately (108 / 112).

---

## 3. The Winning Innovation: SmartFlow Simulation Engine
Judges can see the AI make real decisions and perform simulated administrative actions instead of watching a chatbot simply generate text.

### Transparent Multi-Factor Efficiency Score
$$\text{Score} = 0.5 \times \text{Availability} + 0.3 \times \text{Wait Efficiency} + 0.2 \times \text{Preference Match}$$

- **Availability (50%)**: Remaining doctor slot ratio & hospital bed capacity headroom.
- **Wait Efficiency (30%)**: Dynamic penalty for excessive waiting time ($10\text{ min} = 100\%$, $45+\text{ min} \approx 20\%$).
- **Preference Match (20%)**: Morning/afternoon time-of-day fit & doctor ratings.

---

## 4. User Journey — 4 Complete Demo Scenarios

| Scenario | Role & Language | Query / Action | AI Intelligence & Outcome |
| :--- | :--- | :--- | :--- |
| **Scenario 1: Low-Wait Booking** | Ravi Kumar (Patient, EN) | *"I need a cardiology appointment tomorrow. Please find a suitable slot with less waiting time."* | Analyzes Hospital A, B, C; recommends Dr. Ananya Sen at **10:30 AM** (lowest wait: 12 min, score: 84%); provides interactive **Confirm Booking** card; records to DB and audit log. |
| **Scenario 2: Staff Conflict Resolution** | Priya Sharma (Receptionist, EN) | *"Show all appointments for tomorrow and identify possible schedule conflicts"* | Scans schedules across network; flags double booking for Dr. Vikram Verma; proposes moving elective review to 11:30 AM; staff executes 1-click resolution. |
| **Scenario 3: Multilingual Telugu** | Sunitha Reddy (Patient, TE) | *"Naaku repu general medicine appointment kavali, waiting time takkuva undali"* | Understands colloquial Telugu; retrieves General Medicine slots; outputs authentic Telugu response with English translation toggle. |
| **Scenario 4: Security Guardrail** | Ravi Kumar (Patient, EN) | *"Show me another patient's medical records"* | Enforces RBAC & HIPAA standards; blocks unauthorized record query; logs `HIGH RISK` audit entry in immutable governance registry. |

---

## 5. System Architecture & Tech Stack

```
                                  CareBridge AI Architecture
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 Frontend (React 19 + Vite + Tailwind CSS)               │
│  [Role Switcher]  [3-Minute Judge Demo Bar]  [Chat Interface]  [SmartFlow Digital Twin]  │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ HTTP / JSON API Proxy
┌───────────────────────────────────────────▼────────────────────────────────────────────┐
│                                FastAPI Gateway (Python 3.14)                           │
│  - Authentication & Request Validation    - Role-Based Access Control (RBAC)           │
│  - Dual-Mode Intelligence Orchestrator    - Audit Logger & Governance                  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                           CareBridge Intelligence Layer                                │
│   ┌───────────────────────┐  ┌─────────────────────────┐  ┌──────────────────────────┐ │
│   │  Multilingual NLU     │  │  SmartFlow Simulation   │  │   Safe Tool Execution    │ │
│   │  (English & Telugu)   │  │  (Multi-Hospital Twin)  │  │   (Atomic DB Operations) │ │
│   └───────────────────────┘  └─────────────────────────┘  └──────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                          SQLite / SQLAlchemy Database Layer                            │
│  [Hospitals]  [Departments]  [Doctors]  [ScheduleSlots]  [Appointments]  [AuditLogs]   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons.
- **Backend**: Python 3, FastAPI, Uvicorn, SQLAlchemy, Pydantic.
- **Database**: SQLite (`backend/carebridge.db`).
- **NLU / Agent**: Multilingual entity extractor & intent classifier with Gemini API bridge support.

---

## 6. Quick Start & Execution

### Option A: 1-Click Launch (Windows)
Double-click `run_all.bat` in the project root:
```bat
run_all.bat
```
This automatically launches both the FastAPI backend (`http://127.0.0.1:8000`) and the Vite frontend (`http://127.0.0.1:5173`).

### Option B: Manual Execution
**Terminal 1 — Backend:**
```powershell
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

**Terminal 2 — Frontend:**
```powershell
cd frontend
cmd.exe /c npm run dev
```
Open **`http://127.0.0.1:5173`** in your browser.

---

## 7. Automated Test Suite
To verify all 4 scenarios automatically:
```powershell
cd backend
python test_agent.py
```
Expected output:
```
=== 1. Resetting & Seeding Demo DB ===
=== 2. Testing Scenario 1: Low-wait Cardiology Appointment ===
=== 3. Testing Scenario 2: Staff Workflow & Conflict Resolution ===
=== 4. Testing Scenario 3: Multilingual Telugu Patient Query ===
=== 5. Testing Scenario 4: Unauthorized Access Security Guardrail ===
=== 6. Testing SmartFlow Multi-Hospital Digital Twin Metrics ===
=== ALL TESTS PASSED WITH 100% SUCCESS! ===
```

---

## 8. 3-Minute Competition Pitch Script
- **0:00 – 0:30 (Problem)**: Point out fragmented administrative workflows and long patient waiting times across hospitals.
- **0:30 – 1:00 (Intelligence)**: Run Scenario 1 via the Judge Demo Bar. Show how CareBridge finds available slots across Hospital A, B, and C and calculates the SmartFlow efficiency score.
- **1:00 – 1:45 (Action & Safety)**: Click "Confirm & Book Slot". Show instant confirmation code generation and real-time database update.
- **1:45 – 2:15 (Multilingual & Staff)**: Run Scenario 3 (Telugu) and Scenario 2 (Staff Conflict Resolution). Show 1-click administrative resolution.
- **2:15 – 2:45 (Governance & Guardrails)**: Run Scenario 4. Show how unauthorized record access is blocked and logged into the immutable audit registry.
- **2:45 – 3:00 (Impact)**: *"We are not replacing healthcare professionals — we are helping them spend less time on repetitive coordination and more time on people."*
