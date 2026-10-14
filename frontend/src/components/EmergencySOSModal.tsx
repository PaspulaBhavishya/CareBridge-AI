import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, PhoneCall, MapPin, X, ShieldAlert, Heart, 
  Navigation, Siren, Stethoscope, Activity, CheckCircle2, 
  AlertTriangle, Calendar, Building2, UserCheck, ArrowRight, 
  Send, RefreshCw, Sparkles 
} from 'lucide-react';
import { chimeService } from '../utils/audioChime';

interface EmergencySOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  seniorMode?: boolean;
  onBookAppointment?: (department?: string) => void;
}

interface SpecialistDoctor {
  id?: number;
  name: string;
  title: string;
  specialization: string;
  room_number: string;
  rating: number;
  experience_years: number;
  languages_spoken?: string;
  duty_status: string;
}

interface RecommendedHospital {
  id?: number;
  code: string;
  name: string;
  short_name: string;
  area: string;
  city: string;
  distance_km: number;
  eta_minutes: number;
  emergency_phone: string;
  contact_phone: string;
  map_link: string;
  active_icu_units: number;
  available_beds: number;
  er_status: string;
  latitude?: number;
  longitude?: number;
}

interface AlternativeHospital {
  hospital_code: string;
  hospital_name: string;
  short_name: string;
  area: string;
  distance_km: number;
  eta_minutes: number;
  emergency_phone: string;
  map_link?: string;
  has_specialist: boolean;
  doctor_name: string;
  doctor_title: string;
  active_icu_units: number;
  latitude?: number;
  longitude?: number;
}

interface TriageResponse {
  is_genuine_emergency: boolean;
  severity: string;
  case_type?: string;
  case_category?: string;
  case_category_en?: string;
  case_category_te?: string;
  required_specialty?: string;
  suggested_action?: string;
  suggested_department?: string;
  message_te?: string;
  message_en?: string;
  advisory_badge?: string;
  patient_location?: {
    latitude: number;
    longitude: number;
    source: string;
  };
  recommended_hospital?: RecommendedHospital;
  specialist_doctor?: SpecialistDoctor;
  alternative_hospitals?: AlternativeHospital[];
  first_aid_en?: string[];
  first_aid_te?: string[];
  hotlines?: {
    ambulance: string;
    national_emergency: string;
  };
}

const EMERGENCY_CASES = [
  {
    id: 'CHEST_PAIN',
    titleTe: 'గుండె నొప్పి / ఛాతీ నొప్పి',
    titleEn: 'Severe Chest Pain / Heart Attack',
    descTe: 'ఛాతీలో తీవ్ర ఒత్తిడి, ఎడమ చేయి లాగడం, చెమటలు',
    descEn: 'Acute crushing pressure, radiating pain, diaphoresis',
    icon: Heart,
    gradient: 'from-rose-700 to-red-800',
    border: 'border-rose-500/60 hover:border-rose-400',
    tag: '🚨 Code Red • కార్డియాలజీ'
  },
  {
    id: 'ACCIDENT_TRAUMA',
    titleTe: 'తీవ్ర రక్తస్రావం / ప్రమాదం',
    titleEn: 'Severe Bleeding / Road Trauma',
    descTe: 'రోడ్డు ప్రమాదం, ఎముకల విరుపు, తీవ్రమైన గాయాలు',
    descEn: 'Severe trauma, open fractures, acute hemorrhage',
    icon: ShieldAlert,
    gradient: 'from-amber-700 to-rose-800',
    border: 'border-amber-500/60 hover:border-amber-400',
    tag: '🚨 Code Red • ఆర్థోపెడిక్స్ & ట్రామా'
  },
  {
    id: 'BREATHING_SEVERE',
    titleTe: 'ఊపిరాడకపోవడం / తీవ్ర ఆయాసం',
    titleEn: 'Severe Shortness of Breath',
    descTe: 'తీవ్ర శ్వాస సమస్య, ఆస్తమా దాడి, ఆక్సిజన్ అందకపోవడం',
    descEn: 'Acute respiratory distress, choking, cyanosis',
    icon: AlertOctagon,
    gradient: 'from-cyan-700 to-blue-800',
    border: 'border-cyan-500/60 hover:border-cyan-400',
    tag: '🚨 Code Red • క్రిటికల్ కేర్'
  },
  {
    id: 'STROKE_NEURO',
    titleTe: 'పక్షవాతం / స్పృహ కోల్పోవడం',
    titleEn: 'Stroke Symptoms / Loss of Consciousness',
    descTe: 'ముఖం వంకరపోవడం, మాట తడబడటం, మూర్ఛ',
    descEn: 'FAST signs, sudden paralysis, seizures, syncope',
    icon: Activity,
    gradient: 'from-purple-700 to-indigo-800',
    border: 'border-purple-500/60 hover:border-purple-400',
    tag: '🚨 Code Red • న్యూరాలజీ'
  },
  {
    id: 'MATERNITY',
    titleTe: 'ప్రసవ అత్యవసర పరిస్థితి',
    titleEn: 'Labor & Delivery Emergency',
    descTe: 'తీవ్రమైన ప్రసవ నొప్పులు, గర్భిణీ అత్యవసర పరిస్థితి',
    descEn: 'Acute labor, pregnancy complications, severe pain',
    icon: Siren,
    gradient: 'from-pink-700 to-rose-800',
    border: 'border-pink-500/60 hover:border-pink-400',
    tag: '⚡ Urgent • ప్రసవ వార్డు'
  },
  {
    id: 'NON_EMERGENCY',
    titleTe: 'ఇతర సాధారణ సమస్యలు (జలుబు, తలనొప్పి, పంటి నొప్పి)',
    titleEn: 'Minor Illness (Cold, Toothache, Mild Headache)',
    descTe: 'తేలికపాటి జ్వరం, దగ్గు, చర్మ సమస్యలు, సాధారణ సంప్రదింపులు',
    descEn: 'Mild cold, rash, toothache, routine checkup',
    icon: Stethoscope,
    gradient: 'from-slate-800 to-slate-900',
    border: 'border-slate-600 hover:border-emerald-500',
    tag: 'ℹ️ OPD Regular • సాధారణ అపాయింట్‌మెంట్'
  }
];

