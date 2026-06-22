import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createServiceClient } from "@/lib/supabase/server"

const AnswerSchema = z.object({
  briefing_id: z.string().uuid(),
  question_id: z.string().uuid(),
  value_text: z.string().nullable().optional(),
  value_json: z.unknown().optional(),
})

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const parsed = AnswerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Verificar que o briefing está publicado (segurança)
  const { data: briefing } = await supabase
    .from("briefings")
    .select("status")
    .eq("id", parsed.data.briefing_id)
    .single()

  if (!briefing || !["published", "in_progress"].includes(briefing.status)) {
    return NextResponse.json({ error: "Briefing não disponível" }, { status: 403 })
  }

  // Marcar como in_progress na primeira resposta
  if (briefing.status === "published") {
    await supabase
      .from("briefings")
      .update({ status: "in_progress" })
      .eq("id", parsed.data.briefing_id)
  }

  const { error } = await supabase.from("briefing_answers").upsert(
    {
      briefing_id: parsed.data.briefing_id,
      question_id: parsed.data.question_id,
      value_text: parsed.data.value_text ?? null,
      value_json: parsed.data.value_json ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "question_id" }
  )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
