import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getDeviceInfo } from "@/services/session-service";

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID().substring(0, 8); // ID corto para logs

  console.log(
    `[${requestId}] API: Solicitud de información de sesión recibida`
  );

  try {
    // Crear sesión básica primero para asegurar siempre devolver algo
    const fallbackSession = createFallbackSession(request);

    // Obtener instancia de Supabase con mejor manejo de errores
    let supabase;
    try {
      supabase = await getSupabaseServer();
    } catch (supabaseError) {
      console.error(
        `[${requestId}] Error al inicializar Supabase:`,
        supabaseError
      );
      return NextResponse.json(
        {
          error: "Error de servicio",
          session: fallbackSession,
        },
        { status: 200 } // Usar 200 para permitir que el cliente use el fallback
      );
    }

    // Obtener la sesión actual
    let session;
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      session = data.session;
    } catch (sessionError) {
      console.error(`[${requestId}] Error al obtener sesión:`, sessionError);
      return NextResponse.json(
        {
          error: "Error al verificar autenticación",
          session: fallbackSession,
        },
        { status: 200 }
      );
    }

    // Si no hay sesión, buscar info en cookies
    if (!session) {
      console.log(`[${requestId}] No hay sesión activa, buscando en cookies`);

      // Verificar si hay información de usuario en cookies
      const userId = request.cookies.get("auth_user_id")?.value;

      if (userId) {
        console.log(
          `[${requestId}] Encontrado ID de usuario en cookies: ${userId}`
        );
        const cookieSession = createFallbackSession(request, userId);

        return NextResponse.json(
          {
            warning: "Usando información de sesión basada en cookies",
            session: cookieSession,
          },
          { status: 200 }
        );
      }

      // Si no hay userId, devolver la sesión fallback anónima
      return NextResponse.json(
        {
          warning: "No hay sesión activa, usando información de dispositivo",
          session: fallbackSession,
        },
        { status: 200 }
      );
    }

    // A partir de aquí tenemos una sesión válida
    const userId = session.user.id;
    console.log(`[${requestId}] Sesión válida para usuario: ${userId}`);

    // Obtener información del dispositivo
    const userAgent = request.headers.get("user-agent") || "";
    const deviceInfo = getDeviceInfo(userAgent);

    // Obtener la IP del cliente
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Crear objeto de sesión básico
    const sessionInfo = {
      id: `session_${Date.now()}`,
      deviceInfo: deviceInfo,
      location: { city: "Tu ubicación", country: "Tu país" },
      lastActive: new Date().toISOString(),
      ip: ip,
      userId: userId,
    };

    try {
      // Intentar obtener una sesión existente
      const { data: existingSessions, error: queryError } = await supabase
        .from("sessions")
        .select("*")
        .eq("user_id", userId)
        .order("last_active", { ascending: false })
        .limit(1);

      if (!queryError && existingSessions && existingSessions.length > 0) {
        const dbSession = existingSessions[0];

        // Actualizar datos de ubicación si existen
        if (dbSession.city || dbSession.country) {
          sessionInfo.location = {
            city: dbSession.city || "Tu ubicación",
            country: dbSession.country || "Tu país",
          };
        }

        // Actualizar última actividad en la BD
        try {
          await supabase
            .from("sessions")
            .update({ last_active: new Date().toISOString() })
            .eq("id", dbSession.id);
          
          console.log(`[${requestId}] Actualizada última actividad para sesión: ${dbSession.id}`);
        } catch (err) {
          console.warn(`[${requestId}] Error actualizando sesión:`, err);
        }

        // Usar ID de la BD
        sessionInfo.id = dbSession.id;
      } else {
        // Crear nueva sesión en la BD
        const newSessionId = crypto.randomUUID();
        sessionInfo.id = newSessionId;

        const { error: insertError } = await supabase.from("sessions").insert({
          id: newSessionId,
          user_id: userId,
          device_type: deviceInfo.type,
          device_name: deviceInfo.name,
          os: deviceInfo.os,
          browser: deviceInfo.name,
          ip: ip,
          city: sessionInfo.location.city,
          country: sessionInfo.location.country,
          last_active: new Date().toISOString(),
          created_at: new Date().toISOString(),
        });

        if (insertError) {
          console.warn(`[${requestId}] Error creando sesión:`, insertError);
        } else {
          console.log(
            `[${requestId}] Nueva sesión creada con ID: ${newSessionId}`
          );
        }
      }
    } catch (dbError) {
      console.error(`[${requestId}] Error con la BD:`, dbError);
      // Continuar con los datos básicos
    }

    // Devolver la información de sesión
    console.log(
      `[${requestId}] Devolviendo información de sesión para: ${userId}`
    );
    return NextResponse.json({ session: sessionInfo });
  } catch (generalError) {
    console.error(`[${requestId}] Error general:`, generalError);
    // Siempre devolver algo útil
    return NextResponse.json(
      {
        error: "Error del servidor",
        session: createFallbackSession(request),
      },
      { status: 200 }
    );
  }
}

// Función auxiliar para crear una sesión de fallback
function createFallbackSession(request: NextRequest, userId?: string): any {
  const ua = request.headers.get("user-agent") || "";
  const deviceInfo = getDeviceInfo(ua);

  return {
    id: `fallback_${Date.now()}`,
    deviceInfo: deviceInfo,
    location: { city: "Tu ubicación", country: "Tu país" },
    lastActive: new Date().toISOString(),
    ip: request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown",
    userId: userId || "anonymous",
  };
}
