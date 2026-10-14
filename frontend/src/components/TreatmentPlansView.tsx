import React, { useState } from 'react';
import { 
  ClipboardList, Pill, Heart, CheckCircle2, 
  User, Plus, Search,
  TrendingUp, Sparkles, ArrowRight, X
} from 'lucide-react';
import type { UserProfile, AppointmentRecord } from '../types';

export interface TreatmentMilestone {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  notes?: string;
}

export interface TreatmentPlanItem {
  id: string;
  patientName: string;
  patientUid: string;
  age: number;
  gender: string;
  doctorName: string;
  department: string;
  diagnosisEn: string;
  diagnosisTe: string;
  severity: 'Mild' | 'Moderate' | 'High';
  status: 'Active' | 'Under Review' | 'Completed';
  startDate: string;
  targetDate: string;
  progressPct: number;
  phase: string;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    instructions: string;
  }[];
  lifestyleDirectives: string[];
  vitalsTargets: {
    metric: string;
    target: string;
    current: string;
    status: 'optimal' | 'improving' | 'warning';
  }[];
  milestones: TreatmentMilestone[];
  clinicalNotes: string;
}

interface TreatmentPlansViewProps {
  currentProfile: UserProfile;
  appointments?: AppointmentRecord[];
  onNavigateToTab?: (tab: string) => void;
}

