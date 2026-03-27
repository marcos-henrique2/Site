import { useState, useEffect } from "react"

let memoryState = []
let listeners = []

function notifyListeners() {
  listeners.forEach((listener) => listener(memoryState))
}

export function toast({ title, description, variant, action, ...props }) {
  const id = Math.random().toString(36).substring(2, 9)
  
  const newToast = {
    id,
    title,
    description,
    variant,
    action,
    ...props,
  }

  // Adiciona a nova notificação na tela
  memoryState = [...memoryState, newToast]
  notifyListeners()

  // MÁGICA: O relógio que obriga a fechar sozinha após 3 segundos!
  setTimeout(() => {
    dismiss(id)
  }, 3000)

  return {
    id,
    dismiss: () => dismiss(id),
    update: (props) => {
      memoryState = memoryState.map((t) => (t.id === id ? { ...t, ...props } : t))
      notifyListeners()
    },
  }
}

export function dismiss(toastId) {
  if (toastId) {
    // Remove apenas a que foi clicada/venceu o tempo
    memoryState = memoryState.filter((t) => t.id !== toastId)
  } else {
    // Remove todas
    memoryState = []
  }
  notifyListeners()
}

export function useToast() {
  const [toasts, setToasts] = useState(memoryState)

  useEffect(() => {
    listeners.push(setToasts)
    return () => {
      listeners = listeners.filter((l) => l !== setToasts)
    }
  }, [])

  return {
    toast,
    dismiss,
    toasts,
  }
}