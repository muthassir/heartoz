// // client/src/lib/firebase.js
// import { initializeApp } from "firebase/app";
// import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

// const firebaseConfig = {
//   // apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
//   // authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
//   // projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
//   // storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
//   // messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
//   // appId:             import.meta.env.VITE_FIREBASE_APP_ID,
//   apiKey: "AIzaSyDabAOEZ_7_yJtn29tuddBS7tkftXKPS7Q",
//   authDomain: "a-z-date.firebaseapp.com",
//   projectId: "a-z-date",
//   storageBucket: "a-z-date.firebasestorage.app",
//   messagingSenderId: "8337286875",
//   appId: "1:8337286875:web:82fb3e9e1e55602ad88efe",
// };

// const app      = initializeApp(firebaseConfig);
// export const auth     = getAuth(app);
// export const provider = new GoogleAuthProvider();

// // ── Sign in with Google popup ──────────────────────────────────────────────
// export const signInWithGoogle = () => signInWithPopup(auth, provider);

// // ── Sign out ──────────────────────────────────────────────────────────────
// export const firebaseSignOut = () => signOut(auth);











// client/src/lib/firebase.js
// import { initializeApp }                                           from "firebase/app";
// import { getAuth, GoogleAuthProvider, signInWithPopup,
//          signInWithRedirect, getRedirectResult, signOut }         from "firebase/auth";

// const firebaseConfig = {
//   apiKey:            "AIzaSyDabAOEZ_7_yJtn29tuddBS7tkftXKPS7Q",
//   authDomain:        "a-z-date.firebaseapp.com",
//   projectId:         "a-z-date",
//   storageBucket:     "a-z-date.firebasestorage.app",
//   messagingSenderId: "8337286875",
//   appId:             "1:8337286875:web:82fb3e9e1e55602ad88efe",
// };

// const app      = initializeApp(firebaseConfig);
// export const auth     = getAuth(app);
// export const provider = new GoogleAuthProvider();

// provider.addScope("profile");
// provider.addScope("email");

// // Detect a true Android WebView (the wv flag in UA).
// // Regular mobile Chrome, TWA, and installed PWA all support signInWithPopup fine —
// // only a raw WebView needs the redirect fallback.
// const isAndroidWebView = () => {
//   const ua = navigator.userAgent || "";
//   // The "wv" token appears in WebView UA strings: "...Chrome/xx.x.x.x Mobile Safari/xxx (wv)"
//   return /Android/.test(ua) && /; wv\)/.test(ua);
// };

// /**
//  * Sign in with Google.
//  * - Popup    on all browsers including TWA and installed PWA (fast, works great)
//  * - Redirect only on raw Android WebView (wv flag) where popup is blocked by Google
//  */
// export const signInWithGoogle = () => {
//   if (isAndroidWebView()) {
//     return signInWithRedirect(auth, provider);
//   }
//   return signInWithPopup(auth, provider);
// };

// export { getRedirectResult };

// // ── Sign out ───────────────────────────────────────────────────────────────
// export const firebaseSignOut = () => signOut(auth);






// client/src/lib/firebase.js
import { initializeApp }                                           from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup,
         signInWithRedirect, getRedirectResult, signOut }         from "firebase/auth";

const firebaseConfig = {
  apiKey:            "AIzaSyDabAOEZ_7_yJtn29tuddBS7tkftXKPS7Q",
  authDomain:        "a-z-date.firebaseapp.com",
  projectId:         "a-z-date",
  storageBucket:     "a-z-date.firebasestorage.app",
  messagingSenderId: "8337286875",
  appId:             "1:8337286875:web:82fb3e9e1e55602ad88efe",
};

const app      = initializeApp(firebaseConfig);
export const auth     = getAuth(app);
export const provider = new GoogleAuthProvider();

provider.addScope("profile");
provider.addScope("email");

// Use redirect for ALL Android (TWA, WebView, Chrome) — popup loses its
// callback when the TWA activity resumes, causing a white screen.
// On desktop/iOS, popup is fast and works perfectly.
const isAndroid = () => /Android/i.test(navigator.userAgent);

/**
 * Sign in with Google.
 * - Redirect on any Android device (TWA / WebView / Chrome)
 * - Popup    on desktop and iOS
 */
export const signInWithGoogle = () => {
  if (isAndroid()) {
    return signInWithRedirect(auth, provider); // page reloads; result via getRedirectResult
  }
  return signInWithPopup(auth, provider);
};

export { getRedirectResult };

// ── Sign out ───────────────────────────────────────────────────────────────
export const firebaseSignOut = () => signOut(auth);