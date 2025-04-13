"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Shield, Lock, AlertTriangle, Info, Clock } from "lucide-react"
import { ActiveSessionsMonitor } from "@/components/active-sessions-monitor"
import { SessionSettings } from "@/components/session-settings"
import { motion } from "framer-motion"
import { formatExpiresAt } from "@/services/session-service"

export default function SesionesPage() {
  const { user, currentSession, sessions } = useAuth()
  const [activeTab, setActiveTab] = useState("monitor")

  // Si no hay usuario autenticado, mostrar mensaje
  if (!user || !currentSession) {
    return (
      <div className="container py-8">
        <div className="max-w-3xl mx-auto">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Debes iniciar sesión para acceder a esta página</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  // Obtener estadísticas de sesiones
  const activeSessions = sessions.filter((s) => s.status === "active").length
  const idleSessions = sessions.filter((s) => s.status === "idle").length
  const expiredSessions = sessions.filter((s) => s.status === "expired").length
  const totalSessions = sessions.length

  // Obtener la sesión que expira más pronto
  const nextExpiringSession = sessions
    .filter((s) => s.status === "active" && s.expiresAt)
    .sort((a, b) => {
      if (!a.expiresAt || !b.expiresAt) return 0
      return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime()
    })[0]

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-8 w-8 text-blue-500" />
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-600">
            Gestión de Sesiones
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sesiones activas</p>
                  <h3 className="text-2xl font-bold">{activeSessions}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sesiones inactivas</p>
                  <h3 className="text-2xl font-bold">{idleSessions}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sesiones expiradas</p>
                  <h3 className="text-2xl font-bold">{expiredSessions}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {nextExpiringSession && nextExpiringSession.expiresAt && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              Tu sesión en {nextExpiringSession.deviceInfo.name}{" "}
              {formatExpiresAt(new Date(nextExpiringSession.expiresAt))}
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="monitor" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <Shield className="h-4 w-4 mr-2" />
              Monitor de sesiones
            </TabsTrigger>
            <TabsTrigger
              value="configuracion"
              className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700"
            >
              <Lock className="h-4 w-4 mr-2" />
              Configuración
            </TabsTrigger>
          </TabsList>

          <TabsContent value="monitor">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <ActiveSessionsMonitor />
            </motion.div>
          </TabsContent>

          <TabsContent value="configuracion">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <SessionSettings />
            </motion.div>
          </TabsContent>
        </Tabs>

        <Separator className="my-8" />

        <Card className="border-2 mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              Acerca de la gestión de sesiones
            </CardTitle>
            <CardDescription>Información importante sobre cómo funcionan las sesiones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              La gestión de sesiones te permite controlar y monitorear el acceso a tu cuenta desde diferentes
              dispositivos. Esto te ayuda a mantener tu cuenta segura y a detectar accesos no autorizados.
            </p>

            <div className="space-y-2">
              <h3 className="font-medium">Características principales:</h3>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Visualiza todas tus sesiones activas en diferentes dispositivos</li>
                <li>Cierra sesiones remotamente si detectas actividad sospechosa</li>
                <li>Configura permisos específicos para cada dispositivo</li>
                <li>Establece límites de tiempo para tus sesiones</li>
                <li>Recibe notificaciones de nuevos inicios de sesión</li>
                <li>Cierre automático por inactividad para mayor seguridad</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Recomendaciones de seguridad:</h3>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Revisa regularmente tus sesiones activas</li>
                <li>Cierra sesión en dispositivos que ya no utilices</li>
                <li>Habilita las notificaciones de nuevos inicios de sesión</li>
                <li>Configura el cierre automático por inactividad</li>
                <li>No compartas tus credenciales de acceso</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
