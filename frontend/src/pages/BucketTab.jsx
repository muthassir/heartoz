// frontend/src/pages/BucketTab.jsx
import { useState } from "react";
import { BUCKET_CATEGORIES, BUCKET_IDEAS } from "../lib/constants";

function Spinner() {
  return <span style={{display:"inline-block",width:"13px",height:"13px",border:"2px solid rgba(255,255,255,0.35)",borderTopColor:"white",borderRadius:"50%",animation:"bspin 0.7s linear infinite",verticalAlign:"middle",marginRight:"5px"}}/>;
}

const CAT_COLORS = {
  travel:    { grad:"linear-gradient(135deg,#f97316,#fb923c)", light:"#fff7ed", dot:"#f97316", border:"#fed7aa" },
  food:      { grad:"linear-gradient(135deg,#ec4899,#f472b6)", light:"#fdf4ff", dot:"#ec4899", border:"#f9a8d4" },
  adventure: { grad:"linear-gradient(135deg,#10b981,#34d399)", light:"#f0fdf4", dot:"#10b981", border:"#6ee7b7" },
  romance:   { grad:"linear-gradient(135deg,#f43f5e,#fb7185)", light:"#fff1f2", dot:"#f43f5e", border:"#fda4af" },
  learning:  { grad:"linear-gradient(135deg,#8b5cf6,#a78bfa)", light:"#f5f3ff", dot:"#8b5cf6", border:"#c4b5fd" },
  home:      { grad:"linear-gradient(135deg,#0ea5e9,#38bdf8)", light:"#f0f9ff", dot:"#0ea5e9", border:"#7dd3fc" },
};
const DEFAULT_CAT = { grad:"linear-gradient(135deg,#9ca3af,#d1d5db)", light:"#f9fafb", dot:"#9ca3af", border:"#e5e7eb" };

const PRI = {
  high:   { bg:"#fff1f2", color:"#f43f5e", border:"#fce7f3", label:"🔥 High"   },
  medium: { bg:"#fffbeb", color:"#d97706", border:"#fde68a", label:"⭐ Medium" },
  low:    { bg:"#f0fdf4", color:"#16a34a", border:"#bbf7d0", label:"🌿 Low"    },
};

// ── Progress Ring ────────────────────────────────────────────────────────────
function ProgressRing({ done, total }) {
  const pct  = total === 0 ? 0 : Math.round((done / total) * 100);
  const r    = 30;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div style={{ position:"relative", width:"72px", height:"72px", flexShrink:0 }}>
      <svg width="72" height="72" style={{ transform:"rotate(-90deg)" }}>
        <circle cx="36" cy="36" r={r} fill="none" stroke="#fce7f3" strokeWidth="6"/>
        <circle cx="36" cy="36" r={r} fill="none"
          stroke="url(#rg)" strokeWidth="6"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          style={{ transition:"stroke-dasharray 0.5s ease" }}
        />
        <defs>
          <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f43f5e"/>
            <stop offset="100%" stopColor="#ec4899"/>
          </linearGradient>
        </defs>
      </svg>
      <div style={{
        position:"absolute", inset:0,
        display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
      }}>
        <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"16px", fontWeight:700, color:"#f43f5e", lineHeight:1 }}>{pct}%</span>
        <span style={{ fontSize:"8px", color:"#9ca3af", marginTop:"1px" }}>done</span>
      </div>
    </div>
  );
}

