"use client"

import { Textarea } from "@/components/ui/textarea"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Copy, Facebook, Twitter, Linkedin, Mail, Link2 } from "lucide-react"

interface ShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  muralId: string
}

export function ShareDialog({ open, onOpenChange, muralId }: ShareDialogProps) {
  const shareUrl = `https://muralapp.com/murales/${muralId}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl)
    // Aquí se podría mostrar una notificación de éxito
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-600">
            Compartir mural
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="link">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
              Enlace
            </TabsTrigger>
            <TabsTrigger value="social" className="data-[state=active]:bg-pink-50 data-[state=active]:text-pink-700">
              Redes sociales
            </TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4 mt-4">
            <div className="flex gap-2">
              <Input value={shareUrl} readOnly className="flex-1 bg-muted/50 border-2 focus-visible:ring-purple-500" />
              <Button
                onClick={copyToClipboard}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Cualquiera con el enlace puede ver</p>
                  <p className="text-sm text-muted-foreground">
                    Permite que cualquier persona con el enlace pueda ver este mural
                  </p>
                </div>
                <Switch defaultChecked className="data-[state=checked]:bg-purple-500" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Permitir comentarios</p>
                  <p className="text-sm text-muted-foreground">Los visitantes pueden dejar comentarios en el mural</p>
                </div>
                <Switch defaultChecked className="data-[state=checked]:bg-purple-500" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Proteger con contraseña</p>
                  <p className="text-sm text-muted-foreground">Requerir una contraseña para acceder al mural</p>
                </div>
                <Switch className="data-[state=checked]:bg-purple-500" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="social" className="space-y-6 mt-4">
            <p className="text-sm text-muted-foreground">
              Comparte este mural directamente en tus redes sociales favoritas
            </p>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="flex items-center gap-2 h-12 border-2 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
              >
                <Facebook className="h-5 w-5 text-blue-600" />
                Facebook
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2 h-12 border-2 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200"
              >
                <Twitter className="h-5 w-5 text-sky-500" />
                Twitter
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2 h-12 border-2 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
              >
                <Linkedin className="h-5 w-5 text-blue-700" />
                LinkedIn
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2 h-12 border-2 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200"
              >
                <Mail className="h-5 w-5 text-amber-500" />
                Email
              </Button>
            </div>

            <div className="pt-2">
              <Label htmlFor="message" className="text-sm font-medium">
                Mensaje personalizado (opcional)
              </Label>
              <Textarea
                id="message"
                placeholder="¡Echa un vistazo a este mural que he creado!"
                rows={3}
                className="mt-1.5 border-2 focus-visible:ring-pink-500"
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
            <Link2 className="h-4 w-4 mr-2" />
            Compartir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
