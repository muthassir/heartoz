// // client/src/pages/IdeasTab.jsx
// import { useState } from "react";
// import { IDEAS } from "../lib/constants";
// import * as API from "../lib/api";

// const CATEGORIES = [
//   { id:"romantic",  label:"Romantic",  emoji:"💕", color:"#f43f5e", light:"#fff1f2", grad:"linear-gradient(135deg,#f43f5e,#fb7185)" },
//   { id:"adventure", label:"Adventure", emoji:"🧗", color:"#f97316", light:"#fff7ed", grad:"linear-gradient(135deg,#f97316,#fb923c)" },
//   { id:"cozy",      label:"Cozy",      emoji:"🛋️", color:"#8b5cf6", light:"#f5f3ff", grad:"linear-gradient(135deg,#8b5cf6,#a78bfa)" },
//   { id:"food",      label:"Food",      emoji:"🍜", color:"#d97706", light:"#fffbeb", grad:"linear-gradient(135deg,#d97706,#f59e0b)" },
//   { id:"outdoor",   label:"Outdoor",   emoji:"🌿", color:"#10b981", light:"#f0fdf4", grad:"linear-gradient(135deg,#10b981,#34d399)" },
//   { id:"surprise",  label:"Surprise",  emoji:"✨", color:"#ec4899", light:"#fdf4ff", grad:"linear-gradient(135deg,#ec4899,#f472b6)" },
// ];

// const allIdeas = Object.values(IDEAS).flat();

// export default function IdeasTab({ coupleId, ideaFavs, ideaDone, setIdeaFavs, setIdeaDone }) {
//   const [activeCat, setActiveCat] = useState("romantic");
//   const [view,      setView]      = useState("browse");
//   const [justDone,  setJustDone]  = useState(null);
//   const [togglingFav,  setTogglingFav]  = useState(null);
//   const [togglingDone, setTogglingDone] = useState(null);

//   const favourites   = new Set(ideaFavs);
//   const doneIds      = new Set(ideaDone);
//   const cat          = CATEGORIES.find(c => c.id === activeCat);
//   const ideas        = IDEAS[activeCat] || [];
//   const favList      = allIdeas.filter(i => favourites.has(i.id));
//   const displayIdeas = view === "saved" ? favList : ideas;

//   const toggleFav = async (ideaId) => {
//     if (togglingFav) return;
//     setTogglingFav(ideaId);
//     // Optimistic update
//     setIdeaFavs(prev => prev.includes(ideaId) ? prev.filter(x => x !== ideaId) : [...prev, ideaId]);
//     try { const res = await API.toggleIdeaFav(coupleId, ideaId); setIdeaFavs(res.data.ideaFavs); }
//     catch { /* revert on fail — refetch would fix it */ }
//     setTogglingFav(null);
//   };

//   const markDone = async (idea) => {
//     if (doneIds.has(idea.id) || togglingDone) return;
//     setTogglingDone(idea.id);
//     // Optimistic update
//     setIdeaDone(prev => [...prev, idea.id]);
//     setJustDone(idea.title);
//     setTimeout(() => setJustDone(null), 2200);
//     try { const res = await API.toggleIdeaDone(coupleId, idea.id); setIdeaDone(res.data.ideaDone); }
//     catch { setIdeaDone(prev => prev.filter(x => x !== idea.id)); }
//     setTogglingDone(null);
//   };

//   const findIdeaCat = (idea) =>
//     CATEGORIES.find(c => IDEAS[c.id]?.some(i => i.id === idea.id)) || cat;

//   return (
//     <div className="max-w-2xl mx-auto px-3 py-4">
//       <style>{`
//         @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
//         @keyframes toast   { 0%{opacity:0;transform:translateY(16px)} 15%{opacity:1;transform:translateY(0)} 80%{opacity:1} 100%{opacity:0} }
//         @keyframes heartPop{ 0%{transform:scale(1)} 50%{transform:scale(1.4)} 100%{transform:scale(1)} }
//         .idea-card{ animation:fadeUp 0.38s cubic-bezier(0.34,1.4,0.64,1) both; transition:transform 0.2s,box-shadow 0.2s; }
//         .idea-card:hover{ transform:translateY(-2px); }
//         .cat-pill{ transition:all 0.18s; cursor:pointer; }
//         .cat-pill:hover{ transform:scale(1.05); }
//         .fav-btn:active{ animation:heartPop 0.3s ease; }
//       `}</style>

