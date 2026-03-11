// client/src/hooks/useAuth.js
import { useState, useEffect, createContext, useContext } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, signInWithGoogle, firebaseSignOut } from "../lib/firebase";
import { syncUser } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase automatically restores session on page refresh
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get fresh Firebase token and sync user to our backend
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
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithGoogle();
      const token  = await result.user.getIdToken();
      localStorage.setItem("az_token", token);
      const res = await syncUser();
      setUser(res.data);
    } catch (err) {
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
    // Refresh Firebase token in case it expired
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      const token = await firebaseUser.getIdToken(true); // force refresh
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