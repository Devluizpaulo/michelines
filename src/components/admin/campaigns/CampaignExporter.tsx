"use client"

import { useState, useRef, useEffect } from "react"
import { LandingSettings } from "@/types/landing"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Share2, Copy, Check, MessageSquare, ExternalLink, Download, Flame } from "lucide-react"
import { useToast } from "@/components/ui/toast-simple"

// ─── Brand Icons (SVG inline) ─────────────────────────────────────────────────
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  )
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

interface CampaignExporterProps {
  landingSettings: LandingSettings
}

type Platform = "instagram" | "facebook" | "whatsapp" | "banner"

// ─── Geradores de texto por plataforma ────────────────────────────────────────

function generateInstagramCaption(settings: LandingSettings): string {
  const title = settings.campaignText || "Oferta Especial — Michelines"
  const subtitle = settings.campaignSubtitle || "Condições exclusivas para você!"
  const cta = settings.campaignBtnText || "Saiba mais"
  const url = settings.campaignBtnUrl || "https://michelinestransportes.com.br"

  return `✨ ${title}

${subtitle}

🚗 Locação de táxi com as melhores condições do mercado
✅ Aprovação rápida — sem consulta de score
🏆 45 anos de tradição em São Paulo

👉 ${cta}: ${url}

.
.
.
#michelines #grupoMichelines #locacaoTaxi #taxiSP #motoristaTaxi #dtaxi #congonhas #corrollaCross #hibrido #saopaulo #uberDriver #motoristaProfissional #taxi`
}

function generateFacebookPost(settings: LandingSettings): string {
  const title = settings.campaignText || "Oferta Especial — Michelines"
  const subtitle = settings.campaignSubtitle || "Condições exclusivas para você!"
  const cta = settings.campaignBtnText || "Saiba mais"
  const url = settings.campaignBtnUrl || "https://michelinestransportes.com.br"

  return `🚖 ${title}

${subtitle}

Somos o Grupo Michelines, referência em locação de táxi em São Paulo há mais de 45 anos.

✅ Aprovação sem consulta de score
🚗 Frota de híbridos e sedans modernos
🛫 Veículos homologados D-TAXI para Congonhas
💳 Pagamento via PIX, débito ou crédito
📞 Atendimento rápido e personalizado

👇 Acesse agora e garanta sua vaga:
${url}

Clique no link e saiba mais! 👆

Entre em contato pelo WhatsApp e tire todas as suas dúvidas. Temos a solução ideal para o seu perfil.`
}

function generateWhatsAppMessage(settings: LandingSettings): string {
  const title = settings.campaignText || "Oferta Especial — Michelines"
  const subtitle = settings.campaignSubtitle || "Condições exclusivas para você!"
  const cta = settings.campaignBtnText || "Saiba mais"
  const url = settings.campaignBtnUrl || "https://michelinestransportes.com.br"

  return `🚖 *${title}*

${subtitle}

*Grupo Michelines* — 45 anos locando táxis em SP!

✅ Aprovação rápida sem consulta de score
🚗 Frota premium: híbridos e sedans modernos
🛫 D-TAXI Congonhas disponível
💰 Melhores diárias do mercado

👉 *${cta}:* ${url}

Responda essa mensagem e nossa equipe entra em contato! 📲`
}

// ─── Configurações visuais por plataforma ─────────────────────────────────────

const PLATFORM_CONFIG = {
  instagram: {
    label: "Instagram",
    icon: InstagramIcon,
    color: "bg-gradient-to-r from-purple-600 to-pink-500",
    textColor: "text-white",
    hoverColor: "hover:opacity-90",
    description: "Caption otimizada com hashtags para posts e Stories",
    charWarning: 2200,
  },
  facebook: {
    label: "Facebook",
    icon: FacebookIcon,
    color: "bg-blue-600",
    textColor: "text-white",
    hoverColor: "hover:bg-blue-700",
    description: "Post completo para feed do Facebook",
    charWarning: 63206,
  },
  whatsapp: {
    label: "WhatsApp",
    icon: MessageSquare,
    color: "bg-emerald-500",
    textColor: "text-white",
    hoverColor: "hover:bg-emerald-600",
    description: "Mensagem formatada para grupos e broadcasts",
    charWarning: 4096,
  },
  banner: {
    label: "Criar Flyer",
    icon: Flame,
    color: "bg-amber-500",
    textColor: "text-white",
    hoverColor: "hover:bg-amber-600",
    description: "Crie um banner visual em imagem (PNG) contendo o texto, carro e logo para postar",
    charWarning: 0,
  },
} as const

