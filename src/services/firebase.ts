import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: "gps-tracker-9c484.firebasestorage.app",
  messagingSenderId: "139775082890",
  appId: "1:139775082890:web:4b57d43e70249b6c540873",
};

const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);

// Habilitar persistência offline
enableIndexedDbPersistence(firestore)
  .catch((err) => {
    console.error('Erro ao habilitar persistência:', err);
  }); 