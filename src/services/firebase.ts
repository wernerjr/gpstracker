import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence, connectFirestoreEmulator, Firestore } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

const firebaseConfig = {
  // Suas configurações do Firebase aqui
  apiKey: "AIzaSyC0Qkyd8fE-M7GoOgQ5pdLH-nvkFgjW1eE",
  authDomain: "gps-tracker-9c484.firebaseapp.com",
  projectId: "gps-tracker-9c484",
  storageBucket: "gps-tracker-9c484.firebasestorage.app",
  messagingSenderId: "139775082890",
  appId: "1:139775082890:web:4b57d43e70249b6c540873",
};

let db: Firestore;
let auth;

try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);

  // Adicione logs para debug
  console.log('Firebase inicializado com sucesso');
  console.log('Projeto ID:', firebaseConfig.projectId);

  // Tente habilitar a persistência
  enableIndexedDbPersistence(db)
    .then(() => {
      console.log('Persistência habilitada com sucesso');
    })
    .catch((err) => {
      console.error('Erro ao habilitar persistência:', err);
      if (err.code === 'failed-precondition') {
        console.log('Múltiplas abas abertas');
      } else if (err.code === 'unimplemented') {
        console.log('Browser não suporta persistência');
      }
    });

} catch (error) {
  console.error('Erro ao inicializar Firebase:', error);
}

export { db, auth }; 