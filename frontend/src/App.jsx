// client/src/App.jsx
import { useState, useRef, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import LoginPage   from "./pages/LoginPage";
import PairPage    from "./pages/PairPage";
import * as API    from "./lib/api";

// ── Constants ────────────────────────────────────────────────────────────────
const DATE_IDEAS = {
  A:{emoji:"🎨",idea:"Art Gallery Date",desc:"Explore local galleries or paint together at home"},
  B:{emoji:"🏖️",idea:"Beach Picnic",desc:"Pack snacks, a blanket, and watch the sunset together"},
  C:{emoji:"🍳",idea:"Cooking Class",desc:"Learn a new cuisine together and enjoy your creation"},
  D:{emoji:"💃",idea:"Dance Night",desc:"Take a salsa or swing dancing class together"},
  E:{emoji:"🌄",idea:"Evening Hike",desc:"Find a scenic trail and watch the stars come out"},
  F:{emoji:"🎡",idea:"Fairground Fun",desc:"Cotton candy, rides, and winning prizes for each other"},
  G:{emoji:"🍷",idea:"Garden Wine Tasting",desc:"Set up an outdoor tasting with different wines and cheeses"},
  H:{emoji:"🏠",idea:"Home Spa Day",desc:"DIY facemasks, candles, and a relaxing bath together"},
  I:{emoji:"🍦",idea:"Ice Cream Trail",desc:"Visit 3 different ice cream shops in one afternoon"},
  J:{emoji:"🎷",idea:"Jazz Bar Night",desc:"Dress up and enjoy live jazz with cocktails"},
  K:{emoji:"🪁",idea:"Kite Flying",desc:"Head to an open field and fly kites like kids again"},
  L:{emoji:"🌃",idea:"Late Night Drive",desc:"Cruise around with a playlist you both love"},
  M:{emoji:"🎬",idea:"Movie Marathon",desc:"Build a blanket fort and binge a film series together"},
  N:{emoji:"🌌",idea:"Night Stargazing",desc:"Lay out under the stars and find constellations"},
  O:{emoji:"🎭",idea:"Open Air Theatre",desc:"Watch a play under the sky with a picnic basket"},
  P:{emoji:"📸",idea:"Photography Walk",desc:"Explore your city with cameras and document the beauty"},
  Q:{emoji:"🎯",idea:"Quiz Night",desc:"Sign up for a local pub quiz or host one at home"},
  R:{emoji:"🚣",idea:"Rowboat on a Lake",desc:"Rent a rowboat and enjoy the peaceful water together"},
  S:{emoji:"🌅",idea:"Sunrise Breakfast",desc:"Wake up early and watch the sunrise with coffee"},
  T:{emoji:"🎾",idea:"Tennis Match",desc:"Play a friendly match then treat yourselves to smoothies"},
  U:{emoji:"☂️",idea:"Urban Exploration",desc:"Discover hidden murals and streets in your city"},
  V:{emoji:"🎻",idea:"Violin Concert",desc:"Attend a classical music evening together"},
  W:{emoji:"🍷",idea:"Winery Tour",desc:"Visit a local winery for a guided tasting experience"},
  X:{emoji:"❎",idea:"Xtra Challenge Day",desc:"Try an escape room or outdoor adventure challenge"},
  Y:{emoji:"🧘",idea:"Yoga in the Park",desc:"Join a morning outdoor yoga session together"},
  Z:{emoji:"🦁",idea:"Zoo Adventure",desc:"Spend a whole day exploring and feeding animals"},
};
const ALPHABET = Object.keys(DATE_IDEAS);
const BUCKET_CATEGORIES = [
  {id:"travel",label:"Travel",emoji:"✈️"},{id:"experience",label:"Experience",emoji:"🌟"},
  {id:"milestone",label:"Milestone",emoji:"💍"},{id:"adventure",label:"Adventure",emoji:"🧗"},
  {id:"food",label:"Food",emoji:"🍜"},{id:"creative",label:"Creative",emoji:"🎨"},
];
const MEMORY_TAGS = ["First Time","Anniversary","Vacation","Just Because","Milestone","Adventure","Cozy Night","Special Occasion"];
const TRUTHS = [
  "What's one thing about me that still makes you smile every day?","What was your first impression of me?",
  "What's your favourite memory of us together?","Is there a habit of mine that secretly annoys you?",
  "What's something you've always wanted to tell me but haven't?","What song makes you think of me?",
  "Describe our relationship in three words.","What's the most romantic thing I've done for you?",
  "What's one adventure you'd love for us to have?","What's the cheesiest thing you've done because of me?",
];
const DARES = [
  "Serenade your partner with a made-up song 🎵","Give your partner a 2-minute shoulder massage 💆",
  "Do your best impression of your partner 😂","Write a 3-line poem about your partner right now ✍️",
  "Name 5 things you love about your partner in 10 seconds ❤️","Do the silliest dance you know 💃",
  "Recreate your first date in 60 seconds 🎭","Speak in a funny accent for the next 2 minutes 🗣️",
];
const COUPLE_QUESTIONS = [
  {q:"What's your partner's favourite comfort food?",type:"text"},
  {q:"Where would your partner most love to travel?",type:"text"},
  {q:"What song reminds you most of your partner?",type:"text"},
  {q:"What's your partner's love language?",options:["Words of Affirmation","Acts of Service","Receiving Gifts","Quality Time","Physical Touch"],type:"choice"},
  {q:"How does your partner relax after a hard day?",type:"text"},
  {q:"What's your partner's go-to movie genre?",options:["Romance","Comedy","Thriller","Action","Horror","Documentary"],type:"choice"},
  {q:"What's your partner most proud of?",type:"text"},
  {q:"If your partner could have any superpower?",options:["Time Travel","Mind Reading","Flying","Invisibility","Super Strength","Healing Others"],type:"choice"},
];
const TABS = [{id:"dates",label:"Dates",emoji:"📅"},{id:"bucket",label:"Bucket",emoji:"🌟"},{id:"memories",label:"Memories",emoji:"📸"},{id:"games",label:"Games",emoji:"🎮"}];

// ── Journal App ──────────────────────────────────────────────────────────────
function JournalApp() {
  const { user, logout } = useAuth();
  const [couple,  setCouple]  = useState(null);
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("dates");

  // Dates state
  const [dates,    setDates]    = useState({});
  const [selected, setSelected] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const dateFileRef = useRef();

  // Bucket state
  const [buckets,        setBuckets]        = useState([]);
  const [showBucketForm, setShowBucketForm] = useState(false);
  const [bucketForm,     setBucketForm]     = useState({title:"",category:"travel",note:"",priority:"medium"});
  const [filterCat,      setFilterCat]      = useState("all");
  const [editingNote,    setEditingNote]    = useState(null);
  const [noteText,       setNoteText]       = useState("");

  // Memory state
  const [memories,       setMemories]       = useState([]);
  const [showMemoryForm, setShowMemoryForm] = useState(false);
  const [memoryForm,     setMemoryForm]     = useState({title:"",date:new Date().toISOString().split("T")[0],note:"",tag:"Just Because",mood:"🥰",imageUrl:null,imagePreview:null});
  const memImgRef = useRef();
  const [expandedMemory, setExpandedMemory] = useState(null);
  const [memoryLightbox, setMemoryLightbox] = useState(null);

  // Game state
  const [gameMode,    setGameMode]    = useState("menu");
  const [currentQ,    setCurrentQ]    = useState(null);
  const [answer,      setAnswer]      = useState("");
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [quizIdx,     setQuizIdx]     = useState(0);
  const [quizDone,    setQuizDone]    = useState(false);
  const [dareCard,    setDareCard]    = useState(null);
  const [scores,      setScores]      = useState({});
  const [playerTurn,  setPlayerTurn]  = useState(null);
  const [spinDeg,     setSpinDeg]     = useState(0);
  const [spinning,    setSpinning]    = useState(false);
  const [saving,      setSaving]      = useState(false);

  // Load couple data
  useEffect(() => {
    if (!user?.coupleId) { setLoading(false); return; }
    API.getCouple(user.coupleId)
      .then(res => {
        const { couple: c, partner: p } = res.data;
        setCouple(c);
        setPartner(p);
        // Hydrate local state from DB
        const d = {};
        if (c.dates) Object.entries(c.dates).forEach(([k,v]) => { d[k] = v; });
        setDates(d);
        setBuckets(c.buckets || []);
        setMemories(c.memories || []);
        setScores(c.scores || {});
        setPlayerTurn(user.name?.split(" ")[0] || "You");
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.coupleId]);

  const coupleId = user?.coupleId;
  const p1Name   = user?.name?.split(" ")[0]    || "You";
  const p2Name   = partner?.name?.split(" ")[0] || "Partner";

  // ── Date actions ────────────────────────────────────────────────────────
  const handleDateToggle = async (letter, currentDone) => {
    const payload = { done: !currentDone, doneAt: !currentDone ? new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : null };
    setDates(d => ({ ...d, [letter]: { ...(d[letter]||{}), ...payload } }));
    await API.updateDate(coupleId, letter, payload).catch(console.error);
  };

  const handleDatePhoto = (letter, file) => {
    if (!file?.type.startsWith("image/")) return;
    const r = new FileReader();
    r.onload = async e => {
      const photo  = e.target.result;
      const doneAt = new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
      setDates(d => ({ ...d, [letter]: { ...(d[letter]||{}), photo, doneAt } }));
      await API.updateDate(coupleId, letter, { photo, doneAt }).catch(console.error);
    };
    r.readAsDataURL(file);
  };

  // ── Bucket actions ──────────────────────────────────────────────────────
  const handleAddBucket = async () => {
    if (!bucketForm.title.trim()) return;
    const res = await API.addBucket(coupleId, bucketForm);
    setBuckets(b => [...b, res.data]);
    setBucketForm({title:"",category:"travel",note:"",priority:"medium"});
    setShowBucketForm(false);
  };
  const handleToggleBucket = async (id, done) => {
    setBuckets(b => b.map(x => x._id===id ? {...x,done:!done} : x));
    await API.updateBucket(coupleId, id, { done: !done }).catch(console.error);
  };
  const handleDeleteBucket = async (id) => {
    setBuckets(b => b.filter(x => x._id !== id));
    await API.deleteBucket(coupleId, id).catch(console.error);
  };
  const handleSaveNote = async (id) => {
    setBuckets(b => b.map(x => x._id===id ? {...x,note:noteText} : x));
    await API.updateBucket(coupleId, id, { note: noteText }).catch(console.error);
    setEditingNote(null);
  };

  // ── Memory actions ──────────────────────────────────────────────────────
  const handleMemoryImage = file => {
    if (!file?.type.startsWith("image/")) return;
    const r = new FileReader();
    r.onload = e => setMemoryForm(f => ({...f, imageUrl: e.target.result, imagePreview: e.target.result}));
    r.readAsDataURL(file);
  };
  const handleAddMemory = async () => {
    if (!memoryForm.title.trim()) return;
    const { imagePreview, ...payload } = memoryForm;
    const res = await API.addMemory(coupleId, payload);
    setMemories(m => [res.data, ...m]);
    setMemoryForm({title:"",date:new Date().toISOString().split("T")[0],note:"",tag:"Just Because",mood:"🥰",imageUrl:null,imagePreview:null});
    setShowMemoryForm(false);
  };
  const handleDeleteMemory = async (id) => {
    setMemories(m => m.filter(x => x._id !== id));
    await API.deleteMemory(coupleId, id).catch(console.error);
  };

  // ── Game actions ────────────────────────────────────────────────────────
  const spinWheel = () => {
    if (spinning) return;
    setSpinning(true);
    setSpinDeg(d => d + 1080 + Math.floor(Math.random()*360));
    setTimeout(() => {
      setSpinning(false);
      const pick = ["truth","dare","quiz","truth","dare"][Math.floor(Math.random()*5)];
      if (pick==="truth") { setGameMode("truth"); setCurrentQ(TRUTHS[Math.floor(Math.random()*TRUTHS.length)]); setAnswer(""); }
      else if (pick==="dare") { setGameMode("dare"); setDareCard(DARES[Math.floor(Math.random()*DARES.length)]); }
      else { setGameMode("quiz"); setQuizIdx(0); setQuizAnswers([]); setQuizDone(false); }
    }, 1400);
  };

  const handleAddScore = async (pts) => {
    const uid = user.id;
    const newScores = { ...scores, [uid]: (scores[uid]||0) + pts };
    setScores(newScores);
    await API.addScore(coupleId, uid, pts).catch(console.error);
    setPlayerTurn(p => p===p1Name ? p2Name : p1Name);
  };

  const totalDone      = Object.values(dates).filter(d=>d.done).length;
  const progress       = Math.round((totalDone/26)*100);
  const bucketDone     = buckets.filter(b=>b.done).length;
  const bucketProgress = buckets.length ? Math.round((bucketDone/buckets.length)*100) : 0;
  const activeProgress = tab==="dates"?progress:tab==="bucket"?bucketProgress:tab==="memories"?Math.min(100,memories.length*10):100;

  const filtered = (filterCat==="all"?buckets:buckets.filter(b=>b.category===filterCat))
    .sort((a,b)=>{if(a.done!==b.done)return a.done?1:-1;return({high:0,medium:1,low:2}[a.priority])-({high:0,medium:1,low:2}[b.priority]);});
  const sortedMemories = [...memories].sort((a,b)=>new Date(b.date)-new Date(a.date));
  const idea = selected ? DATE_IDEAS[selected] : null;

  if (loading) return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center">
      <div className="text-center"><div className="text-5xl animate-bounce">💕</div><p className="text-rose-400 mt-3 text-sm">Loading your journal…</p></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-rose-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400;700&display=swap');
        *{font-family:'Lato',sans-serif;box-sizing:border-box;}
        .df{font-family:'Playfair Display',serif;}
        .lc{transition:all 0.25s cubic-bezier(0.34,1.56,0.64,1);}
        .lc:hover{transform:translateY(-4px) scale(1.04);}
        .pf{transition:width 1s cubic-bezier(0.4,0,0.2,1);}
        .mo{animation:fadeIn 0.2s ease;}
        .mb{animation:slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1);}
        .si{animation:slideIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both;}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideUp{from{opacity:0;transform:translateY(40px) scale(0.96)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes slideIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .hf{animation:hf 3s ease-in-out infinite;}
        @keyframes hf{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        .spin-wheel{transition:transform 1.4s cubic-bezier(0.17,0.67,0.12,1);}
        .card-flip{animation:flipIn 0.5s cubic-bezier(0.34,1.56,0.64,1);}
        @keyframes flipIn{from{opacity:0;transform:rotateY(90deg) scale(0.8)}to{opacity:1;transform:rotateY(0) scale(1)}}
        .tl{position:relative;}
        .tl::before{content:'';position:absolute;left:20px;top:0;bottom:0;width:2px;background:linear-gradient(180deg,#fda4af,#fbcfe8,transparent);border-radius:2px;}
        textarea:focus,input:focus,select:focus{outline:none;}
      `}</style>

      {/* Lightboxes */}
      {(lightbox||memoryLightbox)&&(
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 mo" onClick={()=>{setLightbox(null);setMemoryLightbox(null);}}>
          <div className="relative max-w-lg w-full">
            <img src={lightbox?.src||memoryLightbox?.src} alt="" className="w-full rounded-2xl max-h-[80vh] object-contain shadow-2xl"/>
            <button className="absolute top-2 right-2 w-8 h-8 bg-white/20 hover:bg-white/40 rounded-full text-white" onClick={()=>{setLightbox(null);setMemoryLightbox(null);}}>✕</button>
          </div>
        </div>
      )}

      {/* Date Modal */}
      {selected&&idea&&(
        <div className="fixed inset-0 bg-black/50 z-40 flex items-end sm:items-center justify-center sm:p-4 mo" onClick={()=>setSelected(null)}>
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl mb overflow-hidden" onClick={e=>e.stopPropagation()}>
            <div className="relative h-48 bg-gradient-to-br from-rose-100 to-pink-50 flex items-center justify-center overflow-hidden">
              {dates[selected]?.photo
                ? <img src={dates[selected].photo} alt="" className="w-full h-full object-cover cursor-zoom-in" onClick={()=>setLightbox({src:dates[selected].photo})}/>
                : <div className="text-center"><div className="text-6xl hf">{idea.emoji}</div><p className="text-rose-300 text-xs mt-2 tracking-widest uppercase">No photo yet</p></div>
              }
              <button className="absolute top-3 right-3 w-8 h-8 bg-white/80 rounded-full text-gray-500 flex items-center justify-center" onClick={()=>setSelected(null)}>✕</button>
              {dates[selected]?.done && <div className="absolute top-3 left-3 bg-rose-500 text-white text-xs px-2 py-1 rounded-full font-semibold">✓ Done!</div>}
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-2"><span className="w-7 h-7 rounded-full bg-rose-100 text-rose-500 font-bold text-xs flex items-center justify-center df">{selected}</span><h2 className="df text-xl font-bold text-gray-800">{idea.idea}</h2></div>
              <p className="text-gray-500 text-sm">{idea.desc}</p>
              {dates[selected]?.doneAt && <p className="text-xs text-rose-400">📅 Done on {dates[selected].doneAt}</p>}
              <input ref={dateFileRef} type="file" accept="image/*" className="hidden" onChange={e=>handleDatePhoto(selected,e.target.files[0])}/>
              <button className="w-full border-2 border-dashed border-rose-200 hover:border-rose-400 text-rose-400 rounded-xl py-3 text-sm flex items-center justify-center gap-2 transition-all" onClick={()=>dateFileRef.current.click()}>
                📷 {dates[selected]?.photo ? "Change Photo" : "Upload Date Photo"}
              </button>
              <button onClick={()=>handleDateToggle(selected, dates[selected]?.done)} className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${dates[selected]?.done?"bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-400":"bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-md shadow-rose-200"}`}>
                {dates[selected]?.done ? "↩ Mark Not Done" : "💕 Mark as Done!"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-rose-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 pt-3 pb-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {user?.photo&&<img src={user.photo} alt="" className="w-7 h-7 rounded-full border-2 border-white shadow"/>}
                {partner?.photo?<img src={partner.photo} alt="" className="w-7 h-7 rounded-full border-2 border-white shadow"/>:<div className="w-7 h-7 rounded-full border-2 border-white shadow bg-rose-100 flex items-center justify-center text-xs">💕</div>}
              </div>
              <div><h1 className="df text-base font-bold text-gray-800 leading-tight">{p1Name} & {p2Name}</h1><p className="text-xs text-rose-400">Couple Journal</p></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="df text-xl font-bold text-rose-500">
                {tab==="dates"?<>{totalDone}<span className="text-gray-300 text-sm">/26</span></>:tab==="bucket"?<>{bucketDone}<span className="text-gray-300 text-sm">/{buckets.length}</span></>:tab==="memories"?<>{memories.length}<span className="text-gray-300 text-xs"> mem</span></>:<span>🎮</span>}
              </div>
              <button onClick={logout} title="Sign out" className="w-7 h-7 rounded-full bg-rose-50 hover:bg-rose-100 text-gray-400 text-xs flex items-center justify-center">↩</button>
            </div>
          </div>
          {tab!=="games"&&(
            <div className="mb-2"><div className="w-full h-2 bg-rose-50 rounded-full overflow-hidden border border-rose-100"><div className="h-full bg-gradient-to-r from-rose-400 via-pink-400 to-orange-300 rounded-full pf" style={{width:`${activeProgress}%`}}/></div></div>
          )}
          <div className="flex">
            {TABS.map(t=>(<button key={t.id} onClick={()=>setTab(t.id)} className={`flex-1 py-2 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1 border-b-2 transition-all ${tab===t.id?"text-rose-500 border-rose-400":"text-gray-400 border-transparent hover:text-rose-400"}`}><span>{t.emoji}</span><span className="hidden sm:inline">{t.label}</span></button>))}
          </div>
        </div>
      </div>

      {/* ── TAB 1: DATES ── */}
      {tab==="dates"&&(
        <div className="max-w-2xl mx-auto px-3 py-5">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
            {ALPHABET.map(letter=>{
              const item=DATE_IDEAS[letter]; const d=dates[letter]||{}; const done=d.done; const hasPhoto=!!d.photo;
              return(
                <div key={letter} className="lc cursor-pointer" onClick={()=>setSelected(letter)}>
                  <div className={`relative rounded-2xl overflow-hidden border-2 aspect-square flex flex-col items-center justify-center ${done?"border-rose-300 bg-gradient-to-br from-rose-400 to-pink-500 shadow-lg shadow-rose-200":"border-rose-100 bg-white hover:border-rose-200 hover:shadow-md"}`}>
                    {hasPhoto&&<div className="absolute inset-0"><img src={d.photo} alt="" className={`w-full h-full object-cover ${done?"opacity-30":"opacity-20"}`}/></div>}
                    <div className="relative z-10 text-center p-1">
                      <div className={`font-bold df text-xl leading-none ${done?"text-white":"text-gray-700"}`}>{letter}</div>
                      <div className="text-lg leading-none mt-0.5">{item.emoji}</div>
                      {done&&<div className="text-white text-xs mt-1">✓</div>}
                      {hasPhoto&&!done&&<div className="text-rose-400 text-xs">📸</div>}
                    </div>
                  </div>
                  <p className={`text-center text-[9px] sm:text-[10px] mt-1 leading-tight px-0.5 ${done?"text-rose-500 font-semibold":"text-gray-400"}`}>{item.idea.split(" ").slice(0,2).join(" ")}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[{label:"Dates Done",value:totalDone,emoji:"💕",g:"from-rose-400 to-pink-500"},{label:"Photos",value:Object.values(dates).filter(d=>d.photo).length,emoji:"📸",g:"from-orange-400 to-rose-400"},{label:"To Go",value:26-totalDone,emoji:"✨",g:"from-pink-400 to-purple-400"}].map(s=>(
              <div key={s.label} className="bg-white rounded-2xl p-3 border border-rose-100 text-center shadow-sm"><div className="text-xl">{s.emoji}</div><div className={`df text-2xl font-bold bg-gradient-to-br ${s.g} bg-clip-text text-transparent`}>{s.value}</div><div className="text-gray-400 text-xs">{s.label}</div></div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 2: BUCKET ── */}
      {tab==="bucket"&&(
        <div className="max-w-2xl mx-auto px-3 py-5 space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button onClick={()=>setFilterCat("all")} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${filterCat==="all"?"bg-rose-500 text-white border-rose-500":"bg-white text-gray-500 border-rose-100"}`}>All {buckets.length}</button>
            {BUCKET_CATEGORIES.map(cat=>{const cnt=buckets.filter(b=>b.category===cat.id).length;return(
              <button key={cat.id} onClick={()=>setFilterCat(cat.id)} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1 transition-all ${filterCat===cat.id?"bg-rose-500 text-white border-rose-500":"bg-white text-gray-500 border-rose-100"}`}>{cat.emoji} {cat.label} {cnt>0&&<span className={`${filterCat===cat.id?"bg-white/30":"bg-rose-100 text-rose-400"} px-1 rounded-full`}>{cnt}</span>}</button>
            );})}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[{label:"Total",value:buckets.length,emoji:"🌟"},{label:"Done",value:bucketDone,emoji:"✅"},{label:"Left",value:buckets.length-bucketDone,emoji:"💫"}].map(s=>(
              <div key={s.label} className="bg-white rounded-xl p-2.5 border border-rose-100 text-center shadow-sm"><div className="text-lg">{s.emoji}</div><div className="df text-xl font-bold text-rose-500">{s.value}</div><div className="text-gray-400 text-[10px]">{s.label}</div></div>
            ))}
          </div>
          <button onClick={()=>setShowBucketForm(p=>!p)} className="w-full py-3 rounded-2xl border-2 border-dashed border-rose-200 hover:border-rose-400 text-rose-400 text-sm font-semibold flex items-center justify-center gap-2 bg-white hover:bg-rose-50 transition-all">
            {showBucketForm?"✕ Cancel":"＋ Add a Dream Together"}
          </button>
          {showBucketForm&&(
            <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-4 space-y-3 mb">
              <h3 className="df text-lg font-bold text-gray-800">✨ New Dream</h3>
              <input type="text" placeholder="What's your dream?" value={bucketForm.title} onChange={e=>setBucketForm(f=>({...f,title:e.target.value}))} className="w-full border border-rose-100 rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:border-rose-300 bg-rose-50/30"/>
              <div className="grid grid-cols-2 gap-2">
                <select value={bucketForm.category} onChange={e=>setBucketForm(f=>({...f,category:e.target.value}))} className="border border-rose-100 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-rose-50/30">{BUCKET_CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}</select>
                <select value={bucketForm.priority} onChange={e=>setBucketForm(f=>({...f,priority:e.target.value}))} className="border border-rose-100 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-rose-50/30"><option value="high">🔥 High</option><option value="medium">⭐ Medium</option><option value="low">🌿 Low</option></select>
              </div>
              <textarea rows={2} placeholder="Note (optional)" value={bucketForm.note} onChange={e=>setBucketForm(f=>({...f,note:e.target.value}))} className="w-full border border-rose-100 rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder-gray-300 resize-none bg-rose-50/30"/>
              <button onClick={handleAddBucket} disabled={!bucketForm.title.trim()} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 text-white text-sm font-bold shadow-md disabled:opacity-40">💕 Save Dream</button>
            </div>
          )}
          <div className="space-y-2.5">
            {filtered.map(item=>{
              const cat=BUCKET_CATEGORIES.find(c=>c.id===item.category); const isEditing=editingNote===item._id;
              return(
                <div key={item._id} className={`si bg-white rounded-2xl border shadow-sm overflow-hidden ${item.done?"opacity-70":""} border-rose-100 hover:border-rose-200 hover:shadow-md`}>
                  <div className="p-4"><div className="flex items-start gap-3">
                    <button onClick={()=>handleToggleBucket(item._id,item.done)} className={`flex-shrink-0 mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${item.done?"bg-rose-400 border-rose-400 text-white":"border-rose-200 hover:border-rose-400"}`}>{item.done&&<span className="text-xs">✓</span>}</button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2"><p className={`text-sm font-semibold ${item.done?"line-through text-gray-400":"text-gray-800"}`}>{item.title}</p><button onClick={()=>handleDeleteBucket(item._id)} className="text-gray-200 hover:text-red-400 text-sm">✕</button></div>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-xs px-2 py-0.5 bg-rose-50 text-rose-400 rounded-full border border-rose-100">{cat?.emoji} {cat?.label}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${item.priority==="high"?"bg-red-50 text-red-400 border-red-100":item.priority==="medium"?"bg-amber-50 text-amber-500 border-amber-100":"bg-emerald-50 text-emerald-500 border-emerald-100"}`}>{item.priority==="high"?"🔥 High":item.priority==="medium"?"⭐ Medium":"🌿 Low"}</span>
                      </div>
                      {isEditing?(
                        <div className="mt-2 space-y-1.5">
                          <textarea rows={2} value={noteText} onChange={e=>setNoteText(e.target.value)} autoFocus className="w-full border border-rose-200 rounded-xl px-3 py-2 text-xs text-gray-600 resize-none bg-rose-50/40"/>
                          <div className="flex gap-2"><button onClick={()=>handleSaveNote(item._id)} className="px-3 py-1 bg-rose-400 text-white text-xs rounded-lg font-semibold">Save</button><button onClick={()=>setEditingNote(null)} className="px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-lg">Cancel</button></div>
                        </div>
                      ):(
                        <div className="mt-2">{item.note?(<div className="flex items-start gap-1.5 group cursor-pointer" onClick={()=>{setEditingNote(item._id);setNoteText(item.note);}}><span className="text-rose-300 text-xs">📝</span><p className="text-xs text-gray-400 italic flex-1 group-hover:text-rose-400">{item.note}</p></div>):(<button onClick={()=>{setEditingNote(item._id);setNoteText("");}} className="text-xs text-gray-300 hover:text-rose-400">＋ Add note</button>)}</div>
                      )}
                    </div>
                  </div></div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 3: MEMORIES ── */}
      {tab==="memories"&&(
        <div className="max-w-2xl mx-auto px-3 py-5 space-y-4">
          <input ref={memImgRef} type="file" accept="image/*" className="hidden" onChange={e=>handleMemoryImage(e.target.files[0])}/>
          <button onClick={()=>setShowMemoryForm(p=>!p)} className="w-full py-3 rounded-2xl border-2 border-dashed border-rose-200 hover:border-rose-400 text-rose-400 text-sm font-semibold flex items-center justify-center gap-2 bg-white hover:bg-rose-50 transition-all">
            {showMemoryForm?"✕ Cancel":"＋ Add a Memory"}
          </button>
          {showMemoryForm&&(
            <div className="bg-white rounded-2xl border border-rose-100 shadow-md p-4 space-y-3 mb">
              <h3 className="df text-lg font-bold text-gray-800">📸 Capture a Memory</h3>
              <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-dashed border-rose-100 cursor-pointer hover:border-rose-300 transition-all" style={{minHeight:"90px"}} onClick={()=>memImgRef.current.click()}>
                {memoryForm.imagePreview?(<div className="relative"><img src={memoryForm.imagePreview} alt="" className="w-full h-36 object-cover"/><button className="absolute top-2 right-2 w-7 h-7 bg-white/80 rounded-full text-xs text-gray-500 flex items-center justify-center" onClick={e=>{e.stopPropagation();setMemoryForm(f=>({...f,imageUrl:null,imagePreview:null}));}}>✕</button></div>):(<div className="flex flex-col items-center justify-center h-20 gap-1"><span className="text-3xl">🖼️</span><span className="text-xs text-rose-300">Tap to add a photo</span></div>)}
              </div>
              <input type="text" placeholder="Memory title..." value={memoryForm.title} onChange={e=>setMemoryForm(f=>({...f,title:e.target.value}))} className="w-full border border-rose-100 rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:border-rose-300 bg-rose-50/30"/>
              <div className="grid grid-cols-2 gap-2">
                <input type="date" value={memoryForm.date} onChange={e=>setMemoryForm(f=>({...f,date:e.target.value}))} className="border border-rose-100 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-rose-50/30 [color-scheme:light]"/>
                <select value={memoryForm.mood} onChange={e=>setMemoryForm(f=>({...f,mood:e.target.value}))} className="border border-rose-100 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-rose-50/30">{["🥰","😄","😂","🥺","😍","🤩","😊","💕","🌟","✨"].map(m=><option key={m} value={m}>{m}</option>)}</select>
              </div>
              <div className="flex flex-wrap gap-1.5">{MEMORY_TAGS.map(t=>(<button key={t} onClick={()=>setMemoryForm(f=>({...f,tag:t}))} className={`px-2.5 py-1 rounded-full text-xs border transition-all ${memoryForm.tag===t?"bg-rose-400 text-white border-rose-400":"bg-rose-50 text-rose-400 border-rose-100"}`}>{t}</button>))}</div>
              <textarea rows={3} placeholder="What made this moment special?" value={memoryForm.note} onChange={e=>setMemoryForm(f=>({...f,note:e.target.value}))} className="w-full border border-rose-100 rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder-gray-300 resize-none bg-rose-50/30"/>
              <button onClick={handleAddMemory} disabled={!memoryForm.title.trim()} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 text-white text-sm font-bold shadow-md disabled:opacity-40">💾 Save Memory</button>
            </div>
          )}
          <div className="grid grid-cols-3 gap-2">
            {[{label:"Memories",value:memories.length,emoji:"📸"},{label:"With Photos",value:memories.filter(m=>m.imageUrl).length,emoji:"🖼️"},{label:"This Year",value:memories.filter(m=>m.date?.startsWith(new Date().getFullYear())).length,emoji:"🌸"}].map(s=>(
              <div key={s.label} className="bg-white rounded-xl p-2.5 border border-rose-100 text-center shadow-sm"><div className="text-lg">{s.emoji}</div><div className="df text-xl font-bold text-rose-500">{s.value}</div><div className="text-gray-400 text-[10px]">{s.label}</div></div>
            ))}
          </div>
          {memories.length===0?(<div className="text-center py-16"><div className="text-5xl mb-3">📷</div><p className="df text-rose-300 italic">Your story starts here.</p></div>):(
            <div className="tl space-y-4 pl-2 pt-2">
              {sortedMemories.map((mem,i)=>(
                <div key={mem._id} className="si pl-10 relative" style={{animationDelay:`${i*60}ms`}}>
                  <div className="absolute left-3 top-4 w-5 h-5 rounded-full bg-white border-2 border-rose-300 flex items-center justify-center text-xs shadow-sm z-10">{mem.mood}</div>
                  <div className={`bg-white rounded-2xl border border-rose-100 shadow-sm overflow-hidden ${expandedMemory===mem._id?"border-rose-200 shadow-md":""}`}>
                    {mem.imageUrl&&(<div className="relative h-36 overflow-hidden cursor-zoom-in" onClick={()=>setMemoryLightbox({src:mem.imageUrl})}><img src={mem.imageUrl} alt={mem.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"/><div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"/></div>)}
                    <div className="p-3.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1"><div className="flex items-center gap-2 flex-wrap mb-1"><span className="text-xs px-2 py-0.5 bg-rose-50 text-rose-400 rounded-full border border-rose-100">{mem.tag}</span><span className="text-xs text-gray-400">📅 {mem.date ? new Date(mem.date).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : ""}</span></div><h3 className="df font-bold text-gray-800 text-sm">{mem.title}</h3></div>
                        <button onClick={()=>handleDeleteMemory(mem._id)} className="text-gray-200 hover:text-red-400 text-sm flex-shrink-0">✕</button>
                      </div>
                      {mem.note&&(<div className={`mt-2 overflow-hidden transition-all ${expandedMemory===mem._id?"max-h-40":"max-h-10"}`}><p className="text-xs text-gray-500 leading-relaxed italic">{mem.note}</p></div>)}
                      {mem.note&&mem.note.length>80&&(<button onClick={()=>setExpandedMemory(expandedMemory===mem._id?null:mem._id)} className="text-xs text-rose-400 mt-1">{expandedMemory===mem._id?"Show less ↑":"Read more ↓"}</button>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 4: GAMES ── */}
      {tab==="games"&&(
        <div className="max-w-2xl mx-auto px-3 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[{name:p1Name,photo:user?.photo,uid:user?.id},{name:p2Name,photo:partner?.photo,uid:partner?.id}].map((p,i)=>(
              <div key={i} className={`bg-white rounded-2xl border p-3 text-center shadow-sm ${playerTurn===p.name?"border-rose-300 shadow-rose-100":"border-rose-100"}`}>
                {p.photo?<img src={p.photo} alt="" className="w-10 h-10 rounded-full mx-auto mb-1 border-2 border-rose-200"/>:<div className="text-2xl mb-0.5">{i===0?"👸":"🤴"}</div>}
                <div className="text-xs text-gray-500 font-semibold">{p.name}</div>
                <div className="df text-2xl font-bold text-rose-500">{p.uid?scores[p.uid]||0:0}</div>
                <div className="text-xs text-gray-400">pts</div>
                {playerTurn===p.name&&<div className="text-xs text-rose-400 mt-1 font-semibold">← Your turn</div>}
              </div>
            ))}
          </div>

          {gameMode==="menu"&&(
            <div className="space-y-3">
              <div className="bg-white rounded-2xl border border-rose-100 p-5 text-center shadow-sm">
                <h3 className="df text-lg font-bold text-gray-800 mb-4">🎡 Spin the Wheel</h3>
                <div className="relative w-36 h-36 mx-auto mb-4">
                  <div className="spin-wheel w-full h-full rounded-full border-4 border-rose-200 shadow-lg" style={{transform:`rotate(${spinDeg}deg)`}}>
                    <div className="absolute inset-0 rounded-full" style={{background:"conic-gradient(#fda4af 0deg 72deg,#f9a8d4 72deg 144deg,#fecdd3 144deg 216deg,#fda4af 216deg 288deg,#f9a8d4 288deg 360deg)"}}/>
                    <div className="absolute inset-3 rounded-full bg-white flex items-center justify-center shadow-inner"><span className="text-2xl">{spinning?"🌀":"💕"}</span></div>
                  </div>
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-xl">▼</div>
                </div>
                <button onClick={spinWheel} disabled={spinning} className="px-8 py-3 rounded-2xl bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold text-sm shadow-lg disabled:opacity-60">{spinning?"Spinning…":"🎰 Spin!"}</button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[{mode:"truth",emoji:"💬",label:"Truth",color:"from-rose-400 to-pink-500"},{mode:"dare",emoji:"🔥",label:"Dare",color:"from-orange-400 to-rose-400"},{mode:"quiz",emoji:"🧠",label:"Quiz",color:"from-pink-400 to-purple-400"}].map(g=>(
                  <button key={g.mode} onClick={()=>{setGameMode(g.mode);if(g.mode==="truth"){setCurrentQ(TRUTHS[Math.floor(Math.random()*TRUTHS.length)]);setAnswer("");}if(g.mode==="dare"){setDareCard(DARES[Math.floor(Math.random()*DARES.length)]);}if(g.mode==="quiz"){setQuizIdx(0);setQuizAnswers([]);setQuizDone(false);}}} className={`bg-gradient-to-br ${g.color} text-white rounded-2xl p-3 text-center shadow-md hover:scale-105 transition-all`}>
                    <div className="text-2xl mb-1">{g.emoji}</div><div className="font-bold text-sm">{g.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {gameMode==="truth"&&(<div className="space-y-3">
            <div className="bg-gradient-to-br from-rose-400 to-pink-500 rounded-2xl p-5 text-white text-center shadow-lg card-flip">
              <div className="text-4xl mb-3">💬</div><p className="text-xs uppercase tracking-widest opacity-80 mb-2">Truth — {playerTurn}</p><h3 className="df text-lg font-bold leading-snug">{currentQ}</h3>
            </div>
            <textarea rows={3} value={answer} onChange={e=>setAnswer(e.target.value)} placeholder="Your honest answer…" className="w-full border border-rose-200 rounded-2xl px-4 py-3 text-sm text-gray-700 placeholder-gray-300 resize-none bg-white focus:border-rose-400"/>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={()=>{setCurrentQ(TRUTHS[Math.floor(Math.random()*TRUTHS.length)]);setAnswer("");}} className="py-2.5 rounded-xl bg-white border border-rose-200 text-rose-400 text-sm font-semibold hover:bg-rose-50">🔄 New Q</button>
              <button onClick={()=>{handleAddScore(10);setGameMode("menu");}} disabled={!answer.trim()} className="py-2.5 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 text-white text-sm font-bold disabled:opacity-40 shadow-md">✅ Done! +10pts</button>
            </div>
            <button onClick={()=>setGameMode("menu")} className="w-full py-2 text-xs text-gray-400">← Back</button>
          </div>)}

          {gameMode==="dare"&&(<div className="space-y-3">
            <div className="bg-gradient-to-br from-orange-400 to-rose-500 rounded-2xl p-5 text-white text-center shadow-lg card-flip">
              <div className="text-4xl mb-3">🔥</div><p className="text-xs uppercase tracking-widest opacity-80 mb-2">Dare — {playerTurn}</p><h3 className="df text-lg font-bold leading-snug">{dareCard}</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={()=>setDareCard(DARES[Math.floor(Math.random()*DARES.length)])} className="py-2.5 rounded-xl bg-white border border-rose-200 text-rose-400 text-sm font-semibold">🔄 New Dare</button>
              <button onClick={()=>{handleAddScore(20);setGameMode("menu");}} className="py-2.5 rounded-xl bg-gradient-to-r from-orange-400 to-rose-500 text-white text-sm font-bold shadow-md">🏆 Done! +20pts</button>
            </div>
            <button onClick={()=>setGameMode("menu")} className="w-full py-2 text-xs text-gray-400">← Skip & Back</button>
          </div>)}

          {gameMode==="quiz"&&!quizDone&&(<div className="space-y-3">
            <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-2"><span className="text-xs text-gray-400">Q {quizIdx+1}/{COUPLE_QUESTIONS.length}</span><span className="text-xs text-rose-400 font-semibold">{playerTurn}'s turn 🧠</span></div>
              <div className="w-full h-1.5 bg-rose-50 rounded-full mb-4 overflow-hidden"><div className="h-full bg-gradient-to-r from-rose-400 to-pink-400 rounded-full pf" style={{width:`${(quizIdx/COUPLE_QUESTIONS.length)*100}%`}}/></div>
              <h3 className="df text-base font-bold text-gray-800 mb-4">{COUPLE_QUESTIONS[quizIdx].q}</h3>
              {COUPLE_QUESTIONS[quizIdx].type==="choice"?(
                <div className="grid grid-cols-2 gap-2">{COUPLE_QUESTIONS[quizIdx].options.map(opt=>(<button key={opt} onClick={()=>{setQuizAnswers(a=>[...a,{q:COUPLE_QUESTIONS[quizIdx].q,a:opt}]);if(quizIdx+1<COUPLE_QUESTIONS.length)setQuizIdx(i=>i+1);else setQuizDone(true);}} className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-100 text-sm text-gray-700 text-left">{opt}</button>))}</div>
              ):(
                <div className="space-y-2">
                  <input type="text" placeholder="Your answer…" value={answer} onChange={e=>setAnswer(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&answer.trim()){setQuizAnswers(a=>[...a,{q:COUPLE_QUESTIONS[quizIdx].q,a:answer}]);setAnswer("");if(quizIdx+1<COUPLE_QUESTIONS.length)setQuizIdx(i=>i+1);else setQuizDone(true);}}} className="w-full border border-rose-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:border-rose-400 bg-rose-50/30"/>
                  <button onClick={()=>{if(!answer.trim())return;setQuizAnswers(a=>[...a,{q:COUPLE_QUESTIONS[quizIdx].q,a:answer}]);setAnswer("");if(quizIdx+1<COUPLE_QUESTIONS.length)setQuizIdx(i=>i+1);else setQuizDone(true);}} disabled={!answer.trim()} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 text-white text-sm font-bold disabled:opacity-40">Next →</button>
                </div>
              )}
            </div>
            <button onClick={()=>setGameMode("menu")} className="w-full py-2 text-xs text-gray-400">← Back</button>
          </div>)}

          {gameMode==="quiz"&&quizDone&&(<div className="space-y-3">
            <div className="bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl p-5 text-white text-center shadow-lg mb">
              <div className="text-4xl mb-2">🎉</div><h3 className="df text-xl font-bold">Quiz Complete!</h3>
              <button onClick={()=>{handleAddScore(30);setGameMode("menu");}} className="mt-3 px-5 py-2 bg-white/20 hover:bg-white/30 rounded-full text-sm font-semibold">+30pts · Switch Turns 🔄</button>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto">{quizAnswers.map((qa,i)=>(<div key={i} className="bg-white rounded-xl border border-rose-100 p-3 shadow-sm"><p className="text-xs text-gray-400 mb-1">{qa.q}</p><p className="text-sm font-semibold text-rose-500">"{qa.a}"</p></div>))}</div>
            <button onClick={()=>setGameMode("menu")} className="w-full py-3 rounded-xl bg-white border border-rose-200 text-rose-400 text-sm font-semibold">← Back to Menu</button>
          </div>)}
          <p className="text-center text-xs text-rose-200 mt-4 df italic">Play together, laugh together 💗</p>
        </div>
      )}
    </div>
  );
}

// ── Root Router ──────────────────────────────────────────────────────────────
export default function App() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center">
      <div className="text-center"><div className="text-5xl animate-bounce">💕</div><p className="text-rose-400 mt-3 text-sm">Loading…</p></div>
    </div>
  );

  return (
    <Routes>
      {/* <Route path="/auth/callback" element={<AuthCallback />} /> */}
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
      <Route path="/" element={
        !user ? <Navigate to="/login" /> :
        !user.coupleId ? <PairPage onPaired={() => window.location.reload()} /> :
        <JournalApp />
      } />
    </Routes>
  );
}