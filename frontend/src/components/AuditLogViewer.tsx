import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, User, RefreshCw } from 'lucide-react';
import type { AuditLogEntry } from '../types';

interface AuditLogViewerProps {
  logs: AuditLogEntry[];
  isLoading: boolean;
  onRefresh: () => void;
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({
  logs,
  isLoading,
  onRefresh
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Shield className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-white">Immutable Hospital Governance & Audit Trail</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Every AI agent tool execution, user confirmation, and blocked unauthorized attempt is recorded with role stamps.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-slate-400 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Security Governance Highlights for Judges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <ShieldCheck className="h-4 w-4" />
            <span>Role-Based Access Control (RBAC)</span>
          </div>
          <p className="text-slate-400 text-[11px]">
            Patients cannot view other patient records or execute administrative doctor schedule shifts.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
            <Shield className="h-4 w-4" />
            <span>Human-in-the-Loop Confirmation</span>
          </div>
          <p className="text-slate-400 text-[11px]">
            Agent cannot alter databases without explicit human confirmation on interactive UI cards.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
            <ShieldAlert className="h-4 w-4" />
            <span>Security Anomaly Logging</span>
          </div>
          <p className="text-slate-400 text-[11px]">
            Any prompt injection or unauthorized access attempts trigger instant audit alerts.
          </p>
        </div>
      </div>

      {/* Audit Log Entries Stream */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden">
        <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">Live Event Feed ({logs.length} events)</span>
          <span className="text-[10px] text-slate-500 font-mono">APPEND-ONLY REGISTRY</span>
        </div>

        <div className="divide-y divide-slate-800/60 max-h-[600px] overflow-y-auto">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No audit records logged yet.
            </div>
          ) : (
            logs.map((log) => {
              const isBlocked = log.status.includes('BLOCKED');
              const isHighRisk = log.risk_level === 'HIGH';

              return (
                <div
                  key={log.id}
                  className={`p-4 transition ${
                    isBlocked
                      ? 'bg-rose-950/15 hover:bg-rose-950/25 border-l-4 border-l-rose-500'
                      : 'hover:bg-slate-850/40 border-l-4 border-l-emerald-500/50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[11px] text-slate-400">
                        {log.timestamp}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {log.action_type}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          isBlocked
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}
                      >
                        {log.status}
                      </span>
                      {isHighRisk && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-950 text-rose-400 border border-rose-800">
                          HIGH RISK
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <User className="h-3 w-3" />
                      <span className="text-slate-200 font-medium">{log.actor_name}</span>
                      <span className="text-slate-500">({log.actor_role})</span>
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-slate-200 leading-relaxed font-sans">
                    {log.details}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
