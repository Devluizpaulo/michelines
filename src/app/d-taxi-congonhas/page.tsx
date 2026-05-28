"use client"

import { useLandingSettings } from "@/hooks/useLandingSettings"
import { Navbar } from "@/components/home/navbar/Navbar"
import { Footer } from "@/components/home/footer/Footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import {
  Plane,
  ShieldCheck,
  CheckCircle,
  FileText,
  Sparkles,
  TrendingUp,
  Zap,
  ArrowRight,
  MessageSquare,
} from "lucide-react"

export default function DTaxiCongonhasPage() {
  const { landingSettings } = useLandingSettings()

  const waPhone = "5511944830851"

  const waText = encodeURIComponent(
    "Olá! Tenho interesse na locação de um veículo para trabalhar na D-Taxi Congonhas. Gostaria de saber os modelos disponíveis e as condições."
  )

  const waUrl = `https://wa.me/${waPhone}?text=${waText}`

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#F8FAFC] font-sans text-slate-900 selection:bg-sky-600 selection:text-white">
      <Navbar landingSettings={landingSettings} />

      <main className="flex-1 pt-32 pb-24">
        {/* HERO */}
        <section className="container relative z-10 mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            {/* LEFT */}
            <div className="space-y-6 text-left lg:col-span-7">
              <Badge className="flex w-fit items-center gap-1.5 border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sky-700 shadow-xs">
                <Plane className="h-3.5 w-3.5 text-sky-600" />
                Operação Oficial Congonhas
              </Badge>

              <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900 md:text-6xl">
                Alugue um veículo executivo e fature alto em Congonhas.
              </h1>

              <p className="text-lg font-medium leading-relaxed text-slate-600">
                Trabalhe com veículos premium híbridos e GNV já credenciados
                para operação na D-Taxi Congonhas. Acesse a fila digital
                exclusiva e transporte clientes corporativos de alto ticket no
                segundo aeroporto mais movimentado do Brasil.
              </p>

              <div className="flex flex-wrap gap-3">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 font-bold text-white shadow-md hover:bg-emerald-500">
                    <MessageSquare className="h-4 w-4" />
                    Falar com Consultor
                  </Button>
                </a>

                <Link href="/cadastro" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="h-12 w-full rounded-2xl border-slate-200 px-6 font-bold text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  >
                    Fazer Pré-Cadastro Online
                  </Button>
                </Link>
              </div>

              {/* STATS */}
              <div className="grid grid-cols-3 gap-4 border-t border-slate-200 pt-6">
                <div>
                  <p className="text-2xl font-black text-slate-900 md:text-3xl">
                    25Mi
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Passageiros / Ano
                  </p>
                </div>

                <div>
                  <p className="text-2xl font-black text-slate-900 md:text-3xl">
                    R$ 15k
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Faturamento Médio
                  </p>
                </div>

                <div>
                  <p className="text-2xl font-black text-sky-600 md:text-3xl">
                    100%
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Operação Digital
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="relative lg:col-span-5">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(2,132,199,0.06),transparent_60%)]" />

              <div className="relative z-10 space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-sky-600" />
                    <span className="text-sm font-black text-slate-800">
                      D-Taxi Premium
                    </span>
                  </div>

                  <Badge className="border border-sky-100 bg-sky-50 text-[10px] font-bold uppercase text-sky-700">
                    Congonhas
                  </Badge>
                </div>

                <div className="relative h-[180px] w-full">
                  <Image
                    src="/images/cars/Cross Dtaxi.png"
                    alt="Toyota Corolla Cross Hybrid"
                    fill
                    className="object-contain drop-shadow-[0_15px_15px_rgba(15,23,42,0.1)]"
                  />
                </div>

                <div className="space-y-3">
                  <h3 className="text-center text-lg font-black text-slate-900">
                    Toyota Corolla Cross Híbrido
                  </h3>

                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="rounded-xl border border-slate-100 bg-slate-50 py-2 font-bold text-slate-700">
                      🔋 Híbrido Flex
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <span className="text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Diferenciais da Operação
                  </span>

                  <div className="flex flex-wrap justify-center gap-1.5">
                    <Badge
                      variant="outline"
                      className="border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-bold text-slate-600"
                    >
                      ✈️ Credenciado D-Taxi
                    </Badge>

                    <Badge
                      variant="outline"
                      className="border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-bold text-slate-600"
                    >
                      💼 Operação Executiva
                    </Badge>

                    <Badge
                      variant="outline"
                      className="border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-bold text-slate-600"
                    >
                      🔋 Híbrido Premium
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BENEFÍCIOS */}
        <section className="mt-24 border-y border-slate-200 bg-white py-20">
          <div className="container mx-auto max-w-6xl space-y-12 px-6">
            <div className="mx-auto max-w-2xl space-y-3 text-center">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 md:text-4xl">
                Vantagens operacionais que aumentam sua margem
              </h2>

              <p className="text-sm font-semibold text-slate-600 md:text-base">
                Muito mais que economia de combustível: a D-Taxi entrega uma
                operação preparada para alta performance.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <div className="w-fit rounded-2xl border border-sky-100 bg-sky-50 p-3 text-sky-600">
                  <TrendingUp className="h-5 w-5" />
                </div>

                <h3 className="text-lg font-black text-slate-800">
                  Corridas com Ticket Elevado
                </h3>

                <p className="text-xs font-semibold leading-relaxed text-slate-600 md:text-sm">
                  As corridas partindo de Congonhas possuem ticket médio acima
                  das corridas convencionais da cidade, com foco em clientes
                  corporativos e executivos.
                </p>
              </div>

              <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <div className="w-fit rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-emerald-600">
                  <Zap className="h-5 w-5" />
                </div>

                <h3 className="text-lg font-black text-slate-800">
                  Economia Operacional
                </h3>

                <p className="text-xs font-semibold leading-relaxed text-slate-600 md:text-sm">
                  Veículos híbridos e modelos com GNV reduzem significativamente
                  os custos diários com combustível.
                </p>
              </div>

              <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <div className="w-fit rounded-2xl border border-amber-100 bg-amber-50 p-3 text-amber-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <h3 className="text-lg font-black text-slate-800">
                  Operação Simplificada
                </h3>

                <p className="text-xs font-semibold leading-relaxed text-slate-600 md:text-sm">
                  Os veículos já estão preparados para operação na D-Taxi,
                  permitindo início rápido das atividades.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* REQUISITOS */}
        <section className="container mx-auto mt-24 max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="space-y-6 text-left lg:col-span-6">
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-sky-600">
                  Como ingressar
                </span>

                <h2 className="text-2xl font-black tracking-tight text-slate-900 md:text-4xl">
                  Requisitos para operar na D-Taxi
                </h2>

                <p className="text-xs font-semibold leading-relaxed text-slate-600 md:text-sm">
                  Para atuar na operação executiva da D-Taxi Congonhas, é
                  necessário atender aos critérios abaixo:
                </p>
              </div>

              <div className="space-y-4 pt-2">
                {[
                  {
                    title: "CNH Regularizada com EAR",
                    text: "Exercício de Atividade Remunerada registrado na habilitação.",
                  },
                  {
                    title: "Cadastro Municipal de Condutor (CONDUTAX)",
                    text: "Documento oficial ativo para motoristas de táxi na capital paulista.",
                  },
                  {
                    title: "Análise Cadastral Aprovada",
                    text: "Avaliação interna de perfil profissional e documentação.",
                  },
                  {
                    title: "Padrão de Atendimento Executivo",
                    text: "Compromisso com cordialidade, apresentação pessoal e qualidade no atendimento.",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />

                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">
                        {item.title}
                      </h4>

                      <p className="text-xs font-semibold text-slate-500">
                        {item.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* BOX */}
            <div className="space-y-6 rounded-3xl border border-slate-200 bg-slate-50 p-8 lg:col-span-6">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-sky-600" />

                <h3 className="text-lg font-black text-slate-800">
                  Operação pronta para começar
                </h3>
              </div>

              <p className="text-xs font-semibold leading-relaxed text-slate-600 md:text-sm">
                Os veículos disponibilizados pela frota já estão devidamente
                preparados e aptos para operação na D-Taxi Congonhas. Nossa
                equipe auxilia o motorista em todo o processo de ativação e
                documentação necessária para início das atividades.
              </p>

              <div className="space-y-1 rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
                  Suporte Michelines
                </p>

                <p className="text-xs font-black text-slate-800">
                  IPVA, licenciamento e suporte operacional inclusos na locação.
                </p>
              </div>

              <Link href="/cadastro" className="block">
                <Button className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-sky-600 text-xs font-bold text-white hover:bg-sky-500">
                  Iniciar Cadastro Agora
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}