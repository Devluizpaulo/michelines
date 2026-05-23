"use client"

import { useState } from "react"
import { supabase, BUCKETS } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Image as ImageIcon, Trash2, Star, UploadCloud, Badge } from "lucide-react"

interface VehicleGalleryProps {
  images: string[]
  thumbnail: string
  slug: string
  onChange: (images: string[], thumbnail: string) => void
}

export function VehicleGallery({ images, thumbnail, slug, onChange }: VehicleGalleryProps) {
  const [newUrl, setNewUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Append a URL manually
  const handleAddUrl = () => {
    if (!newUrl.trim()) return
    const updated = [...images, newUrl.trim()]
    const newThumb = thumbnail || newUrl.trim()
    onChange(updated, newThumb)
    setNewUrl("")
  }

  // Upload file to Supabase Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadError(null)

    try {
      setUploading(true)
      const updatedImages = [...images]
      let firstUrl = ""

      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Clean filename for storage
        const cleanName = file.name
          .replace(/\s+/g, "_")
          .replace(/[()]/g, "")
          .toLowerCase()
        const remotePath = `${slug || "geral"}/${Date.now()}_${cleanName}`

        const { data, error } = await supabase.storage
          .from(BUCKETS.vehicles)
          .upload(remotePath, file, {
            contentType: file.type,
            upsert: false,
            cacheControl: "31536000",
          })

        if (error) {
          setUploadError(`Erro no upload: ${error.message}`)
          console.error("Supabase upload error:", error)
          continue
        }

        const { data: urlData } = supabase.storage
          .from(BUCKETS.vehicles)
          .getPublicUrl(data.path)

        const publicUrl = urlData.publicUrl
        updatedImages.push(publicUrl)
        if (!firstUrl) firstUrl = publicUrl
      }

      const newThumb = thumbnail || firstUrl || updatedImages[0]
      onChange(updatedImages, newThumb)
    } catch (err) {
      console.error("Erro no upload de imagem:", err)
      setUploadError("Erro inesperado ao fazer upload.")
    } finally {
      setUploading(false)
      // Reset file input
      e.target.value = ""
    }
  }

  const handleSetThumbnail = (url: string) => onChange(images, url)

  const handleRemoveImage = (url: string) => {
    const updated = images.filter(img => img !== url)
    const newThumb = thumbnail === url ? (updated[0] || "") : thumbnail
    onChange(updated, newThumb)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Manual URL Input */}
        <div className="flex-1 w-full flex gap-2">
          <Input
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="Cole o link da imagem (Supabase ou outro)"
            className="bg-white border-slate-200 text-slate-800 text-xs h-10 focus-visible:ring-sky-500"
          />
          <Button
            type="button"
            onClick={handleAddUrl}
            className="bg-white border border-slate-200 text-xs h-10 text-slate-700 hover:bg-slate-50 px-4 shrink-0 font-bold shadow-sm"
          >
            Adicionar URL
          </Button>
        </div>

        {/* File Uploader — Supabase */}
        <div className="relative w-full sm:w-auto shrink-0">
          <input
            type="file"
            id="vehicle-file-upload"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            disabled={uploading}
          />
          <Button
            type="button"
            disabled={uploading}
            className="w-full sm:w-auto bg-sky-50 hover:bg-sky-600 border border-sky-200 text-sky-700 hover:text-white hover:border-sky-600 text-xs h-10 px-4 flex items-center justify-center gap-2 font-bold shadow-sm transition-all"
          >
            <UploadCloud className="h-4 w-4" />
            {uploading ? "Enviando..." : "Upload para Supabase"}
          </Button>
        </div>
      </div>

      {/* Error message */}
      {uploadError && (
        <p className="text-xs text-red-600 font-semibold bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          ⚠️ {uploadError}
        </p>
      )}

      {/* Gallery Grid */}
      {images.length === 0 ? (
        <div className="h-32 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-[10px] text-slate-500 space-y-1 bg-slate-50/50">
          <ImageIcon className="h-6 w-6 text-slate-400" />
          <span>Nenhuma imagem cadastrada na galeria</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {images.map((url, idx) => {
            const isThumb = thumbnail === url
            return (
              <div
                key={idx}
                className={`relative group h-24 rounded-lg overflow-hidden border bg-slate-50 flex items-center justify-center transition-all ${
                  isThumb
                    ? "border-sky-500 shadow-sm ring-1 ring-sky-500/20"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Imagem ${idx + 1}`}
                  className="w-full h-full object-cover"
                />

                {isThumb && (
                  <Badge className="absolute top-1 left-1 bg-sky-600 text-white text-[8px] px-1.5 py-0.5 font-bold rounded">
                    Capa
                  </Badge>
                )}

                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!isThumb && (
                    <button
                      type="button"
                      onClick={() => handleSetThumbnail(url)}
                      className="p-1.5 rounded bg-sky-600 text-white hover:bg-sky-500 transition-colors"
                      title="Definir como capa"
                    >
                      <Star className="h-3.5 w-3.5 fill-white text-white" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(url)}
                    className="p-1.5 rounded bg-red-600 text-white hover:bg-red-500 transition-colors"
                    title="Excluir imagem"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
