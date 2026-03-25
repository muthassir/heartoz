// client/src/pages/AboutPage.jsx
import { useState, useEffect, useRef } from "react";
import RainingHearts from "../components/Raininghearts";
import GoogleSignInButton from "../components/GoogleSignInButton";
import logo from "../assets/logo1.jpg"

const problems = [
  {
    number: "01",
    icon: "🧊",
    title: "Date Night Paralysis",
    pain: "\"What do you want to do?\" \"I don't know, what do you want to do?\"",
    solve: "26 A–Z date ideas ready to go — from Aquarium adventures to Zoo days. Pick a letter, make it happen.",
    color: "#f43f5e",
    light: "#fff1f2",
  },
  {
    number: "02",
    icon: "💭",
    title: "Dreams That Stay Dreams",
    pain: "\"We should visit Japan someday.\" Someday never comes.",
    solve: "A shared bucket list keeps your dreams alive, organised by priority, and ticked off together.",
    color: "#f97316",
    light: "#fff7ed",
  },
  {
    number: "03",
    icon: "🌫️",
    title: "Memories That Fade",
    pain: "That perfect rooftop dinner — you can't even remember the name of the place anymore.",
    solve: "A private memory timeline with photos, moods & love notes. Your story, preserved forever.",
    color: "#ec4899",
    light: "#fdf2f8",
  },
  {
    number: "04",
    icon: "😐",
    title: "You Stopped Playing Together",
    pain: "Remember when you used to laugh until 2am discovering each other? That energy fades.",
    solve: "Truth, Dare & Quiz nights bring back the early-relationship magic of laughing and learning.",
    color: "#8b5cf6",
    light: "#f5f3ff",
  },
  {
    number: "05",
    icon: "🗂️",
    title: "Everything Is Scattered",
    pain: "Instagram for photos. Notes for ideas. Maps for places. Nothing talks to each other.",
    solve: "One private space for everything couple-related. Built only for the two of you.",
    color: "#0ea5e9",
    light: "#f0f9ff",
  },
];

const features = [
  { emoji:"📅", label:"A–Z Dates",     desc:"26 curated ideas" },
  { emoji:"🌟", label:"Bucket List",   desc:"Shared dreams tracker" },
  { emoji:"📸", label:"Memories",      desc:"Private scrapbook" },
  { emoji:"🎮", label:"Couple Games",  desc:"Truth, Dare & Quiz" },
];

// ── Animated counter ─────────────────────────────────────────────────────────
function Counter({ to, suffix="" }) {
  const [val, setVal] = useState(0);
  const ref = useRef();
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const step = Math.ceil(to / 40);
        const t = setInterval(() => {
          start += step;
          if (start >= to) { setVal(to); clearInterval(t); }
          else setVal(start);
        }, 30);
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{val}{suffix}</span>;
}

