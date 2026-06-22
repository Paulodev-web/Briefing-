import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createServiceClient } from "@/lib/supabase/server"

const CompleteSchema = z.object({
  briefing_id: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const parsed = CompleteSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })

  const supabase = createServiceClient()

  const { error } = await supabase
    .from("briefings")
    .update({ status: "completed" })
    .eq("id", parsed.data.briefing_id)
    .in("status", ["published", "in_progress"])

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
