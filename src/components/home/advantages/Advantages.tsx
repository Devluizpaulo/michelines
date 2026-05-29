import { Check, X, Zap, Award, Shield } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function Advantages() {
  return (
    <section
      id="vantagens"
      className="relative w-full border-t border-slate-200 bg-slate-50 py-20 lg:py-32 select-none"
    >
      <div className="container mx-auto px-6">
        
        {/* HEADER */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <Badge className="mb-4 rounded-full border border-sky-200 bg-sky-50 px-3.5 py-1 text-xs font-bold text-sky-700 shadow-xs">
            Benefícios da Operação Táxi
          </Badge>

          <h2 className="mb-4 text-3xl font-black tracking-tight text-slate-900 md:text-5xl">
            Por que muitos motoristas
            <br />
            estão voltando para o táxi?
          </h2>

          <p className="text-base font-medium text-slate-600 md:text-lg">
            O táxi oferece vantagens reais no dia a dia de quem
            trabalha nas ruas de São Paulo, com mais mobilidade,
            menos limitações e maior autonomia operacional.
          </p>
        </div>

        {/* GRID */}
        <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-2">
          
          {/* COMPARISON */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            
            <h3 className="mb-6 text-lg font-black text-slate-800">
              Comparativo na prática
            </h3>

            <div className="space-y-4">
              {/* HEADERS */}
              <div className="grid grid-cols-12 items-center gap-3 border-b border-slate-200 pb-3 text-[10px] md:text-xs font-black uppercase tracking-wider text-slate-400">
                <div className="col-span-6">Vantagem</div>
                <div className="col-span-3 text-center text-sky-700 font-extrabold">Táxi Micheline's</div>
                <div className="col-span-3 text-center text-slate-400 font-bold">App Comum</div>
              </div>

              {[
                {
                  item: "Uso de corredores de ônibus",
                  taxi: true,
                  app: false,
                },

                {
                  item: "Acesso a áreas de embarque",
                  taxi: true,
                  app: false,
                },

                {
                  item: "Isenção de rodízio em São Paulo",
                  taxi: true,
                  app: false,
                },

                {
                  item: "Passageiros recorrentes",
                  taxi: true,
                  app: false,
                },

                {
                  item: "Comissão por corrida",
                  taxi: "100% da corrida",
                  app: "Até 40%",
                },

                {
                  item: "Risco de bloqueio de conta",
                  taxi: "Não ocorre",
                  app: "Frequente",
                },
              ].map((row, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 items-center gap-3 border-b border-slate-100 py-3 text-xs md:text-sm"
                >
                  {/* ITEM */}
                  <div className="col-span-6 font-bold text-slate-600">
                    {row.item}
                  </div>

                  {/* TAXI */}
                  <div className="col-span-3 flex justify-center text-center font-extrabold text-sky-600">
                    {typeof row.taxi === "boolean" ? (
                      row.taxi ? (
                        <Check className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <X className="h-5 w-5 text-red-500" />
                      )
                    ) : (
                      row.taxi
                    )}
                  </div>

                  {/* APP */}
                  <div className="col-span-3 flex justify-center text-center font-semibold text-slate-400">
                    {typeof row.app === "boolean" ? (
                      row.app ? (
                        <Check className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <X className="h-5 w-5 text-red-500" />
                      )
                    ) : (
                      row.app
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BENEFITS */}
          <div className="space-y-6">
            
            {/* CARD 1 */}
            <div className="flex gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs transition-all hover:border-sky-500/20">
              
              <div className="h-fit rounded-2xl border border-sky-100 bg-sky-50 p-3 text-sky-600">
                <Zap className="h-6 w-6" />
              </div>

              <div>
                <h4 className="mb-1 text-base font-black text-slate-800 md:text-lg">
                  Mais mobilidade no trânsito
                </h4>

                <p className="text-xs font-semibold leading-relaxed text-slate-600 md:text-sm">
                  Utilize corredores e faixas exclusivas para fazer
                  mais corridas em menos tempo e reduzir o desgaste
                  no trânsito diário.
                </p>
              </div>
            </div>

            {/* CARD 2 */}
            <div className="flex gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs transition-all hover:border-emerald-500/20">
              
              <div className="h-fit rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-emerald-600">
                <Award className="h-6 w-6" />
              </div>

              <div>
                <h4 className="mb-1 text-base font-black text-slate-800 md:text-lg">
                  Corridas de maior ticket
                </h4>

                <p className="text-xs font-semibold leading-relaxed text-slate-600 md:text-sm">
                  Maior presença em regiões corporativas, hotéis e
                  aeroportos com passageiros executivos e corridas
                  mais rentáveis.
                </p>
              </div>
            </div>

            {/* CARD 3 */}
            <div className="flex gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs transition-all hover:border-amber-500/20">
              
              <div className="h-fit rounded-2xl border border-amber-100 bg-amber-50 p-3 text-amber-600">
                <Shield className="h-6 w-6" />
              </div>

              <div>
                <h4 className="mb-1 text-base font-black text-slate-800 md:text-lg">
                  Suporte e manutenção da frota
                </h4>

                <p className="text-xs font-semibold leading-relaxed text-slate-600 md:text-sm">
                  Conte com oficina próxima, manutenção preventiva e
                  suporte operacional para reduzir o tempo do carro
                  parado.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}