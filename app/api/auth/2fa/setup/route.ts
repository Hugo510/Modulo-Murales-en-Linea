import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { verifyCsrfToken } from "@/lib/csrf";
import * as OTPAuth from "otpauth";
import { v4 as uuidv4 } from "uuid";

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
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "ID de usuario requerido" },
        { status: 400 }
      );
    }

    const supabase = await getSupabaseServer();

    // Verificar si el usuario existe
    const { data: user, error: userError } =
      await supabase.auth.admin.getUserById(userId);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Generar secreto para 2FA
    const secret = generateTOTPSecret();

    // Generar URL para código QR
    const totp = new OTPAuth.TOTP({
      issuer: "MuralesColaborativos",
      label: user.user.email || "user",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secret),
    });

    const qrCodeUrl = totp.toString();

    // Generar códigos de recuperación
    const recoveryCodes = generateRecoveryCodes();

    // Almacenar temporalmente el secreto y códigos de recuperación
    // En un sistema real, esto se almacenaría en una sesión o base de datos temporal
    // hasta que el usuario verifique el código

    // Aquí simulamos almacenamiento temporal
    const tempSecret = {
      secret,
      recoveryCodes,
      userId,
      createdAt: new Date().toISOString(),
    };

    // En un sistema real, almacenaríamos esto en una tabla temporal
    // Aquí lo almacenamos en la sesión del usuario
    await supabase.from("temp_2fa").upsert({
      user_id: userId,
      secret,
      recovery_codes: recoveryCodes,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      secret,
      qrCodeUrl,
      recoveryCodes,
    });
  } catch (error) {
    console.error("Error en configuración 2FA:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// Función para generar secreto TOTP
function generateTOTPSecret(): string {
  // Corregir la forma de generar el secreto
  const secret = new OTPAuth.Secret({ size: 20 });
  return secret.base32;
}

// Función para generar códigos de recuperación
function generateRecoveryCodes(count = 8): string[] {
  const codes: string[] = [];

  for (let i = 0; i < count; i++) {
    // Generar código de 10 caracteres
    const code = uuidv4().replace(/-/g, "").substring(0, 10).toUpperCase();
    codes.push(code);
  }

  return codes;
}
