export type SupportedLanguage = 'en' | 'te';

export interface TranslationDictionary {
  // Sidebar
  dashboard: string;
  patients: string;
  patient_checkin: string;
  book_appointment: string;
  appointments: string;
  prescriptions: string;
  my_prescriptions: string;
  lab_reports: string;
  my_lab_reports: string;
  treatment_plans: string;
  billing_passes: string;
  billing_invoices: string;
  medical_records: string;
  ai_diagnosis: string;
  doctor_rosters: string;
  tasks: string;
  analytics: string;
  token_queue_rooms: string;
  token_queue_tv: string;
  live_token_queue: string;
  messages: string;
  settings: string;
  menu_patient: string;
  menu_doctor: string;
  menu_receptionist: string;
  menu_admin: string;
  subtitle_patient: string;
  subtitle_doctor: string;
  subtitle_receptionist: string;
  subtitle_admin: string;
  carebridge_mobile: string;
  carebridge_mobile_desc: string;
  app_store: string;
  google_play: string;
  app_version: string;

  // Header
  search_placeholder: string;
  emergency_sos: string;
  quick_book_tooltip: string;
  notifications_tooltip: string;
  switch_active_role: string;
  sign_out: string;
  patient_role_label: string;
  receptionist_role_label: string;
  admin_role_label: string;
  doctor_role_label: string;

  // Dashboard Main
  good_morning: string;
  good_afternoon: string;
  good_evening: string;
  role_desc_patient: string;
  role_desc_doctor: string;
  role_desc_receptionist: string;
  role_desc_admin: string;
  role_sub_patient: string;
  role_sub_doctor: string;
  role_sub_receptionist: string;
  role_sub_admin: string;

  // KPIs
  kpi_upcoming_appointments: string;
  kpi_active_prescriptions: string;
  kpi_live_tokens: string;
  kpi_avg_wait: string;
  kpi_lab_reports: string;
  kpi_network_occupancy: string;
  kpi_doctors_duty: string;
  kpi_icu_units: string;
  kpi_all_refills_active: string;
  kpi_serving_now: string;
  kpi_optimal_headroom: string;
  kpi_ready_download: string;

  // Schedule Column
  schedule_patient_title: string;
  schedule_doctor_title: string;
  schedule_reception_title: string;
  btn_new_booking: string;
  btn_view_all: string;
  confirmed_visit: string;
  token_label: string;
  view_digital_pass: string;
  next_week: string;
  btn_book_ai: string;
  btn_view_full_schedule: string;

  // Quick Links
  quick_links_title: string;
  ql_book_slot: string;
  ql_prescriptions: string;
  ql_lab_reports: string;
  ql_digital_pass: string;
  ql_live_queue: string;
  ql_roster: string;
  ql_patient_hub: string;
  ql_smartflow: string;
  ql_tokens: string;
  banner_patient_ai: string;
  banner_staff_ai: string;

  // OPD Queue Token Box
  queue_box_title: string;
  now_serving: string;
  est_wait: string;
  people_ahead: string;
  room_label: string;
  minutes_short: string;
  btn_track_live: string;

  // AI Assistant Card
  ai_assistant_patient: string;
  ai_assistant_doctor: string;
  ai_assistant_reception: string;
  ai_desc_patient: string;
  ai_desc_doctor: string;
  ai_desc_reception: string;
  ai_placeholder: string;
  btn_generate_summary: string;
  btn_book_now: string;
  ai_sample_cardio: string;
  ai_sample_cardio_sub: string;
  ai_sample_telemetry: string;
  ai_sample_telemetry_sub: string;
  ai_sample_summary: string;
  ai_sample_summary_sub: string;

  // Bottom Role Switcher
  demo_switcher_label: string;
  demo_switcher_instruction: string;
  role_btn_patient_en: string;
  role_btn_patient_mythri: string;
  role_btn_patient_te: string;
  role_btn_doctor: string;
  role_btn_receptionist: string;
  role_btn_admin: string;
  role_btn_signout: string;

  // Doctor Dashboard
  doctor_portal_title: string;
  assigned_opd_room: string;
  btn_call_next: string;
  completed_today: string;
  avg_consult_time: string;
  pending_queue: string;
  btn_call_patient: string;
  btn_complete: string;
  btn_issue_rx: string;
  btn_soap_notes: string;
  tab_queue_list: string;

  // Patient Dashboard
  patient_portal_title: string;
  welcome_user: string;
  tab_my_hub: string;
  tab_directory: string;
  btn_book_appointment: string;
  patient_id_label: string;

