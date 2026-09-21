export type UserRole = 'patient' | 'patient_telugu' | 'receptionist' | 'admin' | 'doctor';

export interface UserProfile {
  id: number;
  name: string;
  role: 'patient' | 'receptionist' | 'admin' | 'doctor';
  languagePref: string;
  description?: string;
  avatar: string;
  badge: string;
  patient_uid?: string;
  phone?: string;
  email?: string;
  age?: number;
  gender?: string;
  preferred_hospital?: string;
  authorized_for_records?: boolean;
  specialization?: string;
  department?: string;
  room_number?: string;
  experience_years?: number;
  consultation_fee?: number;
}

export interface DepartmentItem {
  id: number;
  name: string;
  telugu_name: string;
  code: string;
  floor: string;
  avg_consult_duration_min: number;
  description: string;
}

export interface ToolCallRecord {
  tool: string;
  arguments: Record<string, any>;
  sub_agent?: string;
  duration_ms?: number;
  status?: string;
  result_summary?: string;
}

export interface QueueMetric {
  hospital_id: number;
  code: string;
  name: string;
  area: string;
  baseline_queue: number;
  current_queue: number;
  simulated_surge: number;
  queue_level: 'Low' | 'Moderate' | 'High';
  staff_workload_pct: number;
  avg_wait_min: number;
  occupancy_pct: number;
}

export interface BenchmarkQueryItem {
  id: number;
  query: string;
  expected_intent: string;
  predicted_intent: string;
  passed: boolean;
  latency_ms: number;
  sub_agent: string;
  tool_calls: Array<{ tool: string; args: any }>;
}

export interface BenchmarkResult {
  total_queries: number;
  passed_queries: number;
  accuracy_rate: number;
  avg_latency_ms: number;
  domain_distribution: Record<string, number>;
  results: BenchmarkQueryItem[];
}

export interface ImpactMetrics {
  total_simulated_appointments: number;
  traditional_admin_wait_min: number;
  carebridge_admin_wait_min: number;
  time_saved_min: number;
  wait_reduction_pct: number;
  total_staff_hours_saved: number;
  no_show_reduction_pct: number;
  low_tech_adoption_rate_pct: number;
  multi_hospital_redistribution_count: number;
  last_evaluated: string;
}

export interface SmartFlowBreakdown {
  overall_score: number;
  score_percentage: number;
  availability: number;
  wait_efficiency: number;
  preference_match: number;
  simulated_wait_min: number;
  factors: {
    availability_weight: string;
    wait_efficiency_weight: string;
    preference_weight: string;
  };
  formula_display: string;
}

export interface SlotCandidate {
  slot_id: number;
  doctor_id: number;
  doctor_name: string;
  doctor_title: string;
  doctor_rating: number;
  specialization: string;
  experience_years?: number;
  consultation_fee?: number;
  languages_spoken?: string;
  room_number?: string;
  department_name: string;
  department_telugu?: string;
  hospital_id: number;
  hospital_name: string;
  hospital_short: string;
  hospital_code: string;
  hospital_area: string;
  map_link?: string;
  date: string;
  start_time: string;
  end_time: string;
  simulated_wait_min: number;
  token_number?: number | string;
  current_serving_token?: number | string;
  patients_ahead?: number;
  smartflow_score: number;
  score_percentage: number;
  score_breakdown?: SmartFlowBreakdown;
}

export interface SmartFlowData {
  recommended_slot: SlotCandidate;
  candidate_slots: SlotCandidate[];
  formula: string;
  factors: Record<string, string>;
  preference_explanations?: string[];
  why_not_selected?: Array<{ hospital: string; reason: string }>;
}

export interface ActionRequired {
  type: 'CONFIRM_BOOKING' | 'CONFIRM_CONFLICT_RESOLUTION';
  slot_id?: number;
  conflict_id?: number;
  doctor_name?: string;
  hospital_name?: string;
  room_number?: string;
  consultation_fee?: number;
  token_number?: number | string;
  current_serving_token?: number | string;
  patients_ahead?: number;
  languages_spoken?: string;
  map_link?: string;
  time?: string;
  date?: string;
  wait_min?: number;
  score?: number;
  resolution_text?: string;
}

