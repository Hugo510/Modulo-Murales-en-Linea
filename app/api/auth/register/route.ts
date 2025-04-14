import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { verifyCsrfToken } from "@/lib/server/csrf-server";
import { validateForm, userSchema } from "@/lib/validation";
import { sanitizeInput } from "@/lib/validation";
import { logError } from "@/lib/logger"; // Asumiendo que existe o se creará

// Códigos de error para el sistema de registro
const ErrorCodes = {
  CSRF_INVALID: "CSRF_INVALID",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  RECAPTCHA_MISSING: "RECAPTCHA_MISSING",
  RECAPTCHA_FAILED: "RECAPTCHA_FAILED",
  EMAIL_EXISTS: "EMAIL_EXISTS",
  SUPABASE_ERROR: "SUPABASE_ERROR",
  PROFILE_ERROR: "PROFILE_ERROR",
  SERVER_ERROR: "SERVER_ERROR",
};

export async function POST(request: NextRequest) {
  // Para capturar el momento de inicio de la solicitud
  const startTime = Date.now();

  // Variables para rastreo y depuración
  const requestId = crypto.randomUUID();
  const clientIp = request.headers.get("x-forwarded-for") || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";

  console.log(
    `[${requestId}] Iniciando registro desde IP: ${clientIp.split(",")[0]}`
  );

  try {
    // Verificar token CSRF
    const csrfToken = request.headers.get("X-CSRF-Token");
    if (!csrfToken) {
      console.warn(`[${requestId}] Token CSRF no proporcionado`);
      return createErrorResponse({
        code: ErrorCodes.CSRF_INVALID,
        message: "Token CSRF no proporcionado",
        status: 403,
      });
    }

    const csrfValid = await verifyCsrfToken(csrfToken);
    if (!csrfValid) {
      console.warn(`[${requestId}] Token CSRF inválido`);
      return createErrorResponse({
        code: ErrorCodes.CSRF_INVALID,
        message: "Token CSRF inválido",
        status: 403,
      });
    }

    // Obtener y validar datos
    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error(`[${requestId}] Error al parsear JSON de solicitud:`, e);
      return createErrorResponse({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "Datos de solicitud inválidos",
        status: 400,
      });
    }

    const validation = validateForm(userSchema, body);

    if (!validation.success) {
      console.warn(`[${requestId}] Validación fallida:`, validation.errors);
      return createErrorResponse({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "Datos de formulario inválidos",
        details: validation.errors,
        status: 400,
      });
    }

    const { name, email, password, recaptchaToken } = body;

    // Sanitizar entradas
    const sanitizedName = sanitizeInput(name);
    console.log(
      `[${requestId}] Procesando registro para: ${email.substring(0, 3)}***`
    );

    // Verificar reCAPTCHA
    if (!recaptchaToken) {
      console.warn(`[${requestId}] No se proporcionó token de reCAPTCHA`);
      return createErrorResponse({
        code: ErrorCodes.RECAPTCHA_MISSING,
        message: "Se requiere verificación reCAPTCHA",
        status: 400,
      });
    }

    const recaptchaValid = await verifyRecaptcha(recaptchaToken);
    if (!recaptchaValid) {
      console.warn(`[${requestId}] Verificación reCAPTCHA fallida`);
      return createErrorResponse({
        code: ErrorCodes.RECAPTCHA_FAILED,
        message: "Verificación reCAPTCHA fallida",
        status: 400,
      });
    }

    // Obtener cliente Supabase
    let supabase;
    try {
      supabase = await getSupabaseServer();
    } catch (error) {
      console.error(`[${requestId}] Error al inicializar Supabase:`, error);
      return createErrorResponse({
        code: ErrorCodes.SERVER_ERROR,
        message: "Error al conectar con el servicio de autenticación",
        status: 500,
      });
    }

    // Verificar si el correo ya está en uso
    try {
      const { data: users, error: usersError } =
        await supabase.auth.admin.listUsers();

      if (usersError) {
        throw new Error(`Error obteniendo usuarios: ${usersError.message}`);
      }

      const existingUser = users?.users.find((user) => user.email === email);

      if (existingUser) {
        console.warn(
          `[${requestId}] Intento de registrar un correo existente: ${email.substring(
            0,
            3
          )}***`
        );
        return createErrorResponse({
          code: ErrorCodes.EMAIL_EXISTS,
          message: "El correo electrónico ya está en uso",
          status: 409,
        });
      }
    } catch (error) {
      console.error(
        `[${requestId}] Error al verificar usuarios existentes:`,
        error
      );
      logError({
        source: "auth-register",
        message: "Error al verificar si el correo existe",
        error,
        context: { email: email.substring(0, 3) + "***", requestId },
      });
      return createErrorResponse({
        code: ErrorCodes.SUPABASE_ERROR,
        message: "Error al verificar disponibilidad del correo",
        status: 500,
      });
    }

    // Crear usuario en Supabase Auth
    let userData;
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirmar email para simplificar
        user_metadata: {
          name: sanitizedName,
          role: "user",
        },
      });

      if (error) {
        console.error(`[${requestId}] Error al crear usuario:`, error);
        throw new Error(error.message);
      }

      userData = data;
      console.log(
        `[${requestId}] Usuario creado exitosamente con ID: ${data.user.id.substring(
          0,
          8
        )}***`
      );
    } catch (error) {
      console.error(
        `[${requestId}] Error al crear usuario en Supabase:`,
        error
      );
      logError({
        source: "auth-register",
        message: "Error al crear usuario",
        error,
        context: { email: email.substring(0, 3) + "***", requestId },
      });
      return createErrorResponse({
        code: ErrorCodes.SUPABASE_ERROR,
        message: "Error al crear la cuenta de usuario",
        status: 500,
      });
    }

    // Crear perfil en la base de datos
    try {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: userData.user.id,
        name: sanitizedName,
        email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        two_factor_enabled: false,
        account_locked: false,
        // Añadir los campos que faltan según el esquema de la base de datos
        avatar_url: null,
        last_login: null,
        login_attempts: 0,
      });

      if (profileError) {
        // Si hay error al crear el perfil, eliminar el usuario
        console.error(
          `[${requestId}] Error al crear perfil, eliminando usuario:`,
          profileError
        );
        await supabase.auth.admin.deleteUser(userData.user.id);
        throw new Error(`Error al crear perfil: ${profileError.message}`);
      }
    } catch (error) {
      console.error(`[${requestId}] Error al crear perfil de usuario:`, error);
      logError({
        source: "auth-register",
        message: "Error al crear perfil",
        error,
        context: { userId: userData.user.id, requestId },
      });

      // Intentar eliminar el usuario si ya fue creado
      try {
        await supabase.auth.admin.deleteUser(userData.user.id);
      } catch (deleteError) {
        console.error(
          `[${requestId}] Error adicional al intentar eliminar usuario:`,
          deleteError
        );
      }

      return createErrorResponse({
        code: ErrorCodes.PROFILE_ERROR,
        message: "Error al crear perfil de usuario",
        status: 500,
      });
    }

    // Registrar la actividad de registro
    try {
      await supabase.from("security_logs").insert({
        user_id: userData.user.id,
        activity_type: "registration",
        ip_address: clientIp.split(",")[0],
        user_agent: userAgent,
        timestamp: new Date().toISOString(),
        details: {
          registration_method: "email",
          request_id: requestId,
        },
        resolved: true,
      });
    } catch (error) {
      // No fallamos el registro por un error en el log de seguridad
      console.warn(
        `[${requestId}] Error al registrar log de seguridad:`,
        error
      );
    }

    // Calcular duración del proceso
    const duration = Date.now() - startTime;
    console.log(`[${requestId}] Registro completado en ${duration}ms`);

    return NextResponse.json({
      success: true,
      userId: userData.user.id,
      requestId,
    });
  } catch (error) {
    console.error(`[${requestId}] Error no manejado en registro:`, error);
    logError({
      source: "auth-register",
      message: "Error no manejado en registro",
      error,
      context: { requestId, clientIp: clientIp.split(",")[0] },
    });
    return createErrorResponse({
      code: ErrorCodes.SERVER_ERROR,
      message: "Error interno del servidor",
      status: 500,
    });
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

    if (!response.ok) {
      throw new Error(`Error de API reCAPTCHA: ${response.status}`);
    }

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error("Error al verificar reCAPTCHA:", error);
    return false;
  }
}

// Función para crear respuestas de error consistentes
function createErrorResponse({
  code = ErrorCodes.SERVER_ERROR,
  message = "Error interno del servidor",
  details = null,
  status = 500,
}: {
  code?: string;
  message?: string;
  details?: any;
  status?: number;
}) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code,
      ...(details ? { details } : {}),
    },
    { status }
  );
}
