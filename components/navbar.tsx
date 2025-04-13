"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Home,
  Settings,
  User,
  Menu,
  X,
  Search,
  Bell,
  HelpCircle,
  LogOut,
  BookOpen,
  Laptop,
  Smartphone,
  Grid,
  LayoutDashboard,
  Users,
  CheckCircleIcon,
  CreditCardIcon,
} from "lucide-react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useMediaQuery } from "@/hooks/use-media-query"

export function Navbar() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout, isAuthenticated, currentSession } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const isDesktop = useMediaQuery("(min-width: 768px)")

  // Detectar scroll para cambiar el estilo de la navbar
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY
      if (offset > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  // Obtener el icono del dispositivo actual
  const getDeviceIcon = () => {
    if (!currentSession) return null

    switch (currentSession.deviceInfo.type) {
      case "Mobile":
        return <Smartphone className="h-4 w-4 mr-2 text-pink-500" />
      case "Tablet":
        return <Tablet className="h-4 w-4 mr-2 text-purple-500" />
      default:
        return <Laptop className="h-4 w-4 mr-2 text-blue-500" />
    }
  }

  // Determinar si estamos en la landing page
  const isLandingPage = pathname === "/"

  // Determinar si mostrar la navegación completa o simplificada
  const showFullNav = isAuthenticated && !isLandingPage

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md border-b shadow-sm dark:bg-gray-900/90"
          : isLandingPage
            ? "bg-transparent"
            : "bg-gradient-to-r from-purple-50 to-pink-50 border-b dark:from-gray-900 dark:to-gray-800"
      }`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link
              href={isAuthenticated ? "/dashboard" : "/"}
              className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600 mr-6"
            >
              MuralApp
            </Link>

            {/* Navegación para escritorio - Solo para usuarios autenticados */}
            {showFullNav && (
              <nav className="hidden md:flex items-center gap-1">
                <NavLink href="/dashboard" active={pathname === "/dashboard"}>
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </NavLink>
                <NavLink href="/murales" active={pathname.startsWith("/murales")}>
                  <Grid className="h-4 w-4 mr-2" />
                  Murales
                </NavLink>
                <NavLink href="/explorar" active={pathname === "/explorar"}>
                  <Search className="h-4 w-4 mr-2" />
                  Explorar
                </NavLink>
                <NavLink href="/guia" active={pathname === "/guia"}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Guía
                </NavLink>
              </nav>
            )}

            {/* Navegación para landing page - Solo para usuarios no autenticados */}
            {isLandingPage && !isAuthenticated && (
              <nav className="hidden md:flex items-center gap-1">
                <NavLink href="/guia" active={pathname === "/guia"}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Guía
                </NavLink>
                <NavLink href="#features" active={false}>
                  Características
                </NavLink>
                <NavLink href="#testimonials" active={false}>
                  Testimonios
                </NavLink>
                <NavLink href="#pricing" active={false}>
                  Precios
                </NavLink>
              </nav>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Barra de búsqueda para escritorio - Solo para usuarios autenticados */}
            {showFullNav && (
              <div className="hidden md:flex relative max-w-xs w-full mx-4">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar murales..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}

            {isAuthenticated ? (
              <>
                {/* Botón de notificaciones - Solo para usuarios autenticados */}
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500">
                    3
                  </Badge>
                </Button>

                {/* Menú de usuario para escritorio */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatar || "/placeholder.svg?height=32&width=32"} alt={user?.name} />
                        <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white">
                          {user?.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {currentSession && (
                      <>
                        <DropdownMenuItem className="flex items-center text-xs text-muted-foreground cursor-default">
                          {getDeviceIcon()}
                          <span>
                            {currentSession.deviceInfo.name} • {currentSession.location.city}
                          </span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/perfil">
                        <User className="mr-2 h-4 w-4" />
                        <span>Perfil</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/configuracion">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Configuración</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/guia">
                        <HelpCircle className="mr-2 h-4 w-4" />
                        <span>Ayuda</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => logout(false)}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login">
                  <Button variant="outline">Iniciar sesión</Button>
                </Link>
                <Link href="/registro">
                  <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}

            {/* Menú móvil */}
            {isDesktop ? (
              <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMenu}>
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            ) : (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[85vw] sm:w-[350px] p-0">
                  <SheetHeader className="p-4 border-b">
                    <SheetTitle className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">
                      MuralApp
                    </SheetTitle>
                  </SheetHeader>
                  <div className="p-4">
                    {isAuthenticated ? (
                      <div className="flex items-center gap-3 mb-6 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user?.avatar || "/placeholder.svg?height=40&width=40"} alt={user?.name} />
                          <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white">
                            {user?.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user?.name}</p>
                          <p className="text-xs text-muted-foreground">{user?.email}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-6 flex flex-col gap-2">
                        <Link href="/login" className="w-full">
                          <Button variant="outline" className="w-full">
                            Iniciar sesión
                          </Button>
                        </Link>
                        <Link href="/registro" className="w-full">
                          <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                            <User className="h-4 w-4 mr-2" />
                            Crear cuenta
                          </Button>
                        </Link>
                      </div>
                    )}

                    {isAuthenticated && (
                      <div className="relative mb-6">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar murales..."
                          className="pl-8"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    )}

                    <div className="space-y-1">
                      {isAuthenticated ? (
                        // Menú para usuarios autenticados
                        <>
                          <MobileNavLink href="/dashboard" active={pathname === "/dashboard"}>
                            <LayoutDashboard className="h-5 w-5 mr-3" />
                            Dashboard
                          </MobileNavLink>
                          <MobileNavLink href="/murales" active={pathname.startsWith("/murales")}>
                            <Grid className="h-5 w-5 mr-3" />
                            Murales
                          </MobileNavLink>
                          <MobileNavLink href="/explorar" active={pathname === "/explorar"}>
                            <Sparkles className="h-5 w-5 mr-3" />
                            Explorar
                          </MobileNavLink>
                          <MobileNavLink href="/guia" active={pathname === "/guia"}>
                            <BookOpen className="h-5 w-5 mr-3" />
                            Guía
                          </MobileNavLink>
                        </>
                      ) : (
                        // Menú para usuarios no autenticados
                        <>
                          <MobileNavLink href="/" active={pathname === "/"}>
                            <Home className="h-5 w-5 mr-3" />
                            Inicio
                          </MobileNavLink>
                          <MobileNavLink href="/guia" active={pathname === "/guia"}>
                            <BookOpen className="h-5 w-5 mr-3" />
                            Guía
                          </MobileNavLink>
                          <MobileNavLink href="#features" active={false}>
                            <CheckCircleIcon className="h-5 w-5 mr-3" />
                            Características
                          </MobileNavLink>
                          <MobileNavLink href="#testimonials" active={false}>
                            <Users className="h-5 w-5 mr-3" />
                            Testimonios
                          </MobileNavLink>
                          <MobileNavLink href="#pricing" active={false}>
                            <CreditCardIcon className="h-5 w-5 mr-3" />
                            Precios
                          </MobileNavLink>
                        </>
                      )}
                    </div>

                    {isAuthenticated && (
                      <>
                        <div className="h-px bg-border my-6" />

                        <div className="space-y-1">
                          <MobileNavLink href="/perfil" active={pathname === "/perfil"}>
                            <User className="h-5 w-5 mr-3" />
                            Perfil
                          </MobileNavLink>
                          <MobileNavLink href="/configuracion" active={pathname === "/configuracion"}>
                            <Settings className="h-5 w-5 mr-3" />
                            Configuración
                          </MobileNavLink>
                          <MobileNavLink href="/guia?tab=faq" active={pathname === "/guia?tab=faq"}>
                            <HelpCircle className="h-5 w-5 mr-3" />
                            Ayuda
                          </MobileNavLink>
                        </div>

                        <div className="h-px bg-border my-6" />

                        <Button
                          variant="outline"
                          className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => logout(false)}
                        >
                          <LogOut className="h-5 w-5 mr-3" />
                          Cerrar sesión
                        </Button>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </div>

      {/* Menú móvil desplegable (versión antigua) */}
      {isMenuOpen && !isDesktop && (
        <div className="md:hidden border-t">
          <div className="container mx-auto px-4 py-3 flex flex-col gap-3">
            {!isAuthenticated ? (
              <div className="flex flex-col gap-2 mb-2">
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    Iniciar sesión
                  </Button>
                </Link>
                <Link href="/registro">
                  <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                    Registrarse
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="relative mb-2">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar murales..." className="pl-8" />
              </div>
            )}

            {isAuthenticated ? (
              <>
                <NavLink href="/dashboard" active={pathname === "/dashboard"}>
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </NavLink>
                <NavLink href="/murales" active={pathname.startsWith("/murales")}>
                  <Grid className="h-4 w-4 mr-2" />
                  Murales
                </NavLink>
                <NavLink href="/explorar" active={pathname === "/explorar"}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Explorar
                </NavLink>
                <NavLink href="/guia" active={pathname === "/guia"}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Guía
                </NavLink>
                <NavLink href="/perfil" active={pathname === "/perfil"}>
                  <User className="h-4 w-4 mr-2" />
                  Perfil
                </NavLink>
                <NavLink href="/configuracion" active={pathname === "/configuracion"}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configuración
                </NavLink>
                <Button variant="outline" size="sm" className="mt-2 justify-start" onClick={() => logout(false)}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <>
                <NavLink href="/" active={pathname === "/"}>
                  <Home className="h-4 w-4 mr-2" />
                  Inicio
                </NavLink>
                <NavLink href="/guia" active={pathname === "/guia"}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Guía
                </NavLink>
                <NavLink href="#features" active={false}>
                  Características
                </NavLink>
                <NavLink href="#testimonials" active={false}>
                  Testimonios
                </NavLink>
                <NavLink href="#pricing" active={false}>
                  Precios
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

interface NavLinkProps {
  href: string
  active: boolean
  children: React.ReactNode
}

function NavLink({ href, active, children }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`flex items-center px-3 py-2 rounded-md transition-colors ${
        active
          ? "bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 font-medium dark:from-pink-900/20 dark:to-purple-900/20 dark:text-pink-400"
          : "hover:bg-muted"
      }`}
    >
      {children}
    </Link>
  )
}

function MobileNavLink({ href, active, children }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`flex items-center px-3 py-3 rounded-md transition-colors ${
        active
          ? "bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 font-medium dark:from-pink-900/20 dark:to-purple-900/20 dark:text-pink-400"
          : "hover:bg-muted"
      }`}
    >
      {children}
    </Link>
  )
}

function Sparkles(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  )
}

function Tablet(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <line x1="12" x2="12.01" y1="18" y2="18" />
    </svg>
  )
}

function CheckCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

function CreditCard(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  )
}
