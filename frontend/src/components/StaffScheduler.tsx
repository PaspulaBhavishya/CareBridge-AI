import React, { useState } from 'react';
import { 
  AlertTriangle, CheckCircle2, Clock, Stethoscope, RefreshCw, 
  Activity, TrendingDown, Users, Sparkles, Search, Phone, 
  Building2, Calendar, UserCheck, ShieldAlert
} from 'lucide-react';
import type { AppointmentRecord, ScheduleConflictRecord } from '../types';
import { getTranslation } from '../utils/translations';

interface StaffSchedulerProps {
  appointments: AppointmentRecord[];
  conflicts: ScheduleConflictRecord[];
  onResolveConflict: (conflictId: number) => void;
  isLoading: boolean;
  onRefresh: () => void;
  language?: string;
}

interface DoctorRosterEntry {
  id: string;
  name: string;
  nameTe: string;
  title: string;
  titleTe: string;
  department: string;
  deptTe: string;
  deptCategory: 'Cardiology' | 'General Medicine' | 'Orthopedics' | 'Neurology' | 'Emergency';
  room: string;
  roomTe: string;
  floor: string;
  floorTe: string;
  shift: string;
  shiftTe: string;
  status: 'ON_DUTY' | 'IN_CONSULTATION' | 'STANDBY' | 'UPCOMING';
  servingToken: string;
  waitingCount: number;
  contactExt: string;
  avatarBg: string;
  initials: string;
}

