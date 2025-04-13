"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2 } from "lucide-react"
import { Label } from "@/components/ui/label"

interface RecaptchaProps {
  onVerify: (token: string | null) => void
  siteKey?: string
  theme?: "light" | "dark"
  size?: "normal" | "compact"
  tabIndex?: number
  invisible?: boolean
  onExpired?: () => void
  onError?: (error: Error) => void
}

export function EnhancedRecaptcha({
  onVerify,
  siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI",
  theme = "light",
  size = "normal",
  tabIndex = 0,
  invisible = false,
  onExpired,
  onError,
}: RecaptchaProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const recaptchaId = useRef<number | null>(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  // Cargar el script de reCAPTCHA
  useEffect(() => {
    if (window.grecaptcha) {
      setScriptLoaded(true)
      return
    }

    const script = document.createElement("script")
    script.src = `https://www.google.com/recaptcha/api.js?render=explicit`
    script.async = true
    script.defer = true
    script.onload = () => setScriptLoaded(true)
    script.onerror = () => {
      setLoading(false)
      setError("No se pudo cargar reCAPTCHA. Por favor, intenta de nuevo más tarde.")
      if (onError) onError(new Error("Failed to load reCAPTCHA script"))
    }
    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [onError])

  // Renderizar el reCAPTCHA cuando el script esté cargado
  useEffect(() => {
    if (!scriptLoaded || !containerRef.current) return

    const renderCaptcha = () => {
      if (!window.grecaptcha || !window.grecaptcha.render) {
        // Si grecaptcha no está completamente cargado, intentar de nuevo
        setTimeout(renderCaptcha, 100)
        return
      }

      try {
        // Limpiar el contenedor si ya hay un reCAPTCHA renderizado
        if (containerRef.current && containerRef.current.childNodes.length > 0) {
          containerRef.current.innerHTML = ""
        }

        // Verificar de nuevo que containerRef.current no sea null justo antes de renderizar
        if (!containerRef.current) {
          console.error("El contenedor de reCAPTCHA no está disponible")
          return
        }

        // Renderizar el reCAPTCHA
        recaptchaId.current = window.grecaptcha.render(containerRef.current, {
          sitekey: siteKey,
          theme,
          size: invisible ? "invisible" : size,
          tabindex: tabIndex,
          callback: (token: string) => {
            onVerify(token)
          },
          "expired-callback": () => {
            onVerify(null)
            if (onExpired) onExpired()
          },
          "error-callback": () => {
            setError("Error en la verificación. Por favor, intenta de nuevo.")
            onVerify(null)
            if (onError) onError(new Error("reCAPTCHA verification error"))
          },
        })

        setLoading(false)
      } catch (err) {
        console.error("Error al renderizar reCAPTCHA:", err)
        setError("Error al inicializar reCAPTCHA. Por favor, recarga la página.")
        setLoading(false)
        if (onError) onError(err instanceof Error ? err : new Error("Unknown error rendering reCAPTCHA"))
      }
    }

    renderCaptcha()

    return () => {
      if (recaptchaId.current !== null && window.grecaptcha && window.grecaptcha.reset) {
        window.grecaptcha.reset(recaptchaId.current)
      }
    }
  }, [scriptLoaded, siteKey, theme, size, tabIndex, invisible, onVerify, onExpired, onError])

  // Método para resetear manualmente el captcha
  const reset = () => {
    if (recaptchaId.current !== null && window.grecaptcha && window.grecaptcha.reset) {
      window.grecaptcha.reset(recaptchaId.current)
    }
  }

  // Método para ejecutar el captcha programáticamente (útil para captcha invisible)
  const execute = () => {
    if (recaptchaId.current !== null && window.grecaptcha && window.grecaptcha.execute && invisible) {
      window.grecaptcha.execute(recaptchaId.current)
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
        <div ref={containerRef} className={loading ? "hidden" : ""} data-testid="recaptcha-container"></div>
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
          theme?: "light" | "dark"
          size?: "normal" | "compact" | "invisible"
          tabindex?: number
          callback: (token: string) => void
          "expired-callback": () => void
          "error-callback": () => void
        },
      ) => number
      reset: (id: number) => void
      execute: (id: number) => void
    }
  }
}
