import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/supabase/auth"
import { LoginForm } from "./LoginForm"

export default async function LoginPage() {
  const user = await getAuthUser()

  if (user) {
    redirect("/admin/briefings")
  }

  return <LoginForm />
}
