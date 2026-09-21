import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, RotateCcw, 
  Wrench, AlertTriangle, Sparkles, Terminal
} from 'lucide-react';

interface ReplayStep {
  stepNumber: number;
  title: string;
  stageName: string;
  activeAgent: string;
  toolCall?: {
    tool: string;
    duration_ms: number;
    args: Record<string, any>;
    result: Record<string, any>;
  };
  explanation: string;
  explanation_te: string;
  systemState: Record<string, any>;
  isApprovalStep?: boolean;
}

const REPLAY_SCENARIOS = {
  booking: {
    title: "Scenario 1: Telugu Outpatient Booking with SmartFlow",
    userPrompt: "Naaku repu general medicine doctor appointment kavali, waiting time takkuva undali.",
    steps: [
      {
        stepNumber: 1,
        title: "Patient Natural Language Input",
        stageName: "User Request Ingestion",
        activeAgent: "Patient Communication Agent",
        explanation: "Received user request in mixed Telugu-English (Teluglish). Detected intent for outpatient booking tomorrow.",
        explanation_te: "రోగి నుండి తెలుగు-ఇంగ్లీష్ మిశ్రమ అభ్యర్థన అందింది. రేపటి కోసం అపాయింట్‌మెంట్ అవసరాన్ని గుర్తించింది.",
        systemState: {
          raw_text: "Naaku repu general medicine doctor appointment kavali, waiting time takkuva undali.",
          detected_language: "Telugu (Teluglish)",
          patient_name: "Bhavishya (PAT-1000)"
        }
      },
      {
        stepNumber: 2,
        title: "Intent & Clinical Triage Analysis",
        stageName: "Intent Classification",
        activeAgent: "Safety & Privacy Agent",
        explanation: "Scanned text for emergency red-flag keywords (chest pain, stroke, heavy bleeding). Confirmed zero red flags. Intent: APPOINTMENT_RECOMMENDATION.",
        explanation_te: "ఎమర్జెన్సీ లక్షణాలు లేవని నిర్ధారించుకుంది. సాధారణ ఓపీడీ సిఫార్సు వర్గంలోకి చేర్చింది.",
        systemState: {
          emergency_flag: false,
          detected_intent: "APPOINTMENT_RECOMMENDATION",
          safety_guardrail: "PASSED"
        }
      },
      {
        stepNumber: 3,
        title: "Constraint & Missing Information Extraction",
        stageName: "Constraint Analysis",
        activeAgent: "Supervisor Agent",
        explanation: "Identified required clinical department (General Medicine), requested time horizon (Tomorrow), and optimization goal (Low Waiting Time).",
        explanation_te: "విభాగం: జనరల్ మెడిసిన్, సమయం: రేపు, ప్రాధాన్యత: తక్కువ నిరీక్షణ సమయం.",
        systemState: {
          department: "General Medicine",
          date_target: "Tomorrow",
          optimization_preference: "LOW_WAIT_TIME",
          language_preference: "Telugu"
        }
      },
      {
        stepNumber: 4,
        title: "Configured Network Hospital Discovery & Roster Check",
        stageName: "Discrete Tool Calling (1/2)",
        activeAgent: "Hospital Coordination Agent",
        toolCall: {
          tool: "search_hospitals",
          duration_ms: 8.2,
          args: { department: "General Medicine", city: "Hyderabad" },
          result: {
            hospitals_found: 3,
            candidates: ["Hospital A (94% Surge)", "Hospital B (38% Normal)", "Hospital C (72% Crowd)"]
          }
        },
        explanation: "Invoked discrete healthcare administration tool 'search_hospitals()' querying configured prototype hospital database. Hospital A is currently experiencing a 94% queue surge.",
        explanation_te: "'search_hospitals()' టూల్ ద్వారా ప్రోటోటైప్ హాస్పిటల్ నెట్‌వర్క్ రద్దీని మరియు డాక్టర్ లభ్యతను తనిఖీ చేసింది.",
        systemState: {
          hospitals_scanned: 3,
          hospital_a_load: "94% (Surge)",
          hospital_b_load: "38% (Optimal)"
        }
      },
      {
        stepNumber: 5,
        title: "SmartFlow Multi-Objective Algorithm Execution",
        stageName: "Discrete Tool Calling (2/2)",
        activeAgent: "Scheduling Agent",
        toolCall: {
          tool: "rank_hospitals",
          duration_ms: 11.5,
          args: {
            department: "General Medicine",
            weights: { availability: 0.5, wait_efficiency: 0.3, preference: 0.2 },
            low_wait_priority: true
          },
          result: {
            top_hospital: "Hospital B (CareBridge Central)",
            recommended_doctor: "Dr. Priya",
            slot: "10:30 AM",
            simulated_wait_min: 10,
            smartflow_score: 80.0
          }
        },
        explanation: "Invoked 'rank_hospitals()' with dynamic multi-objective weights. Hospital B ranked highest (Score 80.0) with Dr. Priya (10 min est. wait vs 45 min at Hospital A).",
        explanation_te: "స్మార్ట్‌ఫ్లో అల్గోరిథం హాస్పిటల్ B ని అత్యుత్తమ ఎంపికగా సిఫార్సు చేసింది (స్కోర్ 80.0, 10 నిమిషాల వెయిటింగ్).",
        systemState: {
          recommended_doctor: "Dr. Priya",
          recommended_hospital: "Hospital B",
          recommended_slot: "10:30 AM",
          projected_wait: "10 mins"
        }
      },
      {
        stepNumber: 6,
        title: "Human-in-the-Loop Explicit Approval Card",
        stageName: "HITL Verification Check",
        activeAgent: "Supervisor Agent",
        isApprovalStep: true,
        explanation: "CareBridge AI plans and executes administrative actions after required user approval. Rendered explicit pre-booking card with Doctor, Hospital, Fee, Token Preview.",
        explanation_te: "CareBridge AI పని మొత్తాన్ని ప్లాన్ చేస్తుంది. కానీ sensitive actions, ఉదాహరణకు booking కోసం patient approval తీసుకున్న తర్వాతే execute చేస్తుంది.",
        systemState: {
          approval_required: true,
          approval_status: "PENDING_USER_CLICK",
          token_preview: "GM-024"
        }
      },
      {
        stepNumber: 7,
        title: "Patient Confirmation & Database Transaction",
        stageName: "Atomic Tool Execution",
        activeAgent: "Scheduling Agent",
        toolCall: {
          tool: "create_appointment",
          duration_ms: 14.1,
          args: {
            patient_id: 1,
            doctor_name: "Dr. Priya",
            hospital_name: "Hospital B",
            slot_time: "10:30 AM",
            token_number: "GM-024"
          },
          result: {
            success: true,
            confirmation_code: "CB-2026-GM024",
            token_number: "GM-024",
            current_serving_token: "GM-022",
            patients_ahead: 2
          }
        },
        explanation: "User clicked [Approve Booking]. Invoked discrete tool 'create_appointment()' in an atomic transaction with immutable audit logging.",
        explanation_te: "రోగి బుకింగ్‌ను ఆమోదించారు. 'create_appointment()' టూల్ ద్వారా డేటాబేస్‌లో టోకెన్ GM-024 నమోదు చేయబడింది.",
        systemState: {
          confirmation_code: "CB-2026-GM024",
          assigned_token: "GM-024",
          status: "CONFIRMED"
        }
      },
      {
        stepNumber: 8,
        title: "Digital Pass Generation & Live Token Alert",
        stageName: "Workflow Completed",
        activeAgent: "Notification Agent",
        toolCall: {
          tool: "generate_opd_pass",
          duration_ms: 6.4,
          args: { confirmation_code: "CB-2026-GM024", format: "DIGITAL_OPD_PASS_V2" },
          result: { pass_ready: true, sms_alert_dispatched: true }
        },
        explanation: "Generated Digital OPD Pass with QR code, Room OPD-03 directions, and armed Proximity Alert (chime when 2 tokens remain).",
        explanation_te: "డిజిటల్ ఓపీడీ పాస్ రూపొందించబడింది. 2 టోకెన్ల దూరంలో ఉన్నప్పుడు హెచ్చరిక వచ్చేలా అలర్ట్ సెట్ చేయబడింది.",
        systemState: {
          digital_pass_active: true,
          proximity_alert_armed: true,
          patients_ahead: 2
        }
      }
    ] as ReplayStep[]
  }
};

