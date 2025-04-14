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

  // CRUCIAL: Sincronizar localStorage → sessionStorage → cookies
  try {
    // 1. Transferir datos de localStorage a sessionStorage
    if (localStorage.getItem("login_success")) {
      sessionStorage.setItem("login_success", "true");
    }
    if (localStorage.getItem("auth_user_id")) {
      sessionStorage.setItem(
        "auth_user_id",
        localStorage.getItem("auth_user_id") || ""
      );
    }
    if (localStorage.getItem("login_timestamp")) {
      sessionStorage.setItem(
        "login_timestamp",
        localStorage.getItem("login_timestamp") || ""
      );
    }

    // 2. También sincronizar a cookies para que middleware pueda acceder
    document.cookie = `login_success=true; path=/; max-age=120`;
    document.cookie = `login_timestamp=${Date.now()}; path=/; max-age=120`;
    if (localStorage.getItem("auth_user_id")) {
      document.cookie = `auth_user_id=${localStorage.getItem(
        "auth_user_id"
      )}; path=/; max-age=120`;
    }
  } catch (e) {
    console.error("[Auth Redirect] Error al sincronizar datos:", e);
  }

  // Realizar redirección con una pequeña espera para permitir que se sincronicen datos
  setTimeout(() => {
    try {
      console.log(`[Auth Redirect] Ejecutando redirección a: ${destination}`);

      // Crear URL absoluta
      const baseUrl = window.location.origin;
      const fullUrl = destination.startsWith("http")
        ? destination
        : `${baseUrl}${
            destination.startsWith("/") ? destination : `/${destination}`
          }`;

      // Añadir parámetros para bypassing de seguridad
      const urlWithParams = new URL(fullUrl);
      urlWithParams.searchParams.set("_auth_redirect", "true");
      urlWithParams.searchParams.set("_ts", Date.now().toString());

      // Realizar redirección. Usar replace para evitar historia de navegación
      window.location.replace(urlWithParams.toString());

      // Respaldo (por si replace no funciona)
      setTimeout(() => {
        window.location.href = urlWithParams.toString();
      }, 150);
    } catch (error) {
      console.error("[Auth Redirect] Error durante redirección:", error);
      redirectionInProgress = false;
      sessionStorage.removeItem("auth_redirect_in_progress");
    }
  }, 50);

  // Limpiar estado si la redirección no se completa
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
