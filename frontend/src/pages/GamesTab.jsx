// // client/src/pages/GamesTab.jsx
// import { useEffect, useState } from "react";
// import { TRUTHS, DARES, STAKE_SUGGESTIONS } from "../lib/constants";

// function Spinner() {
//   return <span style={{display:"inline-block",width:"14px",height:"14px",border:"2px solid rgba(255,255,255,0.4)",borderTopColor:"white",borderRadius:"50%",animation:"spin 0.7s linear infinite",verticalAlign:"middle",marginRight:"6px"}}/>;
// }

// const GAME_TABS = [
//   { id:"truth", label:"💬 Truth" },
//   { id:"dare",  label:"🔥 Dare"  },
//   { id:"bet",   label:"🎲 Bet Game" },
// ];

// export default function GamesTab({
//   user,
//   partner,
//   scores,
//   game,
//   gameBusy,
//   onSubmitTruth,
//   onSubmitDare,
//   onReviewGame,
//   ticTacToe,
//   betBusy,
//   onStartBet,
//   onPlayBet,
//   onSetStake,
//   onReviewStake,
// }) {
//   const myId = user?.id;
//   const partnerId = partner?._id || partner?.id;

//   const p1Name = user?.name?.split(" ")[0]    || "You";
//   const p2Name = partner?.name?.split(" ")[0] || "Partner";

//   const turnUserId = game?.turnUserId;
//   const pending = game?.pending || {};
//   const pendingType = pending.type; // "truth" | "dare" | null

//   const isMyTurn = !!turnUserId && !!myId && turnUserId === myId;
//   const isReceiver = !!pendingType && pending.toUserId === myId;
//   const isSender = !!pendingType && pending.fromUserId === myId;

//   const turnLabel = turnUserId === myId ? p1Name : p2Name;
//   const senderName = pending.fromUserId === myId ? p1Name : p2Name;

//   const p1Score = scores?.[myId] || 0;
//   const p2Score = scores?.[partnerId] || 0;

//   const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

//   const [mode, setMode] = useState("truth");
//   const [truthPrompt, setTruthPrompt] = useState("");
//   const [truthAnswer, setTruthAnswer] = useState("");

//   const [darePrompt, setDarePrompt] = useState("");
//   const [dareVideoDataUri, setDareVideoDataUri] = useState(null);

//   const [betText, setBetText] = useState("");

//   useEffect(() => {
//     if (!isMyTurn || pendingType) return;
//     if (mode === "truth") {
//       setTruthPrompt(rand(TRUTHS));
//       setTruthAnswer("");
//     }
//     if (mode === "dare") {
//       setDarePrompt(rand(DARES));
//       setDareVideoDataUri(null);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isMyTurn, pendingType, mode]);

//   // ── Waiting screen — shown to non-active player ──
//   const WaitingScreen = () => (
//     <div style={{
//       background:"white", borderRadius:"20px",
//       border:"1px solid #fce7f3", padding:"32px 20px",
//       textAlign:"center", boxShadow:"0 4px 20px rgba(244,63,94,0.08)",
//     }}>
//       <div style={{fontSize:"48px",marginBottom:"14px"}}>⏳</div>
//       <div style={{fontFamily:"'Playfair Display',serif",fontSize:"20px",fontWeight:700,color:"#1f2937",marginBottom:"8px"}}>
//         {turnLabel}'s turn
//       </div>
//       <div style={{fontSize:"13px",color:"#9ca3af",marginBottom:"20px",lineHeight:1.6}}>
//         Waiting for {turnLabel} to play their turn.<br/>
//         You'll go next — sit tight! 💕
//       </div>
//       <div style={{
//         background:"#fff1f2", borderRadius:"14px",
//         padding:"12px 16px", border:"1px solid #fce7f3",
//         display:"inline-flex", alignItems:"center", gap:"8px",
//       }}>
//         <div style={{width:"8px",height:"8px",borderRadius:"50%",background:"#f43f5e",animation:"pulse 1.5s ease-in-out infinite"}}/>
//         <span style={{fontSize:"12px",fontWeight:600,color:"#f43f5e"}}>{turnLabel} is playing now</span>
//       </div>
//       <p style={{fontSize:"11px",color:"#d1d5db",marginTop:"16px"}}>
//         Tap 🔄 sync in the header to refresh scores
//       </p>
//     </div>
//   );

