import { useState } from 'react';
import { Layers, Activity, X } from 'lucide-react';

interface TechnicalArchitectureModalProps {
  onClose: () => void;
}

export const TechnicalArchitectureModal: React.FC<TechnicalArchitectureModalProps> = ({ onClose }) => {
  const [activeState, setActiveState] = useState<string>('WAITING_FOR_APPROVAL');

  const lifecycleStates = [
    {
      state: 'PLANNED',
      color: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      description: 'Goal understood, constraints extracted, and multi-step tool sequence formulated.'
    },
    {
      state: 'WAITING_FOR_APPROVAL',
      color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      description: 'Sensitive administrative action (booking, cancellation) halted behind human-in-the-loop card.'
    },
    {
      state: 'APPROVED',
      color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      description: 'Explicit human consent received. Parameters validated and signed.'
    },
    {
      state: 'EXECUTING',
      color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      description: 'Discrete healthcare administration tool called against prototype database.'
    },
    {
      state: 'COMPLETED',
      color: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
      description: 'Database commit succeeded, verification check passed, and digital pass issued.'
    },
    {
      state: 'FAILED',
      color: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      description: 'Tool execution or slot collision encountered; triggers failure recovery engine.'
    },
    {
      state: 'RECOVERED',
      color: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      description: 'Cancellation-minimizing workflow identified alternative slot/doctor/hospital and updated pass.'
    },
    {
      state: 'CANCELLED',
      color: 'bg-slate-700/40 text-slate-300 border-slate-600',
      description: 'Action revoked by user or security block without database changes.'
    }
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 text-slate-100">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight">
                  CareBridge AI Multi-Agent Decision Architecture
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  5-Layer Model
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Full-stack agent orchestration flow from patient intent to discrete tool execution and database verification.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Layered Flow Diagram */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 font-mono text-xs space-y-3">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block mb-1">
            End-to-End Execution Pipeline (తీసుకున్న నిర్ణయ మార్గం)
          </span>

          <div className="flex flex-col items-center space-y-2">
            {/* Layer 1 */}
            <div className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center text-slate-300">
              <span className="text-purple-400 font-bold">1. User Interaction Layer: </span>
              Patient / Doctor / Reception / Admin (React + TypeScript UI, Multilingual NLU)
            </div>

            <div className="text-slate-500">↓</div>

            {/* Layer 2 */}
            <div className="w-full p-2.5 rounded-xl bg-blue-950/40 border border-blue-500/40 text-center text-blue-200">
              <span className="text-blue-400 font-bold">2. API Gateway: </span>
              FastAPI Async Server (Validation, Rate Limiting, Audit Interceptors)
            </div>

            <div className="text-slate-500">↓</div>

            {/* Layer 3 */}
            <div className="w-full p-3 rounded-xl bg-indigo-950/50 border border-indigo-500/40 text-center text-indigo-200 shadow-md">
              <span className="text-indigo-300 font-bold">3. Supervisor Agent Core: </span>
              Intent Classification • Constraint Extraction • Safety & RBAC Guardrail Check
            </div>

            <div className="text-slate-500">↓</div>

            {/* Layer 4: Specialized Domain Subagents */}
            <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
              <div className="p-2 rounded-lg bg-cyan-950/40 border border-cyan-500/40 text-cyan-300">
                <strong>Hospital Agent</strong>
                <span className="block text-[10px] text-slate-400">Node telemetry</span>
              </div>
              <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300">
                <strong>Schedule Agent</strong>
                <span className="block text-[10px] text-slate-400">Slots & Booking</span>
              </div>
              <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-300">
                <strong>Queue Agent</strong>
                <span className="block text-[10px] text-slate-400">Tokens & TV</span>
              </div>
              <div className="p-2 rounded-lg bg-teal-950/40 border border-teal-500/40 text-teal-300">
                <strong>Policy Agent</strong>
                <span className="block text-[10px] text-slate-400">Grounded RAG</span>
              </div>
            </div>

            <div className="text-slate-500">↓</div>

            {/* Layer 5: Tool Registry */}
            <div className="w-full p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center text-emerald-200">
              <span className="text-emerald-400 font-bold">4. Tool Registry (11 Discrete Tools): </span>
              search_hospitals(), check_doctor_slots(), rank_hospitals(), create_appointment()...
            </div>

            <div className="text-slate-500">↓</div>

            {/* Layer 6: SmartFlow & Recovery */}
            <div className="w-full p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/40 text-center text-purple-200">
              <span className="text-purple-400 font-bold">5. Optimization & Self-Healing: </span>
              SmartFlow 2.0 Dynamic Scoring Engine • Cancellation-Minimizing Recovery Engine
            </div>

            <div className="text-slate-500">↓</div>

            {/* Layer 7: Database */}
            <div className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center text-slate-400">
              <span className="text-white font-bold">6. Prototype Storage & Outputs: </span>
              SQLite (carebridge.db) • Immutable Audit Log • Digital OPD Pass • Simulated Alerts
            </div>
          </div>
        </div>

        {/* 8 Explicit Agent Lifecycle States */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>8 Formal Agent Lifecycle States</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              Click any state to inspect
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {lifecycleStates.map((st) => {
              const isSelected = activeState === st.state;
              return (
                <button
                  key={st.state}
                  onClick={() => setActiveState(st.state)}
                  className={`p-2 rounded-xl border text-left transition cursor-pointer ${st.color} ${
                    isSelected ? 'ring-2 ring-white scale-102 shadow-lg' : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  <span className="font-mono font-bold text-[11px] block">{st.state}</span>
                </button>
              );
            })}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <span className="text-cyan-400 font-mono font-bold">{activeState}: </span>
            <span className="text-slate-200">
              {lifecycleStates.find(s => s.state === activeState)?.description}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
