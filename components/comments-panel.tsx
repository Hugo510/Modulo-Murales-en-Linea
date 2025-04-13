"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, ThumbsUp, MessageSquare, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface CommentsPanelProps {
  muralId: string
}

export function CommentsPanel({ muralId }: CommentsPanelProps) {
  const [newComment, setNewComment] = useState("")
  const [comments, setComments] = useState([
    {
      id: 1,
      user: {
        name: "María García",
        avatar: "/placeholder.svg?height=40&width=40",
        initials: "MG",
      },
      content: "¡Me encanta cómo está quedando este mural! La sección sobre energía solar es muy informativa.",
      timestamp: "Hace 2 horas",
      likes: 3,
      replies: [
        {
          id: 11,
          user: {
            name: "Carlos López",
            avatar: "/placeholder.svg?height=40&width=40",
            initials: "CL",
          },
          content: "Estoy de acuerdo. Podríamos añadir más información sobre paneles solares.",
          timestamp: "Hace 1 hora",
          likes: 1,
        },
      ],
    },
    {
      id: 2,
      user: {
        name: "Ana Martínez",
        avatar: "/placeholder.svg?height=40&width=40",
        initials: "AM",
      },
      content: "¿Podemos incluir una sección sobre energía eólica también?",
      timestamp: "Hace 3 horas",
      likes: 2,
      replies: [],
    },
  ])

  const handleAddComment = () => {
    if (newComment.trim() === "") return

    const comment = {
      id: Date.now(),
      user: {
        name: "Usuario",
        avatar: "/placeholder.svg?height=40&width=40",
        initials: "US",
      },
      content: newComment,
      timestamp: "Ahora",
      likes: 0,
      replies: [],
    }

    setComments([comment, ...comments])
    setNewComment("")
  }

  const handleLike = (commentId: number) => {
    setComments(
      comments.map((comment) =>
        comment.id === commentId
          ? { ...comment, likes: comment.likes + 1 }
          : {
              ...comment,
              replies: comment.replies.map((reply) =>
                reply.id === commentId ? { ...reply, likes: reply.likes + 1 } : reply,
              ),
            },
      ),
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-gradient-to-r from-pink-50 to-purple-50">
        <h3 className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">
          Comentarios
        </h3>
      </div>

      <div className="p-4 border-b">
        <div className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="@usuario" />
            <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white">US</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="Añadir un comentario..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px] border-2 focus-visible:ring-pink-500"
            />
            <div className="flex justify-end mt-2">
              <Button
                onClick={handleAddComment}
                disabled={newComment.trim() === ""}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              >
                <Send className="h-4 w-4 mr-2" />
                Comentar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="divide-y">
          {comments.map((comment) => (
            <div key={comment.id} className="p-4">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
                  <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white">
                    {comment.user.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{comment.user.name}</div>
                    <div className="text-xs text-muted-foreground">{comment.timestamp}</div>
                  </div>
                  <div className="mt-1 text-sm">{comment.content}</div>
                  <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                    <button
                      className="flex items-center gap-1 hover:text-pink-500"
                      onClick={() => handleLike(comment.id)}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                      <span>{comment.likes}</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-purple-500">
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Responder</span>
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="hover:text-blue-500">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Eliminar</DropdownMenuItem>
                        <DropdownMenuItem>Reportar</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Respuestas */}
                  {comment.replies.length > 0 && (
                    <div className="mt-3 pl-4 border-l-2 border-muted space-y-3">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={reply.user.avatar} alt={reply.user.name} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white text-xs">
                              {reply.user.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="font-medium text-xs">{reply.user.name}</div>
                              <div className="text-xs text-muted-foreground">{reply.timestamp}</div>
                            </div>
                            <div className="mt-1 text-xs">{reply.content}</div>
                            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                              <button
                                className="flex items-center gap-1 hover:text-pink-500"
                                onClick={() => handleLike(reply.id)}
                              >
                                <ThumbsUp className="h-3 w-3" />
                                <span>{reply.likes}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
