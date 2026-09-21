import React, { useState } from 'react';
import { 
  AlertTriangle, RefreshCw, CheckCircle, ArrowRight, Sparkles 
} from 'lucide-react';

interface RecoveryOption {
  action: string;
  title: string;
  description: string;
  payload: any;
}

interface RecoveryAlertBannerProps {
  onRecoveryResolved?: (message: string) => void;
}

export const RecoveryAlertBanner: React.FC<RecoveryAlertBannerProps> = ({ onRecoveryResolved }) => {
  const [activeRecovery, setActiveRecovery] = useState<any | null>(null);
  const [isTriggering, setIsTriggering] = useState<boolean>(false);
  const [isResolving, setIsResolving] = useState<boolean>(false);
  const [resolvedNotice, setResolvedNotice] = useState<string | null>(null);

  const handleSimulateDisruption = async (scenario: string = 'DOCTOR_DELAYED') => {
    setIsTriggering(true);
    setResolvedNotice(null);
    try {
      const res = await fetch('/api/recovery/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario,
          appointment_id: 1,
          delay_minutes: 30
        })
      });
      if (res.ok) {
        const data = await res.json();
        setActiveRecovery(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTriggering(false);
    }
  };

  const handleExecuteOption = async (option: RecoveryOption) => {
    setIsResolving(true);
    try {
      const res = await fetch('/api/recovery/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: option.action,
          payload: option.payload,
          actor_name: 'Ravi Kumar',
          actor_role: 'patient'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setActiveRecovery(null);
        setResolvedNotice(data.message || 'Workflow disruption recovered successfully!');
        if (onRecoveryResolved) onRecoveryResolved(data.message);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-amber-950/70 via-slate-900 to-slate-950 rounded-2xl border border-amber-500/40 p-4 shadow-xl text-slate-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
                ⭐ Killer Feature: Intelligent Recovery Mode
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Self-Healing AI
              </span>
            </div>
            <h4 className="text-xs font-bold text-white leading-tight">
              Hospital Disruption Detection & 1-Click Patient Journey Recovery
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              "When workflows change, CareBridge AI does not fail — it detects disruption, plans alternatives, asks approval, and recovers."
            </p>
            <p className="text-[10px] text-amber-300/80 font-mono mt-0.5">
              ⚠️ Demo Simulation — Not a Live Hospital Integration. Controlled failover testing.
            </p>
          </div>
        </div>

        {/* 6 Scenario Action Buttons */}
        {!activeRecovery && (
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            <button
              onClick={() => handleSimulateDisruption('DOCTOR_UNAVAILABLE')}
              disabled={isTriggering}
              className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-md shadow-amber-950/40 transition active:scale-95 cursor-pointer disabled:opacity-50"
              title="Simulate doctor delay / unavailable"
            >
              <RefreshCw className={`w-3 h-3 ${isTriggering ? 'animate-spin' : ''}`} />
              <span>Doctor Unavailable</span>
            </button>
            <button
              onClick={() => handleSimulateDisruption('SLOT_ALREADY_BOOKED')}
              disabled={isTriggering}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-[11px] font-semibold flex items-center gap-1 border border-slate-700 transition active:scale-95 cursor-pointer disabled:opacity-50"
              title="Simulate slot already booked"
            >
              <span>Slot Already Booked</span>
            </button>
            <button
              onClick={() => handleSimulateDisruption('APPOINTMENT_CONFLICT')}
              disabled={isTriggering}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-[11px] font-semibold flex items-center gap-1 border border-slate-700 transition active:scale-95 cursor-pointer disabled:opacity-50"
              title="Simulate appointment schedule conflict"
            >
              <span>Appointment Conflict</span>
            </button>
            <button
              onClick={() => handleSimulateDisruption('API_FAILURE')}
              disabled={isTriggering}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-[11px] font-semibold flex items-center gap-1 border border-slate-700 transition active:scale-95 cursor-pointer disabled:opacity-50"
              title="Simulate API / network failure"
            >
              <span>API Failure</span>
            </button>
            <button
              onClick={() => handleSimulateDisruption('DUPLICATE_BOOKING')}
              disabled={isTriggering}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-[11px] font-semibold flex items-center gap-1 border border-slate-700 transition active:scale-95 cursor-pointer disabled:opacity-50"
              title="Simulate duplicate booking guard"
            >
              <span>Duplicate Booking</span>
            </button>
            <button
              onClick={() => handleSimulateDisruption('UNAUTHORIZED_ACCESS')}
              disabled={isTriggering}
              className="px-2.5 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 hover:text-white text-[11px] font-semibold flex items-center gap-1 border border-rose-800/60 transition active:scale-95 cursor-pointer disabled:opacity-50"
              title="Simulate unauthorized record access attempt"
            >
              <span>Unauthorized Access</span>
            </button>
          </div>
        )}
      </div>

      {/* Resolved Success Alert */}
      {resolvedNotice && (
        <div className="mt-3 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="font-semibold">{resolvedNotice}</span>
        </div>
      )}

      {/* Active Disruption Card */}
      {activeRecovery && (
        <div className="mt-3 p-4 rounded-xl bg-slate-950 border border-amber-500/60 space-y-3 animate-fadeIn">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 animate-bounce" />
              <div>
                <span className="text-xs font-bold text-amber-300">
                  {activeRecovery.message_en}
                </span>
                <p className="text-[11px] text-amber-200/80">
                  {activeRecovery.message_te}
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              +{activeRecovery.delay_minutes}m Delay
            </span>
          </div>

          {/* Options List */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            {activeRecovery.options.map((opt: RecoveryOption, i: number) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 flex flex-col justify-between space-y-2 transition"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-400 uppercase">
                      Option {i + 1}
                    </span>
                    {opt.action === 'SWAP_AVAILABLE_DOCTOR' && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400">
                        Zero Extra Wait
                      </span>
                    )}
                  </div>
                  <h5 className="text-xs font-bold text-white mt-1">
                    {opt.title}
                  </h5>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                    {opt.description}
                  </p>
                </div>

                <button
                  onClick={() => handleExecuteOption(opt)}
                  disabled={isResolving}
                  className="w-full py-1.5 px-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 text-xs font-bold border border-amber-500/30 flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <span>Approve & Recover</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setActiveRecovery(null)}
              className="text-[10px] text-slate-500 hover:text-slate-300"
            >
              Dismiss Disruption Alert
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
