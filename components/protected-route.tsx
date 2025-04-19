"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { setToastInstance } from "@/components/ui/toast-helper";

interface ProtectedRouteProps {
    children: React.ReactNode;
    fallbackUrl?: string;
    loadingMessage?: string;
    errorMessage?: string;
}

export function ProtectedRoute({
    children,
    fallbackUrl = "/login",
    loadingMessage = "Verificando autenticación...",
    errorMessage = "Debes iniciar sesión para acceder a esta página"
}: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [initializing, setInitializing] = useState(true);
    const [bypassAuth, setBypassAuth] = useState(false);
    const authCheckCount = useRef(0);
    const [lastAuthCheck, setLastAuthCheck] = useState(0);
    const [showError, setShowError] = useState(false);
    const [localUserData, setLocalUserData] = useState<any>(null);

    // Configurar la instancia global de toast
    useEffect(() => {
        setToastInstance(toast);
    }, [toast]);

    // Extraer datos de usuario de localStorage para asegurar persistencia
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const userId = localStorage.getItem("auth_user_id");
        if (userId) {
            const userData = {
                id: userId,
                name: localStorage.getItem("auth_user_name") || "Usuario",
                email: localStorage.getItem("auth_user_email") || "",
                role: localStorage.getItem("auth_user_role") || "user"
            };
            setLocalUserData(userData);
        }
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Verificar si llegamos aquí por una redirección
        const isRedirect = new URLSearchParams(window.location.search).get("_auth_redirect") === "true";

        if (isRedirect) {
            console.log("ProtectedRoute: Detectada llegada por redirección");

            // Transferir datos de sessionStorage a localStorage
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

                // Limpiar URL
                const cleanUrl = new URL(window.location.href);
                cleanUrl.searchParams.delete("_auth_redirect");
                cleanUrl.searchParams.delete("_ts");
                window.history.replaceState({}, "", cleanUrl.toString());

                // Limpiar sessionStorage
                sessionStorage.removeItem("auth_redirect_in_progress");
                sessionStorage.removeItem("redirect_started_at");

                // Bypass inmediato
                setBypassAuth(true);
                setInitializing(false);
                return;
            } catch (e) {
                console.error("ProtectedRoute: Error sincronizando datos post-redirección:", e);
            }
        }

        // Verificar login reciente
        const loginSuccess = localStorage.getItem("login_success");
        const userId = localStorage.getItem("auth_user_id");
        const timestamp = localStorage.getItem("login_timestamp");
        const isRecent = timestamp && (Date.now() - parseInt(timestamp)) < (10 * 60 * 1000); // Ampliar a 10 minutos

        // Evitar verificaciones repetidas
        const now = Date.now();
        if (now - lastAuthCheck < 800) return;
        setLastAuthCheck(now);

        // Incrementar contador
        authCheckCount.current += 1;

        if (loginSuccess === "true" && userId && isRecent) {
            console.log("ProtectedRoute: Señal de login reciente, permitiendo acceso");
            setBypassAuth(true);
            setInitializing(false);

            // Extraer datos de usuario para hacer disponible a los componentes hijos
            const userData = {
                id: userId,
                name: localStorage.getItem("auth_user_name") || "Usuario",
                email: localStorage.getItem("auth_user_email") || "",
                role: localStorage.getItem("auth_user_role") || "user"
            };
            setLocalUserData(userData);

            // Solo limpiar una vez que estemos seguros que el contexto tiene los datos
            const timer = setTimeout(() => {
                if (isAuthenticated && user) {
                    console.log("ProtectedRoute: Autenticación confirmada, limpiando flags temporales");
                    localStorage.removeItem("login_success");
                    localStorage.removeItem("login_timestamp");
                }
            }, 30000); // Dar tiempo suficiente

            return () => clearTimeout(timer);
        } else {
            setBypassAuth(false);
            setInitializing(false);
        }
    }, [isAuthenticated, isLoading, lastAuthCheck, user]);

    // Verificación principal
    useEffect(() => {
        if (!bypassAuth && !initializing && !isLoading) {
            if (!isAuthenticated) {
                const loginSuccess = localStorage.getItem("login_success");
                const timestamp = localStorage.getItem("login_timestamp");
                const isRecent = timestamp && (Date.now() - parseInt(timestamp)) < (5 * 60 * 1000); // 5 minutos

                if (loginSuccess !== "true" || !isRecent) {
                    console.log("ProtectedRoute: Usuario no autenticado, redirigiendo");
                    setShowError(true);

                    // Añadir delay breve para mostrar mensaje
                    setTimeout(() => {
                        const redirectUrl = `${fallbackUrl}?from=${encodeURIComponent(window.location.pathname)}`;
                        router.push(redirectUrl);
                    }, 1500);
                }
            }
        }
    }, [isAuthenticated, isLoading, bypassAuth, initializing, router, fallbackUrl]);

    if (isLoading || initializing) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-lg font-medium">{loadingMessage}</p>
            </div>
        );
    }

    if (showError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="rounded-full p-4 bg-red-50 mb-4">
                    <ShieldAlert className="h-10 w-10 text-red-500" />
                </div>
                <h2 className="text-xl font-medium mb-2">Acceso denegado</h2>
                <p className="text-muted-foreground mb-4 text-center max-w-md">
                    {errorMessage}
                </p>
                <Button
                    onClick={() => router.push(fallbackUrl)}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600"
                >
                    Iniciar sesión
                </Button>
            </div>
        );
    }

    // Importante: Pasamos el usuario del contexto o el extraído de localStorage
    return (isAuthenticated || bypassAuth) ? (
        <AuthPassthrough user={user || localUserData}>
            {children}
        </AuthPassthrough>
    ) : null;
}

// Componente para pasar el contexto de autenticación a los hijos
function AuthPassthrough({ children, user }: { children: React.ReactNode, user: any }) {
    // Forzar la disponibilidad del usuario en el contexto global
    useEffect(() => {
        if (user && typeof window !== 'undefined') {
            (window as any).__AUTH_USER = user;

            // Establecer un intervalo para verificar y mantener la información disponible
            const intervalId = setInterval(() => {
                (window as any).__AUTH_USER = user;
            }, 1000);

            return () => clearInterval(intervalId);
        }
    }, [user]);

    return <>{children}</>;
}
