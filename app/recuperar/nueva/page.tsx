"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function NuevaContrasenaPage() {
  const [password,  setPassword]  = useState("");
  const [password2, setPassword2] = useState("");
  const [cargando,  setCargando]  = useState(false);
  const [error,     setError]     = useState("");
  const [listo,     setListo]     = useState(false);
  const [sinSesion, setSinSesion] = useState(false);

  const supabase = createClient();
  const router   = useRouter();

  useEffect(() => {
    // Verificar que hay una sesión activa (establecida por /auth/callback)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) setSinSesion(true);
    });
  }, []);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== password2) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setCargando(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError("No se pudo actualizar la contraseña. El enlace puede haber expirado.");
      setCargando(false);
    } else {
      setListo(true);
      setTimeout(() => router.push("/login"), 3000);
    }
  }

  if (listo) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16 bg-zinc-50">
        <div className="w-full max-w-sm text-center flex flex-col items-center gap-4">
          <div className="text-5xl">✅</div>
          <h1 className="text-2xl font-black text-black">¡Contraseña actualizada!</h1>
          <p className="text-zinc-400 text-sm">Redirigiendo al login en unos segundos…</p>
          <Link href="/login" className="text-sm font-bold text-black hover:text-red-600 transition-colors">
            Ir al login →
          </Link>
        </div>
      </div>
    );
  }

  if (sinSesion) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16 bg-zinc-50">
        <div className="w-full max-w-sm text-center flex flex-col items-center gap-4 bg-white rounded-2xl p-8 shadow-sm border border-zinc-100">
          <div className="text-5xl">⚠️</div>
          <h1 className="text-xl font-black text-black">Enlace expirado o inválido</h1>
          <p className="text-zinc-400 text-sm">
            Este enlace ya no es válido. Solicita uno nuevo desde la página de recuperación.
          </p>
          <Link
            href="/recuperar"
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-full transition-colors"
          >
            Solicitar nuevo enlace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16 bg-zinc-50">
      <div className="w-full max-w-sm flex flex-col gap-6">

        <div className="text-center">
          <div className="inline-flex items-center gap-1 mb-4">
            <span className="text-red-500 text-2xl font-black tracking-tighter">PORRA</span>
            <span className="text-zinc-400 text-2xl font-black">/</span>
            <span className="text-black text-2xl font-black tracking-tighter">MOTOGP</span>
          </div>
          <h1 className="text-3xl font-black text-black">Nueva contraseña</h1>
          <p className="text-zinc-400 text-sm mt-1">Elige una contraseña nueva para tu cuenta.</p>
        </div>

        <form onSubmit={guardar} className="flex flex-col gap-4 bg-white rounded-2xl p-6 shadow-sm border border-zinc-100">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-black">Nueva contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Mínimo 6 caracteres"
              className="border-2 border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors bg-white text-black"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-black">Repite la contraseña</label>
            <input
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              required
              placeholder="••••••••"
              className="border-2 border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors bg-white text-black"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="bg-red-600 hover:bg-red-700 disabled:bg-zinc-200 disabled:text-zinc-400 text-white font-bold py-3 rounded-full transition-colors mt-2"
          >
            {cargando ? "Guardando..." : "Guardar contraseña"}
          </button>
        </form>

      </div>
    </div>
  );
}
