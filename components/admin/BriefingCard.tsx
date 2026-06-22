"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { deleteBriefing } from "@/lib/actions/briefings"
import { Check, Copy, ExternalLink, Eye, Settings2, Trash2 } from "lucide-react"
import type { Briefing, BriefingStatus } from "@/lib/types"

const statusConfig: Record<BriefingStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  draft: { label: "Rascunho", variant: "secondary" },
  published: { label: "Publicado", variant: "default" },
  in_progress: { label: "Em andamento", variant: "outline" },
  completed: { label: "Concluído", variant: "destructive" },
}

export function BriefingCard({ briefing }: { briefing: Briefing }) {
  const [isPending, startTransition] = useTransition()
  const [copied, setCopied] = useState(false)
  const { label, variant } = statusConfig[briefing.status]
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ""
  const publicLink = `${appUrl}/b/${briefing.access_token}`

  async function handleCopy() {
    await navigator.clipboard.writeText(publicLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDelete() {
    if (!confirm(`Excluir "${briefing.title}"? Esta ação não pode ser desfeita.`)) return
    startTransition(async () => {
      await deleteBriefing(briefing.id)
    })
  }

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4 flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium truncate">{briefing.title}</span>
            <Badge variant={variant}>{label}</Badge>
          </div>
          {briefing.client_name && (
            <p className="text-sm text-muted-foreground mt-0.5">{briefing.client_name}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(briefing.created_at).toLocaleDateString("pt-BR")}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {briefing.status === "published" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                title="Copiar link do cliente"
                className="gap-1.5 text-xs"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-green-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied ? "Copiado!" : "Copiar link"}
              </Button>
              <Button variant="ghost" size="icon" asChild title="Abrir link público">
                <a href={publicLink} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" asChild title="Ver respostas">
            <Link href={`/admin/briefings/${briefing.id}/responses`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild title="Editar">
            <Link href={`/admin/briefings/${briefing.id}/build`}>
              <Settings2 className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={handleDelete}
            disabled={isPending}
            title="Excluir"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
