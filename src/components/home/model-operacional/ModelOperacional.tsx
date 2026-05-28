"use client"

import Link from "next/link"

import {
  Calendar,
  CreditCard,
  Clock,
  Sliders,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import { motion } from "framer-motion"

export function ModelOperacional() {
  const daysOfWeek = [
    { name: "Seg", active: true },
    { name: "Ter", active: true },
    { name: "Qua", active: true },
    { name: "Qui", active: true },
    { name: "Sex", active: true },
    { name: "Sáb", active: true },
    { name: "Dom", active: false },
  ]

  return (
    <section
      id="modelo-operacional"
      className="relative w-full overflow-hidden border-t border-slate-100 bg-white py-20 lg:py-32 select-none"
    >
      {/* BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(2,132,199,0.02),transparent_60%)]" />

      <div className="container relative z-10 mx-auto px-6">
        
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          viewport={{ once: true }}
          className="mx-auto mb-16 max-w-3xl space-y-4 text-center"
        >
          <Badge className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
            Operação Flexível
          </Badge>

          <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-900 md:text-5xl">
            Trabalhe no seu ritmo.
            <br />
            Sem burocracia desnecessária.
          </h2>

          <p className="text-base font-medium leading-relaxed text-slate-600 md:text-lg">
            Uma estrutura operacional pensada para motoristas que
            precisam de flexibilidade, previsibilidade financeira e
            liberdade para trabalhar com tranquilidade.
          </p>
        </motion.div>

        {/* MAIN GRID */}
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-12">
          
          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            viewport={{ once: true }}
            className="space-y-6 lg:col-span-5"
          >
            <div className="space-y-6 rounded-3xl border border-slate-200/60 bg-slate-50 p-6 shadow-sm md:p-8">
              
              {/* TOP */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sky-600">
                  <Calendar className="h-5 w-5" />

                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                    Funcionamento da Operação
                  </h3>
                </div>

                <h4 className="text-xl font-extrabold text-slate-900">
                  Mais liberdade para trabalhar
                </h4>

                <p className="text-xs font-semibold leading-relaxed text-slate-500">
                  A operação foi estruturada para oferecer mais
                  equilíbrio financeiro ao motorista, com domingos e
                  feriados livres de cobrança de diária.
                </p>
              </div>

              {/* WEEK GRID */}
              <div className="grid grid-cols-7 gap-2 pt-2 text-center">
                {daysOfWeek.map((day, idx) => (
                  <div
                    key={idx}
                    className={`flex h-20 flex-col justify-between rounded-xl border p-2.5 transition-all ${
                      day.active
                        ? "border-slate-200 bg-white text-slate-700 shadow-xs"
                        : "border-emerald-200/80 bg-emerald-50/70 text-emerald-800"
                    }`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-wider">
                      {day.name}
                    </span>

                    <div className="flex flex-col items-center">
                      {day.active ? (
                        <>
                          <span className="text-[9px] font-bold leading-none text-slate-400">
                            Operação
                          </span>

                          <span className="mt-0.5 text-[8px] font-bold text-slate-500/70">
                            Diária
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-[9px] font-black uppercase tracking-widest leading-none text-emerald-600">
                            Livre
                          </span>

                          <span className="mt-0.5 text-[8px] font-bold text-emerald-600/70">
                            Sem diária
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* SUPPORT BOX */}
              <div className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="h-fit rounded-xl border border-emerald-100 bg-emerald-50 p-2.5 text-emerald-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-slate-800">
                    Domingos e feriados sem cobrança
                  </h5>

                  <p className="text-[10px] font-semibold leading-relaxed text-slate-550">
                    Todo o faturamento realizado nesses períodos fica
                    integralmente com o motorista.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            viewport={{ once: true }}
            className="space-y-6 lg:col-span-7"
          >
            
            {/* CARD 1 */}
            <div className="flex gap-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6 transition-all duration-300 hover:border-slate-300 hover:bg-slate-50">
              <div className="h-fit shrink-0 rounded-2xl border border-sky-100 bg-sky-50 p-3 text-sky-600">
                <Clock className="h-6 w-6" />
              </div>

              <div className="space-y-1.5">
                <h4 className="text-base font-extrabold text-slate-800">
                  Pagamento Flexível
                </h4>

                <p className="text-xs font-bold uppercase tracking-wider text-sky-600">
                  Diário • Semanal • Mensal
                </p>

                <p className="text-xs font-semibold leading-relaxed text-slate-500">
                  Escolha a forma de pagamento que melhor se adapta à
                  sua rotina financeira e ao seu fluxo de caixa.
                </p>
              </div>
            </div>

            {/* CARD 2 */}
            <div className="flex gap-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6 transition-all duration-300 hover:border-slate-300 hover:bg-slate-50">
              <div className="h-fit shrink-0 rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-emerald-600">
                <CreditCard className="h-6 w-6" />
              </div>

              <div className="space-y-1.5">
                <h4 className="text-base font-extrabold text-slate-800">
                  Facilidade no Pagamento
                </h4>

                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Pix • Débito • Crédito
                </p>

                <p className="text-xs font-semibold leading-relaxed text-slate-500">
                  Pagamentos simples e rápidos para facilitar o dia a
                  dia da operação.
                </p>
              </div>
            </div>

            {/* CARD 3 */}
            <div className="flex gap-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6 transition-all duration-300 hover:border-slate-300 hover:bg-slate-50">
              <div className="h-fit shrink-0 rounded-2xl border border-indigo-100 bg-indigo-50 p-3 text-indigo-600">
                <Sliders className="h-6 w-6" />
              </div>

              <div className="space-y-1.5">
                <h4 className="text-base font-extrabold text-slate-800">
                  Mais autonomia para trabalhar
                </h4>

                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Sem metas abusivas
                </p>

                <p className="text-xs font-semibold leading-relaxed text-slate-500">
                  Você escolhe seus horários, regiões de atuação e
                  ritmo de trabalho com total liberdade operacional.
                </p>
              </div>
            </div>

            {/* CARD 4 */}
            <div className="flex gap-5 rounded-2xl border border-slate-200/80 bg-gradient-to-r from-sky-50/70 to-white p-6">
              <div className="h-fit shrink-0 rounded-2xl border border-sky-100 bg-white p-3 text-sky-600 shadow-sm">
                <Sparkles className="h-6 w-6" />
              </div>

              <div className="space-y-1.5">
                <h4 className="text-base font-extrabold text-slate-800">
                  Suporte operacional incluso
                </h4>

                <p className="text-xs font-semibold leading-relaxed text-slate-500">
                  Conte com apoio da frota e manutenção preventiva
                  para rodar com mais tranquilidade e segurança.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          viewport={{ once: true }}
          className="mx-auto mt-16 max-w-xl space-y-4 text-center"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Processo simples e rápido
          </p>

          <Link href="/cadastro" className="inline-block">
            <Button className="flex h-11 items-center gap-2 rounded-xl bg-sky-600 px-6 py-5 text-xs font-bold text-white shadow-md transition-all hover:bg-sky-500">
              Iniciar Cadastro
              <ArrowRight className="h-4.5 w-4.5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}