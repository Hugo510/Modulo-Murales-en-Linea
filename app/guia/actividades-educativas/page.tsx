"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  BookOpen,
  Search,
  ArrowRight,
  CheckCircle,
  Users,
  Lightbulb,
  MessageSquare,
  FileText,
  Calendar,
  Award,
  Download,
} from "lucide-react"
import { EducationalTemplates } from "@/components/educational-templates"

export default function ActividadesEducativasPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("ideas")

  const activityIdeas = [
    {
      title: "Debate estructurado",
      description: "Organiza debates con argumentos a favor y en contra sobre temas curriculares",
      tags: ["debate", "argumentación", "pensamiento crítico"],
      level: "Todos los niveles",
      time: "30-45 minutos",
      icon: <MessageSquare className="h-8 w-8 text-blue-500" />,
    },
    {
      title: "Lluvia de ideas colaborativa",
      description: "Genera ideas en grupo para resolver problemas o iniciar proyectos",
      tags: ["creatividad", "colaboración", "resolución de problemas"],
      level: "Todos los niveles",
      time: "15-30 minutos",
      icon: <Lightbulb className="h-8 w-8 text-amber-500" />,
    },
    {
      title: "Mapa conceptual interactivo",
      description: "Crea mapas conceptuales para visualizar relaciones entre ideas y conceptos",
      tags: ["organización", "conceptos", "visual"],
      level: "Primaria, Secundaria, Universidad",
      time: "20-40 minutos",
      icon: <BookOpen className="h-8 w-8 text-green-500" />,
    },
    {
      title: "Presentación visual colaborativa",
      description: "Crea presentaciones visuales en grupo para exponer temas",
      tags: ["presentación", "visual", "exposición"],
      level: "Secundaria, Universidad",
      time: "45-60 minutos",
      icon: <FileText className="h-8 w-8 text-purple-500" />,
    },
    {
      title: "Línea de tiempo interactiva",
      description: "Organiza eventos cronológicamente para historia o planificación",
      tags: ["cronología", "historia", "planificación"],
      level: "Primaria, Secundaria",
      time: "30-45 minutos",
      icon: <Calendar className="h-8 w-8 text-red-500" />,
    },
    {
      title: "Gestión de proyectos grupales",
      description: "Organiza tareas, plazos y recursos para proyectos grupales",
      tags: ["proyectos", "organización", "tareas"],
      level: "Secundaria, Universidad",
      time: "Variable",
      icon: <CheckCircle className="h-8 w-8 text-emerald-500" />,
    },
    {
      title: "Evaluación entre pares",
      description: "Los estudiantes evalúan y comentan el trabajo de sus compañeros",
      tags: ["evaluación", "retroalimentación", "colaboración"],
      level: "Secundaria, Universidad",
      time: "30-45 minutos",
      icon: <Award className="h-8 w-8 text-orange-500" />,
    },
    {
      title: "Tablero de investigación",
      description: "Recopila y organiza información de diferentes fuentes para investigaciones",
      tags: ["investigación", "organización", "fuentes"],
      level: "Secundaria, Universidad",
      time: "Variable",
      icon: <BookOpen className="h-8 w-8 text-indigo-500" />,
    },
  ]

  const filteredActivities = activityIdeas.filter(
    (activity) =>
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center text-center mb-8">
          <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200">Guía Educativa</Badge>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 mb-4">
            Integrando Murales en Actividades de Clase
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Descubre cómo utilizar los murales colaborativos para enriquecer tus clases, fomentar la participación y
            desarrollar habilidades del siglo XXI.
          </p>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar ideas de actividades..."
            className="pl-10 py-6 border-2 focus-visible:ring-purple-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ideas" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              Ideas de Actividades
            </TabsTrigger>
            <TabsTrigger
              value="templates"
              className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700"
            >
              Plantillas Educativas
            </TabsTrigger>
            <TabsTrigger value="guides" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
              Guías Paso a Paso
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ideas" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredActivities.length > 0 ? (
                filteredActivities.map((activity, index) => (
                  <Card key={index} className="overflow-hidden transition-all hover:shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        {activity.icon}
                        <div className="flex gap-1">
                          {activity.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="bg-gray-100 text-gray-700">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <CardTitle className="mt-2">{activity.title}</CardTitle>
                      <CardDescription>{activity.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-blue-500" />
                          <span>{activity.level}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-purple-500" />
                          <span>{activity.time}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="ghost" className="w-full justify-between">
                        Ver detalles
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-2 text-center py-12">
                  <div className="mb-4">
                    <svg
                      className="mx-auto h-12 w-12 text-muted-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium">No se encontraron actividades</h3>
                  <p className="mt-2 text-muted-foreground">
                    No hay actividades que coincidan con tu búsqueda. Intenta con otros términos.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
            <div className="bg-purple-50 border border-purple-100 rounded-lg p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="bg-purple-100 p-3 rounded-full">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-purple-800 text-lg">Plantillas listas para usar</h3>
                  <p className="text-purple-700 mt-1">
                    Estas plantillas están diseñadas específicamente para actividades educativas. Selecciona una para
                    crear un nuevo mural con la estructura predefinida.
                  </p>
                </div>
              </div>
            </div>

            <EducationalTemplates />
          </TabsContent>

          <TabsContent value="guides" className="mt-6">
            <div className="bg-green-50 border border-green-100 rounded-lg p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="bg-green-100 p-3 rounded-full">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-green-800 text-lg">Guías paso a paso</h3>
                  <p className="text-green-700 mt-1">
                    Aprende a implementar diferentes actividades educativas con murales colaborativos siguiendo estas
                    guías detalladas.
                  </p>
                </div>
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                    <span>Cómo organizar un debate con murales</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pl-8">
                    <p>
                      Los murales son perfectos para estructurar debates, permitiendo organizar argumentos a favor y en
                      contra, evidencias y conclusiones.
                    </p>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Crea un nuevo mural usando la plantilla de "Debate y Discusión"</li>
                      <li>Define claramente el tema del debate en la sección central</li>
                      <li>Asigna grupos para argumentos a favor y en contra</li>
                      <li>Pide a los estudiantes que añadan sus argumentos en las secciones correspondientes</li>
                      <li>Utiliza la sección de comentarios para la retroalimentación</li>
                      <li>Finaliza con una sesión de conclusiones colaborativa</li>
                    </ol>
                    <div className="flex justify-between items-center pt-2">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Tiempo estimado: 45 minutos
                      </Badge>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Descargar guía completa
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>
                  <div className="flex items-center gap-3">
                    <Lightbulb className="h-5 w-5 text-amber-500" />
                    <span>Lluvia de ideas efectiva en clase</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pl-8">
                    <p>
                      La lluvia de ideas colaborativa permite a los estudiantes generar y organizar ideas de forma
                      visual, fomentando la creatividad y el pensamiento divergente.
                    </p>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Crea un mural usando la plantilla de "Lluvia de Ideas"</li>
                      <li>Establece una pregunta o problema central</li>
                      <li>Asigna un tiempo para que todos añadan ideas libremente</li>
                      <li>Organiza una sesión para agrupar ideas similares</li>
                      <li>Vota por las mejores ideas usando comentarios o reacciones</li>
                      <li>Desarrolla las ideas seleccionadas en mayor detalle</li>
                    </ol>
                    <div className="flex justify-between items-center pt-2">
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        Tiempo estimado: 30 minutos
                      </Badge>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Descargar guía completa
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-green-500" />
                    <span>Creación de mapas conceptuales interactivos</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pl-8">
                    <p>
                      Los mapas conceptuales ayudan a los estudiantes a visualizar relaciones entre conceptos y
                      organizar su conocimiento de forma estructurada.
                    </p>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Utiliza la plantilla de "Mapa Conceptual"</li>
                      <li>Coloca el concepto principal en el centro</li>
                      <li>Añade conceptos relacionados alrededor</li>
                      <li>Establece conexiones entre conceptos</li>
                      <li>Añade ejemplos y detalles para cada concepto</li>
                      <li>Revisa y refina el mapa en grupo</li>
                    </ol>
                    <div className="flex justify-between items-center pt-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Tiempo estimado: 40 minutos
                      </Badge>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Descargar guía completa
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-purple-500" />
                    <span>Presentaciones visuales colaborativas</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pl-8">
                    <p>
                      Crea presentaciones visuales en grupo que pueden ser presentadas directamente desde la plataforma
                      o exportadas a otros formatos.
                    </p>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Selecciona la plantilla de "Presentación Visual"</li>
                      <li>Organiza el contenido en secciones lógicas</li>
                      <li>Asigna diferentes secciones a grupos de estudiantes</li>
                      <li>Añade elementos visuales, enlaces y archivos</li>
                      <li>Revisa y edita colaborativamente</li>
                      <li>Presenta usando el modo presentación o exporta</li>
                    </ol>
                    <div className="flex justify-between items-center pt-2">
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        Tiempo estimado: 60 minutos
                      </Badge>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Descargar guía completa
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                    <span>Gestión de proyectos grupales</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pl-8">
                    <p>
                      Organiza proyectos grupales con tareas, plazos y recursos, facilitando la colaboración y el
                      seguimiento del progreso.
                    </p>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Usa la plantilla de "Gestión de Proyectos"</li>
                      <li>Define el objetivo y alcance del proyecto</li>
                      <li>Crea listas de tareas pendientes, en progreso y completadas</li>
                      <li>Asigna responsabilidades a los miembros del equipo</li>
                      <li>Establece plazos y recursos necesarios</li>
                      <li>Actualiza el progreso regularmente</li>
                    </ol>
                    <div className="flex justify-between items-center pt-2">
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        Tiempo estimado: Variable
                      </Badge>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Descargar guía completa
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
        </Tabs>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 p-8 mt-12">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
              ¿Necesitas ayuda para implementar estas actividades?
            </h2>
            <p className="text-muted-foreground mb-6">
              Nuestro equipo puede ayudarte a diseñar actividades personalizadas para tus necesidades educativas
              específicas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                Solicitar asesoría
              </Button>
              <Link href="/guia">
                <Button variant="outline">Ver más recursos</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Clock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}
