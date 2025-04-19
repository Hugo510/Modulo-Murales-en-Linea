import { getSupabaseClient } from "@/lib/supabase/client";

/**
 * Verifica si un usuario es propietario de un mural específico
 */
export const isUserMuralOwner = async (
  muralId: string,
  userId?: string
): Promise<boolean> => {
  if (!muralId || !userId) return false;

  try {
    const supabase = getSupabaseClient();

    // Intentar obtener el mural directamente
    const { data, error } = await supabase
      .from("murals")
      .select("owner_id")
      .eq("id", muralId)
      .single();

    if (error) {
      console.error("Error verificando propiedad del mural:", error);
      return false;
    }

    return (
      data &&
      data.owner_id &&
      data.owner_id.toLowerCase() === userId.toLowerCase()
    );
  } catch (err) {
    console.error("Error inesperado verificando propiedad:", err);
    return false;
  }
};

/**
 * Función de utilidad para almacenar y persistir estado de propiedad en localStorage
 */
export const persistOwnership = (muralId: string, isOwner: boolean): void => {
  try {
    localStorage.setItem("is_mural_owner", isOwner ? "true" : "false");
    localStorage.setItem(
      "mural_" + muralId + "_permissions",
      isOwner ? "owner" : ""
    );

    console.log(
      `Estado de propiedad para mural ${muralId} persistido: ${isOwner}`
    );
  } catch (err) {
    console.warn("Error persistiendo estado de propiedad:", err);
  }
};
