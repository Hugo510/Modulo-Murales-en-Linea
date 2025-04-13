"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Trash, Edit, Check, X, LinkIcon, ImageIcon, FileText, Video } from "lucide-react"
import Draggable from "react-draggable"
import { cn } from "@/lib/utils"
import type { MuralItem as IMuralItem } from "@/types/mural"

interface MuralItemProps {
  item: IMuralItem
  onUpdate?: (id: string, updates: Partial<IMuralItem>) => void
  onDelete?: (id: string) => void
  zIndex: number
  onFocus: (id: string) => void
  readOnly?: boolean
  editingUser?: {
    id: string
    name: string
    avatar?: string
  }
}

export function MuralItem({
  item,
  onUpdate,
  onDelete,
  zIndex,
  onFocus,
  readOnly = false,
  editingUser,
}: MuralItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(item.content)
  const [editedTitle, setEditedTitle] = useState(item.title || "")
  const [position, setPosition] = useState(item.position)
  const nodeRef = useRef<HTMLDivElement>(null)

  // Aplicar estilos personalizados si están disponibles
  const itemStyle = item.style || {}

  useEffect(() => {
    setPosition(item.position)
  }, [item.position])

  const handleDragStop = (_e: any, data: { x: number; y: number }) => {
    const newPosition = { x: data.x, y: data.y }
    setPosition(newPosition)
    if (onUpdate) {
      onUpdate(item.id, { position: newPosition })
    }
  }

  const handleEdit = () => {
    if (readOnly) return
    setIsEditing(true)
  }

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(item.id, {
        content: editedContent,
        title: editedTitle || undefined,
      })
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedContent(item.content)
    setEditedTitle(item.title || "")
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(item.id)
    }
  }

  const getItemIcon = () => {
    switch (item.type) {
      case "image":
        return <ImageIcon className="h-4 w-4 text-blue-500" />
      case "link":
        return <LinkIcon className="h-4 w-4 text-purple-500" />
      case "video":
        return <Video className="h-4 w-4 text-red-500" />
      case "file":
        return <FileText className="h-4 w-4 text-green-500" />
      default:
        return null
    }
  }

  const renderContent = () => {
    if (isEditing) {
      return (
        <div className="space-y-2">
          <Input
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            placeholder="Título (opcional)"
            className="border-2 focus-visible:ring-blue-500"
          />
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            rows={4}
            className="border-2 focus-visible:ring-blue-500"
            autoFocus
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button size="sm" variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Check className="h-4 w-4 mr-1" />
              Guardar
            </Button>
          </div>
        </div>
      )
    }

    switch (item.type) {
      case "text":
        return (
          <>
            {item.title && <CardTitle className="text-base mb-2">{item.title}</CardTitle>}
            <div className="whitespace-pre-wrap">{item.content}</div>
          </>
        )
      case "image":
        return (
          <>
            {item.title && <CardTitle className="text-base mb-2">{item.title}</CardTitle>}
            <div className="overflow-hidden rounded-md">
              <img
                src={item.content || "/placeholder.svg"}
                alt={item.caption || "Imagen"}
                className="w-full h-auto object-cover"
              />
            </div>
            {item.caption && <p className="text-xs text-muted-foreground mt-2">{item.caption}</p>}
          </>
        )
      case "link":
        return (
          <>
            {item.title && <CardTitle className="text-base mb-2">{item.title}</CardTitle>}
            <a
              href={item.content}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all"
            >
              {item.content}
            </a>
            {item.description && <p className="text-sm mt-2">{item.description}</p>}
          </>
        )
      case "video":
        return (
          <>
            {item.title && <CardTitle className="text-base mb-2">{item.title}</CardTitle>}
            <div className="aspect-video rounded-md overflow-hidden">
              <iframe
                src={item.content}
                title={item.title || "Video"}
                className="w-full h-full"
                allowFullScreen
              ></iframe>
            </div>
            {item.caption && <p className="text-xs text-muted-foreground mt-2">{item.caption}</p>}
          </>
        )
      case "file":
        return (
          <>
            {item.title && <CardTitle className="text-base mb-2">{item.title}</CardTitle>}
            <a
              href={item.content}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-3 border rounded-md hover:bg-muted"
            >
              <FileText className="h-5 w-5 mr-2 text-blue-500" />
              <span>{item.description || "Descargar archivo"}</span>
            </a>
          </>
        )
      default:
        return <div>{item.content}</div>
    }
  }

  return (
    <Draggable
      nodeRef={nodeRef}
      position={position}
      onStop={handleDragStop}
      disabled={readOnly || isEditing}
      bounds="parent"
      handle=".drag-handle"
    >
      <div
        ref={nodeRef}
        className={cn(
          "absolute",
          editingUser ? "ring-2 ring-red-400" : "hover:ring-2 hover:ring-blue-400",
          "transition-shadow",
        )}
        style={{
          zIndex,
          width: item.type === "text" ? "300px" : item.type === "image" || item.type === "video" ? "400px" : "350px",
        }}
        onClick={() => onFocus(item.id)}
      >
        <Card
          className={cn(
            "h-full",
            itemStyle.borderStyle,
            itemStyle.shadowStyle,
            itemStyle.fontStyle,
            "border-opacity-80",
          )}
          style={{
            borderColor: itemStyle.borderColor,
            backgroundColor: itemStyle.backgroundColor,
            color: itemStyle.textColor,
            borderRadius: `${itemStyle.borderRadius}px`,
            transform: `rotate(${itemStyle.rotation}deg)`,
          }}
        >
          {!readOnly && (
            <div className="absolute top-0 right-0 p-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 rounded-full bg-white/80 hover:bg-white"
                onClick={handleEdit}
              >
                <Edit className="h-3.5 w-3.5 text-blue-500" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 rounded-full bg-white/80 hover:bg-white"
                onClick={handleDelete}
              >
                <Trash className="h-3.5 w-3.5 text-red-500" />
              </Button>
            </div>
          )}

          {editingUser && (
            <div className="absolute -top-2 -right-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full border border-red-200 whitespace-nowrap">
              Editando por {editingUser.name}
            </div>
          )}

          <CardHeader className={cn("p-3 pb-0", !readOnly && "drag-handle cursor-move")}>{getItemIcon()}</CardHeader>

          <CardContent className={cn("p-3 pt-1", itemStyle.fontSize)}>{renderContent()}</CardContent>
        </Card>
      </div>
    </Draggable>
  )
}
