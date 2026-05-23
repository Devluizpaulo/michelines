import { Check, X, Zap, Award, Shield } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function Advantages() {
  return (
    <section id="vantagens" className="w-full py-20 lg:py-32 bg-slate-50 border-t border-slate-200 relative select-none">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="bg-sky-50 text-sky-700 px-3.5 py-1 rounded-full text-xs font-bold mb-4 border border-sky-200 shadow-xs hover:bg-sky-100/50">
            Estudo de Viabilidade
          </Badge>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Por que o Táxi fatura mais?
          </h2>
          <p className="text-base md:text-lg text-slate-600 font-medium">
            A resposta não está apenas na tarifa, mas na economia de tempo e na isenção de regras abusivas.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
          
          {/* Tabela de Comparação Visual */}
          <div className="bg-white border border-slate-250 rounded-3xl p-6 md:p-8 shadow-sm">
            <h3 className="text-lg font-black text-slate-800 mb-6">Comparação no trânsito de São Paulo</h3>
            
            <div className="space-y-4">
              {[
                { item: "Uso do Corredor de Ônibus", taxi: true, app: false },
                { item: "Fila Exclusiva em Congonhas (D-Taxi)", taxi: true, app: false },
                { item: "Isenção Completa de Rodízio", taxi: true, app: false },
                { item: "Fidelização de Clientes Físicos", taxi: true, app: false },
                { item: "Taxa de Intermediação sobre a Corrida", taxi: "0% (100% seu)", app: "Até 40%" },
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
                <h4 className="text-base md:text-lg font-black text-slate-800 mb-1">Ganhe tempo rodando nos corredores</h4>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-semibold">
                  Corredores de ônibus reduzem o tempo no trânsito em até 45%. Faça mais corridas por hora e gaste menos combustível.
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-3xl flex gap-4 hover:border-emerald-500/20 transition-all shadow-xs">
              <div className="bg-emerald-50 text-emerald-600 border border-emerald-100 p-3 rounded-2xl h-fit">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-base md:text-lg font-black text-slate-800 mb-1">DTaxi: Fila rápida em Congonhas</h4>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-semibold">
                  Acesso livre à fila prioritária de Congonhas. Menos tempo parado no pátio e maior conexão com passageiros de alta rentabilidade.
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-3xl flex gap-4 hover:border-amber-500/20 transition-all shadow-xs">
              <div className="bg-amber-50 text-amber-600 border border-amber-100 p-3 rounded-2xl h-fit">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-base md:text-lg font-black text-slate-800 mb-1">Manutenção e seguro inclusos</h4>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-semibold">
                  Sinistros, revisões e IPVA são de nossa inteira responsabilidade. Em caso de imprevisto, você recebe um veículo reserva imediato.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
