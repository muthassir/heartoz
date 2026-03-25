// client/src/pages/Privacy.jsx
import { useNavigate } from "react-router-dom";

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg,#fff1f2 0%,#fce7f3 50%,#fff7ed 100%)",
      padding: "20px",
      fontFamily: "'Lato',sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Lato:wght@300;400;700&display=swap');
        .df { font-family: 'Playfair Display', serif; }
      `}</style>

      <div style={{
        maxWidth: "720px",
        margin: "0 auto",
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(16px)",
        borderRadius: "24px",
        padding: "26px 22px",
        border: "1px solid rgba(253,164,175,0.25)",
        boxShadow: "0 20px 60px rgba(244,63,94,0.08), 0 4px 16px rgba(0,0,0,0.04)"
      }}>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            marginBottom: "18px",
            border: "none",
            background: "#fff1f2",
            padding: "6px 14px",
            borderRadius: "999px",
            cursor: "pointer",
            fontSize: "12px",
            color: "#f43f5e",
            fontWeight: 600
          }}
        >
          ← Back
        </button>

        {/* Title */}
        <h1 className="df" style={{
          color: "#f43f5e",
          fontSize: "28px",
          marginBottom: "6px"
        }}>
          Privacy Policy
        </h1>

        <p style={{
          fontSize: "12px",
          color: "#9ca3af",
          marginBottom: "18px"
        }}>
          Last updated: March 2026
        </p>

        {/* Sections */}
        <div style={{display:"flex", flexDirection:"column", gap:"16px", lineHeight:"1.65"}}>

          <section>
            <h3 style={{fontSize:"15px", fontWeight:700, color:"#1f2937"}}>1. Information We Collect</h3>
            <p style={{fontSize:"13px", color:"#4b5563"}}>
              We collect your name, email, and profile photo via Google Sign-In,
              along with content you create like memories, bucket list items,
              and date entries.
            </p>
          </section>

          <section>
            <h3 style={{fontSize:"15px", fontWeight:700, color:"#1f2937"}}>2. How We Use Your Data</h3>
            <p style={{fontSize:"13px", color:"#4b5563"}}>
              Your data is used only to operate and improve HeartOZ and sync
              between you and your partner.
            </p>
          </section>

          <section>
            <h3 style={{fontSize:"15px", fontWeight:700, color:"#1f2937"}}>3. Data Sharing</h3>
            <p style={{fontSize:"13px", color:"#4b5563"}}>
              We do <b>not</b> sell or share your data. Everything stays private
              between you and your partner.
            </p>
          </section>

          <section>
            <h3 style={{fontSize:"15px", fontWeight:700, color:"#1f2937"}}>4. Security</h3>
            <p style={{fontSize:"13px", color:"#4b5563"}}>
              Your data is stored securely and transmitted over encrypted
              connections.
            </p>
          </section>

          <section>
            <h3 style={{fontSize:"15px", fontWeight:700, color:"#1f2937"}}>5. Your Rights</h3>
            <p style={{fontSize:"13px", color:"#4b5563"}}>
              You can request deletion of your data at any time by contacting us.
            </p>
          </section>

          <section>
            <h3 style={{fontSize:"15px", fontWeight:700, color:"#1f2937"}}>6. Contact</h3>
            <p style={{fontSize:"13px", color:"#4b5563"}}>
              Email: <span style={{color:"#f43f5e"}}>muthaseir@gmail.com</span>
            </p>
          </section>

        </div>

        {/* Footer */}
        <p style={{
          marginTop: "22px",
          fontSize: "12px",
          color: "#9ca3af",
          textAlign: "center"
        }}>
          ❤️ Built to be a safe, private space for couples.
        </p>

      </div>
    </div>
  );
}