  // Common Statuses & Words
  confirmed: string;
  waiting: string;
  in_consultation: string;
  completed: string;
  high_risk: string;
  medium_risk: string;
  normal_risk: string;
  today: string;
  tomorrow: string;
  call_token_alert: string;

  // Staff Scheduler & Doctor Rosters
  roster_hub_title: string;
  roster_hub_subtitle: string;
  btn_refresh_schedules: string;
  tab_doctor_rosters: string;
  tab_conflicts: string;
  tab_appointments: string;
  doctor_search_placeholder: string;
  filter_all_doctors: string;
  filter_cardiology: string;
  filter_general_med: string;
  filter_orthopedics: string;
  filter_on_duty: string;
  status_on_duty: string;
  status_in_consultation: string;
  status_backup_ready: string;
  status_upcoming_shift: string;
  status_on_leave: string;
  serving_now_label: string;
  waiting_count_label: string;
  shift_label: string;
  room_desk_label: string;
  contact_ext_label: string;
  crowd_alert_title: string;
  crowd_surge_badge: string;
  telemetry_node_label: string;
  agent_recommendation_label: string;
  crowd_recommendation_text: string;
  current_queue_label: string;
  projected_queue_label: string;
  wait_reduction_label: string;
  telemetry_updated_sync: string;
  btn_hide_impact: string;
  btn_view_impact: string;
  btn_approve_recommendation: string;
  recommendation_applied_badge: string;
  conflicts_section_title: string;
  action_required_badge: string;
  all_conflicts_cleared: string;
  no_conflicts_detected: string;
  conflict_label: string;
  pending_staff_approval: string;
  issue_label: string;
  ai_proposed_resolution: string;
  btn_approve_apply: string;
  resolved_label: string;
  resolved_badge: string;
  confirmed_appts_title: string;
  appts_search_placeholder: string;
  no_appts_found: string;
  col_code: string;
  col_patient: string;
  col_doctor: string;
  col_hospital: string;
  col_datetime: string;
  col_est_wait: string;
  col_smartflow_score: string;
  col_status: string;
}

