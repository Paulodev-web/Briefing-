import { createBriefing } from "@/lib/actions/briefings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NewBriefingPage() {
  return (
    <div className="max-w-lg mx-auto">
      <Link
        href="/admin/briefings"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Novo Briefing</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createBriefing} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Título do projeto *</Label>
              <Input
                id="title"
                name="title"
                placeholder="Ex: Site fotógrafo André Lima"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="client_name">Nome do cliente</Label>
              <Input
                id="client_name"
                name="client_name"
                placeholder="Ex: André Lima"
              />
            </div>
            <Button type="submit" className="w-full">Criar e ir para o editor</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
