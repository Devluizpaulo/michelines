"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

interface ShowroomVehicleGalleryProps {
  images: string[]
  name: string
  isOpen: boolean
  onClose: () => void
}

export function ShowroomVehicleGallery({ images, name, isOpen, onClose }: ShowroomVehicleGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!images || images.length === 0) return null

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-slate-950/95 border-slate-900 text-slate-100 max-w-4xl w-full p-4 flex flex-col justify-center items-center rounded-2xl" descriptionId="vehicle-gallery-dialog-description">
        <DialogHeader className="w-full text-left pb-2 border-b border-slate-900">
          <DialogTitle className="text-lg font-black text-white">{name}</DialogTitle>
          <DialogDescription id="vehicle-gallery-dialog-description" className="text-xs text-slate-450">Galeria de imagens oficiais e detalhes do interior.</DialogDescription>
        </DialogHeader>

        {/* Main Image Slideshow */}
        <div className="relative w-full aspect-[16/9] mt-4 bg-slate-950 flex items-center justify-center rounded-xl overflow-hidden group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={images[currentIndex]} 
            alt={`${name} - Imagem ${currentIndex + 1}`}
            className="w-full h-full object-contain filter drop-shadow-[0_20px_20px_rgba(0,0,0,0.6)] loading-lazy"
            loading="lazy"
          />

          {/* Navigation Controls */}
          {images.length > 1 && (
            <>
              <button 
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button 
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Image index counter */}
          <div className="absolute bottom-4 right-4 bg-slate-950/70 border border-slate-850 px-3 py-1 rounded-full text-xs font-bold text-slate-300">
            {currentIndex + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnails grid selection */}
        {images.length > 1 && (
          <div className="flex gap-3 mt-4 overflow-x-auto max-w-full pb-2 scrollbar-thin scrollbar-thumb-slate-800">
            {images.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-20 h-14 rounded-lg overflow-hidden border bg-slate-900 transition-all shrink-0 ${
                  currentIndex === idx ? "border-sky-500 scale-95" : "border-slate-850 hover:border-slate-700"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
