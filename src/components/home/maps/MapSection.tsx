"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"

export function MapSection() {
  return (
    <section className="w-full py-20 lg:py-32 bg-slate-50 border-t border-slate-200 relative overflow-hidden select-none">
      {/* Grid decorativo */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(14,165,233,0.02),transparent_60%)] pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center max-w-6xl mx-auto">
          
          {/* Texto explicativo */}
          <div className="lg:col-span-5 space-y-6">
            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3.5 py-1 rounded-full text-xs font-bold">Posicionamento Estratégico</Badge>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
              Conexão urbana inteligente
            </h2>
            <p className="text-base md:text-lg text-slate-600 leading-relaxed font-semibold text-justify">
              Nossa base e eixos de atuação estão localizados nas rotas de maior circulação corporativa e terminais preferenciais da cidade.
            </p>

            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="text-sm text-slate-650 font-semibold">Terminais de embarque: alta demanda ativa</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-amber-500 shrink-0"></span>
                <span className="text-sm text-slate-650 font-semibold">Corredor Norte-Sul: fluxo e tráfego prioritários</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-sky-500 shrink-0"></span>
                <span className="text-sm text-slate-650 font-semibold">Matriz Micheline's: suporte operacional rápido</span>
              </div>
            </div>
          </div>

          {/* Mapa Estilizado SVG */}
          <div className="lg:col-span-7 bg-white border border-slate-250 rounded-3xl p-6 md:p-8 flex items-center justify-center shadow-sm aspect-video relative">
            
            {/* SVG do Mapa Simplificado de SP */}
            <svg viewBox="0 0 600 400" className="w-full h-full text-slate-400 select-none">
              
              {/* Grid Lines no fundo do mapa */}
              <defs>
                <pattern id="mapGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(15,23,42,0.02)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="600" height="400" fill="url(#mapGrid)" rx="16" />

              {/* Vias/Corredores Principais de São Paulo (Light Premium Colored Lines) */}
              {/* Av. 23 de Maio / Corredor Norte-Sul */}
              <motion.path 
                d="M 300 20 L 300 380" 
                fill="none" 
                stroke="rgba(245,158,11,0.15)" 
                strokeWidth="6" 
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
              <path d="M 300 20 L 300 380" fill="none" stroke="rgba(245,158,11,0.5)" strokeWidth="2" strokeDasharray="5,10" />

              {/* Marginal Pinheiros */}
              <path d="M 100 50 C 130 150, 120 250, 150 380" fill="none" stroke="rgba(2,132,199,0.12)" strokeWidth="4" strokeLinecap="round" />
              
              {/* Marginal Tietê */}
              <path d="M 50 80 C 200 70, 400 90, 550 80" fill="none" stroke="rgba(2,132,199,0.12)" strokeWidth="4" strokeLinecap="round" />

              {/* Av. Paulista */}
              <path d="M 220 160 L 380 180" fill="none" stroke="rgba(2,132,199,0.4)" strokeWidth="5" strokeLinecap="round" />
              
              {/* Av. Faria Lima */}
              <path d="M 160 210 L 260 280" fill="none" stroke="rgba(2,132,199,0.2)" strokeWidth="4" strokeLinecap="round" />

              {/* Pontos Pulsantes */}
              {/* Congonhas (Aeroporto) */}
              <g className="cursor-pointer">
                <circle cx="300" cy="300" r="18" fill="rgba(34,197,94,0.12)" className="animate-pulse" />
                <circle cx="300" cy="300" r="10" fill="rgba(34,197,94,0.2)" />
                <circle cx="300" cy="300" r="5" fill="#22c55e" />
                <text x="315" y="304" fill="rgba(15,23,42,0.9)" className="text-[10px] font-black tracking-widest uppercase">CONGONHAS (AEROPORTO)</text>
              </g>

              {/* Av. Paulista */}
              <g>
                <circle cx="300" cy="172" r="6" fill="#0284c7" />
                <text x="312" y="176" fill="rgba(15,23,42,0.6)" className="text-[9px] font-bold">AV. PAULISTA</text>
              </g>

              {/* Faria Lima / Berrini */}
              <g>
                <circle cx="210" cy="245" r="6" fill="#0284c7" />
                <text x="120" y="242" fill="rgba(15,23,42,0.6)" className="text-[9px] font-bold">FARIA LIMA / BERRINI</text>
              </g>

              {/* Base Grupo Micheline's */}
              <g>
                <circle cx="300" cy="340" r="12" fill="rgba(234,179,8,0.2)" className="animate-ping" />
                <circle cx="300" cy="340" r="7" fill="#eab308" />
                <text x="315" y="344" fill="#eab308" className="text-[9px] font-black">MATRIZ MICHELINE'S</text>
              </g>

            </svg>

            {/* Floating Map Info Overlay */}
            <div className="absolute bottom-4 right-4 left-4 bg-white/90 border border-slate-200/80 p-3 rounded-2xl flex items-center justify-between gap-3 backdrop-blur-md shadow-sm">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Acesso Aeroporto DTaxi Ativo</span>
              </div>
              <span className="text-[10px] text-sky-700 font-black">Média R$ 85/corrida</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
