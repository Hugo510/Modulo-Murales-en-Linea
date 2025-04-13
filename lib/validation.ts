import { z } from "zod"

// Esquemas de validación para reutilizar en front-end y back-end
export const userSchema = z.object({
  name: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(50, "El nombre no puede exceder los 50 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "La contraseña debe contener al menos una letra mayúscula")
    .regex(/[a-z]/, "La contraseña debe contener al menos una letra minúscula")
    .regex(/[0-9]/, "La contraseña debe contener al menos un número")
    .regex(/[^A-Za-z0-9]/, "La contraseña debe contener al menos un carácter especial"),
})

export const loginSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
})

export const muralSchema = z.object({
  title: z
    .string()
    .min(3, "El título debe tener al menos 3 caracteres")
    .max(100, "El título no puede exceder los 100 caracteres"),
  description: z.string().max(500, "La descripción no puede exceder los 500 caracteres").optional(),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
  background: z.string().optional(),
})

export const muralItemSchema = z.object({
  type: z.enum(["text", "image", "link", "video", "file", "drawing"]),
  content: z.string().min(1, "El contenido no puede estar vacío"),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  size: z.object({
    width: z.number().min(50, "El ancho mínimo es 50px"),
    height: z.number().min(50, "La altura mínima es 50px"),
  }),
  style: z.record(z.string(), z.string()).optional(),
})

// Función para validar datos en el cliente
export function validateForm<T>(
  schema: z.ZodType<T>,
  data: unknown,
): { success: boolean; data?: T; errors?: Record<string, string> } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      error.errors.forEach((err) => {
        if (err.path.length > 0) {
          const path = err.path.join(".")
          errors[path] = err.message
        }
      })
      return { success: false, errors }
    }
    return { success: false, errors: { _form: "Error de validación" } }
  }
}

// Función para sanitizar entradas (prevenir XSS)
export function sanitizeInput(input: string): string {
  return input.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;")
}

// Función para validar y sanitizar objetos completos
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: Record<string, any> = {}

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeInput(value)
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeObject(value)
    } else {
      sanitized[key] = value
    }
  }

  return sanitized as T
}
