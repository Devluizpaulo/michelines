"use client"

import { useState, useEffect, useRef } from "react"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/app/firebase/config"
import { Lead, LeadInteraction } from "@/types/lead"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Phone, MessageSquare, Save, User, MapPin, Globe, CheckSquare, Square, Clock, Send, Sparkles,
  ShieldCheck, FileText, CheckCircle, XCircle, Info, Eye, UploadCloud, Trash2
} from "lucide-react"
import { calculateLeadScore } from "@/lib/lead-score"
import { useToast } from "@/components/ui/toast-simple"
import { useAuth } from "@/contexts/AuthContext"
import { getElapsedTime } from "./LeadCard"

interface LeadDrawerProps {
  lead: Lead | null
  isOpen: boolean
  onClose: () => void
  onLeadUpdated: (updatedLead: Lead) => void
}

const getDailyRateForVehicle = (interest: string): string => {
  const normalized = (interest || "").toLowerCase()
  if (normalized.includes("cross")) return "280"
  if (normalized.includes("corolla") || normalized.includes("prius")) return "270"
  if (normalized.includes("spin") || normalized.includes("virtus") || normalized.includes("neta")) return "230"
  if (normalized.includes("onix") || normalized.includes("plus")) return "220"
  if (normalized.includes("polo") || normalized.includes("c3")) return "180"
  if (normalized.includes("versa")) return "160"
  return "150"
}

const WHATSAPP_TEMPLATES = [
  {
    id: "intro",
    label: "Apresentação Táxi 🚖",
    text: "Fala, {name}! Beleza? Aqui é o {agent} da Michelines. 🚖 Vi que você tem interesse em alugar o {vehicle}. Cara, nossas diárias tão partindo de R$ {dailyRate} com liberação rápida, sem burocracia e sem enrolação de score! Bora dar um pulo aqui tomar um café e já sair rodando? Que dia fica melhor pra você?"
  },
  {
    id: "docs",
    label: "Pedido de CNH 📑",
    text: "Opa, {name}! Para a gente já adiantar sua ficha aqui e deixar o {vehicle} separado pra você, consegue me mandar uma foto bem nítida da sua CNH por aqui? É rapidinho!"
  },
  {
    id: "agendamento",
    label: "Aprovação & Retirada 🏆",
    text: "Grande {name}! Notícia boa: sua ficha comercial já foi pré-aprovada para o {vehicle}! 🏆 Agora é só vir buscar e começar a faturar. Qual o melhor horário para você passar aqui amanhã?"
  }
]