//   const GameCard = ({ gradient, children }) => (
//     <div style={{background:gradient,borderRadius:"20px",padding:"20px",color:"white",boxShadow:"0 8px 28px rgba(0,0,0,0.12)",textAlign:"center"}} className="card-flip">
//       {children}
//     </div>
//   );

//   // ── Bet Game (Tic-Tac-Toe with stakes) ──────────────────────────────────
//   const ttt          = ticTacToe || {};
//   const board        = ttt.board?.length === 9 ? ttt.board : Array(9).fill(null);
//   const betStatus     = ttt.status || "idle";
//   const symbols       = ttt.symbols || {};
//   const betWinnerId   = ttt.winnerUserId || null;
//   const stake         = ttt.stake || {};
//   const betTurnUserId = ttt.turnUserId || null;
//   const roundsWon     = ttt.roundsWon || {};

//   const mySymbol      = symbols[myId];
//   const isMyBetTurn    = !!betTurnUserId && betTurnUserId === myId;
//   const iAmBetWinner   = !!betWinnerId && betWinnerId === myId;
//   const betWinnerName  = betWinnerId === myId ? p1Name : p2Name;
//   const betLoserName   = betWinnerId === myId ? p2Name : p1Name;
//   const isStakeSetter  = betStatus === "awaiting_stake" && iAmBetWinner;
//   const isStakeReviewer= betStatus === "stake_set" && stake.status === "pending" && stake.toUserId === myId;

//   const BetGamePanel = () => (
//     <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
//       {(roundsWon[myId] || roundsWon[partnerId]) ? (
//         <div style={{display:"flex",justifyContent:"center",gap:"18px",fontSize:"11px",color:"#9ca3af",fontWeight:600}}>
//           <span>🏆 {p1Name}: {roundsWon[myId] || 0}</span>
//           <span>🏆 {p2Name}: {roundsWon[partnerId] || 0}</span>
//         </div>
//       ) : null}

//       {betStatus === "idle" && (
//         <GameCard gradient="linear-gradient(135deg,#10b981,#059669,#34d399)">
//           <div style={{fontSize:"34px",marginBottom:"10px"}}>🎲</div>
//           <div style={{fontSize:"10px",letterSpacing:"2px",opacity:0.8,marginBottom:"8px",textTransform:"uppercase"}}>Bet Game</div>
//           <div style={{fontFamily:"'Playfair Display',serif",fontSize:"16px",fontWeight:700,lineHeight:1.5,marginBottom:"14px"}}>
//             Play Tic-Tac-Toe — whoever wins picks the stake. Loser has to do it! 😈
//           </div>
//           <button
//             onClick={onStartBet}
//             disabled={betBusy}
//             style={{padding:"12px 22px",borderRadius:"14px",border:"none",cursor:"pointer",background:"white",color:"#059669",fontSize:"13px",fontWeight:800,opacity:betBusy?0.6:1}}
//           >
//             {betBusy ? <><Spinner/>Starting…</> : "🎮 Start Round"}
//           </button>
//         </GameCard>
//       )}

