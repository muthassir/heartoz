// client/src/pages/DashboardTab.jsx
export default function DashboardTab({ dates, buckets, memories, scores, user, partner, setTab }) {

  const totalDone  = Object.values(dates).filter(d => d.done).length;
  const bucketDone = buckets.filter(b => b.done).length;
  const p1Name     = user?.name?.split(" ")[0]    || "You";
  const p2Name     = partner?.name?.split(" ")[0] || "Partner";
  const p1Score    = scores[user?.id]     || 0;
  const p2Score    = scores[partner?._id] || 0;
  const latestMem  = memories[0];
  const totalScore = p1Score + p2Score;

  // Pick a greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Next undone A-Z letter
  const nextLetter = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").find(l => !dates[l]?.done);

  return (
    <div style={{maxWidth:"680px", margin:"0 auto", padding:"16px 14px 48px"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400;700&display=swap');
        @keyframes fadeUp   { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scaleIn  { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }
        @keyframes shimmer  { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:0.6} }
        @keyframes countUp  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

        .d-hero    { animation: scaleIn 0.5s cubic-bezier(0.34,1.1,0.64,1) both; }
        .d-card    { animation: fadeUp  0.45s cubic-bezier(0.34,1.2,0.64,1) both; }
        .d-card:hover .d-arrow { transform: translateX(4px); }

        .d-arrow   { transition: transform 0.2s; display:inline-block; }
        .d-pbar    { transition: width 1.2s cubic-bezier(0.4,0,0.2,1); }

        .d-card-inner {
          background: white;
          border-radius: 22px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.22s cubic-bezier(0.34,1.2,0.64,1), box-shadow 0.22s;
          box-shadow: 0 4px 24px rgba(244,63,94,0.07), 0 1px 4px rgba(0,0,0,0.04);
        }
        .d-card-inner:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 40px rgba(244,63,94,0.14), 0 2px 8px rgba(0,0,0,0.06);
        }

        .shimmer-text {
          background: linear-gradient(90deg, #f43f5e, #ec4899, #f97316, #f43f5e);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
      `}</style>

      {/* ── Hero greeting banner ── */}
      <div className="d-hero" style={{
        background:"linear-gradient(135deg,#f43f5e 0%,#ec4899 45%,#f97316 100%)",
        borderRadius:"24px",
        padding:"22px 20px",
        marginBottom:"20px",
        position:"relative",
        overflow:"hidden",
        boxShadow:"0 8px 32px rgba(244,63,94,0.35)",
      }}>
        {/* Decorative blobs */}
        <div style={{position:"absolute",top:"-30px",right:"-20px",width:"120px",height:"120px",borderRadius:"50%",background:"rgba(255,255,255,0.08)"}}/>
        <div style={{position:"absolute",bottom:"-40px",left:"30px",width:"90px",height:"90px",borderRadius:"50%",background:"rgba(255,255,255,0.06)"}}/>
        <div style={{position:"absolute",top:"20px",right:"60px",width:"50px",height:"50px",borderRadius:"50%",background:"rgba(255,255,255,0.1)"}}/>

        <div style={{position:"relative"}}>
          <div style={{fontSize:"11px",color:"rgba(255,255,255,0.75)",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:"4px",fontWeight:600}}>
            {greeting}
          </div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:"24px",fontWeight:700,color:"white",lineHeight:1.2,marginBottom:"6px"}}>
            {p1Name} <span style={{opacity:0.7,fontSize:"20px"}}>♥</span> {p2Name}
          </div>
          <div style={{fontSize:"12px",color:"rgba(255,255,255,0.8)",marginBottom:"16px"}}>
            Your couple journal at a glance
          </div>

          {/* Quick stats strip */}
          <div style={{display:"flex",gap:"16px",flexWrap:"wrap"}}>
            {[
              {v:`${totalDone}/26`, l:"Dates Done"},
              {v:`${memories.length}`, l:"Memories"},
              {v:`${totalScore}`, l:"Total pts"},
            ].map(s => (
              <div key={s.l} style={{textAlign:"center"}}>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:"20px",fontWeight:700,color:"white",lineHeight:1}}>{s.v}</div>
                <div style={{fontSize:"10px",color:"rgba(255,255,255,0.7)",marginTop:"1px"}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Next date nudge ── */}
      {nextLetter && (
        <div className="d-card" style={{animationDelay:"60ms",marginBottom:"16px"}}>
          <div onClick={() => setTab("dates")} style={{
            background:"linear-gradient(135deg,#fff1f2,#fdf4ff)",
            borderRadius:"16px", padding:"14px 16px",
            border:"1px solid #fce7f3",
            display:"flex", alignItems:"center", justifyContent:"space-between",
            cursor:"pointer", transition:"all 0.18s",
            boxShadow:"0 2px 12px rgba(244,63,94,0.08)",
          }}>
            <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
              <div style={{
                width:"40px",height:"40px",borderRadius:"12px",flexShrink:0,
                background:"linear-gradient(135deg,#f43f5e,#ec4899)",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontFamily:"'Playfair Display',serif",fontSize:"18px",fontWeight:700,color:"white",
                boxShadow:"0 3px 10px rgba(244,63,94,0.3)",
              }}>{nextLetter}</div>
              <div>
                <div style={{fontSize:"12px",color:"#9ca3af",fontWeight:600}}>Up next</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:"15px",fontWeight:700,color:"#1f2937"}}>
                  Plan your <span className="shimmer-text">"{nextLetter}" date</span>
                </div>
              </div>
            </div>
            <div className="d-arrow" style={{fontSize:"18px",color:"#fda4af"}}>→</div>
          </div>
        </div>
      )}

      {/* ── 2×2 card grid ── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"14px"}}>

        {/* A-Z Dates */}
        <div className="d-card" style={{animationDelay:"120ms"}}>
          <div className="d-card-inner" onClick={() => setTab("dates")}>
            {/* Top accent */}
            <div style={{height:"5px",background:"linear-gradient(90deg,#f43f5e,#fb7185)"}}/>
            <div style={{padding:"16px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"12px"}}>
                <div>
                  <div style={{fontSize:"11px",color:"#9ca3af",fontWeight:700,letterSpacing:"0.8px",textTransform:"uppercase",marginBottom:"4px"}}>📅 A–Z Dates</div>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:"32px",fontWeight:700,color:"#f43f5e",lineHeight:1}}>
                    {totalDone}
                    <span style={{fontSize:"16px",color:"#e5e7eb",fontFamily:"Lato,sans-serif",fontWeight:400}}>/26</span>
                  </div>
                </div>
                <div style={{
                  width:"44px",height:"44px",borderRadius:"14px",flexShrink:0,
                  background:"#fff1f2",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"22px",
                }}>💕</div>
              </div>
              {/* Progress bar */}
              <div style={{background:"#fff1f2",borderRadius:"6px",overflow:"hidden",height:"6px",marginBottom:"6px"}}>
                <div className="d-pbar" style={{height:"100%",background:"linear-gradient(90deg,#f43f5e,#ec4899,#f97316)",borderRadius:"6px",width:`${Math.round((totalDone/26)*100)}%`}}/>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{fontSize:"11px",color:"#9ca3af"}}>
                  {totalDone===0?"Start with A!":totalDone===26?"🎉 All done!": `${26-totalDone} to go`}
                </div>
                <div style={{fontSize:"11px",color:"#fda4af",fontWeight:700}}>{Math.round((totalDone/26)*100)}%</div>
              </div>
              <div style={{marginTop:"14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{fontSize:"11px",color:"#d1d5db"}}>
                  {Object.values(dates).filter(d=>d.photo).length} photos added
                </div>
                <button onClick={e=>{e.stopPropagation();setTab("dates");}} style={{
                  padding:"6px 14px",borderRadius:"10px",border:"none",cursor:"pointer",
                  background:"linear-gradient(135deg,#f43f5e,#ec4899)",color:"white",
                  fontSize:"11px",fontWeight:700,boxShadow:"0 2px 8px rgba(244,63,94,0.3)",
                }}>Open <span className="d-arrow">→</span></button>
              </div>
            </div>
          </div>
        </div>

        {/* Bucket List */}
        <div className="d-card" style={{animationDelay:"180ms"}}>
          <div className="d-card-inner" onClick={() => setTab("bucket")}>
            <div style={{height:"5px",background:"linear-gradient(90deg,#8b5cf6,#a78bfa)"}}/>
            <div style={{padding:"16px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"12px"}}>
                <div>
                  <div style={{fontSize:"11px",color:"#9ca3af",fontWeight:700,letterSpacing:"0.8px",textTransform:"uppercase",marginBottom:"4px"}}>🌟 Bucket List</div>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:"32px",fontWeight:700,color:"#8b5cf6",lineHeight:1}}>
                    {bucketDone}
                    <span style={{fontSize:"16px",color:"#e5e7eb",fontFamily:"Lato,sans-serif",fontWeight:400}}>/{buckets.length||0}</span>
                  </div>
                </div>
                <div style={{width:"44px",height:"44px",borderRadius:"14px",flexShrink:0,background:"#f5f3ff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"22px"}}>🌟</div>
              </div>
              <div style={{background:"#f5f3ff",borderRadius:"6px",overflow:"hidden",height:"6px",marginBottom:"6px"}}>
                <div className="d-pbar" style={{height:"100%",background:"linear-gradient(90deg,#8b5cf6,#a78bfa)",borderRadius:"6px",width:`${buckets.length?Math.round((bucketDone/buckets.length)*100):0}%`}}/>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{fontSize:"11px",color:"#9ca3af"}}>
                  {buckets.length===0?"Add first dream!": `${buckets.length-bucketDone} dreams left`}
                </div>
                <div style={{fontSize:"11px",color:"#a78bfa",fontWeight:700}}>
                  {buckets.length?`${Math.round((bucketDone/buckets.length)*100)}%`:"0%"}
                </div>
              </div>
              <div style={{marginTop:"14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{fontSize:"11px",color:"#d1d5db"}}>
                  {buckets.filter(b=>b.priority==="high").length} high priority
                </div>
                <button onClick={e=>{e.stopPropagation();setTab("bucket");}} style={{
                  padding:"6px 14px",borderRadius:"10px",border:"none",cursor:"pointer",
                  background:"linear-gradient(135deg,#8b5cf6,#a78bfa)",color:"white",
                  fontSize:"11px",fontWeight:700,boxShadow:"0 2px 8px rgba(139,92,246,0.3)",
                }}>Open <span className="d-arrow">→</span></button>
              </div>
            </div>
          </div>
        </div>

        {/* Memories */}
        <div className="d-card" style={{animationDelay:"240ms"}}>
          <div className="d-card-inner" onClick={() => setTab("memories")}>
            <div style={{height:"5px",background:"linear-gradient(90deg,#f97316,#fb923c)"}}/>
            {/* Latest memory photo banner */}
            {latestMem?.imageUrl && (
              <div style={{height:"80px",overflow:"hidden",position:"relative"}}>
                <img src={latestMem.imageUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.4),transparent)"}}/>
                <div style={{position:"absolute",bottom:"6px",left:"12px",fontSize:"10px",color:"white",fontWeight:600}}>Latest memory</div>
              </div>
            )}
            <div style={{padding:"16px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px"}}>
                <div>
                  <div style={{fontSize:"11px",color:"#9ca3af",fontWeight:700,letterSpacing:"0.8px",textTransform:"uppercase",marginBottom:"4px"}}>📸 Memories</div>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:"32px",fontWeight:700,color:"#f97316",lineHeight:1}}>
                    {memories.length}
                    <span style={{fontSize:"14px",color:"#e5e7eb",fontFamily:"Lato,sans-serif",fontWeight:400}}> saved</span>
                  </div>
                </div>
                {!latestMem?.imageUrl && <div style={{width:"44px",height:"44px",borderRadius:"14px",flexShrink:0,background:"#fff7ed",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"22px"}}>📸</div>}
              </div>
              {latestMem ? (
                <div style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"12px"}}>
                  <span style={{fontSize:"14px"}}>{latestMem.mood||"🥰"}</span>
                  <span style={{fontSize:"12px",color:"#6b7280",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontStyle:"italic"}}>"{latestMem.title}"</span>
                </div>
              ) : (
                <div style={{fontSize:"11px",color:"#9ca3af",marginBottom:"12px"}}>No memories yet — capture one!</div>
              )}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{fontSize:"11px",color:"#d1d5db"}}>
                  {memories.filter(m=>m.imageUrl).length} with photos
                </div>
                <button onClick={e=>{e.stopPropagation();setTab("memories");}} style={{
                  padding:"6px 14px",borderRadius:"10px",border:"none",cursor:"pointer",
                  background:"linear-gradient(135deg,#f97316,#fb923c)",color:"white",
                  fontSize:"11px",fontWeight:700,boxShadow:"0 2px 8px rgba(249,115,22,0.3)",
                }}>Open <span className="d-arrow">→</span></button>
              </div>
            </div>
          </div>
        </div>

        {/* Games */}
        <div className="d-card" style={{animationDelay:"300ms"}}>
          <div className="d-card-inner" onClick={() => setTab("games")}>
            <div style={{height:"5px",background:"linear-gradient(90deg,#10b981,#34d399)"}}/>
            <div style={{padding:"16px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"14px"}}>
                <div>
                  <div style={{fontSize:"11px",color:"#9ca3af",fontWeight:700,letterSpacing:"0.8px",textTransform:"uppercase",marginBottom:"4px"}}>🎮 Games</div>
                </div>
                <div style={{width:"44px",height:"44px",borderRadius:"14px",flexShrink:0,background:"#f0fdf4",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"22px"}}>🎮</div>
              </div>

              {/* Score duel */}
              <div style={{
                background:"linear-gradient(135deg,#f0fdf4,#ecfdf5)",
                borderRadius:"14px", padding:"12px 14px",
                border:"1px solid #d1fae5",
                marginBottom:"12px",
              }}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{textAlign:"center",flex:1}}>
                    <div style={{fontFamily:"'Playfair Display',serif",fontSize:"28px",fontWeight:700,color:"#10b981",lineHeight:1}}>{p1Score}</div>
                    <div style={{fontSize:"11px",color:"#6b7280",marginTop:"2px",fontWeight:600}}>{p1Name}</div>
                  </div>
                  <div style={{
                    padding:"4px 10px",borderRadius:"10px",
                    background:"white",border:"1px solid #d1fae5",
                    fontSize:"11px",fontWeight:700,color:"#10b981",
                    boxShadow:"0 1px 4px rgba(16,185,129,0.1)",
                  }}>VS</div>
                  <div style={{textAlign:"center",flex:1}}>
                    <div style={{fontFamily:"'Playfair Display',serif",fontSize:"28px",fontWeight:700,color:"#10b981",lineHeight:1}}>{p2Score}</div>
                    <div style={{fontSize:"11px",color:"#6b7280",marginTop:"2px",fontWeight:600}}>{p2Name}</div>
                  </div>
                </div>
                <div style={{textAlign:"center",marginTop:"8px",fontSize:"11px",color:"#6b7280"}}>
                  {p1Score===p2Score?"🤝 All tied up!"
                  :p1Score>p2Score?`🏆 ${p1Name} is leading`
                  :`🏆 ${p2Name} is leading`}
                </div>
              </div>

              <div style={{display:"flex",justifyContent:"flex-end"}}>
                <button onClick={e=>{e.stopPropagation();setTab("games");}} style={{
                  padding:"6px 14px",borderRadius:"10px",border:"none",cursor:"pointer",
                  background:"linear-gradient(135deg,#10b981,#34d399)",color:"white",
                  fontSize:"11px",fontWeight:700,boxShadow:"0 2px 8px rgba(16,185,129,0.3)",
                }}>Play <span className="d-arrow">→</span></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}