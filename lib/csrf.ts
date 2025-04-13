import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

// Generar un token CSRF
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

// Verificar un token CSRF
export async function verifyCsrfToken(token: string): Promise<boolean> {
  const cookieStore = await cookies();
  const storedToken = cookieStore.get("csrf_token")?.value;

  if (!storedToken || !token) {
    return false;
  }

  return token === storedToken;
}

// Hook para usar el token CSRF en componentes del cliente
export function useCsrfToken() {
  const getCsrfToken = async (): Promise<string> => {
    try {
      const response = await fetch("/api/csrf", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to get CSRF token");
      }

      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error("Error fetching CSRF token:", error);
      throw error;
    }
  };

  return { getCsrfToken };
}

// Reexportamos el componente desde el nuevo archivo
export { CsrfTokenField } from "./csrfComponents";
