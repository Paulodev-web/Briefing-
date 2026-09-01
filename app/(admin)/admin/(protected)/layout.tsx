import Image from "next/image"
import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/supabase/auth"

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser()

  if (!user) {
    redirect("/admin/login")
  }
  return (
    <div className="min-h-screen bg-muted/20">
      <header className="border-b bg-background">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Image
            src="/devpaulo.png"
            alt="devpaulo.com.br"
            width={120}
            height={32}
            style={{ height: "32px", width: "auto" }}
          />
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Sair
            </button>
          </form>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
