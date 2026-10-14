import React from 'react';
import { 
  Activity, Shield, RefreshCw, Globe, User, Sparkles, 
  CheckCircle2, UserPlus, LogOut, Stethoscope, Ticket, Tv, FileText, Printer,
  HeartHandshake, BarChart3, Bell, Zap
} from 'lucide-react';
import type { UserProfile } from '../types';

interface HeaderProps {
  currentProfile: UserProfile;
  profiles?: UserProfile[];
  onSelectProfile: (roleOrId: string | number) => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  onResetDemo: () => void;
  isResetting: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  seniorMode: boolean;
  onToggleSeniorMode: () => void;
  onOpenEmergencySOS: () => void;
  onSignOut?: () => void;
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
  onOpenSafetyCenter?: () => void;
  onOpenSafetyContract?: () => void;
  onOpenArchitecture?: () => void;
  onStartJudgeDemo?: () => void;
}

export const USER_PROFILES: Record<string, UserProfile> = {
  patient: {
    id: 1,
    name: "Bhavishya",
    role: "patient",
    languagePref: "Telugu / English",
    description: "Primary Patient (భవిష్య)",
    avatar: "BH",
    badge: "Patient Portal",
    patient_uid: "PAT-1000",
    phone: "+91 98765 43210"
  },
  patient_mythri: {
    id: 9,
    name: "Mythri",
    role: "patient",
    languagePref: "English",
    description: "New Patient (మైత్రి - Fresh Portal)",
    avatar: "MY",
    badge: "New Patient Portal",
    patient_uid: "PAT-D7F2",
    phone: "+91 83093 58353",
    is_new: true
  },
  patient_telugu: {
    id: 2,
    name: "Sunitha Reddy",
    role: "patient",
    languagePref: "Telugu",
    description: "Multilingual Patient (తెలుగు)",
    avatar: "SR",
    badge: "తెలుగు పేషెంట్",
    patient_uid: "PAT-1002",
    phone: "+91 98480 12345"
  },
  receptionist: {
    id: 3,
    name: "Priya Sharma",
    role: "receptionist",
    languagePref: "English",
    description: "Hospital Receptionist",
    avatar: "PS",
    badge: "Staff Desk",
    patient_uid: "STAFF-2001",
    phone: "+91 91234 56789"
  },
  admin: {
    id: 4,
    name: "Dr. Varma",
    role: "admin",
    languagePref: "English",
    description: "Chief Hospital Administrator",
    avatar: "DV",
    badge: "Admin Access",
    patient_uid: "ADMIN-3001",
    phone: "+91 99999 88888"
  },
  doctor: {
    id: 5,
    name: "Dr. Naveen Kumar",
    role: "doctor",
    languagePref: "Telugu / English",
    description: "Lead Cardiologist (CareBridge Guntur)",
    avatar: "NK",
    badge: "Hospital Doctor",
    patient_uid: "DOC-2041",
    phone: "+91 98480 22334",
    specialization: "Cardiologist",
    room_number: "Room 102 (1st Floor)"
  },
  doctor_priya: {
    id: 7,
    name: "Dr. Priya",
    role: "doctor",
    languagePref: "Telugu / English",
    description: "Consultant Physician (General Medicine)",
    avatar: "DP",
    badge: "Hospital Doctor",
    patient_uid: "DOC-2042",
    phone: "+91 98480 99887",
    specialization: "General Medicine",
    room_number: "Room OPD-03"
  }
};