const DOCTOR_ROSTER_DATA: DoctorRosterEntry[] = [
  {
    id: "DOC-2041",
    name: "Dr. Naveen Kumar",
    nameTe: "డా. నవీన్ కుమార్",
    title: "Senior Interventional Cardiologist",
    titleTe: "సీనియర్ కార్డియాలజిస్ట్",
    department: "Cardiology",
    deptTe: "కార్డియాలజీ విభాగం",
    deptCategory: "Cardiology",
    room: "Room 102",
    roomTe: "గది 102",
    floor: "1st Floor, Wing A",
    floorTe: "1వ అంతస్తు, వింగ్ A",
    shift: "09:00 AM – 02:00 PM",
    shiftTe: "ఉదయం 09:00 – మధ్యాహ్నం 02:00",
    status: "ON_DUTY",
    servingToken: "C-22",
    waitingCount: 3,
    contactExt: "Ext: 102",
    avatarBg: "bg-blue-600 text-white",
    initials: "NK"
  },
  {
    id: "DOC-2042",
    name: "Dr. Priya Sharma",
    nameTe: "డా. ప్రియ శర్మ",
    title: "Consultant Physician",
    titleTe: "కన్సల్టెంట్ ఫిజీషియన్",
    department: "General Medicine",
    deptTe: "జనరల్ మెడిసిన్ (సాధారణ వైద్యం)",
    deptCategory: "General Medicine",
    room: "Room OPD-03",
    roomTe: "గది OPD-03",
    floor: "Ground Floor, OPD Block",
    floorTe: "గ్రౌండ్ ఫ్లోర్, ఓపీడీ బ్లాక్",
    shift: "08:30 AM – 01:30 PM",
    shiftTe: "ఉదయం 08:30 – మధ్యాహ్నం 01:30",
    status: "IN_CONSULTATION",
    servingToken: "GM-022",
    waitingCount: 4,
    contactExt: "Ext: 103",
    avatarBg: "bg-emerald-600 text-white",
    initials: "PS"
  },
  {
    id: "DOC-2043",
    name: "Dr. Ananya Sen",
    nameTe: "డా. అనన్య సేన్",
    title: "Lead Cardiologist & Arrhythmia",
    titleTe: "ప్రధాన కార్డియాలజిస్ట్",
    department: "Cardiology",
    deptTe: "కార్డియాలజీ విభాగం",
    deptCategory: "Cardiology",
    room: "Room 204",
    roomTe: "గది 204",
    floor: "2nd Floor, Wing B",
    floorTe: "2వ అంతస్తు, వింగ్ B",
    shift: "10:00 AM – 04:00 PM",
    shiftTe: "ఉదయం 10:00 – సాయంత్రం 04:00",
    status: "ON_DUTY",
    servingToken: "C-14",
    waitingCount: 2,
    contactExt: "Ext: 204",
    avatarBg: "bg-indigo-600 text-white",
    initials: "AS"
  },
  {
    id: "DOC-2044",
    name: "Dr. Harika Varma",
    nameTe: "డా. హారిక వర్మ",
    title: "Consultant Physician & Diabetes Care",
    titleTe: "డయాబెటిస్ & జనరల్ మెడిసిన్",
    department: "General Medicine",
    deptTe: "జనరల్ మెడిసిన్",
    deptCategory: "General Medicine",
    room: "Room 105",
    roomTe: "గది 105",
    floor: "1st Floor, OPD Block",
    floorTe: "1వ అంతస్తు, ఓపీడీ బ్లాక్",
    shift: "09:00 AM – 03:00 PM",
    shiftTe: "ఉదయం 09:00 – మధ్యాహ్నం 03:00",
    status: "ON_DUTY",
    servingToken: "GM-09",
    waitingCount: 2,
    contactExt: "Ext: 105",
    avatarBg: "bg-teal-600 text-white",
    initials: "HV"
  },
  {
    id: "DOC-2045",
    name: "Dr. Pradeep Chandra",
    nameTe: "డా. ప్రదీప్ చంద్ర",
    title: "Senior Orthopedic Surgeon",
    titleTe: "సీనియర్ ఆర్థోపెడిక్ సర్జన్",
    department: "Orthopedics",
    deptTe: "ఆర్థోపెడిక్స్ (ఎముకల విభాగం)",
    deptCategory: "Orthopedics",
    room: "Room 012",
    roomTe: "గది 012",
    floor: "Ground Floor, Trauma Wing",
    floorTe: "గ్రౌండ్ ఫ్లోర్, ట్రామా విభాగం",
    shift: "11:00 AM – 05:00 PM",
    shiftTe: "ఉదయం 11:00 – సాయంత్రం 05:00",
    status: "ON_DUTY",
    servingToken: "OR-08",
    waitingCount: 1,
    contactExt: "Ext: 012",
    avatarBg: "bg-amber-600 text-white",
    initials: "PC"
  },
  {
    id: "DOC-2046",
    name: "Dr. Suresh Varma",
    nameTe: "డా. సురేష్ వర్మ",
    title: "Auxiliary On-Call Specialist",
    titleTe: "సహాయక స్పెషలిస్ట్",
    department: "Emergency / Auxiliary",
    deptTe: "అత్యవసర & బ్యాకప్ కార్డియాలజీ",
    deptCategory: "Emergency",
    room: "Auxiliary Room 104",
    roomTe: "సహాయక గది 104",
    floor: "1st Floor, Surge Block",
    floorTe: "1వ అంతస్తు, సర్జ్ బ్లాక్",
    shift: "Standby / Surge Response",
    shiftTe: "స్టాండ్‌బై / రద్దీ సహాయక షిఫ్ట్",
    status: "STANDBY",
    servingToken: "Surge Buffer",
    waitingCount: 0,
    contactExt: "Ext: 104",
    avatarBg: "bg-purple-600 text-white",
    initials: "SV"
  },
  {
    id: "DOC-2047",
    name: "Dr. N. Sudhakar",
    nameTe: "డా. ఎన్. సుధాకర్",
    title: "Consultant Neurologist",
    titleTe: "కన్సల్టెంట్ న్యూరాలజిస్ట్",
    department: "Neurology",
    deptTe: "నాడీ సంబంధిత విభాగం (న్యూరాలజీ)",
    deptCategory: "Neurology",
    room: "Room 402",
    roomTe: "గది 402",
    floor: "4th Floor, Wing C",
    floorTe: "4వ అంతస్తు, వింగ్ C",
    shift: "01:00 PM – 07:00 PM",
    shiftTe: "మధ్యాహ్నం 01:00 – రాత్రి 07:00",
    status: "UPCOMING",
    servingToken: "Starts 1:00 PM",
    waitingCount: 0,
    contactExt: "Ext: 402",
    avatarBg: "bg-slate-600 text-white",
    initials: "NS"
  }
];

