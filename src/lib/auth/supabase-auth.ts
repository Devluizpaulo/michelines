import { supabase } from "@/lib/supabase"
import type { Session, User } from "@supabase/supabase-js"

/**
 * Autenticação do painel via Supabase Auth.
 *
 * Substitui o Firebase Auth. Diferenças que importam para quem usa o sistema:
 *
 *  • A sessão é um JWT que o RLS lê como `auth.uid()` — ou seja, o mesmo login
 *    que abre o painel é o que autoriza cada linha do banco. No Firebase eram
 *    dois sistemas separados.
 *  • Não existe auto-cadastro: contas são provisionadas por um super admin
 *    através de convite (`/api/usuarios/convidar`).
 *  • As senhas do Firebase NÃO migram (scrypt do Firebase vs bcrypt do Supabase).
 *    Toda a equipe define senha nova no primeiro acesso.
 */

export interface AuthResult {
  ok: boolean
  /** Mensagem já pronta para exibir ao usuário. */
  message?: string
}

/** Traduz o erro do Supabase para algo compreensível, sem vazar se o e-mail existe. */
function traduzirErro(mensagem: string): string {
  const m = mensagem.toLowerCase()
  if (m.includes("invalid login credentials")) {
    return "Falha na autenticação. Verifique suas credenciais."
  }
  if (m.includes("email not confirmed")) {
    return "Seu e-mail ainda não foi confirmado. Verifique a caixa de entrada."
  }
  if (m.includes("rate limit") || m.includes("too many")) {
    return "Muitas tentativas seguidas. Aguarde alguns minutos e tente novamente."
  }
  if (m.includes("weak password") || m.includes("at least")) {
    return "Senha muito fraca. Use no mínimo 8 caracteres, com letras e números."
  }
  return "Não foi possível concluir. Tente novamente."
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  })
  if (error) return { ok: false, message: traduzirErro(error.message) }
  return { ok: true }
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
}

export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function getUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser()
  return data.user
}

/**
 * Observa a sessão. Dispara já com o estado atual e a cada mudança
 * (login, logout, refresh de token). Devolve a função de cancelamento.
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null)
  })
  return () => data.subscription.unsubscribe()
}

/**
 * Envia o e-mail de redefinição de senha.
 *
 * Sempre responde sucesso, mesmo com e-mail inexistente: revelar quais e-mails
 * existem na base é enumeração de usuários.
 */
export async function requestPasswordReset(email: string): Promise<AuthResult> {
  const redirectTo =
    typeof window !== "undefined" ? `${window.location.origin}/definir-senha` : undefined

  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo,
  })

  if (error) console.warn("[auth] Falha ao solicitar redefinição:", error.message)

  return {
    ok: true,
    message: "Se este e-mail estiver cadastrado, você receberá as instruções em instantes.",
  }
}

/**
 * Define a senha nova. Usado tanto na redefinição quanto no primeiro acesso via
 * convite — nos dois casos o link já autenticou a sessão.
 */
export async function updatePassword(novaSenha: string): Promise<AuthResult> {
  if (novaSenha.length < 8) {
    return { ok: false, message: "A senha precisa ter ao menos 8 caracteres." }
  }

  const { error } = await supabase.auth.updateUser({ password: novaSenha })
  if (error) return { ok: false, message: traduzirErro(error.message) }

  return { ok: true, message: "Senha definida com sucesso." }
}

/** Token de acesso para chamar as rotas internas de /api. */
export async function getAccessToken(): Promise<string | null> {
  const session = await getSession()
  return session?.access_token ?? null
}
