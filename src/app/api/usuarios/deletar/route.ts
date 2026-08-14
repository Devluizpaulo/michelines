import { NextResponse } from "next/server"
import { getAdminClient, requireAdmin, authErrorResponse, AuthError } from "@/lib/supabase-admin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * POST /api/usuarios/deletar
 * Remove um usuário do Supabase Auth e da tabela admin_users. Exclusivo para super administradores.
 */
export async function POST(request: Request) {
  let caller
  try {
    // Somente super_admin remove contas.
    caller = await requireAdmin(request, ["super_admin"])
  } catch (err) {
    const { status, body } = authErrorResponse(err)
    return NextResponse.json(body, { status })
  }

  try {
    const { uid } = await request.json()

    if (!uid || typeof uid !== "string") {
      return NextResponse.json(
        { success: false, error: "UID do usuário é obrigatório." },
        { status: 400 }
      )
    }

    // Impede que um super admin apague a própria conta e se tranque para fora.
    if (uid === caller.id) {
      return NextResponse.json(
        { success: false, error: "Você não pode excluir a sua própria conta." },
        { status: 400 }
      )
    }

    const admin = getAdminClient()

    // 1. Remove da tabela admin_users
    const { error: dbError } = await admin.from("admin_users").delete().eq("id", uid)
    if (dbError) {
      console.error("Erro ao remover registro da tabela admin_users:", dbError)
    }

    // 2. Remove do Supabase Auth
    const { error: authErr } = await admin.auth.admin.deleteUser(uid)
    if (authErr) {
      console.error("Erro ao deletar usuário do Supabase Auth:", authErr)
      return NextResponse.json(
        { success: false, error: authErr.message || "Erro ao remover o usuário do autenticador." },
        { status: 500 }
      )
    }

    console.info(`[usuarios/deletar] ${caller.email} removeu o id ${uid}`)
    return NextResponse.json({
      success: true,
      message: "Usuário deletado do Supabase Auth com sucesso.",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status })
    }
    console.error("Erro na rota de API de exclusão de usuário:", error)
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor." },
      { status: 500 }
    )
  }
}

