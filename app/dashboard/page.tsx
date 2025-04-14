"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MuralCard } from "@/components/mural-card"
import { PlusCircle, Sparkles, BookOpen, Search, Filter } from "lucide-react"
import { SessionInfo } from "@/components/session-info"
import { MuralFilters } from "@/components/mural-filters"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { getMuralsForUser } from "@/services/mural-service"
import type { Mural, MuralFilters as MuralFiltersType } from "@/types/mural"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [murals, setMurals] = useState<Mural[]>([])
  const [filters, setFilters] = useState<MuralFiltersType>({
    view: "all",
    sort: "recent",
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoadingMurals, setIsLoadingMurals] = useState(true)

  // Simplificar la lógica de redirección ya que ahora la maneja el layout
  useEffect(() => {
    if (user) {
      console.log("Usuario autenticado en dashboard:", user.name);

      // Eliminar cualquier estado de redirección pendiente
      localStorage.removeItem("auth_redirect");
      localStorage.removeItem("auth_user_id");
      localStorage.removeItem("login_success");
    }
  }, [user]);

  // Cargar murales cuando cambian los filtros o el usuario
  useEffect(() => {
    if (user) {
      setIsLoadingMurals(true)

      // Crear una función asíncrona para poder usar await
      const loadMurals = async () => {
        try {
          // Aplicar filtros y búsqueda
          const updatedFilters = { ...filters }
          if (searchQuery) {
            updatedFilters.search = searchQuery
          }

          // Añadir await para esperar a que se resuelva la Promise
          const userMurals = await getMuralsForUser(user.id, updatedFilters)
          setMurals(userMurals)
        } catch (error) {
          console.error("Error al cargar murales:", error)
          setMurals([])
        } finally {
          setIsLoadingMurals(false)
        }
      }

      // Ejecutar la función asíncrona
      loadMurals()
    }
  }, [user, filters, searchQuery])

  // Manejar cambios en los filtros
  const handleFilterChange = (newFilters: MuralFiltersType) => {
    setFilters(newFilters)
  }

  // Manejar búsqueda
  const handleSearch = () => {
    // La búsqueda se aplica en el useEffect
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-48" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Skeleton className="h-16 w-full mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-lg" />
              ))}
            </div>
          </div>
          <div className="space-y-6 order-first lg:order-last mb-8 lg:mb-0">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
            Mis Murales
          </h1>
          <p className="text-muted-foreground mt-2">
            Bienvenido, {user?.name}. Crea y colabora en murales interactivos
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/explorar">
            <Button variant="outline" className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Explorar
            </Button>
          </Link>
          <Link href="/murales/nuevo">
            <Button className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
              <PlusCircle className="h-5 w-5" />
              Nuevo Mural
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar murales..."
                className="pl-9 pr-12 py-5 border-2 focus-visible:ring-purple-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button variant="ghost" size="icon" className="absolute right-1 top-1.5" onClick={handleSearch}>
                <Search className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => document.getElementById("mural-filters")?.scrollIntoView({ behavior: "smooth" })}
            >
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </div>

          <MuralFilters onFilterChange={handleFilterChange} />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {isLoadingMurals ? (
              // Esqueletos de carga
              [...Array(6)].map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-lg" />)
            ) : murals.length > 0 ? (
              // Mostrar murales
              murals.map((mural) => (
                <MuralCard
                  key={mural.id}
                  mural={{
                    id: mural.id,
                    title: mural.title,
                    description: mural.description,
                    color: mural.color,
                    lastUpdated: getTimeAgo(mural.updatedAt),
                    collaborators: mural.permissions.length,
                    isOwner: mural.ownerId === user?.id,
                    role:
                      mural.ownerId === user?.id ? "owner" : mural.permissions.find((p) => p.userId === user?.id)?.role,
                    isPublic: mural.isPublic,
                    isFavorite: mural.isFavorite,
                  }}
                />
              ))
            ) : (
              // Mensaje cuando no hay murales
              <div className="col-span-full text-center py-12">
                <div className="mb-4">
                  <svg
                    className="mx-auto h-12 w-12 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium">No se encontraron murales</h3>
                <p className="mt-2 text-muted-foreground">
                  {filters.view === "owned"
                    ? "No has creado ningún mural todavía."
                    : filters.view === "shared"
                      ? "No tienes murales compartidos contigo."
                      : filters.view === "favorites"
                        ? "No has marcado ningún mural como favorito."
                        : "No se encontraron murales con los filtros actuales."}
                </p>
                <div className="mt-6">
                  <Link href="/murales/nuevo">
                    <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Crear nuevo mural
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6 order-first lg:order-last mb-8 lg:mb-0">
          <SessionInfo />

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100 p-6">
            <h3 className="text-lg font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-600">
              Consejos de seguridad
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-pink-500 font-bold">•</span>
                <span>Cierra sesión en dispositivos que no uses regularmente</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-500 font-bold">•</span>
                <span>Usa contraseñas seguras y únicas para cada servicio</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-500 font-bold">•</span>
                <span>Verifica regularmente tus sesiones activas</span>
              </li>
            </ul>
            <div className="mt-4">
              <Link href="/perfil?tab=seguridad">
                <Button variant="outline" size="sm" className="w-full">
                  Gestionar sesiones
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 py-12 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-600">
            ¿Necesitas ayuda para comenzar?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Consulta nuestra guía completa con tutoriales, consejos y mejores prácticas para crear murales colaborativos
            increíbles.
          </p>
          <Link href="/guia">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
              <BookOpen className="h-4 w-4 mr-2" />
              Ver guía de uso
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}

// Función para formatear fechas en formato "hace X tiempo"
function getTimeAgo(date: Date | string): string {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return "Hace unos segundos"
  if (diffMins < 60) return `Hace ${diffMins} ${diffMins === 1 ? "minuto" : "minutos"}`
  if (diffHours < 24) return `Hace ${diffHours} ${diffHours === 1 ? "hora" : "horas"}`
  if (diffDays < 7) return `Hace ${diffDays} ${diffDays === 1 ? "día" : "días"}`

  // Para fechas más antiguas, mostrar la fecha
  return past.toLocaleDateString()
}
