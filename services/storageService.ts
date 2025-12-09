import { CylinderSession, HeatLevel, SessionStats } from '../types';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  orderBy, 
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { firebaseConfig } from '../firebaseConfig';

// --- CONFIGURARE FIREBASE ---
let db: any = null;
let useLocalStorage = true;

// Încercăm să inițializăm Firebase doar dacă userul a completat config-ul
if (firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("AIzaSy...")) {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    useLocalStorage = false;
    console.log("🔥 Firebase conectat cu succes!");
  } catch (e) {
    console.error("Eroare conectare Firebase (folosim LocalStorage):", e);
  }
} else {
  console.warn("⚠️ Firebase nu este configurat. Se folosește LocalStorage (Mod Demo).");
}

const STORAGE_KEY = 'gpl_monitor_data';
const COLLECTION_NAME = 'sessions';

// --- HELPERS PENTRU CALCUL STATISTICI ---
// (Acestea rămân la fel, sunt funcții pure matematice)
export const calculateStats = (session: CylinderSession): SessionStats => {
  let hoursL1 = 0;
  let hoursL2 = 0;
  let hoursL3 = 0;

  const endTime = session.endDate || Date.now();
  const logs = session.logs;

  for (let i = 0; i < logs.length; i++) {
    const currentLog = logs[i];
    const nextLogTime = (i + 1 < logs.length) ? logs[i + 1].timestamp : endTime;
    
    const durationMs = nextLogTime - currentLog.timestamp;
    const durationHours = durationMs / (1000 * 60 * 60);

    switch (currentLog.level) {
      case HeatLevel.LEVEL_1: hoursL1 += durationHours; break;
      case HeatLevel.LEVEL_2: hoursL2 += durationHours; break;
      case HeatLevel.LEVEL_3: hoursL3 += durationHours; break;
    }
  }

  const totalHours = hoursL1 + hoursL2 + hoursL3;
  const totalUnits = (hoursL1 * 1) + (hoursL2 * 2) + (hoursL3 * 3);

  return { hoursL1, hoursL2, hoursL3, totalHours, totalUnits };
};

// --- LOGICA HIBRIDĂ (FIREBASE SAU LOCALSTORAGE) ---

// 1. SUBSCRIBE (Ascultă modificările în timp real)
export const subscribeToSessions = (callback: (sessions: CylinderSession[]) => void) => {
  if (!useLocalStorage && db) {
    // MOD FIREBASE
    const q = query(collection(db, COLLECTION_NAME), orderBy('startDate', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const sessions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CylinderSession[];
      callback(sessions);
    });
  } else {
    // MOD LOCAL STORAGE
    // Citim imediat
    const load = () => {
      const data = localStorage.getItem(STORAGE_KEY);
      callback(data ? JSON.parse(data) : []);
    };
    load();
    
    // Ascultăm evenimentul custom pentru actualizări locale
    window.addEventListener('storage-update', load);
    return () => window.removeEventListener('storage-update', load);
  }
};

// 2. ADĂUGARE BUTELIE NOUĂ
export const startNewCylinder = async (currentActiveId?: string) => {
  const now = Date.now();
  
  // Închidem sesiunea activă (dacă există)
  if (currentActiveId) {
    await closeSession(currentActiveId);
  }

  const newSessionData = {
    startDate: now,
    endDate: null,
    isActive: true,
    logs: [{ timestamp: now, level: HeatLevel.LEVEL_1 }]
  };

  if (!useLocalStorage && db) {
    // Firebase
    await addDoc(collection(db, COLLECTION_NAME), newSessionData);
  } else {
    // LocalStorage
    const sessions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const newSession = { id: Math.random().toString(36).substring(2, 9), ...newSessionData };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([newSession, ...sessions]));
    window.dispatchEvent(new Event('storage-update'));
  }
};

// 3. SCHIMBARE TREAPTĂ
export const changeLevel = async (sessionId: string, newLevel: HeatLevel, currentLogs: any[]) => {
  const newLog = { timestamp: Date.now(), level: newLevel };
  const updatedLogs = [...currentLogs, newLog];

  if (!useLocalStorage && db) {
    // Firebase
    const sessionRef = doc(db, COLLECTION_NAME, sessionId);
    await updateDoc(sessionRef, { logs: updatedLogs });
  } else {
    // LocalStorage
    const sessions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const updatedSessions = sessions.map((s: CylinderSession) => 
      s.id === sessionId ? { ...s, logs: updatedLogs } : s
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
    window.dispatchEvent(new Event('storage-update'));
  }
};

// 4. ÎNCHIDERE SESIUNE
export const closeSession = async (sessionId: string) => {
  const now = Date.now();
  
  if (!useLocalStorage && db) {
    // Firebase
    const sessionRef = doc(db, COLLECTION_NAME, sessionId);
    await updateDoc(sessionRef, { isActive: false, endDate: now });
  } else {
    // LocalStorage
    const sessions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const updatedSessions = sessions.map((s: CylinderSession) => 
      s.id === sessionId ? { ...s, isActive: false, endDate: now } : s
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
    window.dispatchEvent(new Event('storage-update'));
  }
};

// Helper pentru a detecta modul curent
export const isUsingFirebase = () => !useLocalStorage;
