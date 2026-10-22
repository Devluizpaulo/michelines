import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Sonda de saúde para o orquestrador (Coolify, Docker, balanceador).
 *
 * Responde 200 quando o processo está de pé E o ambiente mínimo está
 * configurado. Checar a configuração aqui evita o pior cenário de deploy:
 * o contêiner sobe, o healthcheck passa, o tráfego é direcionado e só então
 * se descobre que faltou uma variável e o site inteiro está quebrado.
 *
 * Não toca no banco de propósito: uma instabilidade momentânea do Postgres não
 * deve fazer o orquestrador derrubar e recriar a aplicação em loop.
 */
export async function GET() {
  const faltando = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ].filter((chave) => !process.env[chave])

  if (faltando.length > 0) {
    return NextResponse.json(
      { status: "misconfigured", missing: faltando },
      { status: 503 }
    )
  }

  return NextResponse.json({
    status: "ok",
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  })
}
