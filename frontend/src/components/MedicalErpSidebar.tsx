import React from 'react';
import { 
  LayoutDashboard, Users, Calendar, Pill, FlaskConical, 
  ClipboardList, CreditCard, FileText, Brain, MessageSquare, 
  CheckSquare, BarChart3, Building2, Settings, Smartphone,
  Stethoscope, Download
} from 'lucide-react';
import type { UserProfile } from '../types';
import { getTranslation } from '../utils/translations';

interface MedicalErpSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  currentProfile: UserProfile;
  unreadCount?: number;
  language?: string;
}

export const MedicalErpSidebar: React.FC<MedicalErpSidebarProps> = ({
  activeTab,
  onTabChange,
  currentProfile,
  unreadCount = 3,
  language = 'en'
}) => {
  const t = getTranslation(language);
  const role = currentProfile.role;

  const roleMenuLabels: Record<string, string> = {
    patient: t.menu_patient,
    doctor: t.menu_doctor,
    receptionist: t.menu_receptionist,
    admin: t.menu_admin
  };

  const roleSubtitles: Record<string, string> = {
    patient: t.subtitle_patient,
    doctor: t.subtitle_doctor,
    receptionist: t.subtitle_receptionist,
    admin: t.subtitle_admin
  };

  const getFilteredNavItems = () => {
    switch (role) {
      case 'patient':
        return [
          { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
          { id: 'chat', label: t.book_appointment, icon: Calendar, badge: 'AI Agent' },
          { id: 'prescriptions', label: t.my_prescriptions, icon: Pill },
          { id: 'scanner', label: t.my_lab_reports, icon: FlaskConical },
          { id: 'my_passes', label: t.billing_passes, icon: CreditCard },
          { id: 'token_tracker', label: t.live_token_queue, icon: Building2 },
          { id: 'messages', label: t.messages, icon: MessageSquare, badgeCount: unreadCount },
          { id: 'settings', label: t.settings, icon: Settings }
        ];
      case 'receptionist':
        return [
          { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
          { id: 'patient_hub', label: t.patient_checkin, icon: Users },
          { id: 'chat', label: t.appointments, icon: Calendar, badge: 'AI Agent' },
          { id: 'my_passes', label: t.billing_passes, icon: CreditCard },
          { id: 'token_tracker', label: t.token_queue_tv, icon: Building2 },
          { id: 'staff', label: t.doctor_rosters, icon: CheckSquare },
          { id: 'messages', label: t.messages, icon: MessageSquare, badgeCount: unreadCount },
          { id: 'settings', label: t.settings, icon: Settings }
        ];
      case 'doctor':
        return [
          { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
          { id: 'patient_hub', label: t.patients, icon: Users },
          { id: 'chat', label: t.appointments, icon: Calendar, badge: 'AI Agent' },
          { id: 'prescriptions', label: t.prescriptions, icon: Pill },
          { id: 'scanner', label: t.lab_reports, icon: FlaskConical },
          { id: 'smartflow', label: t.treatment_plans, icon: ClipboardList },
          { id: 'medical_records', label: t.medical_records, icon: FileText },
          { id: 'safety_center', label: t.ai_diagnosis, icon: Brain },
          { id: 'staff', label: t.tasks, icon: CheckSquare },
          { id: 'analytics', label: t.analytics, icon: BarChart3 },
          { id: 'token_tracker', label: t.token_queue_rooms, icon: Building2 },
          { id: 'messages', label: t.messages, icon: MessageSquare, badgeCount: unreadCount },
          { id: 'settings', label: t.settings, icon: Settings }
        ];
      case 'admin':
      default:
        return [
          { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
          { id: 'patient_hub', label: t.patients, icon: Users },
          { id: 'chat', label: t.appointments, icon: Calendar, badge: 'AI Agent' },
          { id: 'prescriptions', label: t.prescriptions, icon: Pill },
          { id: 'scanner', label: t.lab_reports, icon: FlaskConical },
          { id: 'smartflow', label: t.treatment_plans, icon: ClipboardList },
          { id: 'my_passes', label: t.billing_invoices, icon: CreditCard },
          { id: 'medical_records', label: t.medical_records, icon: FileText },
          { id: 'safety_center', label: t.ai_diagnosis, icon: Brain },
          { id: 'messages', label: t.messages, icon: MessageSquare, badgeCount: unreadCount },
          { id: 'staff', label: t.tasks, icon: CheckSquare },
          { id: 'analytics', label: t.analytics, icon: BarChart3 },
          { id: 'token_tracker', label: t.token_queue_rooms, icon: Building2 },
          { id: 'settings', label: t.settings, icon: Settings }
        ];
    }
  };

  const navItems = getFilteredNavItems();

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between h-screen sticky top-0 z-30 select-none shadow-[2px_0_12px_-4px_rgba(0,0,0,0.04)]">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
          <Stethoscope className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight">CareBridge AI</h1>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System Live" />
          </div>
          <p className="text-[11px] font-medium text-slate-400">{roleSubtitles[role] || 'Hospital Coordination ERP'}</p>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-200">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
          {roleMenuLabels[role] || 'Clinical & Admin Menu'}
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = 
            activeTab === item.id || 
            (item.id === 'prescriptions' && (role === 'doctor' ? activeTab === 'doctor_dashboard' : activeTab === 'prescriptions')) ||
            (item.id === 'medical_records' && activeTab === 'patient_hub') ||
            (item.id === 'analytics' && activeTab === 'smartflow');

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'prescriptions') {
                  if (role === 'patient') {
                    onTabChange('prescriptions');
                  } else {
                    onTabChange('doctor_dashboard');
                  }
                }
                else if (item.id === 'medical_records') onTabChange('patient_hub');
                else if (item.id === 'analytics') onTabChange('smartflow');
                else if (item.id === 'safety_center') onTabChange('chat');
                else if (item.id === 'messages') onTabChange('messages');
                else if (item.id === 'settings') onTabChange('patient_hub');
                else onTabChange(item.id);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span className="tracking-wide">{item.label}</span>
              </div>

              {item.badge && !isActive && (
                <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-blue-50 text-blue-600 border border-blue-200">
                  {item.badge}
                </span>
              )}

              {item.badgeCount !== undefined && item.badgeCount > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'
                }`}>
                  {item.badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Promo Card: CareBridge AI Mobile */}
      <div className="p-3 border-t border-slate-100">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-50/80 to-indigo-50/60 border border-blue-100 relative overflow-hidden text-xs">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-blue-700 font-bold text-xs">
                <Smartphone className="w-3.5 h-3.5" />
                <span>{t.carebridge_mobile}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                {t.carebridge_mobile_desc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-blue-100/80">
            <button 
              type="button" 
              onClick={() => alert("CareBridge AI Mobile: Available on iOS & Android via Progressive Web App (PWA).")}
              className="flex-1 py-1.5 px-2 bg-slate-900 hover:bg-black text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 transition cursor-pointer shadow-sm"
            >
              <Download className="w-3 h-3" />
              <span>{t.app_store}</span>
            </button>
            <button 
              type="button" 
              onClick={() => alert("CareBridge AI Mobile: Available on Google Play Store.")}
              className="flex-1 py-1.5 px-2 bg-slate-900 hover:bg-black text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 transition cursor-pointer shadow-sm"
            >
              <Download className="w-3 h-3" />
              <span>{t.google_play}</span>
            </button>
          </div>
        </div>

        <div className="mt-2.5 px-1 text-[10px] text-slate-400 flex items-center justify-between">
          <span>© 2026 CareBridge AI</span>
          <span className="font-mono text-[9px] text-slate-400">{t.app_version}</span>
        </div>
      </div>
    </aside>
  );
};
