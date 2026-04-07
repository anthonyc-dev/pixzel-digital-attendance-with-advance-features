import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const employer_id = searchParams.get("employer_id");
  const start_date = searchParams.get("start_date");
  const end_date = searchParams.get("end_date");

  const supabase = await createSupabaseServer();

  let query = supabase
    .from("dtr_records")
    .select(
      `
      *,
      employer_registration (
        employer_id,
        employer_name,
        employer_position,
        image
      )
    `,
    );

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
    query = query.gte("date", start_date);
  }

  if (end_date) {
    query = query.lte("date", end_date);
  }

  const { data, error } = await query.order("date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const mappedData =
    data?.map((record: Record<string, unknown>) => {
      let isLate = record.is_late as boolean;
      let finalStatus = record.status;

      // Retroactively fix bugged 'is_late' and 'status' based on 'time_in' string.
      // time_in looks like "09:19 AM" or "05:45 PM"
      const timeInStr = record.time_in as string;
      if (timeInStr && timeInStr !== '--:-- --') {
        const [timePart, amPm] = timeInStr.split(' ');
        if (timePart && amPm) {
          const [hourStr, minStr] = timePart.split(':');
          let hours = parseInt(hourStr, 10);
          const minutes = parseInt(minStr, 10);

          if (amPm.toUpperCase() === 'PM' && hours !== 12) hours += 12;
          if (amPm.toUpperCase() === 'AM' && hours === 12) hours = 0;

          if (hours > 9 || (hours === 9 && minutes >= 15)) {
            isLate = true;
            if (finalStatus === "present" || finalStatus === "on_time") {
                finalStatus = "late";
            }
          }
        }
      }

      return {
      id: record.id,
      employer_registration_id: record.employer_registration_id,
      employer_id: (record.employer_registration as Record<string, unknown>)
        ?.employer_id,
      employer_name: (record.employer_registration as Record<string, unknown>)
        ?.employer_name,
      employer_position: (
        record.employer_registration as Record<string, unknown>
      )?.employer_position,
      image: (record.employer_registration as Record<string, unknown>)?.image,
      date: record.date,
      time_in: record.time_in,
      time_out: record.time_out,
      total_hours: record.total_hours,
      overtime_minutes: record.overtime_minutes,
      status: finalStatus,
      is_late: isLate,
      excuse: record.excuse,
      created_at: record.created_at,
      };
    }) || [];

  return NextResponse.json(mappedData);
}

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServer();
    const body = await req.json();

    const {
      employer_registration_id,
      date,
      time_in,
      time_out,
      total_hours,
      overtime_minutes,
      status,
      is_late,
      excuse,
    } = body;

    if (!employer_registration_id || !date) {
      return NextResponse.json(
        { error: "Missing required fields: employer_registration_id and date" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("dtr_records")
      .insert({
        employer_registration_id,
        date,
        time_in,
        time_out,
        total_hours,
        overtime_minutes: overtime_minutes || 0,
        status: status || "present",
        is_late: is_late || false,
        excuse,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 },
    );
  }
}
