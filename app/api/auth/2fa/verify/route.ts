import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { verifyCsrfToken } from "@/lib/csrf";
import { logSuspiciousActivity } from "@/lib/security";
import * as OTPAuth from "otpauth";

export async function POST(request: NextRequest) {
  try {
    // Verificar token CSRF
    const csrfToken = request.headers.get("X-CSRF-Token");
    if (!csrfToken || !verifyCsrfToken(csrfToken)) {
      return NextResponse.json(
        { error: "Token CSRF inválido" },
        { status: 403 }
      );
    }

    // Obtener datos
    const body = await request.json();
    const { userId, code } = body;

    if (!userId || !code) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    // Añadir await aquí para resolver la Promise
    const supabase = await getSupabaseServer();

    // Obtener el secreto 2FA del usuario
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("two_factor_secret")
      .eq("id", userId)
      .single();

    if (profileError || !profile || !profile.two_factor_secret) {
      return NextResponse.json(
        { error: "Usuario no encontrado o 2FA no configurado" },
        { status: 404 }
      );
    }

    // Verificar el código
    const isValid = verifyTOTP(profile.two_factor_secret, code);

    if (!isValid) {
      // Registrar intento fallido
      const ipAddress = request.headers.get("x-forwarded-for") || "unknown";
      const userAgent = request.headers.get("user-agent") || "unknown";

      await logSuspiciousActivity(
        userId,
        "login_attempt",
        ipAddress as string,
        userAgent as string,
        {
          success: false,
          reason: "2FA failed",
        }
      );

      return NextResponse.json(
        { error: "Código de verificación inválido" },
        { status: 401 }
      );
    }

    // Actualizar último inicio de sesión
    await supabase
      .from("profiles")
      .update({
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error en verificación 2FA:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// Función para verificar código TOTP
function verifyTOTP(secret: string, code: string): boolean {
  try {
    // Crear instancia TOTP
    const totp = new OTPAuth.TOTP({
      issuer: "MuralesColaborativos",

      label: "user",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secret),
    });

    // Verificar el código
    const delta = totp.validate({ token: code, window: 1 });

    // delta !== null significa que el código es válido
    return delta !== null;
  } catch (error) {
    console.error("Error al verificar TOTP:", error);
    return false;
  }
}
