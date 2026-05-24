import { createClient } from "@/utils/supabase/server";
import { nombrePiloto } from "@/lib/pilotos";
import { calcularPuntos, PUNTOS, type RegistroGP } from "@/lib/puntuacion";
import { gpActual } from "@/lib/calendario";
import { Avatar } from "@/app/components/Avatar";

const MEDALLAS = ["🥇", "🥈", "🥉"];
const GP = gpActual();

function Chip({ label, valor, acierto }: { label: string; valor: string | null; acierto?: boolean }) {
  if (!valor) return (
    <span className="text-xs bg-zinc-50 text-zinc-300 rounded-lg px-2 py-1">{label}: —</span>
  );
  return (
    <span className={`text-xs rounded-lg px-2 py-1 font-medium ${
      acierto ? "bg-green-100 text-green-800" : "bg-zinc-100 text-zinc-500"
    }`}>
      {label}: {valor}
    </span>
  );
}

export default async function ClasificacionPage() {
  if (!GP) {
    return (
      <div className="flex flex-1 items-center justify-center text-zinc-400 px-4">
        No hay más GPs en el calendario.
      </div>
    );
  }

  const supabase = await createClient();

  const [{ data: apuestas }, { data: resultado }, { data: perfiles }] = await Promise.all([
    supabase.from("apuestas").select("user_id, pole, sprint_p1, sprint_p2, sprint_p3, carrera_p1, carrera_p2, carrera_p3, vuelta_rapida, moto3_winner, moto2_winner").eq("carrera_id", GP.id),
    supabase.from("resultados").select("pole, sprint_p1, sprint_p2, sprint_p3, carrera_p1, carrera_p2, carrera_p3, vuelta_rapida, moto3_winner, moto2_winner").eq("carrera_id", GP.id).maybeSingle(),
    supabase.from("perfiles").select("id, nombre"),
  ]);

  const res = resultado as RegistroGP | null;

  const jugadores = (apuestas ?? [])
    .map((a) => ({
      nombre: perfiles?.find((p) => p.id === a.user_id)?.nombre ?? "Jugador",
      puntos: res ? calcularPuntos(a as RegistroGP, res, GP.votacionEspecial) : null,
      apuesta: a as RegistroGP,
    }))
    .sort((a, b) => (b.puntos ?? -1) - (a.puntos ?? -1));

  return (
    <div className="flex flex-col flex-1 px-4 py-8 max-w-3xl mx-auto w-full gap-6">

      <div>
        <h1 className="text-3xl font-black text-black">Clasificación</h1>
        <p className="text-zinc-400 text-sm mt-1">{GP.nombre} · {GP.circuito}</p>
      </div>

      {/* Resultado oficial */}
      {res ? (
        <div className="bg-black text-white rounded-2xl px-6 py-5 flex flex-col gap-4">
          <p className="text-zinc-400 text-xs uppercase tracking-widest">Resultado oficial</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex flex-col gap-1.5">
              <p className="text-zinc-500 text-xs font-bold uppercase">Sábado</p>
              {res.pole      && <p>🏁 Pole: <span className="font-bold">{nombrePiloto(res.pole)}</span></p>}
              {res.sprint_p1 && <p>🥇 Sprint: <span className="font-bold">{nombrePiloto(res.sprint_p1)}</span></p>}
              {res.sprint_p2 && <p>🥈 Sprint: <span className="font-bold">{nombrePiloto(res.sprint_p2)}</span></p>}
              {res.sprint_p3 && <p>🥉 Sprint: <span className="font-bold">{nombrePiloto(res.sprint_p3)}</span></p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-zinc-500 text-xs font-bold uppercase">Domingo</p>
              {res.carrera_p1    && <p>🥇 Carrera: <span className="font-bold">{nombrePiloto(res.carrera_p1)}</span></p>}
              {res.carrera_p2    && <p>🥈 Carrera: <span className="font-bold">{nombrePiloto(res.carrera_p2)}</span></p>}
              {res.carrera_p3    && <p>🥉 Carrera: <span className="font-bold">{nombrePiloto(res.carrera_p3)}</span></p>}
              {res.vuelta_rapida && <p>⚡ V.Rápida: <span className="font-bold">{nombrePiloto(res.vuelta_rapida)}</span></p>}
              {GP.votacionEspecial && res.moto3_winner && <p>🏍️ Moto3: <span className="font-bold">{res.moto3_winner}</span></p>}
              {GP.votacionEspecial && res.moto2_winner && <p>🏍️ Moto2: <span className="font-bold">{res.moto2_winner}</span></p>}
            </div>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-zinc-200 rounded-2xl px-6 py-4 text-zinc-400 text-sm text-center">
          Resultado pendiente · se actualizará tras la carrera
        </div>
      )}

      {/* Puntuación máxima */}
      <div className="flex flex-wrap gap-2 text-xs text-zinc-400">
        <span className="bg-zinc-100 rounded-full px-3 py-1">🏁 Pole <strong className="text-black">{PUNTOS.sabado.pole}pt</strong></span>
        <span className="bg-zinc-100 rounded-full px-3 py-1">Sprint 🥇<strong className="text-black">{PUNTOS.sabado.sprint1}</strong> 🥈<strong className="text-black">{PUNTOS.sabado.sprint2}</strong> 🥉<strong className="text-black">{PUNTOS.sabado.sprint3}</strong></span>
        <span className="bg-zinc-100 rounded-full px-3 py-1">Carrera 🥇<strong className="text-black">{PUNTOS.domingo.carrera1}</strong> 🥈<strong className="text-black">{PUNTOS.domingo.carrera2}</strong> 🥉<strong className="text-black">{PUNTOS.domingo.carrera3}</strong></span>
        <span className="bg-zinc-100 rounded-full px-3 py-1">⚡ V.Rápida <strong className="text-black">{PUNTOS.domingo.vueltaRapida}pt</strong></span>
        {GP.votacionEspecial && <span className="bg-red-50 rounded-full px-3 py-1 text-red-500">⭐ Especial <strong>{PUNTOS.especial.moto3}+{PUNTOS.especial.moto2}pt</strong></span>}
        <span className="bg-zinc-100 rounded-full px-3 py-1">Máx <strong className="text-black">{GP.votacionEspecial ? 111 : 91}pt</strong></span>
      </div>

      {/* Tabla de jugadores */}
      {jugadores.length === 0 ? (
        <p className="text-zinc-400 text-sm text-center py-8">
          Aún no hay apuestas para este GP.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {jugadores.map((j, i) => (
            <div
              key={i}
              className={`rounded-xl border-2 px-5 py-4 flex flex-col gap-3 ${
                i === 0 && j.puntos !== null ? "border-red-500 bg-red-50" : "border-zinc-100 bg-white"
              }`}
            >
              {/* Nombre y puntos */}
              <div className="flex items-center gap-3">
                <span className="text-2xl w-6 text-center shrink-0">
                  {i < 3 ? MEDALLAS[i] : <span className="text-zinc-400 font-bold text-sm">{i + 1}</span>}
                </span>
                <Avatar nombre={j.nombre} size={40} />
                <span className="flex-1 font-bold text-black text-lg">{j.nombre}</span>
                {j.puntos !== null
                  ? <span className="font-black text-black text-2xl">{j.puntos} pts</span>
                  : <span className="text-zinc-300 text-sm">pendiente</span>
                }
              </div>

              {/* Detalle de picks */}
              <div className="flex flex-wrap gap-1.5 pl-11">
                <Chip label="🏁" valor={j.apuesta.pole ? nombrePiloto(j.apuesta.pole) : null} acierto={!!res && j.apuesta.pole === res.pole} />
                <Chip label="S🥇" valor={j.apuesta.sprint_p1 ? nombrePiloto(j.apuesta.sprint_p1) : null} acierto={!!res && j.apuesta.sprint_p1 === res.sprint_p1} />
                <Chip label="S🥈" valor={j.apuesta.sprint_p2 ? nombrePiloto(j.apuesta.sprint_p2) : null} acierto={!!res && j.apuesta.sprint_p2 === res.sprint_p2} />
                <Chip label="S🥉" valor={j.apuesta.sprint_p3 ? nombrePiloto(j.apuesta.sprint_p3) : null} acierto={!!res && j.apuesta.sprint_p3 === res.sprint_p3} />
                <Chip label="C🥇" valor={j.apuesta.carrera_p1 ? nombrePiloto(j.apuesta.carrera_p1) : null} acierto={!!res && j.apuesta.carrera_p1 === res.carrera_p1} />
                <Chip label="C🥈" valor={j.apuesta.carrera_p2 ? nombrePiloto(j.apuesta.carrera_p2) : null} acierto={!!res && j.apuesta.carrera_p2 === res.carrera_p2} />
                <Chip label="C🥉" valor={j.apuesta.carrera_p3 ? nombrePiloto(j.apuesta.carrera_p3) : null} acierto={!!res && j.apuesta.carrera_p3 === res.carrera_p3} />
                <Chip label="⚡" valor={j.apuesta.vuelta_rapida ? nombrePiloto(j.apuesta.vuelta_rapida) : null} acierto={!!res && j.apuesta.vuelta_rapida === res.vuelta_rapida} />
                {GP.votacionEspecial && <Chip label="Moto3" valor={j.apuesta.moto3_winner} acierto={!!res && j.apuesta.moto3_winner === res.moto3_winner} />}
                {GP.votacionEspecial && <Chip label="Moto2" valor={j.apuesta.moto2_winner} acierto={!!res && j.apuesta.moto2_winner === res.moto2_winner} />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
