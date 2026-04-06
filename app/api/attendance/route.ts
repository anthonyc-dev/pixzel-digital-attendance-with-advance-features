import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/utils/supabase/server";
import { findBestMatch } from "@/utils/face/matcher";

interface AttendanceLog {
  id: string;
  employer_id: string;
  employer_name: string;
  employer_position: string;
  type: string;
  status: string;
  timestamp: string;
  created_at: string;
  employer_registration?: {
    employer_id: string;
    employer_name: string;
    employer_position: string;
    image: string;
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const employer_id = searchParams.get("employer_id");
  const start_date = searchParams.get("start_date");
  const end_date = searchParams.get("end_date");

  const supabase = await createSupabaseServer();

  let query = supabase
    .from("attendance_logs")
    .select(
      `
      *,
      employer_registration (
        id,
        employer_id,
        employer_name,
        employer_position,
        image
      )
    `,
    )
    .order("timestamp", { ascending: false });

  if (employer_id) {
    const { data: employer } = await supabase
      .from("employer_registration")
      .select("id")
      .eq("employer_id", employer_id)
      .single();

    if (employer) {
      query = query.eq("employer_registration_id", employer.id);
    }
  }

  if (start_date) {
    query = query.gte("timestamp", `${start_date}T00:00:00+08:00`);
  }

  if (end_date) {
    query = query.lte("timestamp", `${end_date}T23:59:59+08:00`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const mappedData =
    data?.map((log: AttendanceLog) => ({
      ...log,
      created_at: log.timestamp,
    })) || [];

  return NextResponse.json(mappedData);
}

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServer();
    const { descriptor, type: requestedType } = await req.json();

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

    // 2. Data Validation
    if (!Array.isArray(descriptor) || descriptor.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid face descriptor format" },
        { status: 400 },
      );
    }

    // 3. Face matching
    console.log(`Starting match for ${employees?.length || 0} employees...`);
    
    const validEmployees = employees?.filter(emp => emp.descriptor && emp.descriptor.length > 0) || [];
    console.log(`Valid employees with descriptors: ${validEmployees.length}`);
    
    if (validEmployees.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No registered employees found. Please register first.",
      });
    }
    
    const match = findBestMatch(descriptor, validEmployees);
    console.log(
      "Match result:",
      match
        ? `Match found: ${match.employer_registration.employer_name}`
        : "No match found",
    );

    if (!match) {
      return NextResponse.json({
        success: false,
        message: "Face not match",
      });
    }

    const employer_registration = match.employer_registration;
    const now = new Date();

    // 4. Daily Entry Validation (Prevent multiple entries on the same day)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const { data: todayLogs } = await supabase
      .from("attendance_logs")
      .select("*")
      .eq("employer_registration_id", employer_registration.id)
      .gte("timestamp", startOfToday.toISOString())
      .lte("timestamp", endOfToday.toISOString());

    const hasTimeIn = todayLogs?.some((log) => log.type === "time_in");
    const hasTimeOut = todayLogs?.some((log) => log.type === "time_out");

    const match_percentage = Math.round((1 - match.distance) * 100);

    if (hasTimeIn && hasTimeOut) {
      return NextResponse.json({
        success: false,
        message: `Attendance already complete for ${employer_registration.employer_name} today.`,
        data: {
          employer_id: employer_registration.employer_id,
          employer_name: employer_registration.employer_name,
          image: employer_registration.image,
          match_percentage,
        },
      });
    }

    // 5. Decide type and Validate
    let type: "time_in" | "time_out";

    if (
      requestedType &&
      (requestedType === "time_in" || requestedType === "time_out")
    ) {
      type = requestedType;

      // Check for existing same-type entry today
      const alreadyHasType = todayLogs?.some((log) => log.type === type);
      if (alreadyHasType) {
        return NextResponse.json({
          success: false,
          message: `Already recorded ${type.replace("_", " ")} for ${employer_registration.employer_name} today.`,
          data: {
            employer_id: employer_registration.employer_id,
            employer_name: employer_registration.employer_name,
            image: employer_registration.image,
            match_percentage,
          },
        });
      }

      // Special case: Can't time out if haven't timed in (unless it's end of shift/6pm)
      if (type === "time_out") {
        const hasTimeIn = todayLogs?.some((log) => log.type === "time_in");
        if (!hasTimeIn) {
          console.log(
            `Warning: ${employer_registration.employer_name} timed out without a time in.`,
          );
          // We allow it to prevent the "error" at 6pm
        }
      }
    } else {
      // Auto-decide if not requested (fallback)
      const lastLog = todayLogs && todayLogs.length > 0 ? todayLogs[0] : null; // todayLogs is sorted or we handle it
      if (!lastLog || lastLog.type === "time_out") {
        type = "time_in";
      } else {
        type = "time_out";
      }
    }

    // 6. Determine status (9:15 AM or later is late)
    // NOTE: We use 'on_time' internally for DB constraint compatibility,
    // but the UI will display it as 'present'.
    const hours = now.getHours();
    const minutes = now.getMinutes();

    let status = "on_time";

    if (type === "time_in") {
      if (hours > 9 || (hours === 9 && minutes >= 15)) {
        status = "late";
      }
    }

    // 7. Insert attendance
    const { error: insertError } = await supabase
      .from("attendance_logs")
      .insert({
        employer_registration_id: employer_registration.id,
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
        match_percentage,
        type,
      },
    });
  } catch (err: unknown) {
    console.error("Attendance API error:", err);
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
