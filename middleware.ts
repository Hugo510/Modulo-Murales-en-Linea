import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Verificar si la URL contiene parámetro de redirección de autenticación
  const url = request.nextUrl.clone();
  const isAuthRedirect = url.searchParams.get("_auth_redirect") === "true";

  // Si es una redirección de autenticación, permitir acceso inmediato
  if (isAuthRedirect) {
    console.log(
      "[Middleware] Detectada redirección de autenticación, permitiendo acceso"
    );
    return response;
  }

  // Para rutas del dashboard, verificar autenticación
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    // Verificar si hay token de Supabase
    const hasSupabaseToken =
      request.cookies.has("supabase-auth-token") ||
      request.cookies.has("sb-access-token") ||
      request.cookies.has("sb-refresh-token");

    if (hasSupabaseToken) {
      console.log(
        "[Middleware] Token de Supabase detectado, permitiendo acceso"
      );
      return response;
    }

    // Si no hay tokens, redirigir al login
    console.log("[Middleware] No hay sesión activa, redirigiendo a login");
    return NextResponse.redirect(
      new URL("/login?from=/dashboard", request.url)
    );
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
