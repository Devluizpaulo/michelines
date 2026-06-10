"use client"

import { useState, useEffect } from "react"
import { Star, CheckCircle2, Quote } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog"
import { collection, query, where, orderBy, limit, getDocs, addDoc } from "firebase/firestore"
import { db } from "@/app/firebase/config"

const testimonialsData = [
  {
    name: "Carlos Santos",
    time: "Taxista há 1 ano",
    testimony: "Trabalhava 12h por dia no aplicativo. Quase metade do ganho ia para a taxa da plataforma e gasolina cara. No táxi da Michelines com GNV e rodando no corredor, reduzi as horas de trabalho e ganho muito mais.",
    rating: 5,
    image: "/placeholder-user.jpg"
  },
  {
    name: "Juliana Souza",
    time: "Taxista há 8 meses",
    testimony: "Não sabia nada sobre táxi, nem tinha Condutax. O time do Grupo Michelines me encaminhou para o curso, cuidou de toda a burocracia do documento e me deu segurança. Hoje tenho estabilidade financeira.",
    rating: 5,
    image: "/placeholder-user.jpg"
  },
  {
    name: "Marcos Pereira",
    time: "Taxista há 3 anos",
    testimony: "A grande sacada é a Spin da Michelines na fila do aeroporto de Congonhas. Corridas de alto valor para hotéis e centros corporativos. Não fico parado nunca. Suporte mecânico deles é nota 10.",
    rating: 5,
    image: "/placeholder-user.jpg"
  }
]

