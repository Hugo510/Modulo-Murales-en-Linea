import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

// Singleton para el cliente de Supabase
let supabaseClientInstance: ReturnType<typeof createClient<Database>> | null =
  null;

// Crear cliente de Supabase para el lado del cliente
export const getSupabaseClient = () => {
  // Si ya existe una instancia, devolverla directamente
  if (supabaseClientInstance) {
    return supabaseClientInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Faltan las variables de entorno de Supabase para el cliente"
    );
  }

  // Crear una nueva instancia solo si no existe
  supabaseClientInstance = createClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: "supabase-auth", // Clave específica para el almacenamiento
      },
    }
  );

  return supabaseClientInstance;
};
