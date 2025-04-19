/**
 * Utilidad para gestionar logs de la aplicación de forma centralizada.
 * Facilita depuración y seguimiento de acciones.
 */

// Niveles de log disponibles
export type LogLevel = "info" | "warn" | "error" | "debug";

// Configuración para habilitar/deshabilitar logs según entorno
const isLogEnabled =
  process.env.NODE_ENV !== "production" ||
  localStorage.getItem("enableLogs") === "true";
const logLevel = (localStorage.getItem("logLevel") || "info") as LogLevel;

// Mapeo de niveles de log a colores en consola
const logColors = {
  info: "#2563eb", // blue
  warn: "#f59e0b", // amber
  error: "#dc2626", // red
  debug: "#10b981", // emerald
};

// Niveles de log ordenados por importancia
const logLevelOrder = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

/**
 * Registra un mensaje en la consola si el logging está habilitado
 */
export function log(
  message: string,
  level: LogLevel = "info",
  data?: any,
  component = "App"
) {
  // Solo mostrar logs si están habilitados y el nivel es adecuado
  if (!isLogEnabled || logLevelOrder[level] > logLevelOrder[logLevel]) {
    return;
  }

  const timestamp = new Date().toISOString().slice(11, 23);
  const prefix = `%c[${timestamp}] [${component}] [${level.toUpperCase()}]`;
  const style = `color: ${logColors[level]}; font-weight: bold;`;

  if (data) {
    console.groupCollapsed(prefix, style, message);
    console.log("Datos:", data);
    console.groupEnd();
  } else {
    console.log(prefix, style, message);
  }
}

/**
 * Funciones específicas para cada nivel de log
 */
export const logger = {
  info: (message: string, data?: any, component = "App") =>
    log(message, "info", data, component),
  warn: (message: string, data?: any, component = "App") =>
    log(message, "warn", data, component),
  error: (message: string, data?: any, component = "App") =>
    log(message, "error", data, component),
  debug: (message: string, data?: any, component = "App") =>
    log(message, "debug", data, component),

  // Grupo de logs para operaciones compuestas
  group: (name: string, level: LogLevel = "info", component = "App") => {
    if (!isLogEnabled || logLevelOrder[level] > logLevelOrder[logLevel]) {
      return;
    }
    const timestamp = new Date().toISOString().slice(11, 23);
    const prefix = `%c[${timestamp}] [${component}] [${level.toUpperCase()}]`;
    const style = `color: ${logColors[level]}; font-weight: bold;`;

    console.group(prefix, style, name);
  },

  groupEnd: () => {
    if (isLogEnabled) {
      console.groupEnd();
    }
  },

  // Añadir helper para depuración rápida del estado de montaje
  logMountState: (component: string, mounted: boolean, extraData?: any) => {
    if (!isLogEnabled) return;

    const state = mounted ? "MONTADO" : "DESMONTADO";
    const timestamp = new Date().toISOString().slice(11, 23);
    const prefix = `%c[${timestamp}] [${component}] [INFO]`;
    const style = `color: ${
      mounted ? "#22c55e" : "#ef4444"
    }; font-weight: bold;`;

    console.log(prefix, style, `Componente ${state}`);
    if (extraData) console.log("Datos:", extraData);
  },
};

import React, { useEffect } from "react";

// Función de utilidad para verificar el estado del componente
export function withMountLogging<P extends object>(
  Component: React.FC<P>,
  componentName: string
): React.FC<P> {
  return function LoggingWrapper(props: P) {
    useEffect(() => {
      logger.logMountState(componentName, true);
      return () => {
        logger.logMountState(componentName, false);
      };
    }, []);

    return React.createElement(Component, props);
  };
}

// Función para habilitar/deshabilitar logs desde la consola del navegador
(window as any).enableLogs = (enable = true, level = "info") => {
  localStorage.setItem("enableLogs", enable.toString());
  localStorage.setItem("logLevel", level);
  console.log(
    `Logs ${enable ? "habilitados" : "deshabilitados"} con nivel: ${level}`
  );
  return `Logs ${
    enable ? "habilitados" : "deshabilitados"
  } con nivel: ${level}`;
};
