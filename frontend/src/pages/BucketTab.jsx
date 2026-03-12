// client/src/pages/BucketTab.jsx
import { useState } from "react";
import { BUCKET_CATEGORIES, BUCKET_IDEAS } from "../lib/constants";

function Spinner() {
  return <span style={{display:"inline-block",width:"14px",height:"14px",border:"2px solid rgba(255,255,255,0.4)",borderTopColor:"white",borderRadius:"50%",animation:"spin 0.7s linear infinite",verticalAlign:"middle",marginRight:"6px"}}/>;
}



// ── Ideas Drawer ─────────────────────────────────────────────────────────────
function IdeasDrawer({ onSelect, onClose, existingTitles }) {
  const [activeTab, setActiveTab] = useState("travel");
  const cat = BUCKET_CATEGORIES.find(c => c.id === activeTab);
  const ideas = BUCKET_IDEAS[activeTab] || [];

  return (
    <>
      {/* Backdrop */}
      <div
        style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",backdropFilter:"blur(4px)",zIndex:200}}
        onClick={onClose}
      />
      {/* Sheet */}
      <div style={{
        position:"fixed",bottom:0,left:0,right:0,zIndex:201,
        background:"white",borderRadius:"24px 24px 0 0",
        maxHeight:"82vh",display:"flex",flexDirection:"column",
        boxShadow:"0 -8px 40px rgba(244,63,94,0.15)",
        animation:"slideUp 0.32s cubic-bezier(0.34,1.2,0.64,1)",
      }}>
        {/* Handle */}
        <div style={{display:"flex",justifyContent:"center",padding:"12px 0 0"}}>
          <div style={{width:"40px",height:"4px",borderRadius:"2px",background:"#e5e7eb"}}/>
        </div>

        {/* Header */}
        <div style={{padding:"12px 20px 10px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid #fce7f3"}}>
          <div>
            <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:"20px",fontWeight:700,color:"#1f2937",margin:0}}>💡 Bucket List Ideas</h3>
            <p style={{fontSize:"12px",color:"#9ca3af",margin:"2px 0 0"}}>Tap any idea to add it to your list</p>
          </div>
          <button onClick={onClose} style={{width:"30px",height:"30px",borderRadius:"50%",background:"#f3f4f6",border:"none",cursor:"pointer",fontSize:"14px",color:"#6b7280",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>

        {/* Category tabs */}
        <div style={{display:"flex",gap:"8px",padding:"12px 16px 8px",overflowX:"auto",flexShrink:0}}>
          {BUCKET_CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveTab(c.id)}
              style={{
                flexShrink:0,padding:"6px 14px",borderRadius:"20px",
                fontSize:"12px",fontWeight:700,border:"none",cursor:"pointer",
                transition:"all 0.15s",
                background: activeTab===c.id ? "linear-gradient(135deg,#f43f5e,#ec4899)" : "#f9fafb",
                color: activeTab===c.id ? "white" : "#6b7280",
                boxShadow: activeTab===c.id ? "0 2px 8px rgba(244,63,94,0.3)" : "none",
              }}
            >{c.emoji} {c.label}</button>
          ))}
        </div>

        {/* Ideas list */}
        <div style={{overflowY:"auto",padding:"4px 16px 32px",flex:1}}>
          <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
            {ideas.map((idea, i) => {
              const alreadyAdded = existingTitles.includes(idea.title);
              return (
                <button
                  key={i}
                  disabled={alreadyAdded}
                  onClick={() => { onSelect({ ...idea, category: activeTab }); onClose(); }}
                  style={{
                    display:"flex",alignItems:"center",justifyContent:"space-between",gap:"12px",
                    padding:"12px 14px",borderRadius:"14px",
                    border: alreadyAdded ? "1px solid #e5e7eb" : "1px solid rgba(253,164,175,0.25)",
                    background: alreadyAdded ? "#f9fafb" : "rgba(255,255,255,0.9)",
                    cursor: alreadyAdded ? "not-allowed" : "pointer",
                    textAlign:"left",
                    transition:"all 0.15s",
                    opacity: alreadyAdded ? 0.5 : 1,
                    boxShadow: alreadyAdded ? "none" : "0 2px 8px rgba(244,63,94,0.06)",
                  }}
                  onMouseEnter={e => { if (!alreadyAdded) e.currentTarget.style.borderColor="#fda4af"; }}
                  onMouseLeave={e => { if (!alreadyAdded) e.currentTarget.style.borderColor="rgba(253,164,175,0.25)"; }}
                >
                  <div style={{flex:1}}>
                    <div style={{fontSize:"13px",fontWeight:600,color: alreadyAdded ? "#9ca3af" : "#1f2937"}}>{idea.title}</div>
                    <div style={{fontSize:"11px",marginTop:"2px"}}>
                      <span style={{
                        padding:"2px 8px",borderRadius:"10px",
                        background: idea.priority==="high" ? "#fff1f2" : idea.priority==="medium" ? "#fffbeb" : "#f0fdf4",
                        color:      idea.priority==="high" ? "#f43f5e" : idea.priority==="medium" ? "#d97706" : "#16a34a",
                      }}>
                        {idea.priority==="high" ? "🔥 High" : idea.priority==="medium" ? "⭐ Medium" : "🌿 Low"}
                      </span>
                    </div>
                  </div>
                  <div style={{fontSize:"18px",flexShrink:0,color: alreadyAdded ? "#d1d5db" : "#fda4af"}}>
                    {alreadyAdded ? "✓" : "+"}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main BucketTab ────────────────────────────────────────────────────────────
export default function BucketTab({
  buckets, coupleId,
  savingBucket, togglingBucket, deletingBucket, savingNote,
  onAdd, onToggle, onDelete, onSaveNote,
}) {
  const [showForm,     setShowForm]     = useState(false);
  const [showIdeas,    setShowIdeas]    = useState(false);
  const [form,         setForm]         = useState({title:"",category:"travel",note:"",priority:"medium"});
  const [filterCat,    setFilterCat]    = useState("all");
  const [editingNote,  setEditingNote]  = useState(null);
  const [noteText,     setNoteText]     = useState("");

  const bucketDone = buckets.filter(b => b.done).length;
  const existingTitles = buckets.map(b => b.title);

  const filtered = (filterCat === "all" ? buckets : buckets.filter(b => b.category === filterCat))
    .sort((a,b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      return ({high:0,medium:1,low:2}[a.priority]) - ({high:0,medium:1,low:2}[b.priority]);
    });

  // Called when user picks an idea from the drawer — pre-fills form and opens it
  const handleIdeaSelect = (idea) => {
    setForm({ title: idea.title, category: idea.category, priority: idea.priority, note: "" });
    setShowForm(true);
    // scroll to top after a tick so the form is visible
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
  };

  const handleAdd = async () => {
    if (!form.title.trim() || savingBucket) return;
    await onAdd(form);
    setForm({title:"",category:"travel",note:"",priority:"medium"});
    setShowForm(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-3 py-5 space-y-4">
      <style>{`
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes slideIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(50px)}to{opacity:1;transform:translateY(0)}}
        .si{animation:slideIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both;}
        .mb{animation:slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1);}
      `}</style>

      {/* Ideas drawer */}
      {showIdeas && (
        <IdeasDrawer
          onSelect={handleIdeaSelect}
          onClose={() => setShowIdeas(false)}
          existingTitles={existingTitles}
        />
      )}

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => setFilterCat("all")} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${filterCat==="all" ? "bg-rose-500 text-white border-rose-500" : "bg-white text-gray-500 border-rose-100"}`}>All {buckets.length}</button>
        {BUCKET_CATEGORIES.map(cat => {
          const cnt = buckets.filter(b => b.category === cat.id).length;
          return (
            <button key={cat.id} onClick={() => setFilterCat(cat.id)} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1 transition-all ${filterCat===cat.id ? "bg-rose-500 text-white border-rose-500" : "bg-white text-gray-500 border-rose-100"}`}>
              {cat.emoji} {cat.label} {cnt > 0 && <span className={`${filterCat===cat.id ? "bg-white/30" : "bg-rose-100 text-rose-400"} px-1 rounded-full`}>{cnt}</span>}
            </button>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[{label:"Total",value:buckets.length,emoji:"🌟"},{label:"Done",value:bucketDone,emoji:"✅"},{label:"Left",value:buckets.length-bucketDone,emoji:"💫"}].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-2.5 border border-rose-100 text-center shadow-sm">
            <div className="text-lg">{s.emoji}</div>
            <div className="text-xl font-bold text-rose-500" style={{fontFamily:"'Playfair Display',serif"}}>{s.value}</div>
            <div className="text-gray-400 text-[10px]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Action buttons row */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setShowForm(p => !p)}
          className="py-3 rounded-2xl border-2 border-dashed border-rose-200 hover:border-rose-400 text-rose-400 text-sm font-semibold flex items-center justify-center gap-2 bg-white hover:bg-rose-50 transition-all"
        >
          {showForm ? "✕ Cancel" : "＋ Add Dream"}
        </button>
        <button
          onClick={() => setShowIdeas(true)}
          className="py-3 rounded-2xl border-2 border-rose-200 hover:border-rose-400 text-rose-500 text-sm font-semibold flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 transition-all"
        >
          💡 Get Ideas
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-4 space-y-3 mb">
          <h3 className="text-lg font-bold text-gray-800" style={{fontFamily:"'Playfair Display',serif"}}>✨ New Dream</h3>
          <input
            type="text" placeholder="What's your dream?"
            value={form.title} onChange={e => setForm(f => ({...f,title:e.target.value}))}
            className="w-full border border-rose-100 rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:border-rose-300 bg-rose-50/30"
            style={{outline:"none"}}
          />
          <div className="grid grid-cols-2 gap-2">
            <select value={form.category} onChange={e => setForm(f => ({...f,category:e.target.value}))} className="border border-rose-100 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-rose-50/30" style={{outline:"none"}}>
              {BUCKET_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
            </select>
            <select value={form.priority} onChange={e => setForm(f => ({...f,priority:e.target.value}))} className="border border-rose-100 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-rose-50/30" style={{outline:"none"}}>
              <option value="high">🔥 High</option><option value="medium">⭐ Medium</option><option value="low">🌿 Low</option>
            </select>
          </div>
          <textarea
            rows={2} placeholder="Note (optional)"
            value={form.note} onChange={e => setForm(f => ({...f,note:e.target.value}))}
            className="w-full border border-rose-100 rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder-gray-300 resize-none bg-rose-50/30"
            style={{outline:"none"}}
          />
          <button onClick={handleAdd} disabled={!form.title.trim() || savingBucket} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 text-white text-sm font-bold shadow-md disabled:opacity-40">
            {savingBucket ? <><Spinner/>Saving…</> : "💕 Save Dream"}
          </button>
        </div>
      )}

      {/* Empty state */}
      {buckets.length === 0 && (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">🌟</div>
          <p className="text-rose-300 italic mb-2" style={{fontFamily:"'Playfair Display',serif"}}>No dreams yet.</p>
          <p className="text-gray-400 text-sm">Tap <strong>💡 Get Ideas</strong> to explore bucket list inspiration!</p>
        </div>
      )}

      {/* List */}
      <div className="space-y-2.5">
        {filtered.map(item => {
          const cat = BUCKET_CATEGORIES.find(c => c.id === item.category);
          const isEditing = editingNote === item._id;
          return (
            <div key={item._id} className={`si bg-white rounded-2xl border shadow-sm overflow-hidden ${item.done ? "opacity-70" : ""} border-rose-100 hover:border-rose-200 hover:shadow-md`}>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <button onClick={() => onToggle(item._id, item.done)} disabled={togglingBucket === item._id} className={`flex-shrink-0 mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all disabled:opacity-50 ${item.done ? "bg-rose-400 border-rose-400 text-white" : "border-rose-200 hover:border-rose-400"}`}>
                    {togglingBucket === item._id
                      ? <span style={{width:"10px",height:"10px",border:"2px solid #fda4af",borderTopColor:"#f43f5e",borderRadius:"50%",animation:"spin 0.7s linear infinite",display:"inline-block"}}/>
                      : item.done && <span className="text-xs">✓</span>}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold ${item.done ? "line-through text-gray-400" : "text-gray-800"}`}>{item.title}</p>
                      <button onClick={() => onDelete(item._id)} disabled={deletingBucket === item._id} className="text-gray-200 hover:text-red-400 text-sm disabled:opacity-40">
                        {deletingBucket === item._id
                          ? <span style={{width:"10px",height:"10px",border:"2px solid #fca5a5",borderTopColor:"#ef4444",borderRadius:"50%",animation:"spin 0.7s linear infinite",display:"inline-block"}}/>
                          : "✕"}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-xs px-2 py-0.5 bg-rose-50 text-rose-400 rounded-full border border-rose-100">{cat?.emoji} {cat?.label}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${item.priority==="high" ? "bg-red-50 text-red-400 border-red-100" : item.priority==="medium" ? "bg-amber-50 text-amber-500 border-amber-100" : "bg-emerald-50 text-emerald-500 border-emerald-100"}`}>
                        {item.priority==="high" ? "🔥 High" : item.priority==="medium" ? "⭐ Medium" : "🌿 Low"}
                      </span>
                    </div>
                    {isEditing ? (
                      <div className="mt-2 space-y-1.5">
                        <textarea rows={2} value={noteText} onChange={e => setNoteText(e.target.value)} autoFocus className="w-full border border-rose-200 rounded-xl px-3 py-2 text-xs text-gray-600 resize-none bg-rose-50/40" style={{outline:"none"}}/>
                        <div className="flex gap-2">
                          <button onClick={() => { onSaveNote(item._id, noteText); setEditingNote(null); }} disabled={savingNote === item._id} className="px-3 py-1 bg-rose-400 text-white text-xs rounded-lg font-semibold disabled:opacity-50">
                            {savingNote === item._id ? <><Spinner/>Saving…</> : "Save"}
                          </button>
                          <button onClick={() => setEditingNote(null)} className="px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-lg">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2">
                        {item.note
                          ? <div className="flex items-start gap-1.5 group cursor-pointer" onClick={() => { setEditingNote(item._id); setNoteText(item.note); }}><span className="text-rose-300 text-xs">📝</span><p className="text-xs text-gray-400 italic flex-1 group-hover:text-rose-400">{item.note}</p></div>
                          : <button onClick={() => { setEditingNote(item._id); setNoteText(""); }} className="text-xs text-gray-300 hover:text-rose-400">＋ Add note</button>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