//       {betStatus === "playing" && (
//         <>
//           <div style={{textAlign:"center",fontSize:"13px",fontWeight:700,color: isMyBetTurn ? "#059669" : "#9ca3af"}}>
//             {isMyBetTurn ? "Your move — " : `${betTurnUserId === myId ? p1Name : p2Name}'s move — `}
//             you're <span style={{color:"#1f2937"}}>{mySymbol || "?"}</span>
//           </div>
//           <div style={{
//             display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"8px",
//             background:"white", borderRadius:"18px", border:"1px solid #fce7f3",
//             padding:"12px", boxShadow:"0 4px 16px rgba(16,185,129,0.08)",
//           }}>
//             {board.map((cell, i) => (
//               <button
//                 key={i}
//                 onClick={() => onPlayBet(i)}
//                 disabled={betBusy || !isMyBetTurn || !!cell}
//                 style={{
//                   aspectRatio:"1", borderRadius:"14px",
//                   border:"2px solid #f0fdf4",
//                   background: cell ? "#f0fdf4" : "#fafafa",
//                   fontSize:"26px", fontWeight:800,
//                   color: cell === "X" ? "#10b981" : "#f43f5e",
//                   cursor: (betBusy || !isMyBetTurn || cell) ? "default" : "pointer",
//                   display:"flex", alignItems:"center", justifyContent:"center",
//                 }}
//               >
//                 {cell}
//               </button>
//             ))}
//           </div>
//         </>
//       )}

//       {betStatus === "draw" && (
//         <GameCard gradient="linear-gradient(135deg,#9ca3af,#6b7280)">
//           <div style={{fontSize:"34px",marginBottom:"10px"}}>🤝</div>
//           <div style={{fontFamily:"'Playfair Display',serif",fontSize:"17px",fontWeight:700,marginBottom:"14px"}}>It's a draw! No stake this round.</div>
//           <button
//             onClick={onStartBet}
//             disabled={betBusy}
//             style={{padding:"12px 22px",borderRadius:"14px",border:"none",cursor:"pointer",background:"white",color:"#374151",fontSize:"13px",fontWeight:800,opacity:betBusy?0.6:1}}
//           >
//             {betBusy ? <><Spinner/>Starting…</> : "🔄 Play Again"}
//           </button>
//         </GameCard>
//       )}

//       {betStatus === "awaiting_stake" && isStakeSetter && (
//         <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
//           <GameCard gradient="linear-gradient(135deg,#10b981,#059669)">
//             <div style={{fontSize:"34px",marginBottom:"10px"}}>🏆</div>
//             <div style={{fontFamily:"'Playfair Display',serif",fontSize:"17px",fontWeight:700}}>You won! Name your price 😏</div>
//           </GameCard>
//           <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
//             {STAKE_SUGGESTIONS.map((s) => (
//               <button
//                 key={s}
//                 onClick={() => setBetText(s)}
//                 disabled={betBusy}
//                 style={{padding:"7px 11px",borderRadius:"16px",border:"1px solid #d1fae5",background: betText===s?"#10b981":"#f0fdf4",color: betText===s?"white":"#059669",fontSize:"11px",fontWeight:600,cursor:"pointer"}}
//               >
//                 {s}
//               </button>
//             ))}
//           </div>
//           <textarea
//             rows={2}
//             value={betText}
//             onChange={(e) => setBetText(e.target.value)}
//             placeholder="Or write your own stake…"
//             style={{width:"100%",border:"1px solid #fce7f3",borderRadius:"16px",padding:"12px 14px",fontSize:"13px",color:"#374151",resize:"none",outline:"none",background:"white",fontFamily:"inherit"}}
//           />
//           <button
//             onClick={() => { if (betText.trim()) { onSetStake(betText.trim()); setBetText(""); } }}
//             disabled={betBusy || !betText.trim()}
//             style={{padding:"12px",borderRadius:"14px",border:"none",cursor:"pointer",background:"linear-gradient(135deg,#10b981,#059669)",color:"white",fontSize:"13px",fontWeight:700,opacity: betBusy || !betText.trim() ? 0.5 : 1,boxShadow:"0 4px 12px rgba(16,185,129,0.3)"}}
//           >
//             {betBusy ? <><Spinner/>Sending…</> : `😈 Send Stake to ${betLoserName}`}
//           </button>
//         </div>
//       )}

//       {betStatus === "awaiting_stake" && !isStakeSetter && (
//         <GameCard gradient="linear-gradient(135deg,#9ca3af,#6b7280)">
//           <div style={{fontSize:"34px",marginBottom:"10px"}}>⏳</div>
//           <div style={{fontFamily:"'Playfair Display',serif",fontSize:"16px",fontWeight:700}}>{betWinnerName} won this round!</div>
//           <div style={{fontSize:"12px",opacity:0.85,marginTop:"6px"}}>Waiting for them to decide your stake… 😬</div>
//         </GameCard>
//       )}

