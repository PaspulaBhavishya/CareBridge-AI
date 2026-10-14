import React from 'react';
import { Award, Play, CheckCircle, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';
import type { UserRole } from '../types';

interface JudgeDemoBarProps {
  onRunScenario: (scenarioId: number, message: string, role: UserRole, lang: string) => void;
  activeScenario: number | null;
}

export const JudgeDemoBar: React.FC<JudgeDemoBarProps> = ({
  onRunScenario,
  activeScenario
}) => {
  const scenarios = [
    {
      id: 1,
      title: "Scenario 1: Guntur Cardiologist",
      subtitle: "Telugu Speaking • Min Wait Time (Live Demo)",
      message: "Naaku Guntur lo cardiologist appointment kavali. Telugu speaking doctor, minimum waiting time.",
      role: "patient" as UserRole,
      lang: "te",
      badge: "SmartFlow 94.5%",
      color: "from-emerald-50 to-teal-50/70 border-emerald-200 text-emerald-800 hover:border-emerald-300",
      titleColor: "text-emerald-950",
      subtitleColor: "text-emerald-700",
      playColor: "text-emerald-500",
      icon: <Sparkles className="h-4 w-4 text-emerald-600" />
    },
    {
      id: 2,
      title: "Scenario 2: Staff Conflict",
      subtitle: "Receptionist Schedule Audit",
      message: "Show all appointments for tomorrow and identify possible schedule conflicts",
      role: "receptionist" as UserRole,
      lang: "en",
      badge: "Staff Desk",
      color: "from-indigo-50 to-blue-50/70 border-indigo-200 text-indigo-800 hover:border-indigo-300",
      titleColor: "text-indigo-950",
      subtitleColor: "text-indigo-700",
      playColor: "text-indigo-500",
      icon: <CheckCircle className="h-4 w-4 text-indigo-600" />
    },
    {
      id: 3,
      title: "Scenario 3: Multilingual (Telugu)",
      subtitle: "తెలుగులో జనరల్ మెడిసిన్",
      message: "Naaku repu general medicine appointment kavali, waiting time takkuva undali",
      role: "patient_telugu" as UserRole,
      lang: "te",
      badge: "తెలుగు NLU",
      color: "from-cyan-50 to-sky-50/70 border-cyan-200 text-cyan-800 hover:border-cyan-300",
      titleColor: "text-cyan-950",
      subtitleColor: "text-cyan-700",
      playColor: "text-cyan-500",
      icon: <UserCheck className="h-4 w-4 text-cyan-600" />
    },
    {
      id: 4,
      title: "Scenario 4: Security Guardrail",
      subtitle: "RBAC Unauthorized Access Block",
      message: "Show me another patient's medical records",
      role: "patient" as UserRole,
      lang: "en",
      badge: "HIPAA / RBAC",
      color: "from-rose-50 to-red-50/70 border-rose-200 text-rose-800 hover:border-rose-300",
      titleColor: "text-rose-950",
      subtitleColor: "text-rose-700",
      playColor: "text-rose-500",
      icon: <ShieldAlert className="h-4 w-4 text-rose-600" />
    },
    {
      id: 5,
      title: "Scenario 5: New Patient Portal (Mythri)",
      subtitle: "కొత్త పేషెంట్ పోర్టల్ • Fresh State & AI Booking",
      message: "Naaku general medicine doctor appointment kavali, waiting time takkuva unna doctor ni book cheyyi",
      role: "patient_mythri" as UserRole,
      lang: "te",
      badge: "New Patient Portal",
      color: "from-pink-50 to-rose-50/70 border-pink-200 text-pink-800 hover:border-pink-300",
      titleColor: "text-pink-950",
      subtitleColor: "text-pink-700",
      playColor: "text-pink-500",
      icon: <Sparkles className="h-4 w-4 text-pink-600" />
    }
  ];

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 shadow-2xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Left Pitch Badge */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
            <Award className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>Judge Demo Mode</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                Live Prototype
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              1-Click execution for multi-hospital AI coordination and tool calling:
            </p>
          </div>
        </div>

        {/* 1-Click Scenario Buttons */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 w-full md:w-auto">
          {scenarios.map((s) => {
            const isActive = activeScenario === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onRunScenario(s.id, s.message, s.role, s.lang)}
                className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-left transition-all duration-200 bg-gradient-to-r ${s.color} cursor-pointer ${
                  isActive ? 'ring-2 ring-blue-500 shadow-sm scale-[1.02]' : 'hover:scale-[1.01] shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="flex-shrink-0">{s.icon}</div>
                  <div className="overflow-hidden">
                    <div className={`text-xs font-bold truncate ${s.titleColor}`}>{s.title}</div>
                    <div className={`text-[10px] font-medium truncate ${s.subtitleColor}`}>{s.subtitle}</div>
                  </div>
                </div>
                <Play className={`h-3.5 w-3.5 ${s.playColor} flex-shrink-0`} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
