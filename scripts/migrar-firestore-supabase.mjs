/**
 * Fase 3 da migração Firestore → Supabase.
 *
 * Completa o que ficou faltando: contas de acesso, frota legada, configurações
 * da landing — e limpa a duplicidade de preços gerada por cargas repetidas.
 *
 * É IDEMPOTENTE: pode rodar várias vezes sem duplicar nada.
 *
 *   node scripts/migrar-firestore-supabase.mjs --dry-run   (só relata)
 *   node scripts/migrar-firestore-supabase.mjs             (aplica)
 *
 * NÃO envia e-mail para ninguém. As contas são criadas sem senha utilizável;
 * o convite é disparado depois, quando você decidir virar a chave:
 *
 *   node scripts/migrar-firestore-supabase.mjs --convidar
 */

import fs from "node:fs"
import { initializeApp, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { createClient } from "@supabase/supabase-js"

// ─── Configuração ─────────────────────────────────────────────────────────────

const env = {}
for (const linha of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const i = linha.indexOf("=")
  if (i > 0) env[linha.slice(0, i).trim()] = linha.slice(i + 1).trim()
}

const APLICAR = !process.argv.includes("--dry-run")
const CONVIDAR = process.argv.includes("--convidar")

initializeApp({
  credential: cert({
    projectId: env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n").replace(/^"|"$/g, ""),
  }),
})

const fire = getFirestore()

let serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || ""
if (serviceKey.startsWith("leyJ")) serviceKey = serviceKey.slice(1)

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const log = (...a) => console.log(...a)
const passo = (t) => log(`\n── ${t} ${"─".repeat(Math.max(0, 60 - t.length))}`)

// ─── 1. Preços duplicados ─────────────────────────────────────────────────────

async function limparPrecosDuplicados() {
  passo("Preços duplicados")

  const { data, error } = await sb
    .from("vehicle_pricing")
    .select("id, vehicle_id, updated_at")
    .order("updated_at", { ascending: false })

  if (error) return log("  erro ao ler:", error.message)

  const vistos = new Set()
  const excluir = []
  for (const p of data) {
    // Mantém o mais recente de cada veículo (a lista vem ordenada desc)
    if (vistos.has(p.vehicle_id)) excluir.push(p.id)
    else vistos.add(p.vehicle_id)
  }

  log(`  ${data.length} linhas · ${vistos.size} veículos · ${excluir.length} duplicadas`)
  if (!excluir.length) return log("  nada a fazer")
  if (!APLICAR) return log("  [dry-run] excluiria as duplicadas")

  const { error: delErr } = await sb.from("vehicle_pricing").delete().in("id", excluir)
  log(delErr ? `  erro ao excluir: ${delErr.message}` : `  ✓ ${excluir.length} duplicadas removidas`)
}

// ─── 2. Frota legada (drivers) ────────────────────────────────────────────────

async function migrarDrivers() {
  passo("Drivers (frota legada)")

  const snap = await fire.collection("drivers").get()
  const { data: existentes } = await sb.from("drivers").select("id")
  const jaTem = new Set((existentes ?? []).map((d) => d.id))

  const novos = []
  for (const doc of snap.docs) {
    if (jaTem.has(doc.id)) continue
    const d = doc.data()

    // Registros de teste que criei durante a verificação não devem migrar
    if (/^(QA|Candidato Teste QA)/i.test(d.fullName || "")) continue

    novos.push({
      id: doc.id,
      full_name: d.fullName ?? null,
      phone: d.phone ?? null,
      whatsapp: d.whatsapp ?? null,
      cpf: d.cpf ?? null,
      car_model: d.carModel ?? null,
      city_neighborhood: d.cityNeighborhood ?? null,
      status: d.status || "pending",
      created_at: paraIso(d.createdAt),
    })
  }

  log(`  ${snap.size} no Firestore · ${jaTem.size} já migrados · ${novos.length} a inserir`)
  if (!novos.length) return
  if (!APLICAR) return log("  [dry-run] inseriria", novos.length)

  const { error } = await sb.from("drivers").upsert(novos, { onConflict: "id" })
  log(error ? `  erro: ${error.message}` : `  ✓ ${novos.length} inseridos`)
}

// ─── 3. Configurações da landing ──────────────────────────────────────────────

async function migrarLanding() {
  passo("Configurações da landing")

  const doc = await fire.collection("landing").doc("settings").get()
  if (!doc.exists) return log("  nenhum documento landing/settings")

  const valor = doc.data()
  log(`  ${Object.keys(valor).length} campos`)
  if (!APLICAR) return log("  [dry-run] gravaria em app_settings['landing']")

  const { error } = await sb
    .from("app_settings")
    .upsert({ key: "landing", value: valor }, { onConflict: "key" })
  log(error ? `  erro: ${error.message}` : "  ✓ gravado em app_settings['landing']")
}

// ─── 4. Contas de acesso ──────────────────────────────────────────────────────
//
// As senhas do Firebase NÃO migram: ele usa scrypt próprio, o Supabase usa
// bcrypt. Criamos a conta sem senha utilizável e a pessoa define a dela pelo
// link de convite (enviado só com --convidar).

async function migrarAdmins() {
  passo("Contas de acesso ao painel")

  const snap = await fire.collection("admin_users").get()
  const { data: perfis } = await sb.from("admin_users").select("id, email")
  const emailsExistentes = new Set((perfis ?? []).map((p) => p.email?.toLowerCase()))

  for (const doc of snap.docs) {
    const a = doc.data()
    const email = (a.email || "").trim().toLowerCase()
    if (!email) {
      log(`  ⚠ documento ${doc.id} sem e-mail — ignorado`)
      continue
    }

    if (emailsExistentes.has(email)) {
      log(`  · ${email} já existe`)
      continue
    }

    if (!APLICAR) {
      log(`  [dry-run] criaria ${email} (${a.role})`)
      continue
    }

    // Cria a conta já confirmada, porém sem senha: só o convite libera o acesso
    const { data: criado, error: authErr } = await sb.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { display_name: a.displayName || email.split("@")[0] },
    })

    if (authErr) {
      // Pode já existir em auth.users sem perfil correspondente
      log(`  ⚠ ${email}: ${authErr.message}`)
      continue
    }

    const { error: perfilErr } = await sb.from("admin_users").insert({
      id: criado.user.id,
      email,
      display_name: a.displayName || email.split("@")[0],
      phone: a.phone ?? null,
      role: a.role || "vendedor",
      active: a.active !== false,
      created_at: paraIso(a.createdAt),
    })

    log(
      perfilErr
        ? `  ⚠ ${email}: conta criada, perfil falhou — ${perfilErr.message}`
        : `  ✓ ${email} (${a.role})`
    )
  }
}

