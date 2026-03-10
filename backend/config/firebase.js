// server/config/firebase.js
// Firebase Admin SDK — verifies tokens server-side
const admin = require("firebase-admin");

const initFirebase = () => {
  if (admin.apps.length > 0) return; // already initialised

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Replace \n in env var (Render/Netlify store it as single line)
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });

  console.log("✅ Firebase Admin initialised");
};

module.exports = { initFirebase, admin };