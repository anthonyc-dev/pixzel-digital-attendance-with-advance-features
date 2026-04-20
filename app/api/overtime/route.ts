import { NextResponse } from "next/server";
import { payrollAdminDb } from "@/lib/auth/payroll-db";
import { requirePayrollAdmin } from "@/lib/auth/require-payroll-admin";
import { createSupabaseServer } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServer();
  const gate = await requirePayrollAdmin(supabase);
  if (gate.response) return gate.response;

  const pdb = payrollAdminDb();
  if (pdb.error) return pdb.error;

  const { data, error } = await pdb.client
    .from("overtime_entries")
    .select(`
      *,
      employer_registration (
        id,
        employer_id,
        employer_name
      )
    `)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServer();
    const gate = await requirePayrollAdmin(supabase);
    if (gate.response) return gate.response;

    const pdb = payrollAdminDb();
    if (pdb.error) return pdb.error;

    const body = await req.json();
    const {
      employer_registration_id,
      work_date,
      hours,
      rate_multiplier,
      base_hourly_rate,
      computed_amount,
      status,
      remarks,
    } = body;

    if (!employer_registration_id || !work_date || hours === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await pdb.client
      .from("overtime_entries")
      .insert({
        employer_registration_id,
        work_date,
        hours,
        rate_multiplier: rate_multiplier ?? 1.5,
        base_hourly_rate,
        computed_amount,
        status: status ?? "pending",
        remarks,
      })
      .select(`
        *,
        employer_registration (
          id,
          employer_id,
          employer_name
        )
      `)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
