import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { BuildPageClient } from "./BuildPageClient"
import type { Briefing, BriefingBlock, BriefingQuestion, BriefingSchema } from "@/lib/types"

export default async function BuildPage({ params }: { params: Promise<{ id: string }> }) {
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

  // Converter para BriefingSchema para o form builder
  const initialSchema: BriefingSchema = {
    blocks: (blocks ?? []).map((b: BriefingBlock & { briefing_questions: BriefingQuestion[] }) => ({
      title: b.title,
      questions: (b.briefing_questions ?? [])
        .sort((a, b) => a.order_index - b.order_index)
        .map((q) => ({
          label: q.label,
          type: q.type,
          helper_text: q.helper_text,
          required: q.required,
          config: q.config,
        })),
    })),
  }

  return (
    <BuildPageClient
      briefing={briefing as Briefing}
      initialSchema={initialSchema}
    />
  )
}
