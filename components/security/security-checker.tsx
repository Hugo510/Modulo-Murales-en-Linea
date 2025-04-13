"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertTriangle, XCircle, Shield, ShieldAlert, Lock } from "lucide-react"

interface SecurityIssue {
  id: string
  type: "critical" | "high" | "medium" | "low" | "info"
  title: string
  description: string
  owaspCategory?: string
  suggestion: string
}

export function SecurityChecker({ muralId }: { muralId?: string }) {
  const [isChecking, setIsChecking] = useState(false)
  const [results, setResults] = useState<{
    score: number
    passed: number
    warnings: number
    vulnerabilities: number
    issues: SecurityIssue[]
  } | null>(null)

  const runSecurityCheck = async () => {
    setIsChecking(true)

    // Simulamos una verificación de seguridad
    // En un entorno real, esto llamaría a una API o utilizaría una biblioteca de seguridad
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Resultados simulados
    setResults({
      score: 78,
      passed: 15,
      warnings: 4,
      vulnerabilities: 2,
      issues: [
        {
          id: "xss-1",
          type: "high",
          title: "Posible vulnerabilidad XSS",
          description: "Se detectó contenido HTML sin sanitizar en elementos de texto del mural.",
          owaspCategory: "A07:2021 - Fallos de Inyección",
          suggestion: "Sanitizar todo el contenido HTML generado por usuarios antes de renderizarlo.",
        },
        {
          id: "csrf-1",
          type: "medium",
          title: "Protección CSRF mejorable",
          description: "Algunas operaciones de modificación podrían no estar completamente protegidas contra CSRF.",
          owaspCategory: "A01:2021 - Pérdida de Control de Acceso",
          suggestion: "Implementar tokens CSRF en todos los formularios y solicitudes que modifican datos.",
        },
        {
          id: "perm-1",
          type: "high",
          title: "Verificación de permisos insuficiente",
          description: "No se verifica adecuadamente si el usuario tiene permisos para editar ciertos elementos.",
          owaspCategory: "A01:2021 - Pérdida de Control de Acceso",
          suggestion: "Implementar verificación de permisos a nivel de elemento en el servidor.",
        },
        {
          id: "content-sec-1",
          type: "low",
          title: "Política de seguridad de contenido incompleta",
          description: "La CSP actual podría permitir la carga de recursos de orígenes no confiables.",
          owaspCategory: "A05:2021 - Configuración de Seguridad Incorrecta",
          suggestion: "Reforzar la política de seguridad de contenido para restringir orígenes de recursos.",
        },
        {
          id: "logging-1",
          type: "medium",
          title: "Registro de eventos de seguridad limitado",
          description: "No se registran adecuadamente los intentos de acceso no autorizado a elementos del mural.",
          owaspCategory: "A09:2021 - Fallos en el Registro y Monitoreo",
          suggestion: "Implementar registro detallado de todos los intentos de acceso y modificación.",
        },
        {
          id: "data-exp-1",
          type: "info",
          title: "Exposición de metadatos",
          description: "Algunos metadatos sensibles podrían estar expuestos en la respuesta API.",
          owaspCategory: "A04:2021 - Diseño Inseguro",
          suggestion: "Filtrar metadatos sensibles antes de enviar respuestas al cliente.",
        },
      ],
    })

    setIsChecking(false)
  }

  const getIssueIcon = (type: string) => {
    switch (type) {
      case "critical":
      case "high":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "medium":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case "low":
      case "info":
        return <Shield className="h-5 w-5 text-blue-500" />
      default:
        return null
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "critical":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
            Crítico
          </Badge>
        )
      case "high":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Alto riesgo
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Riesgo medio
          </Badge>
        )
      case "low":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Bajo riesgo
          </Badge>
        )
      case "info":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            Informativo
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Verificador de Seguridad</CardTitle>
        <CardDescription>
          Analiza tu mural para detectar posibles problemas de seguridad según las recomendaciones OWASP
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!results ? (
          <div className="flex flex-col items-center justify-center py-8">
            <ShieldAlert className="h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Verifica la seguridad de tu mural</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Ejecuta una verificación para identificar posibles vulnerabilidades y recibir recomendaciones de
              seguridad.
            </p>
            <Button
              onClick={runSecurityCheck}
              disabled={isChecking}
              className="bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700"
            >
              {isChecking ? "Verificando..." : "Verificar seguridad"}
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
              <h3 className="text-lg font-medium mb-2">Puntuación de seguridad</h3>
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
                  <span className="text-sm">{results.vulnerabilities} vulnerabilidades</span>
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
                        {getTypeBadge(issue.type)}
                      </div>
                    </CardHeader>
                    <CardContent className="py-2 px-4">
                      <p className="text-sm mb-2">{issue.description}</p>
                      {issue.owaspCategory && (
                        <p className="text-xs text-muted-foreground mb-2">Categoría OWASP: {issue.owaspCategory}</p>
                      )}
                      <Alert className="mt-2 bg-red-50 border-red-200">
                        <Lock className="h-4 w-4 text-red-600" />
                        <AlertTitle className="text-sm font-medium text-red-800">Recomendación</AlertTitle>
                        <AlertDescription className="text-sm text-red-700">{issue.suggestion}</AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={runSecurityCheck} disabled={isChecking} variant="outline" className="mr-2">
                Verificar de nuevo
              </Button>
              <Button className="bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700">
                Exportar informe
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
