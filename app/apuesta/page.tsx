"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { PILOTOS, nombrePiloto } from "@/lib/pilotos";
import { gpActual } from "@/lib/calendario";
import { PUNTOS, jornadaAbierta } from "@/lib/puntuacion";

const GP = gpActual();

function formatFecha(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("es-ES", {
    day: "numeric", month: "short", year: "numeric",
  });
}

/** Dropdown reutilizable para elegir un piloto */
function PilotoSelect({
  label, pts, value, onChange, excluir = [], disabled = false,
}: {
  label: string;
  pts: number;
  value: number | null;
  onChange: (v: number | null) => void;
  excluir?: (number | null)[];
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-black">{label}</label>
        <span className="text-xs font-bold text-red-600">{pts} pt{pts !== 1 ? "s" : ""}</span>
      </div>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value ? +e.target.value : null)}
        disabled={disabled}
        className={`border-2 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors
          ${disabled
            ? "border-zinc-100 bg-zinc-50 text-zinc-400 cursor-not-allowed"
            : "border-zinc-200 bg-white focus:border-black"
          }`}
      >
        <option value="">— Elige piloto —</option>
        {PILOTOS.filter(
          (p) => !excluir.filter(Boolean).includes(p.numero) || p.numero === value
        ).map((p) => (
          <option key={p.numero} value={p.numero}>
            #{p.numero} {p.nombre}
          </option>
        ))}
      </select>
    </div>
  );
}

function BadgeEstado({ abierto }: { abierto: boolean }) {
  if (abierto) {
    return (
      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-green-100 text-green-700">
        Abierto
      </span>
    );
  }
  return (
    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-600">
      Cerrado
    </span>
  );
}

