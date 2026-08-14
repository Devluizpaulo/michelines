import { supabase } from "@/lib/supabase"
import type { AppointmentRow, AppointmentTypeDb } from "@/types/database"

export interface Appointment {
  id: string
  leadId?: string
  leadName: string
  leadPhone?: string
  type: AppointmentTypeDb
  date: string
  notes?: string
  completed: boolean
  createdBy?: string
  createdAt: string
  updatedAt: string
}

export function rowToAppointment(row: AppointmentRow): Appointment {
  return {
    id: row.id,
    leadId: row.lead_id ?? undefined,
    leadName: row.lead_name,
    leadPhone: row.lead_phone ?? undefined,
    type: row.type,
    date: row.date,
    notes: row.notes ?? undefined,
    completed: row.completed,
    createdBy: row.created_by ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function listAppointments(): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .order("date", { ascending: true })

  if (error) throw error
  return (data ?? []).map((r) => rowToAppointment(r as AppointmentRow))
}

export async function createAppointment(input: {
  leadId?: string
  leadName: string
  leadPhone?: string
  type: AppointmentTypeDb
  date: string
  notes?: string
  createdBy?: string
}): Promise<Appointment> {
  const payload = {
    lead_id: input.leadId ?? null,
    lead_name: input.leadName,
    lead_phone: input.leadPhone ?? null,
    type: input.type,
    date: input.date,
    notes: input.notes ?? null,
    created_by: input.createdBy ?? null,
  }

  const { data, error } = await supabase
    .from("appointments")
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return rowToAppointment(data as AppointmentRow)
}

export async function updateAppointment(
  id: string,
  patch: Partial<Omit<Appointment, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  const row: Partial<AppointmentRow> = {}
  if (patch.leadId !== undefined) row.lead_id = patch.leadId ?? null
  if (patch.leadName !== undefined) row.lead_name = patch.leadName
  if (patch.leadPhone !== undefined) row.lead_phone = patch.leadPhone ?? null
  if (patch.type !== undefined) row.type = patch.type
  if (patch.date !== undefined) row.date = patch.date
  if (patch.notes !== undefined) row.notes = patch.notes ?? null
  if (patch.completed !== undefined) row.completed = patch.completed

  const { error } = await supabase.from("appointments").update(row).eq("id", id)
  if (error) throw error
}

export async function deleteAppointment(id: string): Promise<void> {
  const { error } = await supabase.from("appointments").delete().eq("id", id)
  if (error) throw error
}
