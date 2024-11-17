import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

if (!process.env.REACT_APP_FIREBASE_PROJECT_ID) {
  throw new Error('REACT_APP_FIREBASE_PROJECT_ID não está definido');
}

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);

// Habilitar persistência offline
enableIndexedDbPersistence(firestore)
  .catch((err) => {
    console.error('Erro ao habilitar persistência:', err);
  }); 