"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { BriefingSchemaSchema } from "@/lib/validations"
import type { BriefingSchema } from "@/lib/types"

export async function saveSchema(briefingId: string, schema: BriefingSchema) {
  const supabase = await createClient()

  const validated = BriefingSchemaSchema.safeParse(schema)
  if (!validated.success) throw new Error("Schema inválido")

  // 1. Deletar blocos existentes (cascade remove perguntas)
  const { error: deleteError } = await supabase
    .from("briefing_blocks")
    .delete()
    .eq("briefing_id", briefingId)
  if (deleteError) throw new Error(deleteError.message)

  // 2. Inserir novos blocos
  for (let bi = 0; bi < validated.data.blocks.length; bi++) {
    const block = validated.data.blocks[bi]

    const { data: newBlock, error: blockError } = await supabase
      .from("briefing_blocks")
      .insert({ briefing_id: briefingId, title: block.title, order_index: bi })
      .select("id")
      .single()

    if (blockError || !newBlock) throw new Error(blockError?.message ?? "Erro ao salvar bloco")

    // 3. Inserir perguntas do bloco
    const questions = block.questions.map((q, qi) => ({
      block_id: newBlock.id,
      label: q.label,
      helper_text: q.helper_text,
      type: q.type,
      required: q.required,
      order_index: qi,
      config: q.config,
    }))

    if (questions.length > 0) {
      const { error: qError } = await supabase.from("briefing_questions").insert(questions)
      if (qError) throw new Error(qError.message)
    }
  }

  revalidatePath(`/admin/briefings/${briefingId}/build`)
}

export async function publishBriefingAction(briefingId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("briefings")
    .update({ status: "published" })
    .eq("id", briefingId)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/briefings/${briefingId}/build`)
}

export async function unpublishBriefingAction(briefingId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("briefings")
    .update({ status: "draft" })
    .eq("id", briefingId)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/briefings/${briefingId}/build`)
}
