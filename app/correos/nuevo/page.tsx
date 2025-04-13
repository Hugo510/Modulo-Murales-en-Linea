"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, CalendarIcon, Clock, Save, Send, AlertCircle, Loader2, FileText, Eye } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import {
  getEmailGroups,
  getEmailTemplates,
  createEmailCampaign,
  scheduleEmailCampaign,
  sendEmailCampaignNow,
} from "@/services/email-service"
import type { EmailGroup, EmailTemplate } from "@/types/email"
import { useAuth } from "@/contexts/auth-context"

export default function NuevaCampanaPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [activeTab, setActiveTab] = useState("contenido")
  const [groups, setGroups] = useState<EmailGroup[]>([])
  const [templates, setTemplates] = useState<EmailTemplate[]>([])

  // Estado del formulario
  const [name, setName] = useState("")
  const [subject, setSubject] = useState("")
  const [content, setContent] = useState("")
  const [selectedGroupId, setSelectedGroupId] = useState("")
  const [selectedTemplateId, setSelectedTemplateId] = useState("")
  const [isScheduled, setIsScheduled] = useState(false)
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined)
  const [scheduledTime, setScheduledTime] = useState("12:00")

  useEffect(() => {
    const loadData = async () => {
      try {
        const [groupsData, templatesData] = await Promise.all([getEmailGroups(), getEmailTemplates()])
        setGroups(groupsData)
        setTemplates(templatesData)
      } catch (error) {
        console.error("Error al cargar datos:", error)
        setError("No se pudieron cargar los datos necesarios")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    // Cargar contenido de la plantilla seleccionada
    if (selectedTemplateId) {
      const template = templates.find((t) => t.id === selectedTemplateId)
      if (template) {
        setSubject(template.subject)
        setContent(template.content)
      }
    }
  }, [selectedTemplateId, templates])

  const handleSaveDraft = async () => {
    if (!validateForm()) return

    setIsSaving(true)
    setError("")
    setSuccess("")

    try {
      if (!user) throw new Error("Debes iniciar sesión")

      const campaign = {
        name,
        subject,
        content,
        group_id: selectedGroupId,
        template_id: selectedTemplateId || undefined,
        created_by: user.id,
        total_recipients: 0,
        opened_count: 0,
        clicked_count: 0,
        failed_count: 0,
      }

      const result = await createEmailCampaign(campaign)
      setSuccess("Borrador guardado correctamente")

      //router.push(`/correos/${result.id}`)
      setTimeout(() => {
        router.push("/correos")
      }, 1500)
    } catch (error) {
      console.error("Error al guardar borrador:", error)
      setError("No se pudo guardar el borrador")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSendCampaign = async () => {
    if (!validateForm()) return

    setIsSending(true)
    setError("")
    setSuccess("")

    try {
      if (!user) throw new Error("Debes iniciar sesión")

      // Primero creamos la campaña
      const campaign = {
        name,
        subject,
        content,
        group_id: selectedGroupId,
        template_id: selectedTemplateId || undefined,
        created_by: user.id,
        total_recipients: 0,
        opened_count: 0,
        clicked_count: 0,
        failed_count: 0,
      }

      const result = await createEmailCampaign(campaign)

      // Si está programada, la programamos
      if (isScheduled && scheduledDate) {
        const scheduledDateTime = new Date(scheduledDate)
        const [hours, minutes] = scheduledTime.split(":").map(Number)
        scheduledDateTime.setHours(hours, minutes)

        await scheduleEmailCampaign(result.id, scheduledDateTime)
        setSuccess("Campaña programada correctamente")
      } else {
        // Si no está programada, la enviamos ahora
        await sendEmailCampaignNow(result.id)
        setSuccess("Campaña enviada correctamente")
      }

      setTimeout(() => {
        router.push("/correos")
      }, 1500)
    } catch (error) {
      console.error("Error al enviar campaña:", error)
      setError("No se pudo enviar la campaña")
    } finally {
      setIsSending(false)
    }
  }

  const validateForm = () => {
    setError("")

    if (!name.trim()) {
      setError("El nombre de la campaña es obligatorio")
      return false
    }

    if (!subject.trim()) {
      setError("El asunto del correo es obligatorio")
      return false
    }

    if (!content.trim()) {
      setError("El contenido del correo es obligatorio")
      return false
    }

    if (!selectedGroupId) {
      setError("Debes seleccionar un grupo de destinatarios")
      return false
    }

    if (isScheduled && !scheduledDate) {
      setError("Debes seleccionar una fecha para programar el envío")
      return false
    }

    return true
  }

  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={() => router.push("/correos")} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Nueva Campaña de Correo</h1>
            <p className="text-muted-foreground">Crea y envía una nueva campaña de correo a tus alumnos</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 border-green-200">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">{success}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Detalles de la campaña</CardTitle>
            <CardDescription>Configura los detalles básicos de tu campaña de correo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la campaña</Label>
              <Input
                id="name"
                placeholder="Ej: Recordatorio de entrega de proyecto"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Este nombre es solo para identificar la campaña, no será visible para los destinatarios
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="group">Grupo de destinatarios</Label>
              <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                <SelectTrigger id="group">
                  <SelectValue placeholder="Selecciona un grupo" />
                </SelectTrigger>
                <SelectContent>
                  {groups.length > 0 ? (
                    groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name} ({group.member_count} miembros)
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="empty" disabled>
                      No hay grupos disponibles
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">Selecciona el grupo al que deseas enviar este correo</p>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  onClick={() => router.push("/correos/grupos/nuevo")}
                >
                  Crear nuevo grupo
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="template">Plantilla (opcional)</Label>
              <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                <SelectTrigger id="template">
                  <SelectValue placeholder="Selecciona una plantilla" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-template">Sin plantilla</SelectItem>
                  {templates.length > 0 ? (
                    templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="empty" disabled>
                      No hay plantillas disponibles
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  Puedes usar una plantilla predefinida o crear tu propio contenido
                </p>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  onClick={() => router.push("/correos/plantillas/nueva")}
                >
                  Crear nueva plantilla
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="contenido" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Contenido
            </TabsTrigger>
            <TabsTrigger value="programacion" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Programación
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contenido">
            <Card>
              <CardHeader>
                <CardTitle>Contenido del correo</CardTitle>
                <CardDescription>Define el asunto y contenido de tu correo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Asunto del correo</Label>
                  <Input
                    id="subject"
                    placeholder="Ej: Recordatorio: Entrega de proyecto final"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Contenido del correo</Label>
                  <Textarea
                    id="content"
                    placeholder="Escribe el contenido de tu correo aquí..."
                    className="min-h-[200px]"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Puedes usar HTML básico para dar formato a tu correo</p>
                </div>

                <div className="flex justify-end">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Vista previa
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="programacion">
            <Card>
              <CardHeader>
                <CardTitle>Programación de envío</CardTitle>
                <CardDescription>Define cuándo quieres enviar esta campaña</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch id="scheduled" checked={isScheduled} onCheckedChange={setIsScheduled} />
                  <Label htmlFor="scheduled">Programar envío para más tarde</Label>
                </div>

                {isScheduled && (
                  <div className="grid gap-4 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Fecha de envío</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !scheduledDate && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {scheduledDate ? format(scheduledDate, "PPP", { locale: es }) : "Selecciona una fecha"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={scheduledDate}
                              onSelect={setScheduledDate}
                              initialFocus
                              disabled={(date) => date < new Date()}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="time">Hora de envío</Label>
                        <Select value={scheduledTime} onValueChange={setScheduledTime}>
                          <SelectTrigger id="time">
                            <SelectValue placeholder="Selecciona una hora" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 24 }).map((_, hour) => (
                              <SelectItem key={hour} value={`${hour.toString().padStart(2, "0")}:00`}>
                                {`${hour.toString().padStart(2, "0")}:00`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Alert className="bg-blue-50 border-blue-200">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-600">
                        Tu campaña se enviará automáticamente el{" "}
                        {scheduledDate ? format(scheduledDate, "PPP", { locale: es }) : "..."} a las {scheduledTime}
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving || isSending}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar borrador
              </>
            )}
          </Button>

          <Button
            onClick={handleSendCampaign}
            className="bg-gradient-to-r from-blue-600 to-indigo-600"
            disabled={isSaving || isSending}
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isScheduled ? "Programando..." : "Enviando..."}
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                {isScheduled ? "Programar envío" : "Enviar ahora"}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
