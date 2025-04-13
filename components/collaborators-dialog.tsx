"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, X } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface CollaboratorsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Collaborator {
  id: number
  name: string
  email: string
  role: string
  avatar: string
}

export function CollaboratorsDialog({ open, onOpenChange }: CollaboratorsDialogProps) {
  const { user } = useAuth()

  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    {
      id: 1,
      name: "María García",
      email: "maria@ejemplo.com",
      role: "editor",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      name: "Carlos López",
      email: "carlos@ejemplo.com",
      role: "viewer",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      name: "Ana Martínez",
      email: "ana@ejemplo.com",
      role: "editor",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ])

  const [newEmail, setNewEmail] = useState("")
  const [newRole, setNewRole] = useState("viewer")

  const handleAddCollaborator = () => {
    if (newEmail.trim() === "") return

    const newCollaborator = {
      id: Date.now(),
      name: newEmail.split("@")[0],
      email: newEmail,
      role: newRole,
      avatar: "/placeholder.svg?height=40&width=40",
    }

    setCollaborators([...collaborators, newCollaborator])
    setNewEmail("")
  }

  const handleRemoveCollaborator = (id: number) => {
    setCollaborators(collaborators.filter((c) => c.id !== id))
  }

  const handleRoleChange = (id: number, role: string) => {
    setCollaborators(collaborators.map((c) => (c.id === id ? { ...c, role } : c)))
  }

  // Añadir al usuario actual como propietario si no está en la lista
  const currentUserInList = collaborators.some((c) => c.email === user?.email)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-600">
            Colaboradores
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Añadir por correo electrónico"
                className="pl-8 border-2 focus-visible:ring-blue-500"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger className="w-[110px] border-2 focus:ring-blue-500">
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Propietario</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="viewer">Visualizador</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleAddCollaborator}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
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
              {/* Mostrar al usuario actual como propietario si no está en la lista */}
              {!currentUserInList && user && (
                <div className="p-3 flex items-center justify-between bg-blue-50">
                  <div className="flex items-center gap-3 w-1/2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar || "/placeholder.svg?height=32&width=32"} alt={user.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
                        {user.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.name} (Tú)</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                  <div className="w-1/3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Propietario
                    </span>
                  </div>
                  <div className="w-1/6"></div>
                </div>
              )}

              {collaborators.map((collaborator) => (
                <div key={collaborator.id} className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 w-1/2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={collaborator.avatar} alt={collaborator.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
                        {collaborator.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{collaborator.name}</div>
                      <div className="text-xs text-muted-foreground">{collaborator.email}</div>
                    </div>
                  </div>
                  <div className="w-1/3">
                    <Select
                      value={collaborator.role}
                      onValueChange={(value) => handleRoleChange(collaborator.id, value)}
                    >
                      <SelectTrigger className="h-8 w-full">
                        <SelectValue placeholder="Rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owner">Propietario</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="viewer">Visualizador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-1/6 flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-red-500"
                      onClick={() => handleRemoveCollaborator(collaborator.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