//       {betStatus === "stake_set" && isStakeReviewer && (
//         <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
//           <GameCard gradient="linear-gradient(135deg,#f43f5e,#ec4899)">
//             <div style={{fontSize:"34px",marginBottom:"10px"}}>😈</div>
//             <div style={{fontSize:"10px",letterSpacing:"2px",opacity:0.8,marginBottom:"8px",textTransform:"uppercase"}}>{betWinnerName}'s stake</div>
//             <div style={{fontFamily:"'Playfair Display',serif",fontSize:"17px",fontWeight:700,lineHeight:1.5,whiteSpace:"pre-wrap"}}>{stake.text}</div>
//           </GameCard>
//           <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
//             <button
//               onClick={() => onReviewStake("done")}
//               disabled={betBusy}
//               style={{padding:"12px",borderRadius:"14px",border:"none",cursor:"pointer",background:"linear-gradient(135deg,#10b981,#059669)",color:"white",fontSize:"13px",fontWeight:700,opacity:betBusy?0.5:1,boxShadow:"0 4px 12px rgba(16,185,129,0.3)"}}
//             >
//               {betBusy ? <><Spinner/>Saving…</> : "✅ I'll do it"}
//             </button>
//             <button
//               onClick={() => onReviewStake("decline")}
//               disabled={betBusy}
//               style={{padding:"12px",borderRadius:"14px",border:"1px solid #fce7f3",cursor:"pointer",background:"white",color:"#f43f5e",fontSize:"13px",fontWeight:700,opacity:betBusy?0.5:1}}
//             >
//               🙅 Decline
//             </button>
//           </div>
//         </div>
//       )}

//       {betStatus === "stake_set" && !isStakeReviewer && (
//         <GameCard gradient="linear-gradient(135deg,#9ca3af,#6b7280)">
//           <div style={{fontSize:"34px",marginBottom:"10px"}}>⏳</div>
//           <div style={{fontFamily:"'Playfair Display',serif",fontSize:"16px",fontWeight:700}}>Waiting for {betLoserName}…</div>
//           <div style={{fontSize:"12px",opacity:0.85,marginTop:"6px"}}>They're deciding whether to accept your stake.</div>
//         </GameCard>
//       )}
//     </div>
//   );

//   return (
//     <div className="max-w-2xl mx-auto px-3 py-4">
//       <style>{`
//         @keyframes spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
//         @keyframes flipIn  { from{opacity:0;transform:rotateY(90deg) scale(0.85)} to{opacity:1;transform:rotateY(0) scale(1)} }
//         @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.4} }
//         .card-flip  { animation:flipIn 0.4s cubic-bezier(0.34,1.4,0.64,1); }
//         .pf         { transition:width 1s cubic-bezier(0.4,0,0.2,1); }
//         .gtab       { transition:all 0.18s; border:none; cursor:pointer; }
//         .gtab:hover { transform:translateY(-1px); }
//         ::-webkit-scrollbar{ height:3px; } ::-webkit-scrollbar-thumb{ background:#fda4af; border-radius:4px; }
//       `}</style>

