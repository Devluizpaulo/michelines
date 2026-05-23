"use client"

import { useState } from "react"
import { collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore"
import { db } from "@/app/firebase/config"
import { Lead } from "@/types/lead"
import { LeadFilters } from "./LeadFilters"
import { LeadPipeline } from "./LeadPipeline"
import { LeadDrawer } from "./LeadDrawer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, ListFilter, Kanban, ClipboardList } from "lucide-react"
import { KanbanSkeleton, TableSkeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface LeadBoardProps {
  leads: Lead[]
  onLeadsChange: (updatedLeads: Lead[]) => void
  loading: boolean
}

export function LeadBoard({ leads, onLeadsChange, loading }: LeadBoardProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sourceFilter, setSourceFilter] = useState("all")
  const [vehicleFilter, setVehicleFilter] = useState("all")
  const [viewType, setViewType] = useState<"pipeline" | "list">("pipeline")
  
  // Lead drawer details
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // New Lead Dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newLeadData, setNewLeadData] = useState({
    fullName: "",
    phone: "",
    source: "Site",
    vehicleInterest: "Corolla Cross",
    status: "new" as Lead["status"],
    notes: ""
  })
  const [creatingLead, setCreatingLead] = useState(false)

  const resetFilters = () => {
    setSearchTerm("")
    setSourceFilter("all")
    setVehicleFilter("all")
  }

  // Filter logic
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = 
      lead.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm) ||
      (lead.notes && lead.notes.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesSource = sourceFilter === "all" || lead.source === sourceFilter
    const matchesVehicle = vehicleFilter === "all" || lead.vehicleInterest === vehicleFilter

    return matchesSearch && matchesSource && matchesVehicle
  })

  // Handle lead update (from Drawer)
  const handleLeadUpdated = (updatedLead: Lead) => {
    const index = leads.findIndex((l) => l.id === updatedLead.id)
    if (index !== -1) {
      const newList = [...leads]
      newList[index] = updatedLead
      onLeadsChange(newList)
    }
  }

  // Handle creating a new lead
  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLeadData.fullName || !newLeadData.phone) {
      alert("Por favor, preencha o Nome e o Celular.")
      return
    }

    try {
      setCreatingLead(true)
      const payload = {
        ...newLeadData,
        contacted: false,
        whatsappSent: false,
        createdAt: new Date(),
        updatedAt: new Date().toISOString()
      }

      const docRef = await addDoc(collection(db, "leads"), payload)
      const newLead: Lead = {
        id: docRef.id,
        ...payload
      }

      onLeadsChange([newLead, ...leads])
      setCreateDialogOpen(false)
      setNewLeadData({
        fullName: "",
        phone: "",
        source: "Site",
        vehicleInterest: "Corolla Cross",
        status: "new",
        notes: ""
      })
    } catch (e) {
      console.error("Erro ao criar lead:", e)
      alert("Erro ao criar lead. Tente novamente.")
    } finally {
      setCreatingLead(false)
    }
  }

  // Handle status update (from Drag and Drop)
  const handleStatusChange = async (leadId: string, newStatus: Lead["status"]) => {
    try {
      const docRef = doc(db, "leads", leadId)
      await updateDoc(docRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      })
      
      const updatedList = leads.map((l) => 
        l.id === leadId 
          ? { ...l, status: newStatus, updatedAt: new Date().toISOString() } 
          : l
      )
      onLeadsChange(updatedList)
    } catch (e) {
      console.error("Erro ao atualizar status do lead via drag & drop:", e)
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Topo de Ações */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            Funil Comercial
            <Badge variant="outline" className="bg-slate-100 border-slate-200 text-slate-600 font-bold">
              {filteredLeads.length} de {leads.length} Leads
            </Badge>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Gerencie os contatos, status da negociação e contatos WhatsApp.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Toggle de Visualização */}
          <div className="bg-white p-0.5 border border-slate-200 rounded-lg flex items-center shrink-0 shadow-sm">
            <button
              onClick={() => setViewType("pipeline")}
              className={`p-2 rounded-md flex items-center gap-1.5 text-xs font-bold transition-all ${
                viewType === "pipeline" 
                  ? "bg-slate-100 text-slate-900 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
              }`}
              title="Visualizar Pipeline"
            >
              <Kanban className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewType("list")}
              className={`p-2 rounded-md flex items-center gap-1.5 text-xs font-bold transition-all ${
                viewType === "list" 
                  ? "bg-slate-100 text-slate-900 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
              }`}
              title="Visualizar Lista"
            >
              <ClipboardList className="h-4 w-4" />
            </button>
          </div>

          <Button 
            onClick={() => setCreateDialogOpen(true)}
            className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs h-10 px-4 flex items-center gap-2 rounded-lg ml-auto sm:ml-0 shadow-sm"
          >
            <Plus className="h-4 w-4" /> Novo Lead
          </Button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <LeadFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sourceFilter={sourceFilter}
        setSourceFilter={setSourceFilter}
        vehicleFilter={vehicleFilter}
        setVehicleFilter={setVehicleFilter}
        resetFilters={resetFilters}
      />

      {/* Grid de Visualização */}
      {loading ? (
        viewType === "pipeline" ? <KanbanSkeleton /> : <TableSkeleton />
      ) : viewType === "pipeline" ? (
        <LeadPipeline 
          leads={filteredLeads} 
          onLeadClick={(lead) => {
            setSelectedLead(lead)
            setDrawerOpen(true)
          }} 
          onStatusChange={handleStatusChange}
        />
      ) : (
        /* Modo Lista Tradicional */
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-black uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Nome</th>
                  <th className="px-6 py-4">Celular</th>
                  <th className="px-6 py-4">Origem</th>
                  <th className="px-6 py-4">Interesse</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-650">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      Nenhum lead encontrado com os filtros atuais.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr 
                      key={lead.id} 
                      onClick={() => {
                        setSelectedLead(lead)
                        setDrawerOpen(true)
                      }}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 font-bold text-slate-800">{lead.fullName}</td>
                      <td className="px-6 py-4 text-slate-500">{lead.phone}</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 text-[10px] font-bold">
                          {lead.source}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-semibold">{lead.vehicleInterest}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold capitalize ${
                          lead.status === "converted" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                          lead.status === "lost" ? "bg-red-50 text-red-750 border border-red-200" :
                          lead.status === "new" ? "bg-sky-50 text-sky-700 border border-sky-200" :
                          "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}>
                          {lead.status === "new" ? "Novo" : 
                           lead.status === "contacted" ? "Contatado" :
                           lead.status === "negotiating" ? "Em Negociação" :
                           lead.status === "scheduled" ? "Visita Agendada" :
                           lead.status === "converted" ? "Alugado" : "Perdido"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedLead(lead)
                            setDrawerOpen(true)
                          }}
                          className="text-sky-600 hover:text-sky-700 hover:bg-slate-50"
                        >
                          Ver Detalhes
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Drawer do Lead */}
      <LeadDrawer
        lead={selectedLead}
        isOpen={drawerOpen}
        onClose={() => {
          setSelectedLead(null)
          setDrawerOpen(false)
        }}
        onLeadUpdated={handleLeadUpdated}
      />

      {/* Dialog para Novo Lead */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="bg-white border border-slate-200 text-slate-800 w-full sm:max-w-md">
          <form onSubmit={handleCreateLead} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-lg font-black text-slate-900">Criar Novo Lead Manual</DialogTitle>
              <DialogDescription className="text-slate-500">
                Insira os dados do contato comercial para iniciar o acompanhamento.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="fullName" className="text-slate-700">Nome Completo</Label>
                <Input
                  id="fullName"
                  placeholder="Ex: Roberto Silva"
                  value={newLeadData.fullName}
                  onChange={(e) => setNewLeadData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="bg-white border-slate-200 text-slate-800 focus-visible:ring-sky-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="phone" className="text-slate-700">Celular (com DDD)</Label>
                <Input
                  id="phone"
                  placeholder="Ex: 11988887777"
                  value={newLeadData.phone}
                  onChange={(e) => setNewLeadData(prev => ({ ...prev, phone: e.target.value }))}
                  className="bg-white border-slate-200 text-slate-800 focus-visible:ring-sky-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-slate-700">Origem</Label>
                  <Select 
                    value={newLeadData.source} 
                    onValueChange={(val) => setNewLeadData(prev => ({ ...prev, source: val }))}
                  >
                    <SelectTrigger className="bg-white border-slate-200 text-slate-800">
                      <SelectValue placeholder="Origem" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-slate-700">
                      <SelectItem value="Google">Google Ads</SelectItem>
                      <SelectItem value="Facebook">Facebook Ads</SelectItem>
                      <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                      <SelectItem value="Site">Site</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-slate-700">Interesse</Label>
                  <Select 
                    value={newLeadData.vehicleInterest} 
                    onValueChange={(val) => setNewLeadData(prev => ({ ...prev, vehicleInterest: val }))}
                  >
                    <SelectTrigger className="bg-white border-slate-200 text-slate-800">
                      <SelectValue placeholder="Veículo" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-slate-700">
                      <SelectItem value="Corolla Cross">Corolla Cross</SelectItem>
                      <SelectItem value="Corolla Sedan">Corolla Sedan</SelectItem>
                      <SelectItem value="Spin">Spin</SelectItem>
                      <SelectItem value="Virtus">Virtus</SelectItem>
                      <SelectItem value="Onix">Onix</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-slate-700">Histórico Inicial / Notas</Label>
                <Textarea
                  placeholder="Observações iniciais sobre a negociação..."
                  value={newLeadData.notes}
                  onChange={(e) => setNewLeadData(prev => ({ ...prev, notes: e.target.value }))}
                  className="min-h-[80px] bg-white border-slate-200 text-slate-800 focus-visible:ring-sky-500"
                />
              </div>
            </div>

            <DialogFooter className="pt-2 border-t border-slate-100 mt-4 flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setCreateDialogOpen(false)}
                className="border-slate-200 hover:border-slate-350 text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={creatingLead}
                className="bg-sky-600 hover:bg-sky-500 text-white font-bold"
              >
                {creatingLead ? "Criando..." : "Criar Lead"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
