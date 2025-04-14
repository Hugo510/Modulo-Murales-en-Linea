"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();
    const [initializing, setInitializing] = useState(true);
    const [bypassAuth, setBypassAuth] = useState(false);
    const authCheckCount = useRef(0);
    const maxAuthRetries = 5; // Aumentado para dar más tiempo
    const [lastAuthCheck, setLastAuthCheck] = useState(0);

    useEffect(() => {
        // Primero, verificar si acabamos de llegar de una redirección
        if (typeof window !== 'undefined') {
            const isRedirect = new URLSearchParams(window.location.search).get("_auth_redirect") === "true";

            if (isRedirect) {
                console.log("Dashboard Layout: Detectada llegada por redirección _auth_redirect");

                // Transferir datos críticos de sessionStorage a localStorage
                try {
                    if (sessionStorage.getItem("login_success")) {
                        localStorage.setItem("login_success", "true");
                    }
                    if (sessionStorage.getItem("auth_user_id")) {
                        localStorage.setItem("auth_user_id", sessionStorage.getItem("auth_user_id") || "");
                    }
                    if (sessionStorage.getItem("login_timestamp")) {
                        localStorage.setItem("login_timestamp", sessionStorage.getItem("login_timestamp") || "");
                    }

                    // Limpiar URL para quitar parámetros de redirección
                    const cleanUrl = new URL(window.location.href);
                    cleanUrl.searchParams.delete("_auth_redirect");
                    cleanUrl.searchParams.delete("_ts");
                    window.history.replaceState({}, "", cleanUrl.toString());

                    // Limpiar sessionStorage
                    sessionStorage.removeItem("auth_redirect_in_progress");
                    sessionStorage.removeItem("redirect_started_at");

                    // Establecer bypass de autenticación inmediato
                    setBypassAuth(true);
                    setInitializing(false);
                    return;
                } catch (e) {
                    console.error("Dashboard Layout: Error sincronizando datos post-redirección:", e);
                }
            }
        }

        // Continuar con la verificación normal
        // Verificar si tenemos indicadores de login exitoso o sesión reciente
        const loginSuccess = localStorage.getItem("login_success");
        const userId = localStorage.getItem("auth_user_id");
        const timestamp = localStorage.getItem("login_timestamp");
        const isRecent = timestamp && (Date.now() - parseInt(timestamp)) < 120000; // 120 segundos (aumentado)

        // Evitar verificaciones repetidas en un período corto
        const now = Date.now();
        if (now - lastAuthCheck < 1000) {
            return;
        }
        setLastAuthCheck(now);

        // Incrementar contador de checks
        authCheckCount.current += 1;

        // Limpiar cualquier indicador de redirección en curso
        sessionStorage.removeItem("redirection_in_progress");

        if (loginSuccess === "true" && userId && isRecent) {
            console.log("Dashboard Layout: Señal de login exitoso detectada, permitiendo acceso inmediato");

            // Establecer bypass y limpiar estado de inicialización
            setBypassAuth(true);
            setInitializing(false);

            // Limpiar estado después de 15 segundos si la autenticación no se completa
            const timer = setTimeout(() => {
                if (!isAuthenticated && !isLoading) {
                    console.log(`Dashboard Layout: Verificación final después del periodo de gracia (intento ${authCheckCount.current})`);

                    // Si hemos realizado demasiados intentos, redirigir al login
                    if (authCheckCount.current >= maxAuthRetries) {
                        console.warn("Dashboard Layout: Máximo de intentos alcanzado, redirigiendo a login");

                        // Limpiar todos los datos de autenticación antes de redirigir
                        localStorage.removeItem("login_success");
                        localStorage.removeItem("auth_user_id");
                        localStorage.removeItem("auth_user_name");
                        localStorage.removeItem("auth_user_email");
                        localStorage.removeItem("auth_user_role");
                        localStorage.removeItem("login_timestamp");
                        localStorage.removeItem("auth_redirect");

                        // Usar window.location para una redirección completamente nueva
                        window.location.href = "/login?from=/dashboard&auth_error=true";
                    }
                } else {
                    console.log("Dashboard Layout: Usuario autenticado correctamente después del periodo de gracia");
                    // Autenticación exitosa, limpiar flags
                    localStorage.removeItem("login_success");
                    localStorage.removeItem("login_timestamp");
                }

                // Solo desactivar bypass después de múltiples intentos o si el usuario está autenticado
                if (authCheckCount.current >= 3 || isAuthenticated) {
                    setBypassAuth(false);
                }
            }, 15000); // Aumentado a 15 segundos

            return () => clearTimeout(timer);
        } else {
            // No hay señal de login reciente
            setBypassAuth(false);
            setInitializing(false);
        }
    }, [isAuthenticated, isLoading, lastAuthCheck, router]);

    // Verificación de autenticación solo si no estamos en bypass
    useEffect(() => {
        if (!bypassAuth && !initializing && !isLoading) {
            if (!isAuthenticated) {
                // Solo redirigir si no estamos en modo bypass Y no hay señales de login reciente
                const loginSuccess = localStorage.getItem("login_success");
                const timestamp = localStorage.getItem("login_timestamp");
                const isRecent = timestamp && (Date.now() - parseInt(timestamp)) < 60000; // 60 segundos

                if (loginSuccess !== "true" || !isRecent) {
                    console.log("Dashboard Layout: Usuario no autenticado, redirigiendo a login");
                    router.push("/login?from=/dashboard");
                }
            } else if (user) {
                console.log(`Dashboard Layout: Usuario autenticado: ${user.name}`);
                // Limpiar flags de login exitoso pero mantener información de usuario
                localStorage.removeItem("login_success");
                localStorage.removeItem("login_timestamp");
            }
        }
    }, [isAuthenticated, isLoading, bypassAuth, initializing, user, router]);

    // Mostrar pantalla de carga mientras verificamos la autenticación
    if (isLoading || initializing) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-lg font-medium">Cargando dashboard...</p>
                <p className="text-sm text-muted-foreground mt-1">Verificando autenticación</p>
            </div>
        );
    }

    // Permitir el acceso si:
    // 1. El usuario está autenticado
    // 2. Estamos en modo bypass por login reciente
    return (isAuthenticated || bypassAuth) ? <>{children}</> : null;
}