//       {/* Stats */}
//       <div className="grid grid-cols-3 gap-2 mb-4">
//         {[
//           { emoji:"💡", value:allIdeas.length,  label:"Total Ideas" },
//           { emoji:"❤️", value:favourites.size,   label:"Saved"       },
//           { emoji:"✅", value:doneIds.size,       label:"Done"        },
//         ].map(s => (
//           <div key={s.label} className="bg-white rounded-xl p-2.5 border border-rose-100 text-center shadow-sm">
//             <div className="text-lg">{s.emoji}</div>
//             <div style={{fontFamily:"'Playfair Display',serif"}} className="text-xl font-bold text-rose-500">{s.value}</div>
//             <div className="text-gray-400 text-[10px]">{s.label}</div>
//           </div>
//         ))}
//       </div>

//       {/* Browse / Saved toggle */}
//       <div style={{display:"flex",background:"#f9fafb",borderRadius:"14px",padding:"3px",marginBottom:"14px"}}>
//         {[{id:"browse",l:"🗂️ Browse All"},{id:"saved",l:`❤️ Saved${favourites.size>0?` (${favourites.size})`:""}`}].map(v => (
//           <button key={v.id} onClick={() => setView(v.id)} style={{
//             flex:1,padding:"9px",borderRadius:"11px",border:"none",cursor:"pointer",
//             fontSize:"13px",fontWeight:700,transition:"all 0.18s",
//             background:view===v.id?"white":"transparent",
//             color:view===v.id?"#f43f5e":"#9ca3af",
//             boxShadow:view===v.id?"0 1px 8px rgba(0,0,0,0.08)":"none",
//           }}>{v.l}</button>
//         ))}
//       </div>

//       {/* Category chips */}
//       {view === "browse" && (
//         <div style={{display:"flex",gap:"7px",overflowX:"auto",paddingBottom:"10px",marginBottom:"4px"}}>
//           {CATEGORIES.map(c => (
//             <button key={c.id} className="cat-pill" onClick={() => setActiveCat(c.id)} style={{
//               flexShrink:0,padding:"7px 16px",borderRadius:"20px",border:"none",
//               fontSize:"12px",fontWeight:700,
//               background:activeCat===c.id?c.grad:c.light,
//               color:activeCat===c.id?"white":c.color,
//               boxShadow:activeCat===c.id?`0 3px 12px ${c.color}44`:"none",
//             }}>{c.emoji} {c.label}</button>
//           ))}
//         </div>
//       )}

//       {/* Category banner */}
//       {view === "browse" && (
//         <div style={{
//           padding:"14px 18px",borderRadius:"18px",
//           background:cat.grad,color:"white",
//           display:"flex",alignItems:"center",gap:"14px",
//           boxShadow:`0 6px 24px ${cat.color}44`,
//           marginBottom:"14px",
//         }}>
//           <span style={{fontSize:"34px"}}>{cat.emoji}</span>
//           <div>
//             <div style={{fontFamily:"'Playfair Display',serif",fontSize:"18px",fontWeight:700}}>{cat.label} Dates</div>
//             <div style={{fontSize:"12px",opacity:0.85}}>{ideas.length} ideas · ❤️ save · ✅ mark done</div>
//           </div>
//         </div>
//       )}

//       {/* Saved empty state */}
//       {view === "saved" && favList.length === 0 && (
//         <div className="text-center py-14">
//           <div className="text-5xl mb-3">💔</div>
//           <p className="italic text-rose-300 mb-1" style={{fontFamily:"'Playfair Display',serif"}}>No saved ideas yet</p>
//           <p className="text-gray-400 text-sm">Browse ideas and tap ❤️ to save them here</p>
//         </div>
//       )}

