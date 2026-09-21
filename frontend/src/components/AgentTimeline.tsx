import React from 'react';
import { 
  CheckCircle2, AlertTriangle, ShieldAlert, 
  Cpu, Wrench, Activity 
} from 'lucide-react';

export interface TimelineStep {
  agent: string;
  tool: string;
  status: 'completed' | 'waiting_for_approval' | 'blocked' | 'executing';
  timestamp: string;
  summary: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  latency_ms?: number;
  input_summary?: string;
  output_summary?: string;
  reasons?: string[];
}

interface AgentTimelineProps {
  steps: TimelineStep[];
  currentGoal?: string;
  isExecuting?: boolean;
}

const AGENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Patient Communication Agent': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  'Hospital Coordination Agent': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  'Scheduling Agent': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Queue Management Agent': { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  'Document Explanation Agent': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'Safety & Privacy Agent': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  'Notification Agent': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  'Supervisor Agent': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Failure Recovery Engine': { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' }
};

export const AgentTimeline: React.FC<AgentTimelineProps> = ({ steps, currentGoal, isExecuting }) => {
  if (!steps || steps.length === 0) {
    return (
      <div className="p-5 rounded-2xl bg-white border border-slate-200 text-center text-slate-500 text-xs shadow-xs">
        <Cpu className="w-6 h-6 mx-auto mb-2 text-blue-600 animate-pulse" />
        <span className="font-bold block text-slate-800">CareBridge Supervisor Engine Idle</span>
        <span className="text-slate-400">Send a patient query or click a demo scenario to see live multi-agent execution.</span>
      </div>
    );
  }

  const uniqueTools = new Set(steps.map(s => s.tool)).size;
  const avgLatency = (steps.reduce((acc, s) => acc + (s.latency_ms || 12), 0) / Math.max(1, steps.length)).toFixed(1);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
            <Cpu className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span>Agent Execution Timeline</span>
              {isExecuting && (
                <span className="flex items-center gap-1 text-[10px] text-amber-600 font-mono">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  Orchestrating...
                </span>
              )}
            </h4>
            <p className="text-[10px] text-slate-400">
              Transparent multi-agent planning & dynamic tool execution
            </p>
          </div>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-slate-700 border border-slate-200 shadow-xs">
          {steps.length} Steps
        </span>
      </div>

      {/* High-level Cost & Performance Metadata Bar */}
      <div className="px-4 py-2 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-mono">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span>Steps: <strong className="text-blue-600">{steps.length}</strong></span>
          <span>•</span>
          <span>Tools: <strong className="text-emerald-600">{uniqueTools}</strong></span>
          <span>•</span>
          <span>Avg Latency: <strong className="text-amber-600">{avgLatency}ms</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-sans font-bold">
            ● Normal
          </span>
          <span className="text-[9px] text-slate-400 hidden sm:inline">Fallback: Standby</span>
        </div>
      </div>

      {currentGoal && (
        <div className="px-4 py-2 bg-blue-50/60 border-b border-blue-100 flex items-center gap-2 text-[11px] text-blue-900">
          <span className="font-bold text-blue-700 uppercase text-[9px] px-1.5 py-0.5 rounded bg-blue-100">Target Goal</span>
          <span className="truncate">{currentGoal}</span>
        </div>
      )}

      {/* Steps List */}
      <div className="p-3 space-y-2.5 max-h-80 overflow-y-auto">
        {steps.map((step, idx) => {
          const colors = AGENT_COLORS[step.agent] || {
            bg: 'bg-slate-50',
            text: 'text-slate-700',
            border: 'border-slate-200'
          };

          return (
            <div
              key={idx}
              className={`p-3 rounded-xl border transition-all ${
                step.status === 'waiting_for_approval'
                  ? 'bg-amber-50/80 border-amber-300 shadow-xs'
                  : step.status === 'blocked'
                  ? 'bg-rose-50/80 border-rose-300'
                  : 'bg-slate-50/60 border-slate-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Agent Badge */}
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${colors.bg} ${colors.text} ${colors.border}`}>
                    {step.agent}
                  </span>

                  {/* Tool Badge */}
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    <Wrench className="w-2.5 h-2.5 text-slate-400" />
                    {step.tool}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono flex-shrink-0">
                  {step.latency_ms !== undefined && (
                    <span className="text-slate-600 font-semibold">{step.latency_ms}ms</span>
                  )}
                  <span>{step.timestamp}</span>
                </div>
              </div>

              {/* Summary Text */}
              <div className="mt-1.5 flex items-start gap-2">
                {step.status === 'completed' && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                )}
                {step.status === 'waiting_for_approval' && (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5 animate-pulse" />
                )}
                {step.status === 'blocked' && (
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600 flex-shrink-0 mt-0.5" />
                )}
                {step.status === 'executing' && (
                  <Activity className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5 animate-spin" />
                )}

                <div className="flex-1">
                  <p className="text-[11px] font-semibold text-slate-900 leading-snug">
                    {step.summary}
                  </p>
                  {step.output_summary && (
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      ↳ {step.output_summary}
                    </p>
                  )}
                </div>

                {/* Risk Badge */}
                {step.risk_level === 'HIGH' && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 uppercase">
                    Risk: High
                  </span>
                )}
                {step.risk_level === 'MEDIUM' && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 uppercase">
                    Risk: Medium
                  </span>
                )}
                {step.risk_level === 'LOW' && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                    Risk: Low
                  </span>
                )}
              </div>

              {/* "Why This Action?" Explainability Bullets */}
              {step.reasons && step.reasons.length > 0 && (
                <div className="mt-2 pl-3.5 pr-2.5 py-1.5 rounded-lg bg-blue-50/50 border border-blue-100 text-[10px]">
                  <span className="font-bold text-blue-800 uppercase tracking-wider text-[9px] block mb-0.5">
                    Why this action? (ఈ చర్య ఎందుకు?)
                  </span>
                  <ul className="space-y-0.5 text-slate-700 list-disc list-inside">
                    {step.reasons.map((r, rIdx) => (
                      <li key={rIdx} className="leading-tight">{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
