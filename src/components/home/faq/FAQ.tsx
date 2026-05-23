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
      {/* FAQ Section */}
      <section id="faq" className="w-full py-20 lg:py-32 bg-white border-t border-slate-200 relative select-none">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-12 items-start max-w-6xl mx-auto">
            
            <div className="lg:col-span-5 space-y-6">
              <Badge className="bg-sky-50 text-sky-700 border border-sky-200 px-3.5 py-1 rounded-full text-xs font-bold shadow-xs">Perguntas Frequentes</Badge>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
                Restou alguma dúvida?
              </h2>
              <p className="text-base md:text-lg text-slate-600 leading-relaxed font-semibold">
                Selecionamos as perguntas mais comuns dos motoristas que estão migrando para o táxi. Caso precise de mais detalhes, clique no botão para chamar no WhatsApp.
              </p>
              <Link href="https://wa.me/5511944830851">
                <Button className="bg-sky-600 hover:bg-sky-500 text-white rounded-2xl font-bold px-8 h-12 mt-4 transition-all shadow-sm hover:shadow flex items-center gap-2">
                  Chamar no WhatsApp <Phone className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="lg:col-span-7 bg-white border border-slate-250 rounded-3xl p-6 md:p-8 shadow-sm">
              <Accordion type="single" collapsible className="w-full space-y-2">
                
                <AccordionItem value="item-1" className="border-b border-slate-100 py-2">
                  <AccordionTrigger className="text-left text-slate-800 font-extrabold hover:text-sky-600 transition-colors text-sm md:text-base hover:no-underline py-3">
                    Eu não tenho Condutax, posso alugar mesmo assim?
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 leading-relaxed font-semibold text-xs md:text-sm pt-2">
                    Sim! O Grupo Micheline's te assessora em todo o processo para obtenção do Condutax rápido. Temos parcerias com escolas de formação autorizadas com descontos exclusivos. Enquanto seu documento oficial é gerado pela Prefeitura, você já pode deixar seu cadastro pré-aprovado com a gente.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2" className="border-b border-slate-100 py-2">
                  <AccordionTrigger className="text-left text-slate-800 font-extrabold hover:text-sky-600 transition-colors text-sm md:text-base hover:no-underline py-3">
                    Vocês aceitam motoristas com restrição no nome (CPF negativado)?
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 leading-relaxed font-semibold text-xs md:text-sm pt-2">
                    Sim. A nossa análise de cadastro é flexível e focada no seu histórico de condução e na regularidade da sua CNH. Não exigimos score de crédito alto e oferecemos condições facilitadas para quem quer começar a trabalhar honestamente.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3" className="border-b border-slate-100 py-2">
                  <AccordionTrigger className="text-left text-slate-800 font-extrabold hover:text-sky-600 transition-colors text-sm md:text-base hover:no-underline py-3">
                    O que está incluso no valor do aluguel do carro?
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 leading-relaxed font-semibold text-xs md:text-sm pt-2">
                    Nossas locações são completas. Está incluso o seguro total contra colisões e terceiros, manutenção preventiva e corretiva completa, fornecimento do carro reserva em caso de quebras ou sinistros, e assessoria para renovação de alvarás e documentos. Você só se preocupa em abastecer e faturar.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4" className="border-b border-slate-100 py-2">
                  <AccordionTrigger className="text-left text-slate-800 font-extrabold hover:text-sky-600 transition-colors text-sm md:text-base hover:no-underline py-3">
                    Como funciona o acesso à fila prioritária de Congonhas?
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 leading-relaxed font-semibold text-xs md:text-sm pt-2">
                    Nossa frota com o selo D-Taxi é homologada e cadastrada no sistema digital do aeroporto de Congonhas. Isso te dá direito a ingressar na área de embarque de passageiros do aeroporto pela fila interna prioritária, reduzindo o tempo de espera nas vagas comuns e conectando você diretamente com passageiros corporativos de alto padrão.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5" className="border-b border-slate-100 py-2">
                  <AccordionTrigger className="text-left text-slate-800 font-extrabold hover:text-sky-600 transition-colors text-sm md:text-base hover:no-underline py-3">
                    Há fidelidade mínima no contrato?
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 leading-relaxed font-semibold text-xs md:text-sm pt-2">
                    Temos contratos flexíveis de acordo com a sua necessidade, com renovação semanal ou mensal simplificada. Você tem autonomia total para gerenciar seu tempo e planejar sua carreira sem contratos de gaveta abusivos.
                  </AccordionContent>
                </AccordionItem>

              </Accordion>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="w-full py-20 lg:py-32 bg-slate-50 relative overflow-hidden border-t border-slate-200 select-none">
        {/* Efeitos de luz corporativos sutis ao fundo */}
        <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/[0.01] rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/[0.01] rounded-full blur-[130px] pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto bg-white border border-slate-250 rounded-3xl p-8 md:p-16 text-center shadow-sm relative overflow-hidden">
            {/* Moldura de brilho sutil */}
            <div className="absolute inset-0 border border-sky-500/[0.02] rounded-3xl pointer-events-none" />
            
            <Badge className="bg-sky-50 text-sky-750 border border-sky-200 px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase mb-6 shadow-xs">
              Vagas Limitadas para este Lote de Veículos
            </Badge>

            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
              Chegou a hora de ter o controle do seu destino financeiro
            </h2>
            
            <p className="text-base md:text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed font-semibold">
              Garanta seu veículo pronto, homologado com GNV ou Híbrido, e comece a rodar no corredor em menos de 24 horas. Faturamento líquido superior garantido.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <Link href="/cadastro" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto h-14 px-10 text-xs md:text-sm bg-sky-600 hover:bg-sky-500 text-white font-extrabold rounded-2xl shadow-sm hover:shadow hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2">
                  Começar Cadastro Expresso <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="https://wa.me/5511944830851" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto h-14 px-10 text-xs md:text-sm rounded-2xl border-slate-200 hover:border-sky-350 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-all duration-300 flex items-center justify-center gap-2">
                  Iniciar pelo WhatsApp <Phone className="h-4 w-4 text-sky-600" />
                </Button>
              </Link>
            </div>

            {/* Badges de rodapé da CTA */}
            <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-10 mt-12 max-w-md mx-auto text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
              <div>✓ Sem taxa de cadastro</div>
              <div>✓ Suporte 24 horas</div>
              <div>✓ Retirada imediata</div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
