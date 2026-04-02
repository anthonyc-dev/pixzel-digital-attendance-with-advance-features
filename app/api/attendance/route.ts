import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/utils/supabase/server";
import { findBestMatch } from "@/utils/face/matcher";

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServer();
    const { descriptor } = await req.json();

    if (!descriptor) {
      return NextResponse.json(
        { success: false, message: "No face descriptor" },
        { status: 400 },
      );
    }

    // 1. Fetch employees (employer_registration)
    const { data: employees, error } = await supabase
      .from("employer_registration")
      .select("*");

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 },
      );
    }

    // 2. Face matching
    const match = findBestMatch(descriptor, employees);

    if (!match) {
      return NextResponse.json({
        success: false,
        message: "Face not match",
      });
    }

    const employer_registration = match.employer_registration;

    // 3. Get last attendance
    const { data: lastLog } = await supabase
      .from("attendance_logs")
      .select("*")
      .eq("employer_registration_id", employer_registration.id)
      .order("timestamp", { ascending: false })
      .limit(1)
      .maybeSingle();

    // 4. Decide type
    let type: "time_in" | "time_out";

    if (!lastLog || lastLog.type === "time_out") {
      type = "time_in";
    } else {
      type = "time_out";
    }

    // 5. Determine status (basic logic)
    const now = new Date();
    const hour = now.getHours();

    let status = "on_time";

    if (type === "time_in" && hour >= 9) {
      status = "late";
    }

    // 6. Insert attendance
    const { error: insertError } = await supabase
      .from("attendance_logs")
      .insert({
        employer_registration_id: employer_registration.id, // ✅ IMPORTANT
        type,
        status,
        timestamp: now.toISOString(),
      });

    if (insertError) {
      return NextResponse.json(
        { success: false, message: insertError.message },
        { status: 500 },
      );
    }

    // 7. Response (mapped to your structure)
    return NextResponse.json({
      success: true,
      message: `${type} recorded`,
      data: {
        employer_id: employer_registration.employer_id,
        employer_name: employer_registration.employer_name,
        employer_position: employer_registration.employer_position,
        face_detected: true,
        status,
        image: employer_registration.image,
        type,
      },
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json(
        { success: false, message: err.message },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: false, message: "An unknown error occurred" },
      { status: 500 },
    );
  }
}
