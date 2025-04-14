"use client";

import { useState, useEffect, useCallback } from "react";

// Variable global para almacenar el token entre instancias del hook
let globalCsrfToken: string | null = null;
// Variable global para controlar si hay una solicitud en curso
let isGlobalRequesting = false;
// Tiempo de la última obtención exitosa del token
let lastTokenFetchTime = 0;

// Hook para usar el token CSRF en componentes del cliente
export function useCsrfToken() {
  const [token, setToken] = useState<string | null>(globalCsrfToken);
  const [requestId] = useState(() =>
    Math.random().toString(36).substring(2, 10)
  );

  // Función para obtener un token CSRF
  const fetchCsrfToken = useCallback(
    async (force = false): Promise<string> => {
      if (isGlobalRequesting && !force) {
        console.log(`[CSRF:${requestId}] Esperando solicitud en curso...`);
        // Esperar a que la solicitud actual termine
        return new Promise((resolve) => {
          const checkInterval = setInterval(() => {
            if (!isGlobalRequesting && globalCsrfToken) {
              clearInterval(checkInterval);
              resolve(globalCsrfToken);
            }
          }, 100);

          // Añadir timeout para evitar esperas indefinidas
          setTimeout(() => {
            clearInterval(checkInterval);
            const fallback =
              "timeout-token-" + Math.random().toString(36).substring(2);
            console.warn(
              `[CSRF:${requestId}] Timeout esperando token, usando fallback`
            );
            resolve(fallback);
          }, 3000);
        });
      }

      // Marcar como solicitando
      isGlobalRequesting = true;
      console.log(`[CSRF:${requestId}] Iniciando obtención de token...`);

      try {
        // Añadir timestamp y requestId para evitar caché y rastrear la solicitud
        const timestamp = Date.now();
        const response = await fetch(
          `/api/csrf?_=${timestamp}&r=${requestId}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              Expires: "0",
            },
          }
        );

        // Verificar si la respuesta es exitosa
        if (!response.ok) {
          const responseText = await response.text();
          console.error(
            `[CSRF:${requestId}] Error HTTP ${response.status}:`,
            responseText
          );
          throw new Error(
            `Error HTTP ${response.status}: ${response.statusText}`
          );
        }

        // Parsear la respuesta
        const data = await response.json();

        if (!data.token) {
          console.error(`[CSRF:${requestId}] Respuesta sin token:`, data);
          throw new Error("Token no presente en la respuesta");
        }

        console.log(
          `[CSRF:${requestId}] Token obtenido correctamente: ${data.token.substring(
            0,
            6
          )}...`
        );

        // Guardar el token
        globalCsrfToken = data.token;
        lastTokenFetchTime = timestamp;

        try {
          localStorage.setItem("csrf_token", data.token);
          localStorage.setItem("csrf_timestamp", timestamp.toString());
        } catch (storageError) {
          console.warn(
            `[CSRF:${requestId}] No se pudo guardar en localStorage:`,
            storageError
          );
        }

        setToken(data.token);
        return data.token;
      } catch (error) {
        console.error(`[CSRF:${requestId}] Error al obtener token:`, error);

        // Generar un token de fallback
        const fallbackToken =
          "error-" + Math.random().toString(36).substring(2);
        setToken(fallbackToken);
        return fallbackToken;
      } finally {
        isGlobalRequesting = false;
      }
    },
    [requestId]
  );

  // Cargar el token al montar el componente
  useEffect(() => {
    const loadToken = async () => {
      // Verificar si ya tenemos un token global
      if (globalCsrfToken) {
        console.log(`[CSRF:${requestId}] Usando token global existente`);
        setToken(globalCsrfToken);
        return;
      }

      // Intentar recuperar de localStorage
      try {
        const storedToken = localStorage.getItem("csrf_token");
        const storedTime = localStorage.getItem("csrf_timestamp");

        if (storedToken && storedTime) {
          const tokenAge = Date.now() - parseInt(storedTime);

          // Usar token almacenado solo si no es muy antiguo (menos de 30 minutos)
          if (tokenAge < 30 * 60 * 1000) {
            console.log(
              `[CSRF:${requestId}] Usando token de localStorage (edad: ${Math.round(
                tokenAge / 1000
              )}s)`
            );
            globalCsrfToken = storedToken;
            lastTokenFetchTime = parseInt(storedTime);
            setToken(storedToken);
            return;
          }
        }
      } catch (storageError) {
        console.warn(
          `[CSRF:${requestId}] Error al acceder a localStorage:`,
          storageError
        );
      }

      // Si llegamos aquí, necesitamos obtener un nuevo token
      await fetchCsrfToken();
    };

    loadToken();
  }, [fetchCsrfToken, requestId]);

  // Función expuesta para obtener el token (puede forzar renovación)
  const getCsrfToken = useCallback(
    async (forceRefresh = false): Promise<string> => {
      // Si ya tenemos un token y no se requiere refresco, devolverlo
      if (token && !forceRefresh) {
        return token;
      }

      return await fetchCsrfToken(forceRefresh);
    },
    [token, fetchCsrfToken]
  );

  return { getCsrfToken, token };
}

// Reexportamos el componente desde el archivo de componentes
export { CsrfTokenField } from "./csrfComponents";
