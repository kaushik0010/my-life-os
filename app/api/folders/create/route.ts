import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { getUserFromRequest } from "@/lib/auth";
import { canCreateFolder } from "@/lib/limits";

export async function POST(req: NextRequest) {
  try {
    const { os_id, name } = (await req.json()) as { os_id: string; name: string };

    if (!os_id || !name) {
      return NextResponse.json({ error: "os_id and name are required" }, { status: 400 });
    }

    // Get authenticated user
    const user = await getUserFromRequest(req);

    // Fetch OS and validate ownership
    const { data: os, error: osError } = await supabaseServer
      .from("life_os")
      .select("id, user_id, is_temporary")
      .eq("id", os_id)
      .single();

    if (osError || !os) {
      return NextResponse.json({ error: "OS not found" }, { status: 404 });
    }

    const isOwner = os.is_temporary === true || (user && os.user_id === user.id);
    if (!isOwner) {
      console.warn("Unauthorized folder creation attempt", { userId: user?.id, os_id });
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Enforce folder limit
    const allowed = await canCreateFolder(os_id);
    if (!allowed) {
      return NextResponse.json({ error: "Folder limit reached (max 4)" }, { status: 400 });
    }

    // Create folder
    const { data, error } = await supabaseServer
      .from("folders")
      .insert({ os_id, name })
      .select()
      .single();

    if (error || !data) {
      console.error("Failed to create folder:", error);
      return NextResponse.json({ error: "Failed to create folder" }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
