import type { Piloto } from "./tipos";

export const PILOTOS: Piloto[] = [
  // ── DUCATI ────────────────────────────────────────────────────────────────
  { numero: 93, nombre: "Marc Márquez",            equipo: "Ducati Lenovo Team",          marca: "Ducati" },
  { numero: 63, nombre: "Francesco Bagnaia",       equipo: "Ducati Lenovo Team",          marca: "Ducati" },
  { numero: 73, nombre: "Álex Márquez",            equipo: "Gresini Racing",              marca: "Ducati" },
  { numero: 54, nombre: "Fermín Aldeguer",         equipo: "Gresini Racing",              marca: "Ducati" },
  { numero: 49, nombre: "Fabio Di Giannantonio",   equipo: "VR46 Racing Team",            marca: "Ducati" },
  { numero: 21, nombre: "Franco Morbidelli",       equipo: "VR46 Racing Team",            marca: "Ducati" },

  // ── KTM ───────────────────────────────────────────────────────────────────
  { numero: 37, nombre: "Pedro Acosta",            equipo: "Red Bull KTM Factory Racing", marca: "KTM" },
  { numero: 33, nombre: "Brad Binder",             equipo: "Red Bull KTM Factory Racing", marca: "KTM" },
  { numero: 12, nombre: "Maverick Viñales",        equipo: "Red Bull KTM Tech3",          marca: "KTM" },
  { numero: 23, nombre: "Enea Bastianini",         equipo: "Red Bull KTM Tech3",          marca: "KTM" },

  // ── APRILIA ───────────────────────────────────────────────────────────────
  { numero: 89, nombre: "Jorge Martín",            equipo: "Aprilia Racing",              marca: "Aprilia" },
  { numero: 72, nombre: "Marco Bezzecchi",         equipo: "Aprilia Racing",              marca: "Aprilia" },
  { numero: 25, nombre: "Raúl Fernández",          equipo: "Trackhouse Racing",           marca: "Aprilia" },
  { numero: 79, nombre: "Ai Ogura",                equipo: "Trackhouse Racing",           marca: "Aprilia" },

  // ── YAMAHA ────────────────────────────────────────────────────────────────
  { numero: 20, nombre: "Fabio Quartararo",        equipo: "Monster Energy Yamaha",       marca: "Yamaha" },
  { numero: 42, nombre: "Álex Rins",               equipo: "Monster Energy Yamaha",       marca: "Yamaha" },
  { numero:  7, nombre: "Toprak Razgatlioglu",     equipo: "Prima Pramac Yamaha",         marca: "Yamaha" },
  { numero: 43, nombre: "Jack Miller",             equipo: "Prima Pramac Yamaha",         marca: "Yamaha" },

  // ── HONDA ─────────────────────────────────────────────────────────────────
  { numero: 10, nombre: "Luca Marini",             equipo: "Honda HRC",                   marca: "Honda" },
  { numero: 36, nombre: "Joan Mir",                equipo: "Honda HRC",                   marca: "Honda" },
  { numero:  5, nombre: "Johann Zarco",            equipo: "LCR Honda",                   marca: "Honda" },
  { numero: 11, nombre: "Diogo Moreira",           equipo: "LCR Honda",                   marca: "Honda" },
];

/** Devuelve el nombre del piloto dado su número de dorsal. */
export function nombrePiloto(numero: number): string {
  return PILOTOS.find((p) => p.numero === numero)?.nombre ?? `#${numero}`;
}

/** Devuelve todos los pilotos de una marca concreta. */
export function pilotosPorMarca(marca: Piloto["marca"]): Piloto[] {
  return PILOTOS.filter((p) => p.marca === marca);
}
