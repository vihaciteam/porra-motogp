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
  const [cargando,  setCargando]  = useState(true);
  const [subiendo,  setSubiendo]  = useState(false);
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
        setAvatarUrl(perfil.avatar_url ?? null);
      }
      setCargando(false);
    }
    cargar();
  }, []);

  async function subirFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    if (file.size > 2 * 1024 * 1024) {
      setMensaje({ texto: "La foto no puede superar 2 MB.", ok: false });
      return;
    }

    setSubiendo(true);
    setMensaje(null);

    // Subir a Supabase Storage (sobreescribe si ya existe)
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(userId, file, { upsert: true, cacheControl: "3600" });

    if (uploadError) {
      setMensaje({ texto: "Error al subir la foto. Inténtalo de nuevo.", ok: false });
      setSubiendo(false);
      return;
    }

    // Obtener URL pública con timestamp para evitar caché
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
    }

    setSubiendo(false);
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

        <p className="text-xs text-zinc-400">JPG, PNG o WebP · Máximo 2 MB</p>
      </div>

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
