import type { SupabaseClient } from "@supabase/supabase-js";
import { countOverlapWorkingDays, parsePayrollPeriod } from "@/lib/payroll/workingDays";

const MONTHLY_WORK_DAYS = 22;

export type LeaveRowForAdjustment = {
  id: number;
  employer_registration_id: number;
  start_date: string;
  end_date: string;
  duration: "FULL_DAY" | "HALF_DAY" | string | null;
  approved_at: string | null;
  leave_payment_kind: "PAID" | "UNPAID" | string | null;
  payroll_adjustment_created: boolean | null;
};

function dailyRateFromSalary(baseSalary: number) {
  return baseSalary / MONTHLY_WORK_DAYS;
}

/**
 * Prior processed payroll stays immutable; add a positive carry-over adjustment when a leave
 * is approved late as PAID (employee was previously treated as absent/unpaid for those days).
 */
export async function maybeCreateLatePaidLeaveAdjustment(
  supabase: SupabaseClient,
  leave: LeaveRowForAdjustment,
) {
  if (leave.leave_payment_kind !== "PAID" || !leave.approved_at) return;
  if (leave.payroll_adjustment_created) return;

  const approvedAt = new Date(leave.approved_at).getTime();

  const [{ data: reg, error: regError }, { data: existingAdj }] = await Promise.all([
    supabase
      .from("employer_registration")
      .select("base_salary")
      .eq("id", leave.employer_registration_id)
      .maybeSingle(),
    supabase
      .from("payroll_adjustments")
      .select("id")
      .eq("leave_request_id", leave.id)
      .maybeSingle(),
  ]);

  if (regError || !reg) return;
  if (existingAdj?.id) return;

  const monthlySalary = Number(reg.base_salary ?? 0);
  if (monthlySalary <= 0) return;

  const rate = dailyRateFromSalary(monthlySalary);
  const perDay = leave.duration === "HALF_DAY" ? 0.5 : 1;

  const { data: payrollRows, error: prError } = await supabase
    .from("payroll_records")
    .select("id, period, processed_at, status")
    .eq("employer_registration_id", leave.employer_registration_id)
    .in("status", ["processed", "paid"])
    .not("processed_at", "is", null);

  if (prError || !payrollRows?.length) return;

  let paidUnits = 0;
  for (const row of payrollRows) {
    const processedAt = row.processed_at ? new Date(row.processed_at).getTime() : 0;
    if (!processedAt || processedAt >= approvedAt) continue;

    const bounds = parsePayrollPeriod(String(row.period ?? ""));
    if (!bounds) continue;

    paidUnits += countOverlapWorkingDays(bounds.start, bounds.end, leave.start_date, leave.end_date);
  }

  if (paidUnits <= 0) return;

  const amount = Number((paidUnits * perDay * rate).toFixed(2));
  if (amount <= 0) return;

  const { error: insError } = await supabase.from("payroll_adjustments").insert({
    employer_registration_id: leave.employer_registration_id,
    type: "late_paid_leave_addition",
    reference_date: leave.start_date,
    amount,
    notes: "Late approved paid leave — addition to next payroll (prior run unchanged).",
    applied: false,
    leave_request_id: leave.id,
  });

  if (!insError) {
    await supabase
      .from("leave_requests")
      .update({ payroll_adjustment_created: true })
      .eq("id", leave.id);
  }
}
