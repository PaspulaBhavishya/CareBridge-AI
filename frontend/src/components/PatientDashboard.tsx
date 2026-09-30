import React, { useState } from 'react';
import { 
  Calendar, Clock, Ticket, Stethoscope, MapPin, 
  CheckCircle2, Bell, RefreshCw, XCircle, FileText, ChevronRight,
  Navigation, Info, Activity, Shield, Zap, Sparkles, Users, Search,
  Phone, Eye, Pill
} from 'lucide-react';
import type { UserProfile, AppointmentRecord, DigitalPassData } from '../types';

interface PatientDashboardProps {
  currentProfile: UserProfile;
  appointments: AppointmentRecord[];
  onBookNew: () => void;
  onOpenPass: (pass: DigitalPassData) => void;
  onReschedule: (appointmentId: number) => void;
  onCancel: (appointmentId: number) => void;
  onOpenScanner: () => void;
  onTriggerProximityAlert?: (tokenNumber: number | string, doctorName: string) => void;
  onTrackToken?: (tokenNumber: string) => void;
  onCheckToken?: () => void;
  onOpenMyAppointments?: () => void;
  onOpenMyPrescriptions?: () => void;
  onOpenEmergencyHelp?: () => void;
  onViewJourney?: () => void;
  onNavigateToTab?: (tab: string) => void;
  seniorMode?: boolean;
}

interface HospitalPatientRecord {
  id: string;
  name: string;
  nameTelugu: string;
  age: number;
  gender: string;
  phone: string;
  condition: string;
  doctor: string;
  dept: string;
  room: string;
  token: string;
  status: 'In Consultation' | 'Waiting' | 'Completed' | 'Follow-up';
  lastVisit: string;
  risk: 'Normal' | 'Moderate' | 'High Risk';
}

