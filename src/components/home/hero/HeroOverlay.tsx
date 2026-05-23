import { cn } from "@/lib/utils"

interface HeroOverlayProps {
  overlayType?: string
}

export function HeroOverlay({ overlayType = "gradient" }: HeroOverlayProps) {
  return (
    <>
      {/* Light corporate blue spot overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(2,132,199,0.05),transparent_60%)] z-0 pointer-events-none" />
      <div 
        className="absolute inset-0 opacity-[0.03] z-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(15,23,42,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.07) 1px, transparent 1px)`,
          backgroundSize: "48px 48px"
        }}
      />

      {/* Tone Overlays */}
      <div 
        className={cn(
          "absolute inset-0 transition-all duration-1000 z-10 pointer-events-none",
          overlayType === "gradient" && "bg-white/60 backdrop-blur-[1px]",
          overlayType === "dark" && "bg-[#EFF6FF]/50",
          overlayType === "medium" && "bg-white/40",
          overlayType === "none" && "bg-transparent"
        )}
      />

      {/* Light Mask for smooth transition at bottom matching main background #F8FAFC */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC]/40 to-transparent z-15 pointer-events-none" />
    </>
  )
}
