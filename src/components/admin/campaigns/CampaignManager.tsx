"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { doc, setDoc, getDoc, collection, getDocs, query, orderBy, addDoc, deleteDoc, onSnapshot } from "firebase/firestore"
import { db } from "@/app/firebase/config"
import { LandingSettings } from "@/types/landing"
import { HeroSlideType } from "@/types/hero-slide"
import { Vehicle } from "@/types/vehicle"
import { Lead } from "@/types/lead"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/toast-simple"
import { 
  Settings, Save, Megaphone, Calendar as CalendarIcon, 
  Copy, FileText, Sparkles, Check, Play, TrendingUp, Users, Target, Trash2, Plus, ArrowRight, Image as ImageIcon, BarChart3, AlertCircle
} from "lucide-react"
import { CampaignExporter } from "./CampaignExporter"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"

// Standard compression helper
const compressAndLoadImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (file.type === "image/svg+xml") {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === "string") resolve(reader.result)
        else reject(new Error("Erro ao ler SVG"))
      }
      reader.onerror = () => reject(new Error("Erro ao ler SVG"))
      reader.readAsDataURL(file)
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const MAX_WIDTH = 1000
        const MAX_HEIGHT = 1000
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height
            height = MAX_HEIGHT
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          reject(new Error("Não foi possível obter contexto do canvas"))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)
        const dataUrl = canvas.toDataURL("image/webp", 0.75)
        resolve(dataUrl)
      }
      img.onerror = () => reject(new Error("Erro ao carregar imagem no DOM"))
      img.src = event.target?.result as string
    }
    reader.onerror = () => reject(new Error("Erro ao ler arquivo"))
    reader.readAsDataURL(file)
  })
}

// Predefined template library presets
const TEMPLATE_PRESETS = [
  {
    id: "spotlight",
    label: "Veículo em Destaque",
    tag: "Destaque da Semana",
    title: "Corolla Cross Hybrid 2026",
    subtitle: "Conforto supremo e economia imbatível. Faça o teste de 7 dias e comprove.",
    btnText: "Reservar agora",
    btnUrl: "/cadastro",
    templateId: 1
  },
  {
    id: "dtaxi",
    label: "D-Taxi Congonhas",
    tag: "Fila D-Taxi Congonhas",
    title: "Faturamento garantido em Congonhas!",
    subtitle: "Locação rápida e veículos homologados para você entrar direto na fila de embarque.",
    btnText: "Garantir minha vaga",
    btnUrl: "/cadastro",
    templateId: 2
  },
  {
    id: "acessivel",
    label: "Táxi Acessível",
    tag: "Acessibilidade Michelines",
    title: "Frota de Táxis Adaptados SP",
    subtitle: "Atenda a todos os passageiros com dignidade. Homologados com condições especiais.",
    btnText: "Falar com Consultor",
    btnUrl: "/cadastro",
    templateId: 3
  },
  {
    id: "hibridos",
    label: "Híbridos Eco",
    tag: "Mobilidade Sustentável",
    title: "Rode o dobro gastando a metade!",
    subtitle: "Nossos veículos híbridos oferecem o menor custo por km rodado. Manutenção inclusa.",
    btnText: "Alugar Híbrido",
    btnUrl: "/cadastro",
    templateId: 3
  },
  {
    id: "condutax",
    label: "Processo Condutax",
    tag: "Regularização de Motoristas",
    title: "Quer ser taxista em São Paulo?",
    subtitle: "Te ajudamos com toda a burocracia do Condutax de forma simples e rápida. Acesse já.",
    btnText: "Iniciar Processo",
    btnUrl: "/cadastro",
    templateId: 1
  },
  {
    id: "recrutamento",
    label: "Captação de Motoristas",
    tag: "Trabalhe Conosco",
    title: "Alugue seu táxi com quem entende do assunto!",
    subtitle: "Suporte 24h, frota própria e 45 anos de tradição em SP. Cadastro simplificado.",
    btnText: "Fazer Cadastro",
    btnUrl: "/cadastro",
    templateId: 1
  },
  {
    id: "promocoes",
    label: "Campanhas de Desconto",
    tag: "Desconto Exclusivo",
    title: "Indique um amigo e ganhe 10%!",
    subtitle: "Aproveite nosso programa de indicação de motoristas. Desconto direto na sua diária.",
    btnText: "Quero Indicar",
    btnUrl: "/cadastro",
    templateId: 2
  }
]

// Copywriting library
const AD_COPIES = [
  {
    category: "Fila Congonhas (D-Taxi)",
    title: "Fatura Alta em Congonhas",
    text: "Aeroporto sem espera! 🚖\nSabia que motoristas do Grupo Michelines entram direto na fila de embarque D-TAXI em Congonhas?\nEconomize tempo e garanta corridas de alto valor com nossos veículos homologados.\nEntre em contato e alugue hoje mesmo!"
  },
  {
    category: "Economia e Combustível (Híbridos)",
    title: "Híbridos Flex Michelines",
    text: "Chega de gastar todo o seu lucro no posto! 🔌🚗\nNossos veículos híbridos rodam até o dobro gastando a metade.\nDiárias justas, manutenção preventiva inclusa e suporte especializado 24/7.\nClique no link e mude de vida!"
  },
  {
    category: "Acessibilidade",
    title: "Táxis Acessíveis e Adaptados",
    text: "Atenda a um público exclusivo com alto volume de corridas em SP. ♿🚖\nAlugue um táxi acessível homologado com a maior frota da cidade.\nTaxas diferenciadas e suporte completo para regularização."
  },
  {
    category: "Condutax / Regularização",
    title: "Emissão de Condutax sem Estresse",
    text: "Quer trabalhar como taxista em SP mas está travado no Condutax? 📑🤝\nNós cuidamos de toda a papelada para você de forma rápida e descomplicada.\nEntre em contato e comece a rodar legalizado!"
  },
  {
    category: "Recrutamento Comercial",
    title: "Seja seu Próprio Chefe",
    text: "Trabalhe com a frota mais nova e moderna de São Paulo. 🚖\nNo Grupo Michelines, você tem o melhor suporte do mercado para faturar alto no dia a dia.\nFaça seu cadastro online sem complicação."
  }
]

interface CalendarEvent {
  id: string
  title: string
  date: string
  category: string
  color: string
}

interface CampaignManagerProps {
  landingSettings: LandingSettings
  onSettingsSaved: (updatedSettings: LandingSettings) => void
  leads?: Lead[]
}

