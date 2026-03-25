// client/src/components/NavDrawer.jsx
import { TABS } from "../lib/constants";
import { FaSignOutAlt, FaHome, FaHeartbeat, FaList, FaCameraRetro, FaGamepad, FaLightbulb } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";

const TAB_ICONS = {
  dashboard: <FaHome />,
  dates:     <FaHeartbeat />,
  bucket:    <FaList />,
  memories:  <FaCameraRetro />,
  games:     <FaGamepad />,
  ideas:     <FaLightbulb />,
};

const TAB_DESCRIPTIONS = {
  dashboard: "Your couple overview",
  dates:     "26 A–Z date challenges",
  bucket:    "Dreams to achieve together",
  memories:  "Your shared timeline",
  games:     "Truth, dare & quizzes",
  ideas:     "Browse date inspiration",
};

const TAB_COLORS = {
  dashboard: { grad:"linear-gradient(135deg,#f43f5e,#ec4899)", light:"#fff1f2", dot:"#f43f5e" },
  dates:     { grad:"linear-gradient(135deg,#f43f5e,#fb7185)", light:"#fff1f2", dot:"#f43f5e" },
  bucket:    { grad:"linear-gradient(135deg,#8b5cf6,#a78bfa)", light:"#f5f3ff", dot:"#8b5cf6" },
  memories:  { grad:"linear-gradient(135deg,#f97316,#fb923c)", light:"#fff7ed", dot:"#f97316" },
  games:     { grad:"linear-gradient(135deg,#10b981,#34d399)", light:"#f0fdf4", dot:"#10b981" },
  ideas:     { grad:"linear-gradient(135deg,#ec4899,#f472b6)", light:"#fdf4ff", dot:"#ec4899" },
};

