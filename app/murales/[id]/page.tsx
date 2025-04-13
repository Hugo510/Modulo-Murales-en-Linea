"use client"

import { Input } from "@/components/ui/input"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MuralItem } from "@/components/mural-item"
import { MuralToolbar } from "@/components/mural-toolbar"
import { AddItemDialog } from "@/components/add-item-dialog"
import { ShareMuralDialog } from "@/components/share-mural-dialog"
import { MuralSettingsDialog } from "@/components/mural-settings-dialog"
import { CommentsPanel } from "@/components/comments-panel"
import { ActiveUsers } from "@/components/active-users"
import { RemoteCursors } from "@/components/remote-cursors"
import { ClassroomActivityManager } from "@/components/classroom-activity-manager"
import { MuralExportOptions } from "@/components/mural-export-options"
import {
  Share2,
  Settings,
  MessageSquare,
  Clock,
  Eye,
  Save,
  AlertTriangle,
  Users,
  BookOpen,
  Download,
  PresentationIcon,
  Timer,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useAuth } from "@/contexts/auth-context"
import { useRealtime } from "@/contexts/realtime-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  getMuralById,
  hasAccessToMural,
  canEditMural,
  canCommentOnMural,
  canShareMural,
  recordMuralView,
  updateMural,
} from "@/services/mural-service"
// Actualizar las importaciones para incluir el tipo ImageSearchResult
import type { Mural, MuralItem as IMuralItem } from "@/types/mural"
import type { ImageSearchResult } from "@/types/image"

interface MuralPageProps {
  params: {
    id: string
  }
}

