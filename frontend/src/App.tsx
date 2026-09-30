import { useState, useEffect } from 'react';
import { USER_PROFILES } from './components/Header';
import { MedicalErpSidebar } from './components/MedicalErpSidebar';
import { MedicalErpHeader } from './components/MedicalErpHeader';
import { MedicalErpDashboard } from './components/MedicalErpDashboard';
import { RegistrationPage } from './components/RegistrationPage';
import { JudgeDemoBar } from './components/JudgeDemoBar';
import { ChatInterface } from './components/ChatInterface';
import { SmartFlowDashboard } from './components/SmartFlowDashboard';
import { StaffScheduler } from './components/StaffScheduler';
import { AuditLogViewer } from './components/AuditLogViewer';
import { DigitalOPDPassModal } from './components/DigitalOPDPassModal';
import { EmergencySOSModal } from './components/EmergencySOSModal';
import { AuthPortal } from './components/AuthPortal';
import { DoctorDashboard } from './components/DoctorDashboard';
import { BottomRoleSwitcher } from './components/BottomRoleSwitcher';
import { MedicalReportScanner } from './components/MedicalReportScanner';
import { WaitingHallTVDisplay } from './components/WaitingHallTVDisplay';
import { WalkinTokenKiosk } from './components/WalkinTokenKiosk';
import { CareBridgeAccessMode } from './components/CareBridgeAccessMode';
import { AIEvaluationDashboard } from './components/AIEvaluationDashboard';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { SafetyCenterModal } from './components/SafetyCenterModal';
import { PatientDashboard } from './components/PatientDashboard';
import LiveTokenTracker from './components/LiveTokenTracker';
import SmartFlowRecommendation from './components/SmartFlowRecommendation';
import PatientJourneyTracker from './components/PatientJourneyTracker';
import { AgentTimeline } from './components/AgentTimeline';
import type { TimelineStep } from './components/AgentTimeline';
import { ApprovalModal } from './components/ApprovalModal';
import { RecoveryAlertBanner } from './components/RecoveryAlertBanner';
import { SmartFlowPanel } from './components/SmartFlowPanel';
import { CareBridgeRecoveryMode } from './components/CareBridgeRecoveryMode';
import { PrivacyConsentDashboard } from './components/PrivacyConsentDashboard';
import { AgentSessionReplay } from './components/AgentSessionReplay';
import { SafetyContractPanel } from './components/SafetyContractPanel';
import { TechnicalArchitectureModal } from './components/TechnicalArchitectureModal';
import { Ticket, Pill, Stethoscope, CheckCircle2, MessageSquare, Inbox, Trash2, RefreshCw } from 'lucide-react';
import type { 
  UserRole, UserProfile, ChatMessage, HospitalStatus, 
  AppointmentRecord, ScheduleConflictRecord, AuditLogEntry, DigitalPassData,
  NotificationItem
} from './types';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>([]);
  const [currentProfile, setCurrentProfile] = useState<UserProfile>(USER_PROFILES.doctor || USER_PROFILES.patient);
  const [language, setLanguage] = useState<string>('auto');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeScenario, setActiveScenario] = useState<number | null>(null);
  const [trackedTokenNumber, setTrackedTokenNumber] = useState<string>("GM-024");

  // CareBridge AI 2.0 Multi-Agent States
  const [activeApproval, setActiveApproval] = useState<any | null>(null);
  const [latestTimeline, setLatestTimeline] = useState<TimelineStep[]>([
    {
      agent: 'Supervisor Agent',
      tool: 'orchestrate_request',
      status: 'completed',
      timestamp: 'Active',
      summary: 'Supervisor Agent ready. Coordinated with 7 specialized agents.',
      risk_level: 'LOW',
      latency_ms: 2.5
    }
  ]);

  // New User-Centric States
  const [seniorMode, setSeniorMode] = useState<boolean>(false);
  const [selectedPass, setSelectedPass] = useState<DigitalPassData | null>(null);
  const [isEmergencySOSOpen, setIsEmergencySOSOpen] = useState<boolean>(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [isSafetyCenterOpen, setIsSafetyCenterOpen] = useState<boolean>(false);
  const [isSafetyContractOpen, setIsSafetyContractOpen] = useState<boolean>(false);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'Booking Confirmed • టోకెన్ ఖరారు',
      message: 'Your consultation with Dr. Ananya Sen is confirmed for 10:30 AM tomorrow at CareBridge Metro Health Center (Room 204). Assigned Token #14.',
      type: 'booking_confirm',
      timestamp: 'Today at 09:15 AM',
      is_read: false
    },
    {
      id: 'notif-2',
      title: 'OPD Queue Status',
      message: 'CareBridge Metro Cardiology OPD is operating on schedule. Current serving token is #11.',
      type: 'general',
      timestamp: 'Today at 09:45 AM',
      is_read: true
    }
  ]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'agent',
      text: "Hello! I am **CareBridge AI**, your intelligent hospital coordination and administrative automation agent.\n\nI can help you coordinate appointments across our hospital network with simulated low waiting times, audit staff schedules, and answer hospital policy questions. You can type or use the **🎙️ Mic** button to speak in English or Telugu!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [hospitals, setHospitals] = useState<HospitalStatus[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [conflicts, setConflicts] = useState<ScheduleConflictRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  // Refresh data from FastAPI backend
  const fetchData = async () => {
    try {
      const usersUrl = currentProfile?.role 
        ? `/api/users?actor_role=${currentProfile.role}&current_user_id=${currentProfile.id}`
        : '/api/users';

      const [hospRes, apptRes, confRes, logRes, usersRes, notifRes] = await Promise.all([
        fetch('/api/hospitals'),
        fetch('/api/appointments'),
        fetch('/api/conflicts'),
        fetch('/api/audit-logs'),
        fetch(usersUrl),
        fetch('/api/notifications')
      ]);

      if (hospRes.ok) setHospitals(await hospRes.json());
      if (apptRes.ok) setAppointments(await apptRes.json());
      if (confRes.ok) {
        const confData = await confRes.json();
        setConflicts(confData.conflicts || []);
      }
      if (logRes.ok) setAuditLogs(await logRes.json());
      if (usersRes.ok) {
        const usersData: UserProfile[] = await usersRes.json();
        setRegisteredUsers(usersData);
        // Keep currentProfile synchronized with updated database record safely
        setCurrentProfile((prev) => {
          const matched = usersData.find((u) => u.id === prev.id && (u.role === prev.role || !prev.role));
          return matched ? { ...prev, ...matched } : prev;
        });
      }
      if (notifRes && notifRes.ok) {
        const notifs = await notifRes.json();
        if (Array.isArray(notifs) && notifs.length > 0) {
          setNotifications(notifs);
        }
      }
    } catch (err) {
      console.warn("Backend data fetch notice: Backend may still be spinning up.", err);
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
    } catch (e) {}
  };

  const handleDeleteNotification = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
    } catch (e) {}
  };

  const handleClearAllNotifications = async () => {
    setNotifications([]);
    try {
      await fetch('/api/notifications/clear', { method: 'POST' });
    } catch (e) {}
  };

  const handleTriggerTestAlert = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(659.25, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch (e) {}

    const newAlert: NotificationItem = {
      id: `alert-${Date.now()}`,
      title: '🔔 Proximity Alert: 2 Tokens Remaining!',
      message: 'Now serving Token #22 with Dr. Ananya Sen in Room 204. Your Token is #24. Please report to Room 204.',
      type: 'token_alert',
      timestamp: 'Just now',
      is_read: false
    };

    setNotifications((prev) => [newAlert, ...prev]);
  };

  const handleRescheduleAppointment = (appointmentId: number) => {
    setActiveTab('chat');
    const appt = appointments.find((a) => a.id === appointmentId);
    const doc = appt?.doctor_name || 'Dr. Ananya Sen';
    handleSendMessage(`I would like to reschedule my appointment #${appt?.confirmation_code || 'CB-2026'} with ${doc} to another available slot.`);
  };

  const handleCancelAppointment = async (appointmentId: number) => {
    try {
      const res = await fetch('/api/appointments/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointment_id: appointmentId,
          actor_name: currentProfile.name,
          actor_role: currentProfile.role
        })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            id: `cancel-${Date.now()}`,
            sender: 'agent',
            text: `❌ **Appointment Cancelled Successfully**\n\n${data.message || 'The slot has been released back into the network and logged in the audit ledger.'}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        fetchData();
      }
    } catch (err) {
      console.error("Cancel appointment error:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000); // Poll every 8s for live dashboard
    return () => clearInterval(interval);
  }, [currentProfile.id, currentProfile.role]);

  const handleSendMessage = async (text: string) => {
    const userMsgId = `user-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          patient_id: currentProfile.id,
          actor_name: currentProfile.name,
          actor_role: currentProfile.role,
          language: language === 'auto' ? (currentProfile.languagePref?.toLowerCase().includes('te') || currentProfile.id === 2 ? 'te' : 'auto') : language
        })
      });

      if (!response.ok) throw new Error("Chat request failed");
      const data = await response.json();

      if (data.timeline && data.timeline.length > 0) {
        setLatestTimeline(data.timeline);
      }
      // Note: Appointment choices and approvals are presented inline inside the chat message stream (ChatInterface)
      // to avoid blocking modal overlays in the middle of the screen.
      // setActiveApproval is reserved for explicit supervisor/admin workflows.

      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: data.text,
        englishTranslation: data.english_translation,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: data.intent,
        toolCalls: data.tool_calls,
        actionRequired: data.action_required,
        smartflowData: data.smartflow_data,
        availableOptions: data.available_options,
        journeyData: data.journey_data,
        securityAlert: data.security_alert,
        emergencyTriage: data.emergency_triage,
        timeline: data.timeline,
        agentTimeline: data.agent_timeline || data.timeline,
        supervisorDecision: data.supervisor_decision || data.supervisorDecision,
        recoveryMode: data.recovery_mode || data.recoveryMode,
        approvalRequest: data.approval_request,
        duplicateWarning: data.duplicate_warning,
        missingInformation: data.missing_information,
        aiMode: data.ai_mode,
        fallbackMode: data.fallback_mode
      };

      setMessages((prev) => [...prev, agentMsg]);
      fetchData(); // update logs and network status
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'agent',
          text: "I encountered a communication issue connecting to the hospital coordination gateway. Please check that the backend server is running.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAction = async (actionType: string, payload: any, messageId: string) => {
    try {
      const response = await fetch('/api/chat/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action_type: actionType,
          payload,
          patient_id: currentProfile.id,
          actor_name: currentProfile.name,
          actor_role: currentProfile.role
        })
      });

      if (!response.ok) throw new Error("Action confirmation failed");
      const result = await response.json();

      // Mark original message card as confirmed
      setMessages((prev) =>
        prev.map((m, idx) => ((m.id === messageId || (messageId === 'latest' && idx === prev.length - 1)) ? { ...m, isConfirmed: true } : m))
      );

      // Update timeline if backend returned post-confirmation steps
      if (result.timeline && result.timeline.length > 0) {
        setLatestTimeline((prev) => [...prev, ...result.timeline]);
      }

      // Append confirmation success message and generate Digital Pass Data
      let replyText = "";
      if (actionType === "CONFIRM_BOOKING" || actionType === "FINAL_APPOINTMENT_BOOKING") {
        const assignedToken = result.token_number || result.pass_data?.token_number || "C-24";
        const currentServing = result.current_serving_token || result.pass_data?.current_serving_token || "C-21";
        const aheadCount = result.patients_ahead ?? result.pass_data?.people_ahead ?? 3;
        setTrackedTokenNumber(assignedToken);

        replyText = `🎉 **Appointment Confirmed!**\n\n• **Confirmation Code**: \`${result.confirmation_code || "CB-2026-CARD24"}\`\n• **Queue Token**: **${assignedToken}** (Current Serving: ${currentServing} • ${aheadCount} ahead)\n• **Doctor**: ${result.doctor_name || "Dr. Anil Kumar"} (${result.department || "Cardiology"})\n• **Hospital**: ${result.hospital_name || "CareBridge Heart Center Guntur"} (${result.room_number || "Room 102"})\n• **Consultation Fee**: ₹${result.consultation_fee || 500}\n• **Time & Date**: ${result.date || "16 Sep 2026"} at ${result.time || "10:30 AM"}\n• **Est Administrative Wait**: ${result.simulated_wait_min || 25} mins\n\n📱 **Notification Sent:** WhatsApp & SMS confirmation dispatched to +91 98480 22334.\n🎟️ **Digital OPD Pass generated & ready for kiosk check-in.**`;

        const pass = result.pass_data;
        const passData: DigitalPassData = {
          confirmation_code: pass?.confirmation_code || result.confirmation_code || "CB-2026-CARD24",
          patient_name: pass?.patient_name || result.patient_name || currentProfile.name || "Bhavishya (PAT-1000)",
          patient_uid: pass?.patient_uid || result.patient_uid || "PAT-1000",
          doctor_name: pass?.doctor_name || result.doctor_name || "Dr. Anil Kumar",
          specialization: result.specialization || "Cardiology (Interventional Cardiologist)",
          department: pass?.department || result.department || "Cardiology",
          hospital_name: pass?.hospital_name || result.hospital_name || "CareBridge Heart Center (Guntur OPD Node)",
          hospital_short: result.hospital_short || "CareBridge Guntur",
          hospital_area: result.hospital_area || "Guntur",
          room_number: pass?.room_number || result.room_number || "Room 102 (Cardiology OPD)",
          date: pass?.appointment_date || result.date || "16 Sep 2026",
          time: pass?.appointment_time || result.time || "10:30 AM",
          token_number: assignedToken,
          current_serving_token: currentServing,
          patients_ahead: aheadCount,
          simulated_wait_min: pass?.estimated_wait_minutes ?? (result.simulated_wait_min ?? 25),
          consultation_fee: pass?.consultation_fee ?? (result.consultation_fee || 500),
          instructions: result.instructions || "Show this Digital OPD Pass at the Room 102 reception kiosk."
        };

        // Automatically popup the Digital OPD Pass modal for instant patient delight!
        setSelectedPass(passData);
      } else if (actionType === "CONFIRM_CONFLICT_RESOLUTION") {
        replyText = `✅ **Schedule Resolution Applied!**\n\n${result.message}\n\nDoctor schedule and room allocation have been updated.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `confirm-res-${Date.now()}`,
          sender: 'agent',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelAction = (messageId?: string) => {
    // 1. Mark target message as cancelled so inline cards reflect cancelled state
    setMessages((prev) =>
      prev.map((m, idx) => {
        if (m.id === messageId || (!messageId && idx === prev.length - 1)) {
          return { ...m, isCancelled: true, isConfirmed: false };
        }
        return m;
      })
    );

    // 2. Dismiss any active approval modal
    setActiveApproval(null);

    // 3. Append courteous cancellation confirmation chat message in Telugu and English
    const cancelNoticeMsg: ChatMessage = {
      id: `agent-cancel-${Date.now()}`,
      sender: 'agent',
      text: `❌ **అపాయింట్‌మెంట్ బుకింగ్ అభ్యర్థన రద్దు చేయబడింది.** (Appointment Request Cancelled)\n\nమీరు కోరిన బుకింగ్ ప్రక్రియ రద్దు చేయబడింది. మీకు వేరే డాక్టర్, వేరే ఆసుపత్రి లేదా వేరే సమయం కావాలంటే దయచేసి ఇక్కడ తెలియజేయండి. నేను మీకు సహాయం చేస్తాను.\n\n*The appointment booking request has been cancelled. If you would like to search for another doctor, hospital, or alternative time slot, please let me know.*`,
      englishTranslation: "The appointment booking request has been cancelled. If you would like to search for another doctor, hospital, or alternative time slot, please let me know.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      intent: 'CANCELLED_BOOKING'
    };

    setMessages((prev) => [...prev, cancelNoticeMsg]);
  };

  const handleResolveConflict = async (conflictId: number) => {
    try {
      const response = await fetch('/api/conflicts/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conflict_id: conflictId,
          actor_name: currentProfile.name,
          actor_role: currentProfile.role
        })
      });
      if (response.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectProfile = (roleOrId: string | number) => {
    let targetProfile: UserProfile | undefined;
    if (typeof roleOrId === 'number') {
      targetProfile = Object.values(USER_PROFILES).find((u) => u.id === roleOrId) ||
        registeredUsers.find((u) => u.id === roleOrId);
    } else if (typeof roleOrId === 'string') {
      if (roleOrId === 'patient_telugu') {
        targetProfile = USER_PROFILES.patient_telugu || registeredUsers.find((u) => u.role === 'patient' && u.languagePref === 'Telugu');
      } else if (USER_PROFILES[roleOrId as UserRole]) {
        targetProfile = USER_PROFILES[roleOrId as UserRole];
      } else {
        targetProfile = registeredUsers.find((u) => u.role === roleOrId);
      }
    }

    if (targetProfile) {
      setCurrentProfile(targetProfile);
      if (roleOrId === 'patient_telugu' || targetProfile.languagePref?.toLowerCase().includes('telugu')) {
        setLanguage('te');
      } else if (roleOrId === 'patient' || roleOrId === 'doctor' || roleOrId === 'receptionist' || roleOrId === 'admin') {
        if (targetProfile.languagePref?.toLowerCase().includes('telugu')) {
          setLanguage('te');
        } else {
          setLanguage('en');
        }
      }

      // Auto-switch away from restricted administrative tabs when switching roles
      if (targetProfile.role === 'patient') {
        const patientAllowed = ['dashboard', 'chat', 'prescriptions', 'scanner', 'my_passes', 'token_tracker', 'messages', 'settings'];
        if (!patientAllowed.includes(activeTab)) {
          setActiveTab('dashboard');
        }
      } else if (targetProfile.role === 'receptionist') {
        const receptionistAllowed = ['dashboard', 'patient_hub', 'chat', 'my_passes', 'token_tracker', 'staff', 'messages', 'settings'];
        if (!receptionistAllowed.includes(activeTab)) {
          setActiveTab('dashboard');
        }
      }
    }
  };

  const handleUserRegistered = (newUser: UserProfile, shouldSwitch: boolean = false) => {
    setRegisteredUsers((prev) => {
      const exists = prev.some((u) => u.id === newUser.id);
      return exists ? prev.map((u) => (u.id === newUser.id ? newUser : u)) : [...prev, newUser];
    });
    if (shouldSwitch) {
      setCurrentProfile(newUser);
    }
    fetchData();
  };

  const handleRunScenario = (scenarioId: number, message: string, role: UserRole, lang: string) => {
    setActiveScenario(scenarioId);
    handleSelectProfile(role);
    setLanguage(lang);
    setActiveTab('chat');
    handleSendMessage(message);
  };

  const handleStartJudgeDemo = () => {
    handleRunScenario(
      1,
      "Naaku repu general medicine appointment kavali, waiting time takkuva undali",
      "patient",
      "te"
    );
  };

  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      await fetch('/api/reset', { method: 'POST' });
      setMessages([
        {
          id: 'welcome-reset',
          sender: 'agent',
          text: "Demo data reset successfully! All hospitals, schedules, and test scenarios are ready.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setActiveScenario(null);
      await fetchData();
      setCurrentProfile(USER_PROFILES.patient);
    } catch (err) {
      console.error(err);
    } finally {
      setIsResetting(false);
    }
  };

  const handleSignInSuccess = (user: UserProfile, initialAction?: string) => {
    setCurrentProfile(user);
    setIsAuthenticated(true);
    if (user.role === 'doctor') {
      setActiveTab('doctor_dashboard');
    } else if (user.role === 'receptionist') {
      setActiveTab('staff');
    } else if (user.role === 'admin') {
      setActiveTab('smartflow');
    } else {
      if (initialAction === 'token') {
        setActiveTab('patient_hub');
      } else if (initialAction === 'scanner') {
        setActiveTab('scanner');
      } else if (initialAction === 'book') {
        setActiveTab('chat');
        handleSendMessage("I need to book a doctor appointment with low waiting time");
      } else if (initialAction === 'doctor') {
        setActiveTab('chat');
        handleSendMessage("Find available doctors in General Medicine and Cardiology");
      } else if (initialAction === 'question') {
        setActiveTab('chat');
        handleSendMessage("What are the hospital visiting hours and OPD consultation timings?");
      } else if (initialAction === 'emergency') {
        setIsEmergencySOSOpen(true);
        setActiveTab('chat');
      } else {
        setActiveTab('patient_hub');
      }
    }
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setActiveTab('patient_hub');
  };

  const handleBottomSwitchRole = (role: UserRole | string) => {
    handleSelectProfile(role);
    if (role === 'doctor') {
      setActiveTab('doctor_dashboard');
    } else if (role === 'receptionist') {
      setActiveTab('staff');
    } else if (role === 'admin') {
      setActiveTab('smartflow');
    } else {
      setActiveTab('patient_hub');
    }
  };

  // Combine default profiles with registered users for Header dropdown
  const headerProfiles: UserProfile[] = Object.values(USER_PROFILES).map((defaultProfile) => {
    const fromDb = registeredUsers.find((u) => u.id === defaultProfile.id || (u.role === defaultProfile.role && u.name.toLowerCase() === defaultProfile.name.toLowerCase()));
    return fromDb ? { ...defaultProfile, ...fromDb } : defaultProfile;
  });
  if (registeredUsers && registeredUsers.length > 0) {
    registeredUsers.forEach((u) => {
      if (!headerProfiles.some((p) => p.id === u.id || p.name.toLowerCase() === u.name.toLowerCase())) {
        headerProfiles.push(u);
      }
    });
  }

  // FIRST SCREEN: Register or Sign In Landing Gateway
  if (!isAuthenticated) {
    return <AuthPortal onSignInSuccess={handleSignInSuccess} />;
  }

  const effectiveLang = language === 'auto'
    ? (currentProfile.languagePref?.toLowerCase().includes('telugu') ? 'te' : 'en')
    : (language.toLowerCase().startsWith('te') ? 'te' : 'en');

  return (
    <div className={`min-h-screen flex bg-[#F8FAFC] text-slate-800 antialiased font-sans ${
      seniorMode ? 'text-[15px]' : ''
    }`}>
      {/* Left Sidebar Navigation matching MediCore AI ERP reference image */}
      <MedicalErpSidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        currentProfile={currentProfile}
        unreadCount={notifications.filter((n) => !n.is_read).length}
        language={effectiveLang}
      />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Header */}
        <MedicalErpHeader
          currentProfile={currentProfile}
          profiles={headerProfiles}
          onSelectProfile={handleSelectProfile}
          language={language}
          onLanguageChange={(lang) => setLanguage(lang)}
          unreadNotificationsCount={notifications.filter((n) => !n.is_read).length}
          onOpenNotifications={() => setIsNotificationOpen(true)}
          onRunJudgeScenario={handleRunScenario}
          onSignOut={handleSignOut}
          onOpenEmergencySOS={() => setIsEmergencySOSOpen(true)}
          onQuickBook={() => {
            setActiveTab('chat');
            handleSendMessage("Naaku Guntur lo cardiologist appointment kavali. Telugu speaking doctor, minimum waiting time.");
          }}
          onResetDemo={handleResetDemo}
          isResetting={isResetting}
          onStartJudgeDemo={handleStartJudgeDemo}
        />

        {/* 1-Click Judge Scenarios Bar - Hidden for patient role */}
        {currentProfile.role !== 'patient' && (
          <div className="px-6 pt-3 pb-1">
            <JudgeDemoBar onRunScenario={handleRunScenario} activeScenario={activeScenario} />
          </div>
        )}

        {/* Dynamic Role-Based Tab Views */}
        <main className="flex-1 flex flex-col">
          {/* Default Flagship Medical ERP Dashboard (Matching Reference Image) */}
          {activeTab === 'dashboard' && (
            <MedicalErpDashboard
              currentProfile={currentProfile}
              appointments={appointments}
              onNavigateToTab={(tab) => setActiveTab(tab)}
              onSendMessage={handleSendMessage}
              onOpenPass={(pass) => setSelectedPass(pass)}
              language={effectiveLang}
            />
          )}
        {/* Simplified Patient Hub / Dashboard Tab */}
        {activeTab === 'patient_hub' && (
          <PatientDashboard
            currentProfile={currentProfile}
            appointments={appointments}
            onBookNew={() => {
              setActiveTab('chat');
              handleSendMessage("Naaku stomach pain undi, doctor appointment kavali.");
            }}
            onOpenPass={(pass) => setSelectedPass(pass)}
            onReschedule={handleRescheduleAppointment}
            onCancel={handleCancelAppointment}
            onOpenScanner={() => setActiveTab('scanner')}
            onTrackToken={(tokenNum) => {
              setTrackedTokenNumber(tokenNum || "GM-024");
              setActiveTab('token_tracker');
            }}
            onCheckToken={() => {
              setTrackedTokenNumber("GM-024");
              setActiveTab('token_tracker');
            }}
            onOpenMyAppointments={() => setActiveTab('my_passes')}
            onOpenMyPrescriptions={() => {
              const passData: DigitalPassData = {
                confirmation_code: "CB-2026-GM024",
                patient_name: currentProfile.name || "Bhavishya",
                patient_uid: "PAT-1000",
                doctor_name: "Dr. Priya",
                specialization: "General Medicine",
                department: "General Medicine",
                hospital_name: "Hospital B (CareBridge Central)",
                room_number: "Room OPD-03",
                date: "Today",
                time: "10:30 AM",
                token_number: "GM-024",
                current_serving_token: "GM-022",
                patients_ahead: 2,
                simulated_wait_min: 10,
                consultation_fee: 600,
                instructions: "Please report 10 minutes prior to Room OPD-03 Desk."
              };
              setSelectedPass(passData);
            }}
            onOpenEmergencyHelp={() => setIsEmergencySOSOpen(true)}
            onViewJourney={() => setActiveTab('journey')}
            onTriggerProximityAlert={(tok, doc) => {
              const notif: NotificationItem = {
                id: `prox-${Date.now()}`,
                title: `🔔 Proximity Alert Armed (Token #${tok})`,
                message: `You are monitoring Token #${tok} with ${doc}. You will receive a chime & alert when 2 tokens remain.`,
                type: 'token_alert',
                timestamp: 'Just now',
                is_read: false
              };
              setNotifications((prev) => [notif, ...prev]);
            }}
            onNavigateToTab={(tab) => setActiveTab(tab)}
            seniorMode={seniorMode}
          />
        )}

        {/* Live Token Tracker Tab */}
        {activeTab === 'token_tracker' && (
          <div className="flex-1 bg-[#F8FAFC] text-slate-800 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-24">
            <div className="max-w-4xl mx-auto">
              <LiveTokenTracker
                initialTokenNumber={trackedTokenNumber || "GM-024"}
                onBack={() => setActiveTab('patient_hub')}
                onViewPass={() => {
                  const passData: DigitalPassData = {
                    confirmation_code: "CB-2026-GM024",
                    patient_name: currentProfile.name || "Bhavishya",
                    patient_uid: "PAT-1000",
                    doctor_name: "Dr. Priya",
                    specialization: "General Medicine",
                    department: "General Medicine",
                    hospital_name: "Hospital B (CareBridge Central)",
                    room_number: "Room OPD-03",
                    date: "Today",
                    time: "10:30 AM",
                    token_number: trackedTokenNumber || "GM-024",
                    current_serving_token: "GM-022",
                    patients_ahead: 2,
                    simulated_wait_min: 10,
                    consultation_fee: 600,
                    instructions: "Please report 10 minutes prior to Room OPD-03 Desk."
                  };
                  setSelectedPass(passData);
                }}
                seniorMode={seniorMode}
              />
            </div>
          </div>
        )}

        {/* SmartFlow Recommendation Tab */}
        {activeTab === 'smartflow_recommend' && (
          <div className="flex-1 bg-[#F8FAFC] text-slate-800 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-24">
            <div className="max-w-5xl mx-auto">
              <SmartFlowRecommendation
                onBack={() => setActiveTab('patient_hub')}
                onProceedToBooking={(hospName) => {
                  setActiveTab('chat');
                  handleSendMessage(`I would like to book an appointment at ${hospName} for General Medicine with Dr. Priya.`);
                }}
                seniorMode={seniorMode}
              />
            </div>
          </div>
        )}

        {/* Complete 10-Stage Patient Journey View */}
        {activeTab === 'journey' && (
          <div className="flex-1 bg-[#F8FAFC] text-slate-800 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-24">
            <div className="max-w-5xl mx-auto">
              <PatientJourneyTracker
                onBack={() => setActiveTab('patient_hub')}
                onNavigateTab={(tab) => {
                  if (tab === 'chat') {
                    setActiveTab('chat');
                    handleSendMessage("Naaku stomach pain undi, doctor appointment kavali.");
                  } else {
                    setActiveTab(tab);
                  }
                }}
                onOpenPass={() => {
                  const passData: DigitalPassData = {
                    confirmation_code: "CB-2026-GM024",
                    patient_name: currentProfile.name || "Bhavishya",
                    patient_uid: "PAT-1000",
                    doctor_name: "Dr. Priya",
                    specialization: "General Medicine",
                    department: "General Medicine",
                    hospital_name: "Hospital B (CareBridge Central)",
                    room_number: "Room OPD-03",
                    date: "Today",
                    time: "10:30 AM",
                    token_number: "GM-024",
                    current_serving_token: "GM-022",
                    patients_ahead: 2,
                    simulated_wait_min: 10,
                    consultation_fee: 600,
                    instructions: "Please report 10 minutes prior to Room OPD-03 Desk."
                  };
                  setSelectedPass(passData);
                }}
                seniorMode={seniorMode}
              />
            </div>
          </div>
        )}

        {/* Chat / Agent Tab: CareBridge AI 2.0 Unified Multi-Agent Workspace */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC] p-3 sm:p-4 lg:p-6 overflow-y-auto space-y-4 text-slate-800">
            {/* Element 6: Intelligent Recovery Alert Banner */}
            <div className="max-w-7xl mx-auto w-full">
              <RecoveryAlertBanner
                onRecoveryResolved={(msg) => {
                  handleSendMessage(`Doctor schedule recovery applied: ${msg}`);
                  fetchData();
                }}
              />
            </div>

            {/* Split 2-Column Demo Workspace */}
            <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Element 1: Chat Interface (Col span 7) */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex flex-col min-h-[640px]">
                <ChatInterface
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  onConfirmAction={handleConfirmAction}
                  onCancelAction={handleCancelAction}
                  isLoading={isLoading}
                  currentProfile={currentProfile}
                  onQuickPrompt={handleSendMessage}
                  onViewDigitalPass={(pass) => setSelectedPass(pass)}
                  onTrackToken={(tok) => {
                    setTrackedTokenNumber(tok || "GM-024");
                    setActiveTab('token_tracker');
                  }}
                  onOpenEmergencySOS={() => setIsEmergencySOSOpen(true)}
                  onOpenScanner={() => setActiveTab('scanner')}
                  onClearChat={() => setMessages([messages[0]])}
                  onUndoLast={() => setMessages(prev => prev.length > 2 ? prev.slice(0, prev.length - 2) : prev)}
                />
              </div>

              {/* Elements 2 & 3: Live Multi-Agent Timeline + SmartFlow 2.0 Panel (Col span 5) */}
              <div className="lg:col-span-5 flex flex-col space-y-6">
                {/* Element 2: Live Multi-Agent Execution Timeline */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                  <AgentTimeline
                    steps={latestTimeline}
                    currentGoal={isLoading ? "Orchestrating specialized agents..." : "Autonomous multi-agent coordination active"}
                    isExecuting={isLoading}
                  />
                </div>

                {/* Element 3: SmartFlow 2.0 Dynamic Panel & What-If Simulator */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                  <SmartFlowPanel
                    onSelectHospitalSlot={(slot) => {
                      handleSendMessage(`Book appointment with ${slot.doctor} at ${slot.hospital} for ${slot.time}`);
                    }}
                    seniorMode={seniorMode}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Doctor OPD Roster Dashboard */}
        {activeTab === 'doctor_dashboard' && (
          <DoctorDashboard
            currentProfile={currentProfile}
            appointments={appointments}
            onNavigateToTab={(tab) => setActiveTab(tab)}
            seniorMode={seniorMode}
            language={effectiveLang}
          />
        )}

        {/* Medical Report & Prescription Scanner Tab */}
        {activeTab === 'scanner' && (
          <div className="flex-1 bg-transparent text-slate-100 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-24">
            <div className="max-w-5xl mx-auto">
              <MedicalReportScanner
                onBookSpecialist={(spec, dept) => {
                  setActiveTab('chat');
                  handleSendMessage(`I need an appointment with ${spec} in ${dept}`);
                }}
                onAskDoctor={(question) => {
                  setActiveTab('chat');
                  handleSendMessage(question);
                }}
                seniorMode={seniorMode}
              />
            </div>
          </div>
        )}

        {/* OPD Waiting Hall TV Display Tab */}
        {activeTab === 'tv' && (
          <div className="flex-1 bg-[#F8FAFC] text-slate-800 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-24">
            <div className="max-w-6xl mx-auto">
              <WaitingHallTVDisplay seniorMode={seniorMode} />
            </div>
          </div>
        )}

        {/* 15-Sec Walk-in Token Kiosk Tab */}
        {activeTab === 'kiosk' && (
          <div className="flex-1 bg-[#F8FAFC] text-slate-800 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-24">
            <div className="max-w-5xl mx-auto">
              <WalkinTokenKiosk seniorMode={seniorMode} />
            </div>
          </div>
        )}

        {/* Patient Prescriptions Portal Tab */}
        {activeTab === 'prescriptions' && (
          <div className="flex-1 bg-[#F8FAFC] text-slate-800 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-24">
            {/* Header Banner */}
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Verified Digital Prescriptions • నా మందుల చీటీలు
                  </span>
                  <span className="text-xs text-slate-400">
                    • Patient: <strong className="text-slate-800">{currentProfile.name || 'Bhavishya'}</strong> (ID: {currentProfile.patient_uid || 'PAT-1000'})
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <Pill className="h-7 w-7 text-emerald-600" />
                  <span>My Active Prescriptions & Medications</span>
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  View medically verified digital prescriptions, clear Telugu & English dosage schedules, and doctor advice.
                </p>
              </div>

              <button
                onClick={() => {
                  const passData: DigitalPassData = {
                    confirmation_code: "CB-2026-GM024",
                    patient_name: currentProfile.name || "Bhavishya",
                    patient_uid: "PAT-1000",
                    doctor_name: "Dr. Priya",
                    specialization: "General Medicine",
                    department: "General Medicine",
                    hospital_name: "Hospital B (CareBridge Central)",
                    room_number: "Room OPD-03",
                    date: "Today",
                    time: "10:30 AM",
                    token_number: "GM-024",
                    current_serving_token: "GM-022",
                    patients_ahead: 2,
                    simulated_wait_min: 10,
                    consultation_fee: 600,
                    instructions: "Please report 10 minutes prior to Room OPD-03 Desk.",
                    prescription: {
                      diagnosis: "Acute Dyspepsia & Mild Gastritis (గ్యాస్ట్రిక్ సమస్య)",
                      doctor_notes: "Take antacid on empty stomach in the morning. Avoid heavy oily meals.",
                      follow_up_date: "Next Monday",
                      medicines: [
                        { name: "Tab Pantoprazole 40mg", dosage: "1-0-0", timing: "Before Breakfast (ఉదయం పరగడుపున)", duration: "14 Days", notes: "Acid reflux control" },
                        { name: "Syp Sucralfate 10ml", dosage: "1-0-1", timing: "After Meals (భోజనం తర్వాత)", duration: "7 Days", notes: "Mucosal protective" },
                        { name: "Tab Metformin 500mg", dosage: "1-0-1", timing: "After Food (భోజనం తర్వాత)", duration: "30 Days", notes: "Blood glucose regulation" }
                      ]
                    }
                  };
                  setSelectedPass(passData);
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Ticket className="h-4 w-4" />
                <span>View Digital OPD Pass (ఈ-పాస్)</span>
              </button>
            </div>

            {/* Prescriptions List Card */}
            <div className="max-w-4xl mx-auto space-y-5">
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Stethoscope className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">Dr. Priya, MD</h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          Consultant Physician • General Medicine
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        CareBridge Metro Health Center • Room OPD-03 • Issued: Today
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Doctor Verified (వైద్యుని సంతకం)
                  </span>
                </div>

                {/* Diagnosis Summary */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Clinical Diagnosis (వ్యాధి నిర్ధారణ)
                  </span>
                  <p className="text-sm font-bold text-slate-900">
                    Acute Dyspepsia & Mild Gastritis (గ్యాస్ట్రిక్ సమస్య & కడుపులో మంట)
                  </p>
                  <p className="text-xs text-slate-600">
                    Advice: Low sodium diet, brisk walking 30 mins daily, avoid spicy/oily foods, stay hydrated.
                  </p>
                </div>

                {/* Medicines List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Prescribed Medications ({3})
                  </h4>

                  <div className="grid gap-3">
                    <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">Tab Pantoprazole 40mg</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                            1-0-0 (Morning)
                          </span>
                        </div>
                        <span className="text-xs font-mono text-slate-500 font-semibold">14 Days</span>
                      </div>
                      <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3">
                        <span className="text-emerald-700 font-medium">⏰ Before Breakfast (ఉదయం పరగడుపున)</span>
                        <span>•</span>
                        <span className="text-slate-500">Antacid for gastric relief</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">Syp Sucralfate 10ml</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                            1-0-1 (Twice Daily)
                          </span>
                        </div>
                        <span className="text-xs font-mono text-slate-500 font-semibold">7 Days</span>
                      </div>
                      <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3">
                        <span className="text-blue-700 font-medium">⏰ 1 hour after meals (భోజనం తర్వాత 1 గంటకు)</span>
                        <span>•</span>
                        <span className="text-slate-500">Mucosal coating and ulcer protection</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">Tab Metformin 500mg</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold border border-amber-200">
                            1-0-1 (Morning & Night)
                          </span>
                        </div>
                        <span className="text-xs font-mono text-slate-500 font-semibold">30 Days</span>
                      </div>
                      <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3">
                        <span className="text-amber-700 font-medium">⏰ After food (భోజనం తర్వాత)</span>
                        <span>•</span>
                        <span className="text-slate-500">Blood sugar balance</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Follow-up Note */}
                <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-purple-900 block text-xs">Next Follow-Up Due:</span>
                    <p className="text-purple-700 mt-0.5">Please consult Dr. Priya after 14 days or if symptoms persist.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('chat')}
                    className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-xs transition cursor-pointer shrink-0"
                  >
                    Schedule Follow-Up
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Patient Digital Passes & Appointments Tab */}
        {activeTab === 'my_passes' && (
          <div className="flex-1 bg-[#F8FAFC] text-slate-800 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-24">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    Billing & Pass Portal • రోగి డిజిటల్ పాస్
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <Ticket className="h-7 w-7 text-blue-600" />
                  <span>My Appointments & Billing Invoices</span>
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  View your confirmed hospital OPD tokens, simulated arrival times, invoices, and interactive digital passes.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('chat')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>➕ Book New Low-Wait Slot</span>
              </button>
            </div>

            {/* Passes List */}
            <div className="max-w-4xl mx-auto space-y-4">
              {appointments.filter((a) => !a.patient_name || a.patient_name.toLowerCase().includes(currentProfile.name.split(' ')[0].toLowerCase())).length === 0 ? (
                <div className="p-12 text-center rounded-2xl border border-slate-200 bg-white space-y-4 shadow-xs">
                  <div className="h-14 w-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                    <Ticket className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">No OPD Passes Booked Yet</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                      You haven't booked any appointments yet. Ask CareBridge AI in English or Telugu to find a low-wait slot!
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('chat')}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
                  >
                    <span>Talk with CareBridge AI to Book</span>
                  </button>
                </div>
              ) : (
                appointments
                  .filter((a) => !a.patient_name || a.patient_name.toLowerCase().includes(currentProfile.name.split(' ')[0].toLowerCase()))
                  .map((appt) => (
                    <div
                      key={appt.id}
                      className="p-5 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs hover:border-blue-300 transition"
                    >
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-200 flex flex-col items-center justify-center text-blue-600 font-bold text-xs shadow-xs">
                          <Ticket className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-slate-900">{appt.doctor_name}</h4>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              {appt.department}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                            <span>🏥 {appt.hospital}</span>
                            <span>•</span>
                            <span>🕒 {appt.time}</span>
                            <span>•</span>
                            <span>⏱️ Est. Wait: ~{appt.simulated_wait_min}m</span>
                          </div>
                          <div className="text-xs text-blue-600 font-mono mt-1 font-semibold">
                            Confirmation Code: <strong>{appt.confirmation_code}</strong>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          let rxObj = undefined;
                          try {
                            if (appt.prescription_json) rxObj = JSON.parse(appt.prescription_json);
                          } catch (e) {}
                          setSelectedPass({
                            token_number: appt.token_number || 14,
                            confirmation_code: appt.confirmation_code,
                            patient_name: appt.patient_name || currentProfile.name,
                            doctor_name: appt.doctor_name,
                            specialization: appt.department,
                            department: appt.department,
                            hospital_name: appt.hospital,
                            room_number: "Room 204 (2nd Floor)",
                            date: appt.date || "Tomorrow",
                            time: appt.time,
                            simulated_wait_min: appt.simulated_wait_min,
                            consultation_fee: appt.consultation_fee || 600,
                            current_serving_token: 11,
                            patients_ahead: 3,
                            instructions: "Please arrive 10 minutes prior to appointment time.",
                            prescription: rxObj,
                            follow_up_date: appt.follow_up_date
                          } as any);
                        }}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer flex-shrink-0"
                      >
                        <Ticket className="h-4 w-4 text-blue-600" />
                        <span>View Digital Pass & Invoice</span>
                      </button>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* Patient Messages & Hospital Communications Tab */}
        {activeTab === 'messages' && (
          <div className="flex-1 bg-[#F8FAFC] text-slate-800 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-24">
            {/* Top Banner */}
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-blue-600" />
                    Communications & Alerts • సందేశాలు
                  </span>
                  <span className="text-xs text-slate-400">
                    • {notifications.filter((n) => !n.is_read).length} unread
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <Inbox className="h-7 w-7 text-blue-600" />
                  <span>Hospital Messages & Notifications</span>
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Doctor advice, prescription notices, OPD queue updates, and SMS/WhatsApp communications.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleTriggerTestAlert}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer flex items-center gap-1.5"
                  title="Simulate SMS/WhatsApp Notification"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-slate-600" />
                  <span>Test New Alert</span>
                </button>
                <button
                  onClick={handleClearAllNotifications}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-semibold text-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Clear All</span>
                </button>
              </div>
            </div>

            {/* Messages Inbox Container */}
            <div className="max-w-4xl mx-auto space-y-4">
              {/* Message 1: Attending Doctor Clinical Note */}
              <div className="p-5 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/50 via-white to-white shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      <Stethoscope className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">Dr. Priya (MD, General Medicine)</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                          Attending Doctor
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Active Prescription
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">CareBridge Metro Health Center • Room OPD-03</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">Today, 10:45 AM</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 text-xs text-slate-700 leading-relaxed space-y-2">
                  <p className="font-semibold text-slate-900">
                    Subject: Follow-up & Medication Instructions for Stomach Discomfort (గ్యాస్ట్రిక్ సమస్య)
                  </p>
                  <p>
                    "Hello {currentProfile.name || 'Bhavishya'}, I have reviewed your consultation symptoms. Your digital prescription for mild dyspepsia and gastritis is now active. Please take Tab Pantoprazole 40mg once daily in the morning on an empty stomach (ఉదయం పరగడుపున), and Sucralfate after meals."
                  </p>
                  <p className="text-slate-600">
                    "Please maintain light meals, avoid spicy foods, and drink at least 2.5 litres of water. If you have any discomfort or questions, you can ask through our CareBridge AI anytime."
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('prescriptions')}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Pill className="h-3.5 w-3.5" />
                      <span>View My Prescriptions</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('chat');
                        handleSendMessage("Doctor, I have a question about my gastritis prescription dosage.");
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Reply to Doctor</span>
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-400">Digital Sign-off: Verified by Dr. Priya</span>
                </div>
              </div>

              {/* Message 2: Live OPD Token Alert */}
              <div className="p-5 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/40 via-white to-white shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                      <Ticket className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">OPD Token Tracking Desk</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          Live Queue Alert
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">CareBridge Metro Hospital OPD Reception</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">10 mins ago</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 text-xs text-slate-700 leading-relaxed space-y-1">
                  <p className="font-semibold text-slate-900">
                    Token GM-024 Approaching • మీ టోకెన్ దగ్గరకు వచ్చింది
                  </p>
                  <p>
                    Your OPD Token <strong>GM-024</strong> has only 2 patients ahead in the queue at Room OPD-03 with Dr. Priya. Estimated wait time is approximately 10 minutes.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      setTrackedTokenNumber("GM-024");
                      setActiveTab('token_tracker');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Ticket className="h-3.5 w-3.5" />
                    <span>Track Live Token (GM-024)</span>
                  </button>
                </div>
              </div>

              {/* Message 3: Lab & Diagnostics Report Ready */}
              <div className="p-5 rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50/40 via-white to-white shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">CareBridge Central Diagnostic Laboratory</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">
                          Lab Report Verified
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">Bio-Chemistry & Hematology Section</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">Today, 08:30 AM</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 text-xs text-slate-700 leading-relaxed space-y-1">
                  <p className="font-semibold text-slate-900">
                    Fasting Blood Glucose & HbA1c Panel Results (మధుమేహం / షుగర్ రక్త పరీక్ష)
                  </p>
                  <p>
                    Your sample analysis is complete: Fasting Blood Sugar: <strong>110 mg/dL</strong> (Normal), HbA1c: <strong>5.8%</strong> (Optimal glycemic control).
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setActiveTab('scanner')}
                    className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>Open Medical Report Scanner</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Notification Items from Backend */}
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-5 rounded-2xl border transition space-y-3 shadow-xs ${
                    notif.is_read
                      ? 'bg-white border-slate-200/90'
                      : 'bg-blue-50/30 border-blue-300 ring-1 ring-blue-300/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{notif.title}</h4>
                        <p className="text-xs text-slate-400">CareBridge Hospital System Alert</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notif.is_read && (
                        <button
                          onClick={() => handleMarkNotificationRead(notif.id)}
                          className="px-2.5 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 text-[11px] font-semibold transition cursor-pointer"
                        >
                          Mark Read
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteNotification(notif.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition cursor-pointer"
                        title="Delete notification"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {notif.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Registration & Members Directory Tab */}
        {activeTab === 'register' && (
          <RegistrationPage
            currentProfile={currentProfile}
            registeredUsers={registeredUsers}
            onSelectUser={(user) => setCurrentProfile(user)}
            onUserRegistered={handleUserRegistered}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {/* SmartFlow Multi-Hospital Digital Twin Tab */}
        {activeTab === 'smartflow' && (
          <SmartFlowDashboard
            hospitals={hospitals}
            isLoading={isLoading}
            onRefresh={fetchData}
          />
        )}

        {/* Staff & Conflicts Hub Tab */}
        {activeTab === 'staff' && (
          <StaffScheduler
            appointments={appointments}
            conflicts={conflicts}
            onResolveConflict={handleResolveConflict}
            isLoading={isLoading}
            onRefresh={fetchData}
          />
        )}

        {/* CareBridge Access Mode: No Smartphone Required Tab */}
        {activeTab === 'access_mode' && (
          <div className="flex-1 bg-[#F8FAFC] text-slate-800 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-24">
            <CareBridgeAccessMode
              onNavigateToTab={(tab) => setActiveTab(tab)}
              seniorMode={seniorMode}
              onToggleSeniorMode={() => setSeniorMode(!seniorMode)}
              onSelectTeluguPatient={() => {
                handleSelectProfile('patient_telugu');
                setActiveTab('chat');
              }}
            />
          </div>
        )}

        {/* AI Evaluation & Measurable Impact Dashboard Tab */}
        {activeTab === 'evaluation' && (
          <div className="flex-1 bg-[#F8FAFC] text-slate-800 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-24">
            <AIEvaluationDashboard />
          </div>
        )}

        {/* Audit Log & RBAC Governance Tab */}
        {activeTab === 'audit' && (
          <AuditLogViewer
            logs={auditLogs}
            isLoading={isLoading}
            onRefresh={fetchData}
          />
        )}

        {/* CareBridge Recovery Mode (Killer Feature: Doctor Delay Failover) */}
        {activeTab === 'recovery_mode' && (
          <div className="flex-1 bg-[#F8FAFC] text-slate-800 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-24">
            <CareBridgeRecoveryMode
              currentProfile={currentProfile}
              onViewDigitalPass={(pass) => setSelectedPass(pass)}
              onTrackToken={(tok) => {
                setTrackedTokenNumber(tok || "GM-029");
                setActiveTab('token_tracker');
              }}
              onBack={() => setActiveTab('patient_hub')}
              seniorMode={seniorMode}
            />
          </div>
        )}

        {/* Privacy & Consent Dashboard (DPDP / HIPAA Access Audit) */}
        {activeTab === 'privacy_consent' && (
          <div className="flex-1 bg-[#F8FAFC] text-slate-800 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-24">
            <PrivacyConsentDashboard
              currentProfile={currentProfile}
              seniorMode={seniorMode}
            />
          </div>
        )}

        {/* Agent Session Replay for Competition Judges */}
        {activeTab === 'session_replay' && (
          <div className="flex-1 bg-[#F8FAFC] text-slate-800 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-24">
            <AgentSessionReplay seniorMode={seniorMode} />
          </div>
        )}

        {/* SmartFlow What-If Simulator & Dynamic Recommendation Tab */}
        {activeTab === 'smartflow_whatif' && (
          <div className="flex-1 bg-[#F8FAFC] text-slate-800 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-24">
            <SmartFlowRecommendation
              onSelectHospital={(hosp) => {
                handleSendMessage(`Tell me more about appointments at ${hosp.name}`);
              }}
              onProceedToBooking={(hospName) => {
                setActiveTab('chat');
                handleSendMessage(`Book appointment at ${hospName} for General Medicine with low wait`);
              }}
              onBack={() => setActiveTab('patient_hub')}
              seniorMode={seniorMode}
            />
          </div>
        )}
      </main>

      {/* CareBridge AI 2.0 Human-in-the-Loop Approval Modal */}
      {activeApproval && (
        <ApprovalModal
          isOpen={!!activeApproval}
          approvalData={activeApproval}
          onApprove={async (data) => {
            await handleConfirmAction(data.action_type || 'CONFIRM_BOOKING', data.payload || {}, 'latest');
            setActiveApproval(null);
          }}
          onCancel={() => handleCancelAction()}
          onChangeConstraints={() => {
            setActiveApproval(null);
            handleSendMessage("Naaku repu vere time lo appointment kavali, fee takkuva undali.");
          }}
        />
      )}

      {/* Digital OPD Pass Modal */}
      <DigitalOPDPassModal
        pass={selectedPass}
        onClose={() => setSelectedPass(null)}
        seniorMode={seniorMode}
      />

      {/* Emergency SOS Modal */}
      <EmergencySOSModal
        isOpen={isEmergencySOSOpen}
        onClose={() => setIsEmergencySOSOpen(false)}
        seniorMode={seniorMode}
      />

      {/* Notification Center Modal */}
      <NotificationCenterModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkNotificationRead}
        onDelete={handleDeleteNotification}
        onClearAll={handleClearAllNotifications}
        onTriggerTestAlert={handleTriggerTestAlert}
        seniorMode={seniorMode}
      />

      {/* Trust & Safety Center Modal */}
      <SafetyCenterModal
        isOpen={isSafetyCenterOpen}
        onClose={() => setIsSafetyCenterOpen(false)}
        currentProfile={currentProfile}
        seniorMode={seniorMode}
      />

      {/* Safety Contract Panel (Item 3) */}
      {isSafetyContractOpen && (
        <SafetyContractPanel onClose={() => setIsSafetyContractOpen(false)} />
      )}

      {/* Technical Architecture & States Modal (Item 9) */}
      {isArchitectureOpen && (
        <TechnicalArchitectureModal onClose={() => setIsArchitectureOpen(false)} />
      )}

      {/* Persistent Bottom Button-Type Demo Role Switcher */}
      <BottomRoleSwitcher
        currentProfile={currentProfile}
        onSwitchRole={handleBottomSwitchRole}
        onSignOut={handleSignOut}
        language={effectiveLang}
      />
      </div>
    </div>
  );
}
export default App;
