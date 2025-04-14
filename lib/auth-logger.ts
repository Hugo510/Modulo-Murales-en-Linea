import { logError } from "./logger";

// Tipos para eventos de autenticación
type AuthLogLevel = "debug" | "info" | "warn" | "error";
type AuthAction =
  | "auth_attempt"
  | "auth_success"
  | "auth_error"
  | "invalid_credentials"
  | "rate_limited"
  | "auth_unhandled_error"
  | "token_refresh"
  | "session_expired";

interface AuthLogParams {
  action: AuthAction;
  email: string;
  info: string;
  level: AuthLogLevel;
  error?: unknown;
  metadata?: Record<string, any>;
}

/**
 * Sistema especializado de logging para eventos de autenticación
 */
export function logAuth({
  action,
  email,
  info,
  level = "info",
  error = null,
  metadata = {},
}: AuthLogParams): void {
  // Sanitizar el email para logging (mostrar solo primeros caracteres)
  const sanitizedEmail = email
    ? `${email.substring(0, 3)}***@${email.split("@")[1] || ""}`
    : "unknown";

  // Crear objeto de log
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    level,
    email: sanitizedEmail,
    info,
    metadata: {
      ...metadata,
      // Datos de entorno que pueden ser útiles para diagnóstico
      userAgent:
        typeof window !== "undefined" ? window.navigator.userAgent : "server",
      url: typeof window !== "undefined" ? window.location.pathname : "server",
    },
  };

  // Determinar el comportamiento según el nivel de log
  switch (level) {
    case "debug":
      if (process.env.NODE_ENV !== "production") {
        console.debug(`[Auth:${action}] ${info}`, logEntry);
      }
      break;
    case "info":
      console.log(`[Auth:${action}] ${info}`);
      break;
    case "warn":
      console.warn(`[Auth:${action}] ${info}`, metadata);
      break;
    case "error":
      console.error(`[Auth:${action}] ${info}`);

      // Para errores, usar el sistema centralizado de registro de errores
      if (error) {
        logError({
          source: "auth-service",
          message: `[${action}] ${info}`,
          error,
          context: {
            email: sanitizedEmail,
            ...metadata,
          },
          level: "error",
          notify: action === "auth_unhandled_error", // Notificar solo errores críticos
        });
      }
      break;
  }

  // En producción, aquí podríamos enviar logs a un servicio externo
  if (process.env.NODE_ENV === "production") {
    // Implementación futura: envío a servicio externo de logs
    // sendToExternalLogService(logEntry);
  }

  // Para ciertos eventos de autenticación, guardar en la base de datos
  const actionsToStore = ["auth_error", "invalid_credentials", "rate_limited"];
  if (actionsToStore.includes(action)) {
    storeAuthEventInDatabase(logEntry).catch((err) => {
      console.error(
        "Error al guardar evento de autenticación en base de datos:",
        err
      );
    });
  }
}

/**
 * Almacena eventos de autenticación relevantes en la base de datos
 */
async function storeAuthEventInDatabase(logEntry: any): Promise<void> {
  try {
    // Importación dinámica para evitar problemas de cliente/servidor
    const { getSupabaseClient } = await import("@/lib/supabase/client");
    const supabase = getSupabaseClient();

    await supabase.from("auth_logs").insert({
      action: logEntry.action,
      email: logEntry.email,
      info: logEntry.info,
      metadata: logEntry.metadata,
      timestamp: logEntry.timestamp,
      level: logEntry.level,
    });
  } catch (error) {
    console.error("Error al guardar log de autenticación:", error);
  }
}
