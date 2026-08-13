import { auth } from "@/app/firebase/config"

/**
 * `fetch` para as rotas internas de `/api/*` que exigem sessão administrativa.
 *
 * Anexa o ID token do Firebase no cabeçalho `Authorization`, que o servidor
 * valida em `requireAdmin`. Use isto — e não o `fetch` puro — em qualquer
 * chamada a rota protegida, senão a resposta será 401.
 */
export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const user = auth.currentUser
  if (!user) {
    throw new Error("Sessão expirada. Faça login novamente para continuar.")
  }

  const token = await user.getIdToken()
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
