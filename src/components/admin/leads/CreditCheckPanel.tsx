"use client"

import { useState, useRef } from "react"
import {
  ShieldCheck,
  Loader2,
  Paperclip,
  FileText,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  UserCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { CreditCheckRecord } from "@/types/lead"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type CreditResult = CreditCheckRecord["result"]

const RESULT_OPTIONS: {
  id: CreditResult
  label: string
  icon: typeof CheckCircle2
  activeClass: string
  badgeClass: string
}[] = [
  {
    id: "approved",
    label: "Aprovado",
    icon: CheckCircle2,
    activeClass: "bg-emerald-600 border-emerald-600 text-white",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    id: "restricted",
    label: "Com restrição",
    icon: AlertTriangle,
    activeClass: "bg-amber-500 border-amber-500 text-white",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    id: "rejected",
    label: "Negado",
    icon: XCircle,
    activeClass: "bg-red-600 border-red-600 text-white",
    badgeClass: "bg-red-50 text-red-700 border-red-200",
  },
  {
    id: "inconclusive",
    label: "Inconclusivo",
    icon: HelpCircle,
    activeClass: "bg-slate-600 border-slate-600 text-white",
    badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
  },
]

export function creditResultMeta(result: CreditResult) {
  return RESULT_OPTIONS.find((o) => o.id === result) ?? RESULT_OPTIONS[3]
}

interface CreditCheckPanelProps {
  cpf?: string
  current?: CreditCheckRecord
  /** Grava a consulta e registra na timeline. */
  onRegister: (record: Omit<CreditCheckRecord, "checkedBy" | "checkedAt">) => Promise<void>
  /** Sobe o comprovante e devolve a URL pública. */
  onUploadDocument: (file: File) => Promise<{ url: string; path: string; name: string } | null>
}

/**
 * Registro auditável da consulta de CPF.
 *
 * Antes a ficha guardava só o status ("aprovada"/"reprovada"), sem quem
 * consultou, quando, qual o resultado do birô ou qual documento embasou a
 * decisão — e o comprovante, quando existia, ficava solto no meio dos demais
 * anexos. Aqui o comprovante fica preso à decisão que ele justifica.
 */
export function CreditCheckPanel({
  cpf,
  current,
  onRegister,
  onUploadDocument,
}: CreditCheckPanelProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [result, setResult] = useState<CreditResult>("approved")
  const [bureau, setBureau] = useState("Serasa")
  const [bureauScore, setBureauScore] = useState("")
  const [restrictions, setRestrictions] = useState("")
  const [notes, setNotes] = useState("")
  const [attachment, setAttachment] = useState<{ url: string; path: string; name: string } | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const resetForm = () => {
    setResult("approved")
    setBureau("Serasa")
    setBureauScore("")
    setRestrictions("")
    setNotes("")
    setAttachment(null)
  }

  const handleAttach = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const uploaded = await onUploadDocument(file)
      if (uploaded) setAttachment(uploaded)
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const parsedScore = parseInt(bureauScore, 10)
      await onRegister({
        result,
        bureau: bureau.trim() || undefined,
        bureauScore: isNaN(parsedScore) ? undefined : parsedScore,
        restrictions: restrictions.trim() || undefined,
        notes: notes.trim() || undefined,
        documentUrl: attachment?.url,
        documentPath: attachment?.path,
        documentName: attachment?.name,
      })
      resetForm()
      setFormOpen(false)
    } finally {
      setSaving(false)
    }
  }

  const meta = current ? creditResultMeta(current.result) : null

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <h4 className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-slate-700">
          <ShieldCheck className="h-4 w-4 shrink-0 text-sky-600" />
          Análise de CPF
        </h4>
        {meta && (
          <span className={cn("shrink-0 rounded border px-2 py-0.5 text-[10px] font-black uppercase", meta.badgeClass)}>
            {meta.label}
          </span>
        )}
      </div>

      {cpf ? (
        <p className="font-mono text-xs font-bold text-slate-600">{cpf}</p>
      ) : (
        <p className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-600">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          Ficha sem CPF — cadastre antes de consultar.
        </p>
      )}

      {/* Última consulta registrada */}
      {current ? (
        <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-slate-500">
            <span className="flex items-center gap-1">
              <UserCheck className="h-3.5 w-3.5 shrink-0" />
              {current.checkedBy}
            </span>
            <span>{new Date(current.checkedAt).toLocaleString("pt-BR")}</span>
            {current.bureau && <span className="font-bold text-slate-600">{current.bureau}</span>}
            {typeof current.bureauScore === "number" && (
              <span className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-black text-slate-700">
                Score {current.bureauScore}
              </span>
            )}
          </div>

          {current.restrictions && (
            <p className="text-[11px] font-medium leading-snug text-amber-700">
              <span className="font-black uppercase">Restrições:</span> {current.restrictions}
            </p>
          )}
          {current.notes && (
            <p className="text-[11px] font-medium leading-snug text-slate-600">{current.notes}</p>
          )}

          {current.documentUrl && (
            <a
              href={current.documentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-2.5 text-[11px] font-bold text-sky-700 transition-colors hover:bg-sky-100"
            >
              <FileText className="h-3.5 w-3.5 shrink-0" />
              <span className="max-w-[180px] truncate">{current.documentName || "Comprovante"}</span>
              <ExternalLink className="h-3 w-3 shrink-0 opacity-60" />
            </a>
          )}
        </div>
      ) : (
        <p className="text-[11px] font-medium text-slate-400">Nenhuma consulta registrada nesta ficha.</p>
      )}

      {!formOpen ? (
        <button
          onClick={() => setFormOpen(true)}
          className="min-h-10 w-full rounded-xl bg-sky-600 text-xs font-bold text-white transition-colors hover:bg-sky-700"
        >
          {current ? "Registrar nova consulta" : "Registrar consulta"}
        </button>
      ) : (
        <div className="space-y-3 rounded-xl border border-sky-200 bg-sky-50/50 p-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Resultado</label>
            <div className="grid grid-cols-2 gap-1.5">
              {RESULT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setResult(opt.id)}
                  className={cn(
                    "flex min-h-10 items-center justify-center gap-1.5 rounded-lg border text-[11px] font-bold transition-all",
                    result === opt.id
                      ? opt.activeClass
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <opt.icon className="h-3.5 w-3.5 shrink-0" />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Birô</label>
              <Input
                value={bureau}
                onChange={(e) => setBureau(e.target.value)}
                placeholder="Serasa"
                className="h-10 border-slate-200 bg-white text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Score do birô</label>
              <Input
                value={bureauScore}
                onChange={(e) => setBureauScore(e.target.value.replace(/\D/g, "").slice(0, 4))}
                inputMode="numeric"
                placeholder="Ex.: 720"
                className="h-10 border-slate-200 bg-white text-xs"
              />
            </div>
          </div>

          {/* Restrições só fazem sentido quando o resultado não é limpo */}
          {(result === "restricted" || result === "rejected") && (
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Restrições encontradas
              </label>
              <Input
                value={restrictions}
                onChange={(e) => setRestrictions(e.target.value)}
                placeholder="Protesto, negativação, pendência..."
                className="h-10 border-slate-200 bg-white text-xs"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Observação</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contexto da decisão, condições acordadas, avalista..."
              className="min-h-[64px] border-slate-200 bg-white text-xs"
            />
          </div>

          {/* Comprovante fica preso à decisão, não solto entre os anexos gerais */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Comprovante da consulta
            </label>
            {attachment ? (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-2">
                <FileText className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                <span className="min-w-0 flex-1 truncate text-[11px] font-bold text-emerald-700">
                  {attachment.name}
                </span>
                <button
                  onClick={() => setAttachment(null)}
                  className="shrink-0 text-[11px] font-bold text-slate-400 hover:text-red-600"
                >
                  remover
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex min-h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-white text-[11px] font-bold text-slate-500 transition-colors hover:border-sky-400 hover:text-sky-600 disabled:opacity-60"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Enviando...
                  </>
                ) : (
                  <>
                    <Paperclip className="h-3.5 w-3.5" /> Anexar PDF ou print
                  </>
                )}
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleAttach}
              className="hidden"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => {
                resetForm()
                setFormOpen(false)
              }}
              className="min-h-10 flex-1 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving || uploading}
              className="flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-sky-600 text-xs font-bold text-white transition-colors hover:bg-sky-700 disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
              Salvar consulta
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
