import { NextResponse } from "next/server"
import { getApps, initializeApp, cert } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"

export async function POST(request: Request) {
  try {
    const { uid } = await request.json()

    if (!uid) {
      return NextResponse.json(
        { success: false, error: "UID do usuário é obrigatório." },
        { status: 400 }
      )
    }

    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY

    // Verificação de ambiente
    if (!projectId || !clientEmail || !privateKey) {
      console.warn("Chaves administrativas do Firebase Admin não configuradas no servidor.")
      return NextResponse.json({
        success: false,
        code: "ENV_NOT_CONFIGURED",
        message: "Credenciais administrativas do Firebase não configuradas. A exclusão física no Auth precisa ser feita manualmente."
      })
    }

    // Inicialização do Firebase Admin SDK
    if (!getApps().length) {
      try {
        initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, "\n"),
          }),
        })
      } catch (initErr: any) {
        console.error("Erro ao inicializar Firebase Admin SDK:", initErr)
        return NextResponse.json({
          success: false,
          code: "INIT_FAILED",
          message: `Falha ao inicializar o Admin SDK: ${initErr.message}`
        })
      }
    }

    // Deletar o usuário no Firebase Auth
    try {
      await getAuth().deleteUser(uid)
      return NextResponse.json({
        success: true,
        message: "Usuário deletado do Firebase Auth com sucesso."
      })
    } catch (authErr: any) {
      // Se o usuário não existir no Auth, podemos considerar sucesso (já foi excluído ou nunca existiu)
      if (authErr.code === "auth/user-not-found") {
        return NextResponse.json({
          success: true,
          message: "Usuário não encontrado no Firebase Auth (provavelmente já removido)."
        })
      }

      console.error("Erro ao deletar usuário do Firebase Auth:", authErr)
      return NextResponse.json({
        success: false,
        code: "AUTH_DELETE_FAILED",
        message: authErr.message || "Erro desconhecido ao remover do autenticador."
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error("Erro na rota de API de exclusão de usuário:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Erro interno do servidor." },
      { status: 500 }
    )
  }
}