export interface SecurityAlert {
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  status: string;
  policy: string;
}

export interface EmergencyTriageData {
  is_emergency: boolean;
  hotline: string;
  er_phone: string;
  facility: string;
  facility_address: string;
  map_link: string;
  triage_instructions: string;
}

export interface DigitalPassData {
  confirmation_code: string;
  patient_name: string;
  patient_uid?: string;
  doctor_name: string;
  specialization: string;
  experience_years?: number;
  department: string;
  hospital_name: string;
  hospital_short?: string;
  hospital_area?: string;
  room_number: string;
  date: string;
  time: string;
  token_number: number | string;
  current_serving_token: number | string;
  patients_ahead: number;
  simulated_wait_min: number;
  consultation_fee: number;
  instructions: string;
  map_link?: string;
  prescription?: PrescriptionData;
  follow_up_date?: string;
}

export interface JourneyHospital {
  id: string;
  name: string;
  estimated_wait: string;
  available_doctors: number;
  opd_crowd: string;
  smartflow_score: number;
  is_recommended?: boolean;
  wait_efficiency?: number;
  availability?: number;
  preference_match?: number;
}

export interface JourneyDoctor {
  name: string;
  department: string;
  experience: string;
  available_times: string[];
  hospital: string;
  room: string;
}

export interface JourneyData {
  is_stomach?: boolean;
  suggested_department?: string;
  hospitals?: JourneyHospital[];
  doctors?: JourneyDoctor[];
}

export interface AgentTimelineStep {
  agent_name?: string;
  tool_name?: string;
  status: string;
  summary: string;
  risk_level?: string;
  latency_ms?: number;
  input_summary?: string;
  output_summary?: string;
  reasons?: string[];
  timestamp?: string;
}

export interface SupervisorDecision {
  user_goal: string;
  detected_intent: string;
  required_agents: string[];
  safety_check: 'PASSED' | 'FLAGGED' | 'BLOCKED';
  approval_required: boolean;
  status: string;
  decision_status?: string;
  policy_checks_passed?: string;
  notes?: string;
}

export interface RecoveryModeData {
  active: boolean;
  delay_minutes: number;
  delay_reason?: string;
  original_doctor: string;
  original_hospital: string;
  original_slot: string;
  original_token: string;
  confirmation_code?: string;
  cancellation_minimizing_active?: boolean;
  suggested_alternative?: {
    doctor_name: string;
    specialization?: string;
    hospital_name: string;
    room_number: string;
    slot_time: string;
    token_number: string;
    simulated_wait_min: number;
    smartflow_score: number;
    consultation_fee: number;
  };
  status?: string;
  instructions_en?: string;
  instructions_te?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  englishTranslation?: string;
  teluguTranslation?: string;
  timestamp: string;
  intent?: string;
  toolCalls?: ToolCallRecord[];
  actionRequired?: ActionRequired | null;
  smartflowData?: SmartFlowData | null;
  availableOptions?: SlotCandidate[] | null;
  journeyData?: JourneyData | null;
  securityAlert?: SecurityAlert | null;
  emergencyTriage?: EmergencyTriageData | null;
  digitalPass?: DigitalPassData | null;
  isConfirmed?: boolean;
  isCancelled?: boolean;
  timeline?: AgentTimelineStep[];
  agentTimeline?: AgentTimelineStep[];
  supervisorDecision?: SupervisorDecision | null;
  recoveryMode?: RecoveryModeData | null;
  approvalRequest?: any;
  duplicateWarning?: any;
  missingInformation?: any;
  aiMode?: string;
  fallbackMode?: string;
}

export interface DepartmentStat {
  department_name: string;
  telugu_name: string;
  available_slots: number;
  est_admin_wait_min: number;
  active_doctors: number;
}

