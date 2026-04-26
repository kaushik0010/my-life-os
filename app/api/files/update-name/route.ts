import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function PATCH(req: NextRequest) {
  try {
    const { file_id, name } = (await req.json()) as {
      file_id: string;
      name: string;
    };

    if (!file_id || !name) {
      return NextResponse.json({ error: "file_id and name are required" }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from("files")
      .update({ name })
      .eq("id", file_id)
      .select()
      .single();

    if (error || !data) {
      console.error("Failed to rename file:", error);
      return NextResponse.json({ error: "Failed to rename file" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
