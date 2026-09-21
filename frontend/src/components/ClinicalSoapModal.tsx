import React from 'react';
import { Activity, X, Stethoscope } from 'lucide-react';

interface Props {
  patientName: string;
  doctorName: string;
  tokenNumber: number;
  onClose: () => void;
  onStartConsultation?: () => void;
  seniorMode?: boolean;
}

export const ClinicalSoapModal: React.FC<Props> = ({
  patientName,
  doctorName,
  tokenNumber,
  onClose,
  onStartConsultation,
  seniorMode
}) => {
  const vitals = [
    { label: 'Blood Pressure', value: '130/85 mmHg', status: 'Borderline', color: 'text-amber-600 bg-amber-50' },
    { label: 'Heart Rate', value: '76 bpm', status: 'Normal', color: 'text-emerald-600 bg-emerald-50' },
    { label: 'SpO2 Oxygen', value: '98%', status: 'Normal', color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Temperature', value: '98.4 °F', status: 'Afebrile', color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Blood Sugar (FBS)', value: '158 mg/dL', status: 'Elevated', color: 'text-rose-600 bg-rose-50' }
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-fadeIn ${seniorMode ? 'text-lg' : ''}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 flex items-center justify-center border border-blue-400/30">
              <Activity className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">AI Administrative Pre-Consultation Summary</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Token #{tokenNumber}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Patient: <strong className="text-white">{patientName}</strong> • Attending: <strong className="text-white">{doctorName}</strong>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Clinical Decision Support Disclaimer Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center gap-2.5 text-amber-900 text-xs">
          <span className="font-extrabold uppercase text-[10px] tracking-wider px-2 py-0.5 bg-amber-200 text-amber-950 rounded">
            Clinical Draft
          </span>
          <span className="text-[11px] leading-snug">
            AI-generated pre-consultation summary and clinical decision-support draft, subject to doctor review. AI is not a doctor; final diagnosis and prescription require doctor approval.
          </span>
        </div>

        {/* Body: 4 Sections */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Quick Vitals Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {vitals.map((v, i) => (
              <div key={i} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-center">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{v.label}</div>
                <div className="text-sm font-extrabold text-slate-900 my-0.5">{v.value}</div>
                <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold ${v.color}`}>
                  {v.status}
                </span>
              </div>
            ))}
          </div>

          {/* S - Subjective */}
          <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/40 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-900">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">S</span>
              <span>Patient-Reported Concerns (రోగి తెలిపిన లక్షణాలు)</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              • <strong>Chief Complaint:</strong> Mild chest tightness on climbing stairs, recurrent fatigue in evening, and occasional dizziness.
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              • <strong>Patient Statement (Telugu):</strong> "కొన్ని రోజులుగా మెట్లు ఎక్కినప్పుడు గుండెల్లో ఆయాసం, సాయంత్రం వేళ నీరసం వస్తోంది."
            </p>
            <p className="text-[11px] text-slate-500">
              • <strong>Prior Intake History:</strong> Known hypertension for 3 years on medication (Telmisartan 40mg). No documented drug allergies.
            </p>
          </div>

          {/* O - Objective */}
          <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-900">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">O</span>
              <span>Intake Vitals & Extracted Metrics (కొలతలు & ల్యాబ్ రీడింగ్స్)</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              • <strong>Triage Nurse Vitals:</strong> BP 130/85 mmHg, Pulse 76 bpm, SpO2 98%, Temp 98.4°F.
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              • <strong>Extracted Lab Values (OCR):</strong> Fasting Glucose: 158 mg/dL (Elevated), HbA1c: 8.4% (Elevated), Total Cholesterol: 212 mg/dL. Renal profile within normal bounds.
            </p>
          </div>

          {/* A - Intake Synthesis & Missing Data Check */}
          <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/40 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-900">
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">A</span>
              <span>Intake Synthesis & Missing Information Check (ముందస్తు పరిశీలన & పూర్తి చేయాల్సిన వివరాలు)</span>
            </div>
            <p className="text-xs text-slate-800 leading-relaxed font-medium">
              • <strong>Administrative Observation:</strong> Patient presents with concurrent metabolic elevation (HbA1c 8.4%) and exertional discomfort.
            </p>
            <p className="text-xs text-amber-800">
              • <strong>Missing / To-Confirm Data:</strong> 1) Exact timing & regularity of daily Telmisartan dosage; 2) Duration of exertional chest discomfort episodes; 3) Family history of early cardiac events.
            </p>
          </div>

          {/* P - Suggested Intake Questions for Clinician */}
          <div className="p-4 rounded-xl border border-purple-100 bg-purple-50/40 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-purple-900">
              <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">P</span>
              <span>Suggested Intake Questions for Attending Clinician (వైద్యుల కోసం సూచనాత్మక ప్రశ్నలు)</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              1. <em>"When you feel the chest tightness, does it radiate to your left arm or neck, and does resting relieve it?"</em>
            </p>
            <p className="text-xs text-slate-700 leading-relaxed">
              2. <em>"Are you experiencing frequent thirst or increased urination at night with the recent blood glucose readings?"</em>
            </p>
            <p className="text-xs text-slate-700 leading-relaxed">
              3. <em>"Have you had an ECG or cardiac check within the last 12 months?"</em>
            </p>
            <p className="text-xs text-purple-900 font-semibold">
              Note: Clinical care plan and Rx to be formulated following physical examination.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            CareBridge AI Administrative Intake Summary • Triage Assistant
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 text-xs font-bold"
            >
              Close
            </button>
            {onStartConsultation && (
              <button
                onClick={() => {
                  onStartConsultation();
                  onClose();
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-transform active:scale-95"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Begin Consultation with Patient</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
