import { getSupabaseClient } from "@/lib/supabase/client";
import type {
  Mural,
  Permission,
  PermissionRole,
  MuralFilters,
  MuralItem,
} from "@/types/mural";
import type { User } from "@/contexts/auth-context";
import type { Database } from "@/lib/supabase/database.types";

// Interfaces para los resultados de consultas específicas
interface ProfileResult {
  name: string;
  avatar_url: string | null;
}

interface PermissionWithProfile {
  id: string;
  role: string;
  added_at: string;
  added_by: string | null;
  user_id: string;
  profiles: ProfileResult | null;
}

// Función para obtener perfil de usuario - mejora la modularidad
async function fetchUserProfile(userId: string): Promise<ProfileResult | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("name, avatar_url")
      .eq("id", userId)
      .single();

    if (error || !data) {
      console.error(`Error al obtener perfil del usuario ${userId}:`, error);
      return null;
    }

    return data as ProfileResult;
  } catch (e) {
    console.error(
      `Error inesperado al obtener perfil del usuario ${userId}:`,
      e
    );
    return null;
  }
}

// Función para convertir un mural de Supabase a nuestro formato
const convertMuralFromDB = async (
  mural: Database["public"]["Tables"]["murals"]["Row"],
  includeItems = false,
  includePermissions = false
): Promise<Mural> => {
  const supabase = getSupabaseClient();

  // Obtener el propietario usando la función auxiliar
  const ownerProfile = await fetchUserProfile(mural.owner_id);

  // Obtener elementos si se solicitan
  let items: MuralItem[] = [];
  if (includeItems) {
    const { data: muralItems } = await supabase
      .from("mural_items")
      .select("*")
      .eq("mural_id", mural.id)
      .order("created_at", { ascending: true });

    items = (muralItems || []).map((item) => ({
      id: item.id,
      type: item.type as "text" | "image" | "link" | "video" | "file",
      content: item.content,
      title: item.title || undefined,
      description: item.description || undefined,
      caption: item.caption || undefined,
      position: { x: item.position_x, y: item.position_y },
      color: item.color || undefined,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
      createdBy: item.created_by || "",
    }));
  }

  // Obtener permisos si se solicitan
  let permissions: Permission[] = [];
  if (includePermissions) {
    const { data: muralPermissions, error } = await supabase
      .from("permissions")
      .select(
        `
        id,
        role,
        added_at,
        added_by,
        user_id,
        profiles:user_id (
          name,
          avatar_url
        )
      `
      )
      .eq("mural_id", mural.id);

    if (error) {
      console.error(
        `Error al obtener permisos para el mural ${mural.id}:`,
        error
      );
    } else if (muralPermissions) {
      // Convertir los resultados a un tipo seguro
      permissions = muralPermissions.map((perm: any) => {
        // Usar una variable temporal tipada para el perfil
        const profile: ProfileResult | null = perm.profiles;

        return {
          id: perm.id,
          userId: perm.user_id,
          userEmail: "", // No tenemos acceso directo al email desde la tabla de permisos
          userName: profile?.name || "Usuario",
          userAvatar: profile?.avatar_url || undefined,
          role: perm.role as PermissionRole,
          addedAt: new Date(perm.added_at),
          addedBy: perm.added_by || "",
        };
      });
    }
  }

  // Verificar si es favorito para el usuario actual
  const { data: session } = await supabase.auth.getSession();
  let isFavorite = false;

  if (session?.session?.user) {
    const { data: favorite } = await supabase
      .from("favorites")
      .select("id")
      .eq("mural_id", mural.id)
      .eq("user_id", session.session.user.id)
      .maybeSingle();

    isFavorite = !!favorite;
  }

  // Construir el objeto mural
  return {
    id: mural.id,
    title: mural.title,
    description: mural.description || "",
    color: mural.color,
    layout: mural.layout as "grid" | "masonry",
    isPublic: mural.is_public,
    allowComments: mural.allow_comments,
    allowEditing: mural.allow_editing,
    createdAt: new Date(mural.created_at),
    updatedAt: new Date(mural.updated_at),
    ownerId: mural.owner_id,
    ownerName: ownerProfile?.name || "Usuario",
    ownerAvatar: ownerProfile?.avatar_url || undefined,
    permissions: permissions,
    items: items,
    views: mural.views,
    lastViewed: mural.last_viewed ? new Date(mural.last_viewed) : undefined,
    tags: mural.tags || [],
    category: mural.category || undefined,
    isFavorite: isFavorite,
  };
};

