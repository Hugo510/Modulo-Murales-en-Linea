import { NextResponse } from "next/server";
import { generateCsrfToken } from "@/lib/server/csrf-server";

export async function GET() {
  try {
    // Generar un nuevo token CSRF con el método centralizado
    const token = await generateCsrfToken();

    // Agregar encabezados para evitar el almacenamiento en caché
    return new NextResponse(JSON.stringify({ token, timestamp: Date.now() }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        "X-CSRF-Token-Debug": "generated", // Header de depuración
      },
    });
  } catch (error) {
    console.error("[API] Error generating CSRF token:", error);
    return new NextResponse(
      JSON.stringify({
        error: "Failed to generate CSRF token",
        errorCode: "CSRF_GEN_FAILED",
        timestamp: Date.now(),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
