"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"

export function MapSection() {
  return (
    <section className="relative w-full overflow-hidden py-20 lg:py-32 select-none bg-transparent">
      
      {/* Soft background glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(2,132,199,0.03),transparent_65%)]" />

      <div className="container relative z-10 mx-auto px-6">
        
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-12">
          
          {/* LEFT CONTENT */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            className="space-y-6 lg:col-span-5"
          >
            <Badge className="rounded-full border border-white/10 bg-white/10 px-3.5 py-1 text-xs font-bold text-emerald-300">
              Estrutura Operacional
            </Badge>

            <h2 className="text-3xl font-black leading-tight text-white md:text-5xl">
              Mais praticidade
              <br />
              para sua rotina diária
            </h2>

            <p className="text-base font-semibold leading-relaxed text-sky-100/90 md:text-lg">
              Nossa sede operacional e oficina estão localizadas
              na Zona Sul de São Paulo, próximas ao Aeroporto de
              Congonhas, facilitando suporte rápido, manutenção e
              reduzindo deslocamentos desnecessários do motorista.
            </p>

            {/* BENEFITS */}
            <div className="space-y-4 border-t border-white/10 pt-4">
              
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 shrink-0 rounded-full bg-emerald-500"></span>

                <span className="text-sm font-semibold text-sky-100">
                  Próximo ao Aeroporto de Congonhas
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="h-3 w-3 shrink-0 rounded-full bg-sky-500"></span>

                <span className="text-sm font-semibold text-sky-100">
                  Fácil acesso pelas principais vias da Zona Sul
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="h-3 w-3 shrink-0 rounded-full bg-amber-500"></span>

                <span className="text-sm font-semibold text-sky-100">
                  Oficina, suporte e atendimento no mesmo local
                </span>
              </div>
            </div>
          </motion.div>

          {/* RIGHT MAP */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            className="relative aspect-video overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8 lg:col-span-7"
          >
            
            {/* MAP SVG */}
            <svg
              viewBox="0 0 600 400"
              className="h-full w-full select-none text-slate-400"
            >
              {/* GRID */}
              <defs>
                <pattern
                  id="mapGrid"
                  width="30"
                  height="30"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 30 0 L 0 0 0 30"
                    fill="none"
                    stroke="rgba(15,23,42,0.02)"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>

              <rect
                width="600"
                height="400"
                fill="url(#mapGrid)"
                rx="16"
              />

              {/* MAIN ROADS */}
              <path
                d="M 300 20 L 300 380"
                fill="none"
                stroke="rgba(245,158,11,0.25)"
                strokeWidth="5"
                strokeLinecap="round"
              />

              <path
                d="M 50 80 C 200 70, 400 90, 550 80"
                fill="none"
                stroke="rgba(2,132,199,0.18)"
                strokeWidth="4"
                strokeLinecap="round"
              />

              <path
                d="M 220 160 L 380 180"
                fill="none"
                stroke="rgba(2,132,199,0.4)"
                strokeWidth="5"
                strokeLinecap="round"
              />

              {/* CONGONHAS */}
              <g>
                <circle
                  cx="300"
                  cy="300"
                  r="18"
                  fill="rgba(34,197,94,0.12)"
                  className="animate-pulse"
                />

                <circle
                  cx="300"
                  cy="300"
                  r="10"
                  fill="rgba(34,197,94,0.2)"
                />

                <circle
                  cx="300"
                  cy="300"
                  r="5"
                  fill="#22c55e"
                />

                <text
                  x="315"
                  y="304"
                  fill="rgba(15,23,42,0.9)"
                  className="text-[10px] font-black tracking-widest uppercase"
                >
                  AEROPORTO DE CONGONHAS
                </text>
              </g>

              {/* PAULISTA */}
              <g>
                <circle
                  cx="300"
                  cy="172"
                  r="6"
                  fill="#0284c7"
                />

                <text
                  x="312"
                  y="176"
                  fill="rgba(15,23,42,0.6)"
                  className="text-[9px] font-bold"
                >
                  AV. PAULISTA
                </text>
              </g>

              {/* FARIA LIMA */}
              <g>
                <circle
                  cx="210"
                  cy="245"
                  r="6"
                  fill="#0284c7"
                />

                <text
                  x="120"
                  y="242"
                  fill="rgba(15,23,42,0.6)"
                  className="text-[9px] font-bold"
                >
                  FARIA LIMA / BERRINI
                </text>
              </g>

              {/* HEADQUARTERS */}
              <g>
                <circle
                  cx="300"
                  cy="340"
                  r="12"
                  fill="rgba(234,179,8,0.2)"
                  className="animate-ping"
                />

                <circle
                  cx="300"
                  cy="340"
                  r="7"
                  fill="#eab308"
                />

                <text
                  x="315"
                  y="344"
                  fill="#eab308"
                  className="text-[9px] font-black"
                >
                  SEDE OPERACIONAL
                </text>
              </g>
            </svg>

            {/* FLOATING INFO */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-sm backdrop-blur-md">
              
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 animate-ping rounded-full bg-emerald-500"></span>

                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  Sede próxima a Congonhas
                </span>
              </div>

              <span className="text-[10px] font-black text-sky-700">
                Menos deslocamento • Mais praticidade
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}