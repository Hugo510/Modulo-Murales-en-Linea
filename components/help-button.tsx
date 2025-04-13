"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { HelpCircle, X, BookOpen, Video, MessageSquare, ExternalLink } from "lucide-react"
import Link from "next/link"

export function HelpButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-64 bg-white rounded-lg shadow-lg border border-muted p-4 mb-2 animate-in slide-in-from-bottom-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-sm">Ayuda rápida</h3>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <Link href="/guia" className="flex items-center gap-2 p-2 hover:bg-muted rounded-md text-sm">
              <BookOpen className="h-4 w-4 text-purple-500" />
              <span>Guía de uso</span>
            </Link>
            <Link href="/guia?tab=tutoriales" className="flex items-center gap-2 p-2 hover:bg-muted rounded-md text-sm">
              <Video className="h-4 w-4 text-pink-500" />
              <span>Tutoriales en video</span>
            </Link>
            <Link href="/guia?tab=faq" className="flex items-center gap-2 p-2 hover:bg-muted rounded-md text-sm">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              <span>Preguntas frecuentes</span>
            </Link>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2 hover:bg-muted rounded-md text-sm"
            >
              <ExternalLink className="h-4 w-4 text-green-500" />
              <span>Soporte técnico</span>
            </a>
          </div>
        </div>
      )}

      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-lg"
      >
        <HelpCircle className="h-6 w-6" />
        <span className="sr-only">Ayuda</span>
      </Button>
    </div>
  )
}