const INITIAL_PLANS: TreatmentPlanItem[] = [
  {
    id: 'TP-101',
    patientName: 'Sunitha Reddy',
    patientUid: 'PAT-1002',
    age: 58,
    gender: 'Female',
    doctorName: 'Dr. Naveen Kumar',
    department: 'Cardiology',
    diagnosisEn: 'Stage 1 Essential Hypertension & Mild Sinus Tachycardia',
    diagnosisTe: 'రక్తపోటు (BP) మరియు గుండె దడ చికిత్సా ప్రణాళిక',
    severity: 'Moderate',
    status: 'Active',
    startDate: '2026-09-20',
    targetDate: '2026-11-20',
    progressPct: 75,
    phase: 'Maintenance & Lifestyle Modification (Week 4 of 12)',
    medications: [
      {
        name: 'Tab Telmisartan 40mg',
        dosage: '1 Tab Daily',
        frequency: 'Morning after food (ఉదయం టిఫిన్ తర్వాత)',
        instructions: 'Do not skip. Monitor sitting BP reading after 2 hours.'
      },
      {
        name: 'Tab Atorvastatin 10mg',
        dosage: '1 Tab Daily',
        frequency: 'Night at bedtime (రాత్రి పడుకునే ముందు)',
        instructions: 'Lipid stabilization therapy. Take with water.'
      }
    ],
    lifestyleDirectives: [
      'Strict sodium restriction: Dietary salt < 2g per day (ఉప్పు తగ్గించాలి)',
      '30 minutes brisk walking daily in morning or evening (రోజువారీ నడక)',
      'Avoid high-stress activities; maintain 7-8 hours sleep schedule',
      'Record morning BP reading in CareBridge vitals log daily'
    ],
    vitalsTargets: [
      { metric: 'Blood Pressure', target: '< 120/80 mmHg', current: '126/82 mmHg', status: 'improving' },
      { metric: 'Resting Heart Rate', target: '70 - 75 bpm', current: '76 bpm', status: 'optimal' },
      { metric: 'Total Cholesterol', target: '< 180 mg/dL', current: '192 mg/dL', status: 'improving' }
    ],
    milestones: [
      { id: 'm1', title: 'Cardiology baseline assessment & resting ECG', dueDate: '2026-09-20', completed: true },
      { id: 'm2', title: 'Renal function & comprehensive lipid profile test', dueDate: '2026-09-25', completed: true },
      { id: 'm3', title: '30-day blood pressure stabilization review with Dr. Naveen Kumar', dueDate: '2026-10-20', completed: false },
      { id: 'm4', title: 'Maintenance phase compliance check & ECG follow-up', dueDate: '2026-11-20', completed: false }
    ],
    clinicalNotes: 'Patient responding well to Telmisartan. Palpitations reduced significantly. Advised low salt diet and regular hydration.'
  },
  {
    id: 'TP-102',
    patientName: 'Bhavishya',
    patientUid: 'PAT-1000',
    age: 26,
    gender: 'Female',
    doctorName: 'Dr. Priya',
    department: 'General Medicine',
    diagnosisEn: 'Acute Gastritis, Acid Peptic Disease & Mild Dyspepsia',
    diagnosisTe: 'తీవ్ర గ్యాస్ట్రిక్ సమస్య మరియు కడుపు మంట చికిత్సా ప్రణాళిక',
    severity: 'Mild',
    status: 'Active',
    startDate: '2026-10-01',
    targetDate: '2026-10-18',
    progressPct: 80,
    phase: 'Acute Mucosal Healing & Anti-Secretory Course (Day 6 of 14)',
    medications: [
      {
        name: 'Tab Pantoprazole 40mg',
        dosage: '1 Tab Daily',
        frequency: 'Morning on empty stomach (ఉదయం పరగడుపున)',
        instructions: 'Take 30 minutes before breakfast with a glass of water.'
      },
      {
        name: 'Syr. Sucralfate 10ml',
        dosage: '2 Teaspoons',
        frequency: '3 times daily after meals (భోజనం తర్వాత)',
        instructions: 'Forms protective mucosal layer. Avoid milk immediately after syrup.'
      }
    ],
    lifestyleDirectives: [
      'Eliminate deep-fried, oily, and intensely spicy foods (నూనె, కారం పదార్థాలు మానండి)',
      'Eat small frequent meals at regular intervals; avoid skipping breakfast',
      'Maintain minimum 2.5 litres daily fluid/water intake',
      'Avoid caffeinated beverages and tea on an empty stomach'
    ],
    vitalsTargets: [
      { metric: 'Epigastric Discomfort Score', target: '0 / 10 (None)', current: '2 / 10 (Mild)', status: 'improving' },
      { metric: 'Acid Reflux Frequency', target: '0 episodes/day', current: '1 episode/day', status: 'improving' }
    ],
    milestones: [
      { id: 'mb1', title: 'Clinical symptom triage & digital prescription sign-off', dueDate: '2026-10-01', completed: true },
      { id: 'mb2', title: 'Dietary & hydration protocol orientation in Telugu & English', dueDate: '2026-10-02', completed: true },
      { id: 'mb3', title: 'Complete 14-day anti-secretory mucosal healing course', dueDate: '2026-10-15', completed: false },
      { id: 'mb4', title: 'Asymptomatic review & dietary re-introduction consultation', dueDate: '2026-10-18', completed: false }
    ],
    clinicalNotes: 'Significant relief in epigastric burning. Mild discomfort only after late meals. Continue Pantoprazole course.'
  },
  {
    id: 'TP-103',
    patientName: 'Rakesh Patel',
    patientUid: 'PAT-1005',
    age: 52,
    gender: 'Male',
    doctorName: 'Dr. Naveen Kumar',
    department: 'Cardiology',
    diagnosisEn: 'Cardiovascular Risk Reduction & Atherogenic Dyslipidemia',
    diagnosisTe: 'గుండె రక్తనాళాల రక్షణ & కొలెస్ట్రాల్ నియంత్రణ ప్రణాళిక',
    severity: 'High',
    status: 'Under Review',
    startDate: '2026-09-15',
    targetDate: '2026-12-15',
    progressPct: 50,
    phase: 'Cardiometabolic Risk Optimization (Month 1 of 3)',
    medications: [
      {
        name: 'Tab Rosuvastatin 10mg',
        dosage: '1 Tab Daily',
        frequency: 'Night at bedtime (రాత్రి నిద్రపోయే ముందు)',
        instructions: 'Primary prevention for plaque stabilization.'
      },
      {
        name: 'Tab Metformin 500mg',
        dosage: '1 Tab Twice Daily',
        frequency: 'With lunch & dinner (భోజనంతో పాటు)',
        instructions: 'Insulin sensitivity support for metabolic control.'
      }
    ],
    lifestyleDirectives: [
      'Cardioprotective Mediterranean-style diet rich in greens and whole grains',
      'Aerobic cardio exercise: 40 minutes brisk walk 5 days per week',
      'Zero tobacco/smoking protocol; weekly blood pressure logs'
    ],
    vitalsTargets: [
      { metric: 'LDL Cholesterol', target: '< 70 mg/dL', current: '118 mg/dL', status: 'warning' },
      { metric: 'Fasting Blood Sugar', target: '< 100 mg/dL', current: '112 mg/dL', status: 'improving' },
      { metric: 'HbA1c Target', target: '< 6.0%', current: '6.4%', status: 'improving' }
    ],
    milestones: [
      { id: 'mr1', title: 'TMT stress test & coronary calcium score', dueDate: '2026-09-15', completed: true },
      { id: 'mr2', title: 'Cardiometabolic baseline review with Dr. Naveen Kumar', dueDate: '2026-09-22', completed: true },
      { id: 'mr3', title: '6-week repeat lipid profile and liver enzymes evaluation', dueDate: '2026-10-30', completed: false },
      { id: 'mr4', title: 'Comprehensive 90-day cardiovascular progress review', dueDate: '2026-12-15', completed: false }
    ],
    clinicalNotes: 'Moderate cardiovascular risk score. High motivation for dietary compliance. Repeat lipid profile scheduled for end of October.'
  }
];

