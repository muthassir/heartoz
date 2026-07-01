// // client/src/components/BottomNav.jsx
// import { FaHome, FaHeartbeat, FaGamepad, FaList, FaBars } from "react-icons/fa";

// const ITEMS = [
//   { id: "dashboard", label: "Home",  icon: <FaHome /> },
//   { id: "dates",     label: "Dates", icon: <FaHeartbeat /> },
//   { id: "games",     label: "Games", icon: <FaGamepad /> },
//   { id: "bucket",    label: "Bucket",icon: <FaList /> },
// ];

// export default function BottomNav({ tab, setTab, onMore, accent = "#f43f5e" }) {
//   const isMore = !ITEMS.some(i => i.id === tab);

//   return (
//     <nav
//       style={{
//         position: "fixed",
//         left: 0, right: 0, bottom: 0,
//         zIndex: 40,
//         background: "rgba(255,255,255,0.96)",
//         backdropFilter: "blur(14px)",
//         borderTop: "1px solid #fce7f3",
//         boxShadow: "0 -6px 24px rgba(0,0,0,0.06)",
//         paddingBottom: "env(safe-area-inset-bottom, 0px)",
//       }}
//     >
//       <div style={{ display: "flex", alignItems: "stretch", maxWidth: "560px", margin: "0 auto" }}>
//         {ITEMS.map((item) => {
//           const active = tab === item.id;
//           return (
//             <button
//               key={item.id}
//               onClick={() => setTab(item.id)}
//               style={{
//                 flex: 1,
//                 display: "flex",
//                 flexDirection: "column",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 gap: "3px",
//                 padding: "8px 4px 7px",
//                 border: "none",
//                 background: "transparent",
//                 cursor: "pointer",
//               }}
//             >
//               <span style={{
//                 fontSize: "17px",
//                 color: active ? accent : "#9ca3af",
//                 transition: "color 0.15s, transform 0.15s",
//                 transform: active ? "translateY(-1px) scale(1.08)" : "none",
//               }}>
//                 {item.icon}
//               </span>
//               <span style={{
//                 fontSize: "9.5px",
//                 fontWeight: active ? 700 : 500,
//                 color: active ? accent : "#9ca3af",
//               }}>
//                 {item.label}
//               </span>
//               {active && (
//                 <span style={{
//                   position: "absolute", marginTop: "26px",
//                   width: "4px", height: "4px", borderRadius: "50%",
//                   background: accent,
//                 }} />
//               )}
//             </button>
//           );
//         })}

//         {/* More — opens the drawer for Memories / Ideas / Settings */}
//         <button
//           onClick={onMore}
//           style={{
//             flex: 1,
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//             justifyContent: "center",
//             gap: "3px",
//             padding: "8px 4px 7px",
//             border: "none",
//             background: "transparent",
//             cursor: "pointer",
//           }}
//         >
//           <span style={{ fontSize: "17px", color: isMore ? accent : "#9ca3af" }}>
//             <FaBars />
//           </span>
//           <span style={{ fontSize: "9.5px", fontWeight: isMore ? 700 : 500, color: isMore ? accent : "#9ca3af" }}>
//             More
//           </span>
//         </button>
//       </div>
//     </nav>
//   );
// }










// frontend/src/components/BottomNav.jsx
import { FaHome, FaHeartbeat, FaComments, FaDice, FaBars } from "react-icons/fa";

const ITEMS = [
  { id:"dashboard",   label:"Home",   icon:<FaHome />     },
  { id:"truthordare", label:"T or D", icon:<FaComments /> },
  { id:"betgame",     label:"Bet",    icon:<FaDice />      },
  { id:"dates",       label:"Dates",  icon:<FaHeartbeat />},
];

export default function BottomNav({ tab, setTab, onMore, accent = "#f43f5e" }) {
  const isMore = !ITEMS.some(i => i.id === tab);

  const accentFor = (id) => {
    if (id === "betgame") return "#10b981";
    if (id === "truthordare") return "#f43f5e";
    if (id === "dates") return "#f43f5e";
    return accent;
  };

  return (
    <nav style={{
      position:"fixed", left:0, right:0, bottom:0, zIndex:40,
      background:"rgba(255,255,255,0.96)",
      backdropFilter:"blur(14px)",
      borderTop:"1px solid #fce7f3",
      boxShadow:"0 -6px 24px rgba(0,0,0,0.06)",
      paddingBottom:"env(safe-area-inset-bottom, 0px)",
    }}>
      <div style={{display:"flex",alignItems:"stretch",maxWidth:"560px",margin:"0 auto"}}>
        {ITEMS.map(item => {
          const active  = tab === item.id;
          const color   = accentFor(item.id);
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              style={{
                flex:1, display:"flex", flexDirection:"column",
                alignItems:"center", justifyContent:"center",
                gap:"3px", padding:"8px 4px 7px",
                border:"none", background:"transparent", cursor:"pointer",
                position:"relative",
              }}
            >
              <span style={{
                fontSize:"17px",
                color: active ? color : "#9ca3af",
                transition:"color 0.15s, transform 0.15s",
                transform: active ? "translateY(-1px) scale(1.08)" : "none",
              }}>
                {item.icon}
              </span>
              <span style={{
                fontSize:"9.5px", fontWeight: active ? 700 : 500,
                color: active ? color : "#9ca3af",
              }}>
                {item.label}
              </span>
              {active && (
                <span style={{
                  position:"absolute", bottom:"3px",
                  width:"4px", height:"4px", borderRadius:"50%",
                  background:color,
                }}/>
              )}
            </button>
          );
        })}

        {/* More drawer */}
        <button
          onClick={onMore}
          style={{
            flex:1, display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center",
            gap:"3px", padding:"8px 4px 7px",
            border:"none", background:"transparent", cursor:"pointer",
          }}
        >
          <span style={{fontSize:"17px", color: isMore ? accent : "#9ca3af"}}>
            <FaBars />
          </span>
          <span style={{fontSize:"9.5px", fontWeight: isMore ? 700 : 500, color: isMore ? accent : "#9ca3af"}}>
            More
          </span>
          {isMore && (
            <span style={{
              position:"absolute", bottom:"3px",
              width:"4px", height:"4px", borderRadius:"50%",
              background:accent,
            }}/>
          )}
        </button>
      </div>
    </nav>
  );
}