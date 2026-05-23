"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { HeroSlideType } from "@/types/hero-slide"
import { HeroOverlay } from "./HeroOverlay"
import { HeroActions } from "./HeroActions"
import { HeroStats } from "./HeroStats"
import { cn } from "@/lib/utils"

interface HeroSlideProps {
  slide: HeroSlideType
  isActive: boolean
  isPriority: boolean
  isMobile: boolean
}

export function HeroSlide({ slide, isActive, isPriority, isMobile }: HeroSlideProps) {
  const isVideo = !isMobile && slide.video

  const badgeColorClass = cn(
    slide.theme === "navy" && "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100",
    slide.theme === "amber" && "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
    slide.theme === "emerald" && "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
  )

  const glowTitleClass = cn(
    slide.theme === "navy" && "from-sky-700 via-sky-600 to-indigo-750",
    slide.theme === "amber" && "from-amber-600 via-amber-750 to-orange-700",
    slide.theme === "emerald" && "from-emerald-700 via-teal-700 to-green-750"
  )

  return (
    <div className="relative w-full min-h-[90vh] md:min-h-[100vh] flex items-center justify-center overflow-hidden bg-[#F8FAFC] shrink-0">
      
      {/* Background Image / Video container with Ken Burns effect */}
      <motion.div
        initial={{ scale: 1 }}
        animate={isActive ? { scale: 1.04 } : { scale: 1 }}
        transition={{ duration: 8, ease: "easeOut" }}
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.14]"
      >
        {isVideo ? (
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover"
            poster={slide.image}
          >
            <source src={slide.video} type="video/mp4" />
          </video>
        ) : (
          <Image
            src={(isMobile && slide.mobileImage) ? slide.mobileImage : slide.image}
            alt=""
            fill
            priority={isPriority}
            loading={isPriority ? "eager" : "lazy"}
            className="object-cover"
          />
        )}
      </motion.div>

      {/* Overlay layers */}
      <HeroOverlay overlayType={slide.overlay} />

      {/* Centered Content Container */}
      <div className="container relative z-20 px-6 lg:px-12 py-12 md:py-24 text-center max-w-5xl">
        {slide.badge && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center mb-6"
          >
            <Badge className={cn("px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase border flex items-center gap-2", badgeColorClass)}>
              <span className={cn("flex h-2 w-2 rounded-full", 
                slide.theme === "navy" && "bg-sky-600",
                slide.theme === "amber" && "bg-amber-600",
                slide.theme === "emerald" && "bg-emerald-600"
              )}></span>
              {slide.badge}
            </Badge>
          </motion.div>
        )}

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-slate-900"
        >
          {slide.title} <br />
          {slide.glowTitle && (
            <span className={cn("text-transparent bg-clip-text bg-gradient-to-r", glowTitleClass)}>
              {slide.glowTitle}
            </span>
          )}
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-base sm:text-xl text-slate-600 mb-10 leading-relaxed max-w-3xl mx-auto font-medium"
        >
          {slide.subtitle}
        </motion.p>

        {/* CTA buttons */}
        <HeroActions ctaText={slide.ctaText} ctaUrl={slide.ctaUrl} theme={slide.theme} />

        {/* Dynamic theme stats bar */}
        <HeroStats theme={slide.theme} />
      </div>

    </div>
  )
}
