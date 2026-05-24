"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [cargando, setCargando] = useState(false);
  const router      = useRouter();
  const searchParams = useSearchParams();
  const supabase    = createClient();

  useEffect(() => {
    if (searchParams.get("error")) {
      setError("El enlace ha expirado o no es válido. Vuelve a intentarlo.");
    }
    if (searchParams.get("registrado")) {
      setInfo("Cuenta creada. Revisa tu email para confirmarla antes de entrar.");
    }
    // Si ya hay sesión activa, redirigir directamente
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/apuesta");
    });
  }, [searchParams]);

  async function iniciarSesion(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Email o contraseña incorrectos. Comprueba tus datos.");
      setCargando(false);
    } else {
      window.location.href = "/apuesta";
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm flex flex-col gap-6">

        <div className="text-center">
          <h1 className="text-3xl font-black text-black">Bienvenido</h1>
          <p className="text-zinc-400 text-sm mt-1">Entra para hacer tu apuesta</p>
        </div>

        <form onSubmit={iniciarSesion} className="flex flex-col gap-4">
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
              placeholder="••••••••"
              className="border-2 border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
            />
          </div>

          {info && (
            <p className="text-blue-700 text-sm bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
              {info}
            </p>
          )}

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
            {cargando ? "Entrando..." : "Iniciar sesión"}
          </button>

          <Link
            href="/recuperar"
            className="text-center text-sm text-zinc-400 hover:text-black transition-colors"
          >
            ¿Has olvidado tu contraseña?
          </Link>
        </form>

        <p className="text-center text-sm text-zinc-400">
          ¿No tienes cuenta?{" "}
          <Link href="/registro" className="text-black font-bold hover:text-red-600 transition-colors">
            Regístrate
          </Link>
        </p>

      </div>
    </div>
  );
}
