import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import fs from "fs";
import path from "path";

// 1. Read .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (!fs.existsSync(envPath)) {
  console.error("Arquivo .env.local não encontrado!");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, "utf8");
const env = {};
envContent.split("\n").forEach((line) => {
  const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)\s*$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

console.log("Inicializando Firebase com o projeto:", firebaseConfig.projectId);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 2. Vehicles List
const BASE = "https://cbynwzxalzcaownnouwp.supabase.co/storage/v1/object/public";
const car = (f) => `${BASE}/vehicles/${f}`;

const VEHICLES = [
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
    monthlyPrice: 3200, dailyPrice: 110,
    status: "active", available: true, featured: true, showroomFeatured: true, showroomOrder: 1,
    thumbnail: car("corolla-cross.png"),
    images: [car("corolla-cross.png")],
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
    monthlyPrice: 2800, dailyPrice: 95,
    status: "active", available: true, featured: true, showroomFeatured: true, showroomOrder: 2,
    thumbnail: car("corolla.png"),
    images: [car("corolla.png")],
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
    monthlyPrice: 3000, dailyPrice: 100,
    status: "active", available: true, featured: false, showroomFeatured: true, showroomOrder: 3,
    thumbnail: car("prius.png"),
    images: [car("prius.png")],
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
    monthlyPrice: 2600, dailyPrice: 88,
    status: "active", available: true, featured: false, showroomFeatured: true, showroomOrder: 4,
    thumbnail: car("ioniq.png"),
    images: [car("ioniq.png")],
    specs: ["Motor 1.6 Híbrido", "DCT Automático", "Sedan", "5 Lugares"],
    tags: ["Híbrido", "Econômico", "Coreano"],
    positivePoints: ["Consumo excepcional", "Design moderno", "Garantia Hyundai"],
    highlights: ["Híbrido Hyundai", "DCT Automático", "Design Aerodinâmico"],
    seoTitle: "Hyundai Ioniq Híbrido | Locação Táxi SP",
    seoDescription: "Alugue o Hyundai Ioniq híbrido para operações de táxi. Econômico e tecnológico.",
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
    monthlyPrice: 2400, dailyPrice: 82,
    status: "active", available: true, featured: false, showroomFeatured: true, showroomOrder: 5,
    thumbnail: car("dtaxi-spin.png"),
    images: [car("dtaxi-spin.png"), car("spin-big.png")],
    specs: ["Motor 1.0 Turbo Flex/GNV", "Manual 6 Marchas", "Minivan 7 Lugares", "D-TAXI Homologada"],
    tags: ["D-TAXI", "7 Lugares", "Kit GNV"],
    positivePoints: ["7 passageiros", "Kit GNV instalado", "Baixo custo operacional", "Aprovada Congonhas"],
    highlights: ["D-TAXI Congonhas", "7 Lugares", "Kit GNV Incluso"],
    seoTitle: "Spin D-TAXI 7 Lugares com GNV | Grupo Michelines",
    seoDescription: "Alugue a Chevrolet Spin D-TAXI com kit GNV para a fila de Congonhas. 7 lugares.",
  },
  {
    name: "VW Virtus",
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
    monthlyPrice: 2000, dailyPrice: 68,
    status: "active", available: true, featured: false, showroomFeatured: true, showroomOrder: 6,
    thumbnail: car("virtus.png"),
    images: [car("virtus.png")],
    specs: ["Motor 1.0 TSI 128cv", "Automático Tiptronic", "Sedan Compacto", "5 Lugares"],
    tags: ["Sedan", "Automático", "Econômico"],
    positivePoints: ["Motor turbo eficiente", "Câmbio automático", "Porta-malas espaçoso"],
    highlights: ["TSI 1.0 Turbo", "Automático Tiptronic", "Sedan VW"],
    seoTitle: "VW Virtus | Locação Táxi São Paulo",
    seoDescription: "Alugue o VW Virtus automático para operações de táxi em São Paulo.",
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
    monthlyPrice: 1850, dailyPrice: 62,
    status: "active", available: true, featured: false, showroomFeatured: true, showroomOrder: 7,
    thumbnail: car("onix-plus.png"),
    images: [car("onix-plus.png")],
    specs: ["Motor 1.0 Turbo", "Automático 6M", "Sedan", "5 Lugares"],
    tags: ["Mais Acessível", "Sedan", "Iniciante"],
    positivePoints: ["Menor diária da frota", "Câmbio automático", "Consumo eficiente"],
    highlights: ["Melhor Custo-Benefício", "1.0 Turbo", "Chevy Quality"],
    seoTitle: "Onix Plus | Locação Táxi São Paulo - Grupo Michelines",
    seoDescription: "Alugue o Chevrolet Onix Plus com a menor diária da frota. Ideal para iniciar no táxi.",
  },
  {
    name: "VW Polo",
    slug: "polo",
    category: "hatches",
    brand: "Volkswagen",
    year: "2024",
    transmission: "automatic",
    fuelType: "flex",
    isHybrid: false,
    hasGNV: false,
    isDTaxiApproved: false,
    shortDescription: "Hatch premium com tecnologia avançada e câmbio DSG.",
    fullDescription: "O VW Polo com câmbio DSG de dupla embreagem e motor 1.0 TSI oferece condução suave e eficiente.",
    monthlyPrice: 1950, dailyPrice: 66,
    status: "active", available: true, featured: false, showroomFeatured: true, showroomOrder: 8,
    thumbnail: car("polo.png"),
    images: [car("polo.png")],
    specs: ["Motor 1.0 TSI 116cv", "DSG 7 Marchas", "Hatchback", "5 Lugares"],
    tags: ["Hatch Premium", "DSG", "VW"],
    positivePoints: ["Câmbio DSG suave", "Motor turbo eficiente", "Design premium"],
    highlights: ["DSG 7 Marchas", "TSI 1.0 Turbo", "Premium Hatch"],
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
    fullDescription: "O Renault Logan é referência em robustez e simplicidade. Com porta-malas generoso e manutenção acessível, é ideal para operações de longa jornada.",
    monthlyPrice: 1700, dailyPrice: 57,
    status: "active", available: true, featured: false, showroomFeatured: true, showroomOrder: 9,
    thumbnail: car("logan.png"),
    images: [car("logan.png")],
    specs: ["Motor 1.0 Flex", "Manual 5 Marchas", "Sedan", "5 Lugares"],
    tags: ["Clássico", "Robusto", "Baixo Custo"],
    positivePoints: ["Porta-malas amplo", "Manutenção barata", "Robustez comprovada"],
    highlights: ["560L de porta-malas", "Motor 1.0 Flex", "Clássico do Táxi"],
    seoTitle: "Renault Logan | Locação Táxi São Paulo",
    seoDescription: "Alugue o Renault Logan para operações de táxi. Robusto, econômico e com grande porta-malas.",
  },
  {
    name: "Fiat Cronos",
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
    monthlyPrice: 1900, dailyPrice: 65,
    status: "active", available: true, featured: false, showroomFeatured: true, showroomOrder: 10,
    thumbnail: car("cronos.png"),
    images: [car("cronos.png")],
    specs: ["Motor 1.3 Firefly", "CVT Automático", "Sedan", "5 Lugares"],
    tags: ["Sedan", "Design Europeu", "Automático"],
    positivePoints: ["Design italiano", "CVT automático suave", "Econômico"],
    highlights: ["Design Fiat Premium", "CVT Suave", "Motor Firefly"],
    seoTitle: "Fiat Cronos | Locação Táxi São Paulo",
    seoDescription: "Alugue o Fiat Cronos CVT automático para operações de táxi em São Paulo.",
  },
];

async function seed() {
  console.log(`Iniciando cadastro de ${VEHICLES.length} veículos...`);
  for (const vehicle of VEHICLES) {
    try {
      // 1. Gravar Veículo
      await setDoc(doc(db, "vehicles", vehicle.slug), vehicle);
      console.log(`✅ Veículo cadastrado: ${vehicle.name}`);

      // 2. Gravar Precificação
      const pricing = {
        vehicleId: vehicle.slug,
        dailyRate: vehicle.dailyPrice || Math.round(vehicle.monthlyPrice / 30),
        weeklyRate: Math.round(vehicle.monthlyPrice / 4),
        monthlyRate: vehicle.monthlyPrice,
        weekendExempt: true,
        acceptedPayments: ["pix", "debito", "credito"],
        active: true
      };
      await setDoc(doc(db, "vehicle_pricing", vehicle.slug), pricing);
      console.log(`✅ Precificação cadastrada para: ${vehicle.name}`);
    } catch (err) {
      console.error(`❌ Erro ao cadastrar ${vehicle.name}:`, err.message);
    }
  }
  console.log("Fim do processo de seed!");
  process.exit(0);
}

seed();
