"use client"

import { useCallback } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { Vehicle } from "@/types/vehicle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Eye, Tag } from "lucide-react"
import Image from "next/image"
import { optimizeImageUrl } from "@/lib/supabase"

interface VehicleCarouselProps {
  vehicles: Vehicle[]
  onSelectVehicle: (vehicle: Vehicle) => void
  onOpenGallery: (vehicle: Vehicle) => void
}

export function VehicleCarousel({ vehicles, onSelectVehicle, onOpenGallery }: VehicleCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    skipSnaps: false,
    dragFree: true
  })

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  return (
    <div className="relative w-full select-none">
      
      {/* Slider controls */}
      {vehicles.length > 3 && (
        <div className="absolute -top-14 right-0 flex items-center gap-2">
          <button 
            onClick={scrollPrev}
            className="p-2.5 rounded-full bg-white border border-slate-200 text-slate-450 hover:text-slate-800 hover:border-slate-300 shadow-sm transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button 
            onClick={scrollNext}
            className="p-2.5 rounded-full bg-white border border-slate-200 text-slate-450 hover:text-slate-800 hover:border-slate-300 shadow-sm transition-all"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Embla Viewport */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-6">
          {vehicles.map((car, idx) => (
            <div 
              key={car.id || idx} 
              className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.33%] min-w-0"
            >
              <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm hover:border-slate-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full group">
                
                {/* Photo Header */}
                <div 
                  onClick={() => onOpenGallery(car)}
                  className="relative aspect-[16/10] w-full bg-gradient-to-b from-slate-50 to-slate-100/20 p-4 pb-1 flex flex-col justify-end overflow-hidden border-b border-slate-150 cursor-pointer"
                >
                  {/* Floating Tags */}
                  <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
                    {car.isDTaxiApproved && (
                      <Badge className="bg-sky-50 text-sky-700 border border-sky-200 text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 shadow-sm">
                        ✈️ D-TAXI Congonhas
                      </Badge>
                    )}
                    {car.isHybrid && (
                      <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 shadow-sm">
                        🔋 Híbrido
                      </Badge>
                    )}
                    {car.pricing?.weekendExempt && (
                      <Badge className="bg-amber-50 text-amber-700 border border-amber-255 text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 shadow-sm">
                        📅 Domingos & Feriados Isentos
                      </Badge>
                    )}
                  </div>

                  {car.tags && car.tags[0] && (
                    <span className="absolute top-4 right-4 bg-white text-slate-500 border border-slate-200 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md z-10 shadow-sm">
                      {car.tags[0]}
                    </span>
                  )}

                  {/* Vehicle Image */}
                  <div className="relative w-full h-[100px] transition-transform duration-500 group-hover:scale-[1.03]">
                    <Image
                      src={optimizeImageUrl(car.thumbnail || "/images/cars/Cross Dtaxi.png", 600, 80)}
                      alt={car.name}
                      fill
                      className="object-contain mix-blend-multiply"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      quality={90}
                    />
                  </div>

                  {/* Gallery Zoom Icon */}
                  <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                    <Button variant="ghost" className="text-slate-800 border border-slate-200 bg-white/90 backdrop-blur-sm flex items-center gap-1.5 text-xs font-bold rounded-lg px-4 h-9 shadow-md">
                      <Eye className="h-4 w-4 text-sky-600" /> Ver Fotos
                    </Button>
                  </div>
                </div>

                {/* Details Body */}
                <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-black text-slate-900 truncate max-w-[80%]">{car.name}</h3>
                      <span className="text-xs text-slate-400 font-bold">{car.year}</span>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed font-semibold line-clamp-2 h-8 text-justify">
                      {car.shortDescription}
                    </p>

                    {/* Operational Badges Row */}
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {(car.isHybrid || car.hasGNV) && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                          🚦 Isento de Rodízio
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
                        🔧 Revisado
                      </span>
                      <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                        ☕ Suporte & Café
                      </span>
                      {car.pricing?.weekendExempt && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md">
                          📅 Domingos Isentos
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Diária a partir de</span>
                      <span className="text-lg font-black text-emerald-600 flex items-center gap-1">
                        <Tag className="h-4 w-4 text-emerald-500" />
                        R$ {Number(car.dailyPrice || 150).toLocaleString('pt-BR')}/dia
                      </span>
                    </div>
                  </div>

                  <Button 
                    onClick={() => onSelectVehicle(car)}
                    className="w-full bg-slate-50 border border-slate-200 hover:border-sky-500 hover:bg-sky-600 hover:text-white text-slate-700 hover:shadow-sm rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 text-xs h-11"
                  >
                    Ficha Técnica & Contato
                  </Button>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
