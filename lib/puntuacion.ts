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

// Máximos por jornada
export const MAX_PUNTOS_SABADO   =  29; // 1+12+9+7
export const MAX_PUNTOS_DOMINGO  =  62; // 25+20+16+1
export const MAX_PUNTOS_NORMAL   =  91; // GP sin votación especial
export const MAX_PUNTOS_ESPECIAL = 111; // GP con Moto3+Moto2

/**
 * Devuelve true si la jornada sigue ABIERTA (aún no ha llegado la hora de cierre).
 * Si no hay hora asignada (null), se considera abierta.
 */
export function jornadaAbierta(cierre: string | null): boolean {
  if (!cierre) return true;
  return new Date() < new Date(cierre);
}

/**
 * Los votos se revelan 1 minuto DESPUÉS del cierre.
 * Cierre a T-60min de la carrera → revelación a T-59min.
 */
export function votosRevelados(cierre: string | null): boolean {
  if (!cierre) return false;
  const revelacion = new Date(new Date(cierre).getTime() + 60_000); // +1 minuto
  return new Date() >= revelacion;
}

/**
 * Calcula los puntos del domingo (carrera principal) para un jugador.
 * Solo cuenta posición exacta.
 */
export function calcularPuntosCarrera(
  apuesta:   { p1: number; p2: number; p3: number },
  resultado: { p1: number; p2: number; p3: number }
): number {
  let pts = 0;
  if (apuesta.p1 === resultado.p1) pts += PUNTOS.domingo.carrera1;
  if (apuesta.p2 === resultado.p2) pts += PUNTOS.domingo.carrera2;
  if (apuesta.p3 === resultado.p3) pts += PUNTOS.domingo.carrera3;
  return pts;
}
