import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { getUserFromRequest } from "@/lib/auth";

// --- POST /api/os/create ---

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { device_type } = body as { device_type: "xp" | "nokia" };

    if (!device_type) {
      return NextResponse.json({ error: "device_type is required" }, { status: 400 });
    }

    // Extract user from JWT if present (optional auth)
    const user = await getUserFromRequest(req);

    const { data, error } = await supabaseServer
      .from("life_os")
      .insert({
        device_type,
        user_id: user?.id ?? null,
        is_temporary: !user,
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("Failed to create OS:", error);
      return NextResponse.json({ error: "Failed to create OS" }, { status: 500 });
    }

    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
