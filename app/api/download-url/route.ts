import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  // Exige autenticação
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { file_path } = await request.json()
  if (!file_path) return NextResponse.json({ error: "file_path obrigatório" }, { status: 400 })

  const serviceClient = createServiceClient()
  const { data, error } = await serviceClient.storage
    .from("briefing-uploads")
    .createSignedUrl(file_path, 3600)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ url: data.signedUrl })
}
