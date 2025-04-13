"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Smartphone, Laptop, Tablet, Monitor, MapPin, Clock, AlertTriangle, Shield, RefreshCw } from "lucide-react"
import { formatLastActive, formatExpiresAt } from "@/services/session-service"
import { motion } from "framer-motion"

export function ActiveSessionsMonitor() {
  const { sessions, closeUserSession, refreshSessions } = useAuth()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  // Filtrar sesiones según la pestaña activa
  const filteredSessions = sessions.filter((session) => {
    if (activeTab === "all") return true
    if (activeTab === "active") return session.status === "active"
    if (activeTab === "idle") return session.status === "idle"
    if (activeTab === "expired") return session.status === "expired"
    return true
  })

  // Función para obtener el icono del dispositivo
  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "Mobile":
        return <Smartphone className="h-5 w-5 text-pink-500" />
      case "Tablet":
        return <Tablet className="h-5 w-5 text-purple-500" />
      case "Desktop":
        return <Laptop className="h-5 w-5 text-blue-500" />
      default:
        return <Monitor className="h-5 w-5 text-gray-500" />
    }
  }

  // Función para obtener el color de estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 border-green-200"
      case "idle":
        return "bg-amber-100 text-amber-700 border-amber-200"
      case "expired":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  // Función para obtener el texto de estado
  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Activa"
      case "idle":
        return "Inactiva"
      case "expired":
        return "Expirada"
      default:
        return "Desconocido"
    }
  }

  // Manejar actualización de sesiones
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshSessions()
    setTimeout(() => setIsRefreshing(false), 500) // Simular carga
  }

  // Verificar sesiones expiradas
  useEffect(() => {
    const checkExpiredSessions = () => {
      const now = new Date()
      sessions.forEach((session) => {
        if (session.expiresAt && new Date(session.expiresAt) < now && session.status !== "expired") {
          // En un entorno real, actualizaríamos el estado en la base de datos
          console.log(`Sesión ${session.id} expirada`)
        }
      })
    }

    checkExpiredSessions()
    const interval = setInterval(checkExpiredSessions, 60 * 1000) // Verificar cada minuto

    return () => clearInterval(interval)
  }, [sessions])

  return (
    <Card className="border-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            Monitor de sesiones activas
          </CardTitle>
          <CardDescription>Visualiza y gestiona todas tus sesiones en diferentes dispositivos</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="h-8">
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="all" className="text-sm">
              Todas ({sessions.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="text-sm">
              Activas ({sessions.filter((s) => s.status === "active").length})
            </TabsTrigger>
            <TabsTrigger value="idle" className="text-sm">
              Inactivas ({sessions.filter((s) => s.status === "idle").length})
            </TabsTrigger>
            <TabsTrigger value="expired" className="text-sm">
              Expiradas ({sessions.filter((s) => s.status === "expired").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {filteredSessions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No hay sesiones para mostrar</p>
              ) : (
                filteredSessions.map((session) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`border rounded-lg p-4 ${
                      session.isCurrentSession ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">{getDeviceIcon(session.deviceInfo.type)}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {session.deviceInfo.name}
                              {session.isCurrentSession && " (Este dispositivo)"}
                            </p>
                            <Badge variant="outline" className={`text-xs py-0 h-5 ${getStatusColor(session.status)}`}>
                              {getStatusText(session.status)}
                            </Badge>
                          </div>

                          <div className="flex flex-col gap-1 mt-1">
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <span className="inline-flex items-center">
                                <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                                {session.location.city}, {session.location.country}
                              </span>
                              <span className="mx-1">•</span>
                              <span>
                                {session.deviceInfo.browser} en {session.deviceInfo.os}
                              </span>
                            </p>

                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              <p className="flex items-center">
                                <Clock className="h-3 w-3 mr-1 text-gray-400" />
                                Última actividad: {formatLastActive(new Date(session.lastActive))}
                              </p>

                              {session.expiresAt && (
                                <p className="flex items-center">
                                  <AlertTriangle className="h-3 w-3 mr-1 text-gray-400" />
                                  {formatExpiresAt(new Date(session.expiresAt))}
                                </p>
                              )}
                            </div>

                            {session.permissions && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {session.permissions.canEdit && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs py-0 h-5 bg-blue-50 text-blue-700 border-blue-200"
                                  >
                                    Editar
                                  </Badge>
                                )}
                                {session.permissions.canDelete && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs py-0 h-5 bg-red-50 text-red-700 border-red-200"
                                  >
                                    Eliminar
                                  </Badge>
                                )}
                                {session.permissions.canShare && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs py-0 h-5 bg-green-50 text-green-700 border-green-200"
                                  >
                                    Compartir
                                  </Badge>
                                )}
                                {session.permissions.canExport && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs py-0 h-5 bg-purple-50 text-purple-700 border-purple-200"
                                  >
                                    Exportar
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className={session.isCurrentSession ? "" : "text-red-600 hover:bg-red-50"}
                        onClick={() => closeUserSession(session.id)}
                        disabled={session.isCurrentSession}
                      >
                        {session.isCurrentSession ? "Sesión actual" : "Cerrar sesión"}
                      </Button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
