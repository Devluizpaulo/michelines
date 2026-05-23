"use client"

import { 
  LayoutDashboard, 
  Target, 
  Megaphone, 
  Monitor, 
  Car, 
  BarChart3, 
  Settings, 
  LogOut,
  Users,
  LucideIcon
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { TabId } from "@/lib/permissions"

interface AdminSidebarProps {
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
  { id: "dashboard",     label: "Dashboard",       icon: LayoutDashboard },
  { id: "leads",         label: "Leads Funil",     icon: Target },
  { id: "campanhas",     label: "Campanhas",        icon: Megaphone },
  { id: "landing",       label: "Landing Page",     icon: Monitor },
  { id: "frota",         label: "Frota",            icon: Car },
  { id: "analytics",     label: "Analytics",        icon: BarChart3 },
  { id: "usuarios",      label: "Usuários",         icon: Users },
  { id: "configuracoes", label: "Configurações",    icon: Settings },
]

export function AdminSidebar({ activeTab, setActiveTab, onLogout }: AdminSidebarProps) {
  const { canAccess, adminUser } = useAuth()

  // Filter menu to only accessible tabs
  const visibleItems = ALL_MENU_ITEMS.filter(item => canAccess(item.id))

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white md:block min-h-[calc(100vh-64px)] shadow-sm">
      <div className="flex h-full flex-col justify-between p-4">
        <div className="flex flex-col gap-1">
          {visibleItems.map((item) => {
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all text-left",
                  isActive
                    ? "bg-sky-600 text-white shadow-md shadow-sky-100"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </button>
            )
          })}
        </div>

        {/* User info + logout */}
        <div className="space-y-3 border-t border-slate-100 pt-4">
          {adminUser && (
            <div className="px-4 py-2 bg-slate-50 rounded-xl">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Conectado como</p>
              <p className="text-xs font-bold text-slate-800 truncate mt-0.5">{adminUser.displayName}</p>
              <span className="text-[9px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded mt-1 inline-block">
                {adminUser.role.replace("_", " ").toUpperCase()}
              </span>
            </div>
          )}
          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-red-600 hover:text-red-700 hover:bg-red-50/50 transition-colors text-left w-full"
          >
            <LogOut className="h-4 w-4" />
            Sair da Conta
          </button>
        </div>
      </div>
    </aside>
  )
}
