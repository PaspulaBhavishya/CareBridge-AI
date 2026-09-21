import React, { useState } from 'react';
import { 
  ShieldCheck, Clock, Calendar, Stethoscope, 
  MapPin, CheckCircle 
} from 'lucide-react';

export type ApprovalState = 'PLANNED' | 'WAITING_FOR_APPROVAL' | 'APPROVED' | 'EXECUTING' | 'COMPLETED' | 'CANCELLED';

interface ApprovalData {
  approval_id: string;
  action_type: string;
  summary: string;
  doctor_name?: string;
  hospital_name?: string;
  date?: string;
  time?: string;
  simulated_wait_min?: number;
  consultation_fee?: number;
  payload: any;
}

interface ApprovalModalProps {
  isOpen: boolean;
  approvalData: ApprovalData | null;
  onApprove: (data: ApprovalData) => Promise<void>;
  onCancel: () => void;
  onChangeConstraints?: () => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  approvalData,
  onApprove,
  onCancel,
  onChangeConstraints
}) => {
  const [state, setState] = useState<ApprovalState>('WAITING_FOR_APPROVAL');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen || !approvalData) return null;

  const handleConfirm = async () => {
    setState('APPROVED');
    setIsProcessing(true);
    try {
      setState('EXECUTING');
      await onApprove(approvalData);
      setState('COMPLETED');
    } catch (e) {
      setState('WAITING_FOR_APPROVAL');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUserCancel = () => {
    setState('CANCELLED');
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-slate-800 flex flex-col">
        {/* Banner */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center border border-white/30 shadow-sm">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-extrabold tracking-wider uppercase text-amber-100">
                Human-in-the-Loop Safety Gate
              </div>
              <h3 className="font-bold text-sm leading-tight text-white flex items-center gap-2">
                <span>Patient Confirmation Required</span>
                <span className="px-2 py-0.5 bg-black/20 text-white border border-white/30 rounded text-[9px] font-mono font-bold">
                  {approvalData.approval_id}
                </span>
              </h3>
            </div>
          </div>

          {/* State Indicator */}
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black font-mono uppercase bg-white/20 text-white border border-white/30">
            {state}
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            The Supervisor Agent evaluated your request and prepared the following healthcare action. 
            In adherence with safety standards, <strong className="text-slate-900 font-bold">your explicit human approval is required</strong> before recording to hospital databases.
          </p>

          {/* Structured Healthcare Action Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 shadow-sm">
            {/* Explicit Action Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-xs">
              <span className="font-bold text-slate-500 uppercase">Action:</span>
              <span className="font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                Confirm appointment
              </span>
            </div>

            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Doctor:</span>
                  <h4 className="text-sm font-bold text-slate-900">
                    {approvalData.doctor_name || 'Dr. Ananya Sen'}
                  </h4>
                  <span className="text-[11px] text-slate-600">Cardiology & Preventive Heart Care</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Fee:</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                  ₹{approvalData.consultation_fee || 300}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 pt-1">
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-200 shadow-sm">
                <Calendar className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block font-semibold">Date:</span>
                  <span className="font-bold text-slate-900">{approvalData.date || 'Today'}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-200 shadow-sm">
                <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block font-semibold">Time:</span>
                  <span className="font-bold text-slate-900">{approvalData.time || '5:00 PM'}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-200 shadow-sm">
                <MapPin className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block font-semibold">Hospital:</span>
                  <span className="font-medium text-slate-800">{approvalData.hospital_name || 'CareBridge Metro'}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-200 shadow-sm">
                <Clock className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block font-semibold">Estimated Wait:</span>
                  <span className="font-medium text-slate-800">~{approvalData.simulated_wait_min || 12} mins</span>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
              <span className="font-bold block text-amber-800">Telugu వివరణ:</span>
              <span>ఈ అపాయింట్‌మెంట్‌ను ఖరారు చేయడానికి మీరు ఆమోదం తెలిపిన తర్వాతే డేటాబేస్ రికార్డ్ అవుతుంది మరియు టోకెన్ జారీ చేయబడుతుంది.</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
            <button
              onClick={handleConfirm}
              disabled={isProcessing}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isProcessing ? 'Locking Slot in DB...' : 'Approve'}</span>
            </button>

            {onChangeConstraints && (
              <button
                onClick={onChangeConstraints}
                disabled={isProcessing}
                className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
              >
                Change Constraints
              </button>
            )}

            <button
              onClick={handleUserCancel}
              disabled={isProcessing}
              className="w-full sm:w-auto py-3 px-4 rounded-xl bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 font-semibold text-xs border border-slate-200 transition cursor-pointer shadow-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

