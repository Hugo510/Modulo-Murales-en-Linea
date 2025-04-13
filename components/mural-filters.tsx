"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Grid, Star, User, Users } from "lucide-react"
import type { MuralFilters as MuralFiltersType } from "@/types/mural"

interface MuralFiltersProps {
  onFilterChange?: (filters: MuralFiltersType) => void
}

export function MuralFilters({ onFilterChange }: MuralFiltersProps) {
  const [filters, setFilters] = useState<MuralFiltersType>({
    view: "all",
    sort: "recent",
  })

  // Notificar cambios en los filtros
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filters)
    }
  }, [filters, onFilterChange])

  const handleViewChange = (view: string) => {
    setFilters({ ...filters, view: view as MuralFiltersType["view"] })
  }

  const handleSortChange = (sort: string) => {
    setFilters({ ...filters, sort: sort as MuralFiltersType["sort"] })
  }

  const handleCategoryChange = (category: string) => {
    setFilters({ ...filters, category: category || undefined })
  }

  return (
    <div className="space-y-4" id="mural-filters">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Ordenar por</label>
          <Select value={filters.sort} onValueChange={handleSortChange}>
            <SelectTrigger className="border-2 focus:ring-purple-500">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Más recientes</SelectItem>
              <SelectItem value="name">Alfabéticamente</SelectItem>
              <SelectItem value="oldest">Más antiguos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Categoría</label>
          <Select value={filters.category || "all"} onValueChange={handleCategoryChange}>
            <SelectTrigger className="border-2 focus:ring-purple-500">
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              <SelectItem value="educación">Educación</SelectItem>
              <SelectItem value="negocios">Negocios</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="arte">Arte</SelectItem>
              <SelectItem value="eventos">Eventos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue={filters.view} onValueChange={handleViewChange} className="w-full">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="all" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
            <Grid className="h-4 w-4 mr-2 sm:mr-1" />
            <span className="hidden sm:inline">Todos</span>
          </TabsTrigger>
          <TabsTrigger value="owned" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
            <User className="h-4 w-4 mr-2 sm:mr-1" />
            <span className="hidden sm:inline">Mis murales</span>
          </TabsTrigger>
          <TabsTrigger value="shared" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
            <Users className="h-4 w-4 mr-2 sm:mr-1" />
            <span className="hidden sm:inline">Compartidos</span>
          </TabsTrigger>
          <TabsTrigger value="favorites" className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700">
            <Star className="h-4 w-4 mr-2 sm:mr-1" />
            <span className="hidden sm:inline">Favoritos</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}
