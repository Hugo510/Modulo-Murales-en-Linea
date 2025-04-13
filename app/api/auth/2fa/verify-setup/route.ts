import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { verifyCsrfToken } from "@/lib/csrf";
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
    const { userId, code, secret } = body;

    if (!userId || !code || !secret) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    // Verificar el código
    const isValid = verifyTOTP(secret, code);

    if (!isValid) {
      return NextResponse.json(
        { error: "Código de verificación inválido" },
        { status: 401 }
      );
    }

    // Añadir await aquí para resolver la Promise
    const supabase = await getSupabaseServer();

    // Obtener los códigos de recuperación temporales
    const { data: tempData, error: tempError } = await supabase
      .from("temp_2fa")
      .select("recovery_codes")
      .eq("user_id", userId)
      .single();

    if (tempError || !tempData) {
      return NextResponse.json(
        { error: "No se encontraron datos temporales de 2FA" },
        { status: 404 }
      );
    }

    // Activar 2FA para el usuario
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        two_factor_enabled: true,
        two_factor_secret: secret,
        recovery_codes: tempData.recovery_codes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      return NextResponse.json(
        { error: "Error al activar 2FA" },
        { status: 500 }
      );
    }

    // Eliminar datos temporales
    await supabase.from("temp_2fa").delete().eq("user_id", userId);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error en verificación de configuración 2FA:", error);
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
