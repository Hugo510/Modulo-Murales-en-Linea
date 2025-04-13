"use client"

import { useState, useEffect } from "react"
import { FolderKanban, Plus, X, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface Group {
  id: string
  name: string
  color: string
  itemIds: string[]
}

interface ItemGrouperProps {
  itemId: string
  allGroups: Group[]
  onCreateGroup: (name: string, color: string, itemIds: string[]) => void
  onUpdateGroup: (groupId: string, itemIds: string[]) => void
}

export function ItemGrouper({ itemId, allGroups, onCreateGroup, onUpdateGroup }: ItemGrouperProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")
  const [newGroupColor, setNewGroupColor] = useState("#3b82f6") // Azul por defecto
  const [isCreatingGroup, setIsCreatingGroup] = useState(false)
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])

  // Inicializar los grupos seleccionados
  useEffect(() => {
    const groups = allGroups.filter((group) => group.itemIds.includes(itemId)).map((group) => group.id)
    setSelectedGroups(groups)
  }, [allGroups, itemId])

  // Manejar la creación de un nuevo grupo
  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return
    onCreateGroup(newGroupName, newGroupColor, [itemId])
    setNewGroupName("")
    setIsCreatingGroup(false)
  }

  // Manejar el cambio de selección de un grupo
  const handleGroupChange = (groupId: string, checked: boolean) => {
    const group = allGroups.find((g) => g.id === groupId)
    if (!group) return

    if (checked) {
      // Añadir el elemento al grupo
      const updatedItemIds = [...group.itemIds, itemId]
      onUpdateGroup(groupId, updatedItemIds)
    } else {
      // Quitar el elemento del grupo
      const updatedItemIds = group.itemIds.filter((id) => id !== itemId)
      onUpdateGroup(groupId, updatedItemIds)
    }
  }

  // Colores disponibles para los grupos
  const availableColors = [
    { name: "Azul", value: "#3b82f6" },
    { name: "Verde", value: "#10b981" },
    { name: "Morado", value: "#8b5cf6" },
    { name: "Rosa", value: "#ec4899" },
    { name: "Naranja", value: "#f59e0b" },
    { name: "Rojo", value: "#ef4444" },
  ]

  return (
    <div>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-8 gap-1",
              selectedGroups.length > 0 &&
                "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:text-purple-800",
            )}
          >
            <FolderKanban className="h-3.5 w-3.5" />
            <span>{selectedGroups.length > 0 ? `En ${selectedGroups.length} grupos` : "Añadir a grupo"}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-3" align="start">
          <div className="space-y-3">
            <div className="font-medium text-sm">Grupos</div>

            {/* Lista de grupos existentes */}
            {allGroups.length === 0 ? (
              <div className="text-sm text-muted-foreground">No hay grupos creados</div>
            ) : (
              <ScrollArea className="h-48 pr-3">
                <div className="space-y-2">
                  {allGroups.map((group) => {
                    const isInGroup = group.itemIds.includes(itemId)
                    return (
                      <div key={group.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`group-${group.id}`}
                          checked={isInGroup}
                          onCheckedChange={(checked) => handleGroupChange(group.id, checked as boolean)}
                        />
                        <Label htmlFor={`group-${group.id}`} className="flex items-center gap-2 text-sm cursor-pointer">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: group.color }}></div>
                          <span className="flex-1">{group.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {group.itemIds.length} {group.itemIds.length === 1 ? "elemento" : "elementos"}
                          </span>
                        </Label>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            )}

            {/* Formulario para crear un nuevo grupo */}
            {isCreatingGroup ? (
              <div className="space-y-2 border rounded-md p-2 bg-slate-50">
                <div className="text-xs font-medium">Nuevo grupo</div>
                <Input
                  type="text"
                  placeholder="Nombre del grupo..."
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="h-8 text-sm"
                />
                <div className="flex flex-wrap gap-1 mt-2">
                  {availableColors.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      className={cn(
                        "w-6 h-6 rounded-full border-2",
                        newGroupColor === color.value ? "border-gray-900" : "border-transparent",
                      )}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setNewGroupColor(color.value)}
                      title={color.name}
                    />
                  ))}
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <Button variant="ghost" size="sm" onClick={() => setIsCreatingGroup(false)} className="h-8">
                    <X className="h-4 w-4 mr-1" />
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleCreateGroup} disabled={!newGroupName.trim()} className="h-8">
                    <Check className="h-4 w-4 mr-1" />
                    Crear
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setIsCreatingGroup(true)} className="h-8 w-full">
                <Plus className="h-4 w-4 mr-1" />
                Crear nuevo grupo
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
