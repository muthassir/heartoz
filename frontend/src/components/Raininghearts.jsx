// client/src/components/RainingHearts.jsx
import { useEffect, useRef } from "react";

export default function Raininghearts() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const HEARTS = Array.from({ length: 22 }, () => ({
      x: Math.random() * window.innerWidth,
      y: -40 - Math.random() * window.innerHeight,
      size: 8 + Math.random() * 18,
      speed: 0.5 + Math.random() * 1.0,
      sway: Math.random() * 2 - 1,
      swayT: Math.random() * Math.PI * 2,
      alpha: 0.1 + Math.random() * 0.18,
      color: ["#fda4af","#f9a8d4","#fecdd3","#fbcfe8","#fca5a5"][Math.floor(Math.random()*5)],
    }));
    const drawHeart = (ctx, x, y, s) => {
      ctx.beginPath();
      ctx.moveTo(x, y+s*0.3);
      ctx.bezierCurveTo(x,y,x-s*0.5,y,x-s*0.5,y+s*0.3);
      ctx.bezierCurveTo(x-s*0.5,y+s*0.6,x,y+s*0.9,x,y+s);
      ctx.bezierCurveTo(x,y+s*0.9,x+s*0.5,y+s*0.6,x+s*0.5,y+s*0.3);
      ctx.bezierCurveTo(x+s*0.5,y,x,y,x,y+s*0.3);
      ctx.closePath();
    };
    const tick = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      HEARTS.forEach(h => {
        h.swayT += 0.018; h.x += Math.sin(h.swayT)*h.sway; h.y += h.speed;
        if (h.y > canvas.height+40) { h.y=-40; h.x=Math.random()*canvas.width; }
        ctx.save(); ctx.globalAlpha=h.alpha; ctx.fillStyle=h.color;
        drawHeart(ctx,h.x-h.size*0.5,h.y-h.size*0.5,h.size);
        ctx.fill(); ctx.restore();
      });
      animId = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0}}/>;
}