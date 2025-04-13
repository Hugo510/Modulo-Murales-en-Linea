"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2 } from "lucide-react"
import { Label } from "@/components/ui/label"

interface RecaptchaProps {
  onVerify: (token: string | null) => void
  siteKey?: string
}

export function Recaptcha({ onVerify, siteKey = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" }: RecaptchaProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const recaptchaId = useRef<number | null>(null)

  useEffect(() => {
    // Cargar el script de reCAPTCHA si aún no está cargado
    if (!window.grecaptcha) {
      const script = document.createElement("script")
      script.src = `https://www.google.com/recaptcha/api.js?render=explicit`
      script.async = true
      script.defer = true
      script.onload = renderCaptcha
      script.onerror = () => {
        setLoading(false)
        setError("No se pudo cargar reCAPTCHA. Por favor, intenta de nuevo más tarde.")
      }
      document.head.appendChild(script)

      return () => {
        document.head.removeChild(script)
        if (recaptchaId.current !== null && window.grecaptcha) {
          window.grecaptcha.reset(recaptchaId.current)
        }
      }
    } else {
      renderCaptcha()
    }
  }, [siteKey])

  const renderCaptcha = () => {
    if (!containerRef.current || !window.grecaptcha) return

    // Esperar a que grecaptcha esté completamente cargado
    if (!window.grecaptcha.render) {
      setTimeout(renderCaptcha, 100)
      return
    }

    try {
      // Limpiar el contenedor si ya hay un reCAPTCHA renderizado
      if (containerRef.current.childNodes.length > 0) {
        containerRef.current.innerHTML = ""
      }

      // Renderizar el reCAPTCHA
      recaptchaId.current = window.grecaptcha.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => {
          onVerify(token)
        },
        "expired-callback": () => {
          onVerify(null)
        },
        "error-callback": () => {
          setError("Error en la verificación. Por favor, intenta de nuevo.")
          onVerify(null)
        },
      })

      setLoading(false)
    } catch (err) {
      console.error("Error al renderizar reCAPTCHA:", err)
      setError("Error al inicializar reCAPTCHA. Por favor, recarga la página.")
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Label>Verificación de seguridad</Label>
      <div className="flex flex-col items-center">
        {loading && (
          <div className="flex items-center justify-center h-[78px] w-full border-2 rounded-md bg-muted/20">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        <div ref={containerRef} className={loading ? "hidden" : ""}></div>
      </div>
    </div>
  )
}

// Agregar la definición de tipos para window.grecaptcha
declare global {
  interface Window {
    grecaptcha: {
      render: (
        container: HTMLElement,
        parameters: {
          sitekey: string
          callback: (token: string) => void
          "expired-callback": () => void
          "error-callback": () => void
        },
      ) => number
      reset: (id: number) => void
    }
  }
}
