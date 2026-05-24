import { createClient } from "@/utils/supabase/server";
import { calcularPuntos, type RegistroGP } from "@/lib/puntuacion";
import { CALENDARIO } from "@/lib/calendario";
import { Avatar } from "@/app/components/Avatar";

const MEDALLAS = ["🥇", "🥈", "🥉"];

interface Jugador {
  nombre: string;
  user_id: string | null;
  avatar_url: string | null;
  puntos_historicos: number;
  puntos_app: number;
  total: number;
}

export default async function GeneralPage() {
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

  // ── Calcular puntos en la app por usuario ──────────────────────────────
  const appPointsByUser = new Map<string, number>();

  for (const res of resultados ?? []) {
    const gpConfig = CALENDARIO.find((gp) => gp.id === res.carrera_id);
    const votacionEspecial = gpConfig?.votacionEspecial ?? false;

    const gpApuestas = (apuestas ?? []).filter(
      (a) => a.carrera_id === res.carrera_id
    );
    for (const apuesta of gpApuestas) {
      const pts = calcularPuntos(
        apuesta as RegistroGP,
        res as RegistroGP,
        votacionEspecial
      );
      appPointsByUser.set(
        apuesta.user_id,
        (appPointsByUser.get(apuesta.user_id) ?? 0) + pts
      );
    }
  }

  // ── Construir la clasificación ─────────────────────────────────────────
  const standings: Jugador[] = [];
  const processedUserIds = new Set<string>();

  // 1. Jugadores con historial (del Excel)
  for (const h of historial ?? []) {
    const perfil = perfiles?.find((p) => p.id === h.user_id);
    const nombre = h.user_id ? (perfil?.nombre ?? h.nombre) : h.nombre;
    const puntos_app = h.user_id ? (appPointsByUser.get(h.user_id) ?? 0) : 0;

    standings.push({
      nombre,
      user_id:   h.user_id,
      avatar_url: perfil?.avatar_url ?? null,
      puntos_historicos: h.puntos,
      puntos_app,
      total: h.puntos + puntos_app,
    });

    if (h.user_id) processedUserIds.add(h.user_id);
  }

  // 2. Usuarios registrados en la app que no tienen historial aún
  for (const [userId, appPts] of appPointsByUser) {
    if (!processedUserIds.has(userId)) {
      const perfil = perfiles?.find((p) => p.id === userId);
      if (perfil) {
        standings.push({
          nombre:    perfil.nombre,
          user_id:   userId,
          avatar_url: perfil.avatar_url ?? null,
          puntos_historicos: 0,
          puntos_app: appPts,
          total: appPts,
        });
      }
    }
  }

  // Ordenar por total
  standings.sort((a, b) => b.total - a.total);

  const gpsEnApp = resultados?.length ?? 0;
  const gpsHistoricos = 6; // Tailandia, Brasil, USA, España, Francia, Cataluña

  const podiumCard = [
    "border-yellow-400 bg-gradient-to-r from-yellow-50 to-white shadow-md shadow-yellow-100",
    "border-zinc-300 bg-gradient-to-r from-zinc-50 to-white shadow-sm",
    "border-amber-500 bg-gradient-to-r from-amber-50 to-white shadow-sm",
  ];
  const podiumPos = [
    "bg-yellow-400 text-black",
    "bg-zinc-300 text-black",
    "bg-amber-500 text-white",
  ];

  return (
    <div className="flex flex-col flex-1 max-w-3xl mx-auto w-full">

      {/* Cabecera oscura estilo MotoGP */}
      <div className="bg-black text-white px-4 py-8 sm:px-6">
        <span className="text-red-500 text-xs font-black uppercase tracking-[0.25em]">
          Temporada 2026
        </span>
        <h1 className="text-3xl sm:text-4xl font-black mt-1">Clasificación General</h1>
        <p className="text-zinc-500 text-sm mt-1">
          {gpsHistoricos} GPs previos · {gpsEnApp} GP{gpsEnApp !== 1 ? "s" : ""} en la app
        </p>
        <div className="flex flex-wrap gap-2 mt-4 text-xs">
          <span className="bg-zinc-800 text-zinc-300 rounded-full px-3 py-1 font-medium border border-zinc-700">
            ⚫ Puntos previos
          </span>
          {gpsEnApp > 0 && (
            <span className="bg-red-900/50 text-red-400 rounded-full px-3 py-1 font-medium border border-red-800">
              🔴 Puntos en la app
            </span>
          )}
        </div>
      </div>

      {/* Clasificación */}
      <div className="px-4 sm:px-6 py-6">
        {standings.length === 0 ? (
          <p className="text-zinc-400 text-sm text-center py-8">No hay datos disponibles.</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {standings.map((j, i) => {
              const lider = standings[0].total;
              const diferencia = lider - j.total;
              const esPodio = i < 3;
              return (
                <div
                  key={i}
                  className={`rounded-2xl border-2 px-4 py-3.5 flex items-center gap-3 transition-all ${
                    esPodio ? podiumCard[i] : "border-zinc-100 bg-white hover:border-zinc-200 hover:shadow-sm"
                  }`}
                >
                  {/* Posición */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-black text-sm ${
                    esPodio ? podiumPos[i] : "bg-zinc-100 text-zinc-500"
                  }`}>
                    {i + 1}
                  </div>

                  {/* Avatar */}
                  <Avatar nombre={j.nombre} avatarUrl={j.avatar_url} size={42} />

                  {/* Nombre + diferencia */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-black leading-tight truncate ${i === 0 ? "text-lg" : "text-base text-black"}`}>
                      {j.nombre}
                    </p>
                    {i > 0 && (
                      <p className="text-xs text-zinc-400 tabular-nums">
                        − {diferencia} pts
                      </p>
                    )}
                    {i === 0 && (
                      <p className="text-xs text-yellow-600 font-bold">LÍDER</p>
                    )}
                  </div>

                  {/* Desglose */}
                  <div className="flex items-center gap-1 text-xs shrink-0">
                    <span className="bg-zinc-100 text-zinc-600 rounded-md px-2 py-1 font-semibold tabular-nums">
                      {j.puntos_historicos}
                    </span>
                    {j.puntos_app > 0 && (
                      <>
                        <span className="text-zinc-300">+</span>
                        <span className="bg-red-100 text-red-700 rounded-md px-2 py-1 font-semibold tabular-nums">
                          {j.puntos_app}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Total */}
                  <span className={`font-black tabular-nums shrink-0 ${i === 0 ? "text-2xl text-black" : "text-xl text-black"}`}>
                    {j.total}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-xs text-zinc-400 text-center mt-6 pb-4">
          Puntos grises: antes de la app · Puntos rojos: desde la app
        </p>
      </div>
    </div>
  );
}
