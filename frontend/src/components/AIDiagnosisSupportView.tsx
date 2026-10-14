import React, { useState } from 'react';
import { 
  Brain, Activity, Sparkles, AlertTriangle, 
  FileText, Pill, ChevronRight, 
  ShieldAlert, Send, RefreshCw, Microscope, 
  ArrowRight, ShieldCheck, User
} from 'lucide-react';
import type { UserProfile } from '../types';
import { ClinicalSoapModal } from './ClinicalSoapModal';

interface AIDiagnosisSupportViewProps {
  currentProfile: UserProfile;
  language: 'en' | 'te';
  seniorMode?: boolean;
  onNavigateTab: (tab: string) => void;
}

interface PatientCase {
  id: number;
  token: string;
  tokenNumber: number;
  name: string;
  nameTe: string;
  age: number;
  gender: string;
  department: string;
  chiefComplaint: string;
  chiefComplaintTe: string;
  vitals: {
    bp: string;
    bpStatus: 'Normal' | 'Borderline' | 'Elevated' | 'High';
    hr: string;
    hrStatus: 'Normal' | 'Elevated';
    spo2: string;
    temp: string;
    fbs: string;
    fbsStatus: 'Normal' | 'Elevated' | 'High';
  };
  keyLabs: string[];
  currentMeds: string[];
  differentialDiagnoses: {
    nameEn: string;
    nameTe: string;
    matchPct: number;
    risk: 'Low' | 'Moderate' | 'High';
    rationale: string;
    rationaleTe: string;
    recommendedOrders: string[];
  }[];
  redFlags: string[];
  soap: {
    subjective: string;
    subjectiveTe: string;
    objective: string;
    assessment: string;
    plan: string[];
  };
}

