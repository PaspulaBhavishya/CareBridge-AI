import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, PhoneCall, MapPin, X, ShieldAlert, Heart, 
  Navigation, Siren, Radio 
} from 'lucide-react';
import { chimeService } from '../utils/audioChime';

interface EmergencySOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  seniorMode?: boolean;
}

export const EmergencySOSModal: React.FC<EmergencySOSModalProps> = ({ isOpen, onClose, seniorMode }) => {
  const [dispatched, setDispatched] = useState(false);
  const [gpsAddress, setGpsAddress] = useState('Hyderabad, Telangana (Detecting GPS...)');
  const [etaSeconds, setEtaSeconds] = useState(360); // 6 mins

  useEffect(() => {
    if (isOpen) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setGpsAddress(`GPS: ${pos.coords.latitude.toFixed(4)}°N, ${pos.coords.longitude.toFixed(4)}°E (Banjara Hills / Metro Area)`);
          },
          () => {
            setGpsAddress('Road No. 12, Banjara Hills, Hyderabad, Telangana');
          },
          { timeout: 5000 }
        );
      } else {
        setGpsAddress('Road No. 12, Banjara Hills, Hyderabad, Telangana');
      }
    }
  }, [isOpen]);

  // ETA countdown timer
  useEffect(() => {
    let timer: any;
    if (dispatched && etaSeconds > 0) {
      timer = setInterval(() => {
        setEtaSeconds((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [dispatched, etaSeconds]);

  if (!isOpen) return null;

  const handleSimulateDispatch = async () => {
    chimeService.playAlertChime();
    setDispatched(true);

    try {
      await fetch('/api/send-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alert_type: 'EMERGENCY_SOS',
          recipient_phone: '+91 98480 99999',
          patient_name: 'Emergency Patient (SOS Alert)',
          message_en: `EMERGENCY ALERT: 108 Ambulance Unit AMB-108-HYD dispatched to ${gpsAddress}. ETA 6 mins.`,
          message_te: `అత్యవసర హెచ్చరిక: 108 అంబులెన్స్ మీ చిరునామాకు బయలుదేరింది.`
        })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const formatETA = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`relative w-full max-w-xl bg-slate-950 border-2 border-rose-600 rounded-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh] ${seniorMode ? 'scale-105' : ''}`}>
        {/* Red Emergency Flashing Ribbon */}
        <div className="bg-gradient-to-r from-rose-700 via-red-600 to-amber-600 p-4 text-white flex items-center justify-between shadow-lg shadow-rose-950/40">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center border border-white/30 animate-pulse">
              <AlertOctagon className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-extrabold tracking-wider uppercase text-rose-100">
                EMERGENCY ASSISTANCE DEMO MODE • అత్యవసర ప్రదర్శన మోడ్
              </div>
              <h3 className="font-extrabold text-base leading-tight text-white flex items-center gap-2">
                <span>CareBridge 108 Emergency Assistant</span>
                <span className="px-2 py-0.5 bg-black/40 text-amber-300 border border-amber-400/50 rounded text-[10px] font-mono font-black uppercase">
                  SIMULATION ONLY
                </span>
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center transition text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Critical Simulation Notice */}
          <div className="p-3.5 bg-rose-950/70 border-2 border-rose-500 rounded-2xl flex items-start gap-2.5 text-rose-200 shadow-md">
            <ShieldAlert className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <span className="text-white font-extrabold block uppercase tracking-wider text-[11px]">
                ⚠️ EMERGENCY ASSISTANCE SIMULATION
              </span>
              <span className="text-rose-100 block mt-0.5">
                The system captures location, displays emergency guidance and simulates an ambulance coordination workflow. It does <strong>not</strong> automatically dispatch a real ambulance.
              </span>
              <span className="text-amber-200 font-bold block mt-1">
                👉 For a real emergency, call the local emergency number immediately (108 / 112).
              </span>
            </div>
          </div>

          {/* 108 Dial Hero Card */}
          <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-600/50 text-center space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-600 text-white animate-pulse">
              <PhoneCall className="h-3.5 w-3.5" />
              <span>National Emergency Hotline (108 / 112)</span>
            </div>
            <div className="text-3xl font-black text-white font-mono tracking-wider">
              Dial 108 / 112
            </div>
            <p className="text-[11px] text-rose-200/90 max-w-sm mx-auto">
              If someone is experiencing acute chest pain, heavy bleeding, stroke symptoms, or loss of consciousness, call official 108 emergency operators immediately.
            </p>

            <div className="pt-1 flex flex-wrap items-center justify-center gap-2">
              <a
                href="tel:108"
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/40 transition active:scale-95"
              >
                <PhoneCall className="h-4 w-4" />
                <span>Call 108 (Real Emergency)</span>
              </a>

              <button
                onClick={handleSimulateDispatch}
                disabled={dispatched}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition active:scale-95 cursor-pointer ${
                  dispatched
                    ? 'bg-emerald-800 text-emerald-100 border border-emerald-500/40 shadow-lg'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700'
                }`}
              >
                <Siren className={`h-4 w-4 ${dispatched ? 'text-emerald-300 animate-spin' : 'text-amber-400'}`} />
                <span>{dispatched ? 'Simulated Dispatch Active (Demo Exercise)' : '⚡ Run Simulated Dispatch Exercise (Demo)'}</span>
              </button>
            </div>
          </div>

          {/* Live Animated Ambulance GPS Tracker (When Dispatched) */}
          {dispatched && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-500/50 space-y-3 shadow-xl animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-extrabold text-sm text-emerald-300 uppercase tracking-wider">
                    SIMULATED DEMONSTRATION EXERCISE • ప్రదర్శన మాత్రమే
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold text-[11px] border border-amber-500/30">
                  Sim Unit: AMB-108-HYD-DEMO
                </span>
              </div>

              {/* Progress & Countdown */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Simulated Arrival Timer (Demo)</div>
                  <div className="text-3xl font-black font-mono text-amber-400 tracking-wider">
                    {formatETA(etaSeconds)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Illustrative Demo Speed: 52 km/h • Est. Distance: 1.8 km</div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-400">Mock Paramedic (Demo)</div>
                  <div className="font-bold text-white text-xs mt-0.5">R. Srinivas (Sim EMT)</div>
                  <span className="inline-block text-[10px] text-slate-400 mt-1">
                    Demo Hotline: +91 40 4567 9999
                  </span>
                </div>
              </div>

              {/* Simulated GPS Radar Route Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>CareBridge Trauma Node</span>
                  <span className="text-amber-300 font-bold text-[10px]">Illustrative Demo Route (Not Live GPS)</span>
                  <span>Patient GPS Geofence</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden relative">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, Math.max(15, ((360 - etaSeconds) / 360) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Captured User Location */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                <Radio className="h-3.5 w-3.5 text-cyan-400" />
                <span>Detected Incident Location (GPS Geolocation)</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold">Active Geofence</span>
            </div>
            <p className="text-xs font-semibold text-white">
              {gpsAddress}
            </p>
          </div>

          {/* Nearest Hospital Trauma Facility */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-rose-400" />
              <span>Nearest 24/7 Level-1 Emergency Trauma Center</span>
            </span>

            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="font-bold text-white text-xs">
                  CareBridge Metro Emergency Care & Trauma
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Financial District, Gachibowli, Hyderabad (3.2 km • ~6 mins)
                </p>
                <div className="text-[11px] font-mono text-emerald-400 font-bold mt-1 flex items-center gap-2">
                  <span>📞 24/7 ER Desk: +91 40 4567 9999</span>
                </div>
              </div>

              <a
                href="https://maps.google.com/?q=Gachibowli+Hyderabad"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-bold flex items-center gap-1 flex-shrink-0 transition"
              >
                <Navigation className="h-3 w-3" />
                <span>Open Maps</span>
              </a>
            </div>
          </div>

          {/* First Aid Guidance Matrix */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Immediate First-Aid Guidance (సహాయం వచ్చే వరకు ప్రథమ చికిత్స):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] space-y-1">
                <span className="font-bold text-rose-300 block flex items-center gap-1">
                  <Heart className="h-3 w-3" /> Chest Pain
                </span>
                <p className="text-slate-400 text-[10px]">
                  Sit upright comfortably. Loosen clothing. Avoid all exertion.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] space-y-1">
                <span className="font-bold text-amber-300 block flex items-center gap-1">
                  <ShieldAlert className="h-3 w-3" /> Bleeding
                </span>
                <p className="text-slate-400 text-[10px]">
                  Apply firm, continuous pressure with a clean cloth. Elevate if possible.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] space-y-1">
                <span className="font-bold text-cyan-300 block flex items-center gap-1">
                  <AlertOctagon className="h-3 w-3" /> Breathing
                </span>
                <p className="text-slate-400 text-[10px]">
                  Keep airway clear. Ensure fresh airflow. Do not swallow water.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[10px] text-slate-500">
            CareBridge AI Safety Standard • Clinical Triage Protocol v2.4
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
