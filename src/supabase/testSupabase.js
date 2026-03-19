import { getSupabaseClient } from "./client.js";

export async function testSupabase() {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("ingredients")
    .select("id, name, created_at")
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) throw error;
  return { ok: true, row: data?.[0] ?? null };
}
