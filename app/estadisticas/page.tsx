import { createClient } from "@/utils/supabase/server";
import { calcularPuntos, PUNTOS, type RegistroGP } from "@/lib/puntuacion";
import { CALENDARIO } from "@/lib/calendario";
import { nombrePiloto } from "@/lib/pilotos";
import { Avatar } from "@/app/components/Avatar";

const MEDALLAS = ["🥇", "🥈", "🥉"];

interface EstadJugador {
  nombre:    string;
  user_id:   string | null;
  avatarUrl: string | null;
  total:     number;
  historico: number;
  app:       number;
  aciertos:  number;          // picks exactos en GPs de la app
  mejorGP:   number;          // puntos en su mejor GP de la app
  mejorGPNombre: string | null;
}

export default async function EstadisticasPage() {
  const supabase = await createClient();

  const [
    { data: historial },
    { data: resultados },
    { data: apuestas },
    { data: perfiles },
  ] = await Promise.all([
    supabase.from("historial_puntos").select("id, nombre, user_id, puntos"),
    supabase.from("resultados").select("*"),
    supabase.from("apuestas").select("*"),
    supabase.from("perfiles").select("id, nombre, avatar_url"),
  ]);

  // ── Calcular estadísticas por jugador ─────────────────────────────
  const stats: EstadJugador[] = [];
  const processedIds = new Set<string>();

  for (const h of historial ?? []) {
    const perfil   = perfiles?.find((p) => p.id === h.user_id);
    const nombre   = h.user_id ? (perfil?.nombre ?? h.nombre) : h.nombre;
    const misApuestas = (apuestas ?? []).filter((a) => a.user_id === h.user_id);

    let appPts = 0;
    let aciertos = 0;
    let mejorGP = 0;
    let mejorGPNombre: string | null = null;

    for (const res of resultados ?? []) {
      const gpConfig = CALENDARIO.find((gp) => gp.id === res.carrera_id);
      if (gpConfig?.esHistorico) continue;

      const apuesta = misApuestas.find((a) => a.carrera_id === res.carrera_id);
      if (!apuesta) continue;

      const pts = calcularPuntos(apuesta as RegistroGP, res as RegistroGP, gpConfig?.votacionEspecial ?? false);
      appPts += pts;

      // Contar aciertos campo a campo
      const campos: (keyof RegistroGP)[] = [
        "pole","sprint_p1","sprint_p2","sprint_p3",
        "carrera_p1","carrera_p2","carrera_p3","vuelta_rapida",
      ];
      for (const campo of campos) {
        if (apuesta[campo] && apuesta[campo] === res[campo]) aciertos++;
      }
      if (gpConfig?.votacionEspecial) {
        if (apuesta.moto3_winner && apuesta.moto3_winner === res.moto3_winner) aciertos++;
        if (apuesta.moto2_winner && apuesta.moto2_winner === res.moto2_winner) aciertos++;
      }

      if (pts > mejorGP) {
        mejorGP = pts;
        mejorGPNombre = gpConfig?.nombre ?? null;
      }
    }

    stats.push({
      nombre,
      user_id:   h.user_id,
      avatarUrl: perfil?.avatar_url ?? null,
      total:     h.puntos + appPts,
      historico: h.puntos,
      app:       appPts,
      aciertos,
      mejorGP,
      mejorGPNombre,
    });

    if (h.user_id) processedIds.add(h.user_id);
  }

  stats.sort((a, b) => b.total - a.total);

  const gpsApp = (resultados ?? []).filter(
    (r) => !CALENDARIO.find((gp) => gp.id === r.carrera_id)?.esHistorico
  ).length;

  const hayDatosApp = gpsApp > 0;

  return (
    <div className="flex flex-col flex-1 max-w-3xl mx-auto w-full">

      <div className="bg-black text-white px-4 py-8 sm:px-6">
        <span className="text-red-500 text-xs font-black uppercase tracking-[0.25em]">Temporada 2026</span>
        <h1 className="text-3xl sm:text-4xl font-black mt-1">Estadísticas</h1>
        <p className="text-zinc-500 text-sm mt-1">
          {gpsApp > 0
            ? `${gpsApp} GP${gpsApp !== 1 ? "s" : ""} disputados en la app`
            : "La temporada de la app aún no ha comenzado"}
        </p>
      </div>

      <div className="px-4 sm:px-6 py-6 flex flex-col gap-6">

        {/* Podio top 3 */}
        {stats.length >= 3 && (
          <div className="grid grid-cols-3 gap-2">
            {[stats[1], stats[0], stats[2]].map((j, col) => {
              const pos = col === 0 ? 1 : col === 1 ? 0 : 2; // posición real (0-indexed)
              const colores = [
                "bg-zinc-100 text-zinc-700",
                "bg-yellow-400 text-black",
                "bg-amber-500 text-white",
              ];
              return (
                <div
                  key={j.nombre}
                  className={`rounded-2xl p-3 flex flex-col items-center gap-2 ${
                    pos === 0 ? "ring-2 ring-yellow-400 shadow-lg shadow-yellow-100" : ""
                  } bg-white border-2 border-zinc-100`}
                >
                  <span className={`text-xs font-black px-2 py-0.5 rounded-full ${colores[pos]}`}>
                    {MEDALLAS[pos]} {pos + 1}º
                  </span>
                  <Avatar nombre={j.nombre} avatarUrl={j.avatarUrl} size={pos === 0 ? 52 : 44} />
                  <p className="font-black text-black text-sm text-center leading-tight truncate w-full text-center">
                    {j.nombre}
                  </p>
                  <p className={`font-black tabular-nums ${pos === 0 ? "text-2xl" : "text-xl"} text-black`}>
                    {j.total}
                  </p>
                  <p className="text-xs text-zinc-400">pts totales</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Tabla completa */}
        <section className="bg-white rounded-2xl border-2 border-zinc-100 overflow-hidden">
          <div className="px-5 py-3 border-b-2 border-zinc-100 bg-zinc-50">
            <p className="text-xs font-black uppercase tracking-widest text-zinc-400">
              Clasificación completa
            </p>
          </div>
          <div className="divide-y divide-zinc-100">
            {stats.map((j, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                <span className={`w-6 text-center font-black text-sm ${
                  i < 3 ? ["text-yellow-500","text-zinc-400","text-amber-600"][i] : "text-zinc-300"
                }`}>
                  {i < 3 ? MEDALLAS[i] : `${i + 1}`}
                </span>
                <Avatar nombre={j.nombre} avatarUrl={j.avatarUrl} size={36} />
                <span className="flex-1 font-bold text-black text-sm truncate">{j.nombre}</span>

                <div className="flex items-center gap-2 text-xs shrink-0">
                  <span className="bg-zinc-100 text-zinc-500 rounded-md px-2 py-1 tabular-nums font-semibold">
                    {j.historico}
                  </span>
                  {j.app > 0 && (
                    <>
                      <span className="text-zinc-300">+</span>
                      <span className="bg-red-100 text-red-700 rounded-md px-2 py-1 tabular-nums font-semibold">
                        {j.app}
                      </span>
                    </>
                  )}
                </div>

                <span className="font-black text-black tabular-nums text-lg w-10 text-right shrink-0">
                  {j.total}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Stats de la app (solo si hay GPs jugados) */}
        {hayDatosApp && (
          <section className="flex flex-col gap-3">
            <p className="text-xs font-black uppercase tracking-widest text-zinc-400 px-1">
              Rendimiento en la app
            </p>
            {stats
              .filter((j) => j.user_id)
              .map((j, i) => (
                <div key={i} className="bg-white rounded-2xl border-2 border-zinc-100 px-5 py-4 flex items-center gap-4">
                  <Avatar nombre={j.nombre} avatarUrl={j.avatarUrl} size={40} />
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-black text-sm">{j.nombre}</p>
                    {j.mejorGPNombre && (
                      <p className="text-xs text-zinc-400 truncate">
                        Mejor GP: {j.mejorGPNombre}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3 text-center shrink-0">
                    <div>
                      <p className="font-black text-black text-lg tabular-nums">{j.aciertos}</p>
                      <p className="text-[10px] text-zinc-400 font-medium">aciertos</p>
                    </div>
                    <div className="w-px bg-zinc-100" />
                    <div>
                      <p className="font-black text-red-600 text-lg tabular-nums">{j.mejorGP}</p>
                      <p className="text-[10px] text-zinc-400 font-medium">mejor GP</p>
                    </div>
                  </div>
                </div>
              ))}
          </section>
        )}

        {!hayDatosApp && (
          <div className="border-2 border-dashed border-zinc-200 rounded-2xl px-6 py-12 text-center text-zinc-400 flex flex-col items-center gap-3">
            <span className="text-5xl">📊</span>
            <p className="font-bold text-black">Aún no hay GPs en la app</p>
            <p className="text-sm">Las estadísticas de aciertos y mejor GP aparecerán aquí cuando se disputen los primeros GPs de la temporada.</p>
          </div>
        )}

      </div>
    </div>
  );
}
