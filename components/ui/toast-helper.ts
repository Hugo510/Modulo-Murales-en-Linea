"use client";

// Importar y exportar correctamente la función toast
import React from "react";
import { useToast } from "./use-toast";

// Crear una función toast independiente para uso global
export const toast = (props: any) => {
  // Esta es una implementación temporal que será reemplazada en tiempo de ejecución
  console.warn(
    "Llamada a toast() fuera de un componente. Use useToast() hook dentro de componentes."
  );

  // En entorno de navegador, intentamos acceder a la instancia global si existe
  if (typeof window !== "undefined" && (window as any).__TOAST_INSTANCE) {
    return (window as any).__TOAST_INSTANCE(props);
  }

  // Fallback silencioso
  return { id: "toast-fallback", dismiss: () => {} };
};

// Función para establecer la instancia toast global
export const setToastInstance = (toastFn: any) => {
  if (typeof window !== "undefined") {
    (window as any).__TOAST_INSTANCE = toastFn;
  }
};

// Hook personalizado que actualiza automáticamente la instancia global
export function useGlobalToast() {
  const { toast: toastFn, ...rest } = useToast();

  // Establecer la instancia global
  React.useEffect(() => {
    setToastInstance(toastFn);
    return () => setToastInstance(null);
  }, [toastFn]);

  return { toast: toastFn, ...rest };
}