// ── Ideas Bottom Sheet ───────────────────────────────────────────────────────
function IdeasSheet({ onSelect, onClose, existingTitles }) {
  const [activeTab, setActiveTab] = useState("travel");
  const ideas = BUCKET_IDEAS[activeTab] || [];

  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", backdropFilter:"blur(6px)", zIndex:200 }}/>
      <div style={{
        position:"fixed", bottom:0, left:0, right:0, zIndex:201,
        background:"white", borderRadius:"28px 28px 0 0",
        maxHeight:"85vh", display:"flex", flexDirection:"column",
        boxShadow:"0 -12px 48px rgba(244,63,94,0.18)",
        animation:"sheetUp 0.34s cubic-bezier(0.34,1.2,0.64,1)",
      }}>
        {/* Handle */}
        <div style={{ display:"flex", justifyContent:"center", padding:"12px 0 0" }}>
          <div style={{ width:"44px", height:"5px", borderRadius:"3px", background:"#e5e7eb" }}/>
        </div>

        {/* Header */}
        <div style={{ padding:"14px 20px 12px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"20px", fontWeight:700, color:"#1f2937" }}>💡 Dream Ideas</div>
            <div style={{ fontSize:"11px", color:"#9ca3af", marginTop:"2px" }}>Tap to add to your list</div>
          </div>
          <button onClick={onClose} style={{ width:"32px", height:"32px", borderRadius:"50%", background:"#f3f4f6", border:"none", cursor:"pointer", fontSize:"14px", color:"#6b7280", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
        </div>

        {/* Category tabs */}
        <div style={{ display:"flex", gap:"8px", padding:"0 16px 10px", overflowX:"auto" }}>
          {BUCKET_CATEGORIES.map(c => {
            const cc = CAT_COLORS[c.id] || DEFAULT_CAT;
            const active = activeTab === c.id;
            return (
              <button key={c.id} onClick={() => setActiveTab(c.id)} style={{
                flexShrink:0, padding:"7px 14px", borderRadius:"20px",
                fontSize:"12px", fontWeight:700, border:"none", cursor:"pointer",
                background: active ? cc.grad : "#f9fafb",
                color: active ? "white" : "#6b7280",
                boxShadow: active ? `0 3px 10px ${cc.dot}44` : "none",
                transition:"all 0.15s",
              }}>{c.emoji} {c.label}</button>
            );
          })}
        </div>

        {/* Ideas list */}
        <div style={{ overflowY:"auto", padding:"4px 16px 40px", flex:1, display:"flex", flexDirection:"column", gap:"8px" }}>
          {ideas.map((idea, i) => {
            const added = existingTitles.includes(idea.title);
            const cc = CAT_COLORS[activeTab] || DEFAULT_CAT;
            const pr = PRI[idea.priority] || PRI.medium;
            return (
              <button key={i} disabled={added}
                onClick={() => { onSelect({ ...idea, category: activeTab }); onClose(); }}
                style={{
                  display:"flex", alignItems:"center", gap:"12px",
                  padding:"13px 14px", borderRadius:"16px",
                  border:`1.5px solid ${added ? "#e5e7eb" : cc.border}`,
                  background: added ? "#f9fafb" : cc.light,
                  cursor: added ? "not-allowed" : "pointer",
                  textAlign:"left", opacity: added ? 0.55 : 1,
                  transition:"all 0.15s",
                }}
              >
                <div style={{
                  width:"36px", height:"36px", borderRadius:"12px", flexShrink:0,
                  background: added ? "#e5e7eb" : cc.grad,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:"16px",
                }}>
                  {BUCKET_CATEGORIES.find(c => c.id === activeTab)?.emoji}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:"13px", fontWeight:700, color: added ? "#9ca3af" : "#1f2937", marginBottom:"4px" }}>{idea.title}</div>
                  <span style={{ fontSize:"10px", padding:"2px 8px", borderRadius:"10px", background:pr.bg, color:pr.color, border:`1px solid ${pr.border}`, fontWeight:600 }}>{pr.label}</span>
                </div>
                <span style={{ fontSize:"20px", color: added ? "#d1d5db" : cc.dot, fontWeight:700 }}>{added ? "✓" : "+"}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ── Add Dream Bottom Sheet ───────────────────────────────────────────────────
function AddSheet({ initial, onSave, onClose, savingBucket }) {
  const [form, setForm] = useState(initial || { title:"", category:"travel", note:"", priority:"medium" });

  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", backdropFilter:"blur(6px)", zIndex:200 }}/>
      <div style={{
        position:"fixed", bottom:0, left:0, right:0, zIndex:201,
        background:"white", borderRadius:"28px 28px 0 0",
        padding:"0 0 40px",
        boxShadow:"0 -12px 48px rgba(244,63,94,0.18)",
        animation:"sheetUp 0.34s cubic-bezier(0.34,1.2,0.64,1)",
      }}>
        <div style={{ display:"flex", justifyContent:"center", padding:"12px 0 0" }}>
          <div style={{ width:"44px", height:"5px", borderRadius:"3px", background:"#e5e7eb" }}/>
        </div>
        <div style={{ padding:"14px 20px 0", display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"16px" }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"20px", fontWeight:700, color:"#1f2937" }}>✨ New Dream</div>
          <button onClick={onClose} style={{ width:"32px", height:"32px", borderRadius:"50%", background:"#f3f4f6", border:"none", cursor:"pointer", fontSize:"14px", color:"#6b7280" }}>✕</button>
        </div>

        <div style={{ padding:"0 20px", display:"flex", flexDirection:"column", gap:"12px" }}>
          <input
            type="text" placeholder="What's your dream together?" value={form.title}
            onChange={e => setForm(f => ({ ...f, title:e.target.value }))}
            autoFocus
            style={{ width:"100%", border:"2px solid #fce7f3", borderRadius:"16px", padding:"13px 16px", fontSize:"14px", color:"#374151", outline:"none", background:"#fff9fa", fontFamily:"inherit", fontWeight:600 }}
          />

          {/* Category grid */}
          <div>
            <div style={{ fontSize:"11px", color:"#9ca3af", fontWeight:700, marginBottom:"8px", letterSpacing:"0.5px", textTransform:"uppercase" }}>Category</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"6px" }}>
              {BUCKET_CATEGORIES.map(c => {
                const cc = CAT_COLORS[c.id] || DEFAULT_CAT;
                const active = form.category === c.id;
                return (
                  <button key={c.id} onClick={() => setForm(f => ({ ...f, category:c.id }))}
                    style={{
                      padding:"9px 6px", borderRadius:"14px",
                      border:`2px solid ${active ? cc.dot : "#f3f4f6"}`,
                      background: active ? cc.light : "#fafafa",
                      cursor:"pointer", textAlign:"center", transition:"all 0.12s",
                    }}
                  >
                    <div style={{ fontSize:"18px" }}>{c.emoji}</div>
                    <div style={{ fontSize:"10px", fontWeight:700, color: active ? cc.dot : "#9ca3af", marginTop:"2px" }}>{c.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority */}
          <div>
            <div style={{ fontSize:"11px", color:"#9ca3af", fontWeight:700, marginBottom:"8px", letterSpacing:"0.5px", textTransform:"uppercase" }}>Priority</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"6px" }}>
              {Object.entries(PRI).map(([key, p]) => (
                <button key={key} onClick={() => setForm(f => ({ ...f, priority:key }))}
                  style={{
                    padding:"9px 6px", borderRadius:"14px",
                    border:`2px solid ${form.priority === key ? p.color : "#f3f4f6"}`,
                    background: form.priority === key ? p.bg : "#fafafa",
                    cursor:"pointer", textAlign:"center", transition:"all 0.12s",
                  }}
                >
                  <div style={{ fontSize:"14px", fontWeight:800, color: form.priority === key ? p.color : "#9ca3af" }}>{p.label}</div>
                </button>
              ))}
            </div>
          </div>

          <textarea rows={2} placeholder="Add a note (optional)…" value={form.note}
            onChange={e => setForm(f => ({ ...f, note:e.target.value }))}
            style={{ width:"100%", border:"1.5px solid #fce7f3", borderRadius:"14px", padding:"11px 14px", fontSize:"13px", color:"#374151", outline:"none", background:"#fff9fa", resize:"none", fontFamily:"inherit" }}
          />

          <button
            onClick={() => { if (form.title.trim()) onSave(form); }}
            disabled={!form.title.trim() || savingBucket}
            style={{
              padding:"14px", borderRadius:"18px",
              background:"linear-gradient(135deg,#f43f5e,#ec4899)",
              color:"white", border:"none", cursor:"pointer",
              fontSize:"14px", fontWeight:800,
              boxShadow:"0 6px 20px rgba(244,63,94,0.38)",
              opacity: !form.title.trim() || savingBucket ? 0.5 : 1,
              transition:"opacity 0.15s",
            }}
          >
            {savingBucket ? <><Spinner/>Saving…</> : "💕 Save Dream"}
          </button>
        </div>
      </div>
    </>
  );
}

// ── Bucket Card ──────────────────────────────────────────────────────────────
function BucketCard({ item, togglingBucket, deletingBucket, savingNote, onToggle, onDelete, onSaveNote }) {
  const [editing, setEditing] = useState(false);
  const [note, setNote]       = useState(item.note || "");
  const cat = BUCKET_CATEGORIES.find(c => c.id === item.category);
  const cc  = CAT_COLORS[item.category] || DEFAULT_CAT;
  const pr  = PRI[item.priority] || PRI.medium;

  return (
    <div style={{
      borderRadius:"20px", overflow:"hidden",
      background:"white",
      border:`1.5px solid ${item.done ? "#f3f4f6" : cc.border}`,
      boxShadow: item.done ? "none" : `0 4px 18px ${cc.dot}18`,
      opacity: item.done ? 0.62 : 1,
      transition:"all 0.2s",
    }}>
      {/* Coloured top strip */}
      <div style={{ height:"5px", background: item.done ? "#e5e7eb" : cc.grad }}/>

      <div style={{ padding:"14px 14px 12px" }}>
        <div style={{ display:"flex", alignItems:"flex-start", gap:"12px" }}>

          {/* Category icon */}
          <div style={{
            width:"42px", height:"42px", borderRadius:"14px", flexShrink:0,
            background: item.done ? "#f3f4f6" : cc.light,
            border:`1.5px solid ${item.done ? "#e5e7eb" : cc.border}`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:"20px",
          }}>
            {item.done ? "✅" : cat?.emoji}
          </div>

          {/* Content */}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"8px" }}>
              <div style={{
                fontSize:"14px", fontWeight:700,
                color: item.done ? "#9ca3af" : "#1f2937",
                textDecoration: item.done ? "line-through" : "none",
                lineHeight:1.4,
              }}>{item.title}</div>

              <button onClick={() => onDelete(item._id)} disabled={deletingBucket === item._id}
                style={{ flexShrink:0, width:"24px", height:"24px", borderRadius:"50%", border:"none", background:"#f3f4f6", cursor:"pointer", color:"#9ca3af", fontSize:"11px", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background="#fee2e2"; e.currentTarget.style.color="#ef4444"; }}
                onMouseLeave={e => { e.currentTarget.style.background="#f3f4f6"; e.currentTarget.style.color="#9ca3af"; }}
              >
                {deletingBucket === item._id
                  ? <span style={{ width:"10px", height:"10px", border:"1.5px solid #fca5a5", borderTopColor:"#ef4444", borderRadius:"50%", animation:"bspin 0.7s linear infinite", display:"inline-block" }}/>
                  : "✕"}
              </button>
            </div>

            {/* Tags */}
            <div style={{ display:"flex", gap:"5px", marginTop:"6px", flexWrap:"wrap" }}>
              <span style={{ fontSize:"10px", padding:"2px 8px", borderRadius:"10px", background: item.done ? "#f3f4f6" : cc.light, color: item.done ? "#9ca3af" : cc.dot, border:`1px solid ${item.done ? "#e5e7eb" : cc.border}`, fontWeight:600 }}>
                {cat?.emoji} {cat?.label}
              </span>
              <span style={{ fontSize:"10px", padding:"2px 8px", borderRadius:"10px", background:pr.bg, color:pr.color, border:`1px solid ${pr.border}`, fontWeight:600 }}>
                {pr.label}
              </span>
            </div>

            {/* Note */}
            {editing ? (
              <div style={{ marginTop:"10px" }}>
                <textarea rows={2} value={note} onChange={e => setNote(e.target.value)} autoFocus
                  style={{ width:"100%", border:"1.5px solid #fce7f3", borderRadius:"12px", padding:"9px 12px", fontSize:"12px", color:"#374151", resize:"none", outline:"none", background:"#fff9fa", fontFamily:"inherit" }}
                />
                <div style={{ display:"flex", gap:"6px", marginTop:"6px" }}>
                  <button onClick={() => { onSaveNote(item._id, note); setEditing(false); }} disabled={savingNote === item._id}
                    style={{ padding:"5px 14px", background:"linear-gradient(135deg,#f43f5e,#ec4899)", color:"white", border:"none", borderRadius:"10px", fontSize:"11px", fontWeight:700, cursor:"pointer", opacity: savingNote === item._id ? 0.6 : 1 }}
                  >{savingNote === item._id ? <><Spinner/>Saving…</> : "Save"}</button>
                  <button onClick={() => setEditing(false)} style={{ padding:"5px 12px", background:"#f3f4f6", color:"#6b7280", border:"none", borderRadius:"10px", fontSize:"11px", cursor:"pointer" }}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ marginTop:"7px" }}>
                {item.note
                  ? <div onClick={() => { setEditing(true); setNote(item.note); }} style={{ display:"flex", gap:"5px", cursor:"pointer" }}>
                      <span style={{ fontSize:"10px", color:"#fda4af", flexShrink:0, marginTop:"1px" }}>📝</span>
                      <span style={{ fontSize:"11px", color:"#9ca3af", fontStyle:"italic", lineHeight:1.5 }}>{item.note}</span>
                    </div>
                  : <button onClick={() => { setEditing(true); setNote(""); }} style={{ fontSize:"11px", color:"#d1d5db", background:"none", border:"none", cursor:"pointer", padding:0, transition:"color 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.color="#fda4af"}
                      onMouseLeave={e => e.currentTarget.style.color="#d1d5db"}
                    >＋ Add note</button>
                }
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom action bar */}
      <div style={{
        borderTop:`1px solid ${item.done ? "#f3f4f6" : cc.border}`,
        padding:"10px 14px",
        background: item.done ? "#fafafa" : cc.light,
        display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <span style={{ fontSize:"11px", color: item.done ? "#9ca3af" : cc.dot, fontWeight:600 }}>
          {item.done ? "Completed! 🎉" : "In your dreams list"}
        </span>
        <button
          onClick={() => onToggle(item._id, item.done)}
          disabled={togglingBucket === item._id}
          style={{
            padding:"6px 16px", borderRadius:"12px", border:"none", cursor:"pointer",
            background: item.done ? "#f3f4f6" : cc.grad,
            color: item.done ? "#6b7280" : "white",
            fontSize:"11px", fontWeight:700,
            boxShadow: item.done ? "none" : `0 3px 10px ${cc.dot}44`,
            transition:"all 0.15s",
          }}
        >
          {togglingBucket === item._id
            ? <><Spinner/>{item.done ? "Undoing…" : "Marking…"}</>
            : item.done ? "↩ Undo" : "✓ Mark Done"}
        </button>
      </div>
    </div>
  );
}

// ── Main BucketTab ────────────────────────────────────────────────────────────
export default function BucketTab({
  buckets, coupleId,
  savingBucket, togglingBucket, deletingBucket, savingNote,
  onAdd, onToggle, onDelete, onSaveNote,
}) {
  const [showAdd,       setShowAdd]       = useState(false);
  const [showIdeas,     setShowIdeas]     = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [filterCat,     setFilterCat]     = useState("all");
  const [prefill,       setPrefill]       = useState(null);

  const done    = buckets.filter(b => b.done).length;
  const titles  = buckets.map(b => b.title);

  const filtered = filterCat === "all" ? buckets : buckets.filter(b => b.category === filterCat);
  const pending  = filtered.filter(b => !b.done).sort((a,b) =>
    ({ high:0, medium:1, low:2 }[a.priority]) - ({ high:0, medium:1, low:2 }[b.priority])
  );
  const completed = filtered.filter(b => b.done);

  const handleIdeaSelect = (idea) => {
    setPrefill({ title:idea.title, category:idea.category, priority:idea.priority, note:"" });
    setShowIdeas(false);
    setShowAdd(true);
  };

  const handleSave = async (form) => {
    await onAdd(form);
    setShowAdd(false);
    setPrefill(null);
  };

  return (
    <div className="max-w-2xl mx-auto px-3 py-4">
      <style>{`
        @keyframes bspin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes sheetUp{ from{opacity:0;transform:translateY(60px)} to{opacity:1;transform:translateY(0)} }
        .bcard { animation: fadeUp 0.32s cubic-bezier(0.34,1.3,0.64,1) both; }
        ::-webkit-scrollbar{ height:3px; }::-webkit-scrollbar-thumb{ background:#fda4af; border-radius:3px; }
      `}</style>

      {showIdeas && <IdeasSheet onSelect={handleIdeaSelect} onClose={() => setShowIdeas(false)} existingTitles={titles}/>}
      {showAdd   && <AddSheet  initial={prefill} onSave={handleSave} onClose={() => { setShowAdd(false); setPrefill(null); }} savingBucket={savingBucket}/>}

      {/* ── Hero header ── */}
      <div style={{
        background:"linear-gradient(135deg,#f43f5e 0%,#ec4899 55%,#f97316 100%)",
        borderRadius:"24px", padding:"20px 20px 18px",
        marginBottom:"16px",
        boxShadow:"0 8px 28px rgba(244,63,94,0.28)",
        position:"relative", overflow:"hidden",
      }}>
        <div style={{ position:"absolute", right:"-16px", top:"-16px", width:"100px", height:"100px", borderRadius:"50%", background:"rgba(255,255,255,0.08)" }}/>
        <div style={{ position:"absolute", right:"20px", bottom:"-24px", width:"80px", height:"80px", borderRadius:"50%", background:"rgba(255,255,255,0.06)" }}/>

        <div style={{ display:"flex", alignItems:"center", gap:"16px", position:"relative" }}>
          <ProgressRing done={done} total={buckets.length}/>
          <div style={{ flex:1, color:"white" }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"20px", fontWeight:700, lineHeight:1.2 }}>Dream Together</div>
            <div style={{ fontSize:"12px", opacity:0.88, marginTop:"5px" }}>
              {buckets.length === 0
                ? "Start adding your dreams 💫"
                : done === buckets.length && buckets.length > 0
                  ? "All dreams completed! 🎉"
                  : `${done} of ${buckets.length} completed`}
            </div>
            {/* Mini progress bar */}
            {buckets.length > 0 && (
              <div style={{ marginTop:"10px", height:"6px", background:"rgba(255,255,255,0.25)", borderRadius:"3px", overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${Math.round((done/buckets.length)*100)}%`, background:"white", borderRadius:"3px", transition:"width 0.5s ease" }}/>
              </div>
            )}
          </div>
        </div>

        {/* Mini stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"8px", marginTop:"16px" }}>
          {[
            { emoji:"🌟", value:buckets.length, label:"Total"    },
            { emoji:"✅", value:done,            label:"Done"     },
            { emoji:"💫", value:buckets.length - done, label:"Left" },
          ].map(s => (
            <div key={s.label} style={{ background:"rgba(255,255,255,0.18)", borderRadius:"14px", padding:"9px 6px", textAlign:"center" }}>
              <div style={{ fontSize:"14px" }}>{s.emoji}</div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"18px", fontWeight:700, color:"white", lineHeight:1 }}>{s.value}</div>
              <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.75)", marginTop:"1px" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Action buttons ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"14px" }}>
        <button onClick={() => { setPrefill(null); setShowAdd(true); }}
          style={{
            padding:"13px", borderRadius:"18px",
            background:"linear-gradient(135deg,#f43f5e,#ec4899)",
            color:"white", border:"none", cursor:"pointer",
            fontSize:"13px", fontWeight:700,
            boxShadow:"0 4px 16px rgba(244,63,94,0.32)",
            display:"flex", alignItems:"center", justifyContent:"center", gap:"6px",
          }}
        >
          <span style={{ fontSize:"16px" }}>＋</span> Add Dream
        </button>
        <button onClick={() => setShowIdeas(true)}
          style={{
            padding:"13px", borderRadius:"18px",
            background:"white",
            color:"#f43f5e", border:"2px solid #fce7f3", cursor:"pointer",
            fontSize:"13px", fontWeight:700,
            display:"flex", alignItems:"center", justifyContent:"center", gap:"6px",
          }}
        >
          <span style={{ fontSize:"16px" }}>💡</span> Get Ideas
        </button>
      </div>

      {/* ── Category filter pills ── */}
      <div style={{ display:"flex", gap:"8px", overflowX:"auto", paddingBottom:"12px", marginBottom:"4px" }}>
        <button onClick={() => setFilterCat("all")} style={{
          flexShrink:0, padding:"7px 16px", borderRadius:"20px", border:"none", cursor:"pointer",
          fontSize:"11px", fontWeight:700, transition:"all 0.15s",
          background: filterCat === "all" ? "linear-gradient(135deg,#f43f5e,#ec4899)" : "white",
          color: filterCat === "all" ? "white" : "#6b7280",
          boxShadow: filterCat === "all" ? "0 3px 10px rgba(244,63,94,0.3)" : "0 1px 4px rgba(0,0,0,0.06)",
        }}>All {buckets.length > 0 && `(${buckets.length})`}</button>
        {BUCKET_CATEGORIES.map(cat => {
          const cnt = buckets.filter(b => b.category === cat.id).length;
          if (!cnt) return null;
          const cc = CAT_COLORS[cat.id] || DEFAULT_CAT;
          const active = filterCat === cat.id;
          return (
            <button key={cat.id} onClick={() => setFilterCat(cat.id)} style={{
              flexShrink:0, padding:"7px 14px", borderRadius:"20px", border:"none", cursor:"pointer",
              fontSize:"11px", fontWeight:700, transition:"all 0.15s",
              background: active ? cc.grad : "white",
              color: active ? "white" : "#6b7280",
              boxShadow: active ? `0 3px 10px ${cc.dot}44` : "0 1px 4px rgba(0,0,0,0.06)",
              display:"flex", alignItems:"center", gap:"4px",
            }}>
              {cat.emoji} {cat.label}
              <span style={{ background: active ? "rgba(255,255,255,0.25)" : "#f3f4f6", color: active ? "white" : "#9ca3af", padding:"0 5px", borderRadius:"8px", fontSize:"9px" }}>{cnt}</span>
            </button>
          );
        })}
      </div>

      {/* ── Empty state ── */}
      {buckets.length === 0 && (
        <div style={{ textAlign:"center", padding:"52px 0" }}>
          <div style={{ fontSize:"52px", marginBottom:"14px" }}>🌟</div>
          <div style={{ fontFamily:"'Playfair Display',serif", color:"#f43f5e", fontSize:"20px", fontWeight:700, marginBottom:"8px" }}>No dreams yet</div>
          <div style={{ fontSize:"13px", color:"#9ca3af", marginBottom:"20px" }}>Start adding things you want to do together!</div>
          <button onClick={() => setShowIdeas(true)} style={{ padding:"12px 24px", borderRadius:"16px", background:"linear-gradient(135deg,#f43f5e,#ec4899)", color:"white", border:"none", cursor:"pointer", fontSize:"13px", fontWeight:700, boxShadow:"0 4px 16px rgba(244,63,94,0.3)" }}>
            💡 Browse Ideas
          </button>
        </div>
      )}

      {/* ── No results for filter ── */}
      {buckets.length > 0 && pending.length === 0 && completed.length === 0 && (
        <div style={{ textAlign:"center", padding:"36px 0" }}>
          <div style={{ fontSize:"36px", marginBottom:"8px" }}>🔍</div>
          <div style={{ fontSize:"13px", color:"#9ca3af" }}>No items in this category.</div>
        </div>
      )}

      {/* ── Pending cards ── */}
      <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
        {pending.map((item, i) => (
          <div key={item._id} className="bcard" style={{ animationDelay:`${i * 45}ms` }}>
            <BucketCard item={item} togglingBucket={togglingBucket} deletingBucket={deletingBucket} savingNote={savingNote} onToggle={onToggle} onDelete={onDelete} onSaveNote={onSaveNote}/>
          </div>
        ))}
      </div>

      {/* ── Completed section ── */}
      {completed.length > 0 && (
        <div style={{ marginTop:"20px" }}>
          <button onClick={() => setShowCompleted(v => !v)} style={{
            width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:"13px 16px", borderRadius:"16px",
            background:"linear-gradient(135deg,#f0fdf4,#dcfce7)",
            border:"1.5px solid #bbf7d0", cursor:"pointer",
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
              <span style={{ fontSize:"18px" }}>🎉</span>
              <span style={{ fontSize:"13px", fontWeight:700, color:"#16a34a" }}>Completed Dreams ({completed.length})</span>
            </div>
            <span style={{ fontSize:"12px", color:"#16a34a", fontWeight:700 }}>{showCompleted ? "▲ Hide" : "▼ Show"}</span>
          </button>

          {showCompleted && (
            <div style={{ display:"flex", flexDirection:"column", gap:"12px", marginTop:"12px" }}>
              {completed.map((item, i) => (
                <div key={item._id} className="bcard" style={{ animationDelay:`${i * 45}ms` }}>
                  <BucketCard item={item} togglingBucket={togglingBucket} deletingBucket={deletingBucket} savingNote={savingNote} onToggle={onToggle} onDelete={onDelete} onSaveNote={onSaveNote}/>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <p style={{ textAlign:"center", fontSize:"11px", color:"#fda4af", marginTop:"24px", fontStyle:"italic", fontFamily:"'Playfair Display',serif" }}>
        Dream it. Do it. Together. 💕
      </p>
    </div>
  );
}