//       {/* ── Scoreboard ── */}
//       <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"14px"}}>
//         {[
//           { name:p1Name, photo:user?.photo,    score:p1Score, mine:true,  userId: myId },
//           { name:p2Name, photo:partner?.photo, score:p2Score, mine:false, userId: partnerId },
//         ].map((p,i) => {
//           const isTurn = !!turnUserId && p.userId === turnUserId;
//           return (
//             <div key={i} style={{
//               background:"white", borderRadius:"16px", padding:"12px",
//               textAlign:"center",
//               border:`2px solid ${isTurn?"#f43f5e":"#fce7f3"}`,
//               boxShadow: isTurn?"0 4px 16px rgba(244,63,94,0.18)":"0 2px 8px rgba(244,63,94,0.05)",
//               opacity: isTurn ? 1 : 0.65,
//               transition:"all 0.2s",
//             }}>
//               {p.photo
//                 ? <img src={p.photo} alt="" style={{width:"36px",height:"36px",borderRadius:"50%",margin:"0 auto 6px",display:"block",border:"2px solid #fce7f3",objectFit:"cover"}}/>
//                 : <div style={{width:"36px",height:"36px",borderRadius:"50%",margin:"0 auto 6px",background:`linear-gradient(135deg,${i===0?"#f43f5e,#ec4899":"#8b5cf6,#6366f1"})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"15px"}}>{i===0?"👸":"🤴"}</div>
//               }
//               <div style={{fontSize:"11px",color:"#6b7280",fontWeight:600}}>
//                 {p.name} {p.mine && <span style={{fontSize:"9px",color:"#fda4af"}}>(you)</span>}
//               </div>
//               <div style={{fontFamily:"'Playfair Display',serif",fontSize:"26px",fontWeight:700,color:isTurn?"#f43f5e":"#9ca3af",lineHeight:1}}>{p.score}</div>
//               <div style={{fontSize:"9px",color:"#d1d5db"}}>pts</div>
//               {isTurn
//                 ? <div style={{fontSize:"10px",color:"#f43f5e",fontWeight:700,marginTop:"4px",background:"#fff1f2",borderRadius:"8px",padding:"2px 6px"}}>🎯 Playing</div>
//                 : <div style={{fontSize:"10px",color:"#d1d5db",marginTop:"4px"}}>waiting…</div>
//               }
//             </div>
//           );
//         })}
//       </div>

//       {/* ── Mode tabs — always visible ── */}
//       <div style={{display:"flex",gap:"6px",overflowX:"auto",paddingBottom:"10px",marginBottom:"14px"}}>
//         {GAME_TABS.map(t => {
//           const active = mode === t.id;
//           return (
//             <button
//               key={t.id}
//               className="gtab"
//               onClick={() => setMode(t.id)}
//               style={{
//                 flexShrink:0,
//                 padding:"6px 12px",
//                 borderRadius:"20px",
//                 fontSize:"11px",
//                 fontWeight:700,
//                 background: active ? "linear-gradient(135deg,#f43f5e,#ec4899)" : "white",
//                 color: active ? "white" : "#6b7280",
//                 boxShadow: active ? "0 3px 10px rgba(244,63,94,0.3)" : "0 1px 4px rgba(0,0,0,0.06)",
//               }}
//             >
//               {t.label}
//             </button>
//           );
//         })}
//       </div>

//       {mode === "bet" && <BetGamePanel />}

//       {mode !== "bet" && (
//         <>
//           {/* ── Receiver review ── */}
//           {isReceiver && pendingType && (
//         <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
//           {pendingType === "truth" && (
//             <>
//               <GameCard gradient="linear-gradient(135deg,#f43f5e,#ec4899,#fb7185)">
//                 <div style={{fontSize:"34px",marginBottom:"10px"}}>💬</div>
//                 <div style={{fontSize:"10px",letterSpacing:"2px",opacity:0.75,marginBottom:"8px",textTransform:"uppercase"}}>Truth from {senderName}</div>
//                 <div style={{fontFamily:"'Playfair Display',serif",fontSize:"15px",fontWeight:700,lineHeight:1.55,whiteSpace:"pre-wrap"}}>{pending.truthPrompt}</div>
//                 <div style={{marginTop:"10px",background:"#fff1f2",border:"1px solid #fce7f3",borderRadius:"14px",padding:"12px",color:"#1f2937"}}>
//                   <div style={{fontSize:"10px",color:"#f43f5e",fontWeight:800,letterSpacing:"1px",textTransform:"uppercase",marginBottom:"4px"}}>Response</div>
//                   <div style={{fontSize:"14px",fontFamily:"inherit",fontWeight:700,whiteSpace:"pre-wrap"}}>{pending.truthText}</div>
//                 </div>
//               </GameCard>
//             </>
//           )}

