"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, AlertCircle, Info, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

type FeedbackType = "success" | "error" | "info" | "loading"

interface FeedbackMessage {
  id: string
  type: FeedbackType
  message: string
  duration?: number
}

interface FeedbackContextType {
  showFeedback: (type: FeedbackType, message: string, duration?: number) => void
  clearFeedback: (id: string) => void
  clearAllFeedback: () => void
  isLoading: boolean
  setIsLoading: (loading: boolean, message?: string) => void
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined)

export function useFeedback() {
  const context = useContext(FeedbackContext)
  if (!context) {
    throw new Error("useFeedback must be used within a FeedbackProvider")
  }
  return context
}

interface FeedbackProviderProps {
  children: ReactNode
}

export function FeedbackProvider({ children }: FeedbackProviderProps) {
  const [messages, setMessages] = useState<FeedbackMessage[]>([])
  const [isLoading, setIsLoadingState] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState<string | undefined>(undefined)

  const showFeedback = (type: FeedbackType, message: string, duration = 5000) => {
    const id = Date.now().toString()
    const newMessage = { id, type, message, duration }
    setMessages((prev) => [...prev, newMessage])

    // Auto-remove after duration (except for loading)
    if (type !== "loading" && duration > 0) {
      setTimeout(() => {
        clearFeedback(id)
      }, duration)
    }

    return id
  }

  const clearFeedback = (id: string) => {
    setMessages((prev) => prev.filter((message) => message.id !== id))
  }

  const clearAllFeedback = () => {
    setMessages([])
  }

  const setIsLoading = (loading: boolean, message?: string) => {
    setIsLoadingState(loading)
    setLoadingMessage(message)

    // Clear any existing loading messages
    if (!loading) {
      setMessages((prev) => prev.filter((message) => message.type !== "loading"))
    } else if (message) {
      // Add new loading message
      showFeedback("loading", message, 0)
    }
  }

  // Listen for page navigation to clear feedback
  useEffect(() => {
    const handleRouteChange = () => {
      // Keep loading messages if we're still loading
      if (isLoading) {
        setMessages((prev) => prev.filter((message) => message.type === "loading"))
      } else {
        clearAllFeedback()
      }
    }

    window.addEventListener("popstate", handleRouteChange)
    return () => {
      window.removeEventListener("popstate", handleRouteChange)
    }
  }, [isLoading])

  return (
    <FeedbackContext.Provider value={{ showFeedback, clearFeedback, clearAllFeedback, isLoading, setIsLoading }}>
      {children}

      {/* Global loading overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4"
            >
              <div className="flex flex-col items-center text-center">
                <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                <h3 className="text-lg font-medium">Cargando</h3>
                {loadingMessage && <p className="text-muted-foreground mt-2">{loadingMessage}</p>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast messages */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`rounded-lg shadow-lg p-4 flex items-start gap-3 ${
                message.type === "success"
                  ? "bg-green-50 border border-green-200"
                  : message.type === "error"
                    ? "bg-red-50 border border-red-200"
                    : message.type === "loading"
                      ? "bg-blue-50 border border-blue-200"
                      : "bg-gray-50 border border-gray-200"
              }`}
            >
              <div className="flex-shrink-0">
                {message.type === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
                {message.type === "error" && <AlertCircle className="h-5 w-5 text-red-500" />}
                {message.type === "info" && <Info className="h-5 w-5 text-blue-500" />}
                {message.type === "loading" && <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />}
              </div>
              <div className="flex-1 pt-0.5">
                <p
                  className={`text-sm ${
                    message.type === "success"
                      ? "text-green-800"
                      : message.type === "error"
                        ? "text-red-800"
                        : message.type === "loading"
                          ? "text-blue-800"
                          : "text-gray-800"
                  }`}
                >
                  {message.message}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full"
                onClick={() => clearFeedback(message.id)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Cerrar</span>
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </FeedbackContext.Provider>
  )
}
