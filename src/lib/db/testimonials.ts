import { supabase } from "@/lib/supabase"
import type { TestimonialRow } from "@/types/database"
import type { Testimonial } from "@/types/testimonial"

export function rowToTestimonial(row: TestimonialRow): Testimonial {
  return {
    id: row.id,
    name: row.name,
    time: row.time ?? undefined,
    testimony: row.testimony,
    rating: row.rating,
    approved: row.approved,
    createdAt: row.created_at,
  }
}

/** Lista apenas depoimentos aprovados para o site público. */
export async function listApprovedTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .eq("approved", true)
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data ?? []).map((r) => rowToTestimonial(r as TestimonialRow))
}

/** Lista todos os depoimentos para a moderação do painel. */
export async function listAllTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data ?? []).map((r) => rowToTestimonial(r as TestimonialRow))
}

/** Envio público de depoimento pelo formulário (visitante anônimo). */
export async function createTestimonial(input: {
  name: string
  testimony: string
  rating?: number
  time?: string
}): Promise<Testimonial> {
  const payload = {
    name: input.name,
    testimony: input.testimony,
    rating: input.rating ?? 5,
    time: input.time ?? "Motorista Parceiro",
    approved: false, // Novo depoimento exige aprovação no painel
  }

  const { data, error } = await supabase
    .from("testimonials")
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return rowToTestimonial(data as TestimonialRow)
}

export const submitTestimonial = createTestimonial

export async function setTestimonialApproval(id: string, approved: boolean): Promise<void> {
  const { error } = await supabase
    .from("testimonials")
    .update({ approved })
    .eq("id", id)

  if (error) throw error
}

export async function toggleTestimonialApproval(id: string, currentApprovedStatus: boolean): Promise<void> {
  await setTestimonialApproval(id, !currentApprovedStatus)
}

export async function deleteTestimonial(id: string): Promise<void> {
  const { error } = await supabase
    .from("testimonials")
    .delete()
    .eq("id", id)

  if (error) throw error
}
