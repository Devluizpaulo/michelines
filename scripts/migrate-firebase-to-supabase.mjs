/**
 * Script de Migração Automatizada de Dados: Firebase Firestore -> Supabase PostgreSQL
 * 
 * Uso:
 *   node scripts/migrate-firebase-to-supabase.mjs
 * 
 * Requisitos:
 *   - Variáveis NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local
 *   - Variáveis de ambiente ou credenciais do Firebase no .env.local
 */

import fs from "fs"
import path from "path"
import { createClient } from "@supabase/supabase-js"
import { initializeApp as initAdminApp, cert, getApps as getAdminApps } from "firebase-admin/app"
import { getFirestore as getAdminDb } from "firebase-admin/firestore"

// Carrega .env.local nativamente sem depender de bibliotecas externas
const envPath = path.resolve(process.cwd(), ".env.local")
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf-8")
  for (const line of envConfig.split("\n")) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith("#")) {
      const equalsIdx = trimmed.indexOf("=")
      if (equalsIdx !== -1) {
        const key = trimmed.slice(0, equalsIdx).trim()
        const val = trimmed.slice(equalsIdx + 1).trim().replace(/^["']|["']$/g, "")
        if (!process.env[key]) {
          process.env[key] = val
        }
      }
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ ERRO: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar configurados no .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
})

// Inicialização do Firebase Admin com privilégio total de leitura
if (!getAdminApps().length) {
  const privateKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY || "").replace(/\\n/g, "\n")
  initAdminApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: privateKey,
    })
  })
}

const db = getAdminDb()

function formatIsoDate(val) {
  if (!val) return new Date().toISOString()
  if (typeof val === "string") return val
  if (val.toDate && typeof val.toDate === "function") return val.toDate().toISOString()
  if (val.seconds) return new Date(val.seconds * 1000).toISOString()
  return new Date(val).toISOString()
}

async function migrateCampaigns() {
  console.log("\n📦 Migrando campanhas...")
  try {
    const snap = await db.collection("campaigns").get()
    console.log(`   Encontrados ${snap.size} registros em 'campaigns'`)

    for (const docSnap of snap.docs) {
      const data = docSnap.data()
      const payload = {
        id: docSnap.id,
        name: data.name || "Campanha sem nome",
        channel: data.channel || "whatsapp",
        type: data.type || "massa",
        status: data.status || "rascunho",
        subject: data.subject || null,
        message: data.message || "",
        created_by: data.createdBy || null,
        recipient_filter: data.recipientFilter || {},
        total_recipients: data.totalRecipients || 0,
        sent_count: data.sentCount || 0,
        delivered_count: data.deliveredCount || 0,
        read_count: data.readCount || 0,
        clicks_count: data.clicksCount || 0,
        conversions_count: data.conversionsCount || 0,
        scheduled_for: data.scheduledFor ? formatIsoDate(data.scheduledFor) : null,
        sent_at: data.sentAt ? formatIsoDate(data.sentAt) : null,
        created_at: formatIsoDate(data.createdAt),
        updated_at: formatIsoDate(data.updatedAt)
      }
      const { error } = await supabase.from("campaigns").upsert(payload)
      if (error) console.error(`   ⚠️ Erro ao salvar campanha ${docSnap.id}:`, error.message)
    }
    console.log("   ✅ Campanhas migradas com sucesso.")
  } catch (err) {
    console.error("   ❌ Erro ao buscar campanhas:", err.message)
  }
}

