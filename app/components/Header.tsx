"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const ADMIN_EMAIL = "vihaciteam@gmail.com";

type Props = {
  email: string | null;
};

export default function Header({ email }: Props) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const router   = useRouter();
  const supabase = createClient();

  async function cerrarSesion() {
    await supabase.auth.signOut();
    setMenuAbierto(false);
    router.refresh();
  }

  const cerrar = () => setMenuAbierto(false);

  return (
    <header className="bg-black relative z-50">
      {/* ── Barra principal ── */}
      <div className="px-5 py-4 flex items-center justify-between">
        <Link href="/" onClick={cerrar} className="flex items-center gap-2">
          <span className="text-red-500 text-2xl font-black tracking-tight">PORRA</span>
          <span className="text-white text-2xl font-black tracking-tight">MOTOGP</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-6 text-sm text-zinc-400 items-center">
          <Link href="/apuesta"      className="hover:text-white transition-colors">Mi apuesta</Link>
          <Link href="/noticias"     className="hover:text-white transition-colors">Noticias</Link>
          <Link href="/historial"    className="hover:text-white transition-colors">Historial</Link>
          <Link href="/general"      className="hover:text-white transition-colors">General</Link>
          <Link href="/clasificacion" className="hover:text-white transition-colors">GP actual</Link>
          {email ? (
            <>
              {email === ADMIN_EMAIL && (
                <Link href="/admin" className="text-red-500 hover:text-red-400 font-medium transition-colors">
                  Admin
                </Link>
              )}
              <Link href="/perfil" className="hover:text-white transition-colors">Mi perfil</Link>
              <button
                onClick={cerrarSesion}
                className="text-red-500 hover:text-red-400 transition-colors font-medium"
              >
                Salir
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-full font-medium transition-colors"
            >
              Entrar
            </Link>
          )}
        </nav>

        {/* Mobile: botón hamburguesa */}
        <button
          onClick={() => setMenuAbierto((v) => !v)}
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label="Abrir menú"
        >
          <span className={`block w-6 h-0.5 bg-white transition-all duration-200 ${menuAbierto ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-6 h-0.5 bg-white transition-all duration-200 ${menuAbierto ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-0.5 bg-white transition-all duration-200 ${menuAbierto ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* ── Menú móvil desplegable ── */}
      {menuAbierto && (
        <nav className="md:hidden bg-zinc-900 border-t border-zinc-800 flex flex-col py-2">
          <Link href="/apuesta"      onClick={cerrar} className="px-5 py-3.5 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors">Mi apuesta</Link>
          <Link href="/noticias"     onClick={cerrar} className="px-5 py-3.5 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors">Noticias</Link>
          <Link href="/historial"    onClick={cerrar} className="px-5 py-3.5 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors">Historial</Link>
          <Link href="/general"      onClick={cerrar} className="px-5 py-3.5 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors">General</Link>
          <Link href="/clasificacion" onClick={cerrar} className="px-5 py-3.5 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors">GP actual</Link>
          {email ? (
            <>
              {email === ADMIN_EMAIL && (
                <Link href="/admin" onClick={cerrar} className="px-5 py-3.5 text-red-500 hover:text-red-400 hover:bg-zinc-800 font-medium transition-colors">
                  Admin
                </Link>
              )}
              <Link href="/perfil" onClick={cerrar} className="px-5 py-3.5 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors">Mi perfil</Link>
              <button
                onClick={cerrarSesion}
                className="text-left px-5 py-3.5 text-red-500 hover:text-red-400 hover:bg-zinc-800 font-medium transition-colors"
              >
                Salir
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={cerrar}
              className="mx-5 my-3 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-full font-medium text-center transition-colors"
            >
              Entrar
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
