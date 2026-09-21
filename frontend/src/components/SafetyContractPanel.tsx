import { ShieldCheck, Check, X, Info } from 'lucide-react';

interface SafetyContractPanelProps {
  onClose?: () => void;
  inline?: boolean;
}

export const SafetyContractPanel: React.FC<SafetyContractPanelProps> = ({
  onClose,
  inline = false
}) => {
  const capabilities = [
    {
      title: "Coordinate Hospital Administration",
      detail: "Manages OPD queue states, doctor availability schedules, and administrative multi-hospital load balancing."
    },
    {
      title: "Recommend Appointment Options",
      detail: "Uses explainable SmartFlow scoring based on availability, wait efficiency, and patient preferences."
    },
    {
      title: "Execute Approved Actions",
      detail: "Plans and executes booking, rescheduling, and cancellation only after explicit human-in-the-loop approval."
    },
    {
      title: "Generate Prototype OPD Passes & Track Tokens",
      detail: "Issues digital OPD pass codes with live queue depth calculation and simulated SMS/WhatsApp alerts."
    },
    {
      title: "Answer Grounded Hospital Policy Questions",
      detail: "Retrieves verifiable hospital guidelines with exact operational citations and reception desk fallbacks."
    }
  ];

  const limitations = [
    {
      title: "Diagnose Medical Conditions or Diseases",
      detail: "AI is strictly a administrative assistant and does not provide clinical diagnosis or medical evaluation."
    },
    {
      title: "Prescribe Medications Independently",
      detail: "E-prescriptions and medication adjustments must always be created, reviewed, and signed by a certified doctor."
    },
    {
      title: "Access Unauthorized Patient Records",
      detail: "Strict prototype Role-Based Access Control (RBAC) blocks patient accounts from viewing other patients' files."
    },
    {
      title: "Dispatch Real Municipal Emergency Ambulances",
      detail: "Emergency flows offer simulated guidance only; patients with acute symptoms are instructed to dial 108/112."
    },
    {
      title: "Book Sensitive Slots Without Approval",
      detail: "Zero autonomous database commits for financial or booking actions without patient confirmation."
    },
    {
      title: "Invent or Hallucinate Hospital Policies",
      detail: "Policy answers are strictly grounded in configured hospital guideline documents."
    }
  ];

  const content = (
    <div className="space-y-5 text-slate-100">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                CareBridge AI Safety Contract
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Ethical Boundary
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Defines clear operational capabilities and strict safety boundaries for judges and patients.
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Grid: What Agent CAN do vs What Agent CANNOT do */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CAN DO COLUMN */}
        <div className="p-4 rounded-2xl bg-emerald-950/25 border border-emerald-500/40 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider border-b border-emerald-500/20 pb-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>What the Agent Can Do (అనుమతించబడిన పనులు)</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {capabilities.map((cap, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 flex items-center justify-center text-[10px] font-bold mt-0.5 flex-shrink-0">
                  ✓
                </div>
                <div>
                  <strong className="text-white block">{cap.title}</strong>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{cap.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CANNOT DO COLUMN */}
        <div className="p-4 rounded-2xl bg-rose-950/25 border border-rose-500/40 space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider border-b border-rose-500/20 pb-2">
            <X className="w-4 h-4 text-rose-400" />
            <span>What the Agent Cannot Do (నిషేధించబడిన సరిహద్దులు)</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {limitations.map((lim, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-rose-500/20 border border-rose-400/50 text-rose-300 flex items-center justify-center text-[10px] font-bold mt-0.5 flex-shrink-0">
                  ✗
                </div>
                <div>
                  <strong className="text-white block">{lim.title}</strong>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{lim.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Banner */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-cyan-300">Prototype Transparency Statement:</strong> All hospital records, doctors, slots, and token values are simulated prototype data. This project demonstrates healthcare administrative workflow execution and does not substitute professional medical care.
        </div>
      </div>
    </div>
  );

  if (inline) {
    return <div className="p-4 sm:p-6 rounded-3xl bg-slate-950 border border-slate-800">{content}</div>;
  }

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {content}
      </div>
    </div>
  );
};
