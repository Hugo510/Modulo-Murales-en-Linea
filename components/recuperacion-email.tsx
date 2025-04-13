"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { verificarRecaptcha } from "@/lib/security"

interface RecuperacionEmailProps {
  setError: (error: string | null) => void
  setSuccess: (success: string | null) => void
}

export function RecuperacionEmail({ setError, setSuccess }: RecuperacionEmailProps) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setError("Por favor, ingresa tu correo electrónico")
      return
    }

    try {
      setLoading(true)

      // Verificar reCAPTCHA
      const recaptchaValid = await verificarRecaptcha()
      if (!recaptchaValid) {
        setError("Por favor, verifica que no eres un robot")
        return
      }

      // Llamar a la API para enviar el correo de recuperación
      const response = await fetch("/api/auth/recuperar-password/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Error al enviar el correo de recuperación")
      }

      setSuccess(
        "Se ha enviado un enlace de recuperación a tu correo electrónico. Por favor, revisa tu bandeja de entrada.",
      )
      setEmail("")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error al procesar la solicitud")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            "Enviar enlace de recuperación"
          )}
        </Button>

        <div className="text-sm text-center text-muted-foreground">
          Te enviaremos un enlace para restablecer tu contraseña
        </div>
      </div>
    </form>
  )
}