const PRESET_CASES: PatientCase[] = [
  {
    id: 1,
    token: 'GM-024',
    tokenNumber: 24,
    name: 'Sunitha Reddy',
    nameTe: 'సునీత రెడ్డి',
    age: 58,
    gender: 'Female',
    department: 'Cardiology',
    chiefComplaint: 'Exertional chest tightness on climbing stairs, evening fatigue, mild dizzy spells for 2 weeks.',
    chiefComplaintTe: 'కొన్ని రోజులుగా మెట్లు ఎక్కినప్పుడు గుండెల్లో ఆయాసం, సాయంత్రం వేళ నీరసం, అప్పుడప్పుడు కళ్లు తిరగడం.',
    vitals: {
      bp: '130/85 mmHg',
      bpStatus: 'Borderline',
      hr: '76 bpm',
      hrStatus: 'Normal',
      spo2: '98%',
      temp: '98.4 °F',
      fbs: '158 mg/dL',
      fbsStatus: 'Elevated'
    },
    keyLabs: [
      'HbA1c: 8.4% (Elevated)',
      'Total Cholesterol: 212 mg/dL (Borderline)',
      'LDL: 134 mg/dL',
      'Serum Creatinine: 0.9 mg/dL (Normal)'
    ],
    currentMeds: ['Telmisartan 40mg OD', 'Multivitamin daily'],
    differentialDiagnoses: [
      {
        nameEn: 'Stage 1 Essential Hypertension with Exertional Angina Risk',
        nameTe: 'స్టేజ్ 1 రక్తపోటు మరియు గుండె ఆయాసం (ఆంజినా) ప్రమాదం',
        matchPct: 88,
        risk: 'High',
        rationale: 'Concurrent hypertension history, exertional symptom trigger, elevated lipids, and metabolic decompensation.',
        rationaleTe: 'రక్తపోటు చరిత్ర, శ్రమతో కూడిన ఆయాసం, పెరిగిన కొలెస్ట్రాల్ మరియు రక్తంలో చక్కెర స్థాయిలు.',
        recommendedOrders: ['12-Lead Resting ECG', '2D Echocardiography', 'Treadmill Stress Test (TMT)', 'Fasting Lipid Profile']
      },
      {
        nameEn: 'Atherogenic Dyslipidemia & Early Coronary Artery Screening',
        nameTe: 'రక్తనాళాలలో కొలెస్ట్రాల్ పేరుకుపోవడం & గుండె రక్తనాళాల స్క్రీనింగ్',
        matchPct: 76,
        risk: 'Moderate',
        rationale: 'Elevated LDL (134 mg/dL) combined with HbA1c 8.4% significantly increases atherosclerotic cardiovascular risk.',
        rationaleTe: 'పెరిగిన కొలెస్ట్రాల్ మరియు చక్కెర స్థాయి గుండె రక్తనాళాలపై ఒత్తిడి తెస్తాయి.',
        recommendedOrders: ['High-Sensitivity Troponin-I', 'Carotid Doppler Ultrasound', 'Apo-B / Lipoprotein(a)']
      },
      {
        nameEn: 'Metabolic Syndrome Fatigue & Dysglycemic Symptoms',
        nameTe: 'మెటబాలిక్ సిండ్రోమ్ మరియు అలసట లక్షణాలు',
        matchPct: 62,
        risk: 'Moderate',
        rationale: 'Uncontrolled hyperglycemia (HbA1c 8.4%) contributing to fatigue, lethargy, and cardiovascular workload.',
        rationaleTe: 'అనియంత్రిత మధుమేహం వల్ల శారీరక బలహీనత మరియు నీరసం కలగవచ్చు.',
        recommendedOrders: ['Postprandial Blood Sugar (PPBS)', 'Urine Microalbumin', 'Electrolyte Panel']
      }
    ],
    redFlags: [
      'Chest tightness radiating to left arm, neck, or jaw',
      'Pain accompanied by diaphoresis (cold sweats) or syncope',
      'Resting chest discomfort lasting >15 minutes (Immediate 108/ICU Protocol)'
    ],
    soap: {
      subjective: '58F with known hypertension presents with 2-week history of exertional retrosternal discomfort and evening lethargy.',
      subjectiveTe: '58 ఏళ్ల మహిళ రక్తపోటు సమస్యతో బాధపడుతున్నారు, గత 2 వారాలుగా మెట్లు ఎక్కినప్పుడు ఆయాసం, నీరసం ఉన్నాయి.',
      objective: 'BP 130/85, Pulse 76 regular. Extracted labs show HbA1c 8.4%, Total Cholesterol 212 mg/dL. Systemic exam clear.',
      assessment: 'Likely exertional cardiac ischemia in setting of poorly controlled metabolic risk factors (HTN + elevated HbA1c).',
      plan: [
        'Order stat 12-lead ECG and baseline cardiac enzymes.',
        'Consider escalating Telmisartan or adding Amlodipine 5mg if BP persists >130/80.',
        'Endocrine consultation for initiating Metformin 500mg ER with diet counseling.',
        'Strict advice on red-flag warning signs and emergency helpline 108.'
      ]
    }
  },
  {
    id: 2,
    token: 'GM-025',
    tokenNumber: 25,
    name: 'Bhavishya',
    nameTe: 'భవిష్య',
    age: 26,
    gender: 'Female',
    department: 'General Medicine',
    chiefComplaint: 'Bilateral band-like throbbing headache, neck soreness after work, difficulty focusing on screen for 5 days.',
    chiefComplaintTe: 'గత 5 రోజులుగా తల చుట్టూ ఒత్తిడితో కూడిన నొప్పి, మెడ పట్టేయడం, కంప్యూటర్ స్క్రీన్ చూస్తున్నప్పుడు కళ్లు లాగడం.',
    vitals: {
      bp: '116/74 mmHg',
      bpStatus: 'Normal',
      hr: '82 bpm',
      hrStatus: 'Normal',
      spo2: '99%',
      temp: '98.6 °F',
      fbs: '92 mg/dL',
      fbsStatus: 'Normal'
    },
    keyLabs: [
      'Complete Blood Count (CBC): Normal (Hb 12.8 g/dL)',
      'Thyroid Profile (TSH): 2.4 mIU/L (Euthyroid)',
      'Serum Electrolytes: Normal bounds'
    ],
    currentMeds: ['Occasional Paracetamol 500mg'],
    differentialDiagnoses: [
      {
        nameEn: 'Tension-Type Headache with Cervicogenic Muscular Strain',
        nameTe: 'టెన్షన్ తలనొప్పి మరియు మెడ కండరాల ఒత్తిడి',
        matchPct: 92,
        risk: 'Low',
        rationale: 'Bilateral pressing band-like distribution, absence of aura or vomiting, clear postural trigger from prolonged screen posture.',
        rationaleTe: 'స్క్రీన్ వాడకం, మెడ ఒత్తిడి వల్ల వచ్చే సాధారణ టెన్షన్ తలనొప్పి.',
        recommendedOrders: ['Visual Acuity & Refraction Check', 'Cervical Spine Mobility Assessment', 'Ergonomic Review']
      },
      {
        nameEn: 'Digital Asthenopia & Computer Vision Syndrome',
        nameTe: 'డిజిటల్ ఐ స్ట్రెయిన్ (కంటి అలసట)',
        matchPct: 84,
        risk: 'Low',
        rationale: 'Prolonged digital display exposure inducing accommodative spasm and peri-orbital tension.',
        rationaleTe: 'కంటి అలసట వల్ల తలనొప్పి మరియు దృష్టి కేంద్రీకరించడంలో సమస్య.',
        recommendedOrders: ['Ophthalmology Refraction Test', 'Tear Breakup Time (Dry Eye Screen)']
      },
      {
        nameEn: 'Early Migraine without Aura (Mild Episode)',
        nameTe: 'మైగ్రేన్ తలనొప్పి (ప్రారంభ దశ)',
        matchPct: 48,
        risk: 'Moderate',
        rationale: 'Photophobia or throbbing quality can overlap, but lack of nausea/vomiting lowers probability.',
        rationaleTe: 'వెలుతురు చూడలేకపోవడం లేదా ఒకవైపు నొప్పి ఉంటే మైగ్రేన్ అయ్యే అవకాశం.',
        recommendedOrders: ['Neurology Clinical Evaluation', 'Headache Diary Logging']
      }
    ],
    redFlags: [
      'Sudden onset "thunderclap" headache peaking within seconds',
      'Headache with focal neurologic signs, fever, neck stiffness with chin-to-chest block',
      'Worsening headache on waking or with Valsalva maneuver'
    ],
    soap: {
      subjective: '26F IT professional reports 5-day dull band-like headache with bilateral paracervical tenderness. No visual aura, nausea, or fever.',
      subjectiveTe: '26 ఏళ్ల సాఫ్ట్‌వేర్ ఉద్యోగి, 5 రోజులుగా తలనొప్పి, మెడ కండరాల బిగుతుతో బాధపడుతున్నారు.',
      objective: 'BP 116/74, Pulse 82. Neurological exam intact. No papilledema. Tenderness over trapezius and suboccipital muscles.',
      assessment: 'Episodic tension-type headache exacerbated by occupational ergonomics and prolonged screen time.',
      plan: [
        'Recommend 20-20-20 screen rule and ergonomic workstation adjustments.',
        'Prescribe Naproxen 250mg PRN with food or Paracetamol 650mg SOS.',
        'Prescribe warm compresses and gentle cervical stretching exercises.',
        'Follow-up in 10 days if symptoms persist or new visual symptoms arise.'
      ]
    }
  },
  {
    id: 3,
    token: 'GM-026',
    tokenNumber: 26,
    name: 'Rajesh Kumar',
    nameTe: 'రాజేష్ కుమార్',
    age: 42,
    gender: 'Male',
    department: 'Gastroenterology',
    chiefComplaint: 'Burning retrosternal chest pain aggravated after spicy meals and when lying flat. Nocturnal acid regurgitation for 3 weeks.',
    chiefComplaintTe: 'కడుపులో మరియు ఛాతీ మధ్యలో మంట, కారంగా ఉన్న ఆహారం తిన్న తర్వాత ఎక్కువవ్వడం, రాత్రి పూట గొంతులోకి పుల్లటి నీళ్లు రావడం.',
    vitals: {
      bp: '124/80 mmHg',
      bpStatus: 'Normal',
      hr: '72 bpm',
      hrStatus: 'Normal',
      spo2: '98%',
      temp: '98.2 °F',
      fbs: '108 mg/dL',
      fbsStatus: 'Normal'
    },
    keyLabs: [
      'Hemoglobin: 14.2 g/dL (Normal)',
      'Liver Function Tests (ALT/AST): 28/32 U/L (Normal)',
      'Serum Amylase/Lipase: Normal bounds'
    ],
    currentMeds: ['Over-the-counter Antacid gel (Gelusil)'],
    differentialDiagnoses: [
      {
        nameEn: 'Gastroesophageal Reflux Disease (GERD) with Reflux Esophagitis',
        nameTe: 'గ్యాస్ట్రోఎసోఫాగియల్ రిఫ్లక్స్ వ్యాధి (GERD) & ఎసిడిటీ',
        matchPct: 91,
        risk: 'Moderate',
        rationale: 'Classic postural and post-prandial heartburn, water brash, nocturnal sour regurgitation responsive partially to antacids.',
        rationaleTe: 'తిన్న తర్వాత ఛాతీలో మంట, రాత్రి వేళ పుల్లటి తేన్పులు GERD కి ముఖ్య సూచికలు.',
        recommendedOrders: ['Upper GI Endoscopy (EGD)', 'Baseline 12-Lead ECG (Cardiac Exclusion)', 'H. Pylori Stool Antigen']
      },
      {
        nameEn: 'Acute Gastritis & Peptic Duodenopathy',
        nameTe: 'గ్యాస్ట్రైటిస్ & కడుపులో పుండు (అల్సర్)',
        matchPct: 78,
        risk: 'Moderate',
        rationale: 'Epigastric tenderness and burning relationship with meal timing suggest gastric mucosal inflammation.',
        rationaleTe: 'కడుపు లోపలి పొర వాపు వల్ల వచ్చే గ్యాస్ట్రైటిస్ మంట.',
        recommendedOrders: ['Abdominal Ultrasound', 'Serum Pepsinogen I/II Ratio']
      },
      {
        nameEn: 'Atypical Angina Pectoris (Must Be Excluded)',
        nameTe: 'ఎటిపికల్ ఆంజినా (గుండె సంబంధిత నొప్పి మినహాయింపు తప్పనిసరి)',
        matchPct: 54,
        risk: 'High',
        rationale: 'Middle-aged male with retrosternal burning requires strict exclusion of inferior wall ischemia despite GI triggers.',
        rationaleTe: '40 ఏళ్లు పైబడిన పురుషులలో ఛాతీ మంటను కేవలం గ్యాస్ అనుకోకుండా గుండె పరీక్ష చేయించాలి.',
        recommendedOrders: ['Baseline ECG', 'High-Sensitivity Troponin-I']
      }
    ],
    redFlags: [
      'Progressive dysphagia (difficulty swallowing) or painful swallowing (odynophagia)',
      'Unexplained weight loss, recurrent vomiting, or hematemesis (coffee-ground emesis)',
      'Pain radiating to back, left shoulder, or associated with cold diaphoresis'
    ],
    soap: {
      subjective: '42M reports 3-week progressive heartburn exacerbated post-prandially and on recumbency. Denies exertion-induced pain.',
      subjectiveTe: '42 ఏళ్ల పురుషుడు ఛాతీలో మంట, తిన్న తర్వాత పడుకుంటే నొప్పి తీవ్రమవ్వడం వంటి సమస్యలతో వచ్చారు.',
      objective: 'BP 124/80, HR 72. Mild epigastric tenderness on deep palpation. No guarding or rigidity. Resting ECG normal sinus rhythm.',
      assessment: 'Clinical presentation highly consistent with GERD with low pre-test probability of acute coronary syndrome.',
      plan: [
        'Initiate Pantoprazole 40mg OD 30 minutes before breakfast for 4 weeks.',
        'Add Magaldrate + Simethicone oral suspension 10ml after dinner.',
        'Dietary instructions: Elevate head of bed 6 inches, avoid late-night meals and triggers.',
        'Order baseline ECG to document normal cardiac trace.'
      ]
    }
  },
  {
    id: 4,
    token: 'GM-027',
    tokenNumber: 27,
    name: 'Venkat Rao',
    nameTe: 'వెంకట రావు',
    age: 64,
    gender: 'Male',
    department: 'Neurology & Medicine',
    chiefComplaint: 'Burning numbness and pins-and-needles paresthesia in both soles and toes for 4 months. Unsteady when walking in dark.',
    chiefComplaintTe: 'గత 4 నెలలుగా రెండు పాదాల్లో తిమ్మిర్లు, మంటలు, సూదులతో గుచ్చినట్లు అనిపించడం, చీకట్లో నడిచేటప్పుడు తడబడటం.',
    vitals: {
      bp: '142/90 mmHg',
      bpStatus: 'High',
      hr: '68 bpm',
      hrStatus: 'Normal',
      spo2: '97%',
      temp: '98.0 °F',
      fbs: '182 mg/dL',
      fbsStatus: 'High'
    },
    keyLabs: [
      'Fasting Blood Sugar: 182 mg/dL (High)',
      'HbA1c: 9.1% (Poorly Controlled)',
      'Serum Vitamin B12: 178 pg/mL (Low Deficiency)',
      'eGFR: 72 mL/min/1.73m² (Mild impairment)'
    ],
    currentMeds: ['Metformin 1000mg BD (for 8 years)', 'Amlodipine 5mg OD'],
    differentialDiagnoses: [
      {
        nameEn: 'Distal Symmetric Diabetic Sensorimotor Polyneuropathy',
        nameTe: 'డయాబెటిక్ న్యూరోపతి (మధుమేహం వల్ల నరాల బలహీనత)',
        matchPct: 94,
        risk: 'High',
        rationale: 'Long-standing diabetes (8 years) with persistent hyperglycemia (HbA1c 9.1%) causing length-dependent axonal sensory loss in stocking distribution.',
        rationaleTe: 'దీర్ఘకాలిక అనియంత్రిత షుగర్ వల్ల పాదాల నరాలు దెబ్బతినడం.',
        recommendedOrders: ['10-g Semmes-Weinstein Monofilament Test', 'Vibration Perception Threshold (Biothesiometry)', 'Nerve Conduction Study (NCS)']
      },
      {
        nameEn: 'Metformin-Induced Vitamin B12 Deficiency Neuropathy',
        nameTe: 'విటమిన్ B12 లోపం వల్ల నరాల నొప్పి (మెట్‌ఫార్మిన్ ప్రభావం)',
        matchPct: 83,
        risk: 'Moderate',
        rationale: 'Prolonged high-dose Metformin therapy (>5 years) reduces ileal B12 absorption; confirmed by serum B12 < 200 pg/mL.',
        rationaleTe: 'మెట్‌ఫార్మిన్ మందు ఎక్కువ కాలం వాడటం వల్ల B12 విటమిన్ తగ్గి నరాల తిమ్మిర్లు వస్తాయి.',
        recommendedOrders: ['Serum Methylmalonic Acid (MMA)', 'Homocysteine Level', 'Complete Blood Count (MCV check)']
      },
      {
        nameEn: 'Lumbar Spinal Canal Stenosis with Radicular Symptoms',
        nameTe: 'వెన్నెముక నరాల నొక్కుడు (లంబార్ స్టెనోసిస్)',
        matchPct: 42,
        risk: 'Low',
        rationale: 'Gait instability in elderly male could have spinal origin, but symmetric bilateral stocking pattern favors peripheral etiology.',
        rationaleTe: 'వయసు రీత్యా వెన్నెముక సమస్యలు ఉండే అవకాశం ఉన్నప్పటికీ, పాదాల నరాల లోపం ఎక్కువగా కనిపిస్తుంది.',
        recommendedOrders: ['Lumbosacral Spine X-Ray / MRI', 'Straight Leg Raise Test']
      }
    ],
    redFlags: [
      'Rapidly ascending motor weakness reaching knees or upper extremities',
      'Sudden loss of bowel or bladder sphincter control (Cauda Equina Syndrome)',
      'Foot ulceration, Charcot neuroarthropathy, or painless thermal burns on feet'
    ],
    soap: {
      subjective: '64M with T2D x 8 yrs reports progressive stocking paresthesias and burning dysesthesia disrupting sleep.',
      subjectiveTe: '64 ఏళ్ల మధుమేహ రోగి, పాదాల్లో తీవ్రమైన మంటలు, రాత్రి వేళ నిద్రపట్టకపోవడం వంటి సమస్యలు.',
      objective: 'BP 142/90, FBS 182, HbA1c 9.1%. Reduced pinprick and vibration sensation in bilateral distal lower extremities below mid-calf. Absent ankle jerks.',
      assessment: 'Dual-etiology peripheral neuropathy: Diabetic sensorimotor neuropathy aggravated by documented Metformin-induced B12 deficiency.',
      plan: [
        'Initiate Methylcobalamin 1500 mcg oral daily for B12 replenishment.',
        'Start Pregabalin 75mg at bedtime for neuropathic pain relief.',
        'Endocrine referral to intensify glycemic control (consider adding SGLT2i or Gliptin).',
        'Diabetic foot care counseling and protective footwear prescription.'
      ]
    }
  }
];

