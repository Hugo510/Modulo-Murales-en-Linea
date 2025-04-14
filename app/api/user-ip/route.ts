import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Obtener la IP del cliente desde los encabezados
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown";

    // Devolver la IP en un formato similar a ipify
    return NextResponse.json(
      { ip },
      {
        headers: {
          "Cache-Control": "no-store, private, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Error al obtener IP del usuario:", error);
    return NextResponse.json({ ip: "unknown" }, { status: 500 });
  }
}
