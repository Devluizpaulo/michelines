"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, ChevronDown, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/contexts/AuthContext"
import { TabId, ROLE_LABELS } from "@/lib/permissions"
import { ADMIN_MENU_ITEMS } from "./menu-items"
import { LOGO_IMAGES } from "@/lib/supabase"

interface AdminHeaderProps {
  activeTab: TabId
  setActiveTab: (tab: TabId) => void
  onLogout: () => void
  /** Controle externo do menu lateral — a barra inferior do mobile também o abre. */
  menuOpen?: boolean
  onMenuOpenChange?: (open: boolean) => void
}

export function AdminHeader({
  activeTab,
  setActiveTab,
  onLogout,
  menuOpen,
  onMenuOpenChange,
}: AdminHeaderProps) {
  // Estado interno usado apenas quando o componente não é controlado de fora
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = menuOpen !== undefined
  const mobileOpen = isControlled ? menuOpen : internalOpen
  const setMobileOpen = isControlled ? (onMenuOpenChange ?? (() => {})) : setInternalOpen

  const { adminUser, canAccess } = useAuth()

  const visibleItems = ADMIN_MENU_ITEMS.filter(item => canAccess(item.id))
  const roleInfo = adminUser?.role ? ROLE_LABELS[adminUser.role] : null
  const activeItem = ADMIN_MENU_ITEMS.find(item => item.id === activeTab)

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-3 pt-[env(safe-area-inset-top)] sm:px-4 md:px-6 justify-between select-none shadow-sm">

      {/* Left: Mobile trigger + Brand */}
      <div className="flex items-center gap-4">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 md:hidden bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col bg-white border-r border-slate-200 text-slate-900 w-64 shadow-2xl">
            <SheetHeader className="border-b border-slate-200 pb-4">
              <SheetTitle className="text-slate-900 font-black text-left">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={LOGO_IMAGES.primary}
                  alt="Grupo Michelines"
                  className="h-8 w-auto object-contain"
                />
              </SheetTitle>
              <SheetDescription className="text-slate-500 text-left text-xs">CRM Comercial Premium</SheetDescription>
            </SheetHeader>

            {/* Mobile nav — filtered by role */}
            <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto py-4">
              {visibleItems.map((item) => {
                const isActive = activeTab === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id)
                      setMobileOpen(false)
                    }}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex min-h-11 items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-bold transition-all ${
                      isActive
                        ? "bg-sky-600 text-white shadow-md shadow-sky-100"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </button>
                )
              })}
            </div>

            {/* Mobile logout */}
            <div className="border-t border-slate-200 pt-4">
              <Button
                variant="outline"
                onClick={onLogout}
                className="w-full justify-start gap-2 border-slate-200 bg-slate-50 text-red-600 hover:text-red-700 font-bold"
              >
                <LogOut className="h-5 w-5" /> Sair da Conta
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Brand Logo — some no mobile para dar espaço ao nome da aba atual */}
        <Link href="/" className="hidden items-center gap-2.5 sm:flex">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LOGO_IMAGES.primary}
            alt="Grupo Michelines"
            className="h-8 w-auto object-contain"
          />
        </Link>

        {/* No mobile a sidebar não existe: sem isto não há indicação de onde se está */}
        {activeItem && (
          <div className="flex min-w-0 items-center gap-2 sm:hidden">
            <activeItem.icon className="h-4 w-4 shrink-0 text-sky-600" />
            <span className="truncate text-sm font-black text-slate-900">{activeItem.label}</span>
          </div>
        )}
      </div>

      {/* Right: User dropdown */}
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        {roleInfo && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border hidden md:inline-flex ${roleInfo.color}`}>
            {roleInfo.label}
          </span>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              aria-label="Menu da conta"
              className="flex h-10 max-w-[140px] items-center gap-2 border-slate-200 bg-slate-50 px-2.5 font-bold text-slate-700 hover:bg-slate-100 sm:max-w-[180px] sm:px-3"
            >
              {/* No mobile mostra só a inicial: o nome completo espremeria a barra */}
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-600 text-[11px] font-black text-white sm:hidden">
                {(adminUser?.displayName || "A").charAt(0).toUpperCase()}
              </span>
              <span className="hidden truncate text-xs sm:inline">{adminUser?.displayName || "Admin"}</span>
              <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white border border-slate-200 text-slate-700 shadow-lg w-48">
            <DropdownMenuLabel className="text-slate-900 text-xs">
              <p className="font-bold truncate">{adminUser?.email}</p>
              <p className="text-slate-400 font-normal mt-0.5">{roleInfo?.label}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem
              onClick={onLogout}
              className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" /> Sair da conta
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

    </header>
  )
}
