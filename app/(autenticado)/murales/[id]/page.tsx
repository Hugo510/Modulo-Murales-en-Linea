"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MuralItem } from "@/components/mural/mural-item"
import { MuralToolbar } from "@/components/mural-toolbar"
import { AddItemDialog } from "@/components/add-item-dialog"
import { ShareMuralDialog } from "@/components/share-mural-dialog"
import { MuralSettingsDialog } from "@/components/mural-settings-dialog"
import { CommentsPanel } from "@/components/comments-panel"
import { ActiveUsers } from "@/components/active-users"
import { RemoteCursors } from "@/components/remote-cursors"
import { MuralNavigator } from "@/components/mural/mural-navigator"
import { GroupView } from "@/components/mural/group-view"
import {
  Share2,
  Settings,
  MessageSquare,
  Clock,
  Eye,
  Save,
  AlertTriangle,
  Users,
  Search,
  FolderKanban,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
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
import type { Mural, MuralItem as IMuralItem, ItemGroup } from "@/types/mural"
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
  const [groups, setGroups] = useState<ItemGroup[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [showCollaborators, setShowCollaborators] = useState(false)
  const [showNavigator, setShowNavigator] = useState(false)
  const [showGroups, setShowGroups] = useState(false)
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null)
  const [zIndexes, setZIndexes] = useState<Record<string, number>>({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)
  const [canEdit, setCanEdit] = useState(false)
  const [canComment, setCanComment] = useState(false)
  const [canShare, setCanShare] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [hiddenGroupIds, setHiddenGroupIds] = useState<string[]>([])
  const [suggestedTags, setSuggestedTags] = useState<string[]>([])

  const canvasRef = useRef<HTMLDivElement>(null)
  const nextZIndex = useRef(1)

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
          router.push("/dashboard")
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
          router.push("/dashboard")
          return
        }

        // Registrar vista
        await recordMuralView(params.id, user.id)

        // Establecer datos y permisos
        setMural(muralData)
        setItems(muralData.items)
        setGroups(muralData.groups || [])
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

        // Generar sugerencias de etiquetas basadas en las existentes
        const allTags = muralData.items
          .flatMap((item) => item.tags || [])
          .filter((tag, index, self) => self.indexOf(tag) === index)
        setSuggestedTags(allTags)

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
        router.push("/dashboard")
      }
    }

    loadMural()

    // Limpiar al desmontar
    return () => {
      leaveMural()
    }
  }, [params.id, user, router, joinMural, leaveMural])

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

    // Desplazar la vista para centrar el elemento
    scrollToItem(itemId)
  }

  // Desplazar la vista para centrar un elemento
  const scrollToItem = (itemId: string) => {
    const item = items.find((item) => item.id === itemId)
    if (!item || !canvasRef.current) return

    const containerRect = canvasRef.current.getBoundingClientRect()

    // Calcular el centro del elemento
    const itemCenterX = item.position.x + 150 // Ancho aproximado / 2
    const itemCenterY = item.position.y + 100 // Alto aproximado / 2

    // Desplazar el canvas para centrar el elemento
    canvasRef.current.scrollTo({
      left: itemCenterX - containerRect.width / 2,
      top: itemCenterY - containerRect.height / 2,
      behavior: "smooth",
    })
  }

  // Localizar a un usuario en el mural
  const locateUser = (userId: string) => {
    const user = activeUsers.find((user) => user.id === userId)
    if (!user || !user.cursorPosition || !canvasRef.current) return

    const containerRect = canvasRef.current.getBoundingClientRect()

    // Desplazar el canvas para centrar la posición del cursor del usuario
    canvasRef.current.scrollTo({
      left: user.cursorPosition.x - containerRect.width / 2,
      top: user.cursorPosition.y - containerRect.height / 2,
      behavior: "smooth",
    })

    // Mostrar una notificación
    toast({
      title: "Usuario localizado",
      description: `Has localizado a ${user.name} en el mural`,
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
      tags: [],
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
      tags: [],
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

    // Si se actualizaron las etiquetas, actualizar las sugerencias
    if (updates.tags) {
      const allTags = updatedItems
        .flatMap((item) => item.tags || [])
        .filter((tag, index, self) => self.indexOf(tag) === index)
      setSuggestedTags(allTags)
    }

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

    // Actualizar grupos para eliminar referencias al elemento eliminado
    const updatedGroups = groups.map((group) => ({
      ...group,
      itemIds: group.itemIds.filter((itemId) => itemId !== id),
    }))
    setGroups(updatedGroups)

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
      await updateMural(
        mural.id,
        {
          items: updatedItems,
          groups: updatedGroups,
        },
        user.id,
      )
    }

    toast({
      title: "Elemento eliminado",
      description: "Se ha eliminado el elemento del mural",
    })
  }

  // Crear un nuevo grupo
  const createGroup = async (name: string, color: string, itemIds: string[]) => {
    if (!user || !mural || !canEdit) return

    const newGroup: ItemGroup = {
      id: Date.now().toString(),
      name,
      color,
      itemIds,
      createdAt: new Date(),
      createdBy: user.id,
    }

    const updatedGroups = [...groups, newGroup]
    setGroups(updatedGroups)

    // Actualizar en el servicio
    if (mural) {
      await updateMural(mural.id, { groups: updatedGroups }, user.id)
    }

    toast({
      title: "Grupo creado",
      description: `Se ha creado el grupo "${name}"`,
    })
  }

  // Actualizar un grupo existente
  const updateGroup = async (groupId: string, itemIds: string[]) => {
    if (!user || !mural || !canEdit) return

    const updatedGroups = groups.map((group) => (group.id === groupId ? { ...group, itemIds } : group))
    setGroups(updatedGroups)

    // Actualizar en el servicio
    if (mural) {
      await updateMural(mural.id, { groups: updatedGroups }, user.id)
    }
  }

  // Manejar el cambio de visibilidad de un grupo
  const handleGroupVisibilityChange = (groupId: string, isVisible: boolean) => {
    if (isVisible) {
      // Mostrar el grupo
      setHiddenGroupIds((prev) => prev.filter((id) => id !== groupId))
    } else {
      // Ocultar el grupo
      setHiddenGroupIds((prev) => [...prev, groupId])
    }
  }

  // Filtrar elementos según los grupos ocultos
  const getVisibleItems = () => {
    if (hiddenGroupIds.length === 0) return items

    // Obtener todos los IDs de elementos en grupos ocultos
    const hiddenItemIds = new Set<string>()
    groups
      .filter((group) => hiddenGroupIds.includes(group.id))
      .forEach((group) => {
        group.itemIds.forEach((itemId) => hiddenItemIds.add(itemId))
      })

    // Filtrar elementos que no están en grupos ocultos
    return items.filter((item) => !hiddenItemIds.has(item.id))
  }

  // Guardar los cambios del mural
  const saveMural = async () => {
    if (!user || !mural) return

    // Actualizar en el servicio
    await updateMural(
      mural.id,
      {
        items,
        groups,
      },
      user.id,
    )
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
          <Button onClick={() => router.push("/dashboard")} variant="outline">
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

  // Obtener los elementos visibles
  const visibleItems = getVisibleItems()

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
              onClick={() => setShowNavigator(!showNavigator)}
              className={`border-blue-200 hover:bg-blue-50 ${showNavigator ? "bg-blue-50" : ""}`}
            >
              <Search className="h-4 w-4 mr-2 text-blue-500" />
              Buscar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGroups(!showGroups)}
              className={`border-purple-200 hover:bg-purple-50 ${showGroups ? "bg-purple-50" : ""}`}
            >
              <FolderKanban className="h-4 w-4 mr-2 text-purple-500" />
              Grupos
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCollaborators(!showCollaborators)}
              className={`border-green-200 hover:bg-green-50 ${showCollaborators ? "bg-green-50" : ""}`}
            >
              <Users className="h-4 w-4 mr-2 text-green-500" />
              Colaboradores
              <Badge className="ml-2 bg-green-500">{activeUsers.length}</Badge>
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

      <div className="flex flex-1 overflow-hidden">
        {canEdit && (
          <MuralToolbar onAddItem={() => setIsAddDialogOpen(true)} onAddImage={handleAddImage} muralId={params.id} />
        )}

        <div className="flex flex-1 overflow-hidden">
          <div
            ref={canvasRef}
            className={`flex-1 overflow-auto p-4 relative ${
              mural.background && !mural.background.startsWith("url") ? mural.background : ""
            }`}
            style={{
              ...backgroundStyle,
              transform: `scale(${zoomLevel})`,
              transformOrigin: "0 0",
            }}
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

            {/* Cursores remotos */}
            <RemoteCursors />

            <div className="relative w-full h-full min-h-[800px]">
              {visibleItems.map((item) => {
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
                    groups={groups}
                    onUpdateGroups={updateGroup}
                    onCreateGroup={createGroup}
                    suggestedTags={suggestedTags}
                  />
                )
              })}
            </div>
          </div>

          {showNavigator && (
            <div className="w-80 border-l bg-white">
              <MuralNavigator
                items={items}
                onItemSelect={handleItemFocus}
                onUserLocate={locateUser}
                canvasRef={canvasRef}
                zoomLevel={zoomLevel}
                onZoomChange={setZoomLevel}
              />
            </div>
          )}

          {showGroups && (
            <div className="w-80 border-l bg-white">
              <GroupView
                groups={groups}
                items={items}
                onItemSelect={handleItemFocus}
                onGroupVisibilityChange={handleGroupVisibilityChange}
              />
            </div>
          )}

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
        </div>
      </div>

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
