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
    .from("payroll_periods")
    .select("*")
    .order("period_start", { ascending: false });

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
    const { period_label, period_start, period_end, cutoff_date, is_open } = body;
    if (!period_start || !period_end) {
      return NextResponse.json({ error: "Missing period_start or period_end" }, { status: 400 });
    }

    const { data, error } = await pdb.client
      .from("payroll_periods")
      .insert({
        period_label,
        period_start,
        period_end,
        cutoff_date,
        is_open: is_open ?? true,
      })
      .select("*")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
