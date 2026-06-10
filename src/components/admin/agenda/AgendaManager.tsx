"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore"
import { db } from "@/app/firebase/config"
import { Appointment, AppointmentType, APPOINTMENT_TYPE_LABELS } from "@/types/appointment"
import { Lead } from "@/types/lead"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/components/ui/toast-simple"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  CalendarDays,
  Plus,
  CheckCircle2,
  Trash2,
  Clock,
  Phone,
  CalendarCheck,
  MessageSquare,
  Search,
  UserCheck,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Helpers ─────────────────────────────────────────────────────────────────

function groupByDate(appointments: Appointment[]): Record<string, Appointment[]> {
  const groups: Record<string, Appointment[]> = {}
  appointments.forEach(a => {
    const dateKey = a.date.substring(0, 10)
    if (!groups[dateKey]) groups[dateKey] = []
    groups[dateKey].push(a)
  })
  return groups
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00")
  return date.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })
}

function isToday(dateStr: string): boolean {
  return dateStr === new Date().toISOString().substring(0, 10)
}

function isTomorrow(dateStr: string): boolean {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return dateStr === tomorrow.toISOString().substring(0, 10)
}

function isPast(dateStr: string): boolean {
  return dateStr < new Date().toISOString().substring(0, 10)
}

/** Gera URL do WhatsApp com mensagem de lembrete de agendamento */
function buildWhatsAppReminderUrl(appt: Appointment): string {
  const rawPhone = (appt.leadPhone || "").replace(/\D/g, "")
  if (!rawPhone) return ""
  const phone = rawPhone.startsWith("55") ? rawPhone : `55${rawPhone}`

  const typeInfo = APPOINTMENT_TYPE_LABELS[appt.type]
  const dateObj = new Date(appt.date)
  const dateFormatted = dateObj.toLocaleDateString("pt-BR", {
    weekday: "long", day: "2-digit", month: "long"
  })
  const timeFormatted = appt.date.length >= 16 ? appt.date.substring(11, 16) + "h" : ""

  const firstName = appt.leadName.split(" ")[0]

  const messages: Record<AppointmentType, string> = {
    visit: `Olá ${firstName}! 👋 Aqui é da equipe comercial do Grupo Michelines.\n\nLembrando que você tem uma *visita à nossa garagem* marcada para *${dateFormatted}${timeFormatted ? ` às ${timeFormatted}` : ""}*. 🏢\n\nConfirma que vai comparecer? Qualquer dúvida, é só chamar. Te esperamos! 🚖`,
    pickup: `Oi ${firstName}! 🚖 Tudo pronto aqui na garagem para a *retirada do seu veículo* marcada para *${dateFormatted}${timeFormatted ? ` às ${timeFormatted}` : ""}*.\n\nNão esqueça de trazer seus documentos originais. Qualquer dúvida, pode chamar! ✅`,
    docs: `Olá ${firstName}! 📄 Passando pra lembrar que você tem a *entrega de documentos* marcada para *${dateFormatted}${timeFormatted ? ` às ${timeFormatted}` : ""}*.\n\nDocumentos necessários: CNH original, CPF e comprovante de residência. Qualquer dúvida, estamos aqui! 😊`,
    callback: `Oi ${firstName}! 📞 Vou ligar para você *${dateFormatted}${timeFormatted ? ` às ${timeFormatted}` : ""}* para darmos continuidade ao processo. Fique no aguardo! Se preferir, pode me chamar antes. 🤝`,
  }

  const text = encodeURIComponent(messages[appt.type])
  return `https://wa.me/${phone}?text=${text}`
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AgendaManager() {
  const { adminUser } = useAuth()
  const { success, error } = useToast()

  // ── Appointments ──
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<"all" | "upcoming" | "today" | "past">("upcoming")

  // ── Lead search ──
  const [allLeads, setAllLeads] = useState<Lead[]>([])
  const [leadSearch, setLeadSearch] = useState("")
  const [leadSuggestions, setLeadSuggestions] = useState<Lead[]>([])
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // ── Form state ──
  const [formLeadName, setFormLeadName] = useState("")
  const [formLeadPhone, setFormLeadPhone] = useState("")
  const [formLeadId, setFormLeadId] = useState("")
  const [formType, setFormType] = useState<AppointmentType>("visit")
  const [formDate, setFormDate] = useState("")
  const [formTime, setFormTime] = useState("09:00")
  const [formNotes, setFormNotes] = useState("")
  const [saving, setSaving] = useState(false)

  // ── Load data ──
  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true)
      const q = query(collection(db, "appointments"), orderBy("date", "asc"))
      const snap = await getDocs(q)
      const list: Appointment[] = []
      snap.forEach(d => list.push({ id: d.id, ...d.data() } as Appointment))
      setAppointments(list)
    } catch (e) {
      console.error("[AgendaManager] Erro ao carregar agenda. Usando fallback:", e instanceof Error ? e.message : e)
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }, [])

  const loadLeads = useCallback(async () => {
    try {
      const q = query(collection(db, "leads"), orderBy("createdAt", "desc"))
      const snap = await getDocs(q)
      const list: Lead[] = []
      snap.forEach(d => list.push({ id: d.id, ...d.data() } as Lead))
      setAllLeads(list)
    } catch (e) {
      console.warn("[AgendaManager] Leads não carregados para autocomplete:", e instanceof Error ? e.message : e)
      setAllLeads([])
    }
  }, [])

  useEffect(() => {
    loadAppointments()
    loadLeads()
  }, [loadAppointments, loadLeads])

  // ── Lead search logic ──
  useEffect(() => {
    if (leadSearch.trim().length < 2) {
      setLeadSuggestions([])
      setShowSuggestions(false)
      return
    }
    const term = leadSearch.toLowerCase()
    const matches = allLeads
      .filter(l =>
        l.fullName?.toLowerCase().includes(term) ||
        l.phone?.replace(/\D/g, "").includes(term.replace(/\D/g, "")) ||
        l.vehicleInterest?.toLowerCase().includes(term)
      )
      .slice(0, 6)
    setLeadSuggestions(matches)
    setShowSuggestions(matches.length > 0)
  }, [leadSearch, allLeads])

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead)
    setFormLeadName(lead.fullName)
    setFormLeadPhone(lead.whatsapp || lead.phone || "")
    setFormLeadId(lead.id)
    setLeadSearch(lead.fullName)
    setShowSuggestions(false)
  }

  const handleClearLead = () => {
    setSelectedLead(null)
    setFormLeadName("")
    setFormLeadPhone("")
    setFormLeadId("")
    setLeadSearch("")
  }

  // ── CRUD ──
  const handleCreate = async () => {
    if (!formLeadName || !formDate) {
      error("Campos incompletos", "Nome e data são obrigatórios.")
      return
    }
    setSaving(true)
    try {
      const appointment: Omit<Appointment, "id"> = {
        leadId: formLeadId,
        leadName: formLeadName,
        leadPhone: formLeadPhone,
        type: formType,
        date: `${formDate}T${formTime}:00`,
        notes: formNotes,
        createdBy: adminUser?.displayName || adminUser?.email || "Admin",
        createdAt: new Date().toISOString(),
        completed: false
      }
      const ref = await addDoc(collection(db, "appointments"), appointment)
      const newAppt = { id: ref.id, ...appointment }
      setAppointments(prev => [...prev, newAppt].sort((a, b) => a.date.localeCompare(b.date)))
      success("Agendamento criado!", `${APPOINTMENT_TYPE_LABELS[formType].icon} ${formLeadName} em ${formDate}.`)
      resetForm()
      setShowForm(false)
    } catch (e) {
      error("Erro ao criar", "Tente novamente.")
    } finally {
      setSaving(false)
    }
  }

  const handleComplete = async (appt: Appointment) => {
    try {
      await updateDoc(doc(db, "appointments", appt.id), { completed: true })
      setAppointments(prev => prev.map(a => a.id === appt.id ? { ...a, completed: true } : a))
      success("Concluído!", `${appt.leadName} marcado como atendido.`)
    } catch (e) {
      error("Erro", "Não foi possível concluir.")
    }
  }

  const handleDelete = async (appt: Appointment) => {
    try {
      await deleteDoc(doc(db, "appointments", appt.id))
      setAppointments(prev => prev.filter(a => a.id !== appt.id))
    } catch (e) {
      error("Erro", "Não foi possível excluir.")
    }
  }

  const resetForm = () => {
    setFormLeadName("")
    setFormLeadPhone("")
    setFormLeadId("")
    setFormType("visit")
    setFormDate("")
    setFormTime("09:00")
    setFormNotes("")
    setLeadSearch("")
    setSelectedLead(null)
    setLeadSuggestions([])
    setShowSuggestions(false)
  }

  // ── Filtered / Grouped ──
  const todayStr = new Date().toISOString().substring(0, 10)
  const filteredAppointments = appointments.filter(a => {
    const dateKey = a.date.substring(0, 10)
    if (filter === "today") return dateKey === todayStr
    if (filter === "upcoming") return dateKey >= todayStr && !a.completed
    if (filter === "past") return dateKey < todayStr || a.completed
    return true
  })

  const grouped = groupByDate(filteredAppointments)
  const sortedDateKeys = Object.keys(grouped).sort()

  const todayCount = appointments.filter(a => a.date.substring(0, 10) === todayStr && !a.completed).length
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().substring(0, 10)
  const tomorrowCount = appointments.filter(a => a.date.substring(0, 10) === tomorrowStr && !a.completed).length
  const upcomingTotal = appointments.filter(a => a.date.substring(0, 10) >= todayStr && !a.completed).length

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-sky-600" />
            Agenda Comercial
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-semibold">
            Gerencie visitas, retiradas, documentos e retornos. Avise via WhatsApp com 1 clique.
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center gap-2 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center space-y-1">
          <p className="text-2xl font-black text-sky-600">{todayCount}</p>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Hoje</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center space-y-1">
          <p className="text-2xl font-black text-indigo-600">{tomorrowCount}</p>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Amanhã</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center space-y-1">
          <p className="text-2xl font-black text-emerald-600">{upcomingTotal}</p>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Próximos</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["upcoming", "today", "past", "all"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-bold border transition-all",
              filter === f
                ? "bg-sky-600 text-white border-sky-600 shadow-sm"
                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700"
            )}
          >
            {f === "upcoming" && "📅 Próximos"}
            {f === "today" && "🔴 Hoje"}
            {f === "past" && "✅ Passados"}
            {f === "all" && "Todos"}
          </button>
        ))}
      </div>

      {/* Appointment list */}
      {loading ? (
        <div className="py-20 text-center text-sm text-slate-400 font-semibold">Carregando agenda...</div>
      ) : sortedDateKeys.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <CalendarCheck className="h-12 w-12 text-slate-200 mx-auto" />
          <p className="text-sm font-bold text-slate-400">Nenhum agendamento para este período.</p>
          <Button variant="outline" onClick={() => setShowForm(true)} className="text-xs">
            + Criar agendamento
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDateKeys.map(dateKey => {
            const appts = grouped[dateKey]
            const dateLabel = isToday(dateKey) ? "🔴 Hoje" : isTomorrow(dateKey) ? "⚡ Amanhã" : formatDateLabel(dateKey)
            const datePast = isPast(dateKey) && !isToday(dateKey)

            return (
              <div key={dateKey}>
                <div className="flex items-center gap-3 mb-3">
                  <h3 className={cn(
                    "text-xs font-black uppercase tracking-wider",
                    isToday(dateKey) ? "text-red-600" : isTomorrow(dateKey) ? "text-indigo-600" : datePast ? "text-slate-400" : "text-slate-700"
                  )}>
                    {dateLabel}
                  </h3>
                  <div className="flex-1 h-px bg-slate-100" />
                  <span className="text-[10px] font-bold text-slate-400">{appts.length} evento{appts.length !== 1 ? "s" : ""}</span>
                </div>

                <div className="space-y-2.5">
                  {appts.map(appt => {
                    const typeInfo = APPOINTMENT_TYPE_LABELS[appt.type]
                    const timeStr = appt.date.length >= 16 ? appt.date.substring(11, 16) : ""
                    const waUrl = buildWhatsAppReminderUrl(appt)

                    return (
                      <div
                        key={appt.id}
                        className={cn(
                          "bg-white border rounded-xl p-4 flex items-center gap-4 shadow-sm transition-all",
                          appt.completed ? "opacity-60 border-slate-100" : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                        )}
                      >
                        {/* Type icon */}
                        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center text-xl shrink-0 border", typeInfo.color)}>
                          {typeInfo.icon}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={cn("text-sm font-bold", appt.completed ? "line-through text-slate-400" : "text-slate-800")}>
                              {appt.leadName}
                            </p>
                            <Badge className={cn("text-[9px] font-bold border", typeInfo.color)}>
                              {typeInfo.label}
                            </Badge>
                            {appt.completed && (
                              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] font-bold">
                                ✓ Concluído
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 font-semibold">
                            {timeStr && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {timeStr}h
                              </span>
                            )}
                            {appt.leadPhone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" /> {appt.leadPhone}
                              </span>
                            )}
                          </div>
                          {appt.notes && (
                            <p className="text-[11px] text-slate-500 mt-1.5 bg-slate-50 px-2 py-1 rounded border border-slate-100 font-medium">
                              {appt.notes}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* WhatsApp reminder — always shown if phone available */}
                          {waUrl && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Enviar lembrete via WhatsApp"
                              className={cn(
                                "h-8 w-8 rounded-lg border flex items-center justify-center transition-all",
                                appt.completed
                                  ? "bg-slate-50 border-slate-100 text-slate-300 pointer-events-none"
                                  : "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-600 hover:text-white hover:border-emerald-600"
                              )}
                            >
                              <MessageSquare className="h-4 w-4" />
                            </a>
                          )}

                          {!appt.completed && (
                            <>
                              <button
                                onClick={() => handleComplete(appt)}
                                title="Marcar como concluído"
                                className="h-8 w-8 rounded-lg bg-sky-50 border border-sky-200 text-sky-600 hover:bg-sky-600 hover:text-white transition-all flex items-center justify-center"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(appt)}
                                title="Excluir agendamento"
                                className="h-8 w-8 rounded-lg bg-red-50 border border-red-200 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── New Appointment Dialog ── */}
      <Dialog open={showForm} onOpenChange={open => { if (!open) { setShowForm(false); resetForm() } else setShowForm(true) }}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-black text-slate-900 flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-sky-600" />
              Novo Agendamento
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">

            {/* Lead Search */}
            <div className="space-y-1.5" ref={searchRef}>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Search className="h-3 w-3" />
                Buscar Lead (ou digitar manualmente)
              </label>

              <div className="relative">
                <div className="relative flex items-center">
                  <Search className="absolute left-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  <Input
                    placeholder="Nome, telefone ou veículo..."
                    value={leadSearch}
                    onChange={e => {
                      setLeadSearch(e.target.value)
                      setFormLeadName(e.target.value)
                      if (selectedLead) handleClearLead()
                    }}
                    onFocus={() => leadSuggestions.length > 0 && setShowSuggestions(true)}
                    className="text-sm border-slate-200 pl-8 pr-8"
                  />
                  {(leadSearch || selectedLead) && (
                    <button
                      onClick={handleClearLead}
                      className="absolute right-2.5 p-0.5 text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Suggestions dropdown */}
                {showSuggestions && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                    {leadSuggestions.map(lead => (
                      <button
                        key={lead.id}
                        onClick={() => handleSelectLead(lead)}
                        className="w-full text-left px-3 py-2.5 hover:bg-sky-50 transition-colors flex items-center gap-3 border-b border-slate-50 last:border-0"
                      >
                        <div className="h-7 w-7 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-black shrink-0">
                          {lead.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{lead.fullName}</p>
                          <p className="text-[10px] text-slate-500 font-semibold truncate">
                            {lead.phone} · {lead.vehicleInterest}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected lead badge */}
              {selectedLead && (
                <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <UserCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <p className="text-xs font-bold text-emerald-800 truncate">
                    Lead vinculado: {selectedLead.fullName}
                  </p>
                  <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[9px] font-bold shrink-0 ml-auto">
                    {selectedLead.vehicleInterest}
                  </Badge>
                </div>
              )}
            </div>

            {/* Phone — auto-filled when lead is selected */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Telefone / WhatsApp
              </label>
              <div className="relative flex items-center">
                <Phone className="absolute left-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                <Input
                  placeholder="(11) 99999-9999"
                  value={formLeadPhone}
                  onChange={e => setFormLeadPhone(e.target.value)}
                  className={cn(
                    "text-sm border-slate-200 pl-8",
                    selectedLead && "bg-emerald-50/50 border-emerald-200"
                  )}
                />
              </div>
            </div>

            {/* Type */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Tipo de Evento *</label>
              <Select value={formType} onValueChange={v => setFormType(v as AppointmentType)}>
                <SelectTrigger className="border-slate-200 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(APPOINTMENT_TYPE_LABELS).map(([key, val]) => (
                    <SelectItem key={key} value={key} className="text-sm">
                      {val.icon} {val.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Data *</label>
                <Input
                  type="date"
                  value={formDate}
                  onChange={e => setFormDate(e.target.value)}
                  className="text-sm border-slate-200"
                  min={new Date().toISOString().substring(0, 10)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Horário</label>
                <Input
                  type="time"
                  value={formTime}
                  onChange={e => setFormTime(e.target.value)}
                  className="text-sm border-slate-200"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Observações</label>
              <Textarea
                placeholder="Detalhes do agendamento, veículo de interesse, documentos necessários..."
                value={formNotes}
                onChange={e => setFormNotes(e.target.value)}
                className="text-sm border-slate-200 min-h-[70px]"
              />
            </div>

            {/* WhatsApp preview info */}
            {formLeadPhone && formDate && (
              <div className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 font-semibold">
                <MessageSquare className="h-3.5 w-3.5 shrink-0 mt-0.5 text-emerald-600" />
                <span>
                  Após criar, o botão <strong>WhatsApp</strong> aparecerá no agendamento para enviar o lembrete automaticamente para {formLeadPhone}.
                </span>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-1">
              <Button
                variant="outline"
                onClick={() => { setShowForm(false); resetForm() }}
                className="flex-1 border-slate-200 text-slate-600 font-bold"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreate}
                disabled={saving}
                className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-bold"
              >
                {saving ? "Salvando..." : "Criar Agendamento"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
