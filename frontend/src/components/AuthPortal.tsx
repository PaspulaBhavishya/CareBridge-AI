import React, { useState } from 'react';
import { 
  User, Stethoscope, Briefcase, Shield, ArrowRight, 
  Sparkles, AlertCircle, RefreshCw, KeyRound, UserPlus,
  Calendar, Ticket, Search, FileText, HelpCircle, PhoneCall,
  Users, HeartHandshake
} from 'lucide-react';
import type { UserProfile } from '../types';

interface AuthPortalProps {
  onSignInSuccess: (user: UserProfile, initialAction?: string) => void;
}

export const AuthPortal: React.FC<AuthPortalProps> = ({ onSignInSuccess }) => {
  const [authMode, setAuthMode] = useState<'onboarding' | 'signin' | 'register'>('onboarding');
  const [selectedOnboardingRole, setSelectedOnboardingRole] = useState<'patient' | 'doctor' | 'receptionist' | 'admin'>('patient');
  const [isCaretakerMode, setIsCaretakerMode] = useState(false);
  const [caretakerPatientName, setCaretakerPatientName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sign-in state
  const [loginQuery, setLoginQuery] = useState('');

  // Register state
  const [selectedRole, setSelectedRole] = useState<'patient' | 'doctor' | 'receptionist' | 'admin'>('patient');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [languagePref, setLanguagePref] = useState('English');
  const [hospitalId, setHospitalId] = useState(2);
  const [specialization, setSpecialization] = useState('General Medicine');
  const [roomNumber, setRoomNumber] = useState('Room 218 (2nd Floor)');
  const [consultationFee, setConsultationFee] = useState(600);

  // Demo personas list
  const demoPersonas = [
    {
      id: 1,
      role: 'patient',
      name: 'Bhavishya',
      uid: 'PAT-1000',
      title: 'Primary Patient (భవిష్య)',
      teluguTitle: 'ప్రధాన రోగి - భవిష్య',
      icon: <User className="h-5 w-5 text-emerald-600" />,
      color: 'border-emerald-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30 text-emerald-950',
      badge: 'Patient Portal',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      id: 2,
      role: 'patient_telugu',
      name: 'Sunitha Reddy',
      uid: 'PAT-1002',
      title: 'Multilingual Patient (Telugu)',
      teluguTitle: 'తెలుగు రోగి',
      icon: <User className="h-5 w-5 text-teal-600" />,
      color: 'border-teal-200 bg-white hover:border-teal-300 hover:bg-teal-50/30 text-teal-950',
      badge: 'తెలుగు పేషెంట్',
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200'
    },
    {
      id: 5,
      role: 'doctor',
      name: 'Dr. Anil Kumar',
      uid: 'DOC-2041',
      title: 'Hospital Doctor (Cardiologist)',
      teluguTitle: 'కార్డియాలజిస్ట్ డాక్టర్',
      icon: <Stethoscope className="h-5 w-5 text-blue-600" />,
      color: 'border-blue-200 bg-white hover:border-blue-300 hover:bg-blue-50/30 text-blue-950',
      badge: 'Doctor OPD',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      id: 3,
      role: 'receptionist',
      name: 'Priya Sharma',
      uid: 'STAFF-2001',
      title: 'OPD Receptionist & Queue Desk',
      teluguTitle: 'రిసెప్షనిస్ట్ డెస్క్',
      icon: <Briefcase className="h-5 w-5 text-indigo-600" />,
      color: 'border-indigo-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30 text-indigo-950',
      badge: 'Staff Desk',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    },
    {
      id: 4,
      role: 'admin',
      name: 'Dr. Varma',
      uid: 'ADMIN-3001',
      title: 'Hospital Chief Administrator',
      teluguTitle: 'ముఖ్య హాస్పిటల్ అడ్మిన్',
      icon: <Shield className="h-5 w-5 text-amber-600" />,
      color: 'border-amber-200 bg-white hover:border-amber-300 hover:bg-amber-50/30 text-amber-950',
      badge: 'Admin Access',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200'
    }
  ];

  // Quick Sign In via demo persona
  const handleQuickLogin = async (personaRole: string, personaId: number, initialAction?: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: personaRole, user_id: personaId })
      });
      if (!res.ok) throw new Error('Login failed on server');
      const data = await res.json();
      if (data.success && data.user) {
        if (isCaretakerMode && caretakerPatientName.trim()) {
          data.user.name = `${data.user.name} (Caretaker for ${caretakerPatientName.trim()})`;
        }
        onSignInSuccess(data.user, initialAction);
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (err: any) {
      console.warn('Backend login fallback:', err);
      // Fallback local profile for offline resilience
      const fallbackProfile: UserProfile = {
        id: personaId,
        name: personaRole === 'doctor' ? 'Dr. Anil Kumar' : personaRole === 'receptionist' ? 'Priya Sharma' : personaRole === 'admin' ? 'Dr. Varma' : personaRole === 'patient_telugu' ? 'Sunitha Reddy' : 'Bhavishya',
        role: (personaRole === 'patient_telugu' ? 'patient' : personaRole) as any,
        languagePref: personaRole === 'patient_telugu' ? 'Telugu' : 'English',
        description: personaRole,
        avatar: personaRole.slice(0, 2).toUpperCase(),
        badge: personaRole.toUpperCase(),
        patient_uid: `CB-${personaId}001`,
        preferred_hospital: 'Hospital B (Metro)',
        specialization: personaRole === 'doctor' ? 'Cardiology' : undefined,
        room_number: personaRole === 'doctor' ? 'Room 218 (2nd Floor)' : undefined,
        consultation_fee: personaRole === 'doctor' ? 600 : undefined
      };
      if (isCaretakerMode && caretakerPatientName.trim()) {
        fallbackProfile.name = `${fallbackProfile.name} (Caretaker for ${caretakerPatientName.trim()})`;
      }
      onSignInSuccess(fallbackProfile, initialAction);
    } finally {
      setIsLoading(false);
    }
  };

  // Custom Sign In by UID / Phone / Email
  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginQuery.trim()) {
      setErrorMessage('Please enter your Patient UID, Phone Number, or Email.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid_or_email: loginQuery.trim() })
      });
      if (!res.ok) throw new Error('User not found with these credentials');
      const data = await res.json();
      if (data.success && data.user) {
        onSignInSuccess(data.user);
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not verify user. Please check your details or use quick demo login.');
    } finally {
      setIsLoading(false);
    }
  };

  // Register New User
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Please enter full name.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const payload: Record<string, any> = {
        name: name.trim(),
        role: selectedRole,
        phone: phone.trim() || '+91 98765 43210',
        email: email.trim() || `${name.trim().toLowerCase().replace(/\s+/g, '.')}@carebridge.org`,
        language_pref: languagePref,
        preferred_hospital_id: hospitalId
      };
      if (selectedRole === 'doctor') {
        payload.specialization = specialization;
        payload.room_number = roomNumber;
        payload.consultation_fee = Number(consultationFee) || 600;
      }
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Registration failed on server');
      const data = await res.json();
      if (data.success && data.user) {
        onSignInSuccess(data.user);
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error creating account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Subtle Pastel Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-10 -left-10 w-[550px] h-[550px] bg-blue-100/40 rounded-full blur-[120px]" />
        <div className="absolute top-10 right-10 w-[500px] h-[450px] bg-indigo-100/30 rounded-full blur-[110px]" />
        <div className="absolute -bottom-10 left-1/4 w-[520px] h-[480px] bg-emerald-100/30 rounded-full blur-[120px]" />
      </div>

      {/* Main Container */}
      <div className="w-full max-w-4xl z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700 shadow-2xs mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="tracking-wide">CareBridge Access Gateway • క్లినికల్ పోర్టల్</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            CareBridge AI
          </h1>
          <p className="text-sm text-slate-600 max-w-lg mx-auto">
            "From Waiting to Care — One Intelligent Bridge."
            <br />
            <span className="text-xs text-slate-500 font-medium">
              సులభంగా ప్రారంభించడానికి మీ పాత్రను ఎంచుకోండి (Choose your role to get started)
            </span>
          </p>
        </div>

        {/* Top Navigation Mode Tabs */}
        <div className="flex items-center justify-center">
          <div className="bg-slate-100/80 border border-slate-200 p-1.5 rounded-2xl flex items-center gap-1.5 shadow-2xs">
            <button
              onClick={() => { setAuthMode('onboarding'); setErrorMessage(null); }}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                authMode === 'onboarding'
                  ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span>First-Time Onboarding (మొదటిసారి ప్రారంభం)</span>
            </button>
            <button
              onClick={() => { setAuthMode('signin'); setErrorMessage(null); }}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                authMode === 'signin'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <KeyRound className="h-4 w-4 text-blue-600" />
              <span>Sign In (లాగిన్)</span>
            </button>
            <button
              onClick={() => { setAuthMode('register'); setErrorMessage(null); }}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                authMode === 'register'
                  ? 'bg-white text-purple-700 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="h-4 w-4 text-purple-600" />
              <span>Register (కొత్త నమోదు)</span>
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-700/60 text-rose-300 text-xs flex items-center gap-2 animate-shake">
            <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* TAB 1: FIRST-TIME USER ONBOARDING (Primary Experience) */}
        {authMode === 'onboarding' && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            {/* 4 Role Selector Cards */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>Who is using CareBridge AI today?</span>
                  <span className="text-xs font-normal text-slate-500">• మీ పాత్రను ఎంచుకోండి</span>
                </h3>
                <span className="text-xs text-slate-400 font-medium">Step 1 of 2</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Role 1: Patient (Pink/Rose) */}
                <button
                  onClick={() => setSelectedOnboardingRole('patient')}
                  className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    selectedOnboardingRole === 'patient'
                      ? 'border-pink-500 bg-pink-50/60 ring-2 ring-pink-500/25 shadow-xs'
                      : 'border-slate-200 bg-slate-50/50 hover:border-pink-300 hover:bg-pink-50/20'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-xl bg-pink-50 border border-pink-200 text-pink-600 w-fit">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="font-bold text-slate-900 text-base">I am a Patient</div>
                    <div className="text-[11px] text-pink-600 font-semibold">నేను ఒక రోగిని</div>
                    <p className="text-xs text-slate-500">
                      Book appointments, track live tokens, and scan lab reports.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-pink-600 font-semibold">
                    <span>{selectedOnboardingRole === 'patient' ? 'Selected' : 'Select'}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </button>

                {/* Role 2: Doctor (Cyan/Sky) */}
                <button
                  onClick={() => handleQuickLogin('doctor', 5)}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:border-blue-300 hover:bg-blue-50/20 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group shadow-2xs"
                >
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 w-fit">
                      <Stethoscope className="h-5 w-5" />
                    </div>
                    <div className="font-bold text-slate-900 text-base group-hover:text-blue-700 transition">I am a Doctor</div>
                    <div className="text-[11px] text-blue-600 font-semibold">నేను ఒక వైద్యుడిని</div>
                    <p className="text-xs text-slate-500">
                      Manage OPD consultation queue, delays, and electronic prescriptions.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-semibold">
                    <span>Enter OPD Roster</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </button>

                {/* Role 3: Receptionist (Indigo/Violet) */}
                <button
                  onClick={() => handleQuickLogin('receptionist', 3)}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:border-indigo-300 hover:bg-indigo-50/20 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group shadow-2xs"
                >
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 w-fit">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div className="font-bold text-slate-900 text-base group-hover:text-indigo-700 transition">I am Receptionist</div>
                    <div className="text-[11px] text-indigo-600 font-semibold">రిసెప్షన్ సిబ్బంది</div>
                    <p className="text-xs text-slate-500">
                      OPD check-in counter, 15-second walk-in slips, and TV queue board.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-semibold">
                    <span>Enter Front Desk</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </button>

                {/* Role 4: Admin (Amber/Gold) */}
                <button
                  onClick={() => handleQuickLogin('admin', 4)}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:border-amber-300 hover:bg-amber-50/20 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group shadow-2xs"
                >
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 w-fit">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div className="font-bold text-slate-900 text-base group-hover:text-amber-700 transition">I am Admin</div>
                    <div className="text-[11px] text-amber-600 font-semibold">ఆసుపత్రి నిర్వాహకుడు</div>
                    <p className="text-xs text-slate-500">
                      Multi-hospital SmartFlow routing, staff shift audit, and surge control.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-amber-600 font-semibold">
                    <span>Enter Admin Suite</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </button>
              </div>
            </div>

            {/* PATIENT SUB-SECTION: "What do you need help with?" */}
            {selectedOnboardingRole === 'patient' && (
              <div className="space-y-4 pt-3 border-t border-slate-100 animate-fade-in">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span>What do you need help with?</span>
                      <span className="text-xs font-normal text-emerald-600">• మీకు ఏమి సహాయం కావాలి?</span>
                    </h4>
                    <p className="text-xs text-slate-500">
                      Select your goal below to immediately enter and launch that task:
                    </p>
                  </div>

                  {/* Caretaker Mode Toggle */}
                  <button
                    type="button"
                    onClick={() => setIsCaretakerMode(!isCaretakerMode)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                      isCaretakerMode
                        ? 'bg-teal-50 text-teal-700 border-teal-300 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Users className="h-3.5 w-3.5 text-teal-600" />
                    <span>{isCaretakerMode ? '✅ Caretaker Mode Active' : 'Or helping a family member? (Caretaker)'}</span>
                  </button>
                </div>

                {isCaretakerMode && (
                  <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-200 flex items-center gap-3 text-xs text-teal-900">
                    <HeartHandshake className="h-5 w-5 text-teal-600 shrink-0" />
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2">
                      <span>Enter Patient Name you are assisting:</span>
                      <input
                        type="text"
                        placeholder="e.g. Smt. Lakshmi (Mother)"
                        value={caretakerPatientName}
                        onChange={(e) => setCaretakerPatientName(e.target.value)}
                        className="px-3 py-1 bg-white border border-teal-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-teal-500 sm:w-64"
                      />
                    </div>
                  </div>
                )}

                {/* 6 Quick Intent Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* Intent 1: Book Appointment */}
                  <button
                    onClick={() => handleQuickLogin('patient', 1, 'book')}
                    disabled={isLoading}
                    className="p-4 rounded-2xl border border-rose-200 bg-white hover:border-rose-300 hover:bg-rose-50/20 text-left transition-all duration-200 group cursor-pointer space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        SmartFlow
                      </span>
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm group-hover:text-rose-700 transition">
                        Book Appointment
                      </div>
                      <div className="text-[11px] text-rose-600 font-medium">అపాయింట్‌మెంట్ బుక్ చేయండి</div>
                      <p className="text-xs text-slate-500 mt-1">
                        Find low-wait doctors in General Medicine, Cardiology, Orthopedics.
                      </p>
                    </div>
                  </button>

                  {/* Intent 2: Check Token Status */}
                  <button
                    onClick={() => handleQuickLogin('patient', 1, 'token')}
                    disabled={isLoading}
                    className="p-4 rounded-2xl border border-amber-200 bg-white hover:border-amber-300 hover:bg-amber-50/20 text-left transition-all duration-200 group cursor-pointer space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                        <Ticket className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        Live Queue
                      </span>
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm group-hover:text-amber-700 transition">
                        Check Token Status
                      </div>
                      <div className="text-[11px] text-amber-600 font-medium">టోకెన్ స్టేటస్ & వేచి ఉండే సమయం</div>
                      <p className="text-xs text-slate-500 mt-1">
                        Live waiting time, queue position, and "2 tokens away" alert.
                      </p>
                    </div>
                  </button>

                  {/* Intent 3: Find Doctor */}
                  <button
                    onClick={() => handleQuickLogin('patient', 1, 'doctor')}
                    disabled={isLoading}
                    className="p-4 rounded-2xl border border-emerald-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/20 text-left transition-all duration-200 group cursor-pointer space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                        <Search className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Directory
                      </span>
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition">
                        Find Doctor
                      </div>
                      <div className="text-[11px] text-emerald-600 font-medium">డాక్టర్ వివరాలు కనుగొనండి</div>
                      <p className="text-xs text-slate-500 mt-1">
                        Search specialists, fees, hospital location, and consultation hours.
                      </p>
                    </div>
                  </button>

                  {/* Intent 4: Upload Medical Report */}
                  <button
                    onClick={() => handleQuickLogin('patient', 1, 'scanner')}
                    disabled={isLoading}
                    className="p-4 rounded-2xl border border-cyan-200 bg-white hover:border-cyan-300 hover:bg-cyan-50/20 text-left transition-all duration-200 group cursor-pointer space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-200">
                        <FileText className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
                        OCR Scanner
                      </span>
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm group-hover:text-cyan-700 transition">
                        Upload Medical Report
                      </div>
                      <div className="text-[11px] text-cyan-600 font-medium">ల్యాబ్ రిపోర్ట్ స్కాన్ చేయండి</div>
                      <p className="text-xs text-slate-500 mt-1">
                        Editable extracted values, Telugu explanations, and flagged values.
                      </p>
                    </div>
                  </button>

                  {/* Intent 5: Ask Hospital Question */}
                  <button
                    onClick={() => handleQuickLogin('patient', 1, 'question')}
                    disabled={isLoading}
                    className="p-4 rounded-2xl border border-indigo-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/20 text-left transition-all duration-200 group cursor-pointer space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200">
                        <HelpCircle className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Hospital Info
                      </span>
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm group-hover:text-indigo-700 transition">
                        Ask Hospital Question
                      </div>
                      <div className="text-[11px] text-indigo-600 font-medium">ఆసుపత్రి నియమాలు & సమయాలు</div>
                      <p className="text-xs text-slate-500 mt-1">
                        Visiting hours, parking rules, insurance desk, and OPD guidelines.
                      </p>
                    </div>
                  </button>

                  {/* Intent 6: Emergency Help */}
                  <button
                    onClick={() => handleQuickLogin('patient', 1, 'emergency')}
                    disabled={isLoading}
                    className="p-4 rounded-2xl border border-rose-200 bg-white hover:border-rose-300 hover:bg-rose-50/20 text-left transition-all duration-200 group cursor-pointer space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
                        <PhoneCall className="h-5 w-5 animate-pulse" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        Immediate 108
                      </span>
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm group-hover:text-rose-700 transition">
                        Emergency Help
                      </div>
                      <div className="text-[11px] text-rose-600 font-semibold">అత్యవసర సహాయం (108/112)</div>
                      <p className="text-xs text-slate-500 mt-1">
                        Immediate ambulance dispatch and acute trauma protocol.
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SIGN IN WITH PERSONA OR CREDENTIALS */}
        {authMode === 'signin' && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            {/* Quick Demo Persona Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <span>1-Click Instant Persona Sign-In (డెమో లాగిన్)</span>
                </span>
                <span className="text-[11px] text-slate-500">Select any role to test its specific view:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {demoPersonas.map((persona) => (
                  <button
                    key={persona.id}
                    onClick={() => handleQuickLogin(persona.role, persona.id)}
                    disabled={isLoading}
                    className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${persona.color} group shadow-2xs hover:shadow-xs`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 group-hover:scale-105 transition shadow-2xs">
                          {persona.icon}
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${persona.badgeColor}`}>
                          {persona.badge}
                        </span>
                      </div>
                      <div className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition">
                        {persona.name}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {persona.title}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 font-sans">
                        {persona.teluguTitle}
                      </div>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-mono text-[11px]">
                      <span>{persona.uid}</span>
                      <span className="flex items-center gap-1 text-blue-600 font-sans font-semibold text-xs group-hover:translate-x-0.5 transition">
                        Enter <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-4 text-xs text-slate-400 uppercase font-semibold">Or Sign In with Credentials</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* Custom Lookup Sign In */}
            <form onSubmit={handleCustomLogin} className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  value={loginQuery}
                  onChange={(e) => setLoginQuery(e.target.value)}
                  placeholder="Enter Patient UID (e.g. PAT-1001, DOC-2041), Phone, or Email..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition shadow-2xs"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>Verify & Enter</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: REGISTER */}
        {authMode === 'register' && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Create New Account (కొత్త నమోదు)</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Register as a Patient, Doctor, Receptionist, or Administrator to immediately enter that role's portal.
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              {/* Role Selector Buttons */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Select Role (రోల్ ఎంచుకోండి):</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'patient', label: 'Patient (రోగి)', icon: <User className="h-4 w-4" /> },
                    { id: 'doctor', label: 'Doctor (వైద్యుడు)', icon: <Stethoscope className="h-4 w-4" /> },
                    { id: 'receptionist', label: 'Receptionist (సిబ్బంది)', icon: <Briefcase className="h-4 w-4" /> },
                    { id: 'admin', label: 'Admin (అడ్మిన్)', icon: <Shield className="h-4 w-4" /> },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRole(r.id as any)}
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                        selectedRole === r.id
                          ? 'bg-blue-50 border-blue-300 text-blue-700 ring-2 ring-blue-400/20 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      {r.icon}
                      <span>{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* General Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 block mb-1">Full Name (పూర్తి పేరు):</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Varma"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 shadow-2xs"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 block mb-1">Phone Number (ఫోన్ నంబర్):</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 block mb-1">Email Address (ఈమెయిల్):</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@carebridge.org"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 block mb-1">Language Preference (భాష):</label>
                  <select
                    value={languagePref}
                    onChange={(e) => setLanguagePref(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 cursor-pointer shadow-2xs"
                  >
                    <option value="English">English</option>
                    <option value="Telugu">తెలుగు (Telugu)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-600 block mb-1">Preferred Hospital (ఆసుపత్రి):</label>
                  <select
                    value={hospitalId}
                    onChange={(e) => setHospitalId(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 cursor-pointer shadow-2xs"
                  >
                    <option value={2}>CareBridge Metro Health Center (Gachibowli)</option>
                    <option value={1}>Apex Super Speciality Hospital (Banjara Hills)</option>
                    <option value={3}>City Community Healthcare (Secunderabad)</option>
                  </select>
                </div>
              </div>

              {/* Doctor-Specific Fields */}
              {selectedRole === 'doctor' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="text-xs text-slate-600 block mb-1">Specialization (స్పెషలైజేషన్):</label>
                    <input
                      type="text"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      placeholder="e.g. Cardiology"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 block mb-1">Assigned OPD Room:</label>
                    <input
                      type="text"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      placeholder="Room 218 (2nd Floor)"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 block mb-1">Consultation Fee (₹):</label>
                    <input
                      type="number"
                      value={consultationFee}
                      onChange={(e) => setConsultationFee(Number(e.target.value))}
                      placeholder="600"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 shadow-2xs"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>Complete Registration & Enter</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
