import { createClient } from "@/utils/supabase/server";
import { nombrePiloto } from "@/lib/pilotos";
import { calcularPuntosCarrera } from "@/lib/puntuacion";
import { gpActual } from "@/lib/calendario";

const CARRERA_ACTUAL = gpActual()!

const MEDALLAS = ["🥇", "🥈", "🥉"];

export default async function ClasificacionPage() {
  const supabase = await createClient();

  const [{ data: apuestas }, { data: resultado }, { data: perfiles }] = await Promise.all([
    supabase.from("apuestas").select("user_id, p1, p2, p3").eq("carrera_id", CARRERA_ACTUAL.id),
    supabase.from("resultados").select("p1, p2, p3").eq("carrera_id", CARRERA_ACTUAL.id).maybeSingle(),
    supabase.from("perfiles").select("id, nombre"),
  ]);

  const jugadores = (apuestas ?? [])
    .map((a) => ({
      nombre: perfiles?.find((p) => p.id === a.user_id)?.nombre ?? "Jugador",
      puntos: resultado ? calcularPuntosCarrera(a, resultado) : null,
      apuesta: [a.p1, a.p2, a.p3],
    }))
    .sort((a, b) => (b.puntos ?? 0) - (a.puntos ?? 0));

  return (
    <div className="flex flex-col flex-1 px-4 py-8 max-w-2xl mx-auto w-full gap-6">

      <div>
        <h1 className="text-3xl font-black text-black">Clasificación</h1>
        <p className="text-zinc-400 text-sm mt-1">{CARRERA_ACTUAL.nombre}</p>
      </div>

      {/* Resultado oficial */}
      {resultado ? (
        <div className="bg-black text-white rounded-2xl px-6 py-4 flex flex-col gap-2">
          <p className="text-zinc-400 text-xs uppercase tracking-widest">Resultado oficial</p>
          <div className="flex gap-6">
            {[resultado.p1, resultado.p2, resultado.p3].map((num, i) => (
              <div key={i} className="flex flex-col">
                <span className="text-red-500 text-xs font-black">{i + 1}º</span>
                <span className="font-bold text-sm">{nombrePiloto(num)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-zinc-200 rounded-2xl px-6 py-4 text-zinc-400 text-sm text-center">
          Resultado pendiente · se actualizará tras la carrera
        </div>
      )}

      {/* Sistema de puntuación */}
      <div className="flex flex-wrap gap-2 text-xs text-zinc-400">
        <span className="bg-zinc-100 rounded-full px-3 py-1">🥇 P1 exacto → <strong className="text-black">25 pts</strong></span>
        <span className="bg-zinc-100 rounded-full px-3 py-1">🥈 P2 exacto → <strong className="text-black">20 pts</strong></span>
        <span className="bg-zinc-100 rounded-full px-3 py-1">🥉 P3 exacto → <strong className="text-black">16 pts</strong></span>
        <span className="bg-zinc-100 rounded-full px-3 py-1">Máximo carrera → <strong className="text-black">61 pts</strong></span>
      </div>

      {/* Tabla */}
      {jugadores.length === 0 ? (
        <p className="text-zinc-400 text-sm text-center py-8">
          Aún no hay apuestas para esta carrera.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {jugadores.map((j, i) => (
            <div
              key={i}
              className={`rounded-xl border-2 px-5 py-4 ${i === 0 && j.puntos !== null ? "border-red-500 bg-red-50" : "border-zinc-100 bg-white"}`}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl w-8 text-center">
                  {i < 3 ? MEDALLAS[i] : <span className="text-zinc-400 font-bold text-sm">{i + 1}</span>}
                </span>
                <span className="flex-1 font-bold text-black text-lg">{j.nombre}</span>
                <div className="text-right">
                  {j.puntos !== null ? (
                    <p className="font-black text-black text-xl">{j.puntos} pts</p>
                  ) : (
                    <p className="text-zinc-300 text-sm">pendiente</p>
                  )}
                </div>
              </div>
              {/* Apuesta del jugador */}
              <div className="flex gap-3 mt-3 pl-12">
                {j.apuesta.map((num, pos) => {
                  const acierto = resultado && num === [resultado.p1, resultado.p2, resultado.p3][pos];
                  return (
                    <div
                      key={pos}
                      className={`flex flex-col items-center rounded-lg px-3 py-1.5 text-xs ${
                        acierto ? "bg-green-100 text-green-800" : "bg-zinc-50 text-zinc-400"
                      }`}
                    >
                      <span className="font-black">{pos + 1}º</span>
                      <span className="font-medium">{nombrePiloto(num)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