export const translations: Record<SupportedLanguage, TranslationDictionary> = {
  en: {
    // Sidebar
    dashboard: "Dashboard",
    patients: "Patients",
    patient_checkin: "Patient Check-in",
    book_appointment: "Book Appointment",
    appointments: "Appointments",
    prescriptions: "Prescriptions",
    my_prescriptions: "My Prescriptions",
    lab_reports: "Lab Reports",
    my_lab_reports: "My Lab Reports",
    treatment_plans: "Treatment Plans",
    billing_passes: "Billing & Digital Pass",
    billing_invoices: "Billing & Invoices",
    medical_records: "Medical Records",
    ai_diagnosis: "AI Diagnosis Support",
    doctor_rosters: "Doctor Rosters",
    tasks: "Tasks & Schedules",
    analytics: "Analytics & Reports",
    token_queue_rooms: "OPD Queue & Rooms",
    token_queue_tv: "Token Queue & TV",
    live_token_queue: "Live Token & Queue",
    messages: "Messages",
    settings: "Settings",
    menu_patient: "Patient Portal Menu",
    menu_doctor: "Clinical Doctor Menu",
    menu_receptionist: "Reception Desk Menu",
    menu_admin: "Hospital Admin Menu",
    subtitle_patient: "Patient Health & Care Portal",
    subtitle_doctor: "Hospital Clinical ERP",
    subtitle_receptionist: "Front Desk & OPD Counter",
    subtitle_admin: "Hospital Network Command",
    carebridge_mobile: "CareBridge Mobile",
    carebridge_mobile_desc: "Access OPD queue, passes, and doctor slots on the go.",
    app_store: "App Store",
    google_play: "Google Play",
    app_version: "v2.4 ERP",

    // Header
    search_placeholder: "Search patients, doctors, OPD tokens, EHR records...",
    emergency_sos: "🚨 108 SOS",
    quick_book_tooltip: "Quick Book New Appointment",
    notifications_tooltip: "Notifications",
    switch_active_role: "Switch Active Role",
    sign_out: "Sign Out",
    patient_role_label: "Patient Portal",
    receptionist_role_label: "Front Desk • Reception",
    admin_role_label: "Chief Administrator • Admin",
    doctor_role_label: "Lead Doctor • Cardiology",

    // Dashboard Main
    good_morning: "Good morning,",
    good_afternoon: "Good afternoon,",
    good_evening: "Good evening,",
    role_desc_patient: "Welcome to your personal health portal. Manage appointments, view active prescriptions, and track your queue token in real time.",
    role_desc_doctor: "Here's what's happening in your practice today. Stay aware, stay ahead.",
    role_desc_receptionist: "Here is your front desk overview. Check-in patients, manage queue tokens, and verify doctor schedules.",
    role_desc_admin: "Executive hospital operations overview. Monitor cross-hospital capacity, doctor rosters, and patient admissions.",
    role_sub_patient: "Patient Health & Care Portal",
    role_sub_doctor: "Cardiology Department • CareBridge Heart Center Guntur",
    role_sub_receptionist: "Front Desk & OPD Reception Desk • Apex Hospital Guntur",
    role_sub_admin: "Chief Hospital Administrator • Hospital Network Command Center",

    // KPIs
    kpi_upcoming_appointments: "Upcoming Appointments",
    kpi_active_prescriptions: "Active Prescriptions",
    kpi_live_tokens: "Live OPD Tokens",
    kpi_avg_wait: "Avg Admin Wait Time",
    kpi_lab_reports: "Lab Reports Ready",
    kpi_network_occupancy: "Network Bed Occupancy",
    kpi_doctors_duty: "Doctors on Duty",
    kpi_icu_units: "Active ICU Units",
    kpi_all_refills_active: "All refills active",
    kpi_serving_now: "Room 102 Serving",
    kpi_optimal_headroom: "Optimal headroom",
    kpi_ready_download: "Verified & downloadable",

    // Schedule Column
    schedule_patient_title: "My Upcoming Appointments",
    schedule_doctor_title: "Today's Appointments",
    schedule_reception_title: "Front Desk Check-ins",
    btn_new_booking: "+ New Booking",
    btn_view_all: "View all",
    confirmed_visit: "Confirmed Visit",
    token_label: "Token",
    view_digital_pass: "View Digital Pass →",
    next_week: "Next Week",
    btn_book_ai: "Book with AI Agent 🤖",
    btn_view_full_schedule: "View Full Schedule 📅",

    // Quick Links
    quick_links_title: "Quick Links",
    ql_book_slot: "Book Slot",
    ql_prescriptions: "Prescriptions",
    ql_lab_reports: "Lab Reports",
    ql_digital_pass: "Digital Pass",
    ql_live_queue: "Live Queue",
    ql_roster: "Duty Rosters",
    ql_patient_hub: "Patient Hub",
    ql_smartflow: "SmartFlow",
    ql_tokens: "OPD Tokens",
    banner_patient_ai: "24/7 AI Health & Symptom Guidance",
    banner_staff_ai: "AI Diagnosis & SmartFlow Support",

    // OPD Queue Token Box
    queue_box_title: "My Live OPD Queue Token",
    now_serving: "Now Serving Token",
    est_wait: "Est. Wait",
    people_ahead: "People Ahead",
    room_label: "Room",
    minutes_short: "mins",
    btn_track_live: "Track Live Token →",

    // AI Assistant Card
    ai_assistant_patient: "AI Health Assistant",
    ai_assistant_doctor: "AI Clinical Assistant",
    ai_assistant_reception: "Front Desk AI",
    ai_desc_patient: "Your personal AI companion for appointment scheduling, symptom guidance, and queue updates.",
    ai_desc_doctor: "Your AI assistant for smarter administrative workflows and patient summaries.",
    ai_desc_reception: "Your front desk assistant for quick patient check-in and queue load balancing.",
    ai_placeholder: "Ask me anything...",
    btn_generate_summary: "Generate Summary",
    btn_book_now: "Book Now",
    ai_sample_cardio: "Cardiologist Consultation",
    ai_sample_cardio_sub: "Book slot with Dr. Naveen Kumar",
    ai_sample_telemetry: "Queue Telemetry",
    ai_sample_telemetry_sub: "Balance OPD load across rooms",
    ai_sample_summary: "AI Patient Summary",
    ai_sample_summary_sub: "Generate concise summaries with AI.",

    // Bottom Role Switcher
    demo_switcher_label: "Demo Role Switcher",
    demo_switcher_instruction: "Tap any button to test role-specific view:",
    role_btn_patient_en: "👤 Patient (EN)",
    role_btn_patient_mythri: "👤 Mythri (New Patient Portal)",
    role_btn_patient_te: "👤 Telugu Patient",
    role_btn_doctor: "🩺 Doctor (OPD)",
    role_btn_receptionist: "💼 Receptionist",
    role_btn_admin: "🛡️ Admin Access",
    role_btn_signout: "Sign Out",

    // Doctor Dashboard
    doctor_portal_title: "Doctor Clinical Portal",
    assigned_opd_room: "Assigned OPD Room",
    btn_call_next: "Call Next Token",
    completed_today: "Completed Today",
    avg_consult_time: "Avg Consultation Time",
    pending_queue: "Waiting in Queue",
    btn_call_patient: "Call Patient",
    btn_complete: "Complete",
    btn_issue_rx: "Issue E-Rx",
    btn_soap_notes: "Clinical SOAP",
    tab_queue_list: "OPD Waiting Queue",

    // Patient Dashboard
    patient_portal_title: "Patient Management Portal",
    welcome_user: "Welcome,",
    tab_my_hub: "My Active Patient Hub",
    tab_directory: "Hospital Patient Directory",
    btn_book_appointment: "Book Appointment",
    patient_id_label: "Patient ID:",

    // Common
    confirmed: "Confirmed",
    waiting: "Waiting",
    in_consultation: "In Consultation",
    completed: "Completed",
    high_risk: "High Risk",
    medium_risk: "Moderate Risk",
    normal_risk: "Normal",
    today: "Today",
    tomorrow: "Tomorrow",
    call_token_alert: "Token called successfully",

    // Staff Scheduler & Doctor Rosters
    roster_hub_title: "Staff & Receptionist Coordination Hub • Doctor Rosters",
    roster_hub_subtitle: "Live doctor duty roster, OPD room assignments, automated schedule conflict detection, and queue management.",
    btn_refresh_schedules: "Refresh Schedules",
    tab_doctor_rosters: "Doctor Duty Rosters",
    tab_conflicts: "Schedule Conflicts",
    tab_appointments: "Confirmed Appointments",
    doctor_search_placeholder: "Search doctors by name, department, or room...",
    filter_all_doctors: "All Doctors",
    filter_cardiology: "Cardiology",
    filter_general_med: "General Medicine",
    filter_orthopedics: "Orthopedics",
    filter_on_duty: "On Duty",
    status_on_duty: "On Duty",
    status_in_consultation: "In Consultation",
    status_backup_ready: "Standby / Backup",
    status_upcoming_shift: "Upcoming Shift",
    status_on_leave: "On Leave",
    serving_now_label: "Serving Token",
    waiting_count_label: "Waiting",
    shift_label: "Shift",
    room_desk_label: "OPD Room",
    contact_ext_label: "Intercom / Ext",
    crowd_alert_title: "Operational Crowd Alert: Cardiology OPD Queue at 42",
    crowd_surge_badge: "Critical Surge > 40",
    telemetry_node_label: "Node: CareBridge Heart Center Guntur",
    agent_recommendation_label: "Agent Recommendation:",
    crowd_recommendation_text: "Activate auxiliary OPD Room 104 with Dr. Suresh (Cardiology backup) and reroute non-acute walk-ins to Hospital C.",
    current_queue_label: "Current Queue",
    projected_queue_label: "Projected Queue",
    wait_reduction_label: "Wait Reduction",
    telemetry_updated_sync: "Telemetry updated 1 min ago • SmartFlow Network Sync",
    btn_hide_impact: "Hide Impact",
    btn_view_impact: "View Network Impact",
    btn_approve_recommendation: "Approve Recommendation",
    recommendation_applied_badge: "Recommendation Applied (Room 104 Open)",
    conflicts_section_title: "Automated Schedule Conflicts & Audits",
    action_required_badge: "Action Required",
    all_conflicts_cleared: "All Cleared",
    no_conflicts_detected: "No schedule conflicts detected across any hospital node.",
    conflict_label: "Conflict",
    pending_staff_approval: "PENDING STAFF APPROVAL",
    issue_label: "Issue:",
    ai_proposed_resolution: "AI Proposed Resolution:",
    btn_approve_apply: "Approve & Apply Resolution",
    resolved_label: "Resolved:",
    resolved_badge: "RESOLVED",
    confirmed_appts_title: "Scheduled Patient Appointments",
    appts_search_placeholder: "Search appointments by patient, code, doctor...",
    no_appts_found: "No confirmed appointments found. Book one via CareBridge AI!",
    col_code: "Code",
    col_patient: "Patient",
    col_doctor: "Doctor & Specialty",
    col_hospital: "Hospital",
    col_datetime: "Date & Time",
    col_est_wait: "Est Wait",
    col_smartflow_score: "SmartFlow Score",
    col_status: "Status"
  },

  te: {
    // Sidebar
    dashboard: "డాష్‌బోర్డ్",
    patients: "రోగుల వివరాలు",
    patient_checkin: "పేషెంట్ చెక్-ఇన్",
    book_appointment: "అపాయింట్‌మెంట్ బుకింగ్",
    appointments: "అపాయింట్‌మెంట్లు",
    prescriptions: "మందుల చీటీలు (Rx)",
    my_prescriptions: "నా ప్రిస్క్రిప్షన్లు",
    lab_reports: "ల్యాబ్ రిపోర్టులు",
    my_lab_reports: "నా ల్యాబ్ నివేదికలు",
    treatment_plans: "చికిత్సా ప్రణాళికలు",
    billing_passes: "బిల్లింగ్ & డిజిటల్ పాస్",
    billing_invoices: "బిల్లింగ్ & రసీదులు",
    medical_records: "వైద్య రికార్డులు",
    ai_diagnosis: "AI రోగనిర్ధారణ సాయం",
    doctor_rosters: "వైద్యుల డ్యూటీ రోస్టర్",
    tasks: "విధులు & షెడ్యూల్స్",
    analytics: "విశ్లేషణలు & నివేదికలు",
    token_queue_rooms: "ఓపీడీ క్యూ & గదులు",
    token_queue_tv: "టోకెన్ క్యూ & టీవీ",
    live_token_queue: "లైవ్ టోకెన్ & క్యూ",
    messages: "సందేశాలు",
    settings: "సెట్టింగ్‌లు",
    menu_patient: "రోగి పోర్టల్ మెనూ",
    menu_doctor: "వైద్యుల క్లినికల్ మెనూ",
    menu_receptionist: "రిసెప్షన్ కౌంటర్ మెనూ",
    menu_admin: "హాస్పిటల్ అడ్మిన్ మెనూ",
    subtitle_patient: "రోగి ఆరోగ్య సంరక్షణ పోర్టల్",
    subtitle_doctor: "ఆసుపత్రి క్లినికల్ ERP",
    subtitle_receptionist: "ఫ్రంట్ డెస్క్ & ఓపీడీ కౌంటర్",
    subtitle_admin: "హాస్పిటల్ నెట్‌వర్క్ కమాండ్",
    carebridge_mobile: "కేర్‌బ్రిడ్జ్ మొబైల్",
    carebridge_mobile_desc: "ఓపీడీ క్యూ, పాస్‌లు మరియు డాక్టర్ స్లాట్‌లను మొబైల్‌లో పొందండి.",
    app_store: "యాప్ స్టోర్",
    google_play: "గూగుల్ ప్లే",
    app_version: "v2.4 ఈఆర్‌పీ",

    // Header
    search_placeholder: "రోగులు, వైద్యులు, ఓపీడీ టోకెన్లు, రికార్డులను వెతకండి...",
    emergency_sos: "🚨 108 అత్యవసరం",
    quick_book_tooltip: "త్వరిత అపాయింట్‌మెంట్ బుకింగ్",
    notifications_tooltip: "నోటిఫికేషన్లు",
    switch_active_role: "యాక్టివ్ పాత్రను మార్చండి",
    sign_out: "లాగ్ అవుట్",
    patient_role_label: "రోగి పోర్టల్",
    receptionist_role_label: "ఫ్రంట్ డెస్క్ • రిసెప్షన్",
    admin_role_label: "ముఖ్య నిర్వాహకులు • అడ్మిన్",
    doctor_role_label: "ప్రధాన వైద్యులు • కార్డియాలజీ",

    // Dashboard Main
    good_morning: "శుభోదయం,",
    good_afternoon: "శుభ మధ్యాహ్నం,",
    good_evening: "శుభ సాయంత్రం,",
    role_desc_patient: "మీ వ్యక్తిగత ఆరోగ్య పోర్టల్‌కు స్వాగతం. అపాయింట్‌మెంట్‌లు, ప్రిస్క్రిప్షన్‌లు మరియు లైవ్ క్యూ టోకెన్‌ను నిజ సమయంలో ట్రాక్ చేయండి.",
    role_desc_doctor: "ఈరోజు మీ ఓపీడీ క్లినికల్ వివరాలు ఇక్కడ ఉన్నాయి. రోగుల సంరక్షణను సులభంగా నిర్వహించండి.",
    role_desc_receptionist: "ఇది మీ రిసెప్షన్ డెస్క్ పర్యవేక్షణ. పేషెంట్ చెక్-ఇన్, క్యూ టోకెన్లు మరియు వైద్యుల షెడ్యూళ్లను నిర్వహించండి.",
    role_desc_admin: "ఆసుపత్రి కార్యకలాపాల ముఖ్య కేంద్రం. నెట్‌వర్క్ సామర్థ్యం, వైద్యుల డ్యూటీలు మరియు రోగుల ప్రవేశాలను పర్యవేక్షించండి.",
    role_sub_patient: "రోగి ఆరోగ్య సంరక్షణ పోర్టల్",
    role_sub_doctor: "కార్డియాలజీ విభాగం • కేర్‌బ్రిడ్జ్ హార్ట్ సెంటర్ గుంటూరు",
    role_sub_receptionist: "ఫ్రంట్ డెస్క్ & ఓపీడీ రిసెప్షన్ • అపెక్స్ హాస్పిటల్ గుంటూరు",
    role_sub_admin: "ముఖ్య ఆసుపత్రి నిర్వాహకులు • నెట్‌వర్క్ కమాండ్ సెంటర్",

    // KPIs
    kpi_upcoming_appointments: "రాబోయే అపాయింట్‌మెంట్లు",
    kpi_active_prescriptions: "యాక్టివ్ మందుల చీటీలు",
    kpi_live_tokens: "లైవ్ ఓపీడీ టోకెన్లు",
    kpi_avg_wait: "సగటు వేచి ఉండే సమయం",
    kpi_lab_reports: "సిద్ధంగా ఉన్న ల్యాబ్ రిపోర్టులు",
    kpi_network_occupancy: "హాస్పిటల్ బెడ్ ఆక్యుపెన్సీ",
    kpi_doctors_duty: "డ్యూటీలో ఉన్న వైద్యులు",
    kpi_icu_units: "అందుబాటులో ఉన్న ICU యూనిట్లు",
    kpi_all_refills_active: "అన్ని మందులు యాక్టివ్‌గా ఉన్నాయి",
    kpi_serving_now: "గది 102 లో చికిత్స జరుగుతోంది",
    kpi_optimal_headroom: "అనుకూలమైన సామర్థ్యం",
    kpi_ready_download: "ధృవీకరించబడింది & డౌన్‌లోడ్ సిద్ధం",

    // Schedule Column
    schedule_patient_title: "నా రాబోయే అపాయింట్‌మెంట్లు",
    schedule_doctor_title: "ఈరోజు అపాయింట్‌మెంట్లు",
    schedule_reception_title: "ఫ్రంట్ డెస్క్ చెక్-ఇన్‌లు",
    btn_new_booking: "+ కొత్త బుకింగ్",
    btn_view_all: "అన్నీ చూడండి",
    confirmed_visit: "ఖరారైన సందర్శన",
    token_label: "టోకెన్",
    view_digital_pass: "డిజిటల్ పాస్ చూడండి →",
    next_week: "వచ్చే వారం",
    btn_book_ai: "AI ఏజెంట్‌తో బుక్ చేయండి 🤖",
    btn_view_full_schedule: "పూర్తి షెడ్యూల్ చూడండి 📅",

    // Quick Links
    quick_links_title: "త్వరిత లింకులు",
    ql_book_slot: "స్లాట్ బుకింగ్",
    ql_prescriptions: "మందుల చీటీలు",
    ql_lab_reports: "ల్యాబ్ రిపోర్టులు",
    ql_digital_pass: "డిజిటల్ పాస్",
    ql_live_queue: "లైవ్ క్యూ",
    ql_roster: "డ్యూటీ రోస్టర్",
    ql_patient_hub: "పేషెంట్ హబ్",
    ql_smartflow: "స్మార్ట్‌ఫ్లో",
    ql_tokens: "ఓపీడీ టోకెన్లు",
    banner_patient_ai: "24/7 AI ఆరోగ్య & లక్షణాల మార్గదర్శనం",
    banner_staff_ai: "AI రోగనిర్ధారణ & స్మార్ట్‌ఫ్లో సాయం",

    // OPD Queue Token Box
    queue_box_title: "నా లైవ్ ఓపీడీ క్యూ టోకెన్",
    now_serving: "ప్రస్తుత టోకెన్",
    est_wait: "అంచనా సమయం",
    people_ahead: "ముందున్న రోగులు",
    room_label: "గది",
    minutes_short: "నిమిషాలు",
    btn_track_live: "లైవ్ టోకెన్ ట్రాక్ చేయండి →",

    // AI Assistant Card
    ai_assistant_patient: "AI ఆరోగ్య సహాయకుడు",
    ai_assistant_doctor: "AI క్లినికల్ సహాయకుడు",
    ai_assistant_reception: "రిసెప్షన్ డెస్క్ AI",
    ai_desc_patient: "అపాయింట్‌మెంట్ బుకింగ్, ఆరోగ్య లక్షణాలు మరియు క్యూ సమాచారం కోసం మీ వ్యక్తిగత AI సహాయకుడు.",
    ai_desc_doctor: "ఆసుపత్రి పాలనాపరమైన పనులు మరియు రోగుల సారాంశాల కోసం మీ స్మార్ట్ AI అసిస్టెంట్.",
    ai_desc_reception: "రోగుల వేగవంతమైన చెక్-ఇన్ మరియు క్యూ బ్యాలెన్సింగ్ కోసం రిసెప్షన్ AI అసిస్టెంట్.",
    ai_placeholder: "నన్ను ఏదైనా అడగండి...",
    btn_generate_summary: "సారాంశం సృష్టించండి",
    btn_book_now: "ఇప్పుడే బుక్ చేయండి",
    ai_sample_cardio: "కార్డియాలజిస్ట్ సంప్రదింపు",
    ai_sample_cardio_sub: "డాక్టర్ నవీన్ కుమార్‌తో స్లాట్ బుక్ చేయండి",
    ai_sample_telemetry: "క్యూ టెలిమెట్రీ",
    ai_sample_telemetry_sub: "గదుల మధ్య ఓపీడీ రద్దీని సమతుల్యం చేయండి",
    ai_sample_summary: "AI రోగి సారాంశం",
    ai_sample_summary_sub: "AI తో సంక్షిప్త రోగి సారాంశాన్ని పొందండి.",

    // Bottom Role Switcher
    demo_switcher_label: "డెమో రోల్ స్విచ్చర్",
    demo_switcher_instruction: "ఏదైనా బటన్‌పై నొక్కి ఆ పాత్ర వీక్షణను చూడండి:",
    role_btn_patient_en: "👤 పేషెంట్ (EN)",
    role_btn_patient_mythri: "👤 మైత్రి (కొత్త పేషెంట్ పోర్టల్)",
    role_btn_patient_te: "👤 తెలుగు పేషెంట్",
    role_btn_doctor: "🩺 డాక్టర్ (ఓపీడీ)",
    role_btn_receptionist: "💼 రిసెప్షనిస్ట్",
    role_btn_admin: "🛡️ అడ్మిన్ యాక్సెస్",
    role_btn_signout: "లాగ్ అవుట్",

    // Doctor Dashboard
    doctor_portal_title: "వైద్యుల ఓపీడీ క్లినికల్ పోర్టల్",
    assigned_opd_room: "కేటాయించిన ఓపీడీ గది",
    btn_call_next: "తదుపరి టోకెన్ పిలవండి",
    completed_today: "ఈరోజు పూర్తయినవి",
    avg_consult_time: "సగటు సంప్రదింపు సమయం",
    pending_queue: "క్యూలో వేచి ఉన్నవారు",
    btn_call_patient: "రోగిని పిలవండి",
    btn_complete: "పూర్తయింది",
    btn_issue_rx: "ఈ-ప్రిస్క్రిప్షన్ ఇవ్వండి",
    btn_soap_notes: "క్లినికల్ SOAP నోట్స్",
    tab_queue_list: "ఓపీడీ వెయిటింగ్ క్యూ",

    // Patient Dashboard
    patient_portal_title: "రోగి సంరక్షణ నిర్వహణ పోర్టల్",
    welcome_user: "స్వాగతం,",
    tab_my_hub: "నా యాక్టివ్ పేషెంట్ హబ్",
    tab_directory: "ఆసుపత్రి రోగుల డైరెక్టరీ",
    btn_book_appointment: "అపాయింట్‌మెంట్ బుక్ చేయండి",
    patient_id_label: "పేషెంట్ ID:",

    // Common
    confirmed: "ఖరారైంది",
    waiting: "వేచి ఉన్నారు",
    in_consultation: "కన్సల్టేషన్‌లో ఉన్నారు",
    completed: "ముగిసింది",
    high_risk: "అధిక ప్రమాదం",
    medium_risk: "మధ్యస్థ ప్రమాదం",
    normal_risk: "సాధారణం",
    today: "ఈరోజు",
    tomorrow: "రేపు",
    call_token_alert: "టోకెన్ విజయవంతంగా పిలవబడింది",

    // Staff Scheduler & Doctor Rosters
    roster_hub_title: "వైద్యుల డ్యూటీ రోస్టర్ & సిబ్బంది సమన్వయ కేంద్రం",
    roster_hub_subtitle: "ప్రత్యక్ష వైద్యుల డ్యూటీ రోస్టర్, ఓపీడీ గదుల కేటాయింపు, షెడ్యూల్ వివాదాల గుర్తింపు మరియు క్యూ నిర్వహణ.",
    btn_refresh_schedules: "షెడ్యూల్స్ రీఫ్రెష్ చేయండి",
    tab_doctor_rosters: "వైద్యుల డ్యూటీ రోస్టర్",
    tab_conflicts: "షెడ్యూల్ వివాదాలు",
    tab_appointments: "ఖరారైన అపాయింట్‌మెంట్లు",
    doctor_search_placeholder: "వైద్యుల పేరు, విభాగం లేదా గది నంబర్‌తో వెతకండి...",
    filter_all_doctors: "అందరూ వైద్యులు",
    filter_cardiology: "కార్డియాలజీ",
    filter_general_med: "జనరల్ మెడిసిన్",
    filter_orthopedics: "ఆర్థోపెడిక్స్",
    filter_on_duty: "డ్యూటీలో ఉన్నారు",
    status_on_duty: "డ్యూటీలో ఉన్నారు",
    status_in_consultation: "సంప్రదింపులో ఉన్నారు",
    status_backup_ready: "స్టాండ్‌బై సిద్ధం",
    status_upcoming_shift: "తదుపరి షిఫ్ట్",
    status_on_leave: "సెలవులో ఉన్నారు",
    serving_now_label: "ప్రస్తుత టోకెన్",
    waiting_count_label: "వేచి ఉన్న రోగులు",
    shift_label: "షిఫ్ట్ సమయం",
    room_desk_label: "ఓపీడీ గది",
    contact_ext_label: "ఇంటర్‌కామ్ / ఫోన్",
    crowd_alert_title: "ఆసుపత్రి రద్దీ హెచ్చరిక: కార్డియాలజీ ఓపీడీ క్యూలో 42 మంది రోగులు",
    crowd_surge_badge: "తీవ్రమైన రద్దీ > 40",
    telemetry_node_label: "కేంద్రం: కేర్‌బ్రిడ్జ్ హార్ట్ సెంటర్ గుంటూరు",
    agent_recommendation_label: "AI ఏజెంట్ సిఫార్సు:",
    crowd_recommendation_text: "డాక్టర్ సురేష్‌తో (కార్డియాలజీ బ్యాకప్) సహాయక ఓపీడీ గది 104ని ప్రారంభించండి మరియు అత్యవసరం కాని రోగులను హాస్పిటల్ Cకి మళ్లించండి.",
    current_queue_label: "ప్రస్తుత క్యూ",
    projected_queue_label: "అంచనా క్యూ",
    wait_reduction_label: "వేచి ఉండే సమయం తగ్గుదల",
    telemetry_updated_sync: "టెలిమెట్రీ 1 నిమిషం క్రితం అప్‌డేట్ చేయబడింది • స్మార్ట్‌ఫ్లో నెట్‌వర్క్ సింక్",
    btn_hide_impact: "ప్రభావం దాచండి",
    btn_view_impact: "నెట్‌వర్క్ ప్రభావం చూడండి",
    btn_approve_recommendation: "సిఫార్సును ఆమోదించండి",
    recommendation_applied_badge: "సిఫార్సు అమలు చేయబడింది (గది 104 తెరవబడింది)",
    conflicts_section_title: "ఆటోమేటెడ్ షెడ్యూల్ వివాదాలు & ఆడిట్‌లు",
    action_required_badge: "చర్య అవసరం",
    all_conflicts_cleared: "అన్నీ పరిష్కరించబడ్డాయి",
    no_conflicts_detected: "ఏ ఆసుపత్రి నోడ్‌లోనూ షెడ్యూల్ వివాదాలు కనుగొనబడలేదు.",
    conflict_label: "వివాదం",
    pending_staff_approval: "సిబ్బంది ఆమోదం కోసం వేచి ఉంది",
    issue_label: "సమస్య:",
    ai_proposed_resolution: "AI ప్రతిపాదించిన పరిష్కారం:",
    btn_approve_apply: "పరిష్కారాన్ని ఆమోదించి అమలు చేయండి",
    resolved_label: "పరిష్కరించబడింది:",
    resolved_badge: "పరిష్కరించబడింది",
    confirmed_appts_title: "షెడ్యూల్ చేయబడిన రోగుల అపాయింట్‌మెంట్లు",
    appts_search_placeholder: "రోగి, కోడ్, వైద్యుల పేరుతో వెతకండి...",
    no_appts_found: "ధృవీకరించబడిన అపాయింట్‌మెంట్లు ఏవీ లేవు. కేర్‌బ్రిడ్జ్ AI ద్వారా బుక్ చేయండి!",
    col_code: "కోడ్",
    col_patient: "రోగి పేరు",
    col_doctor: "వైద్యులు & విభాగం",
    col_hospital: "ఆసుపత్రి",
    col_datetime: "తేదీ & సమయం",
    col_est_wait: "అంచనా వేచింపు",
    col_smartflow_score: "స్మార్ట్‌ఫ్లో స్కోర్",
    col_status: "స్థితి"
  }
};

export function getTranslation(lang: string = 'en'): TranslationDictionary {
  const normalized = (lang || '').toLowerCase();
  if (normalized.startsWith('te') || normalized.includes('telugu')) {
    return translations.te;
  }
  return translations.en;
}
