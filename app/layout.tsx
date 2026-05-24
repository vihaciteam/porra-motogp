import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Porra MotoGP",
  description: "La porra de MotoGP para jugar con amigos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="bg-black px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-red-500 text-2xl font-black tracking-tight">PORRA</span>
            <span className="text-white text-2xl font-black tracking-tight">MOTOGP</span>
          </Link>
          <nav className="flex gap-6 text-sm text-zinc-400">
            <Link href="/apuesta" className="hover:text-white transition-colors">Hacer apuesta</Link>
            <Link href="/clasificacion" className="hover:text-white transition-colors">Clasificación</Link>
          </nav>
        </header>
        {children}
        <footer className="mt-auto bg-black text-zinc-600 text-center text-sm py-4">
          Porra MotoGP · Hecho con amigos
        </footer>
      </body>
    </html>
  );
}
