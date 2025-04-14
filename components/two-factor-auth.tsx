"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle2, Copy } from "lucide-react"
import { QRCodeSVG } from "qrcode.react" // Corregido: Importar QRCodeSVG en lugar de QRCode
import { useToast } from "@/components/ui/use-toast"

interface TwoFactorAuthProps {
  userId: string
  onComplete: (success: boolean) => void
  onCancel: () => void
  isSetup?: boolean
}

export function TwoFactorAuth({ userId, onComplete, onCancel, isSetup = false }: TwoFactorAuthProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [secret, setSecret] = useState("")
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [error, setError] = useState("")
  const [recoveryKeys, setRecoveryKeys] = useState<string[]>([])
  const [showRecoveryKeys, setShowRecoveryKeys] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (isSetup) {
      generateSecret()
    } else {
      setIsLoading(false)
    }
  }, [isSetup])

  const generateSecret = async () => {
    setIsLoading(true)
    try {
      // En un entorno real, esto sería una llamada a la API
      const response = await fetch("/api/auth/2fa/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) {
        throw new Error("Error al generar el secreto 2FA")
      }

      const data = await response.json()
      setSecret(data.secret)
      setQrCodeUrl(data.qrCodeUrl)
      setRecoveryKeys(data.recoveryCodes)
      setIsLoading(false)
    } catch (error) {
      console.error("Error al configurar 2FA:", error)
      setError("No se pudo generar el código QR. Por favor, inténtalo de nuevo.")
      setIsLoading(false)
    }
  }

  const verifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError("Por favor, ingresa un código de 6 dígitos")
      return
    }

    setIsLoading(true)
    try {
      // En un entorno real, esto sería una llamada a la API
      const response = await fetch(isSetup ? "/api/auth/2fa/verify-setup" : "/api/auth/2fa/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          code: verificationCode,
          secret: isSetup ? secret : undefined,
        }),
      })

      if (!response.ok) {
        throw new Error("Código de verificación inválido")
      }

      if (isSetup) {
        setShowRecoveryKeys(true)
      } else {
        onComplete(true)
      }
      setIsLoading(false)
    } catch (error) {
      console.error("Error al verificar código:", error)
      setError("Código de verificación inválido. Por favor, inténtalo de nuevo.")
      setIsLoading(false)
    }
  }

  const copyRecoveryKeys = () => {
    navigator.clipboard.writeText(recoveryKeys.join("\n"))
    toast({
      title: "Códigos copiados",
      description: "Los códigos de recuperación se han copiado al portapapeles",
    })
  }

  const completeSetup = () => {
    onComplete(true)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (showRecoveryKeys) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Guarda tus códigos de recuperación</CardTitle>
          <CardDescription>
            Guarda estos códigos en un lugar seguro. Son la única forma de recuperar tu cuenta si pierdes acceso a tu
            aplicación de autenticación.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-md mb-4 font-mono text-sm">
            {recoveryKeys.map((key, index) => (
              <div key={index} className="mb-1">
                {key}
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full" onClick={copyRecoveryKeys}>
            <Copy className="h-4 w-4 mr-2" />
            Copiar códigos
          </Button>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={completeSetup}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            He guardado mis códigos
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{isSetup ? "Configurar autenticación de dos factores" : "Verificación de dos factores"}</CardTitle>
        <CardDescription>
          {isSetup
            ? "Escanea el código QR con tu aplicación de autenticación (Google Authenticator, Authy, etc.)"
            : "Ingresa el código de tu aplicación de autenticación"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isSetup && (
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-white p-2 rounded-md">
              <QRCodeSVG
                value={qrCodeUrl}
                size={200}
                level="M" // Mayor corrección de errores para mejor escaneo
                bgColor="#FFFFFF"
                fgColor="#000000"
                includeMargin={true}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Si no puedes escanear el código QR, ingresa este código en tu aplicación:
            </p>
            <div className="flex items-center space-x-2">
              <code className="bg-muted p-2 rounded text-sm font-mono">{secret}</code>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(secret)
                  toast({
                    title: "Código copiado",
                    description: "El código secreto se ha copiado al portapapeles",
                  })
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="verification-code">Código de verificación</Label>
          <Input
            id="verification-code"
            placeholder="Ingresa el código de 6 dígitos"
            value={verificationCode}
            onChange={(e) => {
              // Solo permitir dígitos y limitar a 6 caracteres
              const value = e.target.value.replace(/\D/g, "").slice(0, 6)
              setVerificationCode(value)
            }}
            className="text-center tracking-widest text-lg font-mono"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={verifyCode}>Verificar</Button>
      </CardFooter>
    </Card>
  )
}
