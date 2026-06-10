"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, RefreshCw, Loader2, ImageIcon, Check } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface StorageFile {
  name: string
  id: string
  publicUrl: string
  updatedAt: string
  size: number
  mimeType: string
  fullPath: string
}

interface MediaSelectorDialogProps {
  open: boolean
  onClose: () => void
  onSelect: (url: string) => void
  bucket: string
  title?: string
  description?: string
}

export function MediaSelectorDialog({
  open,
  onClose,
  onSelect,
  bucket,
  title = "Biblioteca de Mídias",
  description = "Selecione uma imagem da sua galeria no Supabase Storage."
}: MediaSelectorDialogProps) {
  const [files, setFiles] = useState<StorageFile[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Recursively fetch all files from the selected bucket via API
  const loadFiles = useCallback(async () => {
    if (!open) return
    try {
      setLoading(true)
      
      const fetchFolderContents = async (path = ""): Promise<StorageFile[]> => {
        const res = await fetch(`/api/media?bucket=${bucket}&folder=${path}`)
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
            try {
              const subFolderFiles = await fetchFolderContents(itemPath)
              accumulatedFiles = [...accumulatedFiles, ...subFolderFiles]
            } catch (folderErr) {
              console.warn(`Erro ao carregar subpasta ${itemPath}:`, folderErr)
            }
          } else if (item.name !== ".emptyFolderPlaceholder") {
            const { data: urlData } = supabase.storage
              .from(bucket)
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
      
      // Sort files: newest first
      allFiles.sort((a, b) => {
        const dateA = new Date(a.updatedAt).getTime()
        const dateB = new Date(b.updatedAt).getTime()
        return dateB - dateA
      })

      setFiles(allFiles)
    } catch (err: any) {
      console.error("[MediaSelectorDialog] Error listing files:", err)
    } finally {
      setLoading(false)
    }
  }, [bucket, open])

  useEffect(() => {
    loadFiles()
    setSearchQuery("")
  }, [loadFiles])

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.fullPath.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelect = (url: string) => {
    onSelect(url)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-white border border-slate-200 text-slate-800 w-full sm:max-w-3xl overflow-y-auto max-h-[85vh] flex flex-col p-6 rounded-2xl shadow-xl" descriptionId="media-selector-dialog-description">
        <DialogHeader className="border-b border-slate-100 pb-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <DialogTitle className="text-base font-black text-slate-900 flex items-center gap-2">
                <ImageIcon className="h-4.5 w-4.5 text-sky-600" />
                {title}
              </DialogTitle>
              <DialogDescription id="media-selector-dialog-description" className="text-slate-500 text-xs mt-0.5">
                {description} (Bucket: <code className="font-mono text-sky-700 bg-sky-50 px-1 rounded">{bucket}</code>)
              </DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadFiles}
              disabled={loading}
              className="border-slate-200 h-8 w-8 p-0"
              title="Atualizar lista"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </DialogHeader>

        {/* Search Bar */}
        <div className="relative w-full my-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar imagem na biblioteca..."
            className="pl-9 bg-white border-slate-200 text-xs h-9 focus-visible:ring-sky-500 text-slate-800"
          />
        </div>

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto min-h-[300px] max-h-[50vh] pr-1">
          {loading ? (
            <div className="h-64 flex flex-col gap-2 items-center justify-center text-slate-400 font-bold">
              <Loader2 className="h-6 w-6 text-sky-600 animate-spin" />
              <p className="text-xs">Consultando banco de mídias...</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="h-64 border-2 border-dashed border-slate-100 bg-slate-50/50 rounded-xl flex flex-col gap-2 items-center justify-center text-slate-400 font-semibold text-xs select-none">
              <ImageIcon className="h-8 w-8 text-slate-350" />
              <span>Nenhuma imagem disponível no bucket "{bucket}"</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-0.5">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  onClick={() => handleSelect(file.publicUrl)}
                  className="group relative bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:border-sky-500 hover:shadow-md cursor-pointer transition-all duration-300 aspect-[4/3] flex flex-col justify-between"
                >
                  {/* Image Box */}
                  <div className="relative flex-1 bg-slate-100 flex items-center justify-center overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={file.publicUrl}
                      alt={file.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    
                    {/* Select Overlay */}
                    <div className="absolute inset-0 bg-sky-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                      <span className="bg-sky-600 text-white rounded-lg text-[10px] font-bold py-1.5 px-3 shadow-md flex items-center gap-1">
                        <Check className="h-3 w-3" /> Selecionar
                      </span>
                    </div>
                  </div>

                  {/* Metadata Box */}
                  <div className="p-2 bg-white border-t border-slate-100 select-none">
                    <p className="text-[10px] font-black text-slate-800 truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-[8px] text-slate-450 truncate mt-0.5" title={file.fullPath}>
                      {file.fullPath}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
