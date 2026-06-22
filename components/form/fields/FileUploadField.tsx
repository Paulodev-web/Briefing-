"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Paperclip, Trash2, Upload } from "lucide-react"

interface FileInfo {
  file_name: string
  file_path: string
  mime_type: string
  size_bytes: number
}

interface FileUploadFieldProps {
  questionId: string
  briefingId: string
  config: Record<string, unknown>
  onUploaded: (fileInfo: FileInfo) => void
}

export function FileUploadField({ questionId, briefingId, config, onUploaded }: FileUploadFieldProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<FileInfo[]>([])
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const acceptedFormats = (config.accepted_formats as string[]) ?? []
  const multiple = !!config.multiple
  const accept = acceptedFormats.map((f) => `.${f}`).join(",")

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setError("")
    setUploading(true)

    for (const file of Array.from(files)) {
      try {
        // 1. Obter signed URL
        const urlRes = await fetch("/api/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            briefing_id: briefingId,
            question_id: questionId,
            filename: file.name,
            mime_type: file.type,
          }),
        })

        if (!urlRes.ok) throw new Error("Erro ao obter URL de upload")
        const { signed_url, path } = await urlRes.json()

        // 2. Upload direto para o Storage
        const uploadRes = await fetch(signed_url, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        })

        if (!uploadRes.ok) throw new Error("Erro ao fazer upload do arquivo")

        // 3. Registrar no banco
        const fileInfo: FileInfo = {
          file_name: file.name,
          file_path: path,
          mime_type: file.type,
          size_bytes: file.size,
        }

        await fetch("/api/register-upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ briefing_id: briefingId, question_id: questionId, ...fileInfo }),
        })

        setUploadedFiles((prev) => [...prev, fileInfo])
        onUploaded(fileInfo)
      } catch (err) {
        setError((err as Error).message)
      }
    }

    setUploading(false)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="space-y-2">
      <div
        className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept || undefined}
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm">Enviando...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Upload className="h-6 w-6" />
            <span className="text-sm">
              Arraste ou <span className="text-primary underline">clique para selecionar</span>
            </span>
            {acceptedFormats.length > 0 && (
              <span className="text-xs uppercase">{acceptedFormats.join(", ")}</span>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {uploadedFiles.map((f, i) => (
        <div key={i} className="flex items-center gap-2 text-sm border rounded-md px-3 py-2">
          <Paperclip className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="flex-1 truncate">{f.file_name}</span>
          <span className="text-xs text-muted-foreground">
            {(f.size_bytes / 1024).toFixed(0)} KB
          </span>
          <button
            onClick={() => setUploadedFiles((prev) => prev.filter((_, j) => j !== i))}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
