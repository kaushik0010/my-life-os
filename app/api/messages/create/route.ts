import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { getUserFromRequest } from "@/lib/auth";
import { canCreateMessage } from "@/lib/limits";

export async function POST(req: NextRequest) {
  try {
    const { os_id, sender, content, time } = (await req.json()) as {
      os_id: string;
      sender: string;
      content: string;
      time: string;
    };

    if (!os_id || !sender || !content) {
      return NextResponse.json({ error: "os_id, sender, and content are required" }, { status: 400 });
    }

    const user = await getUserFromRequest(req);

    // Fetch OS and validate ownership
    const { data: os } = await supabaseServer
      .from("life_os")
      .select("id, user_id, is_temporary")
      .eq("id", os_id)
      .single();

    if (!os) {
      return NextResponse.json({ error: "OS not found" }, { status: 404 });
    }

    const isOwner = os.is_temporary === true || (user && os.user_id === user.id);
    if (!isOwner) {
      console.warn("Unauthorized message creation attempt", { userId: user?.id, os_id });
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const allowed = await canCreateMessage(os_id);
    if (!allowed) {
      return NextResponse.json({ error: "Message limit reached (max 5)" }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from("messages")
      .insert({ os_id, sender, content, time: time ?? "" })
      .select()
      .single();

    if (error || !data) {
      console.error("Failed to create message:", error);
      return NextResponse.json({ error: "Failed to create message" }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