export const AgentSessionReplay: React.FC<{ seniorMode?: boolean }> = ({ seniorMode = false }) => {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const scenario = REPLAY_SCENARIOS.booking;
  const currentStep = scenario.steps[activeStepIndex];

  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setActiveStepIndex(prev => {
          if (prev >= scenario.steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 3000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, scenario.steps.length]);

  return (
    <div className={`space-y-6 max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 text-slate-100 pb-20 ${
      seniorMode ? 'text-base' : 'text-sm'
    }`}>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>International Competition Judge Inspector</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
              Step {activeStepIndex + 1} of {scenario.steps.length}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Approval-Aware Agent Session Replay
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            Scrub through each discrete step of CareBridge AI: from request understanding to discrete tool calling,
            explainable reasoning, human-in-the-loop approval, and atomic pass dispatch.
          </p>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => { setActiveStepIndex(0); setIsPlaying(false); }}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            title="Rewind to Start"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setActiveStepIndex(prev => Math.max(0, prev - 1));
              setIsPlaying(false);
            }}
            disabled={activeStepIndex === 0}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition cursor-pointer"
            title="Previous Step"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/30 transition cursor-pointer"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'Pause Auto-Play' : 'Play Replay'}</span>
          </button>
          <button
            onClick={() => {
              setActiveStepIndex(prev => Math.min(scenario.steps.length - 1, prev + 1));
              setIsPlaying(false);
            }}
            disabled={activeStepIndex === scenario.steps.length - 1}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition cursor-pointer"
            title="Next Step"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Prompt Banner */}
      <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
            Target User Goal Under Inspection:
          </span>
          <p className="font-mono text-sm text-white font-semibold">
            "{scenario.userPrompt}"
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-[11px] font-mono">
          Patient: Bhavishya • Language: Telugu
        </span>
      </div>

      {/* Scrubber Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Stage 1: Intent & Planning</span>
          <span>Stage 4: Discrete Tools</span>
          <span>Stage 6: HITL Approval</span>
          <span>Stage 8: Token #GM-024</span>
        </div>

        <div className="grid grid-cols-8 gap-1.5">
          {scenario.steps.map((step, idx) => {
            const isCompleted = idx < activeStepIndex;
            const isCurrent = idx === activeStepIndex;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => { setActiveStepIndex(idx); setIsPlaying(false); }}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-cyan-400 ring-2 ring-cyan-400/50 shadow-md shadow-cyan-400/50 scale-105'
                    : isCompleted
                    ? 'bg-emerald-500'
                    : 'bg-slate-800 hover:bg-slate-700'
                }`}
                title={`Step ${idx + 1}: ${step.title}`}
              />
            );
          })}
        </div>
      </div>

      {/* Active Step Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
        {/* Left 2 Cols: Step Overview & Explainability */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 font-mono font-bold">
                  {currentStep.stepNumber}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                    {currentStep.stageName}
                  </span>
                  <h3 className="text-lg font-bold text-white">
                    {currentStep.title}
                  </h3>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                {currentStep.activeAgent}
              </span>
            </div>

            {/* English & Telugu Explainability Box */}
            <div className="space-y-2 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Step Rationale (English):
                </span>
                <p className="text-slate-200 leading-relaxed">
                  {currentStep.explanation}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block">
                  వివరణ (Telugu):
                </span>
                <p className="text-teal-200/90 leading-relaxed">
                  {currentStep.explanation_te}
                </p>
              </div>
            </div>

            {/* If discrete tool call occurred */}
            {currentStep.toolCall && (
              <div className="p-4 rounded-2xl bg-black/50 border border-cyan-500/30 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold">
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Tool Invocation: {currentStep.toolCall.tool}()</span>
                  </div>
                  <span className="text-amber-300 text-[11px]">
                    Latency: {currentStep.toolCall.duration_ms}ms
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-slate-500 block mb-1">Arguments:</span>
                    <pre className="p-2 rounded bg-slate-950 text-cyan-200 overflow-x-auto text-[10px]">
                      {JSON.stringify(currentStep.toolCall.args, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Result:</span>
                    <pre className="p-2 rounded bg-slate-950 text-emerald-300 overflow-x-auto text-[10px]">
                      {JSON.stringify(currentStep.toolCall.result, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* If HITL approval step */}
            {currentStep.isApprovalStep && (
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/60 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Human-in-the-Loop Safe Guardrail Triggered</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Under CareBridge AI safety protocol, no database slot reservations or payments may be executed autonomously.
                  The user must explicitly verify the booking details before confirmation.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Live State Inspector */}
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-3 shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5 text-xs text-white font-bold uppercase tracking-wider">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Agent State & Context Inspector</span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              {Object.entries(currentStep.systemState).map(([key, val]) => (
                <div key={key} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-0.5">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                    {key.replace(/_/g, ' ')}
                  </span>
                  <strong className="text-cyan-300 text-xs break-all">
                    {typeof val === 'boolean' ? (val ? 'TRUE' : 'FALSE') : String(val)}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
