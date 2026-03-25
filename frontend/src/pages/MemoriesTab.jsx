// client/src/pages/MemoriesTab.jsx
import { useState, useRef } from "react";
import { MEMORY_TAGS } from "../lib/constants";

function Spinner() {
  return <span style={{display:"inline-block",width:"14px",height:"14px",border:"2px solid rgba(255,255,255,0.4)",borderTopColor:"white",borderRadius:"50%",animation:"spin 0.7s linear infinite",verticalAlign:"middle",marginRight:"6px"}}/>;
}

export default function MemoriesTab({
  memories, coupleId,
  savingMemory, deletingMemory,
  onAdd, onDelete,
}) {
  const [showForm,       setShowForm]       = useState(false);
  const [viewMode,       setViewMode]       = useState("grid"); // grid | timeline
  const [form,           setForm]           = useState({title:"",date:new Date().toISOString().split("T")[0],note:"",tag:"Just Because",mood:"🥰",imageUrl:null,imagePreview:null});
  const [expandedMemory, setExpandedMemory] = useState(null);
  const [memoryLightbox, setMemoryLightbox] = useState(null);
  const memImgRef = useRef();

  const sortedMemories = [...memories].sort((a,b) => new Date(b.date) - new Date(a.date));

  const handleImage = file => {
    if (!file?.type.startsWith("image/")) return;
    const r = new FileReader();
    r.onload = e => setForm(f => ({...f, imageUrl:e.target.result, imagePreview:e.target.result}));
    r.readAsDataURL(file);
  };

  const handleAdd = async () => {
    if (!form.title.trim() || savingMemory) return;
    const { imagePreview, ...payload } = form;
    await onAdd(payload);
    setForm({title:"",date:new Date().toISOString().split("T")[0],note:"",tag:"Just Because",mood:"🥰",imageUrl:null,imagePreview:null});
    setShowForm(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-3 py-5 space-y-4">
      <style>{`
        @keyframes spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes slideIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(40px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes floatUp { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        .si  { animation: slideIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both; }
        .mb  { animation: slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1); }
        .mo  { animation: fadeIn  0.2s ease; }

        /* ── Polaroid memory card ── */
        .mem-polaroid {
          background: white;
          border-radius: 3px;
          padding: 8px 8px 48px;
          box-shadow: 0 4px 18px rgba(0,0,0,0.13), 0 1px 4px rgba(0,0,0,0.07);
          position: relative;
          transition: transform 0.25s cubic-bezier(0.34,1.4,0.64,1), box-shadow 0.25s;
          cursor: pointer;
          width: 100%;
        }
        .mem-polaroid:hover {
          transform: translateY(-6px) scale(1.015) rotate(0deg) !important;
          box-shadow: 0 18px 45px rgba(244,63,94,0.2), 0 4px 14px rgba(0,0,0,0.1);
          z-index: 5;
        }

        /* tape strip */
        .mem-polaroid::before {
          content: '';
          position: absolute;
          top: -9px; left: 50%;
          transform: translateX(-50%);
          width: 52px; height: 16px;
          background: rgba(255,220,100,0.6);
          border-radius: 3px;
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.08);
        }

        /* slight tilt alternating */
        .mem-polaroid:nth-child(odd)  { transform: rotate(-1.2deg); }
        .mem-polaroid:nth-child(even) { transform: rotate(1deg); }

        .mem-photo {
          width: 100%;
          aspect-ratio: 4/3;
          overflow: hidden;
          border-radius: 2px;
          background: linear-gradient(135deg,#fff1f2,#fdf4ff);
          position: relative;
          display: flex; align-items: center; justify-content: center;
        }
        .mem-photo img {
          width: 100%; height: 100%; object-fit: cover;
          display: block;
          transition: transform 0.4s ease;
        }
        .mem-polaroid:hover .mem-photo img { transform: scale(1.04); }

        .mem-caption-area {
          padding: 0;
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 48px;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 2px;
          padding: 0 8px;
        }
        .mem-caption-title {
          font-size: 11px;
          font-weight: 700;
          color: #374151;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 100%;
          font-family: 'Playfair Display', serif;
        }
        .mem-caption-meta {
          font-size: 9px;
          color: #9ca3af;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 100%;
        }

        /* mood badge */
        .mem-mood {
          position: absolute;
          top: 6px; left: 6px;
          width: 22px; height: 22px;
          border-radius: 50%;
          background: white;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
        }
        /* tag badge */
        .mem-tag {
          position: absolute;
          top: 6px; right: 6px;
          font-size: 8px;
          background: rgba(255,255,255,0.9);
          color: #f43f5e;
          padding: 2px 6px;
          border-radius: 8px;
          font-weight: 700;
          backdrop-filter: blur(4px);
        }
        /* delete btn */
        .mem-delete {
          position: absolute;
          bottom: 50px; right: 6px;
          width: 20px; height: 20px;
          border-radius: 50%;
          background: rgba(255,255,255,0.9);
          border: none; cursor: pointer;
          font-size: 9px; color: #d1d5db;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.18s;
          box-shadow: 0 1px 4px rgba(0,0,0,0.1);
        }
        .mem-delete:hover { background: #fee2e2; color: #ef4444; }

        /* expanded detail panel */
        .mem-detail {
          background: white;
          border-radius: 20px;
          border: 1px solid #fce7f3;
          padding: 16px;
          box-shadow: 0 4px 20px rgba(244,63,94,0.08);
          animation: slideIn 0.3s cubic-bezier(0.34,1.4,0.64,1);
        }
        /* ── Timeline ── */
        .tl-line { position:relative; }
        .tl-line::before {
          content:''; position:absolute;
          left: 18px; top:0; bottom:0; width:2px;
          background: linear-gradient(180deg,#fda4af,#fbcfe8,#e9d5ff,transparent);
          border-radius:2px;
        }
        .tl-item { position:relative; padding-left:52px; }
        .tl-dot {
          position:absolute; left:8px; top:16px;
          width:22px; height:22px; border-radius:50%;
          background:white; border:2px solid #fda4af;
          display:flex; align-items:center; justify-content:center;
          font-size:11px; z-index:2;
          box-shadow:0 2px 8px rgba(244,63,94,0.15);
        }
        .tl-card {
          background:white; border-radius:16px;
          border:1px solid #fce7f3;
          overflow:hidden;
          box-shadow:0 3px 14px rgba(244,63,94,0.07);
          transition:transform 0.2s, box-shadow 0.2s;
        }
        .tl-card:hover {
          transform:translateY(-2px);
          box-shadow:0 8px 28px rgba(244,63,94,0.13);
        }
        .tl-year-label {
          display:inline-block;
          margin-left:52px; margin-bottom:8px;
          font-size:10px; font-weight:700; letter-spacing:1px;
          color:#fda4af; text-transform:uppercase;
          background:#fff1f2; padding:3px 10px; border-radius:10px;
          border:1px solid #fce7f3;
        }
      `}</style>

      {/* Lightbox */}
      {memoryLightbox && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 mo" onClick={() => setMemoryLightbox(null)}>
          <div className="relative max-w-lg w-full">
            <img src={memoryLightbox} alt="" className="w-full rounded-2xl max-h-[80vh] object-contain shadow-2xl"/>
            <button className="absolute top-2 right-2 w-8 h-8 bg-white/20 hover:bg-white/40 rounded-full text-white text-sm" onClick={() => setMemoryLightbox(null)}>✕</button>
          </div>
        </div>
      )}

      <input ref={memImgRef} type="file" accept="image/*" className="hidden" onChange={e => handleImage(e.target.files[0])}/>

      {/* Add button */}
      <button onClick={() => setShowForm(p => !p)} className="w-full py-3 rounded-2xl border-2 border-dashed border-rose-200 hover:border-rose-400 text-rose-400 text-sm font-semibold flex items-center justify-center gap-2 bg-white hover:bg-rose-50 transition-all">
        {showForm ? "✕ Cancel" : "＋ Add a Memory"}
      </button>

      {/* Add form — unchanged */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-rose-100 shadow-md p-4 space-y-3 mb">
          <h3 className="text-lg font-bold text-gray-800" style={{fontFamily:"'Playfair Display',serif"}}>📸 Capture a Memory</h3>
          <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-dashed border-rose-100 cursor-pointer hover:border-rose-300 transition-all" style={{minHeight:"90px"}} onClick={() => memImgRef.current.click()}>
            {form.imagePreview
              ? <div className="relative"><img src={form.imagePreview} alt="" className="w-full h-36 object-cover"/><button className="absolute top-2 right-2 w-7 h-7 bg-white/80 rounded-full text-xs text-gray-500 flex items-center justify-center" onClick={e => { e.stopPropagation(); setForm(f => ({...f,imageUrl:null,imagePreview:null})); }}>✕</button></div>
              : <div className="flex flex-col items-center justify-center h-20 gap-1"><span className="text-3xl">🖼️</span><span className="text-xs text-rose-300">Tap to add a photo</span></div>}
          </div>
          <input type="text" placeholder="Memory title..." value={form.title} onChange={e => setForm(f => ({...f,title:e.target.value}))} className="w-full border border-rose-100 rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:border-rose-300 bg-rose-50/30" style={{outline:"none"}}/>
          <div className="grid grid-cols-2 gap-2">
            <input type="date" value={form.date} onChange={e => setForm(f => ({...f,date:e.target.value}))} className="border border-rose-100 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-rose-50/30" style={{outline:"none",colorScheme:"light"}}/>
            <select value={form.mood} onChange={e => setForm(f => ({...f,mood:e.target.value}))} className="border border-rose-100 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-rose-50/30" style={{outline:"none"}}>
              {["🥰","😄","😂","🥺","😍","🤩","😊","💕","🌟","✨"].map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {MEMORY_TAGS.map(t => (
              <button key={t} onClick={() => setForm(f => ({...f,tag:t}))} className={`px-2.5 py-1 rounded-full text-xs border transition-all ${form.tag===t ? "bg-rose-400 text-white border-rose-400" : "bg-rose-50 text-rose-400 border-rose-100"}`}>{t}</button>
            ))}
          </div>
          <textarea rows={3} placeholder="What made this moment special?" value={form.note} onChange={e => setForm(f => ({...f,note:e.target.value}))} className="w-full border border-rose-100 rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder-gray-300 resize-none bg-rose-50/30" style={{outline:"none"}}/>
          <button onClick={handleAdd} disabled={!form.title.trim() || savingMemory} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 text-white text-sm font-bold shadow-md disabled:opacity-40">
            {savingMemory ? <><Spinner/>Saving memory…</> : "💾 Save Memory"}
          </button>
        </div>
      )}

      {/* Stats — unchanged */}
      <div className="grid grid-cols-3 gap-2">
        {[
          {label:"Memories",    value:memories.length,                                                                        emoji:"📸"},
          {label:"With Photos", value:memories.filter(m=>m.imageUrl).length,                                                 emoji:"🖼️"},
          {label:"This Year",   value:memories.filter(m=>m.date?.startsWith(new Date().getFullYear())).length,               emoji:"🌸"},
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-2.5 border border-rose-100 text-center shadow-sm">
            <div className="text-lg">{s.emoji}</div>
            <div className="text-xl font-bold text-rose-500" style={{fontFamily:"'Playfair Display',serif"}}>{s.value}</div>
            <div className="text-gray-400 text-[10px]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* View toggle */}
      {memories.length > 0 && (
        <div style={{display:"flex",background:"#f9fafb",borderRadius:"14px",padding:"3px"}}>
          {[{id:"grid",l:"📷 Grid"},{id:"timeline",l:"🕐 Timeline"}].map(v => (
            <button key={v.id} onClick={() => setViewMode(v.id)} style={{
              flex:1, padding:"8px", borderRadius:"11px", border:"none", cursor:"pointer",
              fontSize:"12px", fontWeight:700, transition:"all 0.18s",
              background: viewMode===v.id ? "white" : "transparent",
              color: viewMode===v.id ? "#f43f5e" : "#9ca3af",
              boxShadow: viewMode===v.id ? "0 1px 8px rgba(0,0,0,0.08)" : "none",
            }}>{v.l}</button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {memories.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">📷</div>
          <p className="text-rose-300 italic" style={{fontFamily:"'Playfair Display',serif"}}>Your story starts here.</p>
        </div>
      )}

      {/* ── Polaroid grid ── */}
      {memories.length > 0 && viewMode === "grid" && (
        <div style={{
          display:"grid",
          gridTemplateColumns:"repeat(auto-fill, minmax(140px, 1fr))",
          gap:"28px 16px",
          padding:"20px 4px 8px",
        }}>
          {sortedMemories.map((mem, i) => (
            <div key={mem._id}>
              {/* Polaroid card */}
              <div
                className={`mem-polaroid si`}
                style={{animationDelay:`${i*55}ms`}}
                onClick={() => setExpandedMemory(expandedMemory === mem._id ? null : mem._id)}
              >
                {/* Photo */}
                <div className="mem-photo">
                  {mem.imageUrl
                    ? <img src={mem.imageUrl} alt={mem.title} onClick={e => { e.stopPropagation(); setMemoryLightbox(mem.imageUrl); }}/>
                    : <div style={{textAlign:"center"}}>
                        <div style={{fontSize:"32px",marginBottom:"4px",opacity:0.5}}>📸</div>
                        <div style={{fontSize:"9px",color:"#fda4af"}}>No photo</div>
                      </div>
                  }
                  {/* Mood badge */}
                  <div className="mem-mood">{mem.mood || "🥰"}</div>
                  {/* Tag badge */}
                  <div className="mem-tag">{mem.tag}</div>
                </div>

                {/* Caption area */}
                <div className="mem-caption-area">
                  <div className="mem-caption-title">{mem.title}</div>
                  <div className="mem-caption-meta">
                    {mem.date ? new Date(mem.date).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : ""}
                  </div>
                </div>

                {/* Delete btn */}
                <button
                  className="mem-delete"
                  onClick={e => { e.stopPropagation(); onDelete(mem._id); }}
                  disabled={deletingMemory === mem._id}
                >
                  {deletingMemory === mem._id
                    ? <span style={{width:"8px",height:"8px",border:"1.5px solid #fca5a5",borderTopColor:"#ef4444",borderRadius:"50%",animation:"spin 0.7s linear infinite",display:"inline-block"}}/>
                    : "✕"}
                </button>
              </div>

              {/* Expanded detail panel below the card */}
              {expandedMemory === mem._id && mem.note && (
                <div className="mem-detail mt-3">
                  <p className="text-xs text-gray-500 leading-relaxed italic">"{mem.note}"</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {/* ── Timeline view ── */}
      {memories.length > 0 && viewMode === "timeline" && (() => {
        const grouped = {};
        sortedMemories.forEach(mem => {
          const yr = mem.date ? new Date(mem.date).getFullYear() : "Unknown";
          if (!grouped[yr]) grouped[yr] = [];
          grouped[yr].push(mem);
        });
        return (
          <div className="tl-line" style={{paddingTop:"8px", paddingBottom:"24px"}}>
            {Object.entries(grouped).map(([year, mems]) => (
              <div key={year}>
                {/* Year label */}
                <div className="tl-year-label">📅 {year}</div>

                <div style={{display:"flex", flexDirection:"column", gap:"28px", marginBottom:"28px"}}>
                  {mems.map((mem, i) => (
                    <div key={mem._id} className={`tl-item si`} style={{animationDelay:`${i*60}ms`}}>
                      {/* dot */}
                      <div className="tl-dot">{mem.mood || "🥰"}</div>

                      {/* Polaroid card */}
                      <div
                        className="mem-polaroid"
                        style={{
                          transform: i%2===0 ? "rotate(-1deg)" : "rotate(1.2deg)",
                          maxWidth: "260px",
                        }}
                        onClick={() => setExpandedMemory(expandedMemory===mem._id ? null : mem._id)}
                      >
                        {/* Photo area */}
                        <div className="mem-photo">
                          {mem.imageUrl
                            ? <img src={mem.imageUrl} alt={mem.title}
                                onClick={e => { e.stopPropagation(); setMemoryLightbox(mem.imageUrl); }}
                              />
                            : <div style={{textAlign:"center"}}>
                                <div style={{fontSize:"32px",opacity:0.45}}>📸</div>
                                <div style={{fontSize:"9px",color:"#fda4af",marginTop:"4px"}}>No photo</div>
                              </div>
                          }
                          {/* Mood badge */}
                          <div className="mem-mood">{mem.mood || "🥰"}</div>
                          {/* Tag badge */}
                          <div className="mem-tag">{mem.tag}</div>
                        </div>

                        {/* Caption */}
                        <div className="mem-caption-area">
                          <div className="mem-caption-title">{mem.title}</div>
                          <div className="mem-caption-meta">
                            {mem.date ? new Date(mem.date).toLocaleDateString("en-US",{month:"short",day:"numeric"}) : ""}
                          </div>
                        </div>

                        {/* Delete */}
                        <button
                          className="mem-delete"
                          onClick={e => { e.stopPropagation(); onDelete(mem._id); }}
                          disabled={deletingMemory===mem._id}
                        >
                          {deletingMemory===mem._id
                            ? <span style={{width:"8px",height:"8px",border:"1.5px solid #fca5a5",borderTopColor:"#ef4444",borderRadius:"50%",animation:"spin 0.7s linear infinite",display:"inline-block"}}/>
                            : "✕"}
                        </button>
                      </div>

                      {/* Note expander below polaroid */}
                      {expandedMemory===mem._id && mem.note && (
                        <div className="mem-detail" style={{maxWidth:"260px",marginTop:"10px"}}>
                          <p style={{fontSize:"12px",color:"#6b7280",lineHeight:"1.65",fontStyle:"italic"}}>"{mem.note}"</p>
                          <button onClick={() => setExpandedMemory(null)} style={{fontSize:"11px",color:"#f43f5e",background:"none",border:"none",cursor:"pointer",marginTop:"6px"}}>Close ↑</button>
                        </div>
                      )}
                      {expandedMemory!==mem._id && mem.note && (
                        <button onClick={() => setExpandedMemory(mem._id)} style={{fontSize:"11px",color:"#fda4af",background:"none",border:"none",cursor:"pointer",marginTop:"6px",marginLeft:"4px"}}>Read note ↓</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      })()}
    </div>
  );
}