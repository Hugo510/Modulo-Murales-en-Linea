import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { verifyCsrfToken } from "@/lib/server/csrf-server";
import { validateForm, loginSchema } from "@/lib/validation";
import { logSuspiciousActivity, isAccountLocked } from "@/lib/security";

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const clientIp = request.headers.get("x-forwarded-for") || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";

  console.log(
    `[${requestId}] Intento de login desde IP: ${clientIp.split(",")[0]}`
  );

  try {
    // Verificar token CSRF con mejor manejo de errores
    const csrfToken = request.headers.get("X-CSRF-Token");

    if (!csrfToken) {
      console.warn(
        `[${requestId}] Token CSRF no proporcionado en la solicitud`
      );
      return NextResponse.json(
        { error: "Token CSRF inválido", code: "CSRF_MISSING" },
        { status: 403 }
      );
    }

    // Verificar token con manejo de errores
    try {
      const csrfValid = await verifyCsrfToken(csrfToken);
      if (!csrfValid) {
        console.warn(
          `[${requestId}] Token CSRF no coincide con el almacenado en cookie`
        );
        return NextResponse.json(
          { error: "Token CSRF inválido", code: "CSRF_INVALID" },
          { status: 403 }
        );
      }
    } catch (csrfError) {
      console.error(`[${requestId}] Error al verificar token CSRF:`, csrfError);
      return NextResponse.json(
        { error: "Error al verificar seguridad", code: "CSRF_ERROR" },
        { status: 500 }
      );
    }

    // Obtener y validar datos
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error(
        `[${requestId}] Error al parsear JSON de solicitud:`,
        jsonError
      );
      return NextResponse.json(
        { error: "Datos de solicitud inválidos", code: "INVALID_JSON" },
        { status: 400 }
      );
    }

    const validation = validateForm(loginSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos de formulario inválidos", details: validation.errors },
        { status: 400 }
      );
    }

    const { email, password, recaptchaToken } = body;

    // Verificar reCAPTCHA si se proporciona
    if (recaptchaToken) {
      const recaptchaValid = await verifyRecaptcha(recaptchaToken);
      if (!recaptchaValid) {
        return NextResponse.json(
          { error: "Verificación reCAPTCHA fallida" },
          { status: 400 }
        );
      }
    }

    const supabase = await getSupabaseServer();

    // Verificar si el usuario existe - reemplazar getUserByEmail por un método adecuado
    const { data: users, error: usersError } =
      await supabase.auth.admin.listUsers();
    const userExists = users?.users.find((user) => user.email === email);

    if (usersError || !userExists) {
      // Registrar intento fallido pero no revelar que el usuario no existe
      await logLoginAttempt(email, false, request);

      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // Verificar si la cuenta está bloqueada
    const accountLocked = await isAccountLocked(userExists.id);
    if (accountLocked) {
      return NextResponse.json(
        {
          error:
            "Tu cuenta ha sido bloqueada temporalmente por motivos de seguridad",
        },
        { status: 403 }
      );
    }

    // Intentar iniciar sesión
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Registrar intento fallido
      await logLoginAttempt(email, false, request);

      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // Verificar si el usuario tiene 2FA habilitado
    const { data: profile } = await supabase
      .from("profiles")
      .select("two_factor_enabled")
      .eq("id", data.user.id)
      .single();

    if (profile && profile.two_factor_enabled) {
      // Registrar intento exitoso pero requiere 2FA
      await logLoginAttempt(email, true, request);

      return NextResponse.json({
        requires2FA: true,
        userId: data.user.id,
      });
    }

    // Registrar intento exitoso
    await logLoginAttempt(email, true, request);

    return NextResponse.json({
      success: true,
      userId: data.user.id,
    });
  } catch (error) {
    console.error(
      `[${requestId}] Error no controlado en inicio de sesión:`,
      error
    );
    return NextResponse.json(
      { error: "Error interno del servidor", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}

// Función para verificar reCAPTCHA
async function verifyRecaptcha(token: string): Promise<boolean> {
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
      console.error("RECAPTCHA_SECRET_KEY no está configurada");
      return false;
    }

    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `secret=${secretKey}&response=${token}`,
      }
    );

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Error al verificar reCAPTCHA:", error);
    return false;
  }
}

// Función para registrar intentos de inicio de sesión
async function logLoginAttempt(
  email: string,
  success: boolean,
  request: NextRequest
) {
  try {
    const supabase = await getSupabaseServer();

    // Obtener información del usuario si existe - reemplazar getUserByEmail
    const { data: users } = await supabase.auth.admin.listUsers();
    const userData = users?.users.find((user) => user.email === email);

    // Obtener información de la solicitud
    const ipAddress = request.headers.get("x-forwarded-for") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Registrar el intento en la base de datos
    await supabase.from("login_attempts").insert({
      user_id: userData?.id || null,
      email,
      ip_address: ipAddress,
      user_agent: userAgent,
      success,
      timestamp: new Date().toISOString(),
    });

    // Si es un intento fallido, registrar como actividad sospechosa
    if (!success && userData) {
      await logSuspiciousActivity(
        userData.id,
        "login_attempt",
        ipAddress as string,
        userAgent as string,
        {
          success: false,
        }
      );
    }
  } catch (error) {
    console.error("Error al registrar intento de inicio de sesión:", error);
  }
}
