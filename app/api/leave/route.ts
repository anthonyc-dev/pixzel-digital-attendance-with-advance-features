import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/utils/supabase/server";

interface LeaveRequest {
  id: number;
  employer_registration_id: string;
  leave_type: string;
  reason: string;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
  employer_registration?: {
    id: string;
    employer_id: string;
    employer_name: string;
    employer_position: string;
    image: string;
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const employer_id = searchParams.get("employer_id");
  const status = searchParams.get("status");

  const supabase = await createSupabaseServer();

  let query = supabase
    .from("leave_requests")
    .select(`
      *,
      employer_registration (
        id,
        employer_id,
        employer_name,
        employer_position,
        image
      )
    `)
    .order("created_at", { ascending: false });

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

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const mappedData = data?.map((leave: LeaveRequest) => ({
    id: leave.id,
    employee_name: leave.employer_registration?.employer_name || "Unknown",
    employer_id: leave.employer_registration?.employer_id,
    leave_type: leave.leave_type,
    reason: leave.reason,
    start_date: leave.start_date,
    end_date: leave.end_date,
    status: leave.status,
    created_at: leave.created_at,
    image: leave.employer_registration?.image,
  })) || [];

  return NextResponse.json(mappedData);
}

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServer();
    const body = await req.json();

    const { employer_id, leave_type, reason, start_date, end_date } = body;

    if (!employer_id || !leave_type || !reason || !start_date || !end_date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data: employer } = await supabase
      .from("employer_registration")
      .select("id")
      .eq("employer_id", employer_id)
      .single();

    if (!employer) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from("leave_requests")
      .insert({
        employer_registration_id: employer.id,
        leave_type,
        reason,
        start_date,
        end_date,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
