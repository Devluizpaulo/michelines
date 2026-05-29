import Image from "next/image"
import { Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const testimonialsData = [
  {
    name: "Carlos Santos",
    time: "Taxista há 1 ano",
    testimony: "Trabalhava 12h por dia no aplicativo. Quase metade do ganho ia para a taxa da plataforma e gasolina cara. No táxi da Micheline's com GNV e rodando no corredor, reduzi as horas de trabalho e ganho muito mais.",
    image: "/placeholder-user.jpg"
  },
  {
    name: "Juliana Souza",
    time: "Taxista há 8 meses",
    testimony: "Não sabia nada sobre táxi, nem tinha Condutax. O time do Grupo Micheline's me encaminhou para o curso, cuidou de toda a burocracia do documento e me deu segurança. Hoje tenho estabilidade financeira.",
    image: "/placeholder-user.jpg"
  },
  {
    name: "Marcos Pereira",
    time: "Taxista há 3 anos",
    testimony: "A grande sacada é a Spin da Micheline's na fila do aeroporto de Congonhas. Corridas de alto valor para hotéis e centros corporativos. Não fico parado nunca. Suporte mecânico deles é nota 10.",
    image: "/placeholder-user.jpg"
  }
]

export function Testimonials() {
  return (
    <section id="cases" className="w-full py-20 lg:py-32 bg-slate-50 border-t border-slate-200 relative select-none">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="bg-sky-50 text-sky-700 px-3.5 py-1 rounded-full text-xs font-bold mb-4 border border-sky-200 shadow-xs hover:bg-sky-100/50">
            Cases de Sucesso
          </Badge>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Quem mudou, não se arrepende
          </h2>
          <p className="text-base md:text-lg text-slate-600 font-medium text-justify">
            Histórias reais de motoristas que saíram do aperto dos aplicativos e mudaram de patamar de vida com a Micheline's.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonialsData.map((item, idx) => (
            <div 
              key={idx} 
              className="bg-white border border-slate-200 hover:border-sky-500/25 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col justify-between transition-all duration-300 group hover:-translate-y-1"
            >
              <div className="space-y-6">
                {/* Estrelas */}
                <div className="flex gap-1 text-yellow-500">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-yellow-500 stroke-yellow-500" />)}
                </div>

                <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-semibold italic text-justify">
                  "{item.testimony}"
                </p>


              </div>

              <div className="flex items-center gap-4 pt-6 border-t border-slate-100 mt-6">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                  <Image 
                    src={item.image} 
                    alt={item.name} 
                    fill 
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                  />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm">{item.name}</h4>
                  <p className="text-[10px] text-slate-500 font-bold">{item.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
