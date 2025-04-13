"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useAuth } from "@/contexts/auth-context"
import {
  Home,
  Grid3X3,
  Search,
  Mail,
  Users,
  Settings,
  HelpCircle,
  BookOpen,
  LogOut,
  ImageIcon,
  MessageSquare,
  Bell,
  ShieldCheck,
} from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"

interface SidebarProps {
  open: boolean
  setOpen: (open: boolean) => void
}

export function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const isMobile = useMobile()

  // Definir las rutas del menú
  const routes = [
    {
      title: "Principal",
      routes: [
        {
          label: "Inicio",
          icon: Home,
          href: "/dashboard",
          active: pathname === "/dashboard",
        },
        {
          label: "Mis Murales",
          icon: Grid3X3,
          href: "/murales",
          active: pathname === "/murales" || pathname.startsWith("/murales/"),
        },
        {
          label: "Explorar",
          icon: Search,
          href: "/explorar",
          active: pathname === "/explorar",
        },
        {
          label: "Correos",
          icon: Mail,
          href: "/correos",
          active: pathname === "/correos" || pathname.startsWith("/correos/"),
        },
      ],
    },
    {
      title: "Gestión",
      routes: [
        {
          label: "Colaboradores",
          icon: Users,
          href: "/colaboradores",
          active: pathname === "/colaboradores",
        },
        {
          label: "Imágenes",
          icon: ImageIcon,
          href: "/imagenes",
          active: pathname === "/imagenes",
        },
        {
          label: "Comentarios",
          icon: MessageSquare,
          href: "/comentarios",
          active: pathname === "/comentarios",
        },
        {
          label: "Notificaciones",
          icon: Bell,
          href: "/notificaciones",
          active: pathname === "/notificaciones",
        },
        {
          label: "Herramientas",
          icon: ShieldCheck,
          href: "/herramientas",
          active: pathname === "/herramientas",
        },
      ],
    },
    {
      title: "Ayuda y Configuración",
      routes: [
        {
          label: "Configuración",
          icon: Settings,
          href: "/configuracion",
          active: pathname === "/configuracion",
        },
        {
          label: "Ayuda",
          icon: HelpCircle,
          href: "/ayuda",
          active: pathname === "/ayuda",
        },
        {
          label: "Guía",
          icon: BookOpen,
          href: "/guia",
          active: pathname === "/guia",
        },
      ],
    },
  ]

  // Renderizar el sidebar como Sheet en móvil o como div fijo en escritorio
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <SidebarContent routes={routes} pathname={pathname} signOut={signOut} />
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div className={cn("h-screen border-r bg-card transition-all duration-300 overflow-hidden", open ? "w-72" : "w-0")}>
      {open && <SidebarContent routes={routes} pathname={pathname} signOut={signOut} />}
    </div>
  )
}

interface SidebarContentProps {
  routes: {
    title: string
    routes: {
      label: string
      icon: React.ElementType
      href: string
      active: boolean
    }[]
  }[]
  pathname: string
  signOut: () => void
}

function SidebarContent({ routes, pathname, signOut }: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <h2 className="text-2xl font-bold">Murales</h2>
        <p className="text-muted-foreground">Plataforma colaborativa</p>
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="space-y-6 pb-6">
          {routes.map((section, i) => (
            <div key={i} className="space-y-2">
              <h3 className="px-4 text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.routes.map((route, j) => (
                  <Link key={j} href={route.href} passHref>
                    <Button
                      variant={route.active ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3 font-normal",
                        route.active && "bg-secondary text-secondary-foreground",
                      )}
                    >
                      <route.icon className="h-4 w-4" />
                      {route.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-red-500 hover:text-red-600"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  )
}