export function Testimonials() {
  const [dbTestimonials, setDbTestimonials] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState<number | null>(null)

  const [form, setForm] = useState({
    name: "",
    time: "",
    testimony: ""
  })

  // Fetch approved testimonials
  useEffect(() => {
    async function loadTestimonials() {
      try {
        const q = query(
          collection(db, "testimonials"),
          where("approved", "==", true),
          orderBy("createdAt", "desc"),
          limit(3)
        )
        const snap = await getDocs(q)
        const list: any[] = []
        snap.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() })
        })
        setDbTestimonials(list)
      } catch (err) {
        console.error("[Testimonials] Erro ao carregar avaliações. Usando dados padrão:", err instanceof Error ? err.message : err)
      }
    }
    loadTestimonials()
  }, [])

  // Submit new review
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.time || !form.testimony) return
    setSubmitting(true)
    try {
      await addDoc(collection(db, "testimonials"), {
        name: form.name,
        time: form.time,
        testimony: form.testimony,
        rating,
        approved: false,
        createdAt: new Date().toISOString()
      })
      setSubmitted(true)
      setForm({ name: "", time: "", testimony: "" })
      setRating(5)
    } catch (err) {
      console.error("Erro ao enviar avaliação:", err)
      alert("Ocorreu um erro ao enviar sua avaliação. Por favor, tente novamente.")
    } finally {
      setSubmitting(false)
    }
  }

  // Combine dynamic and default testimonials to always display exactly 3 cards
  const displayTestimonials = [...dbTestimonials]
  if (displayTestimonials.length < 3) {
    const needed = 3 - displayTestimonials.length
    for (let i = 0; i < needed; i++) {
      const index = i % testimonialsData.length
      displayTestimonials.push(testimonialsData[index])
    }
  }

  return (
    <section id="cases" className="w-full py-20 lg:py-32 bg-transparent relative select-none">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col items-center">
          <Badge className="bg-white/10 text-sky-200 px-3.5 py-1 rounded-full text-xs font-bold mb-4 border border-white/10 shadow-xs hover:bg-white/20">
            Cases de Sucesso
          </Badge>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
            Quem mudou, não se arrepende
          </h2>
          <p className="text-base md:text-lg text-sky-100/90 font-medium text-center mb-8">
            Histórias reais de motoristas que saíram do aperto dos aplicativos e mudaram de patamar de vida com a Michelines.
          </p>

          {/* Submission Dialog Button */}
          <Dialog 
            open={isOpen} 
            onOpenChange={(val) => {
              setIsOpen(val)
              if (!val) {
                // Reset success state on close
                setTimeout(() => setSubmitted(false), 300)
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-xs h-11 px-8 rounded-xl shadow-lg hover:shadow-sky-500/25 active:scale-[0.98] transition-all">
                Deixar minha Avaliação
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border border-slate-200 text-slate-800 w-full sm:max-w-md rounded-2xl p-6" descriptionId="testimonial-dialog-description">
              {submitted ? (
                <div className="py-8 flex flex-col items-center text-center space-y-4">
                  <div className="h-16 w-16 bg-emerald-50 rounded-full border border-emerald-250 flex items-center justify-center text-emerald-600 animate-bounce">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Avaliação Enviada!</h3>
                    <p className="text-xs text-slate-500 mt-2 max-w-xs leading-relaxed">
                      Muito obrigado pelo seu depoimento! Ele passará por uma breve aprovação comercial antes de aparecer em nosso site.
                    </p>
                  </div>
                  <Button 
                    onClick={() => setIsOpen(false)} 
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold h-10 px-6 mt-2 rounded-xl"
                  >
                    Fechar
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <Quote className="h-5 w-5 text-sky-500" />
                      Avalie sua Experiência
                    </DialogTitle>
                    <DialogDescription id="testimonial-dialog-description" className="text-slate-500 text-xs font-semibold leading-relaxed">
                      Compartilhe com outros motoristas como o Grupo Michelines transformou a sua rotina e seus rendimentos.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <Label className="text-slate-700 text-xs font-bold">Nome completo</Label>
                      <Input
                        placeholder="Ex: João da Silva"
                        value={form.name}
                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        className="bg-white border-slate-200 text-slate-800 focus-visible:ring-sky-500 rounded-xl"
                        required
                      />
                    </div>

                    {/* Time / Category */}
                    <div className="space-y-1.5">
                      <Label className="text-slate-700 text-xs font-bold">Tempo como Taxista / Função</Label>
                      <Input
                        placeholder="Ex: Taxista há 2 anos"
                        value={form.time}
                        onChange={e => setForm(p => ({ ...p, time: e.target.value }))}
                        className="bg-white border-slate-200 text-slate-800 focus-visible:ring-sky-500 rounded-xl"
                        required
                      />
                    </div>

                    {/* Stars Selection */}
                    <div className="space-y-1.5">
                      <Label className="text-slate-700 text-xs font-bold block">Sua nota para a frota e suporte</Label>
                      <div className="flex gap-1.5 pt-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(null)}
                            className="text-yellow-500 focus:outline-none transition-transform active:scale-125"
                          >
                            <Star
                              className={`h-7 w-7 ${
                                star <= (hoverRating ?? rating)
                                  ? "fill-yellow-400 stroke-yellow-500"
                                  : "fill-transparent stroke-slate-250"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Testimony content */}
                    <div className="space-y-1.5">
                      <Label className="text-slate-700 text-xs font-bold">Seu depoimento</Label>
                      <Textarea
                        placeholder="Escreva como está sendo sua experiência rodando com nossa frota, corredores de ônibus e nosso suporte..."
                        value={form.testimony}
                        onChange={e => setForm(p => ({ ...p, testimony: e.target.value }))}
                        className="min-h-[100px] bg-white border border-slate-200 text-slate-800 text-xs p-3 leading-relaxed focus-visible:ring-sky-500 rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsOpen(false)}
                      className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-bold text-xs"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs"
                    >
                      {submitting ? "Enviando..." : "Enviar Avaliação"}
                    </Button>
                  </div>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {displayTestimonials.map((item, idx) => (
            <div 
              key={idx} 
              className="bg-white border border-slate-200 hover:border-sky-500/25 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col justify-between transition-all duration-300 group hover:-translate-y-1"
            >
              <div className="space-y-6">
                {/* Stars */}
                <div className="flex gap-1 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-3.5 w-3.5 ${
                        i < (item.rating ?? 5) 
                          ? "fill-yellow-550 stroke-yellow-550" 
                          : "fill-transparent stroke-slate-200"
                      }`} 
                    />
                  ))}
                </div>

                <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-semibold italic text-justify">
                  "{item.testimony}"
                </p>
              </div>

              <div className="flex items-center gap-4 pt-6 border-t border-slate-100 mt-6">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border border-slate-200 shrink-0 bg-sky-50 flex items-center justify-center">
                  {item.image && item.image !== "/placeholder-user.jpg" ? (
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-500" 
                    />
                  ) : (
                    <span className="text-sm font-black text-sky-700">
                      {item.name?.charAt(0).toUpperCase()}
                    </span>
                  )}
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
