// // client/src/hooks/useAuth.js
// import { useState, useEffect, createContext, useContext } from "react";
// import { onAuthStateChanged } from "firebase/auth";
// import { auth, signInWithGoogle, firebaseSignOut } from "../lib/firebase";
// import { syncUser } from "../lib/api";

// const AuthContext = createContext(null);

// export function AuthProvider({ children }) {
//   const [user,    setUser]    = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Firebase automatically restores session on page refresh
//     const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
//       if (firebaseUser) {
//         try {
//           // Get fresh Firebase token and sync user to our backend
//           const token = await firebaseUser.getIdToken();
//           localStorage.setItem("az_token", token);
//           const res = await syncUser();
//           setUser(res.data);
//         } catch (err) {
//           console.error("Auth sync failed", err);
//           setUser(null);
//           localStorage.removeItem("az_token");
//         }
//       } else {
//         setUser(null);
//         localStorage.removeItem("az_token");
//       }
//       setLoading(false);
//     });

//     return () => unsubscribe();
//   }, []);

//   const loginWithGoogle = async () => {
//     try {
//       const result = await signInWithGoogle();
//       const token  = await result.user.getIdToken();
//       localStorage.setItem("az_token", token);
//       const res = await syncUser();
//       setUser(res.data);
//     } catch (err) {
//       console.error("Google login failed", err);
//       throw err;
//     }
//   };

//   const logout = async () => {
//     try {
//       await firebaseSignOut();
//       localStorage.removeItem("az_token");
//       setUser(null);
//     } catch (err) {
//       console.error("Logout failed", err);
//     }
//   };

//   const refreshUser = async () => {
//     // Refresh Firebase token in case it expired
//     const firebaseUser = auth.currentUser;
//     if (firebaseUser) {
//       const token = await firebaseUser.getIdToken(true); // force refresh
//       localStorage.setItem("az_token", token);
//     }
//     const res = await syncUser();
//     setUser(res.data);
//     return res.data;
//   };

//   return (
//     <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout, setUser, refreshUser }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export const useAuth = () => useContext(AuthContext);



















// client/src/hooks/useAuth.js
// import { useState, useEffect, createContext, useContext } from "react";
// import { onAuthStateChanged } from "firebase/auth";
// import { auth, signInWithGoogle, firebaseSignOut, getRedirectResult } from "../lib/firebase";
// import { syncUser } from "../lib/api";

// const AuthContext = createContext(null);

// export function AuthProvider({ children }) {
//   const [user,    setUser]    = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Handle redirect result first (for Android WebView fallback flow).
//     // getRedirectResult resolves with null if no redirect just happened.
//     getRedirectResult(auth).then(async (result) => {
//       if (result?.user) {
//         try {
//           const token = await result.user.getIdToken();
//           localStorage.setItem("az_token", token);
//           await syncUser();
//         } catch (err) {
//           console.error("Redirect result sync failed", err);
//         }
//       }
//     }).catch((err) => {
//       console.error("getRedirectResult error", err);
//     });

//     // Firebase automatically restores session on page refresh
//     const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
//       if (firebaseUser) {
//         try {
//           // Get fresh Firebase token and sync user to our backend
//           const token = await firebaseUser.getIdToken();
//           localStorage.setItem("az_token", token);
//           const res = await syncUser();
//           setUser(res.data);
//         } catch (err) {
//           console.error("Auth sync failed", err);
//           setUser(null);
//           localStorage.removeItem("az_token");
//         }
//       } else {
//         setUser(null);
//         localStorage.removeItem("az_token");
//       }
//       setLoading(false);
//     });

//     return () => unsubscribe();
//   }, []);

//   const loginWithGoogle = async () => {
//     try {
//       const result = await signInWithGoogle();
//       const token  = await result.user.getIdToken();
//       localStorage.setItem("az_token", token);
//       const res = await syncUser();
//       setUser(res.data);
//     } catch (err) {
//       console.error("Google login failed", err);
//       throw err;
//     }
//   };

//   const logout = async () => {
//     try {
//       await firebaseSignOut();
//       localStorage.removeItem("az_token");
//       setUser(null);
//     } catch (err) {
//       console.error("Logout failed", err);
//     }
//   };

//   const refreshUser = async () => {
//     // Refresh Firebase token in case it expired
//     const firebaseUser = auth.currentUser;
//     if (firebaseUser) {
//       const token = await firebaseUser.getIdToken(true); // force refresh
//       localStorage.setItem("az_token", token);
//     }
//     const res = await syncUser();
//     setUser(res.data);
//     return res.data;
//   };

//   return (
//     <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout, setUser, refreshUser }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export const useAuth = () => useContext(AuthContext);






// client/src/hooks/useAuth.js
import { useState, useEffect, createContext, useContext } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, signInWithGoogle, firebaseSignOut, getRedirectResult } from "../lib/firebase";
import { syncUser } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let settled = false;

    // ── Step 1: pick up redirect result (Android TWA / WebView flow) ──────
    // Must run before onAuthStateChanged so the token is stored first.
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          try {
            const token = await result.user.getIdToken();
            localStorage.setItem("az_token", token);
            await syncUser();
            // onAuthStateChanged will fire right after and set the user.
          } catch (err) {
            console.error("Redirect sync failed", err);
          }
        }
      })
      .catch((err) => {
        // auth/cancelled-popup-request etc — safe to ignore here
        console.error("getRedirectResult error", err.code, err.message);
      });

    // ── Step 2: normal session restore on every page load ─────────────────
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (settled) return; // only run once per mount
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          localStorage.setItem("az_token", token);
          const res = await syncUser();
          setUser(res.data);
        } catch (err) {
          console.error("Auth sync failed", err);
          setUser(null);
          localStorage.removeItem("az_token");
        }
      } else {
        setUser(null);
        localStorage.removeItem("az_token");
      }
      settled = true;
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithGoogle();

      // On Android, signInWithRedirect returns void — the page reloads and
      // onAuthStateChanged + getRedirectResult handle login on the next load.
      // Nothing to do here; don't try to read result.user (it's null/void).
      if (!result?.user) return;

      // Desktop / iOS popup path
      const token = await result.user.getIdToken();
      localStorage.setItem("az_token", token);
      const res = await syncUser();
      setUser(res.data);
    } catch (err) {
      // Ignore user-cancelled popup
      if (err?.code === "auth/popup-closed-by-user") return;
      console.error("Google login failed", err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut();
      localStorage.removeItem("az_token");
      setUser(null);
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const refreshUser = async () => {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      const token = await firebaseUser.getIdToken(true);
      localStorage.setItem("az_token", token);
    }
    const res = await syncUser();
    setUser(res.data);
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout, setUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);