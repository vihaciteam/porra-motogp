"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  email: string | null;
};

const links = [
  { href: "/apuesta",   label: "Apostar",   icon: "🗳️" },
  { href: "/general",   label: "General",   icon: "📊" },
  { href: "/noticias",  label: "Noticias",  icon: "📰" },
  { href: "/historial", label: "Historial", icon: "🏁" },
];

export default function BottomNav({ email }: Props) {
  const path = usePathname();

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-zinc-100 flex z-50 safe-area-pb">
      {links.map(({ href, label, icon }) => {
        const activo = path === href || path.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center pt-2 pb-3 gap-0.5 transition-colors ${
              activo ? "text-red-600" : "text-zinc-400"
            }`}
          >
            <span className="text-2xl leading-none">{icon}</span>
            <span className={`text-[10px] font-medium ${activo ? "font-bold" : ""}`}>{label}</span>
          </Link>
        );
      })}
      <Link
        href={email ? "/perfil" : "/login"}
        className={`flex-1 flex flex-col items-center pt-2 pb-3 gap-0.5 transition-colors ${
          path === "/perfil" || path === "/login" ? "text-red-600" : "text-zinc-400"
        }`}
      >
        <span className="text-2xl leading-none">{email ? "👤" : "🔑"}</span>
        <span className={`text-[10px] font-medium ${
          path === "/perfil" || path === "/login" ? "font-bold" : ""
        }`}>
          {email ? "Perfil" : "Entrar"}
        </span>
      </Link>
    </nav>
  );
}
