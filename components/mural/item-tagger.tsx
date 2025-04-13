"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Tag, Plus, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface ItemTaggerProps {
  itemId: string
  initialTags: string[]
  onTagsChange: (itemId: string, tags: string[]) => void
  suggestedTags?: string[]
}

export function ItemTagger({ itemId, initialTags, onTagsChange, suggestedTags = [] }: ItemTaggerProps) {
  const [tags, setTags] = useState<string[]>(initialTags)
  const [newTag, setNewTag] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  // Actualizar tags cuando cambian las props
  useEffect(() => {
    setTags(initialTags)
  }, [initialTags])

  // Añadir una nueva etiqueta
  const addTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (!trimmedTag || tags.includes(trimmedTag)) return

    const updatedTags = [...tags, trimmedTag]
    setTags(updatedTags)
    onTagsChange(itemId, updatedTags)
    setNewTag("")
  }

  // Eliminar una etiqueta
  const removeTag = (tagToRemove: string) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove)
    setTags(updatedTags)
    onTagsChange(itemId, updatedTags)
  }

  // Manejar el envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addTag(newTag)
  }

  // Filtrar sugerencias para mostrar solo las que no están ya añadidas
  const filteredSuggestions = suggestedTags.filter((tag) => !tags.includes(tag))

  return (
    <div>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-8 gap-1",
              tags.length > 0 && "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800",
            )}
          >
            <Tag className="h-3.5 w-3.5" />
            <span>{tags.length > 0 ? `${tags.length} etiquetas` : "Etiquetar"}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-3" align="start">
          <div className="space-y-3">
            <div className="font-medium text-sm">Etiquetas</div>

            {/* Etiquetas actuales */}
            <div className="flex flex-wrap gap-1.5">
              {tags.length === 0 ? (
                <div className="text-sm text-muted-foreground">No hay etiquetas</div>
              ) : (
                tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                    {tag}
                    <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full" onClick={() => removeTag(tag)}>
                      <X className="h-3 w-3" />
                      <span className="sr-only">Eliminar etiqueta {tag}</span>
                    </Button>
                  </Badge>
                ))
              )}
            </div>

            {/* Formulario para añadir etiquetas */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                type="text"
                placeholder="Nueva etiqueta..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="h-8 text-sm"
              />
              <Button type="submit" size="sm" className="h-8" disabled={!newTag.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </form>

            {/* Sugerencias de etiquetas */}
            {filteredSuggestions.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">Sugerencias</div>
                <ScrollArea className="h-24">
                  <div className="flex flex-wrap gap-1.5">
                    {filteredSuggestions.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="cursor-pointer hover:bg-blue-50"
                        onClick={() => addTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