export const AIDiagnosisSupportView: React.FC<AIDiagnosisSupportViewProps> = ({
  currentProfile,
  language,
  seniorMode = false,
  onNavigateTab
}) => {
  const isTe = language === 'te';

  // Selected Patient Case
  const [selectedCaseId, setSelectedCaseId] = useState<number>(1);
  const selectedCase = PRESET_CASES.find((c) => c.id === selectedCaseId) || PRESET_CASES[0];

  // Clinical SOAP Modal State
  const [soapModalPatient, setSoapModalPatient] = useState<{ id: number; name: string; token: number } | null>(null);

  // Interactive Drug Interaction Checker State
  const [drugA, setDrugA] = useState('Telmisartan 40mg');
  const [drugB, setDrugB] = useState('Ibuprofen 400mg');
  const [interactionResult, setInteractionResult] = useState<{
    risk: 'Severe' | 'Moderate' | 'Safe';
    title: string;
    description: string;
    alternative: string;
  } | null>({
    risk: 'Moderate',
    title: 'ACEi/ARB + NSAID Interaction Warning',
    description: 'NSAIDs blunt the antihypertensive effect of ARBs (Telmisartan) and synergistically decrease renal prostaglandin synthesis, increasing acute kidney injury risk.',
    alternative: 'Use Paracetamol 650mg for mild-to-moderate analgesia instead of NSAIDs.'
  });

  // Clinical Copilot Query State
  const [queryInput, setQueryInput] = useState('');
  const [queryResult, setQueryResult] = useState<{ query: string; response: string; tests: string[] } | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);

  const handleRunDrugCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const a = drugA.toLowerCase();
    const b = drugB.toLowerCase();

    if ((a.includes('telmisartan') || a.includes('amlodipine')) && (b.includes('ibuprofen') || b.includes('diclofenac'))) {
      setInteractionResult({
        risk: 'Moderate',
        title: isTe ? 'రక్తపోటు మందు + NSAID నొప్పి నివారిణి పరస్పర చర్య' : 'Antihypertensive + NSAID Interaction',
        description: isTe 
          ? 'బ్రూఫెన్ లేదా డైక్లోఫెనాక్ వంటి మందులు టెల్మిసార్టన్ రక్తపోటు నియంత్రణ ప్రభావాన్ని తగ్గిస్తాయి మరియు కిడ్నీలపై ఒత్తిడి పెంచుతాయి.'
          : 'NSAIDs blunt ARB/ACEi vasodilation and reduce renal perfusion. Regular monitoring of renal function and BP required.',
        alternative: isTe ? 'పారాసిటమాల్ 650mg వాడటం సురక్షితమైన ప్రత్యామ్నాయం.' : 'Paracetamol / Acetaminophen 650mg is the preferred analgesic alternative.'
      });
    } else if (a.includes('metformin') && (b.includes('alcohol') || b.includes('contrast'))) {
      setInteractionResult({
        risk: 'Severe',
        title: isTe ? 'లాక్టిక్ ఎసిడోసిస్ అధిక ప్రమాదం' : 'High Risk of Lactic Acidosis',
        description: isTe
          ? 'మెట్‌ఫార్మిన్ తీసుకుంటున్నప్పుడు ఆల్కహాల్ లేదా ఐయోడినేటెడ్ కాంట్రాస్ట్ డై తీవ్రమైన లాక్టిక్ ఎసిడోసిస్‌కు దారితీయవచ్చు.'
          : 'Hold Metformin 48 hours prior to iodinated radiocontrast procedures and ensure eGFR > 45 mL/min before restarting.',
        alternative: isTe ? 'తాత్కాలికంగా ఇన్సులిన్ లేదా DPP-4 ఇన్హిబిటర్ పరిగణించండి.' : 'Temporary short-acting insulin coverage until contrast cleared.'
      });
    } else {
      setInteractionResult({
        risk: 'Safe',
        title: isTe ? 'తీవ్రమైన పరస్పర చర్యలు గుర్తించబడలేదు' : 'No Critical Interaction Detected',
        description: isTe 
          ? 'ఎంచుకున్న రెండు ఔషధాల మధ్య తెలిసిన తీవ్రమైన పరస్పర విరుద్ధతలు లేవు. సాధారణ మోతాదులో కొనసాగించవచ్చు.'
          : 'No severe pharmacokinetic or pharmacodynamic contraindication reported. Routine clinical monitoring applies.',
        alternative: isTe ? 'వైద్యుల పర్యవేక్షణలో ప్రామాణిక మోతాదులను కొనసాగించండి.' : 'Continue standard therapeutic dosages with periodic metabolic checks.'
      });
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    setQueryInput(promptText);
    setIsQuerying(true);
    setTimeout(() => {
      setQueryResult({
        query: promptText,
        response: isTe 
          ? `క్లినికల్ విశ్లేషణ: "${promptText}" ఆధారంగా, రోగి వయస్సు మరియు ప్రాథమిక లక్షణాలను పరిగణనలోకి తీసుకుంటే, ముందుగా తీవ్రమైన గుండె మరియు రక్తనాళాల సమస్యలను మినహాయించాలి (Cardiac rule-out). తదుపరి దశలో రొటీన్ బయోకెమిస్ట్రీ ల్యాబ్స్ మరియు 12-Lead ECG సిఫార్సు చేయబడింది.`
          : `Clinical synthesis for "${promptText}": Priority assessment must exclude high-acuity cardiovascular ischemia and metabolic decompensation. Stratify based on Framingham / ACC risk score and obtain objective telemetry.`,
        tests: ['12-Lead ECG', 'High-Sensitivity Troponin-I', 'Fasting Blood Glucose & HbA1c', 'Complete Metabolic Panel']
      });
      setIsQuerying(false);
    }, 600);
  };

  return (
    <div className={`flex-1 bg-[#F8FAFC] text-slate-800 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-24 ${seniorMode ? 'text-[15px]' : ''}`}>
      {/* 1. Header Banner */}
      <div className="max-w-6xl mx-auto bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1.5">
              <Brain className="h-3.5 w-3.5 text-indigo-600" />
              <span>{isTe ? 'క్లినికల్ డెసిషన్ సపోర్ట్ (CDSS)' : 'Clinical Decision Support System (CDSS)'}</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <Activity className="h-3 w-3 text-emerald-500 animate-pulse" />
              <span>{isTe ? 'AI మోడల్ యాక్టివ్' : 'AI Clinical Copilot Active'}</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
              {isTe ? 'వైద్యుల ధృవీకరణ అవసరం' : 'Doctor Approval Required'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Brain className="h-7 w-7 text-indigo-600" />
            <span>{isTe ? 'AI డయాగ్నోసిస్ & క్లినికల్ సపోర్ట్' : 'AI Diagnosis & Decision Support'}</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            {isTe 
              ? 'OPD వైద్యుల కోసం ముందస్తు రోగ నిర్ధారణ విశ్లేషణ, డిఫరెన్షియల్ డయాగ్నోసిస్ (DDx), ప్రీ-కన్సల్టేషన్ SOAP నోట్స్ మరియు ఔషధ భద్రతా తనిఖీ.'
              : 'Assistive clinical decision support: Automated differential diagnosis drafts, pre-consultation SOAP notes synthesis, and drug contraindication guardrails for attending physicians.'}
          </p>
        </div>

        {/* Quick Action Badges */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 self-stretch lg:self-auto">
          <button
            onClick={() => onNavigateTab('treatment_plans')}
            className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isTe ? 'చికిత్సా ప్రణాళికలు' : 'Treatment Plans'}</span>
          </button>
          <button
            onClick={() => onNavigateTab('prescriptions')}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Pill className="w-3.5 h-3.5" />
            <span>{isTe ? 'ఈ-ప్రిస్క్రిప్షన్లు' : 'Prescriptions'}</span>
          </button>
        </div>
      </div>

      {/* 2. Clinical Safety Guardrail Notice */}
      <div className="max-w-6xl mx-auto bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 flex items-start gap-3 text-amber-900">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <strong className="font-bold block text-amber-950 mb-0.5">
            {isTe ? 'క్లినికల్ సేఫ్టీ గైడ్‌లైన్స్ & లీగల్ నోటీసు (Human-in-the-Loop Architecture)' : 'Clinical Safety Guardrail & Legal Notice (Human-in-the-Loop)'}
          </strong>
          <span>
            {isTe 
              ? 'CareBridge AI స్వయంప్రతిపత్తితో వైద్య చికిత్స లేదా ప్రిస్క్రిప్షన్లను జారీ చేయదు. ఇది కేవలం హాస్పిటల్ డేటా, ల్యాబ్ ఫలితాలు మరియు లక్షణాలను విశ్లేషించి వైద్యులకు సలహా రూపంలో మాత్రమే అందిస్తుంది. తుది రోగ నిర్ధారణ (Final Diagnosis) మరియు ప్రిస్క్రిప్షన్ తప్పనిసరిగా సర్టిఫైడ్ వైద్యుల సమీక్ష మరియు సంతకంతోనే జరగాలి.'
              : 'CareBridge AI does not operate as an autonomous medical practitioner. All differential diagnoses, clinical drafts, and investigative suggestions are assistive pre-consultation decision-support aids. Final clinical diagnosis, prescription sign-off, and patient management decisions remain strictly under attending physician authority.'}
          </span>
        </div>
      </div>

      {/* 3. Patient Case Selector Bar */}
      <div className="max-w-6xl mx-auto space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              {isTe ? 'ప్రస్తుత OPD వెయిటింగ్ రోగుల క్లినికల్ కేసులు' : 'Active OPD Cases for AI Diagnostic Review'}
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            {isTe ? 'కేసును ఎంచుకోవడానికి క్రింది కార్డ్ పై క్లిక్ చేయండి' : 'Select patient to review AI clinical reasoning'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_CASES.map((pCase) => {
            const isSelected = pCase.id === selectedCaseId;
            return (
              <button
                key={pCase.id}
                onClick={() => setSelectedCaseId(pCase.id)}
                className={`p-4 rounded-2xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 scale-[1.01]'
                    : 'bg-white text-slate-800 border-slate-200/90 hover:border-indigo-300 hover:bg-slate-50/80 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    }`}>
                      Token #{pCase.token}
                    </span>
                    <span className={`text-[11px] font-semibold ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {pCase.department}
                    </span>
                  </div>

                  <h3 className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {isTe ? pCase.nameTe : pCase.name}
                  </h3>
                  <p className={`text-xs mt-0.5 ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                    {pCase.age} yrs • {pCase.gender}
                  </p>
                </div>

                <div className={`mt-3 pt-2 border-t text-[11px] line-clamp-2 ${
                  isSelected ? 'border-white/20 text-indigo-100' : 'border-slate-100 text-slate-600'
                }`}>
                  <strong>Complaint:</strong> {isTe ? pCase.chiefComplaintTe : pCase.chiefComplaint}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Active Case Diagnostic Cockpit */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Patient Metrics & AI Differential Diagnoses */}
        <div className="lg:col-span-2 space-y-6">

          {/* Vitals & Intake Snapshot Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    {isTe ? selectedCase.nameTe : selectedCase.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Token #{selectedCase.token}
                  </span>
                  <span className="text-xs text-slate-500">
                    ({selectedCase.age}y {selectedCase.gender} • {selectedCase.department})
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  <strong>Chief Complaint:</strong> {isTe ? selectedCase.chiefComplaintTe : selectedCase.chiefComplaint}
                </p>
              </div>

              <button
                onClick={() => setSoapModalPatient({ id: selectedCase.id, name: selectedCase.name, token: selectedCase.tokenNumber })}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isTe ? 'పూర్తి SOAP బ్రీఫ్ చూడండి' : 'Launch Full SOAP Brief'}</span>
              </button>
            </div>

            {/* Vitals Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">BP (రక్తపోటు)</span>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 block my-0.5">{selectedCase.vitals.bp}</span>
                <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                  selectedCase.vitals.bpStatus === 'Normal' ? 'bg-emerald-50 text-emerald-700' :
                  selectedCase.vitals.bpStatus === 'Borderline' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                }`}>
                  {selectedCase.vitals.bpStatus}
                </span>
              </div>

              <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Heart Rate</span>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 block my-0.5">{selectedCase.vitals.hr}</span>
                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700">
                  {selectedCase.vitals.hrStatus}
                </span>
              </div>

              <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">SpO2 (ఆక్సిజన్)</span>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 block my-0.5">{selectedCase.vitals.spo2}</span>
                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700">
                  Normal
                </span>
              </div>

              <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Temperature</span>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 block my-0.5">{selectedCase.vitals.temp}</span>
                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700">
                  Afebrile
                </span>
              </div>

              <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">FBS (షుగర్)</span>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 block my-0.5">{selectedCase.vitals.fbs}</span>
                <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                  selectedCase.vitals.fbsStatus === 'Normal' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}>
                  {selectedCase.vitals.fbsStatus}
                </span>
              </div>
            </div>

            {/* Extracted Labs & Current Meds Pill Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="font-bold text-slate-500 text-[11px] uppercase tracking-wider">
                {isTe ? 'ల్యాబ్ ఫలితాలు:' : 'Key Labs:'}
              </span>
              {selectedCase.keyLabs.map((lab, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-mono text-[11px] font-semibold">
                  {lab}
                </span>
              ))}
            </div>
          </div>

          {/* AI Differential Diagnoses (DDx) Recommendations */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {isTe ? 'AI డిఫరెన్షియల్ డయాగ్నోసిస్ సిఫార్సులు (DDx)' : 'AI Differential Diagnosis Recommendations (DDx)'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isTe ? 'లక్షణాలు, ల్యాబ్స్ మరియు రిస్క్ ఆధారంగా లెక్కించిన సంభావ్యత' : 'Probability ranking matching intake vitals, patient narrative, and clinical records'}
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-mono">
                {selectedCase.differentialDiagnoses.length} Matches Found
              </span>
            </div>

            <div className="space-y-4">
              {selectedCase.differentialDiagnoses.map((ddx, idx) => (
                <div 
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {isTe ? ddx.nameTe : ddx.nameEn}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 pl-7">
                        {isTe ? ddx.nameEn : ddx.nameTe}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pl-7 sm:pl-0">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ddx.risk === 'High' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        ddx.risk === 'Moderate' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {ddx.risk} Risk
                      </span>

                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-slate-200 shadow-2xs">
                        <span className="text-xs font-black text-indigo-600">{ddx.matchPct}%</span>
                        <span className="text-[10px] text-slate-400 font-medium">Match</span>
                      </div>
                    </div>
                  </div>

                  {/* Match Progress Bar */}
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${ddx.matchPct}%` }}
                    />
                  </div>

                  {/* Clinical Rationale */}
                  <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-200/70">
                    <strong>{isTe ? 'క్లినికల్ సమర్థన:' : 'Clinical Rationale:'}</strong> {isTe ? ddx.rationaleTe : ddx.rationale}
                  </p>

                  {/* Recommended Orders Chips */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      {isTe ? 'సూచించిన వైద్య పరీక్షలు (Recommended Diagnostic Workup):' : 'Recommended Diagnostic Workup:'}
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {ddx.recommendedOrders.map((ord, oi) => (
                        <span key={oi} className="px-2.5 py-1 rounded-lg bg-indigo-50/70 border border-indigo-200/80 text-indigo-800 text-xs font-semibold flex items-center gap-1">
                          <Microscope className="w-3 h-3 text-indigo-600" />
                          <span>{ord}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Red Flag Warning Box */}
          <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>{isTe ? 'రెడ్ ఫ్లాగ్ హెచ్చరికలు & అత్యవసర ప్రోటోకాల్ (Red Flags)' : 'Clinical Red Flags & Immediate Escalation Triggers'}</span>
            </div>
            <ul className="text-xs text-rose-900 space-y-1 pl-4 list-disc">
              {selectedCase.redFlags.map((rf, rfi) => (
                <li key={rfi} className="leading-relaxed font-medium">{rf}</li>
              ))}
            </ul>
          </div>

        </div>

        {/* Right Column (1 Col): SOAP Note Synthesis, Drug Interactions, and AI Second Opinion */}
        <div className="space-y-6">

          {/* SOAP Clinical Note Synthesis */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  {isTe ? 'ప్రీ-కన్సల్టేషన్ SOAP నోట్' : 'Pre-Consultation SOAP Notes'}
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                Draft
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                <span className="font-extrabold text-blue-900 block mb-1">S • Subjective (రోగి లక్షణాలు)</span>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {isTe ? selectedCase.soap.subjectiveTe : selectedCase.soap.subjective}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <span className="font-extrabold text-emerald-900 block mb-1">O • Objective (ల్యాబ్స్ & కొలతలు)</span>
                <p className="text-slate-700 leading-relaxed">
                  {selectedCase.soap.objective}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                <span className="font-extrabold text-amber-900 block mb-1">A • Assessment (ముందస్తు అంచనా)</span>
                <p className="text-slate-700 leading-relaxed">
                  {selectedCase.soap.assessment}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100">
                <span className="font-extrabold text-purple-900 block mb-1">P • Plan (ప్రతిపాదిత చికిత్స)</span>
                <ul className="text-slate-700 space-y-1 pl-3 list-disc">
                  {selectedCase.soap.plan.map((item, pIdx) => (
                    <li key={pIdx} className="leading-snug">{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('treatment_plans')}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <span>{isTe ? 'చికిత్సా ప్రణాళికకు బదిలీ చేయండి' : 'Transfer to Treatment Plan'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Drug Interaction Guardrail Checker */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Pill className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                {isTe ? 'ఔషధ పరస్పర చర్యల తనిఖీ (Drug Interactions)' : 'Drug Interaction & Safety Guardrail'}
              </h3>
            </div>

            <form onSubmit={handleRunDrugCheck} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 block">Medication A</label>
                <input
                  type="text"
                  value={drugA}
                  onChange={(e) => setDrugA(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
                  placeholder="e.g. Telmisartan 40mg"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 block">Medication B (To check against)</label>
                <input
                  type="text"
                  value={drugB}
                  onChange={(e) => setDrugB(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
                  placeholder="e.g. Ibuprofen 400mg"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
                <span>{isTe ? 'పరస్పర చర్యను తనిఖీ చేయండి' : 'Verify Interaction Safety'}</span>
              </button>
            </form>

            {interactionResult && (
              <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                interactionResult.risk === 'Severe' ? 'bg-rose-50 border-rose-200 text-rose-900' :
                interactionResult.risk === 'Moderate' ? 'bg-amber-50 border-amber-200 text-amber-900' :
                'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}>
                <div className="flex items-center justify-between font-bold">
                  <span>{interactionResult.title}</span>
                  <span className="uppercase text-[10px] px-2 py-0.2 rounded font-extrabold bg-white/70">
                    {interactionResult.risk}
                  </span>
                </div>
                <p className="leading-relaxed">{interactionResult.description}</p>
                <p className="text-[11px] font-semibold pt-1 border-t border-current/20">
                  <strong>Safe Alternative:</strong> {interactionResult.alternative}
                </p>
              </div>
            )}
          </div>

          {/* AI Clinical Second Opinion Query */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                {isTe ? 'AI క్లినికల్ కన్సల్టేషన్ కోపైలట్' : 'Clinical Decision Copilot Query'}
              </h3>
            </div>

            {/* Custom Input Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (queryInput.trim()) handleQuickPrompt(queryInput.trim());
              }}
              className="flex items-center gap-1.5"
            >
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder={isTe ? 'క్లినికల్ ప్రశ్న నమోదు చేయండి...' : 'Ask clinical decision question...'}
                className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
              />
              <button
                type="submit"
                disabled={!queryInput.trim() || isQuerying}
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="space-y-2 text-xs">
              <p className="text-slate-500 text-[11px]">
                {isTe ? 'సాధారణ క్లినికల్ ప్రశ్నలు (1-Click Test Prompts):' : 'Quick pre-consultation inquiries:'}
              </p>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickPrompt("Differential diagnosis for 58F exertional dyspnea with elevated HbA1c 8.4%")}
                  className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-slate-700 hover:text-indigo-700 text-[11px] font-medium transition cursor-pointer flex items-center justify-between"
                >
                  <span className="truncate">58F exertional dyspnea + HbA1c 8.4% workup</span>
                  <ChevronRight className="w-3 h-3 shrink-0 ml-1" />
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPrompt("Initial lab workup for burning retrosternal heartburn unresponsive to antacids")}
                  className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-slate-700 hover:text-indigo-700 text-[11px] font-medium transition cursor-pointer flex items-center justify-between"
                >
                  <span className="truncate">GERD vs Atypical Angina exclusion protocol</span>
                  <ChevronRight className="w-3 h-3 shrink-0 ml-1" />
                </button>
              </div>
            </div>

            {isQuerying && (
              <div className="p-3 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-semibold flex items-center justify-center gap-2 animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Analyzing clinical markers...</span>
              </div>
            )}

            {queryResult && !isQuerying && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="font-bold text-slate-900 text-[11px] flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Clinical Copilot Synthesis</span>
                </div>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {queryResult.response}
                </p>
                <div className="space-y-1 pt-1 border-t border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Suggested Priority Tests:</span>
                  <div className="flex flex-wrap gap-1">
                    {queryResult.tests.map((t, ti) => (
                      <span key={ti} className="px-2 py-0.5 rounded bg-indigo-100/70 text-indigo-800 text-[10px] font-bold">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Clinical SOAP Modal */}
      {soapModalPatient && (
        <ClinicalSoapModal
          patientName={soapModalPatient.name}
          doctorName={currentProfile.name || 'Dr. Naveen Kumar'}
          tokenNumber={soapModalPatient.token}
          onClose={() => setSoapModalPatient(null)}
          onStartConsultation={() => {
            setSoapModalPatient(null);
            onNavigateTab('doctor_dashboard');
          }}
          seniorMode={seniorMode}
        />
      )}
    </div>
  );
};
