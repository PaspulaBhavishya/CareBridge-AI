import React, { useState } from 'react';
import { 
  X, Printer, Share2, Check, Clock, MapPin, Building2, 
  User, Stethoscope, Pill, Calendar
} from 'lucide-react';
import type { DigitalPassData } from '../types';

interface DigitalOPDPassModalProps {
  pass: DigitalPassData | null;
  onClose: () => void;
  seniorMode?: boolean;
}

export const DigitalOPDPassModal: React.FC<DigitalOPDPassModalProps> = ({ pass, onClose, seniorMode }) => {
  const [copied, setCopied] = useState(false);
  const [whatsAppSent, setWhatsAppSent] = useState(false);

  if (!pass) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(pass.confirmation_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    setWhatsAppSent(true);
    const textMsg = encodeURIComponent(
      `🏥 *CareBridge AI - Official OPD Pass*\n` +
      `👤 Patient: ${pass.patient_name}\n` +
      `🎫 Token: #${pass.token_number} (Room: ${pass.room_number})\n` +
      `👨‍⚕️ Doctor: ${pass.doctor_name} (${pass.department})\n` +
      `🕒 Date & Time: ${pass.date} at ${pass.time}\n` +
      `🔑 Code: ${pass.confirmation_code}\n` +
      (pass.follow_up_date ? `📅 Follow-up: ${pass.follow_up_date}\n` : '') +
      `Hospital: ${pass.hospital_name || 'CareBridge Metro Hospital'}`
    );
    window.open(`https://api.whatsapp.com/send?text=${textMsg}`, '_blank');
    setTimeout(() => setWhatsAppSent(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-slate-800 flex flex-col max-h-[92vh] ${seniorMode ? 'scale-105' : ''}`}>
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center border border-white/30 shadow-sm">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-[11px] font-bold tracking-wider uppercase text-blue-100">
                Official Digital OPD Pass / డిజిటల్ పాస్
              </div>
              <h3 className="font-bold text-sm leading-tight text-white">
                {pass.hospital_name || pass.hospital_short || "CareBridge Hospital Network"}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Pass Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Token Hero Badge */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 text-center space-y-1 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider">
              Assigned Queue Token / మీ టోకెన్ నంబర్
            </span>
            <div className="text-4xl font-extrabold text-slate-900 tracking-tight font-mono py-0.5">
              #{pass.token_number || 14}
            </div>
            <div className="text-[11px] text-slate-600 flex items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1 text-blue-700 font-semibold">
                <Clock className="h-3 w-3" />
                Now Serving: #{pass.current_serving_token || 11}
              </span>
              <span>•</span>
              <span className="text-emerald-700 font-bold">
                {pass.patients_ahead || 2} Patients Ahead (~{pass.simulated_wait_min}m)
              </span>
            </div>
          </div>

          {/* Key Appointment Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 shadow-sm">
              <div className="text-[10px] text-slate-500 flex items-center gap-1">
                <User className="h-3 w-3 text-slate-400" />
                <span>Patient Name</span>
              </div>
              <div className="font-bold text-slate-900 text-xs truncate">
                {pass.patient_name}
              </div>
              <div className="text-[10px] font-mono text-slate-500">
                ID: {pass.patient_uid || "PAT-1001"}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 shadow-sm">
              <div className="text-[10px] text-slate-500 flex items-center gap-1">
                <Clock className="h-3 w-3 text-slate-400" />
                <span>Date & Time</span>
              </div>
              <div className="font-bold text-slate-900 text-xs">
                {pass.date}
              </div>
              <div className="text-[10px] font-semibold text-blue-700">
                {pass.time}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 shadow-sm">
              <div className="text-[10px] text-slate-500 flex items-center gap-1">
                <Stethoscope className="h-3 w-3 text-slate-400" />
                <span>Doctor & Specialty</span>
              </div>
              <div className="font-bold text-slate-900 text-xs truncate">
                {pass.doctor_name}
              </div>
              <div className="text-[10px] text-slate-600 truncate">
                {pass.specialization}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 shadow-sm">
              <div className="text-[10px] text-slate-500 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-slate-400" />
                <span>Room & Location</span>
              </div>
              <div className="font-bold text-emerald-700 text-xs truncate">
                {pass.room_number || "Room 204 (2nd Floor)"}
              </div>
              <div className="text-[10px] text-slate-600 truncate">
                {pass.hospital_area || "Hyderabad"}
              </div>
            </div>
          </div>

          {/* Attached Digital E-Prescription (if issued) */}
          {pass.prescription && (
            <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-teal-900 flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5 text-teal-600" /> Attached Digital E-Prescription (మందుల చీటీ)
                </span>
                <span className="text-[10px] text-teal-700 font-mono">Issued by Doctor</span>
              </div>

              <div className="text-xs font-semibold text-slate-900">
                Diagnosis: <span className="text-teal-800">{pass.prescription.diagnosis}</span>
              </div>

              <div className="space-y-1.5 pt-1">
                {pass.prescription.medicines?.map((m: any, idx: number) => (
                  <div key={idx} className="p-2 rounded-lg bg-white border border-teal-200 flex items-center justify-between text-xs shadow-sm">
                    <span className="font-bold text-slate-900">{m.name}</span>
                    <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-mono font-bold text-[10px]">
                      {m.dosage} • {m.timing}
                    </span>
                  </div>
                ))}
              </div>

              {pass.prescription.doctor_notes && (
                <p className="text-[11px] text-slate-600 italic pt-1">
                  Advice: "{pass.prescription.doctor_notes}"
                </p>
              )}
            </div>
          )}

          {/* Follow-up Re-visit Reminder (if scheduled) */}
          {pass.follow_up_date && (
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span className="text-purple-900 font-medium">Scheduled Follow-up Date:</span>
              </div>
              <strong className="text-purple-700 font-bold">{pass.follow_up_date}</strong>
            </div>
          )}

          {/* QR Code & Barcode Section */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 flex items-center justify-between gap-4 shadow-sm">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                Verification Barcode & QR
              </span>
              <div className="text-base font-extrabold font-mono text-blue-950 tracking-wider">
                {pass.confirmation_code}
              </div>
              <p className="text-[10px] text-slate-600 mt-1 max-w-[200px]">
                Scan at hospital entrance or OPD reception kiosk for instant express check-in.
              </p>
              <button
                onClick={handleCopyCode}
                className="mt-2 text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="h-3 w-3" /> : null}
                <span>{copied ? 'Copied to clipboard!' : 'Copy Code'}</span>
              </button>
            </div>

            {/* Generated SVG QR Code Pattern */}
            <div className="h-20 w-20 flex-shrink-0 bg-white p-1.5 rounded-lg border border-slate-300 flex items-center justify-center shadow-sm">
              <svg viewBox="0 0 33 33" className="w-full h-full text-slate-900 fill-current">
                <path d="M0 0h9v9H0zm2 2h5v5H2zM24 0h9v9h-9zm2 2h5v5h-5zM0 24h9v9H0zm2 2h5v5H2zM12 2h2v4h-2zm5 0h4v2h-4zm6 2h1v2h-1zm-6 3h2v2h-2zm-3 2h2v2h-2zm14 0h2v2h-2zm-8 2h2v4h-2zm-4 3h2v2h-2zm6 0h2v2h-2zm7 0h2v2h-2zm-9 3h3v2h-3zm5 0h2v2h-2zm-8 2h2v4h-2zm11 0h2v2h-2zm-6 2h2v2h-2zm3 2h4v2h-4zM12 24h2v4h-2zm3 3h2v2h-2zm6-2h2v4h-2zm-6 4h4v2h-4zm7 0h3v2h-3z" />
              </svg>
            </div>
          </div>

          {/* Fee & Receipt Summary */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs shadow-sm">
            <span className="text-slate-600 font-medium">Doctor Consultation Fee</span>
            <div className="text-right">
              <span className="font-bold text-emerald-700 text-sm">
                ₹{pass.consultation_fee || 600}
              </span>
              <span className="text-[10px] text-slate-500 block">
                Payable at OPD Counter / Cashless
              </span>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
          >
            <Printer className="h-3.5 w-3.5 text-slate-500" />
            <span>Print / Save PDF</span>
          </button>

          <button
            onClick={handleWhatsApp}
            className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
          >
            <Share2 className="h-3.5 w-3.5 text-white" />
            <span>{whatsAppSent ? 'Opening WhatsApp...' : 'Share Pass on WhatsApp'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
