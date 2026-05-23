"use client"

import { useState } from "react"
import { supabase, BUCKETS } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon, ExternalLink } from "lucide-react"

interface UploadResult {
  file: string
  url: string
  bucket: string
  status: "success" | "error"
  error?: string
}

interface BulkUploaderProps {
  bucket?: string
  label?: string
}

export function BulkImageUploader({ bucket = BUCKETS.vehicles, label = "Veículos" }: BulkUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [results, setResults] = useState<UploadResult[]>([])
  const [progress, setProgress] = useState(0)

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setResults([])
    setProgress(0)

    const total = files.length
    const newResults: UploadResult[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const cleanName = file.name
        .replace(/\s+/g, "_")
        .replace(/[()]/g, "")
        .toLowerCase()

      try {
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(cleanName, file, {
            contentType: file.type,
            upsert: true,
            cacheControl: "31536000",
          })

        if (error) {
          newResults.push({ file: file.name, url: "", bucket, status: "error", error: error.message })
        } else {
          const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path)
          newResults.push({ file: file.name, url: urlData.publicUrl, bucket, status: "success" })
        }
      } catch (err: any) {
        newResults.push({ file: file.name, url: "", bucket, status: "error", error: err.message })
      }

      setProgress(Math.round(((i + 1) / total) * 100))
      setResults([...newResults])
    }

    setUploading(false)
    e.target.value = ""
  }

  const successCount = results.filter(r => r.status === "success").length
  const errorCount = results.filter(r => r.status === "error").length

  const copyUrls = () => {
    const urls = results
      .filter(r => r.status === "success")
      .map(r => `"${r.file}": "${r.url}"`)
      .join("\n")
    navigator.clipboard.writeText(urls)
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <UploadCloud className="h-4 w-4 text-sky-600" />
            Upload em Massa — {label}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Bucket: <code className="bg-slate-100 px-1 py-0.5 rounded text-sky-700 text-[10px] font-bold">{bucket}</code>
          </p>
        </div>
        <a
          href={`https://supabase.com/dashboard/project/cbynwzxalzcaownnouwp/storage/buckets/${bucket}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-slate-500 hover:text-sky-600 flex items-center gap-1 transition-colors"
        >
          Ver no Supabase <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Upload Zone */}
      <div className="relative">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleBulkUpload}
          disabled={uploading}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full disabled:cursor-not-allowed"
          id={`bulk-upload-${bucket}`}
        />
        <label
          htmlFor={`bulk-upload-${bucket}`}
          className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-slate-300 hover:border-sky-400 rounded-xl cursor-pointer transition-colors bg-slate-50/50 hover:bg-sky-50/30 group"
        >
          {uploading ? (
            <div className="text-center space-y-2">
              <Loader2 className="h-6 w-6 text-sky-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-600 font-semibold">Enviando... {progress}%</p>
              <div className="w-32 bg-slate-200 h-1.5 rounded-full mx-auto overflow-hidden">
                <div
                  className="bg-sky-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="text-center space-y-1.5">
              <ImageIcon className="h-6 w-6 text-slate-400 group-hover:text-sky-500 mx-auto transition-colors" />
              <p className="text-xs font-semibold text-slate-600 group-hover:text-sky-600 transition-colors">
                Clique ou arraste as imagens aqui
              </p>
              <p className="text-[10px] text-slate-400">PNG, JPG, WEBP — múltiplos arquivos</p>
            </div>
          )}
        </label>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          {/* Summary bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {successCount > 0 && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {successCount} enviados
                </span>
              )}
              {errorCount > 0 && (
                <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errorCount} erros
                </span>
              )}
            </div>
            {successCount > 0 && (
              <Button
                type="button"
                onClick={copyUrls}
                className="text-[10px] h-7 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-200"
              >
                Copiar URLs
              </Button>
            )}
          </div>

          {/* File list */}
          <div className="max-h-48 overflow-y-auto space-y-1.5 scrollbar-thin">
            {results.map((result, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-semibold ${
                  result.status === "success"
                    ? "bg-emerald-50 border border-emerald-100 text-emerald-800"
                    : "bg-red-50 border border-red-100 text-red-800"
                }`}
              >
                {result.status === "success" ? (
                  <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="h-3 w-3 shrink-0 text-red-600" />
                )}
                <span className="truncate flex-1">{result.file}</span>
                {result.status === "success" && (
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-sky-600 hover:text-sky-700"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* URL list for copy */}
          {successCount > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">URLs Geradas</p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {results
                  .filter(r => r.status === "success")
                  .map((r, idx) => (
                    <p key={idx} className="text-[9px] text-slate-600 font-mono break-all">
                      {r.url}
                    </p>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
