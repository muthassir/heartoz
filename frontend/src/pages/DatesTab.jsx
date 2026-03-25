// client/src/pages/DatesTab.jsx
import { useRef } from "react";
import { DATE_IDEAS, ALPHABET } from "../lib/constants";

export default function DatesTab({
  dates, coupleId, user,
  togglingDate, uploadingDate,
  onToggle, onPhoto,
}) {
  return (
    <_DatesTabInner
      dates={dates} coupleId={coupleId} user={user}
      togglingDate={togglingDate} uploadingDate={uploadingDate}
      onToggle={onToggle} onPhoto={onPhoto}
    />
  );
}

import { useState } from "react";

function Spinner() {
  return <span style={{display:"inline-block",width:"14px",height:"14px",border:"2px solid rgba(255,255,255,0.4)",borderTopColor:"white",borderRadius:"50%",animation:"spin 0.7s linear infinite",verticalAlign:"middle",marginRight:"6px"}}/>;
}

function _DatesTabInner({ dates, coupleId, togglingDate, uploadingDate, onToggle, onPhoto }) {
  const [selected, setSelected] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const dateFileRef = useRef();

  const idea     = selected ? DATE_IDEAS[selected] : null;
  const totalDone = Object.values(dates).filter(d => d.done).length;

  return (
    <div className="max-w-2xl mx-auto px-3 py-5">
      <style>{`
        @keyframes spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes hf      { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(40px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes tilt    { 0%,100%{transform:rotate(var(--r)) translateY(0)} 50%{transform:rotate(var(--r)) translateY(-4px)} }

        .hf  { animation: hf 3s ease-in-out infinite; }
        .mo  { animation: fadeIn 0.2s ease; }
        .mb  { animation: slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1); }

        /* Polaroid card */
        .polaroid {
          background: white;
          border-radius: 4px;
          padding: 6px 6px 22px;
          box-shadow: 0 3px 12px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08);
          cursor: pointer;
          transition: transform 0.22s cubic-bezier(0.34,1.4,0.64,1), box-shadow 0.22s;
          position: relative;
        }
        .polaroid:hover {
          transform: rotate(0deg) translateY(-6px) scale(1.06) !important;
          box-shadow: 0 14px 36px rgba(244,63,94,0.22), 0 4px 12px rgba(0,0,0,0.1);
          z-index: 10;
        }
        .polaroid.done {
          box-shadow: 0 4px 20px rgba(244,63,94,0.35), 0 1px 4px rgba(0,0,0,0.08);
        }
        .polaroid .photo-area {
          width: 100%;
          aspect-ratio: 1;
          overflow: hidden;
          border-radius: 2px;
          background: #fdf2f2;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .polaroid .caption {
          margin-top: 6px;
          text-align: center;
          font-size: 9px;
          color: #6b7280;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-family: 'Caveat', cursive;
          letter-spacing: 0.2px;
        }
        .polaroid.done .caption { color: #f43f5e; font-weight: 700; }
        .polaroid .letter-badge {
          position: absolute;
          top: 4px; left: 4px;
          width: 18px; height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg,#f43f5e,#ec4899);
          color: white;
          font-size: 9px;
          font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 1px 4px rgba(244,63,94,0.4);
          font-family: 'Playfair Display', serif;
        }
        .polaroid.done .letter-badge {
          background: white;
          color: #f43f5e;
          border: 1px solid #fda4af;
        }
        .polaroid .done-ribbon {
          position: absolute;
          bottom: 4px; right: 4px;
          font-size: 13px;
          filter: drop-shadow(0 1px 2px rgba(0,0,0,0.15));
        }

        /* tape strip on top */
        .polaroid::before {
          content: '';
          position: absolute;
          top: -7px;
          left: 50%;
          transform: translateX(-50%);
          width: 28px; height: 14px;
          background: rgba(255,220,100,0.65);
          border-radius: 2px;
          box-shadow: inset 0 1px 2px rgba(0,0,0,0.06);
        }

        /* subtle pinhole */
        .polaroid::after {
          content: '';
          position: absolute;
          top: 4px; right: 4px;
          width: 4px; height: 4px;
          border-radius: 50%;
          background: rgba(0,0,0,0.08);
        }

        /* grid masonry feel — slight tilts */
        .polaroid:nth-child(3n)   { --r: 1.2deg;  transform: rotate(1.2deg); }
        .polaroid:nth-child(3n+1) { --r: -1.5deg; transform: rotate(-1.5deg); }
        .polaroid:nth-child(3n+2) { --r: 0.6deg;  transform: rotate(0.6deg); }
      `}</style>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 mo" onClick={() => setLightbox(null)}>
          <div className="relative max-w-lg w-full">
            <img src={lightbox} alt="" className="w-full rounded-2xl max-h-[80vh] object-contain shadow-2xl"/>
            <button className="absolute top-2 right-2 w-8 h-8 bg-white/20 hover:bg-white/40 rounded-full text-white text-sm" onClick={() => setLightbox(null)}>✕</button>
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

      {/* Polaroid Grid */}
      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fill, minmax(120px, 1fr))",
        gap:"20px 14px",
        padding:"20px 8px 8px",
      }}>
        {ALPHABET.map(letter => {
          const item     = DATE_IDEAS[letter];
          const d        = dates[letter] || {};
          const done     = d.done;
          const hasPhoto = !!d.photo;

          return (
            <div
              key={letter}
              className={`polaroid${done?" done":""}`}
              onClick={() => setSelected(letter)}
            >
              {/* Photo area */}
              <div className="photo-area">
                {hasPhoto
                  ? <img src={d.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                  : <div style={{textAlign:"center"}}>
                      <div style={{
                        fontSize:"clamp(22px,5vw,30px)",
                        filter: done ? "saturate(1.2)" : "saturate(0.8) opacity(0.7)",
                      }}>{item.emoji}</div>
                    </div>
                }

                {/* Done overlay tint */}
                {done && (
                  <div style={{
                    position:"absolute", inset:0,
                    background:"linear-gradient(135deg,rgba(244,63,94,0.15),rgba(236,72,153,0.1))",
                  }}/>
                )}

                {/* Letter badge */}
                <div className="letter-badge">{letter}</div>

                {/* Done ribbon */}
                {done && <div className="done-ribbon">💕</div>}

                {/* Photo indicator */}
                {hasPhoto && !done && (
                  <div style={{
                    position:"absolute", bottom:"3px", right:"3px",
                    fontSize:"9px", background:"rgba(255,255,255,0.85)",
                    borderRadius:"4px", padding:"1px 3px",
                    color:"#f43f5e",
                  }}>📸</div>
                )}
              </div>

              {/* Caption */}
              <div className="caption">
                {done
                  ? `✓ ${item.idea.split(" ").slice(0,2).join(" ")}`
                  : item.idea.split(" ").slice(0,2).join(" ")
                }
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="bg-pink-800 p-2 rounded mt-8 grid grid-cols-3 gap-3">
        {[
          { label:"Dates Done", value:totalDone,                                      emoji:"💕", g:"from-rose-400 to-pink-500"   },
          { label:"Photos",     value:Object.values(dates).filter(d=>d.photo).length, emoji:"📸", g:"from-orange-400 to-rose-400" },
          { label:"To Go",      value:26-totalDone,                                   emoji:"✨", g:"from-pink-400 to-purple-400"  },
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