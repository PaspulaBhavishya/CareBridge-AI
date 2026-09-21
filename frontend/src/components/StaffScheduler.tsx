import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock, Stethoscope, RefreshCw, Activity, TrendingDown, Users, Sparkles } from 'lucide-react';
import type { AppointmentRecord, ScheduleConflictRecord } from '../types';

interface StaffSchedulerProps {
  appointments: AppointmentRecord[];
  conflicts: ScheduleConflictRecord[];
  onResolveConflict: (conflictId: number) => void;
  isLoading: boolean;
  onRefresh: () => void;
}

export const StaffScheduler: React.FC<StaffSchedulerProps> = ({
  appointments,
  conflicts,
  onResolveConflict,
  isLoading,
  onRefresh
}) => {
  const [crowdActionApproved, setCrowdActionApproved] = useState(false);
  const [showImpact, setShowImpact] = useState(false);
  const pendingConflicts = conflicts.filter(c => c.status === 'PENDING');
  const resolvedConflicts = conflicts.filter(c => c.status === 'RESOLVED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <Stethoscope className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Staff & Receptionist Coordination Hub</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated schedule conflict detection, double-booking resolution, and cross-hospital appointment management.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition cursor-pointer shadow-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Schedules</span>
        </button>
      </div>

      {/* Admin Operational Crowd Alert & Agent Suggestions */}
      <div className="p-5 rounded-2xl bg-white border border-indigo-100 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-wider">
                Autonomous Operational Telemetry • Hospital Twin
              </span>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Operational Crowd Alert: Cardiology OPD Queue at 42</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  Critical Surge &gt; 40
                </span>
              </h3>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Node: CareBridge Heart Center Guntur
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
          <div className="flex items-start gap-2 text-slate-700">
            <Sparkles className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-blue-700">Agent Recommendation:</strong> Activate auxiliary OPD Room 104 with Dr. Suresh (Cardiology backup) and reroute non-acute walk-ins to Hospital C.
            </div>
          </div>

          {showImpact && (
            <div className="mt-2 p-3 rounded-xl bg-white border border-slate-200 text-[11px] font-mono grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-700 animate-fade-in shadow-xs">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-amber-500" />
                <span>Current Queue: <strong>42 patients</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-emerald-600" />
                <span>Projected Queue: <strong>24 patients (-43%)</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span>Wait Reduction: <strong>-35 minutes</strong></span>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>Telemetry updated 1 min ago • SmartFlow Network Sync</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowImpact(!showImpact)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition cursor-pointer"
            >
              {showImpact ? 'Hide Impact' : 'View Network Impact'}
            </button>

            {crowdActionApproved ? (
              <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Recommendation Applied (Room 104 Open)</span>
              </div>
            ) : (
              <button
                onClick={() => setCrowdActionApproved(true)}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Approve Recommendation</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Conflicts Alert Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>Automated Schedule Conflicts & Audits</span>
            {pendingConflicts.length > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                {pendingConflicts.length} Action Required
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                All Cleared
              </span>
            )}
          </h3>
        </div>

        {pendingConflicts.length === 0 && resolvedConflicts.length === 0 && (
          <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-500 shadow-xs">
            No schedule conflicts detected across any hospital node.
          </div>
        )}

        {pendingConflicts.map((c) => (
          <div
            key={c.conflict_id}
            className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3 shadow-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-amber-800">
                    Conflict #{c.conflict_id} • {c.conflict_type}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {c.doctor_name} ({c.department}) — {c.hospital_name}
                  </h4>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 self-start sm:self-auto">
                PENDING STAFF APPROVAL
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-amber-200/80 text-xs space-y-1.5 shadow-xs">
              <div className="text-slate-700">
                <strong className="text-slate-900">Issue:</strong> {c.description}
              </div>
              <div className="text-emerald-700 font-medium">
                <strong className="text-slate-900">AI Proposed Resolution:</strong> {c.suggested_resolution}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => onResolveConflict(c.conflict_id)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Approve & Apply Resolution</span>
              </button>
            </div>
          </div>
        ))}

        {resolvedConflicts.map((c) => (
          <div
            key={c.conflict_id}
            className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs flex items-center justify-between gap-3 text-slate-600 shadow-xs"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>
                Resolved: {c.doctor_name} — {c.suggested_resolution}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              RESOLVED
            </span>
          </div>
        ))}
      </div>

      {/* Confirmed Appointments Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>Scheduled Patient Appointments</span>
            <span className="text-xs text-slate-400">({appointments.length} active)</span>
          </h3>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Doctor & Specialty</th>
                <th className="px-4 py-3">Hospital</th>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3">Est Wait</th>
                <th className="px-4 py-3">SmartFlow Score</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No confirmed appointments found. Book one via CareBridge AI!
                  </td>
                </tr>
              ) : (
                appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-4 py-3 font-mono font-bold text-blue-600">
                      {appt.confirmation_code}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {appt.patient_name}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-900 font-medium">{appt.doctor_name}</div>
                      <div className="text-[10px] text-slate-400">{appt.department}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {appt.hospital}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{appt.date}</div>
                      <div className="text-[10px] text-slate-400">{appt.time}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-mono">
                        <Clock className="h-3 w-3" />
                        <span>{appt.simulated_wait_min}m</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-blue-600">
                      {Math.round(appt.smartflow_score * 100)}%
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {appt.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
