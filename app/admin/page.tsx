"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { PILOTOS } from "@/lib/pilotos";
import { gpActual } from "@/lib/calendario";
import { PUNTOS } from "@/lib/puntuacion";

const ADMIN_EMAIL = "vihaciteam@gmail.com";
const GP = gpActual();

function formatFecha(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("es-ES", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function PilotoSelect({
  label, pts, value, onChange, excluir = [],
}: {
  label: string;
  pts: number;
  value: number | null;
  onChange: (v: number | null) => void;
  excluir?: (number | null)[];
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
        className="border-2 border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-colors bg-white"
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

export default function AdminPage() {
  const [email, setEmail]   = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

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

  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ texto: string; ok: boolean } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser();
      setEmail(user?.email ?? null);

      if (user?.email === ADMIN_EMAIL && GP) {
        const { data } = await supabase
          .from("resultados")
          .select("*")
          .eq("carrera_id", GP.id)
          .maybeSingle();

        if (data) {
          setPole(data.pole ?? null);
          setSprintP1(data.sprint_p1 ?? null);
          setSprintP2(data.sprint_p2 ?? null);
          setSprintP3(data.sprint_p3 ?? null);
          setCarreraP1(data.carrera_p1 ?? null);
          setCarreraP2(data.carrera_p2 ?? null);
          setCarreraP3(data.carrera_p3 ?? null);
          setVueltaRapida(data.vuelta_rapida ?? null);
          setMoto3Winner(data.moto3_winner ?? "");
          setMoto2Winner(data.moto2_winner ?? "");
        }
      }
      setCargando(false);
    }
    cargar();
  }, []);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!GP) return;
    setGuardando(true);
    setMensaje(null);

    const { error } = await supabase.from("resultados").upsert(
      {
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
      { onConflict: "carrera_id" }
    );

    setMensaje(
      error
        ? { texto: "Error al guardar. Inténtalo de nuevo.", ok: false }
        : { texto: "✅ Resultado guardado. La clasificación ya se actualizará.", ok: true }
    );
    setGuardando(false);
  }

  if (cargando) return (
    <div className="flex flex-1 items-center justify-center text-zinc-400">Cargando…</div>
  );

  if (email !== ADMIN_EMAIL) return (
    <div className="flex flex-1 items-center justify-center flex-col gap-3 text-center px-4">
      <div className="text-5xl">🚫</div>
      <h2 className="text-2xl font-black text-black">Acceso restringido</h2>
      <p className="text-zinc-400">Esta página solo es accesible para el administrador.</p>
    </div>
  );

  if (!GP) return (
    <div className="flex flex-1 items-center justify-center text-zinc-400 px-4">
      No hay más GPs en el calendario.
    </div>
  );

  return (
    <form
      onSubmit={guardar}
      className="flex flex-col flex-1 px-4 py-10 max-w-2xl mx-auto w-full gap-8"
    >
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-red-600">
          Panel de administrador
        </span>
        <h1 className="text-3xl font-black text-black mt-1">Introducir resultado</h1>
        <p className="text-zinc-400 text-sm mt-1">{GP.nombre} · {GP.circuito}</p>
      </div>

      {/* ── SÁBADO ── */}
      <section className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-zinc-200" />
          <span className="text-xs font-black uppercase tracking-widest text-zinc-500">
            Sábado · {formatFecha(GP.fechaSprint)}
          </span>
          <div className="h-px flex-1 bg-zinc-200" />
        </div>

        <PilotoSelect
          label="🏁 Pole position"
          pts={PUNTOS.sabado.pole}
          value={pole}
          onChange={setPole}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <PilotoSelect
            label="🥇 Sprint P1"
            pts={PUNTOS.sabado.sprint1}
            value={sprintP1}
            onChange={setSprintP1}
            excluir={[sprintP2, sprintP3]}
          />
          <PilotoSelect
            label="🥈 Sprint P2"
            pts={PUNTOS.sabado.sprint2}
            value={sprintP2}
            onChange={setSprintP2}
            excluir={[sprintP1, sprintP3]}
          />
          <PilotoSelect
            label="🥉 Sprint P3"
            pts={PUNTOS.sabado.sprint3}
            value={sprintP3}
            onChange={setSprintP3}
            excluir={[sprintP1, sprintP2]}
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
          <div className="h-px flex-1 bg-zinc-200" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <PilotoSelect
            label="🥇 Carrera P1"
            pts={PUNTOS.domingo.carrera1}
            value={carreraP1}
            onChange={setCarreraP1}
            excluir={[carreraP2, carreraP3]}
          />
          <PilotoSelect
            label="🥈 Carrera P2"
            pts={PUNTOS.domingo.carrera2}
            value={carreraP2}
            onChange={setCarreraP2}
            excluir={[carreraP1, carreraP3]}
          />
          <PilotoSelect
            label="🥉 Carrera P3"
            pts={PUNTOS.domingo.carrera3}
            value={carreraP3}
            onChange={setCarreraP3}
            excluir={[carreraP1, carreraP2]}
          />
        </div>

        <PilotoSelect
          label="⚡ Vuelta rápida"
          pts={PUNTOS.domingo.vueltaRapida}
          value={vueltaRapida}
          onChange={setVueltaRapida}
        />
      </section>

      {/* ── ESPECIAL ── */}
      {GP.votacionEspecial && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-red-200" />
            <span className="text-xs font-black uppercase tracking-widest text-red-500">
              ⭐ Resultado especial
            </span>
            <div className="h-px flex-1 bg-red-200" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-black">🏍️ Ganador Moto3</label>
              <input
                type="text"
                value={moto3Winner}
                onChange={(e) => setMoto3Winner(e.target.value)}
                placeholder="Nombre del piloto"
                className="border-2 border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-black">🏍️ Ganador Moto2</label>
              <input
                type="text"
                value={moto2Winner}
                onChange={(e) => setMoto2Winner(e.target.value)}
                placeholder="Nombre del piloto"
                className="border-2 border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
              />
            </div>
          </div>
        </section>
      )}

      {mensaje && (
        <p className={`text-sm rounded-lg px-4 py-3 border ${
          mensaje.ok
            ? "text-green-700 bg-green-50 border-green-200"
            : "text-red-600 bg-red-50 border-red-200"
        }`}>
          {mensaje.texto}
        </p>
      )}

      <button
        type="submit"
        disabled={guardando}
        className="bg-red-600 hover:bg-red-700 disabled:bg-zinc-200 disabled:text-zinc-400 text-white font-bold py-3 rounded-full transition-colors mb-8"
      >
        {guardando ? "Guardando…" : "Guardar resultado oficial"}
      </button>
    </form>
  );
}
