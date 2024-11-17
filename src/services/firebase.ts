import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC0Qkyd8fE-M7GoOgQ5pdLH-nvkFgjW1eE",
  authDomain: "gps-tracker-9c484.firebaseapp.com",
  projectId: "gps-tracker-9c484",
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