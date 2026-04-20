import { NextResponse } from "next/server";
import { payrollAdminDb } from "@/lib/auth/payroll-db";
import { requirePayrollAdmin } from "@/lib/auth/require-payroll-admin";
import { createSupabaseServer } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const loanType = searchParams.get("loan_type");
  const status = searchParams.get("status");

  const supabase = await createSupabaseServer();
  const gate = await requirePayrollAdmin(supabase);
  if (gate.response) return gate.response;

  const pdb = payrollAdminDb();
  if (pdb.error) return pdb.error;

  let query = pdb.client
    .from("loan_accounts")
    .select(`
      *,
      employer_registration (
        id,
        employer_id,
        employer_name
      )
    `)
    .order("created_at", { ascending: false });

  if (loanType) query = query.eq("loan_type", loanType);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
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
      loan_type,
      principal_amount,
      disbursed_amount,
      remaining_balance,
      monthly_payment,
      interest_rate_annual,
      term_months,
      start_date,
      end_date,
      status,
      notes,
    } = body;

    if (!employer_registration_id || !loan_type || !start_date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const principal = Number(principal_amount ?? 0);
    const disbursed = Number(disbursed_amount ?? principal);
    const remaining = Number(remaining_balance ?? disbursed);

    const { data, error } = await pdb.client
      .from("loan_accounts")
      .insert({
        employer_registration_id,
        loan_type,
        principal_amount: principal,
        disbursed_amount: disbursed,
        remaining_balance: remaining,
        monthly_payment,
        interest_rate_annual,
        term_months,
        start_date,
        end_date,
        status: status ?? "active",
        notes,
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
