"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { verificarRecaptcha } from "@/lib/security"

interface RecuperacionSMSProps {
  setError: (error: string | null) => void
  setSuccess: (success: string | null) => void
}

export function RecuperacionSMS({ setError, setSuccess }: RecuperacionSMSProps) {
  const [telefono, setTelefono] = useState("")
  const [email, setEmail] = useState("")
  const [codigo, setCodigo] = useState("")
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const handleSolicitarCodigo = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!telefono || !email) {
      setError("Por favor, completa todos los campos")
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

      // Llamar a la API para enviar el código SMS
      const response = await fetch("/api/auth/recuperar-password/sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ telefono, email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Error al enviar el código SMS")
      }

      setSuccess("Se ha enviado un código de verificación a tu teléfono")
      setStep(2)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error al procesar la solicitud")
    } finally {
      setLoading(false)
    }
  }

  const handleVerificarCodigo = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!codigo) {
      setError("Por favor, ingresa el código de verificación")
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

      // Llamar a la API para verificar el código SMS
      const response = await fetch("/api/auth/recuperar-password/verificar-sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ telefono, email, codigo }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Código de verificación inválido")
      }

      setSuccess("Código verificado correctamente. Se ha enviado un enlace de recuperación a tu correo electrónico.")
      setStep(1)
      setTelefono("")
      setEmail("")
      setCodigo("")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error al procesar la solicitud")
    } finally {
      setLoading(false)
    }
  }

  if (step === 1) {
    return (
      <form onSubmit={handleSolicitarCodigo}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email-sms">Correo electrónico</Label>
            <Input
              id="email-sms"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono">Número de teléfono</Label>
            <Input
              id="telefono"
              type="tel"
              placeholder="+34 600 000 000"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">Ingresa tu número con el código de país (ej: +34)</p>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar código SMS"
            )}
          </Button>
        </div>
      </form>
    )
  }

  return (
    <form onSubmit={handleVerificarCodigo}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="codigo">Código de verificación</Label>
          <Input
            id="codigo"
            type="text"
            placeholder="000000"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            required
            maxLength={6}
            className="text-center text-lg tracking-widest"
          />
          <p className="text-xs text-muted-foreground text-center">
            Ingresa el código de 6 dígitos enviado a tu teléfono
          </p>
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)} disabled={loading}>
            Volver
          </Button>

          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              "Verificar código"
            )}
          </Button>
        </div>

        <Button
          type="button"
          variant="link"
          className="w-full text-xs"
          onClick={handleSolicitarCodigo}
          disabled={loading}
        >
          ¿No recibiste el código? Enviar de nuevo
        </Button>
      </div>
    </form>
  )
}
