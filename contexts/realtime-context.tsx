"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getSupabaseClient } from "@/lib/supabase/client"
import type { RealtimeChannel, RealtimePresenceState } from "@supabase/supabase-js"
import { toast } from "@/components/ui/use-toast"

// Tipos para los usuarios activos
export interface ActiveUser {
  id: string
  name: string
  avatar?: string
  lastActive: Date
  focusedItemId?: string
  cursorPosition?: { x: number; y: number }
}

// Definir el tipo para los datos de presencia que enviamos
interface PresenceUserState {
  id: string;
  name: string;
  avatar?: string;
  lastActive: string;
  focusedItemId?: string;
  cursorPosition?: { x: number; y: number };
}

// Tipos para los cambios en tiempo real - MOVIDO AQUÍ ARRIBA
export interface RealtimeChange {
  type: "add" | "update" | "delete" | "move"
  itemId?: string
  userId: string
  userName: string
  timestamp: Date
  data?: any
}

// Interfaz del contexto
interface RealtimeContextType {
  activeUsers: ActiveUser[]
  isConnected: boolean
  joinMural: (muralId: string) => void
  leaveMural: () => void
  updateCursorPosition: (x: number, y: number) => void
  focusItem: (itemId: string | null) => void
  broadcastChange: (change: Omit<RealtimeChange, "userId" | "userName" | "timestamp">) => void
  changes: RealtimeChange[]
}

// Crear el contexto
const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined)

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [currentMuralId, setCurrentMuralId] = useState<string | null>(null)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const [changes, setChanges] = useState<RealtimeChange[]>([])
  const supabase = getSupabaseClient()

  // Efecto para limpiar al desmontar
  useEffect(() => {
    return () => {
      if (channel) {
        leaveMural()
      }
    }
  }, [])

  // Unirse a un mural para colaboración en tiempo real
  const joinMural = (muralId: string) => {
    if (!user) return
    if (channel) leaveMural()

    setCurrentMuralId(muralId)

    // Crear un nuevo canal para el mural
    const newChannel = supabase.channel(`mural:${muralId}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    })

    // Configurar presencia
    newChannel
      .on("presence", { event: "sync" }, () => {
        const state = newChannel.presenceState()
        updateActiveUsers(state)
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        // Mostrar notificación cuando un usuario se une
        if (key !== user.id) {
          const newUser = newPresences[0]
          toast({
            title: "Usuario conectado",
            description: `${newUser.name} se ha unido al mural`,
          })
        }
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        // Mostrar notificación cuando un usuario se va
        if (key !== user.id) {
          const leftUser = leftPresences[0]
          toast({
            description: `${leftUser.name} ha dejado el mural`,
          })
        }
      })
      // Escuchar cambios en tiempo real
      .on("broadcast", { event: "change" }, (payload) => {
        // Procesar cambio recibido
        const change = payload.payload as RealtimeChange

        // Añadir el cambio al historial
        setChanges((prev) => [...prev, change])

        // Mostrar notificación para ciertos tipos de cambios
        if (change.userId !== user.id) {
          if (change.type === "add") {
            toast({
              description: `${change.userName} ha añadido un nuevo elemento`,
            })
          } else if (change.type === "delete") {
            toast({
              description: `${change.userName} ha eliminado un elemento`,
            })
          }
        }
      })

    // Suscribirse al canal
    newChannel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        // Enviar estado de presencia
        await newChannel.track({
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          lastActive: new Date().toISOString(),
        })

        setIsConnected(true)
        setChannel(newChannel)
      }
    })
  }

  // Dejar el mural actual
  const leaveMural = () => {
    if (channel) {
      channel.unsubscribe()
      setChannel(null)
    }
    setCurrentMuralId(null)
    setIsConnected(false)
    setActiveUsers([])
    setChanges([])
  }

  // Actualizar la posición del cursor
  const updateCursorPosition = (x: number, y: number) => {
    if (!channel || !isConnected || !user) return

    channel.track({
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      lastActive: new Date().toISOString(),
      cursorPosition: { x, y },
    })
  }

  // Enfocar un elemento
  const focusItem = (itemId: string | null) => {
    if (!channel || !isConnected || !user) return

    channel.track({
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      lastActive: new Date().toISOString(),
      focusedItemId: itemId || undefined,
    })
  }

  // Transmitir un cambio a todos los usuarios
  const broadcastChange = (change: Omit<RealtimeChange, "userId" | "userName" | "timestamp">) => {
    if (!channel || !isConnected || !user) return

    const fullChange: RealtimeChange = {
      ...change,
      userId: user.id,
      userName: user.name,
      timestamp: new Date(),
    }

    channel.send({
      type: "broadcast",
      event: "change",
      payload: fullChange,
    })

    // Añadir el cambio al historial local
    setChanges((prev) => [...prev, fullChange])
  }

  // Actualizar la lista de usuarios activos basado en el estado de presencia
  const updateActiveUsers = (state: RealtimePresenceState) => {
    const users: ActiveUser[] = []

    Object.keys(state).forEach((userId) => {
      // Usar una aserción de tipo para los datos de presencia
      const userPresence = state[userId][0] as unknown as PresenceUserState;

      users.push({
        id: userId,
        name: userPresence.name || "Usuario",
        avatar: userPresence.avatar,
        lastActive: new Date(userPresence.lastActive),
        focusedItemId: userPresence.focusedItemId,
        cursorPosition: userPresence.cursorPosition,
      })
    })

    setActiveUsers(users)
  }

  const value = {
    activeUsers,
    isConnected,
    joinMural,
    leaveMural,
    updateCursorPosition,
    focusItem,
    broadcastChange,
    changes,
  }

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>
}

// Hook personalizado para usar el contexto
export function useRealtime() {
  const context = useContext(RealtimeContext)
  if (context === undefined) {
    throw new Error("useRealtime must be used within a RealtimeProvider")
  }
  return context
}
