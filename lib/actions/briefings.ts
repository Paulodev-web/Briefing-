"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function createBriefing(formData: FormData) {
  const supabase = await createClient()
  const title = formData.get("title") as string
  const client_name = formData.get("client_name") as string

  if (!title?.trim()) throw new Error("Título obrigatório")

  const { data, error } = await supabase
    .from("briefings")
    .insert({ title: title.trim(), client_name: client_name?.trim() || null })
    .select("id")
    .single()

  if (error) throw new Error(error.message)

  redirect(`/admin/briefings/${data.id}/build`)
}

export async function deleteBriefing(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("briefings").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/briefings")
}

export async function publishBriefing(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("briefings")
    .update({ status: "published" })
    .eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/briefings/${id}/build`)
}

export async function unpublishBriefing(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("briefings")
    .update({ status: "draft" })
    .eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/briefings/${id}/build`)
}
