"use client";

import { useEffect, useRef, useState } from "react";

export interface JugadorFinal {
  nombre: string;
  avatarUrl: string | null;
  total: number;
}

const PREMIOS = [240, 144, 96];
const FW_COLORS = ["#ef4444","#f97316","#eab308","#22c55e","#3b82f6","#a855f7","#ec4899","#ffffff","#fbbf24"];

interface Particle { x: number; y: number; vx: number; vy: number; alpha: number; color: string; r: number; }

function explode(x: number, y: number, count = 70): Particle[] {
  const color = FW_COLORS[Math.floor(Math.random() * FW_COLORS.length)];
  return Array.from({ length: count }, () => {
    const a = Math.random() * Math.PI * 2, s = 1.5 + Math.random() * 4;
    return { x, y, vx: Math.cos(a)*s, vy: Math.sin(a)*s - 1.5, alpha: 1, color, r: 1.5 + Math.random()*2.5 };
  });
}

export default function CeremoniaFinal({ jugadores }: { jugadores: JugadorFinal[] }) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef       = useRef<number>(0);
  const lastBurst    = useRef<number>(0);

  const [started,  setStarted]  = useState(false);
  // 0 = nadie, 1 = 3º, 2 = 2º+3º, 3 = top3, 4 = top3+resto
  const [revealed, setRevealed] = useState(0);

  const top3 = jugadores.slice(0, 3); // [1º, 2º, 3º]
  const resto = jugadores.slice(3);

  /* ── Fireworks ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const draw = (now: number) => {
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (started && now - lastBurst.current > 700) {
        lastBurst.current = now;
        particlesRef.current.push(
          ...explode(80 + Math.random()*(canvas.width-160), 40 + Math.random()*(canvas.height*0.45))
        );
      }

      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.07; p.vx *= 0.98; p.alpha -= 0.013;
        if (p.alpha <= 0) return false;
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
        return true;
      });
      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("resize", resize); };
  }, [started]);

  /* ── Reveal secuencial: 3º → 2º → 1º → resto ── */
  useEffect(() => {
    if (!started) return;
    setTimeout(() => setRevealed(1), 1500);   // 3º
    setTimeout(() => setRevealed(2), 4500);   // 2º
    setTimeout(() => {
      setRevealed(3); // 1º + explosión
      const canvas = canvasRef.current;
      if (canvas) {
        for (let i = 0; i < 6; i++) {
          setTimeout(() => {
            particlesRef.current.push(
              ...explode(canvas.width * (0.3 + Math.random() * 0.4), canvas.height * 0.2, 120)
            );
          }, i * 250);
        }
      }
    }, 8000);
    setTimeout(() => setRevealed(4), 11500);  // resto
  }, [started]);

  /* Layout del podio: orden visual [2º, 1º, 3º] */
  const podioLayout = [
    { j: top3[1], rank: 2, premio: PREMIOS[1], show: revealed >= 2,
      blockH: "h-20 sm:h-28", bg: "from-zinc-300 to-zinc-500", numColor: "text-white" },
    { j: top3[0], rank: 1, premio: PREMIOS[0], show: revealed >= 3,
      blockH: "h-32 sm:h-44", bg: "from-yellow-300 to-yellow-600", numColor: "text-yellow-900" },
    { j: top3[2], rank: 3, premio: PREMIOS[2], show: revealed >= 1,
      blockH: "h-14 sm:h-20", bg: "from-amber-500 to-amber-700", numColor: "text-white" },
  ];

  const MEDALLA = ["🥇","🥈","🥉"];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black">
      <style>{`
        @keyframes revealUp {
          from { opacity:0; transform:translateY(28px) scale(0.82); }
          to   { opacity:1; transform:translateY(0)   scale(1); }
        }
        @keyframes glow {
          0%,100% { box-shadow:0 0 25px #facc15,0 0 55px #facc15; }
          50%      { box-shadow:0 0 55px #facc15,0 0 110px #f59e0b; }
        }
        @keyframes fadeBlock { from{opacity:0} to{opacity:1} }
        .reveal-up    { animation: revealUp 0.8s cubic-bezier(0.34,1.56,0.64,1) both; }
        .champ-card   { animation: revealUp 1s cubic-bezier(0.34,1.56,0.64,1) both,
                                   glow 2s ease-in-out 1s infinite; }
        .fade-block   { animation: fadeBlock 0.6s ease both; }
      `}</style>

      {/* Imagen de fondo */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
        style={{
          backgroundImage: "url('/podium-bg.webp')",
          filter: started ? "brightness(0.45) blur(1px)" : "brightness(0.15) blur(3px)",
        }}
      />

      {/* Gradiente para cubrir el texto original de la imagen */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom," +
            "rgba(0,0,0,0.92) 0%," +
            "rgba(0,0,0,0.5) 15%," +
            "rgba(0,0,0,0.25) 38%," +
            "rgba(0,0,0,0.5) 63%," +
            "rgba(0,0,0,0.97) 100%)",
        }}
      />

      {/* Canvas fuegos artificiales */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Contenido */}
      <div className="relative z-10 h-full flex flex-col">

        {/* Cabecera */}
        <div className="text-center pt-6 pb-2 shrink-0">
          <p className="text-red-500 text-xs font-black uppercase tracking-[0.3em]">Porra MotoGP</p>
          <h1 className="text-white text-xl sm:text-4xl font-black mt-1 uppercase tracking-wide">
            Ceremonia de Premios 2026
          </h1>
          <p className="text-zinc-500 text-xs mt-1">Bote: 480 € · 🥇 240 € · 🥈 144 € · 🥉 96 €</p>
        </div>

        {!started ? (
          /* Pantalla de inicio */
          <div className="flex-1 flex flex-col items-center justify-center gap-8 pb-24">
            <div className="text-8xl animate-bounce">🏆</div>
            <p className="text-zinc-400 text-sm text-center px-10">
              La temporada 2026 ha concluido.<br />¡Es hora de conocer al campeón!
            </p>
            <button
              onClick={() => setStarted(true)}
              className="bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-xl px-12 py-4 rounded-full transition-all shadow-2xl shadow-red-900/50"
            >
              ¡Comenzar ceremonia!
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-end px-3 pb-4">

            {/* Podio */}
            <div className="flex items-end justify-center gap-2 sm:gap-3 mb-3">
              {podioLayout.map(({ j, rank, premio, show, blockH, bg, numColor }) => (
                <div key={rank} className="flex flex-col items-center gap-1.5 flex-1 max-w-[140px] sm:max-w-[180px]">

                  {/* Tarjeta del jugador */}
                  {show && j ? (
                    <div className={rank === 1 ? "champ-card w-full" : "reveal-up w-full"}>
                      <div className={`rounded-2xl px-3 py-2.5 text-center w-full ${
                        rank === 1
                          ? "bg-yellow-400 border-2 border-yellow-200"
                          : "bg-white/15 backdrop-blur-sm border border-white/25"
                      }`}>
                        <div className="text-2xl sm:text-3xl mb-1">{MEDALLA[rank - 1]}</div>
                        <p className={`font-black text-sm sm:text-lg leading-tight ${rank === 1 ? "text-black" : "text-white"}`}>
                          {j.nombre}
                        </p>
                        {rank === 1 && (
                          <p className="text-yellow-800 text-[9px] font-black uppercase tracking-wide mt-0.5">
                            Campeón del Mundo
                          </p>
                        )}
                        <p className={`text-xs mt-0.5 ${rank === 1 ? "text-yellow-900" : "text-zinc-300"}`}>
                          {j.total} pts
                        </p>
                        <p className={`font-black text-sm mt-0.5 ${rank === 1 ? "text-yellow-800" : "text-yellow-300"}`}>
                          💰 {premio} €
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Placeholder antes de revelar */
                    <div className="rounded-2xl px-3 py-2.5 text-center w-full bg-white/5 border border-white/10">
                      <div className="text-2xl sm:text-3xl mb-1 opacity-20">{MEDALLA[rank - 1]}</div>
                      <div className="h-3 w-16 bg-white/10 rounded mx-auto" />
                      <div className="h-2 w-10 bg-white/10 rounded mx-auto mt-1.5" />
                    </div>
                  )}

                  {/* Bloque del podio */}
                  <div
                    className={`w-full ${blockH} rounded-t-xl flex items-center justify-center transition-colors duration-500 ${
                      show
                        ? `bg-gradient-to-b ${bg} fade-block`
                        : "bg-white/8"
                    }`}
                  >
                    <span className={`font-black text-2xl sm:text-4xl ${show ? numColor : "text-white/15"}`}>
                      {rank}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Resto de clasificación */}
            {revealed >= 4 && resto.length > 0 && (
              <div className="reveal-up flex flex-wrap gap-1.5 justify-center mt-1">
                {resto.map((j, i) => (
                  <div key={j.nombre} className="bg-white/10 border border-white/15 rounded-lg px-2.5 py-1 flex items-center gap-1.5">
                    <span className="text-zinc-500 text-xs font-bold">{i + 4}</span>
                    <span className="text-white text-xs font-bold">{j.nombre}</span>
                    <span className="text-zinc-400 text-xs">{j.total}p</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
