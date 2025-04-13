"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, X, Shield } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Definir tipo para las propiedades
interface SecurityNotificationProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  ip?: string;
  location?: string;
  onConfirm?: () => void;
}

export function SecurityNotification({
  open,
  onOpenChange,
  ip,
  location,
  onConfirm
}: SecurityNotificationProps = {}) {
  const [show, setShow] = useState(false)
  const [message, setMessage] = useState("")
  const { user } = useAuth()

  // Usar props o estado interno dependiendo de cómo se usa el componente
  const isOpen = open !== undefined ? open : show;
  const handleOpenChange = onOpenChange || setShow;

  // Si se proporcionan ip y location, mostrar un diálogo de alerta
  // Si no, usar el comportamiento original del componente
  const useExternalProps = ip !== undefined && location !== undefined;

  useEffect(() => {
    // Solo ejecutar esta lógica si no se están usando props externas
    if (!useExternalProps) {
      // Verificar si hay actividades sospechosas
      if (user?.securityInfo?.suspiciousActivities && user.securityInfo.suspiciousActivities.length > 0) {
        // Mostrar la notificación solo para la actividad más reciente
        const latestActivity = user.securityInfo.suspiciousActivities[user.securityInfo.suspiciousActivities.length - 1]

        // Solo mostrar si la actividad es reciente (menos de 24 horas)
        const isRecent = new Date().getTime() - new Date(latestActivity.date).getTime() < 24 * 60 * 60 * 1000

        if (isRecent) {
          setMessage(`Actividad sospechosa detectada: ${latestActivity.activity} desde ${latestActivity.location}`)
          setShow(true)
        }
      }
    }
  }, [user, useExternalProps])

  // Si se usan props externas y se muestra como diálogo
  if (useExternalProps) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              Alerta de seguridad
            </DialogTitle>
            <DialogDescription>
              Hemos detectado un inicio de sesión desde una ubicación no reconocida.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Se ha detectado un inicio de sesión desde:
            </p>

            <div className="bg-muted p-3 rounded-md text-sm">
              <div><strong>IP:</strong> {ip}</div>
              <div><strong>Ubicación:</strong> {location}</div>
            </div>

            <p className="text-sm text-amber-600">
              Si no reconoces esta actividad, por favor, cambia tu contraseña inmediatamente y contacta con soporte.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancelar</Button>
            <Button onClick={onConfirm} className="bg-amber-500 hover:bg-amber-600">
              <Shield className="h-4 w-4 mr-2" />
              Confirmar que soy yo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Comportamiento original como notificación
  if (!isOpen) return null;

  // Eliminar la verificación redundante en AnimatePresence, ya que ya verificamos !isOpen arriba
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md"
      >
        <div className="mx-4 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-md shadow-lg flex items-start">
          <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-medium text-amber-800">Alerta de seguridad</h3>
            <p className="text-sm text-amber-700 mt-1">{message}</p>
            <p className="text-xs text-amber-600 mt-2">
              Si no fuiste tú, te recomendamos cambiar tu contraseña inmediatamente.
            </p>
          </div>
          <button
            onClick={() => handleOpenChange(false)}
            className="text-amber-500 hover:text-amber-700 ml-2"
            aria-label="Cerrar notificación"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
