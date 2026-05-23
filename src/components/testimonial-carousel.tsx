"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react"

const testimonials = [
  {
    id: 1,
    name: "Carlos Silva",
    role: "Taxista há 8 meses",
    content:
      "Sempre sonhei em ser taxista, mas o investimento inicial era um obstáculo. Com o Grupo Michelines, consegui realizar esse sonho sem precisar comprar um carro. O suporte que recebi foi fundamental para meu sucesso.",
    rating: 5,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 2,
    name: "Ana Oliveira",
    role: "Taxista há 1 ano",
    content:
      "A segurança que o Grupo Michelines oferece não tem preço. Veículos sempre em perfeito estado e o suporte 24h me dão tranquilidade para trabalhar até mesmo à noite, o que antes eu evitava.",
    rating: 5,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 3,
    name: "Roberto Almeida",
    role: "Taxista há 6 meses",
    content:
      "Depois de anos trabalhando em aplicativos, descobri o orgulho de ser taxista. O programa de fidelidade e os bônus por desempenho fazem toda a diferença no fim do mês. Melhor decisão que tomei.",
    rating: 5,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 4,
    name: "Juliana Santos",
    role: "Taxista há 3 meses",
    content:
      "Como mulher, sempre tive receio de trabalhar como motorista. O Grupo Michelines me deu todo o suporte e segurança que eu precisava para iniciar nessa profissão. Hoje me sinto realizada e independente.",
    rating: 5,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 5,
    name: "Marcos Pereira",
    role: "Taxista há 2 anos",
    content:
      "A parceria com o DTáxi e o acesso ao aeroporto de Congonhas aumentou significativamente minha renda. Consigo fazer mais corridas e atender clientes de alto padrão, o que não era possível antes.",
    rating: 5,
    image: "/placeholder.svg?height=100&width=100",
  },
]

export default function TestimonialCarousel() {
  const [current, setCurrent] = useState(0)
  const [autoplay, setAutoplay] = useState(true)

  const next = () => setCurrent((current + 1) % testimonials.length)
  const prev = () => setCurrent((current - 1 + testimonials.length) % testimonials.length)

  useEffect(() => {
    if (!autoplay) return

    const interval = setInterval(next, 6000)
    return () => clearInterval(interval)
  }, [current, autoplay])

  return (
    <div
      className="relative overflow-hidden py-10 px-4 bg-blue-50 rounded-2xl"
      onMouseEnter={() => setAutoplay(false)}
      onMouseLeave={() => setAutoplay(true)}
    >
      <div className="absolute top-6 left-10 text-blue-300">
        <Quote size={60} />
      </div>

      <div className="max-w-4xl mx-auto relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center px-8 py-4"
          >
            <div className="mb-6 flex items-center space-x-2">
              {[...Array(testimonials[current].rating)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>

            <p className="text-lg md:text-xl text-gray-700 mb-8 relative z-10">"{testimonials[current].content}"</p>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full overflow-hidden mb-3">
                <img
                  src={testimonials[current].image || "/placeholder.svg"}
                  alt={testimonials[current].name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="font-bold text-lg">{testimonials[current].name}</h4>
              <p className="text-gray-600">{testimonials[current].role}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="absolute top-1/2 -translate-y-1/2 left-0">
          <button
            onClick={prev}
            className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
            aria-label="Depoimento anterior"
          >
            <ChevronLeft className="h-6 w-6 text-gray-700" />
          </button>
        </div>

        <div className="absolute top-1/2 -translate-y-1/2 right-0">
          <button
            onClick={next}
            className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
            aria-label="Próximo depoimento"
          >
            <ChevronRight className="h-6 w-6 text-gray-700" />
          </button>
        </div>
      </div>

      <div className="flex justify-center mt-8 space-x-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === current ? "bg-blue-600 w-6" : "bg-gray-300"
            }`}
            aria-label={`Ir para depoimento ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
