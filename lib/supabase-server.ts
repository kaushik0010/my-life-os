import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.warn("Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL — server DB calls will fail");
}

export const supabaseServer = createClient(
  supabaseUrl ?? "https://placeholder.supabase.co",
  serviceRoleKey ?? "placeholder-service-role-key"
);
