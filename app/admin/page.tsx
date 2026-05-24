"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { PILOTOS } from "@/lib/pilotos";
import { gpActual } from "@/lib/calendario";
import { PUNTOS } from "@/lib/puntuacion";

const ADMIN_EMAIL = "vihaciteam@gmail.com";
const GP = gpActual();

/* Convierte un timestamptz de la BD ("2026-09-19T13:00:00+00:00")
   al formato que acepta <input type="datetime-local"> ("2026-09-19T13:00") */
function toLocal(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 16);
}

/* Convierte el valor de datetime-local a ISO con segundos */
function fromLocal(value: string): string | null {
  if (!value) return null;
  return value + ":00";
}

function formatFecha(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("es-ES", {
    weekday: "short", day: "numeric", month: "short",
  });
}

function PilotoSelect({
  label, pts, value, onChange, excluir = [],
}: {
  label: string; pts: number; value: number | null;
  onChange: (v: number | null) => void; excluir?: (number | null)[];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-black">{label}</label>
        <span className="text-xs font-bold text-red-600">{pts}pt</span>
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
          <option key={p.numero} value={p.numero}>#{p.numero} {p.nombre}</option>
        ))}
      </select>
    </div>
  );
}

export default function AdminPage() {
  const [email, setEmail]     = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  // ── Horarios ──
  const [cierreSabado,  setCierreSabado]  = useState("");
  const [cierreDomingo, setCierreDomingo] = useState("");
  const [guardandoHorario, setGuardandoHorario] = useState(false);
  const [mensajeHorario, setMensajeHorario] = useState<{ texto: string; ok: boolean } | null>(null);

  // ── Podcasts ──
  const [podcasts,        setPodcasts]        = useState<{ id: string; titulo: string; url: string }[]>([]);
  const [tituloPodcast,   setTituloPodcast]   = useState("");
  const [urlPodcast,      setUrlPodcast]      = useState("");
  const [guardandoPodcast, setGuardandoPodcast] = useState(false);
  const [mensajePodcast,  setMensajePodcast]  = useState<{ texto: string; ok: boolean } | null>(null);

  // ── Resultados ──
  const [pole,     setPole]     = useState<number | null>(null);
  const [sprintP1, setSprintP1] = useState<number | null>(null);
  const [sprintP2, setSprintP2] = useState<number | null>(null);
  const [sprintP3, setSprintP3] = useState<number | null>(null);
  const [carreraP1,    setCarreraP1]    = useState<number | null>(null);
  const [carreraP2,    setCarreraP2]    = useState<number | null>(null);
  const [carreraP3,    setCarreraP3]    = useState<number | null>(null);
  const [vueltaRapida, setVueltaRapida] = useState<number | null>(null);
  const [moto3Winner,  setMoto3Winner]  = useState("");
  const [moto2Winner,  setMoto2Winner]  = useState("");
  const [guardandoRes, setGuardandoRes] = useState(false);
  const [mensajeRes,   setMensajeRes]   = useState<{ texto: string; ok: boolean } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser();
      setEmail(user?.email ?? null);

      if (user?.email === ADMIN_EMAIL && GP) {
        const [{ data: cierres }, { data: resultado }] = await Promise.all([
          supabase.from("cierres").select("*").eq("carrera_id", GP.id).maybeSingle(),
          supabase.from("resultados").select("*").eq("carrera_id", GP.id).maybeSingle(),
        ]);

        const { data: podcastsData } = await supabase
          .from("podcasts").select("*").order("created_at", { ascending: false });
        setPodcasts(podcastsData ?? []);

        if (cierres) {
          setCierreSabado(toLocal(cierres.cierre_sabado));
          setCierreDomingo(toLocal(cierres.cierre_domingo));
        }
        if (resultado) {
          setPole(resultado.pole ?? null);
          setSprintP1(resultado.sprint_p1 ?? null);
          setSprintP2(resultado.sprint_p2 ?? null);
          setSprintP3(resultado.sprint_p3 ?? null);
          setCarreraP1(resultado.carrera_p1 ?? null);
          setCarreraP2(resultado.carrera_p2 ?? null);
          setCarreraP3(resultado.carrera_p3 ?? null);
          setVueltaRapida(resultado.vuelta_rapida ?? null);
          setMoto3Winner(resultado.moto3_winner ?? "");
          setMoto2Winner(resultado.moto2_winner ?? "");
        }
      }
      setCargando(false);
    }
    cargar();
  }, []);

  async function agregarPodcast(e: React.FormEvent) {
    e.preventDefault();
    setGuardandoPodcast(true);
    setMensajePodcast(null);

    const { error } = await supabase.from("podcasts").insert({ titulo: tituloPodcast, url: urlPodcast });

    if (error) {
      setMensajePodcast({ texto: "Error al añadir el podcast.", ok: false });
    } else {
      const { data } = await supabase.from("podcasts").select("*").order("created_at", { ascending: false });
      setPodcasts(data ?? []);
      setTituloPodcast("");
      setUrlPodcast("");
      setMensajePodcast({ texto: "✅ Podcast añadido correctamente.", ok: true });
    }
    setGuardandoPodcast(false);
  }

  async function eliminarPodcast(id: string) {
    await supabase.from("podcasts").delete().eq("id", id);
    setPodcasts((prev) => prev.filter((p) => p.id !== id));
  }

  async function guardarHorarios(e: React.FormEvent) {
    e.preventDefault();
    if (!GP) return;
    setGuardandoHorario(true);
    setMensajeHorario(null);

    const { error } = await supabase.from("cierres").upsert(
      {
        carrera_id:    GP.id,
        cierre_sabado:  fromLocal(cierreSabado),
        cierre_domingo: fromLocal(cierreDomingo),
        updated_at:    new Date().toISOString(),
      },
      { onConflict: "carrera_id" }
    );

    setMensajeHorario(
      error
        ? { texto: "Error al guardar los horarios.", ok: false }
        : { texto: "✅ Horarios guardados correctamente.", ok: true }
    );
    setGuardandoHorario(false);
  }

  async function guardarResultados(e: React.FormEvent) {
    e.preventDefault();
    if (!GP) return;
    setGuardandoRes(true);
    setMensajeRes(null);

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

    setMensajeRes(
      error
        ? { texto: "Error al guardar el resultado.", ok: false }
        : { texto: "✅ Resultado guardado. La clasificación ya se actualizará.", ok: true }
    );
    setGuardandoRes(false);
  }

  if (cargando) return (
    <div className="flex flex-1 items-center justify-center text-zinc-400">Cargando…</div>
  );
  if (email !== ADMIN_EMAIL) return (
    <div className="flex flex-1 items-center justify-center flex-col gap-3 text-center px-4">
      <div className="text-5xl">🚫</div>
      <h2 className="text-2xl font-black">Acceso restringido</h2>
      <p className="text-zinc-400">Solo el administrador puede entrar aquí.</p>
    </div>
  );
  if (!GP) return (
    <div className="flex flex-1 items-center justify-center text-zinc-400 px-4">
      No hay más GPs en el calendario.
    </div>
  );

  return (
    <div className="flex flex-col flex-1 px-4 py-10 max-w-2xl mx-auto w-full gap-10">

      {/* Cabecera */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-red-600">
          Panel de administrador
        </span>
        <h1 className="text-3xl font-black text-black mt-1">{GP.nombre}</h1>
        <p className="text-zinc-400 text-sm">{GP.circuito}</p>
      </div>

      {/* ══ HORARIOS DE CIERRE ══ */}
      <form onSubmit={guardarHorarios} className="flex flex-col gap-5 p-6 bg-zinc-50 rounded-2xl border-2 border-zinc-100">
        <h2 className="text-lg font-black text-black">⏰ Horarios de cierre de votación</h2>
        <p className="text-xs text-zinc-400 -mt-2">
          La votación cierra 1 hora antes de cada carrera. Los votos se revelan 1 minuto después del cierre.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">
              🏁 Cierre sábado (pole + sprint)
            </label>
            <p className="text-xs text-zinc-400">{formatFecha(GP.fechaSprint)}</p>
            <input
              type="datetime-local"
              value={cierreSabado}
              onChange={(e) => setCierreSabado(e.target.value)}
              className="border-2 border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-colors bg-white"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">
              🏎️ Cierre domingo (carrera + especiales)
            </label>
            <p className="text-xs text-zinc-400">{formatFecha(GP.fechaCarrera)}</p>
            <input
              type="datetime-local"
              value={cierreDomingo}
              onChange={(e) => setCierreDomingo(e.target.value)}
              className="border-2 border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-colors bg-white"
            />
          </div>
        </div>

        {mensajeHorario && (
          <p className={`text-sm rounded-lg px-4 py-2 border ${mensajeHorario.ok ? "text-green-700 bg-green-50 border-green-200" : "text-red-600 bg-red-50 border-red-200"}`}>
            {mensajeHorario.texto}
          </p>
        )}

        <button
          type="submit"
          disabled={guardandoHorario}
          className="bg-black hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 text-white font-bold py-2.5 rounded-full transition-colors"
        >
          {guardandoHorario ? "Guardando…" : "Guardar horarios"}
        </button>
      </form>

      {/* ══ RESULTADOS ══ */}
      <form onSubmit={guardarResultados} className="flex flex-col gap-8">
        <h2 className="text-lg font-black text-black">📋 Resultado oficial del GP</h2>

        {/* Sábado */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-200" />
            <span className="text-xs font-black uppercase tracking-widest text-zinc-500">
              Sábado · {formatFecha(GP.fechaSprint)}
            </span>
            <div className="h-px flex-1 bg-zinc-200" />
          </div>
          <PilotoSelect label="🏁 Pole position" pts={PUNTOS.sabado.pole} value={pole} onChange={setPole} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <PilotoSelect label="🥇 Sprint P1" pts={PUNTOS.sabado.sprint1} value={sprintP1} onChange={setSprintP1} excluir={[sprintP2, sprintP3]} />
            <PilotoSelect label="🥈 Sprint P2" pts={PUNTOS.sabado.sprint2} value={sprintP2} onChange={setSprintP2} excluir={[sprintP1, sprintP3]} />
            <PilotoSelect label="🥉 Sprint P3" pts={PUNTOS.sabado.sprint3} value={sprintP3} onChange={setSprintP3} excluir={[sprintP1, sprintP2]} />
          </div>
        </section>

        {/* Domingo */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-200" />
            <span className="text-xs font-black uppercase tracking-widest text-zinc-500">
              Domingo · {formatFecha(GP.fechaCarrera)}
            </span>
            <div className="h-px flex-1 bg-zinc-200" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <PilotoSelect label="🥇 Carrera P1" pts={PUNTOS.domingo.carrera1} value={carreraP1} onChange={setCarreraP1} excluir={[carreraP2, carreraP3]} />
            <PilotoSelect label="🥈 Carrera P2" pts={PUNTOS.domingo.carrera2} value={carreraP2} onChange={setCarreraP2} excluir={[carreraP1, carreraP3]} />
            <PilotoSelect label="🥉 Carrera P3" pts={PUNTOS.domingo.carrera3} value={carreraP3} onChange={setCarreraP3} excluir={[carreraP1, carreraP2]} />
          </div>
          <PilotoSelect label="⚡ Vuelta rápida" pts={PUNTOS.domingo.vueltaRapida} value={vueltaRapida} onChange={setVueltaRapida} />
        </section>

        {/* Especial */}
        {GP.votacionEspecial && (
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-red-200" />
              <span className="text-xs font-black uppercase tracking-widest text-red-500">⭐ Resultado especial</span>
              <div className="h-px flex-1 bg-red-200" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-black">🏍️ Ganador Moto3</label>
                <input type="text" value={moto3Winner} onChange={(e) => setMoto3Winner(e.target.value)} placeholder="Nombre del piloto"
                  className="border-2 border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-colors" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-black">🏍️ Ganador Moto2</label>
                <input type="text" value={moto2Winner} onChange={(e) => setMoto2Winner(e.target.value)} placeholder="Nombre del piloto"
                  className="border-2 border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-colors" />
              </div>
            </div>
          </section>
        )}

        {mensajeRes && (
          <p className={`text-sm rounded-lg px-4 py-2 border ${mensajeRes.ok ? "text-green-700 bg-green-50 border-green-200" : "text-red-600 bg-red-50 border-red-200"}`}>
            {mensajeRes.texto}
          </p>
        )}

        <button
          type="submit"
          disabled={guardandoRes}
          className="bg-red-600 hover:bg-red-700 disabled:bg-zinc-200 disabled:text-zinc-400 text-white font-bold py-3 rounded-full transition-colors mb-8"
        >
          {guardandoRes ? "Guardando…" : "Guardar resultado oficial"}
        </button>
      </form>

      {/* ══ PODCASTS ══ */}
      <div className="flex flex-col gap-5 p-6 bg-zinc-50 rounded-2xl border-2 border-zinc-100">
        <h2 className="text-lg font-black text-black">🎙️ Gestionar podcasts</h2>

        <form onSubmit={agregarPodcast} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">Título del episodio</label>
            <input
              type="text"
              value={tituloPodcast}
              onChange={(e) => setTituloPodcast(e.target.value)}
              required
              placeholder="Ej: Previa GP de Italia 2026"
              className="border-2 border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-colors bg-white"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">URL de YouTube</label>
            <input
              type="url"
              value={urlPodcast}
              onChange={(e) => setUrlPodcast(e.target.value)}
              required
              placeholder="https://www.youtube.com/watch?v=..."
              className="border-2 border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-colors bg-white"
            />
          </div>

          {mensajePodcast && (
            <p className={`text-sm rounded-lg px-4 py-2 border ${mensajePodcast.ok ? "text-green-700 bg-green-50 border-green-200" : "text-red-600 bg-red-50 border-red-200"}`}>
              {mensajePodcast.texto}
            </p>
          )}

          <button
            type="submit"
            disabled={guardandoPodcast}
            className="bg-black hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 text-white font-bold py-2.5 rounded-full transition-colors"
          >
            {guardandoPodcast ? "Añadiendo…" : "Añadir podcast"}
          </button>
        </form>

        {podcasts.length > 0 && (
          <div className="flex flex-col gap-2 mt-2">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Publicados</p>
            {podcasts.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 bg-white rounded-xl px-4 py-3 border-2 border-zinc-100">
                <p className="text-sm font-medium text-black truncate">{p.titulo}</p>
                <button
                  onClick={() => eliminarPodcast(p.id)}
                  className="text-red-500 hover:text-red-700 text-xs font-bold shrink-0 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
