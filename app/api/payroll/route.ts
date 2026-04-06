import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServer();

  const { data, error } = await supabase
    .from("payroll_records")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServer();
    const body = await req.json();

    const {
      employer_registration_id,
      full_name,
      position,
      base_salary,
      gross_pay,
      net_pay,
      period,
      total_deduction,
      late_count,
      absent_count,
      status,
    } = body;

    if (
      !employer_registration_id ||
      !full_name ||
      !base_salary ||
      !gross_pay ||
      !net_pay
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("payroll_records")
      .insert({
        employer_registration_id,
        full_name,
        position,
        base_salary,
        gross_pay,
        net_pay,
        period,
        total_deduction,
        late_count: late_count || 0,
        absent_count: absent_count || 0,
        status: status || "pending",
        processed_at: status === "processed" ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("Created payroll record:", data);
    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    console.error("Payroll POST error:", err);
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 },
    );
  }
}
