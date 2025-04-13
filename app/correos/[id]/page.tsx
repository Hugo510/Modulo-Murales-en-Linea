"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Mail,
  Users,
  Calendar,
  Send,
  Eye,
  Edit,
  AlertCircle,
  CheckCircle2,
  Loader2,
  BarChart3,
} from "lucide-react"
import { getEmailCampaignWithStats, sendEmailCampaignNow } from "@/services/email-service"
import type { EmailCampaign } from "@/types/email"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

export default function CampanaDetailPage() {
  const router = useRouter()
  const params = useParams()
  const campaignId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [campaign, setCampaign] = useState<(EmailCampaign & { email_groups: { name: string } }) | null>(null)
  const [stats, setStats] = useState<{ status: string; count: number }[]>([])
  const [activeTab, setActiveTab] = useState("detalles")

  useEffect(() => {
    const loadCampaign = async () => {
      try {
        const { campaign, stats } = await getEmailCampaignWithStats(campaignId)
        setCampaign(campaign)
        setStats(stats)
      } catch (error) {
        console.error("Error al cargar campaña:", error)
        setError("No se pudo cargar la información de la campaña")
      } finally {
        setIsLoading(false)
      }
    }

    loadCampaign()
  }, [campaignId])

  const handleSendNow = async () => {
    setIsSending(true)
    setError("")
    setSuccess("")

    try {
      await sendEmailCampaignNow(campaignId)
      setSuccess("Campaña enviada correctamente")

      // Recargar los datos
      const { campaign, stats } = await getEmailCampaignWithStats(campaignId)
      setCampaign(campaign)
      setStats(stats)
    } catch (error) {
      console.error("Error al enviar campaña:", error)
      setError("No se pudo enviar la campaña")
    } finally {
      setIsSending(false)
    }
  }

  const getStatusBadge = (status: EmailCampaign["status"]) => {
    switch (status) {
      case "draft":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            Borrador
          </Badge>
        )
      case "scheduled":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Programado
          </Badge>
        )
      case "sending":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800">
            Enviando
          </Badge>
        )
      case "sent":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Enviado
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Fallido
          </Badge>
        )
      default:
        return null
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return `Hace ${formatDistanceToNow(new Date(dateString), { locale: es })}`
  }

  const calculateStats = () => {
    const total = stats.reduce((acc, stat) => acc + stat.count, 0) || 1
    const sent = stats.find((s) => s.status === "sent")?.count || 0
    const opened = stats.find((s) => s.status === "opened")?.count || 0
    const clicked = stats.find((s) => s.status === "clicked")?.count || 0
    const bounced = stats.find((s) => s.status === "bounced")?.count || 0
    const failed = stats.find((s) => s.status === "failed")?.count || 0

    const openRate = (opened / total) * 100
    const clickRate = (clicked / total) * 100
    const bounceRate = (bounced / total) * 100

    return {
      total,
      sent,
      opened,
      clicked,
      bounced,
      failed,
      openRate,
      clickRate,
      bounceRate,
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Cargando información de la campaña...</p>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No se encontró la campaña solicitada</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => router.push("/correos")} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a campañas
        </Button>
      </div>
    )
  }

  const campaignStats = calculateStats()

  return (
    <div className="container py-8">
      <div className="flex flex-col space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={() => router.push("/correos")} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{campaign.name}</h1>
              {getStatusBadge(campaign.status)}
            </div>
            <p className="text-muted-foreground">{campaign.subject}</p>
          </div>
          <div className="flex gap-2">
            {campaign.status === "draft" && (
              <>
                <Button variant="outline" size="sm" onClick={() => router.push(`/correos/${campaignId}/editar`)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button
                  onClick={handleSendNow}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600"
                  size="sm"
                  disabled={isSending}
                >
                  {isSending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar ahora
                    </>
                  )}
                </Button>
              </>
            )}
            {campaign.status === "scheduled" && (
              <Button
                onClick={handleSendNow}
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
                size="sm"
                disabled={isSending}
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar ahora
                  </>
                )}
              </Button>
            )}
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
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-500" />
                Estado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {campaign.status === "draft" && "Borrador"}
                {campaign.status === "scheduled" && "Programado"}
                {campaign.status === "sending" && "Enviando"}
                {campaign.status === "sent" && "Enviado"}
                {campaign.status === "failed" && "Fallido"}
              </div>
              <p className="text-sm text-muted-foreground">
                {campaign.status === "draft" && "Esta campaña aún no ha sido enviada"}
                {campaign.status === "scheduled" &&
                  `Programado para ${new Date(campaign.scheduled_for!).toLocaleString()}`}
                {campaign.status === "sending" && "La campaña se está enviando en este momento"}
                {campaign.status === "sent" && `Enviado ${formatDate(campaign.sent_at)}`}
                {campaign.status === "failed" && "La campaña no pudo ser enviada"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-4 w-4 text-green-500" />
                Destinatarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaignStats.total}</div>
              <p className="text-sm text-muted-foreground">Grupo: {campaign.email_groups.name}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-purple-500" />
                Rendimiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {campaign.status === "sent" ? `${campaignStats.openRate.toFixed(1)}%` : "—"}
              </div>
              <p className="text-sm text-muted-foreground">
                {campaign.status === "sent"
                  ? `Tasa de apertura (${campaignStats.opened} aperturas)`
                  : "Disponible después del envío"}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="detalles">Detalles</TabsTrigger>
            <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
            <TabsTrigger value="contenido">Contenido</TabsTrigger>
          </TabsList>

          <TabsContent value="detalles">
            <Card>
              <CardHeader>
                <CardTitle>Detalles de la campaña</CardTitle>
                <CardDescription>Información detallada sobre esta campaña</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium">Nombre de la campaña</h3>
                    <p>{campaign.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Asunto</h3>
                    <p>{campaign.subject}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Grupo de destinatarios</h3>
                    <p>
                      {campaign.email_groups.name} ({campaignStats.total} destinatarios)
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Creado por</h3>
                    <p>Usuario ID: {campaign.created_by}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Fecha de creación</h3>
                    <p>{new Date(campaign.created_at).toLocaleString()}</p>
                  </div>
                  {campaign.status === "scheduled" && campaign.scheduled_for && (
                    <div>
                      <h3 className="text-sm font-medium">Programado para</h3>
                      <p>{new Date(campaign.scheduled_for).toLocaleString()}</p>
                    </div>
                  )}
                  {campaign.status === "sent" && campaign.sent_at && (
                    <div>
                      <h3 className="text-sm font-medium">Enviado el</h3>
                      <p>{new Date(campaign.sent_at).toLocaleString()}</p>
                    </div>
                  )}
                </div>

                {campaign.status === "draft" && (
                  <Alert className="bg-blue-50 border-blue-200 mt-4">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-600">
                      Esta campaña está en modo borrador. Puedes editarla o enviarla cuando estés listo.
                    </AlertDescription>
                  </Alert>
                )}

                {campaign.status === "scheduled" && (
                  <Alert className="bg-blue-50 border-blue-200 mt-4">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-600">
                      Esta campaña está programada para enviarse el {new Date(campaign.scheduled_for!).toLocaleString()}
                      . Puedes enviarla ahora si lo deseas.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="estadisticas">
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas de la campaña</CardTitle>
                <CardDescription>Rendimiento y métricas de esta campaña</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {campaign.status === "sent" ? (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Enviados</p>
                        <p className="text-2xl font-bold">{campaignStats.sent}</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Abiertos</p>

                        <p className="text-2xl font-bold">
                          {campaignStats.opened}{" "}
                          <span className="text-sm font-normal text-muted-foreground">
                            ({campaignStats.openRate.toFixed(1)}%)
                          </span>
                        </p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Clics</p>
                        <p className="text-2xl font-bold">
                          {campaignStats.clicked}{" "}
                          <span className="text-sm font-normal text-muted-foreground">
                            ({campaignStats.clickRate.toFixed(1)}%)
                          </span>
                        </p>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Rebotes</p>
                        <p className="text-2xl font-bold">
                          {campaignStats.bounced}{" "}
                          <span className="text-sm font-normal text-muted-foreground">
                            ({campaignStats.bounceRate.toFixed(1)}%)
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Tasa de apertura</span>
                          <span className="text-sm font-medium">{campaignStats.openRate.toFixed(1)}%</span>
                        </div>
                        <Progress value={campaignStats.openRate} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Tasa de clics</span>
                          <span className="text-sm font-medium">{campaignStats.clickRate.toFixed(1)}%</span>
                        </div>
                        <Progress value={campaignStats.clickRate} className="h-2" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium text-center mb-1">Estadísticas no disponibles</p>
                    <p className="text-sm text-muted-foreground text-center">
                      Las estadísticas estarán disponibles después de que la campaña sea enviada
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contenido">
            <Card>
              <CardHeader>
                <CardTitle>Contenido del correo</CardTitle>
                <CardDescription>Vista previa del contenido que se enviará</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Asunto</h3>
                  <p className="bg-gray-50 p-3 rounded-md">{campaign.subject}</p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Contenido</h3>
                  <div className="border rounded-md p-4 min-h-[200px] whitespace-pre-wrap">{campaign.content}</div>
                </div>

                <div className="flex justify-end">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Vista previa completa
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
