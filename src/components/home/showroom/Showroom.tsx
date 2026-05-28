"use client"

import { useState, useEffect } from "react"
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore"

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

  // Highlight modal
  const [selectedHighlightVehicle, setSelectedHighlightVehicle] =
    useState<Vehicle | null>(null)

  const [highlightOpen, setHighlightOpen] = useState(false)

  // Gallery modal
  const [selectedGalleryVehicle, setSelectedGalleryVehicle] =
    useState<Vehicle | null>(null)

  const [galleryOpen, setGalleryOpen] = useState(false)

  // Load vehicles
  useEffect(() => {
    const fetchShowroomVehicles = async () => {
      try {
        setLoading(true)

        // Pricing map
        const pricingMap: Record<string, any> = {}

        try {
          const pricingSnap = await getDocs(
            collection(db, "vehicle_pricing")
          )

          pricingSnap.forEach((doc) => {
            const data = doc.data()

            if (data.vehicleId) {
              pricingMap[data.vehicleId] = {
                id: doc.id,
                ...data,
              }
            }
          })
        } catch (pricingError) {
          console.warn(
            "Erro ao carregar vehicle_pricing:",
            pricingError
          )
        }

        // Vehicles query
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
            const carData = doc.data() as Vehicle
            const carId = doc.id

            list.push({
              id: carId,
              ...carData,

              pricing: pricingMap[carId] || {
                vehicleId: carId,
                dailyRate:
                  carData.dailyPrice ||
                  Math.round((carData.monthlyPrice || 2400) / 30),

                weeklyRate: Math.round(
                  (carData.monthlyPrice || 2400) / 4
                ),

                monthlyRate: carData.monthlyPrice || 2400,

                weekendExempt: true,

                acceptedPayments: [
                  "pix",
                  "debito",
                  "credito",
                ],

                active: true,
              },
            } as any)
          })

          setVehicles(list)
        } else {
          setVehicles(buildFallbackVehicles())
        }
      } catch (error) {
        console.warn(
          "Erro ao carregar showroom dinâmico:",
          error
        )

        setVehicles(buildFallbackVehicles())
      } finally {
        setLoading(false)
      }
    }

    fetchShowroomVehicles()
  }, [])

  // Fallback builder
  const buildFallbackVehicles = (): Vehicle[] => {
    const fallbackList: Vehicle[] = []

    staticCategories.forEach((cat) => {
      cat.vehicles.forEach((v, idx) => {
        const numPrice =
          Number(v.price!.replace(/\D/g, "")) || 2000

        const vehicleId = `${cat.id}-${idx}`

        fallbackList.push({
          id: vehicleId,

          name: v.name,

          slug: `${cat.id}-${idx}`,

          category: cat.id,

          brand: v.name.split(" ")[0],

          year: v.year,

          transmission: "automatic",

          fuelType:
            cat.id === "hibridos" ? "hybrid" : "flex",

          isHybrid: cat.id === "hibridos",

          hasGNV: cat.id === "dtaxi",

          isDTaxiApproved: cat.id === "dtaxi",

          shortDescription: `Veículo preparado para operação executiva. ${v.specs!.join(
            " • "
          )}`,

          fullDescription:
            "Veículo revisado, confortável e pronto para operação diária com suporte da frota.",

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

          positivePoints: [
            "Baixo consumo",
            "Excelente conforto",
            "Suporte operacional",
          ],

          highlights: [
            "Ar-condicionado",
            "Excelente porta-malas",
            "Ótima economia",
          ],

          pricing: {
            vehicleId,

            dailyRate: Math.round(numPrice / 30),

            weeklyRate: Math.round(numPrice / 4),

            monthlyRate: numPrice,

            weekendExempt: true,

            acceptedPayments: [
              "pix",
              "debito",
              "credito",
            ],

            active: true,
          },
        })
      })
    })

    return fallbackList
  }

  // Filters
  const filteredVehicles = vehicles.filter(
    (v) => v.category === activeTab
  )

  // Featured vehicle
  const featuredVehicle =
    vehicles.find((v) => v.featured) ||
    vehicles[0] ||
    null

  // Category labels
  const activeCategoryName =
    activeTab === "dtaxi"
      ? "Operação Executiva"
      : activeTab === "hibridos"
      ? "Híbridos & Elétricos"
      : activeTab === "sedans"
      ? "Sedans Corporativos"
      : "Compactos Urbanos"

  const activeCategoryDesc =
    activeTab === "dtaxi"
      ? "Veículos preparados para operação executiva de alta demanda."
      : activeTab === "hibridos"
      ? "Mais economia, tecnologia e eficiência operacional."
      : activeTab === "sedans"
      ? "Conforto e espaço para atendimento corporativo."
      : "Modelos econômicos ideais para operação urbana."

  return (
    <section
      id="showroom"
      className="relative w-full overflow-hidden bg-[#F8FAFC] py-20 lg:py-32 select-none"
    >
      {/* Spotlight */}
      <div className="pointer-events-none absolute left-1/2 top-[-20%] z-0 h-[60%] w-[80%] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(2,132,199,0.04),transparent_70%)]" />

      <div className="container relative z-10 mx-auto space-y-16 px-6">
        
        {/* TITLE */}
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <Badge className="rounded-full border border-sky-200 bg-sky-50 px-3.5 py-1 text-xs font-semibold text-sky-700">
            Frota Executiva
          </Badge>

          <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-900 md:text-5xl">
            Veículos preparados para alta performance
          </h2>

          <p className="text-base font-medium leading-relaxed text-slate-600 md:text-lg">
            Frota moderna com veículos híbridos, elétricos e
            modelos econômicos preparados para operação executiva
            e locação profissional.
          </p>
        </div>

        {/* HERO */}
        {!loading && featuredVehicle && (
          <div className="mx-auto max-w-6xl">
            <VehicleHighlightHero
              vehicle={featuredVehicle}
              onOpenDetails={(car) => {
                setSelectedHighlightVehicle(car)
                setHighlightOpen(true)
              }}
            />
          </div>
        )}

        <div className="mx-auto h-px max-w-6xl bg-slate-200" />

        {/* CATEGORY */}
        <div className="space-y-8">
          
          {/* TABS */}
          <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-3">
            {[
              {
                id: "dtaxi",
                name: "Operação Executiva",
              },

              {
                id: "hibridos",
                name: "Híbridos & Elétricos",
              },

              {
                id: "sedans",
                name: "Sedans Corporativos",
              },

              {
                id: "hatches",
                name: "Compactos Urbanos",
              },
            ].map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`rounded-xl border px-6 py-3.5 text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                  activeTab === category.id
                    ? "border-sky-300 bg-sky-50 text-sky-700 shadow-md shadow-sky-100/50"
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-800"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* CATEGORY INFO */}
          <div className="text-center">
            <h3 className="text-sm font-extrabold text-slate-800">
              {activeCategoryName}
            </h3>

            <p className="mt-1 text-xs font-semibold italic text-slate-500">
              &ldquo;{activeCategoryDesc}&rdquo;
            </p>
          </div>

          {/* VEHICLES */}
          {loading ? (
            <div className="flex h-64 flex-col items-center justify-center gap-2 text-slate-500">
              <span className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-sky-500 border-t-transparent"></span>

              Carregando showroom...
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
              Nenhum veículo disponível nesta categoria.
            </div>
          ) : (
            <div className="mx-auto max-w-6xl">
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

        <div className="mx-auto h-px max-w-6xl bg-slate-200" />

        {/* QUIZ */}
        {!loading && vehicles.length > 0 && (
          <div className="pt-4">
            <div className="mx-auto mb-8 max-w-xl space-y-2 text-center">
              <h3 className="text-xl font-black text-slate-900 md:text-2xl">
                Qual veículo combina com você?
              </h3>

              <p className="text-xs font-semibold leading-relaxed text-slate-600">
                Criamos um assistente inteligente para ajudar na
                escolha ideal da sua operação.
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

      {/* MODALS */}
      <VehicleHighlight
        vehicle={selectedHighlightVehicle}
        isOpen={highlightOpen}
        onClose={() => {
          setSelectedHighlightVehicle(null)
          setHighlightOpen(false)
        }}
      />

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