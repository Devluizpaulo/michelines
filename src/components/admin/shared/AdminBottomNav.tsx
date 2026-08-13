"use client"

import { MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { TabId } from "@/lib/permissions"
import { ADMIN_MENU_ITEMS, MOBILE_PRIMARY_TABS } from "./menu-items"

interface AdminBottomNavProps {
  activeTab: TabId
  setActiveTab: (tab: TabId) => void
  onOpenMenu: () => void
}

/**
 * Barra de navegação inferior — só no mobile.
 *
 * No celular a sidebar fica oculta e o único caminho entre as abas era abrir o
 * menu-sanduíche do header, o que custa dois toques a cada troca. Esta barra
 * põe as abas mais usadas ao alcance do polegar; o botão "Mais" abre a lista
 * completa no mesmo Sheet do header.
 */
export function AdminBottomNav({ activeTab, setActiveTab, onOpenMenu }: AdminBottomNavProps) {
  const { canAccess } = useAuth()

  // Abas prioritárias que o papel do usuário realmente acessa, completadas com
  // as demais permitidas até no máximo 4 — a quinta posição é o botão "Mais".
  const accessible = ADMIN_MENU_ITEMS.filter((item) => canAccess(item.id))
  const primary = MOBILE_PRIMARY_TABS.map((id) => accessible.find((i) => i.id === id)).filter(
    (item): item is (typeof accessible)[number] => Boolean(item)
  )
  const items = [
    ...primary,
    ...accessible.filter((i) => !primary.some((p) => p.id === i.id)),
  ].slice(0, 4)

  const hasOverflow = accessible.length > items.length

  if (items.length === 0) return null

  return (
    <nav
      aria-label="Navegação principal"
      className="
        fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur
        pb-[env(safe-area-inset-bottom)] shadow-[0_-1px_8px_rgba(15,23,42,0.06)]
        md:hidden
      "
    >
      <div className="flex items-stretch">
        {items.map((item) => {
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                // min-h-14: alvo de toque confortável mesmo com o rótulo pequeno
                "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 transition-colors",
                isActive ? "text-sky-600" : "text-slate-400 active:bg-slate-50"
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", isActive && "stroke-[2.5]")} />
              <span className="max-w-full truncate text-[10px] font-bold leading-none">
                {item.shortLabel}
              </span>
            </button>
          )
        })}

        {hasOverflow && (
          <button
            onClick={onOpenMenu}
            className="flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 text-slate-400 transition-colors active:bg-slate-50"
          >
            <MoreHorizontal className="h-5 w-5 shrink-0" />
            <span className="text-[10px] font-bold leading-none">Mais</span>
          </button>
        )}
      </div>
    </nav>
  )
}
