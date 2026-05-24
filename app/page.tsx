import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1">

      {/* Hero */}
      <section className="bg-black text-white px-6 py-24 flex flex-col items-center text-center gap-6">
        <h1 className="text-5xl font-black tracking-tight max-w-2xl">
          ¿Quién ganará la <span className="text-red-500">próxima carrera</span>?
        </h1>
        <p className="text-zinc-400 text-lg max-w-xl">
          Haz tu apuesta antes de que empiece la carrera, compite con tus amigos y sube en la clasificación.
        </p>
        <Link
          href="/apuesta"
          className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-full text-lg transition-colors"
        >
          Hacer mi apuesta
        </Link>
      </section>

      {/* Tarjetas */}
      <section className="flex flex-col sm:flex-row gap-6 px-6 py-16 max-w-4xl mx-auto w-full">

        <div className="flex-1 border-2 border-black rounded-2xl p-6 flex flex-col gap-3">
          <div className="text-3xl">🏁</div>
          <h2 className="text-xl font-bold text-black">Apuesta</h2>
          <p className="text-zinc-500 text-sm">
            Elige el top 3 de la carrera antes de que empiece. Una apuesta por Gran Premio.
          </p>
        </div>

        <div className="flex-1 border-2 border-black rounded-2xl p-6 flex flex-col gap-3">
          <div className="text-3xl">🏆</div>
          <h2 className="text-xl font-bold text-black">Puntuación</h2>
          <p className="text-zinc-500 text-sm">
            Ganas puntos según aciertos. Más puntos si aciertas el orden exacto.
          </p>
        </div>

        <div className="flex-1 border-2 border-black rounded-2xl p-6 flex flex-col gap-3">
          <div className="text-3xl">📊</div>
          <h2 className="text-xl font-bold text-black">Clasificación</h2>
          <p className="text-zinc-500 text-sm">
            Sigue la tabla de tu grupo durante toda la temporada. ¿Quién es el mejor pronosticador?
          </p>
        </div>

      </section>

    </div>
  );
}
