type LogLevel = "debug" | "info" | "warn" | "error";

// Configuración para CSRF logging
const CSRF_LOG_ENABLED =
  process.env.NODE_ENV !== "production" ||
  process.env.ENABLE_CSRF_LOGS === "true";
const LOG_LEVEL: LogLevel = (process.env.CSRF_LOG_LEVEL as LogLevel) || "info";

// Niveles de log y sus prioridades
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Logger especializado para operaciones CSRF
 */
export function csrfLog(level: LogLevel, message: string, ...args: any[]) {
  // Solo registrar si el nivel es mayor o igual que el configurado
  if (!CSRF_LOG_ENABLED || LOG_LEVELS[level] < LOG_LEVELS[LOG_LEVEL]) {
    return;
  }

  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [CSRF] [${level.toUpperCase()}]`;

  switch (level) {
    case "debug":
      console.debug(`${prefix} ${message}`, ...args);
      break;
    case "info":
      console.log(`${prefix} ${message}`, ...args);
      break;
    case "warn":
      console.warn(`${prefix} ${message}`, ...args);
      break;
    case "error":
      console.error(`${prefix} ${message}`, ...args);
      break;
  }

  // Aquí podrías implementar lógica adicional como enviar a un servicio de logs
}

/**
 * Herramientas de debug para CSRF
 */
export function debugCsrfCookies() {
  if (!CSRF_LOG_ENABLED) return;

  try {
    const cookies = document.cookie.split(";");
    csrfLog("debug", `Cookies en cliente: ${cookies.length}`);
    cookies.forEach((cookie) => {
      const [name, value] = cookie.trim().split("=");
      if (name.includes("csrf")) {
        csrfLog("debug", `Cookie: ${name}=${value?.substring(0, 6)}...`);
      }
    });
  } catch (e) {
    csrfLog("error", "Error al depurar cookies:", e);
  }
}
