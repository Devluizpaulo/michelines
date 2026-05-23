"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowRight,
  CheckCircle2,
  FileCheck,
  GraduationCap,
  HelpCircle,
  type LucideIcon,
  MapPin,
  Sparkles,
  UserCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface StepProps {
  number: number
  title: string
  description: string
  icon: LucideIcon
  isActive: boolean
  onClick: () => void
  isCompleted: boolean
}

const Step = ({ number, title, description, icon: Icon, isActive, onClick, isCompleted }: StepProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: number * 0.1 }}
      className={`relative flex cursor-pointer transition-all duration-300 ${
        isActive ? "scale-105" : "hover:scale-102"
      }`}
      onClick={onClick}
    >
      {/* Linha conectora */}
      {number < 5 && (
        <div className="absolute left-6 top-12 h-full w-0.5 bg-gray-200">
          <div
            className="h-full bg-yellow-400 transition-all duration-700 ease-out"
            style={{ height: isCompleted ? "100%" : "0%" }}
          />
        </div>
      )}

      {/* Círculo numerado */}
      <div
        className={`relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 text-xl font-bold ${
          isActive
            ? "border-yellow-400 bg-yellow-400 text-blue-900"
            : isCompleted
              ? "border-yellow-400 bg-white text-blue-900"
              : "border-gray-300 bg-white text-gray-400"
        }`}
      >
        {isCompleted ? <CheckCircle2 className="h-6 w-6 text-yellow-500" /> : number}
      </div>

      {/* Conteúdo */}
      <div className={`ml-4 ${isActive ? "text-blue-900" : "text-gray-600"}`}>
        <h3 className={`text-lg font-bold ${isActive ? "text-blue-900" : "text-gray-700"}`}>{title}</h3>
        <p className={`mt-1 text-sm ${isActive ? "text-blue-800" : "text-gray-500"}`}>{description}</p>

        {isActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
            className="mt-3 flex items-center gap-2 rounded-lg bg-blue-50 p-3"
          >
            <Icon className="h-5 w-5 text-blue-600" />
            <p className="text-sm text-blue-700">
              {number === 1 && "A Micheline's te ajuda a verificar se você atende todos os requisitos. Sem burocracia!"}
              {number === 2 && "Indicamos as melhores escolas credenciadas e você ainda ganha desconto especial!"}
              {number === 3 && "Nosso time te orienta em todo o processo para conseguir seu Condutax rapidinho."}
              {number === 4 && "Enquanto seu Condutax não sai, você já pode se preparar com a gente!"}
              {number === 5 && "Liberdade, autonomia e mais ganhos te esperam. Vamos nessa?"}
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default function ComoSerTaxista() {
  const [activeStep, setActiveStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const handleStepClick = (step: number) => {
    setActiveStep(step)

    // Marca como concluídos todos os passos anteriores
    const newCompletedSteps = [...Array(step - 1)].map((_, i) => i + 1)
    setCompletedSteps(newCompletedSteps)
  }

  const handleNextStep = () => {
    if (activeStep < 5) {
      setActiveStep(activeStep + 1)
      setCompletedSteps([...completedSteps, activeStep])
    }
  }

  const steps = [
    {
      number: 1,
      title: "Se liga nos requisitos",
      description: "Ser maior de 18 anos, ter CNH com EAR, e não ter antecedentes.",
      icon: UserCheck,
    },
    {
      number: 2,
      title: "Faz o curso na escola credenciada",
      description: "A Micheline's indica onde fazer com desconto e tudo.",
      icon: GraduationCap,
    },
    {
      number: 3,
      title: "Conquista seu Condutax",
      description: "É o documento oficial pra você rodar como taxista. A gente te ajuda com isso.",
      icon: FileCheck,
    },
    {
      number: 4,
      title: "TUDO PRONTO",
      description: "Você já pode alugar um carro com a Micheline's antes mesmo de sair com o Condutax!",
      icon: CheckCircle2,
    },
    {
      number: 5,
      title: "Bora rodar",
      description: "Agora é só partir pra cima — com liberdade, autonomia e mais ganhos.",
      icon: Sparkles,
    },
  ]

  return (
    <section className="relative overflow-hidden bg-white py-16 md:py-24">
      {/* Elementos decorativos */}
      <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-yellow-400 opacity-10"></div>
      <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-blue-400 opacity-10"></div>

      <div className="container relative z-10 px-4 md:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
                Quer virar taxista em SP?
                <span className="text-yellow-500 block md:inline"> A gente te mostra o caminho das pedras! 🚕</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Mesmo que você nunca tenha dirigido um táxi na vida, dá pra começar sim! E com a Micheline's fica tudo
                mais fácil.
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-5 gap-6 md:gap-0 mb-12">
            <div className="md:col-span-3 space-y-8 md:pr-8">
              {steps.map((step) => (
                <Step
                  key={step.number}
                  number={step.number}
                  title={step.title}
                  description={step.description}
                  icon={step.icon}
                  isActive={activeStep === step.number}
                  onClick={() => handleStepClick(step.number)}
                  isCompleted={completedSteps.includes(step.number)}
                />
              ))}
            </div>

            <div className="md:col-span-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="sticky top-24 bg-blue-50 rounded-2xl p-6 shadow-lg border border-blue-100"
              >
                <div className="flex items-center gap-3 mb-4">
                  <HelpCircle className="h-8 w-8 text-blue-600" />
                  <h3 className="text-xl font-bold text-blue-900">Tá com dúvidas?</h3>
                </div>

                <p className="text-blue-700 mb-4">
                  Relaxa! A maioria dos nossos motoristas também tinha quando começou. Veja o que o pessoal mais
                  pergunta:
                </p>

                <div className="space-y-3 mb-6">
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="font-medium text-blue-900">Quanto tempo leva pra conseguir o Condutax?</p>
                    <p className="text-sm text-gray-600">Em média 30 dias, mas a gente te ajuda a agilizar!</p>
                  </div>

                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="font-medium text-blue-900">Preciso ter carro próprio?</p>
                    <p className="text-sm text-gray-600">Não! A Micheline's aluga o táxi prontinho pra você.</p>
                  </div>

                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="font-medium text-blue-900">Quanto vou ganhar como taxista?</p>
                    <p className="text-sm text-gray-600">Em média 30% mais do que nos aplicativos convencionais!</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-yellow-100 rounded-lg mb-6">
                  <MapPin className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                  <p className="text-sm text-yellow-800">
                    Venha conhecer nossa sede! Temos café quentinho e um time pronto pra te ajudar.
                  </p>
                </div>

                <div className="text-center">
                  <Link href="/cadastro">
                    <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-bold">
                      Quero virar taxista com a Micheline's
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-blue-900 rounded-2xl p-6 md:p-8">
            <div className="text-white">
              <h3 className="text-xl md:text-2xl font-bold mb-2">Ainda tá na dúvida?</h3>
              <p className="text-blue-100">
                Vem bater um papo com quem já passou por isso. Nossos consultores são ex-motoristas de app que viraram
                taxistas!
              </p>
            </div>

            <div className="flex gap-4">
              <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50" onClick={handleNextStep}>
                Ver próximo passo
              </Button>

              <Link href="/cadastro">
                <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-bold">
                  Me mostra o caminho completo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
