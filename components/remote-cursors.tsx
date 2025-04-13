"use client"

import { useRealtime } from "@/contexts/realtime-context"
import { useAuth } from "@/contexts/auth-context"
import { useEffect, useState } from "react"

export function RemoteCursors() {
  const { activeUsers } = useRealtime()
  const { user } = useAuth()
  const [cursors, setCursors] = useState<JSX.Element[]>([])

  useEffect(() => {
    // Filtrar usuarios que no son el usuario actual y tienen posición de cursor
    const remoteCursors = activeUsers
      .filter((activeUser) => activeUser.id !== user?.id && activeUser.cursorPosition)
      .map((activeUser) => {
        if (!activeUser.cursorPosition) return null

        return (
          <div
            key={activeUser.id}
            className="absolute pointer-events-none z-50"
            style={{
              left: `${activeUser.cursorPosition.x}px`,
              top: `${activeUser.cursorPosition.y}px`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="relative">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-blue-500"
              >
                <path
                  d="M5.64124 16.9999L5.11377 16.4724L12.5854 1.40997C12.7266 1.1477 13.0623 1.04856 13.3246 1.18975C13.5869 1.33094 13.686 1.66667 13.5448 1.92894L6.07319 16.9914C5.97915 17.1778 5.79874 17.2997 5.59253 17.3046C5.38632 17.3094 5.20089 17.1963 5.09853 17.0135L5.64124 16.9999ZM5.64124 16.9999L13.5486 17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <div
                className="absolute -top-8 left-2 px-2 py-1 rounded-md text-xs font-medium text-white"
                style={{ backgroundColor: "#3b82f6" }}
              >
                {activeUser.name}
              </div>
            </div>
          </div>
        )
      })
      .filter(Boolean) as JSX.Element[]

    setCursors(remoteCursors)
  }, [activeUsers, user])

  return <>{cursors}</>
}
