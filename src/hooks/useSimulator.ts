import { useState } from "react"

export function useSimulator() {
  const [hoursPerDay, setHoursPerDay] = useState(10)
  const [daysPerWeek, setDaysPerWeek] = useState(6)

  // Média de ganho bruto por hora no táxi (rodando em corredor/fila de aeroporto) = R$ 65/h
  // Média de custo diário do táxi (diária equivalente + combustível GNV) = R$ 130/dia
  const grossTaxi = hoursPerDay * 65 * daysPerWeek * 4.33
  const costTaxi = (100 + 50) * daysPerWeek * 4.33 // diária de R$ 100 + R$ 50 de GNV
  const netTaxi = grossTaxi - costTaxi

  // Média de ganho bruto por hora no app comum (parado no trânsito normal) = R$ 42/h
  // Média de custo diário do app comum (aluguel do carro proporcional + combustível gasolina caro) = R$ 160/dia
  const grossApp = hoursPerDay * 42 * daysPerWeek * 4.33
  const costApp = (90 + 90) * daysPerWeek * 4.33 // aluguel de R$ 90 + R$ 90 de Gasolina
  const netApp = grossApp - costApp

  const diffMonthly = Math.max(0, netTaxi - netApp)

  return {
    hoursPerDay,
    setHoursPerDay,
    daysPerWeek,
    setDaysPerWeek,
    grossTaxi,
    costTaxi,
    netTaxi,
    grossApp,
    costApp,
    netApp,
    diffMonthly
  }
}
