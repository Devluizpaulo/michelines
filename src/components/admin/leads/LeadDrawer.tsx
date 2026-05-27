"use client"

import { useState, useEffect } from "react"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/app/firebase/config"
import { Lead } from "@/types/lead"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Phone, MessageSquare, Save, User, MapPin, Globe, CheckSquare, Square, Clock, Send, Sparkles } from "lucide-react"
import { calculateLeadScore } from "@/lib/lead-score"
import { useToast } from "@/components/ui/toast-simple"

interface LeadDrawerProps {
  lead: Lead | null
  isOpen: boolean
  onClose: () => void
  onLeadUpdated: (updatedLead: Lead) => void
}

const WHATSAPP_TEMPLATES = [
  { 
    id: "intro", 
    label: "Boas-vindas & Diárias", 
    text: "Olá {name}, sou da Micheline's! Vimos seu interesse na locação do táxi {vehicle}. Nossas diárias começam em R$ 57/dia com liberação rápida sem score. Vamos agendar sua visita?" 
  },
  { 
    id: "docs", 
    label: "Solicitação de Documentos", 
    text: "Olá {name}, para prosseguirmos com a liberação do seu {vehicle}, você poderia nos enviar uma foto legível da sua CNH?" 
  },
  { 
    id: "agendamento", 
    label: "Agendar Retirada do Táxi", 
    text: "Olá {name}, ótimo contato! Seu cadastro foi aprovado para o {vehicle}. Qual o melhor horário para você retirar o veículo amanhã?" 
  }
]

