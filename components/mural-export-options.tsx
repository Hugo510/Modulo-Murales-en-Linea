"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileImage, FilePdf, FileText, Download, Share2, ExternalLink } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface MuralExportOptionsProps {
  muralId: string
  muralTitle: string
}

export function MuralExportOptions({ muralId, muralTitle }: MuralExportOptionsProps) {
  const { toast } = useToast()
  const [isExporting, setIsExporting] = useState(false)
  const [includeComments, setIncludeComments] = useState(true)
  const [exportFormat, setExportFormat] = useState("pdf")
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [exportQuality, setExportQuality] = useState("medium")

  const handleExport = () => {
    setIsExporting(true)

    // Simulación de exportación
    setTimeout(() => {
      setIsExporting(false)
      toast({
        title: "Mural exportado",
        description: `El mural "${muralTitle}" ha sido exportado correctamente`,
      })
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-2 text-purple-700">Exportar Mural</h3>
        <p className="text-sm text-muted-foreground">
          Exporta tu mural en diferentes formatos para compartir o archivar.
        </p>
      </div>

      <Tabs defaultValue="export" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="export" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
            Exportar
          </TabsTrigger>
          <TabsTrigger value="share" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
            Compartir
          </TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Formato de exportación</Label>
            <RadioGroup value={exportFormat} onValueChange={setExportFormat} className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" className="peer sr-only" />
                <Label
                  htmlFor="pdf"
                  className="flex items-center gap-2 px-3 py-2 rounded-md border-2 cursor-pointer hover:bg-muted peer-data-[state=checked]:border-purple-500 peer-data-[state=checked]:bg-purple-50"
                >
                  <FilePdf className="h-4 w-4 text-purple-500" />
                  <span>PDF</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="image" id="image" className="peer sr-only" />
                <Label
                  htmlFor="image"
                  className="flex items-center gap-2 px-3 py-2 rounded-md border-2 cursor-pointer hover:bg-muted peer-data-[state=checked]:border-purple-500 peer-data-[state=checked]:bg-purple-50"
                >
                  <FileImage className="h-4 w-4 text-purple-500" />
                  <span>Imagen PNG</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2 pt-2">
            <Label>Calidad de la exportación</Label>
            <Select value={exportQuality} onValueChange={setExportQuality}>
              <SelectTrigger className="focus-visible:ring-purple-500">
                <SelectValue placeholder="Seleccionar calidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baja (más rápido)</SelectItem>
                <SelectItem value="medium">Media (recomendado)</SelectItem>
                <SelectItem value="high">Alta (más detalle)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 pt-2">
            <Label>Opciones adicionales</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-comments"
                  checked={includeComments}
                  onCheckedChange={(checked) => setIncludeComments(!!checked)}
                />
                <Label htmlFor="include-comments" className="text-sm font-normal">
                  Incluir comentarios
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="include-metadata" defaultChecked />
                <Label htmlFor="include-metadata" className="text-sm font-normal">
                  Incluir metadatos (título, autor, fecha)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="fit-content" defaultChecked />
                <Label htmlFor="fit-content" className="text-sm font-normal">
                  Ajustar al contenido
                </Label>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
            >
              {isExporting ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Exportando...
                </div>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar mural
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="share" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Opciones de compartir</Label>
            <Card className="border-2 border-dashed p-4">
              <CardContent className="p-0 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">Enlace público</span>
                  </div>
                  <Switch className="data-[state=checked]:bg-purple-500" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">Permitir descargas</span>
                  </div>
                  <Switch defaultChecked className="data-[state=checked]:bg-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-2">
            <Label>Enlace público</Label>
            <div className="flex gap-2">
              <Input
                value={`https://muralapp.example.com/share/${muralId}`}
                readOnly
                className="flex-1 bg-muted/50 border-2 focus-visible:ring-purple-500"
              />
              <Button variant="outline" className="flex-shrink-0" onClick={() => {
                navigator.clipboard.writeText(`https://muralapp.example.com/share/${muralId}`);
                toast({
                  title: "Enlace copiado",
                  description: "El enlace ha sido copiado al portapapeles",
                });
              }}>
                Copiar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Este enlace permite a cualquiera ver el mural sin necesidad de iniciar sesión.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <Label>Compartir en redes sociales</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <span className="text-blue-600">f</span>
                Facebook
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <span className="text-blue-400">t</span>
                Twitter
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <span className="text-blue-700">in</span>
                LinkedIn
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <span className="text-green-600">✉</span>
                Email
              </Button>
            </div>
          </div>

          <div className="pt-4">
            <Button className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700">
              <Share2 className="h-4 w-4 mr-2" />
              Compartir mural
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