export function LeadDrawer({ lead, isOpen, onClose, onLeadUpdated }: LeadDrawerProps) {
  const { adminUser } = useAuth()
  const loggedInUser = adminUser?.displayName || adminUser?.email || "Admin"
  const { success, error: showError } = useToast()
  
  const [notes, setNotes] = useState("")
  const [status, setStatus] = useState<Lead["status"]>("new")
  const [approvalStatus, setApprovalStatus] = useState<Lead["approvalStatus"]>("pending")
  const [contacted, setContacted] = useState(false)
  const [whatsappSent, setWhatsappSent] = useState(false)
  const [saving, setSaving] = useState(false)

  // WhatsApp Template selection
  const [selectedTemplateId, setSelectedTemplateId] = useState("intro")
  const [customMessage, setCustomMessage] = useState("")

  // New driver evaluation phase states
  const [registrationStatus, setRegistrationStatus] = useState<Lead["registrationStatus"]>("complete")
  const [needsMoreData, setNeedsMoreData] = useState(false)
  const [contactedForData, setContactedForData] = useState(false)
  const [creditAnalysisStatus, setCreditAnalysisStatus] = useState<Lead["creditAnalysisStatus"]>("pending")
  const [authorizedBy, setAuthorizedBy] = useState("")
  const [archived, setArchived] = useState(false)

  // CRUD / Edit Candidate details states
  const [isEditing, setIsEditing] = useState(false)
  const [editFullName, setEditFullName] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editWhatsapp, setEditWhatsapp] = useState("")
  const [editCpf, setEditCpf] = useState("")
  const [editRg, setEditRg] = useState("")
  const [editAddress, setEditAddress] = useState("")
  const [editAddressStreet, setEditAddressStreet] = useState("")
  const [editAddressNumber, setEditAddressNumber] = useState("")
  const [editAddressComplement, setEditAddressComplement] = useState("")
  const [editAddressNeighborhood, setEditAddressNeighborhood] = useState("")
  const [editAddressCity, setEditAddressCity] = useState("")
  const [editAddressState, setEditAddressState] = useState("")
  const [editAddressNotes, setEditAddressNotes] = useState("")
  const [editCep, setEditCep] = useState("")
  const [editCnhNumber, setEditCnhNumber] = useState("")
  const [editCnhCategory, setEditCnhCategory] = useState("")
  const [editCondutaxNumber, setEditCondutaxNumber] = useState("")
  const [editLicenseDetails, setEditLicenseDetails] = useState("")
  const [editMessageName1, setEditMessageName1] = useState("")
  const [editMessagePhone1, setEditMessagePhone1] = useState("")
  const [editMessageName2, setEditMessageName2] = useState("")
  const [editMessagePhone2, setEditMessagePhone2] = useState("")
  const [editVehicleInterest, setEditVehicleInterest] = useState("")

  // Document Upload State
  const [uploadingDoc, setUploadingDoc] = useState(false)

  // Append a logged action into interactions history collection in Firestore
  const logInteraction = async (type: LeadInteraction["type"], content: string) => {
    const activeLead = lead
    if (!activeLead) return
    try {
      const leadRef = doc(db, "leads", activeLead.id)
      const newInteraction: LeadInteraction = {
        id: Math.random().toString(36).substring(2, 9),
        type,
        agentName: loggedInUser,
        content,
        createdAt: new Date().toISOString()
      }

      const updatedInteractions = [...(activeLead.interactions || []), newInteraction]

      await updateDoc(leadRef, {
        interactions: updatedInteractions,
        updatedAt: new Date().toISOString()
      })

      onLeadUpdated({
        ...activeLead,
        interactions: updatedInteractions,
        updatedAt: new Date().toISOString()
      })
    } catch (err) {
      console.warn("Erro ao registrar log de interação:", err)
    }
  }

  // Sync state with selected lead when the drawer opens or the lead updates
  useEffect(() => {
    if (lead && isOpen) {
      setNotes(lead.notes || "")
      setStatus(lead.status)
      setApprovalStatus(lead.approvalStatus || "pending")
      setContacted(lead.contacted || false)
      setWhatsappSent(lead.whatsappSent || false)

      // Sync evaluation phases
      setRegistrationStatus(lead.registrationStatus || (lead.fileUrls ? "complete" : "incomplete"))
      setNeedsMoreData(lead.needsMoreData || false)
      setContactedForData(lead.contactedForData || false)
      setCreditAnalysisStatus(lead.creditAnalysisStatus || "pending")
      setAuthorizedBy(lead.authorizedBy || "")
      setArchived(lead.archived || false)

      // Sync CRUD Edit fields
      setEditFullName(lead.fullName || "")
      setEditPhone(lead.phone || "")
      setEditEmail(lead.email || "")
      setEditWhatsapp(lead.whatsapp || "")
      setEditCpf(lead.cpf || "")
      setEditRg(lead.rg || "")
      setEditAddress(lead.address || "")
      setEditAddressStreet(lead.addressStreet || lead.address || "")
      setEditAddressNumber(lead.addressNumber || "")
      setEditAddressComplement(lead.addressComplement || "")
      setEditAddressNeighborhood(lead.addressNeighborhood || "")
      setEditAddressCity(lead.addressCity || "")
      setEditAddressState(lead.addressState || "")
      setEditAddressNotes(lead.addressNotes || "")
      setEditCep(lead.cep || "")
      setEditCnhNumber(lead.cnhNumber || "")
      setEditCnhCategory(lead.cnhCategory || "")
      setEditCondutaxNumber(lead.condutaxNumber || "")
      setEditLicenseDetails(lead.licenseDetails || "")
      setEditMessageName1(lead.messageName1 || "")
      setEditMessagePhone1(lead.messagePhone1 || "")
      setEditMessageName2(lead.messageName2 || "")
      setEditMessagePhone2(lead.messagePhone2 || "")
      setEditVehicleInterest(lead.vehicleInterest || "")
      setIsEditing(false) // Reset edit state when switching leads

      // Default WhatsApp message construction
      const defaultTpl = WHATSAPP_TEMPLATES.find(t => t.id === "intro")
      const agentFirstName = adminUser?.displayName ? adminUser.displayName.split(" ")[0] : "pessoal"
      if (defaultTpl) {
        setCustomMessage(
          defaultTpl.text
            .replace("{name}", lead.fullName.split(" ")[0])
            .replace("{agent}", agentFirstName)
            .replace("{vehicle}", lead.vehicleInterest)
            .replace("{dailyRate}", getDailyRateForVehicle(lead.vehicleInterest))
        )
      }
    }
  }, [lead, isOpen, adminUser])

  // Explicitly sync/pre-populate all edit states when entering edit mode
  useEffect(() => {
    if (isEditing && lead) {
      setEditFullName(lead.fullName || "")
      setEditPhone(lead.phone || "")
      setEditEmail(lead.email || "")
      setEditWhatsapp(lead.whatsapp || "")
      setEditCpf(lead.cpf || "")
      setEditRg(lead.rg || "")
      setEditAddress(lead.address || "")
      setEditAddressStreet(lead.addressStreet || lead.address || "")
      setEditAddressNumber(lead.addressNumber || "")
      setEditAddressComplement(lead.addressComplement || "")
      setEditAddressNeighborhood(lead.addressNeighborhood || "")
      setEditAddressCity(lead.addressCity || "")
      setEditAddressState(lead.addressState || "")
      setEditAddressNotes(lead.addressNotes || "")
      setEditCep(lead.cep || "")
      setEditCnhNumber(lead.cnhNumber || "")
      setEditCnhCategory(lead.cnhCategory || "")
      setEditCondutaxNumber(lead.condutaxNumber || "")
      setEditLicenseDetails(lead.licenseDetails || "")
      setEditMessageName1(lead.messageName1 || "")
      setEditMessagePhone1(lead.messagePhone1 || "")
      setEditMessageName2(lead.messageName2 || "")
      setEditMessagePhone2(lead.messagePhone2 || "")
      setEditVehicleInterest(lead.vehicleInterest || "")
    }
  }, [isEditing, lead])

  if (!lead) return null

  const handleUploadDocument = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !lead) return

    // Limit to 10MB
    if (file.size > 10 * 1024 * 1024) {
      showError("Arquivo muito grande", "O tamanho máximo permitido é 10MB.")
      return
    }

    try {
      setUploadingDoc(true)

      // Clean filename
      const cleanName = file.name
        .replace(/\s+/g, "_")
        .replace(/[()]/g, "")
        .toLowerCase()
      
      const remotePath = `leads_docs/${lead.id}/${Date.now()}_${cleanName}`

      const formData = new FormData()
      formData.append("bucket", "vehicles") // Save under vehicles bucket
      formData.append("path", remotePath)
      formData.append("file", file)

      const res = await fetch("/api/media", {
        method: "POST",
        body: formData,
      })

      const json = await res.json()

      if (!res.ok || json.error) {
        showError("Erro no upload", json.error || "Ocorreu um erro no upload do documento.")
        return
      }

      // Append to Firestore attachedDocs
      const newDoc = {
        name: file.name,
        url: json.url,
        path: json.path,
        uploadedAt: new Date().toISOString()
      }

      const updatedDocs = [...(lead.attachedDocs || []), newDoc]
      const leadRef = doc(db, "leads", lead.id)

      const updatedInteractions = [...(lead.interactions || [])]
      updatedInteractions.push({
        id: Math.random().toString(36).substring(2, 9),
        type: "note",
        agentName: loggedInUser,
        content: `Anexou o documento: '${file.name}'.`,
        createdAt: new Date().toISOString()
      })

      await updateDoc(leadRef, {
        attachedDocs: updatedDocs,
        interactions: updatedInteractions,
        updatedAt: new Date().toISOString()
      })

      onLeadUpdated({
        ...lead,
        attachedDocs: updatedDocs,
        interactions: updatedInteractions,
        updatedAt: new Date().toISOString()
      })

      success("Documento anexado!", `O documento '${file.name}' foi salvo com sucesso.`)
    } catch (err: any) {
      console.error("Erro no upload de documento:", err)
      showError("Erro no upload", "Não foi possível enviar o arquivo.")
    } finally {
      setUploadingDoc(false)
      // Reset input value to allow uploading same file again if deleted
      if (e.target) e.target.value = ""
    }
  }

  const handleDeleteDocument = async (docToDelete: { name: string; url: string; path?: string }) => {
    if (!lead) return
    
    if (!window.confirm(`Deseja realmente excluir o documento "${docToDelete.name}"?`)) {
      return
    }

    try {
      setSaving(true)

      // 1. Delete from Supabase Storage
      if (docToDelete.path) {
        const deleteRes = await fetch(`/api/media?bucket=vehicles&paths=${encodeURIComponent(docToDelete.path)}`, {
          method: "DELETE"
        })
        const deleteJson = await deleteRes.json()
        if (!deleteRes.ok || deleteJson.error) {
          console.warn("Aviso: Falha ao deletar do Supabase Storage:", deleteJson.error)
        }
      }

      // 2. Remove from Firestore
      const updatedDocs = (lead.attachedDocs || []).filter(d => d.url !== docToDelete.url)
      const leadRef = doc(db, "leads", lead.id)

      const updatedInteractions = [...(lead.interactions || [])]
      updatedInteractions.push({
        id: Math.random().toString(36).substring(2, 9),
        type: "note",
        agentName: loggedInUser,
        content: `Excluiu o documento anexado: '${docToDelete.name}'.`,
        createdAt: new Date().toISOString()
      })

      await updateDoc(leadRef, {
        attachedDocs: updatedDocs,
        interactions: updatedInteractions,
        updatedAt: new Date().toISOString()
      })

      onLeadUpdated({
        ...lead,
        attachedDocs: updatedDocs,
        interactions: updatedInteractions,
        updatedAt: new Date().toISOString()
      })

      success("Documento excluído!", `O documento '${docToDelete.name}' foi removido.`)
    } catch (err: any) {
      console.error("Erro ao deletar documento:", err)
      showError("Erro ao excluir", "Não foi possível excluir o documento.")
    } finally {
      setSaving(false)
    }
  }

  const handleSave = async () => {
    const activeLead = lead
    if (!activeLead) return
    try {
      setSaving(true)
      const leadRef = doc(db, "leads", activeLead.id)
      const newInteractions = [...(activeLead.interactions || [])]

      if (notes !== activeLead.notes) {
        newInteractions.push({
          id: Math.random().toString(36).substring(2, 9),
          type: "note",
          agentName: loggedInUser,
          content: "Atualizou observações / anotações de atendimento.",
          createdAt: new Date().toISOString()
        })
      }

      if (status !== activeLead.status) {
        newInteractions.push({
          id: Math.random().toString(36).substring(2, 9),
          type: "status_change",
          agentName: loggedInUser,
          content: `Alterou etapa do funil comercial para '${status}'.`,
          createdAt: new Date().toISOString()
        })
      }

      if (creditAnalysisStatus !== activeLead.creditAnalysisStatus) {
        newInteractions.push({
          id: Math.random().toString(36).substring(2, 9),
          type: "credit_check",
          agentName: loggedInUser,
          content: `Atualizou status da análise de crédito externa para '${creditAnalysisStatus}'.`,
          createdAt: new Date().toISOString()
        })
      }

      // Detect changes in CRUD details for Compliance logging
      const complianceLogs: string[] = []
      if (editFullName !== activeLead.fullName) {
        complianceLogs.push(`Nome: '${activeLead.fullName}' ➔ '${editFullName}'`)
      }
      if (editPhone !== activeLead.phone) {
        complianceLogs.push(`Celular: '${activeLead.phone}' ➔ '${editPhone}'`)
      }
      if (editEmail !== (activeLead.email || "")) {
        complianceLogs.push(`E-mail: '${activeLead.email || "Não informado"}' ➔ '${editEmail || "Não informado"}'`)
      }
      if (editWhatsapp !== (activeLead.whatsapp || "")) {
        complianceLogs.push(`WhatsApp: '${activeLead.whatsapp || "Não informado"}' ➔ '${editWhatsapp || "Não informado"}'`)
      }
      if (editCpf !== (activeLead.cpf || "")) {
        complianceLogs.push(`CPF: '${activeLead.cpf || "Não informado"}' ➔ '${editCpf || "Não informado"}'`)
      }
      if (editRg !== (activeLead.rg || "")) {
        complianceLogs.push(`RG: '${activeLead.rg || "Não informado"}' ➔ '${editRg || "Não informado"}'`)
      }
      if (editAddressStreet !== (activeLead.addressStreet || "")) {
        complianceLogs.push(`Rua: '${activeLead.addressStreet || "Não informado"}' ➔ '${editAddressStreet || "Não informado"}'`)
      }
      if (editAddressNumber !== (activeLead.addressNumber || "")) {
        complianceLogs.push(`Nº: '${activeLead.addressNumber || "Não informado"}' ➔ '${editAddressNumber || "Não informado"}'`)
      }
      if (editAddressComplement !== (activeLead.addressComplement || "")) {
        complianceLogs.push(`Comp.: '${activeLead.addressComplement || "Não informado"}' ➔ '${editAddressComplement || "Não informado"}'`)
      }
      if (editAddressNeighborhood !== (activeLead.addressNeighborhood || "")) {
        complianceLogs.push(`Bairro: '${activeLead.addressNeighborhood || "Não informado"}' ➔ '${editAddressNeighborhood || "Não informado"}'`)
      }
      if (editAddressCity !== (activeLead.addressCity || "")) {
        complianceLogs.push(`Cidade: '${activeLead.addressCity || "Não informado"}' ➔ '${editAddressCity || "Não informado"}'`)
      }
      if (editAddressState !== (activeLead.addressState || "")) {
        complianceLogs.push(`UF: '${activeLead.addressState || "Não informado"}' ➔ '${editAddressState || "Não informado"}'`)
      }
      if (editAddressNotes !== (activeLead.addressNotes || "")) {
        complianceLogs.push(`Obs Cadastro: '${activeLead.addressNotes || "Não informado"}' ➔ '${editAddressNotes || "Não informado"}'`)
      }
      if (editCep !== (activeLead.cep || "")) {
        complianceLogs.push(`CEP: '${activeLead.cep || "Não informado"}' ➔ '${editCep || "Não informado"}'`)
      }
      if (editCnhNumber !== (activeLead.cnhNumber || "")) {
        complianceLogs.push(`CNH: '${activeLead.cnhNumber || "Não informado"}' ➔ '${editCnhNumber || "Não informado"}'`)
      }
      if (editCnhCategory !== (activeLead.cnhCategory || "")) {
        complianceLogs.push(`Cat CNH: '${activeLead.cnhCategory || "Não informado"}' ➔ '${editCnhCategory || "Não informado"}'`)
      }
      if (editCondutaxNumber !== (activeLead.condutaxNumber || "")) {
        complianceLogs.push(`Condutax: '${activeLead.condutaxNumber || "Não informado"}' ➔ '${editCondutaxNumber || "Não informado"}'`)
      }
      if (editLicenseDetails !== (activeLead.licenseDetails || "")) {
        complianceLogs.push(`Alvará: '${activeLead.licenseDetails || "Não informado"}' ➔ '${editLicenseDetails || "Não informado"}'`)
      }
      if (editMessageName1 !== (activeLead.messageName1 || "")) {
        complianceLogs.push(`Ref 1 Nome: '${activeLead.messageName1 || "Não cadastrado"}' ➔ '${editMessageName1 || "Não cadastrado"}'`)
      }
      if (editMessagePhone1 !== (activeLead.messagePhone1 || "")) {
        complianceLogs.push(`Ref 1 Fone: '${activeLead.messagePhone1 || "Não cadastrado"}' ➔ '${editMessagePhone1 || "Não cadastrado"}'`)
      }
      if (editMessageName2 !== (activeLead.messageName2 || "")) {
        complianceLogs.push(`Ref 2 Nome: '${activeLead.messageName2 || "Não cadastrado"}' ➔ '${editMessageName2 || "Não cadastrado"}'`)
      }
      if (editMessagePhone2 !== (activeLead.messagePhone2 || "")) {
        complianceLogs.push(`Ref 2 Fone: '${activeLead.messagePhone2 || "Não cadastrado"}' ➔ '${editMessagePhone2 || "Não cadastrado"}'`)
      }
      if (editVehicleInterest !== (activeLead.vehicleInterest || "")) {
        complianceLogs.push(`Interesse: '${activeLead.vehicleInterest || "Não especificado"}' ➔ '${editVehicleInterest || "Não especificado"}'`)
      }

      if (complianceLogs.length > 0) {
        newInteractions.push({
          id: Math.random().toString(36).substring(2, 9),
          type: "status_change",
          agentName: loggedInUser,
          content: `🛡️ [Compliance Audit] Alterou dados da ficha: ${complianceLogs.join(" | ")}`,
          createdAt: new Date().toISOString()
        })
      }

      const constructedAddress = [
        editAddressStreet && editAddressStreet.trim(),
        editAddressNumber && `nº ${editAddressNumber.trim()}`,
        editAddressComplement && `(${editAddressComplement.trim()})`,
        editAddressNeighborhood && `Bairro: ${editAddressNeighborhood.trim()}`,
        editAddressCity && editAddressCity.trim(),
        editAddressState && editAddressState.trim()
      ].filter(Boolean).join(", ")

      const payload = {
        notes,
        status,
        contacted,
        whatsappSent,
        approvalStatus,
        registrationStatus,
        needsMoreData,
        contactedForData,
        creditAnalysisStatus,
        authorizedBy,
        ...(authorizedBy && {
          authorizationRecordedBy: activeLead.authorizationRecordedBy || loggedInUser,
          authorizationDate: activeLead.authorizationDate || new Date().toISOString()
        }),
        fullName: editFullName,
        phone: editPhone,
        email: editEmail,
        whatsapp: editWhatsapp,
        cpf: editCpf,
        rg: editRg,
        address: constructedAddress || editAddress,
        addressStreet: editAddressStreet,
        addressNumber: editAddressNumber,
        addressComplement: editAddressComplement,
        addressNeighborhood: editAddressNeighborhood,
        addressCity: editAddressCity,
        addressState: editAddressState,
        addressNotes: editAddressNotes,
        cep: editCep,
        cnhNumber: editCnhNumber,
        cnhCategory: editCnhCategory,
        condutaxNumber: editCondutaxNumber,
        licenseDetails: editLicenseDetails,
        messageName1: editMessageName1,
        messagePhone1: editMessagePhone1,
        messageName2: editMessageName2,
        messagePhone2: editMessagePhone2,
        vehicleInterest: editVehicleInterest,
        interactions: newInteractions,
        updatedAt: new Date().toISOString()
      }

      await updateDoc(leadRef, payload)

      onLeadUpdated({
        ...activeLead,
        ...payload
      })

      success("Ficha atualizada!", `Cadastro de ${editFullName} foi atualizado com sucesso.`)
      onClose()
    } catch (e: any) {
      console.error("Erro ao atualizar lead:", e)
      showError("Erro ao salvar lead", e?.message || "Verifique sua conexão e tente novamente.")
    } finally {
      setSaving(false)
    }
  }

  const handleApprove = async () => {
    const activeLead = lead
    if (!activeLead) return
    try {
      setSaving(true)
      const leadRef = doc(db, "leads", activeLead.id)

      const newInteractions = [...(activeLead.interactions || [])]
      newInteractions.push({
        id: Math.random().toString(36).substring(2, 9),
        type: "status_change",
        agentName: loggedInUser,
        content: "Aprovou a ficha comercial do motorista (Cadastro Aprovado).",
        createdAt: new Date().toISOString()
      })

      const payload = {
        notes,
        status: "converted" as const,
        contacted: true,
        approvalStatus: "approved" as const,
        approvedBy: loggedInUser,
        approvalDate: new Date().toISOString(),
        interactions: newInteractions,
        updatedAt: new Date().toISOString()
      }

      await updateDoc(leadRef, payload)

      onLeadUpdated({
        ...activeLead,
        ...payload
      })

      success("Cadastro Aprovado! 🏆", `O cadastro de ${activeLead.fullName} foi aprovado com sucesso.`)
      onClose()
    } catch (e: any) {
      console.error("Erro ao aprovar cadastro:", e)
      showError("Erro ao aprovar cadastro", e?.message || "Erro desconhecido.")
    } finally {
      setSaving(false)
    }
  }

  const handleReject = async () => {
    const activeLead = lead
    if (!activeLead) return
    try {
      setSaving(true)
      const leadRef = doc(db, "leads", activeLead.id)

      const newInteractions = [...(activeLead.interactions || [])]
      newInteractions.push({
        id: Math.random().toString(36).substring(2, 9),
        type: "status_change",
        agentName: loggedInUser,
        content: "Rejeitou a ficha comercial do motorista (Cadastro Rejeitado).",
        createdAt: new Date().toISOString()
      })

      const payload = {
        notes,
        status: "lost" as const,
        approvalStatus: "rejected" as const,
        interactions: newInteractions,
        updatedAt: new Date().toISOString()
      }

      await updateDoc(leadRef, payload)

      onLeadUpdated({
        ...activeLead,
        ...payload
      })

      success("Cadastro Rejeitado ❌", `O cadastro de ${activeLead.fullName} foi rejeitado.`)
      onClose()
    } catch (e: any) {
      console.error("Erro ao rejeitar cadastro:", e)
      showError("Erro ao rejeitar cadastro", e?.message || "Erro desconhecido.")
    } finally {
      setSaving(false)
    }
  }

  const handleToggleArchive = async () => {
    const activeLead = lead
    if (!activeLead) return
    try {
      setSaving(true)
      const leadRef = doc(db, "leads", activeLead.id)
      const newArchived = !archived
      
      const newInteractions = [...(activeLead.interactions || [])]
      newInteractions.push({
        id: Math.random().toString(36).substring(2, 9),
        type: "status_change",
        agentName: loggedInUser,
        content: newArchived 
          ? "Arquivou a ficha comercial do motorista."
          : "Reativou a ficha comercial do motorista.",
        createdAt: new Date().toISOString()
      })

      const payload = {
        archived: newArchived,
        interactions: newInteractions,
        updatedAt: new Date().toISOString()
      }

      await updateDoc(leadRef, payload)
      setArchived(newArchived)

      onLeadUpdated({
        ...activeLead,
        ...payload
      })

      success(
        newArchived ? "Ficha Arquivada! 🗄️" : "Ficha Reativada! ⚡",
        `O cadastro de ${activeLead.fullName} foi ${newArchived ? "arquivado" : "reativado"} com sucesso.`
      )
    } catch (e: any) {
      console.error("Erro ao arquivar/reativar lead:", e)
      showError("Erro ao alterar arquivo", e?.message || "Tente novamente.")
    } finally {
      setSaving(false)
    }
  }

  const handleExportSheet = () => {
    const activeLead = lead
    if (!activeLead) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      showError("Bloqueador de Pop-ups ativo", "Por favor, permita pop-ups para exportar a ficha.")
      return
    }

    const timelineItems = (activeLead.interactions || []).map((it) => {
      const typeLabel = 
        it.type === "whatsapp" ? "📱 WhatsApp" :
        it.type === "note" ? "📝 Anotação" :
        it.type === "status_change" ? "🔄 Funil" :
        it.type === "credit_check" ? "💳 Crédito" : "🔧 Ação"

      return `
        <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px dashed #e2e8f0;">
          <div style="font-weight: bold; color: #1e293b; font-size: 13px;">${typeLabel}: ${it.content}</div>
          <div style="color: #64748b; font-size: 11px; margin-top: 4px;">
            Operador: <strong>${it.agentName}</strong> • ${new Date(it.createdAt).toLocaleString("pt-BR")}
          </div>
        </div>
      `
    }).join("")

    const mainTimeline = `
      <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px dashed #e2e8f0;">
        <div style="font-weight: bold; color: #1e293b; font-size: 13px;">📥 Capturado no sistema</div>
        <div style="color: #64748b; font-size: 11px; margin-top: 4px;">
          Origem: <strong>${activeLead.source}</strong> • ${dateString}
        </div>
      </div>
      ${timelineItems}
    `

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Ficha Comercial - ${activeLead.fullName}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 40px;
            color: #1e293b;
            background: #ffffff;
            font-size: 14px;
            line-height: 1.5;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #0284c7;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            color: #0f172a;
            font-weight: 850;
          }
          .header .brand {
            font-size: 15px;
            font-weight: 800;
            color: #0284c7;
            letter-spacing: 0.05em;
          }
          .score-badge {
            background: #f0f9ff;
            color: #0369a1;
            border: 1px solid #bae6fd;
            padding: 6px 12px;
            font-weight: bold;
            border-radius: 8px;
            font-size: 12px;
          }
          .section {
            margin-bottom: 30px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
          }
          .section-title {
            font-size: 13px;
            font-weight: 900;
            color: #0f172a;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-top: 0;
            margin-bottom: 15px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 8px;
          }
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px 30px;
          }
          .field {
            margin-bottom: 10px;
          }
          .label {
            font-size: 11px;
            text-transform: uppercase;
            font-weight: bold;
            color: #64748b;
            margin-bottom: 4px;
            letter-spacing: 0.02em;
          }
          .value {
            font-size: 13px;
            font-weight: 600;
            color: #334155;
          }
          .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: bold;
            border: 1px solid;
          }
          .badge-blue { background: #f0f9ff; color: #0369a1; border-color: #bae6fd; }
          .badge-green { background: #ecfdf5; color: #047857; border-color: #a7f3d0; }
          .badge-red { background: #fef2f2; color: #b91c1c; border-color: #fecaca; }
          .badge-amber { background: #fffbeb; color: #b45309; border-color: #fde68a; }
          .timeline { margin-top: 15px; }
          .notes {
            background: #fff;
            border: 1px solid #e2e8f0;
            padding: 12px;
            border-radius: 8px;
            font-size: 13px;
            color: #334155;
            white-space: pre-wrap;
          }
          @media print {
            body { padding: 20px; }
            button { display: none !important; }
            .no-print { display: none !important; }
            .section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">🚖 GRUPO MICHELINE'S TÁXI</div>
            <h1>Ficha Cadastral do Lead</h1>
            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
              Exportado em: ${new Date().toLocaleString("pt-BR")} por ${loggedInUser}
            </div>
          </div>
          <div style="display: flex; gap: 10px; align-items: center;">
            <span class="score-badge">Score do Lead: ${scoreInfo.score} pts (${scoreInfo.level})</span>
            <button onclick="window.print()" style="background: #0284c7; color: white; border: none; padding: 8px 16px; font-weight: bold; border-radius: 8px; cursor: pointer; font-size: 13px;">Imprimir Ficha (PDF)</button>
          </div>
        </div>

        <div class="section">
          <div class="section-title">👤 Informações Gerais</div>
          <div class="grid">
            <div class="field">
              <div class="label">Nome Completo</div>
              <div class="value" style="font-size: 15px; font-weight: 800; color: #0f172a;">${activeLead.fullName}</div>
            </div>
            <div class="field">
              <div class="label">Veículo de Interesse</div>
              <div class="value">
                <span class="badge badge-blue">${activeLead.vehicleInterest}</span>
              </div>
            </div>
            <div class="field">
              <div class="label">Celular</div>
              <div class="value">${activeLead.phone}</div>
            </div>
            <div class="field">
              <div class="label">WhatsApp</div>
              <div class="value">${activeLead.whatsapp || activeLead.phone}</div>
            </div>
            <div class="field">
              <div class="label">CPF</div>
              <div class="value">${activeLead.cpf || "Não informado"}</div>
            </div>
            <div class="field">
              <div class="label">RG</div>
              <div class="value">${activeLead.rg || "Não informado"}</div>
            </div>
            <div class="field">
              <div class="label">E-mail</div>
              <div class="value">${activeLead.email || "Não informado"}</div>
            </div>
            <div class="field" style="grid-column: span 2;">
              <div class="label">Endereço Completo</div>
              <div class="value">
                ${activeLead.addressStreet ? `
                  <strong>Logradouro:</strong> ${activeLead.addressStreet}
                  ${activeLead.addressNumber ? `, nº ${activeLead.addressNumber}` : ""}
                  ${activeLead.addressComplement ? ` (${activeLead.addressComplement})` : ""}<br>
                  ${[
                    activeLead.addressNeighborhood && `<strong>Bairro:</strong> ${activeLead.addressNeighborhood}`,
                    activeLead.addressCity && `<strong>Cidade:</strong> ${activeLead.addressCity}`,
                    activeLead.addressState && `<strong>UF:</strong> ${activeLead.addressState}`,
                    activeLead.cep && `<strong>CEP:</strong> ${activeLead.cep}`
                  ].filter(Boolean).join(" | ")}
                ` : `${activeLead.address || "Não informado"} ${activeLead.cep ? `- CEP: ${activeLead.cep}` : ""}`}

                ${activeLead.addressNotes ? `
                  <div style="margin-top: 8px; padding: 8px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; font-size: 11px; color: #0369a1; line-height: 1.4;">
                    <strong>Observações do Candidato:</strong> ${activeLead.addressNotes}
                  </div>
                ` : ""}
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">🚖 Perfil de Motorista & Habilitação</div>
          <div class="grid">
            <div class="field">
              <div class="label">CNH</div>
              <div class="value">${activeLead.cnhNumber || "Não informado"} ${activeLead.cnhCategory ? `(Categoria ${activeLead.cnhCategory})` : ""}</div>
            </div>
            <div class="field">
              <div class="label">Já trabalhou como taxista?</div>
              <div class="value">${activeLead.isTaxiDriver ? "Sim" : "Não"}</div>
            </div>
            <div class="field">
              <div class="label">Número Condutax</div>
              <div class="value">${activeLead.condutaxNumber || "Não informado"}</div>
            </div>
            <div class="field">
              <div class="label">Possui Licença/Alvará Próprio?</div>
              <div class="value">${activeLead.hasLicense ? "Sim" : "Não"} ${activeLead.licenseDetails ? `(${activeLead.licenseDetails})` : ""}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">📞 Referências de Recado</div>
          <div class="grid">
            <div class="field">
              <div class="label">Contato 1 (Nome)</div>
              <div class="value">${activeLead.messageName1 || "Não cadastrado"}</div>
            </div>
            <div class="field">
              <div class="label">Contato 1 (Telefone)</div>
              <div class="value">${activeLead.messagePhone1 || "Não cadastrado"}</div>
            </div>
            <div class="field">
              <div class="label">Contato 2 (Nome)</div>
              <div class="value">${activeLead.messageName2 || "Não cadastrado"}</div>
            </div>
            <div class="field">
              <div class="label">Contato 2 (Telefone)</div>
              <div class="value">${activeLead.messagePhone2 || "Não cadastrado"}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">📊 Auditoria & Avaliação da Ficha</div>
          <div class="grid">
            <div class="field">
              <div class="label">1. Cadastro & Documentos</div>
              <div class="value">
                <span class="badge ${activeLead.registrationStatus === 'complete' ? 'badge-green' : 'badge-amber'}">
                  ${activeLead.registrationStatus === 'complete' ? 'Completo' : activeLead.registrationStatus === 'incomplete' ? 'Pendente Dados' : 'Pendente Contato'}
                </span>
              </div>
            </div>
            <div class="field">
              <div class="label">2. Análise de Crédito Externa</div>
              <div class="value">
                <span class="badge ${activeLead.creditAnalysisStatus === 'approved' ? 'badge-green' : activeLead.creditAnalysisStatus === 'rejected' ? 'badge-red' : activeLead.creditAnalysisStatus === 'needs_authorization' ? 'badge-amber' : 'badge-blue'}">
                  ${activeLead.creditAnalysisStatus === 'approved' ? 'Aprovada' : activeLead.creditAnalysisStatus === 'rejected' ? 'Reprovada' : activeLead.creditAnalysisStatus === 'needs_authorization' ? 'Score Baixo (Autorização Requerida)' : 'Aguardando'}
                </span>
              </div>
            </div>
            <div class="field">
              <div class="label">3. Autorizador Interno da Exceção</div>
              <div class="value">${activeLead.authorizedBy || "Nenhuma exceção registrada"}</div>
            </div>
            <div class="field">
              <div class="label">4. Decisão Comercial Final</div>
              <div class="value">
                <span class="badge ${activeLead.approvalStatus === 'approved' ? 'badge-green' : activeLead.approvalStatus === 'rejected' ? 'badge-red' : 'badge-amber'}">
                  ${activeLead.approvalStatus === 'approved' ? 'Ficha Aprovada' : activeLead.approvalStatus === 'rejected' ? 'Ficha Rejeitada' : 'Em Avaliação'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">📝 Observações e Anotações Internas</div>
          <div class="notes">${activeLead.notes || "Nenhuma anotação registrada."}</div>
        </div>

        <div class="section">
          <div class="section-title">⏱️ Linha do Tempo e Histórico do Atendimento</div>
          <div class="timeline">
            ${mainTimeline}
          </div>
        </div>
      </body>
      </html>
    `
    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }

  // Handle template selection change
  const handleTemplateChange = (val: string) => {
    setSelectedTemplateId(val)
    const tpl = WHATSAPP_TEMPLATES.find(t => t.id === val)
    const agentFirstName = adminUser?.displayName ? adminUser.displayName.split(" ")[0] : "pessoal"
    if (tpl) {
      setCustomMessage(
        tpl.text
          .replace("{name}", lead.fullName.split(" ")[0])
          .replace("{agent}", agentFirstName)
          .replace("{vehicle}", lead.vehicleInterest)
          .replace("{dailyRate}", getDailyRateForVehicle(lead.vehicleInterest))
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-[92vw] h-[90vh] md:h-[85vh] flex flex-col p-0 overflow-hidden bg-white border border-slate-200 rounded-3xl shadow-2xl text-slate-800 focus:outline-none">
        
        {/* Persistent Dialog Header */}
        <DialogHeader className="border-b border-slate-100 p-6 flex flex-row items-center justify-between shrink-0">
          <div className="space-y-1 text-left">
            <DialogTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
              <User className="h-5 w-5 text-sky-600 shrink-0" />
              <span className="truncate max-w-[300px] sm:max-w-[450px]">{lead.fullName}</span>
              <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 text-[10px] font-bold uppercase tracking-wider ml-1">
                {lead.source}
              </Badge>
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-xs flex flex-wrap items-center gap-1.5 font-semibold">
              <span>Registrado em {dateString}</span>
              {getElapsedTime(lead.createdAt) && (
                <span className="text-sky-600 font-extrabold">{getElapsedTime(lead.createdAt)}</span>
              )}
              <span className="text-slate-300">•</span>
              <span>Interesse: <strong>{lead.vehicleInterest}</strong></span>
            </DialogDescription>
          </div>
          
          <div className="flex items-center gap-3 pr-8 shrink-0">
            <Button
              onClick={handleExportSheet}
              variant="outline"
              size="sm"
              className="h-8 border-sky-200 hover:border-sky-300 hover:bg-sky-50/50 text-sky-700 text-[10px] font-extrabold flex items-center gap-1.5 rounded-lg shadow-sm"
            >
              📥 Exportar
            </Button>
            <span className={`text-[10px] font-bold px-2 py-1 rounded border flex items-center gap-1 shrink-0 ${scoreInfo.color}`}>
              Score: {scoreInfo.score} pts
            </span>
          </div>
        </DialogHeader>

        {/* Tab-driven layout with sidebar styling */}
        <Tabs defaultValue="perfil" className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          
          {/* Stacked Tabs list */}
          <TabsList className="w-full md:w-1/4 h-auto md:h-full bg-slate-50/40 border-b md:border-b-0 md:border-r border-slate-100 p-4 flex flex-row md:flex-col justify-start items-stretch gap-1 rounded-none select-none overflow-x-auto md:overflow-x-visible md:overflow-y-auto">
            <TabsTrigger 
              value="perfil" 
              className="justify-start gap-2 px-3 py-2.5 text-xs font-extrabold rounded-xl transition-all data-[state=active]:bg-sky-50 data-[state=active]:text-sky-750 data-[state=active]:border data-[state=active]:border-sky-100 text-slate-550 hover:bg-slate-100 hover:text-slate-700 data-[state=active]:shadow-none shrink-0"
            >
              <User className="h-4 w-4 shrink-0" />
              <span>Dados Cadastrais</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="funil" 
              className="justify-start gap-2 px-3 py-2.5 text-xs font-extrabold rounded-xl transition-all data-[state=active]:bg-sky-50 data-[state=active]:text-sky-750 data-[state=active]:border data-[state=active]:border-sky-100 text-slate-550 hover:bg-slate-100 hover:text-slate-700 data-[state=active]:shadow-none shrink-0"
            >
              <FileText className="h-4 w-4 shrink-0" />
              <span>Diagnóstico Funil</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="compliance" 
              className="justify-start gap-2 px-3 py-2.5 text-xs font-extrabold rounded-xl transition-all data-[state=active]:bg-sky-50 data-[state=active]:text-sky-750 data-[state=active]:border data-[state=active]:border-sky-100 text-slate-550 hover:bg-slate-100 hover:text-slate-700 data-[state=active]:shadow-none shrink-0"
            >
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>Fases & Decisão</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="documentos" 
              className="justify-start gap-2 px-3 py-2.5 text-xs font-extrabold rounded-xl transition-all data-[state=active]:bg-sky-50 data-[state=active]:text-sky-750 data-[state=active]:border data-[state=active]:border-sky-100 text-slate-550 hover:bg-slate-100 hover:text-slate-700 data-[state=active]:shadow-none shrink-0"
            >
              <FileText className="h-4 w-4 shrink-0" />
              <span>Anexos & PDFs</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="historico" 
              className="justify-start gap-2 px-3 py-2.5 text-xs font-extrabold rounded-xl transition-all data-[state=active]:bg-sky-50 data-[state=active]:text-sky-750 data-[state=active]:border data-[state=active]:border-sky-100 text-slate-550 hover:bg-slate-100 hover:text-slate-700 data-[state=active]:shadow-none shrink-0"
            >
              <Clock className="h-4 w-4 shrink-0" />
              <span>Notas & Timeline</span>
            </TabsTrigger>
          </TabsList>

          {/* Right panel Content area */}
          <div className="w-full md:w-3/4 h-full flex flex-col min-h-0 overflow-y-auto">
            
            {/* Tab 1: Dados Cadastrais */}
            <TabsContent value="perfil" className="m-0 p-6 flex-1 focus-visible:ring-0 focus-visible:ring-offset-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="h-4 w-4 text-sky-600" />
                    Dados Cadastrais & Ficha do Motorista
                  </h3>
                  <Button
                    type="button"
                    onClick={() => setIsEditing(!isEditing)}
                    variant="outline"
                    size="sm"
                    className="h-7 text-[10px] font-extrabold border-slate-200 text-slate-650 hover:bg-slate-50 flex items-center gap-1 rounded-lg"
                  >
                    <span>{isEditing ? "Cancelar Edição ❌" : "Editar Ficha ✏️"}</span>
                  </Button>
                </div>

                {isEditing ? (
                  /* CRUD Form */
                  <div className="space-y-4 p-4 bg-slate-50/50 border border-slate-200 rounded-2xl animate-fadeIn text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Nome Completo</label>
                        <Input
                          value={editFullName}
                          onChange={(e) => setEditFullName(e.target.value)}
                          placeholder="Digite o nome..."
                          className="bg-white text-xs h-9 rounded-lg border-slate-200 text-slate-800 focus-visible:ring-sky-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Celular de Contato</label>
                        <Input
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          placeholder="Digite o telefone..."
                          className="bg-white text-xs h-9 rounded-lg border-slate-200 text-slate-800 focus-visible:ring-sky-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">E-mail</label>
                        <Input
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          placeholder="Digite o e-mail..."
                          className="bg-white text-xs h-9 rounded-lg border-slate-200 text-slate-800 focus-visible:ring-sky-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">WhatsApp</label>
                        <Input
                          value={editWhatsapp}
                          onChange={(e) => setEditWhatsapp(e.target.value)}
                          placeholder="Digite o whatsapp..."
                          className="bg-white text-xs h-9 rounded-lg border-slate-200 text-slate-800 focus-visible:ring-sky-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">CPF</label>
                        <Input
                          value={editCpf}
                          onChange={(e) => setEditCpf(e.target.value)}
                          placeholder="Digite o CPF..."
                          className="bg-white text-xs h-9 rounded-lg border-slate-200 text-slate-800 focus-visible:ring-sky-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">RG</label>
                        <Input
                          value={editRg}
                          onChange={(e) => setEditRg(e.target.value)}
                          placeholder="Digite o RG..."
                          className="bg-white text-xs h-9 rounded-lg border-slate-200 text-slate-800 focus-visible:ring-sky-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">CEP</label>
                        <Input
                          value={editCep}
                          onChange={(e) => setEditCep(e.target.value)}
                          placeholder="Digite o CEP..."
                          className="bg-white text-xs h-9 rounded-lg border-slate-200 text-slate-800 focus-visible:ring-sky-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Veículo de Interesse</label>
                        <Select value={editVehicleInterest} onValueChange={setEditVehicleInterest}>
                          <SelectTrigger className="bg-white text-slate-850 text-xs h-9 rounded-lg border-slate-200">
                            <SelectValue placeholder="Selecione o veículo" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border border-slate-200 text-slate-700">
                            <SelectItem value="Corolla Cross">Corolla Cross</SelectItem>
                            <SelectItem value="Corolla Sedan">Corolla Sedan</SelectItem>
                            <SelectItem value="Spin">Chevrolet Spin</SelectItem>
                            <SelectItem value="Virtus">VW Virtus</SelectItem>
                            <SelectItem value="Onix">Chevrolet Onix</SelectItem>
                            <SelectItem value="Versa">Nissan Versa</SelectItem>
                            <SelectItem value="Prius">Toyota Prius</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Endereço - Rua / Avenida / Logradouro</label>
                        <Input
                          value={editAddressStreet}
                          onChange={(e) => setEditAddressStreet(e.target.value)}
                          placeholder="Ex: Avenida Nelson Mandela..."
                          className="bg-white text-xs h-9 rounded-lg border-slate-200 text-slate-800 focus-visible:ring-sky-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Número</label>
                        <Input
                          value={editAddressNumber}
                          onChange={(e) => setEditAddressNumber(e.target.value)}
                          placeholder="Ex: 123..."
                          className="bg-white text-xs h-9 rounded-lg border-slate-200 text-slate-800 focus-visible:ring-sky-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Complemento</label>
                        <Input
                          value={editAddressComplement}
                          onChange={(e) => setEditAddressComplement(e.target.value)}
                          placeholder="Ex: Apto 45, Bloco B..."
                          className="bg-white text-xs h-9 rounded-lg border-slate-200 text-slate-800 focus-visible:ring-sky-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Bairro</label>
                        <Input
                          value={editAddressNeighborhood}
                          onChange={(e) => setEditAddressNeighborhood(e.target.value)}
                          placeholder="Ex: Montanhão..."
                          className="bg-white text-xs h-9 rounded-lg border-slate-200 text-slate-800 focus-visible:ring-sky-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Cidade</label>
                        <Input
                          value={editAddressCity}
                          onChange={(e) => setEditAddressCity(e.target.value)}
                          placeholder="Ex: São Bernardo do Campo..."
                          className="bg-white text-xs h-9 rounded-lg border-slate-200 text-slate-800 focus-visible:ring-sky-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Estado (UF)</label>
                        <Input
                          value={editAddressState}
                          onChange={(e) => setEditAddressState(e.target.value)}
                          placeholder="Ex: UF..."
                          className="bg-white text-xs h-9 rounded-lg border-slate-200 text-slate-800 focus-visible:ring-sky-500"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Observações Cadastrais (Candidato)</label>
                        <Input
                          value={editAddressNotes}
                          onChange={(e) => setEditAddressNotes(e.target.value)}
                          placeholder="Ex: Referências, horários para contato, pontos de referência..."
                          className="bg-white text-xs h-9 rounded-lg border-slate-200 text-slate-800 focus-visible:ring-sky-500"
                        />
                      </div>
                    </div>

                    <div className="h-px bg-slate-200 my-2" />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Habilitação & Profissional</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Número da CNH</label>
                        <Input
                          value={editCnhNumber}
                          onChange={(e) => setEditCnhNumber(e.target.value)}
                          placeholder="Digite o número da CNH..."
                          className="bg-white text-xs h-9 rounded-lg border-slate-200 text-slate-800 focus-visible:ring-sky-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Categoria da CNH</label>
                        <Input
                          value={editCnhCategory}
                          onChange={(e) => setEditCnhCategory(e.target.value)}
                          placeholder="Ex: AB, B, D..."
                          className="bg-white text-xs h-9 rounded-lg border-slate-200 text-slate-800 focus-visible:ring-sky-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Número Condutax</label>
                        <Input
                          value={editCondutaxNumber}
                          onChange={(e) => setEditCondutaxNumber(e.target.value)}
                          placeholder="Digite o Condutax..."
                          className="bg-white text-xs h-9 rounded-lg border-slate-200 text-slate-800 focus-visible:ring-sky-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Detalhes da Licença / Alvará</label>
                        <Input
                          value={editLicenseDetails}
                          onChange={(e) => setEditLicenseDetails(e.target.value)}
                          placeholder="Ex: Alvará próprio..."
                          className="bg-white text-xs h-9 rounded-lg border-slate-200 text-slate-800 focus-visible:ring-sky-500"
                        />
                      </div>
                    </div>

                    <div className="h-px bg-slate-200 my-2" />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Referências de Recado</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Referência 1 (Nome)</label>
                        <Input
                          value={editMessageName1}
                          onChange={(e) => setEditMessageName1(e.target.value)}
                          placeholder="Nome do contato 1..."
                          className="bg-white text-xs h-9 rounded-lg border-slate-200 text-slate-800 focus-visible:ring-sky-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Referência 1 (Celular)</label>
                        <Input
                          value={editMessagePhone1}
                          onChange={(e) => setEditMessagePhone1(e.target.value)}
                          placeholder="Celular do contato 1..."
                          className="bg-white text-xs h-9 rounded-lg border-slate-200 text-slate-800 focus-visible:ring-sky-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Referência 2 (Nome)</label>
                        <Input
                          value={editMessageName2}
                          onChange={(e) => setEditMessageName2(e.target.value)}
                          placeholder="Nome do contato 2..."
                          className="bg-white text-xs h-9 rounded-lg border-slate-200 text-slate-800 focus-visible:ring-sky-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Referência 2 (Celular)</label>
                        <Input
                          value={editMessagePhone2}
                          onChange={(e) => setEditMessagePhone2(e.target.value)}
                          placeholder="Celular do contato 2..."
                          className="bg-white text-xs h-9 rounded-lg border-slate-200 text-slate-800 focus-visible:ring-sky-500"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button
                        type="button"
                        onClick={() => {
                          setIsEditing(false)
                          success("Alterações confirmadas!", "Lembre-se de salvar permanentemente clicando em 'Salvar Alterações' no rodapé.")
                        }}
                        className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs h-9 rounded-xl flex items-center gap-1.5 px-4 shadow-sm"
                      >
                        <span>✓</span> Confirmar & Fechar Edição
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Preview layout */
                  <div className="space-y-5 text-left text-xs">
                    <div>
                      <label className="text-[9px] uppercase font-black tracking-widest text-slate-450">Nome do Lead</label>
                      <p className="text-base font-extrabold text-slate-900">{lead.fullName}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] uppercase font-black tracking-widest text-slate-450">Celular de Contato</label>
                        <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mt-0.5">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          {lead.phone}
                        </p>
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-black tracking-widest text-slate-450">Interesse</label>
                        <div>
                          <Badge variant="outline" className="bg-sky-50 border-sky-200 text-sky-750 text-[10px] font-bold mt-1">
                            {lead.vehicleInterest}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {(lead.cpf || lead.rg) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-slate-50">
                        {lead.cpf && (
                          <div>
                            <label className="text-[9px] uppercase font-black tracking-widest text-slate-450">CPF</label>
                            <p className="text-xs font-bold text-slate-700 mt-0.5">{lead.cpf}</p>
                          </div>
                        )}
                        {lead.rg && (
                          <div>
                            <label className="text-[9px] uppercase font-black tracking-widest text-slate-450">RG</label>
                            <p className="text-xs font-bold text-slate-700 mt-0.5">{lead.rg}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {(lead.whatsapp || lead.email) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-slate-50">
                        {lead.whatsapp && (
                          <div>
                            <label className="text-[9px] uppercase font-black tracking-widest text-slate-450">WhatsApp</label>
                            <p className="text-xs font-bold text-slate-755 flex items-center gap-1 mt-0.5">
                              <MessageSquare className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                              {lead.whatsapp}
                            </p>
                          </div>
                        )}
                        {lead.email && (
                          <div>
                            <label className="text-[9px] uppercase font-black tracking-widest text-slate-450">E-mail</label>
                            <p className="text-xs font-bold text-slate-700 truncate mt-0.5" title={lead.email}>{lead.email}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {(lead.addressStreet || lead.address) && (
                      <div className="pt-2 border-t border-slate-50 space-y-2">
                        <label className="text-[9px] uppercase font-black tracking-widest text-slate-450 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-sky-500" /> Dados de Endereço
                        </label>
                        <div className="text-xs text-slate-700 space-y-1">
                          {lead.addressStreet ? (
                            <>
                              <p className="font-bold">
                                {lead.addressStreet}
                                {lead.addressNumber && `, nº ${lead.addressNumber}`}
                                {lead.addressComplement && ` (${lead.addressComplement})`}
                              </p>
                              {(lead.addressNeighborhood || lead.addressCity || lead.addressState || lead.cep) && (
                                <p className="text-slate-500 text-[11px] font-semibold">
                                  {[
                                    lead.addressNeighborhood && `Bairro: ${lead.addressNeighborhood}`,
                                    lead.addressCity && `${lead.addressCity}`,
                                    lead.addressState && `${lead.addressState}`,
                                    lead.cep && `CEP: ${lead.cep}`
                                  ].filter(Boolean).join(" | ")}
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="font-bold leading-relaxed">
                              {lead.address} {lead.cep && `- CEP: ${lead.cep}`}
                            </p>
                          )}

                          {lead.addressNotes && (
                            <div className="mt-2 p-2.5 bg-sky-50/50 border border-sky-100 rounded-xl space-y-1">
                              <p className="text-[9px] font-black text-sky-700 uppercase tracking-wide flex items-center gap-1">
                                <span>📝</span> Observações do Candidato
                              </p>
                              <p className="text-[11px] text-sky-900 font-semibold whitespace-pre-wrap leading-normal">
                                {lead.addressNotes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {(lead.messagePhone1 || lead.messagePhone2) && (
                      <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-2.5">
                        <p className="text-[9px] uppercase font-black text-slate-550 flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5 text-amber-500" /> Referências de Recado
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          {lead.messagePhone1 && (
                            <div>
                              <p className="text-[10px] text-slate-400 font-bold">Contato 1</p>
                              <p className="font-bold text-slate-700 mt-0.5">{lead.messageName1}</p>
                              <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{lead.messagePhone1}</p>
                            </div>
                          )}
                          {lead.messagePhone2 && (
                            <div>
                              <p className="text-[10px] text-slate-400 font-bold">Contato 2</p>
                              <p className="font-bold text-slate-700 mt-0.5">{lead.messageName2}</p>
                              <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{lead.messagePhone2}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {lead.cnhNumber && (
                      <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-2.5">
                        <p className="text-[9px] uppercase font-black text-slate-550 flex items-center gap-1">
                          <ShieldCheck className="h-3.5 w-3.5 text-sky-600" /> Habilitação & Profissional
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold">Número da CNH</p>
                            <p className="font-bold text-slate-700 mt-0.5">{lead.cnhNumber}</p>
                            <p className="text-[10px] font-semibold text-sky-700 bg-sky-50 border border-sky-100 px-1.5 py-0.2 rounded mt-1 inline-block">
                              Cat. {lead.cnhCategory}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold">Já trabalhou de táxi?</p>
                            <p className="font-bold text-slate-700 mt-0.5">{lead.isTaxiDriver ? "Sim" : "Não"}</p>
                            {lead.isTaxiDriver && lead.condutaxNumber && (
                              <p className="text-[10px] text-slate-550 font-medium mt-0.5">Condutax: {lead.condutaxNumber}</p>
                            )}
                          </div>
                        </div>

                        {lead.isTaxiDriver && lead.hasLicense && (
                          <div className="pt-2 border-t border-slate-200/60 text-xs">
                            <p className="text-[10px] text-slate-400 font-bold">Vínculo com Licença / Alvará</p>
                            <p className="font-bold text-slate-700 mt-0.5">Sim</p>
                            {lead.licenseDetails && (
                              <p className="text-[10px] text-slate-550 font-medium mt-0.5">Detalhes: {lead.licenseDetails}</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}

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

                    {lead.utm && (lead.utm.source || lead.utm.campaign) && (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                        <p className="text-[9px] uppercase font-black text-slate-500 flex items-center gap-1">
                          <Globe className="h-3.5 w-3.5 text-sky-600 animate-pulse" /> Parâmetros de Origem (UTM)
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {lead.utm.source && (
                            <Badge variant="outline" className="bg-white border-slate-250 text-slate-600 text-[9px] font-bold shadow-sm">
                              Source: {lead.utm.source}
                            </Badge>
                          )}
                          {lead.utm.medium && (
                            <Badge variant="outline" className="bg-white border-slate-250 text-slate-600 text-[9px] font-bold shadow-sm">
                              Medium: {lead.utm.medium}
                            </Badge>
                          )}
                          {lead.utm.campaign && (
                            <Badge variant="outline" className="bg-white border-slate-250 text-slate-600 text-[9px] font-bold shadow-sm">
                              Campaign: {lead.utm.campaign}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Tab 2: Diagnóstico Funil */}
            <TabsContent value="funil" className="m-0 p-6 flex-1 focus-visible:ring-0 focus-visible:ring-offset-0">
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3 mb-2">
                  <FileText className="h-4 w-4 text-sky-600 shrink-0" />
                  Diagnóstico do Funil Inteligente
                </h3>
                
                {lead.protocol ? (
                  <div className="space-y-5 text-left text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Protocolo de Entrada</span>
                        <p className="font-extrabold text-slate-800 tracking-wider mt-0.5 uppercase">{lead.protocol}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Situação Cadastral</span>
                        <p className="font-bold text-slate-700 mt-0.5">
                          {lead.situation === "taxista" ? "Já é Taxista (Pronto para locação)" : "Quer se tornar Taxista (Orientação)"}
                        </p>
                      </div>
                    </div>

                    {lead.situation === "taxista" ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2.5 border-t border-slate-200/50">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Possui Condutax?</span>
                          <p className="font-bold text-slate-700 mt-0.5 capitalize">{lead.hasCondutax || "Não informado"}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Possui alvará próprio?</span>
                          <p className="font-bold text-slate-700 mt-0.5 capitalize">{lead.hasOwnAlvara || "Não informado"}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Já trabalhou em frota?</span>
                          <p className="font-bold text-slate-700 mt-0.5">
                            {lead.workedInFleet === "sim"
                              ? `Sim (Frota: ${lead.fleetName || "Não especificada"} / Tempo: ${lead.fleetDuration || "Não informado"})`
                              : "Não"}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Tempo de experiência</span>
                          <p className="font-bold text-slate-700 mt-0.5">
                            {lead.experienceYears === "menos_1" ? "Menos de 1 ano" :
                             lead.experienceYears === "1_3" ? "1 a 3 anos" :
                             lead.experienceYears === "3_5" ? "3 a 5 anos" :
                             lead.experienceYears === "mais_5" ? "Mais de 5 anos" : "Não informado"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2.5 border-t border-slate-200/50">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Possui CNH ativa?</span>
                          <p className="font-bold text-slate-700 mt-0.5">
                            {lead.hasCnh === "sim" ? `Sim (Categoria CNH: ${lead.cnhCategory || "Não especificada"})` : "Não"}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Possui EAR?</span>
                          <p className="font-bold text-slate-700 mt-0.5 capitalize">{lead.hasEar || "Não informado"}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Processo Condutax</span>
                          <p className="font-bold text-slate-700 mt-0.5">
                            {lead.condutaxProcess === "sim" ? "Já iniciou" :
                             lead.condutaxProcess === "nao" ? "Não iniciou" :
                             lead.condutaxProcess === "nao_sei" ? "Não sabe o que é" : "Não informado"}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Experiência anterior</span>
                          <p className="font-bold text-slate-700 mt-0.5">
                            {lead.passengerExperience === "app" ? "Motorista de aplicativo (Uber, etc.)" :
                             lead.passengerExperience === "particular" ? "Motorista particular" :
                             lead.passengerExperience === "entregas" ? "Entregas / Motoboy" :
                             lead.passengerExperience === "nenhuma" ? "Nenhuma experiência anterior" : "Não informado"}
                          </p>
                        </div>
                        {lead.needsHelpWith && lead.needsHelpWith.length > 0 && (
                          <div className="sm:col-span-2">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Solicitou ajuda com</span>
                            <div className="flex flex-wrap gap-1">
                              {lead.needsHelpWith.map((item: string, idx: number) => (
                                <span key={idx} className="bg-sky-50 text-sky-700 border border-sky-100 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Preferences */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2.5 border-t border-slate-200">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Forma de Pagamento</span>
                        <p className="font-bold text-slate-700 mt-0.5">{lead.paymentPreference || "Não especificado"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Contratação Desejada</span>
                        <p className="font-bold text-slate-700 mt-0.5">{lead.contractType || "Não especificado"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Melhor Horário para Contato</span>
                        <p className="font-bold text-slate-700 mt-0.5">{lead.preferredContactTime || "Não especificado"}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-40 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-xs text-slate-450 space-y-1.5 bg-slate-50/40">
                    <span>📝 Ficha de criação manual</span>
                    <span className="text-[10px] text-slate-400">Esta ficha não foi preenchida pelo funil automático do site.</span>
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Tab 3: Fases & Decisão */}
            <TabsContent value="compliance" className="m-0 p-6 flex-1 focus-visible:ring-0 focus-visible:ring-offset-0">
              <div className="space-y-5">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3 mb-2">
                  <ShieldCheck className="h-4 w-4 text-sky-600 shrink-0" />
                  Fases de Avaliação & Decisão Final
                </h3>

                {/* Funnel Stage Selector & Checkboxes */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Etapa do Funil Comercial</label>
                    <Select value={status} onValueChange={(val: Lead["status"]) => setStatus(val)}>
                      <SelectTrigger className="bg-white border-slate-200 text-slate-800">
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => setContacted(!contacted)}
                      className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 hover:border-slate-350 rounded-xl text-xs font-bold text-slate-700 transition-all select-none text-left"
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
                      className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 hover:border-slate-350 rounded-xl text-xs font-bold text-slate-700 transition-all select-none text-left"
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

                {/* Verification Checklists */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-4">
                  {/* FASE 1: CADASTRO */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[9px] text-slate-700 font-bold">1</span>
                        Cadastro & Documentação
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase ${registrationStatus === "complete" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                          registrationStatus === "incomplete" ? "bg-amber-50 text-amber-700 border-amber-100" :
                            "bg-blue-50 text-blue-700 border-blue-100"
                        }`}>
                        {registrationStatus === "complete" ? "Completo" :
                          registrationStatus === "incomplete" ? "Incompleto" : "Pendente Contato"}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() => setRegistrationStatus("complete")}
                        className={`text-[10px] font-bold p-1 rounded-lg border transition-all ${registrationStatus === "complete"
                            ? "bg-emerald-600 border-emerald-600 text-white shadow-sm font-extrabold"
                            : "bg-white border-slate-200 text-slate-650 hover:bg-slate-50"
                          }`}
                      >
                        Completo
                      </button>
                      <button
                        onClick={() => setRegistrationStatus("incomplete")}
                        className={`text-[10px] font-bold p-1 rounded-lg border transition-all ${registrationStatus === "incomplete"
                            ? "bg-amber-500 border-amber-500 text-white shadow-sm font-extrabold"
                            : "bg-white border-slate-200 text-slate-650 hover:bg-slate-50"
                          }`}
                      >
                        Incompleto
                      </button>
                      <button
                        onClick={() => setRegistrationStatus("pending_contact")}
                        className={`text-[10px] font-bold p-1 rounded-lg border transition-all ${registrationStatus === "pending_contact"
                            ? "bg-blue-600 border-blue-600 text-white shadow-sm font-extrabold"
                            : "bg-white border-slate-200 text-slate-650 hover:bg-slate-50"
                          }`}
                      >
                        Pendente
                      </button>
                    </div>

                    <div className="flex items-center gap-2 pt-1 select-none">
                      <input
                        type="checkbox"
                        id="needsMoreData"
                        checked={needsMoreData}
                        onChange={(e) => setNeedsMoreData(e.target.checked)}
                        className="rounded border-slate-300 accent-sky-600 cursor-pointer h-3.5 w-3.5 shrink-0"
                      />
                      <label htmlFor="needsMoreData" className="text-[10px] font-bold text-slate-500 cursor-pointer">
                        Ficha precisa de mais dados ou documentos (CNH/Perfil).
                      </label>
                    </div>

                    {needsMoreData && (
                      <div className="flex items-center gap-2 pt-0.5 select-none pl-5 animate-fadeIn">
                        <input
                          type="checkbox"
                          id="contactedForData"
                          checked={contactedForData}
                          onChange={(e) => setContactedForData(e.target.checked)}
                          className="rounded border-slate-300 accent-sky-600 cursor-pointer h-3.5 w-3.5 shrink-0"
                        />
                        <label htmlFor="contactedForData" className="text-[10px] font-bold text-slate-600 cursor-pointer">
                          Já contatado e solicitado dados adicionais.
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="h-px bg-slate-200" />

                  {/* FASE 2: ANÁLISE DE CRÉDITO EXTERNA */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[9px] text-slate-700 font-bold">2</span>
                        Análise de Crédito (Externa)
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase ${creditAnalysisStatus === "approved" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                          creditAnalysisStatus === "rejected" ? "bg-red-50 text-red-750 border-red-100" :
                            creditAnalysisStatus === "needs_authorization" ? "bg-amber-50 text-amber-700 border-amber-100" :
                              "bg-slate-100 text-slate-650 border-slate-200"
                        }`}>
                        {creditAnalysisStatus === "approved" ? "Aprovada" :
                          creditAnalysisStatus === "rejected" ? "Reprovada" :
                            creditAnalysisStatus === "needs_authorization" ? "Requer Aut." : "Aguardando"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => setCreditAnalysisStatus("approved")}
                        className={`text-[10px] font-bold p-1.5 rounded-lg border transition-all ${creditAnalysisStatus === "approved"
                            ? "bg-emerald-600 border-emerald-600 text-white shadow-sm font-extrabold"
                            : "bg-white border-slate-200 text-slate-650 hover:bg-slate-50"
                          }`}
                      >
                        ✓ Aprovada
                      </button>
                      <button
                        onClick={() => setCreditAnalysisStatus("rejected")}
                        className={`text-[10px] font-bold p-1.5 rounded-lg border transition-all ${creditAnalysisStatus === "rejected"
                            ? "bg-red-650 border-red-650 text-white shadow-sm font-extrabold"
                            : "bg-white border-slate-200 text-slate-650 hover:bg-slate-50"
                          }`}
                      >
                        ✗ Reprovada
                      </button>
                      <button
                        onClick={() => setCreditAnalysisStatus("needs_authorization")}
                        className={`text-[10px] font-bold p-1.5 rounded-lg border transition-all col-span-2 ${creditAnalysisStatus === "needs_authorization"
                            ? "bg-amber-500 border-amber-500 text-white shadow-sm font-extrabold"
                            : "bg-white border-slate-200 text-slate-650 hover:bg-slate-50"
                          }`}
                      >
                        ⚠ Score Baixo - Requer Autorização Especial
                      </button>
                    </div>
                  </div>

                  {/* FASE 3: EXCEÇÃO */}
                  {(creditAnalysisStatus === "needs_authorization" || authorizedBy) && (
                    <div className="space-y-2 p-3 bg-amber-50/40 border border-amber-250/50 rounded-xl animate-fadeIn">
                      <span className="text-[10px] font-black text-amber-700 uppercase tracking-wide flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-amber-200/60 flex items-center justify-center text-[9px] text-amber-800 font-bold">3</span>
                        Exceção & Autorização Interna
                      </span>

                      <div className="space-y-1.5 pt-1">
                        <label className="text-[9px] uppercase font-black text-slate-500 tracking-wider">Quem autorizou internamente? (Nome)</label>
                        <Input
                          value={authorizedBy}
                          onChange={(e) => setAuthorizedBy(e.target.value)}
                          placeholder="Digite o nome de quem autorizou..."
                          className="bg-white border-slate-200 text-slate-800 h-9 rounded-lg text-xs"
                        />
                      </div>

                      {lead.authorizationRecordedBy && (
                        <div className="text-[9px] text-slate-400 font-bold pt-1 leading-tight">
                          🔒 Registrado por: <span className="text-slate-650">{lead.authorizationRecordedBy}</span> em {lead.authorizationDate ? new Date(lead.authorizationDate).toLocaleDateString("pt-BR") : ""}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="h-px bg-slate-200" />

                  {/* FASE 4: DECISÃO FINAL */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[9px] text-slate-700 font-bold">4</span>
                        Decisão Final Comercial
                      </span>
                      <Badge
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${approvalStatus === "approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            approvalStatus === "rejected" ? "bg-red-50 text-red-750 border-red-200" :
                              "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                      >
                        {approvalStatus === "approved" ? "Aprovado" :
                          approvalStatus === "rejected" ? "Rejeitado" : "Pendente"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={handleApprove}
                        disabled={saving}
                        className="bg-emerald-650 hover:bg-emerald-600 hover:shadow text-white font-extrabold text-xs flex items-center justify-center gap-1.5 h-10 rounded-xl transition-all shadow-sm active:scale-[0.98]"
                      >
                        <CheckCircle className="h-4 w-4" /> Aprovar Ficha
                      </Button>
                      <Button
                        onClick={handleReject}
                        disabled={saving}
                        className="bg-red-650 hover:bg-red-600 hover:shadow text-white font-extrabold text-xs flex items-center justify-center gap-1.5 h-10 rounded-xl transition-all shadow-sm active:scale-[0.98]"
                      >
                        <XCircle className="h-4 w-4" /> Rejeitar Ficha
                      </Button>
                    </div>

                    {lead.approvedBy && (
                      <div className="text-[9px] text-slate-400 font-bold text-center leading-tight mt-1">
                        🏆 Ficha aprovada comercialmente por <span className="text-slate-550">{lead.approvedBy}</span> em {lead.approvalDate ? new Date(lead.approvalDate).toLocaleString("pt-BR") : ""}
                      </div>
                    )}

                    {(approvalStatus === "approved" || approvalStatus === "rejected") && (
                      <div className="pt-2.5 border-t border-slate-200/50 mt-2">
                        <Button
                          onClick={handleToggleArchive}
                          disabled={saving}
                          className={`w-full font-bold text-xs h-9 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                            archived
                              ? "bg-slate-650 hover:bg-slate-600 text-white"
                              : "bg-amber-600 hover:bg-amber-500 text-white animate-pulse"
                          }`}
                        >
                          <span>🗄️</span>
                          <span>{archived ? "Reativar Ficha Comercial" : "Arquivar Ficha Comercial"}</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Tab 4: Anexos & PDFs */}
            <TabsContent value="documentos" className="m-0 p-6 flex-1 focus-visible:ring-0 focus-visible:ring-offset-0">
              <div className="space-y-6">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3 mb-2">
                  <FileText className="h-4 w-4 text-sky-600 shrink-0" />
                  Documentos & Anexos
                </h3>

                {/* Basic files from Site form */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider text-left">
                    Documentos Básicos (Origem Site)
                  </h4>
                  {lead.fileUrls && Object.keys(lead.fileUrls).length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {lead.fileUrls.cnh && (
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between shadow-sm">
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-sky-600 shrink-0" />
                            <div className="text-left">
                              <p className="text-xs font-bold text-slate-800">CNH Enviada</p>
                              <p className="text-[9px] text-slate-450 font-semibold">Habilitação do taxista</p>
                            </div>
                          </div>
                          <a href={lead.fileUrls.cnh} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="h-8 border-slate-200 hover:bg-slate-100 text-[10px] font-bold text-slate-700 flex items-center gap-1 rounded-lg">
                              <Eye className="h-3.5 w-3.5" /> Ver
                            </Button>
                          </a>
                        </div>
                      )}
                      {lead.fileUrls.profilePhoto && (
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between shadow-sm">
                          <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-sky-600 shrink-0" />
                            <div className="text-left">
                              <p className="text-xs font-bold text-slate-800">Foto de Perfil</p>
                              <p className="text-[9px] text-slate-450 font-semibold">Foto de identificação</p>
                            </div>
                          </div>
                          <a href={lead.fileUrls.profilePhoto} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="h-8 border-slate-200 hover:bg-slate-100 text-[10px] font-bold text-slate-700 flex items-center gap-1 rounded-lg">
                              <Eye className="h-3.5 w-3.5" /> Ver
                            </Button>
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-450 italic text-left pl-1">Nenhum documento básico anexado no cadastro inicial.</p>
                  )}
                </div>

                <div className="h-px bg-slate-100" />

                {/* Upload Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                      Outros Anexos & Extratos
                    </h4>
                    <div className="relative">
                      <input
                        type="file"
                        id="attached-document-upload"
                        onChange={handleUploadDocument}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        disabled={uploadingDoc || saving}
                      />
                      <Button
                        type="button"
                        disabled={uploadingDoc || saving}
                        className="bg-sky-50 hover:bg-sky-600 border border-sky-200 text-sky-700 hover:text-white hover:border-sky-600 text-[10px] font-extrabold h-8 px-3 flex items-center justify-center gap-1.5 rounded-lg shadow-sm transition-all"
                      >
                        <UploadCloud className="h-3.5 w-3.5" />
                        {uploadingDoc ? "Enviando..." : "Anexar Documento"}
                      </Button>
                    </div>
                  </div>

                  {lead.attachedDocs && lead.attachedDocs.length > 0 ? (
                    <div className="space-y-2">
                      {lead.attachedDocs.map((docItem, idx) => (
                        <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between hover:border-slate-350 transition-colors shadow-sm">
                          <div className="flex items-center gap-2.5 min-w-0 text-left">
                            <FileText className="h-5 w-5 text-slate-400 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate" title={docItem.name}>
                                {docItem.name}
                              </p>
                              <p className="text-[9px] text-slate-450 font-medium">
                                Enviado em {new Date(docItem.uploadedAt).toLocaleString("pt-BR")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <a href={docItem.url} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-500 hover:text-slate-700 rounded-lg">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </a>
                            <Button
                              onClick={() => handleDeleteDocument(docItem)}
                              disabled={saving}
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-32 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-xs text-slate-450 space-y-1 bg-slate-50/40">
                      <span>Nenhum documento anexo</span>
                      <span className="text-[10px] text-slate-450">Anexe extratos bancários, certidões ou CNH manual.</span>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            {/* Tab 5: Notas & Timeline */}
            <TabsContent value="historico" className="m-0 p-6 flex-1 focus-visible:ring-0 focus-visible:ring-offset-0">
              <div className="space-y-6">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3 mb-2">
                  <Clock className="h-4 w-4 text-sky-600 shrink-0" />
                  Notas & Histórico de Atendimento
                </h3>

                {/* CRM Notes Textarea */}
                <div className="space-y-2 text-left">
                  <label className="text-xs font-bold text-slate-750">Anotações Internas do Atendimento</label>
                  <Textarea
                    placeholder="Digite aqui observações adicionais sobre o motorista, CNH, visitas agendadas..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[100px] bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 text-xs focus-visible:ring-sky-500"
                  />
                </div>

                <div className="h-px bg-slate-100" />

                {/* WhatsApp central templates */}
                <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4 text-emerald-600" />
                    Templates Rápidos (WhatsApp)
                  </h4>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-450">Selecione o Template</label>
                    <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
                      <SelectTrigger className="bg-white border-slate-200 text-slate-700 h-9 text-xs">
                        <SelectValue placeholder="Selecione o template" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-slate-200 text-slate-755">
                        {WHATSAPP_TEMPLATES.map(t => (
                          <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-450">Mensagem</label>
                    <Textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      className="min-h-[80px] bg-white border-slate-200 text-slate-800 text-xs"
                    />
                  </div>

                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      const tplLabel = WHATSAPP_TEMPLATES.find(t => t.id === selectedTemplateId)?.label || "WhatsApp"
                      logInteraction(
                        "whatsapp",
                        `Disparou contato via WhatsApp usando o template '${tplLabel}'.`
                      )
                      setWhatsappSent(true)
                    }}
                    className="block pt-1"
                  >
                    <Button className="w-full bg-emerald-650 hover:bg-emerald-600 text-white flex items-center justify-center gap-2 rounded-xl font-bold text-xs h-10 shadow-sm active:scale-[0.99] transition-all">
                      <Send className="h-3.5 w-3.5" /> Enviar Template WhatsApp
                    </Button>
                  </a>
                </div>

                <div className="h-px bg-slate-100" />

                {/* Timeline display */}
                <div className="space-y-4 text-left">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-sky-600" />
                    Linha do Tempo
                  </h4>

                  <div className="relative border-l border-slate-200 pl-4 ml-2 space-y-4">
                    <div className="relative animate-fadeIn">
                      <span className="absolute -left-[21px] top-1.5 bg-sky-500 h-2 w-2 rounded-full border border-white" />
                      <p className="text-[11px] font-bold text-slate-800">Lead capturado no sistema</p>
                      <p className="text-[9px] text-slate-500 mt-0.5">Origem: {lead.source} • {dateString}</p>
                    </div>

                    {lead.interactions && lead.interactions.map((interaction) => (
                      <div key={interaction.id} className="relative animate-fadeIn">
                        <span className={`absolute -left-[21px] top-1.5 h-2 w-2 rounded-full border border-white ${interaction.type === "whatsapp" ? "bg-emerald-500 animate-pulse" :
                            interaction.type === "note" ? "bg-amber-500" :
                              interaction.type === "status_change" ? "bg-indigo-500" :
                                interaction.type === "credit_check" ? "bg-red-500" : "bg-sky-500"
                          }`} />
                        <p className="text-[11px] font-bold text-slate-800">{interaction.content}</p>
                        <p className="text-[9px] text-slate-450 mt-0.5 font-bold">
                          Operador: <span className="text-slate-655">{interaction.agentName}</span> • {new Date(interaction.createdAt).toLocaleString("pt-BR")}
                        </p>
                      </div>
                    ))}

                    {lead.whatsappSent && (!lead.interactions || !lead.interactions.some(i => i.type === 'whatsapp')) && (
                      <div className="relative animate-fadeIn">
                        <span className="absolute -left-[21px] top-1.5 bg-emerald-500 h-2 w-2 rounded-full border border-white" />
                        <p className="text-[11px] font-bold text-slate-800">Primeiro contato WhatsApp disparado (Legado)</p>
                        <p className="text-[9px] text-slate-500 mt-0.5 font-semibold">Mensagem enviada com sucesso.</p>
                      </div>
                    )}

                    {lead.contacted && (!lead.interactions || !lead.interactions.some(i => i.type === 'status_change')) && (
                      <div className="relative animate-fadeIn">
                        <span className="absolute -left-[21px] top-1.5 bg-indigo-500 h-2 w-2 rounded-full border border-white" />
                        <p className="text-[11px] font-bold text-slate-800">Contato comercial consolidado (Legado)</p>
                        <p className="text-[9px] text-slate-500 mt-0.5 font-semibold">Acompanhamento e diárias apresentadas.</p>
                      </div>
                    )}

                    {lead.updatedAt && (
                      <div className="relative animate-fadeIn">
                        <span className="absolute -left-[21px] top-1.5 bg-slate-400 h-2 w-2 rounded-full border border-white" />
                        <p className="text-[11px] font-bold text-slate-700">Alterações gravadas no perfil</p>
                        <p className="text-[9px] text-slate-500 mt-0.5 font-medium">
                          Modificado em: {new Date(lead.updatedAt).toLocaleString("pt-BR")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

          </div>
        </Tabs>

        {/* Persistent dialog Footer actions */}
        <div className="border-t border-slate-100 p-4 bg-slate-50/50 flex gap-3 shrink-0">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-slate-200 hover:border-slate-350 text-slate-700 hover:bg-slate-50 font-bold"
          >
            Fechar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Save className="h-4 w-4" />
            {saving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  )
}
