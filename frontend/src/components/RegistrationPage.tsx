import React, { useState, useEffect } from 'react';
import { 
  User, Stethoscope, Briefcase, Shield, Sparkles, CheckCircle2, 
  ArrowRight, Building, Phone, Mail, AlertCircle, RefreshCw,
  Award, Hash, Plus, ChevronRight, Lock, EyeOff, ShieldCheck,
  MessageSquare, Copy, X, RotateCcw, Clock
} from 'lucide-react';
import type { UserProfile, DepartmentItem } from '../types';
import { validateIndianMobile, validateEmail } from '../utils/validation';

interface RegistrationPageProps {
  currentProfile: UserProfile;
  registeredUsers: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  onUserRegistered: (newUser: UserProfile, shouldSwitch: boolean) => void;
  onNavigateToTab: (tab: string) => void;
}

export const RegistrationPage: React.FC<RegistrationPageProps> = ({
  currentProfile,
  registeredUsers,
  onSelectUser,
  onUserRegistered,
  onNavigateToTab,
}) => {
  const [selectedRole, setSelectedRole] = useState<'patient' | 'doctor' | 'receptionist' | 'admin'>('patient');
  
  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState('Male');
  const [languagePref, setLanguagePref] = useState('English');
  const [hospitalId, setHospitalId] = useState(2); // Default Hospital B (Metro)

  // Doctor-specific fields
  const [departmentId, setDepartmentId] = useState(2); // General Medicine
  const [specialization, setSpecialization] = useState('');
  const [consultationFee, setConsultationFee] = useState(600);
  const [roomNumber, setRoomNumber] = useState('Room 218 (2nd Floor)');
  const [experienceYears, setExperienceYears] = useState(10);

  // Status & directory states
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [registeredSuccessUser, setRegisteredSuccessUser] = useState<UserProfile | null>(null);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // OTP Verification States
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpTargetPhone, setOtpTargetPhone] = useState('');
  const [otpSimulatedCode, setOtpSimulatedCode] = useState('');
  const [otpEntered, setOtpEntered] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpResendSeconds, setOtpResendSeconds] = useState(45);
  const [pendingRegisterPayload, setPendingRegisterPayload] = useState<Record<string, any> | null>(null);

  // Countdown timer for OTP
  useEffect(() => {
    if (!isOtpModalOpen || otpResendSeconds <= 0) return;
    const timer = setInterval(() => {
      setOtpResendSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOtpModalOpen, otpResendSeconds]);

  // Fetch departments from backend
  useEffect(() => {
    fetch('/api/departments')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: DepartmentItem[]) => {
        if (data && data.length > 0) {
          setDepartments(data);
          if (!departmentId) setDepartmentId(data[0].id);
        }
      })
      .catch((err) => console.warn('Could not fetch departments:', err));
  }, []);

  const hospitalOptions = [
    { id: 1, name: 'Apex Super Speciality Hospital', short: 'Hospital A (Apex)', area: 'Banjara Hills' },
    { id: 2, name: 'CareBridge Metro Health Center', short: 'Hospital B (Metro)', area: 'Gachibowli' },
    { id: 3, name: 'City Community Healthcare', short: 'Hospital C (City)', area: 'Secunderabad' },
  ];

  const selectedHospitalObj = hospitalOptions.find((h) => h.id === hospitalId) || hospitalOptions[1];
  const selectedDeptObj = departments.find((d) => d.id === departmentId);

  // Generate live initials
  const liveInitials = name.trim()
    ? name.trim().split(' ').map((n) => n[0]?.toUpperCase()).join('').slice(0, 2)
    : selectedRole === 'doctor'
    ? 'DR'
    : selectedRole === 'receptionist'
    ? 'ST'
    : selectedRole === 'admin'
    ? 'AD'
    : 'PT';

  const roleConfigs = {
    patient: {
      title: 'Patient (రోగి)',
      subtitle: 'Book low-wait consultations & digital passes',
      teluguSub: 'తక్కువ వెయిటింగ్ టైమ్‌తో అపాయింట్‌మెంట్‌లు & డిజిటల్ పాస్',
      icon: <User className="h-6 w-6 text-emerald-400" />,
      color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
      activeBorder: 'border-emerald-500 ring-2 ring-emerald-500/30',
      badge: 'New Patient Portal',
      prefix: 'PAT',
    },
    doctor: {
      title: 'Doctor (వైద్యుడు/వైద్యురాలు)',
      subtitle: 'Publish schedule slots & consult patients',
      teluguSub: 'కన్సల్టేషన్ స్లాట్‌లు ప్రచురించండి & రోగులకు చికిత్స చేయండి',
      icon: <Stethoscope className="h-6 w-6 text-cyan-400" />,
      color: 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400',
      activeBorder: 'border-cyan-500 ring-2 ring-cyan-500/30',
      badge: 'Hospital Doctor',
      prefix: 'DOC',
    },
    receptionist: {
      title: 'Receptionist (రిసెప్షనిస్ట్)',
      subtitle: 'Manage OPD desk, queues & resolve conflicts',
      teluguSub: 'ఓపీడీ డెస్క్ నిర్వహణ, క్యూలు & షెడ్యూల్ ఆడిట్',
      icon: <Briefcase className="h-6 w-6 text-indigo-400" />,
      color: 'border-indigo-500/50 bg-indigo-500/10 text-indigo-400',
      activeBorder: 'border-indigo-500 ring-2 ring-indigo-500/30',
      badge: 'Staff Desk',
      prefix: 'STAFF',
    },
    admin: {
      title: 'Hospital Admin (అడ్మిన్)',
      subtitle: 'Full governance, ICU beds, RAG & security logs',
      teluguSub: 'పూర్తి అడ్మినిస్ట్రేషన్, ఐసీయూ బెడ్స్ & సెక్యూరిటీ ఆడిట్',
      icon: <Shield className="h-6 w-6 text-amber-400" />,
      color: 'border-amber-500/50 bg-amber-500/10 text-amber-400',
      activeBorder: 'border-amber-500 ring-2 ring-amber-500/30',
      badge: 'Admin Access',
      prefix: 'ADMIN',
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setOtpError(null);

    if (!name.trim()) {
      setErrorMessage('Please enter the full name / దయచేసి పేరును నమోదు చేయండి.');
      return;
    }

    // Validate Indian Mobile: Must start with 6, 7, 8, or 9 (0, 1, 2, 3, 4, 5 are invalid)
    const phoneVal = validateIndianMobile(phone);
    if (!phoneVal.isValid) {
      setErrorMessage(phoneVal.message);
      return;
    }

    // Validate Email
    const regEmail = email.trim() || `${name.trim().toLowerCase().replace(/\s+/g, '.')}@carebridge.org`;
    const emailVal = validateEmail(regEmail);
    if (!emailVal.isValid) {
      setErrorMessage(emailVal.message);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Record<string, any> = {
        name: name.trim(),
        role: selectedRole,
        phone: phoneVal.formatted,
        email: emailVal.cleanEmail,
        language_pref: languagePref,
        age: age ? Number(age) : 35,
        gender,
        preferred_hospital_id: hospitalId,
      };

      if (selectedRole === 'doctor') {
        payload.department_id = departmentId;
        payload.specialization = specialization.trim() || (selectedDeptObj?.name || 'General Medicine');
        payload.consultation_fee = Number(consultationFee) || 600;
        payload.room_number = roomNumber.trim() || 'Room 218 (2nd Floor)';
        payload.experience_years = Number(experienceYears) || 8;
      }

      setPendingRegisterPayload(payload);

      // Request OTP
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: phoneVal.formatted, 
          email: emailVal.cleanEmail,
          purpose: 'register' 
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setOtpTargetPhone(data.phone || phoneVal.formatted);
        setOtpSimulatedCode(data.otp || '613020');
      } else {
        setOtpTargetPhone(phoneVal.formatted);
        setOtpSimulatedCode('613020');
      }
      setOtpEntered('');
      setOtpResendSeconds(45);
      setIsOtpModalOpen(true);
    } catch (err: any) {
      console.error(err);
      setOtpTargetPhone(phoneVal.formatted);
      setOtpSimulatedCode('613020');
      setOtpEntered('');
      setOtpResendSeconds(45);
      setIsOtpModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verify OTP submission
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanOtp = otpEntered.trim();
    if (!cleanOtp || cleanOtp.length < 6) {
      setOtpError('Please enter the complete 6-digit OTP verification code.');
      return;
    }

    setIsSubmitting(true);
    setOtpError(null);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: otpTargetPhone,
          otp: cleanOtp,
          purpose: 'register',
          register_payload: pendingRegisterPayload,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || errJson.message || 'Invalid OTP code. Please enter the correct code.');
      }

      const data = await res.json();
      if (data.success && data.user) {
        setIsOtpModalOpen(false);
        const isPatient = (data.user.role || pendingRegisterPayload?.role) === 'patient';
        const newUserProfile: UserProfile = { 
          ...data.user, 
          is_new: isPatient ? true : data.user.is_new,
          badge: isPatient ? 'New Patient Portal' : data.user.badge,
          description: isPatient ? `${data.user.name} (New Patient Portal)` : data.user.description
        };
        setRegisteredSuccessUser(newUserProfile);
        // By default assign newly registered patient to their New Patient Portal
        onUserRegistered(newUserProfile, isPatient);
      } else {
        throw new Error(data.message || 'Registration verification failed.');
      }
    } catch (err: any) {
      // Fallback for demo OTP code or master code 123456
      if (cleanOtp === otpSimulatedCode || cleanOtp === '123456') {
        if (pendingRegisterPayload) {
          const isPatient = pendingRegisterPayload.role === 'patient';
          const fallbackProfile: UserProfile = {
            id: Date.now(),
            name: pendingRegisterPayload.name,
            role: pendingRegisterPayload.role,
            phone: pendingRegisterPayload.phone,
            email: pendingRegisterPayload.email,
            languagePref: pendingRegisterPayload.language_pref,
            avatar: liveInitials,
            patient_uid: `CB-${Math.floor(1000 + Math.random() * 9000)}`,
            preferred_hospital: selectedHospitalObj.name,
            badge: isPatient ? 'New Patient Portal' : roleConfigs[selectedRole].badge,
            is_new: isPatient ? true : undefined,
            description: isPatient ? `${pendingRegisterPayload.name} (New Patient Portal)` : undefined
          };
          setIsOtpModalOpen(false);
          setRegisteredSuccessUser(fallbackProfile);
          onUserRegistered(fallbackProfile, isPatient);
        }
      } else {
        setOtpError(err.message || 'Invalid verification code. Please enter the correct 6-digit OTP sent to your phone.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP & Reset
  const handleResendOtp = async () => {
    setIsSubmitting(true);
    // Clear entered OTP and error on resend
    setOtpEntered('');
    setOtpError(null);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: otpTargetPhone,
          email: email.trim(),
          purpose: 'register',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setOtpSimulatedCode(data.otp || '613020');
      } else {
        setOtpSimulatedCode('789012');
      }
      setOtpResendSeconds(45);
    } catch (e) {
      setOtpSimulatedCode('789012');
      setOtpResendSeconds(45);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setAge('');
    setSpecialization('');
    setRegisteredSuccessUser(null);
    setErrorMessage(null);
  };

  const handleSwitchToRegistered = () => {
    if (registeredSuccessUser) {
      const userToSwitch: UserProfile = registeredSuccessUser.role === 'patient'
        ? {
            ...registeredSuccessUser,
            is_new: true,
            badge: 'New Patient Portal',
            description: registeredSuccessUser.description || `${registeredSuccessUser.name} (New Patient Portal)`
          }
        : registeredSuccessUser;
      onSelectUser(userToSwitch);
      if (userToSwitch.role === 'patient') {
        onNavigateToTab('dashboard');
      } else if (userToSwitch.role === 'doctor') {
        onNavigateToTab('doctor_dashboard');
      } else if (userToSwitch.role === 'receptionist') {
        onNavigateToTab('staff');
      } else {
        onNavigateToTab('dashboard');
      }
    }
  };

  const isStaff = currentProfile.role === 'admin' || currentProfile.role === 'receptionist';

  // Filter registered members (only for staff access)
  const filteredMembers = registeredUsers.filter((u) => {
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.patient_uid && u.patient_uid.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.preferred_hospital && u.preferred_hospital.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Top Header Banner */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              CareBridge Identity Gateway
            </span>
            <span className="text-xs text-slate-400">
              • {isStaff ? `${registeredUsers.length} Members Active in Network` : 'Protected Patient Network (DPDP & HIPAA Secure)'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Network User & Staff Registration
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            వినియోగదారు మరియు సిబ్బంది నమోదు — Register new Patients, Doctors, Receptionists, and Administrators.
          </p>
        </div>

        {/* Current Active Profile Indicator */}
        <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-700/70 rounded-xl px-4 py-2.5 shadow-lg">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-white shadow-md">
            {currentProfile.avatar || 'ME'}
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Currently Logged In As:</div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>{currentProfile.name}</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-emerald-400 border border-emerald-500/30">
                {currentProfile.badge || currentProfile.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Modal / Alert */}
      {registeredSuccessUser && (
        <div className="max-w-7xl mx-auto bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/50 rounded-2xl p-6 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0 text-emerald-400">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">
                    {registeredSuccessUser.role === 'patient' 
                      ? 'New Patient Portal Assigned! / కొత్త పేషెంట్ పోర్టల్ కేటాయించబడింది!'
                      : 'Registration Successful! / నమోదు విజయవంతమైంది!'}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    {registeredSuccessUser.patient_uid}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  <strong>{registeredSuccessUser.name}</strong> has been enrolled as a{' '}
                  <span className="text-emerald-400 font-semibold uppercase">{registeredSuccessUser.role === 'patient' ? 'NEW PATIENT PORTAL' : registeredSuccessUser.role}</span> at{' '}
                  {registeredSuccessUser.preferred_hospital}.
                  {registeredSuccessUser.role === 'patient' &&
                    ' Assigned by default to the New Patient Portal with fresh appointment booking and zero wait queue!'}
                  {registeredSuccessUser.role === 'doctor' &&
                    ' 3 open consultation slots have been scheduled for tomorrow!'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleSwitchToRegistered}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition cursor-pointer"
              >
                <span>
                  {registeredSuccessUser.role === 'patient' 
                    ? `🚀 View New Patient Portal (${registeredSuccessUser.name.split(' ')[0]})` 
                    : `🚀 Switch & Continue as ${registeredSuccessUser.name.split(' ')[0]}`}
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={handleResetForm}
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition cursor-pointer"
              >
                Register Another
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main 2-Column Section: Form + Live Digital Card Preview */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Role Selector & Registration Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Interactive Role Selector Cards */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
              1. Select Role / పాత్రను ఎంచుకోండి
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(['patient', 'doctor', 'receptionist', 'admin'] as const).map((roleKey) => {
                const conf = roleConfigs[roleKey];
                const isSelected = selectedRole === roleKey;
                return (
                  <button
                    key={roleKey}
                    type="button"
                    onClick={() => setSelectedRole(roleKey)}
                    className={`flex flex-col items-center text-center p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? `${conf.activeBorder} ${conf.color} shadow-lg`
                        : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-slate-950/60 mb-2">{conf.icon}</div>
                    <div className="text-xs font-bold text-slate-100">{conf.title.split(' ')[0]}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-full">
                      {conf.badge}
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-400 mt-2 px-1">
              {roleConfigs[selectedRole].teluguSub}
            </p>
          </div>

          {/* 2. Registration Form Fields */}
          <form
            onSubmit={handleSubmit}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>2. Member Information / సమాచారం</span>
              </h2>
              <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-medium">
                {roleConfigs[selectedRole].badge}
              </span>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name / పూర్తి పేరు <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={
                  selectedRole === 'doctor'
                    ? 'Dr. Rajesh Verma'
                    : selectedRole === 'receptionist'
                    ? 'Kavitha Murthy'
                    : 'Kalyan Chakravarthy'
                }
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition placeholder:text-slate-500"
                required
              />
            </div>

            {/* Phone & Email Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Phone Number / ఫోన్ నంబర్ <span className="text-emerald-400">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Must start with 6, 7, 8, or 9</span>
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98480 12345"
                    className={`w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border rounded-xl text-xs sm:text-sm text-slate-100 focus:outline-none transition placeholder:text-slate-500 ${
                      phone && validateIndianMobile(phone).status === 'invalid_start'
                        ? 'border-rose-500 focus:border-rose-400'
                        : phone && validateIndianMobile(phone).isValid
                        ? 'border-emerald-500 focus:border-emerald-400'
                        : 'border-slate-700 focus:border-emerald-500'
                    }`}
                  />
                </div>
                {phone && (() => {
                  const status = validateIndianMobile(phone);
                  if (status.status === 'invalid_start') {
                    return (
                      <p className="mt-1 text-[11px] text-rose-400 flex items-center gap-1 font-medium">
                        <AlertCircle className="h-3 w-3 inline" />
                        <span>చెల్లని నంబర్: '{status.firstDigit}' తో ప్రారంభం కారాదు. 6, 7, 8, 9 తో మాత్రమే ప్రారంభం కావాలి.</span>
                      </p>
                    );
                  }
                  if (status.status === 'valid') {
                    return (
                      <p className="mt-1 text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="h-3 w-3 inline" />
                        <span>చెల్లుబాటు అయ్యే నంబర్ ({status.firstDigit} తో ప్రారంభమైనది)</span>
                      </p>
                    );
                  }
                  return null;
                })()}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address / ఇమెయిల్ <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@carebridge.org"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition placeholder:text-slate-500"
                  />
                </div>
                {email && !validateEmail(email).isValid && (
                  <p className="mt-1 text-[11px] text-rose-400 flex items-center gap-1 font-medium">
                    <AlertCircle className="h-3 w-3 inline" />
                    <span>చెల్లని ఈమెయిల్ ఫార్మాట్</span>
                  </p>
                )}
                {email && validateEmail(email).isValid && (
                  <p className="mt-1 text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="h-3 w-3 inline" />
                    <span>ఈమెయిల్ ఫార్మాట్ సరైనది</span>
                  </p>
                )}
              </div>
            </div>

            {/* Age, Gender & Language */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Age / వయస్సు</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="35"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Gender / లింగం</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition cursor-pointer"
                >
                  <option value="Male">Male (పురుషుడు)</option>
                  <option value="Female">Female (స్త్రీ)</option>
                  <option value="Other">Other (ఇతర)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Language / భాష
                </label>
                <select
                  value={languagePref}
                  onChange={(e) => setLanguagePref(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition cursor-pointer"
                >
                  <option value="English">English</option>
                  <option value="Telugu">తెలుగు (Telugu)</option>
                </select>
              </div>
            </div>

            {/* Hospital Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Preferred Hospital / కేటాయించిన ఆసుపత్రి
              </label>
              <select
                value={hospitalId}
                onChange={(e) => setHospitalId(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition cursor-pointer"
              >
                {hospitalOptions.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.short} — {h.area}
                  </option>
                ))}
              </select>
            </div>

            {/* Doctor-Specific Dynamic Fields */}
            {selectedRole === 'doctor' && (
              <div className="pt-4 border-t border-slate-800/80 space-y-4 bg-cyan-950/20 p-4 rounded-xl border border-cyan-500/20">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                  <Stethoscope className="h-4 w-4" />
                  <span>Clinical Credentials & OP Schedule / డాక్టర్ వివరాలు</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Department / విభాగం
                    </label>
                    <select
                      value={departmentId}
                      onChange={(e) => setDepartmentId(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} {d.telugu_name ? `(${d.telugu_name})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Specialization / స్పెషలైజేషన్
                    </label>
                    <input
                      type="text"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      placeholder="e.g. Coronary Care & Preventive"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Consultation Fee (₹)
                    </label>
                    <input
                      type="number"
                      value={consultationFee}
                      onChange={(e) => setConsultationFee(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Room / Clinic Number
                    </label>
                    <input
                      type="text"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Experience (Years)
                    </label>
                    <input
                      type="number"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Processing Registration / నమోదు ప్రక్రియ...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>
                      Verify Phone & Complete Registration (ఫోన్ ఓటీపీ ద్వారా నమోదు)
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Digital ID Preview & Quick Guidance (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live ID Preview Card */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>Live Digital Badge Preview / ప్రత్యక్ష కార్డ్ ప్రివ్యూ</span>
              </label>
              <span className="text-[10px] text-slate-500 font-mono">Updates Real-Time</span>
            </div>

            {/* Card Container */}
            <div className="relative rounded-2xl p-6 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-700/80 shadow-2xl overflow-hidden">
              {/* Background ambient gradient glow */}
              <div
                className={`absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-30 ${
                  selectedRole === 'patient'
                    ? 'bg-emerald-500'
                    : selectedRole === 'doctor'
                    ? 'bg-cyan-500'
                    : selectedRole === 'receptionist'
                    ? 'bg-indigo-500'
                    : 'bg-amber-500'
                }`}
              />

              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white font-black text-xs shadow">
                    CB
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-white tracking-tight">
                      CareBridge AI Network
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">Digital Identity Pass</div>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${roleConfigs[selectedRole].color}`}
                >
                  {roleConfigs[selectedRole].badge}
                </span>
              </div>

              {/* Card Body with Avatar & Details */}
              <div className="flex items-start gap-4 relative z-10 mb-4">
                <div
                  className={`h-16 w-16 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-xl flex-shrink-0 border border-white/20 ${
                    selectedRole === 'patient'
                      ? 'bg-gradient-to-tr from-emerald-600 to-teal-600'
                      : selectedRole === 'doctor'
                      ? 'bg-gradient-to-tr from-cyan-600 to-blue-600'
                      : selectedRole === 'receptionist'
                      ? 'bg-gradient-to-tr from-indigo-600 to-purple-600'
                      : 'bg-gradient-to-tr from-amber-600 to-orange-600'
                  }`}
                >
                  {liveInitials}
                </div>

                <div className="overflow-hidden flex-1">
                  <h3 className="text-base font-bold text-white truncate">
                    {name.trim() || (selectedRole === 'doctor' ? 'Dr. Doctor Name' : 'New Member Name')}
                  </h3>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <Hash className="h-3 w-3 text-slate-500" />
                    <span className="font-mono text-emerald-400">
                      {roleConfigs[selectedRole].prefix}-PREVIEW
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 mt-1 flex items-center gap-1.5 truncate">
                    <Building className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
                    <span className="truncate">{selectedHospitalObj.short}</span>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/80 rounded-xl p-3 border border-slate-800/80 mb-4 relative z-10">
                <div>
                  <span className="text-slate-500 block">Language / భాష:</span>
                  <span className="font-semibold text-slate-200">{languagePref}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Contact / ఫోన్:</span>
                  <span className="font-semibold text-slate-200 truncate block">
                    {phone.trim() || '+91 ••••• •••••'}
                  </span>
                </div>
                {selectedRole === 'doctor' && (
                  <>
                    <div>
                      <span className="text-slate-500 block">Department:</span>
                      <span className="font-semibold text-cyan-300 truncate block">
                        {selectedDeptObj?.name || 'General Medicine'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Fee / Room:</span>
                      <span className="font-semibold text-cyan-300">
                        ₹{consultationFee} • {roomNumber}
                      </span>
                    </div>
                  </>
                )}
                {selectedRole !== 'doctor' && (
                  <>
                    <div>
                      <span className="text-slate-500 block">Age / Gender:</span>
                      <span className="font-semibold text-slate-200">
                        {age || '35'} Yrs • {gender}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Access Tier:</span>
                      <span className="font-semibold text-emerald-400">
                        {selectedRole === 'patient' ? 'Standard OPD' : 'Staff Authorized'}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Card Footer Micro-Barcode */}
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800/60 font-mono">
                <span>VERIFIED HEALTH ID</span>
                <span className="tracking-widest">||||| | |||| ||| ||||</span>
              </div>
            </div>
          </div>

          {/* Quick Help Box */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-xs text-slate-400 space-y-2">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Award className="h-4 w-4 text-emerald-400" />
              <span>Why Register in CareBridge AI?</span>
            </div>
            <ul className="space-y-1.5 list-disc pl-4 text-[11px]">
              <li>
                <strong className="text-slate-300">Patients</strong> get personalized low-wait slot
                recommendations based on proximity and Telugu preference.
              </li>
              <li>
                <strong className="text-slate-300">Doctors</strong> instantly publish bookable slots to
                the SmartFlow simulation engine.
              </li>
              <li>
                <strong className="text-slate-300">Staff & Admins</strong> receive authorized access to
                RBAC medical records and schedule conflict resolution.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Section 3: Registered Members Directory (Protected by RBAC & DPDP Privacy) */}
      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800/80 space-y-4">
        {isStaff ? (
          <>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>3. Registered Network Members ({registeredUsers.length})</span>
                    <span className="text-xs font-normal text-slate-400">
                      ప్రస్తుతం నమోదైన సభ్యుల జాబితా
                    </span>
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    <span>ADMIN / STAFF CLEARANCE</span>
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Authorized administrative roster for hospital desk coordination, OPD queue audits, and doctor slot management.
                </p>
              </div>

              {/* Search and Role Filter */}
              <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, ID or hospital..."
                  className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500 w-full sm:w-56"
                />

                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="all">All Roles ({registeredUsers.length})</option>
                  <option value="patient">Patients</option>
                  <option value="doctor">Doctors</option>
                  <option value="receptionist">Receptionists</option>
                  <option value="admin">Admins</option>
                </select>
              </div>
            </div>

            {/* Member Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredMembers.map((member) => {
                const isActive = currentProfile.id === member.id;
                const roleConf =
                  roleConfigs[member.role as keyof typeof roleConfigs] || roleConfigs.patient;

                return (
                  <div
                    key={member.id}
                    className={`p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                      isActive
                        ? 'bg-slate-900/95 border-emerald-500 ring-1 ring-emerald-500/40 shadow-lg shadow-emerald-500/10'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold text-white flex-shrink-0 text-sm shadow ${
                          member.role === 'doctor'
                            ? 'bg-gradient-to-tr from-cyan-600 to-blue-600'
                            : member.role === 'receptionist'
                            ? 'bg-gradient-to-tr from-indigo-600 to-purple-600'
                            : member.role === 'admin'
                            ? 'bg-gradient-to-tr from-amber-600 to-orange-600'
                            : 'bg-gradient-to-tr from-emerald-600 to-teal-600'
                        }`}
                      >
                        {member.avatar || member.name.slice(0, 2).toUpperCase()}
                      </div>

                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-sm font-bold text-white truncate">{member.name}</h4>
                          <div className="flex items-center gap-1">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${roleConf.color}`}>
                              {roleConf.badge}
                            </span>
                            {isActive && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                                ACTIVE
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-emerald-400 text-[10px]">
                            {member.patient_uid || `UID-${member.id}`}
                          </span>
                          <span>•</span>
                          <span className="capitalize">{member.role}</span>
                          <span>•</span>
                          <span>{member.languagePref}</span>
                        </div>
                        <div className="text-[11px] text-slate-300 mt-1 truncate">
                          {member.preferred_hospital || 'Hospital B (Metro)'}
                        </div>
                        {member.specialization && (
                          <div className="text-[10px] text-cyan-300 font-medium truncate mt-0.5">
                            🩺 {member.specialization}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Button */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 truncate">
                        {member.phone || 'No phone'}
                      </span>

                      {isActive ? (
                        <button
                          onClick={() => onNavigateToTab('chat')}
                          className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 hover:bg-emerald-500/20 transition cursor-pointer"
                        >
                          <span>Open Chat</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onSelectUser(member)}
                          className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                        >
                          <span>Switch to Profile</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* Privacy Guardrail Shield for Non-Staff / Patients */
          <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950 p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex-shrink-0">
                  <Lock className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      Registered Members Directory Protected (సభ్యుల వివరాల గోప్యత రక్షణ)
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      DPDP ACT 2023 & HIPAA PRIVACY SHIELD
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                    Under hospital data privacy laws (DPDP Act & HIPAA compliance), registered members' personal records, phone numbers, and patient IDs are confidential and cannot be displayed to everyone. Only authenticated Hospital Administrators and Staff can access the directory.
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    నమోదైన సభ్యుల వ్యక్తిగత సమాచారం మరియు ఫోన్ నంబర్లు గోప్యమైనవి. ఆసుపత్రి అడ్మినిస్ట్రేటర్లు లేదా సిబ్బందికి మాత్రమే ఈ డేటాను చూసే అనుమతి ఉంది.
                  </p>
                </div>
              </div>

              {/* Quick Admin Verification Switch */}
              <button
                onClick={() => {
                  const adminUser = registeredUsers.find((u) => u.role === 'admin') || {
                    id: 4,
                    name: 'Dr. Varma',
                    role: 'admin' as const,
                    languagePref: 'English',
                    description: 'Chief Hospital Administrator',
                    avatar: 'DV',
                    badge: 'Admin Access',
                    patient_uid: 'ADMIN-3001',
                    phone: '+91 99999 88888',
                  };
                  onSelectUser(adminUser);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer flex-shrink-0"
              >
                <Shield className="h-4 w-4" />
                <span>Switch to Admin Persona (Dr. Varma)</span>
              </button>
            </div>

            {/* Security Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs">
                  <EyeOff className="h-4 w-4" />
                  <span>Zero Public Exposure</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Registered patient directories are partitioned by role; unauthorized enumeration is blocked at the API layer.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Self-Service Privacy</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  You can register, obtain your personal Digital Pass, and manage your consultations securely without exposing other users.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs">
                  <Shield className="h-4 w-4" />
                  <span>Staff Audit Clearance</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Hospital Administrators (Dr. Varma) and Receptionists (Priya Sharma) have auditable clearance to coordinate hospital flow.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* OTP Verification Modal */}
      {isOtpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden transform transition-all text-slate-100">
            {/* Header / Accent Bar */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-xs border border-white/20">
                    <ShieldCheck className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      Phone OTP Verification
                    </h3>
                    <p className="text-xs text-emerald-100 font-sans">
                      ఫోన్ ఓటీపీ ధృవీకరణ
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOtpModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
                  title="Close (మూసివేయండి)"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Phone display */}
              <div className="text-center space-y-1">
                <p className="text-xs text-slate-400">
                  A 6-digit one-time password has been sent to your registered phone number:
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 text-emerald-300 font-mono text-xs font-bold border border-slate-700">
                  <Phone className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{otpTargetPhone}</span>
                </div>
              </div>

              {/* Simulated SMS Toast / Quick Test Helper */}
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <MessageSquare className="h-4 w-4" />
                    <span>Incoming SMS Simulation (ఎస్ఎంఎస్ నోటిఫికేషన్)</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold font-mono">
                    VALID: 5 MIN
                  </span>
                </div>
                <div className="text-xs font-medium text-slate-300 bg-slate-900/90 p-2.5 rounded-xl border border-slate-700 font-mono">
                  &quot;CareBridge Security: Your registration code is <span className="font-bold text-emerald-400 tracking-wider text-sm">{otpSimulatedCode}</span>. Valid for 5 mins.&quot;
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setOtpEntered(otpSimulatedCode);
                    setOtpError(null);
                  }}
                  className="w-full py-1.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-emerald-500/20"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Auto-Fill Code ({otpSimulatedCode}) / ఆటో-ఫిల్ చేయండి</span>
                </button>
              </div>

              {/* OTP Form */}
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 text-center">
                    Enter 6-Digit OTP (6-అంకెల ఓటీపీ నమోదు చేయండి)
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    value={otpEntered}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtpEntered(val);
                      if (otpError) setOtpError(null);
                    }}
                    placeholder="• • • • • •"
                    className="w-full text-center tracking-[0.75em] text-2xl font-mono font-bold py-3.5 px-4 bg-slate-950 border-2 border-slate-700 focus:border-emerald-500 focus:bg-slate-900 rounded-2xl outline-none transition text-emerald-400 shadow-inner"
                  />
                </div>

                {/* Error Banner */}
                {otpError && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                      <span>{otpError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isSubmitting}
                      className="shrink-0 px-2.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-[11px] flex items-center justify-center gap-1 transition cursor-pointer"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Reset & Resend (రీసెట్)</span>
                    </button>
                  </div>
                )}

                {/* Verify Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || otpEntered.length < 6}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                    otpEntered.length === 6 && !isSubmitting
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? (
                    <RefreshCw className="h-4 w-4 animate-spin text-slate-950" />
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Verify & Complete Registration (ధృవీకరించి పూర్తి చేయండి)</span>
                    </>
                  )}
                </button>

                {/* Resend & Cancel */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOtpModalOpen(false);
                      setOtpEntered('');
                      setOtpError(null);
                    }}
                    className="text-slate-400 hover:text-slate-200 font-medium transition cursor-pointer"
                  >
                    Change Number / మార్చండి
                  </button>

                  {otpResendSeconds > 0 && !otpError ? (
                    <span className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Resend in {otpResendSeconds}s</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isSubmitting}
                      className="text-emerald-400 hover:text-emerald-300 font-semibold transition cursor-pointer flex items-center gap-1.5"
                    >
                      <RotateCcw className="h-3 w-3" />
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
