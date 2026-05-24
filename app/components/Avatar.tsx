"use client";

import { useState } from "react";

const COLORES = [
  "bg-red-500",    "bg-orange-500", "bg-amber-600",
  "bg-green-600",  "bg-teal-500",   "bg-blue-500",
  "bg-violet-600", "bg-pink-500",
];

function colorPorNombre(nombre: string): string {
  let hash = 0;
  for (const c of nombre) hash += c.charCodeAt(0);
  return COLORES[hash % COLORES.length];
}

function slugify(nombre: string): string {
  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export function Avatar({
  nombre,
  avatarUrl,
  size = 44,
}: {
  nombre: string;
  avatarUrl?: string | null;
  size?: number;
}) {
  const [error, setError] = useState(false);
  const iniciales = nombre.slice(0, 2).toUpperCase();

  // Prioridad: foto subida por el usuario → foto local admin → iniciales
  const src = avatarUrl ?? `/avatars/${slugify(nombre)}.jpg`;

  if (!error) {
    return (
      <div
        className="rounded-full overflow-hidden shrink-0 ring-2 ring-white shadow"
        style={{ width: size, height: size, minWidth: size }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={nombre}
          className="w-full h-full object-cover"
          onError={() => setError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`rounded-full shrink-0 flex items-center justify-center text-white font-black ring-2 ring-white shadow ${colorPorNombre(nombre)}`}
      style={{ width: size, height: size, minWidth: size, fontSize: size * 0.38 }}
    >
      {iniciales}
    </div>
  );
}