// ── Problem card ─────────────────────────────────────────────────────────────
function ProblemCard({ item, index }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.6s ease ${index * 100}ms, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${index * 100}ms`,
        background: "white",
        borderRadius: "20px",
        border: `1px solid ${item.color}22`,
        overflow: "hidden",
        boxShadow: `0 4px 24px ${item.color}0d`,
      }}
    >
      {/* Top accent bar */}
      <div style={{height:"3px", background:`linear-gradient(90deg, ${item.color}, ${item.color}44)`}}/>

      <div style={{padding:"20px"}}>
        {/* Number + icon */}
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"14px"}}>
          <span style={{
            fontFamily:"'Playfair Display',serif",
            fontSize:"13px", fontWeight:700,
            color:`${item.color}88`, letterSpacing:"2px",
          }}>{item.number}</span>
          <div style={{
            width:"44px", height:"44px", borderRadius:"14px",
            background: item.light,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:"22px",
            border:`1px solid ${item.color}22`,
          }}>{item.icon}</div>
        </div>

        {/* Title */}
        <h3 style={{
          fontFamily:"'Playfair Display',serif",
          fontSize:"18px", fontWeight:700,
          color:"#1f2937", margin:"0 0 10px",
        }}>{item.title}</h3>

        {/* Pain */}
        <div style={{
          background: "#f9fafb",
          borderLeft: `3px solid ${item.color}55`,
          borderRadius:"0 10px 10px 0",
          padding:"10px 12px",
          marginBottom:"12px",
        }}>
          <p style={{fontSize:"12px", color:"#6b7280", fontStyle:"italic", margin:0, lineHeight:"1.6"}}>
            {item.pain}
          </p>
        </div>

        {/* Solution */}
        <div style={{display:"flex", gap:"8px", alignItems:"flex-start"}}>
          <div style={{
            flexShrink:0, width:"20px", height:"20px",
            borderRadius:"50%",
            background:`linear-gradient(135deg, ${item.color}, ${item.color}aa)`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:"10px", color:"white", fontWeight:700, marginTop:"1px",
          }}>✓</div>
          <p style={{fontSize:"13px", color:"#374151", lineHeight:"1.65", margin:0}}>{item.solve}</p>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function About({ onBack }) {
  const [heroVisible, setHeroVisible] = useState(false);
  useEffect(() => { setTimeout(() => setHeroVisible(true), 80); }, []);

  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(160deg,#fff1f2 0%,#fdf2f8 35%,#fff7ed 70%,#f0fdf4 100%)",
      fontFamily:"'Lato',sans-serif",
      position:"relative",
      overflowX:"hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Lato:wght@300;400;700&display=swap');
        .df{font-family:'Playfair Display',serif;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes pulse-ring{0%{transform:scale(1);opacity:0.4}100%{transform:scale(1.6);opacity:0}}
        .fade-up{animation:fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) both;}
        .float-anim{animation:float 4s ease-in-out infinite;}
        .shimmer-title{
          background:linear-gradient(90deg,#f43f5e,#ec4899,#f97316,#ec4899,#f43f5e);
          background-size:200% auto;
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
          animation:shimmer 5s linear infinite;
        }
        .stat-card{
          background:rgba(255,255,255,0.85);
          backdrop-filter:blur(12px);
          border-radius:16px;
          border:1px solid rgba(253,164,175,0.2);
          padding:16px 12px;
          text-align:center;
          box-shadow:0 4px 16px rgba(244,63,94,0.07);
        }
        .feature-pill{
          display:flex;align-items:center;gap:10px;
          padding:12px 16px;
          background:rgba(255,255,255,0.75);
          border:1px solid rgba(253,164,175,0.2);
          border-radius:14px;
          backdrop-filter:blur(8px);
          transition:transform 0.2s, box-shadow 0.2s;
        }
        .feature-pill:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(244,63,94,0.1);}
        .back-btn{
          display:inline-flex;align-items:center;gap:6px;
          padding:8px 14px;border-radius:20px;
          background:rgba(255,255,255,0.7);
          border:1px solid rgba(253,164,175,0.3);
          color:#fb7185;font-size:13px;font-weight:600;
          cursor:pointer;backdrop-filter:blur(8px);
          transition:all 0.2s;
          font-family:'Lato',sans-serif;
        }
        .back-btn:hover{background:white;box-shadow:0 4px 12px rgba(244,63,94,0.15);}
      `}</style>

      <RainingHearts/>

      <div style={{maxWidth:"480px", margin:"0 auto", padding:"20px 16px 48px", position:"relative", zIndex:1}}>

        {/* Back button */}
        {onBack && (
          <div style={{marginBottom:"16px"}}>
            <button className="back-btn" onClick={onBack}>← Back</button>
          </div>
        )}

        {/* ── Hero ── */}
        <div
          className="fade-up"
          style={{
            textAlign:"center", marginBottom:"32px",
            opacity: heroVisible ? 1 : 0,
            transition:"opacity 0.7s ease",
          }}
        >
          <div className="float-anim" style={{fontSize:"clamp(48px,12vw,64px)", marginBottom:"10px"}}>
            <img src={logo} alt="heartoz_logo" className="rounded-[40%]" />
          </div>
          <h1 className="df shimmer-title" style={{fontSize:"clamp(32px,8vw,44px)", fontWeight:700, margin:"0 0 8px"}}>HeartOZ</h1>
          <p className="df" style={{color:"#fb7185", fontSize:"14px", fontStyle:"italic", letterSpacing:"1px", margin:"0 0 16px"}}>
            your couple's private world
          </p>
          <p style={{fontSize:"15px", color:"#4b5563", lineHeight:"1.7", maxWidth:"360px", margin:"0 auto"}}>
            A joy app for couples who are <strong>intentional</strong> about their relationship — built to celebrate love, not fix problems.
          </p>
        </div>

        {/* ── Stats ── */}
        <div className="fade-up" style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"10px", marginBottom:"32px", animationDelay:"150ms"}}>
          {[
            {value:26,  suffix:"",   label:"Date Ideas"},
            {value:60,  suffix:"+",  label:"Bucket Ideas"},
            {value:100, suffix:"%",  label:"Private"},
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="df shimmer-title" style={{fontSize:"24px", fontWeight:700}}>
                <Counter to={s.value} suffix={s.suffix}/>
              </div>
              <div style={{fontSize:"11px", color:"#9ca3af", marginTop:"2px", fontWeight:600}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── What HeartOZ solves ── */}
        <div className="fade-up" style={{marginBottom:"28px", animationDelay:"200ms"}}>
          <div style={{display:"flex", alignItems:"center", gap:"10px", marginBottom:"18px"}}>
            <div style={{flex:1, height:"1px", background:"linear-gradient(90deg,transparent,#fda4af55)"}}/>
            <span style={{
              fontFamily:"'Playfair Display',serif",
              fontSize:"11px", color:"#fda4af", fontWeight:700,
              letterSpacing:"2px", textTransform:"uppercase", whiteSpace:"nowrap",
            }}>What we solve</span>
            <div style={{flex:1, height:"1px", background:"linear-gradient(90deg,#fda4af55,transparent)"}}/>
          </div>

          <div style={{display:"flex", flexDirection:"column", gap:"14px"}}>
            {problems.map((item, i) => (
              <ProblemCard key={item.number} item={item} index={i}/>
            ))}
          </div>
        </div>

        {/* ── Features ── */}
        <div className="fade-up" style={{marginBottom:"32px", animationDelay:"250ms"}}>
          <div style={{display:"flex", alignItems:"center", gap:"10px", marginBottom:"16px"}}>
            <div style={{flex:1, height:"1px", background:"linear-gradient(90deg,transparent,#fda4af55)"}}/>
            <span style={{fontFamily:"'Playfair Display',serif", fontSize:"11px", color:"#fda4af", fontWeight:700, letterSpacing:"2px", textTransform:"uppercase", whiteSpace:"nowrap"}}>Inside HeartOZ</span>
            <div style={{flex:1, height:"1px", background:"linear-gradient(90deg,#fda4af55,transparent)"}}/>
          </div>
          <div style={{display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"10px"}}>
            {features.map(f => (
              <div key={f.label} className="feature-pill">
                <div style={{
                  width:"38px", height:"38px", borderRadius:"12px", flexShrink:0,
                  background:"linear-gradient(135deg,#fff1f2,#fce7f3)",
                  border:"1px solid rgba(253,164,175,0.2)",
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px",
                }}>{f.emoji}</div>
                <div>
                  <div style={{fontWeight:700, fontSize:"12px", color:"#1f2937"}}>{f.label}</div>
                  <div style={{fontSize:"11px", color:"#9ca3af"}}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Emotional tagline ── */}
        <div className="fade-up" style={{
          textAlign:"center", marginBottom:"28px",
          padding:"24px 20px",
          background:"rgba(255,255,255,0.7)",
          borderRadius:"20px",
          border:"1px solid rgba(253,164,175,0.2)",
          backdropFilter:"blur(12px)",
          animationDelay:"300ms",
        }}>
          <div style={{position:"relative", display:"inline-block", marginBottom:"10px"}}>
            <div style={{
              position:"absolute", inset:0, borderRadius:"50%",
              background:"rgba(244,63,94,0.2)",
              animation:"pulse-ring 2s ease-out infinite",
            }}/>
            <span style={{fontSize:"32px", position:"relative"}}>💗</span>
          </div>
          <p className="df" style={{
            fontSize:"clamp(16px,4vw,20px)", fontStyle:"italic",
            color:"#1f2937", lineHeight:"1.6", margin:"0 0 6px",
          }}>
            "Most relationship apps fix problems.<br/>HeartOZ celebrates love."
          </p>
          <p style={{fontSize:"12px", color:"#9ca3af", margin:0}}>
            No ads · No strangers · Just the two of you
          </p>
        </div>

        {/* ── CTA ── */}
        <div className="fade-up" style={{animationDelay:"350ms"}}>
          <GoogleSignInButton label="Start your journey together"/>
          <p style={{textAlign:"center", fontSize:"11px", color:"#d1d5db", marginTop:"10px"}}>
            🔒 Free · Private · No password needed
          </p>
        </div>

      </div>
    </div>
  );
}