export default function ApuestaPage() {
  // Sábado
  const [pole,     setPole]     = useState<number | null>(null);
  const [sprintP1, setSprintP1] = useState<number | null>(null);
  const [sprintP2, setSprintP2] = useState<number | null>(null);
  const [sprintP3, setSprintP3] = useState<number | null>(null);
  // Domingo
  const [carreraP1,    setCarreraP1]    = useState<number | null>(null);
  const [carreraP2,    setCarreraP2]    = useState<number | null>(null);
  const [carreraP3,    setCarreraP3]    = useState<number | null>(null);
  const [vueltaRapida, setVueltaRapida] = useState<number | null>(null);
  // Especial
  const [moto3Winner, setMoto3Winner] = useState("");
  const [moto2Winner, setMoto2Winner] = useState("");
  // Horarios de cierre
  const [cierrePole,    setCierrePole]    = useState<string | null>(null);
  const [cierreSabado,  setCierreSabado]  = useState<string | null>(null);
  const [cierreDomingo, setCierreDomingo] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  // UI
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ texto: string; ok: boolean } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !GP) { setCargando(false); return; }

      const [{ data: apuesta }, { data: cierres }] = await Promise.all([
        supabase
          .from("apuestas")
          .select("*")
          .eq("user_id", user.id)
          .eq("carrera_id", GP.id)
          .maybeSingle(),
        supabase
          .from("cierres")
          .select("cierre_sabado, cierre_domingo")
          .eq("carrera_id", GP.id)
          .maybeSingle(),
      ]);

      if (apuesta) {
        setPole(apuesta.pole ?? null);
        setSprintP1(apuesta.sprint_p1 ?? null);
        setSprintP2(apuesta.sprint_p2 ?? null);
        setSprintP3(apuesta.sprint_p3 ?? null);
        setCarreraP1(apuesta.carrera_p1 ?? null);
        setCarreraP2(apuesta.carrera_p2 ?? null);
        setCarreraP3(apuesta.carrera_p3 ?? null);
        setVueltaRapida(apuesta.vuelta_rapida ?? null);
        setMoto3Winner(apuesta.moto3_winner ?? "");
        setMoto2Winner(apuesta.moto2_winner ?? "");
      }
      if (cierres) {
        setCierrePole(cierres.cierre_pole ?? null);
        setCierreSabado(cierres.cierre_sabado ?? null);
        setCierreDomingo(cierres.cierre_domingo ?? null);
      }
      setCargando(false);
    }
    cargar();
  }, []);

  // Calculado en cada render → siempre actualizado
  const poleAbierta    = jornadaAbierta(cierrePole);
  const sprintAbierto  = jornadaAbierta(cierreSabado);
  const domingoAbierto = jornadaAbierta(cierreDomingo);
  const todoCerrado    = !poleAbierta && !sprintAbierto && !domingoAbierto;

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!GP || todoCerrado) return;
    setGuardando(true);
    setMensaje(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("apuestas").upsert(
      {
        user_id:       user.id,
        carrera_id:    GP.id,
        pole,
        sprint_p1:     sprintP1,
        sprint_p2:     sprintP2,
        sprint_p3:     sprintP3,
        carrera_p1:    carreraP1,
        carrera_p2:    carreraP2,
        carrera_p3:    carreraP3,
        vuelta_rapida: vueltaRapida,
        moto3_winner:  moto3Winner || null,
        moto2_winner:  moto2Winner || null,
      },
      { onConflict: "user_id,carrera_id" }
    );

    setMensaje(
      error
        ? { texto: "Error al guardar. Inténtalo de nuevo.", ok: false }
        : { texto: "✅ Apuesta guardada correctamente.", ok: true }
    );
    setGuardando(false);
  }

  if (!GP) {
    return (
      <div className="flex flex-1 items-center justify-center text-zinc-400 text-center px-4 py-20">
        <p>No hay más GPs en el calendario. ¡Hasta la próxima temporada!</p>
      </div>
    );
  }

  if (cargando) {
    return (
      <div className="flex flex-1 items-center justify-center text-zinc-400">Cargando…</div>
    );
  }

  return (
    <form
      onSubmit={guardar}
      className="flex flex-col flex-1 px-4 py-8 max-w-2xl mx-auto w-full gap-8"
    >
      {/* Cabecera GP */}
      <div className="bg-black text-white rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <p className="text-zinc-400 text-xs uppercase tracking-widest mb-1">Próxima carrera</p>
          <h1 className="text-xl font-black">{GP.nombre}</h1>
          <p className="text-zinc-400 text-sm">{GP.circuito}</p>
        </div>
        {GP.votacionEspecial && (
          <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full self-start sm:self-auto">
            ⭐ GP Especial
          </span>
        )}
      </div>

      {/* ── RESUMEN DE TU APUESTA GUARDADA ── */}
      {(pole || sprintP1 || sprintP2 || sprintP3 || carreraP1 || carreraP2 || carreraP3 || vueltaRapida || moto3Winner || moto2Winner) && (
        <div className="bg-zinc-50 border-2 border-zinc-100 rounded-2xl px-5 py-4 flex flex-col gap-3">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
            {todoCerrado ? "Tu apuesta final" : "Tu apuesta guardada"}
          </p>
          <div className="flex flex-wrap gap-2">
            {pole        && <span className="text-xs bg-white border border-zinc-200 rounded-lg px-2.5 py-1 font-medium">🏁 {nombrePiloto(pole)}</span>}
            {sprintP1    && <span className="text-xs bg-white border border-zinc-200 rounded-lg px-2.5 py-1 font-medium">S🥇 {nombrePiloto(sprintP1)}</span>}
            {sprintP2    && <span className="text-xs bg-white border border-zinc-200 rounded-lg px-2.5 py-1 font-medium">S🥈 {nombrePiloto(sprintP2)}</span>}
            {sprintP3    && <span className="text-xs bg-white border border-zinc-200 rounded-lg px-2.5 py-1 font-medium">S🥉 {nombrePiloto(sprintP3)}</span>}
            {carreraP1   && <span className="text-xs bg-white border border-zinc-200 rounded-lg px-2.5 py-1 font-medium">C🥇 {nombrePiloto(carreraP1)}</span>}
            {carreraP2   && <span className="text-xs bg-white border border-zinc-200 rounded-lg px-2.5 py-1 font-medium">C🥈 {nombrePiloto(carreraP2)}</span>}
            {carreraP3   && <span className="text-xs bg-white border border-zinc-200 rounded-lg px-2.5 py-1 font-medium">C🥉 {nombrePiloto(carreraP3)}</span>}
            {vueltaRapida && <span className="text-xs bg-white border border-zinc-200 rounded-lg px-2.5 py-1 font-medium">⚡ {nombrePiloto(vueltaRapida)}</span>}
            {moto3Winner && <span className="text-xs bg-red-50 border border-red-200 rounded-lg px-2.5 py-1 font-medium text-red-700">Moto3: {moto3Winner}</span>}
            {moto2Winner && <span className="text-xs bg-red-50 border border-red-200 rounded-lg px-2.5 py-1 font-medium text-red-700">Moto2: {moto2Winner}</span>}
          </div>
          {!todoCerrado && (
            <p className="text-xs text-zinc-400">
              Puedes modificar los campos abiertos y volver a guardar.
            </p>
          )}
        </div>
      )}

      {/* Banner si todo está cerrado */}
      {todoCerrado && (
        <div className="bg-zinc-900 text-white rounded-2xl px-6 py-4 text-center">
          <p className="font-bold text-lg">🔒 Votación cerrada</p>
          <p className="text-zinc-400 text-sm mt-1">
            El plazo de apuestas para este GP ya ha terminado.
          </p>
        </div>
      )}

      {/* ── POLE ── */}
      <section className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-zinc-200" />
          <span className="text-xs font-black uppercase tracking-widest text-zinc-500">
            Pole · {formatFecha(GP.fechaSprint)}
          </span>
          <BadgeEstado abierto={poleAbierta} />
          <div className="h-px flex-1 bg-zinc-200" />
        </div>

        {!poleAbierta && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
            🔒 La votación de pole ya está cerrada.
          </p>
        )}

        <PilotoSelect
          label="🏁 Pole position"
          pts={PUNTOS.sabado.pole}
          value={pole}
          onChange={setPole}
          disabled={!poleAbierta}
        />
      </section>

      {/* ── SPRINT ── */}
      <section className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-zinc-200" />
          <span className="text-xs font-black uppercase tracking-widest text-zinc-500">
            Sprint · {formatFecha(GP.fechaSprint)}
          </span>
          <BadgeEstado abierto={sprintAbierto} />
          <div className="h-px flex-1 bg-zinc-200" />
        </div>

        {!sprintAbierto && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
            🔒 La votación del sprint ya está cerrada.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <PilotoSelect
            label="🥇 Sprint P1"
            pts={PUNTOS.sabado.sprint1}
            value={sprintP1}
            onChange={setSprintP1}
            excluir={[sprintP2, sprintP3]}
            disabled={!sprintAbierto}
          />
          <PilotoSelect
            label="🥈 Sprint P2"
            pts={PUNTOS.sabado.sprint2}
            value={sprintP2}
            onChange={setSprintP2}
            excluir={[sprintP1, sprintP3]}
            disabled={!sprintAbierto}
          />
          <PilotoSelect
            label="🥉 Sprint P3"
            pts={PUNTOS.sabado.sprint3}
            value={sprintP3}
            onChange={setSprintP3}
            excluir={[sprintP1, sprintP2]}
            disabled={!sprintAbierto}
          />
        </div>
      </section>

      {/* ── DOMINGO ── */}
      <section className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-zinc-200" />
          <span className="text-xs font-black uppercase tracking-widest text-zinc-500">
            Domingo · {formatFecha(GP.fechaCarrera)}
          </span>
          <BadgeEstado abierto={domingoAbierto} />
          <div className="h-px flex-1 bg-zinc-200" />
        </div>

        {!domingoAbierto && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
            🔒 La votación del domingo (carrera y especiales) ya está cerrada.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <PilotoSelect
            label="🥇 Carrera P1"
            pts={PUNTOS.domingo.carrera1}
            value={carreraP1}
            onChange={setCarreraP1}
            excluir={[carreraP2, carreraP3]}
            disabled={!domingoAbierto}
          />
          <PilotoSelect
            label="🥈 Carrera P2"
            pts={PUNTOS.domingo.carrera2}
            value={carreraP2}
            onChange={setCarreraP2}
            excluir={[carreraP1, carreraP3]}
            disabled={!domingoAbierto}
          />
          <PilotoSelect
            label="🥉 Carrera P3"
            pts={PUNTOS.domingo.carrera3}
            value={carreraP3}
            onChange={setCarreraP3}
            excluir={[carreraP1, carreraP2]}
            disabled={!domingoAbierto}
          />
        </div>

        <PilotoSelect
          label="⚡ Vuelta rápida"
          pts={PUNTOS.domingo.vueltaRapida}
          value={vueltaRapida}
          onChange={setVueltaRapida}
          disabled={!domingoAbierto}
        />
      </section>

      {/* ── ESPECIAL (solo Austria) ── */}
      {GP.votacionEspecial && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-red-200" />
            <span className="text-xs font-black uppercase tracking-widest text-red-500">
              ⭐ Votación especial
            </span>
            <div className="h-px flex-1 bg-red-200" />
          </div>
          <p className="text-xs text-zinc-400">
            Escribe el nombre exacto del piloto ganador en Moto3 y Moto2 (10 pts cada uno si aciertas).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-black">🏍️ Ganador Moto3</label>
                <span className="text-xs font-bold text-red-600">10 pts</span>
              </div>
              <input
                type="text"
                value={moto3Winner}
                onChange={(e) => setMoto3Winner(e.target.value)}
                placeholder="Nombre del piloto"
                disabled={!domingoAbierto}
                className={`border-2 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors
                  ${!domingoAbierto
                    ? "border-zinc-100 bg-zinc-50 text-zinc-400 cursor-not-allowed"
                    : "border-zinc-200 focus:border-red-500"
                  }`}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-black">🏍️ Ganador Moto2</label>
                <span className="text-xs font-bold text-red-600">10 pts</span>
              </div>
              <input
                type="text"
                value={moto2Winner}
                onChange={(e) => setMoto2Winner(e.target.value)}
                placeholder="Nombre del piloto"
                disabled={!domingoAbierto}
                className={`border-2 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors
                  ${!domingoAbierto
                    ? "border-zinc-100 bg-zinc-50 text-zinc-400 cursor-not-allowed"
                    : "border-zinc-200 focus:border-red-500"
                  }`}
              />
            </div>
          </div>
        </section>
      )}

      {/* Resumen de puntos */}
      <div className="bg-zinc-50 rounded-2xl px-5 py-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-zinc-400">
        <span>🏁 Pole <strong className="text-black">1</strong></span>
        <span>Sprint 🥇<strong className="text-black">12</strong> 🥈<strong className="text-black">9</strong> 🥉<strong className="text-black">7</strong></span>
        <span>Carrera 🥇<strong className="text-black">25</strong> 🥈<strong className="text-black">20</strong> 🥉<strong className="text-black">16</strong></span>
        <span>⚡ V.Rápida <strong className="text-black">1</strong></span>
        {GP.votacionEspecial && <span>⭐ Especial <strong className="text-black">10+10</strong></span>}
        <span className="ml-auto font-bold text-black">
          Máx: {GP.votacionEspecial ? "111" : "91"} pts
        </span>
      </div>

      {mensaje && (
        <p
          className={`text-sm rounded-lg px-4 py-3 border ${
            mensaje.ok
              ? "text-green-700 bg-green-50 border-green-200"
              : "text-red-600 bg-red-50 border-red-200"
          }`}
        >
          {mensaje.texto}
        </p>
      )}

      <button
        type="submit"
        disabled={guardando || todoCerrado}
        className="bg-red-600 hover:bg-red-700 disabled:bg-zinc-200 disabled:text-zinc-400 text-white font-bold py-3 rounded-full transition-colors mb-8"
      >
        {todoCerrado
          ? "🔒 Votación cerrada"
          : guardando
          ? "Guardando…"
          : "Guardar apuesta"
        }
      </button>
    </form>
  );
}
