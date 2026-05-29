"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase, BUCKETS } from "@/lib/supabase"
import { deleteFiles } from "@/lib/supabase-crud"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast-simple"
import { 
  FolderOpen, 
  Search, 
  RefreshCw, 
  UploadCloud, 
  ExternalLink, 
  Trash2, 
  Copy, 
  Check, 
  Eye, 
  X, 
  Loader2, 
  ImageIcon,
  AlertTriangle
} from "lucide-react"

interface StorageFile {
  name: string
  id: string
  publicUrl: string
  updatedAt: string
  size: number
  mimeType: string
  fullPath: string
}

export function SupabaseMediaCenter() {
  const { success, error: showError, warning } = useToast()
  
  // Buckets configuration
  const bucketOptions = [
    { id: BUCKETS.vehicles, label: "Fotos de Veículos", desc: "Imagens exibidas no Showroom e comparador de veículos" },
    { id: BUCKETS.banners, label: "Banners da Landing", desc: "Banners promocionais e de campanhas do Hero" },
    { id: BUCKETS.logos, label: "Logos & Marcas", desc: "Logotipos e identidades visuais do site" }
  ]

  const [activeBucket, setActiveBucket] = useState<string>(BUCKETS.vehicles)
  const [files, setFiles] = useState<StorageFile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  
  // Upload states
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showUploadZone, setShowUploadZone] = useState(false)
  
  // Interactive UI states
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [lightboxUrl, setLightboxUrl] = useState<{ url: string; name: string } | null>(null)
  const [deletingFile, setDeletingFile] = useState<StorageFile | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Format bytes to KB/MB
  const formatBytes = (bytes: number, decimals = 1) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
  }

  // Format dates
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A"
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    } catch {
      return dateStr
    }
  }

  // Recursive fetch of files from Supabase Storage via our secure API Route
  const loadFiles = useCallback(async () => {
    try {
      setLoading(true)
      
      const fetchFolderContents = async (path = ""): Promise<StorageFile[]> => {
        const res = await fetch(`/api/media?bucket=${activeBucket}&folder=${path}`)
        const json = await res.json()
        
        if (!res.ok || json.error) {
          throw new Error(json.error || "Erro ao consultar a API de mídia.")
        }

        const data = json.data || []
        let accumulatedFiles: StorageFile[] = []

        for (const item of data) {
          const itemPath = path ? `${path}/${item.name}` : item.name
          const isFolder = !item.metadata

          if (isFolder) {
            // Recursively fetch subfolder contents
            try {
              const subFolderFiles = await fetchFolderContents(itemPath)
              accumulatedFiles = [...accumulatedFiles, ...subFolderFiles]
            } catch (folderErr) {
              console.warn(`Erro ao carregar subpasta ${itemPath}:`, folderErr)
            }
          } else if (item.name !== ".emptyFolderPlaceholder") {
            // It's a file, get public URL
            const { data: urlData } = supabase.storage
              .from(activeBucket)
              .getPublicUrl(itemPath)

            accumulatedFiles.push({
              name: item.name,
              id: item.id || itemPath,
              publicUrl: urlData.publicUrl,
              updatedAt: item.updated_at || "",
              size: item.metadata?.size || 0,
              mimeType: item.metadata?.mimetype || "",
              fullPath: itemPath
            })
          }
        }

        return accumulatedFiles
      }

      const allFiles = await fetchFolderContents()
      
      // Sort files: newest updated first
      allFiles.sort((a, b) => {
        const dateA = new Date(a.updatedAt).getTime()
        const dateB = new Date(b.updatedAt).getTime()
        return dateB - dateA
      })

      setFiles(allFiles)
    } catch (err: any) {
      console.error("[SupabaseMediaCenter] Error listing files:", err)
      showError("Erro ao listar arquivos", err.message || "Não foi possível carregar a galeria.")
    } finally {
      setLoading(false)
    }
  }, [activeBucket, showError])

  // Trigger load on tab change
  useEffect(() => {
    loadFiles()
    setSearchQuery("")
  }, [activeBucket, loadFiles])

  // Handle file upload via our secure API Route
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (!fileList || fileList.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    const total = fileList.length
    let successCount = 0
    let failCount = 0

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      
      // Clean and sanitize filename
      const cleanName = file.name
        .replace(/\s+/g, "_")
        .replace(/[()]/g, "")
        .toLowerCase()
      
      const uploadPath = cleanName

      try {
        const formData = new FormData()
        formData.append("bucket", activeBucket)
        formData.append("path", uploadPath)
        formData.append("file", file)

        const res = await fetch("/api/media", {
          method: "POST",
          body: formData,
        })
        const json = await res.json()

        if (!res.ok || json.error) {
          console.error(`Erro no upload de ${file.name}:`, json.error)
          failCount++
        } else {
          successCount++
        }
      } catch (err) {
        console.error(err)
        failCount++
      }

      setUploadProgress(Math.round(((i + 1) / total) * 100))
    }

    if (successCount > 0) {
      success("Upload concluído!", `${successCount} imagem(ns) enviada(s) com sucesso para o Supabase.`)
    }
    if (failCount > 0) {
      showError("Erro no upload", `${failCount} imagem(ns) falharam no envio.`)
    }

    setUploading(false)
    setShowUploadZone(false)
    e.target.value = "" // Reset file input
    loadFiles() // Refresh list
  }

  // Copy public URL to clipboard
  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    success("Link copiado!", "A URL pública do arquivo foi copiada para sua área de transferência.")
    setTimeout(() => {
      setCopiedId(null)
    }, 2000)
  }

  // Delete file trigger
  const triggerDelete = (file: StorageFile) => {
    setDeletingFile(file)
  }

  // Handle delete execution
  const handleDelete = async () => {
    if (!deletingFile) return

    try {
      setIsDeleting(true)
      const { error } = await deleteFiles(activeBucket, [deletingFile.fullPath])

      if (error) {
        throw new Error(error)
      }

      success("Mídia excluída!", `O arquivo "${deletingFile.name}" foi removido do Supabase Storage.`)
      setFiles((prev) => prev.filter((f) => f.id !== deletingFile.id))
    } catch (err: any) {
      console.error(err)
      showError("Erro ao excluir", err.message || "Não foi possível excluir o arquivo.")
    } finally {
      setIsDeleting(false)
      setDeletingFile(null)
    }
  }

  // Filter files by search query
  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.fullPath.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeBucketInfo = bucketOptions.find(b => b.id === activeBucket)

  return (
    <div className="space-y-6">
      
      {/* Bucket Tab Selector */}
      <div className="flex flex-col space-y-4">
        <div className="flex flex-wrap gap-2.5 bg-slate-100 p-1.5 rounded-2xl max-w-fit border border-slate-200">
          {bucketOptions.map((bucket) => {
            const isActive = activeBucket === bucket.id
            return (
              <button
                key={bucket.id}
                onClick={() => setActiveBucket(bucket.id)}
                className={`px-5 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all duration-300 ${
                  isActive
                    ? "bg-white text-sky-700 shadow-md border-slate-200 border"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {bucket.label}
              </button>
            )
          })}
        </div>

        {/* Bucket details description */}
        <div className="bg-white/60 border border-slate-200 p-4 rounded-xl flex items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Bucket: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sky-700 font-mono text-[11px]">{activeBucket}</code></h4>
            <p className="text-[11px] text-slate-500 mt-0.5 font-semibold">{activeBucketInfo?.desc}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowUploadZone(!showUploadZone)}
              className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs h-9 px-4 flex items-center gap-1.5 rounded-lg shadow-sm"
            >
              <UploadCloud className="h-4 w-4" /> {showUploadZone ? "Fechar Painel" : "Enviar Novas Fotos"}
            </Button>
            
            <Button
              variant="outline"
              onClick={loadFiles}
              disabled={loading}
              className="border-slate-200 hover:border-slate-350 bg-white text-slate-500 hover:text-slate-700 h-9 w-9 p-0 shadow-sm"
              title="Atualizar lista"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Upload Zone (Collapsible Panel) */}
      {showUploadZone && (
        <div className="border-2 border-dashed border-sky-300 bg-sky-50/20 hover:bg-sky-50/40 p-6 rounded-2xl relative transition-all duration-300">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            id="media-uploader-input"
          />
          <div className="text-center space-y-3">
            {uploading ? (
              <div className="space-y-2 py-4">
                <Loader2 className="h-8 w-8 text-sky-600 animate-spin mx-auto" />
                <p className="text-xs text-slate-700 font-bold">Enviando arquivos... {uploadProgress}%</p>
                <div className="w-48 bg-slate-200 h-2 rounded-full mx-auto overflow-hidden shadow-inner">
                  <div
                    className="bg-sky-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="py-4 space-y-2">
                <UploadCloud className="h-8 w-8 text-sky-500 mx-auto" />
                <p className="text-xs font-bold text-slate-700">Clique ou arraste as imagens aqui para iniciar o upload</p>
                <p className="text-[10px] text-slate-400 font-semibold">Tamanho máximo recomendado: 5MB por imagem • JPG, PNG, WEBP, GIF</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar imagem pelo nome..."
            className="pl-9 bg-white border-slate-200 text-xs h-9 focus-visible:ring-sky-500 text-slate-800"
          />
        </div>
        
        <div className="text-[11px] text-slate-500 font-bold bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg select-none">
          {filteredFiles.length} {filteredFiles.length === 1 ? "arquivo encontrado" : "arquivos encontrados"}
        </div>
      </div>

      {/* Grid of Files */}
      {loading ? (
        <div className="h-64 border border-slate-200 bg-white rounded-2xl flex flex-col gap-3 items-center justify-center text-slate-450 font-bold">
          <Loader2 className="h-7 w-7 text-sky-600 animate-spin" />
          <p className="text-xs">Carregando galeria do Supabase...</p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="h-48 border border-dashed border-slate-200 bg-slate-50/50 rounded-2xl flex flex-col gap-2 items-center justify-center text-slate-400 font-bold text-xs select-none">
          <ImageIcon className="h-8 w-8 text-slate-300" />
          <span>Nenhum arquivo disponível ou correspondente à busca.</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredFiles.map((file) => {
            const isCopied = copiedId === file.id
            return (
              <div 
                key={file.id} 
                className="group relative bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
              >
                {/* Image Box */}
                <div className="relative aspect-video bg-slate-50 border-b border-slate-100 flex items-center justify-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={file.publicUrl}
                    alt={file.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  
                  {/* Hover Options Overlay */}
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-1.5 z-10">
                    <button
                      type="button"
                      onClick={() => setLightboxUrl({ url: file.publicUrl, name: file.name })}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white text-white hover:text-slate-950 transition-colors"
                      title="Visualizar em tamanho cheio"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(file.publicUrl, file.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        isCopied 
                          ? "bg-emerald-500 text-white" 
                          : "bg-white/10 hover:bg-white text-white hover:text-slate-950"
                      }`}
                      title="Copiar URL para cadastro"
                    >
                      {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => triggerDelete(file)}
                      className="p-2 rounded-lg bg-red-600/80 hover:bg-red-650 text-white transition-colors"
                      title="Excluir arquivo permanentemente"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Metadata Box */}
                <div className="p-3 flex-1 flex flex-col justify-between min-w-0 select-none">
                  <div>
                    <p className="text-[11px] font-bold text-slate-800 truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-[9px] text-slate-400 font-semibold truncate mt-0.5" title={file.fullPath}>
                      {file.fullPath}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between text-[9px] text-slate-450 font-bold mt-2 pt-2 border-t border-slate-100">
                    <span>{formatBytes(file.size)}</span>
                    <span>{formatDate(file.updatedAt)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Lightbox / Zoom Modal */}
      {lightboxUrl && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setLightboxUrl(null)}
        >
          <div 
            className="relative bg-white rounded-2xl overflow-hidden max-w-4xl w-full border border-slate-800 shadow-2xl flex flex-col animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header info */}
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-slate-800 truncate">{lightboxUrl.name}</h3>
                <a 
                  href={lightboxUrl.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[10px] text-sky-600 hover:underline flex items-center gap-1 mt-0.5"
                >
                  Link do arquivo <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
              <button 
                onClick={() => setLightboxUrl(null)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-450 hover:text-slate-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            {/* Image Canvas */}
            <div className="p-4 bg-slate-950 flex items-center justify-center min-h-[300px] max-h-[75vh]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightboxUrl.url}
                alt={lightboxUrl.name}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Delete Dialog */}
      {deletingFile && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4 animate-scale-up">
            <div className="flex gap-3.5">
              <div className="h-10 w-10 rounded-full bg-red-55 p-2 text-red-600 shrink-0 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-900">Confirmar exclusão de mídia?</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  Esta ação excluirá permanentemente o arquivo <code className="bg-slate-150 px-1 py-0.5 rounded text-red-700 text-[10px] font-bold break-all">{deletingFile.name}</code> do Supabase Storage.
                </p>
                <p className="text-[10px] text-amber-600 font-extrabold bg-amber-50 border border-amber-100 rounded-lg p-2 mt-2 leading-relaxed">
                  ⚠️ Cuidado: Se este arquivo estiver sendo usado no cadastro de algum veículo ou no banner do Hero, o site exibirá uma imagem quebrada.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3.5 pt-2">
              <Button
                variant="outline"
                disabled={isDeleting}
                onClick={() => setDeletingFile(null)}
                className="border-slate-200 hover:border-slate-350 text-slate-500 hover:text-slate-700 h-9 font-bold text-xs"
              >
                Cancelar
              </Button>
              <Button
                disabled={isDeleting}
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-650 text-white h-9 font-bold text-xs flex items-center gap-1.5"
              >
                {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                Excluir Definitivamente
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
