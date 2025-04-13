"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import type { Session as SupabaseSession, User as SupabaseUser } from "@supabase/supabase-js"
import { getCurrentDeviceInfo } from "@/services/session-service"

// Definir tipos para los usuarios
export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: "admin" | "user"
  createdAt: Date
  lastLogin?: Date
  loginAttempts?: number
  securityInfo?: {
    lastFailedLogin?: Date
    lastIp?: string
    lastLocation?: string
    suspiciousActivities?: Array<{
      date: Date
      activity: string
      ip: string
      location: string
    }>
  }
  sessionSettings?: {
    maxSessions: number
    autoLogoutMinutes: number
    notifyNewSessions: boolean
    restrictSameDeviceType: boolean
    defaultPermissions: {
      canEdit: boolean
      canDelete: boolean
      canShare: boolean
      canExport: boolean
    }
  }
}

// Definición de tipos para las sesiones
export interface Session {
  id: string
  userId: string
  deviceInfo: {
    type: string
    name: string
    browser: string
    os: string
  }
  location: {
    city: string
    country: string
  }
  ip: string
  lastActive: Date
  createdAt: Date
  isCurrentSession: boolean
  status?: "active" | "idle" | "expired"
  expiresAt?: Date
  lastNotified?: Date
  permissions?: {
    canEdit: boolean
    canDelete: boolean
    canShare: boolean
    canExport: boolean
  }
}