// ─── 5. Convites (ação separada, envia e-mail de verdade) ─────────────────────

async function enviarConvites() {
  passo("Convites de definição de senha")

  const { data: perfis, error } = await sb.from("admin_users").select("email, active")
  if (error) return log("  erro:", error.message)

  const destino = `${env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/definir-senha`

  for (const p of (perfis ?? []).filter((x) => x.active)) {
    const { error: err } = await sb.auth.resetPasswordForEmail(p.email, { redirectTo: destino })
    log(err ? `  ⚠ ${p.email}: ${err.message}` : `  ✉ enviado para ${p.email}`)
  }
}

// ─── Utilidades ───────────────────────────────────────────────────────────────

function paraIso(valor) {
  if (!valor) return new Date().toISOString()
  if (typeof valor === "string") return valor
  if (valor.toDate) return valor.toDate().toISOString()
  if (valor._seconds) return new Date(valor._seconds * 1000).toISOString()
  return new Date().toISOString()
}

// ─── Execução ─────────────────────────────────────────────────────────────────

log(APLICAR ? "MODO: aplicando alterações" : "MODO: dry-run (nada será gravado)")

if (CONVIDAR) {
  await enviarConvites()
} else {
  await limparPrecosDuplicados()
  await migrarDrivers()
  await migrarLanding()
  await migrarAdmins()

  log("\nConcluído.")
  log("Ninguém foi notificado. Para enviar os convites de senha quando estiver pronto:")
  log("  node scripts/migrar-firestore-supabase.mjs --convidar")
}

process.exit(0)
