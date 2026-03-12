// client/src/pages/IdeasTab.jsx
import { useState } from "react";
import { IDEAS } from "../lib/constants";
import * as API from "../lib/api";

const CATEGORIES = [
  { id:"romantic",  label:"Romantic",  emoji:"💕", color:"#f43f5e", light:"#fff1f2", grad:"linear-gradient(135deg,#f43f5e,#fb7185)" },
  { id:"adventure", label:"Adventure", emoji:"🧗", color:"#f97316", light:"#fff7ed", grad:"linear-gradient(135deg,#f97316,#fb923c)" },
  { id:"cozy",      label:"Cozy",      emoji:"🛋️", color:"#8b5cf6", light:"#f5f3ff", grad:"linear-gradient(135deg,#8b5cf6,#a78bfa)" },
  { id:"food",      label:"Food",      emoji:"🍜", color:"#d97706", light:"#fffbeb", grad:"linear-gradient(135deg,#d97706,#f59e0b)" },
  { id:"outdoor",   label:"Outdoor",   emoji:"🌿", color:"#10b981", light:"#f0fdf4", grad:"linear-gradient(135deg,#10b981,#34d399)" },
  { id:"surprise",  label:"Surprise",  emoji:"✨", color:"#ec4899", light:"#fdf4ff", grad:"linear-gradient(135deg,#ec4899,#f472b6)" },
];

const allIdeas = Object.values(IDEAS).flat();