// Definir el contexto de autenticación
interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: (allSessions?: boolean) => Promise<void>
  updateUser: (userData: Partial<User>) => Promise<boolean>
  sessions: Session[]
  currentSession: Session | null
  closeUserSession: (sessionId: string) => Promise<void>
  closeAllUserSessions: () => Promise<void>
  refreshSessions: () => Promise<void>
  checkSuspiciousActivity: (ip: string, location: string) => boolean
  resetLoginAttempts: () => Promise<void>
  updateSessionPermissions: (sessionId: string, permissions: Partial<Session["permissions"]>) => Promise<void>
  extendSession: (sessionId: string, hours?: number) => Promise<void>
  updateSessionSettings: (settings: Partial<User["sessionSettings"]>) => Promise<boolean>
  checkSessionConflicts: () => Promise<boolean>
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Proveedor del contexto de autenticación
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sessions, setSessions] = useState<Session[]>([])
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const [supabaseSession, setSupabaseSession] = useState<SupabaseSession | null>(null)
  const router = useRouter()
  const supabase = getSupabaseClient()

  // Comprobar si hay un usuario autenticado al cargar
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Obtener la sesión actual
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error al obtener la sesión:", error)
          setIsLoading(false)
          return
        }

        if (session) {
          setSupabaseSession(session)
          await loadUserProfile(session.user)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("Error al verificar la autenticación:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()

    // Suscribirse a cambios en la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        setSupabaseSession(session)
        await loadUserProfile(session.user)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setSupabaseSession(null)
        setSessions([])
        setCurrentSession(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Cargar el perfil del usuario desde la base de datos
  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      // Obtener el perfil del usuario
      const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", supabaseUser.id).single()

      if (error) {
        console.error("Error al cargar el perfil:", error)
        return
      }

      if (profile) {
        // Convertir el perfil a nuestro formato de usuario
        const userData: User = {
          id: profile.id,
          name: profile.name,
          email: supabaseUser.email || "",
          avatar: profile.avatar_url || undefined,
          role: "user", // Por defecto todos son usuarios normales
          createdAt: new Date(profile.created_at),
          lastLogin: profile.last_login ? new Date(profile.last_login) : undefined,
          loginAttempts: profile.login_attempts || 0,
          sessionSettings: {
            maxSessions: 5,
            autoLogoutMinutes: 30,
            notifyNewSessions: true,
            restrictSameDeviceType: false,
            defaultPermissions: {
              canEdit: true,
              canDelete: true,
              canShare: true,
              canExport: true,
            },
          },
        }

        setUser(userData)

        // Cargar sesiones
        await loadSessions(userData.id)

        // Actualizar última conexión
        await supabase
          .from("profiles")
          .update({
            last_login: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", userData.id)
      } else {
        // Si no existe el perfil, crearlo
        const newProfile = {
          id: supabaseUser.id,
          name: supabaseUser.user_metadata?.name || supabaseUser.email?.split("@")[0] || "Usuario",
          avatar_url: supabaseUser.user_metadata?.avatar_url || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
          login_attempts: 0,
        }

        const { error: insertError } = await supabase.from("profiles").insert([newProfile])

        if (insertError) {
          console.error("Error al crear el perfil:", insertError)
          return
        }

        // Crear usuario con el nuevo perfil
        const userData: User = {
          id: newProfile.id,
          name: newProfile.name,
          email: supabaseUser.email || "",
          avatar: newProfile.avatar_url || undefined,
          role: "user",
          createdAt: new Date(newProfile.created_at),
          lastLogin: new Date(newProfile.last_login),
          loginAttempts: 0,
          sessionSettings: {
            maxSessions: 5,
            autoLogoutMinutes: 30,
            notifyNewSessions: true,
            restrictSameDeviceType: false,
            defaultPermissions: {
              canEdit: true,
              canDelete: true,
              canShare: true,
              canExport: true,
            },
          },
        }

        setUser(userData)
      }
    } catch (error) {
      console.error("Error al procesar el perfil:", error)
    }
  }

  // Cargar sesiones del usuario
  const loadSessions = async (userId: string) => {
    try {
      const { data: userSessions, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("user_id", userId)
        .order("last_active", { ascending: false })

      if (error) {
        console.error("Error al cargar sesiones:", error)
        return
      }

      // Crear la sesión actual si no existe
      const deviceInfo = getCurrentDeviceInfo()
      let currentSessionData = userSessions?.find(
        (s) => s.browser === deviceInfo.browser && s.os === deviceInfo.os && s.device_type === deviceInfo.type,
      )

      if (!currentSessionData) {
        // Crear una nueva sesión
        const newSession = {
          user_id: userId,
          device_type: deviceInfo.type,
          device_name: deviceInfo.name,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          ip: "127.0.0.1", // En un entorno real, obtendríamos la IP real
          city: "Desconocida",
          country: "Desconocido",
          last_active: new Date().toISOString(),
          created_at: new Date().toISOString(),
          status: "active",
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
          permissions: JSON.stringify({
            canEdit: true,
            canDelete: true,
            canShare: true,
            canExport: true,
          }),
        }

        const { data: insertedSession, error: insertError } = await supabase
          .from("sessions")
          .insert([newSession])
          .select()
          .single()

        if (insertError) {
          console.error("Error al crear sesión:", insertError)
        } else if (insertedSession) {
          currentSessionData = insertedSession
          userSessions?.push(currentSessionData)
        }
      } else {
        // Actualizar la última actividad
        await supabase
          .from("sessions")
          .update({
            last_active: new Date().toISOString(),
            status: "active",
          })
          .eq("id", currentSessionData.id)
      }

      // Convertir las sesiones al formato de nuestra aplicación
      const formattedSessions: Session[] = (userSessions || []).map((s) => ({
        id: s.id,
        userId: s.user_id,
        deviceInfo: {
          type: s.device_type,
          name: s.device_name,
          browser: s.browser || "Desconocido",
          os: s.os || "Desconocido",
        },
        location: {
          city: s.city || "Desconocida",
          country: s.country || "Desconocido",
        },
        ip: s.ip || "0.0.0.0",
        lastActive: new Date(s.last_active),
        createdAt: new Date(s.created_at),
        isCurrentSession: currentSessionData ? s.id === currentSessionData.id : false,
        status: s.status || "active",
        expiresAt: s.expires_at ? new Date(s.expires_at) : undefined,
        permissions: s.permissions
          ? JSON.parse(s.permissions)
          : {
              canEdit: true,
              canDelete: true,
              canShare: true,
              canExport: true,
            },
      }))

      setSessions(formattedSessions)

      // Establecer la sesión actual
      if (currentSessionData) {
        const current = formattedSessions.find((s) => s.id === currentSessionData?.id) || null
        setCurrentSession(current)
      }
    } catch (error) {
      console.error("Error al procesar sesiones:", error)
    }
  }

  // Refrescar la lista de sesiones
  const refreshSessions = async () => {
    if (user) {
      await loadSessions(user.id)
      return Promise.resolve()
    }
    return Promise.resolve()
  }

  // Función para iniciar sesión
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Error de inicio de sesión:", error)
        setIsLoading(false)
        return false
      }

      // El usuario se cargará automáticamente a través del evento onAuthStateChange
      setIsLoading(false)
      return true
    } catch (error) {
      console.error("Error de inicio de sesión:", error)
      setIsLoading(false)
      return false
    }
  }

  // Función para registrar un nuevo usuario
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })

      if (error) {
        console.error("Error de registro:", error)
        setIsLoading(false)
        return false
      }

      // El usuario se cargará automáticamente a través del evento onAuthStateChange
      setIsLoading(false)
      return true
    } catch (error) {
      console.error("Error de registro:", error)
      setIsLoading(false)
      return false
    }
  }

  // Función para cerrar sesión
  const logout = async (allSessions = false) => {
    try {
      if (allSessions) {
        // Cerrar todas las sesiones
        await closeAllUserSessions()
      } else if (currentSession) {
        // Cerrar solo la sesión actual
        await closeUserSession(currentSession.id)
      }

      // Cerrar sesión en Supabase
      await supabase.auth.signOut()

      setUser(null)
      setCurrentSession(null)
      setSessions([])
      router.push("/login")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  // Función para cerrar una sesión específica
  const closeUserSession = async (sessionId: string) => {
    try {
      // Si es la sesión actual, cerrar sesión completamente
      if (currentSession && currentSession.id === sessionId) {
        await logout(false)
        return
      }

      // Eliminar la sesión de la base de datos
      await supabase.from("sessions").delete().eq("id", sessionId)

      // Actualizar la lista de sesiones
      setSessions(sessions.filter((s) => s.id !== sessionId))
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  // Función para cerrar todas las sesiones excepto la actual
  const closeAllUserSessions = async () => {
    if (!currentSession || !user) return

    try {
      // Eliminar todas las sesiones excepto la actual
      await supabase.from("sessions").delete().neq("id", currentSession.id).eq("user_id", user.id)

      // Mantener solo la sesión actual
      setSessions([currentSession])
    } catch (error) {
      console.error("Error al cerrar todas las sesiones:", error)
    }
  }

  // Función para actualizar datos del usuario
  const updateUser = async (userData: Partial<User>): Promise<boolean> => {
    setIsLoading(true)
    try {
      if (!user) {
        setIsLoading(false)
        return false
      }

      // Preparar datos para actualizar
      const updates: any = {}

      if (userData.name) updates.name = userData.name
      if (userData.avatar) updates.avatar_url = userData.avatar
      if (userData.sessionSettings) updates.session_settings = JSON.stringify(userData.sessionSettings)

      // Actualizar en Supabase
      const { error } = await supabase
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) {
        console.error("Error al actualizar usuario:", error)
        setIsLoading(false)
        return false
      }

      // Actualizar estado local
      setUser({ ...user, ...userData })
      setIsLoading(false)
      return true
    } catch (error) {
      console.error("Error al actualizar usuario:", error)
      setIsLoading(false)
      return false
    }
  }

  // Función para actualizar los permisos de una sesión
  const updateSessionPermissions = async (
    sessionId: string,
    permissions: Partial<Session["permissions"]>,
  ): Promise<void> => {
    try {
      const session = sessions.find((s) => s.id === sessionId)
      if (!session || !session.permissions) return

      const updatedPermissions = {
        ...session.permissions,
        ...permissions,
      }

      // Actualizar en Supabase
      await supabase
        .from("sessions")
        .update({
          permissions: JSON.stringify(updatedPermissions),
        })
        .eq("id", sessionId)

      // Actualizar estado local
      setSessions(
        sessions.map((s) => {
          if (s.id === sessionId) {
            return {
              ...s,
              permissions: updatedPermissions,
            }
          }
          return s
        }),
      )
    } catch (error) {
      console.error("Error al actualizar permisos de sesión:", error)
    }
  }

  // Función para extender la duración de una sesión
  const extendSession = async (sessionId: string, hours = 24): Promise<void> => {
    try {
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + hours)

      // Actualizar en Supabase
      await supabase
        .from("sessions")
        .update({
          expires_at: expiresAt.toISOString(),
          status: "active",
        })
        .eq("id", sessionId)

      // Actualizar estado local
      setSessions(
        sessions.map((s) => {
          if (s.id === sessionId) {
            return {
              ...s,
              expiresAt,
              status: "active",
            }
          }
          return s
        }),
      )
    } catch (error) {
      console.error("Error al extender sesión:", error)
    }
  }

  // Función para actualizar la configuración de sesiones
  const updateSessionSettings = async (settings: Partial<User["sessionSettings"]>): Promise<boolean> => {
    if (!user || !user.sessionSettings) return false

    try {
      const updatedSettings = {
        ...user.sessionSettings,
        ...settings,
      }

      // Actualizar en Supabase
      const { error } = await supabase
        .from("profiles")
        .update({
          session_settings: JSON.stringify(updatedSettings),
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) {
        console.error("Error al actualizar configuración de sesiones:", error)
        return false
      }

      // Actualizar estado local
      setUser({
        ...user,
        sessionSettings: updatedSettings,
      })

      return true
    } catch (error) {
      console.error("Error al actualizar configuración de sesiones:", error)
      return false
    }
  }

  // Función para verificar si hay conflictos entre sesiones
  const checkSessionConflicts = async (): Promise<boolean> => {
    if (!user || !user.sessionSettings || !user.sessionSettings.restrictSameDeviceType) {
      return false
    }

    try {
      // Obtener sesiones activas
      const { data, error } = await supabase.from("sessions").select("*").eq("user_id", user.id).eq("status", "active")

      if (error) {
        console.error("Error al verificar conflictos de sesiones:", error)
        return false
      }

      // Verificar si hay más de un dispositivo del mismo tipo
      const deviceTypes = new Set<string>()
      for (const session of data || []) {
        if (deviceTypes.has(session.device_type)) {
          return true // Hay un conflicto
        }
        deviceTypes.add(session.device_type)
      }

      return false
    } catch (error) {
      console.error("Error al verificar conflictos de sesiones:", error)
      return false
    }
  }

  // Función para verificar actividad sospechosa
  const checkSuspiciousActivity = (ip: string, location: string): boolean => {
    if (!user || !user.securityInfo) return false

    // Verificar si la IP o ubicación son diferentes a las habituales
    const isSuspicious = user.securityInfo.lastIp !== ip || user.securityInfo.lastLocation !== location

    // En un sistema real, aquí implementaríamos lógica más sofisticada
    // como verificar patrones de comportamiento, geolocalización, etc.

    if (isSuspicious && user.securityInfo.suspiciousActivities) {
      // Registrar la actividad sospechosa
      const updatedSecurityInfo = {
        ...user.securityInfo,
        suspiciousActivities: [
          ...user.securityInfo.suspiciousActivities,
          {
            date: new Date(),
            activity: "Login desde ubicación desconocida",
            ip,
            location,
          },
        ],
      }

      // Actualizar el usuario
      updateUser({
        securityInfo: updatedSecurityInfo,
      })
    }

    return isSuspicious
  }

  // Función para resetear los intentos de login
  const resetLoginAttempts = async () => {
    if (user) {
      try {
        await supabase.from("profiles").update({ login_attempts: 0 }).eq("id", user.id)

        setUser({ ...user, loginAttempts: 0 })
      } catch (error) {
        console.error("Error al resetear intentos de login:", error)
      }
    }
  }

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
    sessions,
    currentSession,
    closeUserSession,
    closeAllUserSessions,
    refreshSessions,
    checkSuspiciousActivity,
    resetLoginAttempts,
    updateSessionPermissions,
    extendSession,
    updateSessionSettings,
    checkSessionConflicts,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook personalizado para usar el contexto de autenticación
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
