import { getSupabaseClient } from "@/lib/supabase/client";

// Tipos para la actividad sospechosa
export interface SuspiciousActivity {
  id: string;
  userId: string;
  activityType:
    | "login_attempt"
    | "password_change"
    | "ip_change"
    | "unusual_access"
    | "brute_force";
  ipAddress: string;
  userAgent: string;
  location?: {
    country?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
  timestamp: Date;
  details?: Record<string, any>;
  resolved: boolean;
}

// Función para registrar actividad sospechosa
export async function logSuspiciousActivity(
  userId: string,
  activityType: SuspiciousActivity["activityType"],
  ipAddress: string,
  userAgent: string,
  details?: Record<string, any>
) {
  const supabase = getSupabaseClient();

  try {
    // Obtener información de geolocalización basada en IP
    const geoData = await fetchGeoLocation(ipAddress);

    // Registrar la actividad sospechosa
    const { data, error } = await supabase.from("security_logs").insert({
      user_id: userId,
      activity_type: activityType,
      ip_address: ipAddress,
      user_agent: userAgent,
      location: geoData,
      details,
      timestamp: new Date().toISOString(),
      resolved: false,
    });

    if (error) {
      console.error("Error al registrar actividad sospechosa:", error);
      return false;
    }

    // Si es un intento de fuerza bruta, considerar bloquear la cuenta temporalmente
    if (activityType === "brute_force") {
      await lockAccount(userId);
    }

    return true;
  } catch (error) {
    console.error("Error al registrar actividad sospechosa:", error);
    return false;
  }
}

// Función para bloquear temporalmente una cuenta
async function lockAccount(userId: string, durationMinutes = 30) {
  const supabase = getSupabaseClient();

  try {
    // Actualizar el estado de la cuenta en la base de datos
    const { error } = await supabase
      .from("profiles")
      .update({
        account_locked: true,
        lock_expires_at: new Date(
          Date.now() + durationMinutes * 60 * 1000
        ).toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error("Error al bloquear la cuenta:", error);
      return false;
    }

    // Enviar notificación al usuario (en un sistema real)
    // await sendSecurityNotification(userId, "account_locked");

    return true;
  } catch (error) {
    console.error("Error al bloquear la cuenta:", error);
    return false;
  }
}

// Función para verificar si una cuenta está bloqueada
export async function isAccountLocked(userId: string): Promise<boolean> {
  const supabase = getSupabaseClient();

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("account_locked, lock_expires_at")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error al verificar bloqueo de cuenta:", error);
      return false;
    }

    if (!data.account_locked) {
      return false;
    }

    // Verificar si el bloqueo ha expirado
    const lockExpiresAt = new Date(data.lock_expires_at);
    const now = new Date();

    if (now > lockExpiresAt) {
      // El bloqueo ha expirado, desbloquear la cuenta
      await supabase
        .from("profiles")
        .update({
          account_locked: false,
          lock_expires_at: null,
        })
        .eq("id", userId);

      return false;
    }

    return true;
  } catch (error) {
    console.error("Error al verificar bloqueo de cuenta:", error);
    return false;
  }
}

// Función para obtener información de geolocalización basada en IP
async function fetchGeoLocation(ipAddress: string) {
  try {
    // En un entorno real, usaríamos un servicio como ipinfo.io o similar
    // Aquí simulamos una respuesta
    return {
      country: "España",
      city: "Madrid",
      latitude: 40.4168,
      longitude: -3.7038,
    };
  } catch (error) {
    console.error("Error al obtener geolocalización:", error);
    return {};
  }
}

// Función para verificar si una dirección IP es sospechosa
export async function isIpSuspicious(
  ipAddress: string,
  userId: string
): Promise<boolean> {
  const supabase = getSupabaseClient();

  try {
    // Obtener el historial de IPs del usuario
    const { data: userIps, error } = await supabase
      .from("security_logs")
      .select("ip_address")
      .eq("user_id", userId)
      .order("timestamp", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error al obtener historial de IPs:", error);
      return true; // Por precaución, considerar sospechoso si hay error
    }

    // Si el usuario nunca ha iniciado sesión antes, no considerar sospechoso
    if (!userIps || userIps.length === 0) {
      return false;
    }

    // Verificar si la IP actual está en el historial reciente del usuario
    const knownIps = userIps.map((log) => log.ip_address);
    if (knownIps.includes(ipAddress)) {
      return false;
    }

    // Obtener información de geolocalización
    const geoData = await fetchGeoLocation(ipAddress);

    // Verificar si hay cambios drásticos de ubicación
    // En un sistema real, implementaríamos lógica más sofisticada
    // como verificar la distancia entre ubicaciones y el tiempo transcurrido

    return true; // Considerar sospechoso si es una IP nueva
  } catch (error) {
    console.error("Error al verificar IP sospechosa:", error);
    return true; // Por precaución, considerar sospechoso si hay error
  }
}

// Función para verificar patrones de fuerza bruta
export async function detectBruteForce(
  userId: string,
  ipAddress: string
): Promise<boolean> {
  const supabase = getSupabaseClient();

  try {
    // Obtener intentos fallidos recientes desde la misma IP
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("security_logs")
      .select("*")
      .eq("ip_address", ipAddress)
      .eq("activity_type", "login_attempt")
      .eq("details->success", false)
      .gte("timestamp", fiveMinutesAgo);

    if (error) {
      console.error("Error al detectar fuerza bruta:", error);
      return false;
    }

    // Si hay más de 5 intentos fallidos en 5 minutos, considerar ataque de fuerza bruta
    if (data && data.length >= 5) {
      await logSuspiciousActivity(userId, "brute_force", ipAddress, "Unknown", {
        failed_attempts: data.length,
      });
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error al detectar fuerza bruta:", error);
    return false;
  }
}
