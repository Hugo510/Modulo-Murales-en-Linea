"use client"

import { useState, useEffect } from "react"
import { Check, X } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface PasswordStrengthMeterProps {
  password: string
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const [strength, setStrength] = useState(0)
  const [validations, setValidations] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  })

  useEffect(() => {
    // Validar requisitos de contraseña
    const checks = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[^A-Za-z0-9]/.test(password),
    }

    setValidations(checks)

    // Calcular fortaleza (0-100)
    const strengthChecks = Object.values(checks).filter(Boolean).length
    setStrength((strengthChecks / 5) * 100)
  }, [password])

  // Determinar el color de la barra de progreso
  const getStrengthColor = () => {
    if (strength < 40) return "bg-red-500"
    if (strength < 70) return "bg-amber-500"
    return "bg-green-500"
  }

  // Determinar el texto de fortaleza
  const getStrengthText = () => {
    if (strength < 40) return "Débil"
    if (strength < 70) return "Moderada"
    return "Fuerte"
  }

  return (
    <div className="space-y-2 mt-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Fortaleza de la contraseña: {getStrengthText()}</p>
        <p className="text-xs font-medium" style={{ color: getStrengthColor() }}>
          {Math.round(strength)}%
        </p>
      </div>
      <Progress value={strength} className={`h-1.5 ${getStrengthColor()}`} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
        <ValidationItem isValid={validations.minLength} text="Mínimo 8 caracteres" />
        <ValidationItem isValid={validations.hasUpperCase} text="Al menos una mayúscula" />
        <ValidationItem isValid={validations.hasLowerCase} text="Al menos una minúscula" />
        <ValidationItem isValid={validations.hasNumber} text="Al menos un número" />
        <ValidationItem isValid={validations.hasSpecialChar} text="Al menos un carácter especial" />
      </div>
    </div>
  )
}

interface ValidationItemProps {
  isValid: boolean
  text: string
}

function ValidationItem({ isValid, text }: ValidationItemProps) {
  return (
    <div className="flex items-center gap-2">
      {isValid ? <Check className="h-3.5 w-3.5 text-green-500" /> : <X className="h-3.5 w-3.5 text-muted-foreground" />}
      <span className={`text-xs ${isValid ? "text-green-700" : "text-muted-foreground"}`}>{text}</span>
    </div>
  )
}
