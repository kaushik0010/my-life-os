import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { getUserFromRequest } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  try {
    const { folder_id, name } = (await req.json()) as {
      folder_id: string;
      name: string;
    };

    if (!folder_id || !name) {
      return NextResponse.json({ error: "folder_id and name are required" }, { status: 400 });
    }

    const user = await getUserFromRequest(req);

    // Look up folder → OS to verify ownership
    const { data: folder } = await supabaseServer
      .from("folders")
      .select("id, os_id")
      .eq("id", folder_id)
      .single();

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    const { data: os } = await supabaseServer
      .from("life_os")
      .select("id, user_id, is_temporary")
      .eq("id", folder.os_id)
      .single();

    if (!os) {
      return NextResponse.json({ error: "OS not found" }, { status: 404 });
    }

    const isOwner = os.is_temporary === true || (user && os.user_id === user.id);
    if (!isOwner) {
      console.warn("Unauthorized folder rename attempt", { userId: user?.id, folder_id });
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabaseServer
      .from("folders")
      .update({ name })
      .eq("id", folder_id)
      .select()
      .single();

    if (error || !data) {
      console.error("Failed to rename folder:", error);
      return NextResponse.json({ error: "Failed to rename folder" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
