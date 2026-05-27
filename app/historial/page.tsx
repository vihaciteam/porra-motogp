import { createClient } from "@/utils/supabase/server";
import { nombrePiloto } from "@/lib/pilotos";
import { calcularPuntos, PUNTOS, type RegistroGP } from "@/lib/puntuacion";
import { CALENDARIO } from "@/lib/calendario";
import { Avatar } from "@/app/components/Avatar";

const MEDALLAS = ["🥇", "🥈", "🥉"];

function formatFecha(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("es-ES", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function Chip({
  label, valor, acierto, pts,
}: {
  label: string; valor: string | null; acierto?: boolean; pts?: number;
}) {
  if (!valor) return null;
  return (
    <span className={`text-xs rounded-lg px-2 py-0.5 font-medium inline-flex items-center gap-1 ${
      acierto ? "bg-green-100 text-green-800" : "bg-zinc-100 text-zinc-500"
    }`}>
      {acierto && <span>✅</span>}
      {label}: {valor}
      {acierto && pts !== undefined && (
        <span className="font-black">+{pts}pts</span>
      )}
    </span>
  );
}

export default async function HistorialPage() {
  const hoy = new Date().toISOString().slice(0, 10);
  const pasados = CALENDARIO
    .filter((gp) => gp.fechaCarrera < hoy)
    .reverse(); // más reciente primero

  if (pasados.length === 0) {
    return (
      <div className="flex flex-col flex-1 max-w-3xl mx-auto w-full">
        <div className="bg-black text-white px-4 py-8 sm:px-6">
          <span className="text-red-500 text-xs font-black uppercase tracking-[0.25em]">Temporada 2026</span>
          <h1 className="text-3xl sm:text-4xl font-black mt-1">Historial de GPs</h1>
          <p className="text-zinc-500 text-sm mt-1">Los resultados aparecerán aquí</p>
        </div>
        <div className="px-4 sm:px-6 py-10">
          <div className="border-2 border-dashed border-zinc-200 rounded-2xl px-6 py-16 text-center text-zinc-400 flex flex-col items-center gap-3">
            <span className="text-5xl">🏁</span>
            <p className="font-bold text-black">Aún no hay GPs completados</p>
            <p className="text-sm">
              El historial se irá llenando a medida que avance la temporada.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const carreraIds = pasados.map((gp) => gp.id);

  const [{ data: resultados }, { data: apuestas }, { data: perfiles }] = await Promise.all([
    supabase.from("resultados").select("*").in("carrera_id", carreraIds),
    supabase.from("apuestas").select("*").in("carrera_id", carreraIds),
    supabase.from("perfiles").select("id, nombre, avatar_url"),
  ]);

  return (
    <div className="flex flex-col flex-1 max-w-3xl mx-auto w-full">

      <div className="bg-black text-white px-4 py-8 sm:px-6">
        <span className="text-red-500 text-xs font-black uppercase tracking-[0.25em]">Temporada 2026</span>
        <h1 className="text-3xl sm:text-4xl font-black mt-1">Historial de GPs</h1>
        <p className="text-zinc-500 text-sm mt-1">
          {pasados.length} GP{pasados.length !== 1 ? "s" : ""} disputados
        </p>
      </div>

      <div className="px-4 sm:px-6 py-6 flex flex-col gap-3">
      {pasados.map((gp) => {
        const res = (resultados ?? []).find(
          (r) => r.carrera_id === gp.id
        ) as RegistroGP | undefined;

        const gpApuestas = (apuestas ?? []).filter(
          (a) => a.carrera_id === gp.id
        );

        const jugadores = gpApuestas
          .map((a) => {
            const perfil = perfiles?.find((p) => p.id === a.user_id);
            return {
              nombre:    perfil?.nombre    ?? "Jugador",
              avatarUrl: perfil?.avatar_url ?? null,
              puntos: res
                ? calcularPuntos(a as RegistroGP, res, gp.votacionEspecial)
                : null,
              apuesta: a as RegistroGP,
            };
          })
          .sort((a, b) => (b.puntos ?? -1) - (a.puntos ?? -1));

        return (
          <details
            key={gp.id}
            className="group border-2 border-zinc-100 rounded-2xl overflow-hidden bg-white"
          >
            {/* Cabecera clicable */}
            <summary className="flex items-center gap-4 px-5 py-4 cursor-pointer list-none hover:bg-zinc-50 transition-colors select-none">
              <div className="flex-1 min-w-0">
                <p className="font-black text-black text-lg leading-tight">{gp.nombre}</p>
                <p className="text-zinc-400 text-sm">
                  {gp.circuito} · {formatFecha(gp.fechaCarrera)}
                </p>
              </div>

              {res ? (
                <span className="shrink-0 text-xs font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                  ✅ Resultado
                </span>
              ) : (
                <span className="shrink-0 text-xs font-bold bg-zinc-100 text-zinc-400 px-2.5 py-1 rounded-full">
                  Pendiente
                </span>
              )}

              <span className="shrink-0 text-zinc-300 text-sm transition-transform duration-200 group-open:rotate-180">
                ▼
              </span>
            </summary>

            {/* Contenido desplegable */}
            <div className="px-5 pb-6 flex flex-col gap-5 border-t-2 border-zinc-100 pt-4">

              {/* Resultado oficial */}
              {res ? (
                <div className="bg-black text-white rounded-2xl px-5 py-4 flex flex-col gap-3">
                  <p className="text-zinc-400 text-xs uppercase tracking-widest font-bold">
                    Resultado oficial
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex flex-col gap-1.5">
                      <p className="text-zinc-500 text-xs font-bold uppercase">Sábado</p>
                      {res.pole      && <p>🏁 Pole: <strong>{nombrePiloto(res.pole)}</strong></p>}
                      {res.sprint_p1 && <p>🥇 Sprint: <strong>{nombrePiloto(res.sprint_p1)}</strong></p>}
                      {res.sprint_p2 && <p>🥈 Sprint: <strong>{nombrePiloto(res.sprint_p2)}</strong></p>}
                      {res.sprint_p3 && <p>🥉 Sprint: <strong>{nombrePiloto(res.sprint_p3)}</strong></p>}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <p className="text-zinc-500 text-xs font-bold uppercase">Domingo</p>
                      {res.carrera_p1    && <p>🥇 Carrera: <strong>{nombrePiloto(res.carrera_p1)}</strong></p>}
                      {res.carrera_p2    && <p>🥈 Carrera: <strong>{nombrePiloto(res.carrera_p2)}</strong></p>}
                      {res.carrera_p3    && <p>🥉 Carrera: <strong>{nombrePiloto(res.carrera_p3)}</strong></p>}
                      {res.vuelta_rapida && <p>⚡ V.R.: <strong>{nombrePiloto(res.vuelta_rapida)}</strong></p>}
                      {gp.votacionEspecial && res.moto3_winner && <p>🏍️ Moto3: <strong>{res.moto3_winner}</strong></p>}
                      {gp.votacionEspecial && res.moto2_winner && <p>🏍️ Moto2: <strong>{res.moto2_winner}</strong></p>}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-zinc-200 rounded-xl px-4 py-3 text-zinc-400 text-sm text-center">
                  Resultado pendiente de registrar
                </div>
              )}

              {/* Apuestas de los jugadores */}
              {jugadores.length === 0 ? (
                <p className="text-zinc-400 text-sm text-center py-3">
                  Sin apuestas registradas para este GP.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {jugadores.map((j, i) => (
                    <div
                      key={i}
                      className={`rounded-xl border-2 px-4 py-3 flex flex-col gap-2 ${
                        i === 0 && j.puntos !== null
                          ? "border-red-400 bg-red-50"
                          : "border-zinc-100 bg-zinc-50"
                      }`}
                    >
                      {/* Fila superior: posición, avatar, nombre, puntos */}
                      <div className="flex items-center gap-2">
                        <span className="text-lg w-5 text-center shrink-0">
                          {i < 3
                            ? MEDALLAS[i]
                            : <span className="text-zinc-400 font-bold text-xs">{i + 1}</span>
                          }
                        </span>
                        <Avatar nombre={j.nombre} avatarUrl={j.avatarUrl} size={30} />
                        <span className="flex-1 font-bold text-black text-sm">{j.nombre}</span>
                        {j.puntos !== null
                          ? <span className="font-black text-black text-lg">{j.puntos} pts</span>
                          : <span className="text-zinc-300 text-xs">pendiente</span>
                        }
                      </div>

                      {/* Chips de picks */}
                      <div className="flex flex-wrap gap-1.5 pl-7">
                        <Chip label="🏁" valor={j.apuesta.pole ? nombrePiloto(j.apuesta.pole) : null}
                          acierto={!!res && j.apuesta.pole === res.pole}
                          pts={PUNTOS.sabado.pole} />
                        <Chip label="S🥇" valor={j.apuesta.sprint_p1 ? nombrePiloto(j.apuesta.sprint_p1) : null}
                          acierto={!!res && j.apuesta.sprint_p1 === res.sprint_p1}
                          pts={PUNTOS.sabado.sprint1} />
                        <Chip label="S🥈" valor={j.apuesta.sprint_p2 ? nombrePiloto(j.apuesta.sprint_p2) : null}
                          acierto={!!res && j.apuesta.sprint_p2 === res.sprint_p2}
                          pts={PUNTOS.sabado.sprint2} />
                        <Chip label="S🥉" valor={j.apuesta.sprint_p3 ? nombrePiloto(j.apuesta.sprint_p3) : null}
                          acierto={!!res && j.apuesta.sprint_p3 === res.sprint_p3}
                          pts={PUNTOS.sabado.sprint3} />
                        <Chip label="C🥇" valor={j.apuesta.carrera_p1 ? nombrePiloto(j.apuesta.carrera_p1) : null}
                          acierto={!!res && j.apuesta.carrera_p1 === res.carrera_p1}
                          pts={PUNTOS.domingo.carrera1} />
                        <Chip label="C🥈" valor={j.apuesta.carrera_p2 ? nombrePiloto(j.apuesta.carrera_p2) : null}
                          acierto={!!res && j.apuesta.carrera_p2 === res.carrera_p2}
                          pts={PUNTOS.domingo.carrera2} />
                        <Chip label="C🥉" valor={j.apuesta.carrera_p3 ? nombrePiloto(j.apuesta.carrera_p3) : null}
                          acierto={!!res && j.apuesta.carrera_p3 === res.carrera_p3}
                          pts={PUNTOS.domingo.carrera3} />
                        <Chip label="⚡" valor={j.apuesta.vuelta_rapida ? nombrePiloto(j.apuesta.vuelta_rapida) : null}
                          acierto={!!res && j.apuesta.vuelta_rapida === res.vuelta_rapida}
                          pts={PUNTOS.domingo.vueltaRapida} />
                        {gp.votacionEspecial && (
                          <>
                            <Chip label="Moto3" valor={j.apuesta.moto3_winner}
                              acierto={!!res && j.apuesta.moto3_winner === res.moto3_winner}
                              pts={PUNTOS.especial.moto3} />
                            <Chip label="Moto2" valor={j.apuesta.moto2_winner}
                              acierto={!!res && j.apuesta.moto2_winner === res.moto2_winner}
                              pts={PUNTOS.especial.moto2} />
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </details>
        );
      })}
      </div>
    </div>
  );
}
