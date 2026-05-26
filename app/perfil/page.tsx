"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Avatar } from "@/app/components/Avatar";

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
      </div>

    </div>
  );
}
