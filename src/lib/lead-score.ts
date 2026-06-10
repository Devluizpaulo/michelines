import { Lead } from "@/types/lead"

export interface LeadScoreInfo {
  score: number
  level: "priority" | "hot" | "warm" | "cold"
  color: string
  label: string
  labelEmoji: string
}

/**
 * Calcula o score de qualificação comercial do motorista.
 * Critérios voltados para perfil de locatário de táxi (Grupo Michelines).
 */
export function calculateLeadScore(lead: Lead): LeadScoreInfo {
  let score = 0

  // 1. Condutax (+20) — motorista habilitado para táxi (maior qualificador)
  if (lead.condutaxNumber || lead.hasCondutax === "sim" || lead.hasCondutax === "yes") {
    score += 20
  }

  // 2. EAR — Exame de Aptidão Remunerada (+15)
  if (lead.hasEar === "sim" || lead.hasEar === "yes" || lead.interestDTaxi) {
    score += 15
  }

  // 3. Experiência em frota (+15)
  if (lead.workedInFleet === "sim" || lead.workedInFleet === "yes" || lead.isTaxiDriver) {
    score += 15
  }

  // 4. Experiência > 3 anos (+10)
  const expYears = parseInt(lead.experienceYears || "0", 10)
  if (!isNaN(expYears) && expYears >= 3) {
    score += 10
  }

  // 5. Interesse em D-Taxi / táxi (+10)
  if (lead.interestDTaxi || lead.operationInterest?.toLowerCase().includes("taxi")) {
    score += 10
  }

  // 6. Interesse em híbridos ou GNV (+10)
  const vehicleLower = (lead.vehicleInterest || "").toLowerCase()
  if (
    lead.interestHybrid ||
    lead.interestGNV ||
    vehicleLower.includes("híbrido") ||
    vehicleLower.includes("hybrid") ||
    vehicleLower.includes("prius") ||
    vehicleLower.includes("gnv")
  ) {
    score += 10
  }

  // 7. Documentação completa: CNH + CPF + RG (+10)
  const hasFullDocs = !!(lead.cnhNumber && lead.cpf && lead.rg)
  if (hasFullDocs) {
    score += 10
  } else if (lead.cnhNumber || lead.cpf) {
    // Documentação parcial (+5)
    score += 5
  }

  // 8. Veículo definido e específico (não vago) (+10)
  const vagueVehicles = ["qualquer", "qualquer um", "outro", "não especificado", ""]
  const isVehicleDefined = !vagueVehicles.some(v =>
    vehicleLower.includes(v)
  ) && vehicleLower.length > 0
  if (isVehicleDefined) {
    score += 10
  }

  // 9. Score legado — se salvo diretamente no documento, usa como base adicional
  if (typeof (lead as any).score === "number" && (lead as any).score > 0) {
    // Blended: 70% novo score (qualificação) + 30% score legado
    score = Math.round(score * 0.7 + (lead as any).score * 0.3)
  }

  // Constrain between 0 and 100
  score = Math.min(Math.max(score, 0), 100)

  // Classificação por nível
  if (score >= 90) {
    return {
      score,
      level: "priority",
      color: "text-purple-700 bg-purple-50 border-purple-300",
      label: "Prioritário",
      labelEmoji: "🔥🔥"
    }
  } else if (score >= 70) {
    return {
      score,
      level: "hot",
      color: "text-red-600 bg-red-50 border-red-300",
      label: "Quente",
      labelEmoji: "🔥"
    }
  } else if (score >= 40) {
    return {
      score,
      level: "warm",
      color: "text-amber-600 bg-amber-50 border-amber-300",
      label: "Morno",
      labelEmoji: "🌡️"
    }
  } else {
    return {
      score,
      level: "cold",
      color: "text-sky-600 bg-sky-50 border-sky-300",
      label: "Frio",
      labelEmoji: "❄️"
    }
  }
}
