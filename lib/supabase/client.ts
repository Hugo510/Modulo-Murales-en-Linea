import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

// Singleton para el cliente de Supabase
let supabaseClientInstance: ReturnType<typeof createClient<Database>> | null =
  null;

// Crear cliente de Supabase para el lado del cliente
export const getSupabaseClient = () => {
  // Añadimos un log de diagnóstico
  const isInstanceExists = !!supabaseClientInstance;
  console.log(
    "[Supabase] getSupabaseClient llamado, instancia existente:",
    isInstanceExists
  );

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
  console.log("[Supabase] Creando nueva instancia de cliente");

  supabaseClientInstance = createClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: "supabase-auth-" + Date.now(), // Clave única para evitar conflictos
      },
    }
  );

  return supabaseClientInstance;
};

// Agregamos esta función para evitar redirecciones duplicadas
export function safeRedirectAfterLogin(destination: string): void {
  // Verificar si ya hay una redirección en curso
  const redirectionInProgress = sessionStorage.getItem(
    "redirection_in_progress"
  );
  if (redirectionInProgress) {
    console.log(
      "[Supabase] Redirección ya en curso, ignorando solicitud adicional"
    );
    return;
  }

  // Marcar redirección en curso
  sessionStorage.setItem("redirection_in_progress", "true");
  console.log(`[Supabase] Iniciando redirección segura a: ${destination}`);

  // Para redirecciones al dashboard, usar URL absoluta para forzar recarga completa
  if (destination.startsWith("/dashboard")) {
    // Obtener URL base del sitio
    const baseUrl = window.location.origin;
    const fullUrl = `${baseUrl}${destination}`;
    console.log(`[Supabase] Redirección absoluta a: ${fullUrl}`);
    window.location.href = fullUrl;
  } else {
    window.location.href = destination;
  }

  // Desmarcar después de un tiempo prudente
  setTimeout(() => {
    sessionStorage.removeItem("redirection_in_progress");
  }, 5000);
}