//           {pendingType === "dare" && (
//             <>
//               <GameCard gradient="linear-gradient(135deg,#f97316,#f43f5e)">
//                 <div style={{fontSize:"34px",marginBottom:"10px"}}>🔥</div>
//                 <div style={{fontSize:"10px",letterSpacing:"2px",opacity:0.75,marginBottom:"8px",textTransform:"uppercase"}}>Dare from {senderName}</div>
//                 <div style={{fontFamily:"'Playfair Display',serif",fontSize:"15px",fontWeight:700,lineHeight:1.55,whiteSpace:"pre-wrap"}}>{pending.darePrompt}</div>
//               </GameCard>
//               <div style={{background:"#fff1f2",borderRadius:"16px",border:"1px solid #fce7f3",padding:"12px"}}>
//                 <video
//                   src={pending.dareVideo}
//                   controls
//                   style={{width:"100%",borderRadius:"12px",background:"#000"}}
//                 />
//               </div>
//             </>
//           )}

//           <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
//             <button
//               onClick={() => onReviewGame("done")}
//               disabled={gameBusy}
//               style={{
//                 padding:"12px",
//                 borderRadius:"14px",
//                 border:"none",
//                 cursor:"pointer",
//                 background:"linear-gradient(135deg,#f43f5e,#ec4899)",
//                 color:"white",
//                 fontSize:"13px",
//                 fontWeight:700,
//                 opacity: gameBusy ? 0.5 : 1,
//                 boxShadow:"0 4px 12px rgba(244,63,94,0.3)",
//               }}
//             >
//               {gameBusy ? <><Spinner/>Saving…</> : pendingType === "truth" ? "✅ Done (+10)" : "🏆 Done (+20)"}
//             </button>

//             <button
//               onClick={() => onReviewGame("skip")}
//               disabled={gameBusy}
//               style={{
//                 padding:"12px",
//                 borderRadius:"14px",
//                 border:"1px solid #fce7f3",
//                 cursor:"pointer",
//                 background:"white",
//                 color:"#f43f5e",
//                 fontSize:"13px",
//                 fontWeight:700,
//                 opacity: gameBusy ? 0.5 : 1,
//               }}
//             >
//               {pendingType === "truth" ? "⏭️ Skip (+5)" : "⏭️ Skip (+10)"}
//             </button>
//           </div>
//         </div>
//       )}

//       {/* ── Sender submit ── */}
//       {isMyTurn && !pendingType && (
//         <>
//           {mode === "truth" && (
//             <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
//               <GameCard gradient="linear-gradient(135deg,#f43f5e,#ec4899,#fb7185)">
//                 <div style={{fontSize:"34px",marginBottom:"10px"}}>💬</div>
//                 <div style={{fontSize:"10px",letterSpacing:"2px",opacity:0.75,marginBottom:"8px",textTransform:"uppercase"}}>Truth for {p2Name}</div>
//                 <div style={{fontFamily:"'Playfair Display',serif",fontSize:"17px",fontWeight:700,lineHeight:1.5,whiteSpace:"pre-wrap"}}>{truthPrompt}</div>
//               </GameCard>

//               <textarea
//                 rows={3}
//                 value={truthAnswer}
//                 onChange={(e) => setTruthAnswer(e.target.value)}
//                 placeholder="Your honest answer…"
//                 style={{width:"100%",border:"1px solid #fce7f3",borderRadius:"16px",padding:"12px 14px",fontSize:"13px",color:"#374151",resize:"none",outline:"none",background:"white",fontFamily:"inherit"}}
//               />

//               <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
//                 <button
//                   onClick={() => setTruthPrompt(rand(TRUTHS))}
//                   disabled={gameBusy}
//                   style={{padding:"12px",borderRadius:"14px",border:"1px solid #fce7f3",background:"white",color:"#f43f5e",fontSize:"13px",fontWeight:700,cursor:"pointer",opacity: gameBusy ? 0.5 : 1}}
//                 >
//                   🔄 New Q
//                 </button>

