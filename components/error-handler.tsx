import React from 'react';
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

export class AppErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; errorMessage: string; }
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = {
            hasError: false,
            errorMessage: ''
        };
    }

    static getDerivedStateFromError(error: Error) {
        return {
            hasError: true,
            errorMessage: error.message
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Error capturado en límite de errores:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="container py-8">
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>Se ha producido un error en la aplicación</AlertDescription>
                    </Alert>
                    <div className="mt-4 space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Ha ocurrido un error inesperado. Detalles: {this.state.errorMessage || "Error desconocido"}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                onClick={() => {
                                    this.setState({ hasError: false, errorMessage: '' });
                                    window.location.reload();
                                }}
                                variant="outline"
                            >
                                Recargar la página
                            </Button>
                            <Button
                                onClick={() => window.location.href = "/"}
                                variant="outline"
                            >
                                Volver al inicio
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>
): React.FC<P> {
    return function WithErrorBoundary(props: P) {
        return (
            <AppErrorBoundary>
                <Component {...props} />
            </AppErrorBoundary>
        );
    };
}

export function NetworkErrorDisplay({
    message,
    onRetry,
    onGoHome
}: {
    message: string;
    onRetry: () => void;
    onGoHome: () => void;
}) {
    return (
        <div className="container py-8">
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{message || "Error de conexión al servidor"}</AlertDescription>
            </Alert>
            <div className="mt-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                    Estamos experimentando problemas para conectar con el servidor. Esto podría deberse a:
                </p>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                    <li>Problemas con tu conexión a internet</li>
                    <li>El servidor podría estar temporalmente no disponible</li>
                    <li>La operación podría haberse interrumpido</li>
                </ul>
                <div className="flex gap-2 mt-4">
                    <Button onClick={onRetry} variant="outline">
                        Intentar nuevamente
                    </Button>
                    <Button onClick={onGoHome} variant="outline">
                        Volver al inicio
                    </Button>
                </div>
            </div>
        </div>
    );
}
