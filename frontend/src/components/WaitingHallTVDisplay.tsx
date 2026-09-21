import React, { useState, useEffect } from 'react';
import { Tv, Volume2, Users, Sparkles, X } from 'lucide-react';
import type { TVQueueData } from '../types';
import { chimeService } from '../utils/audioChime';

interface Props {
  onClose?: () => void;
  seniorMode?: boolean;
}

export const WaitingHallTVDisplay: React.FC<Props> = ({ onClose, seniorMode }) => {
  const [data, setData] = useState<TVQueueData | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('en-US'));
  const [activeAnnounceIndex, setActiveAnnounceIndex] = useState<number | null>(null);

  // Live digital clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchQueue = async () => {
    try {
      const res = await fetch('/api/tv-queue');
      if (res.ok) {
        const json: TVQueueData = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
      // Fallback
      setData({
        hospital_name: "CareBridge Metro Multi-Specialty Hospital",
        hospital_code: "HOSP-B-METRO",
        now_serving: [
          {
            room: "Room 204 (2nd Floor)",
            doctor: "Dr. Ananya Sen",
            department: "Cardiology",
            department_te: "గుండె విభాగం",
            token: 14,
            patient_name: "Ravi Kumar",
            status: "IN_CONSULTATION",
            voice_announcement_en: "Token number 14, please proceed to Room 204, Dr. Ananya Sen.",
            voice_announcement_te: "టోకెన్ నంబర్ 14, దయచేసి రూమ్ 204, డాక్టర్ అనన్య సేన్ గారి వద్దకు వెళ్లండి."
          },
          {
            room: "Room 102 (1st Floor)",
            doctor: "Dr. Rajesh Varma",
            department: "General Medicine",
            department_te: "జనరల్ మెడిసిన్",
            token: 8,
            patient_name: "Sita Devi",
            status: "IN_CONSULTATION",
            voice_announcement_en: "Token number 8, please proceed to Room 102, Dr. Rajesh Varma.",
            voice_announcement_te: "టోకెన్ నంబర్ 8, దయచేసి రూమ్ 102, డాక్టర్ రాజేష్ వర్మ గారి వద్దకు వెళ్లండి."
          },
          {
            room: "Room 305 (3rd Floor)",
            doctor: "Dr. K. Srinivas",
            department: "Orthopedics",
            department_te: "ఎముకల విభాగం",
            token: 5,
            patient_name: "Mohan Rao",
            status: "IN_CONSULTATION",
            voice_announcement_en: "Token number 5, please proceed to Room 305, Dr. K. Srinivas.",
            voice_announcement_te: "టోకెన్ నంబర్ 5, దయచేసి రూమ్ 305, డాక్టర్ కె. శ్రీనివాస్ గారి వద్దకు వెళ్లండి."
          }
        ],
        upcoming: [
          { token: 15, department: "Cardiology", patient_name: "Sunitha Reddy", room: "Room 204", wait_min: 6 },
          { token: 16, department: "Cardiology", patient_name: "Venkateswara Rao", room: "Room 204", wait_min: 18 },
          { token: 9, department: "General Medicine", patient_name: "Kavitha M", room: "Room 102", wait_min: 10 },
          { token: 10, department: "General Medicine", patient_name: "Arjun Naidu", room: "Room 102", wait_min: 22 },
          { token: 6, department: "Orthopedics", patient_name: "Padmavathi G", room: "Room 305", wait_min: 14 }
        ],
        last_updated: new Date().toLocaleTimeString()
      });
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 10000);
    return () => clearInterval(interval);
  }, []);

  const announceToken = (idx: number, lang: 'te' | 'en' | 'both' = 'both') => {
    if (!data || !data.now_serving[idx]) return;
    const item = data.now_serving[idx];
    setActiveAnnounceIndex(idx);

    chimeService.playHospitalChime();

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      setTimeout(() => {
        if (lang === 'both' || lang === 'te') {
          const teUtterance = new SpeechSynthesisUtterance(item.voice_announcement_te);
          teUtterance.lang = 'te-IN';
          teUtterance.rate = 0.9;
          
          if (lang === 'both') {
            teUtterance.onend = () => {
              setTimeout(() => {
                const enUtterance = new SpeechSynthesisUtterance(item.voice_announcement_en);
                enUtterance.lang = 'en-IN';
                enUtterance.rate = 0.95;
                enUtterance.onend = () => setActiveAnnounceIndex(null);
                window.speechSynthesis.speak(enUtterance);
              }, 400);
            };
          } else {
            teUtterance.onend = () => setActiveAnnounceIndex(null);
          }
          window.speechSynthesis.speak(teUtterance);
        } else {
          const enUtterance = new SpeechSynthesisUtterance(item.voice_announcement_en);
          enUtterance.lang = 'en-IN';
          enUtterance.rate = 0.95;
          enUtterance.onend = () => setActiveAnnounceIndex(null);
          window.speechSynthesis.speak(enUtterance);
        }
      }, 700);
    } else {
      setTimeout(() => setActiveAnnounceIndex(null), 2500);
    }
  };

  return (
    <div className={`bg-slate-950 text-white rounded-2xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col min-h-[620px] ${seniorMode ? 'scale-[1.02]' : ''}`}>
      {/* Hospital TV Header Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white border border-blue-400/30">
            <Tv className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black tracking-wider text-white uppercase">
                {data?.hospital_name || 'CareBridge Hospital'}
              </h2>
              <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full animate-pulse">
                ● LIVE OPD QUEUE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium tracking-wide">
              OPD Waiting Hall Smart TV Display • రద్దీ నిర్వహణ & ఆటోమేటిక్ టోకెన్ కాల్ సిస్టమ్
            </p>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="text-right">
            <div className="text-2xl font-mono font-black text-amber-400 tracking-widest">{currentTime}</div>
            <div className="text-[11px] text-slate-400">Hyderabad (IST)</div>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main TV Layout */}
      <div className="p-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-950/95">
        {/* Left 7 Cols: NOW SERVING (Huge High-Visibility Badges) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400">
                NOW SERVING • ప్రస్తుతం చూస్తున్న రోగులు
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Please proceed when called</span>
          </div>

          <div className="space-y-3.5 flex-1">
            {data?.now_serving.map((item, idx) => {
              const isAnnouncing = activeAnnounceIndex === idx;
              return (
                <div
                  key={idx}
                  className={`relative rounded-2xl p-5 border transition-all ${
                    isAnnouncing 
                      ? 'bg-gradient-to-r from-blue-950 via-indigo-950 to-purple-950 border-blue-400 shadow-xl shadow-blue-500/20 ring-2 ring-blue-500' 
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {/* Left: Huge Token Number */}
                    <div className="flex items-center gap-5">
                      <div className="flex flex-col items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg border border-blue-400/40">
                        <span className="text-[11px] uppercase tracking-widest font-bold text-blue-200">TOKEN</span>
                        <span className="text-4xl font-black tracking-tight">{item.token}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            {item.department} ({item.department_te})
                          </span>
                          <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {item.room}
                          </span>
                        </div>
                        <h4 className="text-xl font-extrabold text-white">{item.doctor}</h4>
                        <p className="text-sm text-slate-300">
                          Patient: <span className="font-bold text-amber-300">{item.patient_name}</span>
                        </p>
                      </div>
                    </div>

                    {/* Right: Announcement & Audio Action */}
                    <div className="flex flex-col items-end gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/10 text-amber-300 border border-amber-400/20">
                        IN CONSULTATION
                      </span>

                      <button
                        onClick={() => announceToken(idx, 'both')}
                        className={`mt-2 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95 cursor-pointer ${
                          isAnnouncing 
                            ? 'bg-emerald-600 text-white animate-pulse' 
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:text-white'
                        }`}
                        title="Play Hospital Chime & Speak Token in Telugu & English"
                      >
                        <Volume2 className="w-4 h-4 text-amber-400" />
                        <span>{isAnnouncing ? 'ప్రకటిస్తోంది...' : 'ధ్వని ప్రకటన (Announce)'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 5 Cols: UPCOMING QUEUE (Waiting Hall Roster) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-black uppercase tracking-widest text-blue-400">
                UPCOMING TOKENS • తదుపరి రోగులు
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Estimated wait times</span>
          </div>

          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 space-y-2.5 flex-1">
            {data?.upcoming.map((u, i) => (
              <div 
                key={i} 
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 text-amber-300 font-black flex items-center justify-center text-lg border border-slate-700">
                    #{u.token}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white">{u.patient_name}</h5>
                    <p className="text-xs text-slate-400">{u.department} • {u.room}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-400">~{u.wait_min} min</span>
                  <div className="text-[10px] text-slate-500 uppercase">Wait Est</div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 bg-blue-950/40 rounded-xl border border-blue-900/50 flex items-center justify-between text-xs text-blue-200">
            <span className="flex items-center gap-2 font-semibold">
              <Sparkles className="w-4 h-4 text-amber-400" /> WhatsApp & SMS alerts are automatically dispatched 3 tokens prior
            </span>
            <span className="text-[11px] text-blue-300">Live Sync</span>
          </div>
        </div>
      </div>

      {/* Footer Emergency & Guidance Ticker */}
      <div className="bg-slate-900 px-6 py-2.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span className="font-bold text-amber-400 uppercase tracking-wider">Help Desk:</span>
          <span>Emergency / Trauma Care: <strong className="text-white">+91 40 2345 9999</strong> (108 Available)</span>
          <span className="hidden md:inline">• Pharmacy & Diagnostics open on Ground Floor</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
          <span>Auto-refresh: 10s</span>
        </div>
      </div>
    </div>
  );
};
