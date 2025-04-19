/**
 * Utilidad mejorada para manejar redirecciones seguras después de la autenticación.
 * Esta versión usa un enfoque más directo y robusto.
 */

// Flag para evitar redirecciones múltiples
let redirectionInProgress = false;

/**
 * Realiza una redirección post-login de forma segura.
 */
export function redirectAfterLogin(destination: string): void {
  if (redirectionInProgress) {
    console.log(
      "[Auth Redirect] Redirección ya en curso, ignorando solicitud adicional"
    );
    return;
  }

  redirectionInProgress = true;

  // Marcar redirección en curso
  sessionStorage.setItem("auth_redirect_in_progress", "true");
  sessionStorage.setItem("redirect_started_at", Date.now().toString());

  console.log(`[Auth Redirect] Iniciando redirección segura a: ${destination}`);

  // CRUCIAL: Sincronizar datos entre localStorage y sessionStorage para asegurar disponibilidad
  try {
    // Guardar TODOS los datos relevantes tanto en sessionStorage como en cookies
    const keysToSync = [
      "auth_user_id",
      "auth_user_name",
      "auth_user_email",
      "auth_user_role",
      "login_success",
      "login_timestamp",
    ];

    keysToSync.forEach((key) => {
      const value = localStorage.getItem(key);
      if (value) {
        sessionStorage.setItem(key, value);

        // También establecer como cookies para que el middleware pueda acceder
        const maxAge = 300; // 5 minutos
        document.cookie = `${key}=${encodeURIComponent(
          value
        )}; path=/; max-age=${maxAge}`;
      }
    });

    // Generar información básica de la sesión para el usuario
    try {
      const userId = localStorage.getItem("auth_user_id");
      if (userId) {
        const sessionInfo = {
          id: crypto.randomUUID(),
          deviceInfo: {
            type:
              typeof navigator !== "undefined" &&
              navigator.userAgent.includes("Mobile")
                ? "Mobile"
                : "Desktop",
            name:
              typeof navigator !== "undefined"
                ? navigator.userAgent.includes("Chrome")
                  ? "Chrome"
                  : "Navegador"
                : "Navegador",
            os:
              typeof navigator !== "undefined"
                ? navigator.platform || "Desconocido"
                : "Desconocido",
          },
          location: { city: "Tu ubicación", country: "Tu país" },
          lastActive: new Date().toISOString(),
        };

        // Guardar información de sesión fallback en localStorage y sessionStorage
        localStorage.setItem("fallback_session", JSON.stringify(sessionInfo));
        sessionStorage.setItem("fallback_session", JSON.stringify(sessionInfo));
      }
    } catch (e) {
      console.error(
        "[Auth Redirect] Error al generar información de sesión fallback:",
        e
      );
    }
  } catch (e) {
    console.error("[Auth Redirect] Error al sincronizar datos:", e);
  }

  // SIMPLIFICACIÓN EXTREMA: Usar método de redirección más básico y directo
  setTimeout(() => {
    try {
      console.log(`[Auth Redirect] Ejecutando redirección a: ${destination}`);

      // Usar URL absoluta para evitar problemas con rutas relativas
      const baseUrl = window.location.origin;
      const fullUrl = destination.startsWith("http")
        ? destination
        : `${baseUrl}${
            destination.startsWith("/") ? destination : `/${destination}`
          }`;

      // Añadir parámetro para facilitar detección post-redirección
      const urlWithParams = new URL(fullUrl);
      urlWithParams.searchParams.set("_auth_redirect", "true");
      urlWithParams.searchParams.set("_ts", Date.now().toString());

      // Forzar hard refresh para evitar problemas de caché y estado
      window.location.replace(urlWithParams.toString());

      // Como seguridad adicional si replace no funciona por alguna razón
      setTimeout(() => {
        window.location.href = urlWithParams.toString();
      }, 100);
    } catch (error) {
      console.error("[Auth Redirect] Error durante redirección:", error);
      redirectionInProgress = false;
      sessionStorage.removeItem("auth_redirect_in_progress");
    }
  }, 50); // Mínimo retraso posible

  // Limpiar estado en caso de fallo
  setTimeout(() => {
    redirectionInProgress = false;
    sessionStorage.removeItem("auth_redirect_in_progress");
  }, 5000);
}

/**
 * Verifica si hay una redirección en curso
 */
export function isRedirectionInProgress(): boolean {
  const inProgress =
    sessionStorage.getItem("auth_redirect_in_progress") === "true";
  const startTime = parseInt(
    sessionStorage.getItem("redirect_started_at") || "0"
  );
  const elapsed = Date.now() - startTime;

  // Si ha pasado más de 10 segundos, considerar que la redirección ya no está en curso
  if (inProgress && elapsed > 10000) {
    sessionStorage.removeItem("auth_redirect_in_progress");
    sessionStorage.removeItem("redirect_started_at");
    return false;
  }

  return inProgress || redirectionInProgress;
}

/**
 * Limpia todos los estados de redirección
 */
export function clearRedirectionState(): void {
  redirectionInProgress = false;
  sessionStorage.removeItem("auth_redirect_in_progress");
  sessionStorage.removeItem("redirect_started_at");
  localStorage.removeItem("auth_redirect");
}

/**
 * Detecta si estamos en una página recién redirigida y transfiere datos de sessionStorage a localStorage
 */
export function detectRedirect(): boolean {
  // Verificar si llegamos aquí por una redirección auth
  const isRedirect =
    new URLSearchParams(window.location.search).get("_auth_redirect") ===
    "true";

  if (isRedirect) {
    console.log(
      "[Auth Redirect] Detectada página post-redirección, sincronizando datos"
    );

    // Transferir datos críticos de sessionStorage a localStorage
    try {
      if (sessionStorage.getItem("login_success")) {
        localStorage.setItem("login_success", "true");
      }
      if (sessionStorage.getItem("auth_user_id")) {
        localStorage.setItem(
          "auth_user_id",
          sessionStorage.getItem("auth_user_id") || ""
        );
      }
      if (sessionStorage.getItem("login_timestamp")) {
        localStorage.setItem(
          "login_timestamp",
          sessionStorage.getItem("login_timestamp") || ""
        );
      }

      // Limpiar datos en sessionStorage
      sessionStorage.removeItem("auth_redirect_in_progress");
      sessionStorage.removeItem("redirect_started_at");

      return true;
    } catch (e) {
      console.error(
        "[Auth Redirect] Error al sincronizar datos post-redirección:",
        e
      );
    }
  }

  return false;
}
