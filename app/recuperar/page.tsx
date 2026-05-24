"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function RecuperarPage() {
  const [email, setEmail]       = useState("");
  const [enviado, setEnviado]   = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError]       = useState("");

  const supabase = createClient();

  async function enviarEmail(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/recuperar/nueva`,
    });

    if (error) {
      setError("No se pudo enviar el email. Comprueba la dirección.");
    } else {
      setEnviado(true);
    }
    setCargando(false);
  }

  if (enviado) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm flex flex-col gap-6 text-center">
          <div className="text-5xl">📧</div>
          <h1 className="text-2xl font-black text-black">Revisa tu correo</h1>
          <p className="text-zinc-400 text-sm">
            Te hemos enviado un enlace a <strong>{email}</strong> para restablecer tu contraseña.
            Puede tardar unos minutos.
          </p>
          <Link href="/login" className="text-sm text-zinc-400 hover:text-black transition-colors">
            ← Volver al login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm flex flex-col gap-6">

        <div className="text-center">
          <h1 className="text-3xl font-black text-black">¿Olvidaste tu contraseña?</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Escribe tu email y te mandamos un enlace para cambiarla.
          </p>
        </div>

        <form onSubmit={enviarEmail} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-black">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@email.com"
              className="border-2 border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
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
            className="bg-black hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 text-white font-bold py-3 rounded-full transition-colors mt-2"
          >
            {cargando ? "Enviando..." : "Enviar enlace"}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-400">
          <Link href="/login" className="text-black font-bold hover:text-red-600 transition-colors">
            ← Volver al login
          </Link>
        </p>

      </div>
    </div>
  );
}
