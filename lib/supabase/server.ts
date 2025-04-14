import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/database.types";

// Crear cliente de Supabase para el lado del servidor
export const getSupabaseServer = async () => {
  const cookieStore = await cookies(); // Añadido await aquí

  const supabaseUrl = process.env.SUPABASE_URL as string;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Faltan las variables de entorno de Supabase para el servidor"
    );
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: true,
    },
    global: {
      headers: {
        Cookie: cookieStore.toString(),
      },
    },
  });
};
