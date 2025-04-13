"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Rutas que requieren autenticación
    const protectedRoutes = ["/perfil", "/configuracion", "/murales/nuevo"]

    // Comprobar si la ruta actual requiere autenticación
    const requiresAuth = protectedRoutes.some((route) => pathname.startsWith(route))

    if (!isLoading && !isAuthenticated && requiresAuth) {
      router.push(`/login?from=${pathname}`)
    }
  }, [isAuthenticated, isLoading, pathname, router])

  // Mostrar un indicador de carga
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return <>{children}</>
}
