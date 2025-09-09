import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyAQ5yPhI5G1vgyMUezUbdDN5Pcz1731pvE',
  authDomain: 'rest-client-app-9b042.firebaseapp.com',
  projectId: 'rest-client-app-9b042',
  storageBucket: 'rest-client-app-9b042.firebasestorage.app',
  messagingSenderId: '759394741309',
  appId: '1:759394741309:web:722c121270f243d0abce54',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export { auth };
