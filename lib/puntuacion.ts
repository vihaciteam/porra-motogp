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
    if (mismoGanador(apuesta.moto3_winner, resultado.moto3_winner)) pts += PUNTOS.especial.moto3;
    if (mismoGanador(apuesta.moto2_winner, resultado.moto2_winner)) pts += PUNTOS.especial.moto2;
  }

  return pts;
}

/**
 * Compara dos nombres de piloto de forma tolerante.
 * Extrae solo las secuencias de letras (ignora puntos, espacios, caracteres
 * invisibles, acentos…) y acepta abreviaciones ("M" == "Maximo").
 */
export function mismoGanador(a: string | null, b: string | null): boolean {
  if (!a || !b) return false;

  const tokens = (s: string): string[] => {
    const sinAcentos = s.normalize("NFD").replace(/[̀-ͯ]/g, "");
    return (sinAcentos.toLowerCase().match(/[a-z]+/g) ?? []);
  };

  const ta = tokens(a);
  const tb = tokens(b);

  if (ta.length === 0 || tb.length === 0) return false;
  if (ta.join(" ") === tb.join(" ")) return true;
  if (ta.length !== tb.length) return false;

  return ta.every((wa, i) => {
    const wb = tb[i];
    return wa === wb ||
      (wa.length === 1 && wb.startsWith(wa)) ||
      (wb.length === 1 && wa.startsWith(wb));
  });
}

/** La jornada está abierta si aún no se ha llegado a su hora de cierre. */
export function jornadaAbierta(cierre: string | null): boolean {
  if (!cierre) return false;
  return new Date() < new Date(cierre);
}

/** Los votos se revelan 1 minuto DESPUÉS del cierre. */
export function votosRevelados(cierre: string | null): boolean {
  if (!cierre) return false;
  const revelacion = new Date(new Date(cierre).getTime() + 60_000);
  return new Date() >= revelacion;
}
