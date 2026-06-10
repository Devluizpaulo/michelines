import { cn } from "@/lib/utils"

interface HeroOverlayProps {
  overlayType?: string
}

export function HeroOverlay({ overlayType = "gradient" }: HeroOverlayProps) {
  return (
    <>
      {/* Dark corporate blue spot overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(2,132,199,0.06),transparent_60%)] z-0 pointer-events-none" />
      <div 
        className="absolute inset-0 opacity-[0.02] z-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: "48px 48px"
        }}
      />

      {/* Tone Overlays - Dark Theme optimized */}
      <div 
        className={cn(
          "absolute inset-0 transition-all duration-1000 z-10 pointer-events-none",
          overlayType === "gradient" && "bg-gradient-to-br from-[#0F1E36]/40 to-[#0A1224]/50 backdrop-blur-[0.5px]",
          overlayType === "dark" && "bg-[#0A1224]/80",
          overlayType === "medium" && "bg-[#0F1E36]/60",
          overlayType === "none" && "bg-transparent"
        )}
      />

      {/* Mask for smooth transition at bottom matching main blue background #1b3e72 */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#1b3e72] via-[#1b3e72]/40 to-transparent z-15 pointer-events-none" />
    </>
  )
}
