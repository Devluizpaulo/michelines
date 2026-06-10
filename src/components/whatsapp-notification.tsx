"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { X, MessageCircle } from "lucide-react"
import { usePathname } from "next/navigation"

export default function WhatsAppNotification() {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [hasNotification, setHasNotification] = useState(true)
  const [currentTime, setCurrentTime] = useState("")
  const [hasAutoCollapsed, setHasAutoCollapsed] = useState(false)

  const whatsappUrl = "https://wa.me/5511944830851?text=Olá,%20gostaria%20de%20saber%20mais%20sobre%20os%20veículos%20disponíveis"

  useEffect(() => {
    // Definir horário atual
    const now = new Date()
    setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))

    // Verificar se é dispositivo móvel
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    // Mostrar notificação após 3 segundos
    const showTimer = setTimeout(() => {
      setIsVisible(true)
    }, 3000)

    return () => {
      clearTimeout(showTimer)
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  // Recolher automaticamente após alguns segundos (6 segundos após visível)
  useEffect(() => {
    if (isVisible && isExpanded && !hasAutoCollapsed) {
      const timer = setTimeout(() => {
        setIsExpanded(false)
        setHasAutoCollapsed(true)
      }, 6000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, isExpanded, hasAutoCollapsed])

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
    setHasAutoCollapsed(true)
    if (!isExpanded) {
      setHasNotification(false)
    }
  }

  if (pathname !== "/") return null
  if (!isVisible) return null

  return (
    <div
      className={`fixed z-50 transition-all duration-500 ease-in-out ${
        isMobile ? "bottom-4 right-4" : "bottom-6 right-6"
      }`}
    >
      {isExpanded ? (
        <div className="w-[320px] rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans border border-slate-200 animate-fade-in origin-bottom-right">
          {/* Header WhatsApp */}
          <div className="bg-[#00a884] px-4 py-3 flex justify-between items-center text-white cursor-pointer" onClick={() => window.open(whatsappUrl, "_blank")}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-1 overflow-hidden shrink-0">
                <div className="relative w-full h-full">
                  <Image 
                    src="/images/logos/logo-grupo-michelines.png" 
                    alt="Micheline's"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <h3 className="font-semibold text-[15px] leading-tight">Grupo Michelines</h3>
                <p className="text-xs text-white/90">online</p>
              </div>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(false)
                setHasAutoCollapsed(true)
              }} 
              className="text-white hover:bg-white/20 p-1.5 rounded-full transition-colors focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Chat Body */}
          <div 
            className="p-4 flex flex-col gap-3 min-h-[220px] relative bg-[#efeae2]"
            style={{
              backgroundImage: 'url("https://web.whatsapp.com/img/bg-chat-tile-light_04fcacde539c58cca6745483d4858c52.png")',
              backgroundSize: 'contain'
            }}
          >
            {/* Timestamp */}
            <div className="flex justify-center mb-1">
              <span className="bg-[#e1f2fb] text-[#54656f] text-[11px] font-medium px-3 py-1 rounded-md shadow-sm">
                Hoje
              </span>
            </div>
            
            {/* Message Bubble */}
            <div className="bg-white p-2 rounded-lg rounded-tl-none shadow-sm max-w-[85%] relative self-start">
              {/* Baloon Tail */}
              <div className="absolute top-0 -left-2 w-0 h-0 border-[6px] border-transparent border-t-white border-r-white"></div>
              
              <p className="text-[14px] text-[#111b21] leading-snug px-1 pt-1">
                Olá, tudo bem? 🚖<br/><br/>
                Acho que temos um veículo disponível perfeito para você começar a rodar.<br/><br/>
                Vamos conversar?
              </p>
              
              <div className="flex justify-end items-center mt-1 gap-1">
                <span className="text-[11px] text-[#667781] px-1">
                  {currentTime}
                </span>
              </div>
            </div>
          </div>

          {/* Footer (Input Area) */}
          <div className="bg-[#f0f2f5] p-3 flex items-center gap-2">
            <Link 
              href={whatsappUrl}
              target="_blank"
              className="bg-white rounded-full flex-1 flex items-center px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors shadow-sm"
            >
              <span className="text-[#8696a0] text-[15px]">Digite uma mensagem...</span>
            </Link>
            <Link 
              href={whatsappUrl}
              target="_blank"
              className="w-11 h-11 bg-[#00a884] rounded-full flex items-center justify-center text-white shrink-0 hover:bg-[#008f6f] transition-colors shadow-sm"
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
              </svg>
            </Link>
          </div>
        </div>
      ) : (
        <button
          onClick={toggleExpanded}
          className="relative bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full w-[60px] h-[60px] flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110"
        >
          <svg viewBox="0 0 24 24" width="34" height="34" fill="currentColor">
            <path d="M11.99 2C6.47 2 2 6.48 2 12c0 1.84.5 3.56 1.36 5.06L2 22l5.09-1.34A9.94 9.94 0 0011.99 22c5.52 0 10-4.48 10-10s-4.48-10-10-10zm5.1 14.16c-.25.71-1.46 1.36-2.02 1.45-.52.08-1.18.25-3.41-.68-2.67-1.12-4.38-3.86-4.51-4.04-.13-.18-1.08-1.44-1.08-2.75 0-1.31.68-1.96.92-2.22.24-.26.52-.33.69-.33.18 0 .35 0 .5.01.16.01.37-.06.57.43.21.5.71 1.74.77 1.87.07.13.11.28.03.46-.08.18-.13.29-.26.44-.13.15-.27.33-.38.44-.13.13-.27.27-.12.53.15.26.66 1.09 1.42 1.77.98.88 1.8 1.15 2.06 1.28.26.13.41.11.56-.06.15-.18.66-.77.83-1.04.18-.26.35-.22.59-.13.24.09 1.54.73 1.81.86.26.13.44.22.5.34.06.12.06.71-.19 1.42z"/>
          </svg>
          {hasNotification && (
            <span className="absolute top-0 right-0 bg-[#EF4444] text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white">
              1
            </span>
          )}
        </button>
      )}
    </div>
  )
}
