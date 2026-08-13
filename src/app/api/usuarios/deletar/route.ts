import { NextResponse } from "next/server"
import { getAuth } from "firebase-admin/auth"
import { getAdminApp, requireAdmin, authErrorResponse, AuthError } from "@/lib/firebase-admin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * POST /api/usuarios/deletar
 * Remove um usuário do Firebase Auth. Exclusivo para super administradores.
 */
export async function POST(request: Request) {
  let caller
  try {
    // Somente super_admin remove contas (regra espelhada em firestore.rules).
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
    if (uid === caller.uid) {
      return NextResponse.json(
        { success: false, error: "Você não pode excluir a sua própria conta." },
        { status: 400 }
      )
    }

    try {
      await getAuth(getAdminApp()).deleteUser(uid)
      console.info(`[usuarios/deletar] ${caller.email} removeu o uid ${uid}`)
      return NextResponse.json({
        success: true,
        message: "Usuário deletado do Firebase Auth com sucesso.",
      })
    } catch (authErr: any) {
      // Usuário inexistente no Auth: já removido ou nunca criado — tratamos como sucesso.
      if (authErr?.code === "auth/user-not-found") {
        return NextResponse.json({
          success: true,
          message: "Usuário não encontrado no Firebase Auth (provavelmente já removido).",
        })
      }

      console.error("Erro ao deletar usuário do Firebase Auth:", authErr)
      return NextResponse.json(
        { success: false, error: "Erro ao remover o usuário do autenticador." },
        { status: 500 }
      )
    }
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
