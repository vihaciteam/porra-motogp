"use client";

import { useEffect, useState } from "react";

const CONTENDIENTES = ["ñoño", "Carlos14", "Joseca", "JL83", "JL15", "Rosa30", "Sergio"];

export default function CampeonatoPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem("popup-campeonato-visto")) {
      setVisible(true);
    }
  }, []);

  function cerrar() {
    sessionStorage.setItem("popup-campeonato-visto", "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 flex flex-col gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-red-500">🏆 Campeonato 2026</p>
          <h2 className="text-2xl font-black text-black mt-1">Contendientes al título</h2>
          <p className="text-sm text-zinc-400 mt-1">Quedan 2 carreras · 202 pts en juego</p>
        </div>

        <ul className="flex flex-col gap-2">
          {CONTENDIENTES.map((nombre, i) => (
            <li key={nombre} className="flex items-center gap-3">
              <span className="text-lg w-6 text-center shrink-0">
                {i === 0 ? "👑" : `${i + 1}.`}
              </span>
              <span className={`font-bold text-black ${i === 0 ? "text-lg" : "text-base"}`}>
                {nombre}
              </span>
            </li>
          ))}
        </ul>

        <button
          onClick={cerrar}
          className="bg-black text-white font-bold py-3 rounded-full hover:bg-zinc-800 transition-colors"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
