"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"

export function Breadcrumbs() {
  const pathname = usePathname()

  if (pathname === "/") return null

  const pathSegments = pathname.split("/").filter(Boolean)

  // Mapeo de rutas a nombres legibles
  const pathNames: Record<string, string> = {
    murales: "Murales",
    nuevo: "Nuevo Mural",
    configuracion: "Configuración",
  }

  // Para IDs de murales específicos
  const isMuralId = (segment: string, index: number) => {
    return index === 1 && pathSegments[0] === "murales" && segment !== "nuevo"
  }

  return (
    <div className="container mx-auto px-4 py-2 flex items-center text-sm text-muted-foreground">
      <Link href="/" className="flex items-center hover:text-foreground">
        <Home className="h-3 w-3 mr-1" />
        Inicio
      </Link>

      {pathSegments.map((segment, index) => {
        // Construir la ruta acumulativa
        const href = `/${pathSegments.slice(0, index + 1).join("/")}`

        // Determinar el nombre a mostrar
        let name = pathNames[segment] || segment
        if (isMuralId(segment, index)) {
          name = "Mural"
        }

        return (
          <div key={index} className="flex items-center">
            <ChevronRight className="h-3 w-3 mx-2" />
            <Link href={href} className="hover:text-foreground">
              {name}
            </Link>
          </div>
        )
      })}
    </div>
  )
}
