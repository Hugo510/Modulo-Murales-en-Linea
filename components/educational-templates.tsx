"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, MessageSquare, Lightbulb, CheckSquare, Calendar, FileText, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { createMural } from "@/services/mural-service"
import { toast } from "@/components/ui/use-toast"

interface TemplateProps {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  tags: string[]
  background: string
  layout: "grid" | "masonry"
  itemStyle: {
    borderStyle: string
    borderColor: string
    backgroundColor: string
    textColor: string
    shadowStyle: string
    borderRadius: number
    fontStyle: string
    fontSize: string
  }
  items: any[]
}

export function EducationalTemplates() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState<string | null>(null)

  const templates: TemplateProps[] = [
    {
      id: "debate",
      title: "Debate y Discusión",
      description: "Organiza debates estructurados con argumentos a favor y en contra",
      icon: <MessageSquare className="h-8 w-8 text-blue-500" />,
      tags: ["debate", "argumentación", "pensamiento crítico"],
      background: "bg-gradient-to-br from-blue-50 to-indigo-100",
      layout: "grid",
      itemStyle: {
        borderStyle: "border-2",
        borderColor: "#93c5fd",
        backgroundColor: "#ffffff",
        textColor: "#1e40af",
        shadowStyle: "shadow-md",
        borderRadius: 8,
        fontStyle: "font-sans",
        fontSize: "text-base",
      },
      items: [
        {
          type: "text",
          title: "Tema del debate",
          content: "Escribe aquí el tema principal del debate",
          position: { x: 400, y: 50 },
          color: "bg-blue-100",
        },
        {
          type: "text",
          title: "Argumentos a favor",
          content: "Añade aquí los argumentos a favor",
          position: { x: 200, y: 200 },
          color: "bg-green-100",
        },
        {
          type: "text",
          title: "Argumentos en contra",
          content: "Añade aquí los argumentos en contra",
          position: { x: 600, y: 200 },
          color: "bg-red-100",
        },
        {
          type: "text",
          title: "Conclusiones",
          content: "Escribe aquí las conclusiones del debate",
          position: { x: 400, y: 400 },
          color: "bg-purple-100",
        },
      ],
    },
    {
      id: "brainstorming",
      title: "Lluvia de Ideas",
      description: "Genera y organiza ideas creativas en grupo",
      icon: <Lightbulb className="h-8 w-8 text-amber-500" />,
      tags: ["creatividad", "colaboración", "ideas"],
      background: "bg-gradient-to-br from-amber-50 to-yellow-100",
      layout: "masonry",
      itemStyle: {
        borderStyle: "border",
        borderColor: "#fcd34d",
        backgroundColor: "#ffffff",
        textColor: "#92400e",
        shadowStyle: "shadow-lg",
        borderRadius: 12,
        fontStyle: "font-sans",
        fontSize: "text-base",
      },
      items: [
        {
          type: "text",
          title: "Tema central",
          content: "Escribe aquí el tema para la lluvia de ideas",
          position: { x: 400, y: 50 },
          color: "bg-amber-100",
        },
        {
          type: "text",
          title: "Ideas",
          content: "Añade aquí nuevas ideas",
          position: { x: 200, y: 200 },
          color: "bg-amber-50",
        },
        {
          type: "text",
          title: "Categoría 1",
          content: "Agrupa ideas relacionadas",
          position: { x: 600, y: 200 },
          color: "bg-amber-50",
        },
        {
          type: "text",
          title: "Categoría 2",
          content: "Agrupa ideas relacionadas",
          position: { x: 400, y: 350 },
          color: "bg-amber-50",
        },
      ],
    },
    {
      id: "project",
      title: "Gestión de Proyectos",
      description: "Organiza tareas, plazos y recursos para proyectos grupales",
      icon: <CheckSquare className="h-8 w-8 text-green-500" />,
      tags: ["proyectos", "organización", "tareas"],
      background: "bg-gradient-to-br from-green-50 to-emerald-100",
      layout: "grid",
      itemStyle: {
        borderStyle: "border-2",
        borderColor: "#6ee7b7",
        backgroundColor: "#ffffff",
        textColor: "#065f46",
        shadowStyle: "shadow-md",
        borderRadius: 6,
        fontStyle: "font-sans",
        fontSize: "text-base",
      },
      items: [
        {
          type: "text",
          title: "Título del Proyecto",
          content: "Escribe aquí el título del proyecto",
          position: { x: 400, y: 50 },
          color: "bg-emerald-100",
        },
        {
          type: "text",
          title: "Objetivos",
          content: "Define los objetivos del proyecto",
          position: { x: 200, y: 150 },
          color: "bg-green-50",
        },
        {
          type: "text",
          title: "Tareas pendientes",
          content: "Lista de tareas por hacer",
          position: { x: 200, y: 300 },
          color: "bg-yellow-50",
        },
        {
          type: "text",
          title: "Tareas en progreso",
          content: "Tareas que se están realizando",
          position: { x: 400, y: 300 },
          color: "bg-blue-50",
        },
        {
          type: "text",
          title: "Tareas completadas",
          content: "Tareas finalizadas",
          position: { x: 600, y: 300 },
          color: "bg-green-50",
        },
        {
          type: "text",
          title: "Recursos",
          content: "Lista de recursos necesarios",
          position: { x: 600, y: 150 },
          color: "bg-purple-50",
        },
      ],
    },
    {
      id: "presentation",
      title: "Presentación Visual",
      description: "Crea presentaciones visuales interactivas",
      icon: <FileText className="h-8 w-8 text-purple-500" />,
      tags: ["presentación", "visual", "exposición"],
      background: "bg-gradient-to-br from-purple-50 to-fuchsia-100",
      layout: "grid",
      itemStyle: {
        borderStyle: "border",
        borderColor: "#d8b4fe",
        backgroundColor: "#ffffff",
        textColor: "#6b21a8",
        shadowStyle: "shadow-xl",
        borderRadius: 10,
        fontStyle: "font-serif",
        fontSize: "text-lg",
      },
      items: [
        {
          type: "text",
          title: "Título de la Presentación",
          content: "Escribe aquí el título principal",
          position: { x: 400, y: 50 },
          color: "bg-purple-100",
        },
        {
          type: "text",
          title: "Sección 1",
          content: "Contenido de la primera sección",
          position: { x: 200, y: 200 },
          color: "bg-purple-50",
        },
        {
          type: "text",
          title: "Sección 2",
          content: "Contenido de la segunda sección",
          position: { x: 600, y: 200 },
          color: "bg-purple-50",
        },
        {
          type: "text",
          title: "Conclusión",
          content: "Resumen y conclusiones",
          position: { x: 400, y: 350 },
          color: "bg-purple-50",
        },
      ],
    },
    {
      id: "timeline",
      title: "Línea de Tiempo",
      description: "Organiza eventos cronológicamente para historia o planificación",
      icon: <Calendar className="h-8 w-8 text-red-500" />,
      tags: ["cronología", "historia", "planificación"],
      background: "bg-gradient-to-br from-red-50 to-rose-100",
      layout: "grid",
      itemStyle: {
        borderStyle: "border",
        borderColor: "#fda4af",
        backgroundColor: "#ffffff",
        textColor: "#9f1239",
        shadowStyle: "shadow-md",
        borderRadius: 8,
        fontStyle: "font-sans",
        fontSize: "text-base",
      },
      items: [
        {
          type: "text",
          title: "Título de la Línea de Tiempo",
          content: "Escribe aquí el tema de la línea de tiempo",
          position: { x: 400, y: 50 },
          color: "bg-red-100",
        },
        {
          type: "text",
          title: "Evento 1",
          content: "Descripción del primer evento",
          position: { x: 200, y: 200 },
          color: "bg-red-50",
        },
        {
          type: "text",
          title: "Evento 2",
          content: "Descripción del segundo evento",
          position: { x: 400, y: 200 },
          color: "bg-red-50",
        },
        {
          type: "text",
          title: "Evento 3",
          content: "Descripción del tercer evento",
          position: { x: 600, y: 200 },
          color: "bg-red-50",
        },
      ],
    },
    {
      id: "concept-map",
      title: "Mapa Conceptual",
      description: "Visualiza relaciones entre conceptos e ideas",
      icon: <BookOpen className="h-8 w-8 text-cyan-500" />,
      tags: ["conceptos", "relaciones", "aprendizaje"],
      background: "bg-gradient-to-br from-cyan-50 to-sky-100",
      layout: "masonry",
      itemStyle: {
        borderStyle: "border-2",
        borderColor: "#67e8f9",
        backgroundColor: "#ffffff",
        textColor: "#0e7490",
        shadowStyle: "shadow-md",
        borderRadius: 8,
        fontStyle: "font-sans",
        fontSize: "text-base",
      },
      items: [
        {
          type: "text",
          title: "Concepto Central",
          content: "Escribe aquí el concepto principal",
          position: { x: 400, y: 50 },
          color: "bg-cyan-100",
        },
        {
          type: "text",
          title: "Concepto Relacionado 1",
          content: "Descripción del concepto",
          position: { x: 200, y: 200 },
          color: "bg-cyan-50",
        },
        {
          type: "text",
          title: "Concepto Relacionado 2",
          content: "Descripción del concepto",
          position: { x: 600, y: 200 },
          color: "bg-cyan-50",
        },
        {
          type: "text",
          title: "Concepto Relacionado 3",
          content: "Descripción del concepto",
          position: { x: 400, y: 350 },
          color: "bg-cyan-50",
        },
      ],
    },
  ]

  const handleCreateFromTemplate = async (template: TemplateProps) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para crear un mural",
        variant: "destructive",
      })
      return
    }

    setLoading(template.id)
    try {
      const newMural = await createMural(
        {
          title: `${template.title} - Nuevo`,
          description: `Mural creado a partir de la plantilla "${template.title}"`,
          category: "education",
          isPublic: true,
          allowComments: true,
          allowEditing: true,
          background: template.background,
          layout: template.layout,
          itemStyle: template.itemStyle,
          items: template.items,
        },
        user.id,
      )

      if (newMural) {
        toast({
          title: "Mural creado",
          description: `Tu nuevo mural de ${template.title} ha sido creado correctamente`,
        })
        router.push(`/murales/${newMural.id}`)
      } else {
        throw new Error("No se pudo crear el mural")
      }
    } catch (error) {
      console.error("Error al crear mural desde plantilla:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al crear el mural",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <Card key={template.id} className="overflow-hidden transition-all hover:shadow-md">
          <CardHeader className={`${template.background} pb-4`}>
            <div className="flex justify-between items-start">
              {template.icon}
              <div className="flex gap-1">
                {template.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-white/80 text-gray-700">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <CardTitle className="mt-2">{template.title}</CardTitle>
            <CardDescription className="text-gray-700">{template.description}</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground mb-2">Incluye:</div>
            <ul className="text-sm space-y-1">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                <span>{template.items.length} elementos predefinidos</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                <span>Estructura optimizada para {template.title.toLowerCase()}</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                <span>Diseño visual personalizado</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => handleCreateFromTemplate(template)} disabled={loading !== null}>
              {loading === template.id ? (
                <div className="flex items-center">
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Creando...
                </div>
              ) : (
                <>
                  Usar plantilla
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
