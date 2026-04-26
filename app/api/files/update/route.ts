import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function PATCH(req: NextRequest) {
  try {
    const { file_id, content } = (await req.json()) as {
      file_id: string;
      content: string;
    };

    if (!file_id) {
      return NextResponse.json({ error: "file_id is required" }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from("files")
      .update({ content: content ?? "" })
      .eq("id", file_id)
      .select()
      .single();

    if (error || !data) {
      console.error("Failed to update file:", error);
      return NextResponse.json({ error: "Failed to update file" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
