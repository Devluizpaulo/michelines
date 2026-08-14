import { NextResponse } from "next/server"
import { getAdminClient, requireAdmin, authErrorResponse, SupabaseAdminNotConfiguredError } from "@/lib/supabase-admin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function getSupabaseAdmin() {
  try {
    return getAdminClient()
  } catch (err) {
    if (err instanceof SupabaseAdminNotConfiguredError) return null
    throw err
  }
}

const NOT_CONFIGURED = NextResponse.json(
  { error: "Supabase não configurado no servidor." },
  { status: 503 }
)

/** Buckets que esta rota pode manipular — impede acesso a qualquer bucket do projeto. */
const ALLOWED_BUCKETS = new Set(["vehicles", "banners", "logos"])

function assertBucket(bucket: string | null): string | NextResponse {
  if (!bucket) {
    return NextResponse.json({ error: "O parâmetro 'bucket' é obrigatório." }, { status: 400 })
  }
  if (!ALLOWED_BUCKETS.has(bucket)) {
    return NextResponse.json({ error: `Bucket '${bucket}' não permitido.` }, { status: 400 })
  }
  return bucket
}

/**
 * GET /api/media?bucket=...&folder=...
 * Lista arquivos de uma pasta. Exige sessão administrativa (é a navegação da
 * Central de Mídia do painel, não um recurso público).
 */
export async function GET(request: Request) {
  try {
    await requireAdmin(request)
  } catch (err) {
    const { status, body } = authErrorResponse(err)
    return NextResponse.json(body, { status })
  }

  try {
    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) return NOT_CONFIGURED

    const { searchParams } = new URL(request.url)
    const bucket = assertBucket(searchParams.get("bucket"))
    if (bucket instanceof NextResponse) return bucket
    const folder = searchParams.get("folder") || ""

    const { data, error } = await supabaseAdmin.storage.from(bucket).list(folder, {
      limit: 100,
      sortBy: { column: "name", order: "asc" },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (err: any) {
    console.error("[API Media GET] Erro:", err)
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 })
  }
}

/** Tamanho máximo aceito por upload (10 MB). */
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024
const ALLOWED_MIME = /^image\/(png|jpeg|webp|avif|gif|svg\+xml)$/

/**
 * POST /api/media
 * Faz upload de uma imagem para um bucket do Supabase Storage.
 */
export async function POST(request: Request) {
  try {
    await requireAdmin(request)
  } catch (err) {
    const { status, body } = authErrorResponse(err)
    return NextResponse.json(body, { status })
  }

  try {
    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) return NOT_CONFIGURED

    const formData = await request.formData()
    const bucket = assertBucket(formData.get("bucket") as string | null)
    if (bucket instanceof NextResponse) return bucket
    const path = formData.get("path") as string
    const file = formData.get("file") as File

    if (!path || !file) {
      return NextResponse.json(
        { error: "Os parâmetros 'bucket', 'path' e 'file' são obrigatórios." },
        { status: 400 }
      )
    }

    // Impede subir de diretório e escapar do bucket
    if (path.includes("..") || path.startsWith("/")) {
      return NextResponse.json({ error: "Caminho de destino inválido." }, { status: 400 })
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: "Arquivo maior que o limite de 10 MB." },
        { status: 413 }
      )
    }

    if (file.type && !ALLOWED_MIME.test(file.type)) {
      return NextResponse.json(
        { error: `Tipo de arquivo não permitido: ${file.type}.` },
        { status: 415 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    const { data, error } = await supabaseAdmin.storage.from(bucket).upload(path, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: true,
      cacheControl: "31536000",
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const { data: urlData } = supabaseAdmin.storage.from(bucket).getPublicUrl(data.path)

    return NextResponse.json({
      success: true,
      path: data.path,
      url: urlData.publicUrl,
    })
  } catch (err: any) {
    console.error("[API Media POST] Erro:", err)
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 })
  }
}

/**
 * DELETE /api/media?bucket=...&paths=...
 * Exclui arquivos do bucket. Restrito a super_admin e gerente.
 */
export async function DELETE(request: Request) {
  try {
    await requireAdmin(request, ["super_admin", "gerente"])
  } catch (err) {
    const { status, body } = authErrorResponse(err)
    return NextResponse.json(body, { status })
  }

  try {
    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) return NOT_CONFIGURED

    const { searchParams } = new URL(request.url)
    const bucket = assertBucket(searchParams.get("bucket"))
    if (bucket instanceof NextResponse) return bucket
    const pathsParam = searchParams.get("paths")

    if (!pathsParam) {
      return NextResponse.json(
        { error: "Os parâmetros 'bucket' e 'paths' são obrigatórios." },
        { status: 400 }
      )
    }

    const paths = pathsParam.split(",").map((p) => p.trim()).filter(Boolean)
    if (paths.length === 0) {
      return NextResponse.json({ error: "Nenhum caminho informado." }, { status: 400 })
    }
    if (paths.some((p) => p.includes("..") || p.startsWith("/"))) {
      return NextResponse.json({ error: "Caminho inválido na lista." }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin.storage.from(bucket).remove(paths)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    console.error("[API Media DELETE] Erro:", err)
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 })
  }
}