//       {/* Ideas list */}
//       <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
//         {displayIdeas.map((idea, idx) => {
//           const isFav   = favourites.has(idea.id);
//           const isDone  = doneIds.has(idea.id);
//           const ideaCat = findIdeaCat(idea);
//           return (
//             <div key={idea.id} className="idea-card" style={{
//               background:isDone?"#fafafa":"white",
//               borderRadius:"16px",overflow:"hidden",
//               border:`1px solid ${isDone?"#e5e7eb":ideaCat.light}`,
//               boxShadow:isDone?"none":`0 3px 16px ${ideaCat.color}0d`,
//               opacity:isDone?0.62:1,
//               animationDelay:`${idx*40}ms`,
//             }}>
//               <div style={{height:"3px",background:isDone?"#e5e7eb":ideaCat.grad}}/>
//               <div style={{padding:"13px 14px"}}>
//                 <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"8px",marginBottom:"6px"}}>
//                   <div style={{fontWeight:700,fontSize:"14px",color:isDone?"#9ca3af":"#1f2937",textDecoration:isDone?"line-through":"none",flex:1,lineHeight:"1.35"}}>
//                     {idea.title}
//                   </div>
//                   <div style={{display:"flex",gap:"6px",flexShrink:0}}>
//                     <button className="fav-btn" onClick={() => toggleFav(idea.id)} disabled={togglingFav===idea.id} style={{
//                       width:"32px",height:"32px",borderRadius:"50%",border:"none",cursor:"pointer",
//                       background:isFav?"#fff1f2":"#f9fafb",fontSize:"16px",
//                       display:"flex",alignItems:"center",justifyContent:"center",
//                       transition:"all 0.2s",
//                       boxShadow:isFav?"0 2px 8px rgba(244,63,94,0.2)":"none",
//                       transform:isFav?"scale(1.1)":"scale(1)",
//                       opacity:togglingFav===idea.id?0.5:1,
//                     }}>{isFav?"❤️":"🤍"}</button>
//                     <button onClick={() => markDone(idea)} disabled={isDone||togglingDone===idea.id} style={{
//                       width:"32px",height:"32px",borderRadius:"50%",border:"none",
//                       cursor:isDone?"default":"pointer",
//                       background:isDone?"#f0fdf4":"#f9fafb",fontSize:"16px",
//                       display:"flex",alignItems:"center",justifyContent:"center",
//                       transition:"all 0.2s",
//                       boxShadow:isDone?"0 2px 8px rgba(16,185,129,0.15)":"none",
//                       opacity:togglingDone===idea.id?0.5:1,
//                     }}>{isDone?"✅":"☑️"}</button>
//                   </div>
//                 </div>
//                 <div style={{fontSize:"12px",color:"#6b7280",lineHeight:"1.65"}}>{idea.desc}</div>
//                 {view === "saved" && (
//                   <div style={{marginTop:"8px"}}>
//                     <span style={{fontSize:"10px",padding:"3px 10px",borderRadius:"10px",background:ideaCat.light,color:ideaCat.color,fontWeight:700}}>
//                       {ideaCat.emoji} {ideaCat.label}
//                     </span>
//                   </div>
//                 )}
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Toast */}
//       {justDone && (
//         <div style={{
//           position:"fixed",bottom:"28px",left:"50%",transform:"translateX(-50%)",
//           background:"#1f2937",color:"white",borderRadius:"14px",
//           padding:"11px 20px",fontSize:"13px",fontWeight:600,
//           display:"flex",alignItems:"center",gap:"8px",
//           boxShadow:"0 8px 24px rgba(0,0,0,0.2)",zIndex:300,
//           animation:"toast 2.2s ease forwards",whiteSpace:"nowrap",
//         }}>
//           ✅ Marked as done!
//         </div>
//       )}
//     </div>
//   );
// }










// frontend/src/pages/IdeasTab.jsx
import { useState } from "react";
import { IDEAS } from "../lib/constants";
import * as API from "../lib/api";
import { FaHeart, FaRegHeart, FaCheck, FaBookmark, FaRegBookmark, FaSearch, FaTimes } from "react-icons/fa";

