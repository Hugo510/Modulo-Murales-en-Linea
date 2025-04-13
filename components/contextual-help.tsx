"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { HelpCircle, X, ChevronRight, Search, BookOpen, Video, ExternalLink } from "lucide-react"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import Link from "next/link"

interface HelpTopic {
  id: string
  title: string
  content: string
  path?: string
  keywords: string[]
  relatedTopics?: string[]
  videoUrl?: string
  docUrl?: string
}

export function ContextualHelp() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [suggestedTopics, setSuggestedTopics] = useState<HelpTopic[]>([])
  const pathname = usePathname()

  // Base de conocimientos de ayuda
  const helpTopics: HelpTopic[] = [
    {
      id: "crear-mural",
      title: "Cómo crear un nuevo mural",
      content:
        "Para crear un nuevo mural, haz clic en el botón 'Nuevo Mural' en el menú lateral o en el dashboard. Luego, elige una plantilla o comienza desde cero, asigna un título y descripción, y personaliza las opciones según tus necesidades.",
      path: "/murales/nuevo",
      keywords: ["crear", "nuevo", "mural", "comenzar", "plantilla"],
      relatedTopics: ["compartir-mural", "personalizar-mural"],
      videoUrl: "https://example.com/videos/crear-mural",
      docUrl: "/guia/crear-murales",
    },
    {
      id: "compartir-mural",
      title: "Compartir un mural con otros usuarios",
      content:
        "Para compartir tu mural, abre el mural y haz clic en el botón 'Compartir'. Puedes invitar a otros usuarios por correo electrónico o generar un enlace. Asigna permisos específicos como editor, comentarista o visualizador según lo que necesites.",
      path: "/murales",
      keywords: ["compartir", "colaborar", "invitar", "permisos", "enlace"],
      relatedTopics: ["crear-mural", "permisos-mural"],
      docUrl: "/guia/compartir-murales",
    },
    {
      id: "personalizar-mural",
      title: "Personalizar la apariencia de un mural",
      content:
        "Puedes personalizar tu mural cambiando el fondo, los colores, y el estilo de los elementos. Abre la configuración del mural y ve a la pestaña 'Apariencia'. Allí encontrarás opciones para cambiar el fondo, aplicar plantillas prediseñadas y personalizar el estilo de los elementos.",
      path: "/murales",
      keywords: ["personalizar", "diseño", "apariencia", "fondo", "colores", "estilo"],
      relatedTopics: ["crear-mural", "plantillas-mural"],
      docUrl: "/guia/personalizar-murales",
    },
    {
      id: "colaboracion-tiempo-real",
      title: "Colaboración en tiempo real",
      content:
        "Los murales permiten la colaboración en tiempo real. Varios usuarios pueden editar simultáneamente, ver los cursores de otros usuarios y recibir notificaciones de cambios. Los elementos se bloquean automáticamente cuando alguien los está editando para evitar conflictos.",
      keywords: ["colaboración", "tiempo real", "editar", "simultáneo", "cursores"],
      relatedTopics: ["compartir-mural", "permisos-mural"],
      videoUrl: "https://example.com/videos/colaboracion",
      docUrl: "/guia/colaboracion",
    },
    {
      id: "actividades-educativas",
      title: "Crear actividades educativas",
      content:
        "Puedes convertir cualquier mural en una actividad educativa. Abre el mural y ve a la pestaña 'Actividad'. Configura el tipo de actividad, instrucciones, plazos y opciones de evaluación. Luego comparte la actividad con tus estudiantes.",
      path: "/murales",
      keywords: ["educación", "actividad", "clase", "enseñanza", "estudiantes"],
      relatedTopics: ["plantillas-mural", "compartir-mural"],
      videoUrl: "https://example.com/videos/actividades-educativas",
      docUrl: "/guia/actividades-educativas",
    },
  ]

  // Actualizar sugerencias basadas en la ruta actual
  useEffect(() => {
    if (pathname) {
      const pathSegments = pathname.split("/").filter(Boolean)

      // Sugerir temas relevantes según la ruta
      if (pathSegments[0] === "murales") {
        if (pathSegments[1] === "nuevo") {
          setSuggestedTopics(
            helpTopics.filter((topic) => topic.id === "crear-mural" || topic.path === "/murales/nuevo"),
          )
        } else if (pathSegments.length > 1) {
          // En un mural específico
          setSuggestedTopics(
            helpTopics.filter(
              (topic) =>
                topic.id === "compartir-mural" ||
                topic.id === "personalizar-mural" ||
                topic.id === "colaboracion-tiempo-real" ||
                topic.id === "actividades-educativas",
            ),
          )
        } else {
          // En la lista de murales
          setSuggestedTopics(helpTopics.filter((topic) => topic.path === "/murales"))
        }
      } else {
        // En otras páginas, mostrar temas generales
        setSuggestedTopics(helpTopics.slice(0, 3))
      }
    }
  }, [pathname])

  // Filtrar temas según la búsqueda
  const filteredTopics = searchQuery
    ? helpTopics.filter(
        (topic) =>
          topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          topic.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          topic.keywords.some((keyword) => keyword.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    : suggestedTopics

  // Obtener el tema seleccionado
  const currentTopic = selectedTopic ? helpTopics.find((topic) => topic.id === selectedTopic) : null

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-40 h-12 w-12 rounded-full shadow-lg border-2 border-primary/20 bg-white hover:bg-primary/10"
        onClick={() => setIsOpen(true)}
        aria-label="Ayuda contextual"
      >
        <HelpCircle className="h-6 w-6 text-primary" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="text-xl font-semibold">Centro de Ayuda</h2>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} aria-label="Cerrar ayuda">
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="p-4 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar ayuda..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-auto">
                  {currentTopic ? (
                    <div className="p-4">
                      <Button variant="ghost" size="sm" className="mb-4" onClick={() => setSelectedTopic(null)}>
                        <ChevronRight className="h-4 w-4 mr-1 rotate-180" />
                        Volver
                      </Button>

                      <h3 className="text-lg font-medium mb-3">{currentTopic.title}</h3>
                      <p className="text-muted-foreground mb-6">{currentTopic.content}</p>

                      <div className="space-y-4">
                        {currentTopic.videoUrl && (
                          <Link
                            href={currentTopic.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-sm text-blue-600 hover:underline"
                          >
                            <Video className="h-4 w-4 mr-2" />
                            Ver video tutorial
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Link>
                        )}

                        {currentTopic.docUrl && (
                          <Link
                            href={currentTopic.docUrl}
                            className="flex items-center text-sm text-blue-600 hover:underline"
                          >
                            <BookOpen className="h-4 w-4 mr-2" />
                            Leer documentación completa
                          </Link>
                        )}
                      </div>

                      {currentTopic.relatedTopics && currentTopic.relatedTopics.length > 0 && (
                        <div className="mt-8">
                          <h4 className="text-sm font-medium mb-2">Temas relacionados</h4>
                          <div className="space-y-1">
                            {currentTopic.relatedTopics.map((topicId) => {
                              const topic = helpTopics.find((t) => t.id === topicId)
                              if (!topic) return null
                              return (
                                <Button
                                  key={topicId}
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start text-left"
                                  onClick={() => setSelectedTopic(topicId)}
                                >
                                  {topic.title}
                                </Button>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="divide-y">
                      {searchQuery ? (
                        <div className="p-4">
                          <h3 className="text-sm font-medium mb-2">Resultados de búsqueda</h3>
                          {filteredTopics.length > 0 ? (
                            <div className="space-y-2">
                              {filteredTopics.map((topic) => (
                                <Button
                                  key={topic.id}
                                  variant="ghost"
                                  className="w-full justify-start text-left h-auto py-3"
                                  onClick={() => setSelectedTopic(topic.id)}
                                >
                                  <div>
                                    <div className="font-medium">{topic.title}</div>
                                    <div className="text-xs text-muted-foreground line-clamp-1 mt-1">
                                      {topic.content}
                                    </div>
                                  </div>
                                </Button>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <p className="text-muted-foreground">No se encontraron resultados para "{searchQuery}"</p>
                              <Button variant="link" className="mt-2" onClick={() => setSearchQuery("")}>
                                Limpiar búsqueda
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <div className="p-4">
                            <h3 className="text-sm font-medium mb-2">Sugerencias para esta página</h3>
                            <div className="space-y-2">
                              {suggestedTopics.map((topic) => (
                                <Button
                                  key={topic.id}
                                  variant="ghost"
                                  className="w-full justify-start text-left h-auto py-3"
                                  onClick={() => setSelectedTopic(topic.id)}
                                >
                                  <div>
                                    <div className="font-medium">{topic.title}</div>
                                    <div className="text-xs text-muted-foreground line-clamp-1 mt-1">
                                      {topic.content}
                                    </div>
                                  </div>
                                </Button>
                              ))}
                            </div>
                          </div>

                          <div className="p-4">
                            <h3 className="text-sm font-medium mb-2">Temas populares</h3>
                            <div className="space-y-2">
                              {helpTopics
                                .filter((topic) => !suggestedTopics.some((t) => t.id === topic.id))
                                .slice(0, 3)
                                .map((topic) => (
                                  <Button
                                    key={topic.id}
                                    variant="ghost"
                                    className="w-full justify-start text-left h-auto py-3"
                                    onClick={() => setSelectedTopic(topic.id)}
                                  >
                                    <div>
                                      <div className="font-medium">{topic.title}</div>
                                      <div className="text-xs text-muted-foreground line-clamp-1 mt-1">
                                        {topic.content}
                                      </div>
                                    </div>
                                  </Button>
                                ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-4 border-t">
                  <Link href="/guia">
                    <Button className="w-full">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Ver guía completa
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
