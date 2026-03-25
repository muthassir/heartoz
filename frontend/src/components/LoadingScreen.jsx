import { useEffect, useState } from "react";

export default function LoadingScreen({ message = "Loading your journal…" }) {
 const quotes = [
  "Love is a single soul in two bodies. – Aristotle",
  "Loving deeply gives you courage. – Lao Tzu",
  "Look outward together, not at each other. – Antoine de Saint-Exupéry",
  "To love is to see yourself in another. – Eckhart Tolle",
  "Where there is love, there is life. – Gandhi",
  "Love touches, and everyone becomes a poet. – Plato",
  "Love is the bridge to everything. – Rumi",
  "Love is reality, not just sentiment. – Tagore",
  "Love is nature’s canvas, embroidered by imagination. – Voltaire",
  "We accept the love we think we deserve. – Stephen Chbosky"
];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % quotes.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(135deg,#fff1f2 0%,#fce7f3 50%,#fff7ed 100%)",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:"'Lato',sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Lato:wght@400;700&display=swap');
        @keyframes heartbeat {
          0%,100%{ transform:scale(1); }
          15%    { transform:scale(1.22); }
          30%    { transform:scale(1); }
          45%    { transform:scale(1.12); }
          60%    { transform:scale(1); }
        }
        @keyframes fadeUp {
          from{ opacity:0; transform:translateY(12px); }
          to  { opacity:1; transform:translateY(0); }
        }
        @keyframes shimmer {
          0%  { background-position:200% center; }
          100%{ background-position:-200% center; }
        }
        @keyframes dotPulse {
          0%,80%,100%{ transform:scale(0.6); opacity:0.4; }
          40%        { transform:scale(1);   opacity:1;   }
        }
        .ls-heart  { animation: heartbeat 1.8s ease-in-out infinite; display:inline-block; }
        .ls-title  { animation: fadeUp 0.5s ease 0.2s both; }
        .ls-msg    { animation: fadeUp 0.5s ease 0.4s both; }
        .ls-dots   { animation: fadeUp 0.5s ease 0.6s both; }
        .ls-quote  { animation: fadeUp 0.5s ease both; }
        .ls-shimmer{
          background: linear-gradient(90deg,#f43f5e,#ec4899,#f97316,#ec4899,#f43f5e);
          background-size:200% auto;
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
          animation:shimmer 3s linear infinite;
        }
        .ls-dot{ display:inline-block; width:7px; height:7px; border-radius:50%; background:#fda4af; margin:0 3px; }
        .ls-dot:nth-child(1){ animation:dotPulse 1.2s ease-in-out 0s infinite; }
        .ls-dot:nth-child(2){ animation:dotPulse 1.2s ease-in-out 0.2s infinite; }
        .ls-dot:nth-child(3){ animation:dotPulse 1.2s ease-in-out 0.4s infinite; }
      `}</style>

      <div style={{textAlign:"center", padding:"24px"}}>
        <div style={{position:"relative", display:"inline-block", marginBottom:"20px"}}>
          <div style={{
            width:"90px", height:"90px", borderRadius:"50%",
            background:"linear-gradient(135deg,#fff1f2,#fce7f3)",
            border:"2px solid #fce7f3",
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 8px 32px rgba(244,63,94,0.15)",
            margin:"0 auto",
          }}>
            <span className="ls-heart" style={{fontSize:"38px"}}>💕</span>
          </div>
          <div style={{
            position:"absolute", top:"4px", right:"4px",
            width:"14px", height:"14px", borderRadius:"50%",
            background:"linear-gradient(135deg,#f43f5e,#ec4899)",
            boxShadow:"0 2px 6px rgba(244,63,94,0.4)",
          }}/>
        </div>

        <div className="ls-title" style={{
          fontFamily:"'Playfair Display',serif",
          fontSize:"26px", fontWeight:700,
          marginBottom:"6px",
        }}>
          <span className="ls-shimmer">HeartOZ</span>
        </div>

        <p className="ls-msg" style={{
          fontSize:"13px", color:"#9ca3af",
          marginBottom:"10px",
        }}>{message}</p>

        {/* ✅ Rotating Love Quote */}
        <p key={index} className="ls-quote" style={{
          fontSize:"14px",
          color:"#f43f5e",
          marginBottom:"18px",
          minHeight:"20px"
        }}>
          {quotes[index]}
        </p>

        <div className="ls-dots">
          <span className="ls-dot"/>
          <span className="ls-dot"/>
          <span className="ls-dot"/>
        </div>
      </div>
    </div>
  );
}