const CATEGORIES = [
  { id:"romantic",  label:"Romantic",  emoji:"💕", color:"#f43f5e", light:"#fff1f2", border:"#fce7f3", grad:"linear-gradient(135deg,#f43f5e,#fb7185)" },
  { id:"adventure", label:"Adventure", emoji:"🧗", color:"#f97316", light:"#fff7ed", border:"#fed7aa", grad:"linear-gradient(135deg,#f97316,#fb923c)" },
  { id:"cozy",      label:"Cozy",      emoji:"🛋️", color:"#8b5cf6", light:"#f5f3ff", border:"#ede9fe", grad:"linear-gradient(135deg,#8b5cf6,#a78bfa)" },
  { id:"food",      label:"Food",      emoji:"🍜", color:"#d97706", light:"#fffbeb", border:"#fde68a", grad:"linear-gradient(135deg,#d97706,#f59e0b)" },
  { id:"outdoor",   label:"Outdoor",   emoji:"🌿", color:"#10b981", light:"#f0fdf4", border:"#d1fae5", grad:"linear-gradient(135deg,#10b981,#34d399)" },
  { id:"surprise",  label:"Surprise",  emoji:"✨", color:"#ec4899", light:"#fdf4ff", border:"#f9a8d4", grad:"linear-gradient(135deg,#ec4899,#f472b6)" },
];

const allIdeas = Object.values(IDEAS).flat();

const findIdeaCat = (idea) =>
  CATEGORIES.find(c => IDEAS[c.id]?.some(i => i.id === idea.id)) || CATEGORIES[0];