//                 <button
//                   onClick={() => onSubmitTruth(truthPrompt, truthAnswer)}
//                   disabled={gameBusy || !truthAnswer.trim()}
//                   style={{padding:"12px",borderRadius:"14px",border:"none",cursor:"pointer",background:"linear-gradient(135deg,#f43f5e,#ec4899)",color:"white",fontSize:"13px",fontWeight:700,opacity: gameBusy || !truthAnswer.trim() ? 0.5 : 1,boxShadow:"0 4px 12px rgba(244,63,94,0.3)"}}
//                 >
//                   {gameBusy ? <><Spinner/>Sending…</> : "✅ Send Truth"}
//                 </button>
//               </div>
//             </div>
//           )}

//           {mode === "dare" && (
//             <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
//               <GameCard gradient="linear-gradient(135deg,#f97316,#f43f5e)">
//                 <div style={{fontSize:"34px",marginBottom:"10px"}}>🔥</div>
//                 <div style={{fontSize:"10px",letterSpacing:"2px",opacity:0.75,marginBottom:"8px",textTransform:"uppercase"}}>Dare for {p2Name}</div>
//                 <div style={{fontFamily:"'Playfair Display',serif",fontSize:"17px",fontWeight:700,lineHeight:1.5,whiteSpace:"pre-wrap"}}>{darePrompt}</div>
//               </GameCard>

//               <div style={{background:"#fff1f2",borderRadius:"16px",border:"1px solid #fce7f3",padding:"12px"}}>
//                 <div style={{fontSize:"12px",color:"#374151",fontWeight:700,marginBottom:"6px"}}>Record / Upload your dare video</div>
//                 <input
//                   type="file"
//                   accept="video/*"
//                   disabled={gameBusy}
//                   onChange={(e) => {
//                     const file = e.target.files?.[0];
//                     if (!file) return;
//                     const MAX_VIDEO_BYTES = 20 * 1024 * 1024;
//                     if (file.size > MAX_VIDEO_BYTES) {
//                       alert("Video too large. Max size is 20MB.");
//                       return;
//                     }
//                     const r = new FileReader();
//                     r.onload = (ev) => {
//                       setDareVideoDataUri(ev.target.result);
//                     };
//                     r.readAsDataURL(file);
//                   }}
//                   style={{width:"100%"}}
//                 />
//                 <div style={{fontSize:"11px",color:"#9ca3af",marginTop:"6px"}}>Max 20MB. Video will be shared to your partner.</div>
//               </div>

//               {dareVideoDataUri && (
//                 <div style={{background:"#fff",borderRadius:"16px",border:"1px solid #fce7f3",padding:"12px"}}>
//                   <video
//                     src={dareVideoDataUri}
//                     controls
//                     style={{width:"100%",borderRadius:"12px",background:"#000"}}
//                   />
//                 </div>
//               )}

//               <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
//                 <button
//                   onClick={() => { setDarePrompt(rand(DARES)); setDareVideoDataUri(null); }}
//                   disabled={gameBusy}
//                   style={{padding:"12px",borderRadius:"14px",border:"1px solid #fce7f3",background:"white",color:"#f43f5e",fontSize:"13px",fontWeight:700,cursor:"pointer",opacity: gameBusy ? 0.5 : 1}}
//                 >
//                   🔄 New Dare
//                 </button>
//                 <button
//                   onClick={() => onSubmitDare(darePrompt, dareVideoDataUri)}
//                   disabled={gameBusy || !dareVideoDataUri}
//                   style={{padding:"12px",borderRadius:"14px",border:"none",cursor:"pointer",background:"linear-gradient(135deg,#f97316,#f43f5e)",color:"white",fontSize:"13px",fontWeight:700,opacity: gameBusy || !dareVideoDataUri ? 0.5 : 1,boxShadow:"0 4px 12px rgba(244,63,94,0.3)"}}
//                 >
//                   {gameBusy ? <><Spinner/>Sending…</> : "🎥 Send Dare Video"}
//                 </button>
//               </div>
//             </div>
//           )}
//         </>
//       )}