export const Header: React.FC<HeaderProps> = ({
  currentProfile,
  profiles = [],
  onSelectProfile,
  language,
  onLanguageChange,
  onResetDemo,
  isResetting,
  activeTab,
  onTabChange,
  seniorMode,
  onToggleSeniorMode,
  onOpenEmergencySOS,
  onSignOut,
  unreadNotificationsCount = 0,
  onOpenNotifications,
  onOpenSafetyCenter,
  onOpenSafetyContract,
  onOpenArchitecture,
  onStartJudgeDemo
}) => {
  const isPatient = currentProfile.role === 'patient';
  const isDoctor = currentProfile.role === 'doctor';
  const isReceptionist = currentProfile.role === 'receptionist';
  const isAdmin = currentProfile.role === 'admin';

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-30 shadow-2xl">
      {/* Radiant Rainbow Spectrum Bar along top */}
      <div className="h-1.5 w-full rainbow-bar shadow-md" />

      {/* Subtle Global Prototype Notice Bar (Item 4) */}
      <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 sm:px-6 py-1 text-[11px] text-slate-300 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            [Prototype Data]
          </span>
          <span className="text-slate-300">
            Demo Environment: All hospital records, doctors, slots, and token values are simulated prototype data.
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            [Configured Demo Network]
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            [Approval-Aware Agent]
          </span>
        </div>
      </div>

      {/* Top Banner with Brand & Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-500 via-cyan-400 to-emerald-400 p-[2px] shadow-lg shadow-purple-500/25 animate-rainbow-glow">
            <div className="h-full w-full rounded-[10px] bg-slate-950/90 flex items-center justify-center">
              <Activity className="h-6 w-6 text-cyan-300 animate-pulse-subtle" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">CareBridge AI</h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white/10 text-slate-200 border border-white/20 shadow-sm flex items-center gap-1">
                <span>🌈 Rainbow Theme</span>
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                isDoctor ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' :
                isReceptionist ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' :
                isAdmin ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}>
                {currentProfile.badge || currentProfile.role.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Logged in: <strong className="text-slate-200">{currentProfile.name}</strong> ({currentProfile.role.toUpperCase()})
            </p>
          </div>
        </div>

        {/* Action Buttons: Emergency SOS, Senior Mode, Language, Demo Reset, Sign Out */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Emergency SOS Button (Only for Patient or general) */}
          {isPatient && (
            <button
              onClick={onOpenEmergencySOS}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition animate-pulse"
              title="Immediate Ambulance 108 & Trauma Triage"
            >
              <span>🚨 Emergency SOS</span>
            </button>
          )}

          {/* Senior Mode Toggle Button */}
          <button
            onClick={onToggleSeniorMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
              seniorMode
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/30 font-bold'
                : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:text-white'
            }`}
            title="Toggle Large Fonts & High Contrast for Senior Citizens"
          >
            <span>👵 Senior Mode {seniorMode ? 'ON' : 'OFF'}</span>
          </button>
          {/* Role Dropdown (Dynamic registered users + defaults) */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 rounded-lg p-1">
            <User className="h-4 w-4 text-slate-400 ml-1.5" />
            <select
              value={currentProfile.id}
              onChange={(e) => onSelectProfile(Number(e.target.value))}
              className="bg-transparent text-xs font-medium text-slate-200 focus:outline-none cursor-pointer pr-2 max-w-[180px] truncate"
            >
              {profiles && profiles.length > 0 ? (
                profiles.map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                    {p.role === 'patient' ? '👤' : p.role === 'doctor' ? '🩺' : p.role === 'receptionist' ? '💼' : '🛡️'}{' '}
                    {p.name} ({p.role === 'patient' && p.languagePref === 'Telugu' ? 'తెలుగు' : p.role.toUpperCase()})
                  </option>
                ))
              ) : (
                <>
                  <option value={1} className="bg-slate-900 text-slate-200">
                    👤 Ravi Kumar (PATIENT - EN)
                  </option>
                  <option value={2} className="bg-slate-900 text-slate-200">
                    👤 Sunitha Reddy (తెలుగు)
                  </option>
                  <option value={3} className="bg-slate-900 text-slate-200">
                    💼 Priya Sharma (RECEPTIONIST)
                  </option>
                  <option value={4} className="bg-slate-900 text-slate-200">
                    🛡️ Dr. Varma (ADMIN)
                  </option>
                  <option value={5} className="bg-slate-900 text-slate-200">
                    🩺 Dr. Ananya Sen (DOCTOR)
                  </option>
                </>
              )}
            </select>
          </div>

          {/* Quick Register Button */}
          <button
            onClick={() => onTabChange('register')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
              activeTab === 'register'
                ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-600/30 font-bold'
                : 'bg-purple-950/40 text-purple-300 border-purple-700/50 hover:bg-purple-900/50 hover:text-white'
            }`}
            title="Register new patient, doctor, or receptionist"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>➕ Register</span>
          </button>

          {/* Demo Mode Indicator Badge */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-semibold" title="Simulated hospital networks and synthetic queue dynamics">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span>Mode: Demo Simulation (Sample Data)</span>
          </div>

          {/* 1-Click Judge Demo Button (Item 10) */}
          {onStartJudgeDemo && (
            <button
              onClick={onStartJudgeDemo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/25 transition cursor-pointer"
              title="Launch 3-Minute Competition Pitch Flow: Bhavishya Telugu Booking -> SmartFlow -> HITL -> Token Pass"
            >
              <Zap className="h-3.5 w-3.5 fill-slate-950" />
              <span>Start Judge Demo</span>
            </button>
          )}

          {/* Safety Contract Button (Item 3) */}
          {onOpenSafetyContract && (
            <button
              onClick={onOpenSafetyContract}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-emerald-500/40 hover:bg-emerald-950/30 text-emerald-300 text-xs font-semibold transition cursor-pointer"
              title="View Agent Capabilities & Safety Boundaries"
            >
              <Shield className="h-3.5 w-3.5 text-emerald-400" />
              <span className="hidden lg:inline">Safety Contract</span>
            </button>
          )}

          {/* Technical Architecture & States Button (Item 9) */}
          {onOpenArchitecture && (
            <button
              onClick={onOpenArchitecture}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-purple-500/40 hover:bg-purple-950/30 text-purple-300 text-xs font-semibold transition cursor-pointer"
              title="View 5-Layer Decision Pipeline & 8 Agent Lifecycle States"
            >
              <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              <span className="hidden lg:inline">Architecture & States</span>
            </button>
          )}

          {/* Trust & Safety Center Button */}
          {onOpenSafetyCenter && (
            <button
              onClick={onOpenSafetyCenter}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/80 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 text-xs font-semibold transition cursor-pointer"
              title="Trust, Clinical Disclaimer, DPDP Compliance & Caretaker Access"
            >
              <Shield className="h-3.5 w-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Trust & Safety</span>
            </button>
          )}

          {/* Notification Center Bell Icon */}
          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              className="relative h-8 w-8 rounded-lg bg-slate-900/90 border border-slate-700/80 hover:bg-slate-800 text-slate-300 hover:text-amber-300 flex items-center justify-center transition cursor-pointer"
              title="Notifications & Live Queue Alerts"
            >
              <Bell className="h-4 w-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center border border-slate-900 animate-pulse">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
          )}

          {/* Language Selector (EN, Telugu, Teluglish) */}
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 rounded-lg p-1">
            <Globe className="h-4 w-4 text-slate-400 ml-1" />
            <button
              onClick={() => onLanguageChange('auto')}
              className={`px-2 py-0.5 rounded text-xs font-medium transition ${
                language === 'auto'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Auto
            </button>
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2 py-0.5 rounded text-xs font-medium transition ${
                language === 'en'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onLanguageChange('te')}
              className={`px-2 py-0.5 rounded text-xs font-medium transition ${
                language === 'te'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              తెలుగు
            </button>
            <button
              onClick={() => onLanguageChange('teluglish')}
              className={`px-2 py-0.5 rounded text-xs font-medium transition ${
                language === 'teluglish'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Mixed Telugu & English (e.g. 'Naaku repu appointment kavali')"
            >
              Teluglish
            </button>
          </div>

          {/* Demo Reset Button */}
          <button
            onClick={onResetDemo}
            disabled={isResetting}
            title="Reset database to pristine demo state"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-300 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-400 ${isResetting ? 'animate-spin' : ''}`} />
            <span>Reset Demo</span>
          </button>

          {/* Sign Out Button */}
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-700/50 text-rose-300 text-xs font-semibold transition cursor-pointer"
              title="Sign Out to Register/Sign In Gateway"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {/* Role-Specific Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto border-t border-slate-800/60 pt-1 pb-1">
        {/* PATIENT TABS */}
        {isPatient && (
          <>
            <button
              onClick={() => onTabChange('patient_hub')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'patient_hub'
                  ? 'bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 text-white border border-purple-500/40 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Ticket className="h-3.5 w-3.5 text-pink-400" />
              <span>Patient Hub (రోగి డ్యాష్‌బోర్డ్)</span>
            </button>
            <button
              onClick={() => onTabChange('chat')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'chat'
                  ? 'bg-gradient-to-r from-cyan-500/20 via-teal-500/20 to-emerald-500/20 text-cyan-200 border border-cyan-500/40 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>CareBridge AI Agent (అపాయింట్‌మెంట్ బుకింగ్)</span>
            </button>
            <button
              onClick={() => onTabChange('scanner')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'scanner'
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-200 border border-emerald-500/40 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <FileText className="h-3.5 w-3.5 text-emerald-400" />
              <span>Medical Report & Rx Scanner (ల్యాబ్ రిపోర్ట్ స్కాన్)</span>
            </button>
            <button
              onClick={() => onTabChange('my_passes')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'my_passes'
                  ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Ticket className="h-3.5 w-3.5" />
              <span>My Appointments & Digital OPD Pass (నా పాస్‌లు)</span>
            </button>
            <button
              onClick={() => onTabChange('access_mode')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'access_mode'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <HeartHandshake className="h-3.5 w-3.5 text-emerald-400" />
              <span>Inclusive Access Mode (సులభ ప్రవేశం)</span>
            </button>
            <button
              onClick={() => onTabChange('smartflow')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'smartflow'
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Activity className="h-3.5 w-3.5 text-cyan-400" />
              <span>SmartFlow 2.0 Network</span>
            </button>
            <button
              onClick={() => onTabChange('recovery_mode')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'recovery_mode'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>Recovery Mode (కిల్లర్ ఫీచర్)</span>
            </button>
            <button
              onClick={() => onTabChange('privacy_consent')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'privacy_consent'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Shield className="h-3.5 w-3.5 text-emerald-400" />
              <span>Privacy & Consent (గోప్యత)</span>
            </button>
            <button
              onClick={() => onTabChange('session_replay')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'session_replay'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>Session Replay (జడ్జ్ రీప్లే)</span>
            </button>
            <button
              onClick={() => onTabChange('smartflow_whatif')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'smartflow_whatif'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Activity className="h-3.5 w-3.5 text-purple-400" />
              <span>What-If Simulator</span>
            </button>
            <button
              onClick={() => onTabChange('tv')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'tv'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Tv className="h-3.5 w-3.5 text-blue-400" />
              <span>OPD Waiting Hall TV (టీవీ స్క్రీన్)</span>
            </button>
          </>
        )}

        {/* DOCTOR TABS */}
        {isDoctor && (
          <>
            <button
              onClick={() => onTabChange('doctor_dashboard')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'doctor_dashboard'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Stethoscope className="h-3.5 w-3.5" />
              <span>Doctor OPD Roster & Patient Queue (వైద్యుల ఓపీడీ)</span>
            </button>
            <button
              onClick={() => onTabChange('tv')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'tv'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Tv className="h-3.5 w-3.5 text-blue-400" />
              <span>Waiting Hall TV Queue</span>
            </button>
            <button
              onClick={() => onTabChange('chat')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'chat'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Clinical AI Assistant</span>
            </button>
          </>
        )}

        {/* RECEPTIONIST TABS */}
        {isReceptionist && (
          <>
            <button
              onClick={() => onTabChange('kiosk')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'kiosk'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Printer className="h-3.5 w-3.5 text-blue-400" />
              <span>15-Sec Walk-In Kiosk (వాక్-ఇన్ టోకెన్)</span>
            </button>
            <button
              onClick={() => onTabChange('tv')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'tv'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Tv className="h-3.5 w-3.5 text-cyan-400" />
              <span>OPD Waiting Hall TV Display</span>
            </button>
            <button
              onClick={() => onTabChange('staff')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'staff'
                  ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Staff & Conflicts Hub (షెడ్యూల్ ఆడిట్)</span>
            </button>
            <button
              onClick={() => onTabChange('scanner')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'scanner'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <FileText className="h-3.5 w-3.5 text-teal-400" />
              <span>Report Scanner</span>
            </button>
            <button
              onClick={() => onTabChange('smartflow')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'smartflow'
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              <span>SmartFlow Hospital Network</span>
            </button>
            <button
              onClick={() => onTabChange('register')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'register'
                  ? 'bg-purple-500/15 text-purple-300 border border-purple-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>OPD Registration Desk (నమోదు)</span>
            </button>
            <button
              onClick={() => onTabChange('access_mode')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'access_mode'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <HeartHandshake className="h-3.5 w-3.5 text-emerald-400" />
              <span>CareBridge Access Mode</span>
            </button>
            <button
              onClick={() => onTabChange('chat')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'chat'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>CareBridge AI Agent</span>
            </button>
          </>
        )}

        {/* ADMIN TABS */}
        {isAdmin && (
          <>
            <button
              onClick={() => onTabChange('evaluation')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'evaluation'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5 text-blue-400" />
              <span>AI Evaluation & Impact</span>
            </button>
            <button
              onClick={() => onTabChange('session_replay')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'session_replay'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>Agent Session Replay</span>
            </button>
            <button
              onClick={() => onTabChange('recovery_mode')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'recovery_mode'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>Recovery Mode Demo</span>
            </button>
            <button
              onClick={() => onTabChange('privacy_consent')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'privacy_consent'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Shield className="h-3.5 w-3.5 text-emerald-400" />
              <span>Privacy & Consent Ledger</span>
            </button>
            <button
              onClick={() => onTabChange('smartflow_whatif')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'smartflow_whatif'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Activity className="h-3.5 w-3.5 text-purple-400" />
              <span>What-If Simulator</span>
            </button>
            <button
              onClick={() => onTabChange('smartflow')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'smartflow'
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              <span>SmartFlow 2.0 Twin</span>
            </button>
            <button
              onClick={() => onTabChange('access_mode')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'access_mode'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <HeartHandshake className="h-3.5 w-3.5 text-emerald-400" />
              <span>Inclusive Access Mode</span>
            </button>
            <button
              onClick={() => onTabChange('tv')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'tv'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Tv className="h-3.5 w-3.5 text-blue-400" />
              <span>OPD Waiting TV Screen</span>
            </button>
            <button
              onClick={() => onTabChange('kiosk')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'kiosk'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Printer className="h-3.5 w-3.5 text-indigo-400" />
              <span>Walk-In Kiosk</span>
            </button>
            <button
              onClick={() => onTabChange('scanner')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'scanner'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <FileText className="h-3.5 w-3.5 text-teal-400" />
              <span>Report Scanner</span>
            </button>
            <button
              onClick={() => onTabChange('smartflow')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'smartflow'
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              <span>SmartFlow Digital Twin (ICU & Beds)</span>
            </button>
            <button
              onClick={() => onTabChange('staff')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'staff'
                  ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Staff Scheduler & Conflicts</span>
            </button>
            <button
              onClick={() => onTabChange('audit')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'audit'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Audit Log & RBAC Governance</span>
            </button>
            <button
              onClick={() => onTabChange('register')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'register'
                  ? 'bg-purple-500/15 text-purple-300 border border-purple-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Registered Members Directory</span>
            </button>
            <button
              onClick={() => onTabChange('chat')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'chat'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>CareBridge AI Agent</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
};
