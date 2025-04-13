"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { Menu, Bell, HelpCircle, User, Settings, LogOut } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import { getInitials } from "@/lib/utils"

interface NavbarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export function Navbar({ sidebarOpen, setSidebarOpen }: NavbarProps) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const isMobile = useMobile()
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  // Función para obtener el título de la página actual
  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Dashboard"
    if (pathname === "/murales") return "Mis Murales"
    if (pathname.startsWith("/murales/")) {
      const muralId = pathname.split("/")[2]
      return muralId === "nuevo" ? "Nuevo Mural" : "Detalle del Mural"
    }
    if (pathname === "/explorar") return "Explorar Murales"
    if (pathname === "/correos") return "Correos Masivos"
    if (pathname.startsWith("/correos/")) return "Gestión de Correos"
    if (pathname === "/colaboradores") return "Colaboradores"
    if (pathname === "/imagenes") return "Biblioteca de Imágenes"
    if (pathname === "/comentarios") return "Comentarios"
    if (pathname === "/notificaciones") return "Notificaciones"
    if (pathname === "/configuracion") return "Configuración"
    if (pathname === "/ayuda") return "Ayuda"
    if (pathname === "/guia") return "Guía de Uso"

    return "Murales Colaborativos"
  }

  return (
    <header className="h-16 border-b bg-card/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="flex h-full items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? "Cerrar menú" : "Abrir menú"}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <h1 className="text-lg font-semibold hidden sm:block">{getPageTitle()}</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Ayuda">
            <HelpCircle className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Notificaciones"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
          >
            <Bell className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full" aria-label="Perfil">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar_url || ""} alt={user?.name || "Usuario"} />
                  <AvatarFallback>{getInitials(user?.name || "Usuario")}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/perfil">
                  <User className="mr-2 h-4 w-4" />
                  Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/configuracion">
                  <Settings className="mr-2 h-4 w-4" />
                  Configuración
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-red-500 focus:text-red-500">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
