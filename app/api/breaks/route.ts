import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const employerRegistrationId = searchParams.get("employer_registration_id");
  const startDate = searchParams.get("start_date");
  const endDate = searchParams.get("end_date");

  const supabase = await createSupabaseServer();
  let query = supabase.from("break_logs").select("*").order("start_time", { ascending: false });

  if (employerRegistrationId) {
    query = query.eq("employer_registration_id", Number(employerRegistrationId));
  }
  if (startDate) {
    query = query.gte("work_date", startDate);
  }
  if (endDate) {
    query = query.lte("work_date", endDate);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServer();
    const body = await req.json();

    const {
      employer_registration_id,
      work_date,
      attendance_log_id,
      break_type,
      start_time,
      end_time,
      is_paid,
    } = body;

    if (!employer_registration_id || !work_date || !break_type || !start_time || !end_time) {
      return NextResponse.json(
        { error: "Missing required fields: employer_registration_id, work_date, break_type, start_time, end_time" },
        { status: 400 },
      );
    }

    const normalizedPaid =
      typeof is_paid === "boolean" ? is_paid : break_type === "client_meeting";

    const { data, error } = await supabase
      .from("break_logs")
      .insert({
        employer_registration_id: Number(employer_registration_id),
        work_date,
        attendance_log_id: attendance_log_id ?? null,
        break_type,
        start_time,
        end_time,
        is_paid: normalizedPaid,
      })
      .select("*")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

