import {
  LayoutDashboard,
  Target,
  Megaphone,
  Monitor,
  Car,
  BarChart3,
  Settings,
  Users,
  Sliders,
  MessageSquare,
  CalendarDays,
  LucideIcon,
} from "lucide-react"
import { TabId } from "@/lib/permissions"

export interface MenuItem {
  id: TabId
  label: string
  /** Rótulo curto para a barra inferior no mobile */
  shortLabel: string
  icon: LucideIcon
}

/**
 * Fonte única do menu do painel.
 *
 * Antes o header e a sidebar mantinham listas separadas, e elas divergiram: a
 * aba Agenda existia só na sidebar, ficando inacessível no mobile (onde a
 * navegação vem do header). Qualquer aba nova entra aqui e aparece nos dois.
 */
export const ADMIN_MENU_ITEMS: MenuItem[] = [
  { id: "dashboard",     label: "Dashboard",         shortLabel: "Início",   icon: LayoutDashboard },
  { id: "leads",         label: "Leads Funil",       shortLabel: "Leads",    icon: Target },
  { id: "agenda",        label: "Agenda",            shortLabel: "Agenda",   icon: CalendarDays },
  { id: "campanhas",     label: "Campanhas",         shortLabel: "Campanhas", icon: Megaphone },
  { id: "landing",       label: "Landing Page",      shortLabel: "Landing",  icon: Monitor },
  { id: "depoimentos",   label: "Depoimentos",       shortLabel: "Avaliações", icon: MessageSquare },
  { id: "frota",         label: "Frota",             shortLabel: "Frota",    icon: Car },
  { id: "operacao",      label: "Operação & Preços", shortLabel: "Operação", icon: Sliders },
  { id: "analytics",     label: "Analytics",         shortLabel: "Métricas", icon: BarChart3 },
  { id: "usuarios",      label: "Usuários",          shortLabel: "Usuários", icon: Users },
  { id: "configuracoes", label: "Configurações",     shortLabel: "Config",   icon: Settings },
]

/** Abas priorizadas na barra inferior do mobile, na ordem de preferência. */
export const MOBILE_PRIMARY_TABS: TabId[] = ["dashboard", "leads", "agenda", "frota"]
