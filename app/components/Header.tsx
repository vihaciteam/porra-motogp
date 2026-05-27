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
      {/* Línea roja inferior */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-600 to-transparent" />

      {/* ── Barra principal ── */}
      <div className="px-5 py-3.5 flex items-center justify-between">
        <Link href="/" onClick={cerrar} className="flex items-center gap-1 group">
          <span className="text-red-500 text-xl font-black tracking-tighter group-hover:text-red-400 transition-colors">PORRA</span>
          <span className="text-zinc-600 text-xl font-black">/</span>
          <span className="text-white text-xl font-black tracking-tighter">MOTOGP</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-1 text-sm text-zinc-400 items-center">
          {[
            { href: "/apuesta",        label: "Mi apuesta" },
            { href: "/historial",      label: "Historial" },
            { href: "/general",        label: "General" },
            { href: "/clasificacion",  label: "GP actual" },
            { href: "/estadisticas",   label: "Estadísticas" },
            { href: "/reglas",         label: "Normas" },
          ].map(({ href, label }) => (
            <Link key={href} href={href}
              className="px-3 py-1.5 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors">
              {label}
            </Link>
          ))}

          {email ? (
            <>
              {email === ADMIN_EMAIL && (
                <Link href="/admin"
                  className="px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-950 hover:text-red-400 font-bold transition-colors">
                  Admin
                </Link>
              )}
              <Link href="/perfil"
                className="px-3 py-1.5 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors">
                Mi perfil
              </Link>
              <button onClick={cerrarSesion}
                className="ml-2 px-4 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:border-red-600 hover:text-red-500 font-medium transition-colors text-sm">
                Salir
              </button>
            </>
          ) : (
            <Link href="/login"
              className="ml-2 bg-red-600 hover:bg-red-500 text-white px-5 py-1.5 rounded-full font-bold transition-colors shadow-lg shadow-red-900/30">
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

      {/* ── Menú móvil ── */}
      {menuAbierto && (
        <nav className="md:hidden bg-zinc-950 border-t border-zinc-800 flex flex-col py-2">
          {[
            { href: "/apuesta",        label: "Mi apuesta",    icon: "🗳️" },
            { href: "/historial",      label: "Historial",    icon: "🏁" },
            { href: "/general",        label: "General",      icon: "📊" },
            { href: "/clasificacion",  label: "GP actual",    icon: "🏎️" },
            { href: "/estadisticas",   label: "Estadísticas", icon: "📈" },
            { href: "/reglas",         label: "Normas",       icon: "📋" },
          ].map(({ href, label, icon }) => (
            <Link key={href} href={href} onClick={cerrar}
              className="flex items-center gap-3 px-5 py-3.5 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors">
              <span>{icon}</span><span>{label}</span>
            </Link>
          ))}

          {email ? (
            <>
              {email === ADMIN_EMAIL && (
                <Link href="/admin" onClick={cerrar}
                  className="flex items-center gap-3 px-5 py-3.5 text-red-500 hover:bg-zinc-800 font-bold transition-colors">
                  <span>⚙️</span><span>Admin</span>
                </Link>
              )}
              <Link href="/perfil" onClick={cerrar}
                className="flex items-center gap-3 px-5 py-3.5 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors">
                <span>👤</span><span>Mi perfil</span>
              </Link>
              <button onClick={cerrarSesion}
                className="flex items-center gap-3 px-5 py-3.5 text-red-500 hover:bg-zinc-800 font-medium transition-colors w-full text-left">
                <span>🚪</span><span>Salir</span>
              </button>
            </>
          ) : (
            <Link href="/login" onClick={cerrar}
              className="mx-5 my-3 bg-red-600 hover:bg-red-500 text-white px-4 py-3 rounded-full font-bold text-center transition-colors">
              Entrar
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
