"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Info,
  ChevronDown,
  ExternalLink,
  Code,
  FileCheck,
} from "lucide-react"
import Link from "next/link"

export function BestPracticesGuide() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">
        Buenas Prácticas de Desarrollo Web
      </h1>

      <Tabs defaultValue="security" className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="security" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-700">
            <ShieldAlert className="h-4 w-4 mr-2" />
            Seguridad (OWASP)
          </TabsTrigger>
          <TabsTrigger
            value="accessibility"
            className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            <FileCheck className="h-4 w-4 mr-2" />
            Accesibilidad (W3C)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="security">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShieldAlert className="h-5 w-5 mr-2 text-red-600" />
                OWASP Top 10
              </CardTitle>
              <CardDescription>
                El OWASP Top 10 es una lista estándar de las vulnerabilidades de seguridad más críticas en aplicaciones
                web.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-amber-50 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">¿Por qué es importante?</AlertTitle>
                <AlertDescription className="text-amber-700">
                  Según OWASP, las vulnerabilidades de seguridad pueden comprometer datos sensibles, permitir acceso no
                  autorizado o causar daños significativos a tu aplicación y usuarios.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                {owaspItems.map((item) => (
                  <Collapsible
                    key={item.id}
                    open={openSections[item.id]}
                    onOpenChange={() => toggleSection(item.id)}
                    className="border rounded-lg"
                  >
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50">
                        <div className="flex items-center">
                          <Badge variant="outline" className="mr-3 bg-red-50 text-red-700 border-red-200">
                            {item.id}
                          </Badge>
                          <h3 className="font-medium">{item.title}</h3>
                        </div>
                        <ChevronDown
                          className={`h-5 w-5 text-muted-foreground transition-transform ${
                            openSections[item.id] ? "transform rotate-180" : ""
                          }`}
                        />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <Separator />
                      <div className="p-4 space-y-3">
                        <p>{item.description}</p>
                        <h4 className="font-medium mt-2">Cómo mitigar:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {item.mitigations.map((mitigation, idx) => (
                            <li key={idx}>{mitigation}</li>
                          ))}
                        </ul>
                        <div className="bg-slate-50 p-3 rounded-md mt-2">
                          <h4 className="font-medium text-sm flex items-center">
                            <Code className="h-4 w-4 mr-1" />
                            Ejemplo en nuestro proyecto:
                          </h4>
                          <p className="text-sm mt-1">{item.example}</p>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>

              <div className="flex justify-end mt-4">
                <Button variant="outline" asChild>
                  <Link href="https://owasp.org/Top10/" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver OWASP Top 10 completo
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accessibility">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileCheck className="h-5 w-5 mr-2 text-blue-600" />
                Guías de Accesibilidad W3C (WCAG)
              </CardTitle>
              <CardDescription>
                Las Pautas de Accesibilidad para el Contenido Web (WCAG) proporcionan un estándar para hacer que el
                contenido web sea más accesible para personas con discapacidades.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">¿Por qué es importante?</AlertTitle>
                <AlertDescription className="text-blue-700">
                  La accesibilidad web garantiza que las personas con discapacidades puedan percibir, entender, navegar
                  e interactuar con la web. Además, en muchos países es un requisito legal.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                {wcagPrinciples.map((principle) => (
                  <Collapsible
                    key={principle.id}
                    open={openSections[principle.id]}
                    onOpenChange={() => toggleSection(principle.id)}
                    className="border rounded-lg"
                  >
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50">
                        <div className="flex items-center">
                          <Badge variant="outline" className="mr-3 bg-blue-50 text-blue-700 border-blue-200">
                            {principle.id}
                          </Badge>
                          <h3 className="font-medium">{principle.title}</h3>
                        </div>
                        <ChevronDown
                          className={`h-5 w-5 text-muted-foreground transition-transform ${
                            openSections[principle.id] ? "transform rotate-180" : ""
                          }`}
                        />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <Separator />
                      <div className="p-4 space-y-3">
                        <p>{principle.description}</p>
                        <h4 className="font-medium mt-2">Pautas clave:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {principle.guidelines.map((guideline, idx) => (
                            <li key={idx}>{guideline}</li>
                          ))}
                        </ul>
                        <div className="bg-slate-50 p-3 rounded-md mt-2">
                          <h4 className="font-medium text-sm flex items-center">
                            <Code className="h-4 w-4 mr-1" />
                            Ejemplo en nuestro proyecto:
                          </h4>
                          <p className="text-sm mt-1">{principle.example}</p>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>

              <div className="mt-6 space-y-4">
                <h3 className="font-medium text-lg">Niveles de Conformidad WCAG</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {wcagLevels.map((level) => (
                    <Card key={level.id} className={`border-l-4 ${level.borderColor}`}>
                      <CardHeader className="py-3 px-4">
                        <CardTitle className="text-base">{level.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2 px-4">
                        <p className="text-sm">{level.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button variant="outline" asChild>
                  <Link
                    href="https://www.w3.org/WAI/standards-guidelines/wcag/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver guías WCAG completas
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-2 mt-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle2 className="h-5 w-5 mr-2 text-green-600" />
            Lista de Verificación para Nuestro Proyecto
          </CardTitle>
          <CardDescription>
            Utiliza esta lista para verificar que nuestro proyecto de murales colaborativos cumple con las mejores
            prácticas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-3">Seguridad</h3>
              <ul className="space-y-2">
                {securityChecklist.map((item, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-green-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="font-medium mb-3">Accesibilidad</h3>
              <ul className="space-y-2">
                {accessibilityChecklist.map((item, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-green-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Datos para OWASP Top 10
const owaspItems = [
  {
    id: "A01",
    title: "Pérdida de Control de Acceso",
    description:
      "Ocurre cuando las restricciones sobre lo que los usuarios autenticados pueden hacer no se aplican correctamente, permitiendo a los atacantes acceder a funcionalidades o datos no autorizados.",
    mitigations: [
      "Implementar mecanismos de control de acceso basados en roles (RBAC)",
      "Denegar por defecto y permitir explícitamente",
      "Validar permisos en cada solicitud al servidor",
      "Invalidar tokens JWT al cerrar sesión",
    ],
    example:
      "En nuestro proyecto, utilizamos middleware de autenticación y guardias de ruta para verificar permisos antes de permitir acciones en los murales.",
  },
  {
    id: "A02",
    title: "Fallos Criptográficos",
    description:
      "Se refiere a fallos relacionados con la criptografía, que a menudo conducen a la exposición de datos sensibles.",
    mitigations: [
      "No almacenar datos sensibles innecesariamente",
      "Cifrar todos los datos sensibles en reposo",
      "Utilizar algoritmos de cifrado fuertes y actualizados",
      "Almacenar contraseñas usando funciones de hash adaptativas como Argon2, bcrypt o PBKDF2",
    ],
    example:
      "Utilizamos Supabase Auth que implementa hashing seguro de contraseñas y almacenamos tokens JWT de forma segura.",
  },
  {
    id: "A03",
    title: "Inyección",
    description:
      "Los fallos de inyección, como SQL, NoSQL, OS y LDAP, ocurren cuando datos no confiables se envían a un intérprete como parte de un comando o consulta.",
    mitigations: [
      "Usar ORM o consultas parametrizadas",
      "Validar y sanitizar todas las entradas de usuario",
      "Escapar caracteres especiales",
      "Limitar los privilegios de la base de datos",
    ],
    example:
      "Utilizamos consultas parametrizadas con Supabase y validamos todas las entradas de usuario con Zod antes de procesarlas.",
  },
  {
    id: "A04",
    title: "Diseño Inseguro",
    description:
      "Se refiere a fallos en el diseño y la arquitectura de seguridad que pueden conducir a vulnerabilidades sistemáticas.",
    mitigations: [
      "Implementar el principio de defensa en profundidad",
      "Utilizar modelos de amenazas durante el diseño",
      "Establecer requisitos de seguridad basados en el riesgo",
      "Integrar la seguridad en el ciclo de desarrollo",
    ],
    example:
      "Hemos implementado múltiples capas de seguridad, incluyendo validación en el cliente y servidor, y limitamos el acceso a recursos basados en roles de usuario.",
  },
  {
    id: "A05",
    title: "Configuración de Seguridad Incorrecta",
    description:
      "Relacionado con configuraciones inseguras por defecto, incompletas o ad hoc, almacenamiento en la nube abierto, mensajes de error con información sensible y falta de parches.",
    mitigations: [
      "Proceso de endurecimiento repetible para entornos",
      "Plataforma mínima sin funciones innecesarias",
      "Revisión y actualización de configuraciones",
      "Segmentación de componentes de la aplicación",
    ],
    example:
      "Utilizamos variables de entorno para configuraciones sensibles y headers de seguridad en nuestro middleware para proteger contra ataques comunes.",
  },
  {
    id: "A06",
    title: "Componentes Vulnerables y Desactualizados",
    description:
      "Ocurre cuando se utilizan componentes (bibliotecas, frameworks) con vulnerabilidades conocidas, lo que puede comprometer la aplicación.",
    mitigations: [
      "Eliminar dependencias no utilizadas",
      "Inventario continuo de versiones de componentes",
      "Monitorear fuentes como CVE y boletines de seguridad",
      "Actualizar componentes en tiempo oportuno",
    ],
    example:
      "Utilizamos dependabot para monitorear vulnerabilidades en nuestras dependencias y actualizamos regularmente nuestros paquetes.",
  },
  {
    id: "A07",
    title: "Fallos de Identificación y Autenticación",
    description:
      "Confirmación de la identidad, autenticación y gestión de sesiones implementadas incorrectamente, permitiendo a los atacantes comprometer contraseñas, claves o tokens.",
    mitigations: [
      "Implementar autenticación multifactor",
      "No desplegar credenciales por defecto",
      "Implementar controles contra ataques de fuerza bruta",
      "Usar gestor de sesiones del lado del servidor",
    ],
    example:
      "Implementamos autenticación de dos factores, limitamos intentos de inicio de sesión y utilizamos tokens JWT con tiempo de expiración.",
  },
  {
    id: "A08",
    title: "Fallos de Integridad de Software y Datos",
    description:
      "Se centra en hacer suposiciones relacionadas con actualizaciones de software, datos críticos y canalizaciones CI/CD sin verificar la integridad.",
    mitigations: [
      "Usar firmas digitales para verificar integridad",
      "Asegurar que las dependencias provienen de repositorios confiables",
      "Asegurar que CI/CD tiene pasos de seguridad adecuados",
      "Revisar cambios no autorizados",
    ],
    example:
      "Utilizamos integridad de contenido con SRI para scripts externos y verificamos la integridad de los datos en nuestras operaciones CRUD.",
  },
  {
    id: "A09",
    title: "Fallos en el Registro y Monitoreo",
    description:
      "Esta categoría ayuda a detectar, escalar y responder a brechas activas. Sin registro y monitoreo, las brechas no pueden ser detectadas.",
    mitigations: [
      "Implementar registro de eventos relevantes para la seguridad",
      "Asegurar que los registros se pueden monitorear y alertar",
      "Establecer plan de respuesta a incidentes",
      "Utilizar herramientas de detección de intrusiones",
    ],
    example:
      "Registramos todos los intentos de inicio de sesión, cambios en datos sensibles y actividades sospechosas, y tenemos alertas configuradas para patrones anómalos.",
  },
  {
    id: "A10",
    title: "Falsificación de Solicitudes del Lado del Servidor (SSRF)",
    description:
      "Los fallos SSRF ocurren cuando una aplicación web obtiene un recurso remoto sin validar la URL proporcionada por el usuario.",
    mitigations: [
      "Sanitizar y validar todas las entradas de datos de usuario",
      "Forzar esquemas URL mediante listas positivas",
      "No enviar respuestas en bruto a los clientes",
      "Deshabilitar redirecciones HTTP",
    ],
    example:
      "Validamos y sanitizamos todas las URLs proporcionadas por usuarios antes de realizar solicitudes a servicios externos.",
  },
]

// Datos para principios WCAG
const wcagPrinciples = [
  {
    id: "1",
    title: "Perceptible",
    description:
      "La información y los componentes de la interfaz de usuario deben ser presentados a los usuarios de modo que puedan percibirlos.",
    guidelines: [
      "Proporcionar alternativas textuales para todo contenido no textual",
      "Proporcionar alternativas para los medios tempodependientes",
      "Crear contenido que pueda presentarse de diferentes formas sin perder información",
      "Facilitar a los usuarios ver y oír el contenido, incluyendo la separación entre el primer plano y el fondo",
    ],
    example:
      "Todos nuestros elementos visuales tienen textos alternativos, y utilizamos contrastes adecuados para mejorar la legibilidad.",
  },
  {
    id: "2",
    title: "Operable",
    description: "Los componentes de la interfaz de usuario y la navegación deben ser operables.",
    guidelines: [
      "Proporcionar acceso a todas las funcionalidades mediante el teclado",
      "Proporcionar a los usuarios el tiempo suficiente para leer y usar el contenido",
      "No diseñar contenido que pueda causar ataques epilépticos o convulsiones",
      "Proporcionar medios para ayudar a los usuarios a navegar, encontrar contenido y determinar dónde se encuentran",
    ],
    example:
      "Nuestra aplicación es completamente navegable por teclado y hemos implementado atajos de teclado para funciones comunes en los murales.",
  },
  {
    id: "3",
    title: "Comprensible",
    description: "La información y el manejo de la interfaz de usuario deben ser comprensibles.",
    guidelines: [
      "Hacer que los contenidos textuales resulten legibles y comprensibles",
      "Hacer que las páginas web aparezcan y operen de manera predecible",
      "Ayudar a los usuarios a evitar y corregir errores",
    ],
    example:
      "Utilizamos mensajes de error claros y específicos, y mantenemos una navegación consistente en toda la aplicación.",
  },
  {
    id: "4",
    title: "Robusto",
    description:
      "El contenido debe ser suficientemente robusto como para ser interpretado de forma fiable por una amplia variedad de aplicaciones de usuario, incluyendo las ayudas técnicas.",
    guidelines: [
      "Maximizar la compatibilidad con las aplicaciones de usuario actuales y futuras, incluyendo las ayudas técnicas",
    ],
    example:
      "Nuestro código HTML es semánticamente correcto y compatible con lectores de pantalla y otras tecnologías de asistencia.",
  },
]

// Niveles de conformidad WCAG
const wcagLevels = [
  {
    id: "A",
    title: "Nivel A (Mínimo)",
    description: "Nivel básico de accesibilidad que elimina las barreras más significativas para muchos usuarios.",
    borderColor: "border-amber-400",
  },
  {
    id: "AA",
    title: "Nivel AA (Recomendado)",
    description: "Aborda las barreras más comunes y es el nivel requerido por la mayoría de las regulaciones.",
    borderColor: "border-green-400",
  },
  {
    id: "AAA",
    title: "Nivel AAA (Óptimo)",
    description: "El nivel más alto de accesibilidad, que proporciona acceso a la más amplia gama de usuarios.",
    borderColor: "border-blue-400",
  },
]

// Lista de verificación de seguridad
const securityChecklist = [
  "Implementamos validación de datos en el cliente y servidor usando Zod",
  "Utilizamos tokens CSRF para proteger contra ataques CSRF",
  "Implementamos límites de tasa (rate limiting) para prevenir ataques de fuerza bruta",
  "Utilizamos HTTPS para todas las comunicaciones",
  "Implementamos políticas de contraseñas seguras",
  "Sanitizamos todas las entradas de usuario antes de almacenarlas o mostrarlas",
  "Utilizamos encabezados de seguridad HTTP apropiados",
  "Implementamos autenticación de dos factores",
  "Mantenemos actualizadas todas las dependencias",
  "Registramos eventos de seguridad relevantes",
]

// Lista de verificación de accesibilidad
const accessibilityChecklist = [
  "Utilizamos HTML semántico para mejorar la navegación y comprensión",
  "Proporcionamos textos alternativos para todas las imágenes",
  "Aseguramos suficiente contraste de color para texto e interfaces",
  "Implementamos navegación completa por teclado",
  "Utilizamos etiquetas adecuadas para todos los controles de formulario",
  "Proporcionamos mensajes de error claros y específicos",
  "Implementamos ARIA cuando es necesario para mejorar la accesibilidad",
  "Probamos nuestra aplicación con lectores de pantalla",
  "Proporcionamos subtítulos para contenido multimedia",
  "Mantenemos una estructura de encabezados lógica y jerárquica",
]
