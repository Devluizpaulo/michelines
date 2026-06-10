import Link from "next/link"
import { Phone, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export function FAQ() {
  return (
    <>
      {/* FAQ */}
      <section
        id="faq"
        className="relative w-full bg-transparent py-20 lg:py-32 select-none"
      >
        <div className="container mx-auto px-6">
          
          <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-12">
            
            {/* LEFT */}
            <div className="space-y-6 lg:col-span-5">
              
              <Badge className="rounded-full border border-white/10 bg-white/10 px-3.5 py-1 text-xs font-bold text-sky-200 shadow-xs">
                Perguntas Frequentes
              </Badge>

              <h2 className="text-3xl font-black leading-tight text-white md:text-5xl">
                Restou alguma dúvida?
              </h2>

              <p className="text-base font-semibold leading-relaxed text-sky-100/90 md:text-lg">
                Reunimos as dúvidas mais comuns dos motoristas que
                desejam iniciar na operação táxi com mais estrutura,
                praticidade e suporte operacional.
              </p>

              <Link
                href="https://wa.me/5511944830851"
                target="_blank"
              >
                <Button className="mt-4 flex h-12 items-center gap-2 rounded-2xl bg-sky-600 px-8 font-bold text-white shadow-sm transition-all hover:bg-sky-500 hover:shadow">
                  Chamar no WhatsApp
                  <Phone className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* FAQ */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8 lg:col-span-7">
              
              <Accordion
                type="single"
                collapsible
                className="w-full space-y-2"
              >
                
                {/* ITEM 1 */}
                <AccordionItem
                  value="item-1"
                  className="border-b border-slate-100 py-2"
                >
                  <AccordionTrigger className="py-3 text-left text-sm font-extrabold text-slate-800 transition-colors hover:text-sky-600 hover:no-underline md:text-base">
                    Eu não tenho Condutax. Posso iniciar mesmo assim?
                  </AccordionTrigger>

                  <AccordionContent className="pt-2 text-xs font-semibold leading-relaxed text-slate-600 md:text-sm">
                    Sim. Nossa equipe auxilia o motorista com as
                    orientações necessárias para regularização e
                    início da operação.
                  </AccordionContent>
                </AccordionItem>

                {/* ITEM 2 */}
                <AccordionItem
                  value="item-2"
                  className="border-b border-slate-100 py-2"
                >
                  <AccordionTrigger className="py-3 text-left text-sm font-extrabold text-slate-800 transition-colors hover:text-sky-600 hover:no-underline md:text-base">
                    Vocês aceitam motoristas com restrição no nome?
                  </AccordionTrigger>

                  <AccordionContent className="pt-2 text-xs font-semibold leading-relaxed text-slate-600 md:text-sm">
                    Sim. Nossa análise é flexível e considera o perfil
                    operacional do motorista e a regularidade da sua
                    documentação.
                  </AccordionContent>
                </AccordionItem>

                {/* ITEM 3 */}
                <AccordionItem
                  value="item-3"
                  className="border-b border-slate-100 py-2"
                >
                  <AccordionTrigger className="py-3 text-left text-sm font-extrabold text-slate-800 transition-colors hover:text-sky-600 hover:no-underline md:text-base">
                    O que está incluso na locação do veículo?
                  </AccordionTrigger>

                  <AccordionContent className="pt-2 text-xs font-semibold leading-relaxed text-slate-600 md:text-sm">
                    A locação inclui suporte operacional da frota,
                    manutenção preventiva e corretiva em oficina
                    própria, assistência 24 horas com guincho,
                    documentação regularizada, licenciamento e
                    impostos do veículo sob responsabilidade da
                    frota.
                    <br />
                    <br />
                    Em caso de sinistro, nossa equipe oferece suporte
                    operacional e orientação ao motorista.
                  </AccordionContent>
                </AccordionItem>

                {/* ITEM 4 */}
                <AccordionItem
                  value="item-4"
                  className="border-b border-slate-100 py-2"
                >
                  <AccordionTrigger className="py-3 text-left text-sm font-extrabold text-slate-800 transition-colors hover:text-sky-600 hover:no-underline md:text-base">
                    Como funciona a operação em Congonhas?
                  </AccordionTrigger>

                  <AccordionContent className="pt-2 text-xs font-semibold leading-relaxed text-slate-600 md:text-sm">
                    Os veículos da operação D-Taxi já estão
                    preparados para atuação na praça de Congonhas,
                    aproximando o motorista da demanda executiva e
                    de corridas corporativas de maior ticket.
                  </AccordionContent>
                </AccordionItem>

                {/* ITEM 5 */}
                <AccordionItem
                  value="item-5"
                  className="border-b border-slate-100 py-2"
                >
                  <AccordionTrigger className="py-3 text-left text-sm font-extrabold text-slate-800 transition-colors hover:text-sky-600 hover:no-underline md:text-base">
                    Existe fidelidade mínima no contrato?
                  </AccordionTrigger>

                  <AccordionContent className="pt-2 text-xs font-semibold leading-relaxed text-slate-600 md:text-sm">
                    Trabalhamos com contratos flexíveis e renovação
                    simplificada, permitindo mais autonomia para o
                    motorista organizar sua rotina operacional.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative w-full overflow-hidden bg-transparent py-20 lg:py-32 select-none">
        
        {/* LIGHT EFFECTS */}
        <div className="pointer-events-none absolute left-1/4 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-sky-500/[0.01] blur-[130px]" />

        <div className="pointer-events-none absolute right-1/4 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-blue-500/[0.01] blur-[130px]" />

        <div className="container relative z-10 mx-auto px-6">
          
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm md:p-16">
            
            <div className="pointer-events-none absolute inset-0 rounded-3xl border border-sky-500/[0.02]" />

            <Badge className="mb-6 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-sky-200 shadow-xs">
              Disponibilidade Limitada de Veículos
            </Badge>

            <h2 className="mb-6 text-3xl font-black leading-tight tracking-tight text-white md:text-5xl">
              Comece sua operação
              <br />
              com mais estrutura e suporte
            </h2>

            <p className="mx-auto mb-10 max-w-2xl text-base font-semibold leading-relaxed text-sky-100/90 md:text-lg">
              Tenha acesso a veículos preparados para operação
              executiva, suporte operacional da frota e estrutura
              completa para trabalhar com mais tranquilidade no dia
              a dia.
            </p>

            <div className="flex flex-col items-center justify-center gap-5 sm:flex-row">
              
              <Link
                href="/cadastro"
                className="w-full sm:w-auto"
              >
                <Button className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 px-10 text-xs font-extrabold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-sky-500 hover:shadow md:text-sm sm:w-auto">
                  Começar Cadastro
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link
                href="https://wa.me/5511944830851"
                target="_blank"
                className="w-full sm:w-auto"
              >
                <Button
                  variant="outline"
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border-slate-200 bg-slate-50 px-10 text-xs text-slate-700 transition-all duration-300 hover:border-sky-300 hover:bg-slate-100 md:text-sm sm:w-auto"
                >
                  Falar pelo WhatsApp
                  <Phone className="h-4 w-4 text-sky-600" />
                </Button>
              </Link>
            </div>

            {/* FOOTER BADGES */}
            <div className="mx-auto mt-12 grid max-w-md grid-cols-3 gap-4 border-t border-white/10 pt-10 text-[10px] font-extrabold uppercase tracking-wider text-sky-200/80">
              <div>✓ Sem taxa de cadastro</div>

              <div>✓ Assistência 24h</div>

              <div>✓ Suporte operacional</div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}