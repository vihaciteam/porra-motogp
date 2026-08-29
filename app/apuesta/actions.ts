"use server";

import { createClient } from "@/utils/supabase/server";
import { jornadaAbierta } from "@/lib/puntuacion";
import { gpActual } from "@/lib/calendario";

export interface ApuestaPayload {
  pole:          number | null;
  sprint_p1:     number | null;
  sprint_p2:     number | null;
  sprint_p3:     number | null;
  carrera_p1:    number | null;
  carrera_p2:    number | null;
  carrera_p3:    number | null;
  vuelta_rapida: number | null;
  moto3_winner:  string | null;
  moto2_winner:  string | null;
}

export async function guardarApuesta(
  payload: ApuestaPayload
): Promise<{ ok?: true; error?: string }> {
  const GP = gpActual();
  if (!GP) return { error: "No hay GP activo." };

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  // Leer cierres en el servidor — el cliente no puede manipular esto
  const { data: cierres } = await supabase
    .from("cierres")
    .select("cierre_pole, cierre_sabado, cierre_domingo")
    .eq("carrera_id", GP.id)
    .maybeSingle();

  const poleAbierta    = jornadaAbierta(cierres?.cierre_pole    ?? null);
  const sprintAbierto  = jornadaAbierta(cierres?.cierre_sabado  ?? null);
  const domingoAbierto = jornadaAbierta(cierres?.cierre_domingo ?? null);

  if (!poleAbierta && !sprintAbierto && !domingoAbierto) {
    return { error: "La votación está cerrada." };
  }

  // Leer apuesta existente para preservar campos ya cerrados
  const { data: existing } = await supabase
    .from("apuestas")
    .select("*")
    .eq("user_id", user.id)
    .eq("carrera_id", GP.id)
    .maybeSingle();

  // Solo guardamos los campos cuya ventana sigue abierta
  const row: Record<string, unknown> = {
    user_id:    user.id,
    carrera_id: GP.id,
    pole:          poleAbierta    ? payload.pole          : (existing?.pole          ?? null),
    sprint_p1:     sprintAbierto  ? payload.sprint_p1     : (existing?.sprint_p1     ?? null),
    sprint_p2:     sprintAbierto  ? payload.sprint_p2     : (existing?.sprint_p2     ?? null),
    sprint_p3:     sprintAbierto  ? payload.sprint_p3     : (existing?.sprint_p3     ?? null),
    carrera_p1:    domingoAbierto ? payload.carrera_p1    : (existing?.carrera_p1    ?? null),
    carrera_p2:    domingoAbierto ? payload.carrera_p2    : (existing?.carrera_p2    ?? null),
    carrera_p3:    domingoAbierto ? payload.carrera_p3    : (existing?.carrera_p3    ?? null),
    vuelta_rapida: domingoAbierto ? payload.vuelta_rapida : (existing?.vuelta_rapida ?? null),
    moto3_winner:  domingoAbierto ? payload.moto3_winner  : (existing?.moto3_winner  ?? null),
    moto2_winner:  domingoAbierto ? payload.moto2_winner  : (existing?.moto2_winner  ?? null),
  };

  const { error } = await supabase
    .from("apuestas")
    .upsert(row, { onConflict: "user_id,carrera_id" });

  if (error) return { error: "Error al guardar. Inténtalo de nuevo." };
  return { ok: true };
}
