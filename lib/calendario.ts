import type { GranPremio } from "./tipos";

/**
 * Calendario 2026 — GPs que quedan por disputar.
 *
 * Para fijar la hora de cierre de un GP (ejemplo Austria):
 *   cierreSabado:  "2026-09-19T13:00:00"   → cierra 1h antes del Sprint del sábado
 *   cierreDomingo: "2026-09-20T13:00:00"   → cierra 1h antes de la Carrera del domingo
 *
 * Deja el valor null mientras no sepas la hora exacta.
 */
export const CALENDARIO: GranPremio[] = [
  // ── GPs HISTÓRICOS (antes de la app) ─────────────────────────────────────
  // Sus puntos ya están en historial_puntos; esHistorico:true los excluye
  // del cálculo de puntos_app en la clasificación general.
  {
    id: "tailandia-2026",
    nombre: "GP de Tailandia",
    circuito: "Chang International Circuit",
    fechaSprint:  "2026-03-01",
    fechaCarrera: "2026-03-02",
    votacionEspecial: false,
    esHistorico: true,
    cierreSabado:  null,
    cierreDomingo: null,
  },
  {
    id: "brasil-2026",
    nombre: "GP de Brasil",
    circuito: "Autódromo Internacional de Goiânia",
    fechaSprint:  "2026-03-15",
    fechaCarrera: "2026-03-16",
    votacionEspecial: true,
    esHistorico: true,
    cierreSabado:  null,
    cierreDomingo: null,
  },
  {
    id: "usa-2026",
    nombre: "GP de las Américas",
    circuito: "Circuit of the Americas",
    fechaSprint:  "2026-04-12",
    fechaCarrera: "2026-04-13",
    votacionEspecial: false,
    esHistorico: true,
    cierreSabado:  null,
    cierreDomingo: null,
  },
  {
    id: "espana-2026",
    nombre: "GP de España",
    circuito: "Circuito de Jerez",
    fechaSprint:  "2026-04-26",
    fechaCarrera: "2026-04-27",
    votacionEspecial: false,
    esHistorico: true,
    cierreSabado:  null,
    cierreDomingo: null,
  },
  {
    id: "francia-2026",
    nombre: "GP de Francia",
    circuito: "Circuit Bugatti (Le Mans)",
    fechaSprint:  "2026-05-10",
    fechaCarrera: "2026-05-11",
    votacionEspecial: false,
    esHistorico: true,
    cierreSabado:  null,
    cierreDomingo: null,
  },
  {
    id: "cataluna-2026",
    nombre: "GP de Cataluña",
    circuito: "Circuit de Barcelona-Catalunya",
    fechaSprint:  "2026-05-17",
    fechaCarrera: "2026-05-18",
    votacionEspecial: true,
    esHistorico: true,
    cierreSabado:  null,
    cierreDomingo: null,
  },
  // ── GPs EN LA APP ─────────────────────────────────────────────────────────
  {
    id: "italia-2026",
    nombre: "GP de Italia",
    circuito: "Mugello",
    fechaSprint:  "2026-05-30",
    fechaCarrera: "2026-05-31",
    votacionEspecial: false,
    cierreSabado:  null,
    cierreDomingo: null,
  },
  {
    id: "hungria-2026",
    nombre: "GP de Hungría",
    circuito: "Balaton Park Circuit",
    fechaSprint:  "2026-06-06",
    fechaCarrera: "2026-06-07",
    votacionEspecial: false,
    cierreSabado:  null,
    cierreDomingo: null,
  },
  {
    id: "republica-checa-2026",
    nombre: "GP de la República Checa",
    circuito: "Automotodrom Brno",
    fechaSprint:  "2026-06-20",
    fechaCarrera: "2026-06-21",
    votacionEspecial: false,
    cierreSabado:  null,
    cierreDomingo: null,
  },
  {
    id: "paises-bajos-2026",
    nombre: "GP de los Países Bajos",
    circuito: "TT Circuit Assen",
    fechaSprint:  "2026-06-27",
    fechaCarrera: "2026-06-28",
    votacionEspecial: false,
    cierreSabado:  null,
    cierreDomingo: null,
  },
  {
    id: "alemania-2026",
    nombre: "GP de Alemania",
    circuito: "Sachsenring",
    fechaSprint:  "2026-07-11",
    fechaCarrera: "2026-07-12",
    votacionEspecial: false,
    cierreSabado:  null,
    cierreDomingo: null,
  },
  {
    id: "gran-bretana-2026",
    nombre: "GP de Gran Bretaña",
    circuito: "Silverstone Circuit",
    fechaSprint:  "2026-08-08",
    fechaCarrera: "2026-08-09",
    votacionEspecial: false,
    cierreSabado:  null,
    cierreDomingo: null,
  },
  {
    id: "aragon-2026",
    nombre: "GP de Aragón",
    circuito: "MotorLand Aragón",
    fechaSprint:  "2026-08-29",
    fechaCarrera: "2026-08-30",
    votacionEspecial: false,
    cierreSabado:  null,
    cierreDomingo: null,
  },
  {
    id: "san-marino-2026",
    nombre: "GP de San Marino",
    circuito: "Misano World Circuit",
    fechaSprint:  "2026-09-12",
    fechaCarrera: "2026-09-13",
    votacionEspecial: false,
    cierreSabado:  null,
    cierreDomingo: null,
  },
  {
    id: "austria-2026",
    nombre: "GP de Austria",
    circuito: "Red Bull Ring",
    fechaSprint:  "2026-09-19",
    fechaCarrera: "2026-09-20",
    votacionEspecial: true, // ← ÚNICO GP CON MOTO3 + MOTO2 ACTIVADOS
    cierreSabado:  null,    // ejemplo: "2026-09-19T13:00:00"
    cierreDomingo: null,    // ejemplo: "2026-09-20T13:00:00"
  },
  {
    id: "japon-2026",
    nombre: "GP de Japón",
    circuito: "Twin Ring Motegi",
    fechaSprint:  "2026-10-03",
    fechaCarrera: "2026-10-04",
    votacionEspecial: false,
    cierreSabado:  null,
    cierreDomingo: null,
  },
  {
    id: "indonesia-2026",
    nombre: "GP de Indonesia",
    circuito: "Pertamina Mandalika Circuit",
    fechaSprint:  "2026-10-10",
    fechaCarrera: "2026-10-11",
    votacionEspecial: false,
    cierreSabado:  null,
    cierreDomingo: null,
  },
  {
    id: "australia-2026",
    nombre: "GP de Australia",
    circuito: "Phillip Island Circuit",
    fechaSprint:  "2026-10-24",
    fechaCarrera: "2026-10-25",
    votacionEspecial: false,
    cierreSabado:  null,
    cierreDomingo: null,
  },
  {
    id: "malasia-2026",
    nombre: "GP de Malasia",
    circuito: "Sepang International Circuit",
    fechaSprint:  "2026-10-31",
    fechaCarrera: "2026-11-01",
    votacionEspecial: false,
    cierreSabado:  null,
    cierreDomingo: null,
  },
  {
    id: "catar-2026",
    nombre: "GP de Catar",
    circuito: "Losail International Circuit",
    fechaSprint:  "2026-11-07",
    fechaCarrera: "2026-11-08",
    votacionEspecial: false,
    cierreSabado:  null,
    cierreDomingo: null,
  },
  {
    id: "portugal-2026",
    nombre: "GP de Portugal",
    circuito: "Autodromo Internacional do Algarve (Portimão)",
    fechaSprint:  "2026-11-21",
    fechaCarrera: "2026-11-22",
    votacionEspecial: false,
    cierreSabado:  null,
    cierreDomingo: null,
  },
  {
    id: "valencia-2026",
    nombre: "GP de Valencia",
    circuito: "Circuit Ricardo Tormo (Cheste)",
    fechaSprint:  "2026-11-28",
    fechaCarrera: "2026-11-29",
    votacionEspecial: false,
    cierreSabado:  null,
    cierreDomingo: null,
  },
];

/**
 * Devuelve el GP más próximo (el primero cuya fecha de carrera es hoy o posterior).
 * Devuelve null si ya han terminado todos.
 */
export function gpActual(): GranPremio | null {
  const hoy = new Date().toISOString().slice(0, 10); // "2026-05-24"
  return CALENDARIO.find((gp) => gp.fechaCarrera >= hoy) ?? null;
}
