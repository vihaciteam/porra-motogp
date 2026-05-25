import type { Piloto } from "./tipos";

export const PILOTOS: Piloto[] = [
  { numero:  1, nombre: "Francesco Bagnaia",    equipo: "Ducati Lenovo" },
  { numero: 93, nombre: "Marc Márquez",          equipo: "Ducati Lenovo" },
  { numero: 89, nombre: "Jorge Martín",          equipo: "Aprilia Racing" },
  { numero: 73, nombre: "Álex Márquez",          equipo: "Gresini Racing" },
  { numero: 49, nombre: "Fabio Di Giannantonio", equipo: "VR46 Racing" },
  { numero: 21, nombre: "Franco Morbidelli",     equipo: "Pramac Yamaha" },
  { numero: 23, nombre: "Enea Bastianini",        equipo: "KTM Factory" },
  { numero: 33, nombre: "Brad Binder",           equipo: "KTM Factory" },
  { numero: 31, nombre: "Pedro Acosta",          equipo: "KTM GasGas Tech3" },
  { numero: 12, nombre: "Maverick Viñales",      equipo: "KTM GasGas Tech3" },
  { numero: 72, nombre: "Marco Bezzecchi",       equipo: "Aprilia Trackhouse" },
  { numero: 20, nombre: "Fabio Quartararo",      equipo: "Monster Yamaha" },
  { numero: 42, nombre: "Álex Rins",             equipo: "Monster Yamaha" },
  { numero: 10, nombre: "Luca Marini",           equipo: "Repsol Honda" },
  { numero: 36, nombre: "Joan Mir",              equipo: "Repsol Honda" },
  { numero: 41, nombre: "Aleix Espargaró",       equipo: "LCR Honda" },
  { numero:  5, nombre: "Johann Zarco",          equipo: "LCR Honda" },
  { numero: 43, nombre: "Jack Miller",           equipo: "Pramac Yamaha" },
  { numero: 25, nombre: "Raúl Fernández",        equipo: "Trackhouse Aprilia" },
  { numero: 79, nombre: "Ai Ogura",              equipo: "LCR Honda" },
  { numero: 37, nombre: "Fermín Aldeguer",       equipo: "Gresini Ducati" },
];

/** Devuelve el nombre del piloto dado su número de dorsal. */
export function nombrePiloto(numero: number): string {
  return PILOTOS.find((p) => p.numero === numero)?.nombre ?? `#${numero}`;
}
