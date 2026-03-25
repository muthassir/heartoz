// client/src/App.jsx
import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import LoginPage    from "./pages/LoginPage";
import About        from "./pages/About";
import PairPage     from "./pages/PairPage";
import DashboardTab from "./pages/DashboardTab";
import NavDrawer    from "./components/NavDrawer";
import DatesTab     from "./pages/DatesTab";
import BucketTab    from "./pages/BucketTab";
import MemoriesTab  from "./pages/MemoriesTab";
import GamesTab     from "./pages/GamesTab";
import IdeasTab     from "./pages/IdeasTab";
import * as API     from "./lib/api";
import Raininghearts from "./components/Raininghearts";
import LoadingScreen from "./components/LoadingScreen";
import { FaBars, FaHeart, FaGamepad, FaCameraRetro, FaLightbulb, FaHeartbeat, FaList, FaSync, FaHome } from "react-icons/fa";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";

const TAB_META = {
  dashboard: { label:"Home",      icon:<FaHome />,        badge: null },
  dates:     { label:"A–Z Dates", icon:<FaHeartbeat />,   badge: null },
  bucket:    { label:"Bucket",    icon:<FaList />,         badge: null },
  memories:  { label:"Memories",  icon:<FaCameraRetro />, badge: null },
  games:     { label:"Games",     icon:<FaGamepad />,      badge: null },
  ideas:     { label:"Ideas",     icon:<FaLightbulb />,   badge: null },
};

const TAB_ACCENT = {
  dashboard: "#f43f5e",
  dates:     "#f43f5e",
  bucket:    "#8b5cf6",
  memories:  "#f97316",
  games:     "#10b981",
  ideas:     "#ec4899",
};

