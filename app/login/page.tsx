"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, ArrowRight, Shield } from "lucide-react"
import { EnhancedRecaptcha } from "@/components/enhanced-recaptcha"
import { SecurityNotification } from "@/components/security-notification"
import { TwoFactorAuth } from "@/components/two-factor-auth"
import { useCsrfToken } from "@/lib/csrf"
import { validateForm, loginSchema } from "@/lib/validation"
import { detectBruteForce, isIpSuspicious } from "@/lib/security"
import { logAuth } from "@/lib/auth-logger"
import { redirectAfterLogin } from "@/lib/auth-redirect"

export default function LoginPage() {
  const { login, isAuthenticated, isLoading, checkSuspiciousActivity } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get("from") || "/dashboard"
  const { getCsrfToken } = useCsrfToken()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [showRecaptcha, setShowRecaptcha] = useState(false)
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
  const [showSecurity, setShowSecurity] = useState(false)
  const [securityInfo, setSecurityInfo] = useState({
    ip: "",
    location: "",
  })
  const [show2FA, setShow2FA] = useState(false)
  const [userId, setUserId] = useState("")
  const [csrfToken, setCsrfToken] = useState("")

  // Obtener token CSRF al cargar - mejorado con reintento
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const token = await getCsrfToken()
        setCsrfToken(token)
        console.log("Token CSRF obtenido con éxito")
      } catch (error) {
        console.error("Error inicial al obtener token CSRF:", error)

        // Reintento después de un breve retraso
        setTimeout(async () => {
          try {
            console.log("Reintentando obtener token CSRF...")
            const token = await getCsrfToken()
            setCsrfToken(token)
            console.log("Token CSRF obtenido en segundo intento")
          } catch (retryError) {
            console.error("Error en reintento de token CSRF:", retryError)
          }
        }, 1500)
      }
    }

    fetchCsrfToken()
  }, [getCsrfToken])

  // Mejorar la redirección si ya está autenticado
  useEffect(() => {
    // Solo redirigir si ya está autenticado y no está cargando
    if (isAuthenticated && !isLoading) {
      console.log("Usuario autenticado, redirigiendo a:", from);
      router.push(from);
    }
  }, [isAuthenticated, isLoading, router, from]);

  // Mostrar mensaje de error si hubo problema con la autenticación
  useEffect(() => {
    const authError = searchParams.get("auth_error");
    if (authError === "true") {
      setError("Se produjo un error al verificar tu sesión. Por favor, intenta iniciar sesión nuevamente.");
      // Limpiar cualquier estado pendiente
      localStorage.removeItem("login_success");
      localStorage.removeItem("auth_user_id");
      localStorage.removeItem("auth_redirect");
    }
  }, [searchParams]);

  // Verificar si se debe mostrar captcha basado en intentos previos
  useEffect(() => {
    const checkPreviousAttempts = async () => {
      try {
        const response = await fetch("/api/auth/login-attempts", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.attempts >= 2) {
            setShowRecaptcha(true)
            setLoginAttempts(data.attempts)
          }
        }
      } catch (error) {
        console.error("Error al verificar intentos previos:", error)
      }
    }

    checkPreviousAttempts()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFormErrors({});

    // Validar formulario
    const formData = { email, password }
    const validation = validateForm(loginSchema, formData)

    if (!validation.success) {
      setFormErrors(validation.errors || {})
      return
    }

    // Verificar que tenemos un token CSRF
    if (!csrfToken) {
      setError("Error de seguridad: No se pudo obtener un token CSRF válido. Por favor, recarga la página.")
      return
    }

    // Verificar captcha si es necesario
    if (showRecaptcha && !recaptchaToken) {
      setError("Por favor, completa el captcha para continuar")
      return
    }

    setIsSubmitting(true);

    try {
      // Registrar intento de login en el cliente
      logAuth({
        action: "auth_attempt",
        email: email,
        info: "Intento de inicio de sesión desde formulario",
        level: "info",
        metadata: {
          recaptchaPresent: !!recaptchaToken,
          from: from
        }
      });

      // Verificar si hay intentos de fuerza bruta
      const ipAddress = await getCurrentIp()
      const isBruteForce = await detectBruteForce("unknown", ipAddress)

      if (isBruteForce) {
        setError("Demasiados intentos fallidos. Por favor, inténtalo de nuevo más tarde.")
        setIsSubmitting(false)
        return
      }

      // Realizar inicio de sesión con token CSRF
      const loginResponse = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({
          email,
          password,
          recaptchaToken,
        }),
      })

      // Manejo mejorado de errores HTTP
      if (!loginResponse.ok) {
        const errorData = await loginResponse.json().catch(() => null);
        setLoginAttempts((prev) => prev + 1);

        if (loginResponse.status === 403 && errorData?.error === "Token CSRF inválido") {
          // Error específico de CSRF - recargar token
          console.warn("Token CSRF inválido detectado, obteniendo uno nuevo...");
          try {
            const newToken = await getCsrfToken(true); // Forzar refresco
            setCsrfToken(newToken);
            setError("Error de seguridad: Por favor, intenta nuevamente el inicio de sesión");
          } catch (csrfError) {
            setError("Error de seguridad: No se pudo renovar el token. Por favor, recarga la página.");
          }
        } else if (loginAttempts + 1 >= 5) {
          setError("Demasiados intentos fallidos. Tu cuenta ha sido bloqueada temporalmente.");
        } else {
          // Mostrar mensaje más específico basado en código de error
          let errorMessage = errorData?.error || "Correo electrónico o contraseña incorrectos";

          if (errorData?.code === "ACCOUNT_LOCKED") {
            errorMessage = "Tu cuenta ha sido bloqueada temporalmente por motivos de seguridad";
          } else if (errorData?.code === "RATE_LIMITED") {
            errorMessage = "Has excedido el límite de intentos. Inténtalo de nuevo más tarde.";
          }

          console.error("Error de inicio de sesión:", errorData);
          setError(errorMessage);
        }

        setIsSubmitting(false);
        return;
      }

      const loginData = await loginResponse.json();

      // Mensaje de log para diagnóstico
      console.log("Login exitoso en API, respuesta:", loginData);

      // Verificar si se requiere 2FA
      if (loginData.requires2FA) {
        setUserId(loginData.userId)
        setShow2FA(true)
        setIsSubmitting(false)
        return
      }

      // SOLUCIÓN ULTRA-SIMPLIFICADA: Sin interferencias y redirección directa
      try {
        // Limpiar cualquier redirección anterior
        localStorage.removeItem("auth_redirect");
        sessionStorage.removeItem("redirection_in_progress");
        sessionStorage.removeItem("auth_redirect_in_progress");

        // Guardar información básica del usuario - CRÍTICO PARA LA REDIRECCIÓN
        localStorage.setItem("auth_user_id", loginData.userId);
        localStorage.setItem("login_success", "true");
        localStorage.setItem("login_timestamp", Date.now().toString());

        // Guardar información completa del usuario
        if (loginData.user) {
          localStorage.setItem("auth_user_name", loginData.user.name || "");
          localStorage.setItem("auth_user_email", loginData.user.email || "");
          localStorage.setItem("auth_user_role", loginData.user.role || "user");
        }

        // Registrar acción
        console.log(`Login exitoso, preparando redirección ultra-simplificada a ${from}`);
        logAuth({
          action: "auth_success",
          email: email,
          info: "Redirección ultra-simplificada post-login iniciada",
          level: "info",
          metadata: { destination: from, userId: loginData.userId }
        });

        // Iniciar login en contexto pero SIN ESPERAR la respuesta
        login(email, password);

        // REDIRECCIÓN SIMPLE Y DIRECTA después de un breve retraso
        setTimeout(() => {
          redirectAfterLogin(from);
        }, 200);

        return true;
      } catch (redirectError) {
        console.error("Error durante el proceso de redirección:", redirectError);
        setError("Error al iniciar sesión. Por favor, inténtalo de nuevo.");
        return false;
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);

      // Registrar el error no controlado
      logAuth({
        action: "auth_unhandled_error",
        email: email,
        info: "Error no controlado en cliente durante login",
        level: "error",
        error
      });

      setError("Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleRecaptchaVerify = (token: string | null) => {
    setRecaptchaToken(token)
    if (token) {
      setError("")
    }
  }

  const handle2FAComplete = async (success: boolean) => {
    if (success) {
      setShow2FA(false)

      // Completar inicio de sesión después de 2FA
      const loginSuccess = await login(email, password)

      if (loginSuccess) {
        router.push(from)
      } else {
        setError("Error al iniciar sesión después de la verificación 2FA")
      }
    } else {
      setError("Verificación de dos factores fallida")
      setShow2FA(false)
    }
  }

  const handleSecurityConfirm = async () => {
    setShowSecurity(false)

    // Completar inicio de sesión después de confirmar alerta de seguridad
    const success = await login(email, password)

    if (success) {
      console.log("Login exitoso desde security confirm, redirigiendo a:", from);

      // Dar tiempo para que el estado de autenticación se actualice
      setTimeout(() => {
        // Usar window.location para una redirección forzada
        window.location.href = from;
      }, 500);
    } else {
      setError("Error al iniciar sesión")
    }
  }

  // Función para obtener la IP actual del usuario
  const getCurrentIp = async (): Promise<string> => {
    try {
      // Usar nuestro propio endpoint en lugar de ipify.org
      const response = await fetch("/api/user-ip");
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      return data.ip || "unknown";
    } catch (error) {
      console.error("Error al obtener IP:", error);
      return "unknown";
    }
  }

  // Función para obtener información de ubicación
  const getLocationInfo = async (ip: string) => {
    // En un entorno real, usaríamos un servicio de geolocalización
    return {
      city: "Madrid",
      country: "España",
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (show2FA) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)] py-8">
        <TwoFactorAuth userId={userId} onComplete={handle2FAComplete} onCancel={() => setShow2FA(false)} />
      </div>
    )
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)] py-8">
      <div className="w-full max-w-md">
        <Card className="border-2">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">
              Iniciar sesión
            </CardTitle>
            <CardDescription>Ingresa tus credenciales para acceder a tu cuenta</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campo oculto para CSRF */}
              <input type="hidden" name="csrf_token" value={csrfToken} />

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`border-2 focus-visible:ring-purple-500 ${formErrors.email ? "border-red-500" : ""}`}
                  disabled={isSubmitting || loginAttempts >= 5}
                  aria-invalid={!!formErrors.email}
                  aria-describedby={formErrors.email ? "email-error" : undefined}
                />
                {formErrors.email && (
                  <p id="email-error" className="text-sm text-red-500">
                    {formErrors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  <Link href="/recuperar-password" className="text-sm text-purple-600 hover:text-purple-700">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`border-2 focus-visible:ring-purple-500 ${formErrors.password ? "border-red-500" : ""}`}
                  disabled={isSubmitting || loginAttempts >= 5}
                  aria-invalid={!!formErrors.password}
                  aria-describedby={formErrors.password ? "password-error" : undefined}
                />
                {formErrors.password && (
                  <p id="password-error" className="text-sm text-red-500">
                    {formErrors.password}
                  </p>
                )}
              </div>

              {showRecaptcha && (
                <div className="my-4">
                  <EnhancedRecaptcha
                    onVerify={handleRecaptchaVerify}
                    theme="light"
                    size="normal"
                    onError={(error) => setError("Error al cargar el captcha: " + error.message)}
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                disabled={isSubmitting || loginAttempts >= 5}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4 mr-2" />
                )}
                Iniciar sesión
              </Button>

              <div className="text-center text-xs text-muted-foreground mt-2">
                <Shield className="h-3 w-3 inline mr-1" />
                Conexión segura con encriptación de extremo a extremo
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              ¿No tienes una cuenta?{" "}
              <Link href="/registro" className="text-purple-600 hover:text-purple-700 font-medium">
                Regístrate
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>

      <SecurityNotification
        open={showSecurity}
        onOpenChange={setShowSecurity}
        ip={securityInfo.ip}
        location={securityInfo.location}
        onConfirm={handleSecurityConfirm}
      />
    </div>
  )
}