// Obtener todos los murales
export const getAllMurals = async (): Promise<Mural[]> => {
  const supabase = getSupabaseClient();

  const { data: murals, error } = await supabase
    .from("murals")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error al obtener murales:", error);
    return [];
  }

  // Convertir murales al formato de la aplicación
  const formattedMurals = await Promise.all(
    (murals || []).map((mural) => convertMuralFromDB(mural))
  );

  return formattedMurals;
};

// Obtener un mural por ID
export const getMuralById = async (id: string): Promise<Mural | null> => {
  const supabase = getSupabaseClient();

  const { data: mural, error } = await supabase
    .from("murals")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error al obtener mural ${id}:`, error);
    return null;
  }

  if (!mural) return null;

  // Convertir mural al formato de la aplicación, incluyendo items y permisos
  return await convertMuralFromDB(mural, true, true);
};

// Verificar si un usuario tiene acceso a un mural
export const hasAccessToMural = async (
  muralId: string,
  userId: string
): Promise<boolean> => {
  const supabase = getSupabaseClient();

  // Obtener el mural
  const { data: mural, error } = await supabase
    .from("murals")
    .select("owner_id, is_public")
    .eq("id", muralId)
    .single();

  if (error || !mural) {
    console.error(`Error al verificar acceso al mural ${muralId}:`, error);
    return false;
  }

  // El propietario siempre tiene acceso
  if (mural.owner_id === userId) return true;

  // Si el mural es público, cualquiera puede verlo
  if (mural.is_public) return true;

  // Verificar si el usuario tiene permisos específicos
  const { data: permission, error: permError } = await supabase
    .from("permissions")
    .select("id")
    .eq("mural_id", muralId)
    .eq("user_id", userId)
    .maybeSingle();

  if (permError) {
    console.error(
      `Error al verificar permisos para el mural ${muralId}:`,
      permError
    );
    return false;
  }

  return !!permission;
};

// Verificar el rol de un usuario en un mural
export const getUserRoleInMural = async (
  muralId: string,
  userId: string
): Promise<PermissionRole | null> => {
  const supabase = getSupabaseClient();

  // Obtener el mural
  const { data: mural, error } = await supabase
    .from("murals")
    .select("owner_id")
    .eq("id", muralId)
    .single();

  if (error || !mural) {
    console.error(`Error al verificar rol en el mural ${muralId}:`, error);
    return null;
  }

  // El propietario tiene el rol más alto
  if (mural.owner_id === userId) return "owner";

  // Buscar permisos específicos
  const { data: permission, error: permError } = await supabase
    .from("permissions")
    .select("role")
    .eq("mural_id", muralId)
    .eq("user_id", userId)
    .maybeSingle();

  if (permError) {
    console.error(
      `Error al verificar permisos para el mural ${muralId}:`,
      permError
    );
    return null;
  }

  return permission ? (permission.role as PermissionRole) : null;
};

// Verificar si un usuario puede editar un mural
export const canEditMural = async (
  muralId: string,
  userId: string
): Promise<boolean> => {
  const supabase = getSupabaseClient();

  // Obtener el mural con la configuración de edición
  const { data: mural, error } = await supabase
    .from("murals")
    .select("owner_id, allow_editing")
    .eq("id", muralId)
    .single();

  if (error || !mural) {
    console.error(
      `Error al verificar permisos de edición para el mural ${muralId}:`,
      error
    );
    return false;
  }

  // El propietario siempre puede editar
  if (mural.owner_id === userId) return true;

  // Verificar si el usuario tiene rol de editor
  const role = await getUserRoleInMural(muralId, userId);

  // Solo propietarios y editores pueden editar, y solo si está permitida la edición
  return role === "editor" && mural.allow_editing;
};

// Verificar si un usuario puede comentar en un mural
export const canCommentOnMural = async (
  muralId: string,
  userId: string
): Promise<boolean> => {
  const supabase = getSupabaseClient();

  // Obtener el mural con la configuración de comentarios
  const { data: mural, error } = await supabase
    .from("murals")
    .select("owner_id, allow_comments")
    .eq("id", muralId)
    .single();

  if (error || !mural) {
    console.error(
      `Error al verificar permisos de comentarios para el mural ${muralId}:`,
      error
    );
    return false;
  }

  // El propietario siempre puede comentar
  if (mural.owner_id === userId) return true;

  // Verificar el rol del usuario
  const role = await getUserRoleInMural(muralId, userId);

  // Propietarios, editores y comentaristas pueden comentar, si está permitido
  return (role === "editor" || role === "commenter") && mural.allow_comments;
};

// Verificar si un usuario puede compartir un mural
export const canShareMural = async (
  muralId: string,
  userId: string
): Promise<boolean> => {
  const supabase = getSupabaseClient();

  // Obtener el propietario del mural
  const { data: mural, error } = await supabase
    .from("murals")
    .select("owner_id")
    .eq("id", muralId)
    .single();

  if (error || !mural) {
    console.error(
      `Error al verificar permisos de compartir para el mural ${muralId}:`,
      error
    );
    return false;
  }

  // Solo el propietario puede compartir
  return mural.owner_id === userId;
};

// Obtener murales accesibles para un usuario según filtros
export const getMuralsForUser = async (
  userId: string,
  filters: MuralFilters
): Promise<Mural[]> => {
  const supabase = getSupabaseClient();
  let query = supabase.from("murals").select("*");

  // Aplicar filtros según la vista seleccionada
  switch (filters.view) {
    case "owned":
      // Murales que el usuario posee
      query = query.eq("owner_id", userId);
      break;
    case "shared":
      // Murales compartidos con el usuario (a través de permisos)
      const { data: sharedMuralIds } = await supabase
        .from("permissions")
        .select("mural_id")
        .eq("user_id", userId);

      if (sharedMuralIds && sharedMuralIds.length > 0) {
        const ids = sharedMuralIds.map((item) => item.mural_id);
        query = query.in("id", ids);
      } else {
        // Si no hay murales compartidos, devolver array vacío
        return [];
      }
      break;
    case "favorites":
      // Murales marcados como favoritos
      const { data: favoriteMuralIds } = await supabase
        .from("favorites")
        .select("mural_id")
        .eq("user_id", userId);

      if (favoriteMuralIds && favoriteMuralIds.length > 0) {
        const ids = favoriteMuralIds.map((item) => item.mural_id);
        query = query.in("id", ids);
      } else {
        // Si no hay favoritos, devolver array vacío
        return [];
      }
      break;
    case "recent":
      // Murales vistos recientemente
      query = query
        .not("last_viewed", "is", null)
        .order("last_viewed", { ascending: false })
        .limit(10);

      // Filtrar por acceso después de obtener los resultados
      break;
    case "all":
    default:
      // Todos los murales accesibles (propios, compartidos y públicos)
      // Esto es más complejo y requiere filtrado posterior
      break;
  }

  // Aplicar filtro de categoría si existe
  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  // Aplicar búsqueda si existe
  if (filters.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    );
  }

  // Ordenar según el criterio seleccionado
  switch (filters.sort) {
    case "name":
      query = query.order("title", { ascending: true });
      break;
    case "oldest":
      query = query.order("created_at", { ascending: true });
      break;
    case "recent":
    default:
      query = query.order("updated_at", { ascending: false });
      break;
  }

  const { data: murals, error } = await query;

  if (error) {
    console.error("Error al obtener murales:", error);
    return [];
  }

  // Para la vista "all", necesitamos filtrar los resultados para incluir solo
  // murales propios, compartidos o públicos
  let filteredMurals = murals || [];

  if (filters.view === "all") {
    // Obtener IDs de murales compartidos
    const { data: sharedMuralIds } = await supabase
      .from("permissions")
      .select("mural_id")
      .eq("user_id", userId);

    const sharedIds = (sharedMuralIds || []).map((item) => item.mural_id);

    // Filtrar para incluir solo murales propios, compartidos o públicos
    filteredMurals = filteredMurals.filter(
      (mural) =>
        mural.owner_id === userId ||
        sharedIds.includes(mural.id) ||
        mural.is_public
    );
  }

  // Convertir murales al formato de la aplicación
  const formattedMurals = await Promise.all(
    filteredMurals.map((mural) => convertMuralFromDB(mural))
  );

  return formattedMurals;
};

// Crear un nuevo mural
export const createMural = async (
  muralData: Partial<Mural>,
  userId: string
): Promise<Mural | null> => {
  const supabase = getSupabaseClient();

  // Preparar datos para insertar
  const newMural = {
    title: muralData.title || "Nuevo Mural",
    description: muralData.description || "",
    color: muralData.color || "bg-gradient-to-br from-pink-400 to-purple-500",
    layout: muralData.layout || "grid",
    is_public: muralData.isPublic !== undefined ? muralData.isPublic : false,
    allow_comments:
      muralData.allowComments !== undefined ? muralData.allowComments : true,
    allow_editing:
      muralData.allowEditing !== undefined ? muralData.allowEditing : true,
    owner_id: userId,
    tags: muralData.tags || [],
    category: muralData.category || "personal",
  };

  // Insertar el nuevo mural
  const { data: mural, error } = await supabase
    .from("murals")
    .insert([newMural])
    .select()
    .single();

  if (error) {
    console.error("Error al crear mural:", error);
    return null;
  }

  if (!mural) return null;

  // Registrar actividad
  await supabase.from("activity_logs").insert([
    {
      user_id: userId,
      mural_id: mural.id,
      action_type: "create_mural",
      details: { title: mural.title },
    },
  ]);

  // Convertir y devolver el mural creado
  return await convertMuralFromDB(mural, true, true);
};

// Actualizar un mural existente
export const updateMural = async (
  id: string,
  updates: Partial<Mural>,
  userId: string
): Promise<Mural | null> => {
  const supabase = getSupabaseClient();

  // Verificar permisos
  const canEdit = await canEditMural(id, userId);
  if (!canEdit) return null;

  // Verificar si el usuario es propietario
  const isOwner = (await getUserRoleInMural(id, userId)) === "owner";

  // Preparar actualizaciones
  const muralUpdates: any = {};

  // El propietario puede actualizar todos los campos
  if (isOwner) {
    if (updates.title !== undefined) muralUpdates.title = updates.title;
    if (updates.description !== undefined)
      muralUpdates.description = updates.description;
    if (updates.color !== undefined) muralUpdates.color = updates.color;
    if (updates.layout !== undefined) muralUpdates.layout = updates.layout;
    if (updates.isPublic !== undefined)
      muralUpdates.is_public = updates.isPublic;
    if (updates.allowComments !== undefined)
      muralUpdates.allow_comments = updates.allowComments;
    if (updates.allowEditing !== undefined)
      muralUpdates.allow_editing = updates.allowEditing;
    if (updates.tags !== undefined) muralUpdates.tags = updates.tags;
    if (updates.category !== undefined)
      muralUpdates.category = updates.category;
  }

  // Siempre actualizar la fecha de modificación
  muralUpdates.updated_at = new Date().toISOString();

  // Actualizar el mural si hay cambios
  if (Object.keys(muralUpdates).length > 0) {
    const { error: updateError } = await supabase
      .from("murals")
      .update(muralUpdates)
      .eq("id", id);

    if (updateError) {
      console.error(`Error al actualizar mural ${id}:`, updateError);
      return null;
    }
  }

  // Actualizar elementos si se proporcionan
  if (updates.items) {
    // Primero, eliminar todos los elementos existentes
    const { error: deleteError } = await supabase
      .from("mural_items")
      .delete()
      .eq("mural_id", id);

    if (deleteError) {
      console.error(
        `Error al eliminar elementos del mural ${id}:`,
        deleteError
      );
      return null;
    }

    // Luego, insertar los nuevos elementos
    const items = updates.items.map((item) => ({
      mural_id: id,
      type: item.type,
      content: item.content,
      title: item.title || null,
      description: item.description || null,
      caption: item.caption || null,
      position_x: item.position.x,
      position_y: item.position.y,
      color: item.color || null,
      created_by: item.createdBy || userId,
      created_at: item.createdAt
        ? item.createdAt.toISOString()
        : new Date().toISOString(),
      updated_at: item.updatedAt
        ? item.updatedAt.toISOString()
        : new Date().toISOString(),
    }));

    if (items.length > 0) {
      const { error: insertError } = await supabase
        .from("mural_items")
        .insert(items);

      if (insertError) {
        console.error(
          `Error al insertar elementos en el mural ${id}:`,
          insertError
        );
        return null;
      }
    }
  }

  // Registrar actividad
  await supabase.from("activity_logs").insert([
    {
      user_id: userId,
      mural_id: id,
      action_type: "update_mural",
      details: muralUpdates,
    },
  ]);

  // Obtener y devolver el mural actualizado
  return await getMuralById(id);
};

// Eliminar un mural
export const deleteMural = async (
  id: string,
  userId: string
): Promise<boolean> => {
  const supabase = getSupabaseClient();

  // Verificar si el usuario es propietario
  const isOwner = (await getUserRoleInMural(id, userId)) === "owner";
  if (!isOwner) return false;

  // Eliminar el mural (las restricciones de clave foránea eliminarán automáticamente
  // los elementos, permisos, etc. relacionados)
  const { error } = await supabase.from("murals").delete().eq("id", id);

  if (error) {
    console.error(`Error al eliminar mural ${id}:`, error);
    return false;
  }

  // Registrar actividad
  await supabase.from("activity_logs").insert([
    {
      user_id: userId,
      action_type: "delete_mural",
      details: { mural_id: id },
    },
  ]);

  return true;
};

// Compartir un mural con otro usuario
export const shareMural = async (
  muralId: string,
  sharedByUserId: string,
  sharedWithUser: User,
  role: PermissionRole
): Promise<boolean> => {
  const supabase = getSupabaseClient();

  // Verificar si el usuario tiene permisos para compartir
  const canShare = await canShareMural(muralId, sharedByUserId);
  if (!canShare) return false;

  // Verificar si el usuario ya tiene permisos
  const { data: existingPermission, error: checkError } = await supabase
    .from("permissions")
    .select("id")
    .eq("mural_id", muralId)
    .eq("user_id", sharedWithUser.id)
    .maybeSingle();

  if (checkError) {
    console.error(
      `Error al verificar permisos existentes para el mural ${muralId}:`,
      checkError
    );
    return false;
  }

  if (existingPermission) {
    // Actualizar el permiso existente
    const { error: updateError } = await supabase
      .from("permissions")
      .update({ role, added_by: sharedByUserId })
      .eq("id", existingPermission.id);

    if (updateError) {
      console.error(
        `Error al actualizar permiso para el mural ${muralId}:`,
        updateError
      );
      return false;
    }
  } else {
    // Crear un nuevo permiso
    const { error: insertError } = await supabase.from("permissions").insert([
      {
        mural_id: muralId,
        user_id: sharedWithUser.id,
        role,
        added_by: sharedByUserId,
      },
    ]);

    if (insertError) {
      console.error(
        `Error al crear permiso para el mural ${muralId}:`,
        insertError
      );
      return false;
    }
  }

  // Registrar actividad
  await supabase.from("activity_logs").insert([
    {
      user_id: sharedByUserId,
      mural_id: muralId,
      action_type: "share_mural",
      details: { shared_with: sharedWithUser.id, role },
    },
  ]);

  return true;
};

// Eliminar permisos de un usuario
export const removePermission = async (
  muralId: string,
  permissionId: string,
  userId: string
): Promise<boolean> => {
  const supabase = getSupabaseClient();

  // Verificar si el usuario tiene permisos para modificar permisos
  const canShare = await canShareMural(muralId, userId);
  if (!canShare) return false;

  // Eliminar el permiso
  const { error } = await supabase
    .from("permissions")
    .delete()
    .eq("id", permissionId)
    .eq("mural_id", muralId);

  if (error) {
    console.error(`Error al eliminar permiso ${permissionId}:`, error);
    return false;
  }

  // Registrar actividad
  await supabase.from("activity_logs").insert([
    {
      user_id: userId,
      mural_id: muralId,
      action_type: "remove_permission",
      details: { permission_id: permissionId },
    },
  ]);

  return true;
};

// Marcar un mural como favorito
export const toggleFavorite = async (
  muralId: string,
  userId: string
): Promise<boolean> => {
  const supabase = getSupabaseClient();

  // Verificar si el usuario tiene acceso al mural
  const hasAccess = await hasAccessToMural(muralId, userId);
  if (!hasAccess) return false;

  // Verificar si ya está marcado como favorito
  const { data: existingFavorite, error: checkError } = await supabase
    .from("favorites")
    .select("id")
    .eq("mural_id", muralId)
    .eq("user_id", userId)
    .maybeSingle();

  if (checkError) {
    console.error(
      `Error al verificar favorito para el mural ${muralId}:`,
      checkError
    );
    return false;
  }

  if (existingFavorite) {
    // Eliminar de favoritos
    const { error: deleteError } = await supabase
      .from("favorites")
      .delete()
      .eq("id", existingFavorite.id);

    if (deleteError) {
      console.error(
        `Error al eliminar favorito para el mural ${muralId}:`,
        deleteError
      );
      return false;
    }
  } else {
    // Añadir a favoritos
    const { error: insertError } = await supabase.from("favorites").insert([
      {
        mural_id: muralId,
        user_id: userId,
      },
    ]);

    if (insertError) {
      console.error(
        `Error al añadir favorito para el mural ${muralId}:`,
        insertError
      );
      return false;
    }
  }

  return true;
};

// Registrar una vista de mural
export const recordMuralView = async (
  muralId: string,
  userId: string
): Promise<boolean> => {
  const supabase = getSupabaseClient();

  // Verificar si el usuario tiene acceso al mural
  const hasAccess = await hasAccessToMural(muralId, userId);
  if (!hasAccess) return false;

  // Incrementar contador de vistas y actualizar fecha de última vista
  const { error } = await supabase
    .from("murals")
    .update({
      views: supabase.rpc("increment", {
        row_id: muralId,
        table: "murals",
        column: "views",
      }),
      last_viewed: new Date().toISOString(),
    })
    .eq("id", muralId);

  if (error) {
    console.error(`Error al registrar vista para el mural ${muralId}:`, error);
    return false;
  }

  return true;
};
