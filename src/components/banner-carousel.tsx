"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

// Dados dos banners
const banners = [
  {
    id: 1,
    title: "45 Anos de Tradição",
    description: "Celebrando quase meio século de excelência no serviço de táxi em São Paulo.",
    image: "/images/logos/logo-grupo-michelines.png",
    buttonText: "Conheça nossa história",
    buttonLink: "#sobre",
    color: "from-blue-900 to-blue-700",
    isLogo: true,
  },
  {
    id: 2,
    title: "Parceria com DTáxi",
    description: "Acesso exclusivo ao Aeroporto de Congonhas para nossos motoristas.",
    image: "/images/banners/dtaxi-partnership.png",
    buttonText: "Saiba mais",
    buttonLink: "#veiculos",
    color: "from-green-700 to-green-500",
    isFullImage: true,
  },
  {
    id: 3,
    title: "Novos Veículos Disponíveis",
    description: "Frota renovada com os melhores modelos para você iniciar sua carreira.",
    image: "/images/banners/novo-polo-2025.jpeg",
    buttonText: "Ver veículos",
    buttonLink: "#veiculos",
    color: "from-blue-700 to-blue-500",
    isFullImage: true,
  },
]

export default function BannerCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [autoplay, setAutoplay] = useState(true)

  // Autoplay
  useEffect(() => {
    if (!autoplay) return

    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % banners.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [autoplay])

  return (
    <div className="relative w-full">
      <Carousel
        className="w-full"
        opts={{
          loop: true,
          align: "start",
        }}
        onMouseEnter={() => setAutoplay(false)}
        onMouseLeave={() => setAutoplay(true)}
      >
        <CarouselContent>
          {banners.map((banner, index) => (
            <CarouselItem key={banner.id}>
              {/* Usamos um container com aspect-ratio para garantir proporções consistentes */}
              <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-lg">
                {banner.isLogo ? (
                  <div className="absolute inset-0 bg-white z-10 flex items-center justify-center flex-col px-4 text-center">
                    <div className="relative w-full max-w-md sm:max-w-lg h-auto aspect-auto">
                      <Image
                        src={banner.image || "/placeholder.svg"}
                        alt={banner.title}
                        width={500}
                        height={300}
                        className="object-contain mx-auto max-h-[120px] sm:max-h-[180px] md:max-h-[220px] w-auto"
                        priority
                        quality={90}
                      />
                    </div>
                    <div
                      className={`mt-4 sm:mt-6 w-full max-w-2xl mx-auto bg-gradient-to-r ${banner.color} px-4 py-3 sm:px-6 sm:py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-md border border-white/10`}
                    >
                      <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">{banner.title}</h2>
                      <p className="text-sm sm:text-base text-blue-50 mt-1 font-medium">{banner.description}</p>
                      <Link href={banner.buttonLink} className="inline-block mt-4">
                        <Button size="sm" className="bg-white text-blue-950 hover:bg-yellow-400 hover:scale-105 font-bold transition-all shadow-lg rounded-xl">
                          {banner.buttonText}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : banner.isFullImage ? (
                  <div className="absolute inset-0 z-10">
                    <Image
                      src={banner.image || "/placeholder.svg"}
                      alt={banner.title}
                      fill
                      className="object-cover object-center"
                      priority={index === 1 || index === 2}
                      sizes="(max-width: 768px) 100vw, 100vw"
                      quality={90}
                    />
                    {/* Overlay gradiente para melhorar a legibilidade do botão */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                    <div className="absolute bottom-4 right-4 z-20 max-w-full px-2">
                      <Link href={banner.buttonLink}>
                        <Button
                          size="sm"
                          className={`${
                            index === 1
                              ? "bg-white text-green-700 hover:bg-gray-100"
                              : "bg-yellow-400 text-blue-900 hover:bg-yellow-300"
                          } font-bold whitespace-nowrap`}
                        >
                          {banner.buttonText}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                    {/* Título e descrição para melhorar SEO e acessibilidade */}
                    <div className="absolute top-6 left-6 z-20 max-w-md">
                      <h2 className="text-xl sm:text-3xl font-black text-white bg-black/40 backdrop-blur-md border border-white/10 inline-block px-4 py-2 rounded-xl shadow-xl">
                        {banner.title}
                      </h2>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-black/40 z-10" />
                    <div className={`absolute inset-0 bg-gradient-to-r ${banner.color} opacity-60 z-10`} />
                    <Image
                      src={banner.image || "/placeholder.svg"}
                      alt={banner.title}
                      fill
                      className="object-cover object-center"
                      priority={index === 0}
                      sizes="(max-width: 768px) 100vw, 100vw"
                      quality={90}
                    />
                    <div className="absolute inset-0 z-20 flex flex-col justify-center items-start px-4 py-4 sm:px-8 sm:py-10 md:p-16 max-w-full sm:max-w-3xl">
                      <h2 className="text-xl sm:text-3xl md:text-5xl font-black text-white mb-2 sm:mb-4 tracking-tight drop-shadow-xl">
                        {banner.title}
                      </h2>
                      <p className="text-sm sm:text-lg md:text-xl text-blue-50 mb-4 sm:mb-8 max-w-2xl font-medium drop-shadow-md">{banner.description}</p>
                      <Link href={banner.buttonLink}>
                        <Button size="lg" className="bg-white text-blue-950 hover:bg-yellow-400 hover:scale-105 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.3)] font-bold rounded-xl px-8">
                          {banner.buttonText}
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4 z-30" />
        <CarouselNext className="right-4 z-30" />

        {/* Indicadores */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-30">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full ${
                index === activeIndex ? "bg-white" : "bg-white/50"
              } transition-all duration-300`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </Carousel>
    </div>
  )
}
