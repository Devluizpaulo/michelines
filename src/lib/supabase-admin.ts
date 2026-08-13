import { createClient, SupabaseClient } from "@supabase/supabase-js"
import type { Database, UserRole, AdminUserRow } from "@/types/database"

/**
 * Acesso privilegiado do lado servidor — substitui o firebase-admin.
 *
 * A service_role IGNORA o RLS por definição do Postgres. Por isso ela só pode
 * existir no servidor e nunca sob prefixo NEXT_PUBLIC_, que o Next embutiria no
 * bundle do navegador.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""

const rawServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_service_role_key ||
  ""

// Tolera o typo 'leyJ' no início da chave (todo JWT começa com 'eyJ')
const serviceKey = rawServiceKey.startsWith("leyJ") ? rawServiceKey.slice(1) : rawServiceKey

export class SupabaseAdminNotConfiguredError extends Error {
  constructor() {
    super(
      "SUPABASE_SERVICE_ROLE_KEY ausente no servidor. Defina a variável para " +
        "habilitar as operações administrativas."
    )
    this.name = "SupabaseAdminNotConfiguredError"
  }
}

export class AuthError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = "AuthError"
    this.status = status
  }
}

let cached: SupabaseClient<Database> | null = null

/** Cliente com service_role. Ignora RLS — use apenas em rotas de servidor. */
export function getAdminClient(): SupabaseClient<Database> {
  if (cached) return cached
  if (!supabaseUrl || !serviceKey) throw new SupabaseAdminNotConfiguredError()

  cached = createClient<Database>(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  return cached
}

export interface AuthenticatedAdmin {
  id: string
  email: string
  role: UserRole
}

/**
 * Valida o token do cabeçalho `Authorization: Bearer <token>` e confirma que
 * existe perfil ativo em `admin_users`.
 *
 * @param allowedRoles quando informado, restringe a esses papéis (super_admin sempre passa)
 * @throws AuthError 401 sem token válido, 403 quando o perfil não autoriza
 */
export async function requireAdmin(
  request: Request,
  allowedRoles?: UserRole[]
): Promise<AuthenticatedAdmin> {
  const header = request.headers.get("authorization") || request.headers.get("Authorization")
  const token = header?.startsWith("Bearer ") ? header.slice(7).trim() : null

  if (!token) throw new AuthError("Token de autenticação ausente.", 401)

  const admin = getAdminClient()

  // Valida a assinatura e a validade do JWT junto ao Supabase Auth
  const { data: userData, error: userError } = await admin.auth.getUser(token)
  if (userError || !userData?.user) {
    throw new AuthError("Sessão inválida ou expirada. Faça login novamente.", 401)
  }

  const user = userData.user

  const { data: profile, error: profileError } = await admin
    .from("admin_users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  if (profileError) throw new AuthError("Falha ao verificar o perfil administrativo.", 500)
  if (!profile) throw new AuthError("Usuário sem perfil administrativo.", 403)

  const row = profile as AdminUserRow
  if (!row.active) throw new AuthError("Perfil administrativo desativado.", 403)

  if (allowedRoles && row.role !== "super_admin" && !allowedRoles.includes(row.role)) {
    throw new AuthError("Seu perfil não tem permissão para esta operação.", 403)
  }

  return { id: user.id, email: user.email || row.email, role: row.role }
}

/** Converte erros de autenticação/configuração no corpo JSON da resposta. */
export function authErrorResponse(err: unknown): { status: number; body: Record<string, unknown> } {
  if (err instanceof AuthError) {
    return { status: err.status, body: { success: false, error: err.message } }
  }
  if (err instanceof SupabaseAdminNotConfiguredError) {
    console.error(err.message)
    return {
      status: 503,
      body: {
        success: false,
        code: "ENV_NOT_CONFIGURED",
        error: "Servidor sem credenciais administrativas configuradas.",
      },
    }
  }
  console.error("[supabase-admin] Erro inesperado:", err)
  return { status: 500, body: { success: false, error: "Erro interno do servidor." } }
}
