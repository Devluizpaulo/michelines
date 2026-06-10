export type AppointmentType = 'visit' | 'pickup' | 'docs' | 'callback'

export interface Appointment {
  id: string
  leadId: string
  leadName: string
  leadPhone: string
  type: AppointmentType
  date: string // ISO string
  notes?: string
  createdBy: string
  createdAt: string
  completed: boolean
}

export const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, { label: string; icon: string; color: string }> = {
  visit: {
    label: "Visita à Garagem",
    icon: "🏢",
    color: "bg-sky-50 text-sky-700 border-sky-200"
  },
  pickup: {
    label: "Retirada do Veículo",
    icon: "🚖",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200"
  },
  docs: {
    label: "Entrega de Documentos",
    icon: "📄",
    color: "bg-amber-50 text-amber-700 border-amber-200"
  },
  callback: {
    label: "Retorno Telefônico",
    icon: "📞",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200"
  }
}
