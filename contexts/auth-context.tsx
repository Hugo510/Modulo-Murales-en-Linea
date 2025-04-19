"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { logAuth } from "@/lib/auth-logger"
import { isRedirectionInProgress, clearRedirectionState } from "@/lib/auth-redirect"

// Definir el tipo para el usuario
interface User {
  id: string
  name: string
  email: string
  role: string
}

// Agregar tipo para información de dispositivo
interface DeviceInfo {
  type: string;
  name: string;
  os: string;
}

// Agregar tipo para información de ubicación
interface LocationInfo {
  city: string;
  country: string;
}

// Definir el tipo para la sesión
interface SessionInfo {
  id: string
  deviceInfo: DeviceInfo
  location: LocationInfo
  lastActive: string
  ip?: string
  userAgent?: string
}

// Actualizar el tipo para el contexto de autenticación
interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  currentSession: SessionInfo | null // Agregar currentSession
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  checkSuspiciousActivity: (userId: string) => Promise<boolean>
}

// Crear el contexto con un valor predeterminado actualizado
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  currentSession: null, // Agregar valor por defecto
  login: async () => false,
  register: async () => false,
  logout: async () => { },
  checkSuspiciousActivity: async () => false,
})

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => useContext(AuthContext)

// Agregar esta función al principio del archivo, antes de la definición del componente AuthProvider
function detectLocalAuthentication(): { userId: string | null, isRecent: boolean } {
  if (typeof window === 'undefined') return { userId: null, isRecent: false };

  const userId = localStorage.getItem("auth_user_id");
  const timestamp = localStorage.getItem("login_timestamp");
  const isRecent = timestamp && (Date.now() - parseInt(timestamp)) < 120000; // 2 minutos

  return { userId, isRecent: !!userId && isRecent };
}

