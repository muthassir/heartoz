// client/src/pages/GamesTab.jsx
import { useEffect, useState } from "react";
import { TRUTHS, DARES } from "../lib/constants";

function Spinner() {
  return <span style={{display:"inline-block",width:"14px",height:"14px",border:"2px solid rgba(255,255,255,0.4)",borderTopColor:"white",borderRadius:"50%",animation:"spin 0.7s linear infinite",verticalAlign:"middle",marginRight:"6px"}}/>;
}

const GAME_TABS = [
  { id:"truth", label:"💬 Truth" },
  { id:"dare",  label:"🔥 Dare"  },
];

export default function GamesTab({
  user,
  partner,
  scores,
  game,
  gameBusy,
  onSubmitTruth,
  onSubmitDare,
  onReviewGame,
}) {
  const myId = user?.id;
  const partnerId = partner?._id || partner?.id;

  const p1Name = user?.name?.split(" ")[0]    || "You";
  const p2Name = partner?.name?.split(" ")[0] || "Partner";

  const turnUserId = game?.turnUserId;
  const pending = game?.pending || {};
  const pendingType = pending.type; // "truth" | "dare" | null

  const isMyTurn = !!turnUserId && !!myId && turnUserId === myId;
  const isReceiver = !!pendingType && pending.toUserId === myId;
  const isSender = !!pendingType && pending.fromUserId === myId;

  const turnLabel = turnUserId === myId ? p1Name : p2Name;
  const senderName = pending.fromUserId === myId ? p1Name : p2Name;

  const p1Score = scores?.[myId] || 0;
  const p2Score = scores?.[partnerId] || 0;

  const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const [mode, setMode] = useState("truth");
  const [truthPrompt, setTruthPrompt] = useState("");
  const [truthAnswer, setTruthAnswer] = useState("");

  const [darePrompt, setDarePrompt] = useState("");
  const [dareVideoDataUri, setDareVideoDataUri] = useState(null);

  useEffect(() => {
    if (!isMyTurn || pendingType) return;
    if (mode === "truth") {
      setTruthPrompt(rand(TRUTHS));
      setTruthAnswer("");
    }
    if (mode === "dare") {
      setDarePrompt(rand(DARES));
      setDareVideoDataUri(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMyTurn, pendingType, mode]);

  // ── Waiting screen — shown to non-active player ──
  const WaitingScreen = () => (
    <div style={{
      background:"white", borderRadius:"20px",
      border:"1px solid #fce7f3", padding:"32px 20px",
      textAlign:"center", boxShadow:"0 4px 20px rgba(244,63,94,0.08)",
    }}>
      <div style={{fontSize:"48px",marginBottom:"14px"}}>⏳</div>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:"20px",fontWeight:700,color:"#1f2937",marginBottom:"8px"}}>
        {turnLabel}'s turn
      </div>
      <div style={{fontSize:"13px",color:"#9ca3af",marginBottom:"20px",lineHeight:1.6}}>
        Waiting for {turnLabel} to play their turn.<br/>
        You'll go next — sit tight! 💕
      </div>
      <div style={{
        background:"#fff1f2", borderRadius:"14px",
        padding:"12px 16px", border:"1px solid #fce7f3",
        display:"inline-flex", alignItems:"center", gap:"8px",
      }}>
        <div style={{width:"8px",height:"8px",borderRadius:"50%",background:"#f43f5e",animation:"pulse 1.5s ease-in-out infinite"}}/>
        <span style={{fontSize:"12px",fontWeight:600,color:"#f43f5e"}}>{turnLabel} is playing now</span>
      </div>
      <p style={{fontSize:"11px",color:"#d1d5db",marginTop:"16px"}}>
        Tap 🔄 sync in the header to refresh scores
      </p>
    </div>
  );

  const GameCard = ({ gradient, children }) => (
    <div style={{background:gradient,borderRadius:"20px",padding:"20px",color:"white",boxShadow:"0 8px 28px rgba(0,0,0,0.12)",textAlign:"center"}} className="card-flip">
      {children}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-3 py-4">
      <style>{`
        @keyframes spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes flipIn  { from{opacity:0;transform:rotateY(90deg) scale(0.85)} to{opacity:1;transform:rotateY(0) scale(1)} }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .card-flip  { animation:flipIn 0.4s cubic-bezier(0.34,1.4,0.64,1); }
        .pf         { transition:width 1s cubic-bezier(0.4,0,0.2,1); }
        .gtab       { transition:all 0.18s; border:none; cursor:pointer; }
        .gtab:hover { transform:translateY(-1px); }
        ::-webkit-scrollbar{ height:3px; } ::-webkit-scrollbar-thumb{ background:#fda4af; border-radius:4px; }
      `}</style>

      {/* ── Scoreboard ── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"14px"}}>
        {[
          { name:p1Name, photo:user?.photo,    score:p1Score, mine:true,  userId: myId },
          { name:p2Name, photo:partner?.photo, score:p2Score, mine:false, userId: partnerId },
        ].map((p,i) => {
          const isTurn = !!turnUserId && p.userId === turnUserId;
          return (
            <div key={i} style={{
              background:"white", borderRadius:"16px", padding:"12px",
              textAlign:"center",
              border:`2px solid ${isTurn?"#f43f5e":"#fce7f3"}`,
              boxShadow: isTurn?"0 4px 16px rgba(244,63,94,0.18)":"0 2px 8px rgba(244,63,94,0.05)",
              opacity: isTurn ? 1 : 0.65,
              transition:"all 0.2s",
            }}>
              {p.photo
                ? <img src={p.photo} alt="" style={{width:"36px",height:"36px",borderRadius:"50%",margin:"0 auto 6px",display:"block",border:"2px solid #fce7f3",objectFit:"cover"}}/>
                : <div style={{width:"36px",height:"36px",borderRadius:"50%",margin:"0 auto 6px",background:`linear-gradient(135deg,${i===0?"#f43f5e,#ec4899":"#8b5cf6,#6366f1"})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"15px"}}>{i===0?"👸":"🤴"}</div>
              }
              <div style={{fontSize:"11px",color:"#6b7280",fontWeight:600}}>
                {p.name} {p.mine && <span style={{fontSize:"9px",color:"#fda4af"}}>(you)</span>}
              </div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:"26px",fontWeight:700,color:isTurn?"#f43f5e":"#9ca3af",lineHeight:1}}>{p.score}</div>
              <div style={{fontSize:"9px",color:"#d1d5db"}}>pts</div>
              {isTurn
                ? <div style={{fontSize:"10px",color:"#f43f5e",fontWeight:700,marginTop:"4px",background:"#fff1f2",borderRadius:"8px",padding:"2px 6px"}}>🎯 Playing</div>
                : <div style={{fontSize:"10px",color:"#d1d5db",marginTop:"4px"}}>waiting…</div>
              }
            </div>
          );
        })}
      </div>

      {/* ── Receiver review ── */}
      {isReceiver && pendingType && (
        <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
          {pendingType === "truth" && (
            <>
              <GameCard gradient="linear-gradient(135deg,#f43f5e,#ec4899,#fb7185)">
                <div style={{fontSize:"34px",marginBottom:"10px"}}>💬</div>
                <div style={{fontSize:"10px",letterSpacing:"2px",opacity:0.75,marginBottom:"8px",textTransform:"uppercase"}}>Truth from {senderName}</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:"15px",fontWeight:700,lineHeight:1.55,whiteSpace:"pre-wrap"}}>{pending.truthPrompt}</div>
                <div style={{marginTop:"10px",background:"#fff1f2",border:"1px solid #fce7f3",borderRadius:"14px",padding:"12px",color:"#1f2937"}}>
                  <div style={{fontSize:"10px",color:"#f43f5e",fontWeight:800,letterSpacing:"1px",textTransform:"uppercase",marginBottom:"4px"}}>Response</div>
                  <div style={{fontSize:"14px",fontFamily:"inherit",fontWeight:700,whiteSpace:"pre-wrap"}}>{pending.truthText}</div>
                </div>
              </GameCard>
            </>
          )}

          {pendingType === "dare" && (
            <>
              <GameCard gradient="linear-gradient(135deg,#f97316,#f43f5e)">
                <div style={{fontSize:"34px",marginBottom:"10px"}}>🔥</div>
                <div style={{fontSize:"10px",letterSpacing:"2px",opacity:0.75,marginBottom:"8px",textTransform:"uppercase"}}>Dare from {senderName}</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:"15px",fontWeight:700,lineHeight:1.55,whiteSpace:"pre-wrap"}}>{pending.darePrompt}</div>
              </GameCard>
              <div style={{background:"#fff1f2",borderRadius:"16px",border:"1px solid #fce7f3",padding:"12px"}}>
                <video
                  src={pending.dareVideo}
                  controls
                  style={{width:"100%",borderRadius:"12px",background:"#000"}}
                />
              </div>
            </>
          )}

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
            <button
              onClick={() => onReviewGame("done")}
              disabled={gameBusy}
              style={{
                padding:"12px",
                borderRadius:"14px",
                border:"none",
                cursor:"pointer",
                background:"linear-gradient(135deg,#f43f5e,#ec4899)",
                color:"white",
                fontSize:"13px",
                fontWeight:700,
                opacity: gameBusy ? 0.5 : 1,
                boxShadow:"0 4px 12px rgba(244,63,94,0.3)",
              }}
            >
              {gameBusy ? <><Spinner/>Saving…</> : pendingType === "truth" ? "✅ Done (+10)" : "🏆 Done (+20)"}
            </button>

            <button
              onClick={() => onReviewGame("skip")}
              disabled={gameBusy}
              style={{
                padding:"12px",
                borderRadius:"14px",
                border:"1px solid #fce7f3",
                cursor:"pointer",
                background:"white",
                color:"#f43f5e",
                fontSize:"13px",
                fontWeight:700,
                opacity: gameBusy ? 0.5 : 1,
              }}
            >
              {pendingType === "truth" ? "⏭️ Skip (+5)" : "⏭️ Skip (+10)"}
            </button>
          </div>
        </div>
      )}

      {/* ── Sender submit ── */}
      {isMyTurn && !pendingType && (
        <>
          <div style={{display:"flex",gap:"6px",overflowX:"auto",paddingBottom:"10px",marginBottom:"14px"}}>
            {GAME_TABS.map(t => {
              const active = mode === t.id;
              return (
                <button
                  key={t.id}
                  className="gtab"
                  onClick={() => setMode(t.id)}
                  style={{
                    flexShrink:0,
                    padding:"6px 12px",
                    borderRadius:"20px",
                    fontSize:"11px",
                    fontWeight:700,
                    background: active ? "linear-gradient(135deg,#f43f5e,#ec4899)" : "white",
                    color: active ? "white" : "#6b7280",
                    boxShadow: active ? "0 3px 10px rgba(244,63,94,0.3)" : "0 1px 4px rgba(0,0,0,0.06)",
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {mode === "truth" && (
            <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
              <GameCard gradient="linear-gradient(135deg,#f43f5e,#ec4899,#fb7185)">
                <div style={{fontSize:"34px",marginBottom:"10px"}}>💬</div>
                <div style={{fontSize:"10px",letterSpacing:"2px",opacity:0.75,marginBottom:"8px",textTransform:"uppercase"}}>Truth for {p2Name}</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:"17px",fontWeight:700,lineHeight:1.5,whiteSpace:"pre-wrap"}}>{truthPrompt}</div>
              </GameCard>

              <textarea
                rows={3}
                value={truthAnswer}
                onChange={(e) => setTruthAnswer(e.target.value)}
                placeholder="Your honest answer…"
                style={{width:"100%",border:"1px solid #fce7f3",borderRadius:"16px",padding:"12px 14px",fontSize:"13px",color:"#374151",resize:"none",outline:"none",background:"white",fontFamily:"inherit"}}
              />

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
                <button
                  onClick={() => setTruthPrompt(rand(TRUTHS))}
                  disabled={gameBusy}
                  style={{padding:"12px",borderRadius:"14px",border:"1px solid #fce7f3",background:"white",color:"#f43f5e",fontSize:"13px",fontWeight:700,cursor:"pointer",opacity: gameBusy ? 0.5 : 1}}
                >
                  🔄 New Q
                </button>

                <button
                  onClick={() => onSubmitTruth(truthPrompt, truthAnswer)}
                  disabled={gameBusy || !truthAnswer.trim()}
                  style={{padding:"12px",borderRadius:"14px",border:"none",cursor:"pointer",background:"linear-gradient(135deg,#f43f5e,#ec4899)",color:"white",fontSize:"13px",fontWeight:700,opacity: gameBusy || !truthAnswer.trim() ? 0.5 : 1,boxShadow:"0 4px 12px rgba(244,63,94,0.3)"}}
                >
                  {gameBusy ? <><Spinner/>Sending…</> : "✅ Send Truth"}
                </button>
              </div>
            </div>
          )}

          {mode === "dare" && (
            <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
              <GameCard gradient="linear-gradient(135deg,#f97316,#f43f5e)">
                <div style={{fontSize:"34px",marginBottom:"10px"}}>🔥</div>
                <div style={{fontSize:"10px",letterSpacing:"2px",opacity:0.75,marginBottom:"8px",textTransform:"uppercase"}}>Dare for {p2Name}</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:"17px",fontWeight:700,lineHeight:1.5,whiteSpace:"pre-wrap"}}>{darePrompt}</div>
              </GameCard>

              <div style={{background:"#fff1f2",borderRadius:"16px",border:"1px solid #fce7f3",padding:"12px"}}>
                <div style={{fontSize:"12px",color:"#374151",fontWeight:700,marginBottom:"6px"}}>Record / Upload your dare video</div>
                <input
                  type="file"
                  accept="video/*"
                  disabled={gameBusy}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const MAX_VIDEO_BYTES = 20 * 1024 * 1024;
                    if (file.size > MAX_VIDEO_BYTES) {
                      alert("Video too large. Max size is 20MB.");
                      return;
                    }
                    const r = new FileReader();
                    r.onload = (ev) => {
                      setDareVideoDataUri(ev.target.result);
                    };
                    r.readAsDataURL(file);
                  }}
                  style={{width:"100%"}}
                />
                <div style={{fontSize:"11px",color:"#9ca3af",marginTop:"6px"}}>Max 20MB. Video will be shared to your partner.</div>
              </div>

              {dareVideoDataUri && (
                <div style={{background:"#fff",borderRadius:"16px",border:"1px solid #fce7f3",padding:"12px"}}>
                  <video
                    src={dareVideoDataUri}
                    controls
                    style={{width:"100%",borderRadius:"12px",background:"#000"}}
                  />
                </div>
              )}

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
                <button
                  onClick={() => { setDarePrompt(rand(DARES)); setDareVideoDataUri(null); }}
                  disabled={gameBusy}
                  style={{padding:"12px",borderRadius:"14px",border:"1px solid #fce7f3",background:"white",color:"#f43f5e",fontSize:"13px",fontWeight:700,cursor:"pointer",opacity: gameBusy ? 0.5 : 1}}
                >
                  🔄 New Dare
                </button>
                <button
                  onClick={() => onSubmitDare(darePrompt, dareVideoDataUri)}
                  disabled={gameBusy || !dareVideoDataUri}
                  style={{padding:"12px",borderRadius:"14px",border:"none",cursor:"pointer",background:"linear-gradient(135deg,#f97316,#f43f5e)",color:"white",fontSize:"13px",fontWeight:700,opacity: gameBusy || !dareVideoDataUri ? 0.5 : 1,boxShadow:"0 4px 12px rgba(244,63,94,0.3)"}}
                >
                  {gameBusy ? <><Spinner/>Sending…</> : "🎥 Send Dare Video"}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Default waiting (not receiver or sender) ── */}
      {!isMyTurn && !isReceiver && <WaitingScreen />}

      <p style={{textAlign:"center",fontSize:"11px",color:"#fda4af",marginTop:"16px",fontStyle:"italic",fontFamily:"'Playfair Display',serif"}}>Play together, laugh together 💗</p>
    </div>
  );
}