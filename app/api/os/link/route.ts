import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { os_id } = (await req.json()) as { os_id: string };
    if (!os_id) {
      return NextResponse.json({ error: "os_id is required" }, { status: 400 });
    }

    // Get the OS to check its device_type
    const { data: targetOs } = await supabaseServer
      .from("life_os")
      .select("device_type")
      .eq("id", os_id)
      .single();

    if (!targetOs) {
      return NextResponse.json({ error: "OS not found" }, { status: 404 });
    }

    // Check if user already has an OS with this device type
    const { data: existingOs } = await supabaseServer
      .from("life_os")
      .select("id")
      .eq("user_id", user.id)
      .eq("device_type", targetOs.device_type)
      .neq("id", os_id)
      .limit(1)
      .single();

    if (existingOs) {
      return NextResponse.json(
        { error: "You already have this device saved." },
        { status: 400 }
      );
    }

    // Link the OS
    const { data, error } = await supabaseServer
      .from("life_os")
      .update({ user_id: user.id, is_temporary: false })
      .eq("id", os_id)
      .select()
      .single();

    if (error || !data) {
      console.error("Failed to link OS:", error);
      return NextResponse.json({ error: "Failed to link OS" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
