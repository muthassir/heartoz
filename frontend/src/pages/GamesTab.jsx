// client/src/pages/GamesTab.jsx
import { useState } from "react";
import { TRUTHS, DARES, COUPLE_QUESTIONS } from "../lib/constants";

function Spinner() {
  return <span style={{display:"inline-block",width:"14px",height:"14px",border:"2px solid rgba(255,255,255,0.4)",borderTopColor:"white",borderRadius:"50%",animation:"spin 0.7s linear infinite",verticalAlign:"middle",marginRight:"6px"}}/>;
}

export default function GamesTab({ user, partner, scores, playerTurn, savingScore, onAddScore }) {
  const [gameMode,    setGameMode]    = useState("menu");
  const [currentQ,    setCurrentQ]    = useState(null);
  const [answer,      setAnswer]      = useState("");
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [quizIdx,     setQuizIdx]     = useState(0);
  const [quizDone,    setQuizDone]    = useState(false);
  const [dareCard,    setDareCard]    = useState(null);
  const [spinDeg,     setSpinDeg]     = useState(0);
  const [spinning,    setSpinning]    = useState(false);

  const p1Name = user?.name?.split(" ")[0]    || "You";
  const p2Name = partner?.name?.split(" ")[0] || "Partner";
  const currentTurn = playerTurn || p1Name;

  const spinWheel = () => {
    if (spinning) return;
    setSpinning(true);
    setSpinDeg(d => d + 1080 + Math.floor(Math.random()*360));
    setTimeout(() => {
      setSpinning(false);
      const pick = ["truth","dare","quiz","truth","dare"][Math.floor(Math.random()*5)];
      if (pick==="truth")  { setGameMode("truth"); setCurrentQ(TRUTHS[Math.floor(Math.random()*TRUTHS.length)]); setAnswer(""); }
      else if (pick==="dare") { setGameMode("dare"); setDareCard(DARES[Math.floor(Math.random()*DARES.length)]); }
      else { setGameMode("quiz"); setQuizIdx(0); setQuizAnswers([]); setQuizDone(false); }
    }, 1400);
  };

  const handleScore = async (pts) => {
    await onAddScore(pts);
    setGameMode("menu");
  };

  return (
    <div className="max-w-2xl mx-auto px-3 py-5 space-y-4">
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} @keyframes flipIn{from{opacity:0;transform:rotateY(90deg) scale(0.8)}to{opacity:1;transform:rotateY(0) scale(1)}} .card-flip{animation:flipIn 0.5s cubic-bezier(0.34,1.56,0.64,1);} .spin-wheel{transition:transform 1.4s cubic-bezier(0.17,0.67,0.12,1);} .pf{transition:width 1s cubic-bezier(0.4,0,0.2,1);}`}</style>

      {/* Scoreboard */}
      <div className="grid grid-cols-2 gap-3">
        {[{name:p1Name,photo:user?.photo,uid:user?.id},{name:p2Name,photo:partner?.photo,uid:partner?.id}].map((p,i) => (
          <div key={i} className={`bg-white rounded-2xl border p-3 text-center shadow-sm ${currentTurn===p.name ? "border-rose-300 shadow-rose-100" : "border-rose-100"}`}>
            {p.photo
              ? <img src={p.photo} alt="" className="w-10 h-10 rounded-full mx-auto mb-1 border-2 border-rose-200"/>
              : <div className="text-2xl mb-0.5">{i===0?"👸":"🤴"}</div>}
            <div className="text-xs text-gray-500 font-semibold">{p.name}</div>
            <div className="text-2xl font-bold text-rose-500" style={{fontFamily:"'Playfair Display',serif"}}>{p.uid ? scores[p.uid]||0 : 0}</div>
            <div className="text-xs text-gray-400">pts</div>
            {currentTurn===p.name && <div className="text-xs text-rose-400 mt-1 font-semibold">← Your turn</div>}
          </div>
        ))}
      </div>

      {/* Menu */}
      {gameMode==="menu" && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-rose-100 p-5 text-center shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4" style={{fontFamily:"'Playfair Display',serif"}}>🎡 Spin the Wheel</h3>
            <div className="relative w-36 h-36 mx-auto mb-4">
              <div className="spin-wheel w-full h-full rounded-full border-4 border-rose-200 shadow-lg" style={{transform:`rotate(${spinDeg}deg)`}}>
                <div className="absolute inset-0 rounded-full" style={{background:"conic-gradient(#fda4af 0deg 72deg,#f9a8d4 72deg 144deg,#fecdd3 144deg 216deg,#fda4af 216deg 288deg,#f9a8d4 288deg 360deg)"}}/>
                <div className="absolute inset-3 rounded-full bg-white flex items-center justify-center shadow-inner"><span className="text-2xl">{spinning?"🌀":"💕"}</span></div>
              </div>
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-xl">▼</div>
            </div>
            <button onClick={spinWheel} disabled={spinning} className="px-8 py-3 rounded-2xl bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold text-sm shadow-lg disabled:opacity-60">
              {spinning?"Spinning…":"🎰 Spin!"}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              {mode:"truth",emoji:"💬",label:"Truth",color:"from-rose-400 to-pink-500"},
              {mode:"dare", emoji:"🔥",label:"Dare", color:"from-orange-400 to-rose-400"},
              {mode:"quiz", emoji:"🧠",label:"Quiz", color:"from-pink-400 to-purple-400"},
            ].map(g => (
              <button key={g.mode} onClick={() => {
                setGameMode(g.mode);
                if (g.mode==="truth") { setCurrentQ(TRUTHS[Math.floor(Math.random()*TRUTHS.length)]); setAnswer(""); }
                if (g.mode==="dare")  { setDareCard(DARES[Math.floor(Math.random()*DARES.length)]); }
                if (g.mode==="quiz")  { setQuizIdx(0); setQuizAnswers([]); setQuizDone(false); }
              }} className={`bg-gradient-to-br ${g.color} text-white rounded-2xl p-3 text-center shadow-md hover:scale-105 transition-all`}>
                <div className="text-2xl mb-1">{g.emoji}</div><div className="font-bold text-sm">{g.label}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Truth */}
      {gameMode==="truth" && (
        <div className="space-y-3">
          <div className="bg-gradient-to-br from-rose-400 to-pink-500 rounded-2xl p-5 text-white text-center shadow-lg card-flip">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-xs uppercase tracking-widest opacity-80 mb-2">Truth — {currentTurn}</p>
            <h3 className="text-lg font-bold leading-snug" style={{fontFamily:"'Playfair Display',serif"}}>{currentQ}</h3>
          </div>
          <textarea rows={3} value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Your honest answer…" className="w-full border border-rose-200 rounded-2xl px-4 py-3 text-sm text-gray-700 placeholder-gray-300 resize-none bg-white focus:border-rose-400" style={{outline:"none"}}/>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => { setCurrentQ(TRUTHS[Math.floor(Math.random()*TRUTHS.length)]); setAnswer(""); }} className="py-2.5 rounded-xl bg-white border border-rose-200 text-rose-400 text-sm font-semibold hover:bg-rose-50">🔄 New Q</button>
            <button onClick={() => handleScore(10)} disabled={!answer.trim()||savingScore} className="py-2.5 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 text-white text-sm font-bold disabled:opacity-40 shadow-md">
              {savingScore ? <><Spinner/>Saving…</> : "✅ Done! +10pts"}
            </button>
          </div>
          <button onClick={() => setGameMode("menu")} className="w-full py-2 text-xs text-gray-400">← Back</button>
        </div>
      )}

      {/* Dare */}
      {gameMode==="dare" && (
        <div className="space-y-3">
          <div className="bg-gradient-to-br from-orange-400 to-rose-500 rounded-2xl p-5 text-white text-center shadow-lg card-flip">
            <div className="text-4xl mb-3">🔥</div>
            <p className="text-xs uppercase tracking-widest opacity-80 mb-2">Dare — {currentTurn}</p>
            <h3 className="text-lg font-bold leading-snug" style={{fontFamily:"'Playfair Display',serif"}}>{dareCard}</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setDareCard(DARES[Math.floor(Math.random()*DARES.length)])} className="py-2.5 rounded-xl bg-white border border-rose-200 text-rose-400 text-sm font-semibold">🔄 New Dare</button>
            <button onClick={() => handleScore(20)} disabled={savingScore} className="py-2.5 rounded-xl bg-gradient-to-r from-orange-400 to-rose-500 text-white text-sm font-bold shadow-md disabled:opacity-60">
              {savingScore ? <><Spinner/>Saving…</> : "🏆 Done! +20pts"}
            </button>
          </div>
          <button onClick={() => setGameMode("menu")} className="w-full py-2 text-xs text-gray-400">← Skip & Back</button>
        </div>
      )}

      {/* Quiz */}
      {gameMode==="quiz" && !quizDone && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Q {quizIdx+1}/{COUPLE_QUESTIONS.length}</span>
              <span className="text-xs text-rose-400 font-semibold">{currentTurn}'s turn 🧠</span>
            </div>
            <div className="w-full h-1.5 bg-rose-50 rounded-full mb-4 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-rose-400 to-pink-400 rounded-full pf" style={{width:`${(quizIdx/COUPLE_QUESTIONS.length)*100}%`}}/>
            </div>
            <h3 className="font-bold text-gray-800 mb-4" style={{fontFamily:"'Playfair Display',serif"}}>{COUPLE_QUESTIONS[quizIdx].q}</h3>
            {COUPLE_QUESTIONS[quizIdx].type==="choice" ? (
              <div className="grid grid-cols-2 gap-2">
                {COUPLE_QUESTIONS[quizIdx].options.map(opt => (
                  <button key={opt} onClick={() => {
                    setQuizAnswers(a => [...a,{q:COUPLE_QUESTIONS[quizIdx].q,a:opt}]);
                    if (quizIdx+1 < COUPLE_QUESTIONS.length) setQuizIdx(i => i+1); else setQuizDone(true);
                  }} className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-100 text-sm text-gray-700 text-left">{opt}</button>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <input type="text" placeholder="Your answer…" value={answer} onChange={e => setAnswer(e.target.value)}
                  onKeyDown={e => { if (e.key==="Enter"&&answer.trim()) { setQuizAnswers(a=>[...a,{q:COUPLE_QUESTIONS[quizIdx].q,a:answer}]); setAnswer(""); if(quizIdx+1<COUPLE_QUESTIONS.length) setQuizIdx(i=>i+1); else setQuizDone(true); }}}
                  className="w-full border border-rose-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:border-rose-400 bg-rose-50/30" style={{outline:"none"}}/>
                <button onClick={() => { if(!answer.trim())return; setQuizAnswers(a=>[...a,{q:COUPLE_QUESTIONS[quizIdx].q,a:answer}]); setAnswer(""); if(quizIdx+1<COUPLE_QUESTIONS.length) setQuizIdx(i=>i+1); else setQuizDone(true); }} disabled={!answer.trim()} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 text-white text-sm font-bold disabled:opacity-40">Next →</button>
              </div>
            )}
          </div>
          <button onClick={() => setGameMode("menu")} className="w-full py-2 text-xs text-gray-400">← Back</button>
        </div>
      )}

      {/* Quiz done */}
      {gameMode==="quiz" && quizDone && (
        <div className="space-y-3">
          <div className="bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl p-5 text-white text-center shadow-lg">
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="text-xl font-bold" style={{fontFamily:"'Playfair Display',serif"}}>Quiz Complete!</h3>
            <button onClick={() => handleScore(30)} disabled={savingScore} className="mt-3 px-5 py-2 bg-white/20 hover:bg-white/30 rounded-full text-sm font-semibold disabled:opacity-60">
              {savingScore ? <><Spinner/>Saving…</> : "+30pts · Switch Turns 🔄"}
            </button>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {quizAnswers.map((qa,i) => (
              <div key={i} className="bg-white rounded-xl border border-rose-100 p-3 shadow-sm">
                <p className="text-xs text-gray-400 mb-1">{qa.q}</p>
                <p className="text-sm font-semibold text-rose-500">"{qa.a}"</p>
              </div>
            ))}
          </div>
          <button onClick={() => setGameMode("menu")} className="w-full py-3 rounded-xl bg-white border border-rose-200 text-rose-400 text-sm font-semibold">← Back to Menu</button>
        </div>
      )}

      <p className="text-center text-xs text-rose-200 mt-4 italic" style={{fontFamily:"'Playfair Display',serif"}}>Play together, laugh together 💗</p>
    </div>
  );
}