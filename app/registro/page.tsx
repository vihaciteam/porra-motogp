"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function RegistroPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [registrado, setRegistrado] = useState(false);
  const supabase = createClient();

  async function registrarse(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError("");

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      setCargando(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre },
      },
    });

    if (error) {
      setError("No se pudo crear la cuenta. Prueba con otro email.");
      setCargando(false);
    } else {
      setRegistrado(true);
    }
  }

  if (registrado) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16 text-center">
        <div className="flex flex-col gap-4 max-w-sm">
          <div className="text-5xl">✅</div>
          <h2 className="text-2xl font-black text-black">¡Cuenta creada!</h2>
          <p className="text-zinc-500 text-sm">
            Hemos enviado un email de confirmación a <strong>{email}</strong>.
            Ábrelo y pulsa el enlace para activar tu cuenta.
          </p>
          <Link
            href="/login"
            className="mt-4 bg-black text-white font-bold py-3 rounded-full hover:bg-zinc-800 transition-colors"
          >
            Ir al login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm flex flex-col gap-6">

        <div className="text-center">
          <h1 className="text-3xl font-black text-black">Crear cuenta</h1>
          <p className="text-zinc-400 text-sm mt-1">Únete a la porra</p>
        </div>

        <form onSubmit={registrarse} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-black">Tu nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              placeholder="Como quieres aparecer en la clasificación"
              className="border-2 border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
            />
          </div>

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

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-black">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Mínimo 6 caracteres"
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
            className="bg-red-600 hover:bg-red-700 disabled:bg-zinc-200 disabled:text-zinc-400 text-white font-bold py-3 rounded-full transition-colors mt-2"
          >
            {cargando ? "Creando cuenta..." : "Registrarse"}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-400">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-black font-bold hover:text-red-600 transition-colors">
            Inicia sesión
          </Link>
        </p>

      </div>
    </div>
  );
}