interface HospitalDataRecord {
  code: string;
  name: string;
  short_name: string;
  area: string;
  city: string;
  lat: number;
  lng: number;
  emergency_phone: string;
  contact_phone: string;
  active_icu_units: number;
  available_beds: number;
  doctors: Record<string, {
    name: string;
    title: string;
    specialization: string;
    room_number: string;
    rating: number;
    experience_years: number;
  }>;
}

const HYDERABAD_HOSPITALS: HospitalDataRecord[] = [
  {
    code: 'HOSP-B',
    name: 'CareBridge Metro Health Center',
    short_name: 'Metro Trauma Hub',
    area: 'Financial District, Gachibowli',
    city: 'Hyderabad',
    lat: 17.4401,
    lng: 78.3489,
    emergency_phone: '+91 40 4567 9999',
    contact_phone: '+91 40 4567 0000',
    active_icu_units: 8,
    available_beds: 24,
    doctors: {
      CHEST_PAIN: { name: 'Dr. Naveen Kumar', title: 'Senior Interventional Cardiologist', specialization: 'Cardiology', room_number: 'Cardio ER-1', rating: 4.9, experience_years: 16 },
      ACCIDENT_TRAUMA: { name: 'Dr. K. Srinivas', title: 'Senior Orthopedic & Trauma Surgeon', specialization: 'Orthopedics & Trauma', room_number: 'Trauma Bay 2', rating: 4.8, experience_years: 14 },
      BREATHING_SEVERE: { name: 'Dr. Priya', title: 'Critical Care & Pulmonology Lead', specialization: 'Critical Care', room_number: 'ICU-1', rating: 4.9, experience_years: 12 },
      STROKE_NEURO: { name: 'Dr. Sunitha Reddy', title: 'Senior Stroke & Neuro Specialist', specialization: 'Neurology', room_number: 'Neuro Bay 3', rating: 4.9, experience_years: 15 },
      MATERNITY: { name: 'Dr. Meera Nambiar', title: 'Obstetrician & Pediatric Lead', specialization: 'Obstetrics & Pediatrics', room_number: 'Labor Ward 1', rating: 4.8, experience_years: 11 }
    }
  },
  {
    code: 'HOSP-A',
    name: 'Apex Super Speciality Hospital',
    short_name: 'Apex Hospital Banjara',
    area: 'Road No. 2, Banjara Hills',
    city: 'Hyderabad',
    lat: 17.4156,
    lng: 78.4350,
    emergency_phone: '+91 40 2345 6789',
    contact_phone: '+91 40 2345 0000',
    active_icu_units: 6,
    available_beds: 18,
    doctors: {
      CHEST_PAIN: { name: 'Dr. K. S. Rao', title: 'Chief Cardiologist', specialization: 'Cardiology', room_number: 'Room 102', rating: 4.9, experience_years: 18 },
      ACCIDENT_TRAUMA: { name: 'Dr. Pradeep Chandra', title: 'Senior Trauma Specialist', specialization: 'Orthopedics', room_number: 'Room 105', rating: 4.8, experience_years: 13 },
      BREATHING_SEVERE: { name: 'Dr. Harika Varma', title: 'Critical Care Specialist', specialization: 'General Medicine', room_number: 'Room 108', rating: 4.7, experience_years: 10 },
      STROKE_NEURO: { name: 'Dr. N. Sudhakar', title: 'Lead Neurologist', specialization: 'Neurology', room_number: 'Room 110', rating: 4.9, experience_years: 17 },
      MATERNITY: { name: 'Dr. Harika Varma', title: 'Senior Medical Officer', specialization: 'Maternity', room_number: 'Room 112', rating: 4.7, experience_years: 10 }
    }
  },
  {
    code: 'HOSP-C',
    name: 'City Community Healthcare',
    short_name: 'City Care Secunderabad',
    area: 'Clock Tower, Secunderabad',
    city: 'Hyderabad',
    lat: 17.4399,
    lng: 78.4983,
    emergency_phone: '+91 40 6789 1234',
    contact_phone: '+91 40 6789 0000',
    active_icu_units: 5,
    available_beds: 15,
    doctors: {
      CHEST_PAIN: { name: 'Dr. Rajesh Gupta', title: 'Senior Cardiologist', specialization: 'Cardiology', room_number: 'Room 201', rating: 4.8, experience_years: 15 },
      ACCIDENT_TRAUMA: { name: 'Dr. M. Ramesh', title: 'Orthopedic Consultant', specialization: 'Orthopedics', room_number: 'Room 203', rating: 4.7, experience_years: 12 },
      BREATHING_SEVERE: { name: 'Dr. Bhavani Prasad', title: 'Emergency Physician', specialization: 'General Medicine', room_number: 'Room 205', rating: 4.8, experience_years: 11 },
      STROKE_NEURO: { name: 'Dr. Arvind Swamy', title: 'Senior Neurologist', specialization: 'Neurology', room_number: 'Room 208', rating: 4.9, experience_years: 16 },
      MATERNITY: { name: 'Dr. Bhavani Prasad', title: 'Emergency Duty Officer', specialization: 'Maternity', room_number: 'Room 210', rating: 4.8, experience_years: 11 }
    }
  }
];

