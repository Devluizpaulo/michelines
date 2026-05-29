import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_service_role_key!

// Corrige o potencial typo 'leyJ' da chave se presente, garantindo robustez
const finalServiceKey = supabaseServiceKey && supabaseServiceKey.startsWith("leyJ")
  ? supabaseServiceKey.slice(1)
  : supabaseServiceKey

// Inicializa o cliente com service_role para ignorar políticas RLS
const supabaseAdmin = createClient(supabaseUrl, finalServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

/**
 * GET /api/media?bucket=...&folder=...
 * Lista arquivos de uma determinada pasta em um bucket
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const bucket = searchParams.get("bucket")
    const folder = searchParams.get("folder") || ""

    if (!bucket) {
      return NextResponse.json({ error: "O parâmetro 'bucket' é obrigatório." }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .list(folder, {
        limit: 100,
        sortBy: { column: "name", order: "asc" }
      })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (err: any) {
    console.error("[API Media GET] Erro:", err)
    return NextResponse.json({ error: err.message || "Erro interno do servidor." }, { status: 500 })
  }
}

/**
 * POST /api/media
 * Faz upload de um arquivo para um bucket do Supabase Storage
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const bucket = formData.get("bucket") as string
    const path = formData.get("path") as string
    const file = formData.get("file") as File

    if (!bucket || !path || !file) {
      return NextResponse.json(
        { error: "Os parâmetros 'bucket', 'path' e 'file' são obrigatórios." },
        { status: 400 }
      )
    }

    // Converte o arquivo recebido em Buffer para realizar o upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: true,
        cacheControl: "31536000"
      })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Recupera a URL pública do arquivo recém enviado
    const { data: urlData } = supabaseAdmin.storage.from(bucket).getPublicUrl(data.path)

    return NextResponse.json({ 
      success: true, 
      path: data.path,
      url: urlData.publicUrl 
    })
  } catch (err: any) {
    console.error("[API Media POST] Erro:", err)
    return NextResponse.json({ error: err.message || "Erro interno do servidor." }, { status: 500 })
  }
}

/**
 * DELETE /api/media?bucket=...&paths=...
 * Exclui um ou mais arquivos do bucket do Supabase Storage
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const bucket = searchParams.get("bucket")
    const pathsParam = searchParams.get("paths")

    if (!bucket || !pathsParam) {
      return NextResponse.json(
        { error: "Os parâmetros 'bucket' e 'paths' são obrigatórios." },
        { status: 400 }
      )
    }

    const paths = pathsParam.split(",")

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .remove(paths)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    console.error("[API Media DELETE] Erro:", err)
    return NextResponse.json({ error: err.message || "Erro interno do servidor." }, { status: 500 })
  }
}
