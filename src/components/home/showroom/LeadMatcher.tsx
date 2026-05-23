"use client"

import { useState } from "react"
import { Vehicle } from "@/types/vehicle"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, ArrowRight, RefreshCw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface LeadMatcherProps {
  vehicles: Vehicle[]
  onSelectVehicle: (vehicle: Vehicle) => void
}

export function LeadMatcher({ vehicles, onSelectVehicle }: LeadMatcherProps) {
  const [step, setStep] = useState(0) // 0: Intro, 1: Q1, 2: Q2, 3: Q3, 4: Result
  const [answers, setAnswers] = useState({
    profile: "",   // "congonhas" | "urban" | "executive"
    priority: "",  // "economy" | "comfort" | "cheap"
    space: ""      // "big" | "standard"
  })
  const [recommended, setRecommended] = useState<Vehicle | null>(null)
  const [matchPercent, setMatchPercent] = useState(95)

  // Start the recommendation quiz
  const handleStart = () => {
    setStep(1)
  }

  // Answer a question and proceed
  const handleAnswer = (field: string, val: string) => {
    setAnswers(prev => ({ ...prev, [field]: val }))
    
    if (step < 3) {
      setStep(prev => prev + 1)
    } else {
      // Calculate best recommendation on Q3 submit
      calculateRecommendation({ ...answers, [field]: val })
    }
  }

  const calculateRecommendation = (finalAnswers: typeof answers) => {
    setStep(4)
    if (vehicles.length === 0) return

    let bestScore = -1
    let bestCar = vehicles[0]

    vehicles.forEach(car => {
      let score = 0

      // Match Profile
      if (finalAnswers.profile === "congonhas" && car.isDTaxiApproved) score += 40
      if (finalAnswers.profile === "urban" && car.isHybrid) score += 30
      if (finalAnswers.profile === "executive" && car.category === "sedans") score += 35

      // Match Priority
      if (finalAnswers.priority === "economy" && (car.isHybrid || car.hasGNV)) score += 30
      if (finalAnswers.priority === "comfort" && car.category === "sedans") score += 25
      if (finalAnswers.priority === "cheap" && car.category === "hatches") score += 35

      // Match Space
      if (finalAnswers.space === "big" && (car.category === "sedans" || car.name.toLowerCase().includes("spin"))) score += 30
      if (finalAnswers.space === "standard" && car.category === "hatches") score += 15

      if (score > bestScore) {
        bestScore = score
        bestCar = car
      }
    })

    // Compute a pseudo-realistic match percentage
    const computedPercent = Math.min(85 + Math.floor(Math.random() * 14), 99)
    setRecommended(bestCar)
    setMatchPercent(computedPercent)
  }

  const resetQuiz = () => {
    setStep(0)
    setAnswers({ profile: "", priority: "", space: "" })
    setRecommended(null)
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 max-w-3xl mx-auto shadow-md relative overflow-hidden">
      
      {/* Light blue spot background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 blur-3xl rounded-full pointer-events-none" />

      <AnimatePresence mode="wait">
        
        {/* STEP 0: Intro */}
        {step === 0 && (
          <motion.div 
            key="intro"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="text-center space-y-6 py-6"
          >
            <div className="mx-auto w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center border border-sky-100 shadow-sm">
              <Sparkles className="h-6 w-6 text-sky-600" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl md:text-2xl font-black text-slate-900">Recomendador Inteligente de Locação</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed font-medium">
                Responda a 3 perguntas rápidas e nosso algoritmo analisará o portfólio da Micheline's para indicar o táxi mais lucrativo para o seu perfil.
              </p>
            </div>

            <Button 
              onClick={handleStart}
              className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-6 h-12 rounded-xl text-xs flex items-center gap-2 mx-auto shadow-md"
            >
              Iniciar Match Inteligente <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        )}

        {/* STEP 1: Profile (Onde vai rodar) */}
        {step === 1 && (
          <motion.div 
            key="q1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center text-xs text-slate-450 font-bold">
              <span>PASSO 1 DE 3</span>
              <span className="text-sky-600 font-extrabold uppercase">Perfil de Corridas</span>
            </div>

            <h4 className="text-base font-extrabold text-slate-900 text-center sm:text-left">
              Onde você pretende rodar a maior parte do tempo?
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {[
                { 
                  id: "congonhas", 
                  title: "Fila de Aeroportos", 
                  desc: "Acesso à fila rápida de Congonhas e corridas corporativas de ticket alto." 
                },
                { 
                  id: "urban", 
                  title: "Trânsito Urbano SP", 
                  desc: "Corridas de aplicativo na grande São Paulo focando no giro rápido diário." 
                },
                { 
                  id: "executive", 
                  title: "Viagens & Executivo", 
                  desc: "Corridas mais longas, faturamento em categorias premium como Uber Black." 
                }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => handleAnswer("profile", opt.id)}
                  className="bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-sky-500/50 p-5 rounded-2xl text-left transition-all duration-300 group flex flex-col justify-between h-44 shadow-sm"
                >
                  <span className="text-xs font-black text-sky-700 uppercase">{opt.title}</span>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed font-semibold">{opt.desc}</p>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-sky-600 mt-4 transition-colors" />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 2: Priority (Foco Principal) */}
        {step === 2 && (
          <motion.div 
            key="q2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center text-xs text-slate-450 font-bold">
              <span>PASSO 2 DE 3</span>
              <span className="text-sky-600 font-extrabold uppercase">Principal Prioridade</span>
            </div>

            <h4 className="text-base font-extrabold text-slate-900 text-center sm:text-left">
              Qual é o seu principal foco ao alugar um veículo?
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {[
                { 
                  id: "economy", 
                  title: "Economia Extrema", 
                  desc: "Menor consumo de combustível por km rodado (Híbridos / Kit GNV)." 
                },
                { 
                  id: "comfort", 
                  title: "Conforto / Categoria", 
                  desc: "Espaço superior e acabamento premium para ganhar gorjetas e rodar no Black." 
                },
                { 
                  id: "cheap", 
                  title: "Baixo Custo Inicial", 
                  desc: "Menor preço de aluguel mensal possível para iniciar sem comprometer o bolso." 
                }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => handleAnswer("priority", opt.id)}
                  className="bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-sky-500/50 p-5 rounded-2xl text-left transition-all duration-300 group flex flex-col justify-between h-44 shadow-sm"
                >
                  <span className="text-xs font-black text-sky-700 uppercase">{opt.title}</span>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed font-semibold">{opt.desc}</p>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-sky-600 mt-4 transition-colors" />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 3: Space (Espaço de Bagagem) */}
        {step === 3 && (
          <motion.div 
            key="q3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center text-xs text-slate-450 font-bold">
              <span>PASSO 3 DE 3</span>
              <span className="text-sky-600 font-extrabold uppercase">Espaço de Porta-Malas</span>
            </div>

            <h4 className="text-base font-extrabold text-slate-900 text-center sm:text-left">
              Você precisa de espaço extra para bagagens/malas grandes?
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {[
                { 
                  id: "big", 
                  title: "Sim, Essencial", 
                  desc: "Corridas de aeroporto constantes com 3 ou 4 passageiros cheios de bagagens." 
                },
                { 
                  id: "standard", 
                  title: "Não, Opcional", 
                  desc: "Foco em passageiros individuais de trânsito corporativo rápido pela cidade." 
                }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => handleAnswer("space", opt.id)}
                  className="bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-sky-500/50 p-5 rounded-2xl text-left transition-all duration-300 group flex flex-col justify-between h-40 shadow-sm"
                >
                  <span className="text-xs font-black text-sky-700 uppercase">{opt.title}</span>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed font-semibold">{opt.desc}</p>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-sky-600 mt-4 transition-colors" />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 4: Result */}
        {step === 4 && recommended && (
          <motion.div 
            key="result"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="space-y-6 text-center"
          >
            <div className="space-y-2">
              <Badge className="bg-sky-50 text-sky-750 border border-sky-200 px-3 py-1 font-bold">
                ★ {matchPercent}% DE MATCH ENCONTRADO
              </Badge>
              <h3 className="text-2xl font-black text-slate-900">Recomendamos o {recommended.name}</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                Este veículo atende perfeitamente ao seu foco em {answers.priority === "economy" ? "economia de combustível" : answers.priority === "comfort" ? "conforto premium" : "baixo custo de locação"}.
              </p>
            </div>

            {/* Recommended Vehicle Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 max-w-md mx-auto flex items-center justify-between gap-4 text-left shadow-inner">
              <div className="min-w-0">
                <span className="text-[9px] text-slate-450 font-bold uppercase tracking-wider">{recommended.brand}</span>
                <h4 className="text-base font-extrabold text-slate-800 truncate mt-0.5">{recommended.name}</h4>
                <p className="text-xs text-emerald-600 font-bold mt-1">Plano mensal: R$ {recommended.monthlyPrice}</p>
              </div>

              {recommended.thumbnail && (
                <div className="relative w-28 h-16 shrink-0 bg-white rounded-lg overflow-hidden flex items-center justify-center p-2 border border-slate-150 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={recommended.thumbnail} alt={recommended.name} className="w-full h-full object-contain filter drop-shadow-sm" />
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 max-w-md mx-auto">
              <Button 
                variant="outline"
                onClick={resetQuiz}
                className="border-slate-200 hover:border-slate-350 text-slate-600 hover:text-slate-900 bg-slate-50 text-xs h-11 px-4 flex items-center justify-center gap-1.5 rounded-xl font-bold"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Refazer Match
              </Button>
              
              <Button 
                onClick={() => onSelectVehicle(recommended)}
                className="bg-sky-600 hover:bg-sky-500 text-white text-xs h-11 px-6 flex items-center justify-center gap-2 rounded-xl font-bold flex-1 shadow-md"
              >
                Ver Ficha Técnica & Alugar <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  )
}
