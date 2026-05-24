"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { PILOTOS } from "@/lib/pilotos";
import { nombrePiloto } from "@/lib/pilotos";
import { gpActual } from "@/lib/calendario";

const CARRERA_ACTUAL = gpActual();

const ADMIN_EMAIL = "vihaciteam@gmail.com";

export default function AdminPage() {
  const [email, setEmail]       = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [p1, setP1]             = useState("");
  const [p2, setP2]             = useState("");
  const [p3, setP3]             = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje]   = useState<{ texto: string; ok: boolean } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser();
      setEmail(user?.email ?? null);

      if (user?.email === ADMIN_EMAIL) {
        const { data } = await supabase
          .from("resultados")
          .select("p1, p2, p3")
          .eq("carrera_id", CARRERA_ACTUAL.id)
          .maybeSingle();
        if (data) {
          setP1(String(data.p1));
          setP2(String(data.p2));
          setP3(String(data.p3));
        }
      }
      setCargando(false);
    }
    cargar();
  }, []);

  async function guardarResultado(e: React.FormEvent) {
    e.preventDefault();
    if (p1 === p2 || p1 === p3 || p2 === p3) {
      setMensaje({ texto: "Los tres pilotos deben ser distintos.", ok: false });
      return;
    }
    setGuardando(true);
    setMensaje(null);

    const { error } = await supabase.from("resultados").upsert(
      { carrera_id: CARRERA_ACTUAL.id, p1: +p1, p2: +p2, p3: +p3 },
      { onConflict: "carrera_id" }
    );

    setMensaje(
      error
        ? { texto: "Error al guardar. Inténtalo de nuevo.", ok: false }
        : { texto: "¡Resultado guardado! La clasificación ya se actualizará.", ok: true }
    );
    setGuardando(false);
  }

  if (cargando) {
    return <div className="flex flex-1 items-center justify-center text-zinc-400">Cargando…</div>;
  }

  if (email !== ADMIN_EMAIL) {
    return (
      <div className="flex flex-1 items-center justify-center flex-col gap-3 text-center px-4">
        <div className="text-5xl">🚫</div>
        <h2 className="text-2xl font-black text-black">Acceso restringido</h2>
        <p className="text-zinc-400">Esta página solo es accesible para el administrador.</p>
      </div>
    );
  }

  const pilotoSelect = (label: string, value: string, onChange: (v: string) => void, excluir: string[]) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-bold text-black">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="border-2 border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors bg-white"
      >
        <option value="">— Elige piloto —</option>
        {PILOTOS.filter((p) => !excluir.includes(String(p.numero)) || String(p.numero) === value).map((p) => (
          <option key={p.numero} value={p.numero}>
            #{p.numero} {p.nombre}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="flex flex-col flex-1 px-4 py-10 max-w-lg mx-auto w-full gap-8">

      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-red-600">Panel de administrador</span>
        <h1 className="text-3xl font-black text-black mt-1">Introducir resultado</h1>
        <p className="text-zinc-400 text-sm mt-1">{CARRERA_ACTUAL.nombre} · {CARRERA_ACTUAL.fecha}</p>
      </div>

      <form onSubmit={guardarResultado} className="flex flex-col gap-5">
        {pilotoSelect("🥇 1er lugar", p1, setP1, [p2, p3])}
        {pilotoSelect("🥈 2º lugar",  p2, setP2, [p1, p3])}
        {pilotoSelect("🥉 3er lugar", p3, setP3, [p1, p2])}

        {mensaje && (
          <p className={`text-sm rounded-lg px-4 py-2 border ${mensaje.ok ? "text-green-700 bg-green-50 border-green-200" : "text-red-600 bg-red-50 border-red-200"}`}>
            {mensaje.texto}
          </p>
        )}

        <button
          type="submit"
          disabled={guardando}
          className="bg-red-600 hover:bg-red-700 disabled:bg-zinc-200 disabled:text-zinc-400 text-white font-bold py-3 rounded-full transition-colors"
        >
          {guardando ? "Guardando…" : "Guardar resultado oficial"}
        </button>
      </form>

      {p1 && p2 && p3 && (
        <div className="bg-black text-white rounded-2xl px-6 py-5 flex flex-col gap-3">
          <p className="text-zinc-400 text-xs uppercase tracking-widest">Resultado actual guardado</p>
          {[p1, p2, p3].map((num, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-red-500 font-black w-6">{i + 1}º</span>
              <span className="font-bold">{nombrePiloto(+num)}</span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
