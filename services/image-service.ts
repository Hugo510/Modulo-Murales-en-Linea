import { getSupabaseClient } from "@/lib/supabase/client"
import type { ImageSearchResult } from "@/types/image"

// API keys para servicios de imágenes (en producción deberían estar en variables de entorno)
const UNSPLASH_ACCESS_KEY = "tu-api-key-de-unsplash" // Reemplazar con tu API key real
const PEXELS_API_KEY = "tu-api-key-de-pexels" // Reemplazar con tu API key real

// Función para buscar imágenes en Unsplash
export const searchUnsplashImages = async (query: string, page = 1, perPage = 20): Promise<ImageSearchResult[]> => {
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        query,
      )}&page=${page}&per_page=${perPage}&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      },
    )

    if (!response.ok) {
      throw new Error(`Error al buscar imágenes: ${response.status}`)
    }

    const data = await response.json()

    return data.results.map((image: any) => ({
      id: image.id,
      url: image.urls.regular,
      thumbnailUrl: image.urls.thumb,
      description: image.description || image.alt_description || "Imagen sin descripción",
      width: image.width,
      height: image.height,
      source: "unsplash",
      authorName: image.user.name,
      authorUrl: image.user.links.html,
      downloadUrl: image.links.download,
      tags: image.tags?.map((tag: any) => tag.title) || [],
    }))
  } catch (error) {
    console.error("Error al buscar imágenes en Unsplash:", error)
    return []
  }
}

// Función para buscar imágenes en Pexels
export const searchPexelsImages = async (query: string, page = 1, perPage = 20): Promise<ImageSearchResult[]> => {
  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`,
      {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      },
    )

    if (!response.ok) {
      throw new Error(`Error al buscar imágenes: ${response.status}`)
    }

    const data = await response.json()

    return data.photos.map((photo: any) => ({
      id: photo.id.toString(),
      url: photo.src.large,
      thumbnailUrl: photo.src.medium,
      description: photo.alt || "Imagen sin descripción",
      width: photo.width,
      height: photo.height,
      source: "pexels",
      authorName: photo.photographer,
      authorUrl: photo.photographer_url,
      downloadUrl: photo.src.original,
      tags: [],
    }))
  } catch (error) {
    console.error("Error al buscar imágenes en Pexels:", error)
    return []
  }
}

// Función para buscar imágenes en múltiples fuentes
export const searchImages = async (query: string, page = 1, perPage = 20): Promise<ImageSearchResult[]> => {
  // Por ahora, solo usamos Unsplash como fuente de imágenes
  // En un entorno de producción, podrías alternar entre fuentes o combinar resultados
  return await searchUnsplashImages(query, page, perPage)
}

// Función para obtener imágenes relevantes basadas en el contenido del mural
export const getRelevantImages = async (muralId: string, limit = 20): Promise<ImageSearchResult[]> => {
  const supabase = getSupabaseClient()

  try {
    // Obtener etiquetas y título del mural
    const { data: mural, error: muralError } = await supabase
      .from("murals")
      .select("title, tags, category")
      .eq("id", muralId)
      .single()

    if (muralError) {
      console.error("Error al obtener información del mural:", muralError)
      return []
    }

    // Obtener elementos de texto del mural para extraer palabras clave
    const { data: items, error: itemsError } = await supabase
      .from("mural_items")
      .select("title, content, type")
      .eq("mural_id", muralId)
      .in("type", ["text", "link"])

    if (itemsError) {
      console.error("Error al obtener elementos del mural:", itemsError)
    }

    // Construir consulta de búsqueda basada en el contenido del mural
    let searchTerms: string[] = []

    // Añadir título del mural
    if (mural.title) {
      searchTerms.push(mural.title)
    }

    // Añadir etiquetas
    if (mural.tags && mural.tags.length > 0) {
      searchTerms = [...searchTerms, ...mural.tags]
    }

    // Añadir categoría
    if (mural.category) {
      searchTerms.push(mural.category)
    }

    // Extraer palabras clave de los elementos de texto
    if (items && items.length > 0) {
      const textContent = items
        .filter((item) => item.title || (item.type === "text" && item.content))
        .map((item) => item.title || item.content)
        .join(" ")

      // Extraer palabras clave (palabras de más de 4 letras)
      const keywords = textContent
        .split(/\s+/)
        .filter((word) => word.length > 4)
        .slice(0, 5) // Limitar a 5 palabras clave

      searchTerms = [...searchTerms, ...keywords]
    }

    // Si no hay términos de búsqueda, usar un término genérico basado en la categoría
    if (searchTerms.length === 0) {
      searchTerms = ["educación", "colaboración", "creatividad"]
    }

    // Eliminar duplicados y limitar a 3 términos para no hacer la consulta demasiado específica
    const uniqueTerms = [...new Set(searchTerms)].slice(0, 3)
    const searchQuery = uniqueTerms.join(" ")

    // Buscar imágenes con la consulta generada
    return await searchImages(searchQuery, 1, limit)
  } catch (error) {
    console.error("Error al obtener imágenes relevantes:", error)
    return []
  }
}

// Función para guardar una imagen en el historial de imágenes usadas
export const saveImageToHistory = async (userId: string, imageData: ImageSearchResult): Promise<boolean> => {
  const supabase = getSupabaseClient()

  try {
    const { error } = await supabase.from("image_history").insert([
      {
        user_id: userId,
        image_id: imageData.id,
        source: imageData.source,
        url: imageData.url,
        thumbnail_url: imageData.thumbnailUrl,
        description: imageData.description,
        author_name: imageData.authorName,
        author_url: imageData.authorUrl,
        download_url: imageData.downloadUrl,
        tags: imageData.tags,
      },
    ])

    if (error) {
      console.error("Error al guardar imagen en historial:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error al guardar imagen en historial:", error)
    return false
  }
}

// Función para obtener el historial de imágenes usadas por un usuario
export const getUserImageHistory = async (userId: string, limit = 20): Promise<ImageSearchResult[]> => {
  const supabase = getSupabaseClient()

  try {
    const { data, error } = await supabase
      .from("image_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error al obtener historial de imágenes:", error)
      return []
    }

    return data.map((item) => ({
      id: item.image_id,
      url: item.url,
      thumbnailUrl: item.thumbnail_url,
      description: item.description,
      width: item.width || 800,
      height: item.height || 600,
      source: item.source,
      authorName: item.author_name,
      authorUrl: item.author_url,
      downloadUrl: item.download_url,
      tags: item.tags || [],
    }))
  } catch (error) {
    console.error("Error al obtener historial de imágenes:", error)
    return []
  }
}
