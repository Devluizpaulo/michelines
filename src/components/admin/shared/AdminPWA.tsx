"use client"

import { useEffect, useState } from "react"
import { RefreshCw } from "lucide-react"

/**
 * Registro do service worker do painel — e SOMENTE do painel.
 *
 * O site institucional não é um PWA: o `next-pwa` roda com `register: false`
 * e o SW é registrado aqui, com `scope: "/admin/"`. Como o escopo pedido é mais
 * restrito que o diretório do script (`/sw.js` → `/`), o navegador aceita sem
 * precisar do cabeçalho `Service-Worker-Allowed`, e nada fora de /admin é
 * interceptado ou cacheado.
 */
export function AdminPWA() {
  const [updateReady, setUpdateReady] = useState(false)
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    if (!("serviceWorker" in navigator)) return
    // Em dev o next-pwa não emite sw.js — registrar daria 404 no console.
    if (process.env.NODE_ENV !== "production") return

    let registration: ServiceWorkerRegistration | undefined

    navigator.serviceWorker
      .register("/sw.js", { scope: "/admin/" })
      .then((reg) => {
        registration = reg

        // Já existe uma versão nova esperando (aba antiga ainda aberta)
        if (reg.waiting) {
          setWaitingWorker(reg.waiting)
          setUpdateReady(true)
        }

        reg.addEventListener("updatefound", () => {
          const installing = reg.installing
          if (!installing) return
          installing.addEventListener("statechange", () => {
            // `controller` presente significa atualização, não primeira instalação
            if (installing.state === "installed" && navigator.serviceWorker.controller) {
              setWaitingWorker(installing)
              setUpdateReady(true)
            }
          })
        })
      })
      .catch((err) => {
        console.warn("[AdminPWA] Falha ao registrar o service worker:", err)
      })

    // Recarrega uma única vez quando o novo SW assume o controle
    let refreshing = false
    const onControllerChange = () => {
      if (refreshing) return
      refreshing = true
      window.location.reload()
    }
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange)

    // Procura atualizações ao voltar para a aba — a intranet fica aberta o dia todo
    const onVisible = () => {
      if (document.visibilityState === "visible") registration?.update().catch(() => {})
    }
    document.addEventListener("visibilitychange", onVisible)

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [])

  if (!updateReady) return null

  return (
    <div className="fixed inset-x-3 bottom-3 z-[9998] sm:inset-x-auto sm:left-6 sm:bottom-6 sm:max-w-sm">
      <div className="flex items-center gap-3 rounded-xl border border-sky-200 bg-white px-4 py-3 shadow-lg">
        <RefreshCw className="h-4 w-4 shrink-0 text-sky-600" />
        <p className="flex-1 text-xs font-bold leading-snug text-slate-700">
          Nova versão do painel disponível.
        </p>
        <button
          onClick={() => {
            // SKIP_WAITING ativa o novo SW; o controllerchange acima recarrega a página.
            waitingWorker?.postMessage({ type: "SKIP_WAITING" })
            setUpdateReady(false)
          }}
          className="shrink-0 rounded-lg bg-sky-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-sky-700"
        >
          Atualizar
        </button>
      </div>
    </div>
  )
}