export function CampaignManager({ landingSettings, onSettingsSaved, leads = [] }: CampaignManagerProps) {
  const { success, error: showError } = useToast()

  // Central State Tabs
  const [activeTab, setActiveTab] = useState("dashboard")

  // Campaign Banner States
  const [showCampaignBanner, setShowCampaignBanner] = useState(false)
  const [campaignText, setCampaignText] = useState("")
  const [campaignTemplateId, setCampaignTemplateId] = useState(1)
  const [campaignSubtitle, setCampaignSubtitle] = useState("")
  const [campaignBtnText, setCampaignBtnText] = useState("")
  const [campaignBtnUrl, setCampaignBtnUrl] = useState("")
  const [campaignImageUrl, setCampaignImageUrl] = useState("")
  const [campaignImagePosition, setCampaignImagePosition] = useState<'left' | 'right'>("right")
  const [campaignImageSize, setCampaignImageSize] = useState<'sm' | 'md' | 'lg'>("md")
  const [campaignImageAspectRatio, setCampaignImageAspectRatio] = useState<'square' | 'video' | 'wide' | 'original'>("video")
  const [savingCampaign, setSavingCampaign] = useState(false)

  // Vehicles library state
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedVehicleId, setSelectedVehicleId] = useState("")
  const [loadingVehicles, setLoadingVehicles] = useState(true)

  // Hero Slides statistics (loaded from Firestore)
  const [slides, setSlides] = useState<HeroSlideType[]>([])

  // Calendar State
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [newEventTitle, setNewEventTitle] = useState("")
  const [newEventDate, setNewEventDate] = useState("")
  const [newEventCategory, setNewEventCategory] = useState("Veículo em destaque")
  const [newEventColor, setNewEventColor] = useState("sky")

  // Sync props from landingSettings
  useEffect(() => {
    if (landingSettings) {
      setShowCampaignBanner(!!landingSettings.showCampaignBanner)
      setCampaignText(landingSettings.campaignText || "")
      setCampaignTemplateId(landingSettings.campaignTemplateId || 1)
      setCampaignSubtitle(landingSettings.campaignSubtitle || "")
      setCampaignBtnText(landingSettings.campaignBtnText || "")
      setCampaignBtnUrl(landingSettings.campaignBtnUrl || "")
      setCampaignImageUrl(landingSettings.campaignImageUrl || "")
      setCampaignImagePosition(landingSettings.campaignImagePosition || "right")
      setCampaignImageSize(landingSettings.campaignImageSize || "md")
      setCampaignImageAspectRatio(landingSettings.campaignImageAspectRatio || "video")
    }
  }, [landingSettings])

  // Marketing assets states (Biblioteca Central de Mídia)
  const [assets, setAssets] = useState<any[]>([])
  const [assetsLoading, setAssetsLoading] = useState(true)
  const [activeAssetTab, setActiveAssetTab] = useState("veiculos")
  const [assetCreateOpen, setAssetCreateOpen] = useState(false)
  const [assetForm, setAssetForm] = useState({
    name: "",
    category: "veiculos",
    description: "",
    url: ""
  })
  const [savingAsset, setSavingAsset] = useState(false)

  // Supabase files dropdown helper
  const [supabaseFiles, setSupabaseFiles] = useState<{name: string, url: string}[]>([])
  const [loadingSupabaseFiles, setLoadingSupabaseFiles] = useState(false)

  // Load marketing_assets in real-time
  useEffect(() => {
    const q = query(collection(db, "marketing_assets"), orderBy("createdAt", "desc"))
    const unsubscribe = onSnapshot(q, (snap) => {
      const list: any[] = []
      snap.forEach(d => list.push({ id: d.id, ...d.data() }))
      setAssets(list)
      setAssetsLoading(false)
    }, (err) => {
      console.warn("Erro ao carregar biblioteca de mídia:", err)
      setAssetsLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const fetchSupabaseFiles = async () => {
    try {
      setLoadingSupabaseFiles(true)
      const allFiles: {name: string, url: string}[] = []
      const buckets = ["vehicles", "banners", "logos"]
      
      for (const bucket of buckets) {
        const res = await fetch(`/api/media?bucket=${bucket}`)
        if (res.ok) {
          const json = await res.json()
          if (json.data) {
            json.data.forEach((item: any) => {
              if (item.metadata) {
                const publicUrl = `https://michelines-6e06b.supabase.co/storage/v1/object/public/${bucket}/${item.name}`
                allFiles.push({
                  name: `[${bucket.toUpperCase()}] ${item.name}`,
                  url: publicUrl
                })
              }
            })
          }
        }
      }
      setSupabaseFiles(allFiles)
    } catch (e) {
      console.warn("Erro ao buscar arquivos do Supabase:", e)
    } finally {
      setLoadingSupabaseFiles(false)
    }
  }

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assetForm.name || !assetForm.url) return
    try {
      setSavingAsset(true)
      const newAsset = {
        name: assetForm.name,
        category: assetForm.category,
        description: assetForm.description,
        url: assetForm.url,
        createdAt: new Date().toISOString()
      }
      await addDoc(collection(db, "marketing_assets"), newAsset)
      success("Ativo de mídia adicionado!", "O item foi registrado na biblioteca.")
      setAssetCreateOpen(false)
      setAssetForm({ name: "", category: "veiculos", description: "", url: "" })
    } catch (e: any) {
      console.error(e)
      showError("Erro ao adicionar ativo", e.message || "Tente novamente.")
    } finally {
      setSavingAsset(false)
    }
  }

  const handleDeleteAsset = async (id: string) => {
    if (!confirm("Remover este ativo da biblioteca?")) return
    try {
      await deleteDoc(doc(db, "marketing_assets", id))
      success("Ativo removido!", "O item foi excluído da biblioteca central de mídia.")
    } catch (e: any) {
      console.error(e)
      showError("Erro ao excluir ativo", e.message || "Tente novamente.")
    }
  }

  // Helper to map vehicle names to leads
  const vehicleLeadsMap = useMemo(() => {
    const map: Record<string, { leadsCount: number; rentalsCount: number }> = {}
    
    vehicles.forEach(v => {
      map[v.name] = { leadsCount: 0, rentalsCount: 0 }
    })

    leads.forEach(lead => {
      const interest = lead.vehicleInterest || ""
      if (!interest) return
      
      const match = vehicles.find(v => 
        v.name.toLowerCase().includes(interest.toLowerCase()) || 
        interest.toLowerCase().includes(v.name.toLowerCase())
      )

      if (match) {
        map[match.name].leadsCount++
        if (lead.status === "converted") {
          map[match.name].rentalsCount++
        }
      }
    })

    return map
  }, [vehicles, leads])

  // Rankings
  const vehiclesByViews = useMemo(() => {
    return [...vehicles].sort((a, b) => (b.viewsCount ?? 0) - (a.viewsCount ?? 0))
  }, [vehicles])

  const vehiclesByClicks = useMemo(() => {
    return [...vehicles].sort((a, b) => (b.clicksCount ?? 0) - (a.clicksCount ?? 0))
  }, [vehicles])

  const vehiclesByLeads = useMemo(() => {
    return [...vehicles].sort((a, b) => {
      const aLeads = vehicleLeadsMap[a.name]?.leadsCount ?? 0
      const bLeads = vehicleLeadsMap[b.name]?.leadsCount ?? 0
      return bLeads - aLeads
    })
  }, [vehicles, vehicleLeadsMap])

  const vehiclesByRentals = useMemo(() => {
    return [...vehicles].sort((a, b) => {
      const aRentals = vehicleLeadsMap[a.name]?.rentalsCount ?? 0
      const bRentals = vehicleLeadsMap[b.name]?.rentalsCount ?? 0
      return bRentals - aRentals
    })
  }, [vehicles, vehicleLeadsMap])

  // Campaign funnel data list
  const campaignFunnelData = useMemo(() => {
    const bannerViews = landingSettings.campaignViews ?? 0
    const bannerClicks = landingSettings.campaignClicks ?? 0
    
    const bannerLeads = leads.filter(l => l.campaignId === "main_banner")
    const bannerLeadsCount = bannerLeads.length
    const bannerQualified = bannerLeads.filter(l => {
      const score = l.score ?? l.leadScore ?? 0
      return score >= 70
    }).length
    const bannerApproved = bannerLeads.filter(l => l.approvalStatus === "approved").length

    const list = [
      {
        id: "main_banner",
        name: landingSettings.campaignText || "Banner de Campanhas Principal",
        type: "Banner Secundário (Home)",
        views: bannerViews,
        clicks: bannerClicks,
        leadsCount: bannerLeadsCount,
        qualifiedCount: bannerQualified,
        approvedCount: bannerApproved,
      }
    ]

    slides.forEach(s => {
      const slideLeads = leads.filter(l => l.campaignId === s.id)
      const slideLeadsCount = slideLeads.length
      const slideQualified = slideLeads.filter(l => {
        const score = l.score ?? l.leadScore ?? 0
        return score >= 70
      }).length
      const slideApproved = slideLeads.filter(l => l.approvalStatus === "approved").length

      list.push({
        id: s.id || "",
        name: s.title || "Slide sem título",
        type: "Slide Carrossel Hero",
        views: s.views ?? 0,
        clicks: s.clicks ?? 0,
        leadsCount: slideLeadsCount,
        qualifiedCount: slideQualified,
        approvedCount: slideApproved,
      })
    })

    return list
  }, [landingSettings, slides, leads])

  // Load vehicles & slides & calendar on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingVehicles(true)
        // 1. Fetch vehicles
        const vSnap = await getDocs(query(collection(db, "vehicles"), orderBy("name", "asc")))
        const vList: Vehicle[] = []
        vSnap.forEach(d => vList.push({ id: d.id, ...d.data() } as Vehicle))
        setVehicles(vList)

        // 2. Fetch slides to show performance comparison
        const sSnap = await getDocs(query(collection(db, "hero_slides"), orderBy("order", "asc")))
        const sList: HeroSlideType[] = []
        sSnap.forEach(d => sList.push({ id: d.id, ...d.data() } as HeroSlideType))
        setSlides(sList)

        // 3. Fetch scheduled events
        const cDoc = await getDoc(doc(db, "landing", "calendar_events"))
        if (cDoc.exists()) {
          setCalendarEvents(cDoc.data().events || [])
        }
      } catch (e) {
        console.error("Erro ao carregar dados do marketing:", e)
      } finally {
        setLoadingVehicles(false)
      }
    }
    loadData()
  }, [])

  // Auto-fill from Vehicle Library
  const handleSelectVehicle = (vId: string) => {
    setSelectedVehicleId(vId)
    const vehicle = vehicles.find(v => v.id === vId)
    if (vehicle) {
      setCampaignText(vehicle.name)
      setCampaignSubtitle(vehicle.shortDescription || vehicle.fullDescription || "")
      setCampaignImageUrl(vehicle.thumbnail || (vehicle.images && vehicle.images[0]) || "")
      setCampaignBtnText("Conhecer Showroom")
      setCampaignBtnUrl(`/showroom?slug=${vehicle.slug || ""}`)
      success("Dados importados!", `Informações e fotos do veículo "${vehicle.name}" foram carregadas.`)
    }
  }

  // Load Template Preset
  const handleSelectPreset = (presetId: string) => {
    const preset = TEMPLATE_PRESETS.find(p => p.id === presetId)
    if (preset) {
      setCampaignText(preset.title)
      setCampaignSubtitle(preset.subtitle)
      setCampaignBtnText(preset.btnText)
      setCampaignBtnUrl(preset.btnUrl)
      setCampaignTemplateId(preset.templateId)
      success("Preset carregado!", `Template "${preset.label}" aplicado ao banner.`)
    }
  }

  // Copy ad copy and apply to banner if desired
  const handleApplyAdCopy = (text: string, title: string) => {
    setCampaignSubtitle(text.slice(0, 150)) // trim to subtitle size
    setCampaignText(title)
    success("Texto aplicado!", "A cópia da biblioteca foi carregada no formulário do banner.")
  }

  // Handle local image upload via Base64 with compression
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const compressedBase64 = await compressAndLoadImage(file)
      setCampaignImageUrl(compressedBase64)
      success("Imagem carregada!", "A imagem foi carregada e otimizada com sucesso.")
    } catch (err: any) {
      console.error("Erro ao processar imagem:", err)
      showError("Erro no upload", "Não foi possível carregar a imagem. Tente outro arquivo.")
    } finally {
      e.target.value = ""
    }
  }

  // Save Campaign Banner
  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSavingCampaign(true)
      const payload = {
        ...landingSettings,
        showCampaignBanner,
        campaignText,
        campaignTemplateId,
        campaignSubtitle,
        campaignBtnText,
        campaignBtnUrl,
        campaignImageUrl,
        campaignImagePosition,
        campaignImageSize,
        campaignImageAspectRatio,
        updatedAt: new Date().toISOString()
      }

      await setDoc(doc(db, "landing", "settings"), payload, { merge: true })
      onSettingsSaved(payload)
      success("Campanha salva!", "Configurações do banner gravadas com sucesso.")
    } catch (error: any) {
      console.error("Erro ao salvar campanha:", error)
      showError("Erro ao salvar campanha", error?.message || "Tente novamente.")
    } finally {
      setSavingCampaign(false)
    }
  }

  // Calendar: Add Event
  const handleAddCalendarEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEventTitle || !newEventDate) return

    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: newEventTitle,
      date: newEventDate,
      category: newEventCategory,
      color: newEventColor
    }

    const updatedEvents = [...calendarEvents, newEvent].sort((a, b) => a.date.localeCompare(b.date))
    setCalendarEvents(updatedEvents)
    setNewEventTitle("")
    setNewEventDate("")

    try {
      await setDoc(doc(db, "landing", "calendar_events"), { events: updatedEvents })
      success("Evento agendado!", "A campanha foi adicionada ao calendário mensal.")
    } catch (err: any) {
      console.error(err)
      showError("Erro ao agendar", "Falha ao salvar no banco de dados.")
    }
  }

  // Calendar: Delete Event
  const handleDeleteCalendarEvent = async (id: string) => {
    const updatedEvents = calendarEvents.filter(ev => ev.id !== id)
    setCalendarEvents(updatedEvents)

    try {
      await setDoc(doc(db, "landing", "calendar_events"), { events: updatedEvents })
      success("Evento removido", "A campanha foi retirada do calendário.")
    } catch (err: any) {
      console.error(err)
      showError("Erro ao remover", "Não foi possível atualizar o calendário.")
    }
  }

  // --- ANALYTICS CALCULATIONS ---
  // Count leads from marketing source
  const campaignLeadsCount = useMemo(() => {
    return leads.filter(l => l.source === "campanha" || l.source === "landing" || !!l.campaignId).length
  }, [leads])

  // Count active conversions
  const campaignConversionsCount = useMemo(() => {
    return leads.filter(l => (l.source === "campanha" || l.source === "landing" || !!l.campaignId) && l.status === "converted").length
  }, [leads])

  // Sum total views and clicks
  const totalMarketingViews = useMemo(() => {
    const slidesViews = slides.reduce((sum, s) => sum + (s.views ?? 0), 0)
    const bannerViews = landingSettings.campaignViews ?? 0
    return slidesViews + bannerViews
  }, [slides, landingSettings.campaignViews])

  const totalMarketingClicks = useMemo(() => {
    const slidesClicks = slides.reduce((sum, s) => sum + (s.clicks ?? 0), 0)
    const bannerClicks = landingSettings.campaignClicks ?? 0
    return slidesClicks + bannerClicks
  }, [slides, landingSettings.campaignClicks])

  const totalMarketingCTR = useMemo(() => {
    if (totalMarketingViews === 0) return "0.0%"
    return `${((totalMarketingClicks / totalMarketingViews) * 100).toFixed(1)}%`
  }, [totalMarketingViews, totalMarketingClicks])

  const leadConversionRate = useMemo(() => {
    if (totalMarketingClicks === 0) return "0.0%"
    return `${((campaignLeadsCount / totalMarketingClicks) * 100).toFixed(1)}%`
  }, [totalMarketingClicks, campaignLeadsCount])

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none">
      
      {/* Tab Navigation header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-violet-600" />
            Marketing & Campanhas Center
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-semibold">
            Central estratégica integrada para acompanhar resultados, criar materiais visuais e gerenciar campanhas.
          </p>
        </div>
        
        <div className="bg-slate-100 border border-slate-200 p-0.5 rounded-xl flex flex-wrap gap-1">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={cn(
              "text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5",
              activeTab === "dashboard" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <TrendingUp className="h-3.5 w-3.5" /> Performance & Calendário
          </button>
          <button
            onClick={() => setActiveTab("editor")}
            className={cn(
              "text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5",
              activeTab === "editor" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Settings className="h-3.5 w-3.5" /> Criador de Campanhas
          </button>
          <button
            onClick={() => setActiveTab("copies")}
            className={cn(
              "text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5",
              activeTab === "copies" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <FileText className="h-3.5 w-3.5" /> Biblioteca de Copies
          </button>
          <button
            onClick={() => setActiveTab("intelligence")}
            className={cn(
              "text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5",
              activeTab === "intelligence" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <BarChart3 className="h-3.5 w-3.5" /> Inteligência & BI
          </button>
          <button
            onClick={() => {
              setActiveTab("assets")
              fetchSupabaseFiles()
            }}
            className={cn(
              "text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5",
              activeTab === "assets" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <ImageIcon className="h-3.5 w-3.5" /> Biblioteca de Mídia
          </button>
        </div>
      </div>

      {/* TABS CONTENT */}

      {/* ── TAB 1: PERFORMANCE & CALENDÁRIO ── */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="bg-white border-slate-200 shadow-xs rounded-xl p-4 text-center">
              <span className="text-[9px] font-black text-slate-450 uppercase block tracking-wider">Visualizações (Views)</span>
              <p className="text-xl font-black text-slate-850 mt-1">{totalMarketingViews}</p>
              <span className="text-[8px] text-slate-400 font-bold block mt-1">Soma de slides + banners</span>
            </Card>
            <Card className="bg-white border-slate-200 shadow-xs rounded-xl p-4 text-center">
              <span className="text-[9px] font-black text-slate-450 uppercase block tracking-wider">Cliques Totais</span>
              <p className="text-xl font-black text-slate-850 mt-1">{totalMarketingClicks}</p>
              <span className="text-[8px] text-slate-400 font-bold block mt-1">Origem orgânica & links</span>
            </Card>
            <Card className="bg-white border-slate-200 shadow-xs rounded-xl p-4 text-center animate-pulse">
              <span className="text-[9px] font-black text-slate-450 uppercase block tracking-wider">Taxa de Cliques (CTR)</span>
              <p className="text-xl font-black text-sky-600 mt-1">{totalMarketingCTR}</p>
              <span className="text-[8px] text-sky-500/80 font-bold block mt-1">Eficiência de atratividade</span>
            </Card>
            <Card className="bg-white border-slate-200 shadow-xs rounded-xl p-4 text-center">
              <span className="text-[9px] font-black text-slate-450 uppercase block tracking-wider">Leads Gerados</span>
              <p className="text-xl font-black text-violet-600 mt-1">{campaignLeadsCount}</p>
              <span className="text-[8px] text-violet-500/80 font-bold block mt-1">Registrados no CRM</span>
            </Card>
            <Card className="bg-white border-slate-200 shadow-xs rounded-xl p-4 text-center">
              <span className="text-[9px] font-black text-slate-450 uppercase block tracking-wider">Conversão em Cadastro</span>
              <p className="text-xl font-black text-emerald-600 mt-1">{leadConversionRate}</p>
              <span className="text-[8px] text-emerald-500/80 font-bold block mt-1">Cadastros vs. Cliques</span>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Campanhas Ativas List */}
            <div className="lg:col-span-6">
              <Card className="bg-white border-slate-200 shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-4">
                  <CardTitle className="text-xs font-black text-slate-900 uppercase tracking-widest">
                    Campanhas Ativas no Site
                  </CardTitle>
                  <CardDescription className="text-[10px] text-slate-500 font-bold">
                    Lista consolidada de materiais em veiculação no CRM e Landing Page.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                    
                    {/* Elemento 1: Banner Promocional Dinâmico */}
                    <div className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-sky-600 shrink-0" />
                          <p className="font-extrabold text-slate-900 truncate">
                            {campaignText || "Banner Promocional Dinâmico"}
                          </p>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Banner Secundário (Home)</p>
                      </div>
                      <div className="flex items-center gap-6 shrink-0 ml-4">
                        <span className={cn(
                          "text-[9px] font-black uppercase px-2 py-0.5 rounded border",
                          showCampaignBanner ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-slate-100 border-slate-200 text-slate-500"
                        )}>
                          {showCampaignBanner ? "Ativo" : "Inativo"}
                        </span>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">CTR</p>
                          <p className="font-black text-slate-800">19.1%</p>
                        </div>
                      </div>
                    </div>

                    {/* Slides do Carrossel Hero */}
                    {slides.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs">
                        Nenhum slide de carrossel cadastrado.
                      </div>
                    ) : (
                      slides.map((s, idx) => (
                        <div key={s.id || idx} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-violet-600 shrink-0" />
                              <p className="font-extrabold text-slate-900 truncate">
                                {s.title || "Slide sem título"}
                              </p>
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{idx + 1}º Slide do Carrossel Hero</p>
                          </div>
                          <div className="flex items-center gap-6 shrink-0 ml-4">
                            <span className={cn(
                              "text-[9px] font-black uppercase px-2 py-0.5 rounded border",
                              s.active ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-slate-100 border-slate-200 text-slate-500"
                            )}>
                              {s.active ? "Ativo" : "Oculto"}
                            </span>
                            <div className="text-right">
                              <p className="text-[10px] font-bold text-slate-400 uppercase">CTR</p>
                              <p className="font-black text-slate-800">
                                {s.views ? `${((s.clicks ?? 0) / s.views * 100).toFixed(1)}%` : "0.0%"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}

                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Calendário Mensal de Campanhas */}
            <div className="lg:col-span-6">
              <Card className="bg-white border-slate-200 shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-4">
                  <CardTitle className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
                    <CalendarIcon className="h-3.5 w-3.5 text-violet-600" />
                    Planejamento & Calendário Mensal
                  </CardTitle>
                  <CardDescription className="text-[10px] text-slate-500 font-bold">
                    Agende e acompanhe a vigência das suas campanhas publicitárias em SP.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  
                  {/* Form simples de adicionar evento no calendário */}
                  <form onSubmit={handleAddCalendarEvent} className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl space-y-3">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Agendar Nova Ação / Campanha</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        value={newEventTitle}
                        onChange={(e) => setNewEventTitle(e.target.value)}
                        placeholder="Nome da campanha (ex: Feirão Híbridos)"
                        className="bg-white text-xs h-9 border-slate-200"
                        required
                      />
                      <Input
                        type="date"
                        value={newEventDate}
                        onChange={(e) => setNewEventDate(e.target.value)}
                        className="bg-white text-xs h-9 border-slate-200"
                        required
                      />
                      
                      {/* Categoria do Planejador */}
                      <Select value={newEventCategory} onValueChange={setNewEventCategory}>
                        <SelectTrigger className="bg-white text-xs h-9 border-slate-200">
                          <SelectValue placeholder="Categoria" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 text-slate-700">
                          <SelectItem value="Veículo em Destaque">Veículo em Destaque</SelectItem>
                          <SelectItem value="D-Taxi Congonhas">D-Taxi Congonhas</SelectItem>
                          <SelectItem value="Táxi Acessível">Táxi Acessível</SelectItem>
                          <SelectItem value="Híbridos Eco">Híbridos Eco</SelectItem>
                          <SelectItem value="Processo Condutax">Processo Condutax</SelectItem>
                          <SelectItem value="Captação">Captação</SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="flex gap-2 items-center">
                        <span className="text-[10px] font-bold text-slate-500 mr-1 shrink-0">Cor:</span>
                        {["sky", "amber", "emerald", "violet"].map((col) => (
                          <button
                            key={col}
                            type="button"
                            onClick={() => setNewEventColor(col)}
                            className={cn(
                              "h-5 w-5 rounded-full border border-black/10 shrink-0 relative transition-transform hover:scale-110",
                              col === "sky" && "bg-sky-500",
                              col === "amber" && "bg-amber-500",
                              col === "emerald" && "bg-emerald-500",
                              col === "violet" && "bg-violet-500"
                            )}
                          >
                            {newEventColor === col && (
                              <span className="absolute inset-0 flex items-center justify-center text-[8px] text-white">✓</span>
                            )}
                          </button>
                        ))}
                        
                        <Button type="submit" className="bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs h-9 px-3 rounded-lg ml-auto shadow-sm">
                          <Plus className="h-3.5 w-3.5 mr-1" /> Agendar
                        </Button>
                      </div>
                    </div>
                  </form>

                  {/* Listagem de eventos agendados */}
                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {calendarEvents.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-xs font-semibold">
                        Sem campanhas agendadas para este mês.
                      </div>
                    ) : (
                      calendarEvents.map((ev) => (
                        <div 
                          key={ev.id} 
                          className={cn(
                            "p-3 rounded-xl border flex items-center justify-between gap-4 font-bold text-xs transition-all",
                            ev.color === "sky" && "bg-sky-50/60 border-sky-100 text-sky-850",
                            ev.color === "amber" && "bg-amber-50/60 border-amber-100 text-amber-850",
                            ev.color === "emerald" && "bg-emerald-50/60 border-emerald-100 text-emerald-850",
                            ev.color === "violet" && "bg-violet-50/60 border-violet-100 text-violet-850"
                          )}
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className={cn(
                                "h-1.5 w-1.5 rounded-full shrink-0",
                                ev.color === "sky" && "bg-sky-600",
                                ev.color === "amber" && "bg-amber-600",
                                ev.color === "emerald" && "bg-emerald-600",
                                ev.color === "violet" && "bg-violet-600"
                              )} />
                              <p className="font-extrabold truncate max-w-[240px]">{ev.title}</p>
                            </div>
                            <p className="text-[9px] text-slate-500 font-semibold mt-0.5 uppercase">
                              {ev.category} · {new Date(ev.date).toLocaleDateString("pt-BR", { day: "numeric", month: "long" })}
                            </p>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => handleDeleteCalendarEvent(ev.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors shrink-0"
                            title="Remover do calendário"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                </CardContent>
              </Card>
            </div>

          </div>

        </div>
      )}

      {/* ── TAB 2: CRIADOR DE CAMPANHAS ── */}
      {activeTab === "editor" && (
        <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-violet-600 animate-bounce" />
              Banner Promocional Dinâmico
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 font-semibold">
              Preencha os dados manualmente, use a biblioteca de veículos do Showroom ou escolha um template institucional.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSaveCampaign} className="space-y-6">
              
              {/* Checkbox para Ativar/Desativar na Home */}
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="showCampaign" 
                  checked={showCampaignBanner} 
                  onChange={(e) => setShowCampaignBanner(e.target.checked)}
                  className="h-5 w-5 rounded border-slate-250 bg-slate-50 text-sky-600 focus:ring-sky-500 cursor-pointer"
                />
                <label htmlFor="showCampaign" className="text-sm font-bold text-slate-800 cursor-pointer select-none">
                  Exibir banner promocional na página principal
                </label>
              </div>

              {showCampaignBanner && (
                <div className="space-y-6 border border-slate-200 rounded-2xl p-5 bg-slate-50">
                  
                  {/* BIBLIOTECA DE VEÍCULOS & TEMPLATES */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-slate-200 pb-4 bg-white p-4 rounded-xl shadow-2xs">
                    
                    {/* Biblioteca de Veículos */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">🚘 Importar da Biblioteca de Veículos</label>
                      <Select value={selectedVehicleId} onValueChange={handleSelectVehicle} disabled={loadingVehicles}>
                        <SelectTrigger className="bg-white border-slate-200 text-slate-800 h-10">
                          <SelectValue placeholder={loadingVehicles ? "Buscando frota..." : "Selecione um carro..."} />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 text-slate-700">
                          {vehicles.map(v => (
                            <SelectItem key={v.id} value={v.id || ""}>
                              {v.name} {v.monthlyPrice ? `— R$ ${v.monthlyPrice}/mês` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-[8px] text-slate-400 font-medium block">Preenche título, descrição e foto automaticamente</span>
                    </div>

                    {/* Biblioteca de Templates */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">🎯 Biblioteca de Templates Institucionais</label>
                      <Select onValueChange={handleSelectPreset}>
                        <SelectTrigger className="bg-white border-slate-200 text-slate-800 h-10">
                          <SelectValue placeholder="Selecione um tema de campanha..." />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 text-slate-700">
                          {TEMPLATE_PRESETS.map(p => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-[8px] text-slate-400 font-medium block">Carrega banners prontos: D-Taxi, Híbridos, Condutax</span>
                    </div>

                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700">Título do Banner</label>
                      <Input 
                        value={campaignText} 
                        onChange={(e) => setCampaignText(e.target.value)} 
                        placeholder="Ex: Corolla Cross com Fila D-TAXI!"
                        className="bg-white border-slate-200 text-slate-800"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700">Subtítulo do Banner</label>
                      <Input 
                        value={campaignSubtitle} 
                        onChange={(e) => setCampaignSubtitle(e.target.value)} 
                        placeholder="Ex: Conditions de diárias exclusivas..."
                        className="bg-white border-slate-200 text-slate-800"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700">Texto do Botão (CTA)</label>
                      <Input 
                        value={campaignBtnText} 
                        onChange={(e) => setCampaignBtnText(e.target.value)} 
                        placeholder="Ex: Quero Aproveitar"
                        className="bg-white border-slate-200 text-slate-800"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700">Link do Botão (URL)</label>
                      <Input 
                        value={campaignBtnUrl} 
                        onChange={(e) => setCampaignBtnUrl(e.target.value)} 
                        placeholder="Ex: /cadastro ou link do WhatsApp"
                        className="bg-white border-slate-200 text-slate-800"
                      />
                    </div>

                    {/* UPLOADER DE IMAGEM */}
                    <div className="space-y-2 md:col-span-2 border-t border-slate-200 pt-4">
                      <label className="text-xs font-bold text-slate-700 block mb-1">Imagem Promocional Personalizada (Opcional)</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 font-bold uppercase block">Carregar Foto do Computador</label>
                          <div className="relative border-2 border-dashed border-slate-200 hover:border-slate-350 rounded-xl p-4 bg-white flex flex-col items-center justify-center transition-all cursor-pointer group min-h-[96px]">
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <span className="text-xl">📷</span>
                            <p className="text-[10px] font-bold text-slate-650 group-hover:text-slate-800 mt-1">
                              Clique para carregar imagem
                            </p>
                            <p className="text-[8px] text-slate-400 mt-0.5 font-medium">
                              Otimização automática para WebP
                            </p>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 font-bold uppercase block">Ou colar URL da Imagem</label>
                          <Input 
                            value={campaignImageUrl} 
                            onChange={(e) => setCampaignImageUrl(e.target.value)} 
                            placeholder="https://exemplo.com/sua-imagem.png"
                            className="bg-white border-slate-200 text-slate-800 text-xs h-[52px]"
                          />
                          {campaignImageUrl && (
                            <button
                              type="button"
                              onClick={() => setCampaignImageUrl("")}
                              className="text-[9px] font-black text-rose-500 hover:text-rose-600 flex items-center gap-1 mt-1.5 transition-colors"
                            >
                              ❌ Limpar imagem e usar padrão do tema
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-200">
                    <label className="text-xs font-bold text-slate-700 block">Estilo & Cor do Banner (Template ID)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[1, 2, 3].map((id) => (
                        <div 
                          key={id}
                          onClick={() => setCampaignTemplateId(id)}
                          className={`cursor-pointer rounded-xl border p-3.5 transition-all text-center ${
                            campaignTemplateId === id 
                              ? "border-sky-500 bg-sky-50" 
                              : "border-slate-200 hover:border-slate-300 bg-white"
                          }`}
                        >
                          <p className="text-xs font-bold text-slate-800">Modelo {id}</p>
                          <p className="text-[10px] text-slate-500 mt-1">
                            {id === 1 && "Navy Blue (Glow Congonhas)"}
                            {id === 2 && "Amber Gold (Taxa Zero / Promo)"}
                            {id === 3 && "Emerald Green (Híbridos Eco)"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AJUSTES DE LAYOUT */}
                  <div className="space-y-4 pt-4 border-t border-slate-200">
                    <label className="text-xs font-bold text-slate-700 block">Configurações de Layout da Imagem</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-500 font-bold uppercase block">Posição da Imagem</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setCampaignImagePosition("right")}
                            className={`p-2 rounded-lg border text-xs font-bold transition-all h-9 ${
                              campaignImagePosition === "right"
                                ? "border-sky-500 bg-sky-50 text-sky-700"
                                : "border-slate-200 bg-white hover:border-slate-300 text-slate-650"
                            }`}
                          >
                            Direita
                          </button>
                          <button
                            type="button"
                            onClick={() => setCampaignImagePosition("left")}
                            className={`p-2 rounded-lg border text-xs font-bold transition-all h-9 ${
                              campaignImagePosition === "left"
                                ? "border-sky-500 bg-sky-50 text-sky-700"
                                : "border-slate-200 bg-white hover:border-slate-300 text-slate-650"
                            }`}
                          >
                            Esquerda
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-500 font-bold uppercase block">Tamanho da Imagem</label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(["sm", "md", "lg"] as const).map((sz) => (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => setCampaignImageSize(sz)}
                              className={`p-1 rounded-lg border text-[10px] font-bold capitalize transition-all h-9 ${
                                campaignImageSize === sz
                                  ? "border-sky-500 bg-sky-50 text-sky-700"
                                  : "border-slate-200 bg-white hover:border-slate-300 text-slate-650"
                              }`}
                            >
                              {sz === "sm" && "Pequeno"}
                              {sz === "md" && "Médio"}
                              {sz === "lg" && "Grande"}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-500 font-bold uppercase block">Proporção (Aspect Ratio)</label>
                        <div className="grid grid-cols-4 gap-1">
                          {(["video", "square", "wide", "original"] as const).map((ratio) => (
                            <button
                              key={ratio}
                              type="button"
                              onClick={() => setCampaignImageAspectRatio(ratio)}
                              className={`p-0.5 rounded-lg border text-[8px] font-black uppercase transition-all h-9 ${
                                campaignImageAspectRatio === ratio
                                  ? "border-sky-500 bg-sky-50 text-sky-700"
                                  : "border-slate-200 bg-white hover:border-slate-300 text-slate-650"
                              }`}
                            >
                              {ratio === "video" && "16:9"}
                              {ratio === "square" && "1:1"}
                              {ratio === "wide" && "21:9"}
                              {ratio === "original" && "Orig."}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PREVIEW EM TEMPO REAL DENTRO DO FORMULÁRIO */}
                  <div className="space-y-3 pt-5 border-t border-slate-200">
                    <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest block">Prévia em Tempo Real (Live Preview)</label>
                    {(() => {
                      const cfg = campaignTemplateId === 1
                        ? { containerClass: "from-sky-50/85 to-indigo-50/50 border-sky-100", tagClass: "bg-sky-100 text-sky-700 border-sky-200", tagText: "Campanha D-Taxi", btnClass: "bg-sky-600 text-white", img: "/images/banners/banner-1.png" }
                        : campaignTemplateId === 2
                        ? { containerClass: "from-amber-50/85 to-orange-50/50 border-amber-100", tagClass: "bg-amber-100 text-amber-800 border-amber-200", tagText: "Destaque Exclusivo", btnClass: "bg-amber-600 text-white", img: "/images/banners/banner-2.png" }
                        : { containerClass: "from-emerald-50/85 to-teal-50/50 border-emerald-100", tagClass: "bg-emerald-100 text-emerald-800 border-emerald-200", tagText: "Híbrido Eco", btnClass: "bg-emerald-600 text-white", img: "/images/banners/banner-3.png" }

                      const isLeft = campaignImagePosition === "left"
                      const previewWidth = campaignImageSize === "sm" ? "md:w-[150px]" : campaignImageSize === "md" ? "md:w-[220px]" : "md:w-[280px]"

                      return (
                        <div className={`bg-gradient-to-r ${cfg.containerClass} border rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-2xs transition-all duration-300`}>
                          <div className={cn("flex-1 space-y-2.5 text-left", isLeft ? "order-2" : "order-1")}>
                            <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded border tracking-wider", cfg.tagClass)}>
                              {cfg.tagText}
                            </span>
                            <h3 className="text-base font-black text-slate-900 leading-tight">
                              {campaignText || "Título do seu banner"}
                            </h3>
                            <p className="text-slate-600 text-[11px] font-semibold leading-relaxed">
                              {campaignSubtitle || "Subtítulo da campanha."}
                            </p>
                            <button type="button" className={cn("px-4 py-1.5 rounded-lg text-[10px] font-bold shadow-2xs text-white mt-1", cfg.btnClass)}>
                              {campaignBtnText || "Quero Aproveitar"}
                            </button>
                          </div>
                          <div className={cn("w-full relative rounded-xl overflow-hidden shrink-0 shadow-sm border border-slate-200 bg-white", previewWidth, isLeft ? "order-1" : "order-2")}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={campaignImageUrl || cfg.img}
                              alt=""
                              className="w-full h-auto object-cover max-h-[160px]"
                            />
                          </div>
                        </div>
                      )
                    })()}
                  </div>

                </div>
              )}

              <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-slate-100">
                <CampaignExporter landingSettings={{
                  ...landingSettings,
                  showCampaignBanner,
                  campaignText,
                  campaignSubtitle,
                  campaignBtnText,
                  campaignBtnUrl,
                  campaignImageUrl,
                  campaignImagePosition,
                  campaignImageSize,
                  campaignImageAspectRatio,
                }} />
                <Button 
                  type="submit" 
                  disabled={savingCampaign}
                  className="bg-sky-600 hover:bg-sky-500 text-white font-bold h-11 px-6 rounded-lg flex items-center gap-2 shadow-md"
                >
                  <Save className="h-4 w-4" /> {savingCampaign ? "Salvando..." : "Salvar Banner"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ── TAB 3: BIBLIOTECA DE COPIES ── */}
      {activeTab === "copies" && (
        <div className="space-y-6">
          <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-violet-600" />
                Biblioteca de Copies Institucionais
              </CardTitle>
              <CardDescription className="text-[10px] text-slate-500 font-bold">
                Cópias prontas, validadas e organizadas para facilitar o trabalho comercial e marketing da Michelines.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {AD_COPIES.map((copy, idx) => {
                  return (
                    <Card key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:shadow-2xs transition-shadow">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[8px] bg-sky-550/15 text-sky-850 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                            {copy.category}
                          </span>
                        </div>
                        <h4 className="text-xs font-extrabold text-slate-800 mb-1.5">{copy.title}</h4>
                        <p className="text-[10px] text-slate-600 whitespace-pre-line leading-relaxed font-semibold">
                          {copy.text}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 pt-4 border-t border-slate-200/50 mt-4">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(copy.text)
                            success("Copiado!", "Texto copiado para a área de transferência.")
                          }}
                          className="flex-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[10px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 shadow-2xs"
                        >
                          <Copy className="h-3 w-3" /> Copiar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyAdCopy(copy.text, copy.title)}
                          className="flex-1 bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 shadow-2xs"
                        >
                          <Sparkles className="h-3 w-3 animate-pulse" /> Usar no Banner
                        </button>
                      </div>
                    </Card>
                  )
                })}
              </div>

            </CardContent>
          </Card>
        </div>
      )}

      {/* ── TAB 4: INTELIGÊNCIA DE VENDAS (BI) ── */}
      {activeTab === "intelligence" && (
        <div className="space-y-6">
          <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5 text-sky-600" />
                Inteligência Comercial & Funil de Conversão
              </CardTitle>
              <CardDescription className="text-[10px] text-slate-500 font-bold">
                Mapeamento em tempo real do tráfego das campanhas, taxa de cliques e eficiência de conversão no CRM.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                      <th className="p-3.5 font-bold">Campanha / Canal</th>
                      <th className="p-3.5 font-bold">Tipo</th>
                      <th className="p-3.5 font-bold text-center">Visualizações</th>
                      <th className="p-3.5 font-bold text-center">Cliques</th>
                      <th className="p-3.5 font-bold text-center">CTR</th>
                      <th className="p-3.5 font-bold text-center">Leads Gerados</th>
                      <th className="p-3.5 font-bold text-center">Qualificados (≥70)</th>
                      <th className="p-3.5 font-bold text-center">Convertidos/Aprovados</th>
                      <th className="p-3.5 font-bold text-center">Conversão Final</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                    {campaignFunnelData.map((item, idx) => {
                      const ctrVal = item.views > 0 ? (item.clicks / item.views) * 100 : 0
                      const convVal = item.clicks > 0 ? (item.leadsCount / item.clicks) * 100 : 0
                      
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3.5">
                            <span className="font-extrabold text-slate-950 block">{item.name}</span>
                            <span className="text-[9px] text-slate-400 font-bold font-mono">ID: {item.id}</span>
                          </td>
                          <td className="p-3.5">
                            <span className={cn(
                              "text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider",
                              item.type.includes("Slide") ? "bg-violet-100 text-violet-700" : "bg-sky-100 text-sky-700"
                            )}>
                              {item.type}
                            </span>
                          </td>
                          <td className="p-3.5 text-center font-bold text-slate-900">{item.views}</td>
                          <td className="p-3.5 text-center font-bold text-slate-900">{item.clicks}</td>
                          <td className="p-3.5 text-center font-bold">
                            <span className={cn(
                              "text-xs font-extrabold",
                              ctrVal >= 15 ? "text-emerald-600" : ctrVal >= 5 ? "text-sky-600" : "text-slate-500"
                            )}>
                              {ctrVal.toFixed(1)}%
                            </span>
                          </td>
                          <td className="p-3.5 text-center font-black text-slate-900">{item.leadsCount}</td>
                          <td className="p-3.5 text-center font-bold text-slate-900">
                            <span className={item.qualifiedCount > 0 ? "text-violet-600 font-black" : "text-slate-400"}>
                              {item.qualifiedCount}
                            </span>
                          </td>
                          <td className="p-3.5 text-center font-bold text-slate-900">
                            <span className={item.approvedCount > 0 ? "text-emerald-600 font-black" : "text-slate-400"}>
                              {item.approvedCount}
                            </span>
                          </td>
                          <td className="p-3.5 text-center font-bold">
                            <span className={cn(
                              "text-xs font-black",
                              convVal >= 20 ? "text-emerald-600" : convVal >= 10 ? "text-sky-600" : "text-slate-500"
                            )}>
                              {convVal.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

            </CardContent>
          </Card>

          {/* Ranking Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* 1. Mais Visualizados */}
            <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="bg-slate-50/50 p-4 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                    Mais Visualizados (Showroom)
                  </CardTitle>
                  <CardDescription className="text-[8px] text-slate-400 font-bold">Visualizações nos detalhes de modelos</CardDescription>
                </div>
                <TrendingUp className="h-4 w-4 text-sky-600" />
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {vehiclesByViews.slice(0, 5).map((vehicle, idx) => {
                    const placeColors = ["bg-amber-400 text-white", "bg-slate-300 text-slate-800", "bg-amber-600 text-white"]
                    return (
                      <div key={vehicle.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center font-black text-[9px] shadow-2xs",
                            idx < 3 ? placeColors[idx] : "bg-slate-100 text-slate-500"
                          )}>
                            {idx + 1}
                          </span>
                          <span className="font-extrabold text-slate-800 truncate max-w-[130px]">{vehicle.name}</span>
                        </div>
                        <span className="font-black text-slate-900 bg-sky-50 text-sky-700 px-2 py-0.5 rounded-md font-mono text-[10px]">
                          {vehicle.viewsCount ?? 0} views
                        </span>
                      </div>
                    )
                  })}
                  {vehiclesByViews.length === 0 && (
                    <p className="text-[10px] text-slate-400 font-bold text-center py-4">Nenhum dado registrado.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 2. Mais Clicados */}
            <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="bg-slate-50/50 p-4 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                    Mais Clicados (CTA)
                  </CardTitle>
                  <CardDescription className="text-[8px] text-slate-400 font-bold">Cliques nos botões do modal de carros</CardDescription>
                </div>
                <Target className="h-4 w-4 text-violet-600" />
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {vehiclesByClicks.slice(0, 5).map((vehicle, idx) => {
                    const placeColors = ["bg-amber-400 text-white", "bg-slate-300 text-slate-800", "bg-amber-600 text-white"]
                    return (
                      <div key={vehicle.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center font-black text-[9px] shadow-2xs",
                            idx < 3 ? placeColors[idx] : "bg-slate-100 text-slate-500"
                          )}>
                            {idx + 1}
                          </span>
                          <span className="font-extrabold text-slate-800 truncate max-w-[130px]">{vehicle.name}</span>
                        </div>
                        <span className="font-black text-slate-900 bg-violet-50 text-violet-700 px-2 py-0.5 rounded-md font-mono text-[10px]">
                          {vehicle.clicksCount ?? 0} clicks
                        </span>
                      </div>
                    )
                  })}
                  {vehiclesByClicks.length === 0 && (
                    <p className="text-[10px] text-slate-400 font-bold text-center py-4">Nenhum dado registrado.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 3. Mais Cadastrados */}
            <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="bg-slate-50/50 p-4 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                    Mais Cadastrados (CRM)
                  </CardTitle>
                  <CardDescription className="text-[8px] text-slate-400 font-bold">Leads gerados com interesse no carro</CardDescription>
                </div>
                <Users className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {vehiclesByLeads.slice(0, 5).map((vehicle, idx) => {
                    const placeColors = ["bg-amber-400 text-white", "bg-slate-300 text-slate-800", "bg-amber-600 text-white"]
                    const leadsCount = vehicleLeadsMap[vehicle.name]?.leadsCount ?? 0
                    return (
                      <div key={vehicle.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center font-black text-[9px] shadow-2xs",
                            idx < 3 ? placeColors[idx] : "bg-slate-100 text-slate-500"
                          )}>
                            {idx + 1}
                          </span>
                          <span className="font-extrabold text-slate-800 truncate max-w-[130px]">{vehicle.name}</span>
                        </div>
                        <span className="font-black text-slate-900 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-mono text-[10px]">
                          {leadsCount} leads
                        </span>
                      </div>
                    )
                  })}
                  {vehiclesByLeads.length === 0 && (
                    <p className="text-[10px] text-slate-400 font-bold text-center py-4">Nenhum lead correspondido.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 4. Mais Alugados */}
            <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="bg-slate-50/50 p-4 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                    Mais Alugados (Conversões)
                  </CardTitle>
                  <CardDescription className="text-[8px] text-slate-400 font-bold">Contratos convertidos reais no funil</CardDescription>
                </div>
                <Check className="h-4 w-4 text-violet-600" />
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {vehiclesByRentals.slice(0, 5).map((vehicle, idx) => {
                    const placeColors = ["bg-amber-400 text-white", "bg-slate-300 text-slate-800", "bg-amber-600 text-white"]
                    const rentalsCount = vehicleLeadsMap[vehicle.name]?.rentalsCount ?? 0
                    return (
                      <div key={vehicle.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center font-black text-[9px] shadow-2xs",
                            idx < 3 ? placeColors[idx] : "bg-slate-100 text-slate-500"
                          )}>
                            {idx + 1}
                          </span>
                          <span className="font-extrabold text-slate-800 truncate max-w-[130px]">{vehicle.name}</span>
                        </div>
                        <span className="font-black text-slate-900 bg-violet-50 text-violet-700 px-2 py-0.5 rounded-md font-mono text-[10px]">
                          {rentalsCount} aluguéis
                        </span>
                      </div>
                    )
                  })}
                  {vehiclesByRentals.length === 0 && (
                    <p className="text-[10px] text-slate-400 font-bold text-center py-4">Nenhum contrato fechado.</p>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      )}

      {/* ── TAB 5: BIBLIOTECA DE MÍDIA ── */}
      {activeTab === "assets" && (
        <div className="space-y-6">
          <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 text-violet-600" />
                  Biblioteca Central de Mídia
                </CardTitle>
                <CardDescription className="text-[10px] text-slate-500 font-bold">
                  Armazenamento indexado de imagens corporativas, logos e mídias das campanhas vinculadas ao Supabase.
                </CardDescription>
              </div>
              
              <Button
                onClick={() => setAssetCreateOpen(true)}
                className="bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs h-9 px-4 rounded-lg flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="h-4 w-4" /> Registrar Novo Ativo
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              {/* Category selector filter */}
              <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-100">
                {[
                  { id: "veiculos", label: "Veículos" },
                  { id: "dtaxi", label: "D-Taxi" },
                  { id: "acessivel", label: "Táxi Acessível" },
                  { id: "logos", label: "Logos" },
                  { id: "institucional", label: "Institucional" },
                  { id: "parceiros", label: "Parceiros" }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveAssetTab(cat.id)}
                    className={cn(
                      "text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all",
                      activeAssetTab === cat.id 
                        ? "bg-violet-600 text-white border-violet-600 shadow-sm" 
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Grid of Assets */}
              {assetsLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
                  <span className="animate-spin text-lg">⚙️</span>
                  <p className="text-xs font-bold font-semibold">Buscando biblioteca de mídia...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {assets.filter(a => a.category === activeAssetTab).map(asset => {
                    const isImg = asset.url && (
                      asset.url.includes(".png") || 
                      asset.url.includes(".jpg") || 
                      asset.url.includes(".jpeg") || 
                      asset.url.includes(".webp") || 
                      asset.url.includes(".svg") || 
                      asset.url.startsWith("data:image")
                    )

                    return (
                      <Card key={asset.id} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden hover:shadow-sm transition-all flex flex-col justify-between">
                        <div>
                          {isImg ? (
                            <div className="relative aspect-video bg-slate-200 overflow-hidden border-b border-slate-200 group">
                              <img 
                                src={asset.url} 
                                alt={asset.name} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                              />
                            </div>
                          ) : (
                            <div className="aspect-video bg-slate-200 border-b border-slate-200 flex items-center justify-center text-slate-400">
                              <FileText className="h-8 w-8" />
                            </div>
                          )}
                          
                          <div className="p-3.5">
                            <span className="text-[7px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-black uppercase tracking-wider block w-fit mb-1.5">
                              {asset.category}
                            </span>
                            <h4 className="text-xs font-black text-slate-800 truncate" title={asset.name}>{asset.name}</h4>
                            {asset.description && (
                              <p className="text-[9px] text-slate-500 font-semibold mt-1 line-clamp-2 leading-relaxed">
                                {asset.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="p-3.5 pt-0 border-t border-slate-200/50 mt-2 flex gap-2">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(asset.url)
                              success("URL Copiada!", "O link público da mídia está na área de transferência.")
                            }}
                            className="flex-1 bg-white border border-slate-250 hover:bg-slate-100 text-slate-700 text-[9px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 shadow-2xs"
                          >
                            <Copy className="h-3 w-3" /> Copiar Link
                          </button>
                          <button
                            onClick={() => handleDeleteAsset(asset.id)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded-lg border border-red-200 transition-colors"
                            title="Excluir ativo da biblioteca"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </Card>
                    )
                  })}
                  
                  {assets.filter(a => a.category === activeAssetTab).length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-400 border border-dashed border-slate-250 rounded-xl bg-slate-50/50">
                      <ImageIcon className="h-8 w-8 text-slate-300 mb-2" />
                      <p className="text-xs font-bold">Nenhum ativo de mídia registrado nesta categoria.</p>
                      <p className="text-[9px] text-slate-500 font-semibold mt-1">Clique em "Registrar Novo Ativo" para catalogar.</p>
                    </div>
                  )}
                </div>
              )}

            </CardContent>
          </Card>

          {/* Form Dialog for Asset Creation */}
          <Dialog open={assetCreateOpen} onOpenChange={setAssetCreateOpen}>
            <DialogContent className="sm:max-w-[450px] bg-white rounded-2xl shadow-xl border border-slate-100 p-6">
              <DialogHeader>
                <DialogTitle className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
                  <Plus className="h-4 w-4 text-violet-600" />
                  Registrar Novo Ativo de Mídia
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 font-semibold mt-1">
                  Adicione e catalogue links públicos de imagens armazenadas no Supabase Storage para uso rápido no painel.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAddAsset} className="space-y-4 my-3">
                <div className="space-y-1">
                  <Label className="text-[10px] font-black text-slate-550 uppercase tracking-wider">Nome do Ativo</Label>
                  <Input
                    required
                    placeholder="Ex: Corolla Cross Banner Lateral"
                    value={assetForm.name}
                    onChange={e => setAssetForm(prev => ({ ...prev, name: e.target.value }))}
                    className="text-xs font-semibold h-9"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] font-black text-slate-550 uppercase tracking-wider">Categoria</Label>
                  <Select
                    value={assetForm.category}
                    onValueChange={v => setAssetForm(prev => ({ ...prev, category: v }))}
                  >
                    <SelectTrigger className="text-xs font-semibold h-9">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="veiculos">Veículos</SelectItem>
                      <SelectItem value="dtaxi">D-Taxi</SelectItem>
                      <SelectItem value="acessivel">Táxi Acessível</SelectItem>
                      <SelectItem value="logos">Logos</SelectItem>
                      <SelectItem value="institucional">Institucional</SelectItem>
                      <SelectItem value="parceiros">Parceiros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] font-black text-slate-550 uppercase tracking-wider">Descrição / Notas</Label>
                  <Textarea
                    placeholder="Ex: Imagem em alta resolução usada para divulgação comercial..."
                    value={assetForm.description}
                    onChange={e => setAssetForm(prev => ({ ...prev, description: e.target.value }))}
                    className="text-xs font-semibold resize-none min-h-[60px]"
                  />
                </div>

                {/* Dropdown helper for Supabase files list */}
                <div className="space-y-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[8px] font-black text-slate-450 uppercase block tracking-wider mb-1">
                    Selecionar do Supabase Storage
                  </span>
                  
                  {loadingSupabaseFiles ? (
                    <span className="text-[9px] text-slate-500 font-bold block animate-pulse">⚙️ Carregando arquivos do Supabase...</span>
                  ) : supabaseFiles.length === 0 ? (
                    <span className="text-[9px] text-slate-400 font-bold block">Nenhum arquivo listado nos buckets.</span>
                  ) : (
                    <Select
                      onValueChange={val => {
                        const fileObj = supabaseFiles.find(f => f.url === val)
                        setAssetForm(prev => ({
                          ...prev,
                          url: val,
                          name: prev.name || (fileObj ? fileObj.name.split("] ").pop() || "" : "")
                        }))
                      }}
                    >
                      <SelectTrigger className="text-[10px] font-bold h-8 bg-white border-slate-250">
                        <SelectValue placeholder="Escolha um arquivo do Storage" />
                      </SelectTrigger>
                      <SelectContent>
                        {supabaseFiles.map((file, fIdx) => (
                          <SelectItem key={fIdx} value={file.url} className="text-[10px] font-bold">
                            {file.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] font-black text-slate-550 uppercase tracking-wider">URL do Arquivo / Endereço Público</Label>
                  <Input
                    required
                    placeholder="https://..."
                    value={assetForm.url}
                    onChange={e => setAssetForm(prev => ({ ...prev, url: e.target.value }))}
                    className="text-xs font-semibold h-9 font-mono"
                  />
                </div>

                <DialogFooter className="border-t border-slate-100 pt-4 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAssetCreateOpen(false)}
                    className="text-xs font-bold text-slate-500"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={savingAsset}
                    className="bg-violet-600 hover:bg-violet-550 text-white font-bold text-xs"
                  >
                    {savingAsset ? "Registrando..." : "Registrar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}

    </div>
  )
}
