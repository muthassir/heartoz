// client/src/App.jsx
import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import LoginPage    from "./pages/LoginPage";
import About    from "./pages/About";
import PairPage     from "./pages/PairPage";
import DatesTab     from "./pages/DatesTab";
import BucketTab    from "./pages/BucketTab";
import MemoriesTab  from "./pages/MemoriesTab";
import GamesTab     from "./pages/GamesTab";
import IdeasTab     from "./pages/IdeasTab";
import * as API     from "./lib/api";
import { TABS } from "./lib/constants";
import Raininghearts from "./components/Raininghearts";

// ── Journal App ──────────────────────────────────────────────────────────────
function JournalApp() {
  const { user, logout } = useAuth();
  const [couple,  setCouple]  = useState(null);
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState("dates");

  // Shared data
  const [dates,    setDates]    = useState({});
  const [buckets,  setBuckets]  = useState([]);
  const [memories, setMemories] = useState([]);
  const [scores,   setScores]   = useState({});
  const [ideaFavs, setIdeaFavs] = useState([]);
  const [ideaDone, setIdeaDone] = useState([]);

  // Loading states
  const [refreshing,     setRefreshing]     = useState(false);
  const [togglingDate,   setTogglingDate]   = useState(null);
  const [uploadingDate,  setUploadingDate]  = useState(null);
  const [savingBucket,   setSavingBucket]   = useState(false);
  const [togglingBucket, setTogglingBucket] = useState(null);
  const [deletingBucket, setDeletingBucket] = useState(null);
  const [savingNote,     setSavingNote]     = useState(null);
  const [savingMemory,   setSavingMemory]   = useState(false);
  const [deletingMemory, setDeletingMemory] = useState(null);
  const [savingScore,    setSavingScore]    = useState(false);
  const [playerTurn,     setPlayerTurn]     = useState(null);

  const coupleId = user?.coupleId;

  const fetchCouple = (showLoader = false) => {
    if (!coupleId) { setLoading(false); return; }
    if (showLoader) setRefreshing(true);
    API.getCouple(coupleId)
      .then(res => {
        const { couple: c, partner: p } = res.data;
        setCouple(c); setPartner(p);
        const d = {};
        if (c.dates) Object.entries(c.dates).forEach(([k,v]) => { d[k] = v; });
        setDates(d);
        setBuckets(c.buckets   || []);
        setMemories(c.memories || []);
        setScores(c.scores     || {});
        setIdeaFavs(c.ideaFavs || []);
        setIdeaDone(c.ideaDone || []);
        setPlayerTurn(prev => prev || user?.name?.split(" ")[0] || "You");
      })
      .catch(console.error)
      .finally(() => { setLoading(false); setRefreshing(false); });
  };

  useEffect(() => { fetchCouple(); }, [coupleId]);

  // ── Dates ─────────────────────────────────────────────────────────────
  const handleDateToggle = async (letter, currentDone) => {
    if (togglingDate) return;
    setTogglingDate(letter);
    const payload = { done: !currentDone, doneAt: !currentDone ? new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : null };
    setDates(d => ({ ...d, [letter]: { ...(d[letter]||{}), ...payload } }));
    await API.updateDate(coupleId, letter, payload).catch(console.error);
    setTogglingDate(null);
  };

  const handleDatePhoto = (letter, file) => {
    if (!file?.type.startsWith("image/")) return;
    setUploadingDate(letter);
    const r = new FileReader();
    r.onload = async e => {
      const photo  = e.target.result;
      const doneAt = new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
      setDates(d => ({ ...d, [letter]: { ...(d[letter]||{}), photo, doneAt } }));
      await API.updateDate(coupleId, letter, { photo, doneAt }).catch(console.error);
      setUploadingDate(null);
    };
    r.readAsDataURL(file);
  };

  // ── Buckets ───────────────────────────────────────────────────────────
  const handleAddBucket = async (form) => {
    setSavingBucket(true);
    try { const res = await API.addBucket(coupleId, form); setBuckets(b => [...b, res.data]); }
    catch(e) { console.error(e); }
    finally { setSavingBucket(false); }
  };

  const handleToggleBucket = async (id, done) => {
    if (togglingBucket) return;
    setTogglingBucket(id);
    setBuckets(b => b.map(x => x._id===id ? {...x,done:!done} : x));
    await API.updateBucket(coupleId, id, { done: !done }).catch(console.error);
    setTogglingBucket(null);
  };

  const handleDeleteBucket = async (id) => {
    if (deletingBucket) return;
    setDeletingBucket(id);
    setBuckets(b => b.filter(x => x._id !== id));
    await API.deleteBucket(coupleId, id).catch(console.error);
    setDeletingBucket(null);
  };

  const handleSaveNote = async (id, text) => {
    if (savingNote) return;
    setSavingNote(id);
    setBuckets(b => b.map(x => x._id===id ? {...x,note:text} : x));
    await API.updateBucket(coupleId, id, { note: text }).catch(console.error);
    setSavingNote(null);
  };

  // ── Memories ──────────────────────────────────────────────────────────
  const handleAddMemory = async (payload) => {
    setSavingMemory(true);
    try { const res = await API.addMemory(coupleId, payload); setMemories(m => [res.data, ...m]); }
    catch(e) { console.error(e); }
    finally { setSavingMemory(false); }
  };

  const handleDeleteMemory = async (id) => {
    if (deletingMemory) return;
    setDeletingMemory(id);
    setMemories(m => m.filter(x => x._id !== id));
    await API.deleteMemory(coupleId, id).catch(console.error);
    setDeletingMemory(null);
  };

  // ── Scores ────────────────────────────────────────────────────────────
  const handleAddScore = async (pts) => {
    if (savingScore) return;
    setSavingScore(true);
    const uid = user.id;
    setScores(s => ({ ...s, [uid]: (s[uid]||0) + pts }));
    await API.addScore(coupleId, uid, pts).catch(console.error);
    setSavingScore(false);
    setPlayerTurn(p => p === p1Name ? p2Name : p1Name);
  };

  // ── Progress ──────────────────────────────────────────────────────────
  const totalDone      = Object.values(dates).filter(d => d.done).length;
  const progress       = Math.round((totalDone / 26) * 100);
  const bucketDone     = buckets.filter(b => b.done).length;
  const bucketProgress = buckets.length ? Math.round((bucketDone / buckets.length) * 100) : 0;
  const activeProgress = tab==="dates" ? progress : tab==="bucket" ? bucketProgress : tab==="memories" ? Math.min(100, memories.length*10) : 100;

  const p1Name = user?.name?.split(" ")[0]    || "You";
  const p2Name = partner?.name?.split(" ")[0] || "Partner";

  if (loading) return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center">
      <div className="text-center"><div className="text-5xl animate-bounce">💕</div><p className="text-rose-400 mt-3 text-sm">Loading your journal…</p></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-rose-50">
      <Raininghearts />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400;700&display=swap');
        *{font-family:'Lato',sans-serif;box-sizing:border-box;}
        .df{font-family:'Playfair Display',serif;}
        .pf{transition:width 1s cubic-bezier(0.4,0,0.2,1);}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      `}</style>

      {/* Header */}
      <div className="bg-white border-b border-rose-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 pt-3 pb-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {user?.photo    && <img src={user.photo}    alt="" className="w-7 h-7 rounded-full border-2 border-white shadow"/>}
                {partner?.photo ? <img src={partner.photo} alt="" className="w-7 h-7 rounded-full border-2 border-white shadow"/> : <div className="w-7 h-7 rounded-full border-2 border-white shadow bg-rose-100 flex items-center justify-center text-xs">💕</div>}
              </div>
              <div>
                <h1 className="df text-base font-bold text-gray-800 leading-tight">{p1Name} & {p2Name}</h1>
                <p className="text-xs text-rose-400">Couple Journal</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="df text-xl font-bold text-rose-500">
                {tab==="dates"    ? <>{totalDone}<span className="text-gray-300 text-sm">/26</span></>
                : tab==="bucket"  ? <>{bucketDone}<span className="text-gray-300 text-sm">/{buckets.length}</span></>
                : tab==="memories"? <>{memories.length}<span className="text-gray-300 text-xs"> mem</span></>
                : <span>🎮</span>}
              </div>
              <button onClick={() => fetchCouple(true)} title="Sync" disabled={refreshing} className="w-7 h-7 rounded-full bg-rose-50 hover:bg-rose-100 text-gray-400 text-xs flex items-center justify-center disabled:opacity-50" style={{animation:refreshing?"spin 0.8s linear infinite":"none"}}>🔄</button>
              <button onClick={logout} title="Sign out" className="w-7 h-7 rounded-full bg-rose-50 hover:bg-rose-100 text-gray-400 text-xs flex items-center justify-center">↩</button>
            </div>
          </div>

          {tab !== "games" && tab !== "ideas" && (
            <div className="mb-2">
              <div className="w-full h-2 bg-rose-50 rounded-full overflow-hidden border border-rose-100">
                <div className="h-full bg-gradient-to-r from-rose-400 via-pink-400 to-orange-300 rounded-full pf" style={{width:`${activeProgress}%`}}/>
              </div>
            </div>
          )}

          <div className="flex">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 py-2 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1 border-b-2 transition-all ${tab===t.id ? "text-rose-500 border-rose-400" : "text-gray-400 border-transparent hover:text-rose-400"}`}>
                <span>{t.emoji}</span><span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      {tab === "dates" && (
        <DatesTab
          dates={dates} coupleId={coupleId} user={user}
          togglingDate={togglingDate} uploadingDate={uploadingDate}
          onToggle={handleDateToggle} onPhoto={handleDatePhoto}
        />
      )}
      {tab === "bucket" && (
        <BucketTab
          buckets={buckets} coupleId={coupleId}
          savingBucket={savingBucket} togglingBucket={togglingBucket}
          deletingBucket={deletingBucket} savingNote={savingNote}
          onAdd={handleAddBucket} onToggle={handleToggleBucket}
          onDelete={handleDeleteBucket} onSaveNote={handleSaveNote}
        />
      )}
      {tab === "memories" && (
        <MemoriesTab
          memories={memories} coupleId={coupleId}
          savingMemory={savingMemory} deletingMemory={deletingMemory}
          onAdd={handleAddMemory} onDelete={handleDeleteMemory}
        />
      )}
      {tab === "games" && (
        <GamesTab
          user={user} partner={partner} scores={scores}
          playerTurn={playerTurn}
          savingScore={savingScore} onAddScore={handleAddScore}
        />
      )}
      {tab === "ideas" && <IdeasTab coupleId={coupleId} ideaFavs={ideaFavs} ideaDone={ideaDone} setIdeaFavs={setIdeaFavs} setIdeaDone={setIdeaDone} />}
    </div>
  );
}

// ── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center">
      <div className="text-center"><div className="text-5xl animate-bounce">💕</div><p className="text-rose-400 mt-3 text-sm">Loading…</p></div>
    </div>
  );
  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
      <Route path="/about" element={<About onBack={() => window.history.back()} />} />
      <Route path="/" element={
        !user        ? <Navigate to="/login" /> :
        !user.coupleId ? <PairPage onPaired={() => window.location.reload()} /> :
        <JournalApp />
      } />
    </Routes>
  );
}