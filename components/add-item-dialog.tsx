"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FileText, ImageIcon, Link, Video, Upload } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface AddItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddItem: (item: any) => void
}

export function AddItemDialog({ open, onOpenChange, onAddItem }: AddItemDialogProps) {
  const [activeTab, setActiveTab] = useState("text")

  const [textContent, setTextContent] = useState("")
  const [textColor, setTextColor] = useState("bg-pink-100")

  const [imageUrl, setImageUrl] = useState("")
  const [imageCaption, setImageCaption] = useState("")
  const [imageColor, setImageColor] = useState("bg-purple-100")

  const [linkUrl, setLinkUrl] = useState("")
  const [linkTitle, setLinkTitle] = useState("")
  const [linkDescription, setLinkDescription] = useState("")
  const [linkColor, setLinkColor] = useState("bg-blue-100")

  const [videoUrl, setVideoUrl] = useState("")
  const [videoTitle, setVideoTitle] = useState("")
  const [videoColor, setVideoColor] = useState("bg-green-100")

  const [fileTitle, setFileTitle] = useState("")
  const [fileColor, setFileColor] = useState("bg-amber-100")

  const handleSubmit = () => {
    let newItem = { type: activeTab }

    switch (activeTab) {
      case "text":
        if (!textContent.trim()) return
        newItem = { ...newItem, content: textContent, color: textColor }
        break
      case "image":
        if (!imageUrl.trim()) return
        newItem = {
          ...newItem,
          content: imageUrl || "/placeholder.svg?height=200&width=300",
          caption: imageCaption,
          color: imageColor,
        }
        break
      case "link":
        if (!linkUrl.trim()) return
        newItem = {
          ...newItem,
          content: linkUrl,
          title: linkTitle,
          description: linkDescription,
          color: linkColor,
        }
        break
      case "video":
        if (!videoUrl.trim()) return
        newItem = {
          ...newItem,
          content: videoUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ",
          title: videoTitle,
          color: videoColor,
        }
        break
      case "file":
        if (!fileTitle.trim()) return
        newItem = {
          ...newItem,
          content: "documento.pdf",
          title: fileTitle,
          color: fileColor,
        }
        break
    }

    onAddItem(newItem)

    // Limpiar formularios
    setTextContent("")
    setImageUrl("")
    setImageCaption("")
    setLinkUrl("")
    setLinkTitle("")
    setLinkDescription("")
    setVideoUrl("")
    setVideoTitle("")
    setFileTitle("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">
            Añadir nuevo elemento
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="text" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="text" className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              Texto
            </TabsTrigger>
            <TabsTrigger value="image" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-purple-500" />
              Imagen
            </TabsTrigger>
            <TabsTrigger value="link" className="flex items-center gap-2">
              <Link className="h-4 w-4 text-green-500" />
              Enlace
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center gap-2">
              <Video className="h-4 w-4 text-red-500" />
              Video
            </TabsTrigger>
            <TabsTrigger value="file" className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-amber-500" />
              Archivo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="text-content">Contenido</Label>
              <Textarea
                id="text-content"
                placeholder="Escribe tu nota aquí..."
                rows={5}
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                className="border-2 focus-visible:ring-pink-500"
              />
            </div>
            <div className="space-y-2">
              <Label>Color de fondo</Label>
              <RadioGroup value={textColor} onValueChange={setTextColor} className="flex flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bg-pink-100" id="pink-text" className="peer sr-only" />
                  <Label
                    htmlFor="pink-text"
                    className="h-8 w-8 rounded-full bg-pink-100 border cursor-pointer ring-offset-2 peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-pink-500"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bg-purple-100" id="purple-text" className="peer sr-only" />
                  <Label
                    htmlFor="purple-text"
                    className="h-8 w-8 rounded-full bg-purple-100 border cursor-pointer ring-offset-2 peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-purple-500"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bg-blue-100" id="blue-text" className="peer sr-only" />
                  <Label
                    htmlFor="blue-text"
                    className="h-8 w-8 rounded-full bg-blue-100 border cursor-pointer ring-offset-2 peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-blue-500"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bg-green-100" id="green-text" className="peer sr-only" />
                  <Label
                    htmlFor="green-text"
                    className="h-8 w-8 rounded-full bg-green-100 border cursor-pointer ring-offset-2 peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-green-500"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bg-yellow-100" id="yellow-text" className="peer sr-only" />
                  <Label
                    htmlFor="yellow-text"
                    className="h-8 w-8 rounded-full bg-yellow-100 border cursor-pointer ring-offset-2 peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-yellow-500"
                  />
                </div>
              </RadioGroup>
            </div>
          </TabsContent>

          <TabsContent value="image" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="image-url">URL de la imagen</Label>
              <Input
                id="image-url"
                placeholder="https://ejemplo.com/imagen.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="border-2 focus-visible:ring-purple-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image-caption">Descripción (opcional)</Label>
              <Input
                id="image-caption"
                placeholder="Descripción de la imagen"
                value={imageCaption}
                onChange={(e) => setImageCaption(e.target.value)}
                className="border-2 focus-visible:ring-purple-500"
              />
            </div>
            <div className="space-y-2">
              <Label>Color de fondo</Label>
              <RadioGroup value={imageColor} onValueChange={setImageColor} className="flex flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bg-pink-100" id="pink-image" className="peer sr-only" />
                  <Label
                    htmlFor="pink-image"
                    className="h-8 w-8 rounded-full bg-pink-100 border cursor-pointer ring-offset-2 peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-pink-500"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bg-purple-100" id="purple-image" className="peer sr-only" />
                  <Label
                    htmlFor="purple-image"
                    className="h-8 w-8 rounded-full bg-purple-100 border cursor-pointer ring-offset-2 peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-purple-500"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bg-blue-100" id="blue-image" className="peer sr-only" />
                  <Label
                    htmlFor="blue-image"
                    className="h-8 w-8 rounded-full bg-blue-100 border cursor-pointer ring-offset-2 peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-blue-500"
                  />
                </div>
              </RadioGroup>
            </div>
          </TabsContent>

          <TabsContent value="link" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                placeholder="https://ejemplo.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="border-2 focus-visible:ring-green-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-title">Título</Label>
              <Input
                id="link-title"
                placeholder="Título del enlace"
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
                className="border-2 focus-visible:ring-green-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-description">Descripción (opcional)</Label>
              <Input
                id="link-description"
                placeholder="Descripción del enlace"
                value={linkDescription}
                onChange={(e) => setLinkDescription(e.target.value)}
                className="border-2 focus-visible:ring-green-500"
              />
            </div>
            <div className="space-y-2">
              <Label>Color de fondo</Label>
              <RadioGroup value={linkColor} onValueChange={setLinkColor} className="flex flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bg-blue-100" id="blue-link" className="peer sr-only" />
                  <Label
                    htmlFor="blue-link"
                    className="h-8 w-8 rounded-full bg-blue-100 border cursor-pointer ring-offset-2 peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-blue-500"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bg-green-100" id="green-link" className="peer sr-only" />
                  <Label
                    htmlFor="green-link"
                    className="h-8 w-8 rounded-full bg-green-100 border cursor-pointer ring-offset-2 peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-green-500"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bg-cyan-100" id="cyan-link" className="peer sr-only" />
                  <Label
                    htmlFor="cyan-link"
                    className="h-8 w-8 rounded-full bg-cyan-100 border cursor-pointer ring-offset-2 peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-cyan-500"
                  />
                </div>
              </RadioGroup>
            </div>
          </TabsContent>

          <TabsContent value="video" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="video-url">URL del video (YouTube, Vimeo, etc.)</Label>
              <Input
                id="video-url"
                placeholder="https://www.youtube.com/embed/..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="border-2 focus-visible:ring-red-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="video-title">Título</Label>
              <Input
                id="video-title"
                placeholder="Título del video"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                className="border-2 focus-visible:ring-red-500"
              />
            </div>
            <div className="space-y-2">
              <Label>Color de fondo</Label>
              <RadioGroup value={videoColor} onValueChange={setVideoColor} className="flex flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bg-green-100" id="green-video" className="peer sr-only" />
                  <Label
                    htmlFor="green-video"
                    className="h-8 w-8 rounded-full bg-green-100 border cursor-pointer ring-offset-2 peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-green-500"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bg-red-100" id="red-video" className="peer sr-only" />
                  <Label
                    htmlFor="red-video"
                    className="h-8 w-8 rounded-full bg-red-100 border cursor-pointer ring-offset-2 peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-red-500"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bg-indigo-100" id="indigo-video" className="peer sr-only" />
                  <Label
                    htmlFor="indigo-video"
                    className="h-8 w-8 rounded-full bg-indigo-100 border cursor-pointer ring-offset-2 peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-indigo-500"
                  />
                </div>
              </RadioGroup>
            </div>
          </TabsContent>

          <TabsContent value="file" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Archivo</Label>
              <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center bg-muted/50">
                <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-1">Arrastra y suelta un archivo aquí o</p>
                <Button variant="outline" size="sm">
                  Seleccionar archivo
                </Button>
                <p className="text-xs text-muted-foreground mt-2">PDF, DOCX, XLSX, etc. (Máx. 10MB)</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="file-title">Título</Label>
              <Input
                id="file-title"
                placeholder="Título del archivo"
                value={fileTitle}
                onChange={(e) => setFileTitle(e.target.value)}
                className="border-2 focus-visible:ring-amber-500"
              />
            </div>
            <div className="space-y-2">
              <Label>Color de fondo</Label>
              <RadioGroup value={fileColor} onValueChange={setFileColor} className="flex flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bg-amber-100" id="amber-file" className="peer sr-only" />
                  <Label
                    htmlFor="amber-file"
                    className="h-8 w-8 rounded-full bg-amber-100 border cursor-pointer ring-offset-2 peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-amber-500"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bg-orange-100" id="orange-file" className="peer sr-only" />
                  <Label
                    htmlFor="orange-file"
                    className="h-8 w-8 rounded-full bg-orange-100 border cursor-pointer ring-offset-2 peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-orange-500"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bg-teal-100" id="teal-file" className="peer sr-only" />
                  <Label
                    htmlFor="teal-file"
                    className="h-8 w-8 rounded-full bg-teal-100 border cursor-pointer ring-offset-2 peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-teal-500"
                  />
                </div>
              </RadioGroup>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          >
            Añadir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