function JournalApp() {
  const { user } = useAuth();
  const [couple,     setCouple]     = useState(null);
  const [partner,    setPartner]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [tab,        setTab]        = useState("dashboard");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [dates,    setDates]    = useState({});
  const [buckets,  setBuckets]  = useState([]);
  const [memories, setMemories] = useState([]);
  const [scores,   setScores]   = useState({});
  const [ideaFavs, setIdeaFavs] = useState([]);
  const [ideaDone, setIdeaDone] = useState([]);

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
  const [game,           setGame]           = useState(null);
  const [gameBusy,       setGameBusy]       = useState(false);

  const coupleId = user?.coupleId;
  const turnKey  = coupleId ? `heartoz_turn_${coupleId}` : null;

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
        setGame(c.game || null);
        const storedTurn = turnKey ? localStorage.getItem(turnKey) : null;
        // If you refresh while waiting, we must not reset your turn to "my turn".
        // Use localStorage to remember whose turn was current on this device.
        setPlayerTurn(prev => prev || storedTurn || user?.name?.split(" ")[0] || "You");
      })
      .catch(console.error)
      .finally(() => { setLoading(false); setRefreshing(false); });
  };

  useEffect(() => { fetchCouple(); }, [coupleId]);

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

  const handleAddScore = async (pts) => {
    if (savingScore) return;
    setSavingScore(true);
    const uid = user.id;
    setScores(s => ({ ...s, [uid]: (s[uid]||0) + pts }));
    await API.addScore(coupleId, uid, pts).catch(console.error);
    setSavingScore(false);
    setPlayerTurn(p => {
      const next = p === p1Name ? p2Name : p1Name;
      if (turnKey) localStorage.setItem(turnKey, next);
      return next;
    });
  };

  const handleSubmitTruth = async (truthPrompt, text) => {
    if (gameBusy) return;
    setGameBusy(true);
    try { await API.submitTruth(coupleId, truthPrompt, text); }
    catch (e) { console.error(e); }
    finally {
      setGameBusy(false);
      fetchCouple();
    }
  };

  const handleSubmitDare = async (darePrompt, videoDataUri) => {
    if (gameBusy) return;
    setGameBusy(true);
    try { await API.submitDare(coupleId, darePrompt, videoDataUri); }
    catch (e) { console.error(e); }
    finally {
      setGameBusy(false);
      fetchCouple();
    }
  };

  const handleReviewGame = async (decision) => {
    if (gameBusy) return;
    setGameBusy(true);
    try { await API.reviewGame(coupleId, decision); }
    catch (e) { console.error(e); }
    finally {
      setGameBusy(false);
      fetchCouple();
    }
  };

  const totalDone      = Object.values(dates).filter(d => d.done).length;
  const progress       = Math.round((totalDone / 26) * 100);
  const bucketDone     = buckets.filter(b => b.done).length;
  const bucketProgress = buckets.length ? Math.round((bucketDone / buckets.length) * 100) : 0;
  const activeProgress = tab==="dates" ? progress : tab==="bucket" ? bucketProgress : tab==="memories" ? Math.min(100, memories.length*10) : 100;
  const showProgress   = tab === "dates" || tab === "bucket" || tab === "memories";

  const p1Name   = user?.name?.split(" ")[0]    || "You";
  const p2Name   = partner?.name?.split(" ")[0] || "Partner";
  const accent   = TAB_ACCENT[tab] || "#f43f5e";
  const tabMeta  = TAB_META[tab]   || TAB_META.dashboard;

  const badge =
    tab==="dates"     ? `${totalDone}/26`
    : tab==="bucket"  ? `${bucketDone}/${buckets.length}`
    : tab==="memories"? `${memories.length}`
    : tab==="ideas"   ? `${ideaDone.length} done`
    : null;

  if (loading) return <LoadingScreen message="Loading your journal…" />;

  return (
    <div className="min-h-screen bg-rose-50">
      <Raininghearts />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400;700&display=swap');
        *{ font-family:'Lato',sans-serif; box-sizing:border-box; }
        .df { font-family:'Playfair Display',serif; }
        .pf { transition:width 1s cubic-bezier(0.4,0,0.2,1); }
        @keyframes spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes tabSlide{ from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
        .tab-pill { animation: tabSlide 0.2s ease both; }
      `}</style>

      {/* ── Header ── */}
      <header style={{
        background:"white",
        position:"sticky", top:0, zIndex:30,
        boxShadow:"0 1px 0 #fce7f3, 0 4px 20px rgba(244,63,94,0.07)",
      }}>
        <div style={{padding:"0 16px"}}>

          {/* Single row */}
          <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", height:"54px", gap:"10px"}}>

            {/* Left — avatars + HeartOZ */}
            <div style={{display:"flex", alignItems:"center", gap:"9px", flexShrink:0}}>
              {/* Stacked avatars */}
              <div style={{position:"relative", display:"flex"}}>
                <div style={{
                  width:"30px", height:"30px", borderRadius:"50%",
                  border:"2px solid white",
                  background: user?.photo ? "none" : "linear-gradient(135deg,#f43f5e,#ec4899)",
                  boxShadow:"0 2px 6px rgba(244,63,94,0.25)",
                  overflow:"hidden", flexShrink:0,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:"12px", fontWeight:700, color:"white",
                }}>
                  {user?.photo ? <img src={user.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : p1Name[0]}
                </div>
                <div style={{
                  width:"30px", height:"30px", borderRadius:"50%",
                  border:"2px solid white",
                  background: partner?.photo ? "none" : "linear-gradient(135deg,#8b5cf6,#6366f1)",
                  overflow:"hidden", flexShrink:0, marginLeft:"-9px",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:"12px", fontWeight:700, color:"white",
                }}>
                  {partner?.photo ? <img src={partner.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : p2Name[0]}
                </div>
                <div style={{position:"absolute",bottom:"0",right:"0",width:"7px",height:"7px",borderRadius:"50%",background:"#10b981",border:"1.5px solid white"}}/>
              </div>

              {/* Brand */}
              <div>
                <div className="df" style={{fontSize:"16px", fontWeight:700, color:"#f43f5e", letterSpacing:"0.3px", lineHeight:1}}>HeartOZ</div>
                <div style={{fontSize:"10px", color:"#9ca3af", marginTop:"1px"}}>{p1Name} ♥ {p2Name}</div>
              </div>
            </div>

            {/* Centre — current tab label */}
            {/* <div className="tab-pill" key={tab} style={{
              display:"flex", alignItems:"center", gap:"5px",
              background:"#fff1f2", borderRadius:"10px",
              padding:"5px 10px",
              border:`1px solid ${accent}22`,
              flex:1, justifyContent:"center",
              maxWidth:"160px",
            }}>
              <span style={{color:accent, fontSize:"13px", display:"flex"}}>{tabMeta.icon}</span>
              <span style={{fontSize:"12px", fontWeight:700, color:"#1f2937", whiteSpace:"nowrap"}}>{tabMeta.label}</span>
              {badge && <span style={{fontSize:"11px",fontWeight:700,color:accent,marginLeft:"4px"}}>· {badge}</span>}
            </div> */}

            {/* Right — sync + menu */}
            <div style={{display:"flex", alignItems:"center", gap:"7px", flexShrink:0}}>
              <button onClick={() => fetchCouple(true)} disabled={refreshing} title="Sync" style={{
                width:"32px", height:"32px", borderRadius:"9px", border:"none", cursor:"pointer",
                background:"#fff1f2", color:"#f43f5e", fontSize:"12px",
                display:"flex", alignItems:"center", justifyContent:"center",
                transition:"all 0.18s",
                animation: refreshing ? "spin 0.8s linear infinite" : "none",
                opacity: refreshing ? 0.5 : 1,
              }}
              onMouseEnter={e=>e.currentTarget.style.background="#fce7f3"}
              onMouseLeave={e=>e.currentTarget.style.background="#fff1f2"}
              ><FaSync /></button>

              <button onClick={() => setDrawerOpen(true)} title="Menu" style={{
                width:"32px", height:"32px", borderRadius:"9px", border:"none", cursor:"pointer",
                background:`linear-gradient(135deg,${accent},${accent}cc)`,
                color:"white", fontSize:"13px",
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:`0 3px 10px ${accent}44`,
                transition:"all 0.2s",
              }}
              onMouseEnter={e=>e.currentTarget.style.boxShadow=`0 5px 14px ${accent}66`}
              onMouseLeave={e=>e.currentTarget.style.boxShadow=`0 3px 10px ${accent}44`}
              ><FaBars /></button>
            </div>
          </div>

          {/* Progress bar */}
          {showProgress && (
            <div style={{paddingBottom:"8px"}}>
              <div style={{width:"100%", height:"3px", borderRadius:"4px", background:`${accent}18`, overflow:"hidden"}}>
                <div className="pf" style={{height:"100%", borderRadius:"4px", background:`linear-gradient(90deg,${accent},${accent}88)`, width:`${activeProgress}%`}}/>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Nav Drawer */}
      <NavDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} tab={tab} setTab={setTab} />

        {/* progress */}
        <div className="tab-pill flex justify-center items-center m-4 " key={tab} style={{
              gap:"5px",
              background:"#fff1f2", borderRadius:"10px",
              padding:"5px 10px",
              border:`1px solid ${accent}22`,
              
            }}>
              <span style={{color:accent, fontSize:"13px", display:"flex"}}>{tabMeta.icon}</span>
              <span style={{fontSize:"12px", fontWeight:700, color:"#1f2937", whiteSpace:"nowrap"}}>{tabMeta.label}</span>
              {badge && <span style={{fontSize:"11px",fontWeight:700,color:accent,marginLeft:"4px"}}>· {badge}</span>}
            </div>
      {/* Tab content */}
      {tab === "dashboard" && <DashboardTab dates={dates} buckets={buckets} memories={memories} scores={scores} user={user} partner={partner} setTab={setTab} />}
      {tab === "dates"     && <DatesTab dates={dates} coupleId={coupleId} user={user} togglingDate={togglingDate} uploadingDate={uploadingDate} onToggle={handleDateToggle} onPhoto={handleDatePhoto} />}
      {tab === "bucket"    && <BucketTab buckets={buckets} coupleId={coupleId} savingBucket={savingBucket} togglingBucket={togglingBucket} deletingBucket={deletingBucket} savingNote={savingNote} onAdd={handleAddBucket} onToggle={handleToggleBucket} onDelete={handleDeleteBucket} onSaveNote={handleSaveNote} />}
      {tab === "memories"  && <MemoriesTab memories={memories} coupleId={coupleId} savingMemory={savingMemory} deletingMemory={deletingMemory} onAdd={handleAddMemory} onDelete={handleDeleteMemory} />}
      {tab === "games"     && (
        <GamesTab
          user={user}
          partner={partner}
          scores={scores}
          game={game}
          gameBusy={gameBusy}
          onSubmitTruth={handleSubmitTruth}
          onSubmitDare={handleSubmitDare}
          onReviewGame={handleReviewGame}
        />
      )}
      {tab === "ideas"     && <IdeasTab coupleId={coupleId} ideaFavs={ideaFavs} ideaDone={ideaDone} setIdeaFavs={setIdeaFavs} setIdeaDone={setIdeaDone} />}

    </div>
  );
}
export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen message="Loading…" />;

  return (
    <Routes>
      {/* Login page (optional direct access) */}
      <Route
        path="/login"
        element={!user ? <LoginPage /> : <Navigate to="/" />}
      />

      {/* About page */}
      <Route
        path="/about"
        element={<About onBack={() => window.history.back()} />}
      />
       <Route
        path="/privacy"
        element={<Privacy onBack={() => window.history.back()} />}
      />
       <Route
        path="/terms"
        element={<Terms onBack={() => window.history.back()} />}
      />

      {/* MAIN HOMEPAGE (FIXED) */}
      <Route
        path="/"
        element={
          !user ? (
            <LoginPage />   // ✅ show content instead of redirect
          ) : !user.coupleId ? (
            <PairPage onPaired={() => window.location.reload()} />
          ) : (
            <JournalApp />
          )
        }
      />

      {/* OPTIONAL: catch all routes */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}