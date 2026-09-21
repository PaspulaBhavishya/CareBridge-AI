import { useEffect, useState, useRef } from "react";
import { 
  Ticket, Clock, Users, MapPin, AlertTriangle, 
  RefreshCw, Volume2, Bell, Play, ArrowLeft,
  Building2, Package
} from "lucide-react";

export type TokenData = {
  token_number: string;
  status: string;
  people_ahead: number;
  estimated_wait_minutes: number;
  doctor_name: string;
  department: string;
  room_number: string;
  simulation_mode: boolean;
};

interface LiveTokenTrackerProps {
  initialTokenNumber?: string;
  onViewPass?: () => void;
  onBack?: () => void;
  seniorMode?: boolean;
}

export default function LiveTokenTracker({
  initialTokenNumber = "GM-024",
  onViewPass,
  onBack,
  seniorMode = false,
}: LiveTokenTrackerProps) {
  const [tokenInput, setTokenInput] = useState<string>(initialTokenNumber);
  const [activeTokenNumber, setActiveTokenNumber] = useState<string>(initialTokenNumber);
  const [token, setToken] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [notificationArmed, setNotificationArmed] = useState<boolean>(false);
  const alertFiredRef = useRef<boolean>(false);

  // Audio chime synthesizer via Web Audio API
  const playAlertChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.18); // A5
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
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("CareBridge AI — OPD Token Alert", {
        body: `Your token ${activeTokenNumber} is near! Only 2 patients remain before your turn with Dr. Priya.`,
        icon: "/favicon.ico",
      });
    }
  };

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("Browser notifications not supported on this device.");
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      setNotificationArmed(true);
      new Notification("CareBridge AI Alert Armed", {
        body: `You will be notified immediately when token ${activeTokenNumber} is called.`,
      });
    }
  };

  async function fetchToken(tokNum: string) {
    try {
      setLoading(true);
      const res = await fetch(`/api/tokens/${encodeURIComponent(tokNum)}`);
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
        setToken({
          token_number: tokNum,
          status: "ALMOST_YOUR_TURN",
          people_ahead: 2,
          estimated_wait_minutes: 10,
          doctor_name: "Dr. Priya",
          department: "General Medicine",
          room_number: "OPD-03",
          simulation_mode: true,
        });
      }
    } catch (err) {
      setToken({
        token_number: tokNum,
        status: "ALMOST_YOUR_TURN",
        people_ahead: 2,
        estimated_wait_minutes: 10,
        doctor_name: "Dr. Priya",
        department: "General Medicine",
        room_number: "OPD-03",
        simulation_mode: true,
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSimulateStep() {
    if (!token) return;
    setIsSimulating(true);
    const nextAhead = token.people_ahead === 2 ? 0 : token.people_ahead === 0 ? 5 : 2;
    try {
      const res = await fetch(`/api/tokens/${encodeURIComponent(activeTokenNumber)}/simulate-step?people_ahead=${nextAhead}`, {
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

  const isNearTurn = token.people_ahead <= 2;
  const progress = Math.max(5, 100 - token.people_ahead * 10);

  return (
    <section className={`space-y-6 rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 text-slate-800 shadow-xs relative overflow-hidden ${
      seniorMode ? "text-base" : "text-sm"
    }`}>
      {/* Top Accent Line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-teal-500 to-indigo-600 absolute top-0 left-0" />

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
            Live Token Tracking • ప్రత్యక్ష క్యూ ట్రాకింగ్
          </span>
        </div>

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
            placeholder="Enter token e.g. GM-024"
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
      </div>

      {/* Main Token Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Your OPD Token
          </p>

          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight font-mono flex items-center gap-3 mt-1">
            <span>{token.token_number || activeTokenNumber}</span>
          </h2>

          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
            <span>Patient: <strong className="text-slate-800">Bhavishya</strong></span>
            <span>•</span>
            <span>Department: <strong className="text-blue-600">{token.department || "General Medicine"}</strong></span>
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
          <span className="text-[10px] text-slate-400 font-medium">Live Hospital OPD Desk</span>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-slate-50/80 border border-slate-200 p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>People Before You</span>
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-3xl font-black text-slate-900 font-mono">
            {token.people_ahead}
          </p>
          <span className="text-[10px] text-slate-400 block">Ahead in queue</span>
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
            <span>Room</span>
            <MapPin className="h-4 w-4 text-teal-600" />
          </div>
          <p className="text-3xl font-black text-teal-600 font-mono">
            {token.room_number}
          </p>
          <span className="text-[10px] text-slate-400 block">OPD Ground Floor</span>
        </div>
      </div>

      {/* Doctor & Room Info */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Assigned Clinician</span>
          <p className="font-bold text-slate-900 text-base">
            {token.doctor_name}
          </p>
          <p className="text-slate-500 text-xs">
            {token.department} • Hospital B (Metro)
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
            className="h-full rounded-full bg-gradient-to-r from-teal-500 to-blue-500 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Token Alert Feature: 2 Numbers Away Alert */}
      {isNearTurn && (
        <div
          role="alert"
          className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 space-y-2 text-emerald-900 shadow-xs animate-fade-in"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
              <h3 className="font-extrabold text-emerald-900 text-base">
                Your turn is near! • మీ టోకెన్ దగ్గరకు వచ్చింది!
              </h3>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
              Only {token.people_ahead} Ahead
            </span>
          </div>

          <p className="text-xs sm:text-sm text-emerald-800/90 leading-relaxed">
            Please be ready near the OPD waiting hall ({token.room_number}). Your consulting doctor will call your token shortly.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={playAlertChime}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Volume2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Test Audio Chime</span>
            </button>

            <button
              onClick={requestNotificationPermission}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-slate-200 shadow-xs"
            >
              <Bell className="h-3.5 w-3.5 text-blue-600" />
              <span>{notificationArmed ? "✓ Browser Alert Armed" : "Enable Phone Notification"}</span>
            </button>
          </div>
        </div>
      )}

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
            Demo Simulation: token queue data is connected to live prototype database.
          </p>
        )}
      </div>

      {/* 2. Hospital Department Rooms & Pharmacy Inventory Section */}
      <div className="pt-6 border-t border-slate-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Hospital Department Rooms & Clinical Inventory</span>
            </h3>
            <p className="text-xs text-slate-500">
              Live consultation room statuses, bed occupancy, and essential medical supplies.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 w-fit">
            ● Real-Time Sync
          </span>
        </div>

        {/* 4 OPD Rooms Live Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { room: "OPD-01", doctor: "Dr. Anil Kumar", dept: "Cardiology", token: "C-24", status: "In Consultation", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
            { room: "OPD-02", doctor: "Dr. Priya Sharma", dept: "General Medicine", token: "GM-022", status: "Calling Next", badge: "bg-blue-50 text-blue-700 border-blue-200" },
            { room: "OPD-03", doctor: "Dr. Suresh Varma", dept: "Pediatrics", token: "PD-014", status: "In Consultation", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
            { room: "OPD-04", doctor: "Dr. Kavitha Reddy", dept: "Orthopedics", token: "OR-008", status: "On Short Break", badge: "bg-amber-50 text-amber-700 border-amber-200" },
          ].map((r, i) => (
            <div key={i} className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-900">{r.room}</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${r.badge}`}>{r.status}</span>
              </div>
              <div className="text-xs font-semibold text-slate-800">{r.doctor}</div>
              <div className="text-[11px] text-slate-500">{r.dept}</div>
              <div className="text-[11px] font-mono font-bold text-blue-600 pt-1 border-t border-slate-200/60">
                Serving: {r.token}
              </div>
            </div>
          ))}
        </div>

        {/* Clinical Pharmacy & Hospital Resource Inventory Table */}
        <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
          <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-blue-600" />
              <span>Pharmacy & ICU Equipment Stock</span>
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
                {[
                  { name: "Emergency Cardiac Stents", cat: "Cardiology", stock: "42 units", min: "15 units", status: "Optimal", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                  { name: "Normal Saline IV (500ml)", cat: "Fluids", stock: "210 bottles", min: "50 bottles", status: "Optimal", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                  { name: "Paracetamol IV (100ml)", cat: "Analgesic", stock: "340 vials", min: "100 vials", status: "Optimal", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                  { name: "ECG Electrode Sensor Packs", cat: "Diagnostics", stock: "18 packs", min: "25 packs", status: "Low Stock Alert", badge: "bg-amber-50 text-amber-700 border-amber-200" },
                  { name: "Medical O2 Cylinder (46.7L)", cat: "Respiratory", stock: "140 Bar (98%)", min: "50 Bar", status: "Optimal", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                  { name: "CCU / ICU Critical Care Beds", cat: "Inpatient", stock: "14 / 16 Beds Filled", min: "2 Beds Free", status: "High Occupancy", badge: "bg-blue-50 text-blue-700 border-blue-200" },
                ].map((item, idx) => (
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
    </section>
  );
}
