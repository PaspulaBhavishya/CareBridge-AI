import React, { useState } from 'react';
import { Printer, User, Phone, X } from 'lucide-react';
import type { WalkinSlipData } from '../types';
import { chimeService } from '../utils/audioChime';

interface Props {
  onClose?: () => void;
  seniorMode?: boolean;
}

export const WalkinTokenKiosk: React.FC<Props> = ({ onClose, seniorMode }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState<number | ''>(42);
  const [gender, setGender] = useState('Male');
  const [department, setDepartment] = useState('Cardiology');
  const [priority, setPriority] = useState('NORMAL');
  const [loading, setLoading] = useState(false);
  const [issuedSlip, setIssuedSlip] = useState<WalkinSlipData | null>(null);

  const fillQuickPreset = (presetName: string, presetPhone: string, presetAge: number, presetDept: string, presetPriority: string) => {
    setName(presetName);
    setPhone(presetPhone);
    setAge(presetAge);
    setDepartment(presetDept);
    setPriority(presetPriority);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/walkin-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_name: name,
          phone: phone || '+91 98480 12345',
          age: Number(age) || 45,
          gender: gender,
          department_name: department,
          priority: priority
        })
      });

      if (!res.ok) throw new Error('Failed to generate token');
      const data: WalkinSlipData = await res.json();
      setIssuedSlip(data);
      chimeService.playSuccessTone();
    } catch (err) {
      console.error(err);
      // Fallback
      setIssuedSlip({
        confirmation_code: `CB-WLK-${Math.floor(1000 + Math.random() * 9000)}-18`,
        token_number: 18,
        patient_name: name || 'Walkin Patient',
        patient_uid: 'WLK-1045',
        doctor_name: department === 'Cardiology' ? 'Dr. Ananya Sen' : 'Dr. Rajesh Varma',
        room_number: department === 'Cardiology' ? 'Room 204' : 'Room 102',
        department_name: department,
        consultation_fee: 600,
        priority: priority,
        simulated_wait_min: priority === 'URGENT' ? 8 : 15,
        slip_instructions_te: 'దయచేసి మీ టోకెన్ పిలిచే వరకు వేచి ఉండండి. పెద్ద స్క్రీన్‌పై సమాచారం అందుతుంది.',
        slip_instructions_en: 'Please wait in the OPD waiting hall until your token is called on the TV screen.'
      });
      chimeService.playSuccessTone();
    } finally {
      setLoading(false);
    }
  };

  const printSlip = () => {
    window.print();
  };

  return (
    <div className={`bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden ${seniorMode ? 'text-lg' : ''}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 px-6 py-5 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
            <Printer className="w-6 h-6 text-blue-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight">15-Second Walk-In Token Kiosk</h2>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-400/20 text-blue-100 border border-blue-300/30">
                Reception Fast-Track
              </span>
            </div>
            <p className="text-sm text-blue-100/90">
              స్మార్ట్‌ఫోన్ లేని వాక్-ఇన్ రోగులకు 15 సెకన్లలో తక్షణ టోకెన్ రసీదు అందించండి
            </p>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Form & 1-Click Fast Presets */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1-Click Presets */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
              ⚡ 1-Click Reception Quick Presets (శాంపిల్ వాక్-ఇన్)
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => fillQuickPreset('Ramesh Gupta', '+91 98480 11223', 52, 'Cardiology', 'NORMAL')}
                className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-left text-xs font-semibold text-blue-900 transition-colors cursor-pointer"
              >
                🏥 Ramesh Gupta (52, Cardio)
              </button>
              <button
                type="button"
                onClick={() => fillQuickPreset('Lakshmi Bai', '+91 94400 44556', 68, 'General Medicine', 'SENIOR')}
                className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100 text-left text-xs font-semibold text-purple-900 transition-colors cursor-pointer"
              >
                👵 Lakshmi Bai (68, Senior Priority)
              </button>
            </div>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Patient Full Name (రోగి పేరు) *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Gupta"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Mobile Number (ఫోన్ నంబర్)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98480 00000"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold text-slate-800"
                >
                  <option value="NORMAL">Normal</option>
                  <option value="SENIOR">Senior Citizen</option>
                  <option value="URGENT">Urgent Care</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Hospital Department (హాస్పిటల్ విభాగం)
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
              >
                <option value="Cardiology">Cardiology (గుండె విభాగం - Dr. Ananya Sen, Room 204)</option>
                <option value="General Medicine">General Medicine (జనరల్ మెడిసిన్ - Dr. Rajesh Varma, Room 102)</option>
                <option value="Orthopedics">Orthopedics (ఎముకల విభాగం - Dr. K. Srinivas, Room 305)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              <Printer className="w-5 h-5" />
              <span>{loading ? 'Issuing Token...' : 'Generate 15-Sec Walk-In Token Slip'}</span>
            </button>
          </form>
        </div>

        {/* Right 5 cols: Thermal Print Preview Slip */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          {issuedSlip ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-5 relative shadow-inner space-y-4">
              {/* Slip Header */}
              <div className="text-center border-b border-slate-300 pb-3">
                <div className="text-[10px] tracking-widest uppercase font-bold text-slate-500">CAREBRIDGE OUTPATIENT SLIP</div>
                <h3 className="text-base font-extrabold text-slate-900">Metro Multi-Specialty Hospital</h3>
                <div className="text-xs text-slate-500">Banjara Hills, Hyderabad</div>
              </div>

              {/* Big Token Number */}
              <div className="text-center py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="text-xs font-bold text-slate-500 uppercase">Your Token Number</div>
                <div className="text-5xl font-black text-blue-700 tracking-tight my-1">
                  #{issuedSlip.token_number}
                </div>
                <div className="text-xs font-semibold text-emerald-600">
                  Estimated Wait: ~{issuedSlip.simulated_wait_min} mins
                </div>
              </div>

              {/* Patient & Room Details */}
              <div className="text-xs space-y-1.5 text-slate-700 bg-white p-3.5 rounded-xl border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">Patient:</span>
                  <strong className="text-slate-900">{issuedSlip.patient_name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">UID:</span>
                  <span className="font-mono font-bold text-slate-800">{issuedSlip.patient_uid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Department:</span>
                  <span className="font-bold text-indigo-700">{issuedSlip.department_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Doctor & Room:</span>
                  <strong className="text-slate-900">{issuedSlip.doctor_name} ({issuedSlip.room_number})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Consultation Fee:</span>
                  <strong className="text-emerald-700">₹{issuedSlip.consultation_fee} (Paid at Counter)</strong>
                </div>
              </div>

              {/* Bilingual Instructions */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <p className="font-medium">{issuedSlip.slip_instructions_te}</p>
                <p className="text-[11px] text-amber-800">{issuedSlip.slip_instructions_en}</p>
              </div>

              {/* Print Action Button */}
              <button
                type="button"
                onClick={printSlip}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Thermal Slip (రసీదు ప్రింట్)</span>
              </button>
            </div>
          ) : (
            <div className="h-full min-h-[300px] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-slate-50/50">
              <Printer className="w-10 h-10 text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-600">No Slip Generated Yet</p>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                Fill the form or click a preset on the left to issue an instant walk-in token receipt.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
