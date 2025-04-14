/**
 * Sistema centralizado de registro de errores
 *
 * Este módulo proporciona funciones para registrar errores de forma consistente
 * en toda la aplicación. Los errores pueden ser enviados a servicios externos
 * como Sentry o almacenados en la base de datos según la configuración.
 */

interface LogErrorOptions {
  source: string; // Componente o área que generó el error
  message: string; // Mensaje descriptivo del error
  error: unknown; // El objeto de error original
  context?: Record<string, any>; // Datos adicionales para contextualizar el error
  level?: "error" | "warning" | "info"; // Nivel de gravedad
  notify?: boolean; // Si se debe notificar a los administradores
}

/**
 * Registra un error en el sistema
 */
export function logError({
  source,
  message,
  error,
  context = {},
  level = "error",
  notify = false,
}: LogErrorOptions): void {
  // Extraer información útil del error
  const errorObj = error instanceof Error ? error : new Error(String(error));
  const errorInfo = {
    name: errorObj.name,
    message: errorObj.message,
    stack: errorObj.stack,
    cause: (errorObj as any).cause,
  };

  // Objeto completo del log
  const logEntry = {
    timestamp: new Date().toISOString(),
    source,
    message,
    error: errorInfo,
    context,
    level,
  };

  // Registrar en la consola para desarrollo
  console.error(`[${source}] ${message}`, {
    error: errorInfo,
    context,
  });

  // Aquí se podría implementar el envío a servicios externos
  // como Sentry, LogRocket, etc.
  if (process.env.NODE_ENV === "production") {
    // TODO: Implementar integración con servicio de monitoreo de errores
    // ejemplo: Sentry.captureException(errorObj, { extra: { ...context } });
  }

  // Si es un error crítico, se podría guardar en base de datos
  if (level === "error") {
    persistErrorToDatabase(logEntry).catch((e) => {
      console.error("Error al persistir el error en la base de datos:", e);
    });
  }

  // Notificar a los administradores si es necesario
  if (notify) {
    notifyAdmins(logEntry).catch((e) => {
      console.error("Error al notificar a los administradores:", e);
    });
  }
}

/**
 * Guarda el error en la base de datos para análisis posterior
 */
async function persistErrorToDatabase(logEntry: any): Promise<void> {
  // Aquí iría la lógica para guardar en la base de datos
  // Por ahora solo es un placeholder
  try {
    // const { data, error } = await supabase
    //   .from('error_logs')
    //   .insert([logEntry]);
    // if (error) throw error;
  } catch (e) {
    console.error("Error al persistir en base de datos:", e);
  }
}

/**
 * Notifica a los administradores sobre errores críticos
 */
async function notifyAdmins(logEntry: any): Promise<void> {
  // Implementación de notificaciones (email, slack, etc)
  // Por ahora solo es un placeholder
  try {
    // const admins = await getAdminContacts();
    // await sendNotification(admins, {
    //   subject: `Error: ${logEntry.message}`,
    //   body: JSON.stringify(logEntry, null, 2)
    // });
  } catch (e) {
    console.error("Error al notificar a administradores:", e);
  }
}
