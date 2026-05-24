import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1">

      {/* ── Hero ── */}
      <section className="relative bg-black text-white px-6 py-16 sm:py-28 flex flex-col items-center text-center gap-6 overflow-hidden">
        {/* Diagonal stripe pattern */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "repeating-linear-gradient(-45deg, white 0, white 1px, transparent 0, transparent 50%)", backgroundSize: "18px 18px" }} />
        {/* Red glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-56 bg-red-700/25 rounded-full blur-3xl pointer-events-none" />
        {/* Bottom diagonal cut */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-white"
          style={{ clipPath: "polygon(0 100%, 100% 0, 100% 100%)" }} />

        <span className="relative z-10 text-red-400 text-xs font-black uppercase tracking-[0.3em] border border-red-500/30 px-4 py-1.5 rounded-full">
          Temporada 2026
        </span>

        <h1 className="relative z-10 text-4xl sm:text-6xl font-black tracking-tight max-w-2xl leading-[0.95]">
          ¿Quién ganará la<br />
          <span className="text-red-500">próxima carrera</span>?
        </h1>

        <p className="relative z-10 text-zinc-400 text-base sm:text-lg max-w-md">
          Haz tu apuesta antes de que empiece, compite con tus amigos y sube en la clasificación.
        </p>

        <Link
          href="/apuesta"
          className="relative z-10 mt-2 bg-red-600 hover:bg-red-500 text-white font-black px-10 py-4 rounded-full text-base transition-all hover:scale-105 w-full sm:w-auto text-center shadow-xl shadow-red-900/40"
        >
          Hacer mi apuesta →
        </Link>
      </section>

      {/* ── Tarjetas ── */}
      <section className="flex flex-col sm:flex-row gap-4 px-4 sm:px-6 py-12 sm:py-16 max-w-4xl mx-auto w-full">

        <div className="flex-1 rounded-2xl p-5 flex flex-col gap-3 border-2 border-zinc-100 hover:border-red-200 hover:shadow-md transition-all group">
          <div className="text-3xl">🏁</div>
          <h2 className="text-lg font-black text-black group-hover:text-red-600 transition-colors">Apuesta</h2>
          <p className="text-zinc-500 text-sm leading-relaxed">
            Elige el top 3 de la carrera antes de que empiece. Una apuesta por Gran Premio.
          </p>
        </div>

        <div className="flex-1 rounded-2xl p-5 flex flex-col gap-3 border-2 border-zinc-100 hover:border-red-200 hover:shadow-md transition-all group">
          <div className="text-3xl">🏆</div>
          <h2 className="text-lg font-black text-black group-hover:text-red-600 transition-colors">Puntuación</h2>
          <p className="text-zinc-500 text-sm leading-relaxed">
            Ganas puntos según aciertos. Más puntos si aciertas el orden exacto.
          </p>
        </div>

        <div className="flex-1 rounded-2xl p-5 flex flex-col gap-3 border-2 border-zinc-100 hover:border-red-200 hover:shadow-md transition-all group">
          <div className="text-3xl">📊</div>
          <h2 className="text-lg font-black text-black group-hover:text-red-600 transition-colors">Clasificación</h2>
          <p className="text-zinc-500 text-sm leading-relaxed">
            Sigue la tabla de tu grupo durante toda la temporada. ¿Quién es el mejor?
          </p>
        </div>

      </section>

    </div>
  );
}
