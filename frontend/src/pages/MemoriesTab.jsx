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
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} @keyframes slideIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}} .si{animation:slideIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both;} .mb{animation:slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1);} @keyframes slideUp{from{opacity:0;transform:translateY(40px) scale(0.96)}to{opacity:1;transform:translateY(0) scale(1)}} .mo{animation:fadeIn 0.2s ease;} @keyframes fadeIn{from{opacity:0}to{opacity:1}} .tl{position:relative;} .tl::before{content:'';position:absolute;left:20px;top:0;bottom:0;width:2px;background:linear-gradient(180deg,#fda4af,#fbcfe8,transparent);border-radius:2px;}`}</style>

      {/* Lightbox */}
      {memoryLightbox && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 mo" onClick={() => setMemoryLightbox(null)}>
          <div className="relative max-w-lg w-full">
            <img src={memoryLightbox} alt="" className="w-full rounded-2xl max-h-[80vh] object-contain shadow-2xl"/>
            <button className="absolute top-2 right-2 w-8 h-8 bg-white/20 hover:bg-white/40 rounded-full text-white" onClick={() => setMemoryLightbox(null)}>✕</button>
          </div>
        </div>
      )}

      <input ref={memImgRef} type="file" accept="image/*" className="hidden" onChange={e => handleImage(e.target.files[0])}/>

      <button onClick={() => setShowForm(p => !p)} className="w-full py-3 rounded-2xl border-2 border-dashed border-rose-200 hover:border-rose-400 text-rose-400 text-sm font-semibold flex items-center justify-center gap-2 bg-white hover:bg-rose-50 transition-all">
        {showForm ? "✕ Cancel" : "＋ Add a Memory"}
      </button>

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

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          {label:"Memories",   value:memories.length,                                              emoji:"📸"},
          {label:"With Photos",value:memories.filter(m=>m.imageUrl).length,                       emoji:"🖼️"},
          {label:"This Year",  value:memories.filter(m=>m.date?.startsWith(new Date().getFullYear())).length, emoji:"🌸"},
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-2.5 border border-rose-100 text-center shadow-sm">
            <div className="text-lg">{s.emoji}</div>
            <div className="text-xl font-bold text-rose-500" style={{fontFamily:"'Playfair Display',serif"}}>{s.value}</div>
            <div className="text-gray-400 text-[10px]">{s.label}</div>
          </div>
        ))}
      </div>

      {memories.length === 0
        ? <div className="text-center py-16"><div className="text-5xl mb-3">📷</div><p className="text-rose-300 italic" style={{fontFamily:"'Playfair Display',serif"}}>Your story starts here.</p></div>
        : (
          <div className="tl space-y-4 pl-2 pt-2">
            {sortedMemories.map((mem, i) => (
              <div key={mem._id} className="si pl-10 relative" style={{animationDelay:`${i*60}ms`}}>
                <div className="absolute left-3 top-4 w-5 h-5 rounded-full bg-white border-2 border-rose-300 flex items-center justify-center text-xs shadow-sm z-10">{mem.mood}</div>
                <div className={`bg-white rounded-2xl border border-rose-100 shadow-sm overflow-hidden ${expandedMemory===mem._id ? "border-rose-200 shadow-md" : ""}`}>
                  {mem.imageUrl && (
                    <div className="relative h-36 overflow-hidden cursor-zoom-in" onClick={() => setMemoryLightbox(mem.imageUrl)}>
                      <img src={mem.imageUrl} alt={mem.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"/>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"/>
                    </div>
                  )}
                  <div className="p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs px-2 py-0.5 bg-rose-50 text-rose-400 rounded-full border border-rose-100">{mem.tag}</span>
                          <span className="text-xs text-gray-400">📅 {mem.date ? new Date(mem.date).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : ""}</span>
                        </div>
                        <h3 className="font-bold text-gray-800 text-sm" style={{fontFamily:"'Playfair Display',serif"}}>{mem.title}</h3>
                      </div>
                      <button onClick={() => onDelete(mem._id)} disabled={deletingMemory===mem._id} className="text-gray-200 hover:text-red-400 text-sm flex-shrink-0 disabled:opacity-40">
                        {deletingMemory===mem._id
                          ? <span style={{width:"10px",height:"10px",border:"2px solid #fca5a5",borderTopColor:"#ef4444",borderRadius:"50%",animation:"spin 0.7s linear infinite",display:"inline-block"}}/>
                          : "✕"}
                      </button>
                    </div>
                    {mem.note && (
                      <div className={`mt-2 overflow-hidden transition-all ${expandedMemory===mem._id ? "max-h-40" : "max-h-10"}`}>
                        <p className="text-xs text-gray-500 leading-relaxed italic">{mem.note}</p>
                      </div>
                    )}
                    {mem.note && mem.note.length > 80 && (
                      <button onClick={() => setExpandedMemory(expandedMemory===mem._id ? null : mem._id)} className="text-xs text-rose-400 mt-1">
                        {expandedMemory===mem._id ? "Show less ↑" : "Read more ↓"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}