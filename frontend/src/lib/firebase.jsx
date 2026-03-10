// client/src/lib/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
  // apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  // authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  // projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  // messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  // appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  apiKey: "AIzaSyDabAOEZ_7_yJtn29tuddBS7tkftXKPS7Q",
  authDomain: "a-z-date.firebaseapp.com",
  projectId: "a-z-date",
  storageBucket: "a-z-date.firebasestorage.app",
  messagingSenderId: "8337286875",
  appId: "1:8337286875:web:82fb3e9e1e55602ad88efe",
};

const app      = initializeApp(firebaseConfig);
export const auth     = getAuth(app);
export const provider = new GoogleAuthProvider();

// ── Sign in with Google popup ──────────────────────────────────────────────
export const signInWithGoogle = () => signInWithPopup(auth, provider);

// ── Sign out ──────────────────────────────────────────────────────────────
export const firebaseSignOut = () => signOut(auth);