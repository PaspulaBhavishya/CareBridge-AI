import React, { useState } from 'react';
import { 
  Sliders, Award, Clock, MapPin, CheckCircle, Languages, 
  DollarSign, ArrowRight, Calendar 
} from 'lucide-react';

interface SmartFlowPanelProps {
  onSelectHospitalSlot?: (slot: any) => void;
  seniorMode?: boolean;
}

export const SmartFlowPanel: React.FC<SmartFlowPanelProps> = ({ onSelectHospitalSlot, seniorMode }) => {
  const [preferences, setPreferences] = useState({
    lowest_wait: true,
    nearest_hospital: false,
    telugu_speaking: true,
    female_doctor: false,
    budget_under_500: false,
    earliest_appointment: false,
    wheelchair_accessible: false
  });

  const [activeWhatIf, setActiveWhatIf] = useState<string>('lowest_wait');

  const togglePref = (key: keyof typeof preferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Dynamic what-if recommendations across all 6 competitive priorities
  const whatIfProfiles: Record<string, {
    hospital: string;
    doctor: string;
    time: string;
    wait: number;
    score: number;
    badge: string;
    reasons: string[];
  }> = {
    lowest_wait: {
      hospital: 'Hospital B (Metro Multi-Specialty)',
      doctor: 'Dr. Ananya Sen (Cardiology)',
      time: '10:30 AM Tomorrow',
      wait: 12,
      score: 91,
      badge: 'Lowest Wait Champion',
      reasons: [
        'Lowest waiting time: ~12m queue wait (vs 25m at Apex Hub).',
        'Available during selected time: 10:30 AM morning slot open.',
        'Matches Telugu preference: Trilingual nursing & support desk.',
        'Nearest hospital: 3.4 km via central metro connector corridor.'
      ]
    },
    nearest_hospital: {
      hospital: 'Hospital A (Apex Heart Hub)',
      doctor: 'Dr. Vikram Verma (Cardiology)',
      time: '10:00 AM Tomorrow',
      wait: 25,
      score: 82,
      badge: 'Closest Geographic Proximity',
      reasons: [
        'Closest hospital: 1.2 km (5 min drive from Banjara Hills).',
        'Direct ambulance corridor and metro-linked bus terminal.',
        'Slightly higher queue depth: ~25 mins due to city-center rush.',
        'Telugu speaking reception & nurse available.'
      ]
    },
    telugu_doctor: {
      hospital: 'Hospital B (Metro Health Center)',
      doctor: 'Dr. Anil Kumar (Cardiology)',
      time: '10:30 AM Tomorrow',
      wait: 15,
      score: 94,
      badge: 'Native Telugu Specialist',
      reasons: [
        'Native Telugu speaker: Full consultation & medication in Telugu (తెలుగు సంభాషణ).',
        'Lowest wait cardiology slot available: 15m waiting time.',
        'Comprehensive cardiac telemetry and ECHO diagnostics available on-site.',
        'OPD room: Room 204 (Ground Floor accessibility).'
      ]
    },
    under_500: {
      hospital: 'Hospital C (City Community Healthcare)',
      doctor: 'Dr. R. K. Sharma (General Medicine)',
      time: '11:00 AM Tomorrow',
      wait: 35,
      score: 88,
      badge: 'Affordable Care Choice',
      reasons: [
        'Consultation fee: ₹400 (under ₹500 budget cap).',
        'Subsidized lab packages for routine diabetic/cardiac profiles.',
        'Moderate wait time: ~35 mins queue due to community volume.',
        'Aarogyasri and government healthcare schemes accepted.'
      ]
    },
    earliest_slot: {
      hospital: 'Hospital A (Apex Heart Hub)',
      doctor: 'Dr. Priya Sharma (General Medicine)',
      time: '08:30 AM Tomorrow',
      wait: 5,
      score: 95,
      badge: 'Earliest Opening Slot',
      reasons: [
        'Earliest appointment: First morning opening slot of the day at 08:30 AM.',
        'Minimal queue: Near-zero waiting time at clinic opening (5 mins).',
        'Avoids peak outpatient rush hour delays.',
        'Confirmed slot in simulated schedule database.'
      ]
    },
    wheelchair: {
      hospital: 'Hospital B (Metro Multi-Specialty)',
      doctor: 'Dr. K. Srinivas (Orthopedics & Joint Care)',
      time: '10:00 AM Tomorrow',
      wait: 10,
      score: 94,
      badge: 'Wheelchair & Ramp Accessible',
      reasons: [
        'Wheelchair accessibility: Ground floor OPD consultation room with ramp & tactile guide.',
        'Dedicated accessibility assistance staff stationed at main triage entrance.',
        'Direct barrier-free elevator access to radiology and pharmacy counters.',
        'Low waiting time: 10 minutes priority consultation queue.'
      ]
    }
  };

  const currentProfile = whatIfProfiles[activeWhatIf] || whatIfProfiles['lowest_wait'];

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-5 shadow-xs text-slate-800 space-y-4 ${seniorMode ? 'text-lg' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
            <Sliders className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>SmartFlow 2.0 Decision Support Engine</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200">
                Formula: 0.5A + 0.3W + 0.2P
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Explainable multi-hospital routing customized to your personal care constraints
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic Preferences Bar (What-If Comparison) */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
          Optimize for (What-If Comparison):
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              togglePref('lowest_wait');
              setActiveWhatIf('lowest_wait');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              preferences.lowest_wait
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>[Lowest Waiting Time]</span>
          </button>

          <button
            onClick={() => {
              togglePref('nearest_hospital');
              setActiveWhatIf('nearest_hospital');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              preferences.nearest_hospital
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>[Nearest Hospital]</span>
          </button>

          <button
            onClick={() => {
              togglePref('telugu_speaking');
              setActiveWhatIf('telugu_doctor');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              preferences.telugu_speaking
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>[Telugu-Speaking Doctor]</span>
          </button>

          <button
            onClick={() => {
              togglePref('budget_under_500');
              setActiveWhatIf('under_500');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              preferences.budget_under_500
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>[Lowest Fee]</span>
          </button>

          <button
            onClick={() => {
              togglePref('earliest_appointment');
              setActiveWhatIf('earliest_slot');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              preferences.earliest_appointment
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>[Earliest Appointment]</span>
          </button>

          <button
            onClick={() => {
              togglePref('wheelchair_accessible');
              setActiveWhatIf('wheelchair');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              preferences.wheelchair_accessible
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>[Wheelchair-Accessible Hospital]</span>
          </button>
        </div>
      </div>

      {/* 'What-If' Simulation Output Card */}
      <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Optimal AI Pathway Result
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
              {currentProfile.badge}
            </span>
          </div>

          <span className="text-lg font-black font-mono text-blue-600">
            {currentProfile.score}% Match
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 shadow-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Recommended Hospital & Doctor</span>
            <h4 className="text-sm font-bold text-slate-900 mt-0.5">{currentProfile.hospital}</h4>
            <p className="text-xs text-slate-600">{currentProfile.doctor}</p>
          </div>
          <div className="sm:text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Slot Time & Queue Estimate</span>
            <div className="text-sm font-bold text-emerald-600 mt-0.5">{currentProfile.time}</div>
            <p className="text-xs text-amber-600 font-mono font-bold">Estimated Wait: ~{currentProfile.wait} mins</p>
          </div>
        </div>

        {/* Explainability Bullets */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
            Why recommended? (ఈ ఎంపిక ఎందుకు చేయబడింది):
          </span>
          <div className="space-y-1">
            {currentProfile.reasons.map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>{r}</span>
              </div>
            ))}
          </div>
        </div>

        {onSelectHospitalSlot && (
          <button
            onClick={() => onSelectHospitalSlot(currentProfile)}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
          >
            <span>Lock this Pathway in Chat</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