const SAMPLE_PATIENTS_ROSTER: HospitalPatientRecord[] = [
  {
    id: "PAT-1000",
    name: "Bhavishya",
    nameTelugu: "భవిష్య",
    age: 28,
    gender: "Female",
    phone: "+91 98765 43210",
    condition: "Acute Abdominal Pain & Gastritis",
    doctor: "Dr. Priya",
    dept: "General Medicine",
    room: "Room OPD-03",
    token: "GM-024",
    status: "Waiting",
    lastVisit: "Today",
    risk: "Normal"
  },
  {
    id: "PAT-1001",
    name: "S. Murthy",
    nameTelugu: "ఎస్. మూర్తి",
    age: 64,
    gender: "Male",
    phone: "+91 94401 22345",
    condition: "Cardiac Arrhythmia & Hypertension",
    doctor: "Dr. Anil Kumar",
    dept: "Cardiology",
    room: "Room CARD-01",
    token: "C-24",
    status: "In Consultation",
    lastVisit: "Today",
    risk: "High Risk"
  },
  {
    id: "PAT-1002",
    name: "K. Rao",
    nameTelugu: "కె. రావు",
    age: 52,
    gender: "Male",
    phone: "+91 98480 33456",
    condition: "Type 2 Diabetes Mellitus (HbA1c 8.4%)",
    doctor: "Dr. Ananya Sen",
    dept: "General Medicine",
    room: "Room OPD-02",
    token: "GM-019",
    status: "Completed",
    lastVisit: "Yesterday",
    risk: "Moderate"
  },
  {
    id: "PAT-1003",
    name: "Lakshmi Devi",
    nameTelugu: "లక్ష్మీ దేవి",
    age: 46,
    gender: "Female",
    phone: "+91 99890 44567",
    condition: "Osteoarthritis Knee Pain",
    doctor: "Dr. Rajesh Varma",
    dept: "Orthopedics",
    room: "Room ORTHO-04",
    token: "OR-008",
    status: "Waiting",
    lastVisit: "3 days ago",
    risk: "Normal"
  },
  {
    id: "PAT-1004",
    name: "Venkat Reddy",
    nameTelugu: "వెంకట్ రెడ్డి",
    age: 39,
    gender: "Male",
    phone: "+91 97000 55678",
    condition: "Allergic Dermatitis & Skin Rash",
    doctor: "Dr. Sneha Reddy",
    dept: "Dermatology",
    room: "Room DERM-01",
    token: "DERM-05",
    status: "Follow-up",
    lastVisit: "1 week ago",
    risk: "Normal"
  }
];

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  currentProfile,
  appointments,
  onBookNew,
  onOpenPass,
  onReschedule,
  onCancel,
  onOpenScanner,
  onTriggerProximityAlert,
  onTrackToken,
  onCheckToken,
  onOpenMyAppointments,
  onOpenMyPrescriptions,
  onOpenEmergencyHelp,
  onViewJourney,
  onNavigateToTab,
  seniorMode = false,
}) => {
  const [proximityAlertSubscribed, setProximityAlertSubscribed] = useState<Record<number, boolean>>({});
  const [alertBanner, setAlertBanner] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'hub' | 'directory'>('hub');
  const [rosterSearch, setRosterSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Default seeded appointment matching prompt requirements
  const defaultUpcomingAppt: AppointmentRecord = {
    id: 100,
    confirmation_code: "CB-2026-GM024",
    patient_name: currentProfile.name || "Bhavishya",
    doctor_name: "Dr. Priya",
    department: "General Medicine",
    hospital: "Hospital B (CareBridge Central)",
    date: "Today",
    time: "10:30 AM",
    token_number: "GM-024",
    token_number_str: "GM-024",
    consultation_fee: 600,
    status: "CONFIRMED",
    simulated_wait_min: 10,
    smartflow_score: 80,
    reason: "Stomach pain & general health consultation",
    created_at: new Date().toISOString()
  };

  // Filter patient's appointments
  const myAppointments = appointments.filter((a) => 
    !currentProfile.name || a.patient_name?.toLowerCase().includes(currentProfile.name.toLowerCase())
  );

  const nextAppt = myAppointments.length > 0 ? myAppointments[0] : defaultUpcomingAppt;

  // Audio chime synthesizer via Web Audio API
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn("Audio chime not supported or muted:", e);
    }
  };

  const handleToggleProximityAlert = (apptId: number, tokenNum: number | string, docName: string) => {
    const isNowSubscribed = !proximityAlertSubscribed[apptId];
    setProximityAlertSubscribed({ ...proximityAlertSubscribed, [apptId]: isNowSubscribed });

    if (isNowSubscribed) {
      playChime();
      setAlertBanner(`🔔 Proximity alert armed for Token ${tokenNum} with ${docName}! You will receive a chime & popup when only 2 tokens remain.`);
      if (onTriggerProximityAlert) {
        onTriggerProximityAlert(tokenNum, docName);
      }
      setTimeout(() => setAlertBanner(null), 6000);
    } else {
      setAlertBanner(null);
    }
  };

  // Convert appointment record to DigitalPassData
  const getPassData = (appt: AppointmentRecord): DigitalPassData => {
    const tok = String(appt.token_number || appt.token_number_str || "GM-024");
    return {
      token_number: tok,
      confirmation_code: appt.confirmation_code || "CB-2026-GM024",
      patient_name: appt.patient_name || currentProfile.name || "Bhavishya",
      doctor_name: appt.doctor_name || "Dr. Priya",
      specialization: appt.department || "General Medicine",
      department: appt.department || "General Medicine",
      hospital_name: appt.hospital || "Hospital B (CareBridge Central)",
      room_number: "Room OPD-03 (Ground Floor)",
      date: appt.date || "Today",
      time: appt.time || "10:30 AM",
      simulated_wait_min: appt.simulated_wait_min || 10,
      current_serving_token: "GM-022",
      patients_ahead: 2,
      consultation_fee: appt.consultation_fee || 600,
      instructions: "Please report 10 minutes prior. Show this token at Room OPD-03 Desk."
    };
  };

  const filteredPatients = SAMPLE_PATIENTS_ROSTER.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      p.id.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      p.condition.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      p.doctor.toLowerCase().includes(rosterSearch.toLowerCase());
    const matchesFilter = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className={`flex-1 bg-[#F8FAFC] text-slate-800 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-24 ${
      seniorMode ? 'text-base' : 'text-sm'
    }`}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200">
                Patient Management • రోగి పోర్టల్
              </span>
              <span className="text-xs text-slate-400">
                Patient ID: <strong className="text-slate-700">{currentProfile.patient_uid || "PAT-1000"}</strong>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Welcome, {currentProfile.name || "Bhavishya"}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Track your real-time waiting token, doctor consultation status, hospital directions, and prescriptions without medical jargon.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {onViewJourney && (
              <button
                onClick={onViewJourney}
                className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>🌟 View 10-Stage Journey</span>
              </button>
            )}
            <button
              onClick={onBookNew}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>➕ Book Appointment</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher: Personal Hub vs Patient Registry Directory */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveSubTab('hub')}
            className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'hub'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>My Active Patient Hub (నా కేర్ పోర్టల్)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('directory')}
            className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'directory'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Patient Directory (ఆసుపత్రి పేషెంట్లు)</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600">
              {SAMPLE_PATIENTS_ROSTER.length}
            </span>
          </button>
        </div>

        {/* SUBTAB 1: PERSONAL PATIENT HUB */}
        {activeSubTab === 'hub' && (
          <div className="space-y-6">
            {/* How can we help you today? Section (6 Action Buttons) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>How can we help you today?</span>
                  <span className="text-xs text-slate-500 font-normal">• మేము మీకు ఎలా సహాయపడగలం?</span>
                </h2>
                <span className="text-[11px] font-medium text-slate-400">Quick Services</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {/* 1. Book Appointment */}
                <button
                  onClick={onBookNew}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition cursor-pointer flex flex-col items-center text-center gap-2 group shadow-xs"
                >
                  <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 leading-tight">Book Appointment</span>
                  <span className="text-[10px] text-blue-600 font-medium">స్లాట్ బుకింగ్</span>
                </button>

                {/* 2. Check My Token */}
                <button
                  onClick={() => {
                    if (onCheckToken) onCheckToken();
                    else if (onTrackToken) onTrackToken("GM-024");
                  }}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-teal-400 hover:shadow-md transition cursor-pointer flex flex-col items-center text-center gap-2 group shadow-xs"
                >
                  <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition">
                    <Ticket className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 leading-tight">Check My Token</span>
                  <span className="text-[10px] text-teal-600 font-medium">టోకెన్ ట్రాకింగ్</span>
                </button>

                {/* 3. Upload Report */}
                <button
                  onClick={onOpenScanner}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-md transition cursor-pointer flex flex-col items-center text-center gap-2 group shadow-xs"
                >
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
                    <FileText className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 leading-tight">Upload Report</span>
                  <span className="text-[10px] text-emerald-600 font-medium">ల్యాబ్ రిపోర్ట్</span>
                </button>

                {/* 4. My Appointments */}
                <button
                  onClick={() => {
                    if (onOpenMyAppointments) onOpenMyAppointments();
                  }}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-purple-400 hover:shadow-md transition cursor-pointer flex flex-col items-center text-center gap-2 group shadow-xs"
                >
                  <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition">
                    <Clock className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 leading-tight">My Appointments</span>
                  <span className="text-[10px] text-purple-600 font-medium">నా బుకింగ్స్</span>
                </button>

                {/* 5. My Prescriptions */}
                <button
                  onClick={() => {
                    if (onOpenMyPrescriptions) onOpenMyPrescriptions();
                  }}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-cyan-400 hover:shadow-md transition cursor-pointer flex flex-col items-center text-center gap-2 group shadow-xs"
                >
                  <div className="h-10 w-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition">
                    <Stethoscope className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 leading-tight">My Prescriptions</span>
                  <span className="text-[10px] text-cyan-600 font-medium">వైద్య చీటీ</span>
                </button>

                {/* 6. Emergency Help */}
                <button
                  onClick={() => {
                    if (onOpenEmergencyHelp) onOpenEmergencyHelp();
                  }}
                  className="p-3.5 rounded-2xl bg-white border border-rose-200 hover:border-rose-400 hover:shadow-md transition cursor-pointer flex flex-col items-center text-center gap-2 group shadow-xs"
                >
                  <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition">
                    <Bell className="h-5 w-5 animate-pulse" />
                  </div>
                  <span className="text-xs font-bold text-rose-700 leading-tight">Emergency Help</span>
                  <span className="text-[10px] text-rose-500 font-medium">108 అత్యవసరం</span>
                </button>
              </div>
            </div>

            {/* AUTONOMOUS AGENT SHOWCASE FOR JUDGES */}
            {onNavigateToTab && (
              <div className="p-5 rounded-2xl bg-white border border-indigo-100 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Autonomous Agent Innovations • స్వయంప్రతిపత్తి వ్యవస్థ
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full font-bold">
                    Judge Pitch Modules
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={() => onNavigateToTab('recovery_mode')}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200 hover:border-amber-300 text-left space-y-1 transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5 text-amber-700 font-bold text-xs">
                      <Zap className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition" />
                      <span>Recovery Mode</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">Doctor delay failover & zero cancellation</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigateToTab('privacy_consent')}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 text-left space-y-1 transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                      <Shield className="w-3.5 h-3.5 text-emerald-500 group-hover:scale-110 transition" />
                      <span>Privacy Ledger</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">Access audit & consent controls</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigateToTab('session_replay')}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-cyan-50/60 border border-slate-200 hover:border-cyan-300 text-left space-y-1 transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5 text-cyan-700 font-bold text-xs">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-500 group-hover:scale-110 transition" />
                      <span>Session Replay</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">Step-by-step judge inspector</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigateToTab('smartflow_whatif')}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-purple-50/60 border border-slate-200 hover:border-purple-300 text-left space-y-1 transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5 text-purple-700 font-bold text-xs">
                      <Activity className="w-3.5 h-3.5 text-purple-500 group-hover:scale-110 transition" />
                      <span>What-If Simulator</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">Dynamic weights & resource balancing</p>
                  </button>
                </div>
              </div>
            )}

            {/* Proximity alert banner if triggered */}
            {alertBanner && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3 shadow-xs animate-fade-in">
                <Bell className="h-5 w-5 text-amber-600 shrink-0 mt-0.5 animate-bounce" />
                <div className="flex-1">
                  <strong className="text-amber-800 block mb-0.5 font-bold">Proximity Alert Active</strong>
                  <span>{alertBanner}</span>
                </div>
                <button
                  onClick={() => setAlertBanner(null)}
                  className="text-amber-700 hover:text-amber-900 font-bold"
                >
                  ✕
                </button>
              </div>
            )}

            {/* NEXT APPOINTMENT HERO CARD */}
            {nextAppt ? (
              <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
                <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-teal-500 to-indigo-600" />
                
                <div className="p-6 space-y-5">
                  {/* Top Badge & Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2.5">
                      <span className="px-3 py-1 text-xs font-bold rounded-lg bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-blue-600" />
                        <span>Upcoming Appointment</span>
                      </span>
                      <span className="text-xs text-slate-500">
                        Confirmation: <strong className="text-slate-800 font-mono">{nextAppt.confirmation_code || "CB-2026-GM024"}</strong>
                      </span>
                    </div>

                    {/* Primary Action Buttons */}
                    <div className="flex items-center flex-wrap gap-2">
                      <button
                        onClick={() => onOpenPass(getPassData(nextAppt))}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                      >
                        <Ticket className="h-3.5 w-3.5 text-blue-600" />
                        <span>View OPD Pass</span>
                      </button>

                      <button
                        onClick={() => {
                          if (onTrackToken) onTrackToken(String(nextAppt.token_number || nextAppt.token_number_str || "GM-024"));
                          else if (onCheckToken) onCheckToken();
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                      >
                        <Activity className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Track Token</span>
                      </button>

                      <button
                        onClick={() => onReschedule(nextAppt.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                      >
                        <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
                        <span>Reschedule</span>
                      </button>
                    </div>
                  </div>

                  {/* Core Info Grid - 4 Modern Medical Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-1">
                    {/* Card 1: Doctor */}
                    <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 text-slate-800 space-y-1">
                      <div className="text-xs text-slate-400 flex items-center justify-between">
                        <span>Doctor</span>
                        <span className="text-[10px] text-blue-600 font-bold">డాక్టర్</span>
                      </div>
                      <div className="text-base font-extrabold text-slate-900 truncate">
                        {nextAppt.doctor_name || "Dr. Priya"}
                      </div>
                      <div className="text-xs text-blue-600 font-semibold">
                        {nextAppt.department || "General Medicine"}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 pt-1">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        <span>Room OPD-03 (Ground Floor)</span>
                      </div>
                    </div>

                    {/* Card 2: Department */}
                    <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 text-slate-800 space-y-1">
                      <div className="text-xs text-slate-400 flex items-center justify-between">
                        <span>Department</span>
                        <span className="text-[10px] text-purple-600 font-bold">విభాగం</span>
                      </div>
                      <div className="text-base font-bold text-slate-900">
                        {nextAppt.department || "General Medicine"}
                      </div>
                      <div className="text-xs text-purple-600 font-medium">
                        Outpatient Consultation
                      </div>
                      <div className="text-[11px] text-slate-500 pt-1">
                        Hospital: <strong className="text-slate-700">{nextAppt.hospital || "Hospital B (CareBridge Central)"}</strong>
                      </div>
                    </div>

                    {/* Card 3: Date & Time */}
                    <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 text-slate-800 space-y-1">
                      <div className="text-xs text-slate-400 flex items-center justify-between">
                        <span>Schedule</span>
                        <span className="text-[10px] text-amber-600 font-bold">తేదీ & సమయం</span>
                      </div>
                      <div className="text-base font-extrabold text-slate-900">
                        Today, {nextAppt.time || "10:30 AM"}
                      </div>
                      <div className="text-xs font-semibold text-amber-700 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Est. Wait: ~{nextAppt.simulated_wait_min || 10} mins</span>
                      </div>
                      <div className="text-[11px] text-emerald-600 flex items-center gap-1 pt-1 font-medium">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Doctor Status: On Schedule</span>
                      </div>
                    </div>

                    {/* Card 4: Token */}
                    <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-slate-800 space-y-1">
                      <div className="text-xs text-slate-500 flex items-center justify-between">
                        <span>Assigned Token</span>
                        <span className="text-[10px] text-emerald-700 font-bold">టోకెన్</span>
                      </div>
                      <div className="text-2xl font-black text-emerald-600 tracking-tight font-mono">
                        Token: {String(nextAppt.token_number || nextAppt.token_number_str || "GM-024")}
                      </div>
                      <div className="text-[11px] text-slate-600 pt-0.5 flex items-center justify-between">
                        <span>Status: <strong className="text-amber-700 font-bold">ALMOST YOUR TURN</strong></span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Serving: <strong className="text-slate-800">GM-022</strong> (2 people ahead)
                      </div>
                    </div>
                  </div>

                  {/* Real-time proximity alert button & Map Actions */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-slate-100">
                    <button
                      onClick={() => handleToggleProximityAlert(nextAppt.id, nextAppt.token_number || "GM-024", nextAppt.doctor_name || "Dr. Priya")}
                      className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer shadow-xs ${
                        proximityAlertSubscribed[nextAppt.id]
                          ? 'bg-amber-500 text-white border border-amber-500 shadow-md'
                          : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                      title="Sound audio chime & show pop-up notification when your token is 2 numbers away"
                    >
                      <Bell className="h-4 w-4 text-amber-600" />
                      <span>
                        {proximityAlertSubscribed[nextAppt.id] 
                          ? '✅ Alert Armed (2 Tokens Away)' 
                          : '🔔 Get Alert When 2 Tokens Away'}
                      </span>
                    </button>

                    <div className="flex items-center gap-2">
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent((nextAppt.hospital || "Hospital B") + " Hyderabad")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-1.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                      >
                        <Navigation className="h-3.5 w-3.5" />
                        <span>Open in Google Maps</span>
                      </a>

                      <button
                        onClick={() => onCancel(nextAppt.id)}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold transition cursor-pointer flex items-center gap-1.5"
                        title="Cancel this appointment"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>

                  {/* Checklist: What to bring */}
                  <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 text-xs text-slate-700 flex items-start gap-3">
                    <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <strong className="text-slate-900 font-semibold">Please Bring to the Hospital / ఆసుపత్రికి తీసుకురావాల్సినవి:</strong>
                      <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                        <li>Government photo ID (Aadhaar / Voter ID / Driving License)</li>
                        <li>Previous prescription sheets, discharge summaries, or recent blood reports</li>
                        <li>Payment method for consultation fee (₹600 UPI or Cash at counter)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-2xl border border-slate-200 bg-white text-center space-y-4 shadow-xs">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">No Upcoming Appointments</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                    You do not have any scheduled consultations. Use CareBridge AI to search for low-wait slots across nearby hospitals in English or Telugu.
                  </p>
                </div>
                <button
                  onClick={onBookNew}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  Book an Appointment Now
                </button>
              </div>
            )}

            {/* 3 Secondary Cards: My Reports, My Prescriptions, Follow-Up Care */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: My Reports */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white hover:shadow-md transition space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                    <FileText className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                    OCR Scanner
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">My Medical Reports</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Upload lab reports, view editable parameters, flagged confidence items, and plain Telugu summaries.
                  </p>
                </div>
                <button
                  onClick={onOpenScanner}
                  className="w-full py-2 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <span>Scan or View Reports</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Card 2: My Prescriptions */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white hover:shadow-md transition space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                    <Stethoscope className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
                    e-Rx Records
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">My Prescriptions</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    View verified medicines, dosages in English & Telugu, and timing guidance issued by your consulting doctor.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold text-slate-800">
                    <span>Tab. Metformin 500mg</span>
                    <span className="text-emerald-600 font-mono font-bold">1-0-1</span>
                  </div>
                  <p className="text-[11px] text-slate-500">After food (భోజనం తర్వాత) • 30 days</p>
                </div>

                <button
                  onClick={() => {
                    if (onNavigateToTab) onNavigateToTab('prescriptions');
                    else if (onOpenMyPrescriptions) onOpenMyPrescriptions();
                  }}
                  className="w-full mt-2 py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-xs font-bold border border-cyan-200 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Pill className="w-3.5 h-3.5 text-cyan-600" />
                  <span>View All Prescriptions & Timings →</span>
                </button>
              </div>

              {/* Card 3: Follow-Up Date & Care */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white hover:shadow-md transition space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    Care Continuity
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Follow-up Care</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Recommended follow-up visit and automated reminders before your prescription finishes.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold text-slate-800">
                    <span>Next Follow-up Due</span>
                    <span className="text-purple-600 font-bold">In 3 Weeks</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Dr. Priya recommended check on abdominal stabilization.</p>
                </div>
              </div>
            </div>

            {/* Past Appointments List */}
            {myAppointments.length > 1 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-slate-400" />
                  <span>Other Booked Appointments</span>
                </h3>
                <div className="space-y-2">
                  {myAppointments.slice(1).map((appt) => (
                    <div
                      key={appt.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-4 text-xs shadow-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-900">{appt.doctor_name}</strong>
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600">{appt.department}</span>
                        </div>
                        <span className="text-slate-500 text-[11px]">
                          {appt.hospital} • {appt.time} • Token #{appt.token_number || 14}
                        </span>
                      </div>
                      <button
                        onClick={() => onOpenPass(getPassData(appt))}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold hover:bg-blue-100 transition cursor-pointer"
                      >
                        View Pass
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SUBTAB 2: HOSPITAL PATIENT DIRECTORY (ERP ROSTER) */}
        {activeSubTab === 'directory' && (
          <div className="space-y-4">
            {/* Search and Filter Controls */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
              <div className="relative flex-1 w-full sm:max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  placeholder="Search patient by name, UID, condition, or doctor..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                {['All', 'Waiting', 'In Consultation', 'Completed', 'Follow-up'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                      statusFilter === st
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Patients Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Patient UID & Name</th>
                      <th className="py-3 px-4">Demographics</th>
                      <th className="py-3 px-4">Clinical Diagnosis / Condition</th>
                      <th className="py-3 px-4">Consulting Doctor</th>
                      <th className="py-3 px-4">Token & Room</th>
                      <th className="py-3 px-4">Queue Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPatients.map((patient) => {
                      const isWaiting = patient.status === 'Waiting';
                      const isInConsult = patient.status === 'In Consultation';
                      const isCompleted = patient.status === 'Completed';

                      return (
                        <tr key={patient.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                                {patient.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <span>{patient.name}</span>
                                  <span className="text-[11px] text-slate-400 font-normal">({patient.nameTelugu})</span>
                                </div>
                                <div className="text-[10px] font-mono text-slate-400">{patient.id}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="text-slate-800 font-medium">{patient.age} yrs • {patient.gender}</div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{patient.phone}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-800">{patient.condition}</div>
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold mt-0.5 ${
                              patient.risk === 'High Risk' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                              patient.risk === 'Moderate' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                              'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}>
                              {patient.risk}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{patient.doctor}</div>
                            <div className="text-[10px] text-blue-600">{patient.dept}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-lg bg-slate-100 font-mono font-bold text-slate-800 border border-slate-200">
                              {patient.token}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-1">{patient.room}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              isInConsult ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              isWaiting ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                              isCompleted ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                              'bg-purple-50 text-purple-700 border border-purple-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                isInConsult ? 'bg-emerald-500 animate-pulse' :
                                isWaiting ? 'bg-amber-500' :
                                isCompleted ? 'bg-blue-500' :
                                'bg-purple-500'
                              }`} />
                              <span>{patient.status}</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => {
                                const pass: DigitalPassData = {
                                  token_number: patient.token,
                                  confirmation_code: `CB-2026-${patient.token}`,
                                  patient_name: patient.name,
                                  patient_uid: patient.id,
                                  doctor_name: patient.doctor,
                                  specialization: patient.dept,
                                  department: patient.dept,
                                  hospital_name: "Hospital B (CareBridge Central)",
                                  room_number: patient.room,
                                  date: "Today",
                                  time: "10:30 AM",
                                  simulated_wait_min: 15,
                                  current_serving_token: "GM-022",
                                  patients_ahead: 2,
                                  consultation_fee: 600,
                                  instructions: "Please report 10 minutes prior."
                                };
                                onOpenPass(pass);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold inline-flex items-center gap-1 transition cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-blue-600" />
                              <span>View OPD Pass</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
