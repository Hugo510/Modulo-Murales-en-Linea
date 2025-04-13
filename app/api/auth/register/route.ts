import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { verifyCsrfToken } from "@/lib/csrf";
import { validateForm, userSchema } from "@/lib/validation";
import { sanitizeInput } from "@/lib/validation";

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

    // Obtener y validar datos
    const body = await request.json();
    const validation = validateForm(userSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos de formulario inválidos", details: validation.errors },
        { status: 400 }
      );
    }

    const { name, email, password, recaptchaToken } = body;

    // Sanitizar entradas
    const sanitizedName = sanitizeInput(name);

    // Verificar reCAPTCHA
    if (recaptchaToken) {
      const recaptchaValid = await verifyRecaptcha(recaptchaToken);
      if (!recaptchaValid) {
        return NextResponse.json(
          { error: "Verificación reCAPTCHA fallida" },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Se requiere verificación reCAPTCHA" },
        { status: 400 }
      );
    }

    const supabase = await getSupabaseServer();

    // Verificar si el correo ya está en uso - reemplazar getUserByEmail
    const { data: users } = await supabase.auth.admin.listUsers();
    const existingUser = users?.users.find((user) => user.email === email);

    if (existingUser) {
      return NextResponse.json(
        { error: "El correo electrónico ya está en uso" },
        { status: 409 }
      );
    }

    // Crear usuario en Supabase Auth
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
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Crear perfil en la base de datos
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      name: sanitizedName,
      email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      two_factor_enabled: false,
      account_locked: false,
    });

    if (profileError) {
      // Si hay error al crear el perfil, eliminar el usuario
      await supabase.auth.admin.deleteUser(data.user.id);

      return NextResponse.json(
        { error: "Error al crear perfil de usuario" },
        { status: 500 }
      );
    }

    // Registrar la IP y dispositivo del registro
    const ipAddress = request.headers.get("x-forwarded-for") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    await supabase.from("security_logs").insert({
      user_id: data.user.id,
      activity_type: "registration",
      ip_address: ipAddress,
      user_agent: userAgent,
      timestamp: new Date().toISOString(),
      details: { registration_method: "email" },
      resolved: true,
    });

    return NextResponse.json({
      success: true,
      userId: data.user.id,
    });
  } catch (error) {
    console.error("Error en registro:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
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
