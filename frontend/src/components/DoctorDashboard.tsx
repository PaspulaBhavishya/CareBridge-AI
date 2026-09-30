import React, { useState } from 'react';
import { 
  Stethoscope, Clock, CheckCircle2, User, Building, 
  Calendar, Sparkles, ChevronRight, Bell, FileText, Pill
} from 'lucide-react';
import type { UserProfile, AppointmentRecord } from '../types';
import { ClinicalSoapModal } from './ClinicalSoapModal';
import { EPrescriptionModal } from './EPrescriptionModal';
import { chimeService } from '../utils/audioChime';

import { getTranslation } from '../utils/translations';

interface DoctorDashboardProps {
  currentProfile: UserProfile;
  appointments: AppointmentRecord[];
  onNavigateToTab: (tab: string) => void;
  seniorMode?: boolean;
  language?: string;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({
  currentProfile,
  appointments,
  onNavigateToTab,
  seniorMode,
  language = 'en'
}) => {
  const t = getTranslation(language);
  const isTe = (language || '').toLowerCase().startsWith('te') || (language || '').toLowerCase().includes('telugu');
  const [activeToken, setActiveToken] = useState<number>(14);
  const [completedList, setCompletedList] = useState<number[]>([]);
  const [prescriptionsMap, setPrescriptionsMap] = useState<Record<number, any>>({});
  const [selectedSoapPatient, setSelectedSoapPatient] = useState<{ id: number; name: string; token: number } | null>(null);
  const [selectedRxPatient, setSelectedRxPatient] = useState<{ id: number; name: string; token: number } | null>(null);
  const [alertToast, setAlertToast] = useState<string | null>(null);

  const isDoctor = currentProfile.role === 'doctor';
  const doctorDisplayName = isDoctor ? currentProfile.name : 'Dr. Priya';
  const doctorSpecialty = isDoctor 
    ? (currentProfile.specialization || 'Attending Physician') 
    : 'Consultant Physician • General Medicine';
  const doctorHospital = isDoctor 
    ? (currentProfile.preferred_hospital || 'Hospital B (Metro Multi-Specialty)') 
    : 'Hospital B (Metro Multi-Specialty)';

  // Filter appointments for this doctor if matching, else show demo queue
  const docAppointments = appointments.filter(
    (a) => a.doctor_name && a.doctor_name.toLowerCase().includes(doctorDisplayName.split(' ').pop()?.toLowerCase() || '')
  );

  const displayQueue = docAppointments.length > 0 ? docAppointments : appointments.slice(0, 5);

  const triggerQueueAlert = async (tokenNum: number, patientName: string) => {
    try {
      await fetch('/api/send-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alert_type: 'TOKEN_UPDATE',
          recipient_phone: '+91 98480 22334',
          patient_name: patientName,
          message_en: `Your token #${tokenNum} is now active at Room 204 with ${currentProfile.name}. Please proceed.`,
          message_te: `మీ టోకెన్ #${tokenNum} రూమ్ 204 వద్ద ప్రారంభమైంది. దయచేసి వెళ్ళండి.`
        })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleNextToken = () => {
    chimeService.playHospitalChime();
    const nextVal = activeToken + 1;
    setActiveToken(nextVal);
    
    const nextPatient = displayQueue.find((_, idx) => 11 + idx === nextVal) || displayQueue[0];
    const patientName = nextPatient ? nextPatient.patient_name : 'Upcoming Patient';
    
    setAlertToast(`📢 Token #${nextVal} called! SMS & WhatsApp dispatched to ${patientName}`);
    triggerQueueAlert(nextVal, patientName);
    setTimeout(() => setAlertToast(null), 5000);
  };

  const handleComplete = (id: number) => {
    chimeService.playSuccessTone();
    setCompletedList((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const handlePrescriptionSaved = (id: number, rx: any) => {
    setPrescriptionsMap((prev) => ({ ...prev, [id]: rx }));
    setAlertToast('✅ Digital E-Prescription issued and synced to Patient Digital Pass!');
    setTimeout(() => setAlertToast(null), 4000);
  };

  return (
    <div className={`flex-1 bg-[#F8FAFC] text-slate-800 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-24 ${seniorMode ? 'text-lg' : ''}`}>
      {/* Toast Alert */}
      {alertToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl border border-emerald-500 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{alertToast}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {t.doctor_portal_title}
            </span>
            <span className="text-xs text-slate-400">
              • {isTe ? "గది: " : "Room: "}<strong className="text-slate-700">{currentProfile.room_number || 'Room 204 (2nd Floor)'}</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Stethoscope className="h-7 w-7 text-blue-600" />
            <span>{doctorDisplayName}</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {doctorSpecialty} • {doctorHospital}
          </p>
        </div>

        {/* Live Token Callout */}
        <div className="flex items-center gap-3 bg-blue-50/80 border border-blue-200 rounded-2xl p-4 shadow-xs">
          <div>
            <div className="text-[11px] text-blue-800 uppercase tracking-wider font-semibold">{t.now_serving}</div>
            <div className="text-2xl font-black text-blue-600">#{activeToken}</div>
          </div>
          <button
            onClick={handleNextToken}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Bell className="h-4 w-4" />
            <span>{t.btn_call_next}</span>
          </button>
        </div>
      </div>

      {/* Doctor Info & Metrics Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Building className="h-4 w-4 text-blue-600" />
            <span>Assigned OPD Room</span>
          </div>
          <div className="text-lg font-bold text-slate-900 mt-1">
            {currentProfile.room_number || 'Room 204 (2nd Floor)'}
          </div>
          <div className="text-[11px] text-slate-400">Cardiology Consultation Suite</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-emerald-600" />
            <span>Consultation Fee</span>
          </div>
          <div className="text-lg font-bold text-emerald-600 mt-1">
            ₹{currentProfile.consultation_fee || 600}
          </div>
          <div className="text-[11px] text-slate-400">Direct Insurance & Cash Counter</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <User className="h-4 w-4 text-indigo-600" />
            <span>Queue Status</span>
          </div>
          <div className="text-lg font-bold text-slate-900 mt-1">
            {displayQueue.length} Patients Active
          </div>
          <div className="text-[11px] text-indigo-600">Estimated queue duration: ~35m</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>AI Clinical Assistant</span>
          </div>
          <div className="text-sm font-bold text-slate-900 mt-1">
            CareBridge AI Connected
          </div>
          <button
            onClick={() => onNavigateToTab('scanner')}
            className="text-[11px] text-blue-600 hover:underline mt-1 flex items-center gap-1 cursor-pointer font-medium"
          >
            <span>Scan Lab Reports / Rx</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Patient Consultation Roster */}
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span>Today's Consultation Schedule & Queue (రోగుల జాబితా)</span>
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            Automated Low-Wait Queue • SmartFlow Managed
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden divide-y divide-slate-100 shadow-xs">
          {displayQueue.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No appointments booked for your OPD slots yet.
            </div>
          ) : (
            displayQueue.map((appt, idx) => {
              const tokenNum = 11 + idx;
              const isServing = tokenNum === activeToken;
              const isDone = completedList.includes(appt.id);
              const hasRx = !!prescriptionsMap[appt.id] || !!appt.prescription_json;

              return (
                <div
                  key={appt.id}
                  className={`p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition ${
                    isServing
                      ? 'bg-blue-50/60 border-l-4 border-l-blue-600'
                      : isDone
                      ? 'bg-slate-50/40 opacity-70'
                      : 'hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`h-11 w-11 rounded-xl flex flex-col items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs ${
                        isServing
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 animate-pulse'
                          : isDone
                          ? 'bg-slate-100 text-slate-400'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span className="text-[9px] uppercase font-normal">Token</span>
                      <span>#{tokenNum}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                          {appt.patient_name || 'Patient'}
                        </h4>
                        {isServing && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-700 border border-blue-200">
                            IN CONSULTATION
                          </span>
                        )}
                        {isDone && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            COMPLETED
                          </span>
                        )}
                        {hasRx && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200 flex items-center gap-1">
                            <Pill className="w-3 h-3 text-teal-600" /> Rx Issued
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                        <span>🕒 {appt.time || '10:30 AM'}</span>
                        <span>•</span>
                        <span>🏥 {appt.hospital || 'Hospital B (Metro)'}</span>
                        <span>•</span>
                        <span className="text-slate-700 font-medium">Complaint: {appt.reason || 'Follow-up Consultation'}</span>
                      </div>
                      <div className="text-[11px] text-emerald-600 font-mono mt-0.5">
                        Pass Code: {appt.confirmation_code || `CB-2026-${appt.id}10`}
                      </div>
                    </div>
                  </div>

                  {/* Clinical Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* AI Clinical Brief (SOAP) Button */}
                    <button
                      onClick={() => setSelectedSoapPatient({ id: appt.id, name: appt.patient_name || 'Patient', token: tokenNum })}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                      title="View AI Clinical Brief (Pre-Consultation SOAP Notes)"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>AI SOAP Brief</span>
                    </button>

                    {/* Write E-Prescription Button */}
                    <button
                      onClick={() => setSelectedRxPatient({ id: appt.id, name: appt.patient_name || 'Patient', token: tokenNum })}
                      className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                      title="Write Digital E-Prescription"
                    >
                      <Pill className="w-3.5 h-3.5 text-teal-600" />
                      <span>Write Rx</span>
                    </button>

                    {/* Queue actions */}
                    {!isDone ? (
                      <>
                        <button
                          onClick={() => {
                            chimeService.playHospitalChime();
                            setActiveToken(tokenNum);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs ${
                            isServing
                              ? 'bg-blue-600 text-white font-bold'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {isServing ? 'Active' : 'Serve'}
                        </button>
                        <button
                          onClick={() => handleComplete(appt.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 transition cursor-pointer shadow-xs"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Complete</span>
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span>Finished</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* SOAP Modal */}
      {selectedSoapPatient && (
        <ClinicalSoapModal
          patientName={selectedSoapPatient.name}
          doctorName={currentProfile.name}
          tokenNumber={selectedSoapPatient.token}
          onClose={() => setSelectedSoapPatient(null)}
          onStartConsultation={() => {
            setActiveToken(selectedSoapPatient.token);
            chimeService.playHospitalChime();
          }}
          seniorMode={seniorMode}
        />
      )}

      {/* E-Prescription Modal */}
      {selectedRxPatient && (
        <EPrescriptionModal
          appointmentId={selectedRxPatient.id}
          patientName={selectedRxPatient.name}
          doctorName={currentProfile.name}
          onClose={() => setSelectedRxPatient(null)}
          onPrescriptionSaved={(rx) => handlePrescriptionSaved(selectedRxPatient.id, rx)}
          seniorMode={seniorMode}
        />
      )}
    </div>
  );
};
