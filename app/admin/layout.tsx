import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

const ADMIN_EMAIL = "vihaciteam@gmail.com";

/**
 * Protección de servidor para el panel de administrador.
 * Si el usuario no está identificado o no es el admin,
 * lo redirige a la portada antes de que cargue nada.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    redirect("/");
  }

  return <>{children}</>;
}
