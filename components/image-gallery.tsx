"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, ImageIcon, History, Bookmark, RefreshCw, ExternalLink, Info, Plus } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from "@/contexts/auth-context"
import { getRelevantImages, searchImages, getUserImageHistory, saveImageToHistory } from "@/services/image-service"
import type { ImageSearchResult, ImageGalleryProps } from "@/types/image"

export function ImageGallery({ muralId, onSelectImage, onClose }: ImageGalleryProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("relevant")
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [relevantImages, setRelevantImages] = useState<ImageSearchResult[]>([])
  const [searchResults, setSearchResults] = useState<ImageSearchResult[]>([])
  const [historyImages, setHistoryImages] = useState<ImageSearchResult[]>([])
  const [savedImages, setSavedImages] = useState<ImageSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<ImageSearchResult | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // Cargar imágenes relevantes al montar el componente
  useEffect(() => {
    const loadRelevantImages = async () => {
      setIsLoading(true)
      try {
        const images = await getRelevantImages(muralId)
        setRelevantImages(images)
      } catch (error) {
        console.error("Error al cargar imágenes relevantes:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadRelevantImages()
  }, [muralId])

  // Cargar historial de imágenes cuando se activa la pestaña
  useEffect(() => {
    if (activeTab === "history" && user) {
      const loadHistory = async () => {
        setIsLoading(true)
        try {
          const images = await getUserImageHistory(user.id)
          setHistoryImages(images)
        } catch (error) {
          console.error("Error al cargar historial de imágenes:", error)
        } finally {
          setIsLoading(false)
        }
      }

      loadHistory()
    }
  }, [activeTab, user])

  // Función para buscar imágenes
  const handleSearch = async (resetPage = true) => {
    if (!searchQuery.trim()) return

    setIsSearching(true)

    try {
      const currentPage = resetPage ? 1 : page
      const results = await searchImages(searchQuery, currentPage)

      if (resetPage) {
        setSearchResults(results)
        setPage(1)
      } else {
        setSearchResults([...searchResults, ...results])
        setPage(currentPage + 1)
      }

      setHasMore(results.length > 0)
    } catch (error) {
      console.error("Error al buscar imágenes:", error)
    } finally {
      setIsSearching(false)
    }
  }

  // Manejar cambio de búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Manejar envío del formulario de búsqueda
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch()
  }

  // Cargar más resultados
  const loadMore = () => {
    handleSearch(false)
  }

  // Seleccionar una imagen
  const handleSelectImage = async (image: ImageSearchResult) => {
    setSelectedImage(image)

    // Guardar en historial si el usuario está autenticado
    if (user) {
      await saveImageToHistory(user.id, image)
    }

    // Llamar a la función de selección
    onSelectImage(image)
  }

  // Renderizar skeleton de carga
  const renderSkeletons = () => {
    return Array(8)
      .fill(0)
      .map((_, index) => (
        <div key={index} className="rounded-lg overflow-hidden">
          <Skeleton className="w-full h-40" />
          <div className="p-2">
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))
  }

  // Renderizar una imagen
  const renderImage = (image: ImageSearchResult) => {
    return (
      <div
        key={image.id}
        className="rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow bg-white"
      >
        <div className="relative aspect-video overflow-hidden bg-gray-100">
          <img
            src={image.thumbnailUrl || "/placeholder.svg"}
            alt={image.description}
            className="w-full h-full object-cover transition-transform hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end justify-between p-2">
            <div className="flex gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 bg-white/80 hover:bg-white"
                      onClick={() => handleSelectImage(image)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Añadir al mural</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 bg-white/80 hover:bg-white"
                      onClick={() => window.open(image.authorUrl, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Ver autor</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
        <div className="p-2">
          <p className="text-xs text-gray-500 truncate">{image.description}</p>
          <p className="text-xs text-gray-400">Por {image.authorName}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="relevant" className="flex items-center gap-1">
              <ImageIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Relevantes</span>
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-1">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Buscar</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Historial</span>
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-1">
              <Bookmark className="h-4 w-4" />
              <span className="hidden sm:inline">Guardadas</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="relevant" className="flex-1 overflow-hidden flex flex-col">
          <div className="p-3 flex items-center justify-between">
            <h3 className="text-sm font-medium">Imágenes relevantes para tu mural</h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={async () => {
                setIsLoading(true)
                const images = await getRelevantImages(muralId)
                setRelevantImages(images)
                setIsLoading(false)
              }}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Actualizar
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-3">
              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">{renderSkeletons()}</div>
              ) : relevantImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">{relevantImages.map(renderImage)}</div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <ImageIcon className="h-12 w-12 text-gray-300 mb-2" />
                  <h3 className="text-lg font-medium">No hay imágenes relevantes</h3>
                  <p className="text-sm text-gray-500 max-w-md">
                    Añade más contenido a tu mural para que podamos sugerirte imágenes relacionadas.
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="search" className="flex-1 overflow-hidden flex flex-col">
          <div className="p-3">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <Input
                placeholder="Buscar imágenes..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="flex-1"
              />
              <Button type="submit" disabled={isSearching || !searchQuery.trim()}>
                {isSearching ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </form>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-3">
              {isSearching && searchResults.length === 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">{renderSkeletons()}</div>
              ) : searchResults.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">{searchResults.map(renderImage)}</div>

                  {hasMore && (
                    <div className="mt-4 text-center">
                      <Button variant="outline" onClick={loadMore} disabled={isSearching}>
                        {isSearching ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Cargando...
                          </>
                        ) : (
                          "Cargar más"
                        )}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Search className="h-12 w-12 text-gray-300 mb-2" />
                  <h3 className="text-lg font-medium">Busca imágenes</h3>
                  <p className="text-sm text-gray-500 max-w-md">
                    Escribe términos de búsqueda para encontrar imágenes relacionadas con tu mural.
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="history" className="flex-1 overflow-hidden flex flex-col">
          <div className="p-3">
            <h3 className="text-sm font-medium">Imágenes usadas recientemente</h3>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-3">
              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">{renderSkeletons()}</div>
              ) : historyImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">{historyImages.map(renderImage)}</div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <History className="h-12 w-12 text-gray-300 mb-2" />
                  <h3 className="text-lg font-medium">No hay historial</h3>
                  <p className="text-sm text-gray-500 max-w-md">
                    Las imágenes que uses aparecerán aquí para que puedas acceder a ellas rápidamente.
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="saved" className="flex-1 overflow-hidden flex flex-col">
          <div className="p-3">
            <h3 className="text-sm font-medium">Imágenes guardadas</h3>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-3">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bookmark className="h-12 w-12 text-gray-300 mb-2" />
                <h3 className="text-lg font-medium">Próximamente</h3>
                <p className="text-sm text-gray-500 max-w-md">
                  La función para guardar imágenes favoritas estará disponible próximamente.
                </p>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <div className="p-3 border-t flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center">
          <Info className="h-3 w-3 mr-1" />
          <span>Imágenes de Unsplash y Pexels</span>
        </div>

        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        )}
      </div>
    </div>
  )
}
