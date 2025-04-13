// Definición de tipos para las sesiones
export interface Session {
  id: string
  userId: string
  deviceInfo: {
    type: string
    name: string
    browser: string
    os: string
  }
  location: {
    city: string
    country: string
  }
  ip: string
  lastActive: Date
  createdAt: Date
  isCurrentSession: boolean
  permissions?: {
    canEdit: boolean
    canDelete: boolean
    canShare: boolean
    canExport: boolean
  }
  status: "active" | "idle" | "expired"
  expiresAt?: Date
  lastNotified?: Date
}

// Función para obtener información del dispositivo actual
export function getCurrentDeviceInfo() {
  // En un entorno real, usaríamos una biblioteca como ua-parser-js
  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : ""
  let deviceType = "Desktop"
  let os = "Unknown"
  let browser = "Unknown"
  let deviceName = "Computer"

  // Detección básica de dispositivo
  if (/Mobi|Android/i.test(userAgent)) {
    deviceType = "Mobile"
    deviceName = "Smartphone"
    if (/iPad|Tablet/i.test(userAgent)) {
      deviceType = "Tablet"
      deviceName = "Tablet"
    }
  }

  // Detección básica de sistema operativo
  if (/Windows/i.test(userAgent)) os = "Windows"
  else if (/Macintosh|Mac OS/i.test(userAgent)) os = "macOS"
  else if (/Linux/i.test(userAgent)) os = "Linux"
  else if (/Android/i.test(userAgent)) os = "Android"
  else if (/iPhone|iPad|iPod/i.test(userAgent)) os = "iOS"

  // Detección básica de navegador
  if (/Chrome/i.test(userAgent)) browser = "Chrome"
  else if (/Firefox/i.test(userAgent)) browser = "Firefox"
  else if (/Safari/i.test(userAgent)) browser = "Safari"
  else if (/Edge/i.test(userAgent)) browser = "Edge"
  else if (/Opera|OPR/i.test(userAgent)) browser = "Opera"

  return {
    type: deviceType,
    name: deviceName,
    browser,
    os,
  }
}

// Función para obtener la ubicación actual (simulada)
export async function getCurrentLocation(): Promise<Session["location"]> {
  // En un entorno real, usaríamos un servicio de geolocalización por IP
  // Aquí simplemente simulamos una respuesta
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        city: "Madrid",
        country: "España",
      })
    }, 500)
  })
}

// Función para obtener la IP actual (simulada)
export async function getCurrentIp(): Promise<string> {
  // En un entorno real, usaríamos un servicio para obtener la IP
  return "192.168.1.1"
}

// Función para crear una nueva sesión
export async function createSession(userId: string): Promise<Session> {
  const deviceInfo = getCurrentDeviceInfo()
  const location = await getCurrentLocation()
  const ip = await getCurrentIp()

  // Establecer fecha de expiración (24 horas por defecto)
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 24)

  const session: Session = {
    id: generateSessionId(),
    userId,
    deviceInfo,
    location,
    ip,
    lastActive: new Date(),
    createdAt: new Date(),
    isCurrentSession: true,
    status: "active",
    expiresAt,
    permissions: {
      canEdit: true,
      canDelete: true,
      canShare: true,
      canExport: true,
    },
  }

  // Guardar la sesión en localStorage
  saveSession(session)

  return session
}

// Función para generar un ID de sesión único
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// Función para guardar una sesión en localStorage
function saveSession(session: Session): void {
  // Obtener sesiones existentes
  const sessions = getSessions()

  // Añadir o actualizar la sesión
  const existingSessionIndex = sessions.findIndex((s) => s.id === session.id)
  if (existingSessionIndex >= 0) {
    sessions[existingSessionIndex] = session
  } else {
    sessions.push(session)
  }

  // Guardar en localStorage
  localStorage.setItem("sessions", JSON.stringify(sessions))
}

// Función para obtener todas las sesiones del usuario
export function getSessions(): Session[] {
  const sessionsJson = localStorage.getItem("sessions")
  if (!sessionsJson) return []

  try {
    return JSON.parse(sessionsJson)
  } catch (error) {
    console.error("Error parsing sessions:", error)
    return []
  }
}

// Función para obtener la sesión actual
export function getCurrentSession(): Session | null {
  const sessions = getSessions()
  return sessions.find((session) => session.isCurrentSession) || null
}

// Función para actualizar la última actividad de una sesión
export function updateSessionActivity(sessionId: string): void {
  const sessions = getSessions()
  const sessionIndex = sessions.findIndex((s) => s.id === sessionId)

  if (sessionIndex >= 0) {
    sessions[sessionIndex].lastActive = new Date()
    sessions[sessionIndex].status = "active"
    localStorage.setItem("sessions", JSON.stringify(sessions))
  }
}

// Función para cerrar una sesión específica
export function closeSession(sessionId: string): void {
  let sessions = getSessions()
  sessions = sessions.filter((s) => s.id !== sessionId)
  localStorage.setItem("sessions", JSON.stringify(sessions))
}

// Función para cerrar todas las sesiones excepto la actual
export function closeAllOtherSessions(): void {
  const currentSession = getCurrentSession()
  if (!currentSession) return

  let sessions = getSessions()
  sessions = sessions.filter((s) => s.id === currentSession.id)
  localStorage.setItem("sessions", JSON.stringify(sessions))
}

// Función para cerrar todas las sesiones
export function closeAllSessions(): void {
  localStorage.removeItem("sessions")
}

