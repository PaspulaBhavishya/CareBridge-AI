import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, User, Globe, Shield, Bell, Smartphone, 
  RotateCcw, CheckCircle2, Sparkles, Building2, 
  Lock, Volume2, Save, HeartHandshake,
  Check, Phone, Mail, Award, Database, Wifi, WifiOff, ExternalLink, RefreshCw, Trash2,
  AlertCircle, Loader2, Stethoscope
} from 'lucide-react';
import type { UserProfile } from '../types';
import { validateIndianMobile, validateEmail } from '../utils/validation';
import { 
  getFirebaseConfig, 
  saveFirebaseConfig, 
  clearFirebaseConfig, 
  subscribeToConnectionStatus,
  seedFirebaseBaseline,
  type FirebaseConfig 
} from '../config/firebase';

interface SettingsViewProps {
  currentProfile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  language: 'en' | 'te';
  onLanguageChange: (lang: 'en' | 'te') => void;
  seniorMode: boolean;
  onToggleSeniorMode: (val: boolean) => void;
  onResetDemo: () => void;
  isResetting: boolean;
  onNavigateTab: (tab: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentProfile,
  onUpdateProfile,
  language,
  onLanguageChange,
  seniorMode,
  onToggleSeniorMode,
  onResetDemo,
  isResetting,
  onNavigateTab
}) => {
  const isTe = language === 'te';
  const isAdmin = currentProfile?.role === 'admin';
  const isDoctor = currentProfile?.role === 'doctor';

  // Profile Form State
  const [name, setName] = useState(currentProfile.name || '');
  const [phone, setPhone] = useState(currentProfile.phone || '+91 98480 12345');
  const [email, setEmail] = useState(currentProfile.email || 'patient@carebridge.ai');
  const [age, setAge] = useState<number>(currentProfile.age || 26);
  const [gender, setGender] = useState(currentProfile.gender || 'Female');
  const [preferredHospital, setPreferredHospital] = useState(
    currentProfile.preferred_hospital || 'Hospital B (CareBridge Metro, Gachibowli)'
  );
  const [specialization, setSpecialization] = useState(currentProfile.specialization || 'Cardiology');
  const [roomNumber, setRoomNumber] = useState(currentProfile.room_number || 'Room 102 (1st Floor)');
  const [consultationFee, setConsultationFee] = useState<number>(currentProfile.consultation_fee || 500);

  const lastProfileIdRef = useRef<number | null>(null);

  // Sync state only when a different user profile is loaded (prevents background polling overwrites)
  useEffect(() => {
    if (currentProfile && currentProfile.id !== lastProfileIdRef.current) {
      lastProfileIdRef.current = currentProfile.id;
      setName(currentProfile.name || '');
      setPhone(currentProfile.phone || '');
      setEmail(currentProfile.email || '');
      setAge(currentProfile.age || 26);
      setGender(currentProfile.gender || 'Female');
      if (currentProfile.preferred_hospital) {
        setPreferredHospital(currentProfile.preferred_hospital);
      }
      if (currentProfile.specialization) {
        setSpecialization(currentProfile.specialization);
      }
      if (currentProfile.room_number) {
        setRoomNumber(currentProfile.room_number);
      }
      if (currentProfile.consultation_fee) {
        setConsultationFee(currentProfile.consultation_fee);
      }
    }
  }, [currentProfile?.id]);

  // Saving & Feedback State
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Live mobile validation check
  const phoneValidation = validateIndianMobile(phone);

  // Notification Toggles State
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [audioChimes, setAudioChimes] = useState(true);
  const [emergencyGeoAccess, setEmergencyGeoAccess] = useState(true);

  // Firebase Realtime Database State
  const initialFb = getFirebaseConfig();
  const [fbDatabaseUrl, setFbDatabaseUrl] = useState(initialFb?.databaseURL || '');
  const [fbProjectId, setFbProjectId] = useState(initialFb?.projectId || '');
  const [fbApiKey, setFbApiKey] = useState(initialFb?.apiKey || '');
  const [firebaseConnected, setFirebaseConnected] = useState(false);
  const [fbStatusMessage, setFbStatusMessage] = useState<string | null>(null);
  const [isSeedingFb, setIsSeedingFb] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    const unsub = subscribeToConnectionStatus((connected) => {
      setFirebaseConnected(connected);
    });
    return () => {
      if (unsub) unsub();
    };
  }, [isAdmin, fbDatabaseUrl]);

  const handleSaveFirebase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbDatabaseUrl.trim()) {
      setFbStatusMessage(isTe ? 'దయచేసి డేటాబేస్ URL నమోదు చేయండి' : 'Please enter a valid Firebase Realtime Database URL');
      return;
    }
    const cleanUrl = fbDatabaseUrl.trim().replace(/\/+$/, '');
    const detectedProjectId = fbProjectId.trim() || cleanUrl.replace(/https?:\/\//, '').split(/[\.-]/)[0];
    const config: FirebaseConfig = {
      databaseURL: cleanUrl,
      projectId: detectedProjectId,
      apiKey: fbApiKey.trim() || 'AIzaSyClientDemoKey',
      authDomain: `${detectedProjectId}.firebaseapp.com`
    };
    const ok = saveFirebaseConfig(config);
    if (ok) {
      setFbStatusMessage(isTe ? 'ఫైర్‌బేస్ రియల్-టైమ్ డేటాబేస్ సేవ్ చేయబడింది!' : 'Firebase Realtime Database configuration saved successfully!');
      setTimeout(() => setFbStatusMessage(null), 4000);
    }
  };

  const handleClearFirebase = () => {
    clearFirebaseConfig();
    setFbDatabaseUrl('');
    setFbProjectId('');
    setFbApiKey('');
    setFirebaseConnected(false);
    setFbStatusMessage(isTe ? 'ఫైర్‌బేస్ డిస్‌కనెక్ట్ చేయబడింది (లోకల్ మోడ్)' : 'Firebase disconnected. Switched back to local mode.');
    setTimeout(() => setFbStatusMessage(null), 3000);
  };

  const handleSeedFirebase = async () => {
    setIsSeedingFb(true);
    try {
      const ok = await seedFirebaseBaseline([], null);
      if (ok) {
        setFbStatusMessage(isTe ? 'ఆసుపత్రి డేటా ఫైర్‌బేస్ రియల్-టైమ్ డేటాబేస్‌కు సింక్ చేయబడింది!' : 'Hospital baseline OPD queue & appointments synced to Firebase Realtime Database!');
      } else {
        setFbStatusMessage(isTe ? 'సింక్ విఫలమైంది. డేటాబేస్ URL & రూల్స్ సరిచూసుకోండి.' : 'Sync failed. Please verify your Firebase Database URL and read/write security rules.');
      }
    } catch (err: any) {
      setFbStatusMessage(`Error: ${err?.message || 'Sync failed'}`);
    } finally {
      setIsSeedingFb(false);
      setTimeout(() => setFbStatusMessage(null), 4000);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setSaveSuccess(false);

    // 1. Client-side Mobile Number Validation (6, 7, 8, 9 valid; 0-5 invalid)
    const mobileCheck = validateIndianMobile(phone);
    if (!mobileCheck.isValid) {
      setValidationError(
        isTe ? mobileCheck.message : `Mobile Validation Error: ${mobileCheck.message}`
      );
      return;
    }

    // 2. Client-side Email Validation
    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      setValidationError(
        isTe ? emailCheck.message : `Email Validation Error: ${emailCheck.message}`
      );
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentProfile.id,
          patient_uid: currentProfile.patient_uid,
          name: name.trim(),
          phone: mobileCheck.formatted || phone.trim(),
          email: email.trim().toLowerCase(),
          age: Number(age),
          gender,
          preferred_hospital: preferredHospital,
          role: currentProfile.role,
          language_pref: currentProfile.languagePref,
          specialization: isDoctor ? specialization : undefined,
          room_number: isDoctor ? roomNumber : undefined,
          consultation_fee: isDoctor ? Number(consultationFee) : undefined,
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.detail || result.message || 'డేటాబేస్‌లో ప్రొఫైల్ సేవ్ చేయడం విఫలమైంది.');
      }

      // Propagate updated user to React State & localStorage
      if (result.user) {
        onUpdateProfile(result.user);
      } else {
        onUpdateProfile({
          name: name.trim(),
          phone: mobileCheck.formatted || phone.trim(),
          email: email.trim().toLowerCase(),
          age: Number(age),
          gender,
          preferred_hospital: preferredHospital,
          specialization: isDoctor ? specialization : undefined,
          room_number: isDoctor ? roomNumber : undefined,
          consultation_fee: isDoctor ? Number(consultationFee) : undefined,
        });
      }

      setSaveSuccess(true);
      setSaveSuccessMsg(
        isTe
          ? (result.telugu_message || 'ప్రొఫైల్ మార్పులు డేటాబేస్ (SQLite) లో విజయవంతంగా భద్రపరచబడ్డాయి!')
          : (result.message || 'Profile changes saved and committed to database successfully!')
      );
      setTimeout(() => setSaveSuccess(false), 5000);
    } catch (err: any) {
      setValidationError(err.message || 'డేటాబేస్ అప్‌డేట్ విఫలమైంది. దయచేసి మళ్ళీ ప్రయత్నించండి.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 bg-[#F8FAFC] text-slate-800 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-24">
      {/* Header Banner */}
      <div className="max-w-4xl mx-auto bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
              <Settings className="h-3.5 w-3.5 text-blue-600" />
              <span>{isTe ? 'సిస్టమ్ సెట్టింగ్‌లు' : 'System Configuration & Preferences'}</span>
            </span>
            <span className="text-xs text-slate-400">
              • {isTe ? 'యూజర్ & అప్లికేషన్ ప్రాధాన్యతలు' : 'User & App Preferences'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Settings className="h-7 w-7 text-blue-600" />
            <span>{isTe ? 'సెట్టింగ్‌లు & ప్రాధాన్యతలు' : 'Settings & Preferences'}</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isTe 
              ? 'మీ ప్రొఫైల్ వివరాలు, భాష, డిస్ప్లే మరియు నోటిఫికేషన్ సెట్టింగ్‌లను ఇక్కడ మార్చుకోవచ్చు.' 
              : 'Manage your profile, language, accessibility, display preferences, and notification channels.'}
          </p>
        </div>

        {/* Quick Role Badge */}
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-xl">{currentProfile.avatar || '👤'}</span>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              {isTe ? 'ప్రస్తుత రోల్' : 'Active Role'}
            </span>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {currentProfile.role}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">

        {/* 1. Profile & Account Settings Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {isTe ? 'యూజర్ ప్రొఫైల్ వివరాలు' : 'Personal Profile & Account'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isTe ? 'రోగి లేదా వైద్యుల ప్రాథమిక సమాచారం' : 'Update your personal contact details and hospital preferences'}
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-mono font-bold border border-blue-200">
              UID: {currentProfile.patient_uid || `UID-${currentProfile.id}`}
            </span>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  {isTe ? 'పూర్తి పేరు (Full Name)' : 'Full Name'}
                </label>
                <div className="relative">
                  <User className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-600 font-medium"
                    placeholder="e.g. Bhavishya"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 block">
                    {isTe ? 'మొబైల్ నంబర్ (Phone Number)' : 'Mobile Phone'}
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {isTe ? '6, 7, 8, 9 తో మాత్రమే ప్రారంభం కావాలి' : 'Must start with 6, 7, 8, or 9'}
                  </span>
                </div>
                <div className="relative">
                  <Phone className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-xs text-slate-800 focus:outline-none font-medium transition ${
                      phoneValidation.status === 'invalid_start'
                        ? 'border-rose-400 bg-rose-50/30 focus:border-rose-600'
                        : phoneValidation.status === 'valid'
                        ? 'border-emerald-400 bg-emerald-50/30 focus:border-emerald-600'
                        : 'border-slate-200 focus:border-blue-600'
                    }`}
                    placeholder="+91 98480 12345"
                  />
                </div>
                {/* Real-time Phone Validation Hint */}
                {phone.trim() && phoneValidation.status === 'invalid_start' && (
                  <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1.5 animate-in fade-in">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {isTe 
                        ? `చెల్లని మొబైల్! '${phoneValidation.firstDigit}' తో ప్రారంభమైంది. 0,1,2,3,4,5 అంకెలతో ప్రారంభమయ్యేవి చెల్లవు. (6, 7, 8, 9 మాత్రమే చెల్లుతాయి)`
                        : `Invalid mobile! Starts with '${phoneValidation.firstDigit}'. Numbers starting with 0-5 are invalid (must start with 6, 7, 8, or 9).`}
                    </span>
                  </p>
                )}
                {phone.trim() && phoneValidation.status === 'valid' && (
                  <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1.5 animate-in fade-in">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {isTe 
                        ? `సరైన మొబైల్ నంబర్! (${phoneValidation.firstDigit} తో ప్రారంభమైనది)` 
                        : `Valid Indian mobile number (starts with ${phoneValidation.firstDigit})`}
                    </span>
                  </p>
                )}
                {phone.trim() && phoneValidation.status === 'incomplete' && (
                  <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1.5">
                    <span>
                      {isTe 
                        ? `సరైన ప్రారంభ అంకె (${phoneValidation.firstDigit})! 10 అంకెలు పూర్తి చేయండి (${phoneValidation.digits.length}/10)` 
                        : `Valid start (${phoneValidation.firstDigit}). Complete 10 digits (${phoneValidation.digits.length}/10)`}
                    </span>
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  {isTe ? 'ఇమెయిల్ చిరునామా (Email)' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-600 font-medium"
                    placeholder="patient@carebridge.ai"
                  />
                </div>
              </div>

              {/* Age & Gender */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    {isTe ? 'వయస్సు (Age)' : 'Age'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    {isTe ? 'లింగం (Gender)' : 'Gender'}
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-600 font-medium bg-white"
                  >
                    <option value="Female">Female (స్త్రీ)</option>
                    <option value="Male">Male (పురుషుడు)</option>
                    <option value="Other">Other (ఇతర)</option>
                  </select>
                </div>
              </div>

              {/* Doctor Specific Fields (if role === 'doctor') */}
              {isDoctor && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 block flex items-center gap-1.5">
                      <Stethoscope className="h-3.5 w-3.5 text-blue-600" />
                      <span>{isTe ? 'స్పెషలైజేషన్ (Specialization)' : 'Medical Specialization'}</span>
                    </label>
                    <input
                      type="text"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-600 font-medium"
                      placeholder="e.g. Cardiology, Neurology"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 block">
                        {isTe ? 'గది సంఖ్య (Room No)' : 'Consultation Room'}
                      </label>
                      <input
                        type="text"
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-600 font-medium"
                        placeholder="Room 102 (1st Floor)"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 block">
                        {isTe ? 'కన్సల్టేషన్ ఫీజు (Fee ₹)' : 'Consult Fee (₹)'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        value={consultationFee}
                        onChange={(e) => setConsultationFee(Number(e.target.value))}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-600 font-medium"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Preferred Hospital Node */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 block">
                  {isTe ? 'ప్రాధాన్య ఆసుపత్రి నెట్‌వర్క్ (Preferred Network Hospital)' : 'Preferred Hospital Node'}
                </label>
                <div className="relative">
                  <Building2 className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                  <select
                    value={preferredHospital}
                    onChange={(e) => setPreferredHospital(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-600 font-medium bg-white"
                  >
                    <option value="Hospital B (CareBridge Metro, Gachibowli)">
                      Hospital B — CareBridge Metro Health Center (Gachibowli, Financial District)
                    </option>
                    <option value="Hospital A (Apex Super Speciality, Banjara Hills)">
                      Hospital A — Apex Super Speciality Hospital (Banjara Hills, Road No. 2)
                    </option>
                    <option value="Hospital C (City Community Healthcare, Secunderabad)">
                      Hospital C — City Community Healthcare (Secunderabad, Clock Tower)
                    </option>
                  </select>
                </div>
              </div>

            </div>

            {/* Validation Error Message Box */}
            {validationError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700 font-medium animate-in fade-in">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">{validationError}</div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
              {saveSuccess ? (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 shadow-xs animate-in fade-in">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{saveSuccessMsg || (isTe ? 'ప్రొఫైల్ వివరాలు డేటాబేస్‌లో విజయవంతంగా అప్‌డేట్ చేయబడ్డాయి!' : 'Profile updated in database successfully!')}</span>
                  <span className="ml-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-mono border border-emerald-300">
                    SQLite DB Synced
                  </span>
                </div>
              ) : (
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Database className="h-3.5 w-3.5 text-slate-400" />
                  <span>{isTe ? 'మార్పులు నేరుగా SQLite డేటాబేస్‌లో భద్రపరచబడతాయి' : 'Changes are committed directly to SQLite database'}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSaving || (phone.trim() !== '' && phoneValidation.status === 'invalid_start')}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-md ${
                  phone.trim() !== '' && phoneValidation.status === 'invalid_start'
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                    : isSaving
                    ? 'bg-blue-400 text-white cursor-wait'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
                }`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{isTe ? 'డేటాబేస్‌లో సేవ్ అవుతోంది...' : 'Saving to Database...'}</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>{isTe ? 'వివరాలను డేటాబేస్‌లో సేవ్ చేయండి' : 'Save Changes to Database'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* 2. Language & Regional Preferences */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isTe ? 'భాష మరియు ప్రాంతీయ ప్రాధాన్యతలు' : 'Language & Regional Settings'}
              </h3>
              <p className="text-xs text-slate-500">
                {isTe ? 'పోర్టల్ ప్రదర్శన భాష మరియు వాయిస్ ప్రాధాన్యతలు' : 'Choose primary interface language and voice audio assistance'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* English Selector */}
            <div 
              onClick={() => onLanguageChange('en')}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                language === 'en'
                  ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div>
                <div className="text-sm font-extrabold text-slate-900">English (Global)</div>
                <div className="text-xs text-slate-500 mt-0.5">Primary medical clinical language</div>
              </div>
              {language === 'en' && (
                <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
              )}
            </div>

            {/* Telugu Selector */}
            <div 
              onClick={() => onLanguageChange('te')}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                language === 'te'
                  ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div>
                <div className="text-sm font-extrabold text-slate-900">తెలుగు (Telugu)</div>
                <div className="text-xs text-slate-500 mt-0.5">ప్రాంతీయ భాష మరియు వాయిస్ అసిస్టెంట్</div>
              </div>
              {language === 'te' && (
                <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
              )}
            </div>

          </div>
        </div>

        {/* 3. Accessibility & Display Preferences */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="h-9 w-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isTe ? 'సౌలభ్యం మరియు డిస్ప్లే సెట్టింగ్‌లు' : 'Accessibility & Display Options'}
              </h3>
              <p className="text-xs text-slate-500">
                {isTe ? 'పెద్దల కోసం అధిక కాంట్రాస్ట్ మరియు స్పష్టమైన అక్షరాలు' : 'Comfortable readability modes for senior citizens and low-vision patients'}
              </p>
            </div>
          </div>

          {/* Senior Mode Toggle Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                seniorMode ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                👴
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>{isTe ? 'సీనియర్ సిటిజన్ మోడ్ (Senior Mode)' : 'Senior Citizen High-Contrast Mode'}</span>
                  {seniorMode && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      ACTIVE
                    </span>
                  )}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isTe 
                    ? 'పెద్ద అక్షరాలు, అధిక కాంట్రాస్ట్ మరియు సరళమైన మెనూలను సులభంగా చదవడానికి అనువుగా చేస్తుంది.' 
                    : 'Enlarges text size, increases contrast ratios, and emphasizes voice guidance throughout all screens.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => onToggleSeniorMode(!seniorMode)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                seniorMode ? 'bg-amber-600' : 'bg-slate-300'
              }`}
              role="switch"
              aria-checked={seniorMode}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  seniorMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Audio Chime Alerts Toggle */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Volume2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  {isTe ? 'ఆడియో హెచ్చరికలు & చైమ్ సౌండ్స్' : 'Audio Chimes & Notification Sounds'}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isTe 
                    ? 'టోకెన్ పిలుపు, అపాయింట్‌మెంట్ కన్ఫర్మేషన్ మరియు ఎమర్జెన్సీ అలర్ట్ శబ్దాలు.' 
                    : 'Play auditory chimes when token numbers are announced and appointments are verified.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setAudioChimes(!audioChimes)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                audioChimes ? 'bg-blue-600' : 'bg-slate-300'
              }`}
              role="switch"
              aria-checked={audioChimes}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  audioChimes ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 4. Multi-Channel Notification Settings */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isTe ? 'నోటిఫికేషన్లు మరియు సందేశాల ఛానెల్స్' : 'Multi-Channel Alert Gateway'}
              </h3>
              <p className="text-xs text-slate-500">
                {isTe ? 'WhatsApp, SMS మరియు టీవీ స్క్రీన్ ప్రత్యక్ష హెచ్చరికలు' : 'Configure simulated delivery via WhatsApp, SMS, and in-clinic announcements'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            
            {/* WhatsApp */}
            <div className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Smartphone className="h-4 w-4 text-emerald-600" />
                <div>
                  <span className="font-bold text-slate-800 block">WhatsApp Queue Alerts</span>
                  <span className="text-[11px] text-slate-400">లైవ్ టోకెన్ స్థితి అప్‌డేట్‌లు</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={whatsappAlerts}
                onChange={(e) => setWhatsappAlerts(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
            </div>

            {/* SMS */}
            <div className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-blue-600" />
                <div>
                  <span className="font-bold text-slate-800 block">SMS Notifications</span>
                  <span className="text-[11px] text-slate-400">ప్రిస్క్రిప్షన్ & రసీదు సందేశాలు</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
            </div>

            {/* Emergency GPS Access */}
            <div className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between sm:col-span-2">
              <div className="flex items-center gap-2.5">
                <Shield className="h-4 w-4 text-rose-600" />
                <div>
                  <span className="font-bold text-slate-800 block">Emergency 108 Device Location Tracking</span>
                  <span className="text-[11px] text-slate-400">అత్యవసర సమయంలో సమీప డాక్టర్ మరియు ఆసుపత్రిని కనుగొనడానికి GPS అనుమతి</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={emergencyGeoAccess}
                onChange={(e) => setEmergencyGeoAccess(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
            </div>

          </div>
        </div>

        {/* 5. Firebase Realtime Database Card (Admin Only) */}
        {isAdmin && (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      {isTe ? 'ఫైర్‌బేస్ రియల్-టైమ్ డేటాబేస్ (Realtime Database)' : 'Firebase Realtime Database (RTDB)'}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      {isTe ? 'అడ్మిన్ మాత్రమే' : 'Admin Only'}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      firebaseConnected
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : fbDatabaseUrl 
                        ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {firebaseConnected ? (
                        <>
                          <Wifi className="w-3 h-3 text-emerald-500 animate-pulse" />
                          <span>{isTe ? 'కనెక్ట్ అయింది (Live)' : 'Connected (Live RTDB)'}</span>
                        </>
                      ) : fbDatabaseUrl ? (
                        <>
                          <RefreshCw className="w-3 h-3 text-amber-500 animate-spin" />
                          <span>{isTe ? 'కనెక్ట్ అవుతోంది...' : 'Connecting...'}</span>
                        </>
                      ) : (
                        <>
                          <WifiOff className="w-3 h-3 text-slate-400" />
                          <span>{isTe ? 'లోకల్ స్టాండ్‌బై' : 'Local Standby'}</span>
                        </>
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {isTe 
                      ? 'ఓపీడీ క్యూ టోకెన్లు, అపాయింట్‌మెంట్‌లు మరియు డాక్టర్ డ్యాష్‌బోర్డ్ రియల్-టైమ్ సింక్రొనైజేషన్.' 
                      : 'Real-time two-way synchronization for OPD tokens, live queue TV, appointments, and emergency SOS alerts.'}
                  </p>
                </div>
              </div>

              <a
                href="https://console.firebase.google.com/"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 self-start sm:self-auto"
              >
                <span>Firebase Console</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <form onSubmit={handleSaveFirebase} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Database URL */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 block">
                    {isTe ? 'ఫైర్‌బేస్ రియల్-టైమ్ డేటాబేస్ URL (Firebase Database URL)' : 'Realtime Database URL'}
                  </label>
                  <div className="relative">
                    <Database className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="url"
                      value={fbDatabaseUrl}
                      onChange={(e) => setFbDatabaseUrl(e.target.value)}
                      required
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-mono font-medium"
                      placeholder="https://your-project-id-default-rtdb.firebaseio.com"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {isTe 
                      ? 'ఉదాహరణ: https://carebridge-ai-default-rtdb.firebaseio.com (లేదా మీ Firebase Console లోని RTDB URL)' 
                      : 'Example: https://carebridge-ai-default-rtdb.firebaseio.com (from your Firebase Console > Realtime Database)'}
                  </p>
                </div>

                {/* Project ID */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    {isTe ? 'ప్రాజెక్ట్ ID (Project ID)' : 'Firebase Project ID'}
                  </label>
                  <input
                    type="text"
                    value={fbProjectId}
                    onChange={(e) => setFbProjectId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
                    placeholder="e.g. carebridge-ai"
                  />
                </div>

                {/* Web API Key */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    {isTe ? 'వెబ్ API కీ (Web API Key)' : 'Web API Key (Optional for Open Rules)'}
                  </label>
                  <input
                    type="text"
                    value={fbApiKey}
                    onChange={(e) => setFbApiKey(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium font-mono"
                    placeholder="AIzaSy..."
                  />
                </div>

              </div>

              {/* Status Feedback */}
              {fbStatusMessage && (
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{fbStatusMessage}</span>
                </div>
              )}

              {/* Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isTe ? 'డేటాబేస్ సేవ్ & కనెక్ట్ చేయండి' : 'Save & Connect RTDB'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSeedFirebase}
                    disabled={!fbDatabaseUrl || isSeedingFb}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                    title="Initialize baseline OPD queue tokens and appointments to Firebase"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSeedingFb ? 'animate-spin text-amber-600' : 'text-slate-600'}`} />
                    <span>{isSeedingFb ? (isTe ? 'సింక్ అవుతోంది...' : 'Syncing...') : (isTe ? 'బేస్‌లైన్ డేటా సింక్' : 'Seed / Sync Baseline Data')}</span>
                  </button>
                </div>

                {fbDatabaseUrl && (
                  <button
                    type="button"
                    onClick={handleClearFirebase}
                    className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isTe ? 'డిస్‌కనెక్ట్' : 'Disconnect'}</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* 6. Environment & Demo Management */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="h-9 w-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isTe ? 'డెమో పర్యావరణ నిర్వహణ' : 'Simulation & Hospital Digital Twin'}
              </h3>
              <p className="text-xs text-slate-500">
                {isTe ? 'ఆసుపత్రి నెట్‌వర్క్ నోడ్‌లు మరియు టెస్టింగ్ రీసెట్' : 'Reset demo queues, doctor availability, and mock database states'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-slate-800">
                {isTe ? 'డెమో డేటాబేస్ పునఃప్రారంభం (Reset Demo Data)' : 'Reset Hospital Twin Demo Environment'}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isTe 
                  ? 'అపాయింట్‌మెంట్‌లు, ఓపీడీ క్యూలు మరియు డాక్టర్ షెడ్యూల్‌లను ప్రారంభ స్థితికి రీసెట్ చేస్తుంది.' 
                  : 'Restores baseline OPD queue tokens, appointments, and hospital resource levels.'}
              </p>
            </div>

            <button
              onClick={onResetDemo}
              disabled={isResetting}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs flex items-center gap-2 transition cursor-pointer disabled:opacity-50 flex-shrink-0"
            >
              <RotateCcw className={`h-4 w-4 text-slate-600 ${isResetting ? 'animate-spin' : ''}`} />
              <span>{isResetting ? (isTe ? 'రీసెట్ అవుతోంది...' : 'Resetting...') : (isTe ? 'డెమో రీసెట్ చేయండి' : 'Reset Demo Environment')}</span>
            </button>
          </div>

          {/* Quick Navigation Links */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={() => onNavigateTab('privacy_consent')}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer flex items-center gap-1.5"
            >
              <Lock className="h-3.5 w-3.5 text-slate-500" />
              <span>{isTe ? 'గోప్యతా సమ్మతి (Privacy Consent)' : 'Privacy & Consent'}</span>
            </button>

            <button
              onClick={() => onNavigateTab('audit')}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer flex items-center gap-1.5"
            >
              <Award className="h-3.5 w-3.5 text-slate-500" />
              <span>{isTe ? 'క్లినికల్ ఆడిట్ లాగ్స్' : 'Clinical Audit Trail'}</span>
            </button>

            <button
              onClick={() => onNavigateTab('smartflow')}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-slate-500" />
              <span>{isTe ? 'స్మార్ట్‌ఫ్లో నెట్‌వర్క్ ట్విన్' : 'SmartFlow Network Twin'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
