"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  Loader2,
  Save,
  User,
  Bell,
  Shield,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Smartphone,
  Laptop,
  Monitor,
  Tablet,
  RefreshCw,
  Lock,
} from "lucide-react"
import { formatLastActive } from "@/services/session-service"
import { motion } from "framer-motion"
import { useMediaQuery } from "@/hooks/use-media-query"
import { ActiveSessionsMonitor } from "@/components/active-sessions-monitor"
import { SessionSettings } from "@/components/session-settings"

export default function PerfilPage() {
  const {
    user,
    updateUser,
    logout,
    isLoading,
    sessions,
    currentSession,
    closeUserSession,
    closeAllUserSessions,
    refreshSessions,
  } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isMobile = !useMediaQuery("(min-width: 768px)")

  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isRefreshingSessions, setIsRefreshingSessions] = useState(false)

  // Obtener la pestaña activa de los parámetros de URL
  const [activeTab, setActiveTab] = useState("cuenta")

  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && ["cuenta", "notificaciones", "seguridad", "sesiones"].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Si no hay usuario autenticado, redirigir a login
  if (!user && !isLoading) {
    router.push("/login")
    return null
  }

  // Si está cargando, mostrar un indicador de carga
  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!name.trim()) {
      setError("El nombre no puede estar vacío")
      return
    }

    setIsSubmitting(true)
    try {
      const success = await updateUser({ name })
      if (success) {
        setSuccess("Perfil actualizado correctamente")
      } else {
        setError("No se pudo actualizar el perfil")
      }
    } catch (error) {
      setError("Ocurrió un error al actualizar el perfil")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Por favor, completa todos los campos")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas nuevas no coinciden")
      return
    }

    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    setIsSubmitting(true)
    try {
      // Simulación de cambio de contraseña
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSuccess("Contraseña actualizada correctamente")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      setError("Ocurrió un error al cambiar la contraseña")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRefreshSessions = async () => {
    setIsRefreshingSessions(true)
    try {
      refreshSessions()
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simular carga
    } finally {
      setIsRefreshingSessions(false)
    }
  }

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

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">
          Mi Perfil
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <Card className="border-2">
              <CardContent className="p-6 flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={user?.avatar || "/placeholder.svg?height=96&width=96"} alt={user?.name} />
                  <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white text-xl">
                    {user?.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <h2 className="font-bold text-lg text-center">{user?.name}</h2>
                <p className="text-sm text-muted-foreground mb-4 text-center break-words">{user?.email}</p>
                <p className="text-xs text-muted-foreground">Miembro desde {user?.createdAt.toLocaleDateString()}</p>
                <Separator className="my-4" />
                <Button
                  variant="outline"
                  className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => logout(false)}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar sesión
                </Button>
              </CardContent>
            </Card>

            {/* Pestañas para móvil */}
            {isMobile && (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger
                    value="cuenta"
                    className="data-[state=active]:bg-pink-50 data-[state=active]:text-pink-700"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Cuenta
                  </TabsTrigger>
                  <TabsTrigger
                    value="notificaciones"
                    className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Notif.
                  </TabsTrigger>
                  <TabsTrigger
                    value="seguridad"
                    className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Seguridad
                  </TabsTrigger>
                  <TabsTrigger
                    value="sesiones"
                    className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Sesiones
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          </div>

          <div className="md:col-span-3">
            {/* Pestañas para escritorio */}
            {!isMobile && (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-4 mb-6">
                  <TabsTrigger
                    value="cuenta"
                    className="data-[state=active]:bg-pink-50 data-[state=active]:text-pink-700"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Cuenta
                  </TabsTrigger>
                  <TabsTrigger
                    value="notificaciones"
                    className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Notificaciones
                  </TabsTrigger>
                  <TabsTrigger
                    value="seguridad"
                    className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Seguridad
                  </TabsTrigger>
                  <TabsTrigger
                    value="sesiones"
                    className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Sesiones
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            <TabsContent value="cuenta" className={isMobile ? "" : "hidden"}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>Información personal</CardTitle>
                    <CardDescription>Actualiza tu información personal</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {error && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {success && (
                      <Alert className="mb-4 border-green-200 bg-green-50">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-700">{success}</AlertDescription>
                      </Alert>
                    )}

                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nombre completo</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="border-2 focus-visible:ring-pink-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Input
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="border-2 focus-visible:ring-pink-500"
                          disabled
                        />
                        <p className="text-xs text-muted-foreground">
                          El correo electrónico no se puede cambiar por motivos de seguridad
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="avatar">Foto de perfil</Label>
                        <div className="flex items-center gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={user?.avatar || "/placeholder.svg?height=64&width=64"} alt={user?.name} />
                            <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white">
                              {user?.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <Button variant="outline" size="sm">
                            Cambiar foto
                          </Button>
                        </div>
                      </div>
                      <Button
                        type="submit"
                        className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Guardar cambios
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="notificaciones" className={isMobile ? "" : "hidden"}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>Preferencias de notificaciones</CardTitle>
                    <CardDescription>Configura cómo quieres recibir notificaciones</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Comentarios</p>
                          <p className="text-sm text-muted-foreground">
                            Recibir notificaciones cuando alguien comente en tus murales
                          </p>
                        </div>
                        <Switch defaultChecked className="data-[state=checked]:bg-pink-500" />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Colaboración</p>
                          <p className="text-sm text-muted-foreground">
                            Recibir notificaciones cuando te inviten a colaborar
                          </p>
                        </div>
                        <Switch defaultChecked className="data-[state=checked]:bg-pink-500" />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Actualizaciones</p>
                          <p className="text-sm text-muted-foreground">
                            Recibir notificaciones sobre actualizaciones de la plataforma
                          </p>
                        </div>
                        <Switch className="data-[state=checked]:bg-pink-500" />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="font-medium">Método de notificación</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Correo electrónico</p>
                          <p className="text-sm text-muted-foreground">Recibir notificaciones por correo electrónico</p>
                        </div>
                        <Switch defaultChecked className="data-[state=checked]:bg-pink-500" />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Notificaciones en la aplicación</p>
                          <p className="text-sm text-muted-foreground">
                            Mostrar notificaciones dentro de la aplicación
                          </p>
                        </div>
                        <Switch defaultChecked className="data-[state=checked]:bg-pink-500" />
                      </div>
                    </div>

                    <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                      <Save className="h-4 w-4 mr-2" />
                      Guardar preferencias
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="seguridad" className={isMobile ? "" : "hidden"}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>Cambiar contraseña</CardTitle>
                    <CardDescription>Actualiza tu contraseña para mantener tu cuenta segura</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {error && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {success && (
                      <Alert className="mb-4 border-green-200 bg-green-50">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-700">{success}</AlertDescription>
                      </Alert>
                    )}

                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Contraseña actual</Label>
                        <Input
                          id="current-password"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="border-2 focus-visible:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">Nueva contraseña</Label>
                        <Input
                          id="new-password"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="border-2 focus-visible:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirmar nueva contraseña</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="border-2 focus-visible:ring-blue-500"
                        />
                      </div>
                      <Button
                        type="submit"
                        className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Actualizar contraseña
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="border-2 mt-6">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Sesiones activas</CardTitle>
                      <CardDescription>Gestiona los dispositivos donde has iniciado sesión</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleRefreshSessions} disabled={isRefreshingSessions}>
                      <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshingSessions ? "animate-spin" : ""}`} />
                      Actualizar
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {sessions.map((session) => (
                        <div
                          key={session.id}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            session.isCurrentSession ? "bg-blue-50 border border-blue-100" : "hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-1">{getDeviceIcon(session.deviceInfo.type)}</div>
                            <div>
                              <p className="font-medium">
                                {session.deviceInfo.name}
                                {session.isCurrentSession && " (Este dispositivo)"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {session.deviceInfo.os} • {session.deviceInfo.browser} • {session.location.city},{" "}
                                {session.location.country}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Última actividad: {formatLastActive(new Date(session.lastActive))}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className={session.isCurrentSession ? "" : "text-red-600 hover:bg-red-50"}
                            onClick={() => closeUserSession(session.id)}
                            disabled={isSubmitting}
                          >
                            {session.isCurrentSession ? "Sesión actual" : "Cerrar sesión"}
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 space-y-3">
                      <Button
                        variant="outline"
                        className="w-full text-amber-600 hover:bg-amber-50 border-amber-200"
                        onClick={closeAllUserSessions}
                        disabled={isSubmitting || sessions.length <= 1}
                      >
                        Cerrar todas las otras sesiones
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full text-red-600 hover:bg-red-50 border-red-200"
                        onClick={() => logout(true)}
                        disabled={isSubmitting}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Cerrar todas las sesiones
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="sesiones" className={isMobile ? "" : "hidden"}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <ActiveSessionsMonitor />
                <div className="mt-6">
                  <SessionSettings />
                </div>
              </motion.div>
            </TabsContent>

            {/* Contenido para escritorio */}
            {!isMobile && (
              <>
                {activeTab === "cuenta" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border-2">
                      <CardHeader>
                        <CardTitle>Información personal</CardTitle>
                        <CardDescription>Actualiza tu información personal</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {error && (
                          <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        )}

                        {success && (
                          <Alert className="mb-4 border-green-200 bg-green-50">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-700">{success}</AlertDescription>
                          </Alert>
                        )}

                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Nombre completo</Label>
                            <Input
                              id="name"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="border-2 focus-visible:ring-pink-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Correo electrónico</Label>
                            <Input
                              id="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="border-2 focus-visible:ring-pink-500"
                              disabled
                            />
                            <p className="text-xs text-muted-foreground">
                              El correo electrónico no se puede cambiar por motivos de seguridad
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="avatar">Foto de perfil</Label>
                            <div className="flex items-center gap-4">
                              <Avatar className="h-16 w-16">
                                <AvatarImage
                                  src={user?.avatar || "/placeholder.svg?height=64&width=64"}
                                  alt={user?.name}
                                />
                                <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white">
                                  {user?.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <Button variant="outline" size="sm">
                                Cambiar foto
                              </Button>
                            </div>
                          </div>
                          <Button
                            type="submit"
                            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4 mr-2" />
                            )}
                            Guardar cambios
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {activeTab === "notificaciones" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border-2">
                      <CardHeader>
                        <CardTitle>Preferencias de notificaciones</CardTitle>
                        <CardDescription>Configura cómo quieres recibir notificaciones</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Comentarios</p>
                              <p className="text-sm text-muted-foreground">
                                Recibir notificaciones cuando alguien comente en tus murales
                              </p>
                            </div>
                            <Switch defaultChecked className="data-[state=checked]:bg-pink-500" />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Colaboración</p>
                              <p className="text-sm text-muted-foreground">
                                Recibir notificaciones cuando te inviten a colaborar
                              </p>
                            </div>
                            <Switch defaultChecked className="data-[state=checked]:bg-pink-500" />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Actualizaciones</p>
                              <p className="text-sm text-muted-foreground">
                                Recibir notificaciones sobre actualizaciones de la plataforma
                              </p>
                            </div>
                            <Switch className="data-[state=checked]:bg-pink-500" />
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <h3 className="font-medium">Método de notificación</h3>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Correo electrónico</p>
                              <p className="text-sm text-muted-foreground">
                                Recibir notificaciones por correo electrónico
                              </p>
                            </div>
                            <Switch defaultChecked className="data-[state=checked]:bg-pink-500" />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Notificaciones en la aplicación</p>
                              <p className="text-sm text-muted-foreground">
                                Mostrar notificaciones dentro de la aplicación
                              </p>
                            </div>
                            <Switch defaultChecked className="data-[state=checked]:bg-pink-500" />
                          </div>
                        </div>

                        <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                          <Save className="h-4 w-4 mr-2" />
                          Guardar preferencias
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {activeTab === "seguridad" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border-2">
                      <CardHeader>
                        <CardTitle>Cambiar contraseña</CardTitle>
                        <CardDescription>Actualiza tu contraseña para mantener tu cuenta segura</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {error && (
                          <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        )}

                        {success && (
                          <Alert className="mb-4 border-green-200 bg-green-50">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-700">{success}</AlertDescription>
                          </Alert>
                        )}

                        <form onSubmit={handleChangePassword} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="current-password">Contraseña actual</Label>
                            <Input
                              id="current-password"
                              type="password"
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              className="border-2 focus-visible:ring-blue-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="new-password">Nueva contraseña</Label>
                            <Input
                              id="new-password"
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="border-2 focus-visible:ring-blue-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirmar nueva contraseña</Label>
                            <Input
                              id="confirm-password"
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="border-2 focus-visible:ring-blue-500"
                            />
                          </div>
                          <Button
                            type="submit"
                            className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4 mr-2" />
                            )}
                            Actualizar contraseña
                          </Button>
                        </form>
                      </CardContent>
                    </Card>

                    <Card className="border-2 mt-6">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle>Sesiones activas</CardTitle>
                          <CardDescription>Gestiona los dispositivos donde has iniciado sesión</CardDescription>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRefreshSessions}
                          disabled={isRefreshingSessions}
                        >
                          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshingSessions ? "animate-spin" : ""}`} />
                          Actualizar
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {sessions.map((session) => (
                            <div
                              key={session.id}
                              className={`flex items-center justify-between p-3 rounded-lg ${
                                session.isCurrentSession ? "bg-blue-50 border border-blue-100" : "hover:bg-muted/50"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="mt-1">{getDeviceIcon(session.deviceInfo.type)}</div>
                                <div>
                                  <p className="font-medium">
                                    {session.deviceInfo.name}
                                    {session.isCurrentSession && " (Este dispositivo)"}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {session.deviceInfo.os} • {session.deviceInfo.browser} • {session.location.city},{" "}
                                    {session.location.country}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Última actividad: {formatLastActive(new Date(session.lastActive))}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className={session.isCurrentSession ? "" : "text-red-600 hover:bg-red-50"}
                                onClick={() => closeUserSession(session.id)}
                                disabled={isSubmitting}
                              >
                                {session.isCurrentSession ? "Sesión actual" : "Cerrar sesión"}
                              </Button>
                            </div>
                          ))}
                        </div>

                        <div className="mt-6 space-y-3">
                          <Button
                            variant="outline"
                            className="w-full text-amber-600 hover:bg-amber-50 border-amber-200"
                            onClick={closeAllUserSessions}
                            disabled={isSubmitting || sessions.length <= 1}
                          >
                            Cerrar todas las otras sesiones
                          </Button>

                          <Button
                            variant="outline"
                            className="w-full text-red-600 hover:bg-red-50 border-red-200"
                            onClick={() => logout(true)}
                            disabled={isSubmitting}
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Cerrar todas las sesiones
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {activeTab === "sesiones" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ActiveSessionsMonitor />
                    <div className="mt-6">
                      <SessionSettings />
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
