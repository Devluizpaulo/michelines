import { supabase } from "@/lib/supabase"
import type { AdminUserRow, UserRole } from "@/types/database"
import type { AdminUser } from "@/lib/permissions"

/**
 * Perfis do painel.
 *
 * A credencial (e-mail/senha) vive em `auth.users`, gerida pelo Supabase Auth.
 * Esta tabela guarda o que é nosso: papel, status e dados de exibição. As duas
 * compartilham o mesmo `id`, e o perfil cai junto com a conta (`on delete cascade`).
 *
 * Criar e excluir contas exige a service_role, então acontece nas rotas de
 * servidor — nunca a partir do navegador.
 */

export function rowToAdminUser(row: AdminUserRow): AdminUser {
  return {
    uid: row.id,
    email: row.email,
    displayName: row.display_name,
    phone: row.phone ?? undefined,
    role: row.role,
    active: row.active,
    avatarUrl: row.avatar_url ?? undefined,
    createdBy: row.created_by ?? undefined,
    lastLogin: row.last_login ?? undefined,
    createdAt: row.created_at,
  }
}

/** Perfil do usuário autenticado. `null` quando não há perfil provisionado. */
export async function fetchMyProfile(userId: string): Promise<AdminUser | null> {
  const { data, error } = await supabase
    .from("admin_users")
    .select("*")
    .eq("id", userId)
    .maybeSingle()

  if (error) throw error
  return data ? rowToAdminUser(data as AdminUserRow) : null
}

export async function listAdminUsers(): Promise<AdminUser[]> {
  const { data, error } = await supabase
    .from("admin_users")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data ?? []).map((r) => rowToAdminUser(r as AdminUserRow))
}

/** Atualiza dados de exibição. Papel e status ativo são barrados pelo RLS. */
export async function updateAdminProfile(
  id: string,
  patch: { displayName?: string; phone?: string; avatarUrl?: string }
): Promise<void> {
  const row: Partial<AdminUserRow> = {}
  if (patch.displayName !== undefined) row.display_name = patch.displayName
  if (patch.phone !== undefined) row.phone = patch.phone
  if (patch.avatarUrl !== undefined) row.avatar_url = patch.avatarUrl

  const { error } = await supabase.from("admin_users").update(row).eq("id", id)
  if (error) throw error
}

/** Troca o papel de alguém. O RLS só deixa passar se quem chama for super_admin. */
export async function setAdminRole(id: string, role: UserRole): Promise<void> {
  const { error } = await supabase.from("admin_users").update({ role }).eq("id", id)
  if (error) throw error
}

/** Ativa ou desativa o acesso ao painel sem excluir a conta. */
export async function setAdminActive(id: string, active: boolean): Promise<void> {
  const { error } = await supabase.from("admin_users").update({ active }).eq("id", id)
  if (error) throw error
}

/** Carimba o último login. Falha em silêncio: não pode impedir a entrada. */
export async function touchLastLogin(id: string): Promise<void> {
  try {
    await supabase.from("admin_users").update({ last_login: new Date().toISOString() }).eq("id", id)
  } catch (e) {
    console.warn("[admin-users] Não foi possível registrar o último login:", e)
  }
}
