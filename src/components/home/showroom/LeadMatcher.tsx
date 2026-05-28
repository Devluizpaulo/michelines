"use client"

import { useState } from "react"

import { Vehicle } from "@/types/vehicle"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import {
  Sparkles,
  ArrowRight,
  RefreshCw,
} from "lucide-react"

import { motion, AnimatePresence } from "framer-motion"

interface LeadMatcherProps {
  vehicles: Vehicle[]
  onSelectVehicle: (vehicle: Vehicle) => void
}

export function LeadMatcher({
  vehicles,
  onSelectVehicle,
}: LeadMatcherProps) {
  const [step, setStep] = useState(0)

  const [answers, setAnswers] = useState({
    profile: "",
    priority: "",
    space: "",
  })

  const [recommended, setRecommended] =
    useState<Vehicle | null>(null)

  const [matchPercent, setMatchPercent] =
    useState(95)

  // START
  const handleStart = () => {
    setStep(1)
  }

  // ANSWERS
  const handleAnswer = (
    field: string,
    value: string
  ) => {
    const updatedAnswers = {
      ...answers,
      [field]: value,
    }

    setAnswers(updatedAnswers)

    if (step < 3) {
      setStep((prev) => prev + 1)
    } else {
      calculateRecommendation(updatedAnswers)
    }
  }

  // RECOMMENDATION ENGINE
  const calculateRecommendation = (
    finalAnswers: typeof answers
  ) => {
    setStep(4)

    if (vehicles.length === 0) return

    let bestScore = -1
    let bestVehicle = vehicles[0]

    vehicles.forEach((car) => {
      let score = 0

      // OPERATION PROFILE
      if (
        finalAnswers.profile === "congonhas" &&
        car.isDTaxiApproved
      ) {
        score += 40
      }

      if (
        finalAnswers.profile === "urban" &&
        car.isHybrid
      ) {
        score += 30
      }

      if (
        finalAnswers.profile === "executive" &&
        car.category === "sedans"
      ) {
        score += 35
      }

      // PRIORITY
      if (
        finalAnswers.priority === "economy" &&
        (car.isHybrid || car.hasGNV)
      ) {
        score += 30
      }

      if (
        finalAnswers.priority === "comfort" &&
        car.category === "sedans"
      ) {
        score += 25
      }

      if (
        finalAnswers.priority === "cheap" &&
        car.category === "hatches"
      ) {
        score += 35
      }

      // SPACE
      if (
        finalAnswers.space === "big" &&
        (car.category === "sedans" ||
          car.name.toLowerCase().includes("spin"))
      ) {
        score += 30
      }

      if (
        finalAnswers.space === "standard" &&
        car.category === "hatches"
      ) {
        score += 15
      }

      if (score > bestScore) {
        bestScore = score
        bestVehicle = car
      }
    })

    // REALISTIC MATCH %
    const computedPercent = Math.min(
      85 + Math.floor(Math.random() * 14),
      99
    )

    setRecommended(bestVehicle)
    setMatchPercent(computedPercent)
  }

  // RESET
  const resetQuiz = () => {
    setStep(0)

    setAnswers({
      profile: "",
      priority: "",
      space: "",
    })

    setRecommended(null)
  }

  return (
    <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-md md:p-8">
      
      {/* BACKGROUND */}
      <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-sky-500/5 blur-3xl" />

      <AnimatePresence mode="wait">

        {/* INTRO */}
        {step === 0 && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6 py-6 text-center"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 shadow-sm">
              <Sparkles className="h-6 w-6 text-sky-600" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900 md:text-2xl">
                Recomendador Inteligente de Veículos
              </h3>

              <p className="mx-auto max-w-md text-sm font-medium leading-relaxed text-slate-600">
                Responda 3 perguntas rápidas e descubra qual
                veículo combina melhor com sua operação e seu
                perfil de locação.
              </p>
            </div>

            <Button
              onClick={handleStart}
              className="mx-auto flex h-12 items-center gap-2 rounded-xl bg-sky-600 px-6 text-xs font-bold text-white shadow-md hover:bg-sky-500"
            >
              Iniciar Recomendação
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <motion.div
            key="q1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>PASSO 1 DE 3</span>

              <span className="font-extrabold uppercase text-sky-600">
                Tipo de Operação
              </span>
            </div>

            <h4 className="text-center text-base font-extrabold text-slate-900 sm:text-left">
              Onde você pretende atuar com mais frequência?
            </h4>

            <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-3">
              {[
                {
                  id: "congonhas",
                  title: "Congonhas & Executivo",
                  desc: "Operação voltada para corridas corporativas e passageiros executivos.",
                },

                {
                  id: "urban",
                  title: "Rodagem Urbana",
                  desc: "Maior foco em economia e alta rotatividade durante o dia.",
                },

                {
                  id: "executive",
                  title: "Viagens & Conforto",
                  desc: "Operação premium com foco em conforto e corridas mais longas.",
                },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() =>
                    handleAnswer(
                      "profile",
                      option.id
                    )
                  }
                  className="group flex h-44 flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50 p-5 text-left shadow-sm transition-all duration-300 hover:border-sky-500/50 hover:bg-white"
                >
                  <span className="text-xs font-black uppercase text-sky-700">
                    {option.title}
                  </span>

                  <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-500">
                    {option.desc}
                  </p>

                  <ArrowRight className="mt-4 h-4 w-4 text-slate-400 transition-colors group-hover:text-sky-600" />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <motion.div
            key="q2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>PASSO 2 DE 3</span>

              <span className="font-extrabold uppercase text-sky-600">
                Prioridade
              </span>
            </div>

            <h4 className="text-center text-base font-extrabold text-slate-900 sm:text-left">
              O que é mais importante para você?
            </h4>

            <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-3">
              {[
                {
                  id: "economy",
                  title: "Economia",
                  desc: "Menor gasto possível com combustível e operação.",
                },

                {
                  id: "comfort",
                  title: "Conforto Premium",
                  desc: "Mais espaço, conforto e experiência para o passageiro.",
                },

                {
                  id: "cheap",
                  title: "Menor Investimento",
                  desc: "Começar com uma locação mais acessível.",
                },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() =>
                    handleAnswer(
                      "priority",
                      option.id
                    )
                  }
                  className="group flex h-44 flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50 p-5 text-left shadow-sm transition-all duration-300 hover:border-sky-500/50 hover:bg-white"
                >
                  <span className="text-xs font-black uppercase text-sky-700">
                    {option.title}
                  </span>

                  <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-500">
                    {option.desc}
                  </p>

                  <ArrowRight className="mt-4 h-4 w-4 text-slate-400 transition-colors group-hover:text-sky-600" />
                </button>
              ))}
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}