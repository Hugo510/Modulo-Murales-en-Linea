import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

// Crear una instancia singleton del cliente de Supabase para el lado del cliente
let supabaseClient: ReturnType<typeof createClient<Database>> | null = null;

export const getSupabaseClient = () => {
  if (supabaseClient) return supabaseClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Faltan las variables de entorno de Supabase");
  }

  supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  return supabaseClient;
};
