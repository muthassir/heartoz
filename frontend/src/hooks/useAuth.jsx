// client/src/hooks/useAuth.jsx
import { useState, useEffect, createContext, useContext } from "react";
import { getMe, logout as apiLogout } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("az_token");
    if (!token) { setLoading(false); return; }
    getMe()
      .then(res => setUser(res.data))
      .catch(() => localStorage.removeItem("az_token"))
      .finally(() => setLoading(false));
  }, []);

  const loginWithGoogle = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  const logout = async () => {
    await apiLogout().catch(() => {});
    localStorage.removeItem("az_token");
    setUser(null);
  };

  const refreshUser = async () => {
    const res = await getMe();
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