import { getApps, initializeApp, cert, App } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"
import type { UserRole } from "@/lib/permissions"

/**
 * Bootstrap do Firebase Admin SDK e verificação de sessão para as rotas de API.
 *
 * Toda rota que escreve dados ou usa credenciais privilegiadas (service_role do
 * Supabase, Admin SDK do Firebase) precisa passar por `requireAdmin`. Sem isso a
 * rota fica aberta para qualquer pessoa na internet.
 */

const ADMIN_APP_NAME = "admin-sdk"

export class AdminSdkNotConfiguredError extends Error {
  constructor() {
    super(
      "Credenciais do Firebase Admin ausentes. Defina FIREBASE_ADMIN_PROJECT_ID, " +
        "FIREBASE_ADMIN_CLIENT_EMAIL e FIREBASE_ADMIN_PRIVATE_KEY no ambiente do servidor."
    )
    this.name = "AdminSdkNotConfiguredError"
  }
}

let cachedApp: App | null = null

/** Retorna (inicializando sob demanda) o app do Admin SDK. */
export function getAdminApp(): App {
  if (cachedApp) return cachedApp

  const existing = getApps().find((a) => a.name === ADMIN_APP_NAME)
  if (existing) {
    cachedApp = existing
    return existing
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY

  if (!projectId || !clientEmail || !privateKey) {
    throw new AdminSdkNotConfiguredError()
  }

  cachedApp = initializeApp(
    {
      credential: cert({
        projectId,
        clientEmail,
        // Chaves vindas de .env costumam ter as quebras de linha escapadas.
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
    },
    ADMIN_APP_NAME
  )

  return cachedApp
}

export interface AuthenticatedAdmin {
  uid: string
  email: string
  role: UserRole
}

export class AuthError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = "AuthError"
    this.status = status
  }
}

/**
 * Valida o ID token do cabeçalho `Authorization: Bearer <token>` e confirma que o
 * usuário possui um perfil ativo em `admin_users`.
 *
 * @param allowedRoles quando informado, restringe a esses papéis (super_admin sempre passa)
 * @throws AuthError 401 se não houver token válido, 403 se o perfil não autorizar
 */
export async function requireAdmin(
  request: Request,
  allowedRoles?: UserRole[]
): Promise<AuthenticatedAdmin> {
  const header = request.headers.get("authorization") || request.headers.get("Authorization")
  const token = header?.startsWith("Bearer ") ? header.slice(7).trim() : null

  if (!token) {
    throw new AuthError("Token de autenticação ausente.", 401)
  }

  const app = getAdminApp()

  let uid: string
  let email: string
  try {
    // checkRevoked: um logout/troca de senha invalida o token imediatamente.
    const decoded = await getAuth(app).verifyIdToken(token, true)
    uid = decoded.uid
    email = decoded.email || ""
  } catch {
    throw new AuthError("Sessão inválida ou expirada. Faça login novamente.", 401)
  }

  const snap = await getFirestore(app).collection("admin_users").doc(uid).get()
  if (!snap.exists) {
    throw new AuthError("Usuário sem perfil administrativo.", 403)
  }

  const data = snap.data() as { role?: UserRole; active?: boolean }
  if (data.active === false) {
    throw new AuthError("Perfil administrativo desativado.", 403)
  }

  const role = data.role
  if (!role) {
    throw new AuthError("Perfil administrativo sem papel definido.", 403)
  }

  if (allowedRoles && role !== "super_admin" && !allowedRoles.includes(role)) {
    throw new AuthError("Seu perfil não tem permissão para esta operação.", 403)
  }

  return { uid, email, role }
}

/** Converte erros de autenticação/configuração no corpo JSON da resposta. */
export function authErrorResponse(err: unknown): { status: number; body: Record<string, unknown> } {
  if (err instanceof AuthError) {
    return { status: err.status, body: { success: false, error: err.message } }
  }
  if (err instanceof AdminSdkNotConfiguredError) {
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
  return { status: 500, body: { success: false, error: "Erro interno do servidor." } }
}
