import { Check, X, Zap, Award, Shield } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function Advantages() {
  return (
    <section id="vantagens" className="w-full py-20 lg:py-32 bg-slate-50 border-t border-slate-200 relative select-none">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="bg-sky-50 text-sky-700 px-3.5 py-1 rounded-full text-xs font-bold mb-4 border border-sky-200 shadow-xs hover:bg-sky-100/50">
            Mobilidade Profissional
          </Badge>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Por que muitos profissionais escolhem o táxi?
          </h2>
          <p className="text-base md:text-lg text-slate-600 font-medium text-justify">
            Vantagens operacionais tangíveis que proporcionam tráfego livre, previsibilidade contratual e total autonomia nas ruas de São Paulo.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
          
          {/* Tabela de Comparação Visual */}
          <div className="bg-white border border-slate-250 rounded-3xl p-6 md:p-8 shadow-sm">
            <h3 className="text-lg font-black text-slate-800 mb-6">Comparação no trânsito de São Paulo</h3>
            
            <div className="space-y-4">
              {[
                { item: "Uso do Corredor de Ônibus", taxi: true, app: false },
                { item: "Acesso a Terminais de Embarque Rápido", taxi: true, app: false },
                { item: "Isenção Completa de Rodízio SP", taxi: true, app: false },
                { item: "Fidelização de Passageiros Físicos", taxi: true, app: false },
                { item: "Taxa de Intermediação por Corrida", taxi: "0% (100% seu)", app: "Até 40%" },
                { item: "Cancelamentos arbitrários de conta", taxi: "Não ocorre", app: "Frequente" }
              ].map((row, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-3 py-3 border-b border-slate-100 text-xs md:text-sm items-center font-semibold">
                  <div className="col-span-6 text-slate-600 font-bold">{row.item}</div>
                  <div className="col-span-3 text-center font-extrabold text-sky-600 flex justify-center">
                    {typeof row.taxi === "boolean" ? (row.taxi ? <Check className="h-5 w-5 text-emerald-500 font-black" /> : <X className="h-5 w-5 text-red-500" />) : row.taxi}
                  </div>
                  <div className="col-span-3 text-center font-semibold text-slate-400 flex justify-center">
                    {typeof row.app === "boolean" ? (row.app ? <Check className="h-5 w-5 text-emerald-500" /> : <X className="h-5 w-5 text-red-500" />) : row.app}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detalhes de Alto Valor */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 p-6 rounded-3xl flex gap-4 hover:border-sky-500/20 transition-all shadow-xs">
              <div className="bg-sky-50 text-sky-600 border border-sky-100 p-3 rounded-2xl h-fit">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-base md:text-lg font-black text-slate-800 mb-1">Tráfego em faixas e corredores exclusivos</h4>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-semibold text-justify">
                  Redução de até 45% do tempo no trânsito urbano, otimizando o consumo de combustível e aumentando o faturamento da hora trabalhada.
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-3xl flex gap-4 hover:border-emerald-500/20 transition-all shadow-xs">
              <div className="bg-emerald-50 text-emerald-600 border border-emerald-100 p-3 rounded-2xl h-fit">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-base md:text-lg font-black text-slate-800 mb-1">Acesso preferencial em áreas corporativas</h4>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-semibold text-justify">
                  Conexão direta com a demanda de passageiros executivos de alto ticket em polos hoteleiros e terminais aeroportuários preferenciais.
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-250 p-6 rounded-3xl flex gap-4 hover:border-amber-500/20 transition-all shadow-xs">
              <div className="bg-amber-50 text-amber-600 border border-amber-100 p-3 rounded-2xl h-fit">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-base md:text-lg font-black text-slate-800 mb-1">Estrutura e suporte integrado de frota</h4>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-semibold text-justify">
                  Mecânica preventiva rápida em oficina própria integrada, licenciamento e suporte integral inclusos para sua total tranquilidade.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
