// client/src/components/GoogleSignInButton.jsx
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 18 18" style={{flexShrink:0}}>
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.185l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
    <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"/>
  </svg>
);

/**
 * GoogleSignInButton
 * Props:
 *   onSuccess  - optional callback after successful login
 *   onError    - optional callback(errorMsg) on failure
 *   label      - button text (default: "Continue with Google")
 *   style      - extra inline styles for the button
 */
export default function GoogleSignInButton({ onSuccess, onError, label = "Continue with Google", style = {} }) {
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await loginWithGoogle();
      onSuccess?.();
    } catch (err) {
      const msg = "Sign-in failed. Please try again.";
      setError(msg);
      onError?.(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{width:"100%"}}>
      <style>{`
        @keyframes gsib-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        .gsib-btn{
          width:100%;padding:14px;border-radius:14px;
          border:1.5px solid #e5e7eb;background:white;
          color:#374151;font-size:15px;font-weight:700;
          display:flex;align-items:center;justify-content:center;gap:10px;
          cursor:pointer;transition:all 0.2s;
          box-shadow:0 4px 16px rgba(244,63,94,0.1);
          font-family:'Lato',sans-serif;
        }
        .gsib-btn:hover:not(:disabled){
          border-color:#fda4af;
          box-shadow:0 6px 24px rgba(244,63,94,0.2);
          transform:translateY(-2px);
        }
        .gsib-btn:disabled{opacity:0.6;cursor:not-allowed;}
      `}</style>

      {error && (
        <div style={{
          background:"#fff1f2",border:"1px solid #fecdd3",borderRadius:"12px",
          padding:"9px 13px",color:"#f43f5e",fontSize:"12px",
          marginBottom:"10px",textAlign:"center",
        }}>{error}</div>
      )}

      <button className="gsib-btn" style={style} onClick={handleLogin} disabled={loading}>
        {loading ? (
          <>
            <span style={{width:"17px",height:"17px",border:"2px solid #e5e7eb",borderTopColor:"#f43f5e",borderRadius:"50%",animation:"gsib-spin 0.7s linear infinite",display:"inline-block"}}/>
            Signing in…
          </>
        ) : (
          <><GoogleIcon/>{label}</>
        )}
      </button>
    </div>
  );
}