export default function IdeasTab({ coupleId, ideaFavs, ideaDone, setIdeaFavs, setIdeaDone }) {
  const [activeCat, setActiveCat] = useState("romantic");
  const [view,      setView]      = useState("browse");
  const [justDone,  setJustDone]  = useState(null);
  const [togglingFav,  setTogglingFav]  = useState(null);
  const [togglingDone, setTogglingDone] = useState(null);

  const favourites   = new Set(ideaFavs);
  const doneIds      = new Set(ideaDone);
  const cat          = CATEGORIES.find(c => c.id === activeCat);
  const ideas        = IDEAS[activeCat] || [];
  const favList      = allIdeas.filter(i => favourites.has(i.id));
  const displayIdeas = view === "saved" ? favList : ideas;

  const toggleFav = async (ideaId) => {
    if (togglingFav) return;
    setTogglingFav(ideaId);
    // Optimistic update
    setIdeaFavs(prev => prev.includes(ideaId) ? prev.filter(x => x !== ideaId) : [...prev, ideaId]);
    try { const res = await API.toggleIdeaFav(coupleId, ideaId); setIdeaFavs(res.data.ideaFavs); }
    catch { /* revert on fail — refetch would fix it */ }
    setTogglingFav(null);
  };

  const markDone = async (idea) => {
    if (doneIds.has(idea.id) || togglingDone) return;
    setTogglingDone(idea.id);
    // Optimistic update
    setIdeaDone(prev => [...prev, idea.id]);
    setJustDone(idea.title);
    setTimeout(() => setJustDone(null), 2200);
    try { const res = await API.toggleIdeaDone(coupleId, idea.id); setIdeaDone(res.data.ideaDone); }
    catch { setIdeaDone(prev => prev.filter(x => x !== idea.id)); }
    setTogglingDone(null);
  };

  const findIdeaCat = (idea) =>
    CATEGORIES.find(c => IDEAS[c.id]?.some(i => i.id === idea.id)) || cat;

  return (
    <div className="max-w-2xl mx-auto px-3 py-4">
      <style>{`
        @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes toast   { 0%{opacity:0;transform:translateY(16px)} 15%{opacity:1;transform:translateY(0)} 80%{opacity:1} 100%{opacity:0} }
        @keyframes heartPop{ 0%{transform:scale(1)} 50%{transform:scale(1.4)} 100%{transform:scale(1)} }
        .idea-card{ animation:fadeUp 0.38s cubic-bezier(0.34,1.4,0.64,1) both; transition:transform 0.2s,box-shadow 0.2s; }
        .idea-card:hover{ transform:translateY(-2px); }
        .cat-pill{ transition:all 0.18s; cursor:pointer; }
        .cat-pill:hover{ transform:scale(1.05); }
        .fav-btn:active{ animation:heartPop 0.3s ease; }
      `}</style>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { emoji:"💡", value:allIdeas.length,  label:"Total Ideas" },
          { emoji:"❤️", value:favourites.size,   label:"Saved"       },
          { emoji:"✅", value:doneIds.size,       label:"Done"        },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-2.5 border border-rose-100 text-center shadow-sm">
            <div className="text-lg">{s.emoji}</div>
            <div style={{fontFamily:"'Playfair Display',serif"}} className="text-xl font-bold text-rose-500">{s.value}</div>
            <div className="text-gray-400 text-[10px]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Browse / Saved toggle */}
      <div style={{display:"flex",background:"#f9fafb",borderRadius:"14px",padding:"3px",marginBottom:"14px"}}>
        {[{id:"browse",l:"🗂️ Browse All"},{id:"saved",l:`❤️ Saved${favourites.size>0?` (${favourites.size})`:""}`}].map(v => (
          <button key={v.id} onClick={() => setView(v.id)} style={{
            flex:1,padding:"9px",borderRadius:"11px",border:"none",cursor:"pointer",
            fontSize:"13px",fontWeight:700,transition:"all 0.18s",
            background:view===v.id?"white":"transparent",
            color:view===v.id?"#f43f5e":"#9ca3af",
            boxShadow:view===v.id?"0 1px 8px rgba(0,0,0,0.08)":"none",
          }}>{v.l}</button>
        ))}
      </div>

      {/* Category chips */}
      {view === "browse" && (
        <div style={{display:"flex",gap:"7px",overflowX:"auto",paddingBottom:"10px",marginBottom:"4px"}}>
          {CATEGORIES.map(c => (
            <button key={c.id} className="cat-pill" onClick={() => setActiveCat(c.id)} style={{
              flexShrink:0,padding:"7px 16px",borderRadius:"20px",border:"none",
              fontSize:"12px",fontWeight:700,
              background:activeCat===c.id?c.grad:c.light,
              color:activeCat===c.id?"white":c.color,
              boxShadow:activeCat===c.id?`0 3px 12px ${c.color}44`:"none",
            }}>{c.emoji} {c.label}</button>
          ))}
        </div>
      )}

      {/* Category banner */}
      {view === "browse" && (
        <div style={{
          padding:"14px 18px",borderRadius:"18px",
          background:cat.grad,color:"white",
          display:"flex",alignItems:"center",gap:"14px",
          boxShadow:`0 6px 24px ${cat.color}44`,
          marginBottom:"14px",
        }}>
          <span style={{fontSize:"34px"}}>{cat.emoji}</span>
          <div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:"18px",fontWeight:700}}>{cat.label} Dates</div>
            <div style={{fontSize:"12px",opacity:0.85}}>{ideas.length} ideas · ❤️ save · ✅ mark done</div>
          </div>
        </div>
      )}

      {/* Saved empty state */}
      {view === "saved" && favList.length === 0 && (
        <div className="text-center py-14">
          <div className="text-5xl mb-3">💔</div>
          <p className="italic text-rose-300 mb-1" style={{fontFamily:"'Playfair Display',serif"}}>No saved ideas yet</p>
          <p className="text-gray-400 text-sm">Browse ideas and tap ❤️ to save them here</p>
        </div>
      )}

      {/* Ideas list */}
      <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
        {displayIdeas.map((idea, idx) => {
          const isFav   = favourites.has(idea.id);
          const isDone  = doneIds.has(idea.id);
          const ideaCat = findIdeaCat(idea);
          return (
            <div key={idea.id} className="idea-card" style={{
              background:isDone?"#fafafa":"white",
              borderRadius:"16px",overflow:"hidden",
              border:`1px solid ${isDone?"#e5e7eb":ideaCat.light}`,
              boxShadow:isDone?"none":`0 3px 16px ${ideaCat.color}0d`,
              opacity:isDone?0.62:1,
              animationDelay:`${idx*40}ms`,
            }}>
              <div style={{height:"3px",background:isDone?"#e5e7eb":ideaCat.grad}}/>
              <div style={{padding:"13px 14px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"8px",marginBottom:"6px"}}>
                  <div style={{fontWeight:700,fontSize:"14px",color:isDone?"#9ca3af":"#1f2937",textDecoration:isDone?"line-through":"none",flex:1,lineHeight:"1.35"}}>
                    {idea.title}
                  </div>
                  <div style={{display:"flex",gap:"6px",flexShrink:0}}>
                    <button className="fav-btn" onClick={() => toggleFav(idea.id)} disabled={togglingFav===idea.id} style={{
                      width:"32px",height:"32px",borderRadius:"50%",border:"none",cursor:"pointer",
                      background:isFav?"#fff1f2":"#f9fafb",fontSize:"16px",
                      display:"flex",alignItems:"center",justifyContent:"center",
                      transition:"all 0.2s",
                      boxShadow:isFav?"0 2px 8px rgba(244,63,94,0.2)":"none",
                      transform:isFav?"scale(1.1)":"scale(1)",
                      opacity:togglingFav===idea.id?0.5:1,
                    }}>{isFav?"❤️":"🤍"}</button>
                    <button onClick={() => markDone(idea)} disabled={isDone||togglingDone===idea.id} style={{
                      width:"32px",height:"32px",borderRadius:"50%",border:"none",
                      cursor:isDone?"default":"pointer",
                      background:isDone?"#f0fdf4":"#f9fafb",fontSize:"16px",
                      display:"flex",alignItems:"center",justifyContent:"center",
                      transition:"all 0.2s",
                      boxShadow:isDone?"0 2px 8px rgba(16,185,129,0.15)":"none",
                      opacity:togglingDone===idea.id?0.5:1,
                    }}>{isDone?"✅":"☑️"}</button>
                  </div>
                </div>
                <div style={{fontSize:"12px",color:"#6b7280",lineHeight:"1.65"}}>{idea.desc}</div>
                {view === "saved" && (
                  <div style={{marginTop:"8px"}}>
                    <span style={{fontSize:"10px",padding:"3px 10px",borderRadius:"10px",background:ideaCat.light,color:ideaCat.color,fontWeight:700}}>
                      {ideaCat.emoji} {ideaCat.label}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Toast */}
      {justDone && (
        <div style={{
          position:"fixed",bottom:"28px",left:"50%",transform:"translateX(-50%)",
          background:"#1f2937",color:"white",borderRadius:"14px",
          padding:"11px 20px",fontSize:"13px",fontWeight:600,
          display:"flex",alignItems:"center",gap:"8px",
          boxShadow:"0 8px 24px rgba(0,0,0,0.2)",zIndex:300,
          animation:"toast 2.2s ease forwards",whiteSpace:"nowrap",
        }}>
          ✅ Marked as done!
        </div>
      )}
    </div>
  );
}