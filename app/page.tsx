export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* Barra superior */}
      <header className="bg-black px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-red-500 text-2xl font-black tracking-tight">PORRA</span>
          <span className="text-white text-2xl font-black tracking-tight">MOTOGP</span>
        </div>
        <nav className="flex gap-6 text-sm text-zinc-400">
          <a href="#" className="hover:text-white transition-colors">Carrera</a>
          <a href="#" className="hover:text-white transition-colors">Clasificación</a>
          <a href="#" className="hover:text-white transition-colors">Mis apuestas</a>
        </nav>
      </header>

      {/* Hero */}
      <section className="bg-black text-white px-6 py-20 flex flex-col items-center text-center gap-6">
        <h1 className="text-5xl font-black tracking-tight">
          ¿Quién ganará la <span className="text-red-500">próxima carrera</span>?
        </h1>
        <p className="text-zinc-400 text-lg max-w-xl">
          Haz tu apuesta antes de que empiece la carrera, compite con tus amigos y sube en la clasificación.
        </p>
        <button className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-full text-lg transition-colors">
          Hacer mi apuesta
        </button>
      </section>

      {/* Tarjetas de funcionalidades */}
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

      {/* Pie de página */}
      <footer className="mt-auto bg-black text-zinc-600 text-center text-sm py-4">
        Porra MotoGP · Hecho con amigos
      </footer>

    </div>
  );
}
