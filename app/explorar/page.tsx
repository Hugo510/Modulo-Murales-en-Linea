import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MuralCard } from "@/components/mural-card"
import { Search, Filter, TrendingUp, Clock, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function ExplorarPage() {
  // Datos de ejemplo para los murales públicos
  const muralesPublicos = [
    {
      id: "101",
      title: "Energías Renovables",
      description: "Guía completa sobre fuentes de energía sostenible",
      color: "bg-gradient-to-br from-green-400 to-teal-500",
      lastUpdated: "Hace 1 día",
      collaborators: 8,
    },
    {
      id: "102",
      title: "Historia del Arte",
      description: "Recorrido por los principales movimientos artísticos",
      color: "bg-gradient-to-br from-purple-400 to-indigo-500",
      lastUpdated: "Hace 3 días",
      collaborators: 5,
    },
    {
      id: "103",
      title: "Matemáticas Divertidas",
      description: "Conceptos matemáticos explicados de forma visual",
      color: "bg-gradient-to-br from-blue-400 to-cyan-500",
      lastUpdated: "Hace 5 días",
      collaborators: 3,
    },
    {
      id: "104",
      title: "Recetas Saludables",
      description: "Colección de recetas nutritivas y fáciles de preparar",
      color: "bg-gradient-to-br from-orange-400 to-amber-500",
      lastUpdated: "Hace 1 semana",
      collaborators: 12,
    },
    {
      id: "105",
      title: "Programación para Principiantes",
      description: "Introducción a los conceptos básicos de programación",
      color: "bg-gradient-to-br from-pink-400 to-rose-500",
      lastUpdated: "Hace 2 semanas",
      collaborators: 7,
    },
    {
      id: "106",
      title: "Viaje por el Mundo",
      description: "Destinos turísticos imprescindibles",
      color: "bg-gradient-to-br from-red-400 to-pink-500",
      lastUpdated: "Hace 3 semanas",
      collaborators: 4,
    },
  ]

  // Categorías populares
  const categorias = [
    "Educación",
    "Ciencia",
    "Arte",
    "Tecnología",
    "Salud",
    "Cocina",
    "Viajes",
    "Deportes",
    "Música",
    "Literatura",
  ]

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-500 via-teal-500 to-blue-500">
            Explorar Murales
          </h1>
          <p className="text-muted-foreground mt-2">Descubre murales públicos creados por la comunidad</p>
        </div>
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar murales..." className="pl-9 pr-12 py-6 border-2 focus-visible:ring-teal-500" />
          <Button variant="ghost" size="icon" className="absolute right-1 top-1.5">
            <Filter className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
      </div>

      <div className="mb-8 overflow-x-auto pb-2">
        <div className="flex gap-2">
          {categorias.map((categoria, index) => (
            <Badge
              key={index}
              variant="outline"
              className="px-3 py-1 text-sm bg-gradient-to-r from-teal-50 to-blue-50 hover:from-teal-100 hover:to-blue-100 cursor-pointer border-teal-200"
            >
              {categoria}
            </Badge>
          ))}
        </div>
      </div>

      <Tabs defaultValue="trending" className="mb-8">
        <TabsList>
          <TabsTrigger
            value="trending"
            className="flex items-center gap-1 data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700"
          >
            <TrendingUp className="h-4 w-4" />
            Tendencias
          </TabsTrigger>
          <TabsTrigger
            value="recent"
            className="flex items-center gap-1 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            <Clock className="h-4 w-4" />
            Recientes
          </TabsTrigger>
          <TabsTrigger
            value="featured"
            className="flex items-center gap-1 data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700"
          >
            <Star className="h-4 w-4" />
            Destacados
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {muralesPublicos.map((mural) => (
          <MuralCard key={mural.id} mural={mural} />
        ))}
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-500">
          ¿Listo para crear tu propio mural?
        </h2>
        <Button className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 px-8 py-6 text-lg">
          Comenzar ahora
        </Button>
      </div>
    </main>
  )
}
