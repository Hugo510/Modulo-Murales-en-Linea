"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronRight, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { MuralItem } from "@/types/mural"

interface Group {
  id: string
  name: string
  color: string
  itemIds: string[]
}

interface GroupViewProps {
  groups: Group[]
  items: MuralItem[]
  onItemSelect: (itemId: string) => void
  onGroupVisibilityChange: (groupId: string, isVisible: boolean) => void
}

export function GroupView({ groups, items, onItemSelect, onGroupVisibilityChange }: GroupViewProps) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
  const [visibleGroups, setVisibleGroups] = useState<Record<string, boolean>>({})

  // Inicializar los estados
  useEffect(() => {
    const initialOpenState: Record<string, boolean> = {}
    const initialVisibilityState: Record<string, boolean> = {}

    groups.forEach((group) => {
      initialOpenState[group.id] = true
      initialVisibilityState[group.id] = true
    })

    setOpenGroups(initialOpenState)
    setVisibleGroups(initialVisibilityState)
  }, [groups])

  // Manejar el cambio de visibilidad de un grupo
  const toggleGroupVisibility = (groupId: string) => {
    const newState = !visibleGroups[groupId]
    setVisibleGroups((prev) => ({
      ...prev,
      [groupId]: newState,
    }))
    onGroupVisibilityChange(groupId, newState)
  }

  // Obtener los elementos de un grupo
  const getGroupItems = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId)
    if (!group) return []

    return items.filter((item) => group.itemIds.includes(item.id))
  }

  // Obtener el tipo de icono según el tipo de elemento
  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case "text":
        return "📝"
      case "image":
        return "🖼️"
      case "link":
        return "🔗"
      case "video":
        return "🎬"
      case "file":
        return "📄"
      default:
        return "📄"
    }
  }

  if (groups.length === 0) {
    return <div className="p-4 text-center text-muted-foreground">No hay grupos creados</div>
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-3 space-y-3">
        {groups.map((group) => (
          <Collapsible
            key={group.id}
            open={openGroups[group.id]}
            onOpenChange={(open) => setOpenGroups((prev) => ({ ...prev, [group.id]: open }))}
            className="border rounded-md overflow-hidden"
          >
            <div className="flex items-center p-2 gap-2" style={{ backgroundColor: `${group.color}20` }}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
                  {openGroups[group.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>

              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: group.color }}></div>

              <div className="font-medium text-sm flex-1">{group.name}</div>

              <div className="text-xs text-muted-foreground">
                {group.itemIds.length} {group.itemIds.length === 1 ? "elemento" : "elementos"}
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => toggleGroupVisibility(group.id)}
                title={visibleGroups[group.id] ? "Ocultar grupo" : "Mostrar grupo"}
              >
                {visibleGroups[group.id] ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
            </div>

            <CollapsibleContent>
              <div className="p-2 space-y-1">
                {getGroupItems(group.id).length === 0 ? (
                  <div className="text-xs text-muted-foreground p-2">No hay elementos en este grupo</div>
                ) : (
                  getGroupItems(group.id).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center p-2 text-sm rounded-md hover:bg-slate-50 cursor-pointer"
                      onClick={() => onItemSelect(item.id)}
                    >
                      <span className="mr-2">{getItemTypeIcon(item.type)}</span>
                      <span className="font-medium truncate">{item.title || `Elemento ${item.type}`}</span>
                    </div>
                  ))
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </ScrollArea>
  )
}
