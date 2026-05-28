import { VehicleCategory } from "@/types/vehicle"

export const vehicleCategories: VehicleCategory[] = [
  {
    id: "dtaxi",
    name: "D-TAXI (Congonhas)",
    description: "Veículos executivos com autorização para a fila rápida de Congonhas",
    vehicles: [
      {
        name: "Toyota Corolla Cross D-TAXI",
        year: "2024",
        image: "/images/cars/Cross Dtaxi.png",
        price: "R$ 1.680,00/Semana",
        tag: "Mais Alugado",
        glow: "border-slate-700/60 shadow-lg hover:border-sky-500/30",
        tagColor: "bg-sky-600 text-white",
        specs: ["SUV Espaçoso", "Fila Rápida Congonhas", "GNV de 5ª Geração"]
      },
      {
        name: "Toyota Corolla D-TAXI",
        year: "2023",
        image: "/images/cars/corolla Dtaxi.png",
        price: "R$ 1.620,00/Semana",
        tag: "Premium Aeroporto",
        glow: "border-slate-700/60 shadow-lg hover:border-sky-500/30",
        tagColor: "bg-sky-600 text-white",
        specs: ["Bancos em Couro", "Câmbio Automático", "Fila Rápida Congonhas"]
      },
      {
        name: "Chevrolet Spin D-TAXI",
        year: "2023",
        image: "/images/cars/Spin Dtaxi.png",
        price: "R$ 1.380,00/Semana",
        tag: "Ideal p/ Bagagem",
        glow: "border-slate-700/60 shadow-lg hover:border-sky-500/30",
        tagColor: "bg-sky-600 text-white",
        specs: ["7 Lugares", "Super Porta-malas", "Fila Rápida Congonhas"]
      }
    ]
  },
  {
    id: "hibridos",
    name: "Híbridos",
    description: "Tecnologia autossustentável para máxima rentabilidade e eficiência",
    vehicles: [
      {
        name: "Toyota Corolla Híbrido",
        year: "2024",
        image: "/images/cars/corolla.png",
        price: "R$ 1.680,00/Semana",
        tag: "Economia Extrema",
        glow: "border-slate-700/60 shadow-lg hover:border-sky-500/30",
        tagColor: "bg-sky-600 text-white",
        specs: ["Até 22 km/L", "Bateria Autorregenerativa", "Super Silencioso"]
      },
      {
        name: "Toyota Prius Híbrido",
        year: "2023",
        image: "/images/cars/prius.png",
        price: "R$ 1.380,00/Semana",
        tag: "Favorito da Categoria",
        glow: "border-slate-700/60 shadow-lg hover:border-sky-500/30",
        tagColor: "bg-sky-600 text-white",
        specs: ["Até 25 km/L", "Design Aerodinâmico", "Painel Futurista"]
      },
      {
        name: "Hyundai Ioniq",
        year: "2022",
        image: "/images/cars/ioniq.png",
        price: "R$ 1.680,00/Semana",
        tag: "Conforto & Tecnologia",
        glow: "border-slate-700/60 shadow-lg hover:border-sky-500/30",
        tagColor: "bg-sky-600 text-white",
        specs: ["Isenção de IPVA SP", "Ar Dual Zone", "Multimídia Premium"]
      },
      {
        name: "Neta V Elétrico",
        year: "2024",
        image: "/images/cars/neta.png",
        price: "R$ 1.380,00/Semana",
        tag: "100% Elétrico",
        glow: "border-slate-700/60 shadow-lg hover:border-sky-500/30",
        tagColor: "bg-sky-600 text-white",
        specs: ["Autonomia 400km", "Tecnologia Digital", "100% Elétrico"]
      }
    ]
  },
  {
    id: "sedans",
    name: "Sedans",
    description: "Amplo espaço interno e conforto executivo para viagens de alto valor",
    vehicles: [
      {
        name: "Volkswagen Virtus",
        year: "2023",
        image: "/images/cars/virtus.png",
        price: "R$ 1.380,00/Semana",
        tag: "Excelente Custo-Benefício",
        glow: "border-slate-700/60 shadow-lg hover:border-sky-500/30",
        tagColor: "bg-slate-700 text-white",
        specs: ["Central VW Play", "Porta-malas de 521L", "Direção Elétrica"]
      },
      {
        name: "Chevrolet Onix Plus",
        year: "2024",
        image: "/images/cars/onix-plus.png",
        price: "R$ 1.320,00/Semana",
        tag: "Moderno & Conectado",
        glow: "border-slate-700/60 shadow-lg hover:border-sky-500/30",
        tagColor: "bg-slate-700 text-white",
        specs: ["Wi-Fi Nativo", "Motor Turbo Eficiente", "6 Airbags de Série"]
      },
      {
        name: "Nissan Versa",
        year: "2024",
        image: "/images/cars/versa.png",
        price: "R$ 960,00/Semana",
        tag: "Conforto Japonês",
        glow: "border-slate-700/60 shadow-lg hover:border-sky-500/30",
        tagColor: "bg-slate-700 text-white",
        specs: ["Chave Presencial", "Câmera de Ré Integrada", "Direção Macia"]
      }
    ]
  },
  {
    id: "hatches",
    name: "Compactos",
    description: "Modelos ágeis, práticos e econômicos para o fluxo urbano diário",
    vehicles: [
      {
        name: "Volkswagen Polo",
        year: "2025",
        image: "/images/cars/polo.png",
        price: "R$ 1.100/Semana",
        tag: "Visual Esportivo",
        glow: "border-slate-700/60 shadow-lg hover:border-sky-500/30",
        tagColor: "bg-slate-700 text-white",
        specs: ["Faróis em LED", "Econômico e Ágil", "Painel Digital"]
      },
      {
        name: "Citroën C3",
        year: "2025",
        image: "/images/cars/c3.png",
        price: "R$ 1.100/Semana",
        tag: "Atitude SUV",
        glow: "border-slate-700/60 shadow-lg hover:border-sky-500/30",
        tagColor: "bg-slate-700 text-white",
        specs: ["Posição Alta de Dirigir", "Multimídia 10'' Wireless", "Suspensão Macia"]
      }
    ]
  }
]
