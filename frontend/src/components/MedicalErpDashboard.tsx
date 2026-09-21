import React, { useState } from 'react';
import { 
  Users, Clock, Calendar, AlertTriangle, 
  Pill, FlaskConical, Stethoscope, ChevronRight, ChevronLeft,
  Sparkles, Bot, Send, 
  Activity, ClipboardList, FolderHeart, HeartPulse,
  CreditCard, MessageSquare, CheckSquare, ShieldCheck
} from 'lucide-react';
import type { UserProfile, AppointmentRecord } from '../types';
import { getTranslation } from '../utils/translations';

interface MedicalErpDashboardProps {
  currentProfile: UserProfile;
  appointments: AppointmentRecord[];
  onNavigateToTab: (tab: string) => void;
  onSendMessage: (text: string) => void;
  onOpenPass?: (pass: any) => void;
  language?: string;
}

export const MedicalErpDashboard: React.FC<MedicalErpDashboardProps> = ({
  currentProfile,
  appointments: _appointments,
  onNavigateToTab,
  onSendMessage,
  onOpenPass: _onOpenPass,
  language = 'en'
}) => {
  const t = getTranslation(language);
  const isTe = (language || '').toLowerCase().startsWith('te') || (language || '').toLowerCase().includes('telugu');
  const [aiInput, setAiInput] = useState('');
  const [aiSummaryModal, setAiSummaryModal] = useState(false);
  const [summaryGenerating, setSummaryGenerating] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState<string | null>(null);

  // Selected date in calendar widget
  const [selectedDay, setSelectedDay] = useState<number>(20);

  const handleAiQuickSend = (prompt: string) => {
    onSendMessage(prompt);
    onNavigateToTab('chat');
  };

  const handleGenerateAiSummary = () => {
    setAiSummaryModal(true);
    setSummaryGenerating(true);
    setGeneratedSummary(null);
    setTimeout(() => {
      setSummaryGenerating(false);
      setGeneratedSummary(
        `${displayName}, your morning OPD at CareBridge Heart Center Guntur has 42 queued patients. SmartFlow has optimized waiting time to an average of 18 minutes. 3 patients require acute attention (Rakesh Patel - High BP / Diabetic). 18 prescriptions and 12 lab reports are pending review. Slot #101 at 10:30 AM is reserved for Telugu cardiologist consultation.`
      );
    }, 1200);
  };

  const role = currentProfile.role;

  // Format greeting name properly:
  const displayName = (role === 'patient' || role === 'receptionist')
    ? currentProfile.name.replace(/^Dr\.\s*/i, '')
    : (currentProfile.name.startsWith('Dr.') ? currentProfile.name : `Dr. ${currentProfile.name}`);

  const roleGreetingSubtitle = 
    role === 'patient'
      ? `${t.role_sub_patient} • ID: ${currentProfile.patient_uid || 'PAT-1000'}`
      : role === 'receptionist'
      ? t.role_sub_receptionist
      : role === 'admin'
      ? t.role_sub_admin
      : t.role_sub_doctor;

  const roleDescription = 
    role === 'patient'
      ? t.role_desc_patient
      : role === 'receptionist'
      ? t.role_desc_receptionist
      : role === 'admin'
      ? t.role_desc_admin
      : t.role_desc_doctor;

  // 5 KPI Metrics matching reference image, adapted per role
  const roleKpis = (() => {
    switch (role) {
      case 'patient':
        return [
          {
            title: t.kpi_upcoming_appointments,
            value: "1",
            change: isTe ? "రేపు ఉదయం 10:30" : "Tomorrow 10:30 AM",
            icon: Calendar,
            iconBg: "bg-blue-50 text-blue-600",
            pillBg: "text-blue-600",
            clickable: true,
            onClick: () => onNavigateToTab('chat')
          },
          {
            title: t.kpi_active_prescriptions,
            value: "2",
            change: t.kpi_all_refills_active,
            icon: Pill,
            iconBg: "bg-emerald-50 text-emerald-600",
            pillBg: "text-emerald-600",
            clickable: true,
            onClick: () => onNavigateToTab('prescriptions')
          },
          {
            title: t.kpi_lab_reports,
            value: "1",
            change: isTe ? "లిపిడ్ ప్రొఫైల్ (సాధారణం)" : "Lipid Profile (Normal)",
            icon: FlaskConical,
            iconBg: "bg-cyan-50 text-cyan-600",
            pillBg: "text-cyan-600",
            clickable: true,
            onClick: () => onNavigateToTab('scanner')
          },
          {
            title: t.kpi_live_tokens,
            value: "#C-24",
            change: isTe ? "3 రోగులు ముందున్నారు" : "3 patients ahead",
            icon: Clock,
            iconBg: "bg-amber-50 text-amber-600",
            pillBg: "text-amber-600",
            clickable: true,
            onClick: () => onNavigateToTab('token_tracker')
          },
          {
            title: isTe ? "అత్యవసర SOS" : "Emergency SOS",
            value: "24x7",
            change: isTe ? "108 తక్షణ సాయం →" : "108 Instant Triage →",
            icon: AlertTriangle,
            iconBg: "bg-rose-50 text-rose-600",
            pillBg: "text-rose-600",
            clickable: true,
            onClick: () => onNavigateToTab('chat')
          }
        ];
      case 'receptionist':
        return [
          {
            title: isTe ? "ఈరోజు చెక్-ఇన్‌లు" : "Today's Check-ins",
            value: "42",
            change: isTe ? "నిన్నటి కంటే +8%" : "+8% from yesterday",
            icon: Users,
            iconBg: "bg-blue-50 text-blue-600",
            pillBg: "text-blue-600",
            clickable: true,
            onClick: () => onNavigateToTab('patient_hub')
          },
          {
            title: isTe ? "జారీ చేసిన టోకెన్లు" : "Tokens Issued",
            value: "38",
            change: isTe ? "సగటు వేచి ఉండే సమయం ~14ని" : "Average wait ~14m",
            icon: Clock,
            iconBg: "bg-emerald-50 text-emerald-600",
            pillBg: "text-emerald-600",
            clickable: true,
            onClick: () => onNavigateToTab('token_tracker')
          },
          {
            title: t.kpi_doctors_duty,
            value: "8",
            change: isTe ? "అన్ని గదులు యాక్టివ్" : "All rooms active",
            icon: Stethoscope,
            iconBg: "bg-cyan-50 text-cyan-600",
            pillBg: "text-cyan-600",
            clickable: true,
            onClick: () => onNavigateToTab('staff')
          },
          {
            title: isTe ? "పెండింగ్ కౌంటర్ బిల్లులు" : "Pending Counter Bills",
            value: "4",
            change: isTe ? "కౌంటర్ వసూలు పెండింగ్" : "Counter collection pending",
            icon: CreditCard,
            iconBg: "bg-amber-50 text-amber-600",
            pillBg: "text-amber-600",
            clickable: true,
            onClick: () => onNavigateToTab('my_passes')
          },
          {
            title: isTe ? "క్యూ హెచ్చరికలు" : "Queue Alerts",
            value: "1",
            change: isTe ? "గది 102 - 12ని ఆలస్యం" : "Room 102 - 12m delay",
            icon: AlertTriangle,
            iconBg: "bg-rose-50 text-rose-600",
            pillBg: "text-rose-600",
            clickable: true,
            onClick: () => onNavigateToTab('token_tracker')
          }
        ];
      case 'admin':
        return [
          {
            title: isTe ? "ఈరోజు మొత్తం చేరికలు" : "Total Admissions Today",
            value: "56",
            change: isTe ? "నిన్నటి కంటే +14%" : "+14% from yesterday",
            icon: Users,
            iconBg: "bg-blue-50 text-blue-600",
            pillBg: "text-emerald-600"
          },
          {
            title: isTe ? "యాక్టివ్ వైద్యులు" : "Active Doctors",
            value: "14",
            change: isTe ? "3 నెట్‌వర్క్ కేంద్రాలలో" : "Across 3 network nodes",
            icon: Stethoscope,
            iconBg: "bg-emerald-50 text-emerald-600",
            pillBg: "text-emerald-600"
          },
          {
            title: t.kpi_network_occupancy,
            value: "84%",
            change: isTe ? "సాధారణ లోడ్ బ్యాలెన్స్" : "Normal load balanced",
            icon: ClipboardList,
            iconBg: "bg-cyan-50 text-cyan-600",
            pillBg: "text-cyan-600"
          },
          {
            title: isTe ? "రోజువారీ బిల్లింగ్ మొత్తం" : "Daily Billing Total",
            value: "₹1.42L",
            change: isTe ? "+9% రోజువారీ ఆదాయం" : "+9% daily revenue",
            icon: CreditCard,
            iconBg: "bg-amber-50 text-amber-600",
            pillBg: "text-amber-600"
          },
          {
            title: isTe ? "భద్రత & నియమావళి" : "Security & Guardrails",
            value: "100%",
            change: isTe ? "DPDP / HIPAA నియమానుసారం" : "DPDP / HIPAA Compliant",
            icon: AlertTriangle,
            iconBg: "bg-rose-50 text-rose-600",
            pillBg: "text-rose-600"
          }
        ];
      case 'doctor':
      default:
        return [
          {
            title: isTe ? "ఈరోజు మొత్తం రోగులు" : "Total Patients Today",
            value: "42",
            change: isTe ? "నిన్నటి కంటే +12%" : "+12% from yesterday",
            icon: Users,
            iconBg: "bg-blue-50 text-blue-600",
            pillBg: "text-emerald-600"
          },
          {
            title: isTe ? "పెండింగ్ ప్రిస్క్రిప్షన్లు" : "Pending Prescriptions",
            value: "18",
            change: isTe ? "నిన్నటి కంటే +8%" : "+8% from yesterday",
            icon: Pill,
            iconBg: "bg-amber-50 text-amber-600",
            pillBg: "text-amber-600"
          },
          {
            title: isTe ? "పరిశీలించాల్సిన ల్యాబ్ నివేదికలు" : "Lab Reports to Review",
            value: "26",
            change: isTe ? "నిన్నటి కంటే +15%" : "+15% from yesterday",
            icon: FlaskConical,
            iconBg: "bg-cyan-50 text-cyan-600",
            pillBg: "text-cyan-600"
          },
          {
            title: isTe ? "ఫాలో-అప్ రోగులు" : "Follow-up Patients",
            value: "31",
            change: isTe ? "నిన్నటి కంటే +10%" : "+10% from yesterday",
            icon: Calendar,
            iconBg: "bg-emerald-50 text-emerald-600",
            pillBg: "text-emerald-600"
          },
          {
            title: isTe ? "అత్యవసర హెచ్చరికలు" : "Emergency Alerts",
            value: "3",
            change: isTe ? "అన్ని హెచ్చరికలు చూడండి →" : "View all alerts →",
            icon: AlertTriangle,
            iconBg: "bg-rose-50 text-rose-600",
            pillBg: "text-rose-600",
            clickable: true,
            onClick: () => onNavigateToTab('chat')
          }
        ];
    }
  })();

  // Today's appointments list matching reference image
  const todayAppointments = [
    { time: "09:30 AM", patient: "Arjun Sharma", type: "Follow-up", status: "Confirmed" },
    { time: "10:15 AM", patient: "Neha Kapoor", type: "Consultation", status: "Confirmed" },
    { time: "11:00 AM", patient: "Vikram Singh", type: "ECG Review", status: "Pending" },
    { time: "12:00 PM", patient: "Pooja Verma", type: "Consultation", status: "Confirmed" },
    { time: "02:00 PM", patient: "Rakesh Patel", type: "Follow-up", status: "Pending" }
  ];

  // Quick links tiles tailored per role
  const roleQuickLinks = (() => {
    switch (role) {
      case 'patient':
        return [
          { title: t.ql_book_slot, icon: Calendar, color: "bg-blue-50 text-blue-600 hover:bg-blue-100/70", tab: "chat" },
          { title: t.ql_prescriptions, icon: Pill, color: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100/70", tab: "prescriptions" },
          { title: t.ql_lab_reports, icon: FlaskConical, color: "bg-purple-50 text-purple-600 hover:bg-purple-100/70", tab: "scanner" },
          { title: t.ql_digital_pass, icon: CreditCard, color: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100/70", tab: "my_passes" },
          { title: t.ql_live_queue, icon: Clock, color: "bg-cyan-50 text-cyan-600 hover:bg-cyan-100/70", tab: "token_tracker" },
          { title: isTe ? "డాక్టర్ సందేశాలు" : "Doctor Messages", icon: MessageSquare, color: "bg-sky-50 text-sky-600 hover:bg-sky-100/70", tab: "chat" }
        ];
      case 'receptionist':
        return [
          { title: t.patient_checkin, icon: Users, color: "bg-blue-50 text-blue-600 hover:bg-blue-100/70", tab: "patient_hub" },
          { title: t.book_appointment, icon: Calendar, color: "bg-cyan-50 text-cyan-600 hover:bg-cyan-100/70", tab: "chat" },
          { title: isTe ? "కౌంటర్ బిల్లింగ్" : "Counter Billing", icon: CreditCard, color: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100/70", tab: "my_passes" },
          { title: t.token_queue_tv, icon: Clock, color: "bg-amber-50 text-amber-600 hover:bg-amber-100/70", tab: "token_tracker" },
          { title: t.doctor_rosters, icon: CheckSquare, color: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100/70", tab: "staff" },
          { title: isTe ? "ఫ్రంట్ డెస్క్ చాట్" : "Front Desk Chat", icon: MessageSquare, color: "bg-sky-50 text-sky-600 hover:bg-sky-100/70", tab: "chat" }
        ];
      case 'admin':
        return [
          { title: isTe ? "రోగులందరూ" : "All Patients", icon: Users, color: "bg-blue-50 text-blue-600 hover:bg-blue-100/70", tab: "patient_hub" },
          { title: t.appointments, icon: Calendar, color: "bg-cyan-50 text-cyan-600 hover:bg-cyan-100/70", tab: "chat" },
          { title: isTe ? "సిబ్బంది వివాదాలు" : "Staff Conflicts", icon: CheckSquare, color: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100/70", tab: "staff" },
          { title: isTe ? "డిజిటల్ ట్విన్" : "Digital Twin", icon: ClipboardList, color: "bg-purple-50 text-purple-600 hover:bg-purple-100/70", tab: "smartflow" },
          { title: isTe ? "బిల్లింగ్ & ఆదాయం" : "Billing & Revenue", icon: CreditCard, color: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100/70", tab: "my_passes" },
          { title: isTe ? "క్యూ & టెలిమెట్రీ" : "Queue & Telemetry", icon: Clock, color: "bg-amber-50 text-amber-600 hover:bg-amber-100/70", tab: "token_tracker" }
        ];
      case 'doctor':
      default:
        return [
          { title: isTe ? "రోగి రికార్డులు" : "Patient Records", icon: Users, color: "bg-blue-50 text-blue-600 hover:bg-blue-100/70", tab: "patient_hub" },
          { title: t.appointments, icon: Calendar, color: "bg-cyan-50 text-cyan-600 hover:bg-cyan-100/70", tab: "chat" },
          { title: t.prescriptions, icon: Pill, color: "bg-sky-50 text-sky-600 hover:bg-sky-100/70", tab: "doctor_dashboard" },
          { title: t.lab_reports, icon: FlaskConical, color: "bg-purple-50 text-purple-600 hover:bg-purple-100/70", tab: "scanner" },
          { title: t.treatment_plans, icon: ClipboardList, color: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100/70", tab: "smartflow" },
          { title: t.medical_records, icon: FolderHeart, color: "bg-violet-50 text-violet-600 hover:bg-violet-100/70", tab: "my_passes" }
        ];
    }
  })();

  // Upcoming consultations
  const upcomingConsultations = [
    { time: "01:00 PM", patient: "Ananya Joshi", reason: "Follow-up", avatar: "AJ" },
    { time: "03:00 PM", patient: "Mohit Bansal", reason: "Consultation", avatar: "MB" },
    { time: "04:00 PM", patient: "Priya Nair", reason: "ECG Review", avatar: "PN" }
  ];

  // Recent Patient Notes
  const recentNotes = [
    { patient: "Arjun Sharma", note: "Follow-up visit - BP stable, medication adjusted.", time: "20 May 2026 09:20 AM", avatar: "AS" },
    { patient: "Neha Kapoor", note: "Complaints of chest discomfort. ECG normal.", time: "20 May 2026 10:10 AM", avatar: "NK" },
    { patient: "Vikram Singh", note: "Reviewed lab reports. Cholesterol levels high.", time: "20 May 2026 10:45 AM", avatar: "VS" }
  ];

  // AI Patient Risk Alerts
  const riskAlerts = [
    { level: isTe ? "అధిక ప్రమాదం" : "High Risk", patient: "Rakesh Patel", details: isTe ? "అధిక బీపీ • మధుమేహం" : "High BP • Diabetic", color: "bg-rose-50 border-rose-200 text-rose-700", badge: "bg-rose-500 text-white" },
    { level: isTe ? "మధ్యస్థ ప్రమాదం" : "Medium Risk", patient: "Savitri Devi", details: isTe ? "వయసు 68 • గుండె సమస్యల చరిత్ర" : "Age 68 • Cardiac History", color: "bg-amber-50 border-amber-200 text-amber-800", badge: "bg-amber-500 text-white" },
    { level: isTe ? "మధ్యస్థ ప్రమాదం" : "Medium Risk", patient: "Mohit Bansal", details: isTe ? "అధిక కొలెస్ట్రాల్" : "High Cholesterol", color: "bg-amber-50 border-amber-200 text-amber-800", badge: "bg-amber-500 text-white" }
  ];

  // Smart Reminders checklist
  const smartReminders = [
    { text: isTe ? "ఈరోజు 5 ఫాలో-అప్‌లు ఉన్నాయి" : "5 Follow-ups due today", action: isTe ? "చూడండి" : "View", tab: "patient_hub" },
    { text: isTe ? "12 ల్యాబ్ నివేదికలు పెండింగ్‌లో ఉన్నాయి" : "12 Lab reports pending review", action: isTe ? "సమీక్షించండి" : "Review", tab: "scanner" },
    { text: isTe ? "18 ప్రిస్క్రిప్షన్లు పెండింగ్‌లో ఉన్నాయి" : "18 Prescriptions pending", action: isTe ? "సమీక్షించండి" : "Review", tab: "doctor_dashboard" },
    { text: isTe ? "3 బీమా ఆమోదాలు పెండింగ్‌లో ఉన్నాయి" : "3 Insurance approvals pending", action: isTe ? "చూడండి" : "View", tab: "my_passes" },
    { text: isTe ? "2 అపాయింట్‌మెంట్లు నిర్ధారణ కావాలి" : "2 Appointments need confirmation", action: isTe ? "ధృవీకరించండి" : "Confirm", tab: "staff" }
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-fade-in text-slate-800">
      {/* 1. Hero Welcome Card with AI Assistant */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-50/90 via-sky-50/50 to-indigo-50/70 border border-blue-100 p-6 shadow-xs relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Left Greeting */}
        <div className="space-y-3 max-w-xl z-10">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">{t.good_morning}</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>{displayName}!</span>
              <span className="text-2xl">👋</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {roleDescription}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>{isTe ? 'ఉదయం 09:30 • 20 మే 2026, మంగళవారం' : '09:30 AM • May 20, 2026, Tuesday'}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
              <span>{roleGreetingSubtitle}</span>
            </div>
          </div>
        </div>

        {/* Doctor Graphic Mascot / Center */}
        <div className="hidden xl:flex items-center justify-center shrink-0">
          <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-blue-500/20 to-cyan-400/20 border-2 border-blue-200 flex items-center justify-center shadow-inner">
            <HeartPulse className="w-14 h-14 text-blue-600 animate-pulse" />
          </div>
        </div>

        {/* Right Inside Card: Role-Tailored AI Assistant */}
        <div className="w-full lg:w-96 rounded-2xl bg-white/90 backdrop-blur-md border border-blue-200/80 p-4 shadow-sm space-y-3 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900">
                {role === 'patient' ? t.ai_assistant_patient : role === 'receptionist' ? t.ai_assistant_reception : t.ai_assistant_doctor}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-700 tracking-wider">
              {role === 'patient' ? (isTe ? 'రోగి' : 'PATIENT') : 'BETA'}
            </span>
          </div>

          <p className="text-[11px] text-slate-500 leading-snug">
            {role === 'patient' ? t.ai_desc_patient : role === 'receptionist' ? t.ai_desc_reception : t.ai_desc_doctor}
          </p>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-800">
                {role === 'patient' ? t.ai_sample_cardio : role === 'receptionist' ? t.ai_sample_telemetry : t.ai_sample_summary}
              </div>
              <div className="text-[10px] text-slate-500">
                {role === 'patient' ? t.ai_sample_cardio_sub : role === 'receptionist' ? t.ai_sample_telemetry_sub : t.ai_sample_summary_sub}
              </div>
            </div>
            <button
              onClick={role === 'patient' ? () => handleAiQuickSend("Naaku Guntur lo cardiologist appointment kavali. Telugu speaking doctor.") : handleGenerateAiSummary}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition cursor-pointer shrink-0"
            >
              {role === 'patient' ? t.btn_book_now : t.btn_generate_summary}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Row (5 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {roleKpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              onClick={kpi.onClick}
              className={`p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all space-y-2 ${
                kpi.clickable ? 'cursor-pointer hover:border-blue-300' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 leading-tight">{kpi.title}</span>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${kpi.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {kpi.value}
              </div>

              <div className={`text-[11px] font-semibold flex items-center gap-1 ${kpi.pillBg}`}>
                <span>{kpi.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Main 3-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Span 4): Role-aware Schedule */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>{role === 'patient' ? t.schedule_patient_title : role === 'receptionist' ? t.schedule_reception_title : t.schedule_doctor_title}</span>
            </h3>
            <button
              onClick={() => onNavigateToTab('chat')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              {role === 'patient' ? t.btn_new_booking : t.btn_view_all}
            </button>
          </div>

          {role === 'patient' ? (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {t.confirmed_visit}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-blue-700">{t.token_label} #C-24</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Dr. Anil Kumar</h4>
                  <p className="text-xs text-slate-500">{isTe ? "ఇంటర్వెన్షనల్ కార్డియాలజిస్ట్ • గది 102" : "Interventional Cardiologist • Room 102"}</p>
                  <p className="text-[11px] text-blue-600 mt-1 font-medium">{isTe ? "కేర్‌బ్రిడ్జ్ హార్ట్ సెంటర్ గుంటూరు" : "CareBridge Heart Center Guntur"}</p>
                </div>
                <div className="pt-2 border-t border-blue-200/60 flex items-center justify-between text-xs text-slate-600">
                  <span className="font-semibold">{isTe ? "రేపు ఉదయం 10:30" : "Tomorrow at 10:30 AM"}</span>
                  <button
                    onClick={() => onNavigateToTab('my_passes')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer underline"
                  >
                    {t.view_digital_pass}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <div>
                  <div className="font-bold text-slate-800">{isTe ? "డాక్టర్ వర్మ (జనరల్ మెడిసిన్)" : "Dr. Varma (General Medicine)"}</div>
                  <div className="text-[10px] text-slate-400">{isTe ? "త్రైమాసిక ఆరోగ్య సమీక్ష • గది 201" : "Quarterly Health Review • Room 201"}</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                  {t.next_week}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {todayAppointments.map((appt, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl hover:bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-slate-500 shrink-0">
                      {appt.time}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{appt.patient}</div>
                      <div className="text-[10px] text-slate-400">{isTe ? (appt.type === 'Follow-up' ? 'ఫాలో-అప్' : appt.type === 'Consultation' ? 'కన్సల్టేషన్' : 'ఈసీజీ సమీక్ష') : appt.type}</div>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    appt.status === 'Confirmed'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {isTe ? (appt.status === 'Confirmed' ? t.confirmed : t.waiting) : appt.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => onNavigateToTab('chat')}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 border border-slate-200 transition cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>{role === 'patient' ? t.btn_book_ai : t.btn_view_full_schedule}</span>
          </button>
        </div>

        {/* Middle Column (Span 4): Quick Links + Queue Status */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Links */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">{t.quick_links_title}</h3>
            <div className="grid grid-cols-3 gap-2.5">
              {roleQuickLinks.map((ql, idx) => {
                const Icon = ql.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => onNavigateToTab(ql.tab)}
                    className={`p-3 rounded-2xl border border-slate-100 text-center flex flex-col items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs ${ql.color}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[10px] font-bold tracking-tight">{ql.title}</span>
                  </button>
                );
              })}
            </div>

            {/* SmartFlow / Health Support Banner */}
            <button
              onClick={() => onNavigateToTab(role === 'patient' ? 'chat' : 'smartflow')}
              className="w-full p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 text-indigo-900 flex items-center justify-between text-xs font-bold hover:shadow-xs transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>{role === 'patient' ? t.banner_patient_ai : t.banner_staff_ai}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-indigo-400" />
            </button>
          </div>

          {/* Queue Status: Role-tailored */}
          {role === 'patient' ? (
            <div className="bg-white rounded-2xl border border-blue-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>{t.queue_box_title}</span>
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {isTe ? "లైవ్ యాక్టివ్" : "Live Active"}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/60 border border-blue-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">{isTe ? "మీ టోకెన్ సంఖ్య" : "Your Token Number"}</div>
                  <div className="text-3xl font-black text-blue-700 font-mono tracking-tight">#C-24</div>
                  <div className="text-xs text-slate-600 font-medium mt-1">{isTe ? "డాక్టర్ అనిల్ కుమార్ • గది 102" : "Dr. Anil Kumar • Room 102"}</div>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-[10px] text-slate-500">{t.now_serving}</div>
                  <div className="text-xl font-bold text-slate-900 font-mono">#C-21</div>
                  <span className="inline-block text-[11px] font-bold text-emerald-700 bg-white border border-emerald-200 px-2 py-0.5 rounded-md">
                    {isTe ? "3 రోగులు ముందున్నారు" : "3 patients ahead"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] text-slate-400">{t.est_wait}</div>
                  <div className="text-sm font-black text-slate-900">~12 {t.minutes_short}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] text-slate-400">{isTe ? "సంప్రదింపు ఫీజు" : "Consultation Fee"}</div>
                  <div className="text-sm font-black text-emerald-700">₹500 {isTe ? "(చెల్లించబడింది)" : "(Paid)"}</div>
                </div>
              </div>

              <button
                onClick={() => onNavigateToTab('token_tracker')}
                className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <span>{t.btn_track_live}</span>
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">{isTe ? "రోగుల క్యూ స్థితి" : "Patient Queue Status"}</h3>
                <button
                  onClick={() => onNavigateToTab('token_tracker')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  {t.btn_view_all}
                </button>
              </div>

              <div className="flex items-center justify-around gap-4 py-2">
                <div className="relative w-28 h-28 rounded-full border-8 border-blue-500 flex items-center justify-center border-t-cyan-400 border-r-emerald-400 border-b-amber-400">
                  <div className="text-center">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase">{isTe ? "మొత్తం" : "Total"}</div>
                    <div className="text-2xl font-black text-slate-900">42</div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                    <span>{isTe ? `వేచి ఉన్నారు: ` : "Waiting: "}<strong>14 (33%)</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span>{isTe ? `కన్సల్టేషన్: ` : "In Consultation: "}<strong>16 (38%)</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span>{isTe ? `ముగిసినవి: ` : "Completed: "}<strong>10 (24%)</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span>{isTe ? `రానివారు: ` : "No Show: "}<strong>2 (5%)</strong></span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-center">
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] text-slate-400">{isTe ? "సగటు వేచి ఉండే సమయం" : "Average Wait Time"}</div>
                  <div className="text-base font-black text-slate-900">18 {t.minutes_short}</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] text-slate-400">{isTe ? "అత్యధిక వేచి ఉండే సమయం" : "Longest Wait Time"}</div>
                  <div className="text-base font-black text-slate-900">45 {t.minutes_short}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (Span 4): Calendar + Schedule + Notifications + Docked AI Assistant */}
        <div className="lg:col-span-4 space-y-6">
          {/* Calendar Widget */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-900">{isTe ? "మే 2026" : "May 2026"}</span>
              <div className="flex items-center gap-1">
                <button type="button" className="p-1 hover:bg-slate-100 rounded text-slate-500 cursor-pointer">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button type="button" className="p-1 hover:bg-slate-100 rounded text-slate-500 cursor-pointer">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-1">
              {isTe ? (
                <><span>ఆది</span><span>సోమ</span><span>మంగళ</span><span>బుధ</span><span>గురు</span><span>శుక్ర</span><span>శని</span></>
              ) : (
                <><span>SUN</span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span></>
              )}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {[27, 28, 29, 30, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31].map((d, dIdx) => {
                const isSelected = d === selectedDay;
                return (
                  <button
                    key={dIdx}
                    onClick={() => setSelectedDay(d)}
                    className={`py-1 rounded-lg font-medium transition cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Today's Schedule Quick View */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-900">{isTe ? "ఈరోజు షెడ్యూల్" : "Today's Schedule"}</span>
              <button
                onClick={() => onNavigateToTab('chat')}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                {isTe ? "పూర్తి క్యాలెండర్ చూడండి →" : "View Full Calendar →"}
              </button>
            </div>
            <div className="space-y-2 text-xs">
              {todayAppointments.slice(0, 3).map((s, idx) => (
                <div key={idx} className="flex items-center justify-between text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-slate-400">{s.time}</span>
                    <span className="font-medium text-slate-900">{s.patient}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 font-bold">
                    {isTe ? (s.status === 'Confirmed' ? t.confirmed : t.waiting) : s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Notifications */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-900">{isTe ? "నోటిఫికేషన్లు" : "Notifications"}</span>
              <button
                onClick={() => onNavigateToTab('chat')}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                {t.btn_view_all}
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-2">
                <FlaskConical className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-800">{isTe ? "అర్జున్ శర్మ ల్యాబ్ నివేదిక సిద్ధంగా ఉంది." : "Lab report for Arjun Sharma is ready."}</div>
                  <div className="text-[10px] text-slate-400">{isTe ? "10 నిమిషాల క్రితం" : "10 mins ago"}</div>
                </div>
              </div>
              <div className="p-2 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-2">
                <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-800">{isTe ? "ప్రియా నాయర్ నుండి కొత్త అపాయింట్‌మెంట్ అభ్యర్థన." : "New appointment request from Priya Nair."}</div>
                  <div className="text-[10px] text-slate-400">{isTe ? "25 నిమిషాల క్రితం" : "25 mins ago"}</div>
                </div>
              </div>
              <div className="p-2 rounded-xl bg-amber-50/60 border border-amber-100 flex items-start gap-2">
                <Pill className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-800">{isTe ? "ప్రిస్క్రిప్షన్ అలర్ట్: 18 పెండింగ్ ప్రిస్క్రిప్షన్లు." : "Prescription alert: 18 pending prescriptions."}</div>
                  <div className="text-[10px] text-slate-400">{isTe ? "45 నిమిషాల క్రితం" : "45 mins ago"}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Docked AI Assistant Widget */}
          <div className="bg-white rounded-2xl border border-blue-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-900">{isTe ? "AI సహాయకుడు" : "AI Assistant"}</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {isTe ? "ఆన్‌లైన్" : "Online"}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-blue-50/50 text-xs text-slate-700 leading-relaxed">
              {isTe
                ? `నమస్కారం ${displayName}! 👋 మీ ${role === 'doctor' ? 'ఆసుపత్రి ఓపీడీ' : role === 'patient' ? 'ఆరోగ్య సంరక్షణ' : role === 'receptionist' ? 'రిసెప్షన్ క్యూ' : 'ఆసుపత్రి నిర్వహణ'} అవసరాలకు నేను ఎలా సహాయపడగలను?`
                : `Hello ${displayName}! 👋 How can I assist your ${role === 'doctor' ? 'outpatient hospital shift' : role === 'patient' ? 'healthcare needs' : role === 'receptionist' ? 'front desk queue' : 'hospital operations'} today?`
              }
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => handleAiQuickSend("Summarize waiting patient queue and priority cases")}
                className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-700 text-[10px] font-semibold border border-slate-200 transition cursor-pointer"
              >
                {isTe ? "రోగి సారాంశం" : "Summarize Patient"}
              </button>
              <button
                onClick={() => handleAiQuickSend("Naaku Guntur lo cardiologist appointment kavali. Telugu speaking doctor, minimum waiting time.")}
                className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-700 text-[10px] font-semibold border border-slate-200 transition cursor-pointer"
              >
                {isTe ? "రూటింగ్ సలహా (గుంటూరు)" : "Suggest Routing (Guntur)"}
              </button>
              <button
                onClick={() => handleAiQuickSend("Check drug interaction for Metformin and Telmisartan")}
                className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-700 text-[10px] font-semibold border border-slate-200 transition cursor-pointer"
              >
                {isTe ? "ఔషధ ప్రభావ తనిఖీ" : "Check Drug Interaction"}
              </button>
            </div>

            <div className="flex items-center gap-1.5 pt-1">
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && aiInput.trim()) {
                    handleAiQuickSend(aiInput.trim());
                    setAiInput('');
                  }
                }}
                placeholder={t.ai_placeholder}
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500"
              />
              <button
                onClick={() => {
                  if (aiInput.trim()) {
                    handleAiQuickSend(aiInput.trim());
                    setAiInput('');
                  }
                }}
                className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Row (4 Cards) - Role Customised */}
      {role === 'patient' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Patient Card 1: My Next Appointment */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>{isTe ? "తదుపరి సంప్రదింపు" : "Next Consultation"}</span>
              </h4>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {t.confirmed}
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-700">
              <div className="font-bold text-slate-900 text-sm">Dr. Anil Kumar</div>
              <div className="text-[11px] text-slate-500">{isTe ? "ఇంటర్వెన్షనల్ కార్డియాలజిస్ట్" : "Interventional Cardiologist"}</div>
              <div className="text-[11px] text-blue-600 font-medium">{isTe ? "కేర్‌బ్రిడ్జ్ హార్ట్ సెంటర్ గుంటూరు • గది 102" : "CareBridge Heart Center Guntur • Room 102"}</div>
              <div className="p-2 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between mt-2">
                <span className="text-[11px] font-semibold">{isTe ? "రేపు ఉదయం 10:30" : "Tomorrow at 10:30 AM"}</span>
                <span className="font-mono font-bold text-blue-700">#C-24</span>
              </div>
            </div>
            <button
              onClick={() => onNavigateToTab('my_passes')}
              className="w-full mt-1 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition cursor-pointer"
            >
              {t.view_digital_pass}
            </button>
          </div>

          {/* Patient Card 2: My Active Prescriptions */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isTe ? "యాక్టివ్ మందులు (Rx)" : "Active Medications (Rx)"}</span>
              </h4>
              <span className="text-[10px] font-bold text-emerald-600">{isTe ? "2 యాక్టివ్" : "2 Active"}</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>Atorvastatin 10mg</span>
                  <span className="text-[10px] text-slate-400 font-normal">{isTe ? "రోజువారీ" : "Daily"}</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">{isTe ? "డిన్నర్ తర్వాత 1 టాబ్లెట్ (కొలెస్ట్రాల్ నియంత్రణ)" : "1 tablet after dinner (Cholesterol control)"}</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>Metoprolol 25mg</span>
                  <span className="text-[10px] text-slate-400 font-normal">{isTe ? "రోజువారీ" : "Daily"}</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">{isTe ? "ఉదయం టిఫిన్ తర్వాత 1 టాబ్లెట్ (రక్తపోటు)" : "1 tablet morning after breakfast (Blood Pressure)"}</div>
              </div>
            </div>
            <button
              onClick={() => onNavigateToTab('prescriptions')}
              className="w-full mt-1 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition cursor-pointer"
            >
              {isTe ? "అన్ని ప్రిస్క్రిప్షన్లు & రీఫిల్స్ →" : "All Prescriptions & Refills →"}
            </button>
          </div>

          {/* Patient Card 3: Doctor's Latest Advice */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isTe ? "డాక్టర్ సంరక్షణ సలహా" : "Doctor's Care Advice"}</span>
              </h4>
              <span className="text-[10px] font-bold text-indigo-600">{isTe ? "వైద్యుల సూచన" : "Physician Order"}</span>
            </div>
            <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs text-slate-700 space-y-2">
              <p className="text-[11px] leading-relaxed italic text-indigo-950">
                {isTe
                  ? "\"తక్కువ ఉప్పు ఉన్న ఆహారం తీసుకోండి, రోజూ ఉదయం బీపీ నమోదు చేయండి మరియు తదుపరి పరీక్ష వరకు శ్రమతో కూడిన పనులు చేయకండి.\""
                  : "\"Maintain low-sodium diet, record morning BP daily, and avoid strenuous physical exertion until your in-person follow-up review.\""
                }
              </p>
              <div className="text-[10px] text-indigo-700 font-bold border-t border-indigo-100 pt-1.5">
                {isTe ? "— డాక్టర్ అనిల్ కుమార్ (కార్డియాలజీ లీడ్)" : "— Dr. Anil Kumar (Cardiology Lead)"}
              </div>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center justify-between px-1">
              <span>{isTe ? "తదుపరి సమీక్ష 14 రోజుల్లో" : "Next review in 14 days"}</span>
              <span>{isTe ? "రెగ్యులర్ ఓపీడీ" : "Routine OPD"}</span>
            </div>
          </div>

          {/* Patient Card 4: Patient Support & SOS Services */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>{isTe ? "కేర్‌బ్రిడ్జ్ సేవలు" : "CareBridge Services"}</span>
              </h4>
              <span className="text-[10px] font-bold text-emerald-600">{isTe ? "24x7 అందుబాటులో" : "24x7 Active"}</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-rose-900 text-xs">{isTe ? "108 అత్యవసర SOS" : "108 Emergency SOS"}</div>
                  <div className="text-[10px] text-rose-600">{isTe ? "తక్షణ ట్రియాజ్ & అంబులెన్స్ కాల్" : "Instant triage & ambulance call"}</div>
                </div>
                <span className="text-xs">🚨</span>
              </div>
              <div className="p-2 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-blue-900 text-xs">{isTe ? "వాట్సాప్ అప్‌డేట్లు" : "WhatsApp Updates"}</div>
                  <div className="text-[10px] text-blue-600">+91 98480 22334 {isTe ? "(యాక్టివ్)" : "(Active)"}</div>
                </div>
                <span className="text-xs">💬</span>
              </div>
            </div>
            <button
              onClick={() => onNavigateToTab('token_tracker')}
              className="w-full mt-1 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition cursor-pointer"
            >
              {isTe ? "ఓపీడీ వెయిటింగ్ హాల్ టీవీ స్థితి →" : "OPD Waiting Hall TV Status →"}
            </button>
          </div>
        </div>
      ) : role === 'receptionist' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Reception Card 1: Doctors in OPD */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold text-slate-900">{isTe ? "డ్యూటీలో ఉన్న వైద్యులు" : "Doctors on Duty"}</h4>
              <span className="text-[10px] font-bold text-emerald-600">{isTe ? "3 సంప్రదింపుల్లో ఉన్నారు" : "3 In Consultation"}</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Dr. Anil Kumar</div>
                  <div className="text-[10px] text-slate-400">{isTe ? "కార్డియాలజీ • గది 102" : "Cardiology • Room 102"}</div>
                </div>
                <span className="font-mono text-xs font-bold text-blue-600">{isTe ? "సేవ అందిస్తున్నారు" : "Serving"} #C-21</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Dr. Varma</div>
                  <div className="text-[10px] text-slate-400">{isTe ? "జనరల్ ఓపీడీ • గది 201" : "General OPD • Room 201"}</div>
                </div>
                <span className="font-mono text-xs font-bold text-emerald-600">{isTe ? "సేవ అందిస్తున్నారు" : "Serving"} #G-14</span>
              </div>
            </div>
          </div>

          {/* Reception Card 2: Recent Check-ins */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold text-slate-900">{isTe ? "ఇటీవలి ఓపీడీ చెక్-ఇన్‌లు" : "Recent OPD Check-ins"}</h4>
              <button onClick={() => onNavigateToTab('patient_hub')} className="text-[10px] font-semibold text-blue-600">{isTe ? "రోగులందరూ →" : "All Patients →"}</button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">Arjun Sharma</span>
                  <span className="text-[10px] text-slate-400 block">{t.token_label} #C-22</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">{isTe ? "చేరారు" : "Arrived"}</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">Neha Kapoor</span>
                  <span className="text-[10px] text-slate-400 block">{t.token_label} #C-23</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700">{t.waiting}</span>
              </div>
            </div>
          </div>

          {/* Reception Card 3: Queue Delays */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold text-slate-900">{isTe ? "ఓపీడీ గది హెచ్చరికలు" : "OPD Room Alerts"}</h4>
              <span className="text-[10px] font-bold text-amber-600">{isTe ? "1 ఆలస్యం" : "1 Delay"}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-1">
              <div className="font-bold text-amber-900">{isTe ? "గది 102 (కార్డియాలజీ)" : "Room 102 (Cardiology)"}</div>
              <div className="text-[10px] text-amber-700">{isTe ? "అత్యవసర ఈసీజీ సమీక్ష కారణంగా ~12ని ఆలస్యం." : "Estimated delay ~12 mins due to emergency ECG review."}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1">
              <div className="font-bold text-emerald-900">{isTe ? "గది 201 (జనరల్ మెడిసిన్)" : "Room 201 (General Medicine)"}</div>
              <div className="text-[10px] text-emerald-700">{isTe ? "సమయానికి జరుగుతోంది • తదుపరి టోకెన్ సిద్ధం." : "On schedule • Next token ready."}</div>
            </div>
          </div>

          {/* Reception Card 4: Front Desk Tasks */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold text-slate-900">{isTe ? "డెస్క్ రిమైండర్లు" : "Desk Reminders"}</h4>
              <span className="text-[10px] font-bold text-blue-600">{isTe ? "ఈరోజు" : "Today"}</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-1.5 hover:bg-slate-50 rounded-lg">
                <span className="text-slate-700 text-[11px]">{isTe ? "4 కౌంటర్ బిల్లులు సరిచూడాలి" : "4 Counter bills to reconcile"}</span>
                <button onClick={() => onNavigateToTab('my_passes')} className="text-[10px] font-bold text-blue-600 px-2 py-0.5 rounded bg-blue-50">{isTe ? "చూడండి" : "View"}</button>
              </div>
              <div className="flex items-center justify-between p-1.5 hover:bg-slate-50 rounded-lg">
                <span className="text-slate-700 text-[11px]">{isTe ? "2 టోకెన్ కియోస్క్‌లు యాక్టివ్" : "2 Token Kiosks Active"}</span>
                <button onClick={() => onNavigateToTab('token_tracker')} className="text-[10px] font-bold text-emerald-600 px-2 py-0.5 rounded bg-emerald-50">{isTe ? "స్థితి" : "Status"}</button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Upcoming Consultations */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold text-slate-900">{isTe ? "రాబోయే సంప్రదింపులు" : "Upcoming Consultations"}</h4>
              <button
                onClick={() => onNavigateToTab('chat')}
                className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                {t.btn_view_all}
              </button>
            </div>
            <div className="space-y-2.5">
              {upcomingConsultations.map((c, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                      {c.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{c.patient}</div>
                      <div className="text-[10px] text-slate-400">{isTe ? (c.reason === 'Follow-up' ? 'ఫాలో-అప్' : c.reason === 'Consultation' ? 'కన్సల్టేషన్' : 'ఈసీజీ సమీక్ష') : c.reason}</div>
                    </div>
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-slate-500">{c.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Patient Notes */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold text-slate-900">{isTe ? "ఇటీవలి రోగి నోట్స్" : "Recent Patient Notes"}</h4>
              <button
                onClick={() => onNavigateToTab('patient_hub')}
                className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                {isTe ? "అన్ని నోట్స్ చూడండి →" : "View All Notes →"}
              </button>
            </div>
            <div className="space-y-2.5">
              {recentNotes.map((n, i) => (
                <div key={i} className="space-y-0.5 text-xs">
                  <div className="flex items-center justify-between">
                    <strong className="text-slate-900">{n.patient}</strong>
                    <span className="text-[9px] text-slate-400">{n.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">{n.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Patient Risk Alerts */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold text-slate-900">{isTe ? "AI రోగి ప్రమాద హెచ్చరికలు" : "AI Patient Risk Alerts"}</h4>
              <span className="text-[10px] font-bold text-rose-600">{isTe ? "3 హెచ్చరికలు" : "3 Alerts"}</span>
            </div>
            <div className="space-y-2">
              {riskAlerts.map((r, i) => (
                <div key={i} className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${r.color}`}>
                  <div>
                    <div className="font-bold">{r.patient}</div>
                    <div className="text-[10px] opacity-80">{r.details}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase shrink-0 ${r.badge}`}>
                    {r.level}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Smart Reminders */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold text-slate-900">{isTe ? "స్మార్ట్ రిమైండర్లు" : "Smart Reminders"}</h4>
              <span className="text-[10px] font-bold text-blue-600">{isTe ? "ఆటో సింక్" : "Auto Sync"}</span>
            </div>
            <div className="space-y-2 text-xs">
              {smartReminders.map((rem, i) => (
                <div key={i} className="flex items-center justify-between gap-2 p-1.5 hover:bg-slate-50 rounded-lg transition">
                  <span className="text-slate-700 text-[11px] leading-tight">{rem.text}</span>
                  <button
                    onClick={() => onNavigateToTab(rem.tab)}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-700 px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 transition cursor-pointer shrink-0"
                  >
                    {rem.action}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Patient Summary Modal */}
      {aiSummaryModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{isTe ? "AI రోగి సారాంశం" : "AI Patient Summary"}</h3>
                  <p className="text-[10px] text-slate-400">{isTe ? "స్వయంప్రతిపత్త క్లినికల్ సంశ్లేషణ" : "Autonomous Clinical Synthesis"}</p>
                </div>
              </div>
              <button
                onClick={() => setAiSummaryModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {summaryGenerating ? (
              <div className="py-8 text-center space-y-2">
                <Activity className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                <p className="text-xs text-slate-500">{isTe ? "లైవ్ ఆసుపత్రి క్యూలు మరియు రోగుల స్లాట్‌ల సంశ్లేషణ జరుగుతోంది..." : "Synthesizing live hospital queues and active patient slots..."}</p>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs text-slate-700 leading-relaxed space-y-3">
                <p>{generatedSummary}</p>
                <div className="text-[10px] text-slate-500 font-mono pt-2 border-t border-blue-100">
                  {isTe ? "ధృవీకరించబడింది: కేర్‌బ్రిడ్జ్ మల్టీ-ఏజెంట్ సూపర్‌వైజర్ ఇంజిన్ • FHIR స్కీమా సరైనది" : "Verified by: CareBridge Multi-Agent Supervisor Engine • FHIR Schema Valid"}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setAiSummaryModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                {isTe ? "మూసివేయండి" : "Close"}
              </button>
              <button
                onClick={() => {
                  setAiSummaryModal(false);
                  onNavigateToTab('chat');
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
              >
                {isTe ? "AI వర్క్‌స్పేస్‌లో తెరవండి" : "Open in AI Workspace"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
