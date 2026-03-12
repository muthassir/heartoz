// client/src/pages/ShoppingTab.jsx
import { useState } from "react";

function Spinner() {
  return <span style={{display:"inline-block",width:"14px",height:"14px",border:"2px solid rgba(255,255,255,0.4)",borderTopColor:"white",borderRadius:"50%",animation:"spin 0.7s linear infinite",verticalAlign:"middle",marginRight:"6px"}}/>;
}

const SHOP_CATEGORIES = [
  { id:"dress",     label:"Dresses",    emoji:"👗" },
  { id:"outfit",    label:"Outfits",    emoji:"👔" },
  { id:"shoes",     label:"Shoes",      emoji:"👟" },
  { id:"accessory", label:"Accessory",  emoji:"💍" },
  { id:"gift",      label:"Gifts",      emoji:"🎁" },
  { id:"beauty",    label:"Beauty",     emoji:"💄" },
  { id:"tech",      label:"Tech",       emoji:"📱" },
  { id:"other",     label:"Other",      emoji:"🛍️" },
];

const PRESET_IDEAS = {
  dress:     ["Floral midi dress","Little black dress","Matching couple outfits","Saree for the occasion","Evening gown","Summer sundress"],
  outfit:    ["Couple twinning set","Formal suit","Casual linen set","Denim jacket","Kurta for festivals","Sports set"],
  shoes:     ["White sneakers couple pair","Heels for date night","Sandals for beach","Formal shoes","Running shoes","Boots"],
  accessory: ["Promise rings","Matching bracelets","Couple necklaces","Sunglasses","Leather wallet","Handbag"],
  gift:      ["Personalised photo frame","Couple diary","Perfume set","Chocolate box","Surprise jewellery","Custom couple portrait"],
  beauty:    ["Skincare gift set","Perfume","Lip kit","Hair care set","Spa kit","Nail kit"],
  tech:      ["Wireless earbuds","Smart watch","Polaroid camera","Phone case couple set","Portable charger","Bluetooth speaker"],
  other:     ["Couple mugs","Throw blanket","Scented candles","Board game","Picnic basket","Custom calendar"],
};

