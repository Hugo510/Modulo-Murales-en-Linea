"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Laptop, Smartphone, Tablet, Monitor, MapPin, Clock, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import { formatLastActive } from "@/services/session-service"

export function SessionInfo() {
  const { currentSession, isAuthenticated } = useAuth()

  if (!isAuthenticated || !currentSession) {
    return (
      <Card className="border-2 hover:shadow-md transition-all">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            Seguridad
          </CardTitle>
          <CardDescription>Inicia sesión para gestionar tus sesiones</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Inicia sesión para ver y gestionar tus sesiones activas en diferentes dispositivos.
          </p>
          <Link href="/login">
            <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              Iniciar sesión
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  // Función para obtener el icono del dispositivo
  const getDeviceIcon = () => {
    switch (currentSession.deviceInfo.type) {
      case "Mobile":
        return <Smartphone className="h-5 w-5 text-pink-500" />
      case "Tablet":
        return <Tablet className="h-5 w-5 text-purple-500" />
      default:
        return <Laptop className="h-5 w-5 text-blue-500" />
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="border-2 hover:shadow-md transition-all overflow-hidden">
        <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardTitle className="text-lg flex items-center gap-2">
            {getDeviceIcon()}
            Sesión actual
          </CardTitle>
          <CardDescription>Información sobre tu sesión actual</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm pt-4">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-1.5 rounded-full">
              <Monitor className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">Dispositivo</p>
              <p className="text-muted-foreground">
                {currentSession.deviceInfo.name} ({currentSession.deviceInfo.os})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-purple-100 p-1.5 rounded-full">
              <MapPin className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="font-medium">Ubicación</p>
              <p className="text-muted-foreground">
                {currentSession.location.city}, {currentSession.location.country}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-pink-100 p-1.5 rounded-full">
              <Clock className="h-4 w-4 text-pink-600" />
            </div>
            <div>
              <p className="font-medium">Última actividad</p>
              <p className="text-muted-foreground">{formatLastActive(new Date(currentSession.lastActive))}</p>
            </div>
          </div>

          <Link href="/perfil?tab=seguridad" className="block mt-2">
            <Button variant="outline" size="sm" className="w-full mt-2">
              Ver todas las sesiones
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  )
}
