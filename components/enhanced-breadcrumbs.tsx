"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

interface EnhancedBreadcrumbsProps {
  muralTitle?: string
}

export function EnhancedBreadcrumbs({ muralTitle }: EnhancedBreadcrumbsProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [previousPages, setPreviousPages] = useState<{ path: string; name: string }[]>([])

  // Actualizar el historial de navegación
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Obtener historial almacenado
      const storedHistory = localStorage.getItem("navigationHistory")
      const history = storedHistory ? JSON.parse(storedHistory) : []

      // Mapeo de rutas a nombres legibles
      const pathNames: Record<string, string> = {
        murales: "Murales",
        nuevo: "Nuevo Mural",
        configuracion: "Configuración",
        dashboard: "Dashboard",
        perfil: "Perfil",
        explorar: "Explorar",
        guia: "Guía",
      }

      // Determinar el nombre de la página actual
      const pathSegments = pathname.split("/").filter(Boolean)
      let currentPageName = ""

      if (pathSegments.length === 0) {
        currentPageName = "Inicio"
      } else if (pathSegments.length === 1) {
        currentPageName = pathNames[pathSegments[0]] || pathSegments[0]
      } else if (pathSegments[0] === "murales" && pathSegments.length === 2 && pathSegments[1] !== "nuevo") {
        // Para páginas de mural específico
        currentPageName = muralTitle || "Mural"
      } else {
        const lastSegment = pathSegments[pathSegments.length - 1]
        currentPageName = pathNames[lastSegment] || lastSegment
      }

      // Añadir página actual al historial si es diferente de la última
      if (history.length === 0 || history[history.length - 1].path !== pathname) {
        history.push({ path: pathname, name: currentPageName })

        // Limitar el historial a las últimas 10 páginas
        const limitedHistory = history.slice(-10)
        localStorage.setItem("navigationHistory", JSON.stringify(limitedHistory))

        // Actualizar el estado con las páginas anteriores (excluyendo la actual)
        setPreviousPages(limitedHistory.slice(0, -1))
      }
    }
  }, [pathname, muralTitle])

  // Si estamos en la página de inicio, no mostrar breadcrumbs
  if (pathname === "/") return null

  // Construir los segmentos de ruta para los breadcrumbs
  const pathSegments = pathname.split("/").filter(Boolean)

  // Mapeo de rutas a nombres legibles
  const pathNames: Record<string, string> = {
    murales: "Murales",
    nuevo: "Nuevo Mural",
    configuracion: "Configuración",
    dashboard: "Dashboard",
    perfil: "Perfil",
    explorar: "Explorar",
    guia: "Guía",
  }

  // Para IDs de murales específicos
  const isMuralId = (segment: string, index: number) => {
    return index === 1 && pathSegments[0] === "murales" && segment !== "nuevo"
  }

  return (
    <div className="container mx-auto px-4 py-2 flex items-center text-sm text-muted-foreground">
      <div className="flex items-center mr-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 mr-1"
                onClick={() => router.back()}
                aria-label="Volver atrás"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Volver atrás</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Link href="/" className="flex items-center hover:text-foreground" aria-label="Ir a inicio">
          <Home className="h-3.5 w-3.5 mr-1" />
          <span className="sr-only sm:not-sr-only">Inicio</span>
        </Link>
      </div>

      {pathSegments.map((segment, index) => {
        // Construir la ruta acumulativa
        const href = `/${pathSegments.slice(0, index + 1).join("/")}`

        // Determinar el nombre a mostrar
        let name = pathNames[segment] || segment
        if (isMuralId(segment, index)) {
          name = muralTitle || "Mural"
        }

        // Capitalizar primera letra si es necesario
        if (!pathNames[segment] && !isMuralId(segment, index)) {
          name = segment.charAt(0).toUpperCase() + segment.slice(1)
        }

        return (
          <div key={index} className="flex items-center">
            <ChevronRight className="h-3 w-3 mx-2 flex-shrink-0" aria-hidden="true" />
            <Link
              href={href}
              className="hover:text-foreground truncate max-w-[150px]"
              aria-current={index === pathSegments.length - 1 ? "page" : undefined}
            >
              {name}
            </Link>
          </div>
        )
      })}

      {/* Historial de navegación reciente */}
      {previousPages.length > 0 && (
        <div className="ml-auto hidden md:block">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs">
                  Historial
                </Button>
              </TooltipTrigger>
              <TooltipContent align="end" className="w-60">
                <p className="text-xs font-medium mb-1">Páginas recientes:</p>
                <div className="space-y-1">
                  {previousPages
                    .slice(-5)
                    .reverse()
                    .map((page, index) => (
                      <div key={index} className="text-xs">
                        <Link href={page.path} className="hover:underline">
                          {page.name}
                        </Link>
                      </div>
                    ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  )
}
