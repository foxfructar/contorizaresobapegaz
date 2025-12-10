
// Configurare securizata prin Environment Variables
// Valorile sunt citite din fisierul .env (local) sau din setarile serverului (Netlify/Vercel)

// Helper pentru a citi environment variables fara a crapa aplicatia daca import.meta.env nu este definit
const getEnv = (key: string) => {
  try {
    // @ts-ignore - ignoram eroarea de TS pentru ca import.meta.env poate lipsi in anumite environment-uri
    return (import.meta.env || {})[key];
  } catch (e) {
    return undefined;
  }
};

export const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('VITE_FIREBASE_APP_ID')
};

// Validare simpla pentru debugging
if (!firebaseConfig.apiKey) {
  console.log("ℹ️ Configurare Firebase lipsă (Environment Variables nedefinite). Aplicația va rula în mod LOCAL.");
} else if (firebaseConfig.apiKey.includes("AIzaSyBDRlt1y78VjMS7l8s9QIEaFPb5soUrazI")) {
  console.log("ℹ️ Se folosesc chei de demo.");
}
