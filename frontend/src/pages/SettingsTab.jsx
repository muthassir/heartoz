// client/src/pages/SettingsTab.jsx
import { useState } from "react";
import { THEMES } from "../lib/constants";
import { FaCheck, FaPalette, FaInfoCircle } from "react-icons/fa";

export default function SettingsTab({ theme, onChangeTheme, savingTheme, p1Name, p2Name }) {
  const [pending, setPending] = useState(null);
  const activeId = pending || theme?.id || "rose";

  const handlePick = (t) => {
    setPending(t.id);
    onChangeTheme({ id: t.id, primary: t.primary, secondary: t.secondary, tertiary: t.tertiary })
      .finally(() => setPending(null));
  };

  return (
    <div className="max-w-2xl mx-auto px-3 py-4">
      <div style={{
        background: "white", borderRadius: "20px", border: "1px solid #fce7f3",
        padding: "20px", boxShadow: "0 4px 20px rgba(244,63,94,0.08)", marginBottom: "16px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
          <div style={{
            width: "38px", height: "38px", borderRadius: "12px",
            background: `linear-gradient(135deg,${theme?.primary || "#f43f5e"},${theme?.secondary || "#ec4899"})`,
            display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "16px",
          }}><FaPalette /></div>
          <div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "17px", fontWeight: 700, color: "#1f2937" }}>
              App Theme
            </div>
            <div style={{ fontSize: "11px", color: "#9ca3af" }}>
              Pick a vibe — {p1Name} &amp; {p2Name} will both see it
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
          {THEMES.map((t) => {
            const active = activeId === t.id;
            const busy = savingTheme && pending === t.id;
            return (
              <button
                key={t.id}
                onClick={() => handlePick(t)}
                disabled={savingTheme}
                style={{
                  borderRadius: "16px",
                  border: active ? `2px solid ${t.primary}` : "1px solid #f3f4f6",
                  padding: "12px 8px",
                  background: active ? `${t.primary}0d` : "white",
                  cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
                  opacity: busy ? 0.6 : 1,
                  transition: "all 0.15s",
                }}
              >
                <div style={{ position: "relative" }}>
                  <div style={{
                    width: "34px", height: "34px", borderRadius: "50%",
                    background: `linear-gradient(135deg,${t.primary},${t.secondary})`,
                    boxShadow: `0 3px 10px ${t.primary}55`,
                  }} />
                  {active && (
                    <div style={{
                      position: "absolute", bottom: "-2px", right: "-2px",
                      width: "16px", height: "16px", borderRadius: "50%",
                      background: t.primary, color: "white",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "8px", border: "2px solid white",
                    }}><FaCheck /></div>
                  )}
                </div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: active ? t.primary : "#6b7280" }}>
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{
        background: "#fff1f2", borderRadius: "16px", border: "1px solid #fce7f3",
        padding: "14px 16px", display: "flex", gap: "10px", alignItems: "flex-start",
      }}>
        <span style={{ color: "#f43f5e", fontSize: "14px", marginTop: "1px" }}><FaInfoCircle /></span>
        <div style={{ fontSize: "11.5px", color: "#9ca3af", lineHeight: 1.6 }}>
          More personalisation — custom avatars, notification preferences, and data export — is on the way. 💕
        </div>
      </div>
    </div>
  );
}
