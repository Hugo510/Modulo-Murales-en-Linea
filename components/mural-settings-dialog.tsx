"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, Trash, AlertTriangle, Palette, Layout, SettingsIcon } from "lucide-react"
import { BackgroundSelector } from "@/components/background-selector"
import { TemplateSelector } from "@/components/template-selector"
import { ItemStyleCustomizer } from "@/components/item-style-customizer"
import { toast } from "@/components/ui/use-toast"
import { getMuralById, updateMural } from "@/services/mural-service"
import { useAuth } from "@/contexts/auth-context"

interface MuralSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  muralId: string
  onMuralUpdated: (updatedMural: Mural) => void  // Modificar aquí para aceptar un parámetro
}

export function MuralSettingsDialog({ open, onOpenChange, muralId, onMuralUpdated }: MuralSettingsDialogProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [mural, setMural] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isPublic: false,
    allowComments: true,
    allowEditing: true,
    background: "bg-gradient-to-br from-blue-50 to-cyan-100",
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

  // Cargar datos del mural
  useEffect(() => {
    if (open && muralId) {
      const loadMural = async () => {
        try {
          const muralData = await getMuralById(muralId)
          if (muralData) {
            setMural(muralData)
            setFormData({
              title: muralData.title,
              description: muralData.description,
              isPublic: muralData.isPublic,
              allowComments: muralData.allowComments,
              allowEditing: muralData.allowEditing,
              background: muralData.background || "bg-gradient-to-br from-blue-50 to-cyan-100",
              itemStyle: muralData.itemStyle || {
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
          }
        } catch (error) {
          console.error("Error al cargar el mural:", error)
          toast({
            title: "Error",
            description: "No se pudo cargar la configuración del mural",
            variant: "destructive",
          })
        }
      }

      loadMural()
    }
  }, [open, muralId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleToggleChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
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

  const handleSubmit = async () => {
    if (!user) return

    setLoading(true)
    try {
      await updateMural(
        muralId,
        {
          title: formData.title,
          description: formData.description,
          isPublic: formData.isPublic,
          allowComments: formData.allowComments,
          allowEditing: formData.allowEditing,
          background: formData.background,
          itemStyle: formData.itemStyle,
        },
        user.id,
      )

      toast({
        title: "Cambios guardados",
        description: "La configuración del mural ha sido actualizada",
      })

      if (onMuralUpdated) {
        onMuralUpdated()
      }

      onOpenChange(false)
    } catch (error) {
      console.error("Error al guardar cambios:", error)
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMural = async () => {
    // Implementar lógica para eliminar el mural
    // Esta funcionalidad requeriría confirmación adicional
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-600">
            Configuración del mural
          </DialogTitle>
          <DialogDescription>
            Personaliza las opciones y apariencia de tu mural.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger
              value="general"
              className="flex items-center gap-2 data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700"
            >
              <SettingsIcon className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger
              value="appearance"
              className="flex items-center gap-2 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700"
            >
              <Palette className="h-4 w-4" />
              Apariencia
            </TabsTrigger>
            <TabsTrigger
              value="advanced"
              className="flex items-center gap-2 data-[state=active]:bg-red-50 data-[state=active]:text-red-700"
            >
              <Layout className="h-4 w-4" />
              Avanzado
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="border-2 focus-visible:ring-amber-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="border-2 focus-visible:ring-amber-500"
              />
            </div>

            <div className="space-y-2">
              <Label>Visibilidad</Label>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Mural público</p>
                  <p className="text-sm text-muted-foreground">Permitir que cualquiera pueda ver este mural</p>
                </div>
                <Switch
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => handleToggleChange("isPublic", checked)}
                  className="data-[state=checked]:bg-amber-500"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6 mt-4">
            <div className="space-y-4">
              <h3 className="font-medium">Fondo del mural</h3>
              <BackgroundSelector value={formData.background} onChange={handleBackgroundChange} />
            </div>

            <div className="border-t pt-4">
              <TemplateSelector value={formData.background} onChange={handleTemplateChange} />
            </div>

            <div className="border-t pt-4 space-y-4">
              <h3 className="font-medium">Estilo de los elementos</h3>
              <ItemStyleCustomizer value={formData.itemStyle} onChange={handleItemStyleChange} />
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label>Permisos</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Permitir comentarios</p>
                    <p className="text-sm text-muted-foreground">Los usuarios pueden comentar en el mural</p>
                  </div>
                  <Switch
                    checked={formData.allowComments}
                    onCheckedChange={(checked) => handleToggleChange("allowComments", checked)}
                    className="data-[state=checked]:bg-orange-500"
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
                    className="data-[state=checked]:bg-orange-500"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-3" />
                  <div>
                    <h4 className="font-medium text-red-800">Zona de peligro</h4>
                    <p className="text-sm text-red-700 mt-1">
                      Las siguientes acciones son irreversibles. Procede con precaución.
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700">
                    Archivar mural
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={handleDeleteMural}
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Eliminar mural
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Guardando...
              </div>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar cambios
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