// Proveedor de autenticación
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [authReady, setAuthReady] = useState(false)
  const [currentSession, setCurrentSession] = useState<SessionInfo | null>(null) // Agregar estado para sesión actual
  const router = useRouter()
  const authTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const authAttempts = useRef(0)

  // Función auxiliar para determinar el tipo de dispositivo
  function getDeviceInfo(): DeviceInfo {
    if (typeof window === 'undefined') {
      return { type: "Unknown", name: "Servidor", os: "Unknown" };
    }

    const userAgent = window.navigator.userAgent.toLowerCase();

    let type = "Desktop";
    if (/(android|webos|iphone|ipad|ipod|blackberry|windows phone)/i.test(userAgent)) {
      type = /ipad/i.test(userAgent) ? "Tablet" : "Mobile";
    }

    let name = "Navegador";
    if (userAgent.indexOf("firefox") > -1) name = "Firefox";
    else if (userAgent.indexOf("chrome") > -1) name = "Chrome";
    else if (userAgent.indexOf("safari") > -1) name = "Safari";
    else if (userAgent.indexOf("edge") > -1) name = "Edge";
    else if (userAgent.indexOf("opera") > -1) name = "Opera";

    let os = "Desconocido";
    if (userAgent.indexOf("windows") > -1) os = "Windows";
    else if (userAgent.indexOf("mac") > -1) os = "MacOS";
    else if (userAgent.indexOf("linux") > -1) os = "Linux";
    else if (userAgent.indexOf("android") > -1) os = "Android";
    else if (userAgent.indexOf("iphone") > -1 || userAgent.indexOf("ipad") > -1) os = "iOS";

    return { type, name, os };
  }

  // Añadir función para obtener información de sesión con manejo de errores mucho más robusto
  const getSessionInfo = useCallback(async (userId: string) => {
    try {
      if (!userId) return null;

      // Obtener información del dispositivo actual basado en User-Agent
      const deviceInfo = getDeviceInfo();

      // Crear una sesión básica con la información del dispositivo actual
      const basicSession: SessionInfo = {
        id: crypto.randomUUID(),
        deviceInfo: deviceInfo,
        location: { city: "Desconocida", country: "Desconocido" },
        lastActive: new Date().toISOString(),
      };

      // Primero intentar recuperar un fallback de sesión guardado en localStorage/sessionStorage
      try {
        const fallbackSession = localStorage.getItem("fallback_session") || sessionStorage.getItem("fallback_session");
        if (fallbackSession) {
          const parsedSession = JSON.parse(fallbackSession);
          if (parsedSession && parsedSession.deviceInfo) {
            console.log("[Auth] Usando información de sesión fallback");
            setCurrentSession(parsedSession);

            // Intentar actualizar asíncronamente sin bloquear
            setTimeout(async () => {
              try {
                await fetchSessionInfo(userId);
              } catch (e) {
                console.warn("[Auth] No se pudo actualizar información de sesión fallback:", e);
              }
            }, 1000);

            return parsedSession;
          }
        }
      } catch (fallbackError) {
        console.warn("[Auth] Error al recuperar sesión fallback:", fallbackError);
      }

      // Establecer información básica de sesión inmediatamente para evitar estado vacío
      setCurrentSession(basicSession);

      // Intentar obtener información detallada del servidor
      const sessionResult = await fetchSessionInfo(userId);
      if (sessionResult) {
        return sessionResult;
      }

      return basicSession;
    } catch (error) {
      console.error("[Auth] Error general al crear información de sesión:", error);

      // Crear una sesión fallback genérica en caso de error
      const fallbackSession: SessionInfo = {
        id: crypto.randomUUID(),
        deviceInfo: {
          type: "Desktop",
          name: "Navegador",
          os: "Desconocido",
        },
        location: { city: "Desconocida", country: "Desconocido" },
        lastActive: new Date().toISOString(),
      };

      setCurrentSession(fallbackSession);
      return fallbackSession;
    }
  }, []);

  // Función para obtener la sesión del servidor, aislada para mejor manejo de errores
  const fetchSessionInfo = async (userId: string): Promise<SessionInfo | null> => {
    try {
      console.log("[Auth] Obteniendo información detallada de sesión del servidor...");

      // Crear URL con timestamp para evitar caché
      const timestamp = Date.now();
      const apiUrl = `/api/user/sessions/current?_ts=${timestamp}`;

      // Realizar la solicitud al servidor con timeout limitado
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      try {
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store",
            "Pragma": "no-cache"
          },
          signal: controller.signal,
          cache: "no-store",
          credentials: "include"
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const sessionData = await response.json();

          if (sessionData && sessionData.session) {
            console.log("[Auth] Información de sesión recibida del servidor:", sessionData.session);

            setCurrentSession(sessionData.session);

            // Guardar en localStorage y sessionStorage para respaldo
            try {
              localStorage.setItem("fallback_session", JSON.stringify(sessionData.session));
              sessionStorage.setItem("fallback_session", JSON.stringify(sessionData.session));
              console.log("[Auth] Información de sesión guardada como fallback");
            } catch (storageError) {
              console.warn("[Auth] Error al guardar sesión en storage:", storageError);
            }

            return sessionData.session;
          } else if (sessionData.warning) {
            console.warn("[Auth] Advertencia del servidor:", sessionData.warning);
          }
        } else {
          console.warn("[Auth] API de sesiones respondió con código:", response.status);
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (fetchError) {
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.warn("[Auth] Timeout al obtener información de sesión");
      } else {
        console.error("[Auth] Error al obtener información de sesión del servidor:", fetchError);
      }

      // Generar datos locales como fallback
      const offlineSession = generateOfflineSessionInfo(userId);
      setCurrentSession(offlineSession);

      // Guardar para uso futuro
      try {
        localStorage.setItem("fallback_session", JSON.stringify(offlineSession));
        sessionStorage.setItem("fallback_session", JSON.stringify(offlineSession));
      } catch (e) {
        console.warn("[Auth] Error al guardar sesión fallback:", e);
      }

      return offlineSession;
    }

    return null;
  };

  // Generar información de sesión offline
  const generateOfflineSessionInfo = (userId: string): SessionInfo => {
    const deviceInfo = getDeviceInfo();
    return {
      id: `local_${Date.now()}`,
      deviceInfo: deviceInfo,
      location: {
        city: "Local",
        country: "Tu país"
      },
      lastActive: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      ip: "local"
    };
  };

  // Mejora para manejar errores de red en obtención de usuario
  const getCurrentUser = useCallback(async () => {
    try {
      console.log("[Auth] Obteniendo usuario actual...");
      authAttempts.current += 1;

      // Si hemos intentado demasiadas veces, verificar login reciente
      if (authAttempts.current > 3) {
        console.warn("[Auth] Múltiples intentos de autenticación, verificando alternativas...");

        // Verificar si hay indicador de login reciente en localStorage
        const { userId, isRecent } = detectLocalAuthentication();
        if (userId && isRecent) {
          console.log("[Auth] Detectado login reciente, permitiendo acceso provisional");

          // Permitimos acceso con datos locales
          const provisionalUser = {
            id: userId,
            name: localStorage.getItem("auth_user_name") || "Usuario",
            email: localStorage.getItem("auth_user_email") || "",
            role: localStorage.getItem("auth_user_role") || "user"
          };

          setUser(provisionalUser);
          setIsAuthenticated(true);
          setIsLoading(false);
          setAuthReady(true);

          // Programar un reintento cuando haya mejorado la conexión
          setTimeout(() => {
            authAttempts.current = 0;
            getCurrentUser().catch(err =>
              console.warn("[Auth] Error en reintento automático:", err)
            );
          }, 5000);

          return provisionalUser;
        }
      }

      const supabase = getSupabaseClient();

      console.log("[Auth] Solicitando sesión a Supabase...");

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("[Auth] Error de sesión:", sessionError);
        throw sessionError;
      }

      if (!sessionData.session) {
        console.log("[Auth] No hay sesión activa");
        setUser(null);
        setIsAuthenticated(false);
        setCurrentSession(null); // Limpiar sesión
        setIsLoading(false);
        setAuthReady(true);
        return null;
      }

      console.log("[Auth] Sesión encontrada, obteniendo datos de usuario...");

      setIsAuthenticated(true);
      setIsLoading(false);
      setAuthReady(true);

      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData.user) {
        console.error("[Auth] Error al obtener usuario:", userError);
        throw userError || new Error("No se pudo obtener el usuario");
      }

      const userInfo: User = {
        id: userData.user.id,
        name: userData.user.user_metadata?.name || "Usuario",
        email: userData.user.email || "",
        role: userData.user.user_metadata?.role || "user",
      };

      console.log("[Auth] Usuario autenticado:", userInfo.name, "con ID:", userInfo.id);

      setUser(userInfo);

      // Actualizar información de sesión
      getSessionInfo(userInfo.id);

      return userInfo;
    } catch (error) {
      console.error("[Auth] Error al obtener usuario actual:", error);

      // En caso de error de red específicamente, verificar login_success
      if (error instanceof Error &&
        (error.message.includes("Failed to fetch") ||
          error.name.includes("AuthRetryableFetchError"))) {

        console.log("[Auth] Error de red detectado, verificando login reciente en localStorage");
        const loginSuccess = localStorage.getItem("login_success");
        const userId = localStorage.getItem("auth_user_id");
        const timestamp = localStorage.getItem("login_timestamp");
        const isRecent = timestamp && (Date.now() - parseInt(timestamp)) < 60000; // 60 segundos

        if (loginSuccess === "true" && userId && isRecent) {
          console.log("[Auth] Usando datos de localStorage para autenticación provisional");
          // Permitir autenticación basada en localStorage
          const provisionalUser = {
            id: userId,
            name: localStorage.getItem("auth_user_name") || "Usuario",
            email: localStorage.getItem("auth_user_email") || "",
            role: localStorage.getItem("auth_user_role") || "user"
          };

          setUser(provisionalUser);
          setIsAuthenticated(true);
          setIsLoading(false);
          setAuthReady(true);

          // Programar un reintento después de un tiempo
          setTimeout(() => {
            console.log("[Auth] Reintentando obtención de usuario después de error de red");
            // Reintentar obtener el usuario completo
            authAttempts.current = 0; // Reset contador para permitir nuevos intentos
            getCurrentUser();
          }, 2000);

          return provisionalUser;
        }
      }

      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      setAuthReady(true);
      return null;
    }
  }, [getSessionInfo]);

  useEffect(() => {
    let isMounted = true;

    authTimeoutRef.current = setTimeout(() => {
      if (isLoading) {
        console.warn("Timeout de autenticación alcanzado, finalizando estado de carga.");
        setIsLoading(false);
        setAuthReady(true);
      }
    }, 10000);

    // Añadir verificación inicial de datos locales
    const { userId, isRecent } = detectLocalAuthentication();
    if (userId && isRecent) {
      console.log("[Auth] Detectados datos de autenticación local, inicializando estado...");
      // Configura un estado inicial basado en localStorage
      const localUser = {
        id: userId,
        name: localStorage.getItem("auth_user_name") || "Usuario",
        email: localStorage.getItem("auth_user_email") || "",
        role: localStorage.getItem("auth_user_role") || "user"
      };
      setUser(localUser);
      setIsAuthenticated(true);
    }

    const checkAuth = async () => {
      try {
        console.log("Realizando verificación inicial de autenticación...");
        if (isMounted) {
          await getCurrentUser();
        }
      } catch (error) {
        console.error("Error en verificación inicial:", error);
        if (isMounted) {
          setIsLoading(false);
          setAuthReady(true);
        }
      }
    }

    checkAuth();

    const supabase = getSupabaseClient();

    console.log("Configurando suscripción a eventos de autenticación...");
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Evento de autenticación recibido:", event);

      if (!isMounted) return;

      authAttempts.current = 0;

      if (event === "SIGNED_IN") {
        console.log("Usuario ha iniciado sesión, actualizando estado...");
        try {
          await getCurrentUser();
          console.log("Estado de autenticación actualizado después de SIGNED_IN:", {
            isAuthenticated,
            isLoading: false
          });
        } catch (error) {
          console.error("Error al procesar evento SIGNED_IN:", error);
        }
      } else if (event === "TOKEN_REFRESHED") {
        console.log("Token actualizado, refrescando datos de usuario...");
        await getCurrentUser();
      } else if (event === "SIGNED_OUT") {
        console.log("Usuario ha cerrado sesión");
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        setCurrentSession(null); // Limpiar sesión
      } else if (event === "USER_UPDATED") {
        console.log("Información de usuario actualizada");
        await getCurrentUser();
      }
    });

    return () => {
      isMounted = false;

      if (authTimeoutRef.current) {
        clearTimeout(authTimeoutRef.current);
      }

      subscription.unsubscribe();
      console.log("Limpieza: suscripción a eventos de autenticación cancelada");
    }
  }, [getCurrentUser]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Si hay una redirección en curso, no interfiera con ella
    if (isRedirectionInProgress()) {
      console.log("[Auth] Redirección especializada en curso, evitando interferencias");
      return;
    }

    // Solo limpiar datos de redirección si el usuario está autenticado
    if (isAuthenticated && user) {
      console.log("[Auth] Usuario autenticado, limpiando indicadores de redirección");

      // Limpiar todos los indicadores de redirección
      clearRedirectionState();

      // Conservar información de usuario pero limpiar flags de login exitoso
      if (localStorage.getItem("login_success") === "true") {
        console.log("[Auth] Usuario ya autenticado, limpiando flags de login_success");
        localStorage.removeItem("login_success");
        localStorage.removeItem("login_timestamp");
      }
    }
  }, [isAuthenticated, user]);

  // Añadir un efecto específico para verificar si hay un usuario autenticado
  useEffect(() => {
    console.log("AuthProvider: Verificando estado de autenticación...");
    const supabase = getSupabaseClient();

    // Función para obtener y establecer usuario actual
    const initUserFromSession = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();

        if (sessionData?.session?.user) {
          const userData = sessionData.session.user;
          console.log("Usuario autenticado encontrado:", userData.id);

          // Crear objeto de usuario y establecerlo en el estado
          const userInfo: User = {
            id: userData.id,
            name: userData.user_metadata?.name || "Usuario",
            email: userData.email || "",
            role: userData.user_metadata?.role || "user",
          };

          setUser(userInfo);
          setIsAuthenticated(true);

          // Guardar ID en localStorage para referencia
          localStorage.setItem("auth_user_id", userInfo.id);
          localStorage.setItem("login_timestamp", Date.now().toString());

          console.log("Estado de autenticación establecido:", userInfo);
        } else {
          console.log("No hay sesión activa");
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error verificando sesión:", error);
      } finally {
        setIsLoading(false);
        setAuthReady(true);
      }
    };

    // Ejecutar inmediatamente
    initUserFromSession();

  }, []);

  const login = async (email: string, password: string) => {
    console.log("[Auth] Iniciando proceso de login para:", email);
    const loginStart = performance.now();

    try {
      const supabase = getSupabaseClient();

      logAuth({
        action: "auth_attempt",
        email,
        info: "Inicio de intento de autenticación",
        level: "info"
      });

      console.log("[Auth] Llamando a signInWithPassword...");
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      const loginDuration = performance.now() - loginStart;

      if (error) {
        const errorDetails = {
          code: error.code || "unknown_error_code",
          name: error.name,
          status: error?.status || 0,
          message: error.message,
          duration: loginDuration,
        };

        console.error("[Auth] Error en login:", errorDetails);

        logAuth({
          action: "auth_error",
          email,
          error: errorDetails,
          info: `Error al autenticar: ${error.message}`,
          level: "error"
        });

        if (error.message?.includes("Invalid login credentials")) {
          logAuth({
            action: "invalid_credentials",
            email,
            info: "Intento con credenciales incorrectas",
            level: "warn"
          });
        } else if (error.message?.includes("rate limit")) {
          logAuth({
            action: "rate_limited",
            email,
            info: "Límite de intentos excedido",
            level: "warn"
          });
        }

        return false;
      }

      console.log(`[Auth] Login exitoso, sesión creada en ${Math.round(loginDuration)}ms`);

      logAuth({
        action: "auth_success",
        email,
        info: `Autenticación exitosa. Duración: ${Math.round(loginDuration)}ms`,
        level: "info",
        metadata: {
          userId: data.user?.id,
          authProvider: "email",
          sessionExpiry: data.session?.expires_at
        }
      });

      try {
        // Actualizar estado inmediatamente
        const userInfo = {
          id: data.user.id,
          name: data.user.user_metadata?.name || "Usuario",
          email: data.user.email || "",
          role: data.user.user_metadata?.role || "user",
        };

        // No guardar flags de redirección aquí - sólo datos del usuario
        localStorage.setItem("auth_user_id", userInfo.id);
        localStorage.setItem("auth_user_name", userInfo.name);
        localStorage.setItem("auth_user_email", userInfo.email);
        localStorage.setItem("auth_user_role", userInfo.role);

        setUser(userInfo);
        setIsAuthenticated(true);
        setIsLoading(false);

        console.log("[Auth] Estado de autenticación actualizado correctamente:", {
          user: userInfo.name,
          authenticated: true
        });

        // Inicializar información básica de sesión inmediatamente
        const deviceInfo = getDeviceInfo();
        const basicSession: SessionInfo = {
          id: crypto.randomUUID(),
          deviceInfo: deviceInfo,
          location: { city: "Tu ubicación", country: "Tu país" },
          lastActive: new Date().toISOString(),
        };

        // Guardar como fallback inmediatamente en AMBOS storages
        try {
          localStorage.setItem("fallback_session", JSON.stringify(basicSession));
          sessionStorage.setItem("fallback_session", JSON.stringify(basicSession));
        } catch (e) {
          console.warn("[Auth] Error guardando sesión fallback:", e);
        }

        setCurrentSession(basicSession);

        // Iniciar obtención de detalles en segundo plano
        setTimeout(async () => {
          try {
            await getSessionInfo(userInfo.id);
          } catch (err) {
            console.warn("[Auth] Error secundario obteniendo sesión:", err);
          }
        }, 500);

        return true;
      } catch (stateError) {
        console.error("[Auth] Error al actualizar estado después del login:", stateError);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("[Auth] Error completo en login:", error);

      logAuth({
        action: "auth_unhandled_error",
        email,
        error,
        info: `Error no controlado: ${errorMessage}`,
        level: "error"
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    console.log("Iniciando proceso de registro para:", email);
    setIsLoading(true)

    try {
      const supabase = getSupabaseClient()

      console.log("Intentando registrar usuario...");
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: "user"
          }
        }
      })

      if (error) {
        console.error("Error en registro:", error);
        throw error
      }

      console.log("Registro exitoso, iniciando sesión automáticamente...");

      return await login(email, password)
    } catch (error) {
      console.error("Error completo en registro:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    console.log("Cerrando sesión...");
    setIsLoading(true)

    try {
      const supabase = getSupabaseClient()
      await supabase.auth.signOut()

      setUser(null)
      setIsAuthenticated(false)
      setCurrentSession(null) // Limpiar sesión

      console.log("Sesión cerrada con éxito");
      router.push('/login')
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const checkSuspiciousActivity = async (userId: string) => {
    return false
  }

  const value = {
    user,
    isAuthenticated,
    isLoading,
    currentSession,
    login,
    register,
    logout,
    checkSuspiciousActivity
  }

  if (!authReady) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
