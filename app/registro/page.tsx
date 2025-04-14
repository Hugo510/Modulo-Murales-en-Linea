'use client'

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, UserPlus, AlertCircle, ArrowLeft, Shield, CheckCircle } from "lucide-react"
import { EnhancedRecaptcha } from "@/components/enhanced-recaptcha"
import { PasswordStrengthMeter } from "@/components/password-strength-meter"
import { motion, AnimatePresence } from "framer-motion"
import { useCsrfToken } from "@/lib/csrf"
import { validateForm, userSchema } from "@/lib/validation"
import { useToast } from "@/components/ui/use-toast"

export default function RegistroPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
  const [csrfToken, setCsrfToken] = useState("")
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const { getCsrfToken } = useCsrfToken()
  const { toast } = useToast()

  const { register, isAuthenticated } = useAuth()
  const router = useRouter()

  // Obtener token CSRF al cargar
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const token = await getCsrfToken()
        setCsrfToken(token)
      } catch (error) {
        console.error("Error al obtener token CSRF:", error)
      }
    }

    fetchCsrfToken()
  }, [getCsrfToken])

  // Mover la redirección a un useEffect en lugar de hacerlo durante el renderizado
  useEffect(() => {
    // Si el usuario ya está autenticado, redirigir a la página principal
    if (isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, router])

  const handleRecaptchaVerify = (token: string | null) => {
    setRecaptchaToken(token)
    if (token) {
      setError("")
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setFormErrors({})

    // Validar formulario
    const formData = { name, email, password }
    const validation = validateForm(userSchema, formData)

    if (!validation.success) {
      setFormErrors(validation.errors || {})
      return
    }

    // Validación adicional para confirmar contraseña
    if (password !== confirmPassword) {
      setFormErrors({ ...formErrors, confirmPassword: "Las contraseñas no coinciden" })
      return
    }

    // Verificar reCAPTCHA
    if (!recaptchaToken) {
      setError("Por favor, completa la verificación de seguridad")
      return
    }

    setIsSubmitting(true)
    try {
      // Realizar registro con token CSRF
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({
          name,
          email,
          password,
          recaptchaToken,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          setError("El correo electrónico ya está en uso. Por favor, utiliza otro.")
        } else {
          setError(data.error || "Ocurrió un error al registrarse. Por favor, inténtalo de nuevo.")
        }
        setIsSubmitting(false)
        return
      }

      // Mostrar mensaje de éxito
      setRegistrationSuccess(true)
      toast({
        title: "¡Registro completado!",
        description: "Tu cuenta ha sido creada exitosamente. Serás redirigido al dashboard en unos momentos.",
        variant: "default",
        duration: 5000,
      })

      // Completar registro
      const success = await register(name, email, password)

      if (success) {
        // Esperar un momento para mostrar el mensaje de éxito antes de redirigir
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      } else {
        setError("Ocurrió un error al iniciar sesión. Por favor, intenta iniciar sesión manualmente.")
      }
    } catch (error) {
      console.error("Error al registrarse:", error)
      setError("Ocurrió un error al registrarse. Por favor, inténtalo de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)] py-8">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {registrationSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-2 border-green-200">
                <CardHeader className="text-center">
                  <div className="mx-auto bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-green-700">¡Registro exitoso!</CardTitle>
                  <CardDescription className="text-base">
                    Tu cuenta ha sido creada correctamente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-center">
                    <p>Hola <span className="font-semibold">{name}</span>, te damos la bienvenida a MuralApp.</p>
                    <p className="text-muted-foreground">
                      Serás redirigido al dashboard automáticamente en unos momentos...
                    </p>
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/dashboard")}
                  >
                    Ir al dashboard ahora
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-2">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-600">
                    Crear una cuenta
                  </CardTitle>
                  <CardDescription>Regístrate para comenzar a crear murales colaborativos</CardDescription>
                </CardHeader>
                <CardContent>
                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleRegister} className="space-y-4">
                    <input type="hidden" name="csrf_token" value={csrfToken} />

                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre completo</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Tu nombre"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`border-2 focus-visible:ring-purple-500 ${formErrors.name ? "border-red-500" : ""}`}
                        required
                        aria-invalid={!!formErrors.name}
                        aria-describedby={formErrors.name ? "name-error" : undefined}
                      />
                      {formErrors.name && (
                        <p id="name-error" className="text-sm text-red-500">
                          {formErrors.name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Correo electrónico</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@ejemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`border-2 focus-visible:ring-purple-500 ${formErrors.email ? "border-red-500" : ""}`}
                        required
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
                      <Label htmlFor="password">Contraseña</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`border-2 focus-visible:ring-purple-500 ${formErrors.password ? "border-red-500" : ""}`}
                        required
                        aria-invalid={!!formErrors.password}
                        aria-describedby={formErrors.password ? "password-error" : undefined}
                      />
                      {formErrors.password && (
                        <p id="password-error" className="text-sm text-red-500">
                          {formErrors.password}
                        </p>
                      )}
                      {password && <PasswordStrengthMeter password={password} />}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`border-2 focus-visible:ring-purple-500 ${formErrors.confirmPassword ? "border-red-500" : ""}`}
                        required
                        aria-invalid={!!formErrors.confirmPassword}
                        aria-describedby={formErrors.confirmPassword ? "confirm-password-error" : undefined}
                      />
                      {formErrors.confirmPassword && (
                        <p id="confirm-password-error" className="text-sm text-red-500">
                          {formErrors.confirmPassword}
                        </p>
                      )}
                    </div>

                    <div className="my-4">
                      <EnhancedRecaptcha
                        onVerify={handleRecaptchaVerify}
                        theme="light"
                        size="normal"
                        onError={(error) => setError("Error al cargar el captcha: " + error.message)}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <UserPlus className="h-4 w-4 mr-2" />
                      )}
                      Crear cuenta
                    </Button>

                    <div className="text-center text-xs text-muted-foreground mt-2">
                      <Shield className="h-3 w-3 inline mr-1" />
                      Tus datos están protegidos con encriptación de extremo a extremo
                    </div>
                  </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <div className="text-center text-sm text-muted-foreground">
                    <p>
                      Al registrarte, aceptas nuestros{" "}
                      <Link href="#" className="text-purple-600 hover:underline">
                        Términos de servicio
                      </Link>{" "}
                      y{" "}
                      <Link href="#" className="text-purple-600 hover:underline">
                        Política de privacidad
                      </Link>
                      .
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <Link href="/login" className="flex items-center text-sm text-purple-600 hover:underline">
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Volver a inicio de sesión
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
