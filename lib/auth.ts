import { supabaseServer } from "@/lib/supabase-server";

export async function getUserFromRequest(req: Request) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) return null;

  const { data: { user } } = await supabaseServer.auth.getUser(token);
  return user;
}
