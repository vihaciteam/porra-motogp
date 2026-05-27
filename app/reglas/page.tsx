import { PUNTOS, MAX_PUNTOS_NORMAL, MAX_PUNTOS_ESPECIAL } from "@/lib/puntuacion";

function Seccion({ num, titulo, children }: { num: number; titulo: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border-2 border-zinc-100 p-6 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="bg-black text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center shrink-0">
          {num}
        </span>
        <h2 className="font-black text-lg text-black">{titulo}</h2>
      </div>
      <div className="text-sm text-zinc-600 leading-relaxed flex flex-col gap-2 pl-9">
        {children}
      </div>
    </section>
  );
}

function FilaPuntos({ label, pts, destacado }: { label: string; pts: number; destacado?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-2.5 border-b border-zinc-100 last:border-0 ${destacado ? "font-bold" : ""}`}>
      <span className={`text-sm ${destacado ? "text-black" : "text-zinc-700"}`}>{label}</span>
      <span className="font-black text-black tabular-nums">{pts} pts</span>
    </div>
  );
}

export default function ReglasPage() {
  return (
    <div className="flex flex-col flex-1 max-w-2xl mx-auto w-full">

      <div className="bg-black text-white px-4 py-8 sm:px-6">
        <span className="text-red-500 text-xs font-black uppercase tracking-[0.25em]">Podium MotoGP 2026</span>
        <h1 className="text-3xl font-black mt-1">Bases del concurso</h1>
        <p className="text-zinc-500 text-sm mt-1">Normas oficiales de la porra</p>
      </div>

      <div className="px-4 sm:px-6 py-6 flex flex-col gap-4">

        {/* 1. Organización */}
        <Seccion num={1} titulo="Organización">
          <p>
            Podium MotoGP 2026 es una iniciativa privada entre participantes con el objetivo de
            pronosticar los resultados de las carreras oficiales del campeonato del mundo de MotoGP.
          </p>
        </Seccion>

        {/* 2. Modalidades */}
        <Seccion num={2} titulo="Modalidades incluidas">
          <p>La porra se jugará de forma habitual con el podio de <strong className="text-black">MotoGP</strong>.</p>
          <p>
            En determinados Grandes Premios, la organización podrá habilitar de forma opcional
            pronósticos adicionales de <strong className="text-black">Moto2 y/o Moto3</strong>,
            lo cual se comunicará previamente a los participantes.
          </p>
        </Seccion>

        {/* 3. Participación */}
        <Seccion num={3} titulo="Participación">
          <p>La participación en la porra es de <strong className="text-black">pago único de 40 €</strong> entre los participantes.</p>
          <p>Para participar será necesario realizar una transferencia bancaria a la siguiente cuenta:</p>
          <div className="bg-zinc-50 border-2 border-zinc-200 rounded-xl px-4 py-3 mt-1">
            <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mb-1">IBAN</p>
            <p className="font-black text-black tracking-wider text-base">ES68 1583 0001 1190 0451 4822</p>
          </div>
        </Seccion>

        {/* 4. Envío de respuestas */}
        <Seccion num={4} titulo="Envío de respuestas">
          <p>Cada participante podrá enviar varias respuestas.</p>
          <p>
            A efectos de puntuación, <strong className="text-black">solo se tendrá en cuenta la última
            respuesta registrada antes del cierre del formulario</strong>.
          </p>
          <p>
            El formulario se cerrará automáticamente <strong className="text-black">una hora antes</strong> del
            inicio de la Sprint o Carrera correspondiente.
          </p>
        </Seccion>

        {/* 5. Sistema de puntuación */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-3 px-1">
            <span className="bg-black text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center shrink-0">5</span>
            <h2 className="font-black text-lg text-black">Sistema de puntuación</h2>
          </div>

          <div className="bg-white rounded-2xl border-2 border-zinc-100 p-5 flex flex-col gap-1">
            <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">🏁 Carrera — Domingo</p>
            <FilaPuntos label="🥇 1º clasificado" pts={PUNTOS.domingo.carrera1} />
            <FilaPuntos label="🥈 2º clasificado" pts={PUNTOS.domingo.carrera2} />
            <FilaPuntos label="🥉 3º clasificado" pts={PUNTOS.domingo.carrera3} />
          </div>

          <div className="bg-white rounded-2xl border-2 border-zinc-100 p-5 flex flex-col gap-1">
            <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">⚡ Sprint — Sábado</p>
            <FilaPuntos label="🥇 1º clasificado" pts={PUNTOS.sabado.sprint1} />
            <FilaPuntos label="🥈 2º clasificado" pts={PUNTOS.sabado.sprint2} />
            <FilaPuntos label="🥉 3º clasificado" pts={PUNTOS.sabado.sprint3} />
          </div>

          <div className="bg-white rounded-2xl border-2 border-zinc-100 p-5 flex flex-col gap-1">
            <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">🏆 Pole Position y Vuelta Rápida</p>
            <p className="text-xs text-zinc-500 mb-2">Se contabilizan en todas las carreras.</p>
            <FilaPuntos label="🏁 Pole Position" pts={PUNTOS.sabado.pole} />
            <FilaPuntos label="⚡ Vuelta Rápida" pts={PUNTOS.domingo.vueltaRapida} />
          </div>

          <div className="bg-red-50 rounded-2xl border-2 border-red-100 p-5 flex flex-col gap-1">
            <p className="text-xs font-black uppercase tracking-widest text-red-500 mb-1">⭐ Moto2 y Moto3</p>
            <p className="text-xs text-zinc-500 mb-2">Solo en GPs habilitados. Se pronostica únicamente el ganador.</p>
            <FilaPuntos label="🏍️ Ganador Moto3" pts={PUNTOS.especial.moto3} />
            <FilaPuntos label="🏍️ Ganador Moto2" pts={PUNTOS.especial.moto2} />
          </div>

          <p className="text-xs text-zinc-500 px-1">
            La puntuación se asignará por posición acertada, sin necesidad de acertar el podio completo para sumar puntos.
          </p>

          <div className="flex gap-3">
            <div className="flex-1 bg-zinc-900 text-white rounded-2xl p-4 flex flex-col items-center gap-1">
              <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">GP normal</p>
              <p className="text-4xl font-black tabular-nums">{MAX_PUNTOS_NORMAL}</p>
              <p className="text-xs text-zinc-500">puntos máx.</p>
            </div>
            <div className="flex-1 bg-red-600 text-white rounded-2xl p-4 flex flex-col items-center gap-1">
              <p className="text-xs text-red-200 font-bold uppercase tracking-widest">GP Especial</p>
              <p className="text-4xl font-black tabular-nums">{MAX_PUNTOS_ESPECIAL}</p>
              <p className="text-xs text-red-200">puntos máx.</p>
            </div>
          </div>
        </section>

        {/* 6. Clasificación general */}
        <Seccion num={6} titulo="Clasificación general">
          <p>Las puntuaciones se acumularán a lo largo de toda la temporada.</p>
          <p>La clasificación general se actualizará tras cada Gran Premio una vez confirmados los resultados oficiales.</p>
          <p>En caso de empate a puntos, se priorizará el mayor número de aciertos en primeras posiciones.</p>
        </Seccion>

        {/* 7. Juego limpio */}
        <Seccion num={7} titulo="Juego limpio y sanciones">
          <p>Cualquier intento de trampa o manipulación del sistema supondrá la <strong className="text-black">descalificación del participante</strong> en la carrera en la que se haya producido la infracción.</p>
          <p>En caso de acumular <strong className="text-black">tres infracciones</strong>, el participante será <strong className="text-black">expulsado definitivamente</strong> de la liga sin derecho a reclamación.</p>
        </Seccion>

        {/* 8. Premios */}
        <Seccion num={8} titulo="Premios de final de temporada">
          <p>Al finalizar la temporada, se entregarán premios a los <strong className="text-black">tres participantes con mayor puntuación acumulada</strong> según el bote total recaudado:</p>
          <div className="flex flex-col gap-2 mt-1">
            {[
              { pos: "🥇 1º clasificado", pct: "50%", color: "bg-yellow-50 border-yellow-200 text-yellow-800" },
              { pos: "🥈 2º clasificado", pct: "30%", color: "bg-zinc-50 border-zinc-200 text-zinc-700" },
              { pos: "🥉 3º clasificado", pct: "20%", color: "bg-amber-50 border-amber-200 text-amber-800" },
            ].map(({ pos, pct, color }) => (
              <div key={pos} className={`flex items-center justify-between rounded-xl border-2 px-4 py-2.5 ${color}`}>
                <span className="font-bold">{pos}</span>
                <span className="font-black text-lg">{pct} del bote</span>
              </div>
            ))}
          </div>
          <div className="bg-zinc-50 rounded-xl border border-zinc-200 px-4 py-3 mt-1 text-xs text-zinc-500">
            <p className="font-bold text-zinc-700 mb-1">Ejemplo orientativo:</p>
            <p>Si participan 12 jugadores → bote total 480 €</p>
            <p>1º: 240 € · 2º: 144 € · 3º: 96 €</p>
            <p className="mt-1">Los premios estarán sujetos al número total de participantes.</p>
          </div>
        </Seccion>

        {/* 9. Transparencia */}
        <Seccion num={9} titulo="Transparencia">
          <p>Las respuestas permanecerán ocultas hasta la finalización de cada carrera.</p>
          <p>La clasificación se hará pública una vez validados los resultados oficiales.</p>
        </Seccion>

        {/* 10. Aceptación */}
        <Seccion num={10} titulo="Aceptación de las bases">
          <p>La participación en la porra implica la aceptación íntegra de estas bases.</p>
          <p>La organización se reserva el derecho de modificar las presentes bases por causa justificada, comprometiéndose a comunicar cualquier cambio a los participantes.</p>
        </Seccion>

      </div>
    </div>
  );
}
