"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Home,
  Grid,
  Search,
  BookOpen,
  User,
  Settings,
  HelpCircle,
  PlusCircle,
  MenuIcon,
  X,
  ChevronRight,
  Star,
  Clock,
  LogOut,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { motion, AnimatePresence } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function PersistentMenu() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  // Detectar tamaño de pantalla
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setIsCollapsed(true)
      }
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  // Guardar preferencia de colapso en localStorage
  useEffect(() => {
    if (!isMobile) {
      const savedCollapsedState = localStorage.getItem("menuCollapsed")
      if (savedCollapsedState !== null) {
        setIsCollapsed(savedCollapsedState === "true")
      }
    }
  }, [isMobile])

  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem("menuCollapsed", String(newState))
  }

  // Si es móvil, mostrar solo el botón de menú
  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          aria-label={showMobileMenu ? "Cerrar menú" : "Abrir menú"}
        >
          {showMobileMenu ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </Button>

        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-20 right-4 z-50 bg-white rounded-lg shadow-lg p-4 border w-64"
            >
              <div className="space-y-1">
                <MobileMenuItem
                  href="/dashboard"
                  active={pathname === "/dashboard"}
                  icon={<Home className="h-5 w-5" />}
                >
                  Dashboard
                </MobileMenuItem>
                <MobileMenuItem
                  href="/murales"
                  active={pathname.startsWith("/murales")}
                  icon={<Grid className="h-5 w-5" />}
                >
                  Murales
                </MobileMenuItem>
                <MobileMenuItem
                  href="/explorar"
                  active={pathname === "/explorar"}
                  icon={<Search className="h-5 w-5" />}
                >
                  Explorar
                </MobileMenuItem>
                <MobileMenuItem href="/guia" active={pathname === "/guia"} icon={<BookOpen className="h-5 w-5" />}>
                  Guía
                </MobileMenuItem>

                <div className="h-px bg-gray-200 my-2"></div>

                <MobileMenuItem href="/perfil" active={pathname === "/perfil"} icon={<User className="h-5 w-5" />}>
                  Perfil
                </MobileMenuItem>
                <MobileMenuItem
                  href="/configuracion"
                  active={pathname === "/configuracion"}
                  icon={<Settings className="h-5 w-5" />}
                >
                  Configuración
                </MobileMenuItem>
                <MobileMenuItem href="/ayuda" active={pathname === "/ayuda"} icon={<HelpCircle className="h-5 w-5" />}>
                  Ayuda
                </MobileMenuItem>

                <div className="h-px bg-gray-200 my-2"></div>

                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => logout(false)}
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Cerrar sesión
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    )
  }

  return (
    <div
      className={`fixed left-0 top-16 bottom-0 bg-white border-r z-40 transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="p-3 flex justify-end">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={toggleCollapse}
                  aria-label={isCollapsed ? "Expandir menú" : "Colapsar menú"}
                >
                  <ChevronRight
                    className={`h-4 w-4 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{isCollapsed ? "Expandir menú" : "Colapsar menú"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex-1 overflow-y-auto py-2 px-3">
          <div className="space-y-1">
            <MenuItem
              href="/dashboard"
              active={pathname === "/dashboard"}
              icon={<Home className="h-5 w-5" />}
              collapsed={isCollapsed}
            >
              Dashboard
            </MenuItem>
            <MenuItem
              href="/murales"
              active={pathname.startsWith("/murales")}
              icon={<Grid className="h-5 w-5" />}
              collapsed={isCollapsed}
            >
              Murales
            </MenuItem>
            <MenuItem
              href="/explorar"
              active={pathname === "/explorar"}
              icon={<Search className="h-5 w-5" />}
              collapsed={isCollapsed}
            >
              Explorar
            </MenuItem>
            <MenuItem
              href="/guia"
              active={pathname === "/guia"}
              icon={<BookOpen className="h-5 w-5" />}
              collapsed={isCollapsed}
            >
              Guía
            </MenuItem>

            {!isCollapsed && (
              <div className="pt-4">
                <Link href="/murales/nuevo">
                  <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Nuevo Mural
                  </Button>
                </Link>
              </div>
            )}

            {isCollapsed && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href="/murales/nuevo">
                      <Button
                        size="icon"
                        className="w-full h-10 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Nuevo Mural</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {!isCollapsed && (
            <div className="mt-8">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Recientes</h3>
              <div className="space-y-1">
                <RecentItem
                  title="Proyecto de Ciencias"
                  href="/murales/1"
                  icon={<Clock className="h-4 w-4 text-blue-500" />}
                  collapsed={isCollapsed}
                />
                <RecentItem
                  title="Lluvia de ideas"
                  href="/murales/2"
                  icon={<Star className="h-4 w-4 text-amber-500" />}
                  collapsed={isCollapsed}
                />
                <RecentItem
                  title="Presentación final"
                  href="/murales/3"
                  icon={<Clock className="h-4 w-4 text-blue-500" />}
                  collapsed={isCollapsed}
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-3 border-t">
          {isCollapsed ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/perfil">
                    <Avatar className="h-10 w-10 cursor-pointer">
                      <AvatarImage src={user?.avatar || "/placeholder.svg?height=40&width=40"} alt={user?.name || ""} />
                      <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white">
                        {user?.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{user?.name || "Perfil"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Link href="/perfil">
              <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 transition-colors">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.avatar || "/placeholder.svg?height=40&width=40"} alt={user?.name || ""} />
                  <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white">
                    {user?.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

interface MenuItemProps {
  href: string
  active: boolean
  icon: React.ReactNode
  children: React.ReactNode
  collapsed: boolean
}

function MenuItem({ href, active, icon, children, collapsed }: MenuItemProps) {
  if (collapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={href}>
              <Button
                variant="ghost"
                size="icon"
                className={`w-full h-10 ${
                  active
                    ? "bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 dark:from-pink-900/20 dark:to-purple-900/20 dark:text-pink-400"
                    : "hover:bg-gray-100"
                }`}
              >
                {icon}
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{children}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <Link href={href}>
      <Button
        variant="ghost"
        className={`w-full justify-start ${
          active
            ? "bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 dark:from-pink-900/20 dark:to-purple-900/20 dark:text-pink-400"
            : "hover:bg-gray-100"
        }`}
      >
        <span className="mr-3">{icon}</span>
        {children}
      </Button>
    </Link>
  )
}

interface RecentItemProps {
  title: string
  href: string
  icon: React.ReactNode
  collapsed: boolean
}

function RecentItem({ title, href, icon, collapsed }: RecentItemProps) {
  if (collapsed) return null

  return (
    <Link href={href}>
      <div className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors">
        <span className="mr-3 flex-shrink-0">{icon}</span>
        <span className="truncate">{title}</span>
      </div>
    </Link>
  )
}

interface MobileMenuItemProps {
  href: string
  active: boolean
  icon: React.ReactNode
  children: React.ReactNode
}

function MobileMenuItem({ href, active, icon, children }: MobileMenuItemProps) {
  return (
    <Link href={href}>
      <div
        className={`flex items-center px-3 py-2 rounded-md transition-colors ${
          active
            ? "bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 dark:from-pink-900/20 dark:to-purple-900/20 dark:text-pink-400"
            : "hover:bg-gray-100"
        }`}
      >
        <span className="mr-3">{icon}</span>
        {children}
      </div>
    </Link>
  )
}
