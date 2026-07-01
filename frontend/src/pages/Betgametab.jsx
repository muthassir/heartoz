// frontend/src/pages/BetGameTab.jsx  ─  Tic-Tac-Toe Bet Game + per-user stake history
import { useState } from "react";
import { STAKE_SUGGESTIONS } from "../lib/constants";
import { FaTrophy, FaHistory, FaChevronDown, FaChevronUp } from "react-icons/fa";

function Spinner() {
  return (
    <span style={{
      display:"inline-block", width:"14px", height:"14px",
      border:"2px solid rgba(255,255,255,0.4)", borderTopColor:"white",
      borderRadius:"50%", animation:"spin 0.7s linear infinite",
      verticalAlign:"middle", marginRight:"6px",
    }}/>
  );
}

// ── tiny relative-time helper ────────────────────────────────────────────────
function relTime(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7)   return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function BetGameTab({
  user, partner,
  ticTacToe, betBusy,
  onStartBet, onPlayBet, onSetStake, onReviewStake,
}) {
  const myId      = user?.id;
  const partnerId = partner?._id || partner?.id;
  const p1Name    = user?.name?.split(" ")[0]    || "You";
  const p2Name    = partner?.name?.split(" ")[0] || "Partner";

  const ttt          = ticTacToe || {};
  const board        = ttt.board?.length === 9 ? ttt.board : Array(9).fill(null);
  const betStatus     = ttt.status  || "idle";
  const symbols       = ttt.symbols  || {};
  const betWinnerId   = ttt.winnerUserId || null;
  const stake         = ttt.stake    || {};
  const betTurnUserId = ttt.turnUserId  || null;
  const roundsWon     = ttt.roundsWon  || {};
  const history       = ttt.history    || [];

  const mySymbol       = symbols[myId];
  const isMyBetTurn    = !!betTurnUserId && betTurnUserId === myId;
  const iAmBetWinner   = !!betWinnerId && betWinnerId === myId;
  const betWinnerName  = betWinnerId === myId ? p1Name : p2Name;
  const betLoserName   = betWinnerId === myId ? p2Name : p1Name;
  const isStakeSetter  = betStatus === "awaiting_stake" && iAmBetWinner;
  const isStakeReviewer= betStatus === "stake_set" && stake.status === "pending" && stake.toUserId === myId;

  const [betText, setBetText]         = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [histFilter, setHistFilter]   = useState("all"); // "all" | myId | partnerId

  // ── stake history stats per user ────────────────────────────────────────
  const statsFor = (uid) => ({
    won:      history.filter(h => h.fromUserId === uid).length,
    lost:     history.filter(h => h.toUserId   === uid).length,
    done:     history.filter(h => h.toUserId   === uid && h.status === "done").length,
    declined: history.filter(h => h.toUserId   === uid && h.status === "declined").length,
  });
  const myStats  = statsFor(myId);
  const p2Stats  = statsFor(partnerId);

  const filteredHistory = histFilter === "all"
    ? history
    : history.filter(h => h.fromUserId === histFilter || h.toUserId === histFilter);

  // ── Board cell ──────────────────────────────────────────────────────────
  const Cell = ({ idx }) => {
    const val    = board[idx];
    const active = !betBusy && isMyBetTurn && !val;
    return (
      <button
        onClick={() => active && onPlayBet(idx)}
        style={{
          aspectRatio:"1", borderRadius:"16px",
          border: val ? "2px solid #d1fae5" : "2px solid #e5e7eb",
          background: val ? "#f0fdf4" : active ? "white" : "#fafafa",
          fontSize:"28px", fontWeight:900,
          color: val === "X" ? "#10b981" : val === "O" ? "#f43f5e" : "transparent",
          cursor: active ? "pointer" : "default",
          transition:"all 0.12s",
          transform: active ? "scale(1)" : undefined,
          display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow: active ? "0 2px 10px rgba(16,185,129,0.12)" : "none",
        }}
      >
        {val || ""}
      </button>
    );
  };

  const GameCard = ({ grad, children }) => (
    <div style={{
      background:grad, borderRadius:"20px", padding:"20px",
      color:"white", boxShadow:"0 8px 28px rgba(0,0,0,0.12)",
      textAlign:"center",
    }}>
      {children}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-3 py-4">
      <style>{`
        @keyframes spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes flipIn  { from{opacity:0;transform:scale(0.88)} to{opacity:1;transform:scale(1)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        .bet-anim { animation:flipIn 0.3s cubic-bezier(0.34,1.3,0.64,1); }
        ::-webkit-scrollbar{ height:3px; } ::-webkit-scrollbar-thumb{ background:#6ee7b7; border-radius:4px; }
      `}</style>

      {/* ── Header scoreboard ── */}
      <div style={{
        display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"14px",
      }}>
        {[
          { name:p1Name, photo:user?.photo,    wins:roundsWon[myId]||0, stakes:myStats,  mine:true  },
          { name:p2Name, photo:partner?.photo, wins:roundsWon[partnerId]||0, stakes:p2Stats, mine:false },
        ].map((p, i) => (
          <div key={i} style={{
            background:"white", borderRadius:"18px", padding:"14px 12px",
            border:`2px solid ${p.mine ? "#10b981" : "#fce7f3"}`,
            boxShadow: p.mine ? "0 4px 16px rgba(16,185,129,0.14)" : "0 2px 8px rgba(0,0,0,0.04)",
            textAlign:"center",
          }}>
            {p.photo
              ? <img src={p.photo} alt="" style={{width:"36px",height:"36px",borderRadius:"50%",margin:"0 auto 6px",display:"block",border:"2px solid #d1fae5",objectFit:"cover"}}/>
              : <div style={{width:"36px",height:"36px",borderRadius:"50%",margin:"0 auto 6px",background:`linear-gradient(135deg,${i===0?"#10b981,#059669":"#f43f5e,#ec4899"})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"15px"}}>{i===0?"👸":"🤴"}</div>
            }
            <div style={{fontSize:"11px",color:"#6b7280",fontWeight:600}}>
              {p.name} {p.mine&&<span style={{fontSize:"9px",color:"#34d399"}}>(you)</span>}
            </div>
            <div style={{display:"flex",justifyContent:"center",gap:"12px",marginTop:"8px"}}>
              <div style={{textAlign:"center"}}>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:"22px",fontWeight:700,color:"#10b981",lineHeight:1}}>{p.wins}</div>
                <div style={{fontSize:"9px",color:"#9ca3af"}}>round wins</div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:"22px",fontWeight:700,color:"#f43f5e",lineHeight:1}}>{p.stakes.won}</div>
                <div style={{fontSize:"9px",color:"#9ca3af"}}>stakes set</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Game area ── */}
      <div className="bet-anim" style={{marginBottom:"14px"}}>

        {betStatus === "idle" && (
          <GameCard grad="linear-gradient(135deg,#10b981,#059669,#34d399)">
            <div style={{fontSize:"38px",marginBottom:"10px"}}>🎲</div>
            <div style={{fontSize:"10px",letterSpacing:"2px",opacity:0.8,marginBottom:"8px",textTransform:"uppercase"}}>Bet Game</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:"16px",fontWeight:700,lineHeight:1.5,marginBottom:"16px"}}>
              Play Tic-Tac-Toe — winner picks the stake, loser has to do it! 😈
            </div>
            <button
              onClick={onStartBet}
              disabled={betBusy}
              style={{padding:"12px 24px",borderRadius:"14px",border:"none",cursor:"pointer",background:"white",color:"#059669",fontSize:"13px",fontWeight:800,opacity:betBusy?0.6:1,boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}
            >
              {betBusy ? <><Spinner/>Starting…</> : "🎮 Start Round"}
            </button>
          </GameCard>
        )}

        {betStatus === "playing" && (
          <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
            <div style={{
              textAlign:"center", fontSize:"13px", fontWeight:700,
              padding:"8px 16px", borderRadius:"12px",
              background: isMyBetTurn ? "#f0fdf4" : "#fafafa",
              color: isMyBetTurn ? "#059669" : "#9ca3af",
              border:`1px solid ${isMyBetTurn ? "#d1fae5" : "#f3f4f6"}`,
            }}>
              {isMyBetTurn
                ? `Your turn — you're ${mySymbol || "?"} 🎯`
                : `${betTurnUserId === myId ? p1Name : p2Name}'s turn — wait your move ⏳`}
            </div>
            <div style={{
              display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"8px",
              background:"white", borderRadius:"20px", border:"1px solid #d1fae5",
              padding:"14px", boxShadow:"0 4px 20px rgba(16,185,129,0.10)",
            }}>
              {Array.from({length:9},(_,i) => <Cell key={i} idx={i} />)}
            </div>
          </div>
        )}

        {betStatus === "draw" && (
          <GameCard grad="linear-gradient(135deg,#9ca3af,#6b7280)">
            <div style={{fontSize:"38px",marginBottom:"10px"}}>🤝</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:"18px",fontWeight:700,marginBottom:"14px"}}>Draw! No stake this round.</div>
            <button onClick={onStartBet} disabled={betBusy} style={{padding:"12px 22px",borderRadius:"14px",border:"none",cursor:"pointer",background:"white",color:"#374151",fontSize:"13px",fontWeight:800,opacity:betBusy?0.6:1}}>
              {betBusy ? <><Spinner/>Starting…</> : "🔄 Play Again"}
            </button>
          </GameCard>
        )}

        {betStatus === "awaiting_stake" && isStakeSetter && (
          <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
            <GameCard grad="linear-gradient(135deg,#10b981,#059669)">
              <div style={{fontSize:"38px",marginBottom:"10px"}}>🏆</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:"18px",fontWeight:700}}>
                You won! Name your price 😏
              </div>
              <div style={{fontSize:"12px",opacity:0.85,marginTop:"6px"}}>
                {betLoserName} will have to do whatever you choose
              </div>
            </GameCard>

            {/* quick suggestions */}
            <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
              {STAKE_SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => setBetText(s)}
                  style={{
                    padding:"7px 11px", borderRadius:"16px",
                    border:`1px solid ${betText===s?"#10b981":"#d1fae5"}`,
                    background: betText===s ? "#10b981" : "#f0fdf4",
                    color: betText===s ? "white" : "#059669",
                    fontSize:"11px", fontWeight:600, cursor:"pointer",
                  }}
                >{s}</button>
              ))}
            </div>

            <textarea
              rows={2}
              value={betText}
              onChange={e => setBetText(e.target.value)}
              placeholder="Or write your own custom stake…"
              style={{width:"100%",border:"1px solid #d1fae5",borderRadius:"16px",padding:"12px 14px",fontSize:"13px",color:"#374151",resize:"none",outline:"none",background:"white",fontFamily:"inherit"}}
            />
            <button
              onClick={() => { if (betText.trim()) { onSetStake(betText.trim()); setBetText(""); }}}
              disabled={betBusy || !betText.trim()}
              style={{padding:"13px",borderRadius:"14px",border:"none",cursor:"pointer",background:"linear-gradient(135deg,#10b981,#059669)",color:"white",fontSize:"13px",fontWeight:700,opacity:betBusy||!betText.trim()?0.5:1,boxShadow:"0 4px 12px rgba(16,185,129,0.3)"}}
            >
              {betBusy ? <><Spinner/>Sending…</> : `😈 Send Stake to ${betLoserName}`}
            </button>
          </div>
        )}

        {betStatus === "awaiting_stake" && !isStakeSetter && (
          <GameCard grad="linear-gradient(135deg,#9ca3af,#6b7280)">
            <div style={{fontSize:"38px",marginBottom:"10px"}}>⏳</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:"17px",fontWeight:700}}>{betWinnerName} won this round!</div>
            <div style={{fontSize:"12px",opacity:0.85,marginTop:"6px"}}>Waiting for them to decide your fate… 😬</div>
          </GameCard>
        )}

        {betStatus === "stake_set" && isStakeReviewer && (
          <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
            <GameCard grad="linear-gradient(135deg,#f43f5e,#ec4899)">
              <div style={{fontSize:"38px",marginBottom:"10px"}}>😈</div>
              <div style={{fontSize:"10px",letterSpacing:"2px",opacity:0.8,marginBottom:"8px",textTransform:"uppercase"}}>
                {betWinnerName}'s stake for you
              </div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:"18px",fontWeight:700,lineHeight:1.5,whiteSpace:"pre-wrap"}}>
                {stake.text}
              </div>
            </GameCard>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
              <button
                onClick={() => onReviewStake("done")}
                disabled={betBusy}
                style={{padding:"13px",borderRadius:"14px",border:"none",cursor:"pointer",background:"linear-gradient(135deg,#10b981,#059669)",color:"white",fontSize:"13px",fontWeight:700,opacity:betBusy?0.5:1,boxShadow:"0 4px 12px rgba(16,185,129,0.3)"}}
              >
                {betBusy ? <><Spinner/>…</> : "✅ I'll do it (+15 pts)"}
              </button>
              <button
                onClick={() => onReviewStake("decline")}
                disabled={betBusy}
                style={{padding:"13px",borderRadius:"14px",border:"1px solid #fce7f3",cursor:"pointer",background:"white",color:"#f43f5e",fontSize:"13px",fontWeight:700,opacity:betBusy?0.5:1}}
              >
                🙅 Decline
              </button>
            </div>
          </div>
        )}

        {betStatus === "stake_set" && !isStakeReviewer && (
          <GameCard grad="linear-gradient(135deg,#9ca3af,#6b7280)">
            <div style={{fontSize:"38px",marginBottom:"10px"}}>⏳</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:"17px",fontWeight:700}}>
              Waiting for {betLoserName}…
            </div>
            <div style={{fontSize:"12px",opacity:0.85,marginTop:"6px",whiteSpace:"pre-wrap"}}>
              Your stake: "{stake.text}"
            </div>
          </GameCard>
        )}
      </div>

      {/* ── Stake History ── */}
      <div style={{
        background:"white", borderRadius:"20px",
        border:"1px solid #d1fae5",
        boxShadow:"0 4px 16px rgba(16,185,129,0.07)",
        overflow:"hidden",
      }}>
        {/* history header */}
        <button
          onClick={() => setShowHistory(v => !v)}
          style={{
            width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:"14px 16px", border:"none", background:"transparent", cursor:"pointer",
          }}
        >
          <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
            <FaHistory style={{color:"#10b981",fontSize:"14px"}}/>
            <span style={{fontFamily:"'Playfair Display',serif",fontSize:"15px",fontWeight:700,color:"#1f2937"}}>
              Stake History
            </span>
            {history.length > 0 && (
              <span style={{fontSize:"10px",fontWeight:700,background:"#f0fdf4",color:"#059669",borderRadius:"10px",padding:"2px 8px"}}>
                {history.length}
              </span>
            )}
          </div>
          <span style={{color:"#9ca3af",fontSize:"13px"}}>
            {showHistory ? <FaChevronUp/> : <FaChevronDown/>}
          </span>
        </button>

        {showHistory && (
          <div style={{animation:"slideDown 0.2s ease"}}>
            {/* per-user summary cards */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",padding:"0 14px 12px"}}>
              {[
                { name:p1Name, uid:myId,      s:myStats },
                { name:p2Name, uid:partnerId, s:p2Stats },
              ].map((p,i) => (
                <button
                  key={p.uid}
                  onClick={() => setHistFilter(v => v===p.uid ? "all" : p.uid)}
                  style={{
                    background: histFilter===p.uid ? "#f0fdf4" : "#fafafa",
                    border:`1.5px solid ${histFilter===p.uid ? "#10b981" : "#e5e7eb"}`,
                    borderRadius:"14px", padding:"10px 8px",
                    textAlign:"center", cursor:"pointer",
                  }}
                >
                  <div style={{fontSize:"11px",fontWeight:700,color:"#1f2937",marginBottom:"6px"}}>
                    {p.name} {i===0&&<span style={{fontSize:"9px",color:"#34d399"}}>(you)</span>}
                  </div>
                  <div style={{display:"flex",justifyContent:"center",gap:"8px",flexWrap:"wrap"}}>
                    <span style={{fontSize:"10px",background:"#dcfce7",color:"#059669",borderRadius:"8px",padding:"2px 6px",fontWeight:700}}>
                      🏆 {p.s.won} set
                    </span>
                    <span style={{fontSize:"10px",background:"#fff1f2",color:"#f43f5e",borderRadius:"8px",padding:"2px 6px",fontWeight:700}}>
                      😈 {p.s.lost} received
                    </span>
                    <span style={{fontSize:"10px",background:"#f0fdf4",color:"#10b981",borderRadius:"8px",padding:"2px 6px",fontWeight:700}}>
                      ✅ {p.s.done} done
                    </span>
                    <span style={{fontSize:"10px",background:"#fef9c3",color:"#92400e",borderRadius:"8px",padding:"2px 6px",fontWeight:700}}>
                      🙅 {p.s.declined} declined
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* filter label */}
            {histFilter !== "all" && (
              <div style={{padding:"0 14px 10px",display:"flex",alignItems:"center",gap:"8px"}}>
                <span style={{fontSize:"11px",color:"#6b7280"}}>
                  Showing stakes for <strong>{histFilter===myId?p1Name:p2Name}</strong>
                </span>
                <button
                  onClick={()=>setHistFilter("all")}
                  style={{fontSize:"10px",color:"#10b981",background:"#f0fdf4",border:"none",borderRadius:"8px",padding:"2px 8px",cursor:"pointer",fontWeight:600}}
                >
                  Clear
                </button>
              </div>
            )}

            {/* history list */}
            <div style={{maxHeight:"340px",overflowY:"auto",borderTop:"1px solid #f0fdf4"}}>
              {filteredHistory.length === 0 ? (
                <div style={{padding:"24px",textAlign:"center",color:"#9ca3af",fontSize:"12px"}}>
                  No settled stakes yet — start a round! 🎲
                </div>
              ) : (
                filteredHistory.map((h, idx) => {
                  const winnerName = h.fromUserId === myId ? p1Name : p2Name;
                  const loserName  = h.toUserId   === myId ? p1Name : p2Name;
                  const isDone     = h.status === "done";
                  return (
                    <div
                      key={idx}
                      style={{
                        padding:"12px 16px",
                        borderBottom: idx < filteredHistory.length-1 ? "1px solid #f0fdf4" : "none",
                        display:"flex", gap:"10px", alignItems:"flex-start",
                      }}
                    >
                      <div style={{
                        width:"32px", height:"32px", borderRadius:"50%", flexShrink:0,
                        background: isDone ? "linear-gradient(135deg,#10b981,#059669)" : "linear-gradient(135deg,#fbbf24,#f59e0b)",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:"14px",
                      }}>
                        {isDone ? "✅" : "🙅"}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{
                          fontSize:"12px", fontWeight:700, color:"#1f2937",
                          marginBottom:"3px", lineHeight:1.4,
                          whiteSpace:"pre-wrap", wordBreak:"break-word",
                        }}>
                          "{h.text}"
                        </div>
                        <div style={{fontSize:"10px",color:"#9ca3af"}}>
                          <span style={{color:"#10b981",fontWeight:600}}>{winnerName}</span>
                          {" → "}
                          <span style={{color:"#f43f5e",fontWeight:600}}>{loserName}</span>
                          {" · "}
                          <span style={{
                            background: isDone ? "#dcfce7" : "#fef9c3",
                            color: isDone ? "#059669" : "#92400e",
                            borderRadius:"6px", padding:"1px 5px", fontWeight:700,
                          }}>
                            {isDone ? "Done" : "Declined"}
                          </span>
                          {" · "}
                          {relTime(h.completedAt)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      <FaTrophy style={{display:"block",margin:"18px auto 4px",color:"#10b981",fontSize:"14px",opacity:0.5}}/>
      <p style={{textAlign:"center",fontSize:"11px",color:"#6ee7b7",fontStyle:"italic",fontFamily:"'Playfair Display',serif"}}>
        May the best player win 🏆
      </p>
    </div>
  );
}