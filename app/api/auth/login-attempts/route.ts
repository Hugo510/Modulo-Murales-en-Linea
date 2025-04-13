import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    // Obtener la IP del cliente (eliminar request.ip que no existe)
    const ipAddress = request.headers.get("x-forwarded-for") || "unknown";

    // Añadir await para resolver la Promise
    const supabase = await getSupabaseServer();

    // Obtener intentos fallidos recientes desde la misma IP
    const thirtyMinutesAgo = new Date(
      Date.now() - 30 * 60 * 1000
    ).toISOString();

    const { data, error } = await supabase
      .from("login_attempts")
      .select("*")
      .eq("ip_address", ipAddress)
      .eq("success", false)
      .gte("timestamp", thirtyMinutesAgo);

    if (error) {
      console.error("Error al obtener intentos de inicio de sesión:", error);
      return NextResponse.json(
        { error: "Error al verificar intentos de inicio de sesión" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      attempts: data ? data.length : 0,
    });
  } catch (error) {
    console.error("Error al verificar intentos de inicio de sesión:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
