import React, { useState } from 'react';
import { 
  ShieldCheck, ShieldAlert, Eye, 
  ToggleLeft, ToggleRight, Key
} from 'lucide-react';
import type { UserProfile } from '../types';

interface PrivacyConsentDashboardProps {
  currentProfile: UserProfile;
  seniorMode?: boolean;
}

interface AuditAccessItem {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  purpose: string;
  status: 'APPROVED' | 'BLOCKED';
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
}

export const PrivacyConsentDashboard: React.FC<PrivacyConsentDashboardProps> = ({
  currentProfile,
  seniorMode = false
}) => {
  const [consentToggles, setConsentToggles] = useState<Record<string, boolean>>({
    slot_query: true,
    resource_balancing: true,
    doctor_history_sharing: true,
    token_notifications: true,
    caretaker_access: false,
    anonymized_research: false
  });

  const [simulatedSecurityAlert, setSimulatedSecurityAlert] = useState<string | null>(null);

  const [accessLedger, setAccessLedger] = useState<AuditAccessItem[]>([
    {
      id: 'acc-1',
      timestamp: 'Today at 10:00 AM',
      actor: 'Dr. Priya',
      role: 'Consulting Physician',
      action: 'VIEW_PATIENT_CHIEF_COMPLAINT',
      purpose: 'Pre-consultation clinical review for stomach pain',
      status: 'APPROVED',
      risk: 'LOW'
    },
    {
      id: 'acc-2',
      timestamp: 'Today at 09:45 AM',
      actor: 'CareBridge Queue Engine',
      role: 'Autonomous System',
      action: 'DISPATCH_PROXIMITY_TOKEN_ALERT',
      purpose: 'SMS & UI notification for Token GM-024 (2 tokens ahead)',
      status: 'APPROVED',
      risk: 'LOW'
    },
    {
      id: 'acc-3',
      timestamp: 'Today at 09:30 AM',
      actor: 'Bhavishya',
      role: 'Patient (Self)',
      action: 'AUTHENTICATE_PATIENT_SESSION',
      purpose: 'Patient sign-in & appointment view',
      status: 'APPROVED',
      risk: 'LOW'
    },
    {
      id: 'acc-4',
      timestamp: 'Yesterday at 04:15 PM',
      actor: 'CareBridge SmartFlow Agent',
      role: 'AI Supervisor',
      action: 'CROSS_HOSPITAL_SLOT_AUDIT',
      purpose: 'Checked Hospital A & Hospital B wait efficiency for routing',
      status: 'APPROVED',
      risk: 'LOW'
    }
  ]);

  const toggleConsent = (key: string) => {
    setConsentToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSimulateUnauthorizedAccess = () => {
    const alertMsg = "🚨 PROTOTYPE ACCESS-CONTROL BLOCK: Actor 'Reception Desk (Staff ID #2001)' attempted unauthorized read of Bhavishya's sensitive medical records. Access denied under prototype RBAC guardrail.";
    setSimulatedSecurityAlert(alertMsg);

    const blockedEntry: AuditAccessItem = {
      id: `acc-${Date.now()}`,
      timestamp: 'Just now',
      actor: 'Reception Desk (Staff #2001)',
      role: 'Receptionist',
      action: 'UNAUTHORIZED_EHR_RECORD_READ',
      purpose: 'Attempted inspection of confidential clinical SOAP notes',
      status: 'BLOCKED',
      risk: 'HIGH'
    };

    setAccessLedger(prev => [blockedEntry, ...prev]);
  };

  return (
    <div className={`space-y-6 max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 text-slate-100 pb-20 ${
      seniorMode ? 'text-base' : 'text-sm'
    }`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Privacy & Consent Architecture • Inspired by DPDP Principles</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Patient ID: {currentProfile.patient_uid || "PAT-1000"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Privacy, Consent & Data Access Audit
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            Privacy-aware prototype inspired by data protection principles, with RBAC, consent checks, and audit logs.
            See who accessed your records in the prototype audit ledger and test role-based access protection.
          </p>
        </div>

        <button
          onClick={handleSimulateUnauthorizedAccess}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/25 transition cursor-pointer flex items-center gap-2 flex-shrink-0"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Test Unauthorized Access Block</span>
        </button>
      </div>

      {/* Red Alert Banner on Simulated Attack */}
      {simulatedSecurityAlert && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border-2 border-rose-500 text-rose-200 text-xs sm:text-sm flex items-start justify-between gap-3 shadow-2xl animate-fade-in">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5 animate-pulse" />
            <div>
              <strong className="font-bold text-white text-sm block">Security Incident Prevented:</strong>
              <p className="text-rose-200 mt-0.5">{simulatedSecurityAlert}</p>
              <span className="text-[11px] text-rose-400 font-mono block mt-1">
                Audit Hash: SHA256-GUARDRAIL-BLOCKED-RBAC-001 • Immutable Entry Recorded
              </span>
            </div>
          </div>
          <button
            onClick={() => setSimulatedSecurityAlert(null)}
            className="text-rose-400 hover:text-white text-xs font-bold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Section 1: Granular Consent Controls */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Patient Consent Preferences (సమ్మతి అనుమతులు)
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Real-time Policy Enforcement</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Toggle 1 */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-3">
            <div>
              <strong className="text-white block">Cross-Hospital Slot Optimization</strong>
              <span className="text-[11px] text-slate-400">Allow CareBridge AI to check queue lengths at Hospital A, B, and C.</span>
            </div>
            <button
              type="button"
              onClick={() => toggleConsent('slot_query')}
              className="text-cyan-400 cursor-pointer"
            >
              {consentToggles.slot_query ? <ToggleRight className="w-7 h-7 text-emerald-400" /> : <ToggleLeft className="w-7 h-7 text-slate-600" />}
            </button>
          </div>

          {/* Toggle 2 */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-3">
            <div>
              <strong className="text-white block">Dynamic Load Balancing Routing</strong>
              <span className="text-[11px] text-slate-400">Allow automatic routing recommendations to less crowded facilities.</span>
            </div>
            <button
              type="button"
              onClick={() => toggleConsent('resource_balancing')}
              className="text-cyan-400 cursor-pointer"
            >
              {consentToggles.resource_balancing ? <ToggleRight className="w-7 h-7 text-emerald-400" /> : <ToggleLeft className="w-7 h-7 text-slate-600" />}
            </button>
          </div>

          {/* Toggle 3 */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-3">
            <div>
              <strong className="text-white block">Share Symptoms with Consulting Doctor</strong>
              <span className="text-[11px] text-slate-400">Allow Dr. Priya / assigned physician to read your symptoms before consultation.</span>
            </div>
            <button
              type="button"
              onClick={() => toggleConsent('doctor_history_sharing')}
              className="text-cyan-400 cursor-pointer"
            >
              {consentToggles.doctor_history_sharing ? <ToggleRight className="w-7 h-7 text-emerald-400" /> : <ToggleLeft className="w-7 h-7 text-slate-600" />}
            </button>
          </div>

          {/* Toggle 4 */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-3">
            <div>
              <strong className="text-white block">Live Token Alerts (WhatsApp & SMS)</strong>
              <span className="text-[11px] text-slate-400">Receive automated notifications when 2 tokens remain before your turn.</span>
            </div>
            <button
              type="button"
              onClick={() => toggleConsent('token_notifications')}
              className="text-cyan-400 cursor-pointer"
            >
              {consentToggles.token_notifications ? <ToggleRight className="w-7 h-7 text-emerald-400" /> : <ToggleLeft className="w-7 h-7 text-slate-600" />}
            </button>
          </div>

          {/* Toggle 5 */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-3">
            <div>
              <strong className="text-white block">Family Caretaker Delegated Access</strong>
              <span className="text-[11px] text-slate-400">Allow registered family member to check token and view appointment passes.</span>
            </div>
            <button
              type="button"
              onClick={() => toggleConsent('caretaker_access')}
              className="text-cyan-400 cursor-pointer"
            >
              {consentToggles.caretaker_access ? <ToggleRight className="w-7 h-7 text-emerald-400" /> : <ToggleLeft className="w-7 h-7 text-slate-600" />}
            </button>
          </div>

          {/* Toggle 6 */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-3">
            <div>
              <strong className="text-white block">Anonymized Clinical Quality Analytics</strong>
              <span className="text-[11px] text-slate-400">Share stripped, de-identified wait time metrics to improve public hospital flow.</span>
            </div>
            <button
              type="button"
              onClick={() => toggleConsent('anonymized_research')}
              className="text-cyan-400 cursor-pointer"
            >
              {consentToggles.anonymized_research ? <ToggleRight className="w-7 h-7 text-emerald-400" /> : <ToggleLeft className="w-7 h-7 text-slate-600" />}
            </button>
          </div>
        </div>
      </div>

      {/* Section 2: Transparent Access Ledger */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              "Who Accessed My Data?" Access Audit Ledger
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {accessLedger.length} Verified Ledger Records
          </span>
        </div>

        <div className="space-y-2.5">
          {accessLedger.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-xl border text-xs transition ${
                item.status === 'BLOCKED'
                  ? 'bg-rose-950/40 border-rose-500/70 shadow-lg shadow-rose-950/30'
                  : 'bg-slate-950/80 border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    item.status === 'BLOCKED'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {item.status}
                  </span>

                  <strong className="text-white">{item.actor}</strong>
                  <span className="text-slate-500">•</span>
                  <span className="text-cyan-300 font-mono text-[11px]">{item.role}</span>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                  <span>{item.timestamp}</span>
                </div>
              </div>

              <div className="mt-1.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-slate-300">
                <div>
                  <span className="font-mono text-cyan-400 text-[11px]">{item.action}</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">{item.purpose}</p>
                </div>

                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                  item.risk === 'HIGH'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {item.risk} Risk
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
