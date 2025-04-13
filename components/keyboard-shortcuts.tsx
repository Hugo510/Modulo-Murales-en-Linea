"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Keyboard, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface ShortcutGroup {
  title: string
  shortcuts: {
    keys: string[]
    description: string
  }[]
}

export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false)
  const [shortcutsEnabled, setShortcutsEnabled] = useState(true)

  // Definir grupos de atajos de teclado
  const shortcutGroups: ShortcutGroup[] = [
    {
      title: "Navegación",
      shortcuts: [
        { keys: ["g", "h"], description: "Ir al inicio" },
        { keys: ["g", "m"], description: "Ir a mis murales" },
        { keys: ["g", "e"], description: "Ir a explorar" },
        { keys: ["g", "p"], description: "Ir a perfil" },
        { keys: ["g", "c"], description: "Ir a configuración" },
        { keys: ["g", "n"], description: "Crear nuevo mural" },
        { keys: ["Esc"], description: "Cerrar diálogos" },
      ],
    },
    {
      title: "Edición de murales",
      shortcuts: [
        { keys: ["Ctrl", "s"], description: "Guar dar cambios" },
        { keys: ["Ctrl", "z"], description: "Deshacer" },
        { keys: ["Ctrl", "Shift", "z"], description: "Rehacer" },
        { keys: ["n"], description: "Añadir nuevo elemento" },
        { keys: ["Delete"], description: "Eliminar elemento seleccionado" },
        { keys: ["Ctrl", "+"], description: "Aumentar zoom" },
        { keys: ["Ctrl", "-"], description: "Reducir zoom" },
        { keys: ["Ctrl", "0"], description: "Restablecer zoom" },
      ],
    },
    {
      title: "Elementos",
      shortcuts: [
        { keys: ["t"], description: "Añadir texto" },
        { keys: ["i"], description: "Añadir imagen" },
        { keys: ["l"], description: "Añadir enlace" },
        { keys: ["v"], description: "Añadir video" },
        { keys: ["f"], description: "Añadir archivo" },
        { keys: ["Arrow keys"], description: "Mover elemento seleccionado" },
        { keys: ["Shift", "Arrow keys"], description: "Mover elemento con precisión" },
      ],
    },
    {
      title: "Colaboración",
      shortcuts: [
        { keys: ["c"], description: "Mostrar/ocultar comentarios" },
        { keys: ["u"], description: "Mostrar/ocultar usuarios" },
        { keys: ["s"], description: "Compartir mural" },
        { keys: ["p"], description: "Iniciar presentación" },
        { keys: ["Esc"], description: "Salir de presentación" },
      ],
    },
    {
      title: "Accesibilidad",
      shortcuts: [
        { keys: ["Alt", "a"], description: "Abrir opciones de accesibilidad" },
        { keys: ["Alt", "h"], description: "Abrir ayuda contextual" },
        { keys: ["Alt", "k"], description: "Mostrar atajos de teclado" },
        { keys: ["Alt", "m"], description: "Alternar menú" },
        { keys: ["Tab"], description: "Navegar entre elementos" },
        { keys: ["Shift", "Tab"], description: "Navegar hacia atrás" },
      ],
    },
  ]

  // Manejar atajos de teclado globales
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!shortcutsEnabled) return

      // Mostrar/ocultar diálogo de atajos con Alt+K
      if (e.altKey && e.key === "k") {
        e.preventDefault()
        setIsOpen(!isOpen)
        return
      }

      // Si el diálogo está abierto, cerrar con Escape
      if (isOpen && e.key === "Escape") {
        e.preventDefault()
        setIsOpen(false)
        return
      }

      // Otros atajos globales aquí...
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, shortcutsEnabled])

  // Renderizar tecla individual
  const renderKey = (key: string) => (
    <kbd
      key={key}
      className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md shadow-sm"
    >
      {key}
    </kbd>
  )

  return (
    <>
      <Button variant="outline" size="sm" className="fixed bottom-4 left-4 z-40" onClick={() => setIsOpen(true)}>
        <Keyboard className="h-4 w-4 mr-2" />
        Atajos de teclado
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-semibold flex items-center">
                  <Keyboard className="h-5 w-5 mr-2" />
                  Atajos de teclado
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="p-4 overflow-y-auto max-h-[calc(80vh-8rem)]">
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="enable-shortcuts"
                    checked={shortcutsEnabled}
                    onChange={(e) => setShortcutsEnabled(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="enable-shortcuts" className="text-sm">
                    Habilitar atajos de teclado
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {shortcutGroups.map((group) => (
                    <div key={group.title} className="space-y-3">
                      <h3 className="font-medium text-lg">{group.title}</h3>
                      <div className="space-y-2">
                        {group.shortcuts.map((shortcut, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <div className="flex gap-1">
                              {shortcut.keys.map((key, keyIndex) => (
                                <React.Fragment key={keyIndex}>
                                  {renderKey(key)}
                                  {keyIndex < shortcut.keys.length - 1 && <span className="mx-1">+</span>}
                                </React.Fragment>
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">{shortcut.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 border-t bg-gray-50">
                <p className="text-sm text-gray-600">
                  Presiona{" "}
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md shadow-sm">
                    Alt
                  </kbd>{" "}
                  +{" "}
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md shadow-sm">
                    K
                  </kbd>{" "}
                  en cualquier momento para mostrar esta guía.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
