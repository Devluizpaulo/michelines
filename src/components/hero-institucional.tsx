"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import {
  Award,
  Calendar,
  Clock,
  Coffee,
  CreditCard,
  FileCheck,
  Gauge,
  ShieldCheck,
  Smile,
  Users,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const glowAnimation = `
  @keyframes pulseGlow {
    0%, 100% { opacity: 0.4; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(1.1); }
  }
`;

const bgPattern = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
  backgroundSize: "24px 24px",
}

const benefitsTaxista = [
  {
    icon: <Smile className="h-5 w-5 text-yellow-500" />,
    text: "Liberdade total (sem algoritmos, sem bloqueios)",
  },
  {
    icon: <Calendar className="h-5 w-5 text-yellow-500" />,
    text: "Sem rodízio: trabalhe todos os dias",
  },
  {
    icon: <Gauge className="h-5 w-5 text-yellow-500" />,
    text: "Acesso ao corredor de ônibus (30-40% mais rápido)",
  },
  {
    icon: <Users className="h-5 w-5 text-yellow-500" />,
    text: "Fidelização de clientes e autonomia de ganhos",
  },
]

const benefitsEmpresa = [
  {
    icon: <FileCheck className="h-5 w-5 text-yellow-500" />,
    text: "Suporte completo com documentação, formação e consultoria",
  },
  {
    icon: <ShieldCheck className="h-5 w-5 text-yellow-500" />,
    text: "Frota moderna e revisada",
  },
  {
    icon: <Coffee className="h-5 w-5 text-yellow-500" />,
    text: "Espaço de descanso com café e TV",
  },
  {
    icon: <CreditCard className="h-5 w-5 text-yellow-500" />,
    text: "Pagamento facilitado (PIX, cartão, dinheiro)",
  },
  {
    icon: <Award className="h-5 w-5 text-yellow-500" />,
    text: "Isenção de diárias aos domingos e feriados",
  },
]

export default function HeroInstitucional() {
  return (
    <section className="relative overflow-hidden bg-[#0A192F] py-16 md:py-24">
      {/* Animated glowing orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[120px] mix-blend-screen animate-[pulseGlow_8s_ease-in-out_infinite]" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[150px] mix-blend-screen animate-[pulseGlow_12s_ease-in-out_infinite_reverse]" />
      <style>{glowAnimation}</style>
      
      {/* Fundo decorativo sutil */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={bgPattern} />
      </div>

      <div className="container relative z-10 px-4 md:px-6 grid gap-8 md:grid-cols-2 items-center">
        {/* Texto principal e benefícios */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              Você já decidiu mudar. <br />
              <span className="text-yellow-400">A Michelines te ajuda a transformar.</span>
            </h1>

            <p className="text-lg md:text-xl text-blue-100">
              Oferecemos suporte completo para sua migração do aplicativo para o táxi, com formação, consultoria,
              documentação e toda a segurança que você e sua família merecem.
            </p>
          </motion.div>

          {/* Vantagens de ser taxista */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 space-y-4"
          >
            <h3 className="text-xl font-semibold text-white">Vantagens de ser taxista:</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {benefitsTaxista.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
                  className="flex items-start gap-2"
                >
                  <div className="mt-0.5 flex-shrink-0 bg-white/20 rounded-full p-1">{item.icon}</div>
                  <p className="text-sm text-blue-50">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Benefícios da empresa */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 space-y-4"
          >
            <h3 className="text-xl font-semibold text-white">Benefícios exclusivos da Michelines:</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {benefitsEmpresa.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
                  className="flex items-start gap-2"
                >
                  <div className="mt-0.5 flex-shrink-0 bg-white/20 rounded-full p-1">{item.icon}</div>
                  <p className="text-sm text-blue-50">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Botões de ação */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col sm:flex-row sm:items-center gap-4 mt-6"
          >
            <Link href="/cadastro" aria-label="Iniciar o cadastro na Michelines">
              <Button
                size="lg"
                className="group relative overflow-hidden bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-blue-950 font-extrabold text-lg px-8 py-6 rounded-2xl shadow-[0_0_40px_rgba(234,179,8,0.3)] transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative z-10 flex items-center gap-2">
                  Comece sua nova fase
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>

            <Link href="#contato" aria-label="Falar com um consultor da Michelines">
              <Button
                size="lg"
                variant="ghost"
                className="text-white hover:text-yellow-400 border border-white hover:border-yellow-400 px-8 py-6 rounded-xl transition-all duration-300"
              >
                Fale com um consultor
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Imagem lateral com destaque */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative hidden md:block"
        >
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
            <Image
              src="/placeholder.svg?height=600&width=800"
              alt="Motorista de táxi com sua família sorrindo feliz"
              width={800}
              height={600}
              className="w-full h-auto object-cover"
              loading="lazy"
              priority={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="bg-yellow-500 text-blue-900 font-bold px-4 py-2 rounded-full inline-block mb-3">
                45 anos de tradição
              </div>
              <p className="text-white text-lg font-medium">
                "Mudei para o táxi e recuperei minha qualidade de vida e tempo com minha família."
              </p>
              <p className="text-white/80 mt-1">Carlos Silva, taxista há 2 anos</p>
            </div>
          </div>

          <div className="absolute -bottom-6 -right-6 bg-white rounded-xl p-4 shadow-xl">
            <div className="flex items-center gap-3">
              <Clock className="h-10 w-10 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Tempo médio para se tornar taxista</p>
                <p className="text-xl font-bold text-blue-900">30 dias</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Faixa decorativa inferior */}
      <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 opacity-90" />
    </section>
  )
}
