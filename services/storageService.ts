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
  onSnapshot
} from 'firebase/firestore';
import { firebaseConfig } from '../firebaseConfig';

// --- CONFIGURARE FIREBASE ---
let db: any = null;
let useLocalStorage = true;

const initializeFirebase = () => {
  // Verificăm dacă există un API Key valid
  if (firebaseConfig.apiKey && 
      !firebaseConfig.apiKey.startsWith("AIzaSy...") && 
      firebaseConfig.projectId &&
      !firebaseConfig.projectId.includes("PUNE_AICI")) {
    
    try {
      // Curățăm config-ul de valori placeholder care pot da crash
      const sanitizedConfig = { ...firebaseConfig };
      if (sanitizedConfig.messagingSenderId && sanitizedConfig.messagingSenderId.includes("PUNE_AICI")) {
        delete (sanitizedConfig as any).messagingSenderId;
      }

      const app = initializeApp(sanitizedConfig);
      db = getFirestore(app);
      useLocalStorage = false;
      console.log("🔥 Firebase inițializat. Încercăm conexiunea...");
    } catch (e) {
      console.error("Eroare inițializare Firebase:", e);
      useLocalStorage = true;
    }
  } else {
    console.warn("⚠️ Configurare Firebase incompletă. Se folosește LocalStorage.");
    useLocalStorage = true;
  }
};

initializeFirebase();

const STORAGE_KEY = 'gpl_monitor_data';
const COLLECTION_NAME = 'sessions';

// --- HELPERS PENTRU CALCUL STATISTICI ---
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

// 1. SUBSCRIBE
export const subscribeToSessions = (callback: (sessions: CylinderSession[]) => void) => {
  // Funcție locală de încărcare
  const loadLocal = () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      callback(data ? JSON.parse(data) : []);
    } catch (e) {
      console.error("Eroare citire LocalStorage:", e);
      callback([]);
    }
  };

  if (!useLocalStorage && db) {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('startDate', 'desc'));
      return onSnapshot(q, (snapshot) => {
        const sessions = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as CylinderSession[];
        callback(sessions);
      }, (error) => {
        console.error("Eroare abonare Firebase (trecem pe local):", error);
        // Fallback automat pe local dacă Firebase eșuează (ex: lipsă permisiuni)
        useLocalStorage = true;
        loadLocal();
      });
    } catch (e) {
      console.error("Eroare creare query Firebase:", e);
      useLocalStorage = true;
      loadLocal();
      return () => {};
    }
  } else {
    loadLocal();
    window.addEventListener('storage-update', loadLocal);
    return () => window.removeEventListener('storage-update', loadLocal);
  }
};

// 2. ADĂUGARE BUTELIE NOUĂ
export const startNewCylinder = async (currentActiveId?: string) => {
  const now = Date.now();
  
  // Închidem sesiunea anterioară local (pentru viteză UI) sau remote
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
    try {
      await addDoc(collection(db, COLLECTION_NAME), newSessionData);
      console.log("✅ Butelie creată în Firebase");
    } catch (e) {
      console.error("Eroare scriere Firebase (fallback local):", e);
      // Dacă eșuează scrierea, trecem pe local și scriem acolo
      useLocalStorage = true;
      writeLocalNewSession(newSessionData);
    }
  } else {
    writeLocalNewSession(newSessionData);
  }
};

const writeLocalNewSession = (data: any) => {
  const sessions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const newSession = { id: Math.random().toString(36).substring(2, 9), ...data };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([newSession, ...sessions]));
  window.dispatchEvent(new Event('storage-update'));
};

// 3. SCHIMBARE TREAPTĂ
export const changeLevel = async (sessionId: string, newLevel: HeatLevel, currentLogs: any[]) => {
  const newLog = { timestamp: Date.now(), level: newLevel };
  const updatedLogs = [...currentLogs, newLog];

  if (!useLocalStorage && db) {
    try {
      const sessionRef = doc(db, COLLECTION_NAME, sessionId);
      await updateDoc(sessionRef, { logs: updatedLogs });
    } catch (e) {
      console.error("Eroare update Firebase:", e);
      // Nu facem fallback aici pentru a nu desincroniza grav, dar alertăm
      alert("Eroare conexiune. Verifică internetul.");
    }
  } else {
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
    try {
      const sessionRef = doc(db, COLLECTION_NAME, sessionId);
      await updateDoc(sessionRef, { isActive: false, endDate: now });
    } catch (e) {
      console.error("Eroare închidere sesiune Firebase:", e);
      // Fallback local
      closeSessionLocal(sessionId, now);
    }
  } else {
    closeSessionLocal(sessionId, now);
  }
};

const closeSessionLocal = (sessionId: string, endDate: number) => {
  const sessions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const updatedSessions = sessions.map((s: CylinderSession) => 
    s.id === sessionId ? { ...s, isActive: false, endDate: endDate } : s
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
  window.dispatchEvent(new Event('storage-update'));
}

export const isUsingFirebase = () => !useLocalStorage;