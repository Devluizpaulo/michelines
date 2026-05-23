"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Car,
  Menu,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Target,
  Megaphone,
  Monitor,
  BarChart3,
  Settings,
  Users,
  LucideIcon,
} from "lucide-react"
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

interface AdminHeaderProps {
  activeTab: TabId
  setActiveTab: (tab: TabId) => void
  onLogout: () => void
}

interface MenuItem {
  id: TabId
  label: string
  icon: LucideIcon
}

const ALL_MENU_ITEMS: MenuItem[] = [
  { id: "dashboard",     label: "Dashboard",     icon: LayoutDashboard },
  { id: "leads",         label: "Leads Funil",   icon: Target },
  { id: "campanhas",     label: "Campanhas",     icon: Megaphone },
  { id: "landing",       label: "Landing Page",  icon: Monitor },
  { id: "frota",         label: "Frota",         icon: Car },
  { id: "analytics",     label: "Analytics",     icon: BarChart3 },
  { id: "usuarios",      label: "Usuários",      icon: Users },
  { id: "configuracoes", label: "Configurações", icon: Settings },
]

export function AdminHeader({ activeTab, setActiveTab, onLogout }: AdminHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { adminUser, canAccess } = useAuth()

  const visibleItems = ALL_MENU_ITEMS.filter(item => canAccess(item.id))
  const roleInfo = adminUser?.role ? ROLE_LABELS[adminUser.role] : null

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-4 md:px-6 justify-between select-none shadow-sm">

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
                  src="https://cbynwzxalzcaownnouwp.supabase.co/storage/v1/object/public/logos/logo-grupo-michelines.png"
                  alt="Grupo Michelines"
                  className="h-8 w-auto object-contain"
                />
              </SheetTitle>
              <SheetDescription className="text-slate-500 text-left text-xs">CRM Comercial Premium</SheetDescription>
            </SheetHeader>

            {/* Mobile nav — filtered by role */}
            <div className="flex flex-1 flex-col gap-1.5 py-4">
              {visibleItems.map((item) => {
                const isActive = activeTab === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id)
                      setMobileOpen(false)
                    }}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-left transition-all ${
                      isActive
                        ? "bg-sky-600 text-white shadow-md shadow-sky-100"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
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

        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://cbynwzxalzcaownnouwp.supabase.co/storage/v1/object/public/logos/logo-grupo-michelines.png"
            alt="Grupo Michelines"
            className="h-8 w-auto object-contain"
          />
        </Link>
      </div>

      {/* Right: User dropdown */}
      <div className="flex items-center gap-3">
        {roleInfo && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border hidden sm:inline-flex ${roleInfo.color}`}>
            {roleInfo.label}
          </span>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700 font-bold h-9 max-w-[180px]">
              <span className="truncate text-xs">{adminUser?.displayName || "Admin"}</span>
              <ChevronDown className="h-4 w-4 text-slate-500 shrink-0" />
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
