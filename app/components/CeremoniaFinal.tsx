"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar } from "./Avatar";

export interface JugadorFinal {
  nombre: string;
  avatarUrl: string | null;
  total: number;
}

interface RevealItem extends JugadorFinal {
  rank: number;
}

const PREMIOS   = [240, 144, 96];
const MEDALLAS  = ["🥇", "🥈", "🥉"];
const FW_COLORS = ["#ef4444","#f97316","#eab308","#22c55e","#3b82f6","#a855f7","#ec4899","#ffffff","#fbbf24"];

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  alpha: number; color: string; r: number;
}

function explode(x: number, y: number): Particle[] {
  const color = FW_COLORS[Math.floor(Math.random() * FW_COLORS.length)];
  return Array.from({ length: 70 }, () => {
    const a = Math.random() * Math.PI * 2;
    const s = 1.5 + Math.random() * 4;
    return { x, y, vx: Math.cos(a)*s, vy: Math.sin(a)*s - 1, alpha: 1, color, r: 1.5 + Math.random()*2.5 };
  });
}

export default function CeremoniaFinal({ jugadores }: { jugadores: JugadorFinal[] }) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef       = useRef<number>(0);
  const lastBurst    = useRef<number>(0);

  const [started,  setStarted]  = useState(false);
  const [revelados, setRevelados] = useState<RevealItem[]>([]);

  const total    = jugadores.length;
  const reversed = [...jugadores].reverse(); // last→first

  /* ── Canvas fireworks ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const draw = (now: number) => {
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (started && now - lastBurst.current > 700) {
        lastBurst.current = now;
        particlesRef.current.push(
          ...explode(60 + Math.random()*(canvas.width-120), 40 + Math.random()*(canvas.height*0.55))
        );
      }

      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.07; p.vx *= 0.98; p.alpha -= 0.014;
        if (p.alpha <= 0) return false;
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle   = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
        return true;
      });
      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("resize", resize); };
  }, [started]);

  /* ── Reveal secuencial ── */
  useEffect(() => {
    if (!started) return;
    let cancelled = false;

    const reveal = (idx: number) => {
      if (cancelled || idx >= total) return;
      const rank = total - idx;
      setRevelados(prev => [{ ...reversed[idx], rank }, ...prev]);
      const delay = rank === 1 ? 5000 : rank <= 3 ? 3500 : 1500;
      setTimeout(() => reveal(idx + 1), delay);
    };

    setTimeout(() => reveal(0), 1200);
    return () => { cancelled = true; };
  }, [started]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col overflow-hidden">
      <style>{`
        @keyframes cardIn {
          from { opacity:0; transform:scale(0.8) translateY(-18px); }
          to   { opacity:1; transform:scale(1)   translateY(0); }
        }
        .card-in { animation: cardIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
        @keyframes glow {
          0%,100% { box-shadow:0 0 20px #facc15,0 0 40px #facc15; }
          50%     { box-shadow:0 0 40px #facc15,0 0 80px #f59e0b; }
        }
        .champion { animation: cardIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both, glow 2s ease-in-out 0.6s infinite; }
      `}</style>

      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full">
        {/* Cabecera */}
        <div className="text-center px-4 pt-6 pb-3 shrink-0">
          <p className="text-red-500 text-xs font-black uppercase tracking-[0.25em]">Porra MotoGP</p>
          <h1 className="text-2xl sm:text-4xl font-black text-white mt-0.5">Ceremonia de Premios 2026</h1>
          <p className="text-zinc-500 text-xs mt-1">Bote: 480 € · 🥇 240 € · 🥈 144 € · 🥉 96 €</p>
        </div>

        {!started ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-6 pb-16">
            <div className="text-7xl animate-bounce">🏆</div>
            <p className="text-zinc-400 text-sm text-center px-10">
              La temporada 2026 ha concluido.<br />¡Es hora de conocer al campeón!
            </p>
            <button
              onClick={() => setStarted(true)}
              className="bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-xl px-10 py-4 rounded-full transition-all shadow-2xl shadow-red-900/50"
            >
              ¡Comenzar ceremonia!
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 pb-8">
            {revelados.length === 0 && (
              <p className="text-zinc-500 text-sm text-center mt-12 animate-pulse">
                Preparando la ceremonia…
              </p>
            )}
            <div className="flex flex-col gap-2 max-w-sm mx-auto pt-2">
              {revelados.map((j) => {
                const isChamp = j.rank === 1;
                const isTop3  = j.rank <= 3;
                const premio  = isTop3 ? PREMIOS[j.rank - 1] : null;
                return (
                  <div
                    key={j.nombre}
                    className={`rounded-2xl px-4 py-3 flex items-center gap-3 ${
                      isChamp  ? "champion bg-gradient-to-r from-yellow-400 to-yellow-200 border-2 border-yellow-400"
                      : j.rank === 2 ? "card-in bg-gradient-to-r from-zinc-100 to-white border-2 border-zinc-300"
                      : j.rank === 3 ? "card-in bg-gradient-to-r from-amber-100 to-white border-2 border-amber-400"
                      : "card-in bg-white/10 border border-white/20"
                    }`}
                  >
                    <span className={`text-xl font-black shrink-0 w-8 text-center ${isTop3 ? "text-black" : "text-zinc-400"}`}>
                      {isTop3 ? MEDALLAS[j.rank - 1] : j.rank}
                    </span>
                    <Avatar nombre={j.nombre} avatarUrl={j.avatarUrl} size={36} />
                    <div className="flex-1 min-w-0">
                      <p className={`font-black truncate leading-tight ${isTop3 ? "text-black text-lg" : "text-white text-sm"}`}>
                        {j.nombre}
                      </p>
                      {isChamp && (
                        <p className="text-xs font-black text-yellow-700 uppercase tracking-wide">
                          🏆 Campeón del Mundo 2026
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`font-black tabular-nums ${isTop3 ? "text-black" : "text-white text-sm"}`}>
                        {j.total} pts
                      </p>
                      {premio !== null && (
                        <p className={`text-sm font-black ${isChamp ? "text-yellow-700" : "text-zinc-600"}`}>
                          💰 {premio} €
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