export const StaffScheduler: React.FC<StaffSchedulerProps> = ({
  appointments,
  conflicts,
  onResolveConflict,
  isLoading,
  onRefresh,
  language = 'en'
}) => {
  const t = getTranslation(language);
  const isTe = (language || '').toLowerCase().startsWith('te') || (language || '').toLowerCase().includes('telugu');

  const [activeSubTab, setActiveSubTab] = useState<'rosters' | 'conflicts' | 'appointments'>('rosters');
  const [doctorSearch, setDoctorSearch] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<'ALL' | 'Cardiology' | 'General Medicine' | 'Orthopedics' | 'ON_DUTY'>('ALL');
  const [apptSearch, setApptSearch] = useState('');
  const [crowdActionApproved, setCrowdActionApproved] = useState(false);
  const [showImpact, setShowImpact] = useState(false);

  const pendingConflicts = conflicts.filter(c => c.status === 'PENDING');
  const resolvedConflicts = conflicts.filter(c => c.status === 'RESOLVED');

  // Filter doctor roster entries
  const filteredDoctors = DOCTOR_ROSTER_DATA.filter((doc) => {
    const searchLower = doctorSearch.toLowerCase();
    const matchesSearch = 
      doc.name.toLowerCase().includes(searchLower) ||
      doc.nameTe.toLowerCase().includes(searchLower) ||
      doc.department.toLowerCase().includes(searchLower) ||
      doc.deptTe.toLowerCase().includes(searchLower) ||
      doc.room.toLowerCase().includes(searchLower) ||
      doc.roomTe.toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    if (selectedDeptFilter === 'ALL') return true;
    if (selectedDeptFilter === 'ON_DUTY') return doc.status === 'ON_DUTY' || doc.status === 'IN_CONSULTATION';
    return doc.deptCategory === selectedDeptFilter;
  });

  // Filter appointments
  const filteredAppointments = appointments.filter((appt) => {
    const q = apptSearch.toLowerCase();
    return (
      (appt.confirmation_code || '').toLowerCase().includes(q) ||
      (appt.patient_name || '').toLowerCase().includes(q) ||
      (appt.doctor_name || '').toLowerCase().includes(q) ||
      (appt.department || '').toLowerCase().includes(q) ||
      (appt.hospital || '').toLowerCase().includes(q)
    );
  });

  // Helper for translating appointment status
  const translateApptStatus = (status: string) => {
    if (!isTe) return status;
    const s = (status || '').toUpperCase();
    if (s.includes('CONFIRMED')) return t.confirmed;
    if (s.includes('WAITING')) return t.waiting;
    if (s.includes('COMPLETED')) return t.completed;
    if (s.includes('IN_CONSULTATION') || s.includes('CONSULT')) return t.in_consultation;
    if (s.includes('PENDING')) return 'పెండింగ్‌లో ఉంది';
    if (s.includes('CANCEL')) return 'రద్దు చేయబడింది';
    return status;
  };

  // Helper for status badge formatting
  const renderDoctorStatusBadge = (status: DoctorRosterEntry['status']) => {
    switch (status) {
      case 'ON_DUTY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
            {t.status_on_duty}
          </span>
        );
      case 'IN_CONSULTATION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
            {t.status_in_consultation}
          </span>
        );
      case 'STANDBY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-600" />
            {t.status_backup_ready}
          </span>
        );
      case 'UPCOMING':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <Clock className="h-3 w-3 text-slate-400" />
            {t.status_upcoming_shift}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {t.roster_hub_title}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {isTe ? "ఫ్రంట్ డెస్క్ & ఓపీడీ రోస్టర్" : "Front Desk & OPD Hub"}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 font-medium">
                  CareBridge Hospital Network
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-2 max-w-3xl leading-relaxed">
            {t.roster_hub_subtitle}
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition cursor-pointer shadow-xs self-stretch sm:self-auto justify-center"
        >
          <RefreshCw className={`h-4 w-4 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{t.btn_refresh_schedules}</span>
        </button>
      </div>

      {/* Autonomous Operational Crowd Alert & Agent Suggestions */}
      <div className="p-5 rounded-2xl bg-white border border-indigo-100 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-wider">
                {isTe ? "స్వయంప్రతిపత్తి గల ఆసుపత్రి టెలిమెట్రీ • డిజిటల్ ట్విన్" : "Autonomous Operational Telemetry • Hospital Twin"}
              </span>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>{t.crowd_alert_title}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  {t.crowd_surge_badge}
                </span>
              </h3>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200 self-start sm:self-auto">
            {t.telemetry_node_label}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
          <div className="flex items-start gap-2.5 text-slate-700">
            <Sparkles className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-blue-700">{t.agent_recommendation_label}</strong>{" "}
              {t.crowd_recommendation_text}
            </div>
          </div>

          {showImpact && (
            <div className="mt-2 p-3 rounded-xl bg-white border border-slate-200 text-[11px] font-mono grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-700 animate-fade-in shadow-xs">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-amber-500" />
                <span>{t.current_queue_label}: <strong>42 {isTe ? 'మంది రోగులు' : 'patients'}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-emerald-600" />
                <span>{t.projected_queue_label}: <strong>24 {isTe ? 'మంది రోగులు' : 'patients'} (-43%)</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span>{t.wait_reduction_label}: <strong>-35 {isTe ? 'నిమిషాలు' : 'minutes'}</strong></span>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>{t.telemetry_updated_sync}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowImpact(!showImpact)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition cursor-pointer"
            >
              {showImpact ? t.btn_hide_impact : t.btn_view_impact}
            </button>

            {crowdActionApproved ? (
              <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>{t.recommendation_applied_badge}</span>
              </div>
            ) : (
              <button
                onClick={() => setCrowdActionApproved(true)}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{t.btn_approve_recommendation}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Roster & Hub Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('rosters')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeSubTab === 'rosters'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <UserCheck className="h-3.5 w-3.5" />
          <span>{t.tab_doctor_rosters}</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
            activeSubTab === 'rosters' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {DOCTOR_ROSTER_DATA.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('conflicts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeSubTab === 'conflicts'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>{t.tab_conflicts}</span>
          {pendingConflicts.length > 0 ? (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-bold">
              {pendingConflicts.length}
            </span>
          ) : (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-700">
              0
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('appointments')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeSubTab === 'appointments'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Calendar className="h-3.5 w-3.5" />
          <span>{t.tab_appointments}</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
            activeSubTab === 'appointments' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {appointments.length}
          </span>
        </button>
      </div>

      {/* SUBTAB 1: DOCTOR DUTY ROSTERS */}
      {activeSubTab === 'rosters' && (
        <div className="space-y-4">
          {/* Controls: Search and Department Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={t.doctor_search_placeholder}
                value={doctorSearch}
                onChange={(e) => setDoctorSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <button
                onClick={() => setSelectedDeptFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedDeptFilter === 'ALL'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 font-bold'
                    : 'text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {t.filter_all_doctors}
              </button>
              <button
                onClick={() => setSelectedDeptFilter('Cardiology')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedDeptFilter === 'Cardiology'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 font-bold'
                    : 'text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {t.filter_cardiology}
              </button>
              <button
                onClick={() => setSelectedDeptFilter('General Medicine')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedDeptFilter === 'General Medicine'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 font-bold'
                    : 'text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {t.filter_general_med}
              </button>
              <button
                onClick={() => setSelectedDeptFilter('Orthopedics')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedDeptFilter === 'Orthopedics'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 font-bold'
                    : 'text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {t.filter_orthopedics}
              </button>
              <button
                onClick={() => setSelectedDeptFilter('ON_DUTY')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedDeptFilter === 'ON_DUTY'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold'
                    : 'text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {t.filter_on_duty}
              </button>
            </div>
          </div>

          {/* Doctors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDoctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 p-5 shadow-xs transition hover:shadow-sm space-y-3.5 flex flex-col justify-between"
              >
                {/* Top: Avatar, Name & Status */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs ${doc.avatarBg}`}>
                        {doc.initials}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {isTe ? doc.nameTe : doc.name}
                        </h4>
                        <div className="text-[11px] text-blue-600 font-medium">
                          {isTe ? doc.deptTe : doc.department}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {isTe ? doc.titleTe : doc.title}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    {renderDoctorStatusBadge(doc.status)}
                    <span className="text-[11px] font-mono text-slate-400">
                      ID: {doc.id}
                    </span>
                  </div>
                </div>

                {/* Details Section */}
                <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-2 border border-slate-150">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-slate-400" />
                      {t.room_desk_label}:
                    </span>
                    <strong className="text-slate-900 font-semibold">
                      {isTe ? doc.roomTe : doc.room}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between text-slate-700">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {t.shift_label}:
                    </span>
                    <strong className="text-slate-800 font-medium">
                      {isTe ? doc.shiftTe : doc.shift}
                    </strong>
                  </div>

                  <div className="pt-1.5 border-t border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400 uppercase font-mono">{t.serving_now_label}:</span>
                      <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold font-mono text-[11px]">
                        {doc.servingToken}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px]">
                      <Users className="h-3 w-3 text-slate-400" />
                      <span className="text-slate-600 font-medium">
                        {doc.waitingCount} {t.waiting_count_label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom: Contact & Floor */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3 text-slate-400" />
                    {doc.contactExt}
                  </span>
                  <span>{isTe ? doc.floorTe : doc.floor}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 2: SCHEDULE CONFLICTS */}
      {activeSubTab === 'conflicts' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>{t.conflicts_section_title}</span>
              {pendingConflicts.length > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  {pendingConflicts.length} {t.action_required_badge}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {t.all_conflicts_cleared}
                </span>
              )}
            </h3>
          </div>

          {pendingConflicts.length === 0 && resolvedConflicts.length === 0 && (
            <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-500 shadow-xs">
              {t.no_conflicts_detected}
            </div>
          )}

          {pendingConflicts.map((c) => (
            <div
              key={c.conflict_id}
              className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3 shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold text-amber-800">
                      {t.conflict_label} #{c.conflict_id} • {c.conflict_type}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {c.doctor_name} ({c.department}) — {c.hospital_name}
                    </h4>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 self-start sm:self-auto">
                  {t.pending_staff_approval}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-amber-200/80 text-xs space-y-1.5 shadow-xs">
                <div className="text-slate-700">
                  <strong className="text-slate-900">{t.issue_label}</strong> {c.description}
                </div>
                <div className="text-emerald-700 font-medium">
                  <strong className="text-slate-900">{t.ai_proposed_resolution}</strong> {c.suggested_resolution}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => onResolveConflict(c.conflict_id)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{t.btn_approve_apply}</span>
                </button>
              </div>
            </div>
          ))}

          {resolvedConflicts.map((c) => (
            <div
              key={c.conflict_id}
              className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs flex items-center justify-between gap-3 text-slate-600 shadow-xs"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>
                  {t.resolved_label} {c.doctor_name} — {c.suggested_resolution}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {t.resolved_badge}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* SUBTAB 3: CONFIRMED APPOINTMENTS */}
      {activeSubTab === 'appointments' && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>{t.confirmed_appts_title}</span>
              <span className="text-xs text-slate-500">
                ({appointments.length} {isTe ? 'యాక్టివ్' : 'active'})
              </span>
            </h3>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder={t.appts_search_placeholder}
                value={apptSearch}
                onChange={(e) => setApptSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">{t.col_code}</th>
                  <th className="px-4 py-3">{t.col_patient}</th>
                  <th className="px-4 py-3">{t.col_doctor}</th>
                  <th className="px-4 py-3">{t.col_hospital}</th>
                  <th className="px-4 py-3">{t.col_datetime}</th>
                  <th className="px-4 py-3">{t.col_est_wait}</th>
                  <th className="px-4 py-3">{t.col_smartflow_score}</th>
                  <th className="px-4 py-3">{t.col_status}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                      {t.no_appts_found}
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((appt) => (
                    <tr key={appt.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-4 py-3 font-mono font-bold text-blue-600">
                        {appt.confirmation_code}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {appt.patient_name}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-slate-900 font-medium">{appt.doctor_name}</div>
                        <div className="text-[10px] text-slate-400">{appt.department}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {appt.hospital}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{appt.date}</div>
                        <div className="text-[10px] text-slate-400">{appt.time}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-mono">
                          <Clock className="h-3 w-3" />
                          <span>{appt.simulated_wait_min}{isTe ? 'నిమి' : 'm'}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-blue-600">
                        {Math.round(appt.smartflow_score * 100)}%
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {translateApptStatus(appt.status)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
