"use client"

import { useState, useEffect } from "react"
import { 
  collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc 
} from "firebase/firestore"
import { db } from "@/app/firebase/config"
import { useToast } from "@/components/ui/toast-simple"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Star, Trash2, CheckCircle2, XCircle, RefreshCw, MessageSquare, Quote, Eye, EyeOff,
  Clock
} from "lucide-react"
import { motion } from "framer-motion"
import { THEME_TOKENS } from "@/theme/design-system"

interface Testimonial {
  id: string
  name: string
  time: string
  testimony: string
  rating: number
  approved: boolean
  createdAt?: any
}

export function TestimonialManager() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "approved" | "pending">("all")
  const { success, error } = useToast()

  useEffect(() => {
    setLoading(true)
    const q = query(collection(db, "testimonials"), orderBy("createdAt", "desc"))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Testimonial[] = []
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Testimonial)
      })
      setTestimonials(list)
      setLoading(false)
    }, (err) => {
      console.error("Erro ao escutar avaliações:", err)
      error("Erro de Conexão", "Não foi possível carregar as avaliações em tempo real.")
      setLoading(false)
    })

    return () => unsubscribe()
  }, [error])

  // Toggle approval state
  const handleToggleApproval = async (id: string, currentApproved: boolean) => {
    try {
      await updateDoc(doc(db, "testimonials", id), {
        approved: !currentApproved
      })
      success(
        currentApproved ? "Avaliação Ocultada" : "Avaliação Aprovada",
        currentApproved 
          ? "O depoimento foi ocultado e não aparecerá na página inicial." 
          : "O depoimento agora está visível para todos os visitantes da página inicial."
      )
    } catch (e: any) {
      console.error("Erro ao atualizar depoimento:", e)
      error("Erro de Atualização", "Ocorreu um erro ao alterar o status do depoimento.")
    }
  }

  // Delete testimonial
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir permanentemente a avaliação de "${name}"? Esta ação não pode ser desfeita.`)) {
      return
    }
    
    try {
      await deleteDoc(doc(db, "testimonials", id))
      success("Avaliação Excluída", `O depoimento de "${name}" foi removido do sistema.`)
    } catch (e: any) {
      console.error("Erro ao excluir depoimento:", e)
      error("Erro ao Excluir", "Não foi possível remover o depoimento. Tente novamente.")
    }
  }

  // Filtered list
  const filteredTestimonials = testimonials.filter((t) => {
    if (filter === "approved") return t.approved
    if (filter === "pending") return !t.approved
    return true
  })

  // Counters
  const countAll = testimonials.length
  const countApproved = testimonials.filter(t => t.approved).length
  const countPending = testimonials.filter(t => !t.approved).length

  return (
    <div className="space-y-8 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-sky-605" />
            Gestão de Depoimentos
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-semibold">
            Modere as avaliações enviadas pelos motoristas da frota antes de publicá-las na página inicial.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto shrink-0 text-xs font-bold">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === "all"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Todos ({countAll})
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === "pending"
                ? "bg-white text-amber-700 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Pendentes ({countPending})
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === "approved"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Aprovados ({countApproved})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
          <span className="animate-spin h-6 w-6 border-2 border-sky-550 border-t-transparent rounded-full" />
          <span className="text-xs font-semibold">Buscando avaliações...</span>
        </div>
      ) : filteredTestimonials.length === 0 ? (
        <div className="py-20 text-center bg-white border border-slate-200 rounded-2xl shadow-sm p-8 space-y-4">
          <Quote className="h-10 w-10 text-slate-300 mx-auto opacity-60" />
          <div>
            <h3 className="text-sm font-bold text-slate-800">Nenhum depoimento encontrado</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
              {filter === "all" 
                ? "Ainda não há nenhuma avaliação enviada pelos motoristas através da homepage." 
                : filter === "pending" 
                  ? "Não há nenhuma avaliação pendente de moderação no momento!"
                  : "Nenhuma avaliação foi aprovada para exibição pública na página inicial ainda."
              }
            </p>
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTestimonials.map((item) => (
            <motion.div
              key={item.id}
              {...THEME_TOKENS?.motion?.scaleHover}
              className={`bg-white border rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all duration-300 border-slate-200 group relative hover:border-slate-300`}
            >
              {/* Top Details & Stars */}
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  {/* Status Badge */}
                  {item.approved ? (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 border hover:bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Aprovado
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-50 text-amber-700 border-amber-200 border hover:bg-amber-50 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                      <Clock className="h-3 w-3 text-amber-600" /> Pendente
                    </Badge>
                  )}
                  
                  {/* Formatted Date */}
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {item.createdAt?.seconds 
                      ? new Date(item.createdAt.seconds * 1000).toLocaleDateString("pt-BR") 
                      : item.createdAt 
                        ? new Date(item.createdAt).toLocaleDateString("pt-BR") 
                        : "Recentemente"}
                  </span>
                </div>

                {/* Stars Rating */}
                <div className="flex gap-0.5 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${
                        i < item.rating 
                          ? "fill-yellow-400 stroke-yellow-500" 
                          : "fill-transparent stroke-slate-200"
                      }`} 
                    />
                  ))}
                </div>

                {/* Testimony */}
                <p className="text-slate-650 text-xs md:text-sm leading-relaxed font-semibold italic text-justify text-slate-600">
                  "{item.testimony}"
                </p>
              </div>

              {/* Author & Actions Footer */}
              <div className="pt-4 border-t border-slate-100 mt-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-sky-50 border border-sky-150 flex items-center justify-center shrink-0">
                    <span className="text-xs font-black text-sky-700">
                      {item.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-slate-800 text-xs truncate">{item.name}</h4>
                    <p className="text-[9px] text-slate-400 font-bold truncate mt-0.5">{item.time}</p>
                  </div>
                </div>

                {/* Moderation Actions Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleToggleApproval(item.id, item.approved)}
                    variant="outline"
                    className={`flex-1 text-xs font-bold h-9 flex items-center justify-center gap-1.5 rounded-xl border active:scale-[0.98] transition-all ${
                      item.approved
                        ? "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                        : "bg-sky-50 border-sky-200 hover:bg-sky-100 text-sky-700 hover:border-sky-305"
                    }`}
                  >
                    {item.approved ? (
                      <>
                        <EyeOff className="h-3.5 w-3.5" /> Ocultar
                      </>
                    ) : (
                      <>
                        <Eye className="h-3.5 w-3.5" /> Publicar
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => handleDelete(item.id, item.name)}
                    variant="outline"
                    className="border-red-200 bg-red-50/20 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 w-9 h-9 p-0 rounded-xl shrink-0 transition-all active:scale-[0.98]"
                    title="Excluir avaliação"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