export default function NavDrawer({ open, onClose, tab, setTab }) {
  const { logout } = useAuth();

  return (
    <>
      <style>{`
        @keyframes drawerIn  { from{transform:translateX(-100%)} to{transform:translateX(0)} }
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes itemIn    { from{opacity:0;transform:translateX(-14px)} to{opacity:1;transform:translateX(0)} }
        @keyframes heartbeat { 0%,100%{transform:scale(1)} 15%{transform:scale(1.18)} 30%{transform:scale(1)} 45%{transform:scale(1.1)} 60%{transform:scale(1)} }

        .nav-drawer   { animation: drawerIn 0.3s cubic-bezier(0.34,1.05,0.64,1) forwards; }
        .nav-backdrop { animation: fadeIn 0.2s ease forwards; }
        .nav-item     { animation: itemIn 0.28s ease both; transition: all 0.18s; border: none; }
        .nav-item:hover { transform: translateX(4px) !important; }
        .nav-heart    { animation: heartbeat 2.2s ease-in-out infinite; display:inline-block; }

        .nav-scroll::-webkit-scrollbar { width: 3px; }
        .nav-scroll::-webkit-scrollbar-thumb { background: #fda4af; border-radius: 4px; }
      `}</style>

      {open && (
        <>
          {/* Backdrop */}
          <div className="nav-backdrop" onClick={onClose} style={{
            position:"fixed", inset:0,
            background:"rgba(10,5,5,0.5)",
            backdropFilter:"blur(8px)",
            zIndex:100,
          }}/>

          {/* Drawer */}
          <div className="nav-drawer" style={{
            position:"fixed", top:0, left:0, bottom:0,
            width:"78vw", maxWidth:"300px",
            zIndex:101,
            display:"flex", flexDirection:"column",
            borderRadius:"0 28px 28px 0",
            overflow:"hidden",
            boxShadow:"14px 0 50px rgba(244,63,94,0.18), 2px 0 12px rgba(0,0,0,0.06)",
            background:"white",
          }}>

            {/* ── Gradient Header ── */}
            <div style={{
              padding:"32px 22px 24px",
              background:"linear-gradient(150deg,#f43f5e 0%,#ec4899 55%,#f97316 100%)",
              position:"relative", overflow:"hidden", flexShrink:0,
            }}>
              <div style={{position:"absolute",top:"-24px",right:"-24px",width:"110px",height:"110px",borderRadius:"50%",background:"rgba(255,255,255,0.1)"}}/>
              <div style={{position:"absolute",bottom:"-32px",right:"18px",width:"80px",height:"80px",borderRadius:"50%",background:"rgba(255,255,255,0.07)"}}/>
              <div style={{position:"absolute",top:"28px",right:"52px",width:"36px",height:"36px",borderRadius:"50%",background:"rgba(255,255,255,0.12)"}}/>

              <div style={{position:"relative"}}>
                <div className="nav-heart" style={{fontSize:"28px",marginBottom:"8px"}}>💕</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:"24px",fontWeight:700,color:"white",lineHeight:1.1,marginBottom:"3px"}}>
                  HeartOZ
                </div>
                <div style={{fontSize:"10px",color:"rgba(255,255,255,0.72)",letterSpacing:"2px",textTransform:"uppercase",fontWeight:600}}>
                  Couple Journal
                </div>
              </div>
            </div>

            {/* ── Section label ── */}
            <div style={{padding:"14px 20px 6px", flexShrink:0}}>
              <div style={{fontSize:"9px",color:"#d1d5db",fontWeight:700,letterSpacing:"2px",textTransform:"uppercase"}}>
                NAVIGATE
              </div>
            </div>

            {/* ── Nav items ── */}
            <div className="nav-scroll" style={{flex:1, padding:"0 10px", display:"flex", flexDirection:"column", gap:"2px", overflowY:"auto"}}>
              {TABS.map((t, idx) => {
                const active = tab === t.id;
                const colors = TAB_COLORS[t.id] || TAB_COLORS.dashboard;
                return (
                  <button
                    key={t.id}
                    className="nav-item"
                    onClick={() => { setTab(t.id); onClose(); }}
                    style={{
                      display:"flex", alignItems:"center", gap:"12px",
                      padding:"11px 12px",
                      borderRadius:"14px", cursor:"pointer",
                      textAlign:"left", width:"100%",
                      background: active ? colors.light : "transparent",
                      borderLeft: active ? `3px solid ${colors.dot}` : "3px solid transparent",
                      boxShadow: active ? `0 2px 10px ${colors.dot}22` : "none",
                      animationDelay:`${idx * 48}ms`,
                    }}
                  >
                    {/* Icon box */}
                    <div style={{
                      width:"36px", height:"36px", borderRadius:"10px", flexShrink:0,
                      background: active ? colors.grad : "#f3f4f6",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:"14px", color: active ? "white" : "#9ca3af",
                      boxShadow: active ? `0 3px 8px ${colors.dot}44` : "none",
                      transition:"all 0.2s",
                    }}>
                      {TAB_ICONS[t.id] || t.emoji}
                    </div>

                    {/* Text */}
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{fontSize:"13px",fontWeight:active?700:500,color:active?colors.dot:"#374151",lineHeight:1.25}}>
                        {t.label}
                      </div>
                      <div style={{fontSize:"10px",color:"#9ca3af",marginTop:"1px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                        {TAB_DESCRIPTIONS[t.id]}
                      </div>
                    </div>

                    {/* Active dot */}
                    {active && (
                      <div style={{width:"6px",height:"6px",borderRadius:"50%",background:colors.dot,flexShrink:0,boxShadow:`0 0 6px ${colors.dot}88`}}/>
                    )}
                  </button>
                );
              })}
            </div>

            {/* ── Footer — logout + close ── */}
            <div style={{
              padding:"12px 14px 20px",
              borderTop:"1px solid #fce7f3",
              display:"flex", flexDirection:"column", gap:"8px",
              flexShrink:0,
            }}>
              {/* Logout row */}
              <button onClick={logout} style={{
                display:"flex", alignItems:"center", gap:"10px",
                padding:"11px 14px", borderRadius:"14px", border:"none",
                cursor:"pointer", width:"100%", textAlign:"left",
                background:"#fff1f2", transition:"all 0.18s",
              }}
              onMouseEnter={e=>e.currentTarget.style.background="#fce7f3"}
              onMouseLeave={e=>e.currentTarget.style.background="#fff1f2"}
              >
                <div style={{
                  width:"32px", height:"32px", borderRadius:"10px",
                  background:"linear-gradient(135deg,#f43f5e,#ec4899)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  color:"white", fontSize:"13px",
                  boxShadow:"0 2px 8px rgba(244,63,94,0.3)",
                }}><FaSignOutAlt /></div>
                <div>
                  <div style={{fontSize:"13px",fontWeight:700,color:"#f43f5e",lineHeight:1.2}}>Sign Out</div>
                  <div style={{fontSize:"10px",color:"#9ca3af",marginTop:"1px"}}>Log out of HeartOZ</div>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}