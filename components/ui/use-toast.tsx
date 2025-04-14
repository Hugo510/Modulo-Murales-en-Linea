// Adaptado de shadcn/ui (https://ui.shadcn.com/docs/components/toast)
import { useEffect, useState } from "react"

import type { ToastActionElement, ToastProps } from "./toast"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
    id: string
    title?: React.ReactNode
    description?: React.ReactNode
    action?: ToastActionElement
    duration?: number
}

const actionTypes = {
    ADD_TOAST: "ADD_TOAST",
    UPDATE_TOAST: "UPDATE_TOAST",
    DISMISS_TOAST: "DISMISS_TOAST",
    REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
    count = (count + 1) % Number.MAX_VALUE
    return count.toString()
}

type ActionType = typeof actionTypes

type Action =
    | {
        type: ActionType["ADD_TOAST"]
        toast: ToasterToast
    }
    | {
        type: ActionType["UPDATE_TOAST"]
        toast: Partial<ToasterToast>
    }
    | {
        type: ActionType["DISMISS_TOAST"]
        toastId?: string
    }
    | {
        type: ActionType["REMOVE_TOAST"]
        toastId?: string
    }

interface State {
    toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case actionTypes.ADD_TOAST:
            return {
                ...state,
                toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
            }

        case actionTypes.UPDATE_TOAST:
            return {
                ...state,
                toasts: state.toasts.map((t) =>
                    t.id === action.toast.id ? { ...t, ...action.toast } : t
                ),
            }

        case actionTypes.DISMISS_TOAST: {
            const { toastId } = action

            // dismiss all toasts if no id provided
            if (toastId === undefined) {
                return {
                    ...state,
                    toasts: state.toasts.map((t) => ({
                        ...t,
                        open: false,
                    })),
                }
            }

            // dismiss specific toast by id
            return {
                ...state,
                toasts: state.toasts.map((t) =>
                    t.id === toastId ? { ...t, open: false } : t
                ),
            }
        }

        case actionTypes.REMOVE_TOAST: {
            const { toastId } = action

            // remove all toasts if no id provided
            if (toastId === undefined) {
                return {
                    ...state,
                    toasts: [],
                }
            }

            // remove specific toast by id
            return {
                ...state,
                toasts: state.toasts.filter((t) => t.id !== toastId),
            }
        }

        default:
            return state
    }
}

export function useToast() {
    const [state, setState] = useState<State>({ toasts: [] })

    const toast = (props: Omit<ToasterToast, "id">) => {
        const id = genId()
        const newToast = { id, open: true, ...props }

        setState((prevState) => reducer(prevState, { type: actionTypes.ADD_TOAST, toast: newToast }))

        return id
    }

    const update = (id: string, props: Partial<ToasterToast>) => {
        setState((prevState) => reducer(prevState, {
            type: actionTypes.UPDATE_TOAST,
            toast: { id, ...props },
        }))
    }

    const dismiss = (id?: string) => {
        setState((prevState) => reducer(prevState, { type: actionTypes.DISMISS_TOAST, toastId: id }))
    }

    useEffect(() => {
        const timeouts = state.toasts.map((t) => {
            const { id, duration = 5000 } = t

            if (duration !== Infinity && !toastTimeouts.has(id)) {
                // Set timeout to dismiss toast
                const timeout = setTimeout(() => {
                    dismiss(id)
                    // Set timeout to remove toast after animation
                    toastTimeouts.set(
                        id,
                        setTimeout(() => {
                            setState((prevState) => reducer(prevState, {
                                type: actionTypes.REMOVE_TOAST,
                                toastId: id,
                            }))
                            toastTimeouts.delete(id)
                        }, TOAST_REMOVE_DELAY)
                    )
                }, duration)

                toastTimeouts.set(id, timeout)
            }

            return id
        })

        return () => {
            timeouts.forEach((id) => {
                const timeout = toastTimeouts.get(id)
                if (timeout) {
                    clearTimeout(timeout)
                    toastTimeouts.delete(id)
                }
            })
        }
    }, [state.toasts, dismiss])

    return {
        toast,
        update,
        dismiss,
        toasts: state.toasts,
    }
}

export type { ToasterToast }
