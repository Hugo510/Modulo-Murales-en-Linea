import { getSupabaseServer } from "@/lib/supabase/server";

// Funciones del servidor que pueden ser llamadas desde APIs o rutas del servidor
export async function serverAuthActions() {
  const supabase = await getSupabaseServer();
  // Implementar acciones de autenticación del lado del servidor
  // ...
}
