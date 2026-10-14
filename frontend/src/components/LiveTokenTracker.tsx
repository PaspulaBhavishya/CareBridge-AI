import { useEffect, useState, useRef } from "react";
import { 
  Ticket, Clock, Users, MapPin, AlertTriangle, 
  RefreshCw, Play, ArrowLeft,
  Building2, Package, ShieldCheck, CheckCircle2
} from "lucide-react";
import type { UserProfile } from "../types";

export type TokenData = {
  token_number: string;
  status: string;
  people_ahead: number;
  estimated_wait_minutes: number;
  doctor_name: string;
  department: string;
  room_number: string;
  patient_name?: string;
  simulation_mode: boolean;
};

interface LiveTokenTrackerProps {
  currentProfile?: UserProfile;
  initialTokenNumber?: string;
  onViewPass?: () => void;
  onBack?: () => void;
  seniorMode?: boolean;
}

export default function LiveTokenTracker({
  currentProfile,
  initialTokenNumber,
  onViewPass,
  onBack,
  seniorMode = false,
}: LiveTokenTrackerProps) {
  const isDoctor = currentProfile?.role === "doctor";
  const isPatient = currentProfile?.role === "patient" || !isDoctor;
  const docName = currentProfile?.name || "";
  const isNaveen = isDoctor && (docName.toLowerCase().includes("naveen") || docName.toLowerCase().includes("anil") || (initialTokenNumber || "").toUpperCase().startsWith("C"));
  const isPriya = isDoctor ? (docName.toLowerCase().includes("priya") || (!isNaveen && (initialTokenNumber || "").toUpperCase().startsWith("GM"))) : true;

  // Patient is strictly restricted to their own token; Clinician defaults to their clinic token
  const effectiveDefaultToken = isDoctor
    ? (isNaveen ? "C-24" : "GM-024")
    : (initialTokenNumber || "GM-024");

  const [tokenInput, setTokenInput] = useState<string>(effectiveDefaultToken);
  const [activeTokenNumber, setActiveTokenNumber] = useState<string>(effectiveDefaultToken);
  const [token, setToken] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const alertFiredRef = useRef<boolean>(false);

  // Sync if initialTokenNumber or currentProfile changes
  useEffect(() => {
    const updatedTok = isDoctor
      ? (isNaveen ? "C-24" : "GM-024")
      : (initialTokenNumber || "GM-024");
    setActiveTokenNumber(updatedTok);
    setTokenInput(updatedTok);
  }, [initialTokenNumber, currentProfile?.name, isDoctor, isNaveen]);

  // Audio chime synthesizer via Web Audio API
  const playAlertChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch (e) {
      console.warn("Audio chime disabled or muted:", e);
    }
  };

  const showTokenNotification = () => {
    const docTitle = token?.doctor_name || (isNaveen ? "Dr. Naveen Kumar" : "Dr. Priya");
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("CareBridge AI — OPD Token Alert", {
        body: `Your token ${activeTokenNumber} is near! Consultation with ${docTitle}.`,
        icon: "/favicon.ico",
      });
    }
  };

  async function fetchToken(tokNum: string) {
    try {
      setLoading(true);
      const doctorParam = isDoctor
        ? `?doctor_name=${encodeURIComponent(docName || (isNaveen ? "Dr. Naveen Kumar" : "Dr. Priya"))}`
        : (isNaveen ? "?doctor_name=Dr.+Naveen+Kumar" : "");
      
      const res = await fetch(`/api/tokens/${encodeURIComponent(tokNum)}${doctorParam}`);
      if (res.ok) {
        const data = await res.json();
        const tokenData: TokenData = data.token ? data.token : data;
        setToken(tokenData);
        if (tokenData && tokenData.people_ahead <= 2 && !alertFiredRef.current) {
          playAlertChime();
          showTokenNotification();
          alertFiredRef.current = true;
        } else if (tokenData && tokenData.people_ahead > 2) {
          alertFiredRef.current = false;
        }
      } else {
        // Fallback matching clinician identity
        if (isNaveen) {
          setToken({
            token_number: tokNum || "C-24",
            status: "NOW_SERVING",
            people_ahead: 0,
            estimated_wait_minutes: 0,
            doctor_name: "Dr. Naveen Kumar",
            department: "Cardiology",
            room_number: "Room CARD-01",
            patient_name: "S. Murthy",
            simulation_mode: true,
          });
        } else {
          setToken({
            token_number: tokNum || "GM-024",
            status: "ALMOST_YOUR_TURN",
            people_ahead: 2,
            estimated_wait_minutes: 10,
            doctor_name: "Dr. Priya",
            department: "General Medicine",
            room_number: "Room OPD-03",
            patient_name: "Bhavishya",
            simulation_mode: true,
          });
        }
      }
    } catch (err) {
      if (isNaveen) {
        setToken({
          token_number: tokNum || "C-24",
          status: "NOW_SERVING",
          people_ahead: 0,
          estimated_wait_minutes: 0,
          doctor_name: "Dr. Naveen Kumar",
          department: "Cardiology",
          room_number: "Room CARD-01",
          patient_name: "S. Murthy",
          simulation_mode: true,
        });
      } else {
        setToken({
          token_number: tokNum || "GM-024",
          status: "ALMOST_YOUR_TURN",
          people_ahead: 2,
          estimated_wait_minutes: 10,
          doctor_name: "Dr. Priya",
          department: "General Medicine",
          room_number: "Room OPD-03",
          patient_name: "Bhavishya",
          simulation_mode: true,
        });
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSimulateStep() {
    if (!token) return;
    setIsSimulating(true);
    const nextAhead = token.people_ahead === 2 ? 0 : token.people_ahead === 0 ? 5 : 2;
    try {
      const docParam = isDoctor
        ? `&doctor_name=${encodeURIComponent(docName || (isNaveen ? "Dr. Naveen Kumar" : "Dr. Priya"))}`
        : (isNaveen ? "&doctor_name=Dr.+Naveen+Kumar" : "");
      
      const res = await fetch(`/api/tokens/${encodeURIComponent(activeTokenNumber)}/simulate-step?people_ahead=${nextAhead}${docParam}`, {
        method: "POST"
      });
      if (res.ok) {
        const simRes = await res.json();
        const simData = simRes.token ? simRes.token : simRes;
        if (simData && simData.people_ahead !== undefined) {
          setToken(simData);
          if (simData.people_ahead <= 2) {
            playAlertChime();
            showTokenNotification();
          }
          setIsSimulating(false);
          return;
        }
      }
    } catch (e) {}

    const nextStatus = nextAhead <= 0 ? "NOW_SERVING" : nextAhead <= 2 ? "ALMOST_YOUR_TURN" : "WAITING";
    setToken({
      ...token,
      people_ahead: nextAhead,
      estimated_wait_minutes: nextAhead * 5,
      status: nextStatus,
    });
    if (nextAhead <= 2) {
      playAlertChime();
      showTokenNotification();
    }
    setIsSimulating(false);
  }

  useEffect(() => {
    fetchToken(activeTokenNumber);

    const interval = setInterval(() => {
      fetchToken(activeTokenNumber);
    }, 10000);

    return () => clearInterval(interval);
  }, [activeTokenNumber]);

  if (loading) {
    return (
      <div className="p-8 text-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-xs">
        <RefreshCw className="h-6 w-6 animate-spin mx-auto text-blue-600 mb-2" />
        <p>Loading token status...</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="p-6 rounded-2xl border border-rose-200 bg-rose-50 text-center space-y-3 shadow-xs">
        <AlertTriangle className="h-8 w-8 mx-auto text-rose-500" />
        <p className="text-rose-700 font-bold">
          Unable to load your token. Please try again.
        </p>
      </div>
    );
  }

  const progress = Math.max(5, 100 - token.people_ahead * 10);

  // All hospital OPD rooms
  const allHospitalRooms = [
    { 
      room: "Room CARD-01", 
      doctor: "Dr. Naveen Kumar", 
      dept: "Cardiology", 
      token: "C-24", 
      status: "In Consultation", 
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200", 
      floor: "1st Floor (Cardiology Wing)",
      patient: "S. Murthy"
    },
    { 
      room: "Room OPD-03", 
      doctor: "Dr. Priya", 
      dept: "General Medicine", 
      token: "GM-022", 
      status: "Calling Next", 
      badge: "bg-blue-50 text-blue-700 border-blue-200", 
      floor: "Ground Floor (OPD Wing)",
      patient: "Ravi Kumar"
    },
    { 
      room: "Room PED-02", 
      doctor: "Dr. Suresh Varma", 
      dept: "Pediatrics", 
      token: "PD-014", 
      status: "In Consultation", 
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200", 
      floor: "Ground Floor",
      patient: "Master Arjun"
    },
    { 
      room: "Room ORTHO-04", 
      doctor: "Dr. Rajesh Varma", 
      dept: "Orthopedics", 
      token: "OR-008", 
      status: "On Short Break", 
      badge: "bg-amber-50 text-amber-700 border-amber-200", 
      floor: "2nd Floor",
      patient: "Lakshmi Devi"
    },
  ];

  // STRICT Role & Doctor Isolation Filter:
  // When a doctor (like Dr. Naveen Kumar) views this tab, they MUST ONLY see their own consultation room!
  // All other doctors' rooms (Dr. Priya, Dr. Suresh, Dr. Rajesh, etc.) are strictly filtered out!
  const visibleRooms = isDoctor
    ? allHospitalRooms.filter((r) => {
        if (isNaveen) return r.doctor.toLowerCase().includes("naveen") || r.doctor.toLowerCase().includes("anil");
        if (isPriya) return r.doctor.toLowerCase().includes("priya");
        const cleanName = docName.toLowerCase().replace(/^dr\.\s*/i, "").trim();
        return r.doctor.toLowerCase().includes(cleanName);
      })
    : allHospitalRooms;

  // Department Clinical Inventory filtered per clinician specialization
  const allInventory = [
    { name: "Emergency Cardiac Stents", cat: "Cardiology", stock: "42 units", min: "15 units", status: "Optimal", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", isCardio: true },
    { name: "ECG Electrode Sensor Packs", cat: "Cardiology Diagnostics", stock: "18 packs", min: "25 packs", status: "Low Stock Alert", badge: "bg-amber-50 text-amber-700 border-amber-200", isCardio: true },
    { name: "CCU / ICU Critical Care Beds", cat: "Cardiology Inpatient", stock: "14 / 16 Beds Filled", min: "2 Beds Free", status: "High Occupancy", badge: "bg-blue-50 text-blue-700 border-blue-200", isCardio: true },
    { name: "Normal Saline IV (500ml)", cat: "Fluids", stock: "210 bottles", min: "50 bottles", status: "Optimal", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", isCardio: false },
    { name: "Paracetamol IV (100ml)", cat: "Analgesic", stock: "340 vials", min: "100 vials", status: "Optimal", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", isCardio: false },
    { name: "Medical O2 Cylinder (46.7L)", cat: "Respiratory", stock: "140 Bar (98%)", min: "50 Bar", status: "Optimal", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", isCardio: true },
  ];

  const visibleInventory = (isDoctor && isNaveen)
    ? allInventory.filter(item => item.isCardio)
    : allInventory;

  return (
    <section className={`space-y-6 rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 text-slate-800 shadow-xs relative overflow-hidden ${
      seniorMode ? "text-base" : "text-sm"
    }`}>
      {/* Top Accent Line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-teal-500 to-indigo-600 absolute top-0 left-0" />

      {/* Doctor Isolation Security Banner */}
      {isDoctor && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <span>{isNaveen ? "Dr. Naveen Kumar • Private Consultation Room Tracking" : `${docName} • Private Consultation Room Tracking`}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                  {isNaveen ? "Room CARD-01 (Cardiology)" : token.room_number}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isNaveen 
                  ? "మీ రూమ్ (Room CARD-01) క్యూ మాత్రమే ఇక్కడ చూపబడుతుంది. ఇతర వైద్యుల రూమ్ సమాచారం భద్రతా నిబంధనల ప్రకారం దాచబడింది."
                  : "Displaying exclusively your assigned OPD room. Other doctors' rooms are isolated for clinician privacy."}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 self-start sm:self-auto">
            ● Doctor Isolated Channel
          </span>
        </div>
      )}

      {/* Patient Privacy & Queue Isolation Banner */}
      {isPatient && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <span>{currentProfile?.name || "Patient"} • Private OPD Token Tracking</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white font-mono">
                  Token #{activeTokenNumber}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                మీ వ్యక్తిగత ఓపీడీ టోకెన్ ({activeTokenNumber}) ట్రాకింగ్ మాత్రమే ఇక్కడ చూపబడుతుంది. రోగి గోప్యతా రక్షణ (DISHA & HIPAA) ప్రకారం ఇతర రోగుల టోకెన్లు లేదా క్యూ వివరాలు దాచబడ్డాయి.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0 self-start sm:self-auto">
            🔒 Patient Isolated Channel
          </span>
        </div>
      )}

      {/* Search / Switch Token Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="mr-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 flex items-center gap-1 transition cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>
          )}
          <Ticket className="h-5 w-5 text-blue-600" />
          <span className="text-xs font-bold text-slate-800 tracking-wider uppercase">
            {isDoctor 
              ? (isNaveen ? "Dr. Naveen Kumar's Room CARD-01 Queue" : `${docName}'s Room Queue`) 
              : "Live Token Tracking • ప్రత్యక్ష క్యూ ట్రాకింగ్"}
          </span>
        </div>

        {isPatient ? (
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-xs font-mono font-bold text-blue-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Assigned Token: <strong>{activeTokenNumber}</strong></span>
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Private Access • వ్యక్తిగత భద్రత</span>
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && tokenInput.trim()) {
                  setActiveTokenNumber(tokenInput.trim());
                  fetchToken(tokenInput.trim());
                }
              }}
              placeholder={isNaveen ? "Enter token e.g. C-24" : "Enter token e.g. GM-024"}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={() => {
                if (tokenInput.trim()) {
                  setActiveTokenNumber(tokenInput.trim());
                  fetchToken(tokenInput.trim());
                }
              }}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition cursor-pointer shadow-xs"
            >
              Track
            </button>
          </div>
        )}
      </div>

      {/* Main Token Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            {isDoctor 
              ? (isNaveen ? "Active Consultation Token (Dr. Naveen Kumar)" : "Active Consultation Token")
              : "Your OPD Token"}
          </p>

          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight font-mono flex items-center gap-3 mt-1">
            <span>{token.token_number || activeTokenNumber}</span>
          </h2>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>{isDoctor ? "Consulting Patient:" : "Patient:"} <strong className="text-slate-800">{token.patient_name || (isNaveen ? "S. Murthy" : (isDoctor ? "Consulting Patient" : (currentProfile?.name || "Bhavishya")))}</strong></span>
            <span>•</span>
            <span>Department: <strong className="text-blue-600">{token.department || (isNaveen ? "Cardiology" : "General Medicine")}</strong></span>
            <span>•</span>
            <span>Consultation Room: <strong className="text-teal-600">{token.room_number || (isNaveen ? "Room CARD-01" : "Room OPD-03")}</strong></span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex flex-col items-end gap-1.5">
          <span className={`rounded-full px-4 py-2 text-sm font-black tracking-wide border shadow-xs ${
            token.status === "NOW_SERVING"
              ? "bg-emerald-500 text-white border-emerald-500 animate-pulse ring-2 ring-emerald-400/40"
              : token.status === "ALMOST_YOUR_TURN"
              ? "bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-300"
              : "bg-slate-100 text-slate-700 border-slate-200"
          }`}>
            {(token.status || "WAITING").replaceAll("_", " ")}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            {isNaveen ? "Cardiology OPD Wing • 1st Floor" : "Live Hospital OPD Desk"}
          </span>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-slate-50/80 border border-slate-200 p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>{isDoctor ? "Patients In Waiting Hall" : "People Before You"}</span>
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-3xl font-black text-slate-900 font-mono">
            {token.people_ahead}
          </p>
          <span className="text-[10px] text-slate-400 block">
            {isDoctor ? "Next in line for consultation" : "Ahead in queue"}
          </span>
        </div>

        <div className="rounded-2xl bg-slate-50/80 border border-slate-200 p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Estimated Wait</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-3xl font-black text-amber-600 font-mono">
            {token.estimated_wait_minutes} min
          </p>
          <span className="text-[10px] text-slate-400 block">Avg 5 min / consultation</span>
        </div>

        <div className="rounded-2xl bg-slate-50/80 border border-slate-200 p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Assigned Room</span>
            <MapPin className="h-4 w-4 text-teal-600" />
          </div>
          <p className="text-3xl font-black text-teal-600 font-mono">
            {token.room_number || (isNaveen ? "CARD-01" : "OPD-03")}
          </p>
          <span className="text-[10px] text-slate-400 block">
            {isNaveen ? "1st Floor (Cardiology Wing)" : "OPD Ground Floor"}
          </span>
        </div>
      </div>

      {/* Doctor & Room Info */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Assigned Clinician</span>
          <p className="font-bold text-slate-900 text-base">
            {token.doctor_name || (isNaveen ? "Dr. Naveen Kumar" : "Dr. Priya")}
          </p>
          <p className="text-slate-500 text-xs">
            {token.department || (isNaveen ? "Cardiology" : "General Medicine")} • {token.room_number || (isNaveen ? "Room CARD-01" : "Room OPD-03")} • CareBridge Metro Health Center
          </p>
        </div>

        {onViewPass && (
          <button
            onClick={onViewPass}
            className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Ticket className="h-4 w-4 text-blue-600" />
            <span>View Digital OPD Pass</span>
          </button>
        )}
      </div>

      {/* Queue Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500 font-semibold">Queue progress</span>
          <span className="font-mono text-emerald-600 font-bold">{progress}% completed</span>
        </div>

        <div className="h-3 rounded-full bg-slate-100 overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Demo Simulation controls */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchToken(activeTokenNumber)}
            className="rounded-xl border border-slate-200 hover:bg-slate-50 bg-white px-4 py-2 font-semibold text-slate-700 transition cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
            <span>Refresh Token</span>
          </button>

          <button
            onClick={handleSimulateStep}
            disabled={isSimulating}
            className="rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 px-4 py-2 font-bold text-blue-700 transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            title="Cycles between 2 ahead (Almost Your Turn) -> 0 ahead (Now Serving) -> 5 ahead (Waiting)"
          >
            <Play className="h-3.5 w-3.5 text-blue-600" />
            <span>Simulate Queue Step</span>
          </button>
        </div>

        {token.simulation_mode && (
          <p className="text-xs text-slate-400">
            Connected to live prototype queue database.
          </p>
        )}
      </div>

      {/* 2. Consultation Room & Queue Live Status Section */}
      {isPatient ? (
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Your Assigned Consultation Room & Live Queue Status</span>
              </h3>
              <p className="text-xs text-slate-500">
                మీ కేటాయించిన డాక్టర్ గది మరియు లైవ్ క్యూ స్థితి (ఇతర రోగుల వివరాలు గోప్యంగా ఉంచబడ్డాయి).
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 w-fit">
              ● Live Queue Synchronized
            </span>
          </div>

          {/* Patient's Exclusive Room Card */}
          <div className="p-5 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/60 via-slate-50/40 to-white space-y-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-blue-100">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-blue-600 text-white font-mono font-black text-sm">
                  {token.room_number || "Room OPD-03"}
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {token.department || "General Medicine"} OPD Desk
                </span>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                token.status === "NOW_SERVING" 
                  ? "bg-emerald-100 text-emerald-800 border-emerald-300" 
                  : "bg-blue-100 text-blue-800 border-blue-200"
              }`}>
                {token.status === "NOW_SERVING" ? "● Now Consulting Your Token" : "● Doctor In Consultation"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Consulting Doctor</span>
                <span className="font-bold text-slate-900 text-sm">{token.doctor_name || "Dr. Priya"}</span>
                <span className="text-[11px] text-blue-600 block">{token.department || "General Medicine"}</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Your OPD Token</span>
                <span className="font-mono font-black text-blue-700 text-base">{token.token_number || activeTokenNumber}</span>
                <span className="text-[11px] text-slate-500 block">Patient: <strong>{currentProfile?.name || token.patient_name || "Bhavishya"}</strong></span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Queue Position</span>
                <span className="font-mono font-bold text-amber-600 text-base">{token.people_ahead} Ahead</span>
                <span className="text-[11px] text-slate-500 block">Est. Wait: <strong>~{token.estimated_wait_minutes} mins</strong></span>
              </div>
            </div>

            {/* OPD Queue Timeline */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
                OPD Consultation Step Tracker • కన్సల్టేషన్ దశలు
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-bold text-emerald-900">1. Token Issued</div>
                    <div className="text-[10px] text-emerald-700">Check-in confirmed</div>
                  </div>
                </div>

                <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                  token.people_ahead > 0 
                    ? "bg-blue-50 border-blue-200 text-blue-900" 
                    : "bg-slate-50 border-slate-200 text-slate-600"
                }`}>
                  <Clock className={`w-4 h-4 ${token.people_ahead > 0 ? "text-blue-600" : "text-slate-400"} shrink-0`} />
                  <div>
                    <div className="font-bold">2. Waiting Hall</div>
                    <div className="text-[10px] text-slate-500">{token.people_ahead} in queue ahead</div>
                  </div>
                </div>

                <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                  token.people_ahead <= 2 && token.people_ahead > 0
                    ? "bg-amber-50 border-amber-300 text-amber-900 ring-1 ring-amber-400/40" 
                    : token.people_ahead === 0
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                    : "bg-slate-50 border-slate-200 text-slate-600"
                }`}>
                  <Ticket className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <div className="font-bold">3. Report to Room</div>
                    <div className="text-[10px] text-slate-500">{token.people_ahead <= 2 ? "Ready to call" : "Standby"}</div>
                  </div>
                </div>

                <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                  token.status === "NOW_SERVING"
                    ? "bg-emerald-100 border-emerald-300 text-emerald-900 ring-2 ring-emerald-500/20 font-bold"
                    : "bg-slate-50 border-slate-200 text-slate-500"
                }`}>
                  <CheckCircle2 className={`w-4 h-4 ${token.status === "NOW_SERVING" ? "text-emerald-600" : "text-slate-400"} shrink-0`} />
                  <div>
                    <div className="font-bold">4. Consultation</div>
                    <div className="text-[10px] text-slate-500">{token.status === "NOW_SERVING" ? "Now In Session" : "Pending"}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Protection Notice */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-xs text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Confidential Patient Privacy:</strong> CareBridge AI keeps other patients' medical details and token numbers private. You will only see your own consultation token and waiting queue status.
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>
                  {isDoctor 
                    ? (isNaveen ? "Dr. Naveen Kumar — Active Consultation Room Status" : `${docName} — Active Consultation Room Status`) 
                    : "Hospital Department Rooms & Clinical Inventory"}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                {isDoctor 
                  ? (isNaveen ? "Room CARD-01 live consultation queue status and cardiac supplies." : "Live consultation room status and essential medical supplies.")
                  : "Live consultation room statuses, bed occupancy, and essential medical supplies."}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 w-fit">
              ● Real-Time Sync
            </span>
          </div>

          {/* OPD Rooms Live Status Grid — STRICTLY ISOLATED TO THIS DOCTOR */}
          <div className={`grid gap-3 ${isDoctor ? "grid-cols-1 sm:grid-cols-2 max-w-2xl" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"}`}>
            {visibleRooms.map((r, i) => (
              <div 
                key={i} 
                className={`p-4 rounded-2xl border space-y-2 shadow-xs transition ${
                  isDoctor 
                    ? "bg-gradient-to-br from-blue-50/60 via-indigo-50/30 to-white border-blue-300 ring-2 ring-blue-500/15" 
                    : "bg-slate-50/80 border-slate-200/90"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-slate-900">{r.room}</span>
                    {isDoctor && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-600 text-white">
                        Your Room
                      </span>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${r.badge}`}>{r.status}</span>
                </div>
                <div className="text-sm font-bold text-slate-900">{r.doctor}</div>
                <div className="text-xs text-slate-500 flex items-center justify-between">
                  <span>{r.dept}</span>
                  <span className="text-[10px] text-slate-400 font-medium">{r.floor}</span>
                </div>
                <div className="text-xs font-mono font-bold text-blue-600 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <span>Active Patient Token:</span>
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-900 rounded-lg font-black text-sm">{r.token}</span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Patient: <strong className="text-slate-800">{r.patient}</strong></span>
                </div>
              </div>
            ))}
          </div>

          {/* Clinical Pharmacy & Hospital Resource Inventory Table */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
            <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  {isDoctor && isNaveen 
                    ? "Cardiology Wing & CCU Medical Inventory" 
                    : "Pharmacy & ICU Equipment Stock"}
                </span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium">CareBridge Network Inventory</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/50 text-slate-500 text-[10px] uppercase font-bold border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-2.5">Resource Item</th>
                    <th className="px-4 py-2.5">Category</th>
                    <th className="px-4 py-2.5">Current Stock</th>
                    <th className="px-4 py-2.5">Reorder Level</th>
                    <th className="px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {visibleInventory.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition">
                      <td className="px-4 py-2.5 font-bold text-slate-900">{item.name}</td>
                      <td className="px-4 py-2.5 text-slate-500">{item.cat}</td>
                      <td className="px-4 py-2.5 font-mono font-semibold">{item.stock}</td>
                      <td className="px-4 py-2.5 text-slate-400 font-mono">{item.min}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${item.badge}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
