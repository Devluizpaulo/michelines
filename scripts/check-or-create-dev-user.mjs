import fs from "fs"
import path from "path"
import { createClient } from "@supabase/supabase-js"

const envPath = path.resolve(process.cwd(), ".env.local")
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf-8")
  for (const line of envConfig.split("\n")) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=")
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim()
        const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "")
        if (!process.env[key]) process.env[key] = val
      }
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
  console.error("❌ SUPABASE_URL ou SERVICE_ROLE_KEY ausentes no .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
})

async function run() {
  console.log("🔍 Verificando usuários no Supabase Auth...")
  const { data: authData, error: authErr } = await supabase.auth.admin.listUsers()

  if (authErr) {
    console.error("Erro ao listar usuários Auth:", authErr)
    return
  }

  console.log(`Encontrados ${authData.users.length} usuários no Supabase Auth.`)

  const devEmail = "admin@grupomichelines.com.br"
  const devPassword = "Admin123456!"

  let devUser = authData.users.find((u) => u.email === devEmail)

  if (!devUser) {
    console.log(`🚀 Criando usuário dev '${devEmail}'...`)
    const { data: createData, error: createErr } = await supabase.auth.admin.createUser({
      email: devEmail,
      password: devPassword,
      email_confirm: true,
      user_metadata: {
        display_name: "Desenvolvedor / Super Admin",
      },
    })

    if (createErr || !createData.user) {
      console.error("❌ Erro ao criar usuário dev:", createErr)
      return
    }
    devUser = createData.user
    console.log("✅ Usuário dev criado no Supabase Auth com sucesso!")
  } else {
    console.log(`ℹ️ Usuário '${devEmail}' já existe no Supabase Auth. Atualizando senha...`)
    await supabase.auth.admin.updateUserById(devUser.id, {
      password: devPassword,
      email_confirm: true,
    })
    console.log("✅ Senha atualizada!")
  }

  // Verifica/Insere no admin_users
  const { data: existingAdmin, error: adminSelectErr } = await supabase
    .from("admin_users")
    .select("*")
    .eq("id", devUser.id)
    .maybeSingle()

  if (!existingAdmin) {
    console.log("🚀 Cadastrando perfil 'super_admin' em admin_users...")
    const { error: insertErr } = await supabase.from("admin_users").upsert({
      id: devUser.id,
      email: devEmail,
      display_name: "Desenvolvedor / Super Admin",
      role: "super_admin",
      active: true,
    })

    if (insertErr) {
      console.error("❌ Erro ao inserir perfil em admin_users:", insertErr)
    } else {
      console.log("✅ Perfil super_admin cadastrado em admin_users com sucesso!")
    }
  } else {
    console.log("ℹ️ Perfil em admin_users já existe:")
    console.log(existingAdmin)
  }

  console.log("\n==========================================")
  console.log("🔑 CREDENCIAIS DE DESENVOLVIMENTO (DEV):")
  console.log(`   URL de Login: http://localhost:3000/login`)
  console.log(`   Email:        ${devEmail}`)
  console.log(`   Senha:        ${devPassword}`)
  console.log(`   Papel:        super_admin`)
  console.log("==========================================")
}

run()
