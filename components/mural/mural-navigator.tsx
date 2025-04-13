"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Search, Users, ImageIcon, FileText, Link, Video, Layers, ZoomIn, ZoomOut, Map } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Card, CardContent } from "@/components/ui/card"
import { useRealtime } from "@/contexts/realtime-context"
import { cn } from "@/lib/utils"
import type { MuralItem } from "@/types/mural"

interface MuralNavigatorProps {
  items: MuralItem[]
  onItemSelect: (itemId: string) => void
  onUserLocate: (userId: string) => void
  canvasRef: React.RefObject<HTMLDivElement>
  zoomLevel: number
  onZoomChange: (level: number) => void
}

export function MuralNavigator({
  items,
  onItemSelect,
  onUserLocate,
  canvasRef,
  zoomLevel,
  onZoomChange,
}: MuralNavigatorProps) {
  const { activeUsers } = useRealtime()
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredItems, setFilteredItems] = useState<MuralItem[]>(items)
  const [showMinimap, setShowMinimap] = useState(false)
  const minimapRef = useRef<HTMLDivElement>(null)
  const minimapCanvasRef = useRef<HTMLCanvasElement>(null)

  // Actualizar elementos filtrados cuando cambia la búsqueda o los elementos
  useEffect(() => {
    if (!searchTerm) {
      setFilteredItems(items)
      return
    }

    const filtered = items.filter(
      (item) =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredItems(filtered)
  }, [searchTerm, items])

  // Renderizar el minimapa cuando se muestra
  useEffect(() => {
    if (showMinimap && minimapCanvasRef.current && canvasRef.current) {
      renderMinimap()
    }
  }, [showMinimap, items, activeUsers])

  // Función para renderizar el minimapa
  const renderMinimap = () => {
    const canvas = minimapCanvasRef.current
    const canvasContainer = canvasRef.current
    if (!canvas || !canvasContainer) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Limpiar el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Calcular la escala para el minimapa
    const containerRect = canvasContainer.getBoundingClientRect()
    const scaleX = canvas.width / containerRect.width
    const scaleY = canvas.height / containerRect.height

    // Dibujar un fondo claro
    ctx.fillStyle = "#f8fafc"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Dibujar los elementos
    items.forEach((item) => {
      // Determinar el color según el tipo de elemento
      switch (item.type) {
        case "text":
          ctx.fillStyle = "#3b82f6"
          break
        case "image":
          ctx.fillStyle = "#10b981"
          break
        case "link":
          ctx.fillStyle = "#8b5cf6"
          break
        case "video":
          ctx.fillStyle = "#ef4444"
          break
        case "file":
          ctx.fillStyle = "#f59e0b"
          break
        default:
          ctx.fillStyle = "#6b7280"
      }

      // Calcular la posición y tamaño en el minimapa
      const x = item.position.x * scaleX
      const y = item.position.y * scaleY
      const width = (item.type === "text" ? 300 : item.type === "image" || item.type === "video" ? 400 : 350) * scaleX
      const height = 200 * scaleY // Altura aproximada

      // Dibujar el elemento
      ctx.fillRect(x, y, width, height)
    })

    // Dibujar los usuarios activos
    activeUsers.forEach((user) => {
      if (user.cursorPosition) {
        ctx.fillStyle = "#ef4444"
        const x = user.cursorPosition.x * scaleX
        const y = user.cursorPosition.y * scaleY

        // Dibujar un punto para el cursor
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, 2 * Math.PI)
        ctx.fill()
      }
    })
  }

  // Función para manejar el clic en el minimapa
  const handleMinimapClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !minimapCanvasRef.current) return

    const canvas = minimapCanvasRef.current
    const canvasContainer = canvasRef.current
    const containerRect = canvasContainer.getBoundingClientRect()

    // Calcular la posición relativa en el minimapa
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Convertir a coordenadas del canvas real
    const scaleX = containerRect.width / canvas.width
    const scaleY = containerRect.height / canvas.height
    const realX = x * scaleX
    const realY = y * scaleY

    // Desplazar el canvas a esa posición
    canvasContainer.scrollTo({
      left: realX - containerRect.width / 2,
      top: realY - containerRect.height / 2,
      behavior: "smooth",
    })
  }

  // Obtener el icono según el tipo de elemento
  const getItemIcon = (type: string) => {
    switch (type) {
      case "text":
        return <FileText className="h-4 w-4 text-blue-500" />
      case "image":
        return <ImageIcon className="h-4 w-4 text-green-500" />
      case "link":
        return <Link className="h-4 w-4 text-purple-500" />
      case "video":
        return <Video className="h-4 w-4 text-red-500" />
      case "file":
        return <FileText className="h-4 w-4 text-amber-500" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  // Función para aumentar el zoom
  const zoomIn = () => {
    const newZoom = Math.min(zoomLevel + 0.1, 2)
    onZoomChange(newZoom)
  }

  // Función para disminuir el zoom
  const zoomOut = () => {
    const newZoom = Math.max(zoomLevel - 0.1, 0.5)
    onZoomChange(newZoom)
  }

  return (
    <div className="flex flex-col h-full border-l bg-white">
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar en el mural..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="elementos" className="flex-1 flex flex-col">
        <div className="border-b px-1">
          <TabsList className="w-full h-10">
            <TabsTrigger value="elementos" className="flex-1">
              <Layers className="h-4 w-4 mr-2" />
              Elementos
            </TabsTrigger>
            <TabsTrigger value="usuarios" className="flex-1">
              <Users className="h-4 w-4 mr-2" />
              Usuarios
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="elementos" className="flex-1 p-0">
          <div className="p-3 border-b flex items-center justify-between">
            <div className="text-sm font-medium">
              {searchTerm ? `${filteredItems.length} resultados` : `${items.length} elementos`}
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={zoomOut} className="h-8 w-8">
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-xs w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
              <Button variant="ghost" size="icon" onClick={zoomIn} className="h-8 w-8">
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMinimap(!showMinimap)}
                className={cn("h-8 w-8", showMinimap && "bg-blue-50 text-blue-600")}
              >
                <Map className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {showMinimap && (
            <div ref={minimapRef} className="p-3 border-b">
              <div className="bg-slate-50 rounded-md p-2 border">
                <div className="text-xs font-medium mb-2">Vista general del mural</div>
                <canvas
                  ref={minimapCanvasRef}
                  width={300}
                  height={200}
                  onClick={handleMinimapClick}
                  className="w-full h-auto border rounded cursor-pointer"
                />
                <div className="mt-2 text-xs text-muted-foreground">Haz clic en el mapa para navegar a esa área</div>
              </div>
            </div>
          )}

          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              {filteredItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "No se encontraron elementos" : "No hay elementos en este mural"}
                </div>
              ) : (
                filteredItems.map((item) => (
                  <Card
                    key={item.id}
                    className="cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => onItemSelect(item.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5">{getItemIcon(item.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{item.title || `Elemento ${item.type}`}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {item.type === "text"
                              ? item.content.substring(0, 50) + (item.content.length > 50 ? "..." : "")
                              : `Contenido tipo: ${item.type}`}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs",
                                item.type === "text" && "bg-blue-50 text-blue-700 border-blue-200",
                                item.type === "image" && "bg-green-50 text-green-700 border-green-200",
                                item.type === "link" && "bg-purple-50 text-purple-700 border-purple-200",
                                item.type === "video" && "bg-red-50 text-red-700 border-red-200",
                                item.type === "file" && "bg-amber-50 text-amber-700 border-amber-200",
                              )}
                            >
                              {item.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="usuarios" className="flex-1 p-0">
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              {activeUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No hay usuarios activos</div>
              ) : (
                activeUsers.map((user) => (
                  <Card
                    key={user.id}
                    className="cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => onUserLocate(user.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                          <AvatarFallback className="bg-blue-100 text-blue-700">
                            {user.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{user.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Activo hace {formatTimeAgo(user.lastActive)}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="h-2 w-2 rounded-full bg-green-500 ring-1 ring-white"></div>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p>Usuario activo</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      {user.focusedItemId && (
                        <div className="mt-2">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            Editando un elemento
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Función para formatear el tiempo transcurrido
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return `${diffInSeconds} segundos`
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutos`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} horas`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays} días`
}