async function migrateVehicles() {
  console.log("\n📦 Migrando veículos...")
  try {
    const snap = await db.collection("vehicles").get()
    console.log(`   Encontrados ${snap.size} registros em 'vehicles'`)

    for (const docSnap of snap.docs) {
      const data = docSnap.data()
      const slug = data.slug || docSnap.id

      const vehiclePayload = {
        id: slug,
        name: data.name || "Veículo sem nome",
        slug: slug,
        category: data.category || "sedans",
        brand: data.brand || "Toyota",
        year: data.year || 2024,
        transmission: data.transmission || "automatic",
        fuel_type: data.fuelType || "flex",
        is_hybrid: data.isHybrid || false,
        has_gnv: data.hasGNV || false,
        is_dtaxi_approved: data.isDTaxiApproved || false,
        is_accessible: data.isAccessible || false,
        is_atende_approved: data.isAtendeApproved || false,
        has_radio_association: data.hasRadioAssociation || false,
        is_dtp_approved: data.isDTPApproved || false,
        has_dtp_course_support: data.hasDTPCourseSupport || false,
        short_description: data.shortDescription || "",
        full_description: data.fullDescription || "",
        monthly_price: data.monthlyPrice || 0,
        weekly_price: data.weeklyPrice || 0,
        daily_price: data.dailyPrice || 0,
        status: data.status || "active",
        available: data.available !== false,
        featured: data.featured || false,
        showroom_featured: data.showroomFeatured || false,
        showroom_order: data.showroomOrder || 0,
        thumbnail: data.thumbnail || null,
        images: data.images || [],
        specs: data.specs || [],
        tags: data.tags || [],
        positive_points: data.positivePoints || [],
        highlights: data.highlights || [],
        seo_title: data.seoTitle || null,
        seo_description: data.seoDescription || null,
        views_count: data.viewsCount || 0,
        clicks_count: data.clicksCount || 0,
        created_at: formatIsoDate(data.createdAt),
        updated_at: formatIsoDate(data.updatedAt)
      }

      const { error: vErr } = await supabase.from("vehicles").upsert(vehiclePayload)
      if (vErr) console.error(`   ⚠️ Erro ao salvar veículo ${slug}:`, vErr.message)

      // Precificação
      const pricingPayload = {
        vehicle_id: slug,
        daily_rate: data.dailyPrice || 0,
        weekly_rate: data.weeklyPrice || Math.round((data.monthlyPrice || 0) / 4),
        monthly_rate: data.monthlyPrice || 0,
        weekend_exempt: true,
        accepted_payments: ["pix", "debito", "credito"],
        active: true,
        promo_campaign: data.promoCampaign || null,
        created_at: formatIsoDate(data.createdAt),
        updated_at: formatIsoDate(data.updatedAt)
      }
      await supabase.from("vehicle_pricing").upsert(pricingPayload)
    }
    console.log("   ✅ Veículos e precificações migrados.")
  } catch (err) {
    console.error("   ❌ Erro ao migrar veículos:", err.message)
  }
}

async function migrateHeroSlides() {
  console.log("\n📦 Migrando Hero Slides...")
  try {
    const snap = await db.collection("hero_slides").get()
    console.log(`   Encontrados ${snap.size} registros em 'hero_slides'`)

    for (const docSnap of snap.docs) {
      const data = docSnap.data()
      const payload = {
        id: docSnap.id,
        order: data.order || 0,
        active: data.active !== false,
        theme: data.theme || "navy",
        badge: data.badge || null,
        title: data.title || "",
        glow_title: data.glowTitle || null,
        subtitle: data.subtitle || "",
        cta_text: data.ctaText || "Saiba Mais",
        cta_url: data.ctaUrl || "/cadastro",
        image: data.image || "",
        mobile_image: data.mobileImage || null,
        video: data.video || null,
        overlay: data.overlay || "gradient-dark",
        config: {
          heroHeight: data.heroHeight || "fullscreen",
          titleWeight: data.titleWeight || "black",
          subtitleWeight: data.subtitleWeight || "medium",
          textAlignment: data.textAlignment || "left",
          destinationUrl: data.destinationUrl || null,
          imageFit: data.imageFit || "cover",
          bgOpacity: data.bgOpacity || 100,
          showTextOverlay: data.showTextOverlay !== false,
          clickableSlide: data.clickableSlide || false,
        },
        views: data.views || 0,
        clicks: data.clicks || 0,
        created_at: formatIsoDate(data.createdAt),
        updated_at: formatIsoDate(data.updatedAt)
      }
      const { error } = await supabase.from("hero_slides").upsert(payload)
      if (error) console.error(`   ⚠️ Erro ao salvar hero slide ${docSnap.id}:`, error.message)
    }
    console.log("   ✅ Hero Slides migrados.")
  } catch (err) {
    console.error("   ❌ Erro ao migrar Hero Slides:", err.message)
  }
}

async function migrateTestimonials() {
  console.log("\n📦 Migrando depoimentos...")
  try {
    const snap = await db.collection("testimonials").get()
    console.log(`   Encontrados ${snap.size} registros em 'testimonials'`)

    for (const docSnap of snap.docs) {
      const data = docSnap.data()
      const payload = {
        id: docSnap.id,
        name: data.name || "Motorista Anônimo",
        time: data.time || "",
        testimony: data.testimony || "",
        rating: data.rating || 5,
        image: data.image || null,
        approved: data.approved || false,
        created_at: formatIsoDate(data.createdAt),
        updated_at: formatIsoDate(data.updatedAt)
      }
      const { error } = await supabase.from("testimonials").upsert(payload)
      if (error) console.error(`   ⚠️ Erro ao salvar depoimento ${docSnap.id}:`, error.message)
    }
    console.log("   ✅ Depoimentos migrados.")
  } catch (err) {
    console.error("   ❌ Erro ao migrar depoimentos:", err.message)
  }
}

