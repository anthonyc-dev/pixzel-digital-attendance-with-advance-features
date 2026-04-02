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
      allowances,
      gross_pay,
      overtime_pay,
      sss,
      philhealth,
      pagibig,
      tax,
      net_pay,
      payment_method,
      period,
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
        allowances: allowances || 0,
        gross_pay,
        overtime_pay: overtime_pay || 0,
        sss: sss || 0,
        philhealth: philhealth || 0,
        pagibig: pagibig || 0,
        tax: tax || 0,
        net_pay,
        payment_method,
        period,
        status: status || "pending",
        processed_at: status === "processed" ? new Date().toISOString() : null,
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
