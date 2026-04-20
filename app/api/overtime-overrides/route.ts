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
    .from("overtime_overrides")
    .select(`
      *,
      overtime_entries (
        id,
        employer_registration_id,
        work_date,
        hours,
        status,
        employer_registration (
          employer_name,
          employer_id
        )
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
    const { overtime_entry_id, original_hours, adjusted_hours, original_amount, adjusted_amount, reason, actor } = body;

    if (!overtime_entry_id || original_hours === undefined || adjusted_hours === undefined || !reason || !actor) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await pdb.client
      .from("overtime_overrides")
      .insert({ overtime_entry_id, original_hours, adjusted_hours, original_amount, adjusted_amount, reason, actor })
      .select("*")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
