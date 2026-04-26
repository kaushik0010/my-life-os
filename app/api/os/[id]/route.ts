import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// --- GET /api/os/[id] ---

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: os, error: osError } = await supabaseServer
      .from("life_os")
      .select("*")
      .eq("id", id)
      .single();

    if (osError || !os) {
      return NextResponse.json({ error: "OS not found" }, { status: 404 });
    }

    const { data: folders, error: foldersError } = await supabaseServer
      .from("folders")
      .select("*")
      .eq("os_id", id);

    if (foldersError) {
      console.error("Failed to fetch folders:", foldersError);
      return NextResponse.json({ error: "Failed to fetch folders" }, { status: 500 });
    }

    const folderIds = (folders ?? []).map((f: { id: string }) => f.id);
    const { data: files, error: filesError } = folderIds.length > 0
      ? await supabaseServer.from("files").select("*").in("folder_id", folderIds)
      : { data: [], error: null };

    if (filesError) {
      console.error("Failed to fetch files:", filesError);
      return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
    }

    const { data: messages, error: messagesError } = await supabaseServer
      .from("messages")
      .select("*")
      .eq("os_id", id);

    if (messagesError) {
      console.error("Failed to fetch messages:", messagesError);
      return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
    }

    return NextResponse.json({
      os,
      folders: folders ?? [],
      files: files ?? [],
      messages: messages ?? [],
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
