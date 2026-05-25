"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { collection, query, orderBy, getDocs, doc, getDoc } from "firebase/firestore"
import { signOut } from "firebase/auth"
import { db, auth } from "../firebase/config"

import { Lead } from "@/types/lead"
import { LandingSettings } from "@/types/landing"
import { TabId } from "@/lib/permissions"

// Auth context
import { AuthProvider, useAuth } from "@/contexts/AuthContext"

// Admin components
import { AdminHeader } from "@/components/admin/shared/AdminHeader"
import { AdminSidebar } from "@/components/admin/shared/AdminSidebar"
import { DashboardOverview } from "@/components/admin/dashboard/DashboardOverview"
import { LeadBoard } from "@/components/admin/leads/LeadBoard"
import { CampaignManager } from "@/components/admin/campaigns/CampaignManager"
import { LandingConfig } from "@/components/admin/landing/LandingConfig"
import { VehicleManager } from "@/components/admin/vehicles/VehicleManager"
import { OperationManager } from "@/components/admin/vehicles/OperationManager"
import { AnalyticsDashboard } from "@/components/admin/analytics/AnalyticsDashboard"
import { BulkImageUploader } from "@/components/admin/shared/BulkImageUploader"
import { UserManager } from "@/components/admin/users/UserManager"
import { BUCKETS } from "@/lib/supabase"
import { Shield } from "lucide-react"

// Inner component that uses auth context
function AdminContent() {
  const { adminUser, role, canAccess, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<TabId>("dashboard")
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [landingSettings, setLandingSettings] = useState<LandingSettings>({
    heroTitle: "",
    heroGlowText: "",
    liveBannerText: "",
    congonhasStatus: "",
    showCampaignBanner: false,
    campaignText: "",
    campaignTemplateId: 1,
    campaignSubtitle: "",
    campaignBtnText: "",
    campaignBtnUrl: ""
  })

  const router = useRouter()

  // Logout
  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/login")
    } catch (e) {
      console.error(e)
    }
  }

  // Guard: redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !adminUser) {
      router.push("/login")
    }
  }, [authLoading, adminUser, router])

  // Guard: if activeTab is not accessible, switch to dashboard
  useEffect(() => {
    if (role && !canAccess(activeTab)) {
      setActiveTab("dashboard")
    }
  }, [role, activeTab, canAccess])

  // Fetch landing settings
  useEffect(() => {
    const fetchLandingSettings = async () => {
      try {
        const docRef = doc(db, "landing", "settings")
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setLandingSettings(docSnap.data() as LandingSettings)
        }
      } catch (e) {
        console.warn("Firestore offline ao carregar configurações:", e)
      }
    }
    fetchLandingSettings()
  }, [])

  // Load Leads
  useEffect(() => {
    const loadCRMData = async () => {
      try {
        setLoading(true)
        const qLeads = query(collection(db, "leads"), orderBy("createdAt", "desc"))
        const leadsSnap = await getDocs(qLeads)
        const leadsList: Lead[] = []
        leadsSnap.forEach((doc) => {
          leadsList.push({ id: doc.id, ...doc.data() } as Lead)
        })

        const qDrivers = query(collection(db, "drivers"), orderBy("createdAt", "desc"))
        const driversSnap = await getDocs(qDrivers)

        driversSnap.forEach((doc) => {
          const dData = doc.data()
          const exists = leadsList.some(l => l.phone === dData.phone)
          if (!exists) {
            let leadStatus: Lead["status"] = "new"
            if (dData.status === "active") leadStatus = "converted"
            if (dData.status === "inactive") leadStatus = "lost"

            leadsList.push({
              id: doc.id,
              fullName: dData.fullName || `${dData.firstName} ${dData.lastName}`,
              phone: dData.phone,
              source: "Cadastro Site (Legado)",
              vehicleInterest: dData.carModel || "Não especificado",
              status: leadStatus,
              notes: `Cadastro importado da frota legada. CPF: ${dData.cpf || "Não informado"}.`,
              createdAt: dData.createdAt || new Date().toISOString(),
              contacted: dData.status !== "pending",
              whatsappSent: false
            } as Lead)
          }
        })

        leadsList.sort((a: any, b: any) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt)
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt)
          return dateB.getTime() - dateA.getTime()
        })

        setLeads(leadsList)
      } catch (e) {
        console.error("Erro ao buscar dados do CRM:", e)
      } finally {
        setLoading(false)
      }
    }

    loadCRMData()
  }, [])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <span className="animate-spin h-7 w-7 border-2 border-sky-600 border-t-transparent rounded-full" />
          <p className="text-sm text-slate-500 font-semibold">Carregando painel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">

      {/* Header */}
      <AdminHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      <div className="flex flex-1">

        {/* Sidebar */}
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
        />

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8 lg:p-10 bg-[#F8FAFC] overflow-y-auto">

          {/* Access denied guard */}
          {!canAccess(activeTab) ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
              <Shield className="h-12 w-12 text-slate-300" />
              <p className="text-sm font-bold text-slate-600">Sem permissão para acessar esta seção.</p>
              <p className="text-xs text-slate-400">Contate o administrador do sistema.</p>
            </div>
          ) : (
            <>
              {activeTab === "dashboard" && (
                <DashboardOverview
                  leads={leads}
                  onLeadClick={() => setActiveTab("leads")}
                />
              )}

              {activeTab === "leads" && (
                <LeadBoard
                  leads={leads}
                  onLeadsChange={setLeads}
                  loading={loading}
                />
              )}

              {activeTab === "campanhas" && (
                <CampaignManager
                  landingSettings={landingSettings}
                  onSettingsSaved={setLandingSettings}
                />
              )}

              {activeTab === "landing" && (
                <LandingConfig
                  landingSettings={landingSettings}
                  onSettingsSaved={setLandingSettings}
                />
              )}

              {activeTab === "frota" && (
                <VehicleManager leads={leads} />
              )}

              {activeTab === "operacao" && (
                <OperationManager />
              )}

              {activeTab === "analytics" && (
                <AnalyticsDashboard leads={leads} />
              )}

              {activeTab === "usuarios" && (
                <UserManager />
              )}

              {activeTab === "configuracoes" && (
                <div className="space-y-6 max-w-4xl">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Configurações & Mídia</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Gerencie uploads de imagens para o Supabase Storage e integrações do painel comercial.</p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Upload de Imagens — Supabase Storage</h3>
                    <p className="text-xs text-slate-500 mb-4">Faça upload das fotos dos veículos diretamente para o Supabase. As URLs geradas podem ser usadas no cadastro da frota.</p>
                    <div className="grid md:grid-cols-3 gap-4">
                      <BulkImageUploader bucket={BUCKETS.vehicles} label="Fotos de Veículos" />
                      <BulkImageUploader bucket={BUCKETS.banners} label="Banners da Landing" />
                      <BulkImageUploader bucket={BUCKETS.logos} label="Logos & Marcas" />
                    </div>
                  </div>

                  <div className="p-6 bg-white border border-slate-200 rounded-2xl text-xs text-slate-600 leading-relaxed shadow-sm">
                    <p className="font-bold text-slate-700 mb-2">🔗 Integrações de Produção</p>
                    As configurações e integrações de canais adicionais (Meta Ads, Webhooks, disparadores de WhatsApp) estão habilitadas em nível de servidor nas Cloud Functions do Firebase.
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}

// Wrap with AuthProvider
export default function AdminPage() {
  return (
    <AuthProvider>
      <AdminContent />
    </AuthProvider>
  )
}
