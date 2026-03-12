// client/src/pages/LoginPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GoogleSignInButton from "../components/GoogleSignInButton";

const features = [
  {
    emoji:"📅",
    title:"A–Z Date Ideas",
    desc:"26 curated dates to check off together",
    modalTitle:"Your A–Z Date Bucket List",
    modalDesc:"Every letter of the alphabet is a new adventure. From Art Gallery dates to Zoo trips, you and your partner work through 26 handpicked date ideas together. Mark them done, upload a photo from the day, and watch your shared story grow one letter at a time.",
    highlights:["26 unique date ideas, A to Z","Upload photos from each date","Track which ones you've completed","See your progress as a couple"],
    color:"#f43f5e",
    bg:"linear-gradient(135deg,#fff1f2,#fce7f3)",
  },
  {
    emoji:"🌟",
    title:"Shared Bucket List",
    desc:"Dream, plan & achieve goals as a couple",
    modalTitle:"Your Couple Bucket List",
    modalDesc:"Big dreams are better when shared. Add travel goals, milestones, experiences, and adventures you want to have together. Set priorities, add notes, and tick them off as you go — your shared wish list, always in sync.",
    highlights:["Add dreams by category: Travel, Food, Adventure…","Set High / Medium / Low priority","Add private notes to each item","Celebrate together when it's done ✅"],
    color:"#f97316",
    bg:"linear-gradient(135deg,#fff7ed,#fef3c7)",
  },
  {
    emoji:"📸",
    title:"Memory Timeline",
    desc:"Photos, moods & love notes forever",
    modalTitle:"Your Memory Timeline",
    modalDesc:"Life's best moments deserve to be remembered. Capture memories with photos, a mood emoji, a date, and a love note. Your timeline grows into a beautiful scrapbook of everything you've shared — always private, always yours.",
    highlights:["Add photos, moods & tags to each memory","Timeline sorted by date automatically","Filter by mood or occasion","A private scrapbook just for two 💕"],
    color:"#ec4899",
    bg:"linear-gradient(135deg,#fdf2f8,#fce7f3)",
  },
  {
    emoji:"🎮",
    title:"Couple Games",
    desc:"Truth, Dare & Quiz nights",
    modalTitle:"Couple Games Night",
    modalDesc:"Rediscover each other with fun games made for couples. Spin the wheel to get a random challenge, pick Truth to answer deep questions, take a Dare for laughs, or test how well you know each other with the Couple Quiz. Points tracked, turns taken — game on!",
    highlights:["Spin the wheel for a surprise","Truth: deep & fun questions","Dare: silly & sweet challenges","Quiz: how well do you know each other?","Score points & switch turns"],
    color:"#8b5cf6",
    bg:"linear-gradient(135deg,#f5f3ff,#ede9fe)",
  },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [visible,      setVisible]      = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);

  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  // close on Escape
  useEffect(() => {
    const handler = e => { if (e.key === "Escape") setActiveFeature(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const f = activeFeature;

  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(135deg,#fff1f2 0%,#fce7f3 45%,#fff7ed 100%)",
      fontFamily:"'Lato',sans-serif",
      position:"relative",
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:"16px",
      overflowX:"hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400;700&display=swap');
        .df{font-family:'Playfair Display',serif;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideUp{from{opacity:0;transform:translateY(40px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes pulse-soft{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
        @keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
        .fade-up{animation:fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both;}
        .logo-pulse{animation:pulse-soft 3.5s ease-in-out infinite;}
        .shimmer-text{
          background:linear-gradient(90deg,#f43f5e,#ec4899,#f97316,#ec4899,#f43f5e);
          background-size:200% auto;-webkit-background-clip:text;
          -webkit-text-fill-color:transparent;background-clip:text;
          animation:shimmer 4s linear infinite;
        }
        .feature-row{
          display:flex;align-items:center;gap:12px;
          padding:10px 13px;
          background:rgba(255,255,255,0.6);
          border:1px solid rgba(253,164,175,0.2);
          border-radius:13px;backdrop-filter:blur(8px);
          cursor:pointer;
          transition:transform 0.18s, box-shadow 0.18s, border-color 0.18s;
          user-select:none;
        }
        .feature-row:hover{
          transform:translateX(4px);
          box-shadow:0 4px 16px rgba(244,63,94,0.12);
          border-color:rgba(253,164,175,0.45);
        }
        .feature-row:active{ transform:scale(0.98); }
        .modal-overlay{
          position:fixed;inset:0;
          background:rgba(0,0,0,0.45);
          backdrop-filter:blur(4px);
          z-index:200;
          display:flex;align-items:flex-end;justify-content:center;
          padding:0;
          animation:fadeIn 0.2s ease;
        }
        @media(min-width:500px){
          .modal-overlay{ align-items:center; padding:24px; }
          .modal-sheet{ border-radius:24px !important; max-width:400px; }
        }
        .modal-sheet{
          width:100%;
          background:white;
          border-radius:24px 24px 0 0;
          padding:28px 24px 36px;
          animation:slideUp 0.32s cubic-bezier(0.34,1.56,0.64,1);
          position:relative;
          max-height:90vh;
          overflow-y:auto;
        }
        .pill{
          display:inline-flex;align-items:center;gap:6px;
          padding:6px 12px;border-radius:20px;
          font-size:12px;font-weight:600;
          margin:4px 4px 0 0;
        }
        .close-btn{
          position:absolute;top:16px;right:16px;
          width:30px;height:30px;border-radius:50%;
          background:#f3f4f6;border:none;cursor:pointer;
          display:flex;align-items:center;justify-content:center;
          font-size:14px;color:#6b7280;
          transition:background 0.15s;
        }
        .close-btn:hover{ background:#e5e7eb; }
      `}</style>


      {/* ── Main card ── */}
      <div style={{
        position:"relative", zIndex:1,
        width:"100%", maxWidth:"420px",
        background:"rgba(255,255,255,0.9)",
        backdropFilter:"blur(20px)",
        borderRadius:"28px",
        border:"1px solid rgba(253,164,175,0.25)",
        boxShadow:"0 20px 60px rgba(244,63,94,0.1),0 4px 16px rgba(0,0,0,0.05)",
        padding:"28px 24px",
        opacity: visible?1:0,
        transform: visible?"translateY(0)":"translateY(20px)",
        transition:"opacity 0.6s cubic-bezier(0.22,1,0.36,1),transform 0.6s cubic-bezier(0.22,1,0.36,1)",
      }}>

        {/* Logo */}
        <div className="logo-pulse fade-up" style={{textAlign:"center",marginBottom:"16px"}}>
          <div style={{fontSize:"42px",lineHeight:1,marginBottom:"5px"}}>💑</div>
          <h1 className="df shimmer-text" style={{fontSize:"32px",fontWeight:700,margin:0}}>HeartOZ</h1>
          <p className="df" style={{color:"#fb7185",fontSize:"12px",margin:"3px 0 0",fontStyle:"italic",letterSpacing:"1.2px"}}>
            your couple's private world
          </p>
        </div>

        {/* Sign in */}
        <div className="fade-up" style={{animationDelay:"120ms"}}>
          <GoogleSignInButton/>
        </div>
        <p style={{textAlign:"center",fontSize:"11px",color:"#d1d5db",margin:"8px 0 16px"}}>
          🔒 Private · Secure · <span style={{color:"#fda4af"}}>Just the two of you</span>
        </p>

        {/* Divider */}
        <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"12px"}}>
          <div style={{flex:1,height:"1px",background:"linear-gradient(90deg,transparent,#fda4af44,transparent)"}}/>
          <span style={{fontSize:"10px",color:"#fda4af",fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",whiteSpace:"nowrap"}}>Tap to explore</span>
          <div style={{flex:1,height:"1px",background:"linear-gradient(90deg,transparent,#fda4af44,transparent)"}}/>
        </div>

        {/* Feature rows */}
        <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
          {features.map((feat,i)=>(
            <div
              key={feat.title}
              className="feature-row fade-up"
              style={{animationDelay:`${i*70+280}ms`}}
              onClick={()=>setActiveFeature(feat)}
            >
              <div style={{
                fontSize:"19px",flexShrink:0,
                width:"36px",height:"36px",
                background:feat.bg,
                borderRadius:"10px",display:"flex",alignItems:"center",justifyContent:"center",
                border:"1px solid rgba(253,164,175,0.18)",
              }}>{feat.emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:"12px",color:"#1f2937"}}>{feat.title}</div>
                <div style={{fontSize:"11px",color:"#9ca3af",marginTop:"1px"}}>{feat.desc}</div>
              </div>
              <div style={{fontSize:"13px",color:"#fda4af",flexShrink:0}}>›</div>
            </div>
          ))}
        </div>

        <p style={{textAlign:"center",fontSize:"11px",color:"#fda4af",marginTop:"14px"}}>
          Made with 💗 for couples everywhere
        </p>
        <p style={{textAlign:"center",marginTop:"8px"}}>
          <button onClick={() => navigate("/about")} style={{background:"none",border:"none",cursor:"pointer",fontSize:"11px",color:"#d1d5db",textDecoration:"underline",fontFamily:"'Lato',sans-serif"}}>
            What is HeartOZ? Learn more →
          </button>
        </p>
      </div>

      {/* ── Feature modal ── */}
      {f && (
        <div className="modal-overlay" onClick={()=>setActiveFeature(null)}>
          <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
            <button className="close-btn" onClick={()=>setActiveFeature(null)}>✕</button>

            {/* Header */}
            <div style={{
              width:"56px",height:"56px",borderRadius:"16px",
              background:f.bg,display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:"28px",marginBottom:"14px",
              boxShadow:`0 4px 16px ${f.color}22`,
            }}>{f.emoji}</div>

            <h2 className="df" style={{fontSize:"22px",fontWeight:700,color:"#1f2937",margin:"0 0 8px"}}>
              {f.modalTitle}
            </h2>
            <p style={{fontSize:"13px",color:"#6b7280",lineHeight:"1.65",margin:"0 0 16px"}}>
              {f.modalDesc}
            </p>

            {/* Highlights */}
            <div style={{display:"flex",flexWrap:"wrap",marginBottom:"20px"}}>
              {f.highlights.map(h=>(
                <span key={h} className="pill" style={{background:`${f.color}12`,color:f.color,border:`1px solid ${f.color}22`}}>
                  ✓ {h}
                </span>
              ))}
            </div>

            {/* CTA inside modal */}
            <GoogleSignInButton label="Get started — it's free"/>
            <p style={{textAlign:"center",fontSize:"11px",color:"#d1d5db",marginTop:"8px"}}>
              Sign in with Google · No password needed
            </p>
          </div>
        </div>
      )}
    </div>
  );
}