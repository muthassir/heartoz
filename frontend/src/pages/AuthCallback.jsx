// client/src/pages/AuthCallback.jsx
// Google OAuth redirects to /auth/callback?token=xxx
// This page grabs the token, stores it, then redirects home.
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function AuthCallback() {
  const navigate     = useNavigate();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get("token");
    const error  = params.get("error");

    if (error || !token) {
      navigate("/login?error=oauth");
      return;
    }

    localStorage.setItem("az_token", token);
    refreshUser().then(() => navigate("/")).catch(() => navigate("/login"));
  }, []);

  return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl animate-bounce">💕</div>
        <p className="text-rose-400 mt-3 text-sm">Signing you in…</p>
      </div>
    </div>
  );
}