export interface HospitalStatus {
  hospital_id: number;
  code: string;
  name: string;
  short_name: string;
  area: string;
  occupancy_pct: number;
  total_beds: number;
  occupied_beds: number;
  active_icu_units: number;
  avg_wait_min: number;
  total_available_slots: number;
  total_booked_slots: number;
  phone: string;
  emergency_phone?: string;
  map_link?: string;
  departments: DepartmentStat[];
  status: 'Optimal' | 'Busy' | 'High Congestion';
}

export interface AppointmentRecord {
  id: number;
  confirmation_code: string;
  patient_name: string;
  doctor_name: string;
  department: string;
  hospital: string;
  date: string;
  time: string;
  token_number?: number | string;
  token_number_str?: string;
  consultation_fee?: number;
  status: string;
  simulated_wait_min: number;
  smartflow_score: number;
  reason: string;
  created_at: string;
  prescription_json?: string;
  clinical_soap_notes?: string;
  follow_up_date?: string;
}

export interface ScheduleConflictRecord {
  conflict_id: number;
  date: string;
  doctor_id: number;
  doctor_name: string;
  hospital_name: string;
  department: string;
  conflict_type: string;
  description: string;
  suggested_resolution: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
}

export interface AuditLogEntry {
  id: number;
  timestamp: string;
  actor_name: string;
  actor_role: string;
  action_type: string;
  status: string;
  details: string;
  risk_level: string;
}

export interface PrescriptionMedicine {
  name: string;
  dosage: string;
  timing: string;
  duration: string;
  notes?: string;
}

export interface PrescriptionData {
  diagnosis: string;
  medicines: PrescriptionMedicine[];
  doctor_notes?: string;
  issued_at?: string;
}

export interface ReportScanItem {
  parameter: string;
  value: string;
  unit: string;
  reference_range: string;
  status: 'NORMAL' | 'HIGH' | 'CRITICAL';
  interpretation: string;
  confidence_pct?: number;
  telugu_explanation?: string;
}

export interface ReportScanResult {
  report_title: string;
  patient_name: string;
  test_date: string;
  lab_name: string;
  items: ReportScanItem[];
  abnormal_count: number;
  summary_en: string;
  summary_te: string;
  recommended_specialist: string;
  recommended_dept: string;
  urgency: string;
}

export interface TVServingItem {
  room: string;
  doctor: string;
  department: string;
  department_te: string;
  token: number;
  patient_name: string;
  status: string;
  voice_announcement_en: string;
  voice_announcement_te: string;
}

export interface TVUpcomingItem {
  token: number;
  department: string;
  patient_name: string;
  room: string;
  wait_min: number;
}

export interface TVQueueData {
  hospital_name: string;
  hospital_code: string;
  now_serving: TVServingItem[];
  upcoming: TVUpcomingItem[];
  last_updated: string;
}

export interface WalkinSlipData {
  confirmation_code: string;
  token_number: number;
  patient_name: string;
  patient_uid: string;
  doctor_name: string;
  room_number: string;
  department_name: string;
  consultation_fee: number;
  priority: string;
  simulated_wait_min: number;
  slip_instructions_te: string;
  slip_instructions_en: string;
}

export interface NotificationItem {
  id: string;
  patient_id?: number;
  title: string;
  message: string;
  type: 'token_alert' | 'delay_alert' | 'booking_confirm' | 'cancellation' | 'reschedule' | 'general';
  timestamp: string;
  is_read: boolean;
  action_url?: string;
}

export interface CaretakerAccess {
  patient_id: number;
  patient_name: string;
  caretaker_name: string;
  relation: string;
  valid_until: string;
  granted_at: string;
  scope: string;
}

export interface RescheduleRequest {
  appointment_id: number;
  new_slot_id: number;
  actor_name: string;
  actor_role: string;
}

export interface CancelRequest {
  appointment_id: number;
  reason?: string;
  actor_name: string;
  actor_role: string;
}
