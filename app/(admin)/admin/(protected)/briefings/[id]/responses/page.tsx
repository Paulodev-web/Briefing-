import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { DownloadButton } from "@/components/admin/DownloadButton"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { BriefingStatus, FieldType } from "@/lib/types"

const STATUS_LABELS: Record<BriefingStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  draft: { label: "Rascunho", variant: "secondary" },
  published: { label: "Publicado", variant: "default" },
  in_progress: { label: "Em andamento", variant: "outline" },
  completed: { label: "Concluído", variant: "destructive" },
}

export default async function ResponsesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: briefing } = await supabase
    .from("briefings")
    .select("*")
    .eq("id", id)
    .single()

  if (!briefing) notFound()

  const { data: blocks } = await supabase
    .from("briefing_blocks")
    .select("*, briefing_questions(*)")
    .eq("briefing_id", id)
    .order("order_index")

  const { data: answers } = await supabase
    .from("briefing_answers")
    .select("*")
    .eq("briefing_id", id)

  const { data: uploads } = await supabase
    .from("briefing_uploads")
    .select("*")
    .eq("briefing_id", id)

  const answerMap = Object.fromEntries((answers ?? []).map((a) => [a.question_id, a]))
  const uploadsMap: Record<string, typeof uploads> = {}
  for (const u of uploads ?? []) {
    if (!uploadsMap[u.question_id]) uploadsMap[u.question_id] = []
    uploadsMap[u.question_id]!.push(u)
  }

  const { label: statusLabel, variant: statusVariant } = STATUS_LABELS[briefing.status as BriefingStatus]

  return (
    <div>
      <Link href="/admin/briefings" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-3 w-3" /> Briefings
      </Link>

      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold">{briefing.title}</h1>
            <Badge variant={statusVariant}>{statusLabel}</Badge>
          </div>
          {briefing.client_name && (
            <p className="text-muted-foreground text-sm">{briefing.client_name}</p>
          )}
          <p className="text-xs text-muted-foreground mt-0.5">
            Criado em {new Date(briefing.created_at).toLocaleDateString("pt-BR")}
          </p>
        </div>
        <Link
          href={`/admin/briefings/${id}/build`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Editor
        </Link>
      </div>

      {!blocks?.length && (
        <p className="text-muted-foreground text-sm">Nenhuma pergunta configurada ainda.</p>
      )}

      <div className="space-y-4">
        {(blocks ?? []).map((block) => {
          const questions = (block.briefing_questions ?? []).sort(
            (a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index
          )
          return (
            <Card key={block.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{block.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {questions.map((q: { id: string; label: string; type: FieldType }, qi: number) => {
                  const answer = answerMap[q.id]
                  const qUploads = uploadsMap[q.id] ?? []
                  return (
                    <div key={q.id}>
                      {qi > 0 && <Separator className="mb-4" />}
                      <p className="text-xs text-muted-foreground font-medium mb-1">{q.label}</p>
                      <AnswerDisplay
                        type={q.type}
                        answer={answer}
                        uploads={qUploads}
                      />
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function AnswerDisplay({
  type,
  answer,
  uploads,
}: {
  type: FieldType
  answer: { value_text?: string | null; value_json?: unknown } | undefined
  uploads: { id: string; file_name: string; file_path: string; size_bytes: number | null }[]
}) {
  if (!answer && uploads.length === 0) {
    return <p className="text-sm text-muted-foreground italic">Sem resposta</p>
  }

  if (type === "file_upload") {
    return (
      <div className="space-y-1.5">
        {uploads.map((u) => (
          <div key={u.id} className="flex items-center gap-2">
            <span className="text-sm">{u.file_name}</span>
            {u.size_bytes && (
              <span className="text-xs text-muted-foreground">
                {(u.size_bytes / 1024).toFixed(0)} KB
              </span>
            )}
            <DownloadButton filePath={u.file_path} fileName={u.file_name} />
          </div>
        ))}
      </div>
    )
  }

  if (type === "multi_select") {
    const values = answer?.value_json as string[] | undefined
    if (!values?.length) return <p className="text-sm text-muted-foreground italic">Sem resposta</p>
    return (
      <div className="flex flex-wrap gap-1.5">
        {values.map((v) => <Badge key={v} variant="secondary">{v}</Badge>)}
      </div>
    )
  }

  if (type === "repeatable_group") {
    const rows = answer?.value_json as Record<string, string>[] | undefined
    if (!rows?.length) return <p className="text-sm text-muted-foreground italic">Sem resposta</p>
    return (
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="border rounded-md p-3 text-sm space-y-1">
            {Object.entries(row).map(([k, v]) => (
              <div key={k}>
                <span className="text-xs text-muted-foreground">{k}: </span>
                <span>{v}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  if (type === "link" && answer?.value_json) {
    const links = answer.value_json as string[]
    return (
      <div className="space-y-1">
        {links.map((l, i) => (
          <a key={i} href={l} target="_blank" rel="noopener noreferrer" className="block text-sm text-primary underline truncate">
            {l}
          </a>
        ))}
      </div>
    )
  }

  if (type === "link" && answer?.value_text) {
    return (
      <a href={answer.value_text} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline break-all">
        {answer.value_text}
      </a>
    )
  }

  const text = answer?.value_text
  if (!text) return <p className="text-sm text-muted-foreground italic">Sem resposta</p>

  if (type === "single_select") return <Badge variant="secondary">{text}</Badge>
  if (type === "date") return <p className="text-sm">{new Date(text).toLocaleDateString("pt-BR")}</p>
  return <p className="text-sm whitespace-pre-wrap">{text}</p>
}
