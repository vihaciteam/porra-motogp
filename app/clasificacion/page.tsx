const JUGADORES = [
  { posicion: 1, nombre: "Josete",   puntos: 47, aciertos: 8 },
  { posicion: 2, nombre: "Manu",     puntos: 39, aciertos: 6 },
  { posicion: 3, nombre: "Sara",     puntos: 35, aciertos: 6 },
  { posicion: 4, nombre: "Pablo",    puntos: 28, aciertos: 5 },
  { posicion: 5, nombre: "Cris",     puntos: 21, aciertos: 4 },
];

const MEDALLAS = ["🥇", "🥈", "🥉"];

export default function ClasificacionPage() {
  return (
    <div className="flex flex-col flex-1 px-4 py-8 max-w-2xl mx-auto w-full gap-6">

      <div>
        <h1 className="text-3xl font-black text-black">Clasificación</h1>
        <p className="text-zinc-400 text-sm mt-1">Temporada 2025 · 6 carreras disputadas</p>
      </div>

      <div className="flex flex-col gap-3">
        {JUGADORES.map((j) => (
          <div
            key={j.posicion}
            className={`flex items-center gap-4 rounded-xl px-5 py-4 border-2 ${
              j.posicion === 1 ? "border-red-500 bg-red-50" : "border-zinc-100 bg-white"
            }`}
          >
            <span className="text-2xl w-8 text-center">
              {MEDALLAS[j.posicion - 1] ?? <span className="text-zinc-400 font-bold text-sm">{j.posicion}</span>}
            </span>
            <span className="flex-1 font-bold text-black text-lg">{j.nombre}</span>
            <div className="text-right">
              <p className="font-black text-black text-xl">{j.puntos} pts</p>
              <p className="text-zinc-400 text-xs">{j.aciertos} aciertos</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-zinc-300 text-center">
        Datos de ejemplo · próximamente con puntuaciones reales
      </p>

    </div>
  );
}
