"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { db } from "@/app/firebase/config"
import { Vehicle } from "@/types/vehicle"
import { vehicleCategories as staticCategories } from "@/constants/vehicles"
import { Badge } from "@/components/ui/badge"
import { VehicleCarousel } from "./VehicleCarousel"
import { VehicleHighlight } from "./VehicleHighlight"
import { ShowroomVehicleGallery } from "./VehicleGallery"
import { VehicleHighlightHero } from "./VehicleHighlightHero"
import { LeadMatcher } from "./LeadMatcher"

export function Showroom() {
  const [activeTab, setActiveTab] = useState("dtaxi")
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)

  // Details Modal States
  const [selectedHighlightVehicle, setSelectedHighlightVehicle] = useState<Vehicle | null>(null)
  const [highlightOpen, setHighlightOpen] = useState(false)

  // Gallery Modal States
  const [selectedGalleryVehicle, setSelectedGalleryVehicle] = useState<Vehicle | null>(null)
  const [galleryOpen, setGalleryOpen] = useState(false)

  // Load active vehicles from Firestore
  useEffect(() => {
    const fetchShowroomVehicles = async () => {
      try {
        setLoading(true)
        const q = query(
          collection(db, "vehicles"),
          where("status", "==", "active"),
          where("available", "==", true),
          orderBy("showroomOrder", "asc")
        )
        const snap = await getDocs(q)
        
        if (!snap.empty) {
          const list: Vehicle[] = []
          snap.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() } as Vehicle)
          })
          setVehicles(list)
        } else {
          // Empty DB fallback: Load static categories converted to Vehicle schema
          const fallbackList: Vehicle[] = []
          staticCategories.forEach(cat => {
            cat.vehicles.forEach((v, idx) => {
              const numPrice = Number(v.price!.replace(/\D/g, "")) || 2000
              fallbackList.push({
                id: `${cat.id}-${idx}`,
                name: v.name,
                slug: `${cat.id}-${idx}`,
                category: cat.id,
                brand: v.name.split(" ")[0],
                year: v.year,
                transmission: "automatic",
                fuelType: cat.id === "hibridos" ? "hybrid" : "flex",
                isHybrid: cat.id === "hibridos",
                hasGNV: cat.id === "dtaxi",
                isDTaxiApproved: cat.id === "dtaxi",
                shortDescription: `Excelente oportunidade de locação para motoristas com plano premium. ${v.specs!.join(" • ")}`,
                fullDescription: `Veículo completo de alta performance, equipado com ar condicionado, travas elétricas e sistema de entretenimento integrado. Totalmente revisado pelo Grupo Micheline's.`,
                monthlyPrice: numPrice,
                dailyPrice: Math.round(numPrice / 30),
                status: "active",
                available: true,
                featured: v.tag! === "Mais Alugado",
                showroomFeatured: true,
                showroomOrder: idx,
                thumbnail: v.image!,
                images: [v.image!],
                specs: v.specs,
                tags: [v.tag!],
                positivePoints: ["Isenção total de rodízio", "Baixo consumo", "Garantia de substituição imediata"],
                highlights: ["Super porta-malas", "Bancos ergonômicos", "Multimídia completo"]
              })
            })
          })
          setVehicles(fallbackList)
        }
      } catch (e) {
        console.warn("Erro ao carregar showroom dinâmico, carregando estático:", e)
        // Fallback on error
        const fallbackList: Vehicle[] = []
        staticCategories.forEach(cat => {
          cat.vehicles.forEach((v, idx) => {
            const numPrice = Number(v.price!.replace(/\D/g, "")) || 2000
            fallbackList.push({
              id: `${cat.id}-${idx}`,
              name: v.name,
              slug: `${cat.id}-${idx}`,
              category: cat.id,
              brand: v.name.split(" ")[0],
              year: v.year,
              transmission: "automatic",
              fuelType: cat.id === "hibridos" ? "hybrid" : "flex",
              isHybrid: cat.id === "hibridos",
              hasGNV: cat.id === "dtaxi",
              isDTaxiApproved: cat.id === "dtaxi",
              shortDescription: `Excelente oportunidade de locação. ${v.specs!.join(" • ")}`,
              fullDescription: `Veículo completo com revisões periódicas.`,
              monthlyPrice: numPrice,
              dailyPrice: Math.round(numPrice / 30),
              status: "active",
              available: true,
              featured: v.tag! === "Mais Alugado",
              showroomFeatured: true,
              showroomOrder: idx,
              thumbnail: v.image!,
              images: [v.image!],
              specs: v.specs,
              tags: [v.tag!],
              positivePoints: ["Isenção total de rodízio"],
              highlights: ["Direção hidráulica"]
            })
          })
        })
        setVehicles(fallbackList)
      } finally {
        setLoading(false)
      }
    }

    fetchShowroomVehicles()
  }, [])

  // Filter vehicles by category
  const filteredVehicles = vehicles.filter(v => v.category === activeTab)

  // Find featured vehicle for the Hero banner
  const featuredVehicle = vehicles.find(v => v.featured) || vehicles[0] || null

  const activeCategoryName = 
    activeTab === "dtaxi" ? "D-TAXI (Congonhas)" :
    activeTab === "hibridos" ? "Híbridos" :
    activeTab === "sedans" ? "Sedans Executivos" : "Compactos Urbanos"

  const activeCategoryDesc = 
    activeTab === "dtaxi" ? "Veículos executivos autorizados a operar na fila rápida de Congonhas." :
    activeTab === "hibridos" ? "Tecnologia autossustentável para máxima rentabilidade e menor consumo." :
    activeTab === "sedans" ? "Amplo espaço de bagagem e alto conforto para passageiros executivos." :
    "Modelos ágeis, práticos e econômicos perfeitos para o trânsito da cidade."

  return (
    <section id="showroom" className="w-full py-20 lg:py-32 bg-[#F8FAFC] relative overflow-hidden select-none">
      
      {/* Luz Spot radial centralizada no showroom (Cool White spotlight) */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80%] h-[60%] bg-[radial-gradient(ellipse_at_center,rgba(2,132,199,0.04),transparent_70%)] pointer-events-none z-0" />
      
      <div className="container mx-auto px-6 relative z-10 space-y-16">
        
        {/* Title Block */}
        <div className="text-center max-w-3xl mx-auto">
          <Badge className="bg-sky-50 text-sky-700 border-sky-200 px-3 py-1 rounded-full text-xs font-semibold mb-4 border">
            Nosso Showroom
          </Badge>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Escolha sua máquina de trabalho
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed font-medium">
            Frota nova e revisada, equipada com GNV/Híbridos, homologada para Congonhas e pronta para maximizar seu faturamento diário.
          </p>
        </div>

        {/* 1. VEHICLE HERO EXPERIENCE (Destaque Cinematográfico) */}
        {!loading && featuredVehicle && (
          <div className="max-w-6xl mx-auto">
            <VehicleHighlightHero 
              vehicle={featuredVehicle}
              onOpenDetails={(car) => {
                setSelectedHighlightVehicle(car)
                setHighlightOpen(true)
              }}
            />
          </div>
        )}

        <div className="h-px bg-slate-200 max-w-6xl mx-auto" />

        {/* 2. CATALOG CATEGORIES CAROUSEL */}
        <div className="space-y-8">
          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {[
              { id: "dtaxi", name: "D-TAXI Congonhas" },
              { id: "hibridos", name: "Híbridos Eco" },
              { id: "sedans", name: "Sedans Premium" },
              { id: "hatches", name: "Compactos" }
            ].map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`px-6 py-3.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all duration-300 border ${
                  activeTab === category.id
                    ? "bg-sky-50 text-sky-700 border-sky-300 shadow-md shadow-sky-100/50"
                    : "bg-white border-slate-250/80 text-slate-500 hover:text-slate-800 hover:border-slate-350"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Category Intro */}
          <div className="text-center">
            <h3 className="text-sm font-extrabold text-slate-800">{activeCategoryName}</h3>
            <p className="text-xs text-slate-550 mt-1 font-semibold italic">
              &ldquo;{activeCategoryDesc}&rdquo;
            </p>
          </div>

          {/* Showroom Viewport */}
          {loading ? (
            <div className="h-64 flex flex-col gap-2 items-center justify-center text-slate-500">
              <span className="animate-spin h-5 w-5 border-2 border-sky-500 border-t-transparent rounded-full mr-2"></span>
              Carregando showroom...
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="h-32 border border-dashed border-slate-250 rounded-xl flex items-center justify-center text-xs text-slate-500">
              Nenhum veículo disponível nesta categoria.
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              <VehicleCarousel 
                vehicles={filteredVehicles} 
                onSelectVehicle={(car) => {
                  setSelectedHighlightVehicle(car)
                  setHighlightOpen(true)
                }}
                onOpenGallery={(car) => {
                  setSelectedGalleryVehicle(car)
                  setGalleryOpen(true)
                }}
              />
            </div>
          )}
        </div>

        <div className="h-px bg-slate-200 max-w-6xl mx-auto" />

        {/* 3. LEAD MATCHING (Quiz recomendador) */}
        {!loading && vehicles.length > 0 && (
          <div className="pt-4">
            <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
              <h3 className="text-xl md:text-2xl font-black text-slate-900">Dúvida na escolha?</h3>
              <p className="text-xs text-slate-650 leading-relaxed font-semibold">
                Fizemos um Match Inteligente para ajudar você a decidir de forma rápida e segura.
              </p>
            </div>
            <LeadMatcher 
              vehicles={vehicles}
              onSelectVehicle={(car) => {
                setSelectedHighlightVehicle(car)
                setHighlightOpen(true)
              }}
            />
          </div>
        )}

      </div>

      {/* Detail highlight spotlight dialog */}
      <VehicleHighlight 
        vehicle={selectedHighlightVehicle}
        isOpen={highlightOpen}
        onClose={() => {
          setSelectedHighlightVehicle(null)
          setHighlightOpen(false)
        }}
      />

      {/* Picture gallery slideshow overlay dialog */}
      <ShowroomVehicleGallery 
        images={selectedGalleryVehicle?.images || []}
        name={selectedGalleryVehicle?.name || ""}
        isOpen={galleryOpen}
        onClose={() => {
          setSelectedGalleryVehicle(null)
          setGalleryOpen(false)
        }}
      />

    </section>
  )
}
