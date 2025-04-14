import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // BYPASS para evitar redirecciones en bucle - Lo más importante
  // Verificar si hay un parámetro de bypass en la URL
  const url = request.nextUrl.clone();
  const isAuthRedirect = url.searchParams.get("_auth_redirect") === "true";
  const timestamp = url.searchParams.get("_ts");

  // Si hay un parámetro de redirección con timestamp reciente, permitir paso inmediato
  if (isAuthRedirect && timestamp) {
    const redirectTimestamp = parseInt(timestamp);
    const now = Date.now();
    // Si la redirección ocurrió en los últimos 30 segundos, permitir acceso sin más checks
    if (now - redirectTimestamp < 30000) {
      console.log(
        "[Middleware] Redirección reciente detectada, permitiendo acceso inmediato"
      );
      return response;
    }
  }

  // Solo aplicar a rutas del dashboard
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    // Verificar todas las posibles formas de autenticación

    // 1. Verificar cookies de Supabase (múltiples formatos)
    const hasSupabaseToken =
      request.cookies.has("supabase-auth-token") ||
      request.cookies.has("sb-access-token") ||
      request.cookies.has("sb-refresh-token");

    // 2. Verificar parámetros de login success en cookies (si fueron sincronizados a cookies)
    const hasLoginSuccess = request.cookies.has("login_success");
    const loginTimestamp = request.cookies.get("login_timestamp")?.value;
    const isLoginRecent =
      loginTimestamp && Date.now() - parseInt(loginTimestamp) < 120000;

    if (hasSupabaseToken || (hasLoginSuccess && isLoginRecent)) {
      console.log(
        "[Middleware] Autenticación detectada, permitiendo acceso al dashboard"
      );
      return response;
    }

    // 3. Si llegamos aquí, no hay indicador válido de autenticación
    console.log(
      "[Middleware] No se detectó autenticación válida, redirigiendo a login"
    );
    return NextResponse.redirect(
      new URL("/login?from=/dashboard", request.url)
    );
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