// Helper to draw campaign visual banners on HTML Canvas
function drawCampaignBanner(
  canvas: HTMLCanvasElement,
  settings: LandingSettings,
  templateId: number,
  format: "feed" | "story",
  carImg: HTMLImageElement
) {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const width = 1080
  const height = format === "feed" ? 1080 : 1920
  canvas.width = width
  canvas.height = height

  // 1. Background Gradient
  const grad = ctx.createLinearGradient(0, 0, width, height)
  if (templateId === 1) {
    grad.addColorStop(0, "#0B192F") // Deep blue dark
    grad.addColorStop(0.5, "#0F2647")
    grad.addColorStop(1, "#0284C7")  // Sky Blue
  } else if (templateId === 2) {
    grad.addColorStop(0, "#1E1B4B") // Deep indigo/amber mix
    grad.addColorStop(0.5, "#451A03") // Rich brown
    grad.addColorStop(1, "#D97706")  // Amber
  } else {
    grad.addColorStop(0, "#064E3B") // Emerald dark
    grad.addColorStop(0.5, "#0A1F16")
    grad.addColorStop(1, "#059669")  // Emerald
  }
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, width, height)

  // 2. Decorative Glowing Orbs
  ctx.globalCompositeOperation = "screen"
  const radial = ctx.createRadialGradient(
    width * 0.8,
    height * 0.2,
    50,
    width * 0.8,
    height * 0.2,
    500
  )
  if (templateId === 1) {
    radial.addColorStop(0, "rgba(56, 189, 248, 0.3)")
    radial.addColorStop(1, "rgba(56, 189, 248, 0)")
  } else if (templateId === 2) {
    radial.addColorStop(0, "rgba(251, 191, 36, 0.25)")
    radial.addColorStop(1, "rgba(251, 191, 36, 0)")
  } else {
    radial.addColorStop(0, "rgba(52, 211, 153, 0.25)")
    radial.addColorStop(1, "rgba(52, 211, 153, 0)")
  }
  ctx.fillStyle = radial
  ctx.fillRect(0, 0, width, height)
  ctx.globalCompositeOperation = "source-over"

  // 3. Grid overlay pattern
  ctx.strokeStyle = "rgba(255, 255, 255, 0.03)"
  ctx.lineWidth = 1
  const gridSize = 40
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }

  // 4. Border Frame
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)"
  ctx.lineWidth = 16
  ctx.strokeRect(25, 25, width - 50, height - 50)

  // 5. Header / Brand
  ctx.fillStyle = "#FFFFFF"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"

  // Brand Name
  ctx.font = "900 38px Montserrat, Inter, system-ui, sans-serif"
  ctx.fillText("GRUPO MICHELINES", width / 2, format === "feed" ? 130 : 250)

  // Tag
  ctx.font = "900 16px Montserrat, Inter, system-ui, sans-serif"
  ctx.fillStyle = templateId === 1 ? "#38BDF8" : templateId === 2 ? "#FBBF24" : "#34D399"
  ctx.fillText(
    templateId === 1 ? "CAMPANHA D-TAXI CONGONHAS" : templateId === 2 ? "TAXA ZERO • OFERTA DO MÊS" : "MOBILIDADE HÍBRIDA SUSTENTÁVEL",
    width / 2,
    format === "feed" ? 180 : 310
  )

  // Separator
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)"
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(width / 2 - 60, format === "feed" ? 220 : 360)
  ctx.lineTo(width / 2 + 60, format === "feed" ? 220 : 360)
  ctx.stroke()

  // 6. Main Title (multiline)
  const titleText = (settings.campaignText || "OFERTA ESPECIAL").toUpperCase()
  ctx.fillStyle = "#FFFFFF"
  ctx.font = "900 52px Montserrat, Inter, system-ui, sans-serif"

  const words = titleText.split(" ")
  let line = ""
  const lines: string[] = []
  const maxWidth = width - 180
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " "
    const metrics = ctx.measureText(testLine)
    if (metrics.width > maxWidth && n > 0) {
      lines.push(line)
      line = words[n] + " "
    } else {
      line = testLine
    }
  }
  lines.push(line)

  const titleYStart = format === "feed" ? 290 : 480
  const titleLineHeight = 65
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i].trim(), width / 2, titleYStart + i * titleLineHeight)
  }

  // 7. Subtitle (multiline)
  const subtitleText = settings.campaignSubtitle || ""
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)"
  ctx.font = "700 24px Montserrat, Inter, system-ui, sans-serif"

  const subWords = subtitleText.split(" ")
  let subLine = ""
  const subLines: string[] = []
  const subMaxWidth = width - 225
  for (let n = 0; n < subWords.length; n++) {
    const testLine = subLine + subWords[n] + " "
    const metrics = ctx.measureText(testLine)
    if (metrics.width > subMaxWidth && n > 0) {
      subLines.push(subLine)
      subLine = subWords[n] + " "
    } else {
      subLine = testLine
    }
  }
  subLines.push(subLine)

  const subYStart = titleYStart + lines.length * titleLineHeight + 35
  const subLineHeight = 35
  for (let i = 0; i < subLines.length; i++) {
    ctx.fillText(subLines[i].trim(), width / 2, subYStart + i * subLineHeight)
  }

  // DRAW VEHICLE IMAGE WITH ROUNDED BORDERS
  const carY = format === "feed" ? 520 : 820
  const carW = 640
  const carH = 360
  const carX = width / 2 - carW / 2

  ctx.save()
  // Create rounded clipping path
  ctx.beginPath()
  ctx.roundRect(carX, carY, carW, carH, 24)
  ctx.clip()
  // Draw car image
  ctx.drawImage(carImg, carX, carY, carW, carH)
  ctx.restore()

  // Beautiful gold or white stroke around the vehicle image
  ctx.strokeStyle = templateId === 2 ? "#D97706" : "rgba(255, 255, 255, 0.2)"
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.roundRect(carX, carY, carW, carH, 24)
  ctx.stroke()

  // 8. CTA Button
  const btnText = (settings.campaignBtnText || "QUERO APROVEITAR").toUpperCase()
  const btnY = format === "feed" ? 920 : 1380
  const btnWidth = 480
  const btnHeight = 90
  const btnX = width / 2 - btnWidth / 2

  ctx.fillStyle = templateId === 1 ? "#0284C7" : templateId === 2 ? "#D97706" : "#059669"
  ctx.beginPath()
  ctx.roundRect(btnX, btnY, btnWidth, btnHeight, 22)
  ctx.fill()

  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)"
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.fillStyle = "#FFFFFF"
  ctx.font = "900 26px Montserrat, Inter, system-ui, sans-serif"
  ctx.fillText(btnText, width / 2, btnY + btnHeight / 2)

  // 9. Footer
  ctx.fillStyle = "rgba(255, 255, 255, 0.35)"
  ctx.font = "700 18px Montserrat, Inter, system-ui, sans-serif"
  ctx.fillText(
    "Acesse: michelinestransportes.com.br",
    width / 2,
    format === "feed" ? 1040 : 1800
  )
}

