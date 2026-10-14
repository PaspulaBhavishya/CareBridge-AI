import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { 
  getDatabase, 
  ref, 
  onValue, 
  set, 
  push, 
  remove, 
  type Database, 
  type Unsubscribe 
} from 'firebase/database';

export interface FirebaseConfig {
  apiKey: string;
  authDomain?: string;
  databaseURL: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

const STORAGE_KEY = 'carebridge_firebase_config';

// 1. Get configuration from localStorage or Vite environment variables
export function getFirebaseConfig(): FirebaseConfig | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.databaseURL && parsed.projectId) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse saved Firebase config from localStorage:', e);
  }

  // Fallback to Vite env variables if provided
  const envUrl = import.meta.env.VITE_FIREBASE_DATABASE_URL;
  const envProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY;

  if (envUrl && envProjectId) {
    return {
      apiKey: envApiKey || 'AIzaSyDemoKey',
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${envProjectId}.firebaseapp.com`,
      databaseURL: envUrl,
      projectId: envProjectId,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${envProjectId}.appspot.com`,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
    };
  }

  return null;
}

export function saveFirebaseConfig(config: FirebaseConfig): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    // Reset app instance to re-initialize with new config
    cachedApp = null;
    cachedDb = null;
    initFirebase();
    return true;
  } catch (e) {
    console.error('Failed to save Firebase config:', e);
    return false;
  }
}

export function clearFirebaseConfig(): void {
  localStorage.removeItem(STORAGE_KEY);
  cachedApp = null;
  cachedDb = null;
}

let cachedApp: FirebaseApp | null = null;
let cachedDb: Database | null = null;

// 2. Initialize Firebase App & Realtime Database
export function initFirebase(): { app: FirebaseApp | null; db: Database | null } {
  if (cachedApp && cachedDb) {
    return { app: cachedApp, db: cachedDb };
  }

  const config = getFirebaseConfig();
  if (!config || !config.databaseURL) {
    return { app: null, db: null };
  }

  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(config);
    const db = getDatabase(app, config.databaseURL);
    cachedApp = app;
    cachedDb = db;
    console.log(' CareBridge AI: Firebase Realtime Database connected to', config.databaseURL);
    return { app, db };
  } catch (err) {
    console.error(' CareBridge AI: Error initializing Firebase Realtime Database:', err);
    return { app: null, db: null };
  }
}

export function getFirebaseDb(): Database | null {
  const { db } = initFirebase();
  return db;
}

export function isFirebaseConfigured(): boolean {
  return getFirebaseDb() !== null;
}

// 3. Realtime Connection State Listener
export function subscribeToConnectionStatus(callback: (connected: boolean) => void): Unsubscribe | null {
  const db = getFirebaseDb();
  if (!db) {
    callback(false);
    return null;
  }
  const connectedRef = ref(db, '.info/connected');
  return onValue(connectedRef, (snap) => {
    callback(snap.val() === true);
  }, () => {
    callback(false);
  });
}

// 4. Real-time Listeners for CareBridge AI data
export function subscribeToAppointments(callback: (appointments: any[]) => void): Unsubscribe | null {
  const db = getFirebaseDb();
  if (!db) return null;

  const apptsRef = ref(db, 'carebridge/appointments');
  return onValue(apptsRef, (snap) => {
    const val = snap.val();
    if (!val) {
      callback([]);
      return;
    }
    const list = Array.isArray(val) ? val.filter(Boolean) : Object.values(val);
    callback(list);
  }, (err) => {
    console.error('Firebase Realtime DB: Failed to fetch appointments:', err);
  });
}

export function subscribeToQueue(callback: (queueData: any) => void): Unsubscribe | null {
  const db = getFirebaseDb();
  if (!db) return null;

  const queueRef = ref(db, 'carebridge/queue');
  return onValue(queueRef, (snap) => {
    const val = snap.val();
    if (val) {
      callback(val);
    }
  }, (err) => {
    console.error('Firebase Realtime DB: Failed to fetch queue:', err);
  });
}

export function subscribeToEmergencySOS(callback: (sosAlerts: any[]) => void): Unsubscribe | null {
  const db = getFirebaseDb();
  if (!db) return null;

  const sosRef = ref(db, 'carebridge/emergency_sos');
  return onValue(sosRef, (snap) => {
    const val = snap.val();
    if (!val) {
      callback([]);
      return;
    }
    const list = Array.isArray(val) ? val.filter(Boolean) : Object.values(val);
    callback(list);
  });
}

export function subscribeToNotifications(callback: (notifications: any[]) => void): Unsubscribe | null {
  const db = getFirebaseDb();
  if (!db) return null;

  const notifsRef = ref(db, 'carebridge/notifications');
  return onValue(notifsRef, (snap) => {
    const val = snap.val();
    if (!val) {
      callback([]);
      return;
    }
    const list = Array.isArray(val) ? val.filter(Boolean) : Object.values(val);
    callback(list);
  });
}

// 5. Real-time Write / Sync Methods
export async function syncAppointmentToFirebase(appointment: any): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db || !appointment) return false;

  try {
    const key = appointment.id ? String(appointment.id) : `appt-${Date.now()}`;
    const targetRef = ref(db, `carebridge/appointments/${key}`);
    await set(targetRef, {
      ...appointment,
      updated_at: new Date().toISOString()
    });
    return true;
  } catch (err) {
    console.error('Failed to sync appointment to Firebase Realtime DB:', err);
    return false;
  }
}

export async function removeAppointmentFromFirebase(appointmentId: number | string): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;

  try {
    const targetRef = ref(db, `carebridge/appointments/${appointmentId}`);
    await remove(targetRef);
    return true;
  } catch (err) {
    console.error('Failed to remove appointment from Firebase:', err);
    return false;
  }
}

export async function syncQueueToFirebase(queueData: any): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;

  try {
    const targetRef = ref(db, 'carebridge/queue');
    await set(targetRef, {
      ...queueData,
      last_updated: new Date().toISOString()
    });
    return true;
  } catch (err) {
    console.error('Failed to sync queue to Firebase:', err);
    return false;
  }
}

export async function pushEmergencySOSToFirebase(sosData: any): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;

  try {
    const sosRef = ref(db, 'carebridge/emergency_sos');
    const newRef = push(sosRef);
    await set(newRef, {
      ...sosData,
      id: newRef.key,
      timestamp: new Date().toISOString()
    });
    return true;
  } catch (err) {
    console.error('Failed to push Emergency SOS to Firebase:', err);
    return false;
  }
}

export async function seedFirebaseBaseline(appointments: any[], queue: any = null): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;

  try {
    const rootRef = ref(db, 'carebridge');
    const apptMap: Record<string, any> = {};
    if (Array.isArray(appointments)) {
      appointments.forEach((a) => {
        if (a && a.id) {
          apptMap[String(a.id)] = a;
        }
      });
    }

    const defaultQueue = queue || {
      serving_token: 'GM-022',
      upcoming_tokens: ['GM-023', 'GM-024', 'GM-025', 'GM-026'],
      current_room: 'Room OPD-03',
      dept: 'General Medicine',
      active_doctor: 'Dr. Priya',
      estimated_wait_min: 10,
      patients_waiting: 4
    };

    await set(rootRef, {
      appointments: apptMap,
      queue: defaultQueue,
      hospital_name: 'CareBridge AI Metro Network',
      last_synced: new Date().toISOString()
    });

    console.log(' CareBridge AI: Seeded baseline records to Firebase Realtime Database');
    return true;
  } catch (err) {
    console.error('Failed to seed Firebase baseline data:', err);
    return false;
  }
}
