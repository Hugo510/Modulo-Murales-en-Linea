"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Mail, Users, FileText, BarChart3, Plus, Search, Calendar, Clock, CheckCircle2 } from "lucide-react"
import { getEmailCampaigns } from "@/services/email-service"
import type { EmailCampaign } from "@/types/email"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

export default function CorreosPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("campañas")
  const [isLoading, setIsLoading] = useState(true)
  const [campaigns, setCampaigns] = useState<(EmailCampaign & { email_groups: { name: string } })[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        const data = await getEmailCampaigns()
        setCampaigns(data)
      } catch (error) {
        console.error("Error al cargar campañas:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCampaigns()
  }, [])

  const filteredCampaigns = campaigns.filter(
    (campaign) =>
      campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.email_groups.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Correos Masivos</h2>
          <p className="text-muted-foreground">Envía notificaciones y recordatorios a grupos de alumnos</p>
        </div>
        <Button onClick={() => router.push("/correos/nuevo")} className="bg-gradient-to-r from-blue-600 to-indigo-600">
          <Plus className="mr-2 h-4 w-4" />
          Nueva Campaña
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="campañas" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Campañas</span>
            </TabsTrigger>
            <TabsTrigger value="grupos" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Grupos</span>
            </TabsTrigger>
            <TabsTrigger value="plantillas" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Plantillas</span>
            </TabsTrigger>
            <TabsTrigger value="estadisticas" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Estadísticas</span>
            </TabsTrigger>
          </TabsList>

          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value="campañas" className="space-y-4">
          <div className="grid gap-4">
            {isLoading ? (
              // Esqueletos de carga
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-5 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-1/4" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-1/4" />
                      </div>
                      <Skeleton className="h-9 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredCampaigns.length > 0 ? (
              filteredCampaigns.map((campaign) => (
                <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{campaign.name}</CardTitle>
                      {getStatusBadge(campaign.status)}
                    </div>
                    <CardDescription>{campaign.subject}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>Grupo: {campaign.email_groups.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {campaign.status === "scheduled" ? (
                            <>
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>Programado para: {new Date(campaign.scheduled_for!).toLocaleString()}</span>
                            </>
                          ) : campaign.status === "sent" ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                              <span>Enviado: {formatDate(campaign.sent_at)}</span>
                            </>
                          ) : (
                            <>
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>Creado: {formatDate(campaign.created_at)}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => router.push(`/correos/${campaign.id}`)}>
                        Ver detalles
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <Mail className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-center mb-1">No hay campañas</p>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    {searchQuery
                      ? "No se encontraron campañas con tu búsqueda"
                      : "Aún no has creado ninguna campaña de correo"}
                  </p>
                  <Button
                    onClick={() => router.push("/correos/nuevo")}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Crear primera campaña
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="grupos">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Grupos de destinatarios</CardTitle>
                  <CardDescription>Administra los grupos para tus campañas de correo</CardDescription>
                </div>
                <Button
                  onClick={() => router.push("/correos/grupos/nuevo")}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Grupo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">Esta sección estará disponible próximamente</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plantillas">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Plantillas de correo</CardTitle>
                  <CardDescription>Crea y gestiona plantillas para tus campañas</CardDescription>
                </div>
                <Button
                  onClick={() => router.push("/correos/plantillas/nueva")}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Plantilla
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">Esta sección estará disponible próximamente</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estadisticas">
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas de campañas</CardTitle>
              <CardDescription>Analiza el rendimiento de tus campañas de correo</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">Esta sección estará disponible próximamente</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
