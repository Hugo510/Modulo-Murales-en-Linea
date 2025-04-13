import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

// Generar un token CSRF (solo para usar en componentes de servidor)
export async function generateCsrfToken(): Promise<string> {
  const token = uuidv4();

  // Guardar el token en una cookie HTTP-only
  const cookieStore = await cookies();
  cookieStore.set("csrf_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60, // 1 hora
  });

  return token;
}

// Verificar un token CSRF (solo para usar en componentes de servidor)
export async function verifyCsrfToken(token: string): Promise<boolean> {
  const cookieStore = await cookies();
  const storedToken = cookieStore.get("csrf_token")?.value;

  if (!storedToken || !token) {
    return false;
  }

  return token === storedToken;
}