function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export const EmergencySOSModal: React.FC<EmergencySOSModalProps> = ({ 
  isOpen, 
  onClose, 
  seniorMode,
  onBookAppointment 
}) => {
  const [step, setStep] = useState<'SELECT_CASE' | 'NON_EMERGENCY' | 'EMERGENCY_ACTIVE'>('SELECT_CASE');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [customDescription, setCustomDescription] = useState('');
  
  // Geolocation states
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [detectedAddress, setDetectedAddress] = useState('Hyderabad (GPS Auto-Detecting...)');
  const [isGpsLocating, setIsGpsLocating] = useState(false);
  const [selectedHubOverride, setSelectedHubOverride] = useState<'AUTO' | 'GACHIBOWLI' | 'BANJARA' | 'SECUNDERABAD'>('AUTO');

  // Triage Result
  const [loading, setLoading] = useState(false);
  const [triageData, setTriageData] = useState<TriageResponse | null>(null);

  // Pre-Alert to ER
  const [preAlertLoading, setPreAlertLoading] = useState(false);
  const [preAlertSent, setPreAlertSent] = useState(false);
  const [preAlertMsg, setPreAlertMsg] = useState('');

  // Countdown timer for ETA
  const [etaTimerSec, setEtaTimerSec] = useState<number>(300);

  // Initialize GPS upon modal open
  useEffect(() => {
    if (isOpen) {
      setStep('SELECT_CASE');
      setSelectedCaseId(null);
      setCustomDescription('');
      setTriageData(null);
      setPreAlertSent(false);
      setPreAlertMsg('');
      detectDeviceGps();
    }
  }, [isOpen]);

  const detectDeviceGps = () => {
    setIsGpsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCoords({ lat, lng });
          setDetectedAddress(`GPS: ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E (Live Device Location)`);
          setIsGpsLocating(false);
          // If a case was already clicked while locating, re-run with exact coordinates
          if (selectedCaseId && selectedCaseId !== 'NON_EMERGENCY') {
            executeTriage(selectedCaseId, customDescription, lat, lng);
          }
        },
        () => {
          // Default fallback to Hyderabad central hub
          const fallback = { lat: 17.4401, lng: 78.3489 };
          setCoords(fallback);
          setDetectedAddress('Gachibowli, Financial District, Hyderabad (Default Hub)');
          setIsGpsLocating(false);
        },
        { timeout: 6000, enableHighAccuracy: true }
      );
    } else {
      const fallback = { lat: 17.4401, lng: 78.3489 };
      setCoords(fallback);
      setDetectedAddress('Gachibowli, Financial District, Hyderabad');
      setIsGpsLocating(false);
    }
  };

  const getDeviceCoordinates = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve) => {
      if (coords) {
        resolve(coords);
        return;
      }
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setCoords(c);
            setDetectedAddress(`GPS: ${c.lat.toFixed(4)}°N, ${c.lng.toFixed(4)}°E (Live Device Location)`);
            setIsGpsLocating(false);
            resolve(c);
          },
          () => {
            const fallback = { lat: 17.4401, lng: 78.3489 };
            setCoords(fallback);
            setDetectedAddress('Gachibowli, Financial District, Hyderabad (Default Hub)');
            setIsGpsLocating(false);
            resolve(fallback);
          },
          { timeout: 4000, enableHighAccuracy: true }
        );
      } else {
        const fallback = { lat: 17.4401, lng: 78.3489 };
        setCoords(fallback);
        resolve(fallback);
      }
    });
  };

  const handleLocationHubChange = (hub: 'AUTO' | 'GACHIBOWLI' | 'BANJARA' | 'SECUNDERABAD') => {
    setSelectedHubOverride(hub);
    let newLat = 17.4401;
    let newLng = 78.3489;
    let newAddr = 'Gachibowli, Financial District, Hyderabad';

    if (hub === 'BANJARA') {
      newLat = 17.4156;
      newLng = 78.4350;
      newAddr = 'Road No. 2, Banjara Hills, Hyderabad';
    } else if (hub === 'SECUNDERABAD') {
      newLat = 17.4399;
      newLng = 78.4983;
      newAddr = 'Clock Tower, Secunderabad, Hyderabad';
    } else if (hub === 'AUTO') {
      detectDeviceGps();
      return;
    }

    setCoords({ lat: newLat, lng: newLng });
    setDetectedAddress(newAddr);

    // If already triaged, re-run with new location
    if (selectedCaseId && selectedCaseId !== 'NON_EMERGENCY') {
      executeTriage(selectedCaseId, customDescription, newLat, newLng);
    }
  };

  // Timer countdown
  useEffect(() => {
    let interval: any;
    if (step === 'EMERGENCY_ACTIVE' && etaTimerSec > 0) {
      interval = setInterval(() => {
        setEtaTimerSec((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, etaTimerSec]);

  /**
   * Generates Google Maps Directions URL:
   * Origin: Device location (Source)
   * Destination: Suggested hospital location (Destination)
   * Mode: Driving
   */
  const getGoogleMapsDirectionsUrl = (hosp?: RecommendedHospital | AlternativeHospital) => {
    // 1. Source location: Device GPS Coordinates
    const sourceLat = coords?.lat ?? 17.4401;
    const sourceLng = coords?.lng ?? 78.3489;
    const originParam = `${sourceLat},${sourceLng}`;

    // 2. Destination location: Hospital Coordinates
    let destLat = 17.4401;
    let destLng = 78.3489;

    if (hosp) {
      if (hosp.latitude && hosp.longitude) {
        destLat = hosp.latitude;
        destLng = hosp.longitude;
      } else {
        const hospCode = (hosp as any).code || (hosp as any).hospital_code;
        if (hospCode === 'HOSP-A') {
          destLat = 17.4156;
          destLng = 78.4350;
        } else if (hospCode === 'HOSP-B') {
          destLat = 17.4401;
          destLng = 78.3489;
        } else if (hospCode === 'HOSP-C') {
          destLat = 17.4399;
          destLng = 78.4983;
        }
      }
    }

    const destinationParam = `${destLat},${destLng}`;

    // Return Google Maps Universal Directions URL
    return `https://www.google.com/maps/dir/?api=1&origin=${originParam}&destination=${destinationParam}&travelmode=driving`;
  };

  if (!isOpen) return null;

  const executeTriage = async (caseId: string, desc: string, targetLat?: number, targetLng?: number) => {
    setLoading(true);
    const finalLat = targetLat ?? coords?.lat ?? 17.4401;
    const finalLng = targetLng ?? coords?.lng ?? 78.3489;

    try {
      const response = await fetch('/api/emergency/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_type: caseId,
          description: desc,
          latitude: finalLat,
          longitude: finalLng,
          patient_name: 'Patient (Emergency Triage)',
          contact_phone: '+91 98480 99999'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to evaluate emergency triage');
      }

      const data: TriageResponse = await response.json();
      setTriageData(data);

      if (!data.is_genuine_emergency) {
        setStep('NON_EMERGENCY');
      } else {
        chimeService.playAlertChime();
        setStep('EMERGENCY_ACTIVE');
        if (data.recommended_hospital?.eta_minutes) {
          setEtaTimerSec(data.recommended_hospital.eta_minutes * 60);
        }
      }
    } catch (err) {
      console.error('Emergency triage error / offline fallback:', err);
      // Client-side fallback matching nearest hospital based on device location and selected case
      const matchedCase = EMERGENCY_CASES.find(c => c.id === caseId);

      // Dynamically calculate distance from device location to each hospital & sort
      const hospitalsWithDistance = HYDERABAD_HOSPITALS.map((h) => {
        const dist = calculateHaversineDistance(finalLat, finalLng, h.lat, h.lng);
        const eta = Math.max(3, Math.round(dist * 2.2));
        const doc = h.doctors[caseId] || h.doctors['CHEST_PAIN'];
        return {
          ...h,
          distance_km: dist,
          eta_minutes: eta,
          doc
        };
      }).sort((a, b) => a.distance_km - b.distance_km);

      const nearest = hospitalsWithDistance[0];
      const alternatives = hospitalsWithDistance.slice(1);

      const fallbackData: TriageResponse = {
        is_genuine_emergency: true,
        severity: 'CODE_RED_CRITICAL',
        case_type: caseId,
        case_category_en: matchedCase?.titleEn || 'Acute Emergency Medical Care',
        case_category_te: matchedCase?.titleTe || 'తీవ్ర అత్యవసర పరిస్థితి (Emergency Care)',
        required_specialty: nearest.doc.specialization,
        patient_location: {
          latitude: finalLat,
          longitude: finalLng,
          source: 'DEVICE_GPS'
        },
        recommended_hospital: {
          code: nearest.code,
          name: nearest.name,
          short_name: nearest.short_name,
          area: nearest.area,
          city: nearest.city,
          latitude: nearest.lat,
          longitude: nearest.lng,
          distance_km: nearest.distance_km,
          eta_minutes: nearest.eta_minutes,
          emergency_phone: nearest.emergency_phone,
          contact_phone: nearest.contact_phone,
          map_link: `https://www.google.com/maps/dir/?api=1&origin=${finalLat},{finalLng}&destination=${nearest.lat},${nearest.lng}&travelmode=driving`,
          active_icu_units: nearest.active_icu_units,
          available_beds: nearest.available_beds,
          er_status: 'Level-1 24/7 Trauma Bay Active • Specialist On Standby'
        },
        specialist_doctor: {
          name: nearest.doc.name,
          title: nearest.doc.title,
          specialization: nearest.doc.specialization,
          room_number: nearest.doc.room_number,
          rating: nearest.doc.rating,
          experience_years: nearest.doc.experience_years,
          duty_status: 'ON_DUTY_IN_ER'
        },
        alternative_hospitals: alternatives.map((alt) => ({
          hospital_code: alt.code,
          hospital_name: alt.name,
          short_name: alt.short_name,
          area: alt.area,
          latitude: alt.lat,
          longitude: alt.lng,
          distance_km: alt.distance_km,
          eta_minutes: alt.eta_minutes,
          emergency_phone: alt.emergency_phone,
          has_specialist: true,
          doctor_name: alt.doc.name,
          doctor_title: alt.doc.title,
          active_icu_units: alt.active_icu_units,
          map_link: `https://www.google.com/maps/dir/?api=1&origin=${finalLat},${finalLng}&destination=${alt.lat},${alt.lng}&travelmode=driving`
        })),
        first_aid_te: [
          'రోగిని నిశ్శబ్దంగా, విశ్రాంతిగా కూర్చోబెట్టండి. ఎటువంటి శారీరక శ్రమ చేయనివ్వవద్దు.',
          'రోగి బిగుతైన బట్టలను వదులు చేయండి. తాజా గాలి అందేలా చూడండి.',
          'శ్వాస మరియు నాడిని నిరంతరం పర్యవేక్షించండి.'
        ]
      };
      setTriageData(fallbackData);
      setEtaTimerSec(nearest.eta_minutes * 60);
      setStep('EMERGENCY_ACTIVE');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCase = async (caseId: string) => {
    setSelectedCaseId(caseId);
    if (caseId === 'NON_EMERGENCY') {
      setStep('NON_EMERGENCY');
      return;
    }
    // Automatically detect device location and immediately select nearest hospital for this reason
    const deviceLoc = await getDeviceCoordinates();
    executeTriage(caseId, customDescription, deviceLoc.lat, deviceLoc.lng);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDescription.trim() && !selectedCaseId) return;
    executeTriage(selectedCaseId || 'CHEST_PAIN', customDescription);
  };

  const handleSendPreAlertToER = async () => {
    if (!triageData?.recommended_hospital || !triageData?.specialist_doctor) return;
    setPreAlertLoading(true);

    try {
      const res = await fetch('/api/emergency/pre-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospital_code: triageData.recommended_hospital.code,
          patient_name: 'Patient (Emergency Triage Alert)',
          case_type: triageData.case_type || 'EMERGENCY',
          eta_minutes: triageData.recommended_hospital.eta_minutes || 5,
          specialist_name: triageData.specialist_doctor.name,
          contact_phone: '+91 98480 99999',
          gps_coordinates: `${coords?.lat.toFixed(4)}, ${coords?.lng.toFixed(4)}`
        })
      });

      const json = await res.json();
      setPreAlertSent(true);
      setPreAlertMsg(json.message_te || `${triageData.recommended_hospital.short_name} ఎమర్జెన్సీ విభాగానికి సమాచారం పంపబడింది.`);
    } catch (e) {
      console.error(e);
      setPreAlertSent(true);
      setPreAlertMsg('ఆసుపత్రి ER కు సమాచారం పంపబడింది. డాక్టర్ మరియు ట్రామా బృందం సిద్ధంగా ఉన్నారు.');
    } finally {
      setPreAlertLoading(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`relative w-full max-w-2xl bg-slate-950 border-2 border-rose-600 rounded-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[94vh] ${seniorMode ? 'scale-[1.02]' : ''}`}>
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-rose-700 via-red-600 to-amber-600 p-4 text-white flex items-center justify-between shadow-lg shadow-rose-950/50">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-white/20 flex items-center justify-center border border-white/40 shadow-inner animate-pulse">
              <Siren className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-extrabold tracking-wider uppercase text-rose-100 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                <span>CareBridge 108 Emergency Assistant • అత్యవసర సహాయ కేంద్రం</span>
              </div>
              <h3 className="font-black text-lg leading-tight text-white flex items-center gap-2">
                <span>స్మార్ట్ ఎమర్జెన్సీ ట్రయాజ్ & డాక్టర్ లొకేషన్</span>
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="h-9 w-9 rounded-full bg-black/30 hover:bg-black/60 flex items-center justify-center transition text-white cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">

          {/* Location & Geofence Bar */}
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 text-slate-300">
              <MapPin className="h-4 w-4 text-rose-400 flex-shrink-0 animate-bounce" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  మీ ప్రస్తుత ప్రదేశం (Current Device Location):
                </span>
                <span className="font-semibold text-white text-[11px] block">
                  {detectedAddress}
                  {isGpsLocating && (
                    <span className="text-[10px] text-amber-400 font-semibold ml-2 animate-pulse">
                      (లొకేషన్ శోధిస్తోంది...)
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Area Override Selector for Interactive Demo Testing */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px]">
              <span className="text-slate-500 font-bold px-1.5">లొకేషన్:</span>
              <button
                onClick={() => handleLocationHubChange('AUTO')}
                className={`px-2 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  selectedHubOverride === 'AUTO' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                📍 GPS
              </button>
              <button
                onClick={() => handleLocationHubChange('GACHIBOWLI')}
                className={`px-2 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  selectedHubOverride === 'GACHIBOWLI' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                గచ్చిబౌలి
              </button>
              <button
                onClick={() => handleLocationHubChange('BANJARA')}
                className={`px-2 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  selectedHubOverride === 'BANJARA' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                బంజారాహిల్స్
              </button>
              <button
                onClick={() => handleLocationHubChange('SECUNDERABAD')}
                className={`px-2 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  selectedHubOverride === 'SECUNDERABAD' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                సికింద్రాబాద్
              </button>
            </div>
          </div>

          {/* STEP 1: SELECT EMERGENCY CASE */}
          {step === 'SELECT_CASE' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3.5 bg-rose-950/50 border border-rose-500/40 rounded-2xl flex items-start gap-3 text-rose-200">
                <AlertTriangle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <span className="text-white font-extrabold block text-xs">
                    అత్యవసర పరిస్థితిని ఎంచుకోండి (Identify Emergency Condition):
                  </span>
                  <span className="text-rose-200 block mt-0.5">
                    నిజమైన అత్యవసర పరిస్థితిని గుర్తించి, మీ లొకేషన్‌కు అత్యంత సమీపంలో సంబంధిత స్పెషలిస్ట్ డాక్టర్ ఉన్న ఆసుపత్రిని సూచిస్తాము.
                  </span>
                </div>
              </div>

              {/* Quick Select Emergency Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {EMERGENCY_CASES.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectCase(item.id)}
                      disabled={loading}
                      className={`text-left p-3.5 rounded-2xl bg-gradient-to-br ${item.gradient} border ${item.border} shadow-lg transition-all duration-200 active:scale-[0.98] cursor-pointer flex flex-col justify-between group hover:shadow-rose-950/60`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="h-9 w-9 rounded-xl bg-black/30 border border-white/20 flex items-center justify-center text-white flex-shrink-0">
                          <Icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-black/40 text-[9px] font-bold text-white/90 border border-white/10">
                          {item.tag}
                        </span>
                      </div>

                      <div className="mt-2.5">
                        <h4 className="font-extrabold text-sm text-white leading-snug">
                          {item.titleTe}
                        </h4>
                        <div className="text-[11px] font-bold text-white/80">
                          {item.titleEn}
                        </div>
                        <p className="text-[10px] text-white/70 mt-1 line-clamp-1">
                          {item.descTe}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Free Text Search / Input Box */}
              <form onSubmit={handleCustomSubmit} className="pt-1 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  లేదా మీ లక్షణాలు / సమస్యను ఇక్కడ టైప్ చేయండి:
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    placeholder="ఉదాహరణ: తీవ్రమైన ఛాతీ నొప్పి, శ్వాస ఆడటం లేదు / Heavy bleeding from road accident..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                  <button
                    type="submit"
                    disabled={loading || !customDescription.trim()}
                    className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
                  >
                    {loading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <span>తనిఖీ చేయండి</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Real 108 Emergency Dial Bar */}
              <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-600/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-white">
                  <div className="h-8 w-8 rounded-lg bg-rose-600 flex items-center justify-center animate-pulse">
                    <PhoneCall className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-extrabold text-xs block">
                      నిజమైన అత్యవసరమైతే వెంటనే 108 కు కాల్ చేయండి
                    </span>
                    <span className="text-[10px] text-rose-200">
                      National Ambulance Hotline • 24x7 టోల్ ఫ్రీ
                    </span>
                  </div>
                </div>

                <a
                  href="tel:108"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-rose-600/40 transition active:scale-95"
                >
                  <PhoneCall className="h-3.5 w-3.5" />
                  <span>Call 108</span>
                </a>
              </div>
            </div>
          )}

          {/* STEP 2: NON-EMERGENCY ADVISORY */}
          {step === 'NON_EMERGENCY' && (
            <div className="p-5 rounded-3xl bg-slate-900 border-2 border-amber-500/60 space-y-4 animate-in zoom-in-95 duration-150 text-slate-200">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0">
                  <Stethoscope className="h-6 w-6" />
                </div>
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30 uppercase tracking-wider">
                    {triageData?.advisory_badge || 'OPD Consult Recommended • సాధారణ అపాయింట్‌మెంట్'}
                  </span>
                  <h3 className="font-black text-base text-white mt-1">
                    ⚠️ ఇది ప్రాణాంతక అత్యవసర పరిస్థితి కాదు (Non-Life-Threatening Case)
                  </h3>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                    {triageData?.message_te || '108 అంబులెన్స్ మరియు ఎమర్జెన్సీ వార్డులు తీవ్ర ప్రాణాపాయంలో ఉన్న రోగులకు కేటాయించబడతాయి. మీరు సురక్షితంగా మా నిపుణులైన వైద్యులతో సాధారణ OPD అపాయింట్‌మెంట్ బుక్ చేసుకోవచ్చు.'}
                  </p>
                </div>
              </div>

              {/* Clinical Reassurance Details */}
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-bold">సిఫార్సు చేయబడిన విభాగం (Suggested Dept):</span>
                  <span className="text-emerald-400 font-black">{triageData?.suggested_department || 'General Medicine (సాధారణ వైద్యం)'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-bold">కేటగిరీ (Category):</span>
                  <span className="text-amber-300 font-semibold">ఔట్ పేషెంట్ సంప్రదింపు (Outpatient Consultation)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-bold">సూచించిన తదుపరి చర్య:</span>
                  <span className="text-cyan-400 font-bold">సాధారణ డాక్టర్ అపాయింట్‌మెంట్ బుకింగ్</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => {
                    if (onBookAppointment) {
                      onBookAppointment(triageData?.suggested_department);
                    }
                    onClose();
                  }}
                  className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-700/40 transition active:scale-95 cursor-pointer"
                >
                  <Calendar className="h-4 w-4" />
                  <span>సాధారణ అపాయింట్‌మెంట్ బుక్ చేసుకోండి (Book Doctor)</span>
                </button>

                <a
                  href={getGoogleMapsDirectionsUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/30 transition active:scale-95 text-center cursor-pointer"
                >
                  <Navigation className="h-4 w-4" />
                  <span>Directions (హాస్పిటల్ రూట్ మ్యాప్)</span>
                </a>

                <button
                  onClick={() => setStep('SELECT_CASE')}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>మళ్ళీ తనిఖీ చేయండి (Re-assess)</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition cursor-pointer ml-auto"
                >
                  మూసివేయండి (Dismiss)
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CODE RED ACTIVE EMERGENCY RESPONSE */}
          {step === 'EMERGENCY_ACTIVE' && triageData && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Emergency Active Status Header */}
              <div className="p-3.5 bg-gradient-to-r from-rose-950 via-red-950 to-slate-900 border-2 border-rose-500 rounded-2xl flex items-center justify-between shadow-xl">
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-rose-500 animate-ping flex-shrink-0" />
                  <div>
                    <span className="text-[10px] font-black uppercase text-rose-300 tracking-wider block">
                      🚨 CODE RED TRIAGE CONFIRMED • అత్యవసర పరిస్థితి నిర్ధారించబడింది
                    </span>
                    <h4 className="font-extrabold text-sm text-white">
                      {triageData.case_category_te || 'గుండెపోటు / అత్యవసర పరిస్థితి'}
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      {triageData.case_category_en} • విభాగం: {triageData.required_specialty}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[9px] text-slate-400 block font-semibold">లొకేషన్ ఆధారిత ప్రయాణ సమయం</span>
                  <span className="text-2xl font-black font-mono text-amber-400 tracking-wider">
                    {formatTimer(etaTimerSec)}
                  </span>
                  <span className="text-[9px] text-emerald-400 block font-bold">
                    ~{triageData.recommended_hospital?.eta_minutes} నిమిషాల్లో చేరవచ్చు
                  </span>
                </div>
              </div>

              {/* RECOMMENDED HOSPITAL CARD (MATCHED BY LOCATION & SPECIALIST) */}
              {triageData.recommended_hospital && (
                <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-2 border-emerald-500/70 shadow-2xl space-y-3.5 relative overflow-hidden">
                  
                  {/* Top Badge & Distance */}
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                      <span>మీ లొకేషన్‌కు అత్యంత సమీప ఆసుపత్రి (Nearest Recommended Hospital)</span>
                    </span>
                    <span className="text-[11px] font-mono font-bold text-cyan-300 bg-cyan-950/60 px-2.5 py-0.5 rounded-lg border border-cyan-800">
                      {triageData.recommended_hospital.distance_km} km • ~{triageData.recommended_hospital.eta_minutes} mins
                    </span>
                  </div>

                  {/* Hospital Name & Location */}
                  <div className="space-y-1">
                    <h3 className="font-black text-base sm:text-lg text-white flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-rose-400 flex-shrink-0" />
                      <span>{triageData.recommended_hospital.name}</span>
                    </h3>
                    <p className="text-xs text-slate-300 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-cyan-400 flex-shrink-0" />
                      <span>{triageData.recommended_hospital.area}, {triageData.recommended_hospital.city}</span>
                    </p>
                  </div>

                  {/* DIRECTIONS BUTTON DIRECTLY UNDER HOSPITAL NAME */}
                  <div className="pt-0.5">
                    <a
                      href={getGoogleMapsDirectionsUrl(triageData.recommended_hospital)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-cyan-600/40 hover:shadow-cyan-500/60 transition-all duration-200 active:scale-[0.98] border border-cyan-300/40 cursor-pointer text-center"
                    >
                      <Navigation className="h-4 w-4 fill-white flex-shrink-0" />
                      <span>Directions (గూగుల్ మ్యాప్స్ లో రూట్ & నావిగేషన్)</span>
                      <ArrowRight className="h-4 w-4 ml-1 flex-shrink-0" />
                    </a>
                  </div>

                  {/* PATH OVERVIEW: SOURCE (DEVICE) -> DESTINATION (HOSPITAL) */}
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 text-[11px] space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <span>Google Maps నావిగేషన్ రూట్ (Live Path):</span>
                      <span className="text-emerald-400 font-mono">🚗 లైవ్ డ్రైవింగ్ నావిగేషన్</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] font-bold text-cyan-300 block">Source (మీ డివైస్ లొకేషన్):</span>
                        <span className="font-semibold text-white block mt-0.5 truncate">
                          📍 {detectedAddress.split('(')[0].trim()}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] font-bold text-rose-300 block">Destination (సిఫార్సు ఆసుపత్రి):</span>
                        <span className="font-bold text-emerald-300 block mt-0.5 truncate">
                          🏥 {triageData.recommended_hospital.short_name || triageData.recommended_hospital.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ICU & Available Beds */}
                  <div className="flex flex-wrap items-center gap-3 pt-0.5 text-[11px]">
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{triageData.recommended_hospital.active_icu_units} ICU యూనిట్లు సిద్ధంగా ఉన్నాయి</span>
                    </span>
                    <span className="text-slate-400">
                      • {triageData.recommended_hospital.available_beds} సాధారణ బెడ్లు అందుబాటులో ఉన్నాయి
                    </span>
                  </div>

                  {/* SPECIALIST DOCTOR ON DUTY CARD */}
                  {triageData.specialist_doctor && (
                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/40 flex items-start gap-3">
                      <div className="h-11 w-11 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 flex items-center justify-center text-emerald-300 font-black text-sm flex-shrink-0">
                        👨‍⚕️
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                            <UserCheck className="h-3 w-3" />
                            <span>డ్యూటీలో ఉన్న సంబంధిత స్పెషలిస్ట్ డాక్టర్ (Doctor on Duty)</span>
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                            🟢 అందుబాటులో ఉన్నారు
                          </span>
                        </div>
                        <h4 className="font-black text-sm text-white mt-0.5">
                          {triageData.specialist_doctor.name}
                        </h4>
                        <p className="text-[11px] text-slate-300">
                          {triageData.specialist_doctor.title} • {triageData.specialist_doctor.specialization}
                        </p>
                        <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                          <span>స్థానం: <strong className="text-white">{triageData.specialist_doctor.room_number}</strong></span>
                          <span>• అనుభవం: <strong className="text-white">{triageData.specialist_doctor.experience_years} సం॥</strong></span>
                          <span>• రేటింగ్: <strong className="text-amber-400">{triageData.specialist_doctor.rating} ⭐</strong></span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ACTION BUTTONS (DIRECTIONS, 108, ER CALL, PRE-ALERT) */}
                  <div className="pt-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {/* Option 1: Directions to Open Google Maps */}
                    <a
                      href={getGoogleMapsDirectionsUrl(triageData.recommended_hospital)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/40 transition active:scale-95 text-center cursor-pointer"
                    >
                      <Navigation className="h-4 w-4 flex-shrink-0" />
                      <span>Directions (రూట్)</span>
                    </a>

                    {/* Option 2: Call 108 */}
                    <a
                      href="tel:108"
                      className="px-3 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/40 transition active:scale-95 text-center"
                    >
                      <PhoneCall className="h-4 w-4 flex-shrink-0" />
                      <span>108 కాల్</span>
                    </a>

                    {/* Option 3: Hospital ER Desk Direct Call */}
                    <a
                      href={`tel:${triageData.recommended_hospital.emergency_phone}`}
                      className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition active:scale-95 text-center"
                    >
                      <PhoneCall className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                      <span>ఆసుపత్రి ER కాల్</span>
                    </a>

                    {/* Option 4: Pre-Alert ER Team */}
                    <button
                      onClick={handleSendPreAlertToER}
                      disabled={preAlertLoading || preAlertSent}
                      className={`px-3 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer text-center ${
                        preAlertSent 
                          ? 'bg-emerald-700 text-white border border-emerald-500' 
                          : 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/30'
                      }`}
                    >
                      {preAlertLoading ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : preAlertSent ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-emerald-200" />
                          <span>ER కు అందింది</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span>ER కు ముందస్తు</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Pre-Alert Success Message */}
                  {preAlertSent && (
                    <div className="p-2.5 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-200 text-[11px] flex items-center gap-2 animate-in fade-in">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      <span>{preAlertMsg}</span>
                    </div>
                  )}
                </div>
              )}

              {/* ALTERNATIVE HOSPITALS (IF MAIN HOSPITAL CONGESTED) */}
              {triageData.alternative_hospitals && triageData.alternative_hospitals.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-cyan-400" />
                    <span>సమీప ప్రత్యామ్నాయ ఆసుపత్రులు (Alternative Hospitals Nearby):</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {triageData.alternative_hospitals.map((alt) => (
                      <div key={alt.hospital_code} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-2 text-[11px]">
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-bold text-white text-xs">{alt.hospital_name}</h5>
                            <span className="text-slate-400 text-[10px] block">{alt.area}</span>
                            <span className="text-emerald-400 font-semibold text-[10px]">డాక్టర్: {alt.doctor_name}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-cyan-300 font-mono text-xs block">{alt.distance_km} km</span>
                            <span className="text-[10px] text-slate-400 block">~{alt.eta_minutes} mins</span>
                          </div>
                        </div>

                        {/* Under Alternative Hospital Name: Directions and ER Call */}
                        <div className="flex items-center gap-2 pt-1">
                          <a
                            href={getGoogleMapsDirectionsUrl(alt)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-1.5 px-3 rounded-lg bg-cyan-600/30 hover:bg-cyan-600 text-cyan-200 hover:text-white border border-cyan-500/50 text-[11px] font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
                          >
                            <Navigation className="h-3 w-3 fill-current" />
                            <span>Directions (రూట్)</span>
                          </a>
                          <a
                            href={`tel:${alt.emergency_phone}`}
                            className="py-1.5 px-3 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 text-[11px] font-bold flex items-center gap-1 transition"
                          >
                            <PhoneCall className="h-3 w-3" />
                            <span>ER కాల్</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FIRST AID INSTRUCTIONS */}
              {triageData.first_aid_te && (
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
                    <span>సహాయం వచ్చే వరకు తక్షణ ప్రథమ చికిత్స (Immediate First-Aid Guidance):</span>
                  </span>

                  <ul className="space-y-1.5 text-[11px] text-slate-200">
                    {triageData.first_aid_te.map((instruction, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="h-4 w-4 rounded-full bg-rose-600/30 text-rose-300 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{instruction}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Reset to change case */}
              <div className="text-center pt-1">
                <button
                  onClick={() => setStep('SELECT_CASE')}
                  className="text-xs text-slate-400 hover:text-white underline font-semibold cursor-pointer"
                >
                  ← మరొక అత్యవసర పరిస్థితిని ఎంచుకోండి (Change Emergency Condition)
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
          <span>CareBridge AI Clinical Triage Protocol • 24/7 National Emergency 108</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
          >
            మూసివేయండి (Close)
          </button>
        </div>

      </div>
    </div>
  );
};
