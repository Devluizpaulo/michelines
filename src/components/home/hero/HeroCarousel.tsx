"use client"

import React, { useEffect, useState, useCallback } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { motion } from "framer-motion"
import { doc, updateDoc, increment } from "firebase/firestore"
import { db } from "@/app/firebase/config"
import { HeroSlideType } from "@/types/hero-slide"
import { HeroSlide } from "./HeroSlide"
import { cn } from "@/lib/utils"

interface HeroCarouselProps {
  slides: HeroSlideType[]
  isMobile: boolean
  autoplayInterval?: number
  transitionDuration?: number
}

export function HeroCarousel({ slides, isMobile, autoplayInterval = 8, transitionDuration = 50 }: HeroCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    duration: transitionDuration, // dynamic transition speed
    watchSlides: true,
  })
  const [selectedIndex, setSelectedIndex] = useState(0)

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  // Rastreamento de Visualizações (Views) por sessão
  useEffect(() => {
    if (slides.length === 0) return
    const activeSlide = slides[selectedIndex]
    if (activeSlide && activeSlide.id && !activeSlide.id.startsWith("default-")) {
      const slideId = activeSlide.id
      const sessionKey = `viewed_slide_${slideId}`
      
      if (typeof window !== "undefined" && !sessionStorage.getItem(sessionKey)) {
        sessionStorage.setItem(sessionKey, "true")
        updateDoc(doc(db, "hero_slides", slideId), {
          views: increment(1)
        }).catch((err) => console.warn("Erro ao registrar view do slide:", err))
      }
    }
  }, [selectedIndex, slides])

  // Autoplay hook (configurable slide duration)
  useEffect(() => {
    if (!emblaApi) return
    const intervalTime = (autoplayInterval || 8) * 1000
    const interval = setInterval(scrollNext, intervalTime)
    
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap())
    }

    emblaApi.on("select", onSelect)

    return () => {
      clearInterval(interval)
      emblaApi.off("select", onSelect)
    }
  }, [emblaApi, scrollNext, autoplayInterval])

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index)
  }, [emblaApi])

  const activeSlide = slides[selectedIndex]
  const heightClass = cn(
    activeSlide?.heroHeight === "sm" && "min-h-[300px] h-[300px] md:min-h-[350px] md:h-[350px]",
    activeSlide?.heroHeight === "md" && "min-h-[380px] h-[380px] md:min-h-[450px] md:h-[450px]",
    activeSlide?.heroHeight === "lg" && "min-h-[480px] h-[480px] md:min-h-[550px] md:h-[550px]",
    (activeSlide?.heroHeight === "fullscreen" || !activeSlide?.heroHeight) && "min-h-[60vh] h-[60vh] md:min-h-[70vh] md:h-[70vh]"
  )

  return (
    <div className={cn("relative w-full overflow-hidden transition-all duration-500", heightClass)} ref={emblaRef}>
      <div className="flex h-full">
        {slides.map((slide, idx) => (
          <HeroSlide 
            key={slide.id || idx}
            slide={slide}
            isActive={idx === selectedIndex}
            isPriority={idx === 0}
            isMobile={isMobile}
          />
        ))}
      </div>

      {/* Premium Cinematic Progress Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {slides.map((_, idx) => {
            const isActive = idx === selectedIndex
            return (
              <button
                key={idx}
                onClick={() => scrollTo(idx)}
                className="relative h-1.5 rounded-full overflow-hidden transition-all duration-500 bg-slate-700/50"
                style={{ width: isActive ? "32px" : "8px" }}
                aria-label={`Ir para slide ${idx + 1}`}
              >
                {isActive && (
                  <motion.span 
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: autoplayInterval || 8, ease: "linear" }}
                    className="absolute inset-0 bg-white origin-left"
                  />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
