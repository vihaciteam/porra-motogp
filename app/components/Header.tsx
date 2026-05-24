"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type Props = {
  email: string | null;
};

export default function Header({ email }: Props) {
  const router = useRouter();
  const supabase = createClient();

  async function cerrarSesion() {
    await supabase.auth.signOut();
    router.refresh();
  }

  return (
    <header className="bg-black px-6 py-4 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-3">
        <span className="text-red-500 text-2xl font-black tracking-tight">PORRA</span>
        <span className="text-white text-2xl font-black tracking-tight">MOTOGP</span>
      </Link>
      <nav className="flex gap-6 text-sm text-zinc-400 items-center">
        <Link href="/apuesta" className="hover:text-white transition-colors">
          Apuesta
        </Link>
        <Link href="/general" className="hover:text-white transition-colors">
          General
        </Link>
        <Link href="/clasificacion" className="hover:text-white transition-colors">
          GP actual
        </Link>
        {email ? (
          <>
            <span className="text-zinc-500 hidden sm:inline">{email}</span>
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
    </header>
  );
}
