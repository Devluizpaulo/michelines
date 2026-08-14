import { supabase } from "@/lib/supabase"

/**
 * `fetch` para as rotas internas de `/api/*` que exigem sessão administrativa.
 *
 * Anexa o access token do Supabase no cabeçalho `Authorization`, que o servidor
 * valida em `requireAdmin`.
 */
export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    throw new Error("Sessão expirada. Faça login novamente para continuar.")
  }

  const token = session.access_token
  const headers = new Headers(init.headers)
  headers.set("Authorization", `Bearer ${token}`)

  return fetch(input, { ...init, headers })
}

/**
 * Extrai a mensagem de erro de uma resposta de API, com fallback por status.
 * As rotas respondem `{ error }` ou `{ message }`.
 */
export async function readApiError(res: Response, fallback = "Erro inesperado."): Promise<string> {
  try {
    const data = await res.json()
    return data?.error || data?.message || fallback
  } catch {
    if (res.status === 401) return "Sessão expirada. Faça login novamente."
    if (res.status === 403) return "Você não tem permissão para esta operação."
    return fallback
  }
}

