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

// Definir el tipo para el contexto de autenticación
interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  checkSuspiciousActivity: (userId: string) => Promise<boolean>
}

// Crear el contexto con un valor predeterminado
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  register: async () => false,
  logout: async () => { },
  checkSuspiciousActivity: async () => false,
})

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => useContext(AuthContext)

// Proveedor de autenticación
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [authReady, setAuthReady] = useState(false)
  const router = useRouter()
  const authTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const authAttempts = useRef(0)

  // Mejora para manejar errores de red en obtención de usuario
  const getCurrentUser = useCallback(async () => {
    try {
      console.log("[Auth] Obteniendo usuario actual...");
      authAttempts.current += 1;

      // Si hemos intentado demasiadas veces, dejar de intentar
      if (authAttempts.current > 3) {
        console.warn("[Auth] Demasiados intentos de autenticación, finalizando proceso.");

        // Verificar si hay un indicador de login reciente en localStorage
        const loginSuccess = localStorage.getItem("login_success");
        const userId = localStorage.getItem("auth_user_id");
        const timestamp = localStorage.getItem("login_timestamp");
        const isRecent = timestamp && (Date.now() - parseInt(timestamp)) < 60000; // 60 segundos

        if (loginSuccess === "true" && userId && isRecent) {
          console.log("[Auth] Detectado login reciente a pesar del fallo de red, permitiendo acceso provisional");
          // Permitimos acceso con datos mínimos basados en localStorage
          const provisionalUser = {
            id: userId,
            name: localStorage.getItem("auth_user_name") || "Usuario",
            email: localStorage.getItem("auth_user_email") || "",
            role: localStorage.getItem("auth_user_role") || "user"
          };

          setUser(provisionalUser);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }

        setIsLoading(false);
        setAuthReady(true);
        return null;
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
  }, []);

  useEffect(() => {
    let isMounted = true;

    authTimeoutRef.current = setTimeout(() => {
      if (isLoading) {
        console.warn("Timeout de autenticación alcanzado, finalizando estado de carga.");
        setIsLoading(false);
        setAuthReady(true);
      }
    }, 10000);

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
