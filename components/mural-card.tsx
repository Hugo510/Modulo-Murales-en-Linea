"use client"

import type React from "react"

import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Users, Star, Clock, Lock, Eye, Edit, UserCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface MuralCardProps {
  mural: {
    id: string
    title: string
    description: string
    color: string
    lastUpdated: string
    collaborators: number
    isOwner?: boolean
    role?: string
    isPublic?: boolean
    isFavorite?: boolean
  }
}

export function MuralCard({ mural }: MuralCardProps) {
  // Determinar el icono de rol/acceso
  const getRoleIcon = () => {
    if (mural.isOwner) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                <UserCircle className="h-3 w-3 mr-1" />
                Propietario
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Eres el propietario de este mural</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    if (mural.role === "editor") {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                <Edit className="h-3 w-3 mr-1" />
                Editor
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Puedes editar este mural</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    if (mural.role === "commenter") {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                <MessageSquare className="h-3 w-3 mr-1" />
                Comentarista
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Puedes comentar en este mural</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
              <Eye className="h-3 w-3 mr-1" />
              Visualizador
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Puedes ver este mural</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <Link href={`/murales/${mural.id}`}>
      <motion.div whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
        <Card className="h-full transition-all hover:shadow-lg border-2 border-muted overflow-hidden">
          <CardHeader className={`${mural.color} rounded-t-lg text-white p-4 sm:p-6`}>
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-lg sm:text-xl line-clamp-2">{mural.title}</h3>
              <div className="flex gap-2">
                {mural.isPublic === false && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="bg-white/20 text-white border-none shrink-0">
                          <Lock className="h-3 w-3" />
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Mural privado</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {mural.isFavorite && (
                  <Badge variant="outline" className="bg-white/20 text-white border-none shrink-0">
                    <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex justify-between items-start mb-2">{getRoleIcon()}</div>
            <p className="text-muted-foreground text-sm line-clamp-2">{mural.description}</p>
          </CardContent>
          <CardFooter className="flex justify-between text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-blue-500" />
              <span>{mural.lastUpdated}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-purple-500" />
              <span>{mural.collaborators}</span>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </Link>
  )
}

function MessageSquare(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}
