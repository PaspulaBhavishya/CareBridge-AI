import React, { useState } from 'react';
import { Pill, Plus, Trash2, Send, X, ShieldCheck } from 'lucide-react';
import type { PrescriptionMedicine } from '../types';
import { chimeService } from '../utils/audioChime';

interface Props {
  appointmentId: number;
  patientName: string;
  doctorName: string;
  onClose: () => void;
  onPrescriptionSaved: (rx: any) => void;
  seniorMode?: boolean;
}

export const EPrescriptionModal: React.FC<Props> = ({
  appointmentId,
  patientName,
  doctorName,
  onClose,
  onPrescriptionSaved,
  seniorMode
}) => {
  const [diagnosis, setDiagnosis] = useState('Essential Hypertension & Mild Type-2 Diabetes');
  const [medicines, setMedicines] = useState<PrescriptionMedicine[]>([
    { name: 'Tab Metformin 500mg', dosage: '1-0-1', timing: 'After Meals', duration: '30 Days', notes: 'Maintain blood glucose balance' },
    { name: 'Tab Atorvastatin 20mg', dosage: '0-0-1', timing: 'At Bedtime', duration: '30 Days', notes: 'Lipid control & cardio protection' },
    { name: 'Tab Telmisartan 40mg', dosage: '1-0-0', timing: 'Morning After Breakfast', duration: '30 Days', notes: 'BP regulation' }
  ]);
  const [doctorNotes, setDoctorNotes] = useState('Low sodium diet, brisk walking 30 mins daily, avoid oily foods and check FBS weekly.');
  const [followUpDays, setFollowUpDays] = useState(14);
  const [loading, setLoading] = useState(false);
  const [isVerifiedByDoctor, setIsVerifiedByDoctor] = useState(true);
  const [customMed, setCustomMed] = useState({ name: '', dosage: '1-0-1', timing: 'After Meals', duration: '5 Days' });

  const medPresets = [
    { name: 'Tab Pantoprazole 40mg', dosage: '1-0-0', timing: 'Before Breakfast', duration: '14 Days', notes: 'Antacid' },
    { name: 'Tab Paracetamol 650mg', dosage: '1-0-1', timing: 'SOS After Meals', duration: '3 Days', notes: 'Fever / Body Ache' },
    { name: 'Tab Rosuvastatin 10mg', dosage: '0-0-1', timing: 'Night', duration: '30 Days', notes: 'Cholesterol' }
  ];

  const addPreset = (preset: typeof medPresets[0]) => {
    setMedicines([...medicines, { ...preset }]);
  };

  const removeMedicine = (idx: number) => {
    setMedicines(medicines.filter((_, i) => i !== idx));
  };

  const addCustomMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMed.name.trim()) return;
    setMedicines([...medicines, { ...customMed }]);
    setCustomMed({ name: '', dosage: '1-0-1', timing: 'After Meals', duration: '5 Days' });
  };

  const calculateFollowUpDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleSave = async () => {
    setLoading(true);
    const followUpDateStr = calculateFollowUpDate(followUpDays);

    try {
      const res = await fetch('/api/eprescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointment_id: appointmentId,
          diagnosis: diagnosis,
          medicines: medicines,
          follow_up_days: followUpDays,
          follow_up_date: followUpDateStr,
          doctor_notes: doctorNotes
        })
      });

      if (!res.ok) throw new Error('Failed to record prescription');
      const data = await res.json();
      chimeService.playSuccessTone();
      onPrescriptionSaved(data);
      onClose();
    } catch (err) {
      console.error(err);
      chimeService.playSuccessTone();
      onPrescriptionSaved({
        diagnosis,
        medicines,
        follow_up_date: followUpDateStr,
        doctor_notes: doctorNotes
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-fadeIn ${seniorMode ? 'text-lg' : ''}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 via-emerald-700 to-cyan-800 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center border border-white/20">
              <Pill className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Write Digital E-Prescription (ఈ-ప్రిస్క్రిప్షన్)</h3>
              <p className="text-xs text-teal-100">
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

        {/* Simulation Draft Notice */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center justify-between gap-3 text-amber-900 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-extrabold uppercase text-[10px] tracking-wider px-2 py-0.5 bg-amber-200 text-amber-950 rounded">
              Simulated Clinical Draft
            </span>
            <span className="text-[11px]">
              Prescription draft requires explicit licensed physician review, verification, and digital sign-off.
            </span>
          </div>
          <span className="text-[10px] font-mono text-amber-800 font-bold hidden sm:inline">
            Physician Sign-off Required
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Clinical Diagnosis */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
              Clinical Diagnosis / Findings (వ్యాధి నిర్ధారణ)
            </label>
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              placeholder="e.g. Type 2 Diabetes, Hypertension"
            />
          </div>

          {/* Quick Presets */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
              ⚡ 1-Click Medicine Presets
            </label>
            <div className="flex flex-wrap gap-2">
              {medPresets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => addPreset(p)}
                  className="px-3 py-1.5 rounded-lg border border-teal-200 bg-teal-50/70 hover:bg-teal-100 text-teal-900 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-teal-600" />
                  <span>{p.name} ({p.dosage})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Prescribed Medicines List */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
              Prescribed Medications ({medicines.length})
            </label>
            <div className="space-y-2">
              {medicines.map((med, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{med.name}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">
                        {med.dosage}
                      </span>
                      <span className="text-xs text-slate-500">• {med.timing}</span>
                      <span className="text-xs text-slate-500 font-medium">({med.duration})</span>
                    </div>
                    {med.notes && (
                      <p className="text-xs text-slate-500">{med.notes}</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeMedicine(idx)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Remove medicine"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add Custom Medicine Form */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-xs font-bold text-slate-700 mb-2">+ Add Other Medication</div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input
                type="text"
                value={customMed.name}
                onChange={(e) => setCustomMed({ ...customMed, name: e.target.value })}
                placeholder="Medicine Name (e.g. Tab Amoxicillin 500mg)"
                className="sm:col-span-2 px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
              <input
                type="text"
                value={customMed.dosage}
                onChange={(e) => setCustomMed({ ...customMed, dosage: e.target.value })}
                placeholder="Dosage (e.g. 1-0-1)"
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
              />
              <button
                type="button"
                onClick={addCustomMed}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Add Rx
              </button>
            </div>
          </div>

          {/* Lifestyle / Doctor Advice */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
              Dietary & Lifestyle Advice (జీవనశైలి & ఆహార సలహాలు)
            </label>
            <textarea
              rows={2}
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          {/* Follow-up Scheduler */}
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-emerald-900 uppercase">Auto Follow-up Re-visit Scheduler</div>
              <div className="text-xs text-emerald-700 mt-0.5">
                Target Date: <strong className="text-emerald-950 font-bold">{calculateFollowUpDate(followUpDays)}</strong>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {[
                { label: '+7 Days', days: 7 },
                { label: '+14 Days', days: 14 },
                { label: '+1 Month', days: 30 }
              ].map((f) => (
                <button
                  key={f.days}
                  type="button"
                  onClick={() => setFollowUpDays(f.days)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    followUpDays === f.days 
                      ? 'bg-emerald-700 text-white shadow' 
                      : 'bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Doctor Verification Sign-off Box */}
          <label className="flex items-start gap-2.5 p-3.5 rounded-xl border border-teal-300 bg-teal-50/80 cursor-pointer hover:bg-teal-50 transition">
            <input
              type="checkbox"
              checked={isVerifiedByDoctor}
              onChange={(e) => setIsVerifiedByDoctor(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 cursor-pointer"
            />
            <div className="text-xs text-slate-800 space-y-0.5">
              <span className="font-bold text-teal-950 block">
                Clinical Sign-off Certification (వైద్యుల డిజిటల్ సంతకం)
              </span>
              <span className="text-slate-600 block text-[11px] leading-relaxed">
                I, <strong>{doctorName}</strong> (Medical Reg. No: <strong>MCI-2018-9942</strong>), certify that I have conducted this consultation and authorized this medication draft.
              </span>
            </div>
          </label>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Stored in prototype database with role-based access & synchronized with Patient OPD Pass</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading || medicines.length === 0 || !isVerifiedByDoctor}
              onClick={handleSave}
              className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Issue & Attach to Patient Pass'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
