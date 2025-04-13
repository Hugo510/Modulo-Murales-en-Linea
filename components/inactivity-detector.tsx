"use client"

import { useEffect, useState, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { AlertCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

interface InactivityDetectorProps {
  timeoutMinutes?: number
  warningMinutes?: number
}

export function InactivityDetector({ timeoutMinutes = 30, warningMinutes = 5 }: InactivityDetectorProps) {
  const { logout, currentSession } = useAuth()
  const [showWarning, setShowWarning] = useState(false)
  const [countdown, setCountdown] = useState(warningMinutes * 60)
  const [isActive, setIsActive] = useState(true)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const warningRef = useRef<NodeJS.Timeout | null>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

  // Reiniciar temporizadores
  const resetTimers = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (warningRef.current) clearTimeout(warningRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)

    setShowWarning(false)
    setIsActive(true)

    // Configurar nuevos temporizadores
    warningRef.current = setTimeout(
      () => {
        setShowWarning(true)
        setCountdown(warningMinutes * 60)

        // Iniciar cuenta regresiva
        countdownRef.current = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              if (countdownRef.current) clearInterval(countdownRef.current)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      },
      (timeoutMinutes - warningMinutes) * 60 * 1000,
    )

    // Configurar cierre de sesión
    timeoutRef.current = setTimeout(
      () => {
        setIsActive(false)
        logout(false)
      },
      timeoutMinutes * 60 * 1000,
    )
  }

  // Formatear tiempo restante
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Continuar sesión
  const handleContinue = () => {
    resetTimers()
  }

  // Cerrar sesión manualmente
  const handleLogout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (warningRef.current) clearTimeout(warningRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)

    logout(false)
  }

  // Configurar detección de actividad
  useEffect(() => {
    if (!currentSession) return

    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click", "keydown"]

    const handleActivity = () => {
      if (!isActive) return // No reiniciar si ya se cerró la sesión
      resetTimers()
    }

    // Iniciar temporizadores
    resetTimers()

    // Agregar event listeners
    events.forEach((event) => {
      window.addEventListener(event, handleActivity)
    })

    // Limpiar al desmontar
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (warningRef.current) clearTimeout(warningRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)

      events.forEach((event) => {
        window.removeEventListener(event, handleActivity)
      })
    }
  }, [currentSession, isActive])

  return (
    <AnimatePresence>
      {showWarning && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]"
        >
          <div className="bg-amber-50 border-2 border-amber-200 rounded-lg shadow-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-amber-700">
                <AlertCircle className="h-5 w-5" />
                <h3 className="font-semibold">Sesión a punto de expirar</h3>
              </div>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleContinue}>
                <X className="h-4 w-4" />
                <span className="sr-only">Cerrar</span>
              </Button>
            </div>

            <p className="text-sm text-amber-700 mt-2">
              Tu sesión se cerrará automáticamente por inactividad en {formatTime(countdown)}.
            </p>

            <div className="mt-3 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:bg-red-50 border-red-200"
                onClick={handleLogout}
              >
                Cerrar sesión
              </Button>
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700" onClick={handleContinue}>
                Continuar sesión
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
