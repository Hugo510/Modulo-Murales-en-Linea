"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, FileText, ImageIcon, Printer, LinkIcon, PresentationIcon, FileJson } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface MuralExportOptionsProps {
  muralId: string
  muralTitle: string
}

export function MuralExportOptions({ muralId, muralTitle }: MuralExportOptionsProps) {
  const [activeTab, setActiveTab] = useState("image")
  const [exportOptions, setExportOptions] = useState({
    format: "png",
    quality: "high",
    includeComments: true,
    includeMetadata: true,
    showCollaborators: true,
    showTimestamps: true,
    width: "1920",
    height: "1080",
    presentationMode: "auto",
    slideTransition: "fade",
    slideDuration: "5",
  })

  const handleExport = () => {
    // Aquí iría la lógica para exportar el mural
    toast({
      title: "Exportación iniciada",
      description: `Exportando mural como ${activeTab === "image" ? exportOptions.format : activeTab}`,
    })

    // Simular finalización de exportación
    setTimeout(() => {
      toast({
        title: "Exportación completada",
        description: "El archivo ha sido descargado correctamente",
      })
    }, 2000)
  }

  const handleOptionChange = (name: string, value: any) => {
    setExportOptions((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
          Exportar y Presentar Mural
        </CardTitle>
        <CardDescription>Exporta tu mural en diferentes formatos o preséntalo en clase</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="image" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              Imagen
            </TabsTrigger>
            <TabsTrigger value="pdf" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-700">
              PDF
            </TabsTrigger>
            <TabsTrigger
              value="presentation"
              className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700"
            >
              Presentación
            </TabsTrigger>
            <TabsTrigger value="data" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
              Datos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="image" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="format">Formato de imagen</Label>
                <Select value={exportOptions.format} onValueChange={(value) => handleOptionChange("format", value)}>
                  <SelectTrigger className="border-2 focus-visible:ring-blue-500">
                    <SelectValue placeholder="Selecciona un formato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">PNG (con transparencia)</SelectItem>
                    <SelectItem value="jpg">JPG (más pequeño)</SelectItem>
                    <SelectItem value="webp">WebP (mejor calidad/tamaño)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quality">Calidad</Label>
                <Select value={exportOptions.quality} onValueChange={(value) => handleOptionChange("quality", value)}>
                  <SelectTrigger className="border-2 focus-visible:ring-blue-500">
                    <SelectValue placeholder="Selecciona la calidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baja (archivo pequeño)</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta (mejor calidad)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="width">Ancho (px)</Label>
                <Input
                  id="width"
                  type="number"
                  value={exportOptions.width}
                  onChange={(e) => handleOptionChange("width", e.target.value)}
                  className="border-2 focus-visible:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Alto (px)</Label>
                <Input
                  id="height"
                  type="number"
                  value={exportOptions.height}
                  onChange={(e) => handleOptionChange("height", e.target.value)}
                  className="border-2 focus-visible:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <h3 className="font-medium mb-2">Opciones adicionales</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeComments"
                    checked={exportOptions.includeComments}
                    onCheckedChange={(checked) => handleOptionChange("includeComments", checked)}
                  />
                  <Label htmlFor="includeComments">Incluir comentarios</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeMetadata"
                    checked={exportOptions.includeMetadata}
                    onCheckedChange={(checked) => handleOptionChange("includeMetadata", checked)}
                  />
                  <Label htmlFor="includeMetadata">Incluir metadatos (título, descripción)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showCollaborators"
                    checked={exportOptions.showCollaborators}
                    onCheckedChange={(checked) => handleOptionChange("showCollaborators", checked)}
                  />
                  <Label htmlFor="showCollaborators">Mostrar colaboradores</Label>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <ImageIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-blue-800">Previsualización</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    La imagen exportada tendrá un tamaño de {exportOptions.width}x{exportOptions.height} píxeles en
                    formato {exportOptions.format.toUpperCase()}.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pdf" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pdfQuality">Calidad</Label>
                <Select value={exportOptions.quality} onValueChange={(value) => handleOptionChange("quality", value)}>
                  <SelectTrigger className="border-2 focus-visible:ring-red-500">
                    <SelectValue placeholder="Selecciona la calidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baja (archivo pequeño)</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta (mejor calidad)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pdfFormat">Formato de página</Label>
                <Select defaultValue="a4">
                  <SelectTrigger className="border-2 focus-visible:ring-red-500">
                    <SelectValue placeholder="Selecciona un formato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a4">A4</SelectItem>
                    <SelectItem value="letter">Carta</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                    <SelectItem value="tabloid">Tabloide</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <h3 className="font-medium mb-2">Opciones adicionales</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pdfIncludeComments"
                    checked={exportOptions.includeComments}
                    onCheckedChange={(checked) => handleOptionChange("includeComments", checked)}
                  />
                  <Label htmlFor="pdfIncludeComments">Incluir comentarios</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pdfIncludeMetadata"
                    checked={exportOptions.includeMetadata}
                    onCheckedChange={(checked) => handleOptionChange("includeMetadata", checked)}
                  />
                  <Label htmlFor="pdfIncludeMetadata">Incluir metadatos (título, descripción)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pdfShowTimestamps"
                    checked={exportOptions.showTimestamps}
                    onCheckedChange={(checked) => handleOptionChange("showTimestamps", checked)}
                  />
                  <Label htmlFor="pdfShowTimestamps">Mostrar fechas de creación/modificación</Label>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-100 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-3">
                <div className="bg-red-100 p-2 rounded-full">
                  <FileText className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-medium text-red-800">Información PDF</h3>
                  <p className="text-sm text-red-700 mt-1">
                    El PDF incluirá todos los elementos del mural y podrá ser impreso o compartido fácilmente.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="presentation" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="presentationMode">Modo de presentación</Label>
                <Select
                  value={exportOptions.presentationMode}
                  onValueChange={(value) => handleOptionChange("presentationMode", value)}
                >
                  <SelectTrigger className="border-2 focus-visible:ring-green-500">
                    <SelectValue placeholder="Selecciona un modo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Automático (por tiempo)</SelectItem>
                    <SelectItem value="manual">Manual (control de avance)</SelectItem>
                    <SelectItem value="interactive">Interactivo (con enlaces)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slideTransition">Transición entre diapositivas</Label>
                <Select
                  value={exportOptions.slideTransition}
                  onValueChange={(value) => handleOptionChange("slideTransition", value)}
                >
                  <SelectTrigger className="border-2 focus-visible:ring-green-500">
                    <SelectValue placeholder="Selecciona una transición" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fade">Desvanecer</SelectItem>
                    <SelectItem value="slide">Deslizar</SelectItem>
                    <SelectItem value="zoom">Zoom</SelectItem>
                    <SelectItem value="none">Ninguna</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {exportOptions.presentationMode === "auto" && (
                <div className="space-y-2">
                  <Label htmlFor="slideDuration">Duración por diapositiva (segundos)</Label>
                  <Input
                    id="slideDuration"
                    type="number"
                    value={exportOptions.slideDuration}
                    onChange={(e) => handleOptionChange("slideDuration", e.target.value)}
                    className="border-2 focus-visible:ring-green-500"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2 pt-4">
              <h3 className="font-medium mb-2">Opciones de presentación</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Modo pantalla completa</p>
                    <p className="text-sm text-muted-foreground">Iniciar presentación en pantalla completa</p>
                  </div>
                  <Switch defaultChecked={true} className="data-[state=checked]:bg-green-500" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Mostrar controles de navegación</p>
                    <p className="text-sm text-muted-foreground">Mostrar botones para avanzar/retroceder</p>
                  </div>
                  <Switch defaultChecked={true} className="data-[state=checked]:bg-green-500" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Incluir índice</p>
                    <p className="text-sm text-muted-foreground">Mostrar un índice de elementos al inicio</p>
                  </div>
                  <Switch defaultChecked={true} className="data-[state=checked]:bg-green-500" />
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-100 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <PresentationIcon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-green-800">Presentación en clase</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Puedes iniciar la presentación directamente o exportarla para usarla sin conexión.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="data" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataFormat">Formato de datos</Label>
                <Select defaultValue="json">
                  <SelectTrigger className="border-2 focus-visible:ring-purple-500">
                    <SelectValue placeholder="Selecciona un formato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataScope">Alcance de los datos</Label>
                <Select defaultValue="complete">
                  <SelectTrigger className="border-2 focus-visible:ring-purple-500">
                    <SelectValue placeholder="Selecciona el alcance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="complete">Completo (todos los datos)</SelectItem>
                    <SelectItem value="content">Solo contenido</SelectItem>
                    <SelectItem value="structure">Solo estructura</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <h3 className="font-medium mb-2">Opciones adicionales</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox defaultChecked />
                  <Label>Incluir metadatos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox defaultChecked />
                  <Label>Incluir historial de cambios</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox defaultChecked />
                  <Label>Incluir información de colaboradores</Label>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-3">
                <div className="bg-purple-100 p-2 rounded-full">
                  <FileJson className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-purple-800">Exportación de datos</h3>
                  <p className="text-sm text-purple-700 mt-1">
                    Útil para análisis, respaldo o integración con otras herramientas educativas.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Imprimir
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            Compartir enlace
          </Button>
        </div>
        <Button
          onClick={handleExport}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar {activeTab === "image" ? exportOptions.format.toUpperCase() : activeTab.toUpperCase()}
        </Button>
      </CardFooter>
    </Card>
  )
}
