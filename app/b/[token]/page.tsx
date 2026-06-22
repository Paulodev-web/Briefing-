import Image from "next/image"
import { createServiceClient } from "@/lib/supabase/server"
import { BriefingForm } from "@/components/form/BriefingForm"
import type { BriefingBlock, BriefingQuestion, BriefingAnswer } from "@/lib/types"

export default async function PublicBriefingPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = createServiceClient()

  const { data: briefing } = await supabase
    .from("briefings")
    .select("id, title, client_name, status")
    .eq("access_token", token)
    .single()

  if (!briefing) {
    return (
      <PageShell>
        <div className="text-center py-20">
          <h1 className="text-xl font-semibold">Briefing não encontrado</h1>
          <p className="text-muted-foreground text-sm mt-2">O link pode estar incorreto ou expirado.</p>
        </div>
      </PageShell>
    )
  }

  if (briefing.status === "draft") {
    return (
      <PageShell>
        <div className="text-center py-20">
          <h1 className="text-xl font-semibold">Este briefing ainda não está disponível</h1>
          <p className="text-muted-foreground text-sm mt-2">Por favor, aguarde o envio do link correto.</p>
        </div>
      </PageShell>
    )
  }

  if (briefing.status === "completed") {
    return (
      <PageShell>
        <div className="text-center py-20">
          <div className="text-4xl mb-4">✅</div>
          <h1 className="text-xl font-semibold">Briefing enviado com sucesso!</h1>
          <p className="text-muted-foreground text-sm mt-2">
            Obrigado, {briefing.client_name ?? ""}! Entraremos em contato em breve.
          </p>
        </div>
      </PageShell>
    )
  }

  // Carregar blocos, perguntas e respostas existentes
  const { data: blocks } = await supabase
    .from("briefing_blocks")
    .select("*, briefing_questions(*)")
    .eq("briefing_id", briefing.id)
    .order("order_index")

  const { data: existingAnswers } = await supabase
    .from("briefing_answers")
    .select("*")
    .eq("briefing_id", briefing.id)

  const sortedBlocks = (blocks ?? []).map((b: BriefingBlock & { briefing_questions: BriefingQuestion[] }) => ({
    ...b,
    briefing_questions: (b.briefing_questions ?? []).sort((a, b) => a.order_index - b.order_index),
  }))

  return (
    <PageShell>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">{briefing.title}</h1>
        {briefing.client_name && (
          <p className="text-muted-foreground text-sm mt-1">Olá, {briefing.client_name}!</p>
        )}
      </div>
      <BriefingForm
        briefingId={briefing.id}
        blocks={sortedBlocks}
        initialAnswers={(existingAnswers ?? []) as BriefingAnswer[]}
      />
    </PageShell>
  )
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/20">
      <header className="flex justify-center pt-8 pb-4">
        <Image
          src="/devpaulo.png"
          alt="devpaulo.com.br"
          width={120}
          height={36}
          style={{ height: "36px", width: "auto" }}
          priority
        />
      </header>
      <div className="max-w-2xl mx-auto px-4 py-8">{children}</div>
      <footer className="text-center text-xs text-muted-foreground py-6">
        devpaulo.com.br
      </footer>
    </div>
  )
}
