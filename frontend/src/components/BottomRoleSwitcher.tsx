import React from 'react';
import { User, Stethoscope, Briefcase, Shield, LogOut, Sparkles } from 'lucide-react';
import type { UserProfile, UserRole } from '../types';
import { getTranslation } from '../utils/translations';

interface BottomRoleSwitcherProps {
  currentProfile: UserProfile;
  onSwitchRole: (role: UserRole | string | number) => void;
  onSignOut: () => void;
  language?: string;
}

export const BottomRoleSwitcher: React.FC<BottomRoleSwitcherProps> = ({
  currentProfile,
  onSwitchRole,
  onSignOut,
  language = 'en'
}) => {
  const t = getTranslation(language);

  const isNewPatient =
    currentProfile.role === 'patient' && (
      currentProfile.is_new === true ||
      currentProfile.badge === 'New Patient Portal' ||
      currentProfile.id === 9 ||
      Boolean(currentProfile.name?.toLowerCase().includes('mythri'))
    );
  const isPatientTelugu =
    currentProfile.role === 'patient' && currentProfile.languagePref === 'Telugu' && !isNewPatient;
  const isPatientEN =
    currentProfile.role === 'patient' && currentProfile.languagePref !== 'Telugu' && !isNewPatient;
  const isDoctor = currentProfile.role === 'doctor';
  const isAdmin = currentProfile.role === 'admin';
  const isReceptionist = currentProfile.role === 'receptionist';

  return (
    <aside aria-label="Demo role switcher" className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/90 shadow-2xl py-2 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        {/* Left Label */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold text-[11px]">
            <Sparkles className="h-3 w-3" />
            <span>{t.demo_switcher_label}</span>
          </div>
          <span className="hidden sm:inline text-slate-500">•</span>
          <span className="hidden sm:inline text-[11px] text-slate-400">
            {t.demo_switcher_instruction}
          </span>
        </div>

        {/* Buttons List */}
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          {/* Patient EN */}
          <button
            onClick={() => onSwitchRole('patient')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              isPatientEN
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 font-bold ring-2 ring-emerald-400/50'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
            title="Switch to English Patient Persona (Bhavishya)"
          >
            <User className="h-3.5 w-3.5" />
            <span>{t.role_btn_patient_en}</span>
          </button>

          {/* Patient Mythri / New Patient Portal */}
          <button
            onClick={() => onSwitchRole(currentProfile.id && currentProfile.id !== 9 && isNewPatient ? currentProfile.id : 'patient_mythri')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              isNewPatient
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 font-bold ring-2 ring-rose-400/50'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
            title="Switch to New Patient Portal"
          >
            <User className="h-3.5 w-3.5" />
            <span>{isNewPatient && currentProfile.id !== 9 ? `${currentProfile.name.split(' ')[0]} (New Portal)` : t.role_btn_patient_mythri}</span>
          </button>

          {/* Patient Telugu */}
          <button
            onClick={() => onSwitchRole('patient_telugu')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              isPatientTelugu
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/30 font-bold ring-2 ring-teal-400/50'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
            title="Switch to Telugu Patient Persona (Sunitha Reddy)"
          >
            <User className="h-3.5 w-3.5" />
            <span>{t.role_btn_patient_te}</span>
          </button>

          {/* Doctor */}
          <button
            onClick={() => onSwitchRole('doctor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              isDoctor
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 font-bold ring-2 ring-cyan-400/50'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
            title="Switch to Hospital Doctor Persona (Dr. Naveen Kumar)"
          >
            <Stethoscope className="h-3.5 w-3.5" />
            <span>{t.role_btn_doctor}</span>
          </button>

          {/* Receptionist */}
          <button
            onClick={() => onSwitchRole('receptionist')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              isReceptionist
                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30 font-bold ring-2 ring-indigo-400/50'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
            title="Switch to Receptionist Persona (Priya Sharma)"
          >
            <Briefcase className="h-3.5 w-3.5" />
            <span>{t.role_btn_receptionist}</span>
          </button>

          {/* Admin */}
          <button
            onClick={() => onSwitchRole('admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              isAdmin
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 font-bold ring-2 ring-amber-400/50'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
            title="Switch to Administrator Persona (Dr. Varma)"
          >
            <Shield className="h-3.5 w-3.5" />
            <span>{t.role_btn_admin}</span>
          </button>

          {/* Sign Out / Auth Gateway */}
          <button
            onClick={onSignOut}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-700/50 transition cursor-pointer ml-1"
            title="Sign Out and return to Register / Sign In Gateway"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>{t.role_btn_signout}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
