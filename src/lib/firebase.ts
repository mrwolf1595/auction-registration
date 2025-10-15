import { initializeApp, getApps } from 'firebase/app';
import { getAuth, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAf9VDoyjobrWOzOfl-7_-NAWT3147HLew",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "mazaad-66969.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mazaad-66969",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "mazaad-66969.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "474870735880",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:474870735880:web:xxxxx",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-XXXXXXXXXX",
  // Add database URL for Realtime Database
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://mazaad-66969-default-rtdb.firebaseio.com/"
};

// Initialize Firebase only if not already initialized and config is available
const app = getApps().length === 0 && firebaseConfig.apiKey 
  ? initializeApp(firebaseConfig)
  : getApps()[0];

// Initialize Firebase Auth with session persistence
let auth: ReturnType<typeof getAuth> | null = null;

if (app) {
  auth = getAuth(app);
  
  // Configure session persistence to browser session only
  // This means the session will be cleared when the browser/tab is closed
  // Combined with our inactivity timeout for complete session control
  if (typeof window !== 'undefined') {
    setPersistence(auth, browserSessionPersistence)
      .then(() => {
        console.log('Firebase Auth persistence set to SESSION mode');
      })
      .catch((error) => {
        console.error('Error setting auth persistence:', error);
      });
  }
}

// Initialize other Firebase services
export { auth };
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;
export const database = app ? getDatabase(app) : null;

export default app;