async function migrateLeads() {
  console.log("\n📦 Migrando leads e sub-tabelas relacionais...")
  try {
    const snap = await db.collection("leads").get()
    console.log(`   Encontrados ${snap.size} registros em 'leads'`)

    for (const docSnap of snap.docs) {
      const data = docSnap.data()
      const leadId = docSnap.id

      const leadPayload = {
        id: leadId,
        full_name: data.fullName || "Lead Sem Nome",
        phone: data.phone || "",
        email: data.email || null,
        cpf: data.cpf || null,
        rg: data.rg || null,
        cnh_number: data.cnh || null,
        address: data.address || null,
        address_city: data.city || null,
        address_state: data.state || null,
        cep: data.zipCode || null,
        cnh_category: data.cnhCategory || null,
        has_ear: data.ear || false,
        condutax_number: data.condutax || null,
        status: data.status || "new",
        vehicle_interest: data.vehicleInterest || null,
        notes: data.notes || null,
        archived: data.archived || false,
        assigned_to: data.assignedTo || null,
        source: data.source || "site",
        created_at: formatIsoDate(data.createdAt),
        updated_at: formatIsoDate(data.updatedAt)
      }

      const { error: lErr } = await supabase.from("leads").upsert(leadPayload)
      if (lErr) {
        console.error(`   ⚠️ Erro ao salvar lead ${leadId}:`, lErr.message)
        continue
      }

      // Migração de Timeline
      if (Array.isArray(data.timeline)) {
        for (const item of data.timeline) {
          const itemDate = formatIsoDate(item.createdAt || item.date)
          await supabase.from("lead_timeline").insert({
            lead_id: leadId,
            action: item.title || item.action || "Ação",
            description: item.description || null,
            author_id: item.authorId || item.userId || null,
            author_name: item.authorName || item.user || "Sistema",
            type: item.type || "status_change",
            created_at: itemDate
          })
        }
      }

      // Migração de Interações
      if (Array.isArray(data.interactions)) {
        for (const item of data.interactions) {
          const itemDate = formatIsoDate(item.createdAt)
          await supabase.from("lead_interactions").insert({
            lead_id: leadId,
            type: item.type || "note",
            notes: item.content || item.notes || "",
            channel: item.channel || "whatsapp",
            logged_by: item.loggedBy || "Sistema",
            created_at: itemDate
          })
        }
      }

      // Migração de Documentos
      if (Array.isArray(data.documents)) {
        for (const docItem of data.documents) {
          await supabase.from("lead_documents").insert({
            lead_id: leadId,
            type: docItem.type || "outro",
            title: docItem.name || docItem.title || "Documento",
            file_url: docItem.url || docItem.fileUrl || "",
            status: docItem.status || "pendente",
            uploaded_at: formatIsoDate(docItem.uploadedAt)
          })
        }
      }
    }
    console.log("   ✅ Leads e sub-tabelas migrados.")
  } catch (err) {
    console.error("   ❌ Erro ao migrar leads:", err.message)
  }
}

async function migrateAdminUsers() {
  console.log("\n📦 Migrando perfis admin...")
  try {
    const snap = await db.collection("admin_users").get()
    console.log(`   Encontrados ${snap.size} registros em 'admin_users'`)

    for (const docSnap of snap.docs) {
      const data = docSnap.data()
      const payload = {
        id: docSnap.id,
        email: data.email || "",
        display_name: data.displayName || data.email?.split("@")[0] || "Admin",
        phone: data.phone || null,
        role: data.role || "vendedor",
        active: data.active !== false,
        created_by: data.createdBy || null,
        created_at: formatIsoDate(data.createdAt),
        updated_at: formatIsoDate(data.updatedAt)
      }
      const { error } = await supabase.from("admin_users").upsert(payload)
      if (error) console.error(`   ⚠️ Erro ao salvar admin user ${docSnap.id}:`, error.message)
    }
    console.log("   ✅ Perfis admin migrados.")
  } catch (err) {
    console.error("   ❌ Erro ao migrar admin users:", err.message)
  }
}

async function runMigration() {
  console.log("🚀 INICIANDO MIGRAÇÃO FIREBASE -> SUPABASE...")
  await migrateCampaigns()
  await migrateVehicles()
  await migrateHeroSlides()
  await migrateTestimonials()
  await migrateLeads()
  await migrateAdminUsers()
  console.log("\n🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!")
}

runMigration().catch(err => {
  console.error("❌ ERRO FATAL NA MIGRAÇÃO:", err)
  process.exit(1)
})
