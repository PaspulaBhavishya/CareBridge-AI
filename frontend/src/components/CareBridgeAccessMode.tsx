import React from 'react';
import { 
  HeartHandshake, Smartphone, Printer, Mic, 
  Tv, Sparkles, ArrowRight, ShieldCheck
} from 'lucide-react';

interface CareBridgeAccessModeProps {
  onNavigateToTab: (tab: string) => void;
  seniorMode: boolean;
  onToggleSeniorMode: () => void;
  onSelectTeluguPatient: () => void;
}

export const CareBridgeAccessMode: React.FC<CareBridgeAccessModeProps> = ({
  onNavigateToTab,
  seniorMode,
  onToggleSeniorMode,
  onSelectTeluguPatient
}) => {
  const pillars = [
    {
      id: 'kiosk',
      title: '15-Second Walk-In Kiosk',
      teluguTitle: '15 సెకన్ల వాక్-ఇన్ కియోస్క్',
      icon: <Printer className="h-6 w-6 text-cyan-400" />,
      color: 'from-cyan-950/60 to-slate-900 border-cyan-500/30',
      badge: 'Zero App Install',
      description: 'Physical touch kiosk at OPD entrance generates thermal queue slips with room numbers in 15 seconds without requiring a smartphone or password.',
      actionLabel: 'Launch 15-Sec Kiosk',
      actionTab: 'kiosk'
    },
    {
      id: 'telugu',
      title: 'Telugu Vernacular Voice AI',
      teluguTitle: 'తెలుగు వాయిస్ అసిస్టెంట్',
      icon: <Mic className="h-6 w-6 text-emerald-400" />,
      color: 'from-emerald-950/60 to-slate-900 border-emerald-500/30',
      badge: 'Native Dialects',
      description: 'Full Telugu speech recognition and conversational booking designed for non-English speakers and rural patients ("నాకు గుండె నొప్పిగా ఉంది, డాక్టర్‌ను కలవాలి").',
      actionLabel: 'Switch to Telugu Patient',
      onClick: onSelectTeluguPatient
    },
    {
      id: 'senior',
      title: 'Senior Citizen Easy Mode',
      teluguTitle: 'సీనియర్ సిటిజన్ సులభ మోడ్',
      icon: <HeartHandshake className="h-6 w-6 text-amber-400" />,
      color: 'from-amber-950/60 to-slate-900 border-amber-500/30',
      badge: 'High Contrast & Chimes',
      description: 'Ultra-large text, high-contrast visual cues, and melodic audio chimes designed for elderly patients with low digital literacy or visual fatigue.',
      actionLabel: seniorMode ? 'Senior Mode Active (Disable)' : 'Enable Senior Easy Mode',
      onClick: onToggleSeniorMode
    },
    {
      id: 'tv',
      title: 'Waiting Hall TV & Audio Chime',
      teluguTitle: 'ఓపీడీ వెయిటింగ్ హాల్ టీవీ స్క్రీన్',
      icon: <Tv className="h-6 w-6 text-blue-400" />,
      color: 'from-blue-950/60 to-slate-900 border-blue-500/30',
      badge: 'Dual-Language Audio',
      description: 'Public waiting hall overhead TV display broadcasting dual-language announcements ("Token #14, Room 204") so patients never miss their turn.',
      actionLabel: 'Open Waiting Hall TV',
      actionTab: 'tv'
    }
  ];

  const journeySteps = [
    { step: '1', title: 'Arrival at Hospital', desc: 'Patient arrives at OPD without smartphone or internet.' },
    { step: '2', title: '15-Sec Kiosk / Voice', desc: 'Taps department on touchscreen or speaks in Telugu.' },
    { step: '3', title: 'Printed Thermal Pass', desc: 'Instant slip with token number, doctor, and room guidance.' },
    { step: '4', title: 'Overhead TV & Chime', desc: 'Waiting hall TV announces token in Telugu and English.' },
    { step: '5', title: 'Consultation Complete', desc: 'Doctor conducts visit; digital record securely updated.' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-cyan-950/80 border border-emerald-500/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <Smartphone className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 tracking-wider">
                Priority 3 Innovation
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                CareBridge Access Mode — No Smartphone Required
              </h2>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Healthcare access must be truly universal. CareBridge AI unifies physical lobby kiosks, native Telugu voice AI, 
            senior citizen accessibility, staff counters, and overhead waiting hall TV broadcasts into one cohesive low-bandwidth infrastructure.
          </p>
        </div>

        {/* Stats Pill */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 text-right space-y-1">
          <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
            Inclusive Adoption Rate
          </span>
          <div className="text-2xl font-black text-white">
            42.8%
          </div>
          <span className="text-[11px] text-slate-400 block">
            Patients served without smartphones
          </span>
        </div>
      </div>

      {/* 4 Interlinked Accessibility Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pillars.map((p) => (
          <div
            key={p.id}
            className={`p-5 rounded-2xl bg-gradient-to-br ${p.color} border shadow-lg flex flex-col justify-between space-y-4`}
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-white/10 border border-white/15">
                  {p.icon}
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-slate-200 border border-white/20">
                  {p.badge}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">{p.title}</h3>
                <span className="text-xs text-emerald-300 font-medium">{p.teluguTitle}</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {p.description}
              </p>
            </div>

            <div className="pt-2 border-t border-white/10">
              <button
                onClick={() => {
                  if (p.actionTab) onNavigateToTab(p.actionTab);
                  else if (p.onClick) p.onClick();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
              >
                <span>{p.actionLabel}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Inclusive Patient Journey Step-Through */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Cohesive Low-Tech Patient Journey Flow
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {journeySteps.map((s, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 relative flex flex-col justify-between"
            >
              <div className="space-y-1">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-xs font-bold font-mono">
                  {s.step}
                </span>
                <h4 className="text-xs font-bold text-slate-200 mt-2">{s.title}</h4>
                <p className="text-[11px] text-slate-400 leading-snug">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust & Non-Medical Assistance Disclaimer */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3 text-xs text-slate-400">
        <ShieldCheck className="h-5 w-5 text-emerald-400 flex-shrink-0" />
        <span>
          CareBridge Access Mode is engineered to bridge the digital divide. For severe trauma, chest pain, or respiratory failure, staff are trained to initiate Emergency SOS and alert the emergency team immediately.
        </span>
      </div>
    </div>
  );
};
