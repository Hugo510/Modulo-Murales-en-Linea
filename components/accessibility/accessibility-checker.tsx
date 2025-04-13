"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertTriangle, XCircle, Info, Lightbulb } from "lucide-react"

interface AccessibilityIssue {
  id: string
  type: "error" | "warning" | "info"
  title: string
  description: string
  impact: "high" | "medium" | "low"
  wcagCriteria?: string
  suggestion: string
}

export function AccessibilityChecker({ muralId }: { muralId?: string }) {
  const [isChecking, setIsChecking] = useState(false)
  const [results, setResults] = useState<{
    score: number
    passed: number
    warnings: number
    errors: number
    issues: AccessibilityIssue[]
  } | null>(null)

  const runAccessibilityCheck = async () => {
    setIsChecking(true)

    // Simulamos una verificación de accesibilidad
    // En un entorno real, esto llamaría a una API o utilizaría una biblioteca como axe-core
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Resultados simulados
    setResults({
      score: 85,
      passed: 18,
      warnings: 3,
      errors: 2,
      issues: [
        {
          id: "contrast-1",
          type: "error",
          title: "Contraste insuficiente",
          description: "El texto en algunos elementos del mural no tiene suficiente contraste con el fondo.",
          impact: "high",
          wcagCriteria: "WCAG 1.4.3 Contraste (Mínimo) (Nivel AA)",
          suggestion:
            "Aumentar el contraste entre el texto y el fondo a una relación mínima de 4.5:1 para texto normal.",
        },
        {
          id: "alt-text-1",
          type: "error",
          title: "Imágenes sin texto alternativo",
          description: "Algunas imágenes en el mural no tienen texto alternativo.",
          impact: "high",
          wcagCriteria: "WCAG 1.1.1 Contenido no textual (Nivel A)",
          suggestion: "Añadir atributos alt descriptivos a todas las imágenes.",
        },
        {
          id: "keyboard-1",
          type: "warning",
          title: "Navegación por teclado limitada",
          description: "Algunos elementos interactivos no son accesibles mediante teclado.",
          impact: "medium",
          wcagCriteria: "WCAG 2.1.1 Teclado (Nivel A)",
          suggestion: "Asegurar que todos los elementos interactivos sean accesibles mediante teclado.",
        },
        {
          id: "aria-1",
          type: "warning",
          title: "Atributos ARIA faltantes",
          description: "Algunos componentes interactivos carecen de atributos ARIA apropiados.",
          impact: "medium",
          wcagCriteria: "WCAG 4.1.2 Nombre, Función, Valor (Nivel A)",
          suggestion: "Añadir atributos aria-label o aria-labelledby a los componentes interactivos.",
        },
        {
          id: "focus-1",
          type: "warning",
          title: "Indicadores de enfoque no visibles",
          description: "Los indicadores de enfoque no son suficientemente visibles en algunos elementos.",
          impact: "low",
          wcagCriteria: "WCAG 2.4.7 Foco Visible (Nivel AA)",
          suggestion: "Mejorar la visibilidad de los indicadores de enfoque para todos los elementos interactivos.",
        },
        {
          id: "structure-1",
          type: "info",
          title: "Estructura de encabezados mejorable",
          description: "La estructura de encabezados podría ser más lógica y jerárquica.",
          impact: "low",
          wcagCriteria: "WCAG 2.4.10 Encabezados de sección (Nivel AAA)",
          suggestion: "Organizar los encabezados de manera lógica y jerárquica para mejorar la navegación.",
        },
      ],
    })

    setIsChecking(false)
  }

  const getIssueIcon = (type: string) => {
    switch (type) {
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />
      default:
        return null
    }
  }

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case "high":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Alto impacto
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Impacto medio
          </Badge>
        )
      case "low":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Bajo impacto
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Verificador de Accesibilidad</CardTitle>
        <CardDescription>
          Analiza tu mural para detectar problemas de accesibilidad según las pautas WCAG del W3C
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!results ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Lightbulb className="h-12 w-12 text-amber-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Verifica la accesibilidad de tu mural</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Ejecuta una verificación para identificar problemas de accesibilidad y recibir sugerencias de mejora.
            </p>
            <Button
              onClick={runAccessibilityCheck}
              disabled={isChecking}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {isChecking ? "Verificando..." : "Verificar accesibilidad"}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative w-32 h-32 mb-4">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold">{results.score}%</span>
                </div>
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    className="text-gray-200"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                  <circle
                    className={`${
                      results.score >= 90 ? "text-green-500" : results.score >= 70 ? "text-amber-500" : "text-red-500"
                    }`}
                    strokeWidth="10"
                    strokeDasharray={`${results.score * 2.51} 251`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Puntuación de accesibilidad</h3>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm">{results.passed} aprobados</span>
                </div>
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" />
                  <span className="text-sm">{results.warnings} advertencias</span>
                </div>
                <div className="flex items-center">
                  <XCircle className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-sm">{results.errors} errores</span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-medium mb-4">Problemas detectados</h3>
              <div className="space-y-4">
                {results.issues.map((issue) => (
                  <Card key={issue.id} className="border">
                    <CardHeader className="py-3 px-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {getIssueIcon(issue.type)}
                          <CardTitle className="text-base ml-2">{issue.title}</CardTitle>
                        </div>
                        {getImpactBadge(issue.impact)}
                      </div>
                    </CardHeader>
                    <CardContent className="py-2 px-4">
                      <p className="text-sm mb-2">{issue.description}</p>
                      {issue.wcagCriteria && (
                        <p className="text-xs text-muted-foreground mb-2">Criterio: {issue.wcagCriteria}</p>
                      )}
                      <Alert className="mt-2 bg-blue-50 border-blue-200">
                        <Lightbulb className="h-4 w-4 text-blue-600" />
                        <AlertTitle className="text-sm font-medium text-blue-800">Sugerencia</AlertTitle>
                        <AlertDescription className="text-sm text-blue-700">{issue.suggestion}</AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={runAccessibilityCheck} disabled={isChecking} variant="outline" className="mr-2">
                Verificar de nuevo
              </Button>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                Exportar informe
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
