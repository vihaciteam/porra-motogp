"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { PILOTOS } from "@/lib/pilotos";
import { gpActual } from "@/lib/calendario";

const GP = gpActual();

function formatFecha(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("es-ES", {
    day: "numeric", month: "short", year: "numeric",
  });
}

const POSICIONES = ["1º", "2º", "3º"] as const;

export default function ApuestaPage() {
  const [seleccion, setSeleccion] = useState<(number | null)[]>([null, null, null]);
  const [confirmado, setConfirmado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState("");
  const [apuestaExistente, setApuestaExistente] = useState(false);
  const supabase = createClient();

  // Al entrar, comprobamos si el usuario ya tiene apuesta guardada
  useEffect(() => {
    async function cargarApuesta() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("apuestas")
        .select("p1, p2, p3")
        .eq("user_id", user.id)
        .eq("carrera_id", GP?.id ?? "")
        .maybeSingle();

      if (data) {
        setSeleccion([data.p1, data.p2, data.p3]);
        setApuestaExistente(true);
        setConfirmado(true);
      }
    }
    cargarApuesta();
  }, []);

  const posicionLibre = seleccion.findIndex((s) => s === null);

  function seleccionarPiloto(numero: number) {
    const yaSeleccionado = seleccion.indexOf(numero);
    if (yaSeleccionado !== -1) {
      const nueva = [...seleccion];
      nueva[yaSeleccionado] = null;
      setSeleccion(nueva);
      return;
    }
    if (posicionLibre === -1) return;
    const nueva = [...seleccion];
    nueva[posicionLibre] = numero;
    setSeleccion(nueva);
  }

  function resetear() {
    setSeleccion([null, null, null]);
    setConfirmado(false);
    setErrorGuardado("");
  }

  async function confirmarApuesta() {
    setGuardando(true);
    setErrorGuardado("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("apuestas").upsert(
      {
        user_id: user.id,
        carrera_id: GP?.id ?? "",
        p1: seleccion[0],
        p2: seleccion[1],
        p3: seleccion[2],
      },
      { onConflict: "user_id,carrera_id" }
    );

    if (error) {
      setErrorGuardado("No se pudo guardar la apuesta. Inténtalo de nuevo.");
    } else {
      setConfirmado(true);
      setApuestaExistente(true);
    }
    setGuardando(false);
  }

  const listo = seleccion.every((s) => s !== null);

  if (confirmado) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center gap-6 py-20 px-6 text-center">
        <div className="text-6xl">🎉</div>
        <h2 className="text-3xl font-black text-black">
          {apuestaExistente ? "¡Apuesta guardada!" : "¡Apuesta registrada!"}
        </h2>
        <p className="text-zinc-500">
          Tu pronóstico para el <strong>{GP?.nombre ?? "próxima carrera"}</strong>:
        </p>
        <div className="flex flex-col gap-3 mt-2">
          {seleccion.map((num, i) => {
            const piloto = PILOTOS.find((p) => p.numero === num)!;
            return (
              <div key={i} className="flex items-center gap-4 bg-black text-white px-6 py-3 rounded-xl">
                <span className="text-red-500 font-black text-xl w-8">{POSICIONES[i]}</span>
                <span className="font-bold">{piloto.nombre}</span>
                <span className="text-zinc-400 text-sm">#{piloto.numero}</span>
              </div>
            );
          })}
        </div>
        <button
          onClick={resetear}
          className="mt-6 border-2 border-black text-black font-bold px-6 py-2 rounded-full hover:bg-black hover:text-white transition-colors"
        >
          Cambiar apuesta
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 px-4 py-8 max-w-4xl mx-auto w-full gap-8">

      {/* Info carrera */}
      <div className="bg-black text-white rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <p className="text-zinc-400 text-xs uppercase tracking-widest mb-1">Próxima carrera</p>
          <h1 className="text-xl font-black">{GP?.nombre ?? "—"}</h1>
          <p className="text-zinc-400 text-sm">
            {GP?.circuito} · {GP ? formatFecha(GP.fechaCarrera) : ""}
          </p>
        </div>
        <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full self-start sm:self-auto">
          Apuestas abiertas
        </span>
      </div>

      {/* Selección actual */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-3">Tu pronóstico</h2>
        <div className="flex gap-3">
          {POSICIONES.map((pos, i) => {
            const piloto = seleccion[i] !== null ? PILOTOS.find((p) => p.numero === seleccion[i]) : null;
            return (
              <div
                key={i}
                className={`flex-1 rounded-xl border-2 px-3 py-3 flex flex-col items-center gap-1 min-h-[80px] justify-center transition-colors ${
                  piloto ? "border-red-500 bg-red-50" : "border-dashed border-zinc-300"
                }`}
              >
                <span className={`text-xs font-black uppercase ${piloto ? "text-red-600" : "text-zinc-400"}`}>
                  {pos}
                </span>
                {piloto ? (
                  <>
                    <span className="font-bold text-sm text-center leading-tight">{piloto.nombre}</span>
                    <span className="text-xs text-zinc-400">#{piloto.numero}</span>
                  </>
                ) : (
                  <span className="text-xs text-zinc-300">Sin elegir</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-sm text-zinc-500 -mt-4">
        {posicionLibre !== -1
          ? `Elige el piloto que quedará en ${POSICIONES[posicionLibre]} posición:`
          : "¡Ya tienes tu top 3! Pulsa confirmar o toca un piloto para cambiarlo."}
      </p>

      {/* Grid de pilotos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {PILOTOS.map((piloto) => {
          const posIdx = seleccion.indexOf(piloto.numero);
          const seleccionado = posIdx !== -1;
          return (
            <button
              key={piloto.numero}
              onClick={() => seleccionarPiloto(piloto.numero)}
              className={`rounded-xl border-2 px-4 py-3 text-left transition-all ${
                seleccionado
                  ? "border-red-500 bg-red-50"
                  : "border-zinc-200 hover:border-black bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-2xl font-black text-zinc-200">#{piloto.numero}</span>
                {seleccionado && (
                  <span className="bg-red-600 text-white text-xs font-black px-2 py-0.5 rounded-full">
                    {POSICIONES[posIdx]}
                  </span>
                )}
              </div>
              <p className="font-bold text-sm text-black leading-tight">{piloto.nombre}</p>
              <p className="text-xs text-zinc-400 mt-0.5">{piloto.equipo}</p>
            </button>
          );
        })}
      </div>

      {errorGuardado && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {errorGuardado}
        </p>
      )}

      {/* Botones */}
      <div className="flex gap-3 pb-8">
        <button
          onClick={resetear}
          className="border-2 border-zinc-200 text-zinc-500 font-bold px-6 py-3 rounded-full hover:border-black hover:text-black transition-colors"
        >
          Reiniciar
        </button>
        <button
          onClick={confirmarApuesta}
          disabled={!listo || guardando}
          className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-zinc-200 disabled:text-zinc-400 text-white font-bold px-8 py-3 rounded-full transition-colors"
        >
          {guardando
            ? "Guardando..."
            : listo
            ? "Confirmar apuesta"
            : `Elige ${seleccion.filter((s) => s === null).length} piloto${seleccion.filter((s) => s === null).length !== 1 ? "s" : ""} más`}
        </button>
      </div>

    </div>
  );
}