export default function MuralPage({ params }: MuralPageProps) {
  const { user } = useAuth()
  const { joinMural, leaveMural, updateCursorPosition, focusItem, broadcastChange, activeUsers, isConnected } =
    useRealtime()
  const router = useRouter()
  const [mural, setMural] = useState<Mural | null>(null)
  const [items, setItems] = useState<IMuralItem[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [showCollaborators, setShowCollaborators] = useState(false)
  const [activeTab, setActiveTab] = useState("canvas")
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null)
  const [zIndexes, setZIndexes] = useState<Record<string, number>>({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)
  const [canEdit, setCanEdit] = useState(false)
  const [canComment, setCanComment] = useState(false)
  const [canShare, setCanShare] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showEducationalTools, setShowEducationalTools] = useState(false)
  const [showExportOptions, setShowExportOptions] = useState(false)
  const [presentationMode, setPresentationMode] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const [timerDuration, setTimerDuration] = useState(300) // 5 minutos en segundos
  const [timeRemaining, setTimeRemaining] = useState(300)

  const canvasRef = useRef<HTMLDivElement>(null)
  const nextZIndex = useRef(1)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Cargar el mural y verificar permisos
  useEffect(() => {
    if (!user) return

    const loadMural = async () => {
      try {
        const muralData = await getMuralById(params.id)

        if (!muralData) {
          toast({
            title: "Error",
            description: "No se encontró el mural solicitado",
            variant: "destructive",
          })
          router.push("/")
          return
        }

        // Verificar acceso
        const access = await hasAccessToMural(params.id, user.id)
        if (!access) {
          toast({
            title: "Acceso denegado",
            description: "No tienes permisos para ver este mural",
            variant: "destructive",
          })
          router.push("/")
          return
        }

        // Registrar vista
        await recordMuralView(params.id, user.id)

        // Establecer datos y permisos
        setMural(muralData)
        setItems(muralData.items)
        setHasAccess(access)
        setCanEdit(await canEditMural(params.id, user.id))
        setCanComment(await canCommentOnMural(params.id, user.id))
        setCanShare(await canShareMural(params.id, user.id))

        // Inicializar zIndexes
        const initialZIndexes: Record<string, number> = {}
        muralData.items.forEach((item, index) => {
          initialZIndexes[item.id] = index + 1
        })
        setZIndexes(initialZIndexes)
        nextZIndex.current = muralData.items.length + 1

        // Unirse al canal de tiempo real
        joinMural(params.id)

        setIsLoading(false)
      } catch (error) {
        console.error("Error al cargar el mural:", error)
        toast({
          title: "Error",
          description: "Ocurrió un error al cargar el mural",
          variant: "destructive",
        })
        router.push("/")
      }
    }

    loadMural()

    // Limpiar al desmontar
    return () => {
      leaveMural()
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [params.id, user, router, joinMural, leaveMural])

  // Manejar el temporizador
  useEffect(() => {
    if (timerActive && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setTimerActive(false)
            clearInterval(timerRef.current as NodeJS.Timeout)
            toast({
              title: "¡Tiempo finalizado!",
              description: "El tiempo asignado para la actividad ha terminado.",
            })
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else if (!timerActive && timerRef.current) {
      clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [timerActive, timeRemaining])

  // Manejar el movimiento del mouse para actualizar la posición del cursor
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    updateCursorPosition(x, y)
  }

  // Manejar el enfoque de un elemento
  const handleItemFocus = (itemId: string) => {
    if (focusedItemId === itemId) return

    setFocusedItemId(itemId)
    focusItem(itemId)

    // Actualizar el zIndex del elemento enfocado
    setZIndexes((prev) => {
      const newZIndexes = { ...prev }
      newZIndexes[itemId] = nextZIndex.current
      nextZIndex.current += 1
      return newZIndexes
    })
  }

  // Manejar el clic en el canvas para quitar el enfoque
  const handleCanvasClick = (e: React.MouseEvent) => {
    // Solo quitar el enfoque si se hace clic directamente en el canvas
    if (e.target === canvasRef.current) {
      setFocusedItemId(null)
      focusItem(null)
    }
  }

  // Añadir un nuevo elemento al mural
  const addItem = async (newItem: Omit<IMuralItem, "id" | "position" | "createdAt" | "updatedAt" | "createdBy">) => {
    if (!user || !mural || !canEdit) return

    // Calcular una posición aleatoria pero visible en el canvas
    const canvasRect = canvasRef.current?.getBoundingClientRect()
    const maxX = canvasRect ? canvasRect.width - 350 : 500
    const maxY = canvasRect ? canvasRect.height - 300 : 500

    const randomX = Math.max(50, Math.floor(Math.random() * maxX))
    const randomY = Math.max(100, Math.floor(Math.random() * maxY))

    const id = Date.now().toString()
    const newMuralItem: IMuralItem = {
      ...newItem,
      id,
      position: { x: randomX, y: randomY },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: user.id,
      style: mural.itemStyle || undefined,
    }

    // Actualizar estado local
    const updatedItems = [...items, newMuralItem]
    setItems(updatedItems)

    // Actualizar el zIndex del nuevo elemento
    setZIndexes((prev) => {
      const newZIndexes = { ...prev }
      newZIndexes[id] = nextZIndex.current
      nextZIndex.current += 1
      return newZIndexes
    })

    // Enfocar el nuevo elemento
    setFocusedItemId(id)
    focusItem(id)

    // Notificar a otros usuarios
    broadcastChange({
      type: "add",
      itemId: id,
      data: newMuralItem,
    })

    // Actualizar en el servicio
    if (mural) {
      await updateMural(mural.id, { items: updatedItems }, user.id)
    }

    setIsAddDialogOpen(false)
    setHasUnsavedChanges(false)

    toast({
      title: "Elemento añadido",
      description: "Se ha añadido un nuevo elemento al mural",
    })
  }

  // Actualizar la función de MuralToolbar para manejar la adición de imágenes
  const handleAddImage = async (imageData: ImageSearchResult) => {
    if (!user || !mural || !canEdit) return

    // Calcular una posición aleatoria pero visible en el canvas
    const canvasRect = canvasRef.current?.getBoundingClientRect()
    const maxX = canvasRect ? canvasRect.width - 350 : 500
    const maxY = canvasRect ? canvasRect.height - 300 : 500

    const randomX = Math.max(50, Math.floor(Math.random() * maxX))
    const randomY = Math.max(100, Math.floor(Math.random() * maxY))

    const id = Date.now().toString()
    const newMuralItem: IMuralItem = {
      id,
      type: "image",
      content: imageData.url,
      title: imageData.description,
      description: `Imagen por ${imageData.authorName}`,
      caption: `Fuente: ${imageData.source}`,
      position: { x: randomX, y: randomY },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: user.id,
      style: mural.itemStyle || undefined,
    }

    // Actualizar estado local
    const updatedItems = [...items, newMuralItem]
    setItems(updatedItems)

    // Actualizar el zIndex del nuevo elemento
    setZIndexes((prev) => {
      const newZIndexes = { ...prev }
      newZIndexes[id] = nextZIndex.current
      nextZIndex.current += 1
      return newZIndexes
    })

    // Enfocar el nuevo elemento
    setFocusedItemId(id)
    focusItem(id)

    // Notificar a otros usuarios
    broadcastChange({
      type: "add",
      itemId: id,
      data: newMuralItem,
    })

    // Actualizar en el servicio
    if (mural) {
      await updateMural(mural.id, { items: updatedItems }, user.id)
    }

    setHasUnsavedChanges(false)

    toast({
      title: "Imagen añadida",
      description: "Se ha añadido una nueva imagen al mural",
    })
  }

  // Actualizar un elemento existente
  const updateItem = async (id: string, updates: Partial<IMuralItem>) => {
    if (!user || !mural || !canEdit) return

    // Verificar si otro usuario está editando este elemento
    const isBeingEditedByOther = activeUsers.some(
      (activeUser) => activeUser.id !== user.id && activeUser.focusedItemId === id,
    )

    if (isBeingEditedByOther) {
      toast({
        title: "Elemento bloqueado",
        description: "Este elemento está siendo editado por otro usuario",
        variant: "destructive",
      })
      return
    }

    const updatedItems = items.map((item) => (item.id === id ? { ...item, ...updates, updatedAt: new Date() } : item))

    setItems(updatedItems)
    setHasUnsavedChanges(true)

    // Notificar a otros usuarios
    broadcastChange({
      type: "update",
      itemId: id,
      data: updates,
    })

    // Actualizar en el servicio
    if (mural) {
      await updateMural(mural.id, { items: updatedItems }, user.id)
      setHasUnsavedChanges(false)
    }
  }

  // Eliminar un elemento
  const deleteItem = async (id: string) => {
    if (!user || !mural || !canEdit) return

    // Verificar si otro usuario está editando este elemento
    const isBeingEditedByOther = activeUsers.some(
      (activeUser) => activeUser.id !== user.id && activeUser.focusedItemId === id,
    )

    if (isBeingEditedByOther) {
      toast({
        title: "Elemento bloqueado",
        description: "Este elemento está siendo editado por otro usuario",
        variant: "destructive",
      })
      return
    }

    const updatedItems = items.filter((item) => item.id !== id)
    setItems(updatedItems)

    if (focusedItemId === id) {
      setFocusedItemId(null)
      focusItem(null)
    }

    // Notificar a otros usuarios
    broadcastChange({
      type: "delete",
      itemId: id,
    })

    // Actualizar en el servicio
    if (mural) {
      await updateMural(mural.id, { items: updatedItems }, user.id)
    }

    toast({
      title: "Elemento eliminado",
      description: "Se ha eliminado el elemento del mural",
    })
  }

  // Guardar los cambios del mural
  const saveMural = async () => {
    if (!user || !mural) return

    // Actualizar en el servicio
    await updateMural(mural.id, { items }, user.id)
    setHasUnsavedChanges(false)

    toast({
      title: "Mural guardado",
      description: "Todos los cambios han sido guardados correctamente",
    })
  }

  // Manejar la actualización del mural
  const handleMuralUpdated = async () => {
    if (!user) return

    // Recargar el mural
    const muralData = await getMuralById(params.id)
    if (muralData) {
      setMural(muralData)
      setCanEdit(await canEditMural(params.id, user.id))
      setCanComment(await canCommentOnMural(params.id, user.id))
      setCanShare(await canShareMural(params.id, user.id))
    }
  }

  // Iniciar el modo presentación
  const startPresentation = () => {
    setPresentationMode(true)
    setCurrentSlide(0)
  }

  // Avanzar a la siguiente diapositiva
  const nextSlide = () => {
    if (currentSlide < items.length - 1) {
      setCurrentSlide(currentSlide + 1)
    }
  }

  // Retroceder a la diapositiva anterior
  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  // Salir del modo presentación
  const exitPresentation = () => {
    setPresentationMode(false)
  }

  // Iniciar o pausar el temporizador
  const toggleTimer = () => {
    if (timerActive) {
      setTimerActive(false)
    } else {
      setTimerActive(true)
    }
  }

  // Reiniciar el temporizador
  const resetTimer = () => {
    setTimeRemaining(timerDuration)
    setTimerActive(false)
  }

  // Formatear el tiempo restante
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  // Si está cargando, mostrar un indicador de carga
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  // Si no hay mural o no tiene acceso, mostrar mensaje de error
  if (!mural || !hasAccess) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>No tienes acceso a este mural o no existe.</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => router.push("/")} variant="outline">
            Volver al inicio
          </Button>
        </div>
      </div>
    )
  }

  // Determinar el estilo de fondo
  const backgroundStyle = mural.background
    ? mural.background.startsWith("url")
      ? { backgroundImage: mural.background, backgroundSize: "cover", backgroundPosition: "center" }
      : {}
    : {}

  // Renderizar el modo presentación
  if (presentationMode) {
    const currentItem = items[currentSlide]
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={exitPresentation} className="text-white">
              Salir
            </Button>
            <div className="text-sm">
              Diapositiva {currentSlide + 1} de {items.length}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={prevSlide} disabled={currentSlide === 0} className="text-white">
              Anterior
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextSlide}
              disabled={currentSlide === items.length - 1}
              className="text-white"
            >
              Siguiente
            </Button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-8" style={backgroundStyle}>
          {currentItem && (
            <div
              className="max-w-4xl w-full mx-auto bg-white rounded-lg shadow-2xl p-8"
              style={{
                borderRadius: currentItem.style?.borderRadius || 8,
                backgroundColor: currentItem.style?.backgroundColor || "#ffffff",
                color: currentItem.style?.textColor || "#1e293b",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              }}
            >
              <h2 className="text-3xl font-bold mb-4">{currentItem.title || `Elemento ${currentSlide + 1}`}</h2>
              <div className="text-xl whitespace-pre-wrap">{currentItem.content}</div>
              {currentItem.type === "image" && (
                <div className="mt-4">
                  <img
                    src={currentItem.content || "/placeholder.svg"}
                    alt={currentItem.title || "Imagen"}
                    className="max-h-[60vh] mx-auto object-contain"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="border-b bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-600">
              {mural.title}
            </h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <p>{mural.description}</p>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Actualizado {new Date(mural.updatedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{mural.views} vistas</span>
              </div>
              {isConnected && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Conectado en tiempo real
                </Badge>
              )}
              {timerActive && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  <Timer className="h-3 w-3 mr-1" />
                  {formatTime(timeRemaining)}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {canEdit && (
              <Button
                variant={hasUnsavedChanges ? "default" : "outline"}
                size="sm"
                onClick={saveMural}
                className={hasUnsavedChanges ? "bg-blue-500 hover:bg-blue-600" : "border-blue-200 hover:bg-blue-50"}
              >
                <Save className="h-4 w-4 mr-2 text-blue-500" />
                {hasUnsavedChanges ? "Guardar cambios" : "Guardado"}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCollaborators(!showCollaborators)}
              className={`border-blue-200 hover:bg-blue-50 ${showCollaborators ? "bg-blue-50" : ""}`}
            >
              <Users className="h-4 w-4 mr-2 text-blue-500" />
              Colaboradores
              <Badge className="ml-2 bg-blue-500">{activeUsers.length}</Badge>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEducationalTools(!showEducationalTools)}
              className={`border-green-200 hover:bg-green-50 ${showEducationalTools ? "bg-green-50" : ""}`}
            >
              <BookOpen className="h-4 w-4 mr-2 text-green-500" />
              Herramientas educativas
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExportOptions(!showExportOptions)}
              className={`border-purple-200 hover:bg-purple-50 ${showExportOptions ? "bg-purple-50" : ""}`}
            >
              <Download className="h-4 w-4 mr-2 text-purple-500" />
              Exportar
            </Button>
            {canShare && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsShareDialogOpen(true)}
                className="border-purple-200 hover:bg-purple-50"
              >
                <Share2 className="h-4 w-4 mr-2 text-purple-500" />
                Compartir
              </Button>
            )}
            {canComment && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowComments(!showComments)}
                className={`border-pink-200 hover:bg-pink-50 ${showComments ? "bg-pink-50" : ""}`}
              >
                <MessageSquare className="h-4 w-4 mr-2 text-pink-500" />
                Comentarios
                <Badge className="ml-2 bg-pink-500">5</Badge>
              </Button>
            )}
            {canShare && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSettingsDialogOpen(true)}
                className="border-amber-200 hover:bg-amber-50"
              >
                <Settings className="h-4 w-4 mr-2 text-amber-500" />
                Configuración
              </Button>
            )}
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b">
          <div className="container mx-auto px-4">
            <TabsList className="h-10">
              <TabsTrigger value="canvas" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                Lienzo
              </TabsTrigger>
              <TabsTrigger
                value="presentation"
                className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700"
              >
                Presentación
              </TabsTrigger>
              <TabsTrigger
                value="timeline"
                className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700"
              >
                Línea de tiempo
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700"
              >
                Actividad
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="canvas" className="flex-1 flex flex-col data-[state=active]:flex-1">
          {canEdit && (
            <MuralToolbar onAddItem={() => setIsAddDialogOpen(true)} onAddImage={handleAddImage} muralId={params.id} />
          )}

          <div className="flex flex-1 overflow-hidden">
            <div
              ref={canvasRef}
              className={`flex-1 overflow-auto p-4 relative ${
                mural.background && !mural.background.startsWith("url") ? mural.background : ""
              }`}
              style={backgroundStyle}
              onClick={handleCanvasClick}
              onMouseMove={handleMouseMove}
            >
              {!canEdit && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                    Modo visualización
                  </Badge>
                </div>
              )}

              {timerActive && (
                <div className="absolute top-4 left-4 z-10 bg-white/90 border border-amber-200 rounded-lg p-2 shadow-md">
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-amber-500" />
                    <span className="font-medium text-amber-700">{formatTime(timeRemaining)}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={toggleTimer}>
                      {timerActive ? (
                        <PauseIcon className="h-4 w-4 text-amber-500" />
                      ) : (
                        <PlayIcon className="h-4 w-4 text-amber-500" />
                      )}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={resetTimer}>
                      <RefreshCcwIcon className="h-4 w-4 text-amber-500" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Cursores remotos */}
              <RemoteCursors />

              <div className="relative w-full h-full min-h-[800px]">
                {items.map((item) => {
                  // Verificar si este elemento está siendo editado por otro usuario
                  const editingUser = activeUsers.find(
                    (activeUser) => activeUser.id !== user?.id && activeUser.focusedItemId === item.id,
                  )

                  return (
                    <MuralItem
                      key={item.id}
                      item={item}
                      onUpdate={canEdit ? updateItem : undefined}
                      onDelete={canEdit ? deleteItem : undefined}
                      zIndex={zIndexes[item.id] || 1}
                      onFocus={handleItemFocus}
                      readOnly={!canEdit || !!editingUser}
                      editingUser={editingUser}
                    />
                  )
                })}
              </div>
            </div>

            {showCollaborators && (
              <div className="w-80 border-l bg-white overflow-auto p-4">
                <h3 className="font-medium mb-4">Colaboradores activos</h3>
                <ActiveUsers />
              </div>
            )}

            {showComments && canComment && (
              <div className="w-80 border-l bg-white overflow-auto">
                <CommentsPanel muralId={params.id} />
              </div>
            )}

            {showEducationalTools && (
              <div className="w-96 border-l bg-white overflow-auto p-4">
                <div className="space-y-6">
                  <h3 className="font-medium">Herramientas educativas</h3>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Temporizador de actividad</h4>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={timerDuration}
                        onChange={(e) => {
                          const value = Number.parseInt(e.target.value)
                          setTimerDuration(value)
                          setTimeRemaining(value)
                        }}
                        className="w-20"
                        min="1"
                      />
                      <span className="text-sm text-muted-foreground">segundos</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleTimer}
                        className={timerActive ? "bg-amber-50 text-amber-700" : ""}
                      >
                        {timerActive ? "Pausar" : "Iniciar"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={resetTimer}>
                        Reiniciar
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Presentación</h4>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={startPresentation} className="w-full">
                        <PresentationIcon className="h-4 w-4 mr-2" />
                        Iniciar presentación
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Recursos educativos</h4>
                    <div className="space-y-1">
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <BookOpen className="h-4 w-4 mr-2 text-blue-500" />
                        Guía de actividades
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <Users className="h-4 w-4 mr-2 text-purple-500" />
                        Gestionar grupos
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <CheckCircleIcon className="h-4 w-4 mr-2 text-green-500" />
                        Evaluación
                      </Button>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                      onClick={() => setActiveTab("activity")}
                    >
                      Configurar como actividad educativa
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {showExportOptions && (
              <div className="w-96 border-l bg-white overflow-auto p-4">
                <MuralExportOptions muralId={params.id} muralTitle={mural.title} />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent
          value="presentation"
          className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-teal-50"
        >
          <div className="text-center p-8 max-w-md">
            <h2 className="text-2xl font-bold text-green-700 mb-4">Modo Presentación</h2>
            <p className="text-muted-foreground mb-6">
              Presenta tu mural como una presentación de diapositivas. Cada elemento se mostrará como una diapositiva
              individual.
            </p>
            <Button
              className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
              onClick={startPresentation}
            >
              <PresentationIcon className="h-4 w-4 mr-2" />
              Iniciar Presentación
            </Button>
          </div>
        </TabsContent>

        <TabsContent
          value="timeline"
          className="flex-1 overflow-auto bg-gradient-to-br from-purple-50 to-indigo-50 p-6"
        >
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-purple-700 mb-6">Línea de Tiempo</h2>

            <div className="relative border-l-2 border-purple-300 ml-4 pl-8 space-y-8">
              {[...items]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((item, index) => (
                  <div key={item.id} className="relative">
                    <div className="absolute -left-10 mt-1.5 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs">
                      {index + 1}
                    </div>
                    <div className={`p-4 rounded-lg shadow-sm ${item.color}`}>
                      <div className="font-medium mb-1">{item.title || `Elemento ${item.type}`}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.type === "text" ? item.content : "Contenido multimedia"}
                      </div>
                      <div className="text-xs text-purple-600 mt-2">
                        Añadido el {new Date(item.createdAt).toLocaleDateString()} por{" "}
                        {item.createdBy === user?.id ? "ti" : "otro colaborador"}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="flex-1 overflow-auto bg-gradient-to-br from-amber-50 to-orange-50 p-6">
          <div className="max-w-3xl mx-auto">
            <ClassroomActivityManager
              muralId={params.id}
              muralTitle={mural.title}
              muralDescription={mural.description || ""}
            />
          </div>
        </TabsContent>
      </Tabs>

      {canEdit && <AddItemDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onAddItem={addItem} />}

      {canShare && (
        <ShareMuralDialog
          open={isShareDialogOpen}
          onOpenChange={setIsShareDialogOpen}
          mural={mural}
          onMuralUpdated={handleMuralUpdated}
        />
      )}

      {canShare && (
        <MuralSettingsDialog
          open={isSettingsDialogOpen}
          onOpenChange={setIsSettingsDialogOpen}
          muralId={params.id}
          onMuralUpdated={handleMuralUpdated}
        />
      )}

      <Toaster />
    </div>
  )
}

function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

function PauseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  )
}

function PlayIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  )
}

function RefreshCcwIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 2v6h6" />
      <path d="M21 12A9 9 0 0 0 6 5.3L3 8" />
      <path d="M21 22v-6h-6" />
      <path d="M3 12a9 9 0 0 0 15 6.7l3-2.7" />
    </svg>
  )
}
