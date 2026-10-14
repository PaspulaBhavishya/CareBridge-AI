import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Stethoscope, Briefcase, Shield, ArrowRight, 
  Sparkles, AlertCircle, RefreshCw, KeyRound, UserPlus,
  Calendar, Ticket, Search, FileText, HelpCircle, PhoneCall,
  Users, HeartHandshake, Phone, CheckCircle2, MessageSquare,
  X, ShieldCheck, Mail, RotateCcw, Clock
} from 'lucide-react';
import type { UserProfile } from '../types';
import { validateIndianMobile, validateEmail } from '../utils/validation';

interface AuthPortalProps {
  onSignInSuccess: (user: UserProfile, initialAction?: string) => void;
}

export const AuthPortal: React.FC<AuthPortalProps> = ({ onSignInSuccess }) => {
  const [authMode, setAuthMode] = useState<'onboarding' | 'signin' | 'register'>('signin');
  const [selectedOnboardingRole, setSelectedOnboardingRole] = useState<'patient' | 'doctor' | 'receptionist' | 'admin'>('patient');
  const [isCaretakerMode, setIsCaretakerMode] = useState(false);
  const [caretakerPatientName, setCaretakerPatientName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Sign-in state
  const [loginQuery, setLoginQuery] = useState('');
  const [loginEmail, setLoginEmail] = useState('');

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

  // OTP Verification States
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpTargetPhone, setOtpTargetPhone] = useState('');
  const [otpEntered, setOtpEntered] = useState('');
  const [otpPurpose, setOtpPurpose] = useState<'login' | 'register'>('login');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccessMessage, setOtpSuccessMessage] = useState<string | null>(null);
  const [otpResendSeconds, setOtpResendSeconds] = useState(45);
  const [pendingRegisterPayload, setPendingRegisterPayload] = useState<Record<string, any> | null>(null);
  const otpInputRef = useRef<HTMLInputElement>(null);

  // Dynamic chips that stay in sync with database profile updates
  const [registeredChips, setRegisteredChips] = useState([
    { id: 1, name: 'Bhavishya (Patient)', phone: '+91 98765 01234', email: 'bhavishya@carebridge.org', color: 'bg-emerald-50 hover:bg-emerald-100/80 text-emerald-950 border-emerald-200' },
    { id: 9, name: 'Mythri (Patient)', phone: '+91 83093 58353', email: 'mythri@gmail.com', color: 'bg-rose-50 hover:bg-rose-100/80 text-rose-950 border-rose-200' },
    { id: 2, name: 'Sunitha Reddy (Telugu Patient)', phone: '+91 98480 12345', email: 'sunitha.reddy@example.com', color: 'bg-teal-50 hover:bg-teal-100/80 text-teal-950 border-teal-200' },
    { id: 5, name: 'Dr. Naveen Kumar (Doctor)', phone: '+91 98480 22334', email: 'dr.naveen@carebridge.org', color: 'bg-blue-50 hover:bg-blue-100/80 text-blue-950 border-blue-200' },
    { id: 3, name: 'Priya Sharma (Staff)', phone: '+91 91234 56789', email: 'priya.reception@carebridge.org', color: 'bg-indigo-50 hover:bg-indigo-100/80 text-indigo-950 border-indigo-200' },
    { id: 4, name: 'Dr. Varma (Admin)', phone: '+91 99999 88888', email: 'admin@carebridge.org', color: 'bg-amber-50 hover:bg-amber-100/80 text-amber-950 border-amber-200' }
  ]);

  useEffect(() => {
    fetch('/api/auth/demo-chips')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.chips && data.chips.length > 0) {
          setRegisteredChips(data.chips);
        }
      })
      .catch(() => {});
  }, []);

  // Database verification feedback states
  const [notRegisteredAlert, setNotRegisteredAlert] = useState<{ phone: string; message: string } | null>(null);
  const [matchedUserName, setMatchedUserName] = useState<string | null>(null);
  const [matchedUserRole, setMatchedUserRole] = useState<string | null>(null);
  const [matchedUserEmail, setMatchedUserEmail] = useState<string | null>(null);

  // Timer for OTP resend countdown
  useEffect(() => {
    if (!isOtpModalOpen || otpResendSeconds <= 0) return;
    const timer = setInterval(() => {
      setOtpResendSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOtpModalOpen, otpResendSeconds]);

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
      id: 9,
      role: 'patient_mythri',
      name: 'Mythri',
      uid: 'PAT-D7F2',
      title: 'New Patient Portal (మైత్రి)',
      teluguTitle: 'కొత్త పేషెంట్ పోర్టల్ - మైత్రి',
      icon: <User className="h-5 w-5 text-rose-600" />,
      color: 'border-rose-200 bg-white hover:border-rose-300 hover:bg-rose-50/30 text-rose-950',
      badge: 'New Patient Portal',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200'
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
      name: 'Dr. Naveen Kumar',
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
        if (personaRole === 'patient_mythri' || personaId === 9) {
          data.user.is_new = true;
          data.user.badge = 'New Patient Portal';
        }
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
        name: personaId === 9 ? 'Mythri' : personaId === 7 ? 'Dr. Priya' : personaRole === 'doctor' ? 'Dr. Naveen Kumar' : personaRole === 'receptionist' ? 'Priya Sharma' : personaRole === 'admin' ? 'Dr. Varma' : personaRole === 'patient_telugu' ? 'Sunitha Reddy' : 'Bhavishya',
        role: (personaRole === 'patient_telugu' || personaRole === 'patient_mythri' ? 'patient' : personaRole) as any,
        languagePref: personaRole === 'patient_telugu' ? 'Telugu' : 'English',
        description: personaId === 9 ? 'New Patient (మైత్రి - Fresh Portal)' : personaId === 7 ? 'Dr. Priya (Doctor)' : personaRole,
        avatar: personaId === 9 ? 'MY' : personaId === 7 ? 'DP' : personaRole.slice(0, 2).toUpperCase(),
        badge: (personaRole === 'patient_mythri' || personaId === 9 ? 'New Patient Portal' : personaRole.toUpperCase()),
        patient_uid: personaId === 9 ? 'PAT-D7F2' : personaId === 7 ? 'DOC-2042' : `CB-${personaId}001`,
        preferred_hospital: 'Hospital B (Metro)',
        specialization: personaId === 7 ? 'General Medicine' : (personaRole === 'doctor' ? 'Cardiology' : undefined),
        room_number: personaId === 7 ? 'Room OPD-03' : (personaRole === 'doctor' ? 'Room 102 (1st Floor)' : undefined),
        consultation_fee: personaRole === 'doctor' ? 500 : undefined,
        is_new: (personaId === 9 || personaRole === 'patient_mythri') ? true : undefined
      };
      if (isCaretakerMode && caretakerPatientName.trim()) {
        fallbackProfile.name = `${fallbackProfile.name} (Caretaker for ${caretakerPatientName.trim()})`;
      }
      onSignInSuccess(fallbackProfile, initialAction);
    } finally {
      setIsLoading(false);
    }
  };

  // Audio chime synthesizer for successful OTP verification
  const playVerifyChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.15); // C6
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {}
  };

  // Custom Sign In by Mobile Number & Email -> Validates and Sends OTP
  const handleCustomLogin = async (e?: React.FormEvent, overridePhone?: string, overrideEmail?: string) => {
    if (e) e.preventDefault();
    const query = (overridePhone !== undefined ? overridePhone : loginQuery).trim();
    const targetEmail = (overrideEmail !== undefined ? overrideEmail : loginEmail).trim();

    // 1. Mobile Number Validation: Check starting digits (6, 7, 8, 9 valid vs 0, 1, 2, 3, 4, 5 invalid)
    const phoneVal = validateIndianMobile(query);
    if (!phoneVal.isValid) {
      setErrorMessage(phoneVal.message);
      return;
    }

    // 2. Email Verification: Check email format and require it before login
    const emailVal = validateEmail(targetEmail);
    if (!emailVal.isValid) {
      setErrorMessage(emailVal.message);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setOtpError(null);
    setNotRegisteredAlert(null);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneVal.formatted,
          email: emailVal.cleanEmail,
          uid_or_email: phoneVal.digits,
          purpose: 'login'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setOtpTargetPhone(data.phone || phoneVal.formatted);
        setMatchedUserEmail(data.email || emailVal.cleanEmail);
        setMatchedUserName(data.user_name || null);
        setMatchedUserRole(data.user_role || null);
        setOtpPurpose('login');
        setOtpEntered('');
        setOtpError(null);
        setOtpSuccessMessage(null);
        setIsOtpModalOpen(true);
        setOtpResendSeconds(45);
        setNotRegisteredAlert(null);
        setTimeout(() => otpInputRef.current?.focus(), 80);
      } else {
        const errData = await res.json().catch(() => ({}));
        const detailMsg = errData.detail || errData.message || 'ఈ మొబైల్ నంబర్ మన డేటాబేస్‌లో నమోదు కాలేదు. దయచేసి ముందుగా నమోదు చేసుకోండి.';
        if (res.status === 404) {
          setNotRegisteredAlert({
            phone: phoneVal.formatted,
            message: detailMsg
          });
        }
        setErrorMessage(detailMsg);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to connect to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Register New User -> Sends OTP to phone number
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Please enter full name (పూర్తి పేరు).');
      return;
    }

    // Validate phone number: starting digit must be 6, 7, 8, 9 (0, 1, 2, 3, 4, 5 are invalid)
    const phoneVal = validateIndianMobile(phone);
    if (!phoneVal.isValid) {
      setErrorMessage(phoneVal.message);
      return;
    }

    // Validate email
    const regEmail = email.trim() || `${name.trim().toLowerCase().replace(/\s+/g, '.')}@carebridge.org`;
    const emailVal = validateEmail(regEmail);
    if (!emailVal.isValid) {
      setErrorMessage(emailVal.message);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setOtpError(null);

    const payload: Record<string, any> = {
      name: name.trim(),
      role: selectedRole,
      phone: phoneVal.formatted,
      email: emailVal.cleanEmail,
      language_pref: languagePref,
      preferred_hospital_id: hospitalId
    };
    if (selectedRole === 'doctor') {
      payload.specialization = specialization;
      payload.room_number = roomNumber;
      payload.consultation_fee = Number(consultationFee) || 600;
    }
    setPendingRegisterPayload(payload);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: phoneVal.formatted, 
          email: emailVal.cleanEmail,
          purpose: 'register' 
        })
      });
      if (res.ok) {
        const data = await res.json();
        setOtpTargetPhone(data.phone || phoneVal.formatted);
        setMatchedUserEmail(emailVal.cleanEmail);
        setMatchedUserName(name.trim());
        setMatchedUserRole(selectedRole);
        setOtpPurpose('register');
        setOtpEntered('');
        setOtpError(null);
        setOtpSuccessMessage(null);
        setIsOtpModalOpen(true);
        setOtpResendSeconds(45);
        setTimeout(() => otpInputRef.current?.focus(), 80);
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || errData.message || 'Failed to dispatch registration OTP.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to dispatch registration OTP. Please check phone number.');
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP submission
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanOtp = otpEntered.trim();
    if (!cleanOtp || cleanOtp.length < 6) {
      setOtpError('దయచేసి 6-అంకెల ఓటీపీని పూర్తిగా నమోదు చేయండి (Please enter the complete 6-digit OTP).');
      return;
    }

    setIsLoading(true);
    setOtpError(null);
    setOtpSuccessMessage(null);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: otpTargetPhone,
          otp: cleanOtp,
          purpose: otpPurpose,
          uid_or_email: loginQuery.trim(),
          register_payload: pendingRegisterPayload
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const errMsg = errJson.detail || errJson.message || 'తప్పుడు ఓటీపీ! దయచేసి మీ మొబైల్ నంబర్‌కు వచ్చిన సరైన 6-అంకెల ఓటీపీని నమోదు చేయండి.';
        throw new Error(errMsg);
      }

      const data = await res.json();
      if (data.success && data.user) {
        playVerifyChime();
        setIsOtpModalOpen(false);
        setOtpEntered('');
        setOtpError(null);
        const isPatient = (data.user.role || pendingRegisterPayload?.role) === 'patient';
        const userObj: UserProfile = (otpPurpose === 'register' || isPatient)
          ? { 
              ...data.user, 
              is_new: isPatient ? true : (data.user.is_new ?? false),
              badge: isPatient ? 'New Patient Portal' : (data.user.badge || 'Patient Portal'),
              description: isPatient ? `${data.user.name} (New Patient Portal)` : data.user.description
            }
          : data.user;
        onSignInSuccess(userObj);
      } else {
        throw new Error(data.message || 'Verification failed. Please check the code.');
      }
    } catch (err: any) {
      setOtpError(err.message || 'తప్పుడు ఓటీపీ! దయచేసి మీ మొబైల్ నంబర్‌కు వచ్చిన సరైన 6-అంకెల ఓటీపీని నమోదు చేయండి.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP & Reset
  const handleResendOtp = async () => {
    setIsLoading(true);
    // Reset entered OTP input and error immediately
    setOtpEntered('');
    setOtpError(null);
    setOtpSuccessMessage(null);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: otpTargetPhone,
          email: matchedUserEmail || loginEmail || email,
          uid_or_email: loginQuery.trim() || otpTargetPhone,
          purpose: otpPurpose
        })
      });
      if (res.ok) {
        setOtpResendSeconds(45);
        setOtpSuccessMessage('కొత్త ఓటీపీ పంపబడింది! ఫీల్డ్స్ రీసెట్ అయ్యాయి (New OTP dispatched! Code reset).');
        setTimeout(() => {
          otpInputRef.current?.focus();
        }, 50);
      } else {
        const errData = await res.json().catch(() => ({}));
        setOtpError(errData.detail || 'Failed to resend OTP. Please try again.');
      }
    } catch (e: any) {
      setOtpError('Failed to resend OTP. Please check your network connection.');
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
        <div className="flex items-center justify-center gap-2">
          <div className="bg-slate-100/80 border border-slate-200 p-1.5 rounded-2xl flex items-center gap-1.5 shadow-2xs">
            <button
              type="button"
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
              type="button"
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

          {/* Small Help Button */}
          <button
            type="button"
            onClick={() => setIsHelpModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-white hover:bg-indigo-50/70 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-300 shadow-2xs transition cursor-pointer"
            title="Help & First-Time Onboarding (సహాయం & మొదటిసారి మార్గదర్శకత్వం)"
          >
            <HelpCircle className="h-4 w-4 text-indigo-600" />
            <span>Help (సహాయం)</span>
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-700/60 text-rose-300 text-xs flex items-center gap-2 animate-shake">
            <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* TAB 1: FIRST-TIME USER ONBOARDING (Launched via Help) */}
        {authMode === 'onboarding' && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            {/* Header with Back to Sign In button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-700">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    First-Time User Onboarding (మొదటిసారి ప్రారంభం)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Explore clinical roles and get started with CareBridge AI
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAuthMode('signin')}
                className="self-start sm:self-auto px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-bold flex items-center gap-2 transition shadow-2xs cursor-pointer"
              >
                <ArrowRight className="h-3.5 w-3.5 rotate-180" />
                <span>Back to Sign In (లాగిన్‌కి తిరిగి వెళ్ళండి)</span>
              </button>
            </div>
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
                <div
                  onClick={() => setSelectedOnboardingRole('patient')}
                  className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
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
                  <div className="mt-3 pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickLogin('patient', 1);
                      }}
                      className="w-full py-1.5 px-2 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                      title="Login as Bhavishya (Primary Patient)"
                    >
                      <span>Bhavishya</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickLogin('patient_mythri', 9);
                      }}
                      className="w-full py-1.5 px-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                      title="Login as Mythri (New Patient Portal)"
                    >
                      <span>Mythri (New Portal)</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Role 2: Doctor (Cyan/Sky) */}
                <div
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:border-blue-300 text-left transition-all duration-200 flex flex-col justify-between group shadow-2xs"
                >
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 w-fit">
                      <Stethoscope className="h-5 w-5" />
                    </div>
                    <div className="font-bold text-slate-900 text-base">I am a Doctor</div>
                    <div className="text-[11px] text-blue-600 font-semibold">నేను ఒక వైద్యుడిని</div>
                    <p className="text-xs text-slate-500">
                      Manage doctor-specific OPD consultation queue, delays, and patient rosters.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('doctor', 5)}
                      className="w-full py-1.5 px-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                      title="Login as Dr. Naveen Kumar (Cardiology)"
                    >
                      <span>Dr. Naveen Kumar</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('doctor', 7)}
                      className="w-full py-1.5 px-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                      title="Login as Dr. Priya (General Medicine)"
                    >
                      <span>Dr. Priya</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>

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

        {/* TAB 2: SIGN IN WITH MOBILE NUMBER OR PERSONA */}
        {authMode === 'signin' && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            
            {/* PRIMARY: Mobile Number & Email Verification Sign-In with OTP */}
            <div className="bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-white border-2 border-blue-200/90 rounded-3xl p-6 sm:p-7 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Phone className="h-5 w-5 text-blue-600" />
                    <span>Mobile Number & Email Verification</span>
                    <span className="text-xs font-semibold text-blue-700 bg-blue-100/80 px-2.5 py-0.5 rounded-full">
                      మొబైల్ & ఈమెయిల్ ధృవీకరణ
                    </span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Enter your valid 10-digit mobile number (starting with 6, 7, 8, or 9) and verified email to receive an SMS OTP.
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    Dual-Factor OTP
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsHelpModalOpen(true)}
                    className="text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-full flex items-center gap-1 transition cursor-pointer shadow-2xs"
                    title="Need Help or First-Time Onboarding? (సహాయం)"
                  >
                    <HelpCircle className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Help (సహాయం)</span>
                  </button>
                </div>
              </div>

              {/* Validation Rule Info Pill */}
              <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
                <Shield className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <span className="font-bold">మొబైల్ నిబంధన: </span>
                  మొబైల్ నంబర్ తప్పనిసరిగా <b>6, 7, 8, లేదా 9</b> తో మాత్రమే ప్రారంభం కావాలి. 
                  (<b>0, 1, 2, 3, 4, 5</b> తో ప్రారంభమయ్యే నంబర్లు చెల్లవు). లాగిన్ అయ్యే ముందు మీ రిజిస్టర్డ్ ఈమెయిల్ ధృవీకరించబడుతుంది.
                </div>
              </div>

              {/* ALERT MESSAGE: When Mobile Number is NOT in Database */}
              {notRegisteredAlert && (
                <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-shake">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 mt-0.5 sm:mt-0 shrink-0">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-amber-950 flex items-center gap-2">
                        <span>ఈ మొబైల్ నంబర్ డేటాబేస్‌లో నమోదు కాలేదు</span>
                        <span className="text-xs font-mono font-bold px-1.5 py-0.5 bg-amber-200/70 rounded text-amber-900">
                          {notRegisteredAlert.phone}
                        </span>
                      </div>
                      <div className="text-xs text-amber-900 mt-1 leading-relaxed">
                        మీరు నమోదు చేసిన మొబైల్ నంబర్ మన హాస్పిటల్ డేటాబేస్‌లో లేదు. దయచేసి క్రింది 'రిజిస్టర్ చేసుకోండి' బటన్ నొక్కి ముందుగా మీ ఖాతాను నమోదు చేసుకోండి.
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPhone(notRegisteredAlert.phone);
                      setAuthMode('register');
                      setNotRegisteredAlert(null);
                      setErrorMessage(null);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 transition whitespace-nowrap shadow-xs cursor-pointer self-stretch sm:self-auto justify-center"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>ఇప్పుడే రిజిస్టర్ చేసుకోండి (Register Now)</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* Mobile & Email Input Form */}
              <form onSubmit={handleCustomLogin} className="space-y-4">
                {/* 1. Mobile Number Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-blue-600" />
                      <span>10-Digit Mobile Number (మొబైల్ నంబర్):</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] font-mono font-medium text-slate-500">
                      {loginQuery.replace(/\D/g, '').length}/10 digits
                    </span>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <span className="text-xs font-bold text-slate-500 font-mono border-r border-slate-200 pr-2.5 flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5 text-blue-600" />
                        <span>+91</span>
                      </span>
                    </div>
                    <input
                      type="tel"
                      value={loginQuery}
                      onChange={(e) => {
                        setLoginQuery(e.target.value);
                        if (notRegisteredAlert) setNotRegisteredAlert(null);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      placeholder="e.g. 98765 01234 (Must start with 6, 7, 8, or 9)"
                      className={`w-full pl-20 pr-4 py-3 bg-white border-2 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition shadow-2xs font-semibold ${
                        loginQuery && validateIndianMobile(loginQuery).status === 'invalid_start'
                          ? 'border-rose-400 focus:border-rose-600 bg-rose-50/20'
                          : loginQuery && validateIndianMobile(loginQuery).isValid
                          ? 'border-emerald-400 focus:border-emerald-600 bg-emerald-50/10'
                          : 'border-slate-200 focus:border-blue-600'
                      }`}
                    />
                  </div>

                  {/* Real-time Mobile Feedback Badges */}
                  {loginQuery && (() => {
                    const status = validateIndianMobile(loginQuery);
                    if (status.status === 'invalid_start') {
                      return (
                        <div className="p-3 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-800 text-xs flex items-start gap-2.5 shadow-2xs animate-shake">
                          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <div className="font-bold text-rose-900">
                              చెల్లని మొబైల్ నంబర్! (Invalid Mobile Number)
                            </div>
                            <div className="text-rose-700 mt-0.5 leading-relaxed">
                              మీరు నమోదు చేసిన మొబైల్ నంబర్ '<b>{status.firstDigit}</b>' తో ప్రారంభమైంది. 
                              భారతీయ మొబైల్ నంబర్లు <b>6, 7, 8, లేదా 9</b> తో మాత్రమే ప్రారంభం కావాలి 
                              (<b>0, 1, 2, 3, 4, 5</b> అంకెలతో ప్రారంభమయ్యే నంబర్లు చెల్లవు).
                            </div>
                          </div>
                        </div>
                      );
                    }
                    if (status.status === 'incomplete') {
                      return (
                        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                          <span>
                            సరైన ప్రారంభ అంకె ({status.firstDigit})! ఇంకా {10 - status.digits.length} అంకెలు నమోదు చేయండి ({status.digits.length}/10).
                          </span>
                        </div>
                      );
                    }
                    if (status.status === 'valid') {
                      return (
                        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span className="font-semibold">
                            చెల్లుబాటు అయ్యే మొబైల్ నంబర్! ({status.firstDigit} తో ప్రారంభమైనది) • {status.formatted}
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>

                {/* 2. Email Address Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-blue-600" />
                      <span>Registered Email Address (రిజిస్టర్డ్ ఈమెయిల్):</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                      లాగిన్ అయ్యే ముందు ఈమెయిల్ ధృవీకరించాలి
                    </span>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => {
                        setLoginEmail(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      placeholder="e.g. bhavishya@carebridge.org"
                      className={`w-full pl-10 pr-4 py-3 bg-white border-2 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition shadow-2xs font-semibold ${
                        loginEmail && !validateEmail(loginEmail).isValid
                          ? 'border-rose-400 focus:border-rose-600 bg-rose-50/20'
                          : loginEmail && validateEmail(loginEmail).isValid
                          ? 'border-emerald-400 focus:border-emerald-600 bg-emerald-50/10'
                          : 'border-slate-200 focus:border-blue-600'
                      }`}
                    />
                  </div>

                  {/* Real-time Email Feedback */}
                  {loginEmail && (() => {
                    const status = validateEmail(loginEmail);
                    if (!status.isValid) {
                      return (
                        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                          <span>{status.message}</span>
                        </div>
                      );
                    }
                    return (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span className="font-semibold">సరైన ఈమెయిల్ ఫార్మాట్ ధృవీకరించబడింది (Valid Email Format)</span>
                      </div>
                    );
                  })()}
                </div>

                {/* Submit / Send OTP Button */}
                <button
                  type="submit"
                  disabled={isLoading || !validateIndianMobile(loginQuery).isValid || !validateEmail(loginEmail).isValid}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
                    validateIndianMobile(loginQuery).isValid && validateEmail(loginEmail).isValid && !isLoading
                      ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4" />
                      <span>Verify Mobile & Email → Send OTP (ధృవీకరించి ఓటీపీ పంపండి)</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                {/* Quick Registered Mobile & Email Chips */}
                <div className="pt-2 border-t border-blue-100">
                  <div className="text-[11px] font-bold text-slate-600 mb-1.5 flex items-center justify-between">
                    <span>Quick Select Registered Users (డేటాబేస్‌లోని నంబర్ & ఈమెయిల్):</span>
                    <span className="text-[10px] text-slate-400">1-click fill phone + email</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {registeredChips.map((chip) => (
                      <button
                        key={`${chip.name}-${chip.phone}`}
                        type="button"
                        onClick={() => {
                          setLoginQuery(chip.phone);
                          setLoginEmail(chip.email);
                          setNotRegisteredAlert(null);
                          setErrorMessage(null);
                        }}
                        className={`p-2.5 rounded-xl border text-left text-xs transition cursor-pointer flex flex-col justify-between shadow-2xs ${chip.color}`}
                        title={`Click to fill ${chip.phone} and ${chip.email}`}
                      >
                        <div className="font-bold text-[11px] truncate">{chip.name}</div>
                        <div className="font-mono text-[11px] font-semibold text-slate-700">{chip.phone}</div>
                        <div className="font-mono text-[10px] text-slate-500 truncate">{chip.email}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            </div>

            {/* Quick Demo Persona Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <span>Or 1-Click Instant Demo Sign-In (డెమో లాగిన్)</span>
                </span>
                <span className="text-[11px] text-slate-500">Quick test login without OTP:</span>
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
                    <span>Verify Phone & Register (ఓటీపీ ద్వారా నమోదు)</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Help Modal with First-Time Onboarding Option */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in zoom-in-95 duration-150">
            {/* Header / Accent Bar */}
            <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-xs border border-white/20">
                    <HelpCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      CareBridge Help & Assistance
                    </h3>
                    <p className="text-xs text-blue-100 font-sans">
                      సహాయం & మొదటిసారి మార్గదర్శకత్వం
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsHelpModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
                  title="Close (మూసివేయండి)"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* PRIMARY OPTION: First-Time User Onboarding */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-white border-2 border-emerald-300 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-emerald-950">
                        First-Time Onboarding (మొదటిసారి ప్రారంభం)
                      </h4>
                      <p className="text-[11px] text-emerald-700 font-medium">
                        Guided Walkthrough & Role Selection
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded-full uppercase">
                    New Users
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  కొత్తగా కేర్‌బ్రిడ్జ్‌ను ఉపయోగిస్తున్నారా? హాస్పిటల్ రోల్స్ (Patient, Doctor, Receptionist, Admin) మరియు AI సేవలను సులభంగా తెలుసుకోవడానికి ఈ ఇంటరాక్టివ్ గైడ్‌ను ఉపయోగించండి.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('onboarding');
                    setIsHelpModalOpen(false);
                    setErrorMessage(null);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer transition active:scale-[0.99]"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Start First-Time Onboarding (మొదటిసారి ప్రారంభించండి)</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* Quick Sign-In Tips */}
              <div className="space-y-2.5 pt-1">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <KeyRound className="h-4 w-4 text-blue-600" />
                  <span>Sign-In Assistance (లాగిన్ సహాయం):</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 text-slate-700">
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-blue-600" />
                    <span>Mobile Number & Email OTP Rules:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    • మొబైల్ నంబర్ తప్పనిసరిగా <b>6, 7, 8, లేదా 9</b> తో ప్రారంభం కావాలి.<br />
                    • డేటాబేస్‌లో రిజిస్టర్ అయిన ఈమెయిల్ మరియు మొబైల్ నంబర్ రెండు మ్యాచ్ అవ్వాలి.<br />
                    • OTP ఎర్రర్ వస్తే కింద <b>Resend OTP & Reset</b> బటన్ క్లిక్ చేసి వెంటనే కొత్త కోడ్ పొందవచ్చు.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 text-slate-700">
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                    <span>Quick Demo Test Login (డెమో లాగిన్):</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    టెస్టింగ్ కోసం OTP లేకుండా లాగిన్ అవ్వడానికి సైన్-ఇన్ పేజీలోని <b>1-Click Instant Demo Sign-In</b> కార్డులను (Bhavishya, Mythri, Dr. Naveen, Priya, Dr. Varma) ఉపయోగించవచ్చు.
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsHelpModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  Close (మూసివేయండి)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      {isOtpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
            {/* Header / Accent Bar */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-xs border border-white/20">
                    <ShieldCheck className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      Phone OTP Verification
                    </h3>
                    <p className="text-xs text-blue-100 font-sans">
                      ఫోన్ ఓటీపీ ధృవీకరణ
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsOtpModalOpen(false);
                    setOtpError(null);
                    setOtpEntered('');
                    setOtpSuccessMessage(null);
                  }}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
                  title="Close (మూసివేయండి)"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Verified Phone & Email display */}
              <div className="text-center space-y-2">
                <p className="text-xs text-slate-500">
                  {otpPurpose === 'register' 
                    ? 'A 6-digit one-time password has been sent to your registered phone number:'
                    : 'A 6-digit one-time password has been sent to verify your access:'}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-800 font-mono text-xs font-bold border border-slate-200 shadow-2xs">
                    <Phone className="h-3.5 w-3.5 text-blue-600" />
                    <span>{otpTargetPhone}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-sans font-bold">
                      Valid Mobile (6-9)
                    </span>
                  </div>

                  {(matchedUserEmail || loginEmail) && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-900 font-mono text-xs border border-blue-200 shadow-2xs">
                      <Mail className="h-3.5 w-3.5 text-blue-600" />
                      <span>{matchedUserEmail || loginEmail}</span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-sans font-bold">
                        Verified Email
                      </span>
                    </div>
                  )}
                </div>

                {matchedUserName && (
                  <div className="mt-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 shadow-2xs">
                      <span>ఖాతా (Account): <b>{matchedUserName}</b></span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-200/70 text-emerald-900 font-mono">
                        {matchedUserRole || 'Patient'}
                      </span>
                    </span>
                  </div>
                )}
              </div>

              {/* SMS Dispatched Status Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 text-emerald-950 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                    <div className="p-1.5 rounded-xl bg-emerald-100 text-emerald-700">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <span>SMS Verification Dispatched (ఎస్ఎంఎస్ పంపబడింది)</span>
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800 font-semibold font-mono border border-emerald-200">
                    VALID: 5 MIN
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  A 6-digit OTP verification code has been dispatched via SMS to your mobile number <span className="font-bold text-slate-900 font-mono">{otpTargetPhone}</span>.
                </p>
                <p className="text-[11px] text-emerald-800 font-medium">
                  మీ మొబైల్ నంబర్‌కు వచ్చిన 6-అంకెల ఓటీపీని కింద నమోదు చేసి ధృవీకరించండి.
                </p>
              </div>

              {/* OTP Form */}
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">
                      Enter 6-Digit OTP (6-అంకెల ఓటీపీ నమోదు చేయండి)
                    </label>
                    {otpEntered.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setOtpEntered('');
                          if (otpError) setOtpError(null);
                          otpInputRef.current?.focus();
                        }}
                        className="text-[11px] text-slate-400 hover:text-rose-600 transition cursor-pointer flex items-center gap-1 font-medium"
                      >
                        <X className="h-3 w-3" />
                        <span>Clear (ఖాళీ చేయండి)</span>
                      </button>
                    )}
                  </div>
                  <input
                    ref={otpInputRef}
                    type="text"
                    maxLength={6}
                    autoFocus
                    value={otpEntered}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtpEntered(val);
                      if (otpError) setOtpError(null);
                      if (otpSuccessMessage) setOtpSuccessMessage(null);
                    }}
                    placeholder="• • • • • •"
                    className={`w-full text-center tracking-[0.75em] text-2xl font-mono font-bold py-3.5 px-4 rounded-2xl outline-none transition text-slate-900 shadow-inner ${
                      otpError 
                        ? 'bg-rose-50 border-2 border-rose-500 focus:border-rose-600 focus:bg-white' 
                        : 'bg-slate-50 border-2 border-slate-200 focus:border-blue-600 focus:bg-white'
                    }`}
                  />
                </div>

                {/* Success Notification Banner after Resend */}
                {otpSuccessMessage && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2.5 shadow-2xs animate-in fade-in">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                    <div className="font-semibold">{otpSuccessMessage}</div>
                  </div>
                )}

                {/* Prominent Incorrect OTP Alert Banner */}
                {otpError && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-shake shadow-xs">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-rose-900">తప్పుడు ఓటీపీ! (Incorrect OTP Code)</div>
                        <div className="text-rose-700 mt-0.5 leading-relaxed">{otpError}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      className="shrink-0 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                      title="Reset OTP input and request a fresh OTP code"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Reset & Resend (రీసెట్)</span>
                    </button>
                  </div>
                )}

                {/* Verify Button */}
                <button
                  type="submit"
                  disabled={isLoading || otpEntered.length < 6}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
                    otpEntered.length === 6 && !isLoading
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Verify & Enter (ధృవీకరించి ప్రవేశించండి)</span>
                    </>
                  )}
                </button>

                {/* Resend & Cancel */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOtpModalOpen(false);
                      setOtpError(null);
                      setOtpEntered('');
                      setOtpSuccessMessage(null);
                    }}
                    className="text-slate-500 hover:text-slate-700 font-medium transition cursor-pointer"
                  >
                    Change Number / మార్చండి
                  </button>

                  {otpResendSeconds > 0 && !otpError ? (
                    <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Resend in {otpResendSeconds}s</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      className="text-blue-600 hover:text-blue-800 font-bold transition cursor-pointer flex items-center gap-1.5 hover:underline"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>{otpError ? 'Resend OTP & Reset (మళ్ళీ పంపండి / రీసెట్)' : 'Resend OTP (మళ్ళీ పంపండి)'}</span>
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
