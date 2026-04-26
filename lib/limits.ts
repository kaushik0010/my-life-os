import { supabaseServer } from "@/lib/supabase-server";

export async function canCreateFolder(os_id: string): Promise<boolean> {
  const { count } = await supabaseServer
    .from("folders")
    .select("*", { count: "exact", head: true })
    .eq("os_id", os_id);
  return (count ?? 0) < 4;
}

export async function canCreateFile(folder_id: string): Promise<boolean> {
  const { count } = await supabaseServer
    .from("files")
    .select("*", { count: "exact", head: true })
    .eq("folder_id", folder_id);
  return (count ?? 0) < 5;
}

export async function canCreateMessage(os_id: string): Promise<boolean> {
  const { count } = await supabaseServer
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("os_id", os_id);
  return (count ?? 0) < 5;
}
