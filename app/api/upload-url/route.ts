import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createServiceClient } from "@/lib/supabase/server"

const UploadUrlSchema = z.object({
  briefing_id: z.string().uuid(),
  question_id: z.string().uuid(),
  filename: z.string().min(1).max(200),
  mime_type: z.string().optional(),
})

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const parsed = UploadUrlSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
  }

  const { briefing_id, question_id, filename, mime_type } = parsed.data
  const supabase = createServiceClient()

  // Verificar que o briefing está disponível
  const { data: briefing } = await supabase
    .from("briefings")
    .select("status")
    .eq("id", briefing_id)
    .single()

  if (!briefing || !["published", "in_progress"].includes(briefing.status)) {
    return NextResponse.json({ error: "Briefing não disponível" }, { status: 403 })
  }

  // Sanitizar filename
  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_")
  const path = `${briefing_id}/${question_id}/${safeFilename}`

  const { data, error } = await supabase.storage
    .from("briefing-uploads")
    .createSignedUploadUrl(path)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    signed_url: data.signedUrl,
    path,
    token: data.token,
  })
}
