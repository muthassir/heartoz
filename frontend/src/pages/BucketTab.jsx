// client/src/pages/BucketTab.jsx
import { useState } from "react";
import { BUCKET_CATEGORIES, BUCKET_IDEAS } from "../lib/constants";

function Spinner() {
  return <span style={{display:"inline-block",width:"14px",height:"14px",border:"2px solid rgba(255,255,255,0.4)",borderTopColor:"white",borderRadius:"50%",animation:"spin 0.7s linear infinite",verticalAlign:"middle",marginRight:"6px"}}/>;
}

const PRIORITY_STYLE = {
  high:   { bar:"#f43f5e", bg:"#fff1f2", text:"#f43f5e", border:"#fce7f3", label:"🔥 High"   },
  medium: { bar:"#f59e0b", bg:"#fffbeb", text:"#d97706", border:"#fde68a", label:"⭐ Medium" },
  low:    { bar:"#10b981", bg:"#f0fdf4", text:"#16a34a", border:"#bbf7d0", label:"🌿 Low"    },
};

// ── Ideas Drawer ──────────────────────────────────────────────────────────────
function IdeasDrawer({ onSelect, onClose, existingTitles }) {
  const [activeTab, setActiveTab] = useState("travel");
  const ideas = BUCKET_IDEAS[activeTab] || [];

  return (
    <>
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",backdropFilter:"blur(4px)",zIndex:200}} onClick={onClose}/>
      <div style={{
        position:"fixed",bottom:0,left:0,right:0,zIndex:201,
        background:"white",borderRadius:"24px 24px 0 0",
        maxHeight:"82vh",display:"flex",flexDirection:"column",
        boxShadow:"0 -8px 40px rgba(244,63,94,0.15)",
        animation:"slideUp 0.32s cubic-bezier(0.34,1.2,0.64,1)",
      }}>
        <div style={{display:"flex",justifyContent:"center",padding:"12px 0 0"}}>
          <div style={{width:"40px",height:"4px",borderRadius:"2px",background:"#e5e7eb"}}/>
        </div>
        <div style={{padding:"12px 20px 10px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid #fce7f3"}}>
          <div>
            <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:"20px",fontWeight:700,color:"#1f2937",margin:0}}>💡 Bucket List Ideas</h3>
            <p style={{fontSize:"12px",color:"#9ca3af",margin:"2px 0 0"}}>Tap any idea to add it to your list</p>
          </div>
          <button onClick={onClose} style={{width:"30px",height:"30px",borderRadius:"50%",background:"#f3f4f6",border:"none",cursor:"pointer",fontSize:"14px",color:"#6b7280",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        <div style={{display:"flex",gap:"8px",padding:"12px 16px 8px",overflowX:"auto",flexShrink:0}}>
          {BUCKET_CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setActiveTab(c.id)} style={{
              flexShrink:0,padding:"6px 14px",borderRadius:"20px",
              fontSize:"12px",fontWeight:700,border:"none",cursor:"pointer",transition:"all 0.15s",
              background:activeTab===c.id?"linear-gradient(135deg,#f43f5e,#ec4899)":"#f9fafb",
              color:activeTab===c.id?"white":"#6b7280",
              boxShadow:activeTab===c.id?"0 2px 8px rgba(244,63,94,0.3)":"none",
            }}>{c.emoji} {c.label}</button>
          ))}
        </div>
        <div style={{overflowY:"auto",padding:"4px 16px 32px",flex:1}}>
          <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
            {ideas.map((idea, i) => {
              const alreadyAdded = existingTitles.includes(idea.title);
              const ps = PRIORITY_STYLE[idea.priority] || PRIORITY_STYLE.medium;
              return (
                <button key={i} disabled={alreadyAdded}
                  onClick={() => { onSelect({...idea,category:activeTab}); onClose(); }}
                  style={{
                    display:"flex",alignItems:"center",justifyContent:"space-between",gap:"12px",
                    padding:"12px 14px",borderRadius:"14px",
                    border:alreadyAdded?"1px solid #e5e7eb":"1px solid rgba(253,164,175,0.25)",
                    background:alreadyAdded?"#f9fafb":"white",
                    cursor:alreadyAdded?"not-allowed":"pointer",textAlign:"left",
                    transition:"all 0.15s",opacity:alreadyAdded?0.5:1,
                    boxShadow:alreadyAdded?"none":"0 2px 8px rgba(244,63,94,0.06)",
                    borderLeft:`3px solid ${alreadyAdded?"#e5e7eb":ps.bar}`,
                  }}
                  onMouseEnter={e=>{ if (!alreadyAdded) e.currentTarget.style.borderColor=ps.bar; }}
                  onMouseLeave={e=>{ if (!alreadyAdded) e.currentTarget.style.borderColor="rgba(253,164,175,0.25)"; }}
                >
                  <div style={{flex:1}}>
                    <div style={{fontSize:"13px",fontWeight:600,color:alreadyAdded?"#9ca3af":"#1f2937"}}>{idea.title}</div>
                    <div style={{fontSize:"11px",marginTop:"3px"}}>
                      <span style={{padding:"2px 8px",borderRadius:"10px",background:ps.bg,color:ps.text,border:`1px solid ${ps.border}`}}>{ps.label}</span>
                    </div>
                  </div>
                  <div style={{fontSize:"18px",flexShrink:0,color:alreadyAdded?"#d1d5db":"#fda4af"}}>{alreadyAdded?"✓":"+"}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Bucket Item Card ──────────────────────────────────────────────────────────
function BucketItem({ item, togglingBucket, deletingBucket, savingNote, onToggle, onDelete, onSaveNote }) {
  const [isEditing, setIsEditing] = useState(false);
  const [noteText,  setNoteText]  = useState(item.note || "");
  const cat = BUCKET_CATEGORIES.find(c => c.id === item.category);
  const ps  = PRIORITY_STYLE[item.priority] || PRIORITY_STYLE.medium;

  return (
    <div style={{
      background:"white", borderRadius:"16px",
      border:"1px solid #fce7f3",
      boxShadow: item.done ? "none" : "0 3px 14px rgba(244,63,94,0.07)",
      overflow:"hidden",
      opacity: item.done ? 0.65 : 1,
      transition:"all 0.2s",
    }}
    onMouseEnter={e=>{ if (!item.done) e.currentTarget.style.boxShadow="0 6px 24px rgba(244,63,94,0.12)"; }}
    onMouseLeave={e=>{ e.currentTarget.style.boxShadow=item.done?"none":"0 3px 14px rgba(244,63,94,0.07)"; }}
    >
      {/* ── Priority colour bar ── */}
      <div style={{height:"4px", background: item.done ? "#e5e7eb" : ps.bar, transition:"background 0.3s"}}/>

      <div style={{padding:"14px 14px 12px"}}>
        <div style={{display:"flex",alignItems:"flex-start",gap:"12px"}}>

          {/* Checkbox */}
          <button
            onClick={() => onToggle(item._id, item.done)}
            disabled={togglingBucket===item._id}
            style={{
              flexShrink:0, marginTop:"2px",
              width:"22px", height:"22px", borderRadius:"50%",
              border: item.done ? "none" : `2px solid ${ps.bar}`,
              background: item.done ? "linear-gradient(135deg,#f43f5e,#ec4899)" : "white",
              display:"flex",alignItems:"center",justifyContent:"center",
              cursor:"pointer",transition:"all 0.2s",
              boxShadow: item.done ? "0 2px 6px rgba(244,63,94,0.3)" : "none",
            }}
          >
            {togglingBucket===item._id
              ? <span style={{width:"10px",height:"10px",border:"2px solid #fda4af",borderTopColor:"#f43f5e",borderRadius:"50%",animation:"spin 0.7s linear infinite",display:"inline-block"}}/>
              : item.done && <span style={{fontSize:"11px",color:"white"}}>✓</span>}
          </button>

          {/* Content */}
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:"8px"}}>
              <p style={{
                fontSize:"14px",fontWeight:700,
                color: item.done ? "#9ca3af" : "#1f2937",
                textDecoration: item.done ? "line-through" : "none",
                lineHeight:"1.35", margin:0,
              }}>{item.title}</p>

              {/* Delete */}
              <button onClick={() => onDelete(item._id)} disabled={deletingBucket===item._id}
                style={{color:"#d1d5db",background:"none",border:"none",cursor:"pointer",fontSize:"12px",flexShrink:0,padding:"0",transition:"color 0.15s"}}
                onMouseEnter={e=>e.currentTarget.style.color="#ef4444"}
                onMouseLeave={e=>e.currentTarget.style.color="#d1d5db"}
              >
                {deletingBucket===item._id
                  ? <span style={{width:"10px",height:"10px",border:"1.5px solid #fca5a5",borderTopColor:"#ef4444",borderRadius:"50%",animation:"spin 0.7s linear infinite",display:"inline-block"}}/>
                  : "✕"}
              </button>
            </div>

            {/* Tags row */}
            <div style={{display:"flex",alignItems:"center",gap:"6px",marginTop:"6px",flexWrap:"wrap"}}>
              <span style={{fontSize:"10px",padding:"2px 8px",borderRadius:"10px",background:"#fff1f2",color:"#f43f5e",border:"1px solid #fce7f3"}}>{cat?.emoji} {cat?.label}</span>
              <span style={{fontSize:"10px",padding:"2px 8px",borderRadius:"10px",background:ps.bg,color:ps.text,border:`1px solid ${ps.border}`}}>{ps.label}</span>
            </div>

            {/* Note */}
            {isEditing ? (
              <div style={{marginTop:"10px"}}>
                <textarea rows={2} value={noteText} onChange={e=>setNoteText(e.target.value)} autoFocus
                  style={{width:"100%",border:"1px solid #fce7f3",borderRadius:"10px",padding:"8px 10px",fontSize:"12px",color:"#6b7280",resize:"none",outline:"none",background:"#fff9fa",fontFamily:"inherit"}}
                />
                <div style={{display:"flex",gap:"6px",marginTop:"6px"}}>
                  <button onClick={()=>{onSaveNote(item._id,noteText);setIsEditing(false);}} disabled={savingNote===item._id}
                    style={{padding:"5px 14px",background:"linear-gradient(135deg,#f43f5e,#ec4899)",color:"white",border:"none",borderRadius:"8px",fontSize:"11px",fontWeight:700,cursor:"pointer",opacity:savingNote===item._id?0.6:1}}
                  >{savingNote===item._id?<><Spinner/>Saving…</>:"Save"}</button>
                  <button onClick={()=>setIsEditing(false)} style={{padding:"5px 12px",background:"#f3f4f6",color:"#6b7280",border:"none",borderRadius:"8px",fontSize:"11px",cursor:"pointer"}}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{marginTop:"8px"}}>
                {item.note
                  ? <div style={{display:"flex",alignItems:"flex-start",gap:"5px",cursor:"pointer"}} onClick={()=>{setIsEditing(true);setNoteText(item.note);}}>
                      <span style={{fontSize:"10px",color:"#fda4af",flexShrink:0,marginTop:"1px"}}>📝</span>
                      <p style={{fontSize:"11px",color:"#9ca3af",fontStyle:"italic",margin:0,lineHeight:"1.5"}}>{item.note}</p>
                    </div>
                  : <button onClick={()=>{setIsEditing(true);setNoteText("");}} style={{fontSize:"11px",color:"#d1d5db",background:"none",border:"none",cursor:"pointer",padding:"0",transition:"color 0.15s"}}
                      onMouseEnter={e=>e.currentTarget.style.color="#fda4af"}
                      onMouseLeave={e=>e.currentTarget.style.color="#d1d5db"}
                    >＋ Add note</button>
                }
              </div>
            )}
          </div>
        </div>
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
  const [showForm,       setShowForm]     = useState(false);
  const [showIdeas,      setShowIdeas]    = useState(false);
  const [showCompleted,  setShowCompleted]= useState(false);
  const [form,           setForm]         = useState({title:"",category:"travel",note:"",priority:"medium"});
  const [filterCat,      setFilterCat]    = useState("all");

  const bucketDone     = buckets.filter(b => b.done).length;
  const existingTitles = buckets.map(b => b.title);

  const allFiltered = (filterCat==="all" ? buckets : buckets.filter(b=>b.category===filterCat));
  const pending     = allFiltered.filter(b=>!b.done).sort((a,b)=>({high:0,medium:1,low:2}[a.priority])-({high:0,medium:1,low:2}[b.priority]));
  const completed   = allFiltered.filter(b=>b.done);

  const handleIdeaSelect = (idea) => {
    setForm({title:idea.title,category:idea.category,priority:idea.priority,note:""});
    setShowForm(true);
    setTimeout(()=>window.scrollTo({top:0,behavior:"smooth"}),100);
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
        @keyframes slideIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(50px)}to{opacity:1;transform:translateY(0)}}
        .si{animation:slideIn 0.32s cubic-bezier(0.34,1.4,0.64,1) both;}
        .mb{animation:slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1);}
      `}</style>

      {showIdeas && <IdeasDrawer onSelect={handleIdeaSelect} onClose={()=>setShowIdeas(false)} existingTitles={existingTitles}/>}

      {/* Category filter */}
      <div style={{display:"flex",gap:"8px",overflowX:"auto",paddingBottom:"4px"}}>
        <button onClick={()=>setFilterCat("all")} style={{flexShrink:0,padding:"6px 14px",borderRadius:"20px",border:"none",cursor:"pointer",fontSize:"12px",fontWeight:700,transition:"all 0.15s",background:filterCat==="all"?"linear-gradient(135deg,#f43f5e,#ec4899)":"white",color:filterCat==="all"?"white":"#6b7280",boxShadow:filterCat==="all"?"0 2px 8px rgba(244,63,94,0.3)":"0 1px 4px rgba(0,0,0,0.06)"}}>All {buckets.length}</button>
        {BUCKET_CATEGORIES.map(cat=>{
          const cnt=buckets.filter(b=>b.category===cat.id).length;
          return (
            <button key={cat.id} onClick={()=>setFilterCat(cat.id)} style={{flexShrink:0,padding:"6px 14px",borderRadius:"20px",border:"none",cursor:"pointer",fontSize:"12px",fontWeight:700,transition:"all 0.15s",background:filterCat===cat.id?"linear-gradient(135deg,#f43f5e,#ec4899)":"white",color:filterCat===cat.id?"white":"#6b7280",boxShadow:filterCat===cat.id?"0 2px 8px rgba(244,63,94,0.3)":"0 1px 4px rgba(0,0,0,0.06)",display:"flex",alignItems:"center",gap:"4px"}}>
              {cat.emoji} {cat.label}
              {cnt>0&&<span style={{background:filterCat===cat.id?"rgba(255,255,255,0.25)":"#fff1f2",color:filterCat===cat.id?"white":"#f43f5e",padding:"0 5px",borderRadius:"8px",fontSize:"10px"}}>{cnt}</span>}
            </button>
          );
        })}
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"8px"}} className="bg-pink-700 rounded p-2">
        {[{label:"Total",value:buckets.length,emoji:"🌟"},{label:"Done",value:bucketDone,emoji:"✅"},{label:"Left",value:buckets.length-bucketDone,emoji:"💫"}].map(s=>(
          <div key={s.label} style={{background:"white",borderRadius:"14px",padding:"10px",border:"1px solid #fce7f3",textAlign:"center",boxShadow:"0 2px 8px rgba(244,63,94,0.06)"}}>
            <div style={{fontSize:"18px"}}>{s.emoji}</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:"20px",fontWeight:700,color:"#f43f5e"}}>{s.value}</div>
            <div style={{fontSize:"10px",color:"#9ca3af"}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
        <button onClick={()=>setShowForm(p=>!p)} style={{padding:"12px",borderRadius:"16px",border:"2px dashed #fda4af",cursor:"pointer",fontSize:"13px",fontWeight:700,color:"#f43f5e",background:"white",transition:"all 0.15s"}}
          onMouseEnter={e=>{e.currentTarget.style.background="#fff1f2";}}
          onMouseLeave={e=>{e.currentTarget.style.background="white";}}
        >{showForm?"✕ Cancel":"＋ Add Dream"}</button>
        <button onClick={()=>setShowIdeas(true)} style={{padding:"12px",borderRadius:"16px",border:"2px solid #fce7f3",cursor:"pointer",fontSize:"13px",fontWeight:700,color:"#f43f5e",background:"#fff1f2",transition:"all 0.15s"}}
          onMouseEnter={e=>{e.currentTarget.style.background="#fce7f3";}}
          onMouseLeave={e=>{e.currentTarget.style.background="#fff1f2";}}
        >💡 Get Ideas</button>
      </div>

      {/* Add form */}
      {showForm && (
        <div style={{background:"white",borderRadius:"20px",border:"1px solid #fce7f3",boxShadow:"0 4px 20px rgba(244,63,94,0.1)",padding:"16px"}} className="mb">
          <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:"18px",fontWeight:700,color:"#1f2937",marginBottom:"12px"}}>✨ New Dream</h3>
          <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
            <input type="text" placeholder="What's your dream?" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}
              style={{width:"100%",border:"1px solid #fce7f3",borderRadius:"12px",padding:"10px 14px",fontSize:"13px",color:"#374151",outline:"none",background:"#fff9fa",fontFamily:"inherit"}}
            />
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
              <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} style={{border:"1px solid #fce7f3",borderRadius:"12px",padding:"10px 14px",fontSize:"13px",color:"#374151",outline:"none",background:"#fff9fa"}}>
                {BUCKET_CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
              </select>
              <select value={form.priority} onChange={e=>setForm(f=>({...f,priority:e.target.value}))} style={{border:"1px solid #fce7f3",borderRadius:"12px",padding:"10px 14px",fontSize:"13px",color:"#374151",outline:"none",background:"#fff9fa"}}>
                <option value="high">🔥 High</option>
                <option value="medium">⭐ Medium</option>
                <option value="low">🌿 Low</option>
              </select>
            </div>
            <textarea rows={2} placeholder="Note (optional)" value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))}
              style={{width:"100%",border:"1px solid #fce7f3",borderRadius:"12px",padding:"10px 14px",fontSize:"13px",color:"#374151",outline:"none",background:"#fff9fa",resize:"none",fontFamily:"inherit"}}
            />
            <button onClick={handleAdd} disabled={!form.title.trim()||savingBucket}
              style={{padding:"12px",borderRadius:"14px",background:"linear-gradient(135deg,#f43f5e,#ec4899)",color:"white",border:"none",cursor:"pointer",fontSize:"13px",fontWeight:700,boxShadow:"0 4px 14px rgba(244,63,94,0.35)",opacity:!form.title.trim()||savingBucket?0.5:1}}
            >{savingBucket?<><Spinner/>Saving…</>:"💕 Save Dream"}</button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {buckets.length===0 && (
        <div style={{textAlign:"center",padding:"48px 0"}}>
          <div style={{fontSize:"48px",marginBottom:"12px"}}>🌟</div>
          <p style={{fontFamily:"'Playfair Display',serif",color:"#fda4af",fontSize:"18px",fontStyle:"italic",marginBottom:"6px"}}>No dreams yet.</p>
          <p style={{fontSize:"13px",color:"#9ca3af"}}>Tap <strong>💡 Get Ideas</strong> to explore inspiration!</p>
        </div>
      )}

      {/* Empty category filter state */}
      {buckets.length>0 && pending.length===0 && completed.length===0 && (
        <div style={{textAlign:"center",padding:"32px 0"}}>
          <div style={{fontSize:"36px",marginBottom:"8px"}}>🔍</div>
          <p style={{fontSize:"13px",color:"#9ca3af"}}>No items in this category yet.</p>
        </div>
      )}

      {/* ── Pending items ── */}
      <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
        {pending.map((item,i)=>(
          <div key={item._id} className="si" style={{animationDelay:`${i*40}ms`}}>
            <BucketItem item={item} togglingBucket={togglingBucket} deletingBucket={deletingBucket} savingNote={savingNote} onToggle={onToggle} onDelete={onDelete} onSaveNote={onSaveNote}/>
          </div>
        ))}
      </div>

      {/* ── Completed section ── */}
      {completed.length>0 && (
        <div>
          <button onClick={()=>setShowCompleted(p=>!p)} style={{
            display:"flex",alignItems:"center",gap:"8px",width:"100%",
            padding:"10px 14px",borderRadius:"14px",border:"1px solid #e5e7eb",
            background:"#f9fafb",cursor:"pointer",transition:"all 0.15s",
          }}
          onMouseEnter={e=>e.currentTarget.style.background="#f3f4f6"}
          onMouseLeave={e=>e.currentTarget.style.background="#f9fafb"}
          >
            <span style={{fontSize:"16px"}}>✅</span>
            <span style={{fontSize:"13px",fontWeight:700,color:"#6b7280",flex:1,textAlign:"left"}}>Completed ({completed.length})</span>
            <span style={{fontSize:"12px",color:"#9ca3af"}}>{showCompleted?"▲ Hide":"▼ Show"}</span>
          </button>

          {showCompleted && (
            <div style={{display:"flex",flexDirection:"column",gap:"10px",marginTop:"10px"}}>
              {completed.map((item,i)=>(
                <div key={item._id} className="si" style={{animationDelay:`${i*40}ms`}}>
                  <BucketItem item={item} togglingBucket={togglingBucket} deletingBucket={deletingBucket} savingNote={savingNote} onToggle={onToggle} onDelete={onDelete} onSaveNote={onSaveNote}/>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}