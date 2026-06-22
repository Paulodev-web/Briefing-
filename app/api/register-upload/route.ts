import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createServiceClient } from "@/lib/supabase/server"

const RegisterSchema = z.object({
  briefing_id: z.string().uuid(),
  question_id: z.string().uuid(),
  file_path: z.string(),
  file_name: z.string(),
  mime_type: z.string().optional(),
  size_bytes: z.number().optional(),
})

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const parsed = RegisterSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { error } = await supabase.from("briefing_uploads").insert(parsed.data)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
