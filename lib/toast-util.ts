"use client";

// Una implementación simplificada de toast que no depende de otras utilidades
import { Toast as toastFromShadcn } from "@/components/ui/toast";

// Este es un envoltorio (wrapper) simple para el toast
// que garantiza que sea una función y maneje los errores adecuadamente
export function toast(props: {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}) {
  try {
    // Si toastFromShadcn es una función, úsala
    if (typeof toastFromShadcn === "function") {
      return toastFromShadcn(props);
    }

    // Plan B: usar console.log como fallback si el toast no funciona
    console.log(
      `[Toast] ${props.variant === "destructive" ? "ERROR" : "INFO"}: ${
        props.title
      } - ${props.description}`
    );

    // Devolver un objeto similar al que devolvería el toast original
    return {
      id: Date.now().toString(),
      dismiss: () => {},
      update: () => {},
    };
  } catch (error) {
    // Si algo falla, al menos registramos el error y mostramos los mensajes en la consola
    console.error("Error al mostrar toast:", error);
    console.log(`[Toast Fallback] ${props.title}: ${props.description}`);

    return {
      id: Date.now().toString(),
      dismiss: () => {},
      update: () => {},
    };
  }
}