export default function IdeasTab({ coupleId, ideaFavs, ideaDone, setIdeaFavs, setIdeaDone }) {
  const [activeCat,    setActiveCat]    = useState("romantic");
  const [view,         setView]         = useState("browse"); // "browse" | "saved"
  const [search,       setSearch]       = useState("");
  const [showSearch,   setShowSearch]   = useState(false);
  const [toast,        setToast]        = useState(null);
  const [togglingFav,  setTogglingFav]  = useState(null);
  const [togglingDone, setTogglingDone] = useState(null);

  const favourites   = new Set(ideaFavs);
  const doneIds      = new Set(ideaDone);
  const cat          = CATEGORIES.find(c => c.id === activeCat);
  const browseIdeas  = IDEAS[activeCat] || [];
  const favList      = allIdeas.filter(i => favourites.has(i.id));

  const searchResults = search.trim().length > 1
    ? allIdeas.filter(i => i.title.toLowerCase().includes(search.toLowerCase()) || i.desc?.toLowerCase().includes(search.toLowerCase()))
    : null;

  const displayIdeas = searchResults || (view === "saved" ? favList : browseIdeas);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const toggleFav = async (ideaId) => {
    if (togglingFav) return;
    const wasFav = favourites.has(ideaId);
    setTogglingFav(ideaId);
    setIdeaFavs(prev => wasFav ? prev.filter(x => x !== ideaId) : [...prev, ideaId]);
    showToast(wasFav ? "Removed from saved" : "💕 Saved!");
    try {
      const res = await API.toggleIdeaFav(coupleId, ideaId);
      setIdeaFavs(res.data.ideaFavs);
    } catch { /* optimistic already applied */ }
    setTogglingFav(null);
  };

  const toggleDone = async (idea) => {
    if (togglingDone) return;
    const wasDone = doneIds.has(idea.id);
    setTogglingDone(idea.id);
    setIdeaDone(prev => wasDone ? prev.filter(x => x !== idea.id) : [...prev, idea.id]);
    showToast(wasDone ? "↩ Marked as undone" : "✅ Marked as done!");
    try {
      const res = await API.toggleIdeaDone(coupleId, idea.id);
      setIdeaDone(res.data.ideaDone);
    } catch {
      setIdeaDone(prev => wasDone ? [...prev, idea.id] : prev.filter(x => x !== idea.id));
    }
    setTogglingDone(null);
  };

  return (
    <div style={{ maxWidth:"480px", margin:"0 auto", padding:"12px 12px 80px" }}>
      <style>{`
        @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes toast   { 0%{opacity:0;transform:translateX(-50%) translateY(12px)} 10%{opacity:1;transform:translateX(-50%) translateY(0)} 80%{opacity:1} 100%{opacity:0;transform:translateX(-50%) translateY(-4px)} }
        @keyframes heartPop{ 0%{transform:scale(1)} 40%{transform:scale(1.5)} 100%{transform:scale(1)} }
        .ic { animation: fadeUp 0.35s cubic-bezier(0.34,1.3,0.64,1) both; }
        .hpop { animation: heartPop 0.3s ease; }
        .tap { transition: transform 0.15s; cursor:pointer; }
        .tap:active { transform:scale(0.96); }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"14px" }}>
        <div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"22px", fontWeight:700, color:"#1f2937", lineHeight:1 }}>Date Ideas</div>
          <div style={{ fontSize:"11px", color:"#9ca3af", marginTop:"3px" }}>Save your favourites 💕</div>
        </div>
        <button
          onClick={() => { setShowSearch(v => !v); setSearch(""); }}
          style={{ width:"38px", height:"38px", borderRadius:"50%", border:"none", background: showSearch ? "#f43f5e" : "#fff1f2", color: showSearch ? "white" : "#f43f5e", fontSize:"14px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow: showSearch ? "0 3px 10px rgba(244,63,94,0.3)" : "none" }}
        >
          {showSearch ? <FaTimes/> : <FaSearch/>}
        </button>
      </div>

      {/* ── Search bar ── */}
      {showSearch && (
        <div style={{ marginBottom:"12px", position:"relative" }}>
          <FaSearch style={{ position:"absolute", left:"14px", top:"50%", transform:"translateY(-50%)", color:"#d1d5db", fontSize:"12px" }}/>
          <input
            autoFocus
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search ideas…"
            style={{ width:"100%", padding:"12px 14px 12px 36px", borderRadius:"16px", border:"1.5px solid #fce7f3", outline:"none", fontSize:"13px", color:"#374151", background:"white", fontFamily:"inherit" }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#9ca3af", fontSize:"12px" }}>
              <FaTimes/>
            </button>
          )}
        </div>
      )}

      {/* ── Stats ── */}
      {!searchResults && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"8px", marginBottom:"14px" }}>
          {[
            { emoji:"💡", value:allIdeas.length, label:"Total",  color:"#f43f5e", bg:"#fff1f2", border:"#fce7f3" },
            { emoji:"💕", value:favourites.size,  label:"Saved",  color:"#ec4899", bg:"#fdf4ff", border:"#f9a8d4", onClick:() => setView("saved") },
            { emoji:"✅", value:doneIds.size,      label:"Done",   color:"#10b981", bg:"#f0fdf4", border:"#d1fae5" },
          ].map(s => (
            <div key={s.label} onClick={s.onClick} style={{
              background:s.bg, borderRadius:"16px", padding:"12px 8px",
              border:`1.5px solid ${s.border}`, textAlign:"center",
              cursor: s.onClick ? "pointer" : "default",
              transition:"transform 0.15s",
            }}
              onTouchStart={e => s.onClick && (e.currentTarget.style.transform = "scale(0.96)")}
              onTouchEnd={e => e.currentTarget.style.transform = "scale(1)"}
            >
              <div style={{ fontSize:"18px", marginBottom:"4px" }}>{s.emoji}</div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"22px", fontWeight:700, color:s.color, lineHeight:1 }}>{s.value}</div>
              <div style={{ fontSize:"10px", color:"#9ca3af", marginTop:"2px", fontWeight:600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Browse / Saved tabs ── */}
      {!searchResults && (
        <div style={{ display:"flex", background:"#f9fafb", borderRadius:"16px", padding:"3px", marginBottom:"14px" }}>
          {[
            { id:"browse", label:"🗂️ Browse", count:null },
            { id:"saved",  label:"💕 Saved",  count:favourites.size || null },
          ].map(v => (
            <button key={v.id} onClick={() => setView(v.id)} style={{
              flex:1, padding:"10px", borderRadius:"13px", border:"none", cursor:"pointer",
              fontSize:"12px", fontWeight:700, transition:"all 0.18s",
              background: view===v.id ? "white" : "transparent",
              color: view===v.id ? "#f43f5e" : "#9ca3af",
              boxShadow: view===v.id ? "0 2px 10px rgba(0,0,0,0.08)" : "none",
              display:"flex", alignItems:"center", justifyContent:"center", gap:"6px",
            }}>
              {v.label}
              {v.count > 0 && (
                <span style={{ background:"#f43f5e", color:"white", borderRadius:"10px", padding:"1px 7px", fontSize:"10px" }}>{v.count}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── Category grid (browse mode) ── */}
      {!searchResults && view === "browse" && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"8px", marginBottom:"14px" }}>
          {CATEGORIES.map(c => {
            const active = activeCat === c.id;
            const cnt    = IDEAS[c.id]?.length || 0;
            return (
              <button key={c.id} onClick={() => setActiveCat(c.id)} className="tap" style={{
                borderRadius:"18px", padding:"12px 8px",
                border:`2px solid ${active ? c.color : c.border}`,
                background: active ? c.grad : c.light,
                cursor:"pointer", textAlign:"center",
                boxShadow: active ? `0 4px 14px ${c.color}44` : "none",
              }}>
                <div style={{ fontSize:"22px", marginBottom:"4px" }}>{c.emoji}</div>
                <div style={{ fontSize:"11px", fontWeight:700, color: active ? "white" : c.color, lineHeight:1 }}>{c.label}</div>
                <div style={{ fontSize:"9px", color: active ? "rgba(255,255,255,0.8)" : "#9ca3af", marginTop:"2px" }}>{cnt} ideas</div>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Search results label ── */}
      {searchResults && (
        <div style={{ fontSize:"12px", color:"#9ca3af", fontWeight:600, marginBottom:"10px" }}>
          {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for "{search}"
        </div>
      )}

      {/* ── Saved empty state ── */}
      {!searchResults && view === "saved" && favList.length === 0 && (
        <div style={{ textAlign:"center", padding:"48px 0" }}>
          <div style={{ fontSize:"50px", marginBottom:"12px" }}>💔</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"18px", fontWeight:700, color:"#f43f5e", marginBottom:"6px" }}>Nothing saved yet</div>
          <div style={{ fontSize:"12px", color:"#9ca3af", marginBottom:"20px" }}>Tap the heart on any idea to save it here</div>
          <button onClick={() => setView("browse")} style={{ padding:"12px 24px", borderRadius:"16px", background:"linear-gradient(135deg,#f43f5e,#ec4899)", color:"white", border:"none", cursor:"pointer", fontSize:"13px", fontWeight:700, boxShadow:"0 4px 16px rgba(244,63,94,0.3)" }}>
            Browse Ideas
          </button>
        </div>
      )}

      {/* ── Search empty state ── */}
      {searchResults && searchResults.length === 0 && (
        <div style={{ textAlign:"center", padding:"48px 0" }}>
          <div style={{ fontSize:"40px", marginBottom:"10px" }}>🔍</div>
          <div style={{ fontSize:"14px", color:"#9ca3af" }}>No ideas match "{search}"</div>
        </div>
      )}

      {/* ── Ideas list ── */}
      <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
        {displayIdeas.map((idea, idx) => {
          const isFav   = favourites.has(idea.id);
          const isDone  = doneIds.has(idea.id);
          const ideaCat = findIdeaCat(idea);
          return (
            <div key={idea.id} className="ic" style={{
              animationDelay:`${Math.min(idx,8)*40}ms`,
              background: isDone ? "#fafafa" : "white",
              borderRadius:"20px", overflow:"hidden",
              border:`1.5px solid ${isDone ? "#e5e7eb" : ideaCat.border}`,
              boxShadow: isDone ? "none" : `0 4px 18px ${ideaCat.color}12`,
              opacity: isDone ? 0.65 : 1,
            }}>
              {/* Top color strip */}
              <div style={{ height:"4px", background: isDone ? "#e5e7eb" : ideaCat.grad }}/>

              <div style={{ padding:"13px 14px" }}>
                {/* Title row */}
                <div style={{ display:"flex", alignItems:"flex-start", gap:"10px", marginBottom:"7px" }}>
                  {/* Cat icon */}
                  <div style={{
                    width:"36px", height:"36px", borderRadius:"12px", flexShrink:0,
                    background: isDone ? "#f3f4f6" : ideaCat.light,
                    border:`1.5px solid ${isDone ? "#e5e7eb" : ideaCat.border}`,
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:"17px",
                  }}>
                    {isDone ? "✅" : ideaCat.emoji}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{
                      fontSize:"14px", fontWeight:700,
                      color: isDone ? "#9ca3af" : "#1f2937",
                      textDecoration: isDone ? "line-through" : "none",
                      lineHeight:1.35,
                    }}>{idea.title}</div>
                    {/* Category pill */}
                    <span style={{
                      display:"inline-block", marginTop:"4px",
                      fontSize:"10px", padding:"2px 8px", borderRadius:"10px",
                      background: isDone ? "#f3f4f6" : ideaCat.light,
                      color: isDone ? "#9ca3af" : ideaCat.color,
                      border:`1px solid ${isDone ? "#e5e7eb" : ideaCat.border}`,
                      fontWeight:600,
                    }}>{ideaCat.emoji} {ideaCat.label}</span>
                  </div>
                </div>

                {/* Description */}
                {idea.desc && (
                  <div style={{ fontSize:"12px", color:"#6b7280", lineHeight:1.65, marginBottom:"12px", paddingLeft:"46px" }}>
                    {idea.desc}
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display:"flex", gap:"8px", paddingLeft:"0" }}>
                  {/* Save / Unsave */}
                  <button
                    onClick={() => toggleFav(idea.id)}
                    disabled={togglingFav === idea.id}
                    style={{
                      flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:"6px",
                      padding:"9px 12px", borderRadius:"14px",
                      border: isFav ? "1.5px solid #fce7f3" : "1.5px solid #f3f4f6",
                      background: isFav ? "#fff1f2" : "#fafafa",
                      cursor:"pointer", fontSize:"12px", fontWeight:700,
                      color: isFav ? "#f43f5e" : "#9ca3af",
                      transition:"all 0.2s",
                      opacity: togglingFav === idea.id ? 0.5 : 1,
                    }}
                  >
                    {isFav
                      ? <><FaHeart style={{ fontSize:"12px" }}/> Saved</>
                      : <><FaRegHeart style={{ fontSize:"12px" }}/> Save</>
                    }
                  </button>

                  {/* Done / Undo */}
                  <button
                    onClick={() => toggleDone(idea)}
                    disabled={togglingDone === idea.id}
                    style={{
                      flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:"6px",
                      padding:"9px 12px", borderRadius:"14px",
                      border: isDone ? "1.5px solid #d1fae5" : "1.5px solid #f3f4f6",
                      background: isDone ? "#f0fdf4" : "#fafafa",
                      cursor:"pointer",
                      fontSize:"12px", fontWeight:700,
                      color: isDone ? "#10b981" : "#9ca3af",
                      transition:"all 0.2s",
                      opacity: togglingDone === idea.id ? 0.5 : 1,
                    }}
                  >
                    {isDone
                      ? <><FaCheck style={{ fontSize:"12px" }}/> Done · Undo</>
                      : <><FaRegBookmark style={{ fontSize:"12px" }}/> Did this</>
                    }
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position:"fixed", bottom:"90px", left:"50%",
          background:"#1f2937", color:"white",
          borderRadius:"16px", padding:"11px 20px",
          fontSize:"13px", fontWeight:600,
          display:"flex", alignItems:"center", gap:"8px",
          boxShadow:"0 8px 24px rgba(0,0,0,0.2)", zIndex:300,
          animation:"toast 2s ease forwards", whiteSpace:"nowrap",
          pointerEvents:"none",
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}