"use client"

import { useState } from "react"
import { Check, X, ChevronDown, MessageCircle, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { LeadScoreInfo, ScoreCriterion } from "@/lib/lead-score"

interface LeadScoreBreakdownProps {
  scoreInfo: LeadScoreInfo
  /** Dispara o WhatsApp já com a solicitação do item pendente. */
  onRequestItem: (criterion: ScoreCriterion) => void
}

/**
 * Detalhamento do score de qualificação.
 *
 * O número sozinho não diz ao operador o que fazer: aqui cada critério aparece
 * como atendido ou pendente, com o valor em pontos e a ação correspondente.
 * O score deixa de ser um selo e vira roteiro de trabalho.
 */
export function LeadScoreBreakdown({ scoreInfo, onRequestItem }: LeadScoreBreakdownProps) {
  const [open, setOpen] = useState(false)

  const met = scoreInfo.criteria.filter((c) => c.met)
  const pending = scoreInfo.criteria.filter((c) => !c.met)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-slate-50"
      >
        <div className={cn("flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl border", scoreInfo.color)}>
          <span className="text-sm font-black leading-none">{scoreInfo.score}</span>
          <span className="text-[8px] font-bold uppercase leading-none opacity-70">pts</span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-black text-slate-900">
            Lead {scoreInfo.label} {scoreInfo.labelEmoji}
          </p>
          <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
            {pending.length === 0
              ? "Todos os critérios atendidos."
              : `${pending.length} ${pending.length === 1 ? "pendência" : "pendências"} · até +${scoreInfo.missingPoints} pts`}
          </p>
        </div>

        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-slate-400 transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="space-y-4 border-t border-slate-100 p-4">
          {pending.length > 0 && (
            <div className="space-y-2">
              <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <TrendingUp className="h-3.5 w-3.5" />
                O que falta ({scoreInfo.missingPoints} pts disponíveis)
              </p>

              {pending.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 flex-1 items-start gap-2">
                    <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-300" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-700">
                        {c.label}
                        <span className="ml-1.5 text-[10px] font-black text-slate-400">+{c.points}</span>
                      </p>
                      {c.actionHint && (
                        <p className="mt-0.5 text-[11px] font-medium leading-snug text-slate-500">
                          {c.actionHint}
                        </p>
                      )}
                    </div>
                  </div>

                  {c.actionHint && (
                    <button
                      onClick={() => onRequestItem(c)}
                      className="flex min-h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-[11px] font-bold text-emerald-700 transition-colors hover:bg-emerald-100"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      Solicitar
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {met.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Já qualificado
              </p>
              <div className="flex flex-wrap gap-1.5">
                {met.map((c) => (
                  <span
                    key={c.id}
                    className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700"
                  >
                    <Check className="h-3 w-3" />
                    {c.label}
                    <span className="text-[10px] font-black opacity-60">+{c.points}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
