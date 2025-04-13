"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Shield, Clock, Lock } from "lucide-react"
import { updateSessionPermissions, extendSession } from "@/services/session-service"

export function SessionSettings() {
  const { currentSession, sessions, refreshSessions } = useAuth()
  const [maxSessions, setMaxSessions] = useState(5)
  const [autoLogoutMinutes, setAutoLogoutMinutes] = useState(30)
  const [notifyNewSessions, setNotifyNewSessions] = useState(true)
  const [restrictSameDeviceType, setRestrictSameDeviceType] = useState(false)
  const [defaultPermissions, setDefaultPermissions] = useState({
    canEdit: true,
    canDelete: true,
    canShare: true,
    canExport: true,
  })
  const [selectedSession, setSelectedSession] = useState<string | null>(currentSession ? currentSession.id : null)

  // Obtener la sesión seleccionada
  const session = sessions.find((s) => s.id === selectedSession)

  // Permisos de la sesión seleccionada
  const [sessionPermissions, setSessionPermissions] = useState({
    canEdit: session?.permissions?.canEdit ?? true,
    canDelete: session?.permissions?.canDelete ?? true,
    canShare: session?.permissions?.canShare ?? true,
    canExport: session?.permissions?.canExport ?? true,
  })

  // Duración de la sesión
  const [sessionDuration, setSessionDuration] = useState<string>("24")

  // Manejar cambio de sesión seleccionada
  const handleSessionChange = (value: string) => {
    setSelectedSession(value)
    const selected = sessions.find((s) => s.id === value)
    if (selected && selected.permissions) {
      setSessionPermissions({
        canEdit: selected.permissions.canEdit,
        canDelete: selected.permissions.canDelete,
        canShare: selected.permissions.canShare,
        canExport: selected.permissions.canExport,
      })
    }
  }

  // Guardar configuración de permisos
  const handleSavePermissions = () => {
    if (selectedSession) {
      updateSessionPermissions(selectedSession, sessionPermissions)
      refreshSessions()
    }
  }

  // Extender duración de la sesión
  const handleExtendSession = () => {
    if (selectedSession) {
      extendSession(selectedSession, Number.parseInt(sessionDuration))
      refreshSessions()
    }
  }

  if (!currentSession) {
    return null
  }

  return (
    <div className="space-y-6">
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            Configuración de sesiones
          </CardTitle>
          <CardDescription>Configura cómo se comportan tus sesiones en diferentes dispositivos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="max-sessions">Número máximo de sesiones activas</Label>
                <p className="text-sm text-muted-foreground">
                  Limita cuántas sesiones puedes tener abiertas simultáneamente
                </p>
              </div>
              <div className="w-24">
                <Slider
                  id="max-sessions"
                  min={1}
                  max={10}
                  step={1}
                  value={[maxSessions]}
                  onValueChange={(value) => setMaxSessions(value[0])}
                />
                <p className="text-center text-sm mt-1">{maxSessions}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-logout">Cierre automático por inactividad</Label>
                <p className="text-sm text-muted-foreground">
                  Cierra sesión automáticamente después de un período de inactividad
                </p>
              </div>
              <div className="w-24">
                <Slider
                  id="auto-logout"
                  min={5}
                  max={60}
                  step={5}
                  value={[autoLogoutMinutes]}
                  onValueChange={(value) => setAutoLogoutMinutes(value[0])}
                />
                <p className="text-center text-sm mt-1">{autoLogoutMinutes} min</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notify-sessions">Notificar nuevas sesiones</Label>
                <p className="text-sm text-muted-foreground">
                  Recibe notificaciones cuando se inicie sesión en un nuevo dispositivo
                </p>
              </div>
              <Switch
                id="notify-sessions"
                checked={notifyNewSessions}
                onCheckedChange={setNotifyNewSessions}
                className="data-[state=checked]:bg-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="restrict-device">Restringir mismo tipo de dispositivo</Label>
                <p className="text-sm text-muted-foreground">
                  Evita inicios de sesión simultáneos en dispositivos del mismo tipo
                </p>
              </div>
              <Switch
                id="restrict-device"
                checked={restrictSameDeviceType}
                onCheckedChange={setRestrictSameDeviceType}
                className="data-[state=checked]:bg-blue-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Lock className="h-4 w-4 text-blue-500" />
              Permisos predeterminados para nuevas sesiones
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="default-edit">Editar contenido</Label>
                <Switch
                  id="default-edit"
                  checked={defaultPermissions.canEdit}
                  onCheckedChange={(checked) => setDefaultPermissions({ ...defaultPermissions, canEdit: checked })}
                  className="data-[state=checked]:bg-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="default-delete">Eliminar contenido</Label>
                <Switch
                  id="default-delete"
                  checked={defaultPermissions.canDelete}
                  onCheckedChange={(checked) => setDefaultPermissions({ ...defaultPermissions, canDelete: checked })}
                  className="data-[state=checked]:bg-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="default-share">Compartir murales</Label>
                <Switch
                  id="default-share"
                  checked={defaultPermissions.canShare}
                  onCheckedChange={(checked) => setDefaultPermissions({ ...defaultPermissions, canShare: checked })}
                  className="data-[state=checked]:bg-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="default-export">Exportar murales</Label>
                <Switch
                  id="default-export"
                  checked={defaultPermissions.canExport}
                  onCheckedChange={(checked) => setDefaultPermissions({ ...defaultPermissions, canExport: checked })}
                  className="data-[state=checked]:bg-blue-500"
                />
              </div>
            </div>
          </div>

          <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700">
            <Save className="h-4 w-4 mr-2" />
            Guardar configuración
          </Button>
        </CardContent>
      </Card>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-500" />
            Gestión de sesión específica
          </CardTitle>
          <CardDescription>Configura los permisos y duración de una sesión específica</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="session-select">Seleccionar sesión</Label>
            <Select value={selectedSession || ""} onValueChange={handleSessionChange}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecciona una sesión" />
              </SelectTrigger>
              <SelectContent>
                {sessions.map((session) => (
                  <SelectItem key={session.id} value={session.id}>
                    {session.deviceInfo.name} {session.isCurrentSession ? "(Actual)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedSession && (
            <>
              <div className="pt-4 border-t">
                <h3 className="font-medium mb-3">Permisos de la sesión</h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="session-edit">Editar contenido</Label>
                    <Switch
                      id="session-edit"
                      checked={sessionPermissions.canEdit}
                      onCheckedChange={(checked) => setSessionPermissions({ ...sessionPermissions, canEdit: checked })}
                      className="data-[state=checked]:bg-purple-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="session-delete">Eliminar contenido</Label>
                    <Switch
                      id="session-delete"
                      checked={sessionPermissions.canDelete}
                      onCheckedChange={(checked) =>
                        setSessionPermissions({ ...sessionPermissions, canDelete: checked })
                      }
                      className="data-[state=checked]:bg-purple-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="session-share">Compartir murales</Label>
                    <Switch
                      id="session-share"
                      checked={sessionPermissions.canShare}
                      onCheckedChange={(checked) => setSessionPermissions({ ...sessionPermissions, canShare: checked })}
                      className="data-[state=checked]:bg-purple-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="session-export">Exportar murales</Label>
                    <Switch
                      id="session-export"
                      checked={sessionPermissions.canExport}
                      onCheckedChange={(checked) =>
                        setSessionPermissions({ ...sessionPermissions, canExport: checked })
                      }
                      className="data-[state=checked]:bg-purple-500"
                    />
                  </div>
                </div>

                <Button
                  className="w-full mt-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                  onClick={handleSavePermissions}
                >
                  Guardar permisos
                </Button>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-medium mb-3">Duración de la sesión</h3>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label htmlFor="session-duration">Extender sesión</Label>
                    <Select value={sessionDuration} onValueChange={setSessionDuration}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecciona duración" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 hora</SelectItem>
                        <SelectItem value="6">6 horas</SelectItem>
                        <SelectItem value="12">12 horas</SelectItem>
                        <SelectItem value="24">1 día</SelectItem>
                        <SelectItem value="168">7 días</SelectItem>
                        <SelectItem value="720">30 días</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    className="self-end bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                    onClick={handleExtendSession}
                  >
                    Extender
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
