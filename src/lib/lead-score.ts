import { Lead, DocCategory } from "@/types/lead"

export interface LeadScoreInfo {
  score: number
  level: "priority" | "hot" | "warm" | "cold"
  color: string
  label: string
  labelEmoji: string
  /** Detalhamento por critério — permite explicar o número e agir sobre ele. */
  criteria: ScoreCriterion[]
  /** Pontos ainda disponíveis (soma dos critérios não atendidos). */
  missingPoints: number
}

export interface ScoreCriterion {
  id: string
  /** Rótulo curto exibido na ficha */
  label: string
  /** Quanto o critério vale */
  points: number
  /** Se o lead atende ao critério */
  met: boolean
  /**
   * O que pedir ao candidato quando o critério não é atendido.
   * `null` quando não há ação possível (ex.: preferência por veículo híbrido).
   */
  actionHint: string | null
  /** Documento correspondente, quando a pendência se resolve com um anexo. */
  docCategory?: DocCategory
}

/** Rótulos e cores das categorias de documento anexável à ficha. */
export const DOC_CATEGORIES: Record<DocCategory, { label: string; color: string }> = {
  cnh:          { label: "CNH",             color: "bg-sky-50 text-sky-700 border-sky-200" },
  condutax:     { label: "Condutax",        color: "bg-purple-50 text-purple-700 border-purple-200" },
  residencia:   { label: "Comp. Residência", color: "bg-amber-50 text-amber-700 border-amber-200" },
  foto:         { label: "Foto",            color: "bg-slate-50 text-slate-700 border-slate-200" },
  consulta_cpf: { label: "Consulta CPF",    color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  contrato:     { label: "Contrato",        color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  outros:       { label: "Outros",          color: "bg-slate-50 text-slate-600 border-slate-200" },
}

/**
 * Avalia cada critério de qualificação comercial do motorista.
 *
 * Separado do cálculo do total para que a ficha possa mostrar o porquê do score
 * — um número isolado não diz ao operador o que pedir ao candidato.
 */
function evaluateCriteria(lead: Lead): ScoreCriterion[] {
  const vehicleLower = (lead.vehicleInterest || "").toLowerCase()
  const expYears = parseInt(lead.experienceYears || "0", 10)
  const vagueVehicles = ["qualquer", "qualquer um", "outro", "não especificado"]

  const hasFullDocs = !!(lead.cnhNumber && lead.cpf && lead.rg)
  const hasPartialDocs = !!(lead.cnhNumber || lead.cpf)

  return [
    {
      id: "condutax",
      label: "Condutax",
      points: 20,
      met: !!(lead.condutaxNumber || lead.hasCondutax === "sim" || lead.hasCondutax === "yes"),
      actionHint: "Solicitar o número do Condutax ou o comprovante de processo em andamento.",
      docCategory: "condutax",
    },
    {
      id: "ear",
      label: "EAR na CNH",
      points: 15,
      met: !!(lead.hasEar === "sim" || lead.hasEar === "yes" || lead.interestDTaxi),
      actionHint: "Confirmar se a CNH tem a observação EAR (Exerce Atividade Remunerada).",
      docCategory: "cnh",
    },
    {
      id: "fleet",
      label: "Experiência em frota",
      points: 15,
      met: !!(lead.workedInFleet === "sim" || lead.workedInFleet === "yes" || lead.isTaxiDriver),
      actionHint: "Perguntar em qual frota já trabalhou e por quanto tempo.",
    },
    {
      id: "experience",
      label: "3+ anos de experiência",
      points: 10,
      met: !isNaN(expYears) && expYears >= 3,
      actionHint: "Confirmar o tempo de experiência como motorista profissional.",
    },
    {
      id: "dtaxi",
      label: "Interesse em táxi / D-Taxi",
      points: 10,
      met: !!(lead.interestDTaxi || lead.operationInterest?.toLowerCase().includes("taxi")),
      actionHint: "Apresentar a operação D-Taxi Congonhas e confirmar interesse.",
    },
    {
      id: "eco",
      label: "Interesse em híbrido/GNV",
      points: 10,
      met: !!(
        lead.interestHybrid ||
        lead.interestGNV ||
        ["híbrido", "hybrid", "prius", "gnv"].some((t) => vehicleLower.includes(t))
      ),
      // Preferência do cliente: não há o que "solicitar", só ofertar.
      actionHint: null,
    },
    {
      id: "docs",
      label: hasFullDocs ? "Documentação completa" : "Documentação (CNH, CPF e RG)",
      points: 10,
      met: hasFullDocs,
      actionHint: hasPartialDocs
        ? "Falta completar: solicitar os documentos restantes entre CNH, CPF e RG."
        : "Solicitar CNH, CPF e RG para abrir a ficha.",
      docCategory: "cnh",
    },
    {
      id: "vehicle",
      label: "Veículo definido",
      points: 10,
      met: vehicleLower.length > 0 && !vagueVehicles.some((v) => vehicleLower.includes(v)),
      actionHint: "Ajudar o candidato a escolher um modelo específico do showroom.",
    },
  ]
}

/**
 * Calcula o score de qualificação comercial do motorista.
 * Critérios voltados para perfil de locatário de táxi (Grupo Michelines).
 */
export function calculateLeadScore(lead: Lead): LeadScoreInfo {
  const criteria = evaluateCriteria(lead)

  let score = criteria.reduce((sum, c) => (c.met ? sum + c.points : sum), 0)

  // Documentação parcial vale metade — o critério em si conta como não atendido,
  // mas não zera a pontuação de quem já enviou parte dos documentos.
  const docsCriterion = criteria.find((c) => c.id === "docs")
  if (docsCriterion && !docsCriterion.met && (lead.cnhNumber || lead.cpf)) {
    score += 5
  }

  // Score legado — se salvo diretamente no documento, mistura com o novo cálculo
  const legacy = (lead as any).score
  if (typeof legacy === "number" && legacy > 0) {
    // Blended: 70% novo score (qualificação) + 30% score legado
    score = Math.round(score * 0.7 + legacy * 0.3)
  }

  score = Math.min(Math.max(score, 0), 100)

  const missingPoints = criteria.reduce((sum, c) => (c.met ? sum : sum + c.points), 0)

  const base = { score, criteria, missingPoints }

  if (score >= 90) {
    return { ...base, level: "priority", color: "text-purple-700 bg-purple-50 border-purple-300", label: "Prioritário", labelEmoji: "🔥🔥" }
  }
  if (score >= 70) {
    return { ...base, level: "hot", color: "text-red-600 bg-red-50 border-red-300", label: "Quente", labelEmoji: "🔥" }
  }
  if (score >= 40) {
    return { ...base, level: "warm", color: "text-amber-600 bg-amber-50 border-amber-300", label: "Morno", labelEmoji: "🌡️" }
  }
  return { ...base, level: "cold", color: "text-sky-600 bg-sky-50 border-sky-300", label: "Frio", labelEmoji: "❄️" }
}
