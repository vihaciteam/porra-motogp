/**
 * Sistema de puntuación oficial de la porra.
 * Solo puntúa la POSICIÓN EXACTA — acertar el piloto en posición errónea = 0 pts.
 */
export const PUNTOS = {
  sabado: {
    pole:    1,
    sprint1: 12,
    sprint2:  9,
    sprint3:  7,
  },
  domingo: {
    carrera1:     25,
    carrera2:     20,
    carrera3:     16,
    vueltaRapida:  1,
  },
  /** Solo activos en GPs con votacionEspecial = true */
  especial: {
    moto3: 10,
    moto2: 10,
  },
} as const;

export const MAX_PUNTOS_SABADO   =  29; // 1+12+9+7
export const MAX_PUNTOS_DOMINGO  =  62; // 25+20+16+1
export const MAX_PUNTOS_NORMAL   =  91; // GP sin votación especial
export const MAX_PUNTOS_ESPECIAL = 111; // GP con Moto3+Moto2

/** Todos los campos de una apuesta o un resultado */
export interface RegistroGP {
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

/** Calcula los puntos totales de un jugador para un GP completo. */
export function calcularPuntos(
  apuesta:          RegistroGP,
  resultado:        RegistroGP,
  votacionEspecial: boolean
): number {
  let pts = 0;

  // Sábado
  if (apuesta.pole        && apuesta.pole        === resultado.pole)        pts += PUNTOS.sabado.pole;
  if (apuesta.sprint_p1   && apuesta.sprint_p1   === resultado.sprint_p1)   pts += PUNTOS.sabado.sprint1;
  if (apuesta.sprint_p2   && apuesta.sprint_p2   === resultado.sprint_p2)   pts += PUNTOS.sabado.sprint2;
  if (apuesta.sprint_p3   && apuesta.sprint_p3   === resultado.sprint_p3)   pts += PUNTOS.sabado.sprint3;

  // Domingo
  if (apuesta.carrera_p1    && apuesta.carrera_p1    === resultado.carrera_p1)    pts += PUNTOS.domingo.carrera1;
  if (apuesta.carrera_p2    && apuesta.carrera_p2    === resultado.carrera_p2)    pts += PUNTOS.domingo.carrera2;
  if (apuesta.carrera_p3    && apuesta.carrera_p3    === resultado.carrera_p3)    pts += PUNTOS.domingo.carrera3;
  if (apuesta.vuelta_rapida && apuesta.vuelta_rapida === resultado.vuelta_rapida) pts += PUNTOS.domingo.vueltaRapida;

  // Especial
  if (votacionEspecial) {
    if (apuesta.moto3_winner && apuesta.moto3_winner === resultado.moto3_winner) pts += PUNTOS.especial.moto3;
    if (apuesta.moto2_winner && apuesta.moto2_winner === resultado.moto2_winner) pts += PUNTOS.especial.moto2;
  }

  return pts;
}

/** La jornada está abierta si aún no se ha llegado a su hora de cierre. */
export function jornadaAbierta(cierre: string | null): boolean {
  if (!cierre) return true;
  return new Date() < new Date(cierre);
}

/** Los votos se revelan 1 minuto DESPUÉS del cierre. */
export function votosRevelados(cierre: string | null): boolean {
  if (!cierre) return false;
  const revelacion = new Date(new Date(cierre).getTime() + 60_000);
  return new Date() >= revelacion;
}
