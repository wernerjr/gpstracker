declare global {
  namespace NodeJS {
    interface ProcessEnv {
      REACT_APP_FIREBASE_API_KEY: string;
      REACT_APP_FIREBASE_AUTH_DOMAIN: string;
      REACT_APP_FIREBASE_PROJECT_ID: string;
      // ... outras variáveis de ambiente que você estiver usando
    }
  }
}

export {}; 