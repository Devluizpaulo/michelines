"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { doc, updateDoc, increment } from "firebase/firestore"
import { db } from "@/app/firebase/config"
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

const fontWeights = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
  black: "font-black"
}

export function HeroSlide({ slide, isActive, isPriority, isMobile }: HeroSlideProps) {
  const isVideo = !isMobile && slide.video

  const badgeColorClass = cn(
    slide.theme === "navy" && "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100",
    slide.theme === "amber" && "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
    slide.theme === "emerald" && "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
  )

  const glowTitleClass = cn(
    slide.theme === "navy" && "from-sky-450 via-sky-400 to-indigo-400",
    slide.theme === "amber" && "from-amber-400 via-amber-350 to-orange-400",
    slide.theme === "emerald" && "from-emerald-450 via-teal-400 to-green-400"
  )

  const handleSlideClick = () => {
    if (slide.id && !slide.id.startsWith("default-")) {
      updateDoc(doc(db, "hero_slides", slide.id), {
        clicks: increment(1)
      }).catch((err) => console.warn("Erro ao registrar click do slide:", err))
    }
  }

  const showTextOverlay = slide.showTextOverlay !== false
  const opacityValue = !showTextOverlay
    ? 1.0
    : (slide.bgOpacity !== undefined ? slide.bgOpacity / 100 : 0.14)

  const heightClass = cn(
    slide.heroHeight === "sm" && "min-h-[300px] h-[300px] md:min-h-[350px] md:h-[350px]",
    slide.heroHeight === "md" && "min-h-[380px] h-[380px] md:min-h-[450px] md:h-[450px]",
    slide.heroHeight === "lg" && "min-h-[480px] h-[480px] md:min-h-[550px] md:h-[550px]",
    (slide.heroHeight === "fullscreen" || !slide.heroHeight) && "min-h-[60vh] h-[60vh] md:min-h-[70vh] md:h-[70vh]"
  )

  const textAlignment = slide.textAlignment || "center"

  return (
    <div className={cn("relative w-full min-w-full flex-[0_0_100%] flex items-center justify-center overflow-hidden bg-transparent shrink-0", heightClass)}>
      
      {/* Background Image / Video container with Ken Burns effect */}
      <motion.div
        initial={{ scale: 1 }}
        animate={isActive ? { scale: 1.04 } : { scale: 1 }}
        transition={{ duration: 8, ease: "easeOut" }}
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ opacity: opacityValue }}
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
          <>
            {/* Blurred ambient glow for contain mode */}
            {slide.imageFit === "contain" && slide.overlay !== "none" && (
              <Image
                src={(isMobile && slide.mobileImage) ? slide.mobileImage : slide.image}
                alt=""
                fill
                priority={isPriority}
                loading={isPriority ? "eager" : "lazy"}
                sizes="100vw"
                className="object-cover blur-2xl opacity-25 scale-110 pointer-events-none"
              />
            )}
            <Image
              src={(isMobile && slide.mobileImage) ? slide.mobileImage : slide.image}
              alt=""
              fill
              priority={isPriority}
              loading={isPriority ? "eager" : "lazy"}
              sizes="100vw"
              className={cn(
                slide.imageFit === "contain" ? "object-contain" : "object-cover"
              )}
            />
          </>
        )}
      </motion.div>

      {/* Overlay layers */}
      <HeroOverlay overlayType={slide.overlay} />

      {/* Centered Content Container */}
      {showTextOverlay && (
        <div className={cn(
          "container relative z-20 px-6 lg:px-12 max-w-5xl",
          slide.heroHeight === "sm" && "pt-20 pb-6 md:pt-24 md:pb-8",
          slide.heroHeight === "md" && "pt-24 pb-8 md:pt-28 md:pb-12",
          (slide.heroHeight === "lg" || slide.heroHeight === "fullscreen" || !slide.heroHeight) && "pt-28 pb-12 md:pt-36 md:pb-24",
          textAlignment === "left" && "text-left mr-auto ml-0",
          textAlignment === "right" && "text-right ml-auto mr-0",
          textAlignment === "center" && "text-center mx-auto"
        )}>
          {slide.badge && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
              transition={{ duration: 0.8 }}
              className={cn(
                "flex mb-4 md:mb-6",
                textAlignment === "left" && "justify-start",
                textAlignment === "right" && "justify-end",
                textAlignment === "center" && "justify-center"
              )}
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
            className={cn(
              "tracking-tight text-white",
              slide.heroHeight === "sm" ? "text-2xl sm:text-4xl md:text-5xl mb-4" : "text-4xl sm:text-5xl md:text-7xl mb-8",
              fontWeights[slide.titleWeight || "black"] || "font-black"
            )}
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
            className={cn(
              "text-sky-100/90 leading-relaxed max-w-3xl",
              slide.heroHeight === "sm" ? "text-xs sm:text-sm md:text-base mb-6" : "text-base sm:text-xl mb-10 font-medium",
              textAlignment === "left" && "text-left mr-auto ml-0",
              textAlignment === "right" && "text-right ml-auto mr-0",
              textAlignment === "center" && "text-center mx-auto",
              fontWeights[slide.subtitleWeight || "medium"] || "font-medium"
            )}
          >
            {slide.subtitle}
          </motion.p>

          {/* CTA buttons */}
          <HeroActions 
            ctaText={slide.ctaText} 
            ctaUrl={slide.ctaUrl} 
            theme={slide.theme} 
            alignment={textAlignment} 
            onClick={handleSlideClick}
          />

          {/* Dynamic theme stats bar - hidden on small slide height */}
          {slide.heroHeight !== "sm" && (
            <HeroStats theme={slide.theme} alignment={textAlignment} />
          )}
        </div>
      )}

      {/* Slide Clicável (CTA Invisível / Flyer Canva) */}
      {((!showTextOverlay && (slide.destinationUrl || slide.ctaUrl)) || (slide.clickableSlide && slide.destinationUrl)) && (
        <Link 
          href={!showTextOverlay ? (slide.destinationUrl || slide.ctaUrl || "#") : (slide.destinationUrl || "#")} 
          onClick={handleSlideClick} 
          className="absolute inset-0 z-30 cursor-pointer"
          aria-label={slide.title || "Acessar banner"}
        />
      )}

    </div>
  )
}
