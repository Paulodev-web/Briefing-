"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { FormBuilder } from "@/components/admin/FormBuilder"
import { saveSchema, publishBriefingAction, unpublishBriefingAction } from "./actions"
import { toast } from "@/hooks/use-toast"
import {
  ArrowLeft, Copy, ExternalLink, Globe, GlobeLock,
  Loader2, Sparkles
} from "lucide-react"
import Link from "next/link"
import type { Briefing, BriefingSchema } from "@/lib/types"

const FIELD_LOCKED_STATUSES = ["in_progress", "completed"]

export function BuildPageClient({
  briefing,
  initialSchema,
}: {
  briefing: Briefing
  initialSchema: BriefingSchema
}) {
  const router = useRouter()
  const [rawText, setRawText] = useState("")
  const [schema, setSchema] = useState<BriefingSchema>(initialSchema)
  const [generating, setGenerating] = useState(false)
  const [isPending, startTransition] = useTransition()

  const isLocked = FIELD_LOCKED_STATUSES.includes(briefing.status)
  const isPublished = briefing.status === "published"
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ""
  const publicLink = `${appUrl}/b/${briefing.access_token}`

  async function handleGenerate() {
    if (!rawText.trim()) return
    setGenerating(true)
    try {
      const res = await fetch("/api/generate-schema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_text: rawText }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erro ao gerar schema")
      setSchema(data)
      toast({ title: "Schema gerado!", description: "Revise e salve." })
    } catch (err) {
      toast({ title: "Erro", description: (err as Error).message, variant: "destructive" })
    } finally {
      setGenerating(false)
    }
  }

  function handleSave() {
    startTransition(async () => {
      try {
        await saveSchema(briefing.id, schema)
        toast({ title: "Salvo com sucesso!" })
      } catch (err) {
        toast({ title: "Erro ao salvar", description: (err as Error).message, variant: "destructive" })
      }
    })
  }

  function handlePublish() {
    startTransition(async () => {
      try {
        await saveSchema(briefing.id, schema)
        await publishBriefingAction(briefing.id)
        toast({ title: "Publicado!", description: "Link disponível para o cliente." })
        router.refresh()
      } catch (err) {
        toast({ title: "Erro ao publicar", description: (err as Error).message, variant: "destructive" })
      }
    })
  }

  function handleUnpublish() {
    startTransition(async () => {
      try {
        await unpublishBriefingAction(briefing.id)
        toast({ title: "Voltou para rascunho." })
        router.refresh()
      } catch (err) {
        toast({ title: "Erro", description: (err as Error).message, variant: "destructive" })
      }
    })
  }

  function copyLink() {
    navigator.clipboard.writeText(publicLink)
    toast({ title: "Link copiado!" })
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <Link
            href="/admin/briefings"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-1"
          >
            <ArrowLeft className="h-3 w-3" /> Briefings
          </Link>
          <h1 className="text-xl font-bold">{briefing.title}</h1>
          {briefing.client_name && (
            <p className="text-sm text-muted-foreground">{briefing.client_name}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {isLocked && (
            <span className="text-xs text-muted-foreground border rounded-md px-2 py-1">
              🔒 Edição bloqueada — cliente já iniciou o preenchimento
            </span>
          )}
          {isPublished && (
            <>
              <Button variant="outline" size="sm" onClick={copyLink}>
                <Copy className="h-3.5 w-3.5 mr-1.5" /> Copiar link
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={publicLink} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Abrir
                </a>
              </Button>
              {!isLocked && (
                <Button variant="outline" size="sm" onClick={handleUnpublish} disabled={isPending}>
                  <GlobeLock className="h-3.5 w-3.5 mr-1.5" /> Despublicar
                </Button>
              )}
            </>
          )}
          {!isLocked && !isPublished && (
            <>
              <Button variant="outline" onClick={handleSave} disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Salvar rascunho
              </Button>
              <Button onClick={handlePublish} disabled={isPending}>
                <Globe className="h-4 w-4 mr-1.5" />
                Publicar e gerar link
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Coluna esquerda — geração via IA */}
        <div className="space-y-3">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            Gerar com IA
          </h2>
          <Textarea
            placeholder="Cole aqui o texto com as perguntas do briefing. O Gemini vai classificar cada uma no tipo de campo correto..."
            className="min-h-[300px] font-mono text-sm"
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            disabled={isLocked}
          />
          <Button
            onClick={handleGenerate}
            disabled={generating || !rawText.trim() || isLocked}
            className="w-full"
            variant="secondary"
          >
            {generating ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Gerando...</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2" /> Gerar com Gemini</>
            )}
          </Button>
        </div>

        {/* Coluna direita — form builder */}
        <div className="space-y-3">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            Editor de campos
          </h2>
          <FormBuilder
            schema={schema}
            onChange={setSchema}
            readOnly={isLocked}
          />
        </div>
      </div>
    </div>
  )
}
