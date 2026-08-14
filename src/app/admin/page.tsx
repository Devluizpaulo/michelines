"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { signOut } from "@/lib/auth/supabase-auth"
import { listLeads, subscribeToNewLeads } from "@/lib/db/leads"
import { getSetting } from "@/lib/db/settings"

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
import { AdminBottomNav } from "@/components/admin/shared/AdminBottomNav"
import { DashboardOverview } from "@/components/admin/dashboard/DashboardOverview"
import { LeadBoard } from "@/components/admin/leads/LeadBoard"
import { LeadDrawer } from "@/components/admin/leads/LeadDrawer"
import { CampaignManager } from "@/components/admin/campaigns/CampaignManager"
import { LandingConfig } from "@/components/admin/landing/LandingConfig"
import { VehicleManager } from "@/components/admin/vehicles/VehicleManager"
import { OperationManager } from "@/components/admin/vehicles/OperationManager"
import { AnalyticsDashboard } from "@/components/admin/analytics/AnalyticsDashboard"
import { SupabaseMediaCenter } from "@/components/admin/shared/SupabaseMediaCenter"
import { UserManager } from "@/components/admin/users/UserManager"
import { TestimonialManager } from "@/components/admin/testimonials/TestimonialManager"
import { AgendaManager } from "@/components/admin/agenda/AgendaManager"
import { Shield } from "lucide-react"

// Ícone usado nas notificações nativas do painel (mesmo ícone do PWA admin)
const PWA_ICON_192 = "/icons/admin-192.png"

const VALID_TABS: TabId[] = [
  "dashboard", "leads", "campanhas", "landing", "frota", "analytics",
  "configuracoes", "usuarios", "operacao", "depoimentos", "agenda",
]

/**
 * Aba inicial a partir de `?tab=` — usado pelos atalhos do manifest do PWA
 * (ex.: /admin?tab=leads). O guard de permissão abaixo corrige a escolha caso o
 * papel do usuário não tenha acesso à aba pedida.
 */
function readInitialTab(): TabId {
  if (typeof window === "undefined") return "dashboard"
  const requested = new URLSearchParams(window.location.search).get("tab") as TabId | null
  return requested && VALID_TABS.includes(requested) ? requested : "dashboard"
}

