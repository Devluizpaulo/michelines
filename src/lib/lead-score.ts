import { Lead } from "@/types/lead"

export interface LeadScoreInfo {
  score: number
  level: "hot" | "warm" | "cold"
  color: string
  label: string
}

export function calculateLeadScore(lead: Lead): LeadScoreInfo {
  let score = 0

  // 1. Source weight (Max 30 pts)
  if (lead.source === "WhatsApp") score += 30
  else if (lead.source === "Google") score += 25
  else if (lead.source === "Facebook" || lead.source === "Instagram") score += 20
  else if (lead.source === "Cadastro Site") score += 15
  else score += 10

  // 2. Vehicle Interest weight (Max 25 pts)
  const vehicle = lead.vehicleInterest?.toLowerCase() || ""
  if (vehicle.includes("cross") || vehicle.includes("híbrido") || vehicle.includes("hybrid")) {
    score += 25
  } else if (vehicle.includes("corolla") || vehicle.includes("spin")) {
    score += 20
  } else if (vehicle.includes("virtus") || vehicle.includes("polo")) {
    score += 15
  } else {
    score += 10
  }

  // 3. Status weight (Max 25 pts)
  if (lead.status === "negotiating" || lead.status === "scheduled") {
    score += 25
  } else if (lead.status === "contacted") {
    score += 15
  } else if (lead.status === "new") {
    score += 10
  }

  // 4. Follow-up / Interactions weight (Max 20 pts)
  if (lead.whatsappSent) score += 10
  if (lead.contacted) score += 10

  // Constrain between 0 and 100
  score = Math.min(Math.max(score, 0), 100)

  // Determine Level
  if (score >= 75) {
    return {
      score,
      level: "hot",
      color: "text-red-400 bg-red-950/20 border-red-500/30",
      label: "Quente"
    }
  } else if (score >= 50) {
    return {
      score,
      level: "warm",
      color: "text-amber-400 bg-amber-950/20 border-amber-500/30",
      label: "Morno"
    }
  } else {
    return {
      score,
      level: "cold",
      color: "text-blue-400 bg-blue-950/20 border-blue-500/30",
      label: "Frio"
    }
  }
}
