"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { verificarRecaptcha } from "@/lib/security"

interface RecuperacionPreguntasProps {
  setError: (error: string | null) => void
  setSuccess: (success: string | null) => void
}

export function RecuperacionPreguntas({ setError, setSuccess }: RecuperacionPreguntasProps) {
  const [email, setEmail] = useState("")
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [preguntas, setPreguntas] = useState<Array<{ id: string; pregunta: string }>>([])
  const [respuestas, setRespuestas] = useState<Record<string, string>>({})
  const [token, setToken] = useState("")

  const handleBuscarUsuario = async (e: React.FormEvent) => {
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

      // Llamar a la API para obtener las preguntas de seguridad
      const response = await fetch("/api/auth/recuperar-password/preguntas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Error al obtener las preguntas de seguridad")
      }

      setPreguntas(data.preguntas)
      setToken(data.token)
      setStep(2)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error al procesar la solicitud")
    } finally {
      setLoading(false)
    }
  }

  const handleVerificarRespuestas = async (e: React.FormEvent) => {
    e.preventDefault()

    // Verificar que todas las preguntas tienen respuesta
    const todasRespondidas = preguntas.every((p) => respuestas[p.id])

    if (!todasRespondidas) {
      setError("Por favor, responde todas las preguntas")
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

      // Llamar a la API para verificar las respuestas
      const response = await fetch("/api/auth/recuperar-password/verificar-preguntas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          token,
          respuestas: Object.entries(respuestas).map(([id, respuesta]) => ({
            id,
            respuesta,
          })),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Error al verificar las respuestas")
      }

      setSuccess(
        "Respuestas verificadas correctamente. Se ha enviado un enlace de recuperación a tu correo electrónico.",
      )
      setStep(1)
      setEmail("")
      setPreguntas([])
      setRespuestas({})
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error al procesar la solicitud")
    } finally {
      setLoading(false)
    }
  }

  const handleRespuestaChange = (id: string, value: string) => {
    setRespuestas((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  if (step === 1) {
    return (
      <form onSubmit={handleBuscarUsuario}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email-preguntas">Correo electrónico</Label>
            <Input
              id="email-preguntas"
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
                Buscando...
              </>
            ) : (
              "Buscar preguntas de seguridad"
            )}
          </Button>

          <div className="text-sm text-center text-muted-foreground">
            Buscaremos las preguntas de seguridad asociadas a tu cuenta
          </div>
        </div>
      </form>
    )
  }

  return (
    <form onSubmit={handleVerificarRespuestas}>
      <div className="space-y-4">
        {preguntas.map((pregunta) => (
          <div key={pregunta.id} className="space-y-2">
            <Label htmlFor={`pregunta-${pregunta.id}`}>{pregunta.pregunta}</Label>
            <Input
              id={`pregunta-${pregunta.id}`}
              type="text"
              placeholder="Tu respuesta"
              value={respuestas[pregunta.id] || ""}
              onChange={(e) => handleRespuestaChange(pregunta.id, e.target.value)}
              required
            />
          </div>
        ))}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => {
              setStep(1)
              setPreguntas([])
              setRespuestas({})
            }}
            disabled={loading}
          >
            Volver
          </Button>

          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              "Verificar respuestas"
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
