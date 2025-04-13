import { BestPracticesGuide } from "@/components/guides/best-practices-guide"
import { AccessibilityChecker } from "@/components/accessibility/accessibility-checker"
import { SecurityChecker } from "@/components/security/security-checker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldAlert, FileCheck, Lightbulb } from "lucide-react"

export default function HerramientasPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">
        Herramientas de Desarrollo
      </h1>

      <Tabs defaultValue="guide" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="guide" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
            <Lightbulb className="h-4 w-4 mr-2" />
            Guía de Buenas Prácticas
          </TabsTrigger>
          <TabsTrigger
            value="accessibility"
            className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            <FileCheck className="h-4 w-4 mr-2" />
            Verificador de Accesibilidad
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-700">
            <ShieldAlert className="h-4 w-4 mr-2" />
            Verificador de Seguridad
          </TabsTrigger>
        </TabsList>

        <TabsContent value="guide">
          <BestPracticesGuide />
        </TabsContent>

        <TabsContent value="accessibility">
          <Card className="border-2 mb-6">
            <CardHeader>
              <CardTitle>Verificador de Accesibilidad</CardTitle>
              <CardDescription>
                Analiza tus murales para detectar problemas de accesibilidad según las pautas WCAG del W3C
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-6">
                Selecciona un mural para verificar su accesibilidad o utiliza el verificador general para analizar toda
                la aplicación.
              </p>
              <AccessibilityChecker />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="border-2 mb-6">
            <CardHeader>
              <CardTitle>Verificador de Seguridad</CardTitle>
              <CardDescription>
                Analiza tus murales para detectar posibles problemas de seguridad según las recomendaciones OWASP
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-6">
                Selecciona un mural para verificar su seguridad o utiliza el verificador general para analizar toda la
                aplicación.
              </p>
              <SecurityChecker />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
