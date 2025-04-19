"use client"

import { Input } from "@/components/ui/input"
import React, { use } from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MuralItem } from "@/components/mural-item"
import { MuralToolbar } from "@/components/mural-toolbar"
import { AddItemDialog, MuralItemData } from "@/components/add-item-dialog"
import { ShareMuralDialog } from "@/components/share-mural-dialog"
import { MuralSettingsDialog } from "@/components/mural-settings-dialog"
import { CommentsPanel } from "@/components/comments-panel"
import { ActiveUsers } from "@/components/active-users"
import { RemoteCursors } from "@/components/remote-cursors"
import { ClassroomActivityManager } from "@/components/classroom-activity-manager"
import { MuralExportOptions } from "@/components/mural-export-options"
import {
  Share2,
  Settings,
  MessageSquare,
  Clock,
  Eye,
  Save,
  AlertTriangle,
  Users,
  BookOpen,
  Download,
  PresentationIcon,
  Timer,
  Plus,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useAuth } from "@/contexts/auth-context"
import { RealtimeProvider, useRealtime } from "@/contexts/realtime-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  getMuralById,
  hasAccessToMural,
  canEditMural,
  canCommentOnMural,
  canShareMural,
  recordMuralView,
  updateMural,
} from "@/services/mural-service"
import type { Mural, MuralItem as IMuralItem } from "@/types/mural"
import type { ImageSearchResult } from "@/types/image"
import { AppErrorBoundary } from "@/components/error-handler"
import { logger } from "@/utils/logger"
import { generateUUID, getConsistentUUID, isValidUUID } from "@/utils/uuid"

// Añadir tipo a nivel de archivo para usarlo en múltiples lugares
type MuralItemType = "link" | "video" | "image" | "text" | "file";

interface MuralPageProps {
  params: {
    id: string
  }
}

// Componente contenedor que usa RealtimeProvider
export default function MuralPageContainer({ params }: MuralPageProps) {
  // Usar React.use() para desenvolver params que ahora es una Promise
  const unwrappedParams = use(params);

  // Desenvolver el parámetro de forma segura
  const muralId = typeof unwrappedParams === 'object' && unwrappedParams ?
    (typeof unwrappedParams.id === 'string' ? unwrappedParams.id : String(unwrappedParams.id)) :
    '';

  return (
    <RealtimeProvider>
      <AppErrorBoundary>
        <MuralPage muralId={muralId} />
      </AppErrorBoundary>
    </RealtimeProvider>
  )
}

// El componente principal recibe el ID ya desenvuelto
interface MuralComponentProps {
  muralId: string
}

// Añadir esta función de utilidad mejorada para comparación de IDs
function safeCompareIds(id1: string | undefined | null, id2: string | undefined | null): boolean {
  if (!id1 || !id2) return false;
  return id1.toLowerCase().trim() === id2.toLowerCase().trim();
}

// Añadir esta función para normalizar los IDs en un objeto o array de objetos
function normalizeIds(data: any): any {
  // Si es un array, normalizar cada elemento
  if (Array.isArray(data)) {
    return data.map(item => normalizeIds(item));
  }

  // Si es un objeto con un ID, normalizar el ID
  if (data && typeof data === 'object' && 'id' in data) {
    // Clonar para evitar mutar el original
    const normalized = { ...data };

    // Normalizar el ID si es necesario (convertir a UUID si no lo es)
    if (!isValidUUID(normalized.id)) {
      normalized.id = getConsistentUUID(normalized.id);
    }

    return normalized;
  }

  // Para otros casos, devolver el dato sin cambios
  return data;
}

