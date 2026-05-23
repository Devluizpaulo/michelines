"use client"

import React, { useEffect, useState, useCallback } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { motion } from "framer-motion"
import { HeroSlideType } from "@/types/hero-slide"
import { HeroSlide } from "./HeroSlide"

interface HeroCarouselProps {
  slides: HeroSlideType[]
  isMobile: boolean
}

export function HeroCarousel({ slides, isMobile }: HeroCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    duration: 50, // smooth cinematic transition
    watchSlides: true,
  })
  const [selectedIndex, setSelectedIndex] = useState(0)

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  // Autoplay hook (6s slide duration)
  useEffect(() => {
    if (!emblaApi) return
    const interval = setInterval(scrollNext, 6000)
    
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap())
    }

    emblaApi.on("select", onSelect)

    return () => {
      clearInterval(interval)
      emblaApi.off("select", onSelect)
    }
  }, [emblaApi, scrollNext])

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index)
  }, [emblaApi])

  return (
    <div className="relative w-full overflow-hidden" ref={emblaRef}>
      <div className="flex">
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
                    transition={{ duration: 6, ease: "linear" }}
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
