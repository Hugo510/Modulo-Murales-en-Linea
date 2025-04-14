"use client"

import { useEffect, useRef, useState, useId } from "react"
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
  const isRendered = useRef(false)
  const uniqueId = useId() // Genera un ID único para este componente
  const renderAttemptCount = useRef(0)

  // Cargar el script de reCAPTCHA solo una vez
  useEffect(() => {
    if (window.grecaptcha) {
      setScriptLoaded(true)
      return
    }

    // Verificar si ya existe el script
    const existingScript = document.querySelector('script[src*="recaptcha/api.js"]')

    if (existingScript) {
      setScriptLoaded(true)
      return
    }

    const script = document.createElement("script")
    script.src = `https://www.google.com/recaptcha/api.js?render=explicit`
    script.async = true
    script.defer = true

    script.onload = () => {
      setScriptLoaded(true)
    }

    script.onerror = () => {
      setLoading(false)
      setError("No se pudo cargar reCAPTCHA. Por favor, intenta de nuevo más tarde.")
      if (onError) onError(new Error("Failed to load reCAPTCHA script"))
    }

    document.head.appendChild(script)

    return () => {
      // No eliminamos el script al desmontar
    }
  }, [onError])

  // Renderizar el reCAPTCHA cuando el script esté cargado - con mejoras
  useEffect(() => {
    // Si ya está renderizado o no tenemos el contenedor o el script no está cargado, no hacer nada
    if (!scriptLoaded || !containerRef.current || isRendered.current) {
      return
    }

    // Función para renderizar el captcha con retrasos exponenciales
    const renderCaptcha = () => {
      renderAttemptCount.current += 1

      // Si ya se ha renderizado, no intentar de nuevo
      if (isRendered.current) {
        return
      }

      // Si hemos intentado demasiadas veces, mostrar un error
      if (renderAttemptCount.current > 5) {
        setLoading(false)
        setError("No se pudo inicializar reCAPTCHA. Por favor, recarga la página.")
        return
      }

      // Comprobar si grecaptcha está disponible
      if (!window.grecaptcha || !window.grecaptcha.render) {
        // Esperar más tiempo entre intentos sucesivos (retraso exponencial)
        const delay = Math.pow(2, renderAttemptCount.current) * 100
        setTimeout(renderCaptcha, delay)
        return
      }

      try {
        // Limpiar el contenedor completamente
        if (containerRef.current) {
          containerRef.current.innerHTML = ""
        }

        // Crear un div anidado con ID único para el captcha
        const captchaContainer = document.createElement("div")
        captchaContainer.id = `recaptcha-container-${uniqueId}`

        // Añadir el contenedor al DOM
        if (containerRef.current) {
          containerRef.current.appendChild(captchaContainer)
        } else {
          throw new Error("El contenedor de reCAPTCHA no está disponible")
        }

        // Renderizar el reCAPTCHA
        recaptchaId.current = window.grecaptcha.render(captchaContainer, {
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

        // Marcar como renderizado exitosamente
        isRendered.current = true
        setLoading(false)
      } catch (err) {
        console.error("Error al renderizar reCAPTCHA:", err)

        // Si es un error específico de que ya se ha renderizado, marcar como renderizado
        const errorMessage = err instanceof Error ? err.message : String(err)
        if (errorMessage.includes("already been rendered")) {
          isRendered.current = true
          setLoading(false)
        } else {
          // Para otros errores, limpiar e intentar de nuevo después de un retraso
          if (containerRef.current) {
            containerRef.current.innerHTML = ""
          }

          // Retrasos exponenciales entre reintentos
          const delay = Math.pow(2, renderAttemptCount.current) * 100
          setTimeout(renderCaptcha, delay)
        }
      }
    }

    // Iniciar el proceso de renderizado
    renderCaptcha()

    // Limpiar al desmontar
    return () => {
      if (recaptchaId.current !== null && window.grecaptcha && window.grecaptcha.reset) {
        try {
          window.grecaptcha.reset(recaptchaId.current)
        } catch (e) {
          // Ignorar errores al resetear
        }
      }
      // Reset de referencias
      recaptchaId.current = null
      isRendered.current = false
      renderAttemptCount.current = 0
    }
  }, [scriptLoaded, siteKey, theme, size, tabIndex, invisible, onVerify, onExpired, onError, uniqueId])

  // Limpiar completamente cuando el componente se desmonta
  useEffect(() => {
    return () => {
      // Limpiar el contenedor
      if (containerRef.current) {
        containerRef.current.innerHTML = ""
      }
      // Reset de referencias
      isRendered.current = false
      recaptchaId.current = null
      renderAttemptCount.current = 0
    }
  }, [])

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
