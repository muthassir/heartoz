// client/src/pages/Terms.jsx
import { useNavigate } from "react-router-dom";

export default function Terms() {
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
          Terms of Service
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
            <h3 style={{fontSize:"15px", fontWeight:700, color:"#1f2937"}}>1. Use of Service</h3>
            <p style={{fontSize:"13px", color:"#4b5563"}}>
              HeartOZ is intended for personal use by couples to track memories,
              plan dates, and share experiences.
            </p>
          </section>

          <section>
            <h3 style={{fontSize:"15px", fontWeight:700, color:"#1f2937"}}>2. Account Responsibility</h3>
            <p style={{fontSize:"13px", color:"#4b5563"}}>
              You are responsible for maintaining the security of your account
              and all activities under it.
            </p>
          </section>

          <section>
            <h3 style={{fontSize:"15px", fontWeight:700, color:"#1f2937"}}>3. Content Ownership</h3>
            <p style={{fontSize:"13px", color:"#4b5563"}}>
              You retain ownership of your content. We store it only to provide
              and improve the service.
            </p>
          </section>

          <section>
            <h3 style={{fontSize:"15px", fontWeight:700, color:"#1f2937"}}>4. Prohibited Use</h3>
            <p style={{fontSize:"13px", color:"#4b5563"}}>
              You agree not to use the app for illegal, abusive, or harmful
              activities.
            </p>
          </section>

          <section>
            <h3 style={{fontSize:"15px", fontWeight:700, color:"#1f2937"}}>5. Availability</h3>
            <p style={{fontSize:"13px", color:"#4b5563"}}>
              We strive to keep the service running smoothly but do not guarantee
              uninterrupted availability.
            </p>
          </section>

          <section>
            <h3 style={{fontSize:"15px", fontWeight:700, color:"#1f2937"}}>6. Liability</h3>
            <p style={{fontSize:"13px", color:"#4b5563"}}>
              The service is provided “as is” without warranties of any kind.
            </p>
          </section>

          <section>
            <h3 style={{fontSize:"15px", fontWeight:700, color:"#1f2937"}}>7. Contact</h3>
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
          ❤️ Built with love for couples.
        </p>

      </div>
    </div>
  );
}