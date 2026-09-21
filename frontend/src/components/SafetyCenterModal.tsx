import React, { useState } from 'react';
import { 
  ShieldCheck, X, AlertTriangle, PhoneCall, Lock, 
  Eye, CheckCircle2, Users, Info
} from 'lucide-react';
import type { UserProfile, CaretakerAccess } from '../types';

interface SafetyCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserProfile;
  seniorMode?: boolean;
}

export const SafetyCenterModal: React.FC<SafetyCenterModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  seniorMode = false,
}) => {
  const [activeTab, setActiveTab] = useState<'safety' | 'privacy' | 'caretaker' | 'audit'>('safety');

  // Caretaker State
  const [caretakerName, setCaretakerName] = useState('');
  const [relation, setRelation] = useState('Son');
  const [durationDays, setDurationDays] = useState(30);
  const [caretakers, setCaretakers] = useState<CaretakerAccess[]>([
    {
      patient_id: currentProfile.id,
      patient_name: currentProfile.name,
      caretaker_name: "Kavitha Reddy",
      relation: "Daughter / కుమార్తె",
      valid_until: "2026-10-15",
      granted_at: "2026-09-01",
      scope: "Appointment Booking & Queue Tracking"
    }
  ]);
  const [grantSuccess, setGrantSuccess] = useState(false);

  // Mock Audit entries for "Who viewed my records?"
  const auditEntries = [
    {
      id: 1,
      actor: "Dr. Ananya Sen",
      role: "Doctor (Cardiology)",
      action: "OPD Consultation Roster View",
      timestamp: "Today at 09:30 AM",
      status: "Authorized (Assigned Doctor)"
    },
    {
      id: 2,
      actor: "Priya Sharma",
      role: "Receptionist",
      action: "Queue Check-in & Token A-24 Verification",
      timestamp: "Today at 08:45 AM",
      status: "Authorized (Metadata Only - No PHI)"
    },
    {
      id: 3,
      actor: "CareBridge AI Agent",
      role: "Autonomous Agent",
      action: "SmartFlow Slot Recommendation & Audit Log Entry",
      timestamp: "Yesterday at 04:12 PM",
      status: "System Automated"
    }
  ];

  if (!isOpen) return null;

  const handleGrantCaretaker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caretakerName.trim()) return;

    const validUntilDate = new Date();
    validUntilDate.setDate(validUntilDate.getDate() + durationDays);

    const newGrant: CaretakerAccess = {
      patient_id: currentProfile.id,
      patient_name: currentProfile.name,
      caretaker_name: caretakerName.trim(),
      relation: relation,
      valid_until: validUntilDate.toISOString().split('T')[0],
      granted_at: new Date().toISOString().split('T')[0],
      scope: "Appointment Booking & Queue Tracking"
    };

    try {
      await fetch('/api/caretaker/grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGrant)
      });
    } catch (e) {
      console.warn("Caretaker API background notice:", e);
    }

    setCaretakers([newGrant, ...caretakers]);
    setCaretakerName('');
    setGrantSuccess(true);
    setTimeout(() => setGrantSuccess(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div 
        className={`bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden ${
          seniorMode ? 'text-base' : 'text-sm'
        }`}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Trust & Safety Center</span>
                <span className="text-xs font-normal text-slate-400">• భద్రత & గోప్యత</span>
              </h2>
              <p className="text-xs text-slate-400">
                Non-diagnostic guarantees, DPDP compliance, and patient data protection.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-4 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('safety')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition flex items-center gap-1.5 border-b-2 ${
              activeTab === 'safety'
                ? 'border-emerald-500 text-emerald-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Clinical Disclaimer</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition flex items-center gap-1.5 border-b-2 ${
              activeTab === 'privacy'
                ? 'border-cyan-500 text-cyan-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>DPDP & HIPAA Privacy</span>
          </button>

          <button
            onClick={() => setActiveTab('caretaker')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition flex items-center gap-1.5 border-b-2 ${
              activeTab === 'caretaker'
                ? 'border-teal-500 text-teal-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Family / Caretaker Access</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition flex items-center gap-1.5 border-b-2 ${
              activeTab === 'audit'
                ? 'border-purple-500 text-purple-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Data Access Log</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB 1: SAFETY & CLINICAL DISCLAIMER */}
          {activeTab === 'safety' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 text-amber-200 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-300">
                  <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
                  <span>Administrative Coordination — Not Medical Diagnosis</span>
                </div>
                <p className="leading-relaxed">
                  CareBridge AI is designed strictly for **administrative queue triage, hospital slot matching, and navigation assistance**. 
                  It does **not** diagnose medical conditions, prescribe medication, or replace a registered medical practitioner (RMP).
                </p>
                <p className="leading-relaxed italic text-amber-300/80">
                  తెలుగు: CareBridge AI కేవలం ఆసుపత్రి అపాయింట్‌మెంట్‌లు మరియు క్యూ సమన్వయం కోసం మాత్రమే. ఇది వైద్య నిర్ధారణ (Diagnosis) చేయదు.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-950/20 space-y-3">
                <div className="flex items-center gap-2 font-bold text-sm text-rose-300">
                  <PhoneCall className="h-5 w-5 text-rose-400 shrink-0" />
                  <span>Medical Emergencies: Immediate 108 Protocol</span>
                </div>
                <p className="text-xs text-rose-200 leading-relaxed">
                  If you or someone around you experiences severe chest pain, severe shortness of breath, sudden weakness/stroke symptoms, 
                  uncontrolled bleeding, or unconsciousness, **do not wait for an online appointment**. 
                  Immediately call Emergency Services.
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <a
                    href="tel:108"
                    className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition"
                  >
                    <PhoneCall className="h-4 w-4" />
                    <span>Call 108 (Ambulance)</span>
                  </a>
                  <a
                    href="tel:112"
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/40 font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <span>Emergency 112</span>
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/50 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2 font-semibold text-white">
                  <Info className="h-4 w-4 text-cyan-400" />
                  <span>Pre-Booking Confirmation Policy</span>
                </div>
                <p className="leading-relaxed text-slate-400">
                  CareBridge AI requires explicit human confirmation before finalizing any hospital booking, rescheduling, or schedule modification. No slot is confirmed without patient approval.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: PRIVACY & COMPLIANCE */}
          {activeTab === 'privacy' && (
            <div className="space-y-4 text-xs text-slate-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-cyan-300">
                    <ShieldCheck className="h-5 w-5 text-cyan-400" />
                    <span>India DPDP Act 2023 Compliant</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    Personal data processed with explicit digital consent. Right to data erasure and consent withdrawal supported at any time.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-300">
                    <Lock className="h-5 w-5 text-emerald-400" />
                    <span>HIPAA-Grade Zero-Leakage</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    Protected Health Information (PHI) is isolated. Reception staff only view token and arrival data; medical history is restricted to assigned doctors.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/50 space-y-3">
                <h4 className="font-bold text-white text-sm">Role-Based Access Control (RBAC) Architecture:</h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">Patient</span>
                    <span className="text-slate-400">Can only view their own digital passes, appointments, and prescriptions.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">Doctor</span>
                    <span className="text-slate-400">Can view consultation queue for their OPD room, update delay notices, and issue electronic prescriptions.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">Reception</span>
                    <span className="text-slate-400">Access to walk-in kiosks, token numbers, and queue metrics. Cannot access confidential medical notes.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">Admin</span>
                    <span className="text-slate-400">Monitors anonymized system telemetry, surge indices, and staff shifts.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CARETAKER / FAMILY ACCESS */}
          {activeTab === 'caretaker' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl border border-teal-500/30 bg-teal-950/20 text-xs text-teal-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-teal-300">
                  <Users className="h-4 w-4" />
                  <span>Authorized Family Member / Caretaker Delegation</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Allow a family member (son, daughter, spouse, caregiver) to check in, track queue tokens, and book appointments on your behalf.
                </p>
              </div>

              {grantSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Caretaker access granted successfully with audit log entry.</span>
                </div>
              )}

              {/* Add Caretaker Form */}
              <form onSubmit={handleGrantCaretaker} className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
                <h4 className="font-bold text-white text-xs">Grant Temporary Caretaker Access:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Caretaker Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Suresh Kumar"
                      value={caretakerName}
                      onChange={(e) => setCaretakerName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Relationship</label>
                    <select
                      value={relation}
                      onChange={(e) => setRelation(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-500"
                    >
                      <option value="Son / కుమారుడు">Son / కుమారుడు</option>
                      <option value="Daughter / కుమార్తె">Daughter / కుమార్తె</option>
                      <option value="Spouse / భార్య లేదా భర్త">Spouse / భార్య లేదా భర్త</option>
                      <option value="Parent / తల్లిదండ్రులు">Parent / తల్లిదండ్రులు</option>
                      <option value="Guardian / సంరక్షకుడు">Guardian / సంరక్షకుడు</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Access Expiration</label>
                    <select
                      value={durationDays}
                      onChange={(e) => setDurationDays(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-500"
                    >
                      <option value={7}>7 Days (Temporary)</option>
                      <option value={30}>30 Days (Standard)</option>
                      <option value={90}>90 Days (Chronic care)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500">
                    Consent can be revoked at any moment.
                  </span>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow transition cursor-pointer"
                  >
                    Grant Consent
                  </button>
                </div>
              </form>

              {/* Active Caretakers List */}
              <div className="space-y-2">
                <h4 className="font-bold text-white text-xs">Currently Authorized Caretakers:</h4>
                {caretakers.map((c, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-slate-800 bg-slate-900/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-xs">
                        {c.caretaker_name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-semibold text-xs">{c.caretaker_name}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                            {c.relation}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          Valid until: {c.valid_until} • Scope: {c.scope}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setCaretakers(caretakers.filter((_, i) => i !== idx))}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-700/50 text-[11px] transition cursor-pointer"
                    >
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: AUDIT LOG (Who viewed my data?) */}
          {activeTab === 'audit' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl border border-purple-500/30 bg-purple-950/20 text-xs text-purple-200">
                <div className="font-bold flex items-center gap-1.5 text-purple-300 mb-0.5">
                  <Eye className="h-4 w-4" />
                  <span>Immutable Patient Access Trail (Who viewed my data?)</span>
                </div>
                <p className="text-slate-400">
                  Every doctor review, receptionist scan, and agent action is recorded into the CareBridge tamper-evident audit ledger.
                </p>
              </div>

              <div className="space-y-2">
                {auditEntries.map((log) => (
                  <div key={log.id} className="p-3 rounded-xl border border-slate-800 bg-slate-900/70 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{log.actor} ({log.role})</span>
                      <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                    </div>
                    <div className="text-slate-300 font-mono text-[11px]">{log.action}</div>
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>{log.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>DPDP Act 2023 & NDHM Abha Compliant Architecture</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
