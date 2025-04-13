import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save } from "lucide-react"

export default function ConfiguracionPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Configuración</h1>

        <Tabs defaultValue="cuenta">
          <TabsList className="mb-6">
            <TabsTrigger value="cuenta">Cuenta</TabsTrigger>
            <TabsTrigger value="apariencia">Apariencia</TabsTrigger>
            <TabsTrigger value="notificaciones">Notificaciones</TabsTrigger>
          </TabsList>

          <TabsContent value="cuenta" className="space-y-6">
            <div className="space-y-4 p-6 border rounded-lg">
              <h2 className="text-xl font-medium">Información personal</h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input id="nombre" placeholder="Tu nombre" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input id="apellido" placeholder="Tu apellido" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input id="email" type="email" placeholder="tu@ejemplo.com" />
              </div>

              <Button className="mt-2">
                <Save className="h-4 w-4 mr-2" />
                Guardar cambios
              </Button>
            </div>

            <div className="space-y-4 p-6 border rounded-lg">
              <h2 className="text-xl font-medium">Cambiar contraseña</h2>

              <div className="space-y-2">
                <Label htmlFor="current-password">Contraseña actual</Label>
                <Input id="current-password" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">Nueva contraseña</Label>
                <Input id="new-password" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                <Input id="confirm-password" type="password" />
              </div>

              <Button className="mt-2">Actualizar contraseña</Button>
            </div>
          </TabsContent>

          <TabsContent value="apariencia" className="space-y-6">
            <div className="space-y-4 p-6 border rounded-lg">
              <h2 className="text-xl font-medium">Tema</h2>

              <div className="space-y-2">
                <Label htmlFor="theme">Seleccionar tema</Label>
                <Select defaultValue="system">
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Oscuro</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Switch id="animations" />
                <Label htmlFor="animations">Activar animaciones</Label>
              </div>
            </div>

            <div className="space-y-4 p-6 border rounded-lg">
              <h2 className="text-xl font-medium">Murales</h2>

              <div className="space-y-2">
                <Label htmlFor="default-color">Color predeterminado</Label>
                <Select defaultValue="blue">
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Azul</SelectItem>
                    <SelectItem value="green">Verde</SelectItem>
                    <SelectItem value="purple">Morado</SelectItem>
                    <SelectItem value="yellow">Amarillo</SelectItem>
                    <SelectItem value="pink">Rosa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Switch id="auto-save" defaultChecked />
                <Label htmlFor="auto-save">Guardar automáticamente</Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notificaciones" className="space-y-6">
            <div className="space-y-4 p-6 border rounded-lg">
              <h2 className="text-xl font-medium">Preferencias de notificaciones</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Comentarios</p>
                    <p className="text-sm text-muted-foreground">
                      Recibir notificaciones cuando alguien comente en tus murales
                    </p>
                  </div>
                  <Switch id="comments-notifications" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Colaboración</p>
                    <p className="text-sm text-muted-foreground">
                      Recibir notificaciones cuando te inviten a colaborar
                    </p>
                  </div>
                  <Switch id="collaboration-notifications" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Actualizaciones</p>
                    <p className="text-sm text-muted-foreground">
                      Recibir notificaciones sobre actualizaciones de la plataforma
                    </p>
                  </div>
                  <Switch id="updates-notifications" />
                </div>
              </div>
            </div>

            <div className="space-y-4 p-6 border rounded-lg">
              <h2 className="text-xl font-medium">Método de notificación</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Correo electrónico</p>
                    <p className="text-sm text-muted-foreground">Recibir notificaciones por correo electrónico</p>
                  </div>
                  <Switch id="email-notifications" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notificaciones en la aplicación</p>
                    <p className="text-sm text-muted-foreground">Mostrar notificaciones dentro de la aplicación</p>
                  </div>
                  <Switch id="app-notifications" defaultChecked />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