// Inner component that uses auth context
function AdminContent() {
  const { adminUser, role, canAccess, loading: authLoading, profileError, user } = useAuth()
  const { success } = useToast()
  const mountTimeRef = useRef(Date.now())
  // IDs de leads já anunciados nesta sessão — guarda contra alerta duplicado
  // caso a inscrição do Realtime seja refeita (reconexão de rede, por exemplo).
  const announcedLeadIdsRef = useRef<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<TabId>("dashboard")
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  // Menu lateral do mobile — controlado aqui porque tanto o header quanto a
  // barra inferior ("Mais") precisam abri-lo.
  const [menuOpen, setMenuOpen] = useState(false)
  const [newLeadsQueue, setNewLeadsQueue] = useState<Lead[]>([])
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
    campaignBtnUrl: "",
    campaignImageUrl: "",
    campaignImagePosition: "right",
    campaignImageSize: "md",
    campaignImageAspectRatio: "video"
  })

  const router = useRouter()

  // Logout
  const handleLogout = async () => {
    try {
      await signOut()
      router.push("/login")
    } catch (e) {
      console.error(e)
    }
  }

  // Guard: sem sessão → login. Com sessão mas sem perfil válido, NÃO
  // redirecionamos (viraria ping-pong com o /login): mostramos o aviso abaixo.
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [authLoading, user, router])

  // Deep link dos atalhos do PWA (/admin?tab=leads). Aplicado após a hidratação
  // para não divergir do HTML renderizado no servidor.
  useEffect(() => {
    const initial = readInitialTab()
    if (initial !== "dashboard") setActiveTab(initial)
  }, [])

  // Guard: se a aba ativa deixou de ser acessível, cai para a primeira aba permitida
  useEffect(() => {
    if (!role || canAccess(activeTab)) return
    const fallback = (["dashboard", "leads", "agenda", "campanhas"] as TabId[]).find(canAccess)
    if (fallback && fallback !== activeTab) setActiveTab(fallback)
  }, [role, activeTab, canAccess])

  // Fetch landing settings — apenas quando a tab relevante é ativada
  const fetchLandingSettings = useCallback(async () => {
    try {
      const saved = await getSetting<LandingSettings>("landing")
      if (saved) {
        setLandingSettings(saved)
      }
    } catch (e) {
      console.warn("Não foi possível carregar as configurações da landing:", e)
    }
  }, [])

  useEffect(() => {
    if (activeTab === "campanhas" || activeTab === "landing") {
      fetchLandingSettings()
    }
  }, [activeTab, fetchLandingSettings])

  // Carrega leads sob demanda — apenas quando tab de leads ou dashboard é ativa.
  // Usa refs (e não `leads.length`) para o controle de "já carregado", de modo que a
  // identidade da função permaneça estável e não reinicie os efeitos que dependem dela.
  const crmLoadedRef = useRef(false)
  const crmLoadingRef = useRef(false)

  const loadCRMData = useCallback(async ({ force = false }: { force?: boolean } = {}) => {
    if (crmLoadingRef.current) return // requisição em voo, não duplicar
    if (crmLoadedRef.current && !force) return // já carregado
    crmLoadingRef.current = true
    try {
      setLoading(true)

      const [leadsList, driversRes] = await Promise.all([
        listLeads(),
        supabase.from("drivers").select("*").order("created_at", { ascending: false }),
      ])

      const todos: Lead[] = [...leadsList]

      // Set para busca O(1) — evita varrer a lista de leads por motorista
      const leadPhones = new Set(
        leadsList
          .map((l) => l.phone)
          .filter(Boolean)
          .map((p) => p.replace(/\D/g, ""))
      )

      // Frota legada: só entra quem ainda não virou lead (mesmo telefone)
      for (const d of driversRes.data ?? []) {
        const rawPhone = (d.phone || "").replace(/\D/g, "")
        if (leadPhones.has(rawPhone)) continue

        let leadStatus: Lead["status"] = "new"
        if (d.status === "active") leadStatus = "converted"
        if (d.status === "inactive") leadStatus = "lost"

        todos.push({
          id: d.id,
          fullName: d.full_name || "Sem nome",
          phone: d.phone || "",
          source: "Cadastro Site (Legado)",
          vehicleInterest: d.car_model || "Não especificado",
          status: leadStatus,
          notes: `Cadastro importado da frota legada. CPF: ${d.cpf || "Não informado"}.`,
          createdAt: d.created_at,
          contacted: d.status !== "pending",
          whatsappSent: false,
        } as Lead)
      }

      // Datas já vêm como ISO do Postgres — sem o .toDate() do Firestore
      todos.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )

      setLeads(todos)
      crmLoadedRef.current = true
    } catch (e) {
      console.error("Erro ao buscar dados do CRM:", e)
    } finally {
      crmLoadingRef.current = false
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab === "leads" || activeTab === "dashboard" || activeTab === "analytics" || activeTab === "frota" || activeTab === "campanhas") {
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

  // Handle lead update from the global shared drawer
  const handleLeadUpdated = useCallback((updatedLead: Lead) => {
    setLeads((prevLeads) => {
      const index = prevLeads.findIndex((l) => l.id === updatedLead.id)
      if (index !== -1) {
        const newList = [...prevLeads]
        newList[index] = updatedLead
        return newList
      }
      return prevLeads
    })
  }, [])

  const handleLeadUpdatedShared = useCallback((updatedLead: Lead) => {
    handleLeadUpdated(updatedLead)
    setSelectedLead((current) => current && current.id === updatedLead.id ? updatedLead : current)
  }, [handleLeadUpdated])

  // Periodic sound chime reminder while there is any unread lead in queue
  useEffect(() => {
    if (newLeadsQueue.length === 0) return

    const interval = setInterval(() => {
      playNotificationChime()
    }, 15000) // Repeat every 15 seconds

    return () => clearInterval(interval)
  }, [newLeadsQueue.length, playNotificationChime])

  // Listener em tempo real para novos leads + permissão de Notificação Nativa (PWA / Navegador)
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission()
      }
    }

    // Realtime do Postgres: chega apenas a linha inserida.
    // Diferente do onSnapshot do Firestore, que reemitia a coleção inteira como
    // "added" a cada reinscrição — origem do loop infinito que existia aqui.
    const unsub = subscribeToNewLeads((lead) => {
      // Guarda dupla: ignora o que já foi anunciado e o que é anterior ao mount
      if (announcedLeadIdsRef.current.has(lead.id)) return
      if (new Date(lead.createdAt).getTime() <= mountTimeRef.current) return
      announcedLeadIdsRef.current.add(lead.id)

      playNotificationChime()
      setNewLeadsQueue((prev) => [...prev, lead])

      success(`Novo Lead Recebido! 🚗`, `${lead.fullName} está interessado em ${lead.vehicleInterest}.`)

      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        new Notification("Novo Lead Recebido! 🚗", {
          body: `${lead.fullName} está interessado em ${lead.vehicleInterest}.`,
          icon: PWA_ICON_192,
        })
      }

      // Recarrega o CRM para reconciliar com a frota legada e o score.
      loadCRMData({ force: true })
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

  // Autenticado no Firebase, mas sem perfil administrativo utilizável.
  if (user && !adminUser) {
    const MESSAGES: Record<string, { title: string; body: string }> = {
      "no-profile": {
        title: "Acesso ainda não liberado",
        body: "Sua conta foi autenticada, mas ainda não possui perfil no painel. Peça a um super administrador para liberar seu acesso na aba Usuários.",
      },
      disabled: {
        title: "Conta desativada",
        body: "Seu perfil administrativo foi desativado. Entre em contato com um super administrador para reativá-lo.",
      },
      unavailable: {
        title: "Não foi possível verificar seu acesso",
        body: "Falha ao carregar seu perfil administrativo. Verifique sua conexão e tente novamente.",
      },
    }
    const msg = MESSAGES[profileError ?? "no-profile"] ?? MESSAGES["no-profile"]

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <Shield className="mx-auto mb-4 h-10 w-10 text-slate-300" />
          <h1 className="text-base font-black text-slate-900">{msg.title}</h1>
          <p className="mt-2 text-xs font-medium leading-relaxed text-slate-500">{msg.body}</p>
          <p className="mt-3 truncate text-[11px] font-semibold text-slate-400">{user.email}</p>
          <div className="mt-5 flex flex-col gap-2">
            {profileError === "unavailable" && (
              <button
                onClick={() => window.location.reload()}
                className="h-11 rounded-xl bg-sky-600 text-sm font-bold text-white transition-colors hover:bg-sky-700"
              >
                Tentar novamente
              </button>
            )}
            <button
              onClick={handleLogout}
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100"
            >
              Sair da conta
            </button>
          </div>
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
        menuOpen={menuOpen}
        onMenuOpenChange={setMenuOpen}
      />

      <div className="flex flex-1">

        {/* Sidebar */}
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
        />

        {/*
          min-w-0: sem isto, tabelas e cards largos esticam o flex item e fazem a
          página inteira rolar na horizontal no celular.
          pb-20 no mobile: espaço para a barra de navegação inferior fixa.
        */}
        <main className="min-w-0 flex-1 overflow-x-hidden bg-[#F8FAFC] p-4 pb-24 sm:p-6 md:p-8 md:pb-8 lg:p-10">

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
                  role={role || undefined}
                />
              )}

              {activeTab === "leads" && (
                <LeadBoard
                  leads={leads}
                  onLeadsChange={setLeads}
                  loading={loading}
                  onLeadClick={(lead) => {
                    setSelectedLead(lead)
                    setDrawerOpen(true)
                  }}
                />
              )}

              {activeTab === "campanhas" && (
                <CampaignManager
                  landingSettings={landingSettings}
                  onSettingsSaved={setLandingSettings}
                  leads={leads}
                />
              )}

              {activeTab === "landing" && (
                <LandingConfig
                  landingSettings={landingSettings}
                  onSettingsSaved={setLandingSettings}
                />
              )}

              {activeTab === "frota" && (
                <VehicleManager leads={leads} setActiveTab={setActiveTab} />
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

              {activeTab === "agenda" && (
                <AgendaManager />
              )}

              {activeTab === "depoimentos" && (
                <TestimonialManager />
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

      {/* Navegação inferior — apenas mobile */}
      <AdminBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenMenu={() => setMenuOpen(true)}
      />

      {/* Drawer do Lead Compartilhado */}
      <LeadDrawer
        lead={selectedLead}
        isOpen={drawerOpen}
        onClose={() => {
          setSelectedLead(null)
          setDrawerOpen(false)
        }}
        onLeadUpdated={handleLeadUpdatedShared}
      />

      {/* Modal de Alerta de Novo Lead Persistente (Aesthetics Wow) */}
      {newLeadsQueue.length > 0 && (() => {
        const currentAlertLead = newLeadsQueue[0]
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-md animate-fade-in">
            {/* Pulsing screen border for maximum attention */}
            <div className="absolute inset-0 border-[6px] border-red-500/30 animate-pulse pointer-events-none" />

            <div className="relative my-auto flex w-full max-w-md flex-col items-center overflow-hidden rounded-3xl border border-red-200 bg-white p-5 text-slate-800 shadow-2xl animate-slide-up sm:p-6">
              {/* Top glowing bar */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-pulse" />

              {/* Icon alert */}
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center border border-red-200 mt-2 mb-4 animate-bounce relative">
                <span className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
                <span className="text-3xl font-bold">🚗</span>
              </div>

              <span className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-50 px-3 py-1 rounded-full border border-red-100 mb-2">
                Alerta de Novo Lead
              </span>

              <h2 className="text-xl font-black text-slate-900 text-center mb-1">
                {currentAlertLead.fullName}
              </h2>
              <p className="text-xs text-slate-500 font-bold mb-5 flex items-center gap-1">
                <span>Interessado no táxi:</span>
                <span className="text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-black uppercase">
                  {currentAlertLead.vehicleInterest}
                </span>
              </p>

              {/* Lead info card list */}
              <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 space-y-3 text-xs leading-relaxed font-semibold text-slate-600">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/50">
                  <span className="text-slate-400">Origem:</span>
                  <span className="text-slate-800 font-bold">{currentAlertLead.source}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/50">
                  <span className="text-slate-400">Celular:</span>
                  <span className="text-slate-800 font-bold">{currentAlertLead.phone}</span>
                </div>
                {currentAlertLead.cpf && (
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200/50">
                    <span className="text-slate-400">CPF:</span>
                    <span className="text-slate-800 font-bold">{currentAlertLead.cpf}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Cadastrado em:</span>
                  <span className="text-slate-800 font-bold">
                    {currentAlertLead.createdAt?.toDate
                      ? currentAlertLead.createdAt.toDate().toLocaleTimeString("pt-BR")
                      : new Date().toLocaleTimeString("pt-BR")}
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-red-400 font-bold mb-6 flex items-center gap-1 animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                Aguardando confirmação de recebimento... ({newLeadsQueue.length} na fila)
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => {
                    setNewLeadsQueue((prev) => prev.slice(1))
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs h-11 rounded-xl transition-all border border-slate-200 active:scale-[0.98]"
                >
                  OK, Entendido
                </button>
                <button
                  onClick={() => {
                    setNewLeadsQueue((prev) => prev.slice(1))
                    setActiveTab("leads")
                    setSelectedLead(currentAlertLead)
                    setDrawerOpen(true)
                  }}
                  className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-extrabold text-xs h-11 rounded-xl transition-all shadow-md shadow-red-100 active:scale-[0.98]"
                >
                  Atender Agora
                </button>
              </div>
            </div>
          </div>
        )
      })()}
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
