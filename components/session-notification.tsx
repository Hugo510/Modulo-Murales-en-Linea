"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Shield, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { formatLastActive } from "@/services/session-service"

export function SessionNotification() {
  const { sessions, closeUserSession, currentSession } = useAuth()
  const [newSessions, setNewSessions] = useState<typeof sessions>([])
  const [showNotification, setShowNotification] = useState(false)

  // Verificar si hay nuevas sesiones (simulado)
  useEffect(() => {
    // En un entorno real, esto se haría con websockets o polling
    const checkNewSessions = () => {
      // Filtrar sesiones que no son la actual y que se crearon en las últimas 24 horas
      const oneDayAgo = new Date()
      oneDayAgo.setDate(oneDayAgo.getDate() - 1)

      const recent = sessions.filter(
        (session) => !session.isCurrentSession && new Date(session.createdAt) > oneDayAgo && !session.lastNotified, // No notificada previamente
      )

      if (recent.length > 0) {
        setNewSessions(recent)
        setShowNotification(true)

        // Marcar como notificadas
        const updatedSessions = sessions.map((session) => {
          if (recent.some((r) => r.id === session.id)) {
            return { ...session, lastNotified: new Date() }
          }
          return session
        })

        // En un entorno real, actualizaríamos esto en la base de datos
      }
    }

    // Verificar al cargar y cada 5 minutos
    checkNewSessions()
    const interval = setInterval(checkNewSessions, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [sessions])

  const handleClose = () => {
    setShowNotification(false)
  }

  const handleCloseSession = (sessionId: string) => {
    closeUserSession(sessionId)
    setNewSessions(newSessions.filter((s) => s.id !== sessionId))
    if (newSessions.length <= 1) {
      setShowNotification(false)
    }
  }

  if (!showNotification || newSessions.length === 0) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-20 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]"
      >
        <div className="bg-amber-50 border-2 border-amber-200 rounded-lg shadow-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-amber-700">
              <Shield className="h-5 w-5" />
              <h3 className="font-semibold">Nuevos inicios de sesión detectados</h3>
            </div>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleClose}>
              <X className="h-4 w-4" />
              <span className="sr-only">Cerrar</span>
            </Button>
          </div>

          <p className="text-sm text-amber-700 mt-2 mb-3">
            Se han detectado nuevos inicios de sesión en tu cuenta. Si no reconoces alguna de estas sesiones, ciérrala
            inmediatamente.
          </p>

          <div className="space-y-3 max-h-60 overflow-y-auto">
            {newSessions.map((session) => (
              <div key={session.id} className="bg-white rounded border border-amber-200 p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">
                      {session.deviceInfo.name} ({session.deviceInfo.os})
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session.location.city}, {session.location.country}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatLastActive(new Date(session.lastActive))}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 text-xs h-7"
                    onClick={() => handleCloseSession(session.id)}
                  >
                    Cerrar sesión
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              className="text-amber-600 hover:bg-amber-50 border-amber-200"
              onClick={handleClose}
            >
              Entendido
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
