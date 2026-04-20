import { NextResponse } from "next/server";
import { payrollAdminDb } from "@/lib/auth/payroll-db";
import { requirePayrollAdmin } from "@/lib/auth/require-payroll-admin";
import { createSupabaseServer } from "@/utils/supabase/server";

type AdjustmentRow = {
  id: string;
  employer_registration_id: number;
  payroll_period_id?: number | null;
  adjustment_type?: string | null;
  type?: string | null;
  amount: number;
  reason?: string | null;
  notes?: string | null;
  effective_date?: string | null;
  reference_date?: string | null;
  created_by?: string | null;
  created_at?: string;
  employer_registration?: {
    id: number;
    employer_id: string;
    employer_name: string;
  };
};

function normalizeAdjustmentRow(row: AdjustmentRow) {
  return {
    ...row,
    adjustment_type: row.adjustment_type ?? row.type ?? "Correction",
    reason: row.reason ?? row.notes ?? "",
    effective_date: row.effective_date ?? row.reference_date ?? "",
  };
}

function toLegacyAdjustmentType(adjustmentType: string) {
  const normalized = adjustmentType.trim().toLowerCase();
  if (normalized === "correction") return "correction";
  if (normalized === "deduction") return "unpaid_late";
  if (normalized === "allowance" || normalized === "bonus") return "manual";
  return "manual";
}

export async function GET() {
  const supabase = await createSupabaseServer();
  const gate = await requirePayrollAdmin(supabase);
  if (gate.response) return gate.response;

  const pdb = payrollAdminDb();
  if (pdb.error) return pdb.error;

  const { data, error } = await pdb.client
    .from("payroll_adjustments")
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
  return NextResponse.json((data ?? []).map((row) => normalizeAdjustmentRow(row as AdjustmentRow)));
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
      payroll_period_id,
      adjustment_type,
      amount,
      reason,
      effective_date,
      created_by,
    } = body;

    if (!employer_registration_id || !adjustment_type || amount === undefined || !reason || !effective_date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const modernInsert = await pdb.client
      .from("payroll_adjustments")
      .insert({
        employer_registration_id,
        payroll_period_id,
        adjustment_type,
        amount,
        reason,
        effective_date,
        created_by,
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

    if (!modernInsert.error) {
      return NextResponse.json(normalizeAdjustmentRow(modernInsert.data as AdjustmentRow), { status: 201 });
    }

    // Fallback for legacy schema (type/reference_date/notes).
    if (!modernInsert.error.message.includes("adjustment_type")) {
      return NextResponse.json({ error: modernInsert.error.message }, { status: 500 });
    }

    const legacyInsert = await pdb.client
      .from("payroll_adjustments")
      .insert({
        employer_registration_id,
        type: toLegacyAdjustmentType(String(adjustment_type)),
        reference_date: effective_date,
        amount,
        notes: reason,
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

    if (legacyInsert.error) return NextResponse.json({ error: legacyInsert.error.message }, { status: 500 });
    return NextResponse.json(normalizeAdjustmentRow(legacyInsert.data as AdjustmentRow), { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
