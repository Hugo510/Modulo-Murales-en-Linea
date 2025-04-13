import { getSupabaseClient } from "@/lib/supabase/client"
import type { ItemGroup } from "@/types/mural"

// Obtener todos los grupos de un mural
export const getGroupsByMuralId = async (muralId: string): Promise<ItemGroup[]> => {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from("mural_groups")
    .select("*")
    .eq("mural_id", muralId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error al obtener grupos:", error)
    return []
  }

  return (data || []).map((group) => ({
    id: group.id,
    name: group.name,
    color: group.color,
    itemIds: group.item_ids || [],
    createdAt: new Date(group.created_at),
    createdBy: group.created_by,
  }))
}

// Crear un nuevo grupo
export const createGroup = async (
  muralId: string,
  name: string,
  color: string,
  itemIds: string[],
  userId: string,
): Promise<ItemGroup | null> => {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from("mural_groups")
    .insert([
      {
        mural_id: muralId,
        name,
        color,
        item_ids: itemIds,
        created_by: userId,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error("Error al crear grupo:", error)
    return null
  }

  return {
    id: data.id,
    name: data.name,
    color: data.color,
    itemIds: data.item_ids || [],
    createdAt: new Date(data.created_at),
    createdBy: data.created_by,
  }
}

// Actualizar un grupo existente
export const updateGroup = async (groupId: string, updates: Partial<ItemGroup>): Promise<boolean> => {
  const supabase = getSupabaseClient()

  const updateData: any = {}
  if (updates.name !== undefined) updateData.name = updates.name
  if (updates.color !== undefined) updateData.color = updates.color
  if (updates.itemIds !== undefined) updateData.item_ids = updates.itemIds

  const { error } = await supabase.from("mural_groups").update(updateData).eq("id", groupId)

  if (error) {
    console.error("Error al actualizar grupo:", error)
    return false
  }

  return true
}

// Eliminar un grupo
export const deleteGroup = async (groupId: string): Promise<boolean> => {
  const supabase = getSupabaseClient()

  const { error } = await supabase.from("mural_groups").delete().eq("id", groupId)

  if (error) {
    console.error("Error al eliminar grupo:", error)
    return false
  }

  return true
}

// Obtener etiquetas populares
export const getPopularTags = async (limit = 20): Promise<string[]> => {
  const supabase = getSupabaseClient()

  // Esta consulta es más compleja y depende de cómo estén almacenadas las etiquetas
  // Aquí asumimos que hay una tabla o vista que contiene las etiquetas más usadas
  const { data, error } = await supabase
    .from("popular_tags")
    .select("tag, count")
    .order("count", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error al obtener etiquetas populares:", error)
    return []
  }

  return (data || []).map((item) => item.tag)
}
