"use client"

import { useState, useEffect, useCallback, createContext, useContext } from "react"
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from "lucide-react"

type ToastType = "success" | "error" | "warning" | "info"

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  toast: (opts: Omit<Toast, "id">) => void
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  warning: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback((opts: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2)
    const duration = opts.duration ?? 4000
    setToasts((prev) => [...prev, { ...opts, id }])
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration)
    }
  }, [dismiss])

  const success = useCallback((title: string, message?: string) =>
    addToast({ type: "success", title, message }), [addToast])
  const error = useCallback((title: string, message?: string) =>
    addToast({ type: "error", title, message, duration: 6000 }), [addToast])
  const warning = useCallback((title: string, message?: string) =>
    addToast({ type: "warning", title, message }), [addToast])
  const info = useCallback((title: string, message?: string) =>
    addToast({ type: "info", title, message }), [addToast])

  return (
    <ToastContext.Provider value={{ toasts, toast: addToast, success, error, warning, info, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>")
  return ctx
}

// ─── Configuração visual por tipo ─────────────────────────────────────────────
const TOAST_STYLES: Record<ToastType, {
  bg: string
  border: string
  icon: React.ReactNode
  titleColor: string
}> = {
  success: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />,
    titleColor: "text-emerald-900",
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    icon: <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />,
    titleColor: "text-red-900",
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />,
    titleColor: "text-amber-900",
  },
  info: {
    bg: "bg-sky-50",
    border: "border-sky-200",
    icon: <Info className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />,
    titleColor: "text-sky-900",
  },
}

// ─── Container de toasts (canto inferior direito) ─────────────────────────────
function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null

  return (
    <div
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      role="status"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    const raf = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  const style = TOAST_STYLES[toast.type]

  return (
    <div
      className={`
        pointer-events-auto
        min-w-[300px] max-w-[380px]
        flex items-start gap-3
        border rounded-xl shadow-lg px-4 py-3
        transition-all duration-300
        ${style.bg} ${style.border}
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      `}
      role="alert"
    >
      {style.icon}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold leading-snug ${style.titleColor}`}>
          {toast.title}
        </p>
        {toast.message && (
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
            {toast.message}
          </p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-slate-600 transition-colors shrink-0"
        aria-label="Fechar notificação"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
