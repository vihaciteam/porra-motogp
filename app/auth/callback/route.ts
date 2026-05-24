import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * Ruta de callback de Supabase.
 * Gestiona el intercambio de código seguro después del login,
 * confirmación de email y restablecimiento de contraseña.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Si algo falla, volvemos al login con un aviso
  return NextResponse.redirect(`${origin}/login?error=1`);
}
