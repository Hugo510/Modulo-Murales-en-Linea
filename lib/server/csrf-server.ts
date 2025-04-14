import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

// Configuración de la cookie CSRF
const CSRF_COOKIE_NAME = "csrf_token";
const CSRF_COOKIE_MAX_AGE = 60 * 60; // 1 hora

// Generar un token CSRF
export async function generateCsrfToken(): Promise<string> {
  const token = uuidv4();

  try {
    // Guardar el token en una cookie HTTP-only con configuración mejorada
    const cookieStore = await cookies();

    // Eliminar cualquier cookie anterior para evitar conflictos
    cookieStore.delete(CSRF_COOKIE_NAME);

    // Establecer la nueva cookie con configuración robusta
    cookieStore.set(CSRF_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // Cambiado de "strict" a "lax" para mejor compatibilidad
      path: "/",
      maxAge: CSRF_COOKIE_MAX_AGE,
      priority: "high",
    });

    console.log(
      `[CSRF] Nuevo token generado: ${token.substring(
        0,
        6
      )}... (cookie configurada)`
    );
    return token;
  } catch (error) {
    console.error("[CSRF] Error al generar token:", error);
    throw new Error("No se pudo generar el token CSRF");
  }
}

// Verificar un token CSRF con mejor manejo de errores y logging
export async function verifyCsrfToken(token: string): Promise<boolean> {
  try {
    if (!token || token.trim() === "") {
      console.warn("[CSRF] Token proporcionado está vacío o nulo");
      return false;
    }

    const cookieStore = await cookies();
    const storedToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;

    if (!storedToken) {
      console.warn("[CSRF] No hay token almacenado en cookie");

      // Registrar todas las cookies existentes para depuración
      const allCookies = cookieStore.getAll();
      console.log(
        `[CSRF] Cookies disponibles: ${allCookies
          .map((c) => c.name)
          .join(", ")}`
      );

      return false;
    }

    const isValid = token === storedToken;

    if (!isValid) {
      console.warn(
        `[CSRF] Verificación fallida. Token recibido: ${token.substring(
          0,
          6
        )}..., ` + `Token almacenado: ${storedToken.substring(0, 6)}...`
      );
    } else {
      console.log(
        `[CSRF] Verificación exitosa para token: ${token.substring(0, 6)}...`
      );
    }

    return isValid;
  } catch (error) {
    console.error("[CSRF] Error al verificar token:", error);
    // En caso de error, rechazar la solicitud por seguridad
    return false;
  }
}
