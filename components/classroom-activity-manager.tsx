"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Clock,
  Users,
  Calendar,
  CheckCircle,
  AlertCircle,
  FileText,
  Send,
  Download,
  LinkIcon,
  Copy,
  Share2,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"

interface ClassroomActivityManagerProps {
  muralId: string
  muralTitle: string
  muralDescription: string
}

export function ClassroomActivityManager({ muralId, muralTitle, muralDescription }: ClassroomActivityManagerProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("configure")
  const [activityData, setActivityData] = useState({
    title: muralTitle,
    description: muralDescription,
    type: "individual",
    dueDate: "",
    duration: "30",
    instructions: "",
    allowLateSubmissions: true,
    requiresReview: true,
    maxParticipants: "30",
    notifyOnSubmission: true,
    gradeEnabled: false,
    maxGrade: "100",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setActivityData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setActivityData((prev) => ({ ...prev, [name]: value }))
  }

  const handleToggleChange = (name: string, checked: boolean) => {
    setActivityData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSaveActivity = () => {
    // Aquí iría la lógica para guardar la actividad
    toast({
      title: "Actividad guardada",
      description: "La configuración de la actividad ha sido guardada correctamente",
    })
    setActiveTab("share")
  }

  const handleAssignActivity = () => {
    // Aquí iría la lógica para asignar la actividad a los estudiantes
    toast({
      title: "Actividad asignada",
      description: "La actividad ha sido asignada correctamente a los estudiantes seleccionados",
    })
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://murales-colaborativos.vercel.app/actividad/${muralId}`)
    toast({
      title: "Enlace copiado",
      description: "El enlace de la actividad ha sido copiado al portapapeles",
    })
  }

  const handleExportActivity = () => {
    // Aquí iría la lógica para exportar la actividad
    toast({
      title: "Actividad exportada",
      description: "La actividad ha sido exportada correctamente",
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
          Gestión de Actividad Educativa
        </CardTitle>
        <CardDescription>Configura y gestiona este mural como una actividad para tu clase</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="configure" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              Configurar
            </TabsTrigger>
            <TabsTrigger value="share" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
              Compartir
            </TabsTrigger>
            <TabsTrigger value="monitor" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
              Monitorear
            </TabsTrigger>
          </TabsList>

          <TabsContent value="configure" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título de la actividad</Label>
                <Input
                  id="title"
                  name="title"
                  value={activityData.title}
                  onChange={handleChange}
                  className="border-2 focus-visible:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo de actividad</Label>
                <Select value={activityData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                  <SelectTrigger className="border-2 focus-visible:ring-blue-500">
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="group">Grupal</SelectItem>
                    <SelectItem value="collaborative">Colaborativa</SelectItem>
                    <SelectItem value="presentation">Presentación</SelectItem>
                    <SelectItem value="assessment">Evaluación</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Fecha de entrega</Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value={activityData.dueDate}
                  onChange={handleChange}
                  className="border-2 focus-visible:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duración (minutos)</Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  value={activityData.duration}
                  onChange={handleChange}
                  className="border-2 focus-visible:ring-blue-500"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={activityData.description}
                  onChange={handleChange}
                  rows={2}
                  className="border-2 focus-visible:ring-blue-500"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="instructions">Instrucciones para los estudiantes</Label>
                <Textarea
                  id="instructions"
                  name="instructions"
                  value={activityData.instructions}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Escribe instrucciones detalladas para que los estudiantes completen la actividad..."
                  className="border-2 focus-visible:ring-blue-500"
                />
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium mb-3">Configuración avanzada</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Permitir entregas tardías</p>
                    <p className="text-sm text-muted-foreground">
                      Los estudiantes pueden entregar después de la fecha límite
                    </p>
                  </div>
                  <Switch
                    checked={activityData.allowLateSubmissions}
                    onCheckedChange={(checked) => handleToggleChange("allowLateSubmissions", checked)}
                    className="data-[state=checked]:bg-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Requiere revisión</p>
                    <p className="text-sm text-muted-foreground">Las entregas deben ser revisadas por el profesor</p>
                  </div>
                  <Switch
                    checked={activityData.requiresReview}
                    onCheckedChange={(checked) => handleToggleChange("requiresReview", checked)}
                    className="data-[state=checked]:bg-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notificar al entregar</p>
                    <p className="text-sm text-muted-foreground">
                      Recibir notificaciones cuando los estudiantes entreguen
                    </p>
                  </div>
                  <Switch
                    checked={activityData.notifyOnSubmission}
                    onCheckedChange={(checked) => handleToggleChange("notifyOnSubmission", checked)}
                    className="data-[state=checked]:bg-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Habilitar calificación</p>
                    <p className="text-sm text-muted-foreground">Permite asignar una calificación a la actividad</p>
                  </div>
                  <Switch
                    checked={activityData.gradeEnabled}
                    onCheckedChange={(checked) => handleToggleChange("gradeEnabled", checked)}
                    className="data-[state=checked]:bg-blue-500"
                  />
                </div>

                {activityData.gradeEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="maxGrade">Calificación máxima</Label>
                    <Input
                      id="maxGrade"
                      name="maxGrade"
                      type="number"
                      value={activityData.maxGrade}
                      onChange={handleChange}
                      className="border-2 focus-visible:ring-blue-500"
                    />
                  </div>
                )}

                {activityData.type === "group" || activityData.type === "collaborative" ? (
                  <div className="space-y-2">
                    <Label htmlFor="maxParticipants">Máximo de participantes por grupo</Label>
                    <Input
                      id="maxParticipants"
                      name="maxParticipants"
                      type="number"
                      value={activityData.maxParticipants}
                      onChange={handleChange}
                      className="border-2 focus-visible:ring-blue-500"
                    />
                  </div>
                ) : null}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                onClick={handleSaveActivity}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                Guardar configuración
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="share" className="space-y-6 mt-4">
            <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="bg-purple-100 p-2 rounded-full">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-purple-800">Actividad configurada correctamente</h3>
                  <p className="text-sm text-purple-700 mt-1">
                    Tu actividad "{activityData.title}" está lista para ser compartida con tus estudiantes.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Enlace de la actividad</h3>
              <div className="flex gap-2">
                <div className="flex-1 bg-gray-100 p-2 rounded-md text-sm text-gray-600 truncate">
                  https://murales-colaborativos.vercel.app/actividad/{muralId}
                </div>
                <Button variant="outline" size="sm" onClick={handleCopyLink}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Compartir con estudiantes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studentEmails">Correos electrónicos</Label>
                  <Textarea
                    id="studentEmails"
                    placeholder="Ingresa los correos separados por comas o líneas"
                    rows={3}
                    className="border-2 focus-visible:ring-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shareMessage">Mensaje (opcional)</Label>
                  <Textarea
                    id="shareMessage"
                    placeholder="Añade un mensaje personalizado para tus estudiantes"
                    rows={3}
                    className="border-2 focus-visible:ring-purple-500"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleAssignActivity} className="bg-purple-600 hover:bg-purple-700">
                  <Send className="h-4 w-4 mr-2" />
                  Asignar actividad
                </Button>
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium">Opciones adicionales</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button variant="outline" className="w-full justify-start" onClick={handleExportActivity}>
                  <Download className="h-4 w-4 mr-2 text-green-600" />
                  Exportar actividad
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                  Programar recordatorio
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <LinkIcon className="h-4 w-4 mr-2 text-amber-600" />
                  Integrar con LMS
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Share2 className="h-4 w-4 mr-2 text-purple-600" />
                  Compartir con otros profesores
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="monitor" className="space-y-6 mt-4">
            <div className="bg-green-50 border border-green-100 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <AlertCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-green-800">Monitoreo de actividad</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Aquí podrás ver el progreso de tus estudiantes en tiempo real y gestionar las entregas.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Progreso de la actividad</h3>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                  <Clock className="h-3 w-3 mr-1" />
                  En progreso
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Estudiantes asignados: 30</span>
                  <span>Entregas: 12/30</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-green-600 h-2.5 rounded-full" style={{ width: "40%" }}></div>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 font-medium text-sm">Actividad reciente</div>
                <div className="divide-y">
                  {[
                    { name: "Ana García", action: "entregó la actividad", time: "hace 5 minutos" },
                    { name: "Carlos López", action: "comenzó la actividad", time: "hace 15 minutos" },
                    { name: "María Rodríguez", action: "entregó la actividad", time: "hace 30 minutos" },
                    { name: "Juan Pérez", action: "solicitó ayuda", time: "hace 45 minutos" },
                  ].map((item, i) => (
                    <div key={i} className="px-4 py-3 flex justify-between items-center">
                      <div>
                        <span className="font-medium">{item.name}</span>{" "}
                        <span className="text-gray-600">{item.action}</span>
                      </div>
                      <span className="text-xs text-gray-500">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium">Acciones</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2 text-blue-600" />
                  Ver entregas
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2 text-purple-600" />
                  Gestionar grupos
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="h-4 w-4 mr-2 text-amber-600" />
                  Extender plazo
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Send className="h-4 w-4 mr-2 text-green-600" />
                  Enviar recordatorio
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
