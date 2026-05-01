import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { getUserFromRequest } from "@/lib/auth";
import { canCreateFile } from "@/lib/limits";

export async function POST(req: NextRequest) {
  try {
    const { folder_id, name, content } = (await req.json()) as {
      folder_id: string;
      name: string;
      content: string;
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
      console.warn("Unauthorized file creation attempt", { userId: user?.id, folder_id });
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const allowed = await canCreateFile(folder_id);
    if (!allowed) {
      return NextResponse.json({ error: "File limit reached (max 5)" }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from("files")
      .insert({ folder_id, name, content: content ?? "", type: "text" })
      .select()
      .single();

    if (error || !data) {
      console.error("Failed to create file:", error);
      return NextResponse.json({ error: "Failed to create file" }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
