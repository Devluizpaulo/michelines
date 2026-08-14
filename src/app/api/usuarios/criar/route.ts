import { NextResponse } from "next/server"
import { getAdminClient, requireAdmin, authErrorResponse, AuthError } from "@/lib/supabase-admin"
import { UserRole } from "@/lib/permissions"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * POST /api/usuarios/criar
 * Cria um novo usuário no Supabase Auth e registra na tabela admin_users.
 * Requer papel de super_admin ou gerente.
 */
export async function POST(request: Request) {
  let caller
  try {
    caller = await requireAdmin(request, ["super_admin", "gerente"])
  } catch (err) {
    const { status, body } = authErrorResponse(err)
    return NextResponse.json(body, { status })
  }

  try {
    const { email, displayName, phone, role } = await request.json()

    if (!email || !displayName || !role) {
      return NextResponse.json(
        { success: false, error: "Email, nome e papel (role) são obrigatórios." },
        { status: 400 }
      )
    }

    const admin = getAdminClient()

    // Gera senha temporária de 12 caracteres aleatórios
    const tempPassword = Math.random().toString(36).slice(-8) + "A1!" + Math.random().toString(36).slice(-4).toUpperCase()

    // 1. Cria a conta no Supabase Auth com email_confirm ativado
    const { data: authData, error: authErr } = await admin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        display_name: displayName,
      },
    })

    if (authErr || !authData.user) {
      console.error("Erro ao criar usuário no Supabase Auth:", authErr)
      return NextResponse.json(
        { success: false, error: authErr?.message || "Erro ao criar usuário no autenticador." },
        { status: 400 }
      )
    }

    const uid = authData.user.id

    // 2. Insere na tabela admin_users
    const { error: dbErr } = await admin.from("admin_users").insert({
      id: uid,
      email,
      display_name: displayName,
      phone: phone || null,
      role: role as UserRole,
      active: true,
      created_by: caller.id,
    })

    if (dbErr) {
      console.error("Erro ao inserir perfil em admin_users:", dbErr)
      // Rollback no Auth se falhou no DB
      await admin.auth.admin.deleteUser(uid)
      return NextResponse.json(
        { success: false, error: "Erro ao registrar perfil do usuário." },
        { status: 500 }
      )
    }

    console.info(`[usuarios/criar] ${caller.email} criou o usuário ${email} (ID: ${uid})`)

    return NextResponse.json({
      success: true,
      user: {
        uid,
        email,
        displayName,
        phone,
        role,
        active: true,
      },
      tempPassword,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status })
    }
    console.error("Erro na rota de API de criação de usuário:", error)
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor." },
      { status: 500 }
    )
  }
}
