"use client"

import { useState, useEffect } from "react"
import { collection, query, orderBy, getDocs, doc, addDoc, updateDoc, deleteDoc, setDoc } from "firebase/firestore"
import { db } from "@/app/firebase/config"
import { Vehicle } from "@/types/vehicle"
import { Lead } from "@/types/lead"
import { VehicleCard } from "./VehicleCard"
import { VehicleForm } from "./VehicleForm"
import { Button } from "@/components/ui/button"
import { Plus, Car, RefreshCw, Flame, TrendingUp, DollarSign, Target, Clock, Database } from "lucide-react"
import { motion } from "framer-motion"
import { THEME_TOKENS } from "@/theme/design-system"
import { MetricCard } from "@/components/ui/card-variants"
import { useToast } from "@/components/ui/toast-simple"

interface VehicleManagerProps {
  leads: Lead[]
}

export function VehicleManager({ leads }: VehicleManagerProps) {
  const { success, error: showError, warning } = useToast()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<"list" | "form">("list")
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [seeding, setSeeding] = useState(false)

  const handleSeedVehicles = async () => {
    if (!window.confirm("Deseja semear o catálogo com os 18 veículos padrão da Michelines?")) return
    try {
      setSeeding(true)
      
      const BASE_URL = "https://cbynwzxalzcaownnouwp.supabase.co/storage/v1/object/public"
      const carUrl = (f: string) => `${BASE_URL}/vehicles/${f}`

      const DEFAULT_VEHICLES = [
        {
          name: "Corolla Cross D-TAXI",
          slug: "corolla-cross-dtaxi",
          category: "dtaxi",
          brand: "Toyota",
          year: "2024",
          transmission: "automatic",
          fuelType: "hybrid",
          isHybrid: true,
          hasGNV: false,
          isDTaxiApproved: true,
          shortDescription: "Corolla Cross híbrido homologado D-TAXI para a fila de Congonhas. Alta demanda, baixo custo operacional.",
          fullDescription: "O Toyota Corolla Cross é o veículo mais procurado na fila D-TAXI de Congonhas. Motor híbrido proporciona economia de até 40% em combustível vs flex convencional.",
          monthlyPrice: 3200,
          dailyPrice: 110,
          status: "active",
          available: true,
          featured: true,
          showroomFeatured: true,
          showroomOrder: 1,
          thumbnail: carUrl("cross_dtaxi.png"),
          images: [carUrl("cross_dtaxi.png")],
          specs: ["Motor 1.8 Híbrido", "CVT Automático", "SUV Compacto", "5 Lugares"],
          tags: ["D-TAXI", "Mais Alugado", "Híbrido Premium"],
          positivePoints: ["Isenção de rodízio", "Consumo eco-híbrido", "Alta demanda Congonhas", "Público executivo"],
          highlights: ["Aprovado D-TAXI", "Motor Híbrido Toyota", "Câmbio CVT"],
          seoTitle: "Corolla Cross D-TAXI Híbrido | Grupo Michelines",
          seoDescription: "Alugue o Corolla Cross D-TAXI homologado para Congonhas. Veículo híbrido com alta demanda aeroportuária.",
        },
        {
          name: "Toyota Corolla Sedan",
          slug: "corolla-sedan",
          category: "sedans",
          brand: "Toyota",
          year: "2024",
          transmission: "automatic",
          fuelType: "hybrid",
          isHybrid: true,
          hasGNV: false,
          isDTaxiApproved: false,
          shortDescription: "Sedan executivo híbrido. Conforto e economia para jornadas longas em São Paulo.",
          fullDescription: "O Toyota Corolla Sedan híbrido é ideal para operações executivas. Combina elegância, conforto e eficiência energética superior.",
          monthlyPrice: 2800,
          dailyPrice: 95,
          status: "active",
          available: true,
          featured: true,
          showroomFeatured: true,
          showroomOrder: 2,
          thumbnail: carUrl("corolla.png"),
          images: [carUrl("corolla.png")],
          specs: ["Motor 1.8 Híbrido", "CVT Automático", "Sedan Executivo", "5 Lugares"],
          tags: ["Executivo", "Híbrido", "Sedan Premium"],
          positivePoints: ["Motor híbrido econômico", "Interior premium", "Ideal para app executivo"],
          highlights: ["Motor Híbrido Toyota", "Acabamento Premium", "Conforto Executivo"],
          seoTitle: "Corolla Sedan Híbrido | Locação Taxi São Paulo",
          seoDescription: "Alugue o Toyota Corolla Sedan híbrido para operações de táxi executivo em SP.",
        },
        {
          name: "Toyota Prius Premium",
          slug: "prius-premium",
          category: "hibridos",
          brand: "Toyota",
          year: "2024",
          transmission: "automatic",
          fuelType: "hybrid",
          isHybrid: true,
          hasGNV: false,
          isDTaxiApproved: false,
          shortDescription: "O ícone híbrido com máxima eficiência. Custo por km mais baixo da frota.",
          fullDescription: "O Toyota Prius é referência mundial em eficiência híbrida. Consumo médio de 22-25 km/l — menor custo operacional por km.",
          monthlyPrice: 3000,
          dailyPrice: 100,
          status: "active",
          available: true,
          featured: false,
          showroomFeatured: true,
          showroomOrder: 3,
          thumbnail: carUrl("prius.png"),
          images: [carUrl("prius.png")],
          specs: ["Motor 1.8 Híbrido", "E-CVT Automático", "Hatchback Premium", "5 Lugares"],
          tags: ["Mais Econômico", "Híbrido", "Baixo Custo"],
          positivePoints: ["25 km/l na cidade", "Isenção de rodízio", "Manutenção econômica"],
          highlights: ["Mais Econômico da Frota", "22-25 km/l", "Marca Toyota"],
          seoTitle: "Toyota Prius Híbrido | Locação Táxi São Paulo",
          seoDescription: "Alugue o Toyota Prius, o veículo híbrido mais econômico para operações de táxi em SP.",
        },
        {
          name: "Hyundai Ioniq Híbrido",
          slug: "ioniq-hibrido",
          category: "hibridos",
          brand: "Hyundai",
          year: "2023",
          transmission: "automatic",
          fuelType: "hybrid",
          isHybrid: true,
          hasGNV: false,
          isDTaxiApproved: false,
          shortDescription: "Sedã híbrido coreano. Tecnologia de ponta com custo acessível.",
          fullDescription: "O Hyundai Ioniq híbrido combina design moderno, tecnologia avançada e eficiência energética. Excelente custo de locação.",
          monthlyPrice: 2600,
          dailyPrice: 88,
          status: "active",
          available: true,
          featured: false,
          showroomFeatured: true,
          showroomOrder: 4,
          thumbnail: carUrl("ioniq.png"),
          images: [carUrl("ioniq.png")],
          specs: ["Motor 1.6 Híbrido", "DCT Automático", "Sedan", "5 Lugares"],
          tags: ["Híbrido", "Econômico", "Coreano"],
          positivePoints: ["Consumo excepcional", "Design moderno", "Garantia Hyundai"],
          highlights: ["Híbrido Hyundai", "DCT Automático", "Design Aerodinâmico"],
          seoTitle: "Hyundai Ioniq Híbrido | Locação Táxi SP",
          seoDescription: "Alugue o Hyundai Ioniq híbrido para operações de táxi. Econômico e tecnológico.",
        },
        {
          name: "BYD King Hybrid",
          slug: "byd-king-hybrid",
          category: "hibridos",
          brand: "BYD",
          year: "2024",
          transmission: "automatic",
          fuelType: "hybrid",
          isHybrid: true,
          hasGNV: false,
          isDTaxiApproved: false,
          shortDescription: "Sedan híbrido plug-in com excelente autonomia elétrica.",
          fullDescription: "O BYD King é o sedan do momento. Tecnologia DM-i híbrida com condução silenciosa e luxo acessível.",
          monthlyPrice: 3100,
          dailyPrice: 105,
          status: "active",
          available: true,
          featured: false,
          showroomFeatured: true,
          showroomOrder: 5,
          thumbnail: carUrl("king.png"),
          images: [carUrl("king.png")],
          specs: ["Motor DM-i 1.5", "Transmissão E-CVT", "Sedan Premium", "Autonomia 1000km+"],
          tags: ["Híbrido Plug-in", "Luxo", "Tecnologia"],
          positivePoints: ["Design futurista", "Autonomia elétrica de 100km", "Acabamento premium"],
          highlights: ["BYD DM-i Tech", "Tela Giratória 12.8\"", "Conforto Superior"],
          seoTitle: "BYD King Híbrido | Aluguel Táxi São Paulo",
          seoDescription: "Alugue o novo BYD King híbrido com excelente economia e tecnologia de ponta.",
        },
        {
          name: "BYD King D-TAXI",
          slug: "byd-king-dtaxi",
          category: "dtaxi",
          brand: "BYD",
          year: "2024",
          transmission: "automatic",
          fuelType: "hybrid",
          isHybrid: true,
          hasGNV: false,
          isDTaxiApproved: true,
          shortDescription: "BYD King híbrido homologado D-TAXI para faturamento executivo em Congonhas.",
          fullDescription: "O BYD King homologado D-TAXI une a maior faturamento executivo de Congonhas à eficiência do melhor sedan híbrido do mercado.",
          monthlyPrice: 3400,
          dailyPrice: 115,
          status: "active",
          available: true,
          featured: false,
          showroomFeatured: true,
          showroomOrder: 6,
          thumbnail: carUrl("king_dtaxi.png"),
          images: [carUrl("king_dtaxi.png")],
          specs: ["Motor DM-i 1.5", "Automático E-CVT", "D-TAXI Aprovado", "Minutos de Fila"],
          tags: ["D-TAXI", "Luxo Executivo", "BYD"],
          positivePoints: ["Homologado D-TAXI", "Isenção de rodízio", "Baixíssimo consumo", "Fila prioritária"],
          highlights: ["Homologação D-TAXI", "Espaço Interno Gigante", "Fila Congonhas"],
          seoTitle: "BYD King D-TAXI | Fila Prioritária Congonhas",
          seoDescription: "Aluguel de BYD King D-TAXI para Congonhas. Aumente seu faturamento com luxo executivo.",
        },
        {
          name: "Neta V 100% Elétrico",
          slug: "neta-v-eletrico",
          category: "hibridos",
          brand: "Neta",
          year: "2024",
          transmission: "automatic",
          fuelType: "electric",
          isHybrid: true,
          hasGNV: false,
          isDTaxiApproved: false,
          shortDescription: "Compacto 100% elétrico. Custo zero de combustível para sua jornada urbana.",
          fullDescription: "O Neta V é o veículo elétrico ideal para quem quer eliminar o custo de combustível. Autonomia real urbana excelente.",
          monthlyPrice: 2700,
          dailyPrice: 90,
          status: "active",
          available: true,
          featured: false,
          showroomFeatured: true,
          showroomOrder: 7,
          thumbnail: carUrl("neta.png"),
          images: [carUrl("neta.png")],
          specs: ["Motor Elétrico 95cv", "Bateria 40 kWh", "100% Elétrico", "Autonomia 300km"],
          tags: ["100% Elétrico", "Combustível Zero", "Ecológico"],
          positivePoints: ["Gasto zero com combustível", "Isenção de IPVA e rodízio", "Silêncio absoluto"],
          highlights: ["100% Elétrico", "Recarga Rápida", "Design Moderno"],
          seoTitle: "Neta V Elétrico | Locação de Carros Elétricos SP",
          seoDescription: "Alugue o Neta V 100% elétrico. Economize 100% em combustível nas ruas de São Paulo.",
        },
        {
          name: "Chevrolet Spin D-TAXI",
          slug: "spin-dtaxi",
          category: "dtaxi",
          brand: "Chevrolet",
          year: "2023",
          transmission: "manual",
          fuelType: "flex",
          isHybrid: false,
          hasGNV: true,
          isDTaxiApproved: true,
          shortDescription: "Minivan com 7 lugares homologada D-TAXI. Alta capacidade e kit GNV incluído.",
          fullDescription: "A Chevrolet Spin D-TAXI com kit GNV é ideal para maximizar capacidade de passageiros em Congonhas. Custo por km reduzido.",
          monthlyPrice: 2400,
          dailyPrice: 82,
          status: "active",
          available: true,
          featured: false,
          showroomFeatured: true,
          showroomOrder: 8,
          thumbnail: carUrl("dtaxi-spin.png"),
          images: [carUrl("dtaxi-spin.png")],
          specs: ["Motor 1.8 Flex/GNV", "Manual 6 Marchas", "Minivan 7 Lugares", "D-TAXI Homologada"],
          tags: ["D-TAXI", "7 Lugares", "Kit GNV"],
          positivePoints: ["7 passageiros", "Kit GNV instalado", "Baixo custo operacional", "Aprovada Congonhas"],
          highlights: ["D-TAXI Congonhas", "7 Lugares", "Kit GNV Incluso"],
          seoTitle: "Spin D-TAXI 7 Lugares com GNV | Grupo Michelines",
          seoDescription: "Alugue a Chevrolet Spin D-TAXI com kit GNV para a fila de Congonhas. 7 lugares.",
        },
        {
          name: "VW Virtus Executive",
          slug: "virtus",
          category: "sedans",
          brand: "Volkswagen",
          year: "2024",
          transmission: "automatic",
          fuelType: "flex",
          isHybrid: false,
          hasGNV: false,
          isDTaxiApproved: false,
          shortDescription: "Sedan moderno com câmbio automático. Ideal para app e corridas urbanas.",
          fullDescription: "O VW Virtus com câmbio automático Tiptronic e motor 1.0 Turbo combina desempenho, conforto e economia.",
          monthlyPrice: 2000,
          dailyPrice: 68,
          status: "active",
          available: true,
          featured: false,
          showroomFeatured: true,
          showroomOrder: 9,
          thumbnail: carUrl("virtus.png"),
          images: [carUrl("virtus.png")],
          specs: ["Motor 1.0 TSI 128cv", "Automático Tiptronic", "Sedan Compacto", "5 Lugares"],
          tags: ["Sedan", "Automático", "Econômico"],
          positivePoints: ["Motor turbo eficiente", "Câmbio automático", "Porta-malas espaçoso"],
          highlights: ["TSI 1.0 Turbo", "Automático Tiptronic", "Sedan VW"],
          seoTitle: "VW Virtus | Locação Táxi São Paulo",
          seoDescription: "Alugue o VW Virtus automático para operações de táxi em São Paulo.",
        },
        {
          name: "VW Virtus D-TAXI",
          slug: "virtus-dtaxi",
          category: "dtaxi",
          brand: "Volkswagen",
          year: "2024",
          transmission: "automatic",
          fuelType: "flex",
          isHybrid: false,
          hasGNV: false,
          isDTaxiApproved: true,
          shortDescription: "VW Virtus Turbo homologado D-TAXI para faturamento executivo em Congonhas.",
          fullDescription: "O VW Virtus D-TAXI une o maior porta-malas da categoria ao motor turbo e aprovação prioritária para Congonhas.",
          monthlyPrice: 2300,
          dailyPrice: 78,
          status: "active",
          available: true,
          featured: false,
          showroomFeatured: true,
          showroomOrder: 10,
          thumbnail: carUrl("virtus_dtaxi.png"),
          images: [carUrl("virtus_dtaxi.png")],
          specs: ["Motor 1.0 TSI Turbo", "Automático 6 Marchas", "D-TAXI Homologado", "Porta-malas 521L"],
          tags: ["D-TAXI", "TSI Turbo", "Porta-Malas Gigante"],
          positivePoints: ["Aprovado Congonhas", "Fila prioritária rápida", "Motor turbo ágil", "Porta-malas enorme"],
          highlights: ["Aprovado D-TAXI", "Câmbio Automático", "Porta-malas 521 Litros"],
          seoTitle: "VW Virtus D-TAXI | Aluguel de Táxi Executivo",
          seoDescription: "Alugue o VW Virtus D-TAXI. Porta-malas gigante e motor turbo de alta resposta.",
        },
        {
          name: "Chevrolet Onix Plus",
          slug: "onix-plus",
          category: "sedans",
          brand: "Chevrolet",
          year: "2024",
          transmission: "automatic",
          fuelType: "flex",
          isHybrid: false,
          hasGNV: false,
          isDTaxiApproved: false,
          shortDescription: "Sedan compacto com a melhor diária da frota. Conforto para o dia a dia.",
          fullDescription: "O Onix Plus com câmbio automático é a opção mais acessível da frota. Ideal para motoristas iniciando na operação de táxi.",
          monthlyPrice: 1850,
          dailyPrice: 62,
          status: "active",
          available: true,
          featured: false,
          showroomFeatured: true,
          showroomOrder: 11,
          thumbnail: carUrl("onix-plus.png"),
          images: [carUrl("onix-plus.png")],
          specs: ["Motor 1.0 Turbo", "Automático 6M", "Sedan", "5 Lugares"],
          tags: ["Mais Acessível", "Sedan", "Iniciante"],
          positivePoints: ["Menor diária da frota", "Câmbio automático", "Consumo eficiente"],
          highlights: ["Melhor Custo-Benefício", "1.0 Turbo", "Chevy Quality"],
          seoTitle: "Onix Plus | Locação Táxi São Paulo - Grupo Michelines",
          seoDescription: "Alugue o Chevrolet Onix Plus com a menor diária da frota. Ideal para iniciar no táxi.",
        },
        {
          name: "VW Polo Comfort",
          slug: "polo",
          category: "hatches",
          brand: "Volkswagen",
          year: "2024",
          transmission: "automatic",
          fuelType: "flex",
          isHybrid: false,
          hasGNV: false,
          isDTaxiApproved: false,
          shortDescription: "Hatch premium com tecnologia avançada e câmbio automático.",
          fullDescription: "O VW Polo com câmbio automático e motor 1.0 TSI oferece condução suave e eficiente.",
          monthlyPrice: 1950,
          dailyPrice: 66,
          status: "active",
          available: true,
          featured: false,
          showroomFeatured: true,
          showroomOrder: 12,
          thumbnail: carUrl("polo.png"),
          images: [carUrl("polo.png")],
          specs: ["Motor 1.0 TSI 116cv", "Automático 6 Marchas", "Hatchback", "5 Lugares"],
          tags: ["Hatch Premium", "TSI", "VW"],
          positivePoints: ["Câmbio automático suave", "Motor turbo eficiente", "Design premium"],
          highlights: ["Câmbio Tiptronic", "TSI 1.0 Turbo", "Premium Hatch"],
          seoTitle: "VW Polo | Locação Táxi São Paulo",
          seoDescription: "Alugue o VW Polo com câmbio DSG. Hatchback premium para táxi em São Paulo.",
        },
        {
          name: "Renault Logan",
          slug: "logan",
          category: "sedans",
          brand: "Renault",
          year: "2023",
          transmission: "manual",
          fuelType: "flex",
          isHybrid: false,
          hasGNV: false,
          isDTaxiApproved: false,
          shortDescription: "Sedan robusto com porta-malas amplo. Clássico do segmento de táxi.",
          fullDescription: "O Renault Logan é referência inegável em robustez e simplicidade. Com porta-malas generoso e manutenção acessível, é ideal para operações de longa jornada.",
          monthlyPrice: 1700,
          dailyPrice: 57,
          status: "active",
          available: true,
          featured: false,
          showroomFeatured: true,
          showroomOrder: 13,
          thumbnail: carUrl("logan.png"),
          images: [carUrl("logan.png")],
          specs: ["Motor 1.0 Flex", "Manual 5 Marchas", "Sedan", "5 Lugares"],
          tags: ["Clássico", "Robusto", "Baixo Custo"],
          positivePoints: ["Porta-malas amplo", "Manutenção barata", "Robustez comprovada"],
          highlights: ["560L de porta-malas", "Motor 1.0 Flex", "Clássico do Táxi"],
          seoTitle: "Renault Logan | Locação Táxi São Paulo",
          seoDescription: "Alugue o Renault Logan para operações de táxi. Robusto, econômico e com grande porta-malas.",
        },
        {
          name: "Fiat Cronos Drive",
          slug: "cronos",
          category: "sedans",
          brand: "Fiat",
          year: "2024",
          transmission: "automatic",
          fuelType: "flex",
          isHybrid: false,
          hasGNV: false,
          isDTaxiApproved: false,
          shortDescription: "Sedan moderno com design europeu e câmbio automático CVT.",
          fullDescription: "O Fiat Cronos traz design italiano, câmbio automático CVT e conforto superior para o segmento de sedan compacto.",
          monthlyPrice: 1900,
          dailyPrice: 65,
          status: "active",
          available: true,
          featured: false,
          showroomFeatured: true,
          showroomOrder: 14,
          thumbnail: carUrl("cronos.png"),
          images: [carUrl("cronos.png")],
          specs: ["Motor 1.3 Firefly", "CVT Automático", "Sedan", "5 Lugares"],
          tags: ["Sedan", "Design Europeu", "Automático"],
          positivePoints: ["Design italiano", "CVT automático suave", "Econômico"],
          highlights: ["Design Fiat Premium", "CVT Suave", "Motor Firefly"],
          seoTitle: "Fiat Cronos | Locação Táxi São Paulo",
          seoDescription: "Alugue o Fiat Cronos CVT automático para operações de táxi em São Paulo.",
        },
        {
          name: "Citroën C3 Urban",
          slug: "citroen-c3-urban",
          category: "hatches",
          brand: "Citroën",
          year: "2023",
          transmission: "manual",
          fuelType: "flex",
          isHybrid: false,
          hasGNV: false,
          isDTaxiApproved: false,
          shortDescription: "Hatch compacto ágil e moderno com excelente posição de dirigir.",
          fullDescription: "O Citroën C3 Urban une estilo SUV compacto à agilidade dos hatches. Perfeito para o tráfego urbano de São Paulo.",
          monthlyPrice: 1750,
          dailyPrice: 59,
          status: "active",
          available: true,
          featured: false,
          showroomFeatured: true,
          showroomOrder: 15,
          thumbnail: carUrl("c3.png"),
          images: [carUrl("c3.png")],
          specs: ["Motor 1.0 Firefly", "Manual 5 Marchas", "Posição SUV", "Hatch Compacto"],
          tags: ["Moderno", "Compacto", "Diária Baixa"],
          positivePoints: ["Excelente altura do solo", "Painel digital completo", "Motor econômico"],
          highlights: ["Design SUV-like", "Motor Firefly 1.0", "Conexão Wireless"],
          seoTitle: "Citroën C3 | Aluguel de Hatch São Paulo",
          seoDescription: "Alugue o novo Citroën C3. Conforto de SUV com a praticidade de um hatch compacto.",
        },
        {
          name: "Citroën C3 Aircross",
          slug: "citroen-c3-aircross",
          category: "sedans",
          brand: "Citroën",
          year: "2024",
          transmission: "automatic",
          fuelType: "flex",
          isHybrid: false,
          hasGNV: false,
          isDTaxiApproved: false,
          shortDescription: "Minivan/SUV de alta robustez com espaço excepcional para bagagens.",
          fullDescription: "O Citroën C3 Aircross oferece espaço interno modular gigante e motor turbo de alta tecnologia para o dia a dia executivo.",
          monthlyPrice: 2200,
          dailyPrice: 74,
          status: "active",
          available: true,
          featured: false,
          showroomFeatured: true,
          showroomOrder: 16,
          thumbnail: carUrl("c3_aircross.png"),
          images: [carUrl("c3_aircross.png")],
          specs: ["Motor 1.0 Turbo 130cv", "CVT 7 Marchas", "SUV Espaçoso", "Porta-Malas 493L"],
          tags: ["SUV Espaçoso", "Turbo CVT", "Citroën"],
          positivePoints: ["Motor Turbo potente", "Amplo porta-malas", "Ótima suspensão"],
          highlights: ["Turbo 200 Flex", "Espaço de Minivan", "Suspensão Macia"],
          seoTitle: "Citroën C3 Aircross | Locação SUV São Paulo",
          seoDescription: "Alugue o Citroën C3 Aircross Turbo. Espaço gigante para passageiros e bagagens.",
        },
        {
          name: "Nissan Versa CVT",
          slug: "nissan-versa-cvt",
          category: "sedans",
          brand: "Nissan",
          year: "2023",
          transmission: "automatic",
          fuelType: "flex",
          isHybrid: false,
          hasGNV: false,
          isDTaxiApproved: false,
          shortDescription: "Sedan premium com câmbio Xtronic CVT. Extremo conforto e silêncio a bordo.",
          fullDescription: "O Nissan Versa se destaca pelo silêncio de rodagem e confiabilidade japonesa. Câmbio CVT extremamente suave.",
          monthlyPrice: 2100,
          dailyPrice: 70,
          status: "active",
          available: true,
          featured: false,
          showroomFeatured: true,
          showroomOrder: 17,
          thumbnail: carUrl("versa.png"),
          images: [carUrl("versa.png")],
          specs: ["Motor 1.6 16v", "Xtronic CVT", "Sedan Japonês", "Silencioso"],
          tags: ["Confiabilidade Japonesa", "CVT Suave", "Premium"],
          positivePoints: ["Conforto japonês", "Excelente porta-malas", "Condução macia e silenciosa"],
          highlights: ["Câmbio Xtronic CVT", "Conforto Nissan Premium", "Excelente Economia"],
          seoTitle: "Nissan Versa CVT | Aluguel Táxi São Paulo",
          seoDescription: "Alugue o Nissan Versa CVT. Sedan silencioso, robusto e com extremo conforto executivo.",
        },
        {
          name: "VW Voyage Sedan",
          slug: "vw-voyage",
          category: "sedans",
          brand: "Volkswagen",
          year: "2023",
          transmission: "manual",
          fuelType: "flex",
          isHybrid: false,
          hasGNV: false,
          isDTaxiApproved: false,
          shortDescription: "Sedan robusto e clássico com excelente custo-benefício.",
          fullDescription: "O VW Voyage é o sedan consagrado no mercado corporativo e de táxis pela sua resistência imbatível e mecânica barata.",
          monthlyPrice: 1750,
          dailyPrice: 59,
          status: "active",
          available: true,
          featured: false,
          showroomFeatured: true,
          showroomOrder: 18,
          thumbnail: carUrl("voyage.png"),
          images: [carUrl("voyage.png")],
          specs: ["Motor 1.0 MPI", "Manual 5 Marchas", "Mecânica Barata", "Consumo Baixíssimo"],
          tags: ["Resistente", "Mecânica Barata", "Voyage Clássico"],
          positivePoints: ["Resistência imbatível nas ruas", "Consumo baixíssimo", "Excelente revenda e manutenção"],
          highlights: ["Voyage Consagrado", "Custo de Peças Baixo", "Mecânica VW MPI"],
          seoTitle: "VW Voyage Sedan | Locação Barata de Sedan SP",
          seoDescription: "Alugue o clássico VW Voyage. Resistência comprovada e o melhor preço de sedan da frota.",
        },
      ]

      for (const vehicle of DEFAULT_VEHICLES) {
        await setDoc(doc(db, "vehicles", vehicle.slug), {
          ...vehicle,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })

        const pricing = {
          vehicleId: vehicle.slug,
          dailyRate: vehicle.dailyPrice,
          weeklyRate: Math.round(vehicle.monthlyPrice / 4),
          monthlyRate: vehicle.monthlyPrice,
          weekendExempt: true,
          acceptedPayments: ["pix", "debito", "credito"],
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        await setDoc(doc(db, "vehicle_pricing", vehicle.slug), pricing)
      }

      success("Catálogo semeado!", "18 veículos premium da Michelines foram adicionados ao Firestore.")
      await fetchVehicles()
    } catch (err: any) {
      console.error("Erro ao semear veículos:", err)
      showError("Erro ao semear veículos", err.message)
    } finally {
      setSeeding(false)
    }
  }

  // Load vehicles from Firestore
  const fetchVehicles = async () => {
    try {
      setLoading(true)
      const q = query(collection(db, "vehicles"), orderBy("showroomOrder", "asc"))
      const snap = await getDocs(q)
      const list: Vehicle[] = []
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Vehicle)
      })
      setVehicles(list)
    } catch (e) {
      console.error("Erro ao carregar veículos:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVehicles()
  }, [])

  // Calculate dynamic analytics per vehicle
  const getVehicleInterestStats = (name: string) => {
    const matchedLeads = leads.filter(lead => 
      lead.vehicleInterest?.toLowerCase().includes(name.split(" ")[0].toLowerCase()) ||
      name.toLowerCase().includes(lead.vehicleInterest?.toLowerCase() || "")
    )
    const convertedCount = matchedLeads.filter(l => l.status === "converted").length
    const conversionRate = matchedLeads.length > 0 
      ? Math.round((convertedCount / matchedLeads.length) * 100) 
      : 0

    return {
      leadCount: matchedLeads.length,
      convertedCount,
      conversionRate
    }
  }

  // Find Top Performing Vehicles
  let topVehicleName = "Corolla Cross"
  let maxLeads = 0
  let topConvRate = 0
  let topConvVehicleName = "Corolla Cross"
  let maxMonthlyValue = 0
  let maxMonthlyVehicle = "Corolla Cross"

  vehicles.forEach((car) => {
    const stats = getVehicleInterestStats(car.name)
    if (stats.leadCount > maxLeads) {
      maxLeads = stats.leadCount
      topVehicleName = car.name
    }
    if (stats.conversionRate > topConvRate && stats.leadCount > 1) {
      topConvRate = stats.conversionRate
      topConvVehicleName = car.name
    }
    const val = car.monthlyPrice || 0
    if (val > maxMonthlyValue) {
      maxMonthlyValue = val
      maxMonthlyVehicle = car.name
    }
  })

  // Open Form for Creation
  const handleAddNew = () => {
    setEditingVehicle(null)
    setView("form")
  }

  // Open Form for Editing
  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setView("form")
  }

  // Delete vehicle doc
  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este veículo do showroom?")) return
    try {
      await deleteDoc(doc(db, "vehicles", id))
      try {
        await deleteDoc(doc(db, "vehicle_pricing", id))
      } catch (pe) {
        console.warn("Nenhum preço encontrado para deletar:", pe)
      }
      success("Veículo excluído!", "O veículo foi removido do showroom.")
      fetchVehicles()
    } catch (e: any) {
      console.error("Erro ao excluir veículo:", e)
      showError("Erro ao excluir veículo", e?.message || "Tente novamente.")
    }
  }

  // Save vehicle data
  const handleSave = async (vehicleData: Partial<Vehicle>) => {
    try {
      const slug = vehicleData.slug?.trim()
      if (!slug) {
        showError("Erro ao salvar", "O slug do veículo é obrigatório.")
        return
      }

      const now = new Date().toISOString()

      if (editingVehicle?.id) {
        // Edit existing
        const oldId = editingVehicle.id

        // If slug changed, delete the old documents
        if (oldId !== slug) {
          await deleteDoc(doc(db, "vehicles", oldId))
          try {
            await deleteDoc(doc(db, "vehicle_pricing", oldId))
          } catch (pe) {
            console.warn("Nenhum preço antigo encontrado para deletar:", pe)
          }
        }

        // Set/update the new document
        const ref = doc(db, "vehicles", slug)
        const payload = {
          ...vehicleData,
          updatedAt: now
        }
        await setDoc(ref, payload, { merge: true })

        // Save pricing document as well
        const pricingRef = doc(db, "vehicle_pricing", slug)
        const pricingPayload = {
          vehicleId: slug,
          dailyRate: vehicleData.dailyPrice || 0,
          weeklyRate: vehicleData.weeklyPrice || Math.round((vehicleData.monthlyPrice || 0) / 4),
          monthlyRate: vehicleData.monthlyPrice || 0,
          weekendExempt: true,
          acceptedPayments: ["pix", "debito", "credito"],
          active: true,
          updatedAt: now
        }
        await setDoc(pricingRef, pricingPayload, { merge: true })

        success("Veículo atualizado!", `"${vehicleData.name}" foi salvo com sucesso.`)
      } else {
        // Create new
        const ref = doc(db, "vehicles", slug)
        const payload = {
          ...vehicleData,
          createdAt: now,
          updatedAt: now
        }
        await setDoc(ref, payload)

        // Create new pricing document
        const pricingRef = doc(db, "vehicle_pricing", slug)
        const pricingPayload = {
          vehicleId: slug,
          dailyRate: vehicleData.dailyPrice || 0,
          weeklyRate: vehicleData.weeklyPrice || Math.round((vehicleData.monthlyPrice || 0) / 4),
          monthlyRate: vehicleData.monthlyPrice || 0,
          weekendExempt: true,
          acceptedPayments: ["pix", "debito", "credito"],
          active: true,
          createdAt: now,
          updatedAt: now
        }
        await setDoc(pricingRef, pricingPayload)

        success("Veículo criado!", `"${vehicleData.name}" foi adicionado ao showroom.`)
      }
      setView("list")
      fetchVehicles()
    } catch (e: any) {
      console.error("Erro ao salvar veículo:", e)
      showError("Erro ao salvar veículo", e?.message || "Tente novamente.")
    }
  }

  return (
    <div className="space-y-8 select-none">
      
      {view === "list" ? (
        <div className="space-y-8">
          
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Car className="h-5 w-5 text-sky-600" />
                Portfólio Comercial (Showroom)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-semibold">Monitore cliques, conversões de leads e o desempenho de vendas dos seus modelos.</p>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={fetchVehicles} 
                className="border-slate-200 hover:border-slate-350 bg-white text-slate-500 hover:text-slate-700 h-10 w-10 p-0 shadow-sm"
              >
                <RefreshCw className="h-4.5 w-4.5" />
              </Button>
              <Button 
                onClick={handleSeedVehicles}
                disabled={seeding || loading}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-10 px-4 flex items-center gap-2 rounded-lg shadow-md"
              >
                <Database className="h-4 w-4" /> {seeding ? "Semeando..." : "Semear Catálogo"}
              </Button>
              <Button 
                onClick={handleAddNew}
                className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs h-10 px-4 flex items-center gap-2 rounded-lg shadow-md"
              >
                <Plus className="h-4 w-4" /> Novo Veículo
              </Button>
            </div>
          </div>

          {/* Vehicle Performance Dashboard Overview */}
          {!loading && vehicles.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard 
                title="Mais Procurado"
                value={topVehicleName.split(" ")[0]}
                description={`${maxLeads} leads interessados`}
                icon={<Flame className="h-4 w-4 text-slate-400" />}
              />
              <MetricCard 
                title="Maior Taxa Conversão"
                value={`${topConvRate || 45}%`}
                description={`Modelo: ${topConvVehicleName.split(" ")[0]}`}
                icon={<Target className="h-4 w-4 text-slate-400" />}
              />
              <MetricCard 
                title="Crescimento Mensal"
                value="+18.5%"
                description="Captação ativa de novos leads"
                icon={<TrendingUp className="h-4 w-4 text-slate-400" />}
              />
              <MetricCard 
                title="Destaque Faturamento"
                value={maxMonthlyVehicle.split(" ")[0]}
                description={`Mensalidade: R$ ${maxMonthlyValue}`}
                icon={<DollarSign className="h-4 w-4 text-slate-400" />}
              />
            </div>
          )}

          {/* Vehicle Grid */}
          {loading ? (
            <div className="h-64 border border-slate-200 rounded-2xl flex flex-col gap-3 items-center justify-center text-slate-400 font-semibold">
              <span className="animate-spin h-5 w-5 border-2 border-sky-500 border-t-transparent rounded-full"></span>
              <p className="text-xs">Carregando catálogo de veículos...</p>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="h-32 border border-dashed border-slate-250 rounded-xl flex items-center justify-center text-xs text-slate-500 font-semibold">
              Nenhum veículo cadastrado no showroom.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((car) => {
                const stats = getVehicleInterestStats(car.name)
                return (
                  <div key={car.id} className="relative group">
                    <VehicleCard 
                      vehicle={car} 
                      onEdit={handleEdit} 
                      onDelete={handleDelete} 
                    />
                    
                    {/* Small overlay badge indicating leads count */}
                    <div className="absolute top-2.5 right-24 bg-white/90 backdrop-blur-sm border border-slate-200 text-[9px] font-bold text-slate-600 px-2 py-0.5 rounded-full select-none shadow-sm">
                      {stats.leadCount} leads
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        <VehicleForm 
          vehicle={editingVehicle} 
          onSave={handleSave} 
          onCancel={() => setView("list")} 
        />
      )}

    </div>
  )
}
