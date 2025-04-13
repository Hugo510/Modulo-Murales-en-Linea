"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "./sidebar"
import { Navbar } from "./navbar"
import { Breadcrumbs } from "../ui/breadcrumbs"
import { useMobile } from "@/hooks/use-mobile"

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const isMobile = useMobile()
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)

  // Cerrar sidebar automáticamente en móvil cuando cambia la ruta
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }, [pathname, isMobile])

  // Ajustar sidebar cuando cambia el tamaño de la ventana
  useEffect(() => {
    setSidebarOpen(!isMobile)
  }, [isMobile])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Contenido principal */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="flex-1 overflow-auto">
          <div className="container py-4">
            <Breadcrumbs />
            <main className="py-4">{children}</main>
          </div>
        </div>
      </div>
    </div>
  )
}
