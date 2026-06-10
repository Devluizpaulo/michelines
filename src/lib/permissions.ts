/**
 * Sistema de Roles e Permissões — Grupo Michelines CRM
 * 
 * Roles disponíveis:
 *   super_admin  — Acesso total (criar usuários, configurar tudo)
 *   gerente      — Acesso a leads, frota, analytics, campanhas
 *   vendedor     — Apenas leads (sem analytics, sem frota, sem config)
 *   marketing    — Apenas campanhas e landing page
 */

export type UserRole = "super_admin" | "gerente" | "vendedor" | "marketing"
export type TabId = "dashboard" | "leads" | "campanhas" | "landing" | "frota" | "analytics" | "configuracoes" | "usuarios" | "operacao" | "depoimentos"

export interface AdminUser {
  uid: string
  email: string
  displayName: string
  phone?: string
  role: UserRole
  active: boolean
  createdAt: string
  lastLogin?: string
  createdBy?: string
  avatarUrl?: string
}

/**
 * Define quais abas cada role pode acessar
 */
export const ROLE_PERMISSIONS: Record<UserRole, TabId[]> = {
  super_admin: ["dashboard", "leads", "campanhas", "landing", "frota", "analytics", "configuracoes", "usuarios", "operacao", "depoimentos"],
  gerente:     ["dashboard", "leads", "campanhas", "landing", "frota", "analytics", "operacao", "depoimentos"],
  vendedor:    ["dashboard", "leads"],
  marketing:   ["dashboard", "campanhas", "landing", "depoimentos"],
}

/**
 * Labels de exibição para cada role
 */
export const ROLE_LABELS: Record<UserRole, { label: string; description: string; color: string }> = {
  super_admin: {
    label: "Super Admin",
    description: "Acesso total ao sistema, usuários e configurações",
    color: "bg-red-50 text-red-700 border-red-200",
  },
  gerente: {
    label: "Gerente",
    description: "Acesso a leads, frota, analytics e campanhas",
    color: "bg-sky-50 text-sky-700 border-sky-200",
  },
  vendedor: {
    label: "Vendedor",
    description: "Somente gestão de leads e pipeline",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  marketing: {
    label: "Marketing",
    description: "Campanhas, hero slides e landing page",
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
}

/**
 * Verifica se um role tem acesso a uma aba específica
 */
export function canAccess(role: UserRole, tab: TabId): boolean {
  return ROLE_PERMISSIONS[role]?.includes(tab) ?? false
}

/**
 * Verifica se o usuário é super_admin
 */
export function isSuperAdmin(role: UserRole): boolean {
  return role === "super_admin"
}
