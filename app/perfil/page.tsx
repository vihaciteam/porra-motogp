"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Avatar } from "@/app/components/Avatar";
import { calcularPuntos, type RegistroGP } from "@/lib/puntuacion";
import { CALENDARIO } from "@/lib/calendario";

interface StatsPersonales {
  totalHistorico: number;
  totalApp:       number;
  total:          number;
  gpsApp:         number;
  media:          number;
  aciertos:       number;
  mejorGP:        number;
  mejorGPNombre:  string | null;
}

export default function PerfilPage() {
  const [userId, setUserId]     = useState<string | null>(null);
  const [email,  setEmail]      = useState<string | null>(null);
  const [nombre, setNombre]     = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [nombreEdit, setNombreEdit] = useState("");
  const [cargando,  setCargando]  = useState(true);
  const [subiendo,  setSubiendo]  = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ texto: string; ok: boolean } | null>(null);
  const [stats, setStats] = useState<StatsPersonales | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const router   = useRouter();

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      setUserId(user.id);
      setEmail(user.email ?? null);

      const { data: perfil } = await supabase
        .from("perfiles")
        .select("nombre, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (perfil) {
        setNombre(perfil.nombre ?? "");
        setNombreEdit(perfil.nombre ?? "");
        setAvatarUrl(perfil.avatar_url ?? null);
      }
      setCargando(false);
    }
    cargar();
  }, []);

  // Cargar estadísticas personales una vez que tengamos el userId
  useEffect(() => {
    if (!userId) return;
    async function cargarStats() {
      const [
        { data: historial },
        { data: misApuestas },
        { data: resultados },
      ] = await Promise.all([
        supabase.from("historial_puntos").select("puntos").eq("user_id", userId),
        supabase.from("apuestas").select("*").eq("user_id", userId),
        supabase.from("resultados").select("*"),
      ]);

      const totalHistorico = (historial ?? []).reduce((s, h) => s + (h.puntos ?? 0), 0);

      let appPts = 0;
      let gpsApp = 0;
      let aciertos = 0;
      let mejorGP = 0;
      let mejorGPNombre: string | null = null;

      for (const res of resultados ?? []) {
        const gpConfig = CALENDARIO.find((gp) => gp.id === res.carrera_id);
        if (gpConfig?.esHistorico) continue;

        const apuesta = (misApuestas ?? []).find((a) => a.carrera_id === res.carrera_id);
        if (!apuesta) continue;

        gpsApp++;
        const pts = calcularPuntos(apuesta as RegistroGP, res as RegistroGP, gpConfig?.votacionEspecial ?? false);
        appPts += pts;

        const campos: (keyof RegistroGP)[] = [
          "pole","sprint_p1","sprint_p2","sprint_p3",
          "carrera_p1","carrera_p2","carrera_p3","vuelta_rapida",
        ];
        for (const campo of campos) {
          if (apuesta[campo] && apuesta[campo] === res[campo]) aciertos++;
        }
        if (gpConfig?.votacionEspecial) {
          if (apuesta.moto3_winner && apuesta.moto3_winner === res.moto3_winner) aciertos++;
          if (apuesta.moto2_winner && apuesta.moto2_winner === res.moto2_winner) aciertos++;
        }

        if (pts > mejorGP) {
          mejorGP = pts;
          mejorGPNombre = gpConfig?.nombre ?? null;
        }
      }

      setStats({
        totalHistorico,
        totalApp: appPts,
        total:    totalHistorico + appPts,
        gpsApp,
        media:    gpsApp > 0 ? Math.round(appPts / gpsApp) : 0,
        aciertos,
        mejorGP,
        mejorGPNombre,
      });
    }
    cargarStats();
  }, [userId]);

  async function subirFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    if (file.size > 5 * 1024 * 1024) {
      setMensaje({ texto: "La foto no puede superar 5 MB.", ok: false });
      return;
    }

    setSubiendo(true);
    setMensaje(null);

    // Sobreescribe siempre el mismo archivo (userId) → compatible con las
    // políticas del bucket. cacheControl "0" evita que el CDN lo cachee.
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(userId, file, { upsert: true, cacheControl: "0" });

    if (uploadError) {
      setMensaje({ texto: "Error al subir la foto. Inténtalo de nuevo.", ok: false });
      setSubiendo(false);
      return;
    }

    // Añadimos ?t= para que el navegador no use su caché local
    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(userId);

    const urlFinal = `${publicUrl}?t=${Date.now()}`;

    // Guardar URL en el perfil
    const { error: updateError } = await supabase
      .from("perfiles")
      .update({ avatar_url: urlFinal })
      .eq("id", userId);

    if (updateError) {
      setMensaje({ texto: "Foto subida, pero no se pudo guardar. Inténtalo de nuevo.", ok: false });
    } else {
      setAvatarUrl(urlFinal);
      setMensaje({ texto: "✅ Foto actualizada correctamente.", ok: true });
      // Resetear input para poder volver a seleccionar la misma foto si hace falta
      if (fileRef.current) fileRef.current.value = "";
    }

    setSubiendo(false);
  }

  async function guardarNombre(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;

    const nombreLimpio = nombreEdit.trim();
    if (!nombreLimpio) {
      setMensaje({ texto: "El nombre no puede estar vacío.", ok: false });
      return;
    }
    if (nombreLimpio === nombre) {
      setMensaje({ texto: "El nombre no ha cambiado.", ok: false });
      return;
    }

    setGuardando(true);
    setMensaje(null);

    const { error } = await supabase
      .from("perfiles")
      .update({ nombre: nombreLimpio })
      .eq("id", userId);

    if (error) {
      setMensaje({ texto: "No se pudo guardar el nombre. Inténtalo de nuevo.", ok: false });
    } else {
      setNombre(nombreLimpio);
      setMensaje({ texto: "✅ Nombre actualizado correctamente.", ok: true });
    }

    setGuardando(false);
  }

  if (cargando) return (
    <div className="flex flex-1 items-center justify-center text-zinc-400">Cargando…</div>
  );

  return (
    <div className="flex flex-col flex-1 max-w-md mx-auto w-full">

      <div className="bg-black text-white px-4 py-8 sm:px-6">
        <span className="text-red-500 text-xs font-black uppercase tracking-[0.25em]">Tu cuenta</span>
        <h1 className="text-3xl font-black mt-1">Mi perfil</h1>
        <p className="text-zinc-500 text-sm mt-1">{email}</p>
      </div>

      <div className="px-4 sm:px-6 py-6 flex flex-col gap-6">
      {/* Foto + botón */}
      <div className="flex flex-col items-center gap-6 bg-white rounded-2xl p-6 sm:p-10 border-2 border-zinc-100 shadow-sm">

        <Avatar nombre={nombre || email || "?"} avatarUrl={avatarUrl} size={110} />

        <div className="text-center">
          <p className="font-black text-black text-xl">{nombre || "Sin nombre"}</p>
          <p className="text-xs text-zinc-400 mt-1">
            Tu foto aparece en la clasificación general
          </p>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={subirFoto}
        />

        <button
          onClick={() => fileRef.current?.click()}
          disabled={subiendo}
          className="bg-black hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 text-white font-bold px-8 py-2.5 rounded-full transition-colors"
        >
          {subiendo ? "Subiendo…" : avatarUrl ? "Cambiar foto" : "Subir foto"}
        </button>

        <p className="text-xs text-zinc-400">JPG, PNG o WebP · Máximo 5 MB</p>
      </div>

      {/* Cambiar nombre */}
      <form
        onSubmit={guardarNombre}
        className="bg-white rounded-2xl p-6 border-2 border-zinc-100 shadow-sm flex flex-col gap-4"
      >
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">
            Nombre en la clasificación
          </label>
          <input
            type="text"
            value={nombreEdit}
            onChange={e => setNombreEdit(e.target.value)}
            maxLength={30}
            placeholder="Tu nombre o alias"
            className="w-full border-2 border-zinc-200 rounded-xl px-4 py-3 text-base font-bold text-black focus:outline-none focus:border-black transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={guardando || nombreEdit.trim() === nombre}
          className="bg-black hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 text-white font-bold px-6 py-2.5 rounded-full transition-colors self-end"
        >
          {guardando ? "Guardando…" : "Guardar nombre"}
        </button>
      </form>

      {mensaje && (
        <p className={`text-sm rounded-lg px-4 py-3 border ${
          mensaje.ok
            ? "text-green-700 bg-green-50 border-green-200"
            : "text-red-600 bg-red-50 border-red-200"
        }`}>
          {mensaje.texto}
        </p>
      )}

      {/* Estadísticas personales */}
      {stats && (
        <div className="bg-white rounded-2xl p-6 border-2 border-zinc-100 shadow-sm flex flex-col gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Mis estadísticas</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">Solo tú puedes ver esto</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-900 text-white rounded-2xl p-4 text-center col-span-2">
              <p className="text-3xl font-black tabular-nums">{stats.total}</p>
              <p className="text-xs text-zinc-400 mt-1">puntos totales</p>
              {stats.totalHistorico > 0 && (
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  {stats.totalHistorico} histórico · {stats.totalApp} en app
                </p>
              )}
            </div>

            <div className="bg-red-50 rounded-2xl p-4 text-center">
              <p className="text-2xl font-black tabular-nums text-red-600">
                {stats.gpsApp > 0 ? stats.media : "—"}
              </p>
              <p className="text-xs text-zinc-500 mt-1">media pts/GP</p>
            </div>

            <div className="bg-zinc-50 rounded-2xl p-4 text-center">
              <p className="text-2xl font-black tabular-nums text-black">{stats.aciertos}</p>
              <p className="text-xs text-zinc-500 mt-1">aciertos</p>
            </div>

            {stats.mejorGP > 0 && (
              <div className="bg-zinc-50 rounded-2xl p-4 text-center col-span-2">
                <p className="text-2xl font-black tabular-nums text-black">{stats.mejorGP} pts</p>
                <p className="text-xs text-zinc-500 mt-1">
                  mejor GP{stats.mejorGPNombre ? ` · ${stats.mejorGPNombre}` : ""}
                </p>
              </div>
            )}
          </div>

          {stats.gpsApp === 0 && (
            <p className="text-xs text-zinc-400 text-center">
              Las estadísticas aparecerán cuando juegues tu primer GP en la app.
            </p>
          )}
        </div>
      )}
      </div>

    </div>
  );
}
