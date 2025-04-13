"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, X, Link2, Copy, Facebook, Twitter, Linkedin, Mail } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import type { Mural, PermissionRole } from "@/types/mural"
import { shareMural, removePermission, updateMural } from "@/services/mural-service"
import { toast } from "@/components/ui/use-toast"

interface ShareMuralDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mural: Mural
  onMuralUpdated: () => void
}

export function ShareMuralDialog({ open, onOpenChange, mural, onMuralUpdated }: ShareMuralDialogProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("people")
  const [searchEmail, setSearchEmail] = useState("")
  const [newRole, setNewRole] = useState<PermissionRole>("viewer")
  const [isPublic, setIsPublic] = useState(mural.isPublic)
  const [allowComments, setAllowComments] = useState(mural.allowComments)
  const [allowEditing, setAllowEditing] = useState(mural.allowEditing)
  const [isPasswordProtected, setIsPasswordProtected] = useState(false)
  const [password, setPassword] = useState("")
  const [showPasswordInput, setShowPasswordInput] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  // Restablecer estados cuando cambia el mural
  useEffect(() => {
    setIsPublic(mural.isPublic)
    setAllowComments(mural.allowComments)
    setAllowEditing(mural.allowEditing)
  }, [mural])

  // URL para compartir
  const shareUrl = `https://muralapp.com/murales/${mural.id}`

  // Copiar enlace al portapapeles
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
    toast({
      title: "Enlace copiado",
      description: "El enlace ha sido copiado al portapapeles",
    })
  }

  // Manejar cambio de visibilidad
  const handleVisibilityChange = async (isPublic: boolean) => {
    setIsPublic(isPublic)
    if (user) {
      const updated = await updateMural(mural.id, { isPublic }, user.id)
      if (updated) {
        onMuralUpdated()
      }
    }
  }

  // Manejar cambio de permisos de comentarios
  const handleCommentsChange = async (allowComments: boolean) => {
    setAllowComments(allowComments)
    if (user) {
      const updated = await updateMural(mural.id, { allowComments }, user.id)
      if (updated) {
        onMuralUpdated()
      }
    }
  }

  // Manejar cambio de permisos de edición
  const handleEditingChange = async (allowEditing: boolean) => {
    setAllowEditing(allowEditing)
    if (user) {
      const updated = await updateMural(mural.id, { allowEditing }, user.id)
      if (updated) {
        onMuralUpdated()
      }
    }
  }

  // Manejar cambio de protección con contraseña
  const handlePasswordProtectionChange = (isProtected: boolean) => {
    setIsPasswordProtected(isProtected)
    setShowPasswordInput(isProtected)
  }

  // Compartir con un nuevo usuario
  const handleShareWithUser = async () => {
    if (!searchEmail.trim() || !user) return

    // En un sistema real, buscaríamos al usuario por email en la base de datos
    // Aquí simulamos encontrar un usuario con ese email
    const foundUser = {
      id: `user_${Date.now()}`,
      name: searchEmail.split("@")[0],
      email: searchEmail,
      role: "user",
      createdAt: new Date(),
    }

    const success = await shareMural(mural.id, user.id, foundUser, newRole)

    if (success) {
      setSearchEmail("")
      onMuralUpdated()
      toast({
        title: "Mural compartido",
        description: `El mural ha sido compartido con ${foundUser.email}`,
      })
    } else {
      toast({
        title: "Error",
        description: "No se pudo compartir el mural",
        variant: "destructive",
      })
    }
  }

  // Eliminar permisos de un usuario
  const handleRemovePermission = async (permissionId: string) => {
    if (!user) return

    const success = await removePermission(mural.id, permissionId, user.id)

    if (success) {
      onMuralUpdated()
      toast({
        title: "Permiso eliminado",
        description: "El usuario ya no tiene acceso al mural",
      })
    } else {
      toast({
        title: "Error",
        description: "No se pudo eliminar el permiso",
        variant: "destructive",
      })
    }
  }

  // Cambiar el rol de un usuario
  const handleRoleChange = async (permissionId: string, newRole: PermissionRole) => {
    if (!user) return

    // Encontrar el permiso existente
    const permission = mural.permissions.find((p) => p.id === permissionId)
    if (!permission) return

    // Actualizar el rol
    const success = await shareMural(
      mural.id,
      user.id,
      {
        id: permission.userId,
        name: permission.userName,
        email: permission.userEmail,
        role: "user",
        createdAt: new Date(),
        avatar: permission.userAvatar,
      },
      newRole,
    )

    if (success) {
      onMuralUpdated()
      toast({
        title: "Rol actualizado",
        description: `El rol de ${permission.userName} ha sido actualizado`,
      })
    } else {
      toast({
        title: "Error",
        description: "No se pudo actualizar el rol",
        variant: "destructive",
      })
    }
  }

  // Obtener el texto descriptivo del rol
  const getRoleDescription = (role: PermissionRole): string => {
    switch (role) {
      case "owner":
        return "Propietario"
      case "editor":
        return "Editor"
      case "commenter":
        return "Comentarista"
      case "viewer":
        return "Visualizador"
      default:
        return "Desconocido"
    }
  }

  // Obtener el color del badge según el rol
  const getRoleBadgeColor = (role: PermissionRole): string => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "editor":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "commenter":
        return "bg-green-100 text-green-800 border-green-200"
      case "viewer":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-600">
            Compartir "{mural.title}"
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="people"
              className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700"
            >
              Personas
            </TabsTrigger>
            <TabsTrigger value="link" className="data-[state=active]:bg-pink-50 data-[state=active]:text-pink-700">
              Enlace
            </TabsTrigger>
          </TabsList>

          <TabsContent value="people" className="space-y-4 mt-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Añadir por correo electrónico"
                  className="pl-8 border-2 focus-visible:ring-purple-500"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                />
              </div>
              <Select value={newRole} onValueChange={(value) => setNewRole(value as PermissionRole)}>
                <SelectTrigger className="w-[130px] border-2 focus:ring-purple-500">
                  <SelectValue placeholder="Rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="commenter">Comentarista</SelectItem>
                  <SelectItem value="viewer">Visualizador</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleShareWithUser}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="border rounded-md">
              <div className="p-3 bg-muted/50 border-b flex justify-between text-sm font-medium">
                <div className="w-1/2">Usuario</div>
                <div className="w-1/3">Rol</div>
                <div className="w-1/6"></div>
              </div>
              <div className="divide-y">
                {/* Propietario */}
                <div className="p-3 flex items-center justify-between bg-purple-50/50">
                  <div className="flex items-center gap-3 w-1/2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={mural.ownerAvatar || "/placeholder.svg?height=32&width=32"}
                        alt={mural.ownerName}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                        {mural.ownerName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {mural.ownerName} {user?.id === mural.ownerId ? "(Tú)" : ""}
                      </div>
                      <div className="text-xs text-muted-foreground">Propietario</div>
                    </div>
                  </div>
                  <div className="w-1/3">
                    <Badge variant="outline" className={getRoleBadgeColor("owner")}>
                      Propietario
                    </Badge>
                  </div>
                  <div className="w-1/6"></div>
                </div>

                {/* Colaboradores */}
                {mural.permissions.map((permission) => (
                  <div key={permission.id} className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 w-1/2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={permission.userAvatar || "/placeholder.svg?height=32&width=32"}
                          alt={permission.userName}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
                          {permission.userName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {permission.userName} {user?.id === permission.userId ? "(Tú)" : ""}
                        </div>
                        <div className="text-xs text-muted-foreground">{permission.userEmail}</div>
                      </div>
                    </div>
                    <div className="w-1/3">
                      {user?.id === mural.ownerId ? (
                        <Select
                          value={permission.role}
                          onValueChange={(value) => handleRoleChange(permission.id, value as PermissionRole)}
                        >
                          <SelectTrigger className="h-8 w-full">
                            <SelectValue placeholder="Rol" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="commenter">Comentarista</SelectItem>
                            <SelectItem value="viewer">Visualizador</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="outline" className={getRoleBadgeColor(permission.role)}>
                          {getRoleDescription(permission.role)}
                        </Badge>
                      )}
                    </div>
                    <div className="w-1/6 flex justify-end">
                      {user?.id === mural.ownerId && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-red-500"
                          onClick={() => handleRemovePermission(permission.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="link" className="space-y-4 mt-4">
            <div className="flex gap-2">
              <Input value={shareUrl} readOnly className="flex-1 bg-muted/50 border-2 focus-visible:ring-pink-500" />
              <Button
                onClick={copyToClipboard}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
              >
                {copySuccess ? (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Mural público</p>
                  <p className="text-sm text-muted-foreground">
                    Permite que cualquier persona con el enlace pueda ver este mural
                  </p>
                </div>
                <Switch
                  checked={isPublic}
                  onCheckedChange={handleVisibilityChange}
                  className="data-[state=checked]:bg-purple-500"
                  disabled={user?.id !== mural.ownerId}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Permitir comentarios</p>
                  <p className="text-sm text-muted-foreground">Los visitantes pueden dejar comentarios en el mural</p>
                </div>
                <Switch
                  checked={allowComments}
                  onCheckedChange={handleCommentsChange}
                  className="data-[state=checked]:bg-purple-500"
                  disabled={user?.id !== mural.ownerId}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Permitir edición</p>
                  <p className="text-sm text-muted-foreground">Los editores pueden modificar el contenido del mural</p>
                </div>
                <Switch
                  checked={allowEditing}
                  onCheckedChange={handleEditingChange}
                  className="data-[state=checked]:bg-purple-500"
                  disabled={user?.id !== mural.ownerId}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Proteger con contraseña</p>
                  <p className="text-sm text-muted-foreground">Requerir una contraseña para acceder al mural</p>
                </div>
                <Switch
                  checked={isPasswordProtected}
                  onCheckedChange={handlePasswordProtectionChange}
                  className="data-[state=checked]:bg-purple-500"
                  disabled={user?.id !== mural.ownerId}
                />
              </div>

              {showPasswordInput && (
                <div className="space-y-2 pt-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Introduce una contraseña"
                    className="border-2 focus-visible:ring-purple-500"
                  />
                </div>
              )}
            </div>

            <div className="pt-4">
              <p className="font-medium mb-3">Compartir en redes sociales</p>
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
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
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