export function CampaignExporter({ landingSettings }: CampaignExporterProps) {
  const [open, setOpen] = useState(false)
  const [activePlatform, setActivePlatform] = useState<Platform>("instagram")
  const [copied, setCopied] = useState(false)
  const { success, error: showError } = useToast()

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [bannerFormat, setBannerFormat] = useState<"feed" | "story">("feed")

  const generators: Record<Platform, (s: LandingSettings) => string> = {
    instagram: generateInstagramCaption,
    facebook: generateFacebookPost,
    whatsapp: generateWhatsAppMessage,
    banner: () => "",
  }

  useEffect(() => {
    if (activePlatform === "banner" && canvasRef.current) {
      const templateId = landingSettings.campaignTemplateId || 1
      const imgUrl = templateId === 1
        ? "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80"
        : templateId === 2
        ? "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80"
        : "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80"

      const carImg = new Image()
      carImg.crossOrigin = "anonymous"
      carImg.src = imgUrl
      carImg.onload = () => {
        if (canvasRef.current) {
          drawCampaignBanner(
            canvasRef.current,
            landingSettings,
            templateId,
            bannerFormat,
            carImg
          )
        }
      }
      if (carImg.complete) {
        drawCampaignBanner(
          canvasRef.current,
          landingSettings,
          templateId,
          bannerFormat,
          carImg
        )
      }
    }
  }, [activePlatform, bannerFormat, landingSettings])

  const handleDownloadBanner = () => {
    if (!canvasRef.current) return
    try {
      const dataUrl = canvasRef.current.toDataURL("image/png")
      const link = document.createElement("a")
      link.download = `michelines-campanha-${bannerFormat}.png`
      link.href = dataUrl
      link.click()
      success("Download concluído!", "Sua imagem promocional foi salva com sucesso.")
    } catch (e) {
      showError("Erro no download", "Não foi possível gerar o arquivo de imagem.")
    }
  }

  const generatedText = generators[activePlatform](landingSettings)
  const config = PLATFORM_CONFIG[activePlatform]
  const charCount = generatedText.length

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedText)
      setCopied(true)
      success(`Copiado para ${config.label}!`, "Texto pronto para colar na plataforma.")
      setTimeout(() => setCopied(false), 2500)
    } catch {
      showError("Erro ao copiar", "Não foi possível acessar a área de transferência.")
    }
  }

  const handleWhatsAppShare = () => {
    if (activePlatform !== "whatsapp") return
    const url = `https://wa.me/?text=${encodeURIComponent(generatedText)}`
    window.open(url, "_blank")
  }

  const isNotConfigured =
    !landingSettings.showCampaignBanner ||
    !landingSettings.campaignText;

  return (
    <>
      {/* Botão de abertura */}
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-violet-600 hover:bg-violet-500 text-white font-bold h-11 px-6 rounded-lg flex items-center gap-2 shadow-sm"
      >
        <Share2 className="h-4 w-4" />
        Exportar Campanha
      </Button>

      {/* Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-white border border-slate-200 text-slate-800 w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b border-slate-100 pb-4">
            <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Share2 className="h-5 w-5 text-violet-600" />
              Exportar Campanha para Redes Sociais
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-xs">
              Gere textos otimizados para cada plataforma com base na campanha ativa.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-5">
            {/* Aviso se campanha não configurada */}
            {isNotConfigured && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-semibold flex items-start gap-2">
                <span className="mt-0.5">⚠️</span>
                <span>
                  Nenhuma campanha ativa configurada. Configure o <strong>Banner Promocional</strong> na seção de Campanhas antes de exportar.
                </span>
              </div>
            )}

            {/* Seletor de plataforma */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Selecione a Plataforma
              </p>
              <div className="grid grid-cols-4 gap-3">
                {(Object.keys(PLATFORM_CONFIG) as Platform[]).map((platform) => {
                  const cfg = PLATFORM_CONFIG[platform]
                  const Icon = cfg.icon
                  const isActive = activePlatform === platform
                  return (
                    <button
                      key={platform}
                      onClick={() => {
                        setActivePlatform(platform)
                        setCopied(false)
                      }}
                      className={`
                        flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-xs font-bold
                        ${isActive
                          ? `border-violet-400 bg-violet-50 text-violet-700 shadow-sm`
                          : `border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50`
                        }
                      `}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? "text-violet-600" : "text-slate-400"}`} />
                      {cfg.label}
                    </button>
                  )
                })}
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-semibold">
                {config.description}
              </p>
            </div>

            {/* Preview do texto gerado OU Criador do Canvas */}
            {activePlatform === "banner" ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Formato do Banner</p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={bannerFormat === "feed" ? "default" : "outline"}
                      onClick={() => setBannerFormat("feed")}
                      className={`text-[10px] font-bold h-7 px-2.5 rounded-md ${bannerFormat === "feed"
                          ? "bg-amber-600 hover:bg-amber-500 text-white"
                          : "border-slate-250 text-slate-700 hover:bg-slate-50 bg-white"
                        }`}
                    >
                      Feed (1:1)
                    </Button>
                    <Button
                      type="button"
                      variant={bannerFormat === "story" ? "default" : "outline"}
                      onClick={() => setBannerFormat("story")}
                      className={`text-[10px] font-bold h-7 px-2.5 rounded-md ${bannerFormat === "story"
                          ? "bg-amber-600 hover:bg-amber-500 text-white"
                          : "border-slate-250 text-slate-700 hover:bg-slate-50 bg-white"
                        }`}
                    >
                      Stories (9:16)
                    </Button>
                  </div>
                </div>

                {/* Simulated Canvas viewport */}
                <div className="flex justify-center bg-slate-900 border border-slate-950 p-6 rounded-2xl relative overflow-hidden shadow-inner max-h-[360px] overflow-y-auto">
                  <canvas
                    ref={canvasRef}
                    className={`max-w-full shadow-2xl rounded-xl border border-white/5 ${bannerFormat === "feed" ? "aspect-square max-h-[300px]" : "aspect-[9/16] max-h-[330px]"
                      }`}
                  />
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[10px] text-amber-800 font-semibold flex gap-2">
                  <span className="shrink-0 text-amber-600">💡</span>
                  <p className="text-justify leading-relaxed">
                    A arte visual foi gerada com a identidade da campanha atual. Fontes elegantes, degradês e logo do <strong>Grupo Michelines</strong> serão exportados em alta resolução.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Texto Gerado
                  </p>
                  <span className={`text-[10px] font-bold ${charCount > config.charWarning * 0.8
                      ? "text-amber-600"
                      : "text-slate-400"
                    }`}>
                    {charCount} caracteres
                  </span>
                </div>
                <Textarea
                  value={generatedText}
                  readOnly
                  className="min-h-[200px] bg-slate-50 border-slate-200 text-slate-700 text-xs font-mono resize-none leading-relaxed"
                />
              </div>
            )}

            {/* Dados da campanha resumida */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Dados da Campanha Ativa
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                <div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">Título</p>
                  <p className="text-xs text-slate-700 font-semibold truncate">
                    {landingSettings.campaignText || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">Subtítulo</p>
                  <p className="text-xs text-slate-700 font-semibold truncate">
                    {landingSettings.campaignSubtitle || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">CTA</p>
                  <p className="text-xs text-slate-700 font-semibold truncate">
                    {landingSettings.campaignBtnText || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">Link</p>
                  <p className="text-xs text-sky-600 font-semibold truncate">
                    {landingSettings.campaignBtnUrl || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="flex flex-col sm:flex-row gap-3">
              {activePlatform === "banner" ? (
                <Button
                  onClick={handleDownloadBanner}
                  className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold h-11 flex items-center justify-center gap-2 rounded-xl shadow-md transition-all hover:scale-[1.01]"
                >
                  <Download className="h-4 w-4" />
                  Baixar Flyer Promocional (PNG)
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleCopy}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold h-11 flex items-center justify-center gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-400" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copiar Texto
                      </>
                    )}
                  </Button>

                  {activePlatform === "whatsapp" && (
                    <Button
                      onClick={handleWhatsAppShare}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-11 flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Abrir no WhatsApp
                      <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                    </Button>
                  )}

                  {activePlatform === "instagram" && (
                    <a
                      href="https://www.instagram.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-90 text-white font-bold h-11 flex items-center justify-center gap-2">
                        <InstagramIcon className="h-4 w-4" />
                        Abrir Instagram
                        <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                      </Button>
                    </a>
                  )}

                  {activePlatform === "facebook" && (
                    <a
                      href="https://www.facebook.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 flex items-center justify-center gap-2">
                        <FacebookIcon className="h-4 w-4" />
                        Abrir Facebook
                        <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                      </Button>
                    </a>
                  )}
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
