import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { BriefingSchemaSchema } from "@/lib/validations"
import { generateBriefingSchema } from "@/lib/gemini"
import { createClient } from "@/lib/supabase/server"

const RequestSchema = z.object({
  raw_text: z.string().min(10, "Texto muito curto").max(10000, "Texto muito longo (máx. 10.000 chars)"),
})

export async function POST(request: NextRequest) {
  // Verificar autenticação
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  // Validar body
  const body = await request.json().catch(() => null)
  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  try {
    const rawJson = await generateBriefingSchema(parsed.data.raw_text)
    const validated = BriefingSchemaSchema.safeParse(rawJson)

    if (!validated.success) {
      return NextResponse.json(
        { error: "O Gemini retornou um JSON inválido. Tente novamente ou ajuste o texto.", details: validated.error.issues },
        { status: 422 }
      )
    }

    return NextResponse.json(validated.data)
  } catch (err) {
    console.error("Gemini error:", err)
    return NextResponse.json({ error: "Erro ao chamar o Gemini. Verifique a chave de API." }, { status: 500 })
  }
}
