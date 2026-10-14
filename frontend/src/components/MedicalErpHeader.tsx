import React, { useState } from 'react';
import { 
  Search, Bell, Plus, ChevronDown, LogOut,
  Sparkles, CheckCircle2, RotateCcw,
  Award, ShieldAlert
} from 'lucide-react';
import type { UserProfile } from '../types';
import { getTranslation } from '../utils/translations';

interface MedicalErpHeaderProps {
  currentProfile: UserProfile;
  profiles: UserProfile[];
  onSelectProfile: (roleOrId: string | number) => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
  onRunJudgeScenario?: (scenarioId: number, prompt: string, role: any, lang: string) => void;
  onSignOut?: () => void;
  onOpenEmergencySOS?: () => void;
  onQuickBook?: () => void;
  onResetDemo?: () => void;
  isResetting?: boolean;
  onStartJudgeDemo?: () => void;
}

export const MedicalErpHeader: React.FC<MedicalErpHeaderProps> = ({
  currentProfile,
  profiles = [],
  onSelectProfile,
  language,
  onLanguageChange,
  unreadNotificationsCount = 0,
  onOpenNotifications,
  onRunJudgeScenario,
  onSignOut,
  onOpenEmergencySOS,
  onQuickBook,
  onResetDemo,
  isResetting = false,
  onStartJudgeDemo
}) => {
  const t = getTranslation(language);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [judgeMenuOpen, setJudgeMenuOpen] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between sticky top-0 z-20 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.03)]">
      {/* Left Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.search_placeholder}
            className="w-full pl-10 pr-16 py-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-blue-500 text-xs text-slate-800 placeholder-slate-400 transition-all outline-none"
          />
          <div className="absolute right-3 flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-xs">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Flagship 1-Click Judge Demo Pill */}
        {onRunJudgeScenario && (
          <div className="relative">
            <button
              onClick={() => setJudgeMenuOpen(!judgeMenuOpen)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-300 text-amber-800 hover:bg-amber-100/60 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>Judge Live Demo</span>
              <ChevronDown className="w-3 h-3 text-amber-600" />
            </button>

            {judgeMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50 animate-fade-in text-xs">
                <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                  1-Click Competition Pitch Scenarios
                </div>
                <button
                  onClick={() => {
                    setJudgeMenuOpen(false);
                    if (onStartJudgeDemo) {
                      onStartJudgeDemo();
                    } else if (onRunJudgeScenario) {
                      onRunJudgeScenario(
                        1,
                        "Naaku Guntur lo cardiologist appointment kavali. Telugu speaking doctor, minimum waiting time.",
                        "patient",
                        "te"
                      );
                    }
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-blue-50 text-slate-800 flex items-start gap-2 transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-blue-900">Scenario 1: Guntur Cardiologist</div>
                    <div className="text-[10px] text-slate-500">Telugu Speaking • Lowest Wait • Token C-24</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setJudgeMenuOpen(false);
                    onRunJudgeScenario(
                      2,
                      "Show all appointments for tomorrow and identify possible schedule conflicts",
                      "receptionist",
                      "en"
                    );
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-indigo-50 text-slate-800 flex items-start gap-2 transition cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-indigo-900">Scenario 2: Staff Conflict Audit</div>
                    <div className="text-[10px] text-slate-500">Double booking detection & 1-click resolve</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setJudgeMenuOpen(false);
                    onRunJudgeScenario(
                      4,
                      "Show me another patient's medical records",
                      "patient",
                      "en"
                    );
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-rose-50 text-slate-800 flex items-start gap-2 transition cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-rose-900">Scenario 4: Security Guardrail</div>
                    <div className="text-[10px] text-slate-500">Zero-tolerance DPDP/HIPAA RBAC block</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setJudgeMenuOpen(false);
                    onRunJudgeScenario(
                      5,
                      "Naaku general medicine doctor appointment kavali, waiting time takkuva unna doctor ni book cheyyi",
                      "patient_mythri" as any,
                      "te"
                    );
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-pink-50 text-slate-800 flex items-start gap-2 transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-pink-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-pink-900">Scenario 5: New Patient Portal (Mythri)</div>
                    <div className="text-[10px] text-slate-500">కొత్త పేషెంట్ పోర్టల్ • Clean State & AI Booking</div>
                  </div>
                </button>

                {onResetDemo && (
                  <div className="pt-1.5 mt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setJudgeMenuOpen(false);
                        onResetDemo();
                      }}
                      disabled={isResetting}
                      className="w-full px-2 py-1.5 rounded-lg hover:bg-slate-100 text-slate-600 flex items-center gap-2 transition cursor-pointer text-xs"
                    >
                      <RotateCcw className={`w-3.5 h-3.5 text-slate-500 ${isResetting ? 'animate-spin text-blue-600' : ''}`} />
                      <span>{isResetting ? 'Resetting Demo...' : 'Reset Demo Environment'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Standalone Reset Demo Button - Hidden for patients */}
        {onResetDemo && currentProfile.role !== 'patient' && (
          <button
            onClick={onResetDemo}
            disabled={isResetting}
            title="Reset all appointments, schedules & test data"
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 transition cursor-pointer"
          >
            <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        )}

        {/* 108 Emergency SOS Pill */}
        {onOpenEmergencySOS && (
          <button
            onClick={onOpenEmergencySOS}
            className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs flex items-center gap-1 transition cursor-pointer shadow-xs"
            title={t.emergency_sos}
          >
            <span>{t.emergency_sos}</span>
          </button>
        )}

        {/* Language Selector */}
        <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-0.5 text-xs">
          <button
            onClick={() => onLanguageChange('en')}
            className={`px-2 py-1 rounded-lg font-semibold transition cursor-pointer ${
              language === 'en' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => onLanguageChange('te')}
            className={`px-2 py-1 rounded-lg font-semibold transition cursor-pointer ${
              language === 'te' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            తెలుగు
          </button>
        </div>

        {/* Quick Add Button (+) */}
        <button
          onClick={onQuickBook}
          className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition shadow-md shadow-blue-600/25 cursor-pointer"
          title={t.quick_book_tooltip}
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 transition cursor-pointer"
          title={t.notifications_tooltip}
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white">
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {currentProfile.avatar || currentProfile.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[130px]">
                {currentProfile.name}
              </div>
              <div className="text-[10px] text-slate-400 capitalize font-medium leading-tight">
                {currentProfile.role === 'patient'
                  ? t.patient_role_label
                  : currentProfile.role === 'receptionist'
                  ? t.receptionist_role_label
                  : currentProfile.role === 'admin'
                  ? t.admin_role_label
                  : t.doctor_role_label}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50 animate-fade-in text-xs">
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="font-bold text-slate-900">{currentProfile.name}</div>
                <div className="text-[11px] text-slate-500 capitalize">{currentProfile.description || currentProfile.role}</div>
                <div className="text-[10px] font-mono text-blue-600 mt-0.5">{currentProfile.patient_uid}</div>
              </div>

              <div className="py-1">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {t.switch_active_role}
                </div>
                {profiles.map((p) => {
                  const isActive = currentProfile.id === p.id || currentProfile.name.toLowerCase() === p.name.toLowerCase();
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        onSelectProfile(p.id);
                        setProfileDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition cursor-pointer ${
                        isActive ? 'bg-blue-50 text-blue-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="text-xs">{p.name}</div>
                        <div className="text-[10px] text-slate-400 capitalize">{p.role}</div>
                      </div>
                      {isActive && (
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                      )}
                    </button>
                  );
                })}
              </div>

              {onSignOut && (
                <div className="pt-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onSignOut();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-semibold transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t.sign_out}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
