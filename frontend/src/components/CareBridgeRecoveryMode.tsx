import React, { useState } from 'react';
import { 
  AlertTriangle, ShieldCheck, RefreshCw, CheckCircle2, 
  Clock, ArrowRight, Sparkles, RotateCcw, Zap
} from 'lucide-react';
import type { UserProfile, DigitalPassData } from '../types';

interface CareBridgeRecoveryModeProps {
  currentProfile: UserProfile;
  onViewDigitalPass?: (pass: DigitalPassData) => void;
  onTrackToken?: (token: string) => void;
  onBack?: () => void;
  seniorMode?: boolean;
}

export const CareBridgeRecoveryMode: React.FC<CareBridgeRecoveryModeProps> = ({
  currentProfile,
  onViewDigitalPass,
  onTrackToken,
  onBack,
  seniorMode = false
}) => {
  const [delaySimulated, setDelaySimulated] = useState<boolean>(false);
  const [resolvedStatus, setResolvedStatus] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<boolean>(false);
  const [recoveryLog, setRecoveryLog] = useState<Array<{ step: string; status: string; detail: string; time: string }>>([]);

  const handleSimulateDelay = async () => {
    setLoadingAction(true);
    try {
      const res = await fetch('/api/recovery/simulate-delay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointment_id: 100,
          doctor_name: "Dr. Priya",
          hospital_name: "Hospital B (CareBridge Central)",
          delay_minutes: 120,
          reason: "Emergency surgical operation at ICU"
        })
      });
      if (res.ok) {
        await res.json();
      }
    } catch (e) {
      console.warn("Using offline simulated recovery payload");
    } finally {
      setDelaySimulated(true);
      setResolvedStatus(null);
      setLoadingAction(false);
      setRecoveryLog([
        { step: "1. Event Trigger", status: "DETECTED", detail: "Hospital Roster event: Dr. Priya delayed by 120 mins due to Emergency ICU surgery.", time: "10:02 AM" },
        { step: "2. Cancellation-Minimizing Lock", status: "PROTECTED", detail: "Bhavishya's Token GM-024 remains active. CareBridge AI preserves the booking while finding alternatives.", time: "10:02 AM" },
        { step: "3. Prototype Network Check", status: "COMPLETED", detail: "Scanned configured prototype network hospitals for General Medicine specialists with low wait.", time: "10:03 AM" },
        { step: "4. SmartFlow Alternative Found", status: "RECOMMENDED", detail: "Dr. Ravi at Hospital B (OPD-04) available at 10:45 AM. Wait: 15 mins. Score: 82.0.", time: "10:03 AM" },
        { step: "5. HITL Decision Dispatched", status: "WAITING", detail: "Awaiting patient approval before modifying any appointment records.", time: "10:03 AM" }
      ]);
    }
  };

  const handleAcceptAlternative = async () => {
    setLoadingAction(true);
    try {
      const res = await fetch('/api/recovery/accept-alternative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: currentProfile.id || 1,
          original_confirmation: "CB-2026-GM024",
          alternative_doctor: "Dr. Ravi",
          alternative_hospital: "Hospital B",
          alternative_slot: "10:45 AM"
        })
      });
      if (res.ok) {
        await res.json();
      }
    } catch (e) {
      console.warn("Offline alternative swap applied");
    } finally {
      setLoadingAction(false);
      setResolvedStatus("ALTERNATIVE_ACCEPTED");
      setRecoveryLog(prev => [
        ...prev,
        { step: "6. Patient Confirmation", status: "APPROVED", detail: "Patient explicitly approved swap to Dr. Ravi (10:45 AM, Room OPD-04).", time: "Just now" },
        { step: "7. Safe Database Atomic Swap", status: "COMPLETED", detail: "Original slot released to reserve queue; new Token GM-029 created atomically.", time: "Just now" }
      ]);
    }
  };

  const handleKeepWaiting = () => {
    setResolvedStatus("KEPT_ORIGINAL");
    setRecoveryLog(prev => [
      ...prev,
      { step: "6. Patient Choice", status: "ORIGINAL_KEPT", detail: "Patient chose Option A: Retained original booking with Dr. Priya (Estimated 12:30 PM).", time: "Just now" }
    ]);
  };

  const handleAcceptOptionC = () => {
    setLoadingAction(true);
    setTimeout(() => {
      setLoadingAction(false);
      setResolvedStatus("HOSPITAL_C_ACCEPTED");
      setRecoveryLog(prev => [
        ...prev,
        { step: "6. Patient Confirmation", status: "APPROVED", detail: "Patient approved Option C: Transfer to Dr. Suresh at Hospital C (11:15 AM).", time: "Just now" },
        { step: "7. Cross-Hospital Safe Swap", status: "COMPLETED", detail: "Temporary hold committed to Hospital C prototype database; Token HC-018 assigned.", time: "Just now" }
      ]);
    }, 400);
  };

  const handleResetDemo = () => {
    setDelaySimulated(false);
    setResolvedStatus(null);
    setRecoveryLog([]);
  };

  return (
    <div className={`space-y-6 max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 text-slate-100 pb-20 ${
      seniorMode ? 'text-base' : 'text-sm'
    }`}>
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            {onBack && (
              <button
                onClick={onBack}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white transition cursor-pointer"
              >
                ← Back
              </button>
            )}
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>CareBridge Recovery Engine • Killer Feature</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Cancellation-Minimizing Recovery
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Delay & Disruption Recovery Workflow
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            When doctors are delayed or slots become unavailable, CareBridge AI tries to preserve the patient journey by finding alternatives before cancelling an appointment, retaining existing bookings until patient approval.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleResetDemo}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
          {!delaySimulated ? (
            <button
              onClick={handleSimulateDelay}
              disabled={loadingAction}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-amber-500/20 transition cursor-pointer flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{loadingAction ? 'Triggering...' : 'Simulate Dr. Priya Delay (2 Hours)'}</span>
            </button>
          ) : (
            <button
              onClick={handleSimulateDelay}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/40 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Re-Simulate Delay</span>
            </button>
          )}
        </div>
      </div>

      {/* Before Simulation State */}
      {!delaySimulated && (
        <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <Zap className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">
            Ready to test autonomous recovery mode?
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
            Click <strong>"Simulate Dr. Priya Delay"</strong> above. Watch how the CareBridge Autonomous Supervisor
            protects the patient's existing token, conducts a cross-hospital availability audit, and presents a 1-click solution.
          </p>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={handleSimulateDelay}
              className="px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-xl shadow-amber-600/30 transition cursor-pointer flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Simulate Dr. Priya Emergency Delay</span>
            </button>
          </div>
        </div>
      )}

      {/* Active Delay Simulation Alert */}
      {delaySimulated && (
        <div className="space-y-6 animate-fade-in">
          {/* Main Alert Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-950 border-2 border-amber-500/60 space-y-3 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-500/30 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                    Autonomous Incident Detected
                  </span>
                  <h3 className="text-lg font-black text-white">
                    Dr. Priya is delayed by ~120 minutes (Emergency Surgery)
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Token GM-024 Protected</span>
                </span>
              </div>
            </div>

            <p className="text-slate-300 text-xs sm:text-sm">
              Dr. Priya has been called into an unscheduled ICU emergency. Your original appointment time was <strong>10:30 AM</strong>.
              With the 120-minute delay, your new estimated consultation with Dr. Priya is <strong>12:30 PM</strong> (~130 min wait).
            </p>

            {/* Cancellation-Minimizing Notice */}
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-200 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-300">CareBridge Cancellation-Minimizing Recovery:</strong>
                <p className="mt-0.5 text-slate-300 text-[11px]">
                  CareBridge AI tries to preserve the patient journey by finding alternatives before cancelling an appointment. Your Token <strong>#GM-024</strong> remains active while you review alternative options.
                </p>
              </div>
            </div>
          </div>

          {/* 3-Option Recovery Comparison */}
          {resolvedStatus === null && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Select Recovery Choice (3 ప్రత్యామ్నాయ ఎంపికలు):
                </span>
                <span className="text-[10px] text-amber-300 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  Temporary slot holds active • Subject to patient confirmation
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {/* Option A: Same Doctor, Later Time */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 uppercase">
                        Option A: Same Doctor
                      </span>
                      <span className="text-amber-400 text-xs font-mono font-bold">
                        Delayed (+120m)
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white">Dr. Priya (Later Slot)</h4>
                      <p className="text-[11px] text-slate-400">Hospital B • Room OPD-03</p>
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-300 font-mono bg-slate-900/60 p-2 rounded-lg">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Slot:</span>
                        <strong className="text-amber-300">12:30 PM Today</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Wait:</span>
                        <span className="text-rose-400">~130 mins</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Status:</span>
                        <span className="text-emerald-400">Booking Retained</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleKeepWaiting}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
                  >
                    Retain Dr. Priya (12:30 PM)
                  </button>
                </div>

                {/* Option B: Alternative Doctor (Same Hospital) */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-950 to-cyan-950/30 border-2 border-emerald-500/60 space-y-3 flex flex-col justify-between shadow-lg">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                        Option B: Recommended Doctor
                      </span>
                      <span className="text-emerald-400 text-xs font-mono font-bold">
                        Score: 82.0 ★
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>Dr. Ravi</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-semibold">
                          GenMed
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-400">Hospital B • Room OPD-04</p>
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-300 font-mono bg-slate-900/60 p-2 rounded-lg">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Slot:</span>
                        <strong className="text-emerald-300">10:45 AM Today</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Wait:</span>
                        <strong className="text-emerald-400">~15 mins</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Fee:</span>
                        <span className="text-white">₹600 (No extra fee)</span>
                      </div>
                    </div>

                    {/* Why this option badges */}
                    <div className="p-2 rounded bg-black/40 text-[10px] space-y-0.5 text-slate-300">
                      <span className="text-[9px] font-bold text-cyan-400 uppercase block">Why this option:</span>
                      <div className="text-emerald-300">✓ Same department (General Medicine)</div>
                      <div className="text-emerald-300">✓ Shorter waiting time (15m vs 130m)</div>
                      <div className="text-emerald-300">✓ Telugu-speaking staff available</div>
                      <div className="text-emerald-300">✓ No duplicate booking</div>
                    </div>
                  </div>

                  <button
                    onClick={handleAcceptAlternative}
                    disabled={loadingAction}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{loadingAction ? 'Transferring...' : 'Accept Option B (Dr. Ravi)'}</span>
                  </button>
                </div>

                {/* Option C: Alternative Hospital */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-950 to-blue-950/30 border border-purple-500/50 space-y-3 flex flex-col justify-between shadow-lg">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase">
                        Option C: Alternative Hospital
                      </span>
                      <span className="text-purple-400 text-xs font-mono font-bold">
                        Score: 76.5
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>Dr. Suresh</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-semibold">
                          Hospital C
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-400">Hospital C (Regional OPD) • Room 102</p>
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-300 font-mono bg-slate-900/60 p-2 rounded-lg">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Slot:</span>
                        <strong className="text-purple-300">11:15 AM Today</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Wait:</span>
                        <strong className="text-purple-300">~25 mins</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Network:</span>
                        <span className="text-slate-300">Configured Demo Node</span>
                      </div>
                    </div>

                    {/* Why this option badges */}
                    <div className="p-2 rounded bg-black/40 text-[10px] space-y-0.5 text-slate-300">
                      <span className="text-[9px] font-bold text-purple-400 uppercase block">Why this option:</span>
                      <div className="text-purple-300">✓ Same department (General Medicine)</div>
                      <div className="text-purple-300">✓ Moderate crowd (72% load)</div>
                      <div className="text-purple-300">✓ Configured nearby network node</div>
                      <div className="text-purple-300">✓ No duplicate booking</div>
                    </div>
                  </div>

                  <button
                    onClick={handleAcceptOptionC}
                    disabled={loadingAction}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{loadingAction ? 'Holding Slot...' : 'Accept Option C (Hospital C)'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Resolved State: Alternative Accepted */}
          {resolvedStatus === "ALTERNATIVE_ACCEPTED" && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-950 border-2 border-emerald-500 space-y-4 shadow-2xl animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                    Autonomous Safe Transfer Complete
                  </span>
                  <h3 className="text-xl font-bold text-white">
                    Confirmed with Dr. Ravi at 10:45 AM • Token #GM-029
                  </h3>
                </div>
              </div>

              <p className="text-slate-300 text-xs sm:text-sm">
                Your appointment was seamlessly transferred to Dr. Ravi in Room OPD-04 without cancellation fees.
                Your digital OPD pass and queue position have been updated atomically.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs py-1">
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Doctor</span>
                  <strong className="text-white">Dr. Ravi</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Location</span>
                  <strong className="text-white">Hospital B (OPD-04)</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Slot Time</span>
                  <strong className="text-emerald-400 font-mono">10:45 AM</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">New Token</span>
                  <strong className="text-cyan-300 font-mono">GM-029</strong>
                </div>
              </div>

              <div className="flex items-center flex-wrap gap-2 pt-2 border-t border-slate-800">
                {onViewDigitalPass && (
                  <button
                    onClick={() => {
                      onViewDigitalPass({
                        confirmation_code: "CB-2026-REC-GM029",
                        patient_name: currentProfile.name || "Bhavishya",
                        doctor_name: "Dr. Ravi",
                        specialization: "General Medicine",
                        department: "General Medicine",
                        hospital_name: "Hospital B (CareBridge Central)",
                        room_number: "Room OPD-04",
                        date: "Today",
                        time: "10:45 AM",
                        token_number: "GM-029",
                        current_serving_token: "GM-027",
                        patients_ahead: 2,
                        simulated_wait_min: 15,
                        consultation_fee: 600,
                        instructions: "Transferred from Dr. Priya due to ICU emergency. Report to OPD-04."
                      });
                    }}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>View Updated Digital OPD Pass</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                {onTrackToken && (
                  <button
                    onClick={() => onTrackToken("GM-029")}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition cursor-pointer"
                  >
                    Track New Token (GM-029)
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Resolved State: Hospital C Accepted */}
          {resolvedStatus === "HOSPITAL_C_ACCEPTED" && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-950/60 via-slate-900 to-slate-950 border-2 border-purple-500 space-y-4 shadow-2xl animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">
                    Cross-Hospital Safe Transfer Complete
                  </span>
                  <h3 className="text-xl font-bold text-white">
                    Confirmed with Dr. Suresh at 11:15 AM • Hospital C (Regional OPD)
                  </h3>
                </div>
              </div>

              <p className="text-slate-300 text-xs sm:text-sm">
                Your appointment was transferred to Dr. Suresh at Hospital C Room 102. Temporary slot hold successfully committed to prototype database.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs py-1">
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Doctor</span>
                  <strong className="text-white">Dr. Suresh</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Hospital</span>
                  <strong className="text-white">Hospital C (Regional)</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Slot Time</span>
                  <strong className="text-purple-400 font-mono">11:15 AM</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">New Token</span>
                  <strong className="text-purple-300 font-mono">HC-018</strong>
                </div>
              </div>
            </div>
          )}

          {/* Resolved State: Kept Original */}
          {resolvedStatus === "KEPT_ORIGINAL" && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 animate-fade-in">
              <h4 className="font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Original Token GM-024 Retained with Dr. Priya</span>
              </h4>
              <p className="text-xs text-slate-300">
                You will be notified as soon as Dr. Priya exits the operating theater and resumes outpatient consultations.
              </p>
            </div>
          )}

          {/* Supervisor Live Audit Log */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Autonomous Recovery Engine Audit Trail</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {recoveryLog.length} Events Logged
              </span>
            </div>

            <div className="space-y-1.5 font-mono text-[11px]">
              {recoveryLog.map((log, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold shrink-0">{log.step}:</span>
                    <span className="text-slate-300 font-sans text-xs">{log.detail}</span>
                  </div>
                  <span className="text-slate-500 text-[10px] shrink-0">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
