// PASUL 1: Mergi la console.firebase.google.com
// PASUL 2: Creaza un proiect, apoi o aplicatie Web (iconita </>)
// PASUL 3: Mergi la Firestore Database -> Create Database -> Start in Test Mode
// PASUL 4: Copiaza valorile din consola (Project Settings) in campurile de mai jos:

export const firebaseConfig = {
  // Copiaza sirul lung de caractere de la apiKey (ex: "AIzaSyD...")
  apiKey: "AIzaSyBDRlt1y78VjMS7l8s9QIEaFPb5soUrazI", 
  
  // Domeniul de autentificare (ex: "monitor-gpl.firebaseapp.com")
  authDomain: "soba-pe-gaz.firebaseapp.com",
  
  // ID-ul proiectului (ex: "monitor-gpl")
  projectId: "soba-pe-gaz",
  
  // Bucket-ul de stocare (ex: "monitor-gpl.appspot.com")
  storageBucket: "soba-pe-gaz.firebasestorage.app",
  
  // ID-ul expeditorului (un numar lung)
  messagingSenderId: "PUNE_AICI_MESSAGING_SENDER_ID",
  
  // ID-ul aplicatiei (ex: "1:123456789:web:abcdef...")
  appId: "1:803059012248:web:9e174b12b5d8b64faa76ed",
};

// NOTA IMPORTANTA:
// Dupa ce completezi datele de mai sus, salveaza fisierul.
// Aplicatia va detecta automat conexiunea si va trece de pe "DEMO" pe "LIVE".