export function LeadDrawer({ lead, isOpen, onClose, onLeadUpdated }: LeadDrawerProps) {
  const { success, error: showError } = useToast()
  const [notes, setNotes] = useState("")
  const [status, setStatus] = useState<Lead["status"]>("new")
  const [contacted, setContacted] = useState(false)
  const [whatsappSent, setWhatsappSent] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // WhatsApp Template selection
  const [selectedTemplateId, setSelectedTemplateId] = useState("intro")
  const [customMessage, setCustomMessage] = useState("")

  // Sync state with selected lead
  useEffect(() => {
    if (lead) {
      setNotes(lead.notes || "")
      setStatus(lead.status)
      setContacted(lead.contacted || false)
      setWhatsappSent(lead.whatsappSent || false)
      
      // Default WhatsApp message construction
      const defaultTpl = WHATSAPP_TEMPLATES.find(t => t.id === "intro")
      if (defaultTpl) {
        setCustomMessage(
          defaultTpl.text
            .replace("{name}", lead.fullName.split(" ")[0])
            .replace("{vehicle}", lead.vehicleInterest)
        )
      }
    }
  }, [lead])

  if (!lead) return null

  const handleSave = async () => {
    try {
      setSaving(true)
      const leadRef = doc(db, "leads", lead.id)
      const payload = {
        notes,
        status,
        contacted,
        whatsappSent,
        updatedAt: new Date().toISOString()
      }
      
      await updateDoc(leadRef, payload)
      
      onLeadUpdated({
        ...lead,
        ...payload
      })

      success("Lead atualizado!", `Status de ${lead.fullName} foi salvo com sucesso.`)
      onClose()
    } catch (e: any) {
      console.error("Erro ao atualizar lead:", e)
      showError("Erro ao salvar lead", e?.message || "Verifique sua conexão e tente novamente.")
    } finally {
      setSaving(false)
    }
  }

  // Handle template selection change
  const handleTemplateChange = (val: string) => {
    setSelectedTemplateId(val)
    const tpl = WHATSAPP_TEMPLATES.find(t => t.id === val)
    if (tpl) {
      setCustomMessage(
        tpl.text
          .replace("{name}", lead.fullName.split(" ")[0])
          .replace("{vehicle}", lead.vehicleInterest)
      )
    }
  }

  const scoreInfo = calculateLeadScore(lead)
  const cleanPhone = lead.phone.replace(/\D/g, "")
  const waPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`
  const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(customMessage)}`

  const dateString = lead.createdAt?.toDate
    ? lead.createdAt.toDate().toLocaleString("pt-BR")
    : typeof lead.createdAt === "string"
      ? new Date(lead.createdAt).toLocaleString("pt-BR")
      : "Recém capturado"

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="bg-white border-l border-slate-200 text-slate-800 w-full sm:max-w-md overflow-y-auto max-h-screen scrollbar-thin scrollbar-thumb-slate-200">
        <SheetHeader className="border-b border-slate-100 pb-4">
          <SheetTitle className="text-xl font-black text-slate-900 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <User className="h-5 w-5 text-sky-600" />
              Detalhes do Lead
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 shrink-0 ${scoreInfo.color}`}>
              Score: {scoreInfo.score}
            </span>
          </SheetTitle>
          <SheetDescription className="text-slate-500">
            Gerencie o pipeline comercial, templates de mensagem e histórico de contato.
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          
          {/* 1. DADOS CADASTRAIS DO CLIENTE */}
          <div className="space-y-4">
            <div>
              <label className="text-[9px] uppercase font-black tracking-widest text-slate-450">Nome do Lead</label>
              <p className="text-base font-extrabold text-slate-900">{lead.fullName}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] uppercase font-black tracking-widest text-slate-450">Celular / WhatsApp</label>
                <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mt-0.5">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  {lead.phone}
                </p>
              </div>
              <div>
                <label className="text-[9px] uppercase font-black tracking-widest text-slate-450">Interesse</label>
                <div>
                  <Badge variant="outline" className="bg-sky-50 border-sky-200 text-sky-700 text-[10px] font-bold mt-1">
                    {lead.vehicleInterest}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Segmentação Comercial */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[9px] uppercase font-black tracking-widest text-slate-450">Segmentação Comercial</label>
              <div className="flex flex-wrap gap-1.5">
                {lead.interestDTaxi && (
                  <Badge className="bg-sky-50 border border-sky-200 text-sky-750 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5">
                    ✈️ Homologado Congonhas
                  </Badge>
                )}
                {lead.interestAirport && (
                  <Badge className="bg-blue-50 border border-blue-200 text-blue-750 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5">
                    💼 Operação Executiva
                  </Badge>
                )}
                {lead.interestExecutive && (
                  <Badge className="bg-indigo-50 border border-indigo-200 text-indigo-755 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5">
                    💎 Executivo Premium
                  </Badge>
                )}
                {lead.interestHybrid && (
                  <Badge className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5">
                    🔋 Híbrido Premium
                  </Badge>
                )}
                {lead.interestGNV && (
                  <Badge className="bg-teal-50 border border-teal-200 text-teal-700 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5">
                    Análise GNV
                  </Badge>
                )}
                {!lead.interestDTaxi && !lead.interestAirport && !lead.interestExecutive && !lead.interestHybrid && !lead.interestGNV && (
                  <span className="text-[10px] text-slate-400 font-bold italic">Sem segmentações selecionadas.</span>
                )}
              </div>
            </div>


            {/* UTM Tracking Params */}
            {lead.utm && (lead.utm.source || lead.utm.campaign) && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <p className="text-[9px] uppercase font-black text-slate-500 flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5 text-sky-600" /> Parâmetros de Origem (UTM)
                </p>
                <div className="flex flex-wrap gap-2">
                  {lead.utm.source && (
                    <Badge variant="outline" className="bg-white border-slate-250 text-slate-600 text-[9px]">
                      Source: {lead.utm.source}
                    </Badge>
                  )}
                  {lead.utm.medium && (
                    <Badge variant="outline" className="bg-white border-slate-250 text-slate-600 text-[9px]">
                      Medium: {lead.utm.medium}
                    </Badge>
                  )}
                  {lead.utm.campaign && (
                    <Badge variant="outline" className="bg-white border-slate-250 text-slate-600 text-[9px]">
                      Campaign: {lead.utm.campaign}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="h-px bg-slate-100" />

          {/* 2. PIPELINE E ACOMPANHAMENTO */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Etapa do Funil</label>
              <Select value={status} onValueChange={(val: Lead["status"]) => setStatus(val)}>
                <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-800">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 text-slate-750">
                  <SelectItem value="new">Novo Lead</SelectItem>
                  <SelectItem value="contacted">Contatado</SelectItem>
                  <SelectItem value="negotiating">Em Negociação</SelectItem>
                  <SelectItem value="scheduled">Visita Agendada</SelectItem>
                  <SelectItem value="converted">Convertido (Alugado)</SelectItem>
                  <SelectItem value="lost">Perdido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Checkboxes de Atendimento */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setContacted(!contacted)}
                className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-semibold text-slate-700 transition-all select-none text-left"
              >
                {contacted ? (
                  <CheckSquare className="h-4 w-4 text-sky-600 shrink-0" />
                ) : (
                  <Square className="h-4 w-4 text-slate-300 shrink-0" />
                )}
                Contatado
              </button>

              <button 
                onClick={() => setWhatsappSent(!whatsappSent)}
                className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-semibold text-slate-700 transition-all select-none text-left"
              >
                {whatsappSent ? (
                  <CheckSquare className="h-4 w-4 text-emerald-600 shrink-0" />
                ) : (
                  <Square className="h-4 w-4 text-slate-300 shrink-0" />
                )}
                WhatsApp Enviado
              </button>
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* 3. CENTRAL WHATSAPP - TEMPLATES COMERCIAIS */}
          <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-emerald-600" />
              Templates de Resposta Rápida
            </h4>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-450">Escolha o Template</label>
              <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
                <SelectTrigger className="bg-white border-slate-200 text-slate-700 h-9">
                  <SelectValue placeholder="Selecione o template" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 text-slate-700">
                  {WHATSAPP_TEMPLATES.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-450">Mensagem Formatada</label>
              <Textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="min-h-[80px] bg-white border-slate-200 text-slate-800 text-xs placeholder:text-slate-400"
              />
            </div>

            <a 
              href={waUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => setWhatsappSent(true)}
              className="block pt-1"
            >
              <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 rounded-lg font-bold text-xs h-10">
                <Send className="h-3.5 w-3.5" /> Enviar Template WhatsApp
              </Button>
            </a>
          </div>

          <div className="h-px bg-slate-100" />

          {/* 4. HISTÓRICO VISUAL / TIMELINE */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-sky-600" />
              Linha do Tempo do Atendimento
            </h4>

            <div className="relative border-l border-slate-200 pl-4 ml-2 space-y-4">
              {/* Event 1: Lead capture */}
              <div className="relative">
                <span className="absolute -left-[21px] top-1.5 bg-sky-500 h-2 w-2 rounded-full border border-white" />
                <p className="text-[11px] font-bold text-slate-800">Lead capturado no sistema</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Origem: {lead.source} • {dateString}</p>
              </div>

              {/* Event 2: WhatsApp status */}
              {lead.whatsappSent && (
                <div className="relative">
                  <span className="absolute -left-[21px] top-1.5 bg-emerald-500 h-2 w-2 rounded-full border border-white" />
                  <p className="text-[11px] font-bold text-slate-800">Primeiro contato WhatsApp disparado</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Mensagem enviada com sucesso.</p>
                </div>
              )}

              {/* Event 3: Contact status */}
              {lead.contacted && (
                <div className="relative">
                  <span className="absolute -left-[21px] top-1.5 bg-indigo-500 h-2 w-2 rounded-full border border-white" />
                  <p className="text-[11px] font-bold text-slate-800">Contato comercial consolidado</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Acompanhamento e diárias apresentadas.</p>
                </div>
              )}

              {/* Event 4: Last updates */}
              {lead.updatedAt && (
                <div className="relative">
                  <span className="absolute -left-[21px] top-1.5 bg-slate-450 h-2 w-2 rounded-full border border-white" />
                  <p className="text-[11px] font-bold text-slate-700">Alterações gravadas no perfil</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Modificado em: {new Date(lead.updatedAt).toLocaleString("pt-BR")}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* 5. HISTÓRICO DE NOTAS */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-650">Histórico de Atendimento / Observações</label>
            <Textarea
              placeholder="Digite aqui anotações sobre diárias, documentação de CNH..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px] bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Rodapé de Ações */}
        <div className="border-t border-slate-100 pt-4 flex gap-3 mt-6">
          <Button 
            onClick={onClose}
            variant="outline"
            className="flex-1 border-slate-200 hover:border-slate-350 text-slate-700 hover:bg-slate-50"
          >
            Fechar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center justify-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? "Salvando..." : "Salvar Notas"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
