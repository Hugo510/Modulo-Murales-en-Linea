"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

export function Breadcrumbs() {
  const pathname = usePathname()

  // No mostrar breadcrumbs en la página principal
  if (pathname === "/" || pathname === "/dashboard") {
    return null
  }

  // Convertir la ruta en segmentos
  const segments = pathname.split("/").filter(Boolean)

  // Función para obtener el nombre legible de cada segmento
  const getReadableName = (segment: string, index: number) => {
    // Casos especiales
    if (segment === "murales" && index === 0) return "Mis Murales"
    if (segment === "correos" && index === 0) return "Correos"
    if (segment === "explorar") return "Explorar"
    if (segment === "configuracion") return "Configuración"
    if (segment === "colaboradores") return "Colaboradores"
    if (segment === "imagenes") return "Imágenes"
    if (segment === "comentarios") return "Comentarios"
    if (segment === "notificaciones") return "Notificaciones"
    if (segment === "ayuda") return "Ayuda"
    if (segment === "guia") return "Guía"
    if (segment === "perfil") return "Perfil"
    if (segment === "nuevo") return "Nuevo"
    if (segment === "editar") return "Editar"

    // Para IDs, mostrar un formato más amigable
    if (segment.length > 8 && index > 0) {
      const prevSegment = segments[index - 1]
      if (prevSegment === "murales") return "Mural"
      if (prevSegment === "correos") return "Campaña"
      if (prevSegment === "colaboradores") return "Colaborador"
    }

    // Capitalizar primera letra por defecto
    return segment.charAt(0).toUpperCase() + segment.slice(1)
  }

  // Construir los elementos de breadcrumb
  const breadcrumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`
    const isLast = index === segments.length - 1
    const label = getReadableName(segment, index)

    return {
      href,
      label,
      isLast,
    }
  })

  return (
    <nav aria-label="Breadcrumbs" className="flex items-center text-sm text-muted-foreground py-2">
      <ol className="flex items-center flex-wrap">
        <li className="flex items-center">
          <Link
            href="/dashboard"
            className="flex items-center hover:text-foreground transition-colors"
            aria-label="Inicio"
          >
            <Home className="h-4 w-4" />
          </Link>
        </li>

        {breadcrumbs.map((breadcrumb, index) => (
          <li key={index} className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-2" />
            {breadcrumb.isLast ? (
              <span className="font-medium text-foreground" aria-current="page">
                {breadcrumb.label}
              </span>
            ) : (
              <Link href={breadcrumb.href} className="hover:text-foreground transition-colors">
                {breadcrumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
