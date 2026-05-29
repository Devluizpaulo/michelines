"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { collection, query, orderBy, getDocs, doc, getDoc, onSnapshot } from "firebase/firestore"
import { signOut } from "firebase/auth"
import { db, auth } from "../firebase/config"

import { Lead } from "@/types/lead"
import { LandingSettings } from "@/types/landing"
import { TabId } from "@/lib/permissions"

// Auth context
import { AuthProvider, useAuth } from "@/contexts/AuthContext"

// Toast
import { ToastProvider, useToast } from "@/components/ui/toast-simple"

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
import { SupabaseMediaCenter } from "@/components/admin/shared/SupabaseMediaCenter"
import { UserManager } from "@/components/admin/users/UserManager"
import { Shield } from "lucide-react"

// Inner component that uses auth context
function AdminContent() {
  const { adminUser, role, canAccess, loading: authLoading } = useAuth()
  const { success } = useToast()
  const mountTimeRef = useRef(Date.now())
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

  // Fetch landing settings — apenas quando a tab relevante é ativada
  const fetchLandingSettings = useCallback(async () => {
    try {
      const docRef = doc(db, "landing", "settings")
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        setLandingSettings(docSnap.data() as LandingSettings)
      }
    } catch (e) {
      console.warn("Firestore offline ao carregar configurações:", e)
    }
  }, [])

  useEffect(() => {
    if (activeTab === "campanhas" || activeTab === "landing") {
      fetchLandingSettings()
    }
  }, [activeTab, fetchLandingSettings])

  // Carrega leads sob demanda — apenas quando tab de leads ou dashboard é ativa
  const loadCRMData = useCallback(async () => {
    if (leads.length > 0) return // já carregado, não buscar novamente
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

      // Otmização de performance: usa Set para busca O(1) em vez de array.some O(N)
      const leadPhones = new Set(
        leadsList
          .map((l) => l.phone)
          .filter(Boolean)
          .map((p) => p.replace(/\D/g, ""))
      )

      driversSnap.forEach((doc) => {
        const dData = doc.data()
        const rawPhone = (dData.phone || "").replace(/\D/g, "")
        const exists = leadPhones.has(rawPhone)
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
  }, [leads.length])

  useEffect(() => {
    if (activeTab === "leads" || activeTab === "dashboard" || activeTab === "analytics" || activeTab === "frota") {
      loadCRMData()
    }
  }, [activeTab, loadCRMData])

  // Função para reproduzir um som de chime agradável e profissional via Web Audio API (100% autossuficiente)
  const playNotificationChime = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Primeiro tom chime
      const osc1 = ctx.createOscillator()
      const gain1 = ctx.createGain()
      osc1.type = "sine"
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime) // Nota Ré (D5)
      gain1.gain.setValueAtTime(0.12, ctx.currentTime)
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
      osc1.connect(gain1)
      gain1.connect(ctx.destination)
      osc1.start()
      osc1.stop(ctx.currentTime + 0.3)

      // Segundo tom chime (mais agudo e harmonioso, logo em seguida)
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.type = "sine"
      osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.15) // Nota Lá (A5)
      gain2.gain.setValueAtTime(0.12, ctx.currentTime + 0.15)
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45)
      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.start(ctx.currentTime + 0.15)
      osc2.stop(ctx.currentTime + 0.45)
    } catch (e) {
      console.warn("Áudio de notificação bloqueado pelo navegador:", e)
    }
  }, [])

  // Listener em tempo real para novos leads + permissão de Notificação Nativa (PWA / Navegador)
  useEffect(() => {
    // Solicita permissão para notificações nativas do navegador no desktop e mobile (PWA)
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission()
      }
    }

    const q = query(collection(db, "leads"))
    const unsub = onSnapshot(q, (snapshot) => {
      let hasNewLead = false
      let newLeadName = ""
      let newLeadVehicle = ""

      snapshot.docChanges().forEach((change) => {
        // Só notifica se for um documento adicionado
        if (change.type === "added") {
          const data = change.doc.data()
          const leadTime = data.createdAt?.seconds 
            ? data.createdAt.seconds * 1000 
            : new Date(data.createdAt || Date.now()).getTime()

          // Só notifica se for um lead criado APÓS a inicialização da página
          if (leadTime > mountTimeRef.current) {
            hasNewLead = true
            newLeadName = data.fullName || "Novo Lead"
            newLeadVehicle = data.vehicleInterest || "Veículo"
          }
        }
      })

      if (hasNewLead) {
        // 1. Toca chime de notificação
        playNotificationChime()

        // 2. Dispara Toast flutuante interno do painel
        success(`Novo Lead Recebido! 🚗`, `${newLeadName} está interessado em ${newLeadVehicle}.`)

        // 3. Dispara Notificação Nativa do Navegador / PWA
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          new Notification("Novo Lead Recebido! 🚗", {
            body: `${newLeadName} está interessado em ${newLeadVehicle}.`,
            icon: "/icon-light-32x32.png"
          })
        }

        // 4. Força atualização instantânea da tela/CRM para exibir o novo lead
        setLeads([]) // Limpa o estado para resetar o cache
        loadCRMData()
      }
    }, (err) => {
      console.warn("Erro no listener de leads em tempo real:", err)
    })

    return () => unsub()
  }, [success, loadCRMData, playNotificationChime])

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
                <div className="space-y-6 max-w-6xl">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Configurações & Mídia</h2>
                    <p className="text-xs text-slate-500 mt-0.5 font-semibold">Gerencie arquivos, imagens e mídias do site Michelines, além de integrações do painel comercial.</p>
                  </div>

                  <div className="space-y-2.5">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Central de Mídia Integrada (Supabase Storage)</h3>
                    <p className="text-xs text-slate-500 mb-4">Gerencie as imagens armazenadas no Supabase Storage. Você pode fazer upload de novas imagens, copiar as URLs públicas geradas com um clique para usar nos cadastros de carros ou banners, visualizar detalhes de tamanho e modificação, ou excluir arquivos permanentemente.</p>
                    <SupabaseMediaCenter />
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

// Wrap with AuthProvider and ToastProvider
export default function AdminPage() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AdminContent />
      </ToastProvider>
    </AuthProvider>
  )
}
