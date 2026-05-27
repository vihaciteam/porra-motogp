import { PUNTOS, MAX_PUNTOS_NORMAL, MAX_PUNTOS_ESPECIAL } from "@/lib/puntuacion";

function Fila({ label, pts }: { label: string; pts: number }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-zinc-100 last:border-0">
      <span className="text-sm text-zinc-700">{label}</span>
      <span className="font-black text-black tabular-nums text-base">{pts} pts</span>
    </div>
  );
}

export default function ReglasPage() {
  return (
    <div className="flex flex-col flex-1 max-w-2xl mx-auto w-full">

      <div className="bg-black text-white px-4 py-8 sm:px-6">
        <span className="text-red-500 text-xs font-black uppercase tracking-[0.25em]">Cómo funciona</span>
        <h1 className="text-3xl font-black mt-1">Normas</h1>
        <p className="text-zinc-500 text-sm mt-1">Todo lo que necesitas saber para jugar</p>
      </div>

      <div className="px-4 sm:px-6 py-6 flex flex-col gap-6">

        {/* Cómo jugar */}
        <section className="bg-white rounded-2xl border-2 border-zinc-100 p-6 flex flex-col gap-4">
          <h2 className="font-black text-xl text-black">¿Cómo se juega?</h2>
          <ol className="flex flex-col gap-4">
            {[
              "Antes de cada GP, entra en "Mi apuesta" y elige tu predicción: quién ganará la pole, el sprint y la carrera.",
              "La votación cierra antes de que empiece la clasificación del sábado (para pole y sprint) y antes de la carrera del domingo.",
              "Solo puntúa la posición exacta. Si aciertas el piloto pero en la posición equivocada, son 0 puntos.",
              "Cuando termina el GP, el admin introduce los resultados y los puntos se suman automáticamente a la clasificación.",
            ].map((texto, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-black shrink-0 text-xs mt-0.5">
                  {i + 1}
                </span>
                <span className="text-sm text-zinc-600 leading-relaxed">{texto}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Puntuación sábado */}
        <section className="bg-white rounded-2xl border-2 border-zinc-100 p-6 flex flex-col gap-1">
          <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">Sábado</p>
          <Fila label="🏁 Pole position"  pts={PUNTOS.sabado.pole}    />
          <Fila label="🥇 Sprint P1"      pts={PUNTOS.sabado.sprint1} />
          <Fila label="🥈 Sprint P2"      pts={PUNTOS.sabado.sprint2} />
          <Fila label="🥉 Sprint P3"      pts={PUNTOS.sabado.sprint3} />
        </section>

        {/* Puntuación domingo */}
        <section className="bg-white rounded-2xl border-2 border-zinc-100 p-6 flex flex-col gap-1">
          <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">Domingo</p>
          <Fila label="🥇 Carrera P1"     pts={PUNTOS.domingo.carrera1}     />
          <Fila label="🥈 Carrera P2"     pts={PUNTOS.domingo.carrera2}     />
          <Fila label="🥉 Carrera P3"     pts={PUNTOS.domingo.carrera3}     />
          <Fila label="⚡ Vuelta rápida"  pts={PUNTOS.domingo.vueltaRapida} />
        </section>

        {/* GP Especial */}
        <section className="bg-red-50 rounded-2xl border-2 border-red-100 p-6 flex flex-col gap-1">
          <p className="text-xs font-black uppercase tracking-widest text-red-500 mb-1">⭐ GP Especial</p>
          <p className="text-xs text-zinc-500 mb-3">Solo en el GP de Austria — escribe el nombre exacto del ganador.</p>
          <Fila label="🏍️ Ganador Moto3" pts={PUNTOS.especial.moto3} />
          <Fila label="🏍️ Ganador Moto2" pts={PUNTOS.especial.moto2} />
        </section>

        {/* Máximos */}
        <div className="flex gap-3">
          <div className="flex-1 bg-zinc-900 text-white rounded-2xl p-5 flex flex-col items-center gap-1">
            <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">GP normal</p>
            <p className="text-4xl font-black tabular-nums">{MAX_PUNTOS_NORMAL}</p>
            <p className="text-xs text-zinc-500">puntos máx.</p>
          </div>
          <div className="flex-1 bg-red-600 text-white rounded-2xl p-5 flex flex-col items-center gap-1">
            <p className="text-xs text-red-200 font-bold uppercase tracking-widest">GP Especial</p>
            <p className="text-4xl font-black tabular-nums">{MAX_PUNTOS_ESPECIAL}</p>
            <p className="text-xs text-red-200">puntos máx.</p>
          </div>
        </div>

        <p className="text-xs text-zinc-400 text-center pb-4">
          En caso de empate, gana quien tenga más puntos en la carrera del domingo.
        </p>

      </div>
    </div>
  );
}
