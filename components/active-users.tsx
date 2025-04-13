"use client"

import { useRealtime } from "@/contexts/realtime-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from "@/contexts/auth-context"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

export function ActiveUsers() {
  const { activeUsers } = useRealtime()
  const { user } = useAuth()

  if (activeUsers.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          {activeUsers.length} {activeUsers.length === 1 ? "usuario activo" : "usuarios activos"}
        </Badge>
      </div>

      <div className="flex -space-x-2 overflow-hidden">
        <TooltipProvider>
          {activeUsers.map((activeUser) => (
            <Tooltip key={activeUser.id}>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Avatar
                    className={`h-8 w-8 border-2 ${activeUser.id === user?.id ? "border-green-500" : "border-white"}`}
                  >
                    <AvatarImage src={activeUser.avatar} alt={activeUser.name} />
                    <AvatarFallback className="bg-blue-100 text-blue-700">
                      {activeUser.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 ring-1 ring-white"></span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <div className="text-sm font-medium">
                  {activeUser.name} {activeUser.id === user?.id && "(Tú)"}
                </div>
                <div className="text-xs text-muted-foreground">
                  Activo {formatDistanceToNow(activeUser.lastActive, { addSuffix: true, locale: es })}
                </div>
                {activeUser.focusedItemId && <div className="text-xs text-blue-600">Editando un elemento</div>}
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
    </div>
  )
}
