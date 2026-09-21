import { ChevronRight, ArrowRight, Sparkles, ArrowLeft } from "lucide-react";

export type JourneyStage = {
  id: number;
  title: string;
  teluguTitle: string;
  status: "Completed" | "Active" | "Pending" | "Delayed" | "Cancelled";
  description: string;
  timestamp?: string;
  actionText?: string;
  actionType?: string;
};

interface PatientJourneyTrackerProps {
  onNavigateTab?: (tab: string) => void;
  onOpenPass?: () => void;
  onBack?: () => void;
  seniorMode?: boolean;
}

export default function PatientJourneyTracker({
  onNavigateTab,
  onOpenPass,
  onBack,
  seniorMode = false,
}: PatientJourneyTrackerProps) {
  const stages: JourneyStage[] = [
    {
      id: 1,
      title: "Patient Request",
      teluguTitle: "రోగి అభ్యర్థన",
      status: "Completed",
      description: "Patient Bhavishya requested consultation for stomach pain & general health checkup.",
      timestamp: "Today at 09:10 AM"
    },
    {
      id: 2,
      title: "Department Suggested",
      teluguTitle: "విభాగం సిఫార్సు",
      status: "Completed",
      description: "CareBridge AI evaluated symptoms and routed request to General Medicine (Non-diagnostic).",
      timestamp: "Today at 09:11 AM"
    },
    {
      id: 3,
      title: "Hospital Recommended",
      teluguTitle: "ఆసుపత్రి సిఫార్సు",
      status: "Completed",
      description: "Hospital B selected via SmartFlow Engine (Score: 80/100, 10 min lowest wait efficiency).",
      timestamp: "Today at 09:12 AM"
    },
    {
      id: 4,
      title: "Doctor Selected",
      teluguTitle: "డాక్టర్ ఎంపిక",
      status: "Completed",
      description: "Dr. Priya (General Medicine, 8 yrs exp) selected for 10:30 AM outpatient consultation.",
      timestamp: "Today at 09:13 AM"
    },
    {
      id: 5,
      title: "Appointment Confirmed",
      teluguTitle: "అపాయింట్‌మెంట్ ఖరారు",
      status: "Completed",
      description: "Patient Bhavishya reviewed summary and confirmed slot booking at Hospital B.",
      timestamp: "Today at 09:14 AM"
    },
    {
      id: 6,
      title: "Digital OPD Pass",
      teluguTitle: "డిజిటల్ ఓపీడీ పాస్",
      status: "Completed",
      description: "Electronic barcode pass & consultation slip generated (Confirmation: CB-2026-GM024).",
      timestamp: "Generated",
      actionText: "View OPD Pass",
      actionType: "opd_pass"
    },
    {
      id: 7,
      title: "Live Token Tracking",
      teluguTitle: "ప్రత్యక్ష టోకెన్ ట్రాకింగ్",
      status: "Active",
      description: "Token GM-024 is currently ALMOST YOUR TURN with 2 patients ahead (~10m wait in OPD-03).",
      timestamp: "Active Right Now",
      actionText: "Track Live Token",
      actionType: "token_tracker"
    },
    {
      id: 8,
      title: "Doctor Consultation",
      teluguTitle: "డాక్టర్ సంప్రదింపులు",
      status: "Pending",
      description: "In-person clinical evaluation with Dr. Priya in OPD-03.",
      timestamp: "Estimated 10:30 AM"
    },
    {
      id: 9,
      title: "Prescription",
      teluguTitle: "వైద్య చీటీ",
      status: "Pending",
      description: "Digital verified e-prescription with bilingual dosage timings.",
      timestamp: "Post Consultation"
    },
    {
      id: 10,
      title: "Follow-up Reminder",
      teluguTitle: "తదుపరి సందర్శన రిమైండర్",
      status: "Pending",
      description: "Automated SMS/WhatsApp follow-up reminder before medicine completes.",
      timestamp: "In 2 Weeks"
    }
  ];

  const getStatusBadge = (status: JourneyStage["status"]) => {
    switch (status) {
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-500/20 px-3 py-1 text-xs font-bold text-green-300 border border-green-500/40">
            <span>✓</span> Completed
          </span>
        );
      case "Active":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold text-blue-300 border border-blue-500/50 shadow-sm animate-pulse">
            <span className="h-2 w-2 rounded-full bg-blue-400 animate-ping" />
            <span>●</span> Active
          </span>
        );
      case "Delayed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/20 px-3 py-1 text-xs font-bold text-orange-300 border border-orange-500/40">
            <span>!</span> Delayed
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 px-3 py-1 text-xs font-bold text-rose-300 border border-rose-500/40">
            <span>✕</span> Cancelled
          </span>
        );
      case "Pending":
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-400 border border-slate-700">
            Pending
          </span>
        );
    }
  };

  return (
    <div className={`flex-1 bg-transparent text-slate-100 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-24 ${
      seniorMode ? "text-base" : "text-sm"
    }`}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Banner Header */}
        <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-slate-900/95 via-slate-950 to-indigo-950/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                {onBack && (
                  <button
                    onClick={onBack}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white flex items-center gap-1 transition cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back</span>
                  </button>
                )}
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  CAREBRIDGE AI • Intelligent Healthcare Coordination
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Complete 10-Stage Patient Journey
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                One seamless, connected hospital journey from clinical intake to consultation and digital follow-up care.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-xl bg-green-500/20 border border-green-500/40 text-green-300 text-xs font-bold font-mono">
                Patient: Bhavishya (PAT-1000)
              </span>
            </div>
          </div>

          {/* Quick Snapshot Highlight */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Assigned Doctor</span>
              <strong className="text-white text-sm">Dr. Priya</strong>
              <span className="text-[10px] text-cyan-300 block">General Medicine</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Hospital & Room</span>
              <strong className="text-white text-sm">Hospital B</strong>
              <span className="text-[10px] text-slate-400 block">Room OPD-03</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">OPD Token</span>
              <strong className="text-teal-400 text-sm font-mono font-black">GM-024</strong>
              <span className="text-[10px] text-amber-300 block">2 Ahead (~10m)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Stage Progress</span>
              <strong className="text-emerald-400 text-sm font-mono">7 of 10 Active</strong>
              <span className="text-[10px] text-green-400 block">70% Completed</span>
            </div>
          </div>
        </div>

        {/* 10-Stage Progression Timeline */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 sm:p-7 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            End-to-End Workflow Stages
          </h3>

          <div className="divide-y divide-slate-800/80">
            {stages.map((stage) => {
              const isCurrent = stage.status === "Active";
              return (
                <div
                  key={stage.id}
                  className={`py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition rounded-xl px-3 ${
                    isCurrent ? "bg-blue-950/30 border border-blue-500/30 shadow-md" : ""
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      stage.status === "Completed"
                        ? "bg-green-500/20 text-green-400 border border-green-500/40"
                        : stage.status === "Active"
                        ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                        : "bg-slate-800 text-slate-400"
                    }`}>
                      {stage.id}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">
                          {stage.title}
                        </h4>
                        <span className="text-[11px] text-slate-400">
                          • {stage.teluguTitle}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 max-w-xl">
                        {stage.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    {stage.actionText && (
                      <button
                        onClick={() => {
                          if (stage.actionType === "opd_pass" && onOpenPass) {
                            onOpenPass();
                          } else if (stage.actionType === "token_tracker" && onNavigateTab) {
                            onNavigateTab("token_tracker");
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                      >
                        <span>{stage.actionText}</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    )}

                    {getStatusBadge(stage.status)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Next Steps Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-950/30 via-slate-900 to-indigo-950/30 border border-teal-500/30 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-teal-400" />
              <span>Next Action in Workflow</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Token GM-024 is approaching in OPD-03. Keep your Live Token Tracker active to receive turn alerts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab("token_tracker")}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
              >
                <span>Open Live Token Tracker</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
