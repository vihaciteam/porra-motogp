/** Representa un Gran Premio del calendario */
export interface GranPremio {
  id: string;              // slug único, p. ej. "austria-2026"
  nombre: string;          // "GP de Austria"
  circuito: string;        // "Red Bull Ring"
  fechaSprint: string;     // "2026-09-19"  (YYYY-MM-DD)
  fechaCarrera: string;    // "2026-09-20"
  votacionEspecial: boolean;
  /** true = GP anterior a la app; sus puntos ya están en historial_puntos */
  esHistorico?: boolean;
  /** ISO 8601 local, p. ej. "2026-09-19T13:00:00" — null hasta que lo rellenes */
  cierreSabado: string | null;
  /** ISO 8601 local, p. ej. "2026-09-20T13:00:00" — null hasta que lo rellenes */
  cierreDomingo: string | null;
}

/** Piloto de MotoGP */
export interface Piloto {
  numero: number;
  nombre: string;
  equipo: string;
  marca: "Ducati" | "KTM" | "Aprilia" | "Yamaha" | "Honda";
}