export const TreatmentPlansView: React.FC<TreatmentPlansViewProps> = ({
  currentProfile,
  onNavigateToTab
}) => {
  const [plans, setPlans] = useState<TreatmentPlanItem[]>(INITIAL_PLANS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Under Review' | 'Completed'>('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New plan form state
  const [newPatientName, setNewPatientName] = useState('');
  const [newDiagnosis, setNewDiagnosis] = useState('');
  const [newSeverity, setNewSeverity] = useState<'Mild' | 'Moderate' | 'High'>('Moderate');
  const [newMedication, setNewMedication] = useState('');
  const [newDirectives, setNewDirectives] = useState('');

  const isDoctor = currentProfile.role === 'doctor';
  const isPatient = currentProfile.role === 'patient';

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleMilestone = (planId: string, milestoneId: string) => {
    setPlans((prev) =>
      prev.map((p) => {
        if (p.id !== planId) return p;
        const updatedMilestones = p.milestones.map((m) =>
          m.id === milestoneId ? { ...m, completed: !m.completed } : m
        );
        const completedCount = updatedMilestones.filter((m) => m.completed).length;
        const progressPct = Math.round((completedCount / updatedMilestones.length) * 100);
        return {
          ...p,
          milestones: updatedMilestones,
          progressPct
        };
      })
    );
    triggerToast('✓ Treatment milestone status updated successfully!');
  };

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName.trim() || !newDiagnosis.trim()) return;

    const newPlan: TreatmentPlanItem = {
      id: `TP-${Date.now().toString().slice(-3)}`,
      patientName: newPatientName.trim(),
      patientUid: `PAT-${Math.floor(1000 + Math.random() * 9000)}`,
      age: 45,
      gender: 'Patient',
      doctorName: currentProfile.name || 'Dr. Naveen Kumar',
      department: currentProfile.specialization || 'Clinical Medicine',
      diagnosisEn: newDiagnosis.trim(),
      diagnosisTe: `${newDiagnosis.trim()} చికిత్స`,
      severity: newSeverity,
      status: 'Active',
      startDate: new Date().toISOString().split('T')[0],
      targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      progressPct: 25,
      phase: 'Initial Active Treatment & Monitoring (Week 1 of 8)',
      medications: newMedication.trim()
        ? [
            {
              name: newMedication.trim(),
              dosage: '1 Tab Daily',
              frequency: 'Morning after food (ఉదయం టిఫిన్ తర్వాత)',
              instructions: 'Follow clinical dosage as advised.'
            }
          ]
        : [],
      lifestyleDirectives: newDirectives.trim()
        ? [newDirectives.trim(), 'Drink 2.5L water daily', 'Record daily vitals']
        : ['Maintain regular light diet', 'Drink 2.5L water daily'],
      vitalsTargets: [
        { metric: 'Clinical Stability', target: 'Normal Range', current: 'Monitoring', status: 'improving' }
      ],
      milestones: [
        { id: `m_${Date.now()}_1`, title: 'Treatment initiation and clinical prescription', dueDate: 'Today', completed: true },
        { id: `m_${Date.now()}_2`, title: '2-week vitals and symptom progress review', dueDate: 'In 14 days', completed: false }
      ],
      clinicalNotes: `Initial treatment plan established by ${currentProfile.name}. Target evaluation in 2 weeks.`
    };

    setPlans((prev) => [newPlan, ...prev]);
    setShowCreateModal(false);
    setNewPatientName('');
    setNewDiagnosis('');
    setNewMedication('');
    setNewDirectives('');
    triggerToast(`✓ New Clinical Treatment Plan created for ${newPlan.patientName}!`);
  };

  // Filter plans based on search and status
  const filteredPlans = plans.filter((p) => {
    // If patient logged in, filter to patient's own plans
    if (isPatient) {
      const matchName = currentProfile.name.toLowerCase();
      if (!p.patientName.toLowerCase().includes(matchName) && !matchName.includes(p.patientName.toLowerCase())) {
        return false;
      }
    }
    // If doctor logged in, show their patients or search matches
    const matchesSearch =
      p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.diagnosisEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.doctorName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 bg-[#F8FAFC] text-slate-800 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2 animate-bounce">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1.5">
              <ClipboardList className="h-3.5 w-3.5 text-indigo-600" />
              Clinical Care Pathways • చికిత్సా ప్రణాళికలు
            </span>
            <span className="text-xs text-slate-400">
              • {filteredPlans.length} Active Plans
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="h-7 w-7 text-indigo-600" />
            <span>Clinical Treatment Plans</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Personalized disease management protocols, recovery milestones, medication adherence, and lifestyle directives.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isDoctor && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create Treatment Plan</span>
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by patient, doctor, or diagnosis..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(['All', 'Active', 'Under Review', 'Completed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Treatment Plans Cards List */}
      <div className="max-w-6xl mx-auto space-y-6">
        {filteredPlans.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-slate-200 bg-white space-y-2">
            <ClipboardList className="h-10 w-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-base">No Treatment Plans Found</h3>
            <p className="text-xs text-slate-500">
              No matching clinical care plans for this search criteria.
            </p>
          </div>
        ) : (
          filteredPlans.map((plan) => (
            <div
              key={plan.id}
              className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-5 transition hover:shadow-md"
            >
              {/* Header: Patient Info & Plan Meta */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-base shadow-xs">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-slate-900 text-base">{plan.patientName}</h3>
                      <span className="text-xs font-mono text-slate-400">({plan.patientUid})</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {plan.gender}, {plan.age} yrs
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          plan.severity === 'High'
                            ? 'bg-rose-100 text-rose-800'
                            : plan.severity === 'Moderate'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {plan.severity} Severity
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Attending: <strong className="text-slate-700">{plan.doctorName}</strong> ({plan.department})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Plan #{plan.id}
                  </span>
                  <span className="text-xs font-mono text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                    {plan.startDate} → {plan.targetDate}
                  </span>
                </div>
              </div>

              {/* Diagnosis & Phase Bar */}
              <div className="p-4 rounded-xl bg-indigo-50/40 border border-indigo-100 space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 block">
                      Clinical Diagnosis & Protocol
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{plan.diagnosisEn}</h4>
                    <p className="text-xs text-slate-600 italic font-medium">{plan.diagnosisTe}</p>
                  </div>
                  <div className="text-right sm:shrink-0">
                    <span className="text-[11px] text-slate-500 font-semibold block">Current Phase:</span>
                    <span className="text-xs font-bold text-indigo-700">{plan.phase}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="text-slate-600">Protocol Milestone Completion</span>
                    <span className="text-indigo-700">{plan.progressPct}%</span>
                  </div>
                  <div className="h-2 w-full bg-indigo-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${plan.progressPct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* 2-Column Grid: Medications & Targets */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Column 1: Active Medication Regimen */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <Pill className="h-4 w-4 text-emerald-600" />
                    <span>Prescribed Medication Regimen • మందుల ప్రణాళిక</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    {plan.medications.map((med, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-0.5">
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span>{med.name}</span>
                          <span className="text-indigo-600 font-mono text-[11px]">{med.dosage}</span>
                        </div>
                        <p className="text-slate-600 text-[11px]">{med.frequency}</p>
                        <p className="text-slate-400 text-[10px]">{med.instructions}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 2: Clinical Vitals & Targets */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span>Clinical Targets & Vitals Tracking • లక్ష్యాలు</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    {plan.vitalsTargets.map((vt, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-800 block text-[11px]">{vt.metric}</span>
                          <span className="text-[10px] text-slate-400">Target: {vt.target}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-900 block text-xs">{vt.current}</span>
                          <span
                            className={`text-[10px] font-bold ${
                              vt.status === 'optimal'
                                ? 'text-emerald-600'
                                : vt.status === 'improving'
                                ? 'text-blue-600'
                                : 'text-rose-600'
                            }`}
                          >
                            {vt.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Lifestyle & Dietary Directives */}
              <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-100 space-y-2">
                <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <Heart className="h-4 w-4 text-emerald-600" />
                  <span>Dietary & Lifestyle Directives • జీవనశైలి & ఆహార సూచనలు</span>
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-emerald-900">
                  {plan.lifestyleDirectives.map((dir, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{dir}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Milestones Checklist */}
              <div className="space-y-2.5 pt-1">
                <span className="text-xs font-bold text-slate-900 block">
                  Clinical Care Milestones & Checklist:
                </span>
                <div className="space-y-2">
                  {plan.milestones.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => handleToggleMilestone(plan.id, m.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                        m.completed
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                          : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={m.completed}
                          onChange={() => {}}
                          className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-300 cursor-pointer"
                        />
                        <span className={`text-xs ${m.completed ? 'line-through text-slate-500 font-medium' : 'font-semibold'}`}>
                          {m.title}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 shrink-0">
                        {m.dueDate}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clinical Notes & Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-500 italic">
                  <strong>Doctor SOAP Note:</strong> "{plan.clinicalNotes}"
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      if (onNavigateToTab) onNavigateToTab('messages');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Message Patient</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Create Treatment Plan */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">New Treatment Plan</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Patient Name</label>
                <input
                  type="text"
                  required
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                  placeholder="e.g. Sunitha Reddy, Bhavishya"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Clinical Diagnosis & Target</label>
                <input
                  type="text"
                  required
                  value={newDiagnosis}
                  onChange={(e) => setNewDiagnosis(e.target.value)}
                  placeholder="e.g. Stage 1 Essential Hypertension, Dyspepsia"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Severity</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                  >
                    <option value="Mild">Mild</option>
                    <option value="Moderate">Moderate</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Attending Physician</label>
                  <input
                    type="text"
                    disabled
                    value={currentProfile.name}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Medication Regimen (Optional)</label>
                <input
                  type="text"
                  value={newMedication}
                  onChange={(e) => setNewMedication(e.target.value)}
                  placeholder="e.g. Tab Telmisartan 40mg once daily"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Dietary & Lifestyle Directive</label>
                <input
                  type="text"
                  value={newDirectives}
                  onChange={(e) => setNewDirectives(e.target.value)}
                  placeholder="e.g. Dietary salt < 2g/day, 30 min morning walk"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer shadow-xs"
                >
                  Save Treatment Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
