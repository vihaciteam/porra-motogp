import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import { createClient } from "@/utils/supabase/server";

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
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black",
    title: "Podium MotoGP 2026",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col pb-16 sm:pb-0 bg-zinc-50">
        <Header email={user?.email ?? null} />
        {children}
        <footer className="mt-auto bg-black text-zinc-600 text-center text-sm py-4 hidden sm:block">
          Porra MotoGP · Hecho con amigos
        </footer>
        <BottomNav email={user?.email ?? null} />
      </body>
    </html>
  );
}
