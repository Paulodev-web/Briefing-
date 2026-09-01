import { createClient } from "@/lib/supabase/server";

export async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    try {
      await supabase.auth.signOut();
    } catch {}
    return null;
  }

  return user;
}
