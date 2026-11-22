"use client";

import { useEffect, useState } from "react";

const CONTENDIENTES = ["ñoño", "Carlos14", "Joseca"];

export default function CampeonatoPopup() {
  const [fase, setFase] = useState<"off" | "intro" | "contendientes" | "out">("off");

  useEffect(() => {
    if (!sessionStorage.getItem("popup-campeonato-visto")) {
      setFase("intro");
    }
  }, []);

  useEffect(() => {
    if (fase === "intro") {
      const t = setTimeout(() => setFase("contendientes"), 2600);
      return () => clearTimeout(t);
    }
  }, [fase]);

  function cerrar() {
    sessionStorage.setItem("popup-campeonato-visto", "1");
    setFase("out");
  }

  if (fase === "off" || fase === "out") return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      style={{ background: "#000" }}
    >
      <style>{`
        @keyframes scanDown {
          from { transform: translateY(-100%); }
          to   { transform: translateY(100vh); }
        }
        @keyframes flicker {
          0%,100%{opacity:1} 92%{opacity:1} 93%{opacity:.6} 95%{opacity:1} 97%{opacity:.7} 99%{opacity:1}
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(22px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes zoomIn {
          from { opacity:0; transform:scale(1.18); }
          to   { opacity:1; transform:scale(1); }
        }
        @keyframes slideR {
          from { opacity:0; transform:translateX(-20px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes glow {
          0%,100%{text-shadow:0 0 20px #ef4444,0 0 40px #ef4444}
          50%{text-shadow:0 0 40px #ef4444,0 0 80px #f97316}
        }
        @keyframes stripeIn {
          from{scaleX(0)} to{scaleX(1)}
        }
        .fade-up   { animation: fadeUp  .7s cubic-bezier(.22,1,.36,1) both; }
        .zoom-in   { animation: zoomIn  .9s cubic-bezier(.22,1,.36,1) both; }
        .slide-r   { animation: slideR  .6s cubic-bezier(.22,1,.36,1) both; }
        .flicker   { animation: flicker 4s infinite; }
        .glow-red  { animation: glow 3s ease-in-out infinite; }
        .scan-line {
          position:absolute;inset:0;pointer-events:none;overflow:hidden;
        }
        .scan-line::after {
          content:"";position:absolute;left:0;right:0;height:3px;
          background:linear-gradient(to bottom,transparent,rgba(255,255,255,.04),transparent);
          animation:scanDown 3s linear infinite;
        }
      `}</style>

      {/* Scan line overlay */}
      <div className="scan-line" />

      {/* Fondo: vignette + ruido */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at center, rgba(30,0,0,.7) 0%, rgba(0,0,0,1) 100%)"
      }} />

      {/* Botón cerrar siempre visible */}
      <button
        onClick={cerrar}
        className="absolute top-4 right-4 z-50 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:scale-90 transition-all border border-white/15"
        aria-label="Cerrar"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M1 1l12 12M13 1L1 13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Franja bandera española */}
      <div className="absolute top-0 left-0 right-0 flex" style={{ height: 5 }}>
        <div style={{ flex:1, background:"#c60b1e" }} />
        <div style={{ flex:1.4, background:"#f1bf00" }} />
        <div style={{ flex:1, background:"#c60b1e" }} />
      </div>
      <div className="absolute bottom-0 left-0 right-0 flex" style={{ height: 5 }}>
        <div style={{ flex:1, background:"#c60b1e" }} />
        <div style={{ flex:1.4, background:"#f1bf00" }} />
        <div style={{ flex:1, background:"#c60b1e" }} />
      </div>

      {/* ── FASE INTRO ── */}
      {fase === "intro" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 flicker">
          <p className="zoom-in text-zinc-500 text-xs font-black tracking-[0.5em] uppercase"
             style={{ animationDelay: "0ms" }}>
            Gran Premio · Circuit Ricardo Tormo
          </p>
          <div className="zoom-in text-center px-4" style={{ animationDelay: "180ms" }}>
            <p className="text-white font-black uppercase leading-none"
               style={{ fontSize: "clamp(2.8rem,12vw,7rem)", letterSpacing: "-0.02em" }}>
              TODO SE
            </p>
            <p className="font-black uppercase leading-none glow-red"
               style={{
                 fontSize: "clamp(2.8rem,12vw,7rem)",
                 letterSpacing: "-0.02em",
                 color: "#ef4444",
               }}>
              DECIDE
            </p>
            <p className="text-white font-black uppercase leading-none"
               style={{ fontSize: "clamp(2.8rem,12vw,7rem)", letterSpacing: "-0.02em" }}>
              EN VALENCIA
            </p>
          </div>
          <p className="fade-up text-zinc-600 text-xs font-black tracking-[0.3em] uppercase"
             style={{ animationDelay: "600ms" }}>
            Temporada 2026
          </p>
        </div>
      )}

      {/* ── FASE CONTENDIENTES ── */}
      {fase === "contendientes" && (
        <div className="absolute inset-0 flex flex-col" style={{ padding: "24px 20px 20px" }}>

          {/* Cabecera */}
          <div className="fade-up shrink-0 mb-4" style={{ animationDelay: "0ms" }}>
            <p className="text-zinc-600 text-[10px] font-black tracking-[0.4em] uppercase mb-1">
              Circuit Ricardo Tormo · Valencia
            </p>
            <p className="text-white font-black uppercase"
               style={{ fontSize: "clamp(1.3rem,6vw,2.4rem)", letterSpacing: "-0.01em", lineHeight: 1.1 }}>
              Contendientes<br />
              <span style={{ color: "#ef4444" }}>al título</span>
            </p>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1.5 bg-red-600/20 border border-red-600/40 rounded-full px-3 py-1">
                <span className="text-red-400 font-black text-xs">91 PTS EN JUEGO</span>
              </div>
              <div className="flex items-center gap-1.5 bg-zinc-800/60 border border-zinc-700 rounded-full px-3 py-1">
                <span className="text-zinc-400 font-black text-xs">ÚLTIMA CARRERA</span>
              </div>
            </div>
          </div>

          {/* Lista */}
          <div className="flex flex-col gap-2.5 flex-1 min-h-0 overflow-y-auto">
            {CONTENDIENTES.map((nombre, i) => (
              <div
                key={nombre}
                className="slide-r flex items-center gap-3 rounded-xl px-3 py-2.5"
                style={{
                  animationDelay: `${80 + i * 90}ms`,
                  background: i === 0
                    ? "linear-gradient(135deg, rgba(239,68,68,.22), rgba(234,179,8,.12))"
                    : "rgba(255,255,255,.05)",
                  border: i === 0
                    ? "1px solid rgba(239,68,68,.45)"
                    : "1px solid rgba(255,255,255,.08)",
                }}
              >
                {/* Número / corona */}
                <div className="shrink-0 w-7 text-center">
                  {i === 0
                    ? <span style={{ fontSize: 20 }}>👑</span>
                    : <span className="text-zinc-500 font-black text-sm">{i + 1}</span>
                  }
                </div>

                {/* Nombre */}
                <span
                  className="font-black flex-1"
                  style={{
                    fontSize: i === 0 ? "clamp(1rem,4vw,1.2rem)" : "clamp(.9rem,3.5vw,1.05rem)",
                    color: i === 0 ? "#fca5a5" : "#e4e4e7",
                  }}
                >
                  {nombre}
                </span>

                {/* Badge líder */}
                {i === 0 && (
                  <span className="shrink-0 bg-red-600 text-white text-[9px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full">
                    Líder
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Pie */}
          <div className="shrink-0 mt-4 flex flex-col gap-2">
            <p className="text-center text-zinc-600 text-[10px] font-bold tracking-widest uppercase">
              ¿Quién se llevará los 240 €?
            </p>
            <button
              onClick={cerrar}
              className="w-full bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black py-3.5 rounded-full transition-all text-sm tracking-wide uppercase"
              style={{ boxShadow: "0 0 24px rgba(239,68,68,.35)" }}
            >
              ¡A por el título!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