//       {/* ── Default waiting (not receiver or sender) ── */}
//       {!isMyTurn && !isReceiver && <WaitingScreen />}
//         </>
//       )}

//       <p style={{textAlign:"center",fontSize:"11px",color:"#fda4af",marginTop:"16px",fontStyle:"italic",fontFamily:"'Playfair Display',serif"}}>Play together, laugh together 💗</p>
//     </div>
//   );
// }
















// frontend/src/pages/GamesTab.jsx  ─  Games Hub (entry point)
export default function GamesTab({ setTab }) {
  const CARDS = [
    {
      id:       "truthordare",
      emoji:    "💬🔥",
      label:    "Truth or Dare",
      sub:      "Answer honestly or take the dare",
      grad:     "linear-gradient(135deg,#f43f5e 0%,#ec4899 55%,#fb7185 100%)",
      shadow:   "rgba(244,63,94,0.35)",
      badge:    null,
    },
    {
      id:       "betgame",
      emoji:    "🎲",
      label:    "Bet Game",
      sub:      "Tic-Tac-Toe with real stakes & history",
      grad:     "linear-gradient(135deg,#10b981 0%,#059669 55%,#34d399 100%)",
      shadow:   "rgba(16,185,129,0.35)",
      badge:    "NEW",
    },
  ];

  return (
    <div className="max-w-2xl mx-auto px-3 py-4">
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        .gc { animation: fadeUp 0.38s cubic-bezier(0.34,1.3,0.64,1) both; }
        .gc:nth-child(2) { animation-delay: 0.08s; }
        .gc:hover { transform:translateY(-3px) scale(1.01); }
        .gc { transition: transform 0.18s, box-shadow 0.18s; }
      `}</style>

      <div style={{ textAlign:"center", marginBottom:"22px", padding:"10px 0" }}>
        <div style={{ fontSize:"34px", marginBottom:"8px" }}>🎮</div>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"22px", fontWeight:700, color:"#1f2937" }}>
          Games
        </div>
        <div style={{ fontSize:"12px", color:"#9ca3af", marginTop:"4px" }}>
          Pick a game to play with your partner
        </div>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
        {CARDS.map((c) => (
          <button
            key={c.id}
            className="gc"
            onClick={() => setTab(c.id)}
            style={{
              display:"flex", alignItems:"center", gap:"18px",
              background:c.grad,
              borderRadius:"22px",
              padding:"22px 20px",
              border:"none",
              cursor:"pointer",
              color:"white",
              textAlign:"left",
              boxShadow:`0 10px 32px ${c.shadow}`,
              width:"100%",
              position:"relative",
              overflow:"hidden",
            }}
          >
            {/* decorative circle */}
            <div style={{
              position:"absolute", right:"-18px", top:"-18px",
              width:"100px", height:"100px", borderRadius:"50%",
              background:"rgba(255,255,255,0.1)",
            }}/>
            <div style={{
              fontSize:"38px", flexShrink:0,
              background:"rgba(255,255,255,0.18)",
              borderRadius:"16px",
              width:"62px", height:"62px",
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              {c.emoji}
            </div>
            <div style={{ flex:1, position:"relative" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"5px" }}>
                <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"18px", fontWeight:700 }}>
                  {c.label}
                </span>
                {c.badge && (
                  <span style={{
                    fontSize:"9px", fontWeight:800, letterSpacing:"1px",
                    background:"rgba(255,255,255,0.9)", color:"#059669",
                    padding:"2px 7px", borderRadius:"20px",
                  }}>{c.badge}</span>
                )}
              </div>
              <div style={{ fontSize:"12px", opacity:0.88, lineHeight:1.5 }}>
                {c.sub}
              </div>
            </div>
            <div style={{ fontSize:"20px", opacity:0.7, flexShrink:0 }}>›</div>
          </button>
        ))}
      </div>

      <p style={{ textAlign:"center", fontSize:"11px", color:"#fda4af", marginTop:"24px", fontStyle:"italic", fontFamily:"'Playfair Display',serif" }}>
        Play together, grow together 💗
      </p>
    </div>
  );
}