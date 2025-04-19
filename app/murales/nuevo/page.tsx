"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, ImageIcon, Palette, Layout, Sparkles } from "lucide-react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { BackgroundSelector } from "@/components/background-selector"
import { TemplateSelector } from "@/components/template-selector"
import { ItemStyleCustomizer } from "@/components/item-style-customizer"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { createMural } from "@/services/mural-service"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { useGlobalToast } from "@/components/ui/toast-helper"

export default function NuevoMuralPage() {
  return (
    <ProtectedRoute>
      <NuevoMural />
    </ProtectedRoute>
  );
}

function NuevoMural() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { toast } = useGlobalToast();
  const [fallbackUser, setFallbackUser] = useState<any>(null);
  const formSubmitted = useRef(false);

  useEffect(() => {
    if (!user && typeof window !== 'undefined') {
      const userId = localStorage.getItem("auth_user_id");
      if (userId) {
        const localUser = {
          id: userId,
          name: localStorage.getItem("auth_user_name") || "Usuario",
          email: localStorage.getItem("auth_user_email") || "",
          role: localStorage.getItem("auth_user_role") || "user"
        };
        setFallbackUser(localUser);
        console.log("NuevoMural: Usando datos de usuario del localStorage:", localUser);
      }
    }
  }, [user]);

  useEffect(() => {
    const checkGlobalUser = () => {
      if (!user && typeof window !== 'undefined' && (window as any).__AUTH_USER) {
        setFallbackUser((window as any).__AUTH_USER);
        console.log("NuevoMural: Usando datos de usuario globales:", (window as any).__AUTH_USER);
      }
    };

    checkGlobalUser();

    const intervalId = setInterval(checkGlobalUser, 1000);
    return () => clearInterval(intervalId);
  }, [user]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "education",
    isPublic: true,
    allowComments: true,
    allowEditing: true,
    background: "bg-gradient-to-br from-pink-400 to-purple-500",
    layout: "grid" as "grid" | "masonry",
    itemStyle: {
      borderStyle: "border",
      borderColor: "#e2e8f0",
      backgroundColor: "#ffffff",
      textColor: "#1e293b",
      shadowStyle: "shadow-md",
      borderRadius: 8,
      fontStyle: "font-sans",
      fontSize: "text-base",
      rotation: 0,
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    if (name === "layout" && (value === "grid" || value === "masonry")) {
      setFormData((prev) => ({ ...prev, [name]: value as "grid" | "masonry" }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleToggleChange = (name: string, value: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleBackgroundChange = (background: string) => {
    setFormData((prev) => ({ ...prev, background }))
  }

  const handleTemplateChange = (template: any) => {
    setFormData((prev) => ({
      ...prev,
      background: template.background,
      itemStyle: {
        ...prev.itemStyle,
        borderStyle: template.itemStyle.includes("border") ? template.itemStyle : prev.itemStyle.borderStyle,
        shadowStyle: template.itemStyle.includes("shadow") ? template.itemStyle : prev.itemStyle.shadowStyle,
        textColor: template.textColor,
      },
    }))
  }

  const handleItemStyleChange = (itemStyle: any) => {
    setFormData((prev) => ({ ...prev, itemStyle }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formSubmitted.current) {
      console.log("Formulario ya enviado, ignorando solicitud duplicada");
      return;
    }

    formSubmitted.current = true;

    const effectiveUser = user || fallbackUser || (typeof window !== 'undefined' ? (window as any).__AUTH_USER : null);

    if (!effectiveUser) {
      console.log("No hay usuario disponible en el momento del envío");
      toast({
        title: "Error de autenticación",
        description: "No se pudo verificar tu sesión. Por favor, intenta iniciar sesión nuevamente.",
        variant: "destructive",
      });

      setTimeout(() => router.push("/login"), 1500);
      return;
    }

    console.log("Usando usuario para crear mural:", effectiveUser);

    if (!formData.title.trim()) {
      console.log("Título del mural vacío");
      toast({
        title: "Error",
        description: "El título del mural es obligatorio",
        variant: "destructive",
      });
      formSubmitted.current = false;
      return;
    }

    setLoading(true);
    try {
      console.log("Creando mural con usuario:", effectiveUser.id);

      const newMural = await createMural(
        {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          isPublic: formData.isPublic,
          allowComments: formData.allowComments,
          allowEditing: formData.allowEditing,
          background: formData.background,
          layout: formData.layout,
          itemStyle: formData.itemStyle,
        },
        effectiveUser.id
      );

      console.log("Mural creado:", newMural);

      if (newMural && newMural.id) {
        toast({
          title: "Mural creado",
          description: "Tu nuevo mural ha sido creado correctamente",
        });

        setTimeout(() => {
          console.log("Redirigiendo a:", `/murales/${newMural.id}`);
          router.push(`/murales/${newMural.id}`);
        }, 500);
      } else {
        console.error("El mural fue creado pero sin ID:", newMural);
        throw new Error("El mural fue creado sin un ID válido");
      }
    } catch (error) {
      console.error("Error al crear mural:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al crear el mural",
        variant: "destructive",
      });
      formSubmitted.current = false;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/" className="mr-4">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">
            Crear Nuevo Mural
          </h1>
        </div>

        <Tabs defaultValue="basic" className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              Básico
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Apariencia
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Plantillas
            </TabsTrigger>
            <TabsTrigger value="sharing" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Compartir
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            <TabsContent value="basic" className="space-y-6 p-4 border rounded-lg mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Título del mural"
                  required
                  className="border-2 focus-visible:ring-pink-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe el propósito de este mural"
                  rows={3}
                  className="border-2 focus-visible:ring-pink-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                  <SelectTrigger className="border-2 focus-visible:ring-pink-500">
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="education">Educación</SelectItem>
                    <SelectItem value="business">Negocios</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="creative">Creativo</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6 p-4 border rounded-lg mt-4">
              <div className="space-y-4">
                <h3 className="font-medium">Fondo del mural</h3>
                <BackgroundSelector value={formData.background} onChange={handleBackgroundChange} />
              </div>

              <div className="border-t pt-4 space-y-4">
                <h3 className="font-medium">Estilo de los elementos</h3>
                <ItemStyleCustomizer value={formData.itemStyle} onChange={handleItemStyleChange} />
              </div>

              <div className="space-y-2 border-t pt-4">
                <Label>Diseño del mural</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <input
                      type="radio"
                      id="grid-layout"
                      name="layout"
                      value="grid"
                      checked={formData.layout === "grid"}
                      onChange={() => handleSelectChange("layout", "grid")}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="grid-layout"
                      className="flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer hover:bg-muted peer-checked:border-pink-500 peer-checked:bg-pink-50"
                    >
                      <div className="grid grid-cols-2 gap-2 w-full mb-2">
                        <div className="bg-pink-200 h-8 rounded"></div>
                        <div className="bg-pink-200 h-8 rounded"></div>
                        <div className="bg-pink-200 h-8 rounded"></div>
                        <div className="bg-pink-200 h-8 rounded"></div>
                      </div>
                      <span>Cuadrícula</span>
                    </Label>
                  </div>
                  <div className="relative">
                    <input
                      type="radio"
                      id="masonry-layout"
                      name="layout"
                      value="masonry"
                      checked={formData.layout === "masonry"}
                      onChange={() => handleSelectChange("layout", "masonry")}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="masonry-layout"
                      className="flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer hover:bg-muted peer-checked:border-pink-500 peer-checked:bg-pink-50"
                    >
                      <div className="flex flex-col w-full mb-2">
                        <div className="flex gap-2 mb-2">
                          <div className="bg-purple-200 h-6 w-1/3 rounded"></div>
                          <div className="bg-purple-200 h-10 w-2/3 rounded"></div>
                        </div>
                        <div className="flex gap-2">
                          <div className="bg-purple-200 h-10 w-2/3 rounded"></div>
                          <div className="bg-purple-200 h-6 w-1/3 rounded"></div>
                        </div>
                      </div>
                      <span>Mosaico</span>
                    </Label>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="templates" className="space-y-6 p-4 border rounded-lg mt-4">
              <TemplateSelector value={formData.background} onChange={handleTemplateChange} />

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  <h3 className="font-medium text-purple-800">Vista previa</h3>
                </div>
                <div
                  className={`w-full h-40 rounded-lg p-4 relative overflow-hidden ${formData.background.startsWith("url") ? "" : formData.background
                    }`}
                  style={{
                    background: formData.background.startsWith("url") ? formData.background : "",
                  }}
                >
                  <div
                    className={`absolute w-32 h-24 p-3 ${formData.itemStyle.borderStyle} ${formData.itemStyle.shadowStyle} ${formData.itemStyle.fontStyle}`}
                    style={{
                      borderRadius: `${formData.itemStyle.borderRadius}px`,
                      borderColor: formData.itemStyle.borderColor,
                      backgroundColor: formData.itemStyle.backgroundColor,
                      color: formData.itemStyle.textColor,
                      transform: `rotate(${formData.itemStyle.rotation}deg)`,
                      top: "20px",
                      left: "20px",
                    }}
                  >
                    <div className={`${formData.itemStyle.fontSize}`}>Elemento de ejemplo</div>
                  </div>
                  <div
                    className={`absolute w-40 h-20 p-3 ${formData.itemStyle.borderStyle} ${formData.itemStyle.shadowStyle} ${formData.itemStyle.fontStyle}`}
                    style={{
                      borderRadius: `${formData.itemStyle.borderRadius}px`,
                      borderColor: formData.itemStyle.borderColor,
                      backgroundColor: formData.itemStyle.backgroundColor,
                      color: formData.itemStyle.textColor,
                      transform: `rotate(${-formData.itemStyle.rotation}deg)`,
                      bottom: "20px",
                      right: "20px",
                    }}
                  >
                    <div className={`${formData.itemStyle.fontSize}`}>Otro elemento</div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sharing" className="space-y-6 p-4 border rounded-lg mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Mural público</p>
                  <p className="text-sm text-muted-foreground">Permitir que cualquiera pueda ver este mural</p>
                </div>
                <Switch
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => handleToggleChange("isPublic", checked)}
                  className="data-[state=checked]:bg-pink-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Permitir comentarios</p>
                  <p className="text-sm text-muted-foreground">Los usuarios pueden comentar en el mural</p>
                </div>
                <Switch
                  checked={formData.allowComments}
                  onCheckedChange={(checked) => handleToggleChange("allowComments", checked)}
                  className="data-[state=checked]:bg-pink-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Permitir edición</p>
                  <p className="text-sm text-muted-foreground">Los colaboradores pueden editar el contenido</p>
                </div>
                <Switch
                  checked={formData.allowEditing}
                  onCheckedChange={(checked) => handleToggleChange("allowEditing", checked)}
                  className="data-[state=checked]:bg-pink-500"
                />
              </div>

              <div className="space-y-2 pt-4">
                <Label htmlFor="collaborators">Invitar colaboradores</Label>
                <div className="flex gap-2">
                  <Input
                    id="collaborators"
                    placeholder="Correo electrónico"
                    className="border-2 focus-visible:ring-pink-500"
                  />
                  <Button variant="outline">Invitar</Button>
                </div>
              </div>
            </TabsContent>

            <div className="pt-6">
              <Button
                type="submit"
                className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Creando...
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Crear Mural
                  </>
                )}
              </Button>
            </div>
          </form>
        </Tabs>
      </div>
      <Toaster />
    </div>
  )
}
