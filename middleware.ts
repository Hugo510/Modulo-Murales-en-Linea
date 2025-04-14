import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

// Rutas que no requieren autenticación
const publicRoutes = [
  "/",
  "/login",
  "/registro",
  "/recuperar-password",
  "/guia",
];

// Rutas que siempre redirigen a /dashboard si el usuario está autenticado
const authRoutes = ["/login", "/registro", "/recuperar-password"];

// Rutas que requieren roles específicos
const adminRoutes = ["/admin", "/configuracion/sistema"];
const teacherRoutes = ["/classroom-manager", "/actividades/crear"];

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  // Verificar si hay una sesión activa
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const path = request.nextUrl.pathname;

  // Verificar si la ruta actual es pública
  const isPublicRoute = publicRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );

  // Verificar si la ruta actual es de autenticación
  const isAuthRoute = authRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );

  // Verificar si la ruta requiere rol de administrador
  const isAdminRoute = adminRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );

  // Verificar si la ruta requiere rol de profesor
  const isTeacherRoute = teacherRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );

  // Verificar CSRF token para solicitudes POST, PUT, DELETE
  if (["POST", "PUT", "DELETE", "PATCH"].includes(request.method)) {
    const csrfToken = request.headers.get("X-CSRF-Token");
    const expectedToken = request.cookies.get("csrf_token")?.value;

    // Si no hay token CSRF o no coincide, rechazar la solicitud
    if (!csrfToken || !expectedToken || csrfToken !== expectedToken) {
      return new NextResponse(JSON.stringify({ error: "Invalid CSRF token" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // Si el usuario está autenticado y está en una ruta de autenticación,
  // redirigir al dashboard
  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Si el usuario no está autenticado y la ruta no es pública,
  // redirigir a login con la URL de retorno
  if (!session && !isPublicRoute) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("from", path);
    return NextResponse.redirect(redirectUrl);
  }

  // Verificar roles para rutas protegidas
  if (session) {
    try {
      // Obtener el rol del usuario desde los metadatos del token
      const userRole = session.user.user_metadata.role || "user";

      // Verificar acceso a rutas de administrador
      if (isAdminRoute && userRole !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      // Verificar acceso a rutas de profesor
      if (isTeacherRoute && !["admin", "teacher"].includes(userRole)) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      // Verificar si la sesión ha expirado o está a punto de expirar
      if (session.expires_at) {
        const tokenExpiryTime = new Date(session.expires_at * 1000);
        const now = new Date();
        const timeUntilExpiry = tokenExpiryTime.getTime() - now.getTime();

        // Si el token está a punto de expirar (menos de 5 minutos), actualizar la sesión
        if (timeUntilExpiry < 5 * 60 * 1000) {
          await supabase.auth.refreshSession();
        }
      }

      // Verificar si la IP ha cambiado desde la última solicitud
      const currentIp =
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "unknown";
      const sessionIp = session.user.user_metadata.last_ip;

      if (sessionIp && currentIp !== sessionIp) {
        // Registrar el cambio de IP para análisis de seguridad
        await supabase.from("security_logs").insert({
          user_id: session.user.id,
          event_type: "ip_change",
          previous_ip: sessionIp,
          current_ip: currentIp,
          user_agent: request.headers.get("user-agent"),
          timestamp: new Date().toISOString(),
        });

        // Actualizar la IP en los metadatos del usuario
        await supabase.auth.updateUser({
          data: { last_ip: currentIp },
        });
      }
    } catch (error) {
      console.error("Error al verificar permisos:", error);
    }
  }

  // Añadir encabezados de seguridad
  const responseHeaders = new Headers(res.headers);
  responseHeaders.set("X-Content-Type-Options", "nosniff");
  responseHeaders.set("X-Frame-Options", "DENY");
  responseHeaders.set("X-XSS-Protection", "1; mode=block");
  responseHeaders.set("Referrer-Policy", "strict-origin-when-cross-origin");
  responseHeaders.set(
    "Content-Security-Policy",
    process.env.NODE_ENV === "development"
      ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://res.cloudinary.com; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-src 'self' https://www.google.com;"
      : "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://res.cloudinary.com; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-src 'self' https://www.google.com;"
  );

  return NextResponse.next({
    request: {
      headers: request.headers,
    },
    headers: responseHeaders,
  });
}

// Configurar el middleware para que se ejecute en todas las rutas excepto
// archivos estáticos, api, etc.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api (API routes)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
};