function MuralPage({ muralId }: MuralComponentProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const { joinMural, leaveMural, updateCursorPosition, focusItem, broadcastChange, activeUsers, isConnected } =
    useRealtime()
  const router = useRouter()
  const [mural, setMural] = useState<Mural | null>(null)
  const [items, setItems] = useState<IMuralItem[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [showCollaborators, setShowCollaborators] = useState(false)
  const [activeTab, setActiveTab] = useState("canvas")
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null)
  const [zIndexes, setZIndexes] = useState<Record<string, number>>({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)
  const [canEdit, setCanEdit] = useState(false)
  const [canComment, setCanComment] = useState(false)
  const [canShare, setCanShare] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showEducationalTools, setShowEducationalTools] = useState(false)
  const [showExportOptions, setShowExportOptions] = useState(false)
  const [presentationMode, setPresentationMode] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const [timerDuration, setTimerDuration] = useState(300) // 5 minutos en segundos
  const [timeRemaining, setTimeRemaining] = useState(300)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [networkError, setNetworkError] = useState(false)
  const retryCount = useRef(0)
  const maxRetries = 3

  const canvasRef = useRef<HTMLDivElement>(null)
  const nextZIndex = useRef(1)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Nuevas variables para el control de reintentos y caché
  const loadAttempted = useRef(false);
  const maxLoadRetries = 2; // Más estricto que antes
  const loadRetryTimeout = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const muralCache = useRef<{ id: string, data: Mural | null, timestamp: number } | null>(null);
  const CACHE_TTL = 60000; // 1 minuto en milisegundos

  // Añadir un estado para forzar permisos
  const [forceEditPermission, setForceEditPermission] = useState(false);

  // Añadir referencia para rastrear intentos de aplicar permisos
  const ownershipChecksRef = useRef(0);
  const permissionsTimer = useRef<NodeJS.Timeout | null>(null);

  // Añadir referencias para evitar ciclos infinitos
  const isMounted = useRef(true);
  const cycleDetector = useRef(0);
  const renderCount = useRef(0);
  const effectsInitialized = useRef(false);

  // Añadir referencia para rastrear operaciones de añadir elementos
  const isAddingItem = useRef(false);

  // Función de utilidad para aplicar permisos de propietario de forma forzada
  const forceOwnerPermissions = useCallback(() => {
    console.log("⚡ APLICANDO PERMISOS DE PROPIETARIO DE FORMA FORZADA");
    setCanEdit(true);
    setCanComment(true);
    setCanShare(true);
    setForceEditPermission(true);

    // Limpiar cualquier timer pendiente
    if (permissionsTimer.current) {
      clearTimeout(permissionsTimer.current);
      permissionsTimer.current = null;
    }

    // Guardar en localStorage para persistencia
    localStorage.setItem("is_mural_owner", "true");
    localStorage.setItem("mural_" + muralId + "_permissions", "owner");

    toast({
      title: "Permisos de edición activados",
      description: "Se han aplicado los permisos de propietario",
      duration: 3000,
    });
  }, [muralId, toast]);

  // Optimizar la función memoizada para cargar el mural
  const loadMural = useCallback(async () => {
    // Detección de ciclo infinito
    cycleDetector.current += 1;
    if (cycleDetector.current > 10) {
      console.warn("⚠️ Posible ciclo infinito detectado en loadMural. Cancelando operación.");
      return;
    }

    // Si ya hay una solicitud en curso, abortarla
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Crear un nuevo AbortController para esta solicitud
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      console.log(`Intento ${retryCount.current + 1}/${maxLoadRetries + 1} de cargar mural ${muralId}`);

      // Verificar caché primero
      if (muralCache.current &&
        muralCache.current.id === muralId &&
        Date.now() - muralCache.current.timestamp < CACHE_TTL) {
        console.log("Usando datos de caché para mural:", muralId);
        const cachedData = muralCache.current.data;

        if (cachedData) {
          setMural(cachedData);
          setItems(cachedData.items || []);
          setHasAccess(true);
          initializeAfterLoad(cachedData);
          return;
        }
      }

      // Si no existe en caché o expiró, cargarlo desde la API
      setIsLoading(true);

      // Verificar si el ID es válido
      if (!muralId) {
        console.error("ID de mural no válido");
        toast({
          title: "Error",
          description: "ID de mural no válido",
          variant: "destructive",
        });
        router.push("/");
        return;
      }

      // Crear una promesa con timeout
      const timeoutPromise = new Promise<Mural | null>((_, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error("Timeout al cargar el mural"));
        }, 10000); // 10 segundos

        // Limpiar el timeout si la promesa se resuelve antes
        signal.addEventListener('abort', () => clearTimeout(timeoutId));
      });

      // Obtener el mural
      const muralPromise = getMuralById(muralId);

      // Competir ambas promesas
      const muralData = await Promise.race([muralPromise, timeoutPromise]);

      console.log("Datos del mural recibidos:", muralData ? "OK" : "No encontrado");

      // Guardar en caché
      muralCache.current = {
        id: muralId,
        data: muralData,
        timestamp: Date.now()
      };

      if (!muralData) {
        toast({
          title: "Error",
          description: "No se encontró el mural solicitado",
          variant: "destructive",
        });
        router.push("/");
        return;
      }

      // Resetear contador de reintentos
      retryCount.current = 0;
      cycleDetector.current = 0; // Resetear detector de ciclos tras carga exitosa

      // Procesar según el usuario y permisos
      if (!user) {
        handleAnonymousAccess(muralData);
      } else {
        await handleAuthenticatedAccess(muralData);
      }
    } catch (error) {
      console.error("Error al cargar el mural:", error);

      // Solo incrementar contador y reintentar si no fue cancelada manualmente
      if (!signal.aborted) {
        handleLoadError(error);
      }
    }
  }, [muralId, user, toast, router, joinMural]); // Mantener dependencias mínimas

  // Modificar el useEffect principal para solucionar el error de dependencias que cambian de tamaño
  useEffect(() => {
    renderCount.current += 1;
    console.log(`📊 Renderizado #${renderCount.current} del componente MuralPage`);

    isMounted.current = true;

    // Solo inicializar una vez para evitar ciclos
    if (effectsInitialized.current) {
      console.log("🔄 Efectos ya inicializados, evitando reinicialización");
      return;
    }

    effectsInitialized.current = true;
    console.log("🚀 Inicializando efectos del componente MuralPage");

    // Verificar permisos guardados inmediatamente
    const savedOwnership = localStorage.getItem("is_mural_owner") === "true";
    const savedMuralPermissions = localStorage.getItem("mural_" + muralId + "_permissions");

    console.log("🔄 Verificando permisos guardados:", { savedOwnership, savedMuralPermissions });

    if (savedOwnership || savedMuralPermissions === "owner") {
      console.log("🔑 Aplicando permisos guardados de propietario");
      setCanEdit(true);
      setCanComment(true);
      setCanShare(true);
      setForceEditPermission(true);
    }

    // Cargar el mural solo si no se ha intentado antes
    if (!loadAttempted.current) {
      console.log("📥 Iniciando primera carga del mural:", muralId);
      loadAttempted.current = true;

      loadMural().catch(error => {
        console.error("Error durante carga inicial:", error);
      });
    }

    // Limpieza al desmontar
    return () => {
      console.log("🧹 Desmontando componente MuralPage");
      isMounted.current = false;

      if (loadRetryTimeout.current) {
        clearTimeout(loadRetryTimeout.current);
        loadRetryTimeout.current = null;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }

      if (permissionsTimer.current) {
        clearTimeout(permissionsTimer.current);
        permissionsTimer.current = null;
      }

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Desconectar del canal de tiempo real
      if (muralId) {
        console.log(`Desconectando del canal de tiempo real: ${muralId}`);
        leaveMural(muralId);
      }
    };
  }, [muralId, loadMural, leaveMural]); // Mantener consistentes estas dependencias

  // Añadir efecto para normalizar IDs al cargar elementos
  useEffect(() => {
    if (mural?.items && mural.items.length > 0) {
      // Normalizar IDs solo si es necesario (detectar algún ID no UUID)
      const needsNormalization = mural.items.some(item => !isValidUUID(item.id));

      if (needsNormalization) {
        console.log("Normalizando IDs de elementos...");
        const normalizedItems = normalizeIds(mural.items);
        setItems(normalizedItems);
      }
    }
  }, [mural?.items]);

  // Simplificar el efecto para verificación de propietario
  useEffect(() => {
    // Evitar ejecución si aún no hay datos o el componente se desmontó
    if (!user || !mural || !isMounted.current) return;

    // Usar una única función para todas las verificaciones
    const checkAndApplyOwnership = () => {
      ownershipChecksRef.current += 1;

      // Limitar número de verificaciones
      if (ownershipChecksRef.current > 5) {
        console.log("🛑 Máximo de verificaciones de propiedad alcanzado");
        return;
      }

      // Verificaciones más simples con prioridad en localStorage
      const userIdOptions = [
        user.id,
        localStorage.getItem("auth_user_id"),
        localStorage.getItem("user_id")
      ].filter(Boolean);

      const ownerId = mural.ownerId;
      const isOwner = userIdOptions.some(id =>
        id && ownerId && id.toLowerCase() === ownerId.toLowerCase()
      );

      console.log(`🔍 Verificación de propiedad #${ownershipChecksRef.current}:`,
        { userIds: userIdOptions, ownerId, isOwner });

      if (isOwner && (!canEdit || !forceEditPermission)) {
        console.log("👑 Usuario ES propietario, aplicando permisos");
        forceOwnerPermissions();
      }
    };

    // Ejecutar verificación única al cambiar dependencias
    checkAndApplyOwnership();

  }, [user, mural, canEdit, forceEditPermission, forceOwnerPermissions]);

  // Funciones auxiliares para mejorar la legibilidad
  const handleAnonymousAccess = (muralData: Mural) => {
    if (muralData.isPublic) {
      setMural(muralData);
      setItems(muralData.items || []);
      setHasAccess(true);
      setCanEdit(false);
      setCanComment(false);
      setCanShare(false);
      joinMural(muralId);
      setIsLoading(false);
      setNetworkError(false);
      setErrorMessage(null);
    } else {
      toast({
        title: "Acceso denegado",
        description: "Inicia sesión para ver este mural",
        variant: "destructive",
      });
      router.push("/login");
    }
  };

  const handleAuthenticatedAccess = async (muralData: Mural) => {
    // Verificar acceso para usuarios autenticados
    const access = await hasAccessToMural(muralId, user!.id);
    console.log("Verificación de acceso:", access);

    if (!access) {
      toast({
        title: "Acceso denegado",
        description: "No tienes permisos para ver este mural",
        variant: "destructive",
      });
      router.push("/");
      return;
    }

    try {
      await recordMuralView(muralId, user!.id);
    } catch (viewError) {
      console.error("Error al registrar vista:", viewError);
      // Continuamos aunque falle el registro de vista
    }

    setMural(muralData);
    setItems(muralData.items || []);
    setHasAccess(access);

    // Verificar si el usuario es propietario directamente antes de establecer permisos
    const isOwner = muralData.ownerId && user!.id &&
      muralData.ownerId.toLowerCase() === user!.id.toLowerCase();

    console.log("Verificación de propiedad en handleAuthenticatedAccess:");
    console.log("- ID usuario (user.id):", user!.id);
    console.log("- ID en localStorage:", localStorage.getItem("auth_user_id"));
    console.log("- ID propietario mural:", muralData.ownerId);

    // Verificación adicional con localStorage
    const isOwnerViaLocalStorage = muralData.ownerId &&
      localStorage.getItem("auth_user_id") &&
      muralData.ownerId.toLowerCase() === localStorage.getItem("auth_user_id")!.toLowerCase();

    console.log(`¿Es propietario vía user.id? ${isOwner ? 'SÍ' : 'NO'}`);
    console.log(`¿Es propietario vía localStorage? ${isOwnerViaLocalStorage ? 'SÍ' : 'NO'}`);

    // Establecer permisos de edición si es propietario por cualquiera de los métodos
    if (isOwner || isOwnerViaLocalStorage) {
      console.log("📢 PROPIETARIO CONFIRMADO, ESTABLECIENDO TODOS LOS PERMISOS");
      setCanEdit(true);
      setCanComment(true);
      setCanShare(true);
      setForceEditPermission(true);

      // Guardar ID de propietario para verificaciones futuras
      if (!localStorage.getItem("mural_owner_id")) {
        localStorage.setItem("mural_owner_id", muralData.ownerId);
      }
    } else {
      const [canEditResult, canCommentResult, canShareResult] = await Promise.all([
        canEditMural(muralId, user!.id),
        canCommentOnMural(muralId, user!.id),
        canShareMural(muralId, user!.id)
      ]);

      console.log("Permisos obtenidos:", {
        canEdit: canEditResult,
        canComment: canCommentResult,
        canShare: canShareResult
      });

      setCanEdit(canEditResult);
      setCanComment(canCommentResult);
      setCanShare(canShareResult);
    }

    initializeAfterLoad(muralData);
  };

  const initializeAfterLoad = (muralData: Mural) => {
    // Inicializar zIndexes
    const initialZIndexes: Record<string, number> = {};
    if (muralData.items) {
      muralData.items.forEach((item, index) => {
        initialZIndexes[item.id] = index + 1;
      });
      nextZIndex.current = muralData.items.length + 1;
    }

    setZIndexes(initialZIndexes);

    // Unirse al canal de tiempo real
    joinMural(muralId);
    setIsLoading(false);
    setNetworkError(false);
    setErrorMessage(null);
    console.log("Mural cargado correctamente");
  };

  const handleLoadError = (error: any) => {
    // Detectar si es un error de red
    const isNetworkError = error instanceof Error &&
      (error.message.includes('fetch') ||
        error.message.includes('network') ||
        error.message.includes('abort') ||
        error.message.includes('Timeout'));

    if (isNetworkError && retryCount.current < maxLoadRetries) {
      retryCount.current++;

      const delay = Math.min(2000 * retryCount.current, 5000);
      console.log(`Reintentando en ${delay}ms... (intento ${retryCount.current} de ${maxLoadRetries})`);

      // Limpiar timeout anterior si existe
      if (loadRetryTimeout.current) clearTimeout(loadRetryTimeout.current);

      // Programar un solo reintento con un nuevo flag para evitar bucles
      loadRetryTimeout.current = setTimeout(() => {
        console.log("Ejecutando reintento programado");
        loadMural();
      }, delay);
    } else {
      // Mostrar error después de agotar reintentos o para errores no de red
      setNetworkError(true);
      setErrorMessage(
        isNetworkError
          ? "No fue posible conectar con el servidor. Por favor, verifica tu conexión a internet y recarga la página."
          : "Error al cargar el mural: " + (error instanceof Error ? error.message : "Error desconocido")
      );
      setIsLoading(false);
    }
  };

  // Manejar el temporizador
  useEffect(() => {
    if (timerActive && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setTimerActive(false)
            clearInterval(timerRef.current as NodeJS.Timeout)
            toast({
              title: "¡Tiempo finalizado!",
              description: "El tiempo asignado para la actividad ha terminado.",
            })
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else if (!timerActive && timerRef.current) {
      clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [timerActive, timeRemaining])

  // Manejar el movimiento del mouse para actualizar la posición del cursor
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    updateCursorPosition(x, y)
  }

  // Manejar el enfoque de un elemento
  const handleItemFocus = (itemId: string) => {
    if (focusedItemId === itemId) return;

    logger.debug(`Enfocando elemento: ${itemId}`, undefined, 'MuralPage');

    setFocusedItemId(itemId);
    focusItem(itemId);

    // Actualizar el zIndex del elemento enfocado
    setZIndexes((prev) => {
      const newZIndexes = { ...prev };
      newZIndexes[itemId] = nextZIndex.current;
      nextZIndex.current += 1;
      return newZIndexes;
    });
  };

  // Manejar el clic en el canvas para quitar el enfoque
  const handleCanvasClick = (e: React.MouseEvent) => {
    // Solo quitar el enfoque si se hace clic directamente en el canvas
    if (e.target === canvasRef.current) {
      logger.debug('Clic en canvas - Quitando enfoque', undefined, 'MuralPage');
      setFocusedItemId(null);
      focusItem(null);
    }
  };

  // Añadir un nuevo elemento al mural
  const addItem = async (newItem: MuralItemData) => {
    logger.group(`Añadiendo nuevo elemento de tipo: ${newItem.type}`, 'info', 'MuralPage');
    console.log(`DEBUG: Iniciando addItem para elemento tipo ${newItem.type}`);

    // Verificar que el componente está montado y listo
    if (!isMounted.current) {
      logger.error('Operación cancelada - El componente está siendo desmontado', undefined, 'MuralPage');
      logger.groupEnd();
      console.log("DEBUG: Componente desmontado, cancelando operación");
      return null;
    }

    // SOLUCIÓN: Verificación robusta del usuario con múltiples métodos de respaldo
    const currentUser = user;
    const userIdFromStorage = localStorage.getItem("auth_user_id");

    console.log("DEBUG: Estado de autenticación:", {
      userFromContext: !!currentUser,
      userId: currentUser?.id,
      userIdFromStorage
    });

    // Si no hay usuario en el contexto, intentar obtenerlo del localStorage
    if (!currentUser || !currentUser.id) {
      if (!userIdFromStorage) {
        logger.error('No se puede añadir el elemento - Usuario no autenticado',
          { userFromContext: !!currentUser, userIdFromStorage }, 'MuralPage');
        logger.groupEnd();
        return null;
      }

      // Si hay un ID en localStorage pero no hay usuario en el contexto, registrar la anomalía
      logger.warn('Usuario no disponible en contexto, usando ID de localStorage como respaldo',
        { userIdFromStorage }, 'MuralPage');
      console.log("⚠️ ADVERTENCIA: Usuario no disponible en contexto pero sí en localStorage");
    }

    // Usar el ID de usuario del contexto o del localStorage como respaldo
    const effectiveUserId = currentUser?.id || userIdFromStorage;

    if (!effectiveUserId) {
      logger.error('No se puede añadir el elemento - No se pudo determinar el ID del usuario', undefined, 'MuralPage');
      logger.groupEnd();
      return null;
    }

    // Verificar que existe un mural
    if (!mural) {
      logger.error('No se puede añadir el elemento - Mural no disponible', undefined, 'MuralPage');
      logger.groupEnd();
      return null;
    }

    try {
      // Calcular posición una sola vez y guardarla
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      const maxX = canvasRect ? canvasRect.width - 350 : 500;
      const maxY = canvasRect ? canvasRect.height - 300 : 500;
      const randomX = Math.max(50, Math.floor(Math.random() * maxX));
      const randomY = Math.max(100, Math.floor(Math.random() * maxY));

      // Usar generateUUID() para crear IDs compatibles con la base de datos
      const id = generateUUID();
      const itemType = newItem.type as MuralItemType;

      // Crear un objeto inmutable para el nuevo elemento usando el ID efectivo
      const newMuralItem: IMuralItem = {
        content: newItem.content,
        type: itemType,
        title: newItem.title,
        description: newItem.description,
        caption: newItem.caption,
        color: newItem.color,
        id, // Ahora es un UUID válido
        position: { x: randomX, y: randomY },
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: effectiveUserId, // Usar el ID efectivo
        style: mural?.itemStyle || undefined,
      };

      console.log("🔧 Creado nuevo elemento:", newMuralItem);
      console.log("🔧 ID generado (UUID):", id);

      // IMPORTANTE: Usar copia profunda del estado actual para evitar ciclos
      const currentItemsCopy = JSON.parse(JSON.stringify(items));
      const updatedItems = [...currentItemsCopy, newMuralItem];

      // PRE-COMMIT: Primero intentar enviar al servidor antes de actualizar el UI
      if (mural) {
        console.log("🔧 Guardando en base de datos...");
        await updateMural(mural.id, { items: updatedItems }, effectiveUserId); // Usar el ID efectivo aquí también
        console.log("🔧 Guardado en servidor exitoso");
      }

      // POST-COMMIT: Una vez guardado, actualizar el estado local de una sola vez
      console.log("🔧 Actualizando estados locales");

      // Usar una función para encapsular todas las actualizaciones de estado
      const updateLocalState = () => {
        if (!isMounted.current) return;

        // 1. Actualizar elementos
        setItems(updatedItems);

        // 2. Actualizar zIndexes
        setZIndexes(prev => {
          const newZIndexes = { ...prev };
          newZIndexes[id] = nextZIndex.current;
          nextZIndex.current += 1;
          return newZIndexes;
        });

        // 3. Establecer enfoque
        setFocusedItemId(id);
        focusItem(id);

        // 4. Limpiar estado de diálogo y guardado
        setIsAddDialogOpen(false);
        setHasUnsavedChanges(false);
      };

      // Ejecutar actualizaciones de estado en un setTimeout para romper el ciclo de renderizado
      setTimeout(updateLocalState, 50);

      // Notificar a otros usuarios después de actualizar estado local
      broadcastChange({
        type: "add",
        itemId: id,
        data: newMuralItem,
      });

      // Mostrar notificación
      if (isMounted.current) {
        toast({
          title: "Elemento añadido",
          description: "Se ha añadido un nuevo elemento al mural",
        });
      }

      logger.info('Elemento añadido exitosamente', { itemId: id, type: newItem.type }, 'MuralPage');
      return newMuralItem;
    } catch (error) {
      logger.error('Error en proceso de adición de elemento', { error }, 'MuralPage');

      if (isMounted.current) {
        toast({
          title: "Error",
          description: "No se pudo añadir el elemento. Inténtalo de nuevo.",
          variant: "destructive",
        });
      }

      return null;
    } finally {
      logger.groupEnd();
    }
  };

  // Modificar la función handleItemSubmit para verificar si el usuario está autenticado antes de continuar
  const handleItemSubmit = async (newItem: MuralItemData) => {
    // Verificar autenticación antes de intentar agregar elementos
    if (!user && !localStorage.getItem("auth_user_id")) {
      console.error("No se puede agregar elemento: usuario no autenticado");
      toast({
        title: "Error de autenticación",
        description: "Debes iniciar sesión para agregar elementos al mural",
        variant: "destructive",
      });
      return;
    }

    // Establecer bandera para evitar múltiples envíos
    if (isAddingItem.current) return;
    isAddingItem.current = true;

    try {
      console.log("🔧 Iniciando proceso de agregar elemento");
      console.log("Estado de autenticación:", {
        userPresent: !!user,
        userId: user?.id,
        storageId: localStorage.getItem("auth_user_id")
      });

      // Desactivar el componente AddItemDialog inmediatamente para evitar múltiples clics
      setIsAddDialogOpen(false);

      // Realizar la operación después de desmontar el diálogo
      setTimeout(async () => {
        try {
          // Verificar nuevamente la autenticación antes de agregar
          if (!user && !localStorage.getItem("auth_user_id")) {
            console.error("Error de autenticación durante la adición del elemento");
            toast({
              title: "Error",
              description: "Se ha perdido la sesión. Inicia sesión nuevamente.",
              variant: "destructive",
            });
            isAddingItem.current = false;
            return;
          }

          const result = await addItem(newItem);
          if (!result) {
            console.warn('No se pudo añadir el elemento - addItem retornó null');
          } else {
            console.log(`🔧 Elemento agregado correctamente: ${result.id}`);
          }
        } catch (innerError) {
          console.error("Error al procesar el nuevo elemento:", innerError);
        } finally {
          isAddingItem.current = false;
        }
      }, 100);
    } catch (error) {
      console.error("Error al preparar adición:", error);
      isAddingItem.current = false;
    }
  };

  // Añadir verificación adicional de autenticación en handleAddImage
  const handleAddImage = async (imageData: ImageSearchResult) => {
    logger.group('Añadiendo imagen desde galería', 'info', 'MuralPage');
    console.log("DEBUG: Iniciando handleAddImage con URL:", imageData.url);

    // Verificación robusta de usuario
    const currentUser = user;
    const userIdFromStorage = localStorage.getItem("auth_user_id");
    const effectiveUserId = currentUser?.id || userIdFromStorage;

    console.log("DEBUG: Estado de autenticación para handleAddImage:", {
      userFromContext: !!currentUser,
      userId: currentUser?.id,
      userIdFromStorage,
      effectiveUserId
    });

    if (!effectiveUserId) {
      logger.error('No se puede añadir imagen - No se pudo determinar el ID del usuario', undefined, 'MuralPage');
      logger.groupEnd();

      toast({
        title: "Error de autenticación",
        description: "Se requiere iniciar sesión para añadir imágenes",
        variant: "destructive",
      });
      return;
    }

    if (!mural || (!canEdit && !forceEditPermission)) {
      logger.error('No se puede añadir imagen - Permisos insuficientes',
        { userId: effectiveUserId, muralId: mural?.id, canEdit, forceEditPermission }, 'MuralPage');
      logger.groupEnd();

      toast({
        title: "Permiso denegado",
        description: "No tienes permisos para editar este mural",
        variant: "destructive",
      });
      return;
    }

    // Calcular una posición aleatoria pero visible en el canvas
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    const maxX = canvasRect ? canvasRect.width - 350 : 500;
    const maxY = canvasRect ? canvasRect.height - 300 : 500;

    const randomX = Math.max(50, Math.floor(Math.random() * maxX));
    const randomY = Math.max(100, Math.floor(Math.random() * maxY));

    // Usar UUID en lugar de timestamp
    const id = generateUUID();
    const newMuralItem: IMuralItem = {
      id, // Ahora es un UUID válido
      type: "image" as MuralItemType,
      content: imageData.url,
      title: imageData.description,
      description: `Imagen por ${imageData.authorName}`,
      caption: `Fuente: ${imageData.source}`,
      position: { x: randomX, y: randomY },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: effectiveUserId, // Usar el ID efectivo
      style: mural?.itemStyle || undefined,
    };

    console.log("DEBUG: Item de imagen creado:", newMuralItem);
    console.log("DEBUG: ID de imagen (UUID):", id);

    try {
      // IMPORTANTE: Usar copia profunda del estado actual para evitar ciclos
      const currentItemsCopy = JSON.parse(JSON.stringify(items));
      const updatedItems = [...currentItemsCopy, newMuralItem];

      // PRE-COMMIT: Primero intentar enviar al servidor antes de actualizar el UI
      if (mural) {
        console.log("DEBUG: Guardando imagen en base de datos...");
        await updateMural(mural.id, { items: updatedItems }, effectiveUserId); // Usar el ID efectivo aquí también
        console.log("DEBUG: Guardado de imagen exitoso");
      }

      // POST-COMMIT: Una vez guardado, actualizar el estado local de una sola vez
      if (isMounted.current) {
        console.log("DEBUG: Actualizando estado local con la nueva imagen");
        // Actualizar elementos
        setItems(updatedItems);

        // Actualizar el zIndex del nuevo elemento
        setZIndexes(prev => {
          const newZIndexes = { ...prev };
          newZIndexes[id] = nextZIndex.current;
          nextZIndex.current += 1;
          return newZIndexes;
        });

        // Enfocar el nuevo elemento
        setFocusedItemId(id);
        focusItem(id);

        // Notificar a otros usuarios
        broadcastChange({
          type: "add",
          itemId: id,
          data: newMuralItem,
        });
      }

      setHasUnsavedChanges(false);

      toast({
        title: "Imagen añadida",
        description: "Se ha añadido una nueva imagen al mural",
      });

      console.log("DEBUG: Proceso de añadir imagen completado exitosamente");
    } catch (error) {
      console.error("DEBUG: Error al añadir imagen:", error);
      logger.error('Error al guardar imagen', { error, id }, 'MuralPage');

      toast({
        title: "Error",
        description: "No se pudo guardar la imagen. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      logger.groupEnd();
    }
  };

  // Actualizar un elemento existente
  const updateItem = async (id: string, updates: Partial<IMuralItem>) => {
    logger.group(`Actualizando elemento: ${id}`, 'info', 'MuralPage');
    logger.debug('Datos de actualización', updates, 'MuralPage');

    console.log("Intentando actualizar elemento. canEdit:", canEdit, "forceEditPermission:", forceEditPermission);

    // Obtener ID de usuario de forma robusta (del contexto o localStorage)
    const currentUser = user;
    const userIdFromStorage = localStorage.getItem("auth_user_id");
    const effectiveUserId = currentUser?.id || userIdFromStorage;

    console.log("DEBUG: Estado de autenticación para updateItem:", {
      userFromContext: !!currentUser,
      userId: currentUser?.id,
      userIdFromStorage,
      effectiveUserId,
      canEdit,
      forceEditPermission
    });

    // Si el usuario tiene permisos forzados como propietario o tiene canEdit
    if (!effectiveUserId || !mural || (!canEdit && !forceEditPermission)) {
      logger.error("No se puede actualizar - Permisos insuficientes",
        { effectiveUserId, canEdit, forceEditPermission }, 'MuralPage');

      console.error("No tienes permisos para editar este mural");
      toast({
        title: "Permiso denegado",
        description: "No tienes permisos para editar este mural",
        variant: "destructive",
      });

      logger.groupEnd();
      return;
    }

    // Verificar si otro usuario está editando este elemento
    const isBeingEditedByOther = activeUsers.some(
      (activeUser) => activeUser.id !== effectiveUserId && activeUser.focusedItemId === id,
    );

    if (isBeingEditedByOther) {
      logger.warn("Elemento bloqueado por otro usuario",
        { itemId: id, activeUsers }, 'MuralPage');

      toast({
        title: "Elemento bloqueado",
        description: "Este elemento está siendo editado por otro usuario",
        variant: "destructive",
      });

      logger.groupEnd();
      return;
    }

    try {
      // Crear una copia profunda para evitar ciclos de actualización
      const currentItemsCopy = JSON.parse(JSON.stringify(items));

      // Buscar el elemento existente usando IDs consistentes
      const existingItemIndex = currentItemsCopy.findIndex((item: IMuralItem) => {
        const itemConsistentId = isValidUUID(item.id) ? item.id : getConsistentUUID(item.id);
        const searchConsistentId = isValidUUID(id) ? id : getConsistentUUID(id);
        return itemConsistentId === searchConsistentId;
      });

      if (existingItemIndex === -1) {
        logger.error(`Elemento con ID ${id} no encontrado`, undefined, 'MuralPage');
        logger.groupEnd();
        return;
      }

      // Actualizar el elemento manteniendo la estructura original
      const updatedItem = {
        ...currentItemsCopy[existingItemIndex],
        ...updates,
        updatedAt: new Date()
      };

      // Asegurar que la posición tiene el formato correcto
      if (updates.position) {
        updatedItem.position = {
          x: updates.position.x,
          y: updates.position.y
        };
      }

      // Reemplazar el elemento en el array
      currentItemsCopy[existingItemIndex] = updatedItem;

      console.log("DEBUG: Item actualizado:", updatedItem);
      console.log("DEBUG: Array de items actualizado:", currentItemsCopy);

      // Actualizar en el servicio
      if (mural) {
        try {
          logger.debug('Enviando actualización a la base de datos', { muralId: mural.id }, 'MuralPage');
          const result = await updateMural(mural.id, { items: currentItemsCopy }, effectiveUserId);

          if (!result) {
            throw new Error("La actualización del mural devolvió null");
          }

          // Si se guardó exitosamente, actualizar estado local
          if (isMounted.current) {
            logger.debug('Actualizando estado local con los cambios', undefined, 'MuralPage');
            setItems(currentItemsCopy);
            setHasUnsavedChanges(false);
          }

          logger.info('Elemento actualizado exitosamente', { itemId: id }, 'MuralPage');
        } catch (error) {
          logger.error('Error al actualizar elemento en la base de datos',
            { error, itemId: id, errorMessage: error instanceof Error ? error.message : "Error desconocido" }, 'MuralPage');
          console.error("DEBUG: Error detallado al actualizar:", error);

          toast({
            title: "Error al actualizar",
            description: "No se pudo guardar el cambio. Inténtalo de nuevo.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      logger.error('Error inesperado al actualizar elemento',
        { error, itemId: id }, 'MuralPage');
      console.error("Error inesperado:", error);
    } finally {
      logger.groupEnd();
    }
  };

  // Eliminar un elemento
  const deleteItem = async (id: string) => {
    logger.group(`Eliminando elemento: ${id}`, 'info', 'MuralPage');

    console.log("Intentando eliminar elemento. canEdit:", canEdit, "forceEditPermission:", forceEditPermission);

    // Obtener ID de usuario de forma robusta (del contexto o localStorage)
    const currentUser = user;
    const userIdFromStorage = localStorage.getItem("auth_user_id");
    const effectiveUserId = currentUser?.id || userIdFromStorage;

    // Si el usuario tiene permisos forzados como propietario o tiene canEdit
    if (!effectiveUserId || !mural || (!canEdit && !forceEditPermission)) {
      logger.error("No se puede eliminar - Permisos insuficientes",
        { effectiveUserId, canEdit, forceEditPermission }, 'MuralPage');

      console.error("No tienes permisos para eliminar elementos de este mural");
      toast({
        title: "Permiso denegado",
        description: "No tienes permisos para eliminar elementos de este mural",
        variant: "destructive",
      });

      logger.groupEnd();
      return;
    }

    // Verificar si otro usuario está editando este elemento
    const isBeingEditedByOther = activeUsers.some(
      (activeUser) => activeUser.id !== effectiveUserId && activeUser.focusedItemId === id,
    );

    if (isBeingEditedByOther) {
      logger.warn("Elemento bloqueado por otro usuario",
        { itemId: id, activeUsers }, 'MuralPage');

      toast({
        title: "Elemento bloqueado",
        description: "Este elemento está siendo editado por otro usuario",
        variant: "destructive",
      });

      logger.groupEnd();
      return;
    }

    // Modificar cómo se filtra para considerar IDs consistentes
    const updatedItems = items.filter((item) => {
      const itemConsistentId = isValidUUID(item.id) ? item.id : getConsistentUUID(item.id);
      const searchConsistentId = isValidUUID(id) ? id : getConsistentUUID(id);
      return itemConsistentId !== searchConsistentId;
    });

    setItems(updatedItems);

    if (focusedItemId === id) {
      setFocusedItemId(null);
      focusItem(null);
    }

    // Notificar a otros usuarios
    logger.debug('Transmitiendo eliminación a otros usuarios', undefined, 'MuralPage');
    broadcastChange({
      type: "delete",
      itemId: id,
    });

    // Actualizar en el servicio
    if (mural) {
      try {
        await updateMural(mural.id, { items: updatedItems }, effectiveUserId); // Usar ID efectivo
        logger.info('Elemento eliminado exitosamente', { itemId: id }, 'MuralPage');
      } catch (error) {
        logger.error('Error al eliminar elemento de la base de datos',
          { error, itemId: id }, 'MuralPage');
      }
    }

    toast({
      title: "Elemento eliminado",
      description: "Se ha eliminado el elemento del mural",
    });

    logger.groupEnd();
  };

  // Añadir esta función para manejar actualizaciones desde diálogos
  const handleMuralUpdated = useCallback((updatedMural: Mural) => {
    logger.group('Actualizando mural desde diálogo', 'info', 'MuralPage');

    if (!updatedMural) {
      logger.error('Mural actualizado no válido', undefined, 'MuralPage');
      logger.groupEnd();
      return;
    }

    logger.debug('Datos de mural actualizados recibidos', updatedMural, 'MuralPage');

    // Actualizar estado del mural
    setMural(updatedMural);

    // Si se actualizaron los elementos, actualizar también ese estado
    if (updatedMural.items) {
      logger.debug('Actualizando elementos', { count: updatedMural.items.length }, 'MuralPage');
      setItems(updatedMural.items);
    }

    toast({
      title: "Mural actualizado",
      description: "Los cambios se han aplicado correctamente",
    });

    logger.info('Mural actualizado exitosamente', { id: updatedMural.id }, 'MuralPage');
    logger.groupEnd();
  }, [toast]);

  // Guardar los cambios del mural
  const saveMural = async () => {
    logger.group('Guardando mural completo', 'info', 'MuralPage');

    // Obtener ID de usuario de forma robusta
    const currentUser = user;
    const userIdFromStorage = localStorage.getItem("auth_user_id");
    const effectiveUserId = currentUser?.id || userIdFromStorage;

    if (!effectiveUserId || !mural) {
      logger.error('No se puede guardar - Usuario o mural no disponible',
        { effectiveUserId, mural: mural?.id }, 'MuralPage');
      logger.groupEnd();
      return;
    }

    try {
      logger.debug('Enviando actualización a la base de datos', { muralId: mural.id }, 'MuralPage');
      const result = await updateMural(mural.id, { items }, effectiveUserId);

      if (!result) {
        throw new Error("La actualización del mural devolvió null");
      }

      logger.info('Mural guardado exitosamente', { muralId: mural.id }, 'MuralPage');
      setHasUnsavedChanges(false);

      toast({
        title: "Cambios guardados",
        description: "Los cambios se han guardado correctamente"
      });
    } catch (error) {
      logger.error('Error al guardar el mural',
        { error, muralId: mural.id }, 'MuralPage');

      toast({
        title: "Error al guardar",
        description: "No se pudieron guardar los cambios. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      logger.groupEnd();
    }
  };

  // Avanzar a la siguiente diapositiva
  const nextSlide = () => {
    if (currentSlide < items.length - 1) {
      setCurrentSlide(currentSlide + 1)
    }
  }

  // Retroceder a la diapositiva anterior
  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  // Iniciar la presentación
  const startPresentation = () => {
    setPresentationMode(true)
    setCurrentSlide(0)
  }

  // Salir del modo presentación
  const exitPresentation = () => {
    setPresentationMode(false)
  }

  // Iniciar o pausar el temporizador
  const toggleTimer = () => {
    if (timerActive) {
      setTimerActive(false)
    } else {
      setTimerActive(true)
    }
  }

  // Reiniciar el temporizador
  const resetTimer = () => {
    setTimeRemaining(timerDuration)
    setTimerActive(false)
  }

  // Formatear el tiempo restante
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  // Actualizar función para controlar apertura/cierre del diálogo con mejor manejo de errores
  const toggleAddDialog = (open: boolean) => {
    logger.debug(`${open ? 'Abriendo' : 'Cerrando'} diálogo para añadir elemento`,
      { componentMounted: isMounted.current, hasUser: !!user, hasMural: !!mural }, 'MuralPage');

    // Asegurar que no se cierre el diálogo durante una operación en curso
    if (!open && isAddingItem.current) {
      logger.warn('Evitando cierre prematuro del diálogo durante operación', undefined, 'MuralPage');
      return;
    }

    setIsAddDialogOpen(open);
  };

  // Si está cargando, mostrar un indicador de carga
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  // Si hay un error de red, mostrar mensaje mejorado
  if (networkError) {
    return (
      <div className="container py-8 max-w-3xl mx-auto">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{errorMessage || "Error de conexión al servidor"}</AlertDescription>
        </Alert>
        <div className="mt-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Estamos experimentando problemas para conectar con el servidor. Esto podría deberse a:
          </p>
          <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
            <li>Problemas con tu conexión a internet</li>
            <li>El servidor podría estar temporalmente no disponible</li>
            <li>Congestión de la red o problemas con tu proveedor de internet</li>
          </ul>
          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => {
                // Reiniciar el estado de carga completamente
                retryCount.current = 0;
                loadAttempted.current = false;
                setNetworkError(false);
                setIsLoading(true);

                // Cancelar cualquier solicitud pendiente
                if (abortControllerRef.current) {
                  abortControllerRef.current.abort();
                  abortControllerRef.current = null;
                }

                // Invalidar caché para forzar una carga fresca
                if (muralCache.current && muralCache.current.id === muralId) {
                  muralCache.current = null;
                }

                // Recargar la página completamente si los reintentos no funcionan
                loadMural();
              }}
              variant="outline"
            >
              Intentar nuevamente
            </Button>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
            >
              Volver al inicio
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Si no hay mural o no tiene acceso, mostrar mensaje de error
  if (!mural || !hasAccess) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>No tienes acceso a este mural o no existe.</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => router.push("/")} variant="outline">
            Volver al inicio
          </Button>
        </div>
      </div>
    )
  }

  // Determinar el estilo de fondo
  const backgroundStyle = mural.background
    ? mural.background.startsWith("url")
      ? { backgroundImage: mural.background, backgroundSize: "cover", backgroundPosition: "center" }
      : {}
    : {}

  // Añadir comprobación final para canEdit y forceEditPermission
  const effectiveCanEdit = canEdit || forceEditPermission || safeCompareIds(user?.id, mural?.ownerId);

  // Renderizar el modo presentación
  if (presentationMode) {
    const currentItem = items[currentSlide]
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={exitPresentation} className="text-white">
              Salir
            </Button>
            <div className="text-sm">
              Diapositiva {currentSlide + 1} de {items.length}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={prevSlide} disabled={currentSlide === 0} className="text-white">
              Anterior
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextSlide}
              disabled={currentSlide === items.length - 1}
              className="text-white"
            >
              Siguiente
            </Button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-8" style={backgroundStyle}>
          {currentItem && (
            <div
              className="max-w-4xl w-full mx-auto bg-white rounded-lg shadow-2xl p-8"
              style={{
                borderRadius: currentItem.style?.borderRadius || 8,
                backgroundColor: currentItem.style?.backgroundColor || "#ffffff",
                color: currentItem.style?.textColor || "#1e293b",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              }}
            >
              <h2 className="text-3xl font-bold mb-4">{currentItem.title || `Elemento ${currentSlide + 1}`}</h2>
              <div className="text-xl whitespace-pre-wrap">{currentItem.content}</div>
              {currentItem.type === "image" && (
                <div className="mt-4">
                  <img
                    src={currentItem.content || "/placeholder.svg"}
                    alt={currentItem.title || "Imagen"}
                    className="max-h-[60vh] mx-auto object-contain"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div >
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Panel de depuración mejorado con botón de emergencia */}
      <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-1 text-xs text-yellow-800 flex flex-col" style={{ display: process.env.NODE_ENV === 'production' ? 'none' : 'block' }}>
        <div className="font-bold">Modo depuración - Estado de permisos:</div>
        <div>ID Usuario: {user?.id || localStorage.getItem("auth_user_id") || '[no autenticado]'} | ID Propietario: {mural?.ownerId || '[desconocido]'}</div>
        <div>canEdit: {canEdit ? 'SÍ' : 'NO'} | Permisos forzados: {forceEditPermission ? 'SÍ' : 'NO'} | Permisos efectivos: {effectiveCanEdit ? 'SÍ' : 'NO'}</div>
        <div>¿Es propietario?: {safeCompareIds(user?.id || localStorage.getItem("auth_user_id"), mural?.ownerId) ? 'SÍ' : 'NO'}</div>
        <div className="mt-1 flex space-x-2">
          <button
            onClick={forceOwnerPermissions}
            className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-0.5 rounded text-xs font-bold"
          >
            APLICAR PERMISOS DE PROPIETARIO
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("is_mural_owner");
              localStorage.removeItem("mural_" + muralId + "_permissions");
              setCanEdit(false);
              setForceEditPermission(false);
              toast({ title: "Permisos eliminados", description: "Se han reseteado los permisos" });
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-2 py-0.5 rounded text-xs"
          >
            Eliminar permisos
          </button>
        </div>
      </div>

      <div className="border-b bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-600">
              {mural.title}
            </h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <p>{mural.description}</p>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Actualizado {new Date(mural.updatedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{mural.views} vistas</span>
              </div>
              {isConnected && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Conectado en tiempo real
                </Badge>
              )}
              {timerActive && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  <Timer className="h-3 w-3 mr-1" />
                  {formatTime(timeRemaining)}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {effectiveCanEdit && (
              <Button
                variant={hasUnsavedChanges ? "default" : "outline"}
                size="sm"
                onClick={saveMural}
                className={hasUnsavedChanges ? "bg-blue-500 hover:bg-blue-600" : "border-blue-200 hover:bg-blue-50"}
              >
                <Save className="h-4 w-4 mr-2 text-blue-500" />
                {hasUnsavedChanges ? "Guardar cambios" : "Guardado"}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCollaborators(!showCollaborators)}
              className={`border-blue-200 hover:bg-blue-50 ${showCollaborators ? "bg-blue-50" : ""}`}
            >
              <Users className="h-4 w-4 mr-2 text-blue-500" />
              Colaboradores
              <Badge className="ml-2 bg-blue-500">{activeUsers.length}</Badge>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEducationalTools(!showEducationalTools)}
              className={`border-green-200 hover:bg-green-50 ${showEducationalTools ? "bg-green-50" : ""}`}
            >
              <BookOpen className="h-4 w-4 mr-2 text-green-500" />
              Herramientas educativas
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExportOptions(!showExportOptions)}
              className={`border-purple-200 hover:bg-purple-50 ${showExportOptions ? "bg-purple-50" : ""}`}
            >
              <Download className="h-4 w-4 mr-2 text-purple-500" />
              Exportar
            </Button>
            {canShare && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsShareDialogOpen(true)}
                className="border-purple-200 hover:bg-purple-50"
              >
                <Share2 className="h-4 w-4 mr-2 text-purple-500" />
                Compartir
              </Button>
            )}
            {canComment && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowComments(!showComments)}
                className={`border-pink-200 hover:bg-pink-50 ${showComments ? "bg-pink-50" : ""}`}
              >
                <MessageSquare className="h-4 w-4 mr-2 text-pink-500" />
                Comentarios
                <Badge className="ml-2 bg-pink-500">5</Badge>
              </Button>
            )}
            {canShare && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSettingsDialogOpen(true)}
                className="border-amber-200 hover:bg-amber-50"
              >
                <Settings className="h-4 w-4 mr-2 text-amber-500" />
                Configuración
              </Button>
            )}
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b">
          <div className="container mx-auto px-4">
            <TabsList className="h-10">
              <TabsTrigger value="canvas" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                Lienzo
              </TabsTrigger>
              <TabsTrigger
                value="presentation"
                className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700"
              >
                Presentación
              </TabsTrigger>
              <TabsTrigger
                value="timeline"
                className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700"
              >
                Línea de tiempo
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700"
              >
                Actividad
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="canvas" className="flex-1 flex flex-col data-[state=active]:flex-1">
          {/* Usar effectiveCanEdit en lugar de canEdit para determinar si mostrar la barra de herramientas */}
          {effectiveCanEdit && (
            <MuralToolbar
              onAddItem={() => toggleAddDialog(true)}
              onAddImage={handleAddImage}
              muralId={muralId}
            />
          )}

          <div className="flex flex-1 overflow-hidden">
            <div
              ref={canvasRef}
              className={`flex-1 overflow-auto p-4 relative ${mural.background && !mural.background.startsWith("url") ? mural.background : ""
                }`}
              style={backgroundStyle}
              onClick={handleCanvasClick}
              onMouseMove={handleMouseMove}
            >
              {!effectiveCanEdit && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                    Modo visualización
                  </Badge>
                </div>
              )}

              {/* Cursores remotos */}
              <RemoteCursors />

              <div className="relative w-full h-full min-h-[800px]">
                {/* Añadir mensaje cuando no hay elementos */}
                {items.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-6 bg-white/90 rounded-lg shadow-sm border">
                      <h3 className="text-xl font-medium text-gray-700 mb-2">Este mural está vacío</h3>
                      <p className="text-gray-500 mb-4">No hay elementos para mostrar. {effectiveCanEdit ? 'Añade tu primer elemento para comenzar.' : 'El propietario aún no ha añadido contenido.'}</p>
                      {effectiveCanEdit && (
                        <Button
                          onClick={() => toggleAddDialog(true)}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Añadir primer elemento
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Información de depuración en modo desarrollo */}
                {process.env.NODE_ENV !== 'production' && (
                  <div className="absolute top-20 right-4 bg-yellow-100 px-3 py-1 text-xs text-yellow-800 rounded border border-yellow-300">
                    Items: {items.length}
                  </div>
                )}

                {items.map((item) => {
                  // Verificar si este elemento está siendo editado por otro usuario
                  const editingUser = activeUsers.find(
                    (activeUser) => activeUser.id !== user?.id && activeUser.focusedItemId === item.id,
                  )

                  console.log(`Renderizando MuralItem: ${item.id}, tipo: ${item.type}`);

                  return (
                    <MuralItem
                      key={item.id}
                      item={item}
                      onUpdate={effectiveCanEdit ? updateItem : undefined}
                      onDelete={effectiveCanEdit ? deleteItem : undefined}
                      zIndex={zIndexes[item.id] || 1}
                      onFocus={handleItemFocus}
                      readOnly={!effectiveCanEdit || !!editingUser}
                      editingUser={editingUser}
                    />
                  )
                })}
              </div>
            </div>

            {showCollaborators && (
              <div className="w-80 border-l bg-white overflow-auto p-4">
                <h3 className="font-medium mb-4">Colaboradores activos</h3>
                <ActiveUsers />
              </div>
            )}

            {showComments && canComment && (
              <div className="w-80 border-l bg-white overflow-auto">
                <CommentsPanel muralId={muralId} />
              </div>
            )}

            {showEducationalTools && (
              <div className="w-96 border-l bg-white overflow-auto p-4">
                <div className="space-y-6">
                  <h3 className="font-medium">Herramientas educativas</h3>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Temporizador de actividad</h4>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={timerDuration}
                        onChange={(e) => {
                          const value = Number.parseInt(e.target.value)
                          setTimerDuration(value)
                          setTimeRemaining(value)
                        }}
                        className="w-20"
                        min="1"
                      />
                      <span className="text-sm text-muted-foreground">segundos</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleTimer}
                        className={timerActive ? "bg-amber-50 text-amber-700" : ""}
                      >
                        {timerActive ? "Pausar" : "Iniciar"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={resetTimer}>
                        Reiniciar
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Presentación</h4>
                    <div className="flex gap-2"></div>
                    <Button variant="outline" size="sm" onClick={startPresentation} className="w-full">
                      <PresentationIcon className="h-4 w-4 mr-2" />
                      Iniciar presentación
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <h4 className="text-sm font-medium">Recursos educativos</h4>
                  <div className="space-y-1">
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <BookOpen className="h-4 w-4 mr-2 text-blue-500" />
                      Guía de actividades
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2 text-purple-500" />
                      Gestionar grupos
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <CheckCircleIcon className="h-4 w-4 mr-2 text-green-500" />
                      Evaluación
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t mt-4">
                  <Button
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    onClick={() => setActiveTab("activity")}
                  >
                    Configurar como actividad educativa
                  </Button>
                </div>
              </div>
            )}

            {showExportOptions && (
              <div className="w-96 border-l bg-white overflow-auto p-4">
                <MuralExportOptions muralId={muralId} muralTitle={mural.title} />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent
          value="presentation"
          className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-teal-50"
        >
          <div className="text-center p-8 max-w-md">
            <h2 className="text-2xl font-bold text-green-700 mb-4">Modo Presentación</h2>
            <p className="text-muted-foreground mb-6">
              Presenta tu mural como una presentación de diapositivas. Cada elemento se mostrará como una diapositiva
              individual.
            </p>
            <Button
              className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
              onClick={startPresentation}
            >
              <PresentationIcon className="h-4 w-4 mr-2" />
              Iniciar Presentación
            </Button>
          </div>
        </TabsContent>

        <TabsContent
          value="timeline"
          className="flex-1 overflow-auto bg-gradient-to-br from-purple-50 to-indigo-50 p-6"
        >
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-purple-700 mb-6">Línea de Tiempo</h2>
            <div className="relative border-l-2 border-purple-300 ml-4 pl-8 space-y-8">
              {[...items]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((item, index) => (
                  <div key={item.id} className="relative">
                    <div className="absolute -left-10 mt-1.5 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs">
                      {index + 1}
                    </div>
                    <div className={`p-4 rounded-lg shadow-sm ${item.color}`}>
                      <div className="font-medium mb-1">{item.title || `Elemento ${item.type}`}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.type === "text" ? item.content : "Contenido multimedia"}
                      </div>
                      <div className="text-xs text-purple-600 mt-2">
                        Añadido el {new Date(item.createdAt).toLocaleDateString()} por{" "}
                        {item.createdBy === user?.id ? "ti" : "otro colaborador"}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="flex-1 overflow-auto bg-gradient-to-br from-amber-50 to-orange-50 p-6">
          <div className="max-w-3xl mx-auto">
            <ClassroomActivityManager
              muralId={muralId}
              muralTitle={mural.title}
              muralDescription={mural.description || ""}
            />
          </div>
        </TabsContent>
      </Tabs>
      {/* Usar effectiveCanEdit en lugar de canEdit */}   )
      { }
      {effectiveCanEdit && (
        <AddItemDialog
          open={isAddDialogOpen}
          onOpenChange={toggleAddDialog}
          onAddItem={handleItemSubmit}
        />
      )}
      {
        canShare && (
          <ShareMuralDialog
            open={isShareDialogOpen}
            onOpenChange={setIsShareDialogOpen}
            mural={mural}
            onMuralUpdated={handleMuralUpdated}
          />
        )
      }

      {
        canShare && (
          <MuralSettingsDialog
            open={isSettingsDialogOpen}
            onOpenChange={setIsSettingsDialogOpen}
            muralId={muralId}
            onMuralUpdated={handleMuralUpdated}
          />
        )
      }

      <Toaster />
    </div >
  )
}

function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

function PauseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  )
}

function PlayIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  )
}

function RefreshCcwIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 2v6h6" />
      <path d="M21 12A9 9 0 0 0 6 5.3L3 8" />
      <path d="M21 22v-6h-6" />
      <path d="M3 12a9 9 0 0 0 15 6.7l3-2.7" />
    </svg>
  )
}
