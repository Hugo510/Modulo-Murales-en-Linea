import { NextRequest, NextResponse } from "next/server";
import { generateCsrfToken } from "@/lib/csrf-server";

export async function GET(request: NextRequest) {
  try {
    // Generar un nuevo token CSRF
    const token = await generateCsrfToken();

    // Devolver el token en la respuesta
    return NextResponse.json({ token });
  } catch (error) {
    console.error("Error al generar token CSRF:", error);
    return NextResponse.json(
      { error: "Error al generar token CSRF" },
      { status: 500 }
    );
  }
}
