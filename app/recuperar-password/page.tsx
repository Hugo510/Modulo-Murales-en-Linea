"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Mail, MessageSquare, Phone, Shield } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { EnhancedRecaptcha } from "@/components/enhanced-recaptcha"
import { RecuperacionEmail } from "@/components/recuperacion-email"
import { RecuperacionPreguntas } from "@/components/recuperacion-preguntas"
import { RecuperacionSMS } from "@/components/recuperacion-sms"
import { RecuperacionLlamada } from "@/components/recuperacion-llamada"

export default function RecuperarPassword() {
  const [activeTab, setActiveTab] = useState("email")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
  const router = useRouter()

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setError(null)
    setSuccess(null)
  }

  const handleRecaptchaVerify = (token: string | null) => {
    setRecaptchaToken(token)
    // Limpiar errores si la verificación es exitosa
    if (token) {
      setError(null)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Recuperar Contraseña</CardTitle>
          <CardDescription className="text-center">Elige un método para recuperar tu contraseña</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <Shield className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">Éxito</AlertTitle>
              <AlertDescription className="text-green-600">{success}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="email" className="flex flex-col items-center gap-1 py-2">
                <Mail className="h-4 w-4" />
                <span className="text-xs">Email</span>
              </TabsTrigger>
              <TabsTrigger value="preguntas" className="flex flex-col items-center gap-1 py-2">
                <Shield className="h-4 w-4" />
                <span className="text-xs">Preguntas</span>
              </TabsTrigger>
              <TabsTrigger value="sms" className="flex flex-col items-center gap-1 py-2">
                <MessageSquare className="h-4 w-4" />
                <span className="text-xs">SMS</span>
              </TabsTrigger>
              <TabsTrigger value="llamada" className="flex flex-col items-center gap-1 py-2">
                <Phone className="h-4 w-4" />
                <span className="text-xs">Llamada</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email">
              <RecuperacionEmail setError={setError} setSuccess={setSuccess} />
            </TabsContent>

            <TabsContent value="preguntas">
              <RecuperacionPreguntas setError={setError} setSuccess={setSuccess} />
            </TabsContent>

            <TabsContent value="sms">
              <RecuperacionSMS setError={setError} setSuccess={setSuccess} />
            </TabsContent>

            <TabsContent value="llamada">
              <RecuperacionLlamada setError={setError} setSuccess={setSuccess} />
            </TabsContent>
          </Tabs>

          <div className="mt-4">
            <EnhancedRecaptcha onVerify={handleRecaptchaVerify} />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="text-sm text-center text-muted-foreground">
            ¿Recuerdas tu contraseña?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Iniciar sesión
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