// ── Preset Ideas Drawer ───────────────────────────────────────────────────────
function IdeasDrawer({ onSelect, onClose, existingTitles }) {
  const [activeTab, setActiveTab] = useState("dress");
  const ideas = PRESET_IDEAS[activeTab] || [];

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
            <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:"20px",fontWeight:700,color:"#1f2937",margin:0}}>🛍️ Shop Ideas</h3>
            <p style={{fontSize:"12px",color:"#9ca3af",margin:"2px 0 0"}}>Tap to add to your shopping list</p>
          </div>
          <button onClick={onClose} style={{width:"30px",height:"30px",borderRadius:"50%",background:"#f3f4f6",border:"none",cursor:"pointer",fontSize:"14px",color:"#6b7280",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        {/* Category tabs */}
        <div style={{display:"flex",gap:"8px",padding:"12px 16px 8px",overflowX:"auto",flexShrink:0}}>
          {SHOP_CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setActiveTab(c.id)} style={{
              flexShrink:0,padding:"6px 14px",borderRadius:"20px",
              fontSize:"12px",fontWeight:700,border:"none",cursor:"pointer",transition:"all 0.15s",
              background: activeTab===c.id ? "linear-gradient(135deg,#f43f5e,#ec4899)" : "#f9fafb",
              color: activeTab===c.id ? "white" : "#6b7280",
              boxShadow: activeTab===c.id ? "0 2px 8px rgba(244,63,94,0.3)" : "none",
            }}>{c.emoji} {c.label}</button>
          ))}
        </div>
        {/* Ideas list */}
        <div style={{overflowY:"auto",padding:"4px 16px 32px",flex:1}}>
          <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
            {ideas.map((title, i) => {
              const already = existingTitles.includes(title);
              return (
                <button key={i} disabled={already} onClick={() => { onSelect({ title, category: activeTab }); onClose(); }}
                  style={{
                    display:"flex",alignItems:"center",justifyContent:"space-between",gap:"12px",
                    padding:"12px 14px",borderRadius:"14px",
                    border: already ? "1px solid #e5e7eb" : "1px solid rgba(253,164,175,0.25)",
                    background: already ? "#f9fafb" : "white",
                    cursor: already ? "not-allowed" : "pointer",
                    textAlign:"left",transition:"all 0.15s",opacity: already ? 0.5 : 1,
                    boxShadow: already ? "none" : "0 2px 8px rgba(244,63,94,0.06)",
                  }}
                  onMouseEnter={e => { if(!already) e.currentTarget.style.borderColor="#fda4af"; }}
                  onMouseLeave={e => { if(!already) e.currentTarget.style.borderColor="rgba(253,164,175,0.25)"; }}
                >
                  <span style={{fontSize:"13px",fontWeight:600,color: already ? "#9ca3af" : "#1f2937"}}>{title}</span>
                  <span style={{fontSize:"18px",color: already ? "#d1d5db" : "#fda4af"}}>{already ? "✓" : "+"}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main ShoppingTab ──────────────────────────────────────────────────────────
export default function ShoppingTab({
  items, user, partner,
  savingItem, togglingItem, deletingItem,
  onAdd, onToggle, onDelete,
}) {
  const [showForm,   setShowForm]   = useState(false);
  const [showIdeas,  setShowIdeas]  = useState(false);
  const [filterCat,  setFilterCat]  = useState("all");
  const [filterWho,  setFilterWho]  = useState("all");
  const [form, setForm] = useState({
    title:"", category:"gift", price:"", quantity:"1",
    link:"", wantedBy:"both", priority:"medium",
  });

  const p1Name = user?.name?.split(" ")[0]  || "You";
  const p2Name = partner?.name?.split(" ")[0] || "Partner";

  const existingTitles = items.map(i => i.title);
  const purchased = items.filter(i => i.purchased).length;

  // filter
  const filtered = items
    .filter(i => filterCat === "all" || i.category === filterCat)
    .filter(i => filterWho === "all" || i.wantedBy === filterWho || i.wantedBy === "both")
    .sort((a,b) => {
      if (a.purchased !== b.purchased) return a.purchased ? 1 : -1;
      return ({high:0,medium:1,low:2}[a.priority]) - ({high:0,medium:1,low:2}[b.priority]);
    });

  const handleIdeaSelect = (idea) => {
    setForm(f => ({ ...f, title: idea.title, category: idea.category }));
    setShowForm(true);
    setTimeout(() => window.scrollTo({ top: 0, behavior:"smooth" }), 100);
  };

  const handleAdd = async () => {
    if (!form.title.trim() || savingItem) return;
    await onAdd(form);
    setForm({title:"",category:"gift",price:"",quantity:"1",link:"",wantedBy:"both",priority:"medium"});
    setShowForm(false);
  };

  const totalValue = items
    .filter(i => !i.purchased && i.price)
    .reduce((s, i) => s + parseFloat(i.price || 0), 0);

  return (
    <div className="max-w-2xl mx-auto px-3 py-5 space-y-4">
      <style>{`
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes slideIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(50px)}to{opacity:1;transform:translateY(0)}}
        .si{animation:slideIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both;}
        .mb{animation:slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1);}
        .shop-card{transition:transform 0.18s,box-shadow 0.18s;}
        .shop-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(244,63,94,0.1);}
      `}</style>

      {showIdeas && <IdeasDrawer onSelect={handleIdeaSelect} onClose={() => setShowIdeas(false)} existingTitles={existingTitles}/>}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          {label:"Wishlist",   value:items.length,          emoji:"🛍️"},
          {label:"Purchased",  value:purchased,             emoji:"✅"},
          {label:"Budget",     value:totalValue > 0 ? `₹${Math.round(totalValue)}` : "—", emoji:"💰", raw:true},
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-2.5 border border-rose-100 text-center shadow-sm">
            <div className="text-lg">{s.emoji}</div>
            <div className="font-bold text-rose-500" style={{fontFamily:"'Playfair Display',serif", fontSize: s.raw ? "16px" : "20px"}}>{s.value}</div>
            <div className="text-gray-400 text-[10px]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => setShowForm(p => !p)} className="py-3 rounded-2xl border-2 border-dashed border-rose-200 hover:border-rose-400 text-rose-400 text-sm font-semibold flex items-center justify-center gap-2 bg-white hover:bg-rose-50 transition-all">
          {showForm ? "✕ Cancel" : "＋ Add Item"}
        </button>
        <button onClick={() => setShowIdeas(true)} className="py-3 rounded-2xl border-2 border-rose-200 hover:border-rose-400 text-rose-500 text-sm font-semibold flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 transition-all">
          💡 Get Ideas
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-4 space-y-3 mb">
          <h3 style={{fontFamily:"'Playfair Display',serif"}} className="text-lg font-bold text-gray-800">🛍️ Add to List</h3>

          <input type="text" placeholder="Item name…" value={form.title} onChange={e => setForm(f => ({...f,title:e.target.value}))}
            className="w-full border border-rose-100 rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder-gray-300 bg-rose-50/30" style={{outline:"none"}}/>

          <div className="grid grid-cols-2 gap-2">
            <select value={form.category} onChange={e => setForm(f => ({...f,category:e.target.value}))}
              className="border border-rose-100 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-rose-50/30" style={{outline:"none"}}>
              {SHOP_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
            </select>
            <select value={form.priority} onChange={e => setForm(f => ({...f,priority:e.target.value}))}
              className="border border-rose-100 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-rose-50/30" style={{outline:"none"}}>
              <option value="high">🔥 Must Have</option>
              <option value="medium">⭐ Want It</option>
              <option value="low">🌿 Nice to Have</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input type="text" placeholder="Price (₹)" value={form.price} onChange={e => setForm(f => ({...f,price:e.target.value}))}
              className="border border-rose-100 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-rose-50/30" style={{outline:"none"}}/>
            <input type="number" min="1" placeholder="Qty" value={form.quantity} onChange={e => setForm(f => ({...f,quantity:e.target.value}))}
              className="border border-rose-100 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-rose-50/30" style={{outline:"none"}}/>
          </div>

          <input type="url" placeholder="Link (optional)" value={form.link} onChange={e => setForm(f => ({...f,link:e.target.value}))}
            className="w-full border border-rose-100 rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder-gray-300 bg-rose-50/30" style={{outline:"none"}}/>

          {/* Who wants it */}
          <div>
            <p className="text-xs text-gray-400 mb-1.5 font-semibold">Who wants it?</p>
            <div className="flex gap-2">
              {[
                {val:"both",  label:"💑 Both"},
                {val:"p1",    label:`👸 ${p1Name}`},
                {val:"p2",    label:`🤴 ${p2Name}`},
              ].map(opt => (
                <button key={opt.val} onClick={() => setForm(f => ({...f,wantedBy:opt.val}))}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold border transition-all"
                  style={{
                    background: form.wantedBy===opt.val ? "linear-gradient(135deg,#f43f5e,#ec4899)" : "white",
                    color: form.wantedBy===opt.val ? "white" : "#6b7280",
                    border: form.wantedBy===opt.val ? "none" : "1px solid #fce7f3",
                  }}>{opt.label}</button>
              ))}
            </div>
          </div>

          <button onClick={handleAdd} disabled={!form.title.trim() || savingItem}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 text-white text-sm font-bold shadow-md disabled:opacity-40">
            {savingItem ? <><Spinner/>Saving…</> : "🛒 Add to List"}
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="space-y-2">
        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button onClick={() => setFilterCat("all")} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${filterCat==="all" ? "bg-rose-500 text-white border-rose-500" : "bg-white text-gray-500 border-rose-100"}`}>All</button>
          {SHOP_CATEGORIES.map(cat => {
            const cnt = items.filter(i => i.category === cat.id).length;
            if (!cnt) return null;
            return (
              <button key={cat.id} onClick={() => setFilterCat(cat.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1 transition-all ${filterCat===cat.id ? "bg-rose-500 text-white border-rose-500" : "bg-white text-gray-500 border-rose-100"}`}>
                {cat.emoji} {cat.label} <span className={`px-1 rounded-full ${filterCat===cat.id ? "bg-white/30" : "bg-rose-100 text-rose-400"}`}>{cnt}</span>
              </button>
            );
          })}
        </div>
        {/* Who filter */}
        <div className="flex gap-2">
          {[
            {val:"all", label:"👥 All"},
            {val:"p1",  label:`👸 ${p1Name}`},
            {val:"p2",  label:`🤴 ${p2Name}`},
            {val:"both",label:"💑 Both"},
          ].map(opt => (
            <button key={opt.val} onClick={() => setFilterWho(opt.val)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${filterWho===opt.val ? "bg-pink-500 text-white border-pink-500" : "bg-white text-gray-500 border-rose-100"}`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">🛍️</div>
          <p className="text-rose-300 italic mb-2" style={{fontFamily:"'Playfair Display',serif"}}>Your wishlist is empty.</p>
          <p className="text-gray-400 text-sm">Tap <strong>💡 Get Ideas</strong> for dress & gift inspiration!</p>
        </div>
      )}

      {/* Items list */}
      <div className="space-y-2.5">
        {filtered.map((item, idx) => {
          const cat = SHOP_CATEGORIES.find(c => c.id === item.category);
          const whoLabel = item.wantedBy==="both" ? "💑 Both" : item.wantedBy==="p1" ? `👸 ${p1Name}` : `🤴 ${p2Name}`;
          return (
            <div key={item._id || idx} className={`si shop-card bg-white rounded-2xl border shadow-sm overflow-hidden ${item.purchased ? "opacity-60" : ""} border-rose-100`}
              style={{animationDelay:`${idx*40}ms`}}>
              {/* Priority accent */}
              <div style={{height:"3px", background: item.priority==="high" ? "linear-gradient(90deg,#f43f5e,#fda4af)" : item.priority==="medium" ? "linear-gradient(90deg,#f59e0b,#fde68a)" : "linear-gradient(90deg,#10b981,#6ee7b7)"}}/>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button onClick={() => onToggle(item._id, item.purchased)} disabled={togglingItem===item._id}
                    className={`flex-shrink-0 mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all disabled:opacity-50 ${item.purchased ? "bg-rose-400 border-rose-400 text-white" : "border-rose-200 hover:border-rose-400"}`}>
                    {togglingItem===item._id
                      ? <span style={{width:"10px",height:"10px",border:"2px solid #fda4af",borderTopColor:"#f43f5e",borderRadius:"50%",animation:"spin 0.7s linear infinite",display:"inline-block"}}/>
                      : item.purchased && <span className="text-xs">✓</span>}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-bold ${item.purchased ? "line-through text-gray-400" : "text-gray-800"}`}>{item.title}</p>
                      <button onClick={() => onDelete(item._id)} disabled={deletingItem===item._id} className="text-gray-200 hover:text-red-400 text-sm flex-shrink-0 disabled:opacity-40">
                        {deletingItem===item._id
                          ? <span style={{width:"10px",height:"10px",border:"2px solid #fca5a5",borderTopColor:"#ef4444",borderRadius:"50%",animation:"spin 0.7s linear infinite",display:"inline-block"}}/>
                          : "✕"}
                      </button>
                    </div>

                    {/* Tags row */}
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span className="text-xs px-2 py-0.5 bg-rose-50 text-rose-400 rounded-full border border-rose-100">{cat?.emoji} {cat?.label}</span>
                      <span className="text-xs px-2 py-0.5 bg-pink-50 text-pink-400 rounded-full border border-pink-100">{whoLabel}</span>
                      {item.quantity && item.quantity !== "1" && (
                        <span className="text-xs px-2 py-0.5 bg-gray-50 text-gray-400 rounded-full border border-gray-100">×{item.quantity}</span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${item.priority==="high" ? "bg-red-50 text-red-400 border-red-100" : item.priority==="medium" ? "bg-amber-50 text-amber-500 border-amber-100" : "bg-emerald-50 text-emerald-500 border-emerald-100"}`}>
                        {item.priority==="high" ? "🔥 Must Have" : item.priority==="medium" ? "⭐ Want It" : "🌿 Nice to Have"}
                      </span>
                    </div>

                    {/* Price + link */}
                    <div className="flex items-center gap-3 mt-2">
                      {item.price && (
                        <span className="text-sm font-bold text-rose-500">₹{item.price}</span>
                      )}
                      {item.link && (
                        <a href={item.link} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:text-blue-600 flex items-center gap-1 underline">
                          🔗 View item
                        </a>
                      )}
                    </div>
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