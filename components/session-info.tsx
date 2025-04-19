"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Laptop, Smartphone, Tablet, Monitor, MapPin, Clock, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import { formatLastActive, getCurrentDeviceInfo } from "@/services/session-service"
import { useEffect, useState } from "react"

export function SessionInfo() {
  const { currentSession, isAuthenticated, user } = useAuth()
  const [isLocalBypass, setIsLocalBypass] = useState(false)
  const [localSession, setLocalSession] = useState<any>(null)

  // Función para obtener información del dispositivo actual de manera segura
  const getSafeDeviceInfo = () => {
    try {
      if (typeof navigator !== 'undefined') {
        const ua = navigator.userAgent.toLowerCase();
        return {
          type: /(android|webos|iphone|ipad|ipod|blackberry|windows phone)/i.test(ua)
            ? (/ipad/i.test(ua) ? "Tablet" : "Mobile")
            : "Desktop",
          name: ua.includes('chrome')
            ? "Chrome"
            : (ua.includes('firefox')
              ? "Firefox"
              : (ua.includes('safari')
                ? "Safari"
                : "Navegador")),
          os: ua.includes('windows')
            ? "Windows"
            : (ua.includes('mac')
              ? "MacOS"
              : (ua.includes('linux')
                ? "Linux"
                : (ua.includes('android')
                  ? "Android"
                  : (ua.includes('iphone') || ua.includes('ipad')
                    ? "iOS"
                    : "Desconocido"))))
        };
      }
      return { type: "Desktop", name: "Navegador", os: "Desconocido" };
    } catch (e) {
      console.warn("Error obteniendo info de dispositivo:", e);
      return { type: "Desktop", name: "Navegador", os: "Desconocido" };
    }
  };

  // Cargamos información de sesión desde múltiples fuentes
  useEffect(() => {
    // Detectar bypass local
    if (!isAuthenticated && typeof window !== 'undefined') {
      const hasLoginSuccess = localStorage.getItem("login_success") === "true";
      const userId = localStorage.getItem("auth_user_id");

      if (hasLoginSuccess && userId) {
        setIsLocalBypass(true);
      }
    }

    // Intentar cargar información de sesión desde fallback
    if (!currentSession && typeof window !== 'undefined') {
      console.log("SessionInfo: Intentando cargar sesión desde localStorage o sessionStorage");
      try {
        // Buscar en múltiples ubicaciones
        const fallbackSession = localStorage.getItem("fallback_session") ||
          sessionStorage.getItem("fallback_session");

        if (fallbackSession) {
          console.log("SessionInfo: Encontrada información de sesión en storage local");
          const parsedSession = JSON.parse(fallbackSession);
          setLocalSession(parsedSession);
        } else {
          // Si no hay información guardada, generarla al vuelo
          console.log("SessionInfo: Generando información de sesión local");
          const deviceInfo = getSafeDeviceInfo();
          const newSession = {
            id: `local_${Date.now()}`,
            deviceInfo: deviceInfo,
            location: { city: "Tu ubicación", country: "Tu país" },
            lastActive: new Date().toISOString()
          };

          // Guardar para uso futuro
          localStorage.setItem("fallback_session", JSON.stringify(newSession));
          setLocalSession(newSession);
        }
      } catch (e) {
        console.warn("Error cargando/generando sesión:", e);
        // En caso de error, crear una sesión mínima
        setLocalSession({
          deviceInfo: getSafeDeviceInfo(),
          location: { city: "Ubicación local", country: "Tu país" },
          lastActive: new Date().toISOString()
        });
      }
    }
  }, [currentSession, isAuthenticated]);

  // Determinar qué info de sesión usar (currentSession, localSession, o datos generados)
  const getSessionToUse = () => {
    if (currentSession && currentSession.deviceInfo) {
      return currentSession;
    }

    if (localSession) {
      return localSession;
    }

    // Fallback final - generar datos sobre la marcha
    return {
      deviceInfo: getSafeDeviceInfo(),
      location: { city: "Tu ubicación", country: "Tu país" },
      lastActive: new Date().toISOString()
    };
  };

  const sessionToUse = getSessionToUse();

  // Si no hay autenticación ni bypass, mostrar mensaje estándar
  if (!isAuthenticated && !isLocalBypass) {
    return (
      <Card className="border-2 hover:shadow-md transition-all">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            Seguridad
          </CardTitle>
          <CardDescription>Inicia sesión para gestionar tus sesiones</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Inicia sesión para ver y gestionar tus sesiones activas en diferentes dispositivos.
          </p>
          <Link href="/login">
            <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              Iniciar sesión
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  // Función para obtener el icono del dispositivo
  const getDeviceIcon = () => {
    const deviceType = sessionToUse?.deviceInfo?.type?.toLowerCase() || "desktop";

    if (deviceType.includes("mobile")) {
      return <Smartphone className="h-5 w-5 text-pink-500" />;
    } else if (deviceType.includes("tablet")) {
      return <Tablet className="h-5 w-5 text-purple-500" />;
    } else {
      return <Laptop className="h-5 w-5 text-blue-500" />;
    }
  };

  // Renderizar información de sesión con los datos disponibles
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="border-2 hover:shadow-md transition-all overflow-hidden">
        <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardTitle className="text-lg flex items-center gap-2">
            {getDeviceIcon()}
            Sesión actual
          </CardTitle>
          <CardDescription>
            {isAuthenticated ? "Información sobre tu sesión actual" : "Tu sesión actual en este dispositivo"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm pt-4">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-1.5 rounded-full">
              <Monitor className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">Dispositivo</p>
              <p className="text-muted-foreground">
                {sessionToUse?.deviceInfo?.name || "Navegador"}
                ({sessionToUse?.deviceInfo?.os || "Desconocido"})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-purple-100 p-1.5 rounded-full">
              <MapPin className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="font-medium">Ubicación</p>
              <p className="text-muted-foreground">
                {sessionToUse?.location?.city || "Tu ubicación"},
                {sessionToUse?.location?.country || "Tu país"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-pink-100 p-1.5 rounded-full">
              <Clock className="h-4 w-4 text-pink-600" />
            </div>
            <div>
              <p className="font-medium">Última actividad</p>
              <p className="text-muted-foreground">
                {sessionToUse?.lastActive
                  ? formatLastActive(new Date(sessionToUse.lastActive))
                  : "Ahora mismo"}
              </p>
            </div>
          </div>

          <Link href="/perfil?tab=seguridad" className="block mt-2">
            <Button variant="outline" size="sm" className="w-full mt-2">
              Ver todas las sesiones
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  )
}
