// client/src/pages/PairPage.jsx
import { useState } from "react";
import { createInvite, joinInvite } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

export default function PairPage({ onPaired }) {
  const { user, logout, refreshUser } = useAuth();
  const [mode,      setMode]      = useState("choose");
  const [code,      setCode]      = useState("");
  const [expiresAt, setExpiresAt] = useState(null);
  const [inputCode, setInputCode] = useState("");
  const [error,     setError]     = useState("");
  const [busy,      setBusy]      = useState(false);
  const [copied,    setCopied]    = useState(false);

  const handleCreate = async () => {
    setBusy(true); setError("");
    try {
      const res = await createInvite();
      setCode(res.data.code);
      setExpiresAt(res.data.expiresAt);
      setMode("invite");
    } catch (e) { setError(e.response?.data?.message || e.message); }
    finally { setBusy(false); }
  };

  const handleJoin = async () => {
    if (!inputCode.trim()) return;
    setBusy(true); setError("");
    try {
      await joinInvite(inputCode);
      await refreshUser();
      onPaired?.();
    } catch (e) { setError(e.response?.data?.message || e.message); }
    finally { setBusy(false); }
  };

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const share = () => {
    const url = `${window.location.origin}?invite=${code}`;
    if (navigator.share) {
      navigator.share({ title: "Join my A–Z Couple Journal!", text: `Use code ${code}`, url });
    } else { copy(url); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400;700&display=swap');.df{font-family:'Playfair Display',serif;}`}</style>
      <div className="bg-white rounded-3xl shadow-xl border border-rose-100 p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            {user?.photo && <img src={user.photo} alt="" className="w-8 h-8 rounded-full border-2 border-rose-200"/>}
            <span className="text-sm font-semibold text-gray-700">{user?.name?.split(" ")[0]}</span>
          </div>
          <button onClick={logout} className="text-xs text-gray-400 hover:text-gray-600">Sign out</button>
        </div>

        {mode === "choose" && (
          <>
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">💌</div>
              <h2 className="df text-2xl font-bold text-gray-800">Connect with your Partner</h2>
              <p className="text-gray-400 text-sm mt-1">Pair up to share your journal in real-time.</p>
            </div>
            <div className="space-y-3">
              <button onClick={handleCreate} disabled={busy}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold text-sm shadow-md shadow-rose-200 flex items-center justify-center gap-2 disabled:opacity-50">
                {busy ? "Creating…" : <><span className="text-lg">🔗</span> Create Invite Code</>}
              </button>
              <button onClick={() => { setMode("join"); setError(""); }}
                className="w-full py-4 rounded-2xl border-2 border-rose-100 hover:border-rose-300 text-rose-500 font-bold text-sm flex items-center justify-center gap-2">
                <span className="text-lg">🤝</span> I Have a Code
              </button>
            </div>
          </>
        )}

        {mode === "invite" && code && (
          <>
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">🎉</div>
              <h2 className="df text-xl font-bold text-gray-800">Share with your Partner</h2>
              <p className="text-gray-400 text-xs mt-1">Expires in 48 hours · Single use</p>
            </div>
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-100 rounded-2xl p-5 text-center mb-4">
              <p className="text-xs text-rose-400 font-semibold uppercase tracking-widest mb-1">Invite Code</p>
              <p className="df text-4xl font-bold text-rose-500 tracking-widest">{code}</p>
              {expiresAt && <p className="text-xs text-gray-400 mt-2">Expires {new Date(expiresAt).toLocaleString()}</p>}
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button onClick={() => copy(code)} className="py-3 rounded-xl bg-white border border-rose-100 hover:border-rose-300 text-sm font-semibold text-gray-600 flex items-center justify-center gap-1.5">
                {copied ? "✅ Copied!" : "📋 Copy Code"}
              </button>
              <button onClick={share} className="py-3 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 text-white text-sm font-bold flex items-center justify-center gap-1.5 shadow-md">
                📤 Share Link
              </button>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-3 text-xs text-amber-700 flex gap-2">
              <span>⏳</span><span>Waiting for your partner to join…</span>
            </div>
            <button onClick={() => { setMode("choose"); setCode(""); }} className="w-full text-xs text-gray-400 hover:text-gray-600 py-1">← Back</button>
          </>
        )}

        {mode === "join" && (
          <>
            <div className="text-center mb-5">
              <div className="text-4xl mb-2">🔐</div>
              <h2 className="df text-xl font-bold text-gray-800">Enter Invite Code</h2>
              <p className="text-gray-400 text-sm mt-1">Ask your partner for their 6-character code.</p>
            </div>
            <div className="space-y-3">
              <input type="text" maxLength={6} placeholder="e.g. A3F9KL" value={inputCode}
                onChange={e => { setInputCode(e.target.value.toUpperCase()); setError(""); }}
                className="w-full border-2 border-rose-100 focus:border-rose-300 rounded-2xl px-4 py-3.5 text-center text-2xl font-bold tracking-widest text-gray-700 placeholder-gray-300 uppercase bg-rose-50/30"/>
              {error && <p className="text-red-400 text-xs text-center">{error}</p>}
              <button onClick={handleJoin} disabled={busy || inputCode.length < 6}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold text-sm shadow-md disabled:opacity-40">
                {busy ? "Joining…" : "💕 Join Journal"}
              </button>
              <button onClick={() => { setMode("choose"); setError(""); }} className="w-full text-xs text-gray-400 hover:text-gray-600 py-1">← Back</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}