// Función para verificar si una sesión ha expirado
export function checkSessionExpiration(session: Session): boolean {
  if (!session.expiresAt) return false

  const now = new Date()
  const expiresAt = new Date(session.expiresAt)

  return now > expiresAt
}

// Función para marcar una sesión como inactiva
export function markSessionAsIdle(sessionId: string): void {
  const sessions = getSessions()
  const sessionIndex = sessions.findIndex((s) => s.id === sessionId)

  if (sessionIndex >= 0) {
    sessions[sessionIndex].status = "idle"
    localStorage.setItem("sessions", JSON.stringify(sessions))
  }
}

// Función para extender la duración de una sesión
export function extendSession(sessionId: string, hours = 24): void {
  const sessions = getSessions()
  const sessionIndex = sessions.findIndex((s) => s.id === sessionId)

  if (sessionIndex >= 0) {
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + hours)

    sessions[sessionIndex].expiresAt = expiresAt
    sessions[sessionIndex].status = "active"
    localStorage.setItem("sessions", JSON.stringify(sessions))
  }
}

// Función para actualizar los permisos de una sesión
export function updateSessionPermissions(sessionId: string, permissions: Partial<Session["permissions"]>): void {
  const sessions = getSessions()
  const sessionIndex = sessions.findIndex((s) => s.id === sessionId)

  if (sessionIndex >= 0 && sessions[sessionIndex].permissions) {
    sessions[sessionIndex].permissions = {
      ...sessions[sessionIndex].permissions,
      ...permissions,
    }
    localStorage.setItem("sessions", JSON.stringify(sessions))
  }
}

// Función para verificar si hay conflictos entre sesiones
export function checkSessionConflicts(userId: string): boolean {
  const sessions = getSessions().filter((s) => s.userId === userId && s.status === "active")

  // Verificar si hay más de un dispositivo del mismo tipo activo
  const deviceTypes = new Set<string>()
  for (const session of sessions) {
    if (deviceTypes.has(session.deviceInfo.type)) {
      return true // Hay un conflicto
    }
    deviceTypes.add(session.deviceInfo.type)
  }

  return false
}

// Función para simular sesiones de ejemplo para un usuario
export function generateMockSessions(userId: string): Session[] {
  const currentDate = new Date()

  // Establecer fechas de expiración
  const expiresAt1 = new Date()
  expiresAt1.setHours(expiresAt1.getHours() + 24)

  const expiresAt2 = new Date()
  expiresAt2.setHours(expiresAt2.getHours() + 12)

  const expiresAt3 = new Date()
  expiresAt3.setHours(expiresAt3.getHours() + 6)

  const mockSessions: Session[] = [
    {
      id: "session_1",
      userId,
      deviceInfo: {
        type: "Desktop",
        name: "Computer",
        browser: "Chrome",
        os: "Windows",
      },
      location: {
        city: "Madrid",
        country: "España",
      },
      ip: "192.168.1.1",
      lastActive: new Date(),
      createdAt: new Date(),
      isCurrentSession: true,
      status: "active",
      expiresAt: expiresAt1,
      permissions: {
        canEdit: true,
        canDelete: true,
        canShare: true,
        canExport: true,
      },
    },
    {
      id: "session_2",
      userId,
      deviceInfo: {
        type: "Mobile",
        name: "iPhone 13",
        browser: "Safari",
        os: "iOS",
      },
      location: {
        city: "Madrid",
        country: "España",
      },
      ip: "192.168.1.2",
      lastActive: new Date(currentDate.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 días atrás
      createdAt: new Date(currentDate.getTime() - 10 * 24 * 60 * 60 * 1000),
      isCurrentSession: false,
      status: "idle",
      expiresAt: expiresAt2,
      permissions: {
        canEdit: true,
        canDelete: false,
        canShare: true,
        canExport: false,
      },
    },
    {
      id: "session_3",
      userId,
      deviceInfo: {
        type: "Desktop",
        name: "MacBook Pro",
        browser: "Firefox",
        os: "macOS",
      },
      location: {
        city: "Barcelona",
        country: "España",
      },
      ip: "192.168.1.3",
      lastActive: new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 días atrás
      createdAt: new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000),
      isCurrentSession: false,
      status: "expired",
      expiresAt: expiresAt3,
      permissions: {
        canEdit: false,
        canDelete: false,
        canShare: true,
        canExport: true,
      },
    },
  ]

  return mockSessions
}

// Función para formatear la fecha de última actividad
export function formatLastActive(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return "Ahora mismo"
  if (diffMins < 60) return `Hace ${diffMins} ${diffMins === 1 ? "minuto" : "minutos"}`
  if (diffHours < 24) return `Hace ${diffHours} ${diffHours === 1 ? "hora" : "horas"}`
  if (diffDays < 30) return `Hace ${diffDays} ${diffDays === 1 ? "día" : "días"}`

  return date.toLocaleDateString()
}

// Función para formatear la fecha de expiración
export function formatExpiresAt(date: Date): string {
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()

  if (diffMs <= 0) return "Expirada"

  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffHours < 1) return `Expira en ${diffMins} ${diffMins === 1 ? "minuto" : "minutos"}`
  if (diffHours < 24) return `Expira en ${diffHours} ${diffHours === 1 ? "hora" : "horas"}`
  if (diffDays < 30) return `Expira en ${diffDays} ${diffDays === 1 ? "día" : "días"}`

  return `Expira el ${date.toLocaleDateString()}`
}
