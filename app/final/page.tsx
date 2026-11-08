export const dynamic = "force-dynamic";

import { createClient } from "@/utils/supabase/server";
import { calcularPuntos, type RegistroGP } from "@/lib/puntuacion";
import { CALENDARIO } from "@/lib/calendario";
import CeremoniaFinal from "@/app/components/CeremoniaFinal";

export default async function FinalPage() {
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

  const appPointsByUser = new Map<string, number>();
  for (const res of resultados ?? []) {
    const gpConfig = CALENDARIO.find((gp) => gp.id === res.carrera_id);
    if (gpConfig?.esHistorico) continue;
    const gpApuestas = (apuestas ?? []).filter((a) => a.carrera_id === res.carrera_id);
    for (const apuesta of gpApuestas) {
      const pts = calcularPuntos(
        apuesta as RegistroGP,
        res as RegistroGP,
        gpConfig?.votacionEspecial ?? false
      );
      appPointsByUser.set(apuesta.user_id, (appPointsByUser.get(apuesta.user_id) ?? 0) + pts);
    }
  }

  const standings: { nombre: string; avatarUrl: string | null; total: number }[] = [];
  const processed = new Set<string>();

  for (const h of historial ?? []) {
    const perfil = perfiles?.find((p) => p.id === h.user_id);
    const nombre = h.user_id ? (perfil?.nombre ?? h.nombre) : h.nombre;
    const ptsApp = h.user_id ? (appPointsByUser.get(h.user_id) ?? 0) : 0;
    standings.push({ nombre, avatarUrl: perfil?.avatar_url ?? null, total: h.puntos + ptsApp });
    if (h.user_id) processed.add(h.user_id);
  }

  for (const [userId, appPts] of appPointsByUser) {
    if (!processed.has(userId)) {
      const perfil = perfiles?.find((p) => p.id === userId);
      if (perfil) standings.push({ nombre: perfil.nombre, avatarUrl: perfil.avatar_url ?? null, total: appPts });
    }
  }

  standings.sort((a, b) => b.total - a.total);

  return <CeremoniaFinal jugadores={standings} />;
}
