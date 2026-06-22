import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { BriefingCard } from "@/components/admin/BriefingCard"
import { PlusCircle } from "lucide-react"
import type { Briefing } from "@/lib/types"

export default async function BriefingsPage() {
  const supabase = await createClient()
  const { data: briefings } = await supabase
    .from("briefings")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Briefings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {briefings?.length ?? 0} briefing{briefings?.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/briefings/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Briefing
          </Link>
        </Button>
      </div>

      {!briefings?.length ? (
        <div className="text-center py-20 border-2 border-dashed rounded-xl text-muted-foreground">
          <p className="text-lg font-medium">Nenhum briefing ainda</p>
          <p className="text-sm mt-1">Crie o primeiro para começar.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {briefings.map((b: Briefing) => (
            <BriefingCard key={b.id} briefing={b} />
          ))}
        </div>
      )}
    </div>
  )
}
