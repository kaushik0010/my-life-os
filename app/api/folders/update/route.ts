import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function PATCH(req: NextRequest) {
  try {
    const { folder_id, name } = (await req.json()) as {
      folder_id: string;
      name: string;
    };

    if (!folder_id || !name) {
      return NextResponse.json({ error: "folder_id and name are required" }, { status: 400 });
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
