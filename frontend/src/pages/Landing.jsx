import { useNavigate } from "react-router-dom";
import logo from "../assets/logo2.png";
import dates from "../assets/datees.png";
import bucketlist from "../assets/bl.png";
import timeline from "../assets/mt.png";
import game from "../assets/gane.png";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg,#fff1f2 0%,#fce7f3 45%,#fff7ed 100%)",
      fontFamily: "'Lato',sans-serif",
      padding: "20px"
    }}>

      {/* NAV */}
      <div style={{
        maxWidth: "1100px",
        margin: "0 auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "40px"
      }}>
        <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
          <img src={logo} style={{height:"40px"}} />
          <span style={{fontWeight:700,fontSize:"18px",color:"#f43f5e"}}>HeartOZ</span>
        </div>

        <button onClick={() => navigate("/login")} style={{
          background:"#f43f5e",
          color:"white",
          border:"none",
          padding:"10px 18px",
          borderRadius:"12px",
          cursor:"pointer",
          fontWeight:600
        }}>
          Login
        </button>
      </div>

      {/* HERO */}
      <div style={{
        maxWidth:"900px",
        margin:"0 auto",
        textAlign:"center",
        marginBottom:"60px"
      }}>
        <h1 style={{
          fontSize:"42px",
          fontWeight:800,
          color:"#1f2937",
          marginBottom:"16px"
        }}>
          Your private world as a couple 💕
        </h1>

        <p style={{
          fontSize:"16px",
          color:"#6b7280",
          maxWidth:"600px",
          margin:"0 auto 24px"
        }}>
          Save memories, plan dreams, play games, and grow together — all in one beautiful space made just for two.
        </p>

        <button onClick={() => navigate("/login")} style={{
          background:"linear-gradient(90deg,#f43f5e,#ec4899)",
          color:"white",
          border:"none",
          padding:"14px 26px",
          borderRadius:"16px",
          fontSize:"16px",
          fontWeight:700,
          cursor:"pointer",
          boxShadow:"0 8px 24px rgba(244,63,94,0.3)"
        }}>
          Get Started — It’s Free
        </button>
      </div>

      {/* FEATURES */}
      <div style={{
        maxWidth:"1000px",
        margin:"0 auto",
        display:"grid",
        gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",
        gap:"20px"
      }}>
        {[
          {img:dates, title:"A–Z Dates", desc:"26 fun date ideas to complete together"},
          {img:bucketlist, title:"Bucket List", desc:"Dream & achieve goals as a couple"},
          {img:timeline, title:"Memories", desc:"Save your moments forever"},
          {img:game, title:"Couple Games", desc:"Fun games to bond deeper"}
        ].map((f, i) => (
          <div key={i} style={{
            background:"white",
            padding:"20px",
            borderRadius:"18px",
            textAlign:"center",
            boxShadow:"0 10px 25px rgba(0,0,0,0.06)"
          }}>
            <img src={f.img} style={{height:"60px",marginBottom:"10px"}} />
            <h3 style={{fontSize:"16px",marginBottom:"6px"}}>{f.title}</h3>
            <p style={{fontSize:"13px",color:"#6b7280"}}>{f.desc}</p>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div style={{
        marginTop:"60px",
        textAlign:"center",
        fontSize:"12px",
        color:"#9ca3af"
      }}>
        <p>🔒 Private · Secure · Just the two of you</p>

        <div style={{marginTop:"8px"}}>
          <button onClick={() => navigate("/privacy")} style={linkStyle}>Privacy</button>
          {" · "}
          <button onClick={() => navigate("/terms")} style={linkStyle}>Terms</button>
        </div>

        <p style={{marginTop:"10px"}}>Made with 💗 for couples</p>
      </div>
    </div>
  );
}

const linkStyle = {
  background:"none",
  border:"none",
  color:"#f43f5e",
  cursor:"pointer",
  textDecoration:"underline",
  fontSize:"12px"
};