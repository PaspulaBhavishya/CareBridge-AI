import React, { useState } from 'react';
import { 
  CheckCircle2, AlertTriangle, ShieldAlert, 
  Cpu, Wrench, Activity, ChevronDown, ChevronUp
} from 'lucide-react';
import type { AgentTimelineStep, SupervisorDecision } from '../types';

interface AgentActivityTimelineProps {
  steps?: AgentTimelineStep[];
  currentGoal?: string;
  isExecuting?: boolean;
  compact?: boolean;
  supervisorDecision?: SupervisorDecision | null;
}

const AGENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Patient Communication Agent': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  'Hospital Coordination Agent': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  'Scheduling Agent': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Queue Management Agent': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'Document Explanation Agent': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'Safety & Privacy Agent': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  'Notification Agent': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  'Supervisor Agent': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Failure Recovery Engine': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' }
};

export const AgentActivityTimeline: React.FC<AgentActivityTimelineProps> = ({
  steps = [],
  currentGoal,
  isExecuting = false,
  compact = false,
  supervisorDecision
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [showFullTimeline, setShowFullTimeline] = useState<boolean>(!compact);
  const effectiveGoal = currentGoal || supervisorDecision?.user_goal;

  if (!steps || steps.length === 0) {
    return (
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-xs flex items-center gap-2.5 shadow-sm">
        <Cpu className="w-4 h-4 text-slate-400" />
        <span className="font-mono text-[11px]">CareBridge Multi-Agent Pipeline Standby</span>
      </div>
    );
  }

  const uniqueTools = new Set(steps.map(s => s.tool_name).filter(Boolean)).size;
  const totalLatency = steps.reduce((acc, s) => acc + (s.latency_ms || 10), 0);

  return (
    <div className={`rounded-xl border transition-all ${
      compact 
        ? 'bg-white border-slate-200 shadow-sm text-xs' 
        : 'bg-white border-slate-200 shadow-md text-xs'
    }`}>
      {/* Header Bar */}
      <div 
        onClick={() => compact && setShowFullTimeline(!showFullTimeline)}
        className={`px-3.5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 ${
          compact ? 'cursor-pointer hover:bg-slate-100 transition' : ''
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-cyan-50 border border-cyan-200 flex items-center justify-center flex-shrink-0">
            <Cpu className="w-3.5 h-3.5 text-cyan-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-[11px] uppercase tracking-wider">
                Agent Activity Timeline
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
                Approval-Aware Agent
              </span>
              {isExecuting && (
                <span className="flex items-center gap-1 text-[10px] text-amber-600 font-mono">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  Executing...
                </span>
              )}
            </div>
            {!compact && (
              <p className="text-[10px] text-slate-500">
                Request Understood → Tool Selected → Tool Executed → Verification → Approval Requested → Action Completed
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white text-slate-700 border border-slate-200 shadow-sm">
            {steps.length} Steps • {totalLatency.toFixed(0)}ms
          </span>
          {compact && (
            <button 
              type="button"
              className="text-slate-500 hover:text-slate-900 cursor-pointer"
              title="Toggle Timeline View"
            >
              {showFullTimeline ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Collapsible Content */}
      {showFullTimeline && (
        <div className="p-3 space-y-2.5 animate-fade-in">
          {/* Target Goal Summary if available */}
          {effectiveGoal && (
            <div className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-between text-[11px] text-blue-900">
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-bold text-blue-700 uppercase text-[9px] px-1.5 py-0.5 rounded bg-blue-100 flex-shrink-0">
                  Patient Goal
                </span>
                <span className="truncate font-medium">{effectiveGoal}</span>
              </div>
              <span className="text-[10px] text-blue-600 font-mono flex-shrink-0 ml-2">
                Tools: {uniqueTools}
              </span>
            </div>
          )}

          {/* Steps Flow */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {steps.map((step, idx) => {
              const agentName = step.agent_name || 'Supervisor Agent';
              const colors = AGENT_COLORS[agentName] || {
                bg: 'bg-slate-100',
                text: 'text-slate-700',
                border: 'border-slate-200'
              };
              const isExpanded = expandedIndex === idx;
              const isApproval = step.status === 'waiting_for_approval';
              const isBlocked = step.status === 'blocked';
              const isDone = step.status === 'completed' || step.status === 'success';

              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isApproval
                      ? 'bg-amber-50 border-amber-300 shadow-sm ring-1 ring-amber-300'
                      : isBlocked
                      ? 'bg-rose-50 border-rose-300'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono font-bold text-slate-500">
                        #{idx + 1}
                      </span>
                      {/* Subagent Badge */}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${colors.bg} ${colors.text} ${colors.border}`}>
                        {agentName}
                      </span>

                      {/* Tool Name Badge */}
                      {step.tool_name && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-cyan-800 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200 font-semibold">
                          <Wrench className="w-2.5 h-2.5 text-cyan-600" />
                          <span>{step.tool_name}()</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono flex-shrink-0">
                      {step.latency_ms !== undefined && (
                        <span className="text-slate-600">{step.latency_ms}ms</span>
                      )}
                      {step.timestamp && <span>{step.timestamp}</span>}
                    </div>
                  </div>

                  {/* Summary row */}
                  <div className="mt-1.5 flex items-start gap-2">
                    {isDone && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    )}
                    {isApproval && (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5 animate-pulse" />
                    )}
                    {isBlocked && (
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                    )}
                    {!isDone && !isApproval && !isBlocked && (
                      <Activity className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5 animate-spin" />
                    )}

                    <div className="flex-1">
                      <p className="text-[11px] font-medium text-slate-800 leading-snug">
                        {step.summary}
                      </p>

                      {step.output_summary && (
                        <p className="text-[10px] text-slate-600 font-mono mt-0.5">
                          ↳ {step.output_summary}
                        </p>
                      )}
                    </div>

                    {/* Risk Badge */}
                    {step.risk_level && (
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase flex-shrink-0 ${
                        step.risk_level === 'HIGH'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : step.risk_level === 'MEDIUM'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {step.risk_level} Risk
                      </span>
                    )}
                  </div>

                  {/* Expandable explainability ("Why this action?") */}
                  {step.reasons && step.reasons.length > 0 && (
                    <div className="mt-2 pl-3 pr-2 py-1.5 rounded-lg bg-white border border-slate-200 text-[10px] shadow-sm">
                      <span className="font-bold text-cyan-700 uppercase tracking-wider text-[9px] block mb-0.5">
                        Explainability: Why this action? (ఈ చర్య ఎందుకు?)
                      </span>
                      <ul className="space-y-0.5 text-slate-700 list-disc list-inside">
                        {step.reasons.map((r, rIdx) => (
                          <li key={rIdx} className="leading-tight">{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Expand input/output details toggle */}
                  {(step.input_summary || step.output_summary) && (
                    <button
                      type="button"
                      onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                      className="mt-1.5 text-[9px] font-mono text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isExpanded ? 'Hide Payload Details' : 'View Payload Details'}</span>
                      {isExpanded ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
                    </button>
                  )}

                  {isExpanded && (
                    <div className="mt-1.5 p-2 rounded bg-white border border-slate-200 text-[10px] font-mono text-slate-700 space-y-1 shadow-sm">
                      {step.input_summary && (
                        <div>
                          <strong className="text-slate-500">Input: </strong>
                          <span className="text-blue-700">{step.input_summary}</span>
                        </div>
                      )}
                      {step.output_summary && (
                        <div>
                          <strong className="text-slate-500">Output: </strong>
                          <span className="text-emerald-700">{step.output_summary}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
