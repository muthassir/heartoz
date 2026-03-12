// client/src/pages/DatesTab.jsx
import { useRef } from "react";
import { DATE_IDEAS, ALPHABET } from "../lib/constants";

export default function DatesTab({
  dates, coupleId, user,
  togglingDate, uploadingDate,
  onToggle, onPhoto,
}) {
  const dateFileRef = useRef();
  const [selected, setSelected] = [
    /* lifted to parent via props */ null, () => {},
  ];

  const totalDone = Object.values(dates).filter(d => d.done).length;

  // selected / modal state lives here
  const [sel, setSel] = [null, () => {}]; // placeholder — see below

  return (
    <_DatesTabInner
      dates={dates} coupleId={coupleId} user={user}
      togglingDate={togglingDate} uploadingDate={uploadingDate}
      onToggle={onToggle} onPhoto={onPhoto}
    />
  );
}

// Inner with its own local state
import { useState } from "react";
import * as API from "../lib/api";

function Spinner() {
  return <span style={{display:"inline-block",width:"14px",height:"14px",border:"2px solid rgba(255,255,255,0.4)",borderTopColor:"white",borderRadius:"50%",animation:"spin 0.7s linear infinite",verticalAlign:"middle",marginRight:"6px"}}/>;
}

function _DatesTabInner({ dates, coupleId, togglingDate, uploadingDate, onToggle, onPhoto }) {
  const [selected,  setSelected]  = useState(null);
  const [lightbox,  setLightbox]  = useState(null);
  const dateFileRef = useRef();

  const idea = selected ? DATE_IDEAS[selected] : null;
  const totalDone = Object.values(dates).filter(d => d.done).length;

  return (
    <div className="max-w-2xl mx-auto px-3 py-5">
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} @keyframes hf{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}} .hf{animation:hf 3s ease-in-out infinite;} .lc{transition:all 0.25s cubic-bezier(0.34,1.56,0.64,1);} .lc:hover{transform:translateY(-4px) scale(1.04);} .mo{animation:fadeIn 0.2s ease;} .mb{animation:slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1);} @keyframes fadeIn{from{opacity:0}to{opacity:1}} @keyframes slideUp{from{opacity:0;transform:translateY(40px) scale(0.96)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 mo" onClick={() => setLightbox(null)}>
          <div className="relative max-w-lg w-full">
            <img src={lightbox} alt="" className="w-full rounded-2xl max-h-[80vh] object-contain shadow-2xl"/>
            <button className="absolute top-2 right-2 w-8 h-8 bg-white/20 hover:bg-white/40 rounded-full text-white" onClick={() => setLightbox(null)}>✕</button>
          </div>
        </div>
      )}

      {/* Date Modal */}
      {selected && idea && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-end sm:items-center justify-center sm:p-4 mo" onClick={() => setSelected(null)}>
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl mb overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="relative h-48 bg-gradient-to-br from-rose-100 to-pink-50 flex items-center justify-center overflow-hidden">
              {uploadingDate === selected
                ? <div className="flex flex-col items-center gap-2"><span style={{width:"32px",height:"32px",border:"3px solid #fda4af",borderTopColor:"#f43f5e",borderRadius:"50%",animation:"spin 0.7s linear infinite",display:"inline-block"}}/><p className="text-rose-400 text-xs">Uploading…</p></div>
                : dates[selected]?.photo
                  ? <img src={dates[selected].photo} alt="" className="w-full h-full object-cover cursor-zoom-in" onClick={() => setLightbox(dates[selected].photo)}/>
                  : <div className="text-center"><div className="text-6xl hf">{idea.emoji}</div><p className="text-rose-300 text-xs mt-2 tracking-widest uppercase">No photo yet</p></div>
              }
              <button className="absolute top-3 right-3 w-8 h-8 bg-white/80 rounded-full text-gray-500 flex items-center justify-center" onClick={() => setSelected(null)}>✕</button>
              {dates[selected]?.done && <div className="absolute top-3 left-3 bg-rose-500 text-white text-xs px-2 py-1 rounded-full font-semibold">✓ Done!</div>}
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-rose-100 text-rose-500 font-bold text-xs flex items-center justify-center" style={{fontFamily:"'Playfair Display',serif"}}>{selected}</span>
                <h2 style={{fontFamily:"'Playfair Display',serif"}} className="text-xl font-bold text-gray-800">{idea.idea}</h2>
              </div>
              <p className="text-gray-500 text-sm">{idea.desc}</p>
              {dates[selected]?.doneAt && <p className="text-xs text-rose-400">📅 Done on {dates[selected].doneAt}</p>}
              <input ref={dateFileRef} type="file" accept="image/*" className="hidden" onChange={e => onPhoto(selected, e.target.files[0])}/>
              <button disabled={!!uploadingDate} className="w-full border-2 border-dashed border-rose-200 hover:border-rose-400 text-rose-400 rounded-xl py-3 text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50" onClick={() => dateFileRef.current.click()}>
                {uploadingDate === selected ? <><Spinner/>Uploading…</> : <>📷 {dates[selected]?.photo ? "Change Photo" : "Upload Date Photo"}</>}
              </button>
              <button onClick={() => onToggle(selected, dates[selected]?.done)} disabled={togglingDate === selected} className={`w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 ${dates[selected]?.done ? "bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-400" : "bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-md shadow-rose-200"}`}>
                {togglingDate === selected ? <><Spinner/>{dates[selected]?.done ? "Unmarking…" : "Marking done…"}</> : dates[selected]?.done ? "↩ Mark Not Done" : "💕 Mark as Done!"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
        {ALPHABET.map(letter => {
          const item = DATE_IDEAS[letter]; const d = dates[letter] || {}; const done = d.done; const hasPhoto = !!d.photo;
          return (
            <div key={letter} className="lc cursor-pointer" onClick={() => setSelected(letter)}>
              <div className={`relative rounded-2xl overflow-hidden border-2 aspect-square flex flex-col items-center justify-center ${done ? "border-rose-300 bg-gradient-to-br from-rose-400 to-pink-500 shadow-lg shadow-rose-200" : "border-rose-100 bg-white hover:border-rose-200 hover:shadow-md"}`}>
                {hasPhoto && <div className="absolute inset-0"><img src={d.photo} alt="" className={`w-full h-full object-cover ${done ? "opacity-30" : "opacity-20"}`}/></div>}
                <div className="relative z-10 text-center p-1">
                  <div className={`font-bold text-xl leading-none ${done ? "text-white" : "text-gray-700"}`} style={{fontFamily:"'Playfair Display',serif"}}>{letter}</div>
                  <div className="text-lg leading-none mt-0.5">{item.emoji}</div>
                  {done && <div className="text-white text-xs mt-1">✓</div>}
                  {hasPhoto && !done && <div className="text-rose-400 text-xs">📸</div>}
                </div>
              </div>
              <p className={`text-center text-[9px] sm:text-[10px] mt-1 leading-tight px-0.5 ${done ? "text-rose-500 font-semibold" : "text-gray-400"}`}>{item.idea.split(" ").slice(0,2).join(" ")}</p>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          {label:"Dates Done",  value:totalDone,                                            emoji:"💕", g:"from-rose-400 to-pink-500"},
          {label:"Photos",      value:Object.values(dates).filter(d=>d.photo).length,       emoji:"📸", g:"from-orange-400 to-rose-400"},
          {label:"To Go",       value:26-totalDone,                                         emoji:"✨", g:"from-pink-400 to-purple-400"},
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-3 border border-rose-100 text-center shadow-sm">
            <div className="text-xl">{s.emoji}</div>
            <div className={`text-2xl font-bold bg-gradient-to-br ${s.g} bg-clip-text text-transparent`} style={{fontFamily:"'Playfair Display',serif"}}>{s.value}</div>
            <div className="text-gray-400 text-xs">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}