import type { SupabaseClient } from "@supabase/supabase-js";
import {
  enumerateWorkingDays,
  overlapWorkingDays,
} from "@/lib/payroll/workingDays";

const DEFAULTS = {
  lateGraceMinutes: 5,
  standardWorkMinutesPerDay: 8 * 60,
  breakAllowedMinutes: 60,
  overtimeMultiplier: 1.25,
  monthlyWorkDays: 22,
} as const;

type Employer = {
  id: number;
  employer_name: string;
  employer_position: string;
  base_salary: number | null;
};

type AttendanceLog = {
  employer_registration_id: number;
  type: "time_in" | "time_out";
  status: "on_time" | "late";
  timestamp: string;
};

type BreakLog = {
  employer_registration_id: number;
  work_date: string;
  break_type: "regular" | "client_meeting";
  start_time: string;
  end_time: string;
  is_paid: boolean;
};

type LeaveRequest = {
  id: number;
  employer_registration_id: number;
  start_date: string;
  end_date: string;
  status: "pending" | "approved" | "rejected";
  applied: boolean;
  leave_type: string | null;
  leave_type_id: string | null;
  duration?: string | null;
  leave_payment_kind?: "PAID" | "UNPAID" | null;
};

type LeaveType = {
  id: string;
  name: string;
  is_paid: boolean;
  percentage_pay: number;
};

type PayrollAdjustment = {
  id: string;
  employer_registration_id: number;
  amount: number;
};

type SupabaseLikeError = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

export type ProcessCutoffInput = {
  startDate: string;
  endDate: string;
  allowances?: number;
  deductions?: number;
  loanDeduction?: number;
  overtimeMultiplier?: number;
};

function getManilaParts(dateIso: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(dateIso));

  const year = parts.find((p) => p.type === "year")?.value ?? "1970";
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  const day = parts.find((p) => p.type === "day")?.value ?? "01";
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");

  return {
    date: `${year}-${month}-${day}`,
    hour: hour === 24 ? 0 : hour,
    minute,
  };
}

function toAmount(value: number) {
  return Number(value.toFixed(2));
}

function isKnownDbError(error: unknown, codes: string[]) {
  if (!error || typeof error !== "object") return false;
  const code = (error as SupabaseLikeError).code;
  return typeof code === "string" && codes.includes(code);
}

async function safeOptionalSelect<T>(
  query: PromiseLike<{ data: T[] | null; error: SupabaseLikeError | null }>,
): Promise<T[]> {
  const { data, error } = await query;
  if (!error) return data ?? [];
  if (isKnownDbError(error, ["42P01", "42703"])) return [];
  throw error;
}

export async function processPayrollCutoff(supabase: SupabaseClient, input: ProcessCutoffInput) {
  const { data: settings, error: settingsError } = await supabase
    .from("payroll_deduction_settings")
    .select("late_grace_minutes, standard_work_minutes, break_allowed_minutes, overtime_multiplier")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Older DBs may not have newly added columns yet.
  if (settingsError && !isKnownDbError(settingsError, ["42703"])) {
    throw settingsError;
  }

  const lateGraceMinutes = Number(settings?.late_grace_minutes ?? DEFAULTS.lateGraceMinutes);
  const standardWorkMinutesPerDay = Number(
    settings?.standard_work_minutes ?? DEFAULTS.standardWorkMinutesPerDay,
  );
  const breakAllowedMinutes = Number(settings?.break_allowed_minutes ?? DEFAULTS.breakAllowedMinutes);
  const overtimeMultiplier =
    input.overtimeMultiplier ?? Number(settings?.overtime_multiplier ?? DEFAULTS.overtimeMultiplier);
  const allowances = input.allowances ?? 0;
  const deductions = input.deductions ?? 0;
  const loanDeduction = input.loanDeduction ?? 0;

  let cutoff: { id: string } | null = null;
  const cutoffUpsert = await supabase
    .from("payroll_cutoffs")
    .upsert(
      { start_date: input.startDate, end_date: input.endDate, is_processed: false },
      { onConflict: "start_date,end_date" },
    )
    .select("id")
    .single();
  if (cutoffUpsert.error) {
    if (!isKnownDbError(cutoffUpsert.error, ["42P01"])) throw cutoffUpsert.error;
  } else {
    cutoff = cutoffUpsert.data as { id: string };
  }

  const [{ data: employers, error: employersError }, { data: logs, error: logsError }, breaks, leaves, leaveTypes, adjustments] =
    await Promise.all([
      supabase.from("employer_registration").select("id, employer_name, employer_position, base_salary").eq("status", "active"),
      supabase
        .from("attendance_logs")
        .select("employer_registration_id, type, status, timestamp")
        .gte("timestamp", `${input.startDate}T00:00:00+08:00`)
        .lte("timestamp", `${input.endDate}T23:59:59+08:00`)
        .order("timestamp", { ascending: true }),
      safeOptionalSelect<BreakLog>(
        supabase
          .from("break_logs")
          .select("employer_registration_id, work_date, break_type, start_time, end_time, is_paid")
          .gte("work_date", input.startDate)
          .lte("work_date", input.endDate),
      ),
      safeOptionalSelect<LeaveRequest>(
        supabase
          .from("leave_requests")
          .select(
            "id, employer_registration_id, start_date, end_date, status, applied, leave_type, leave_type_id, duration, leave_payment_kind",
          )
          .eq("status", "approved")
          .eq("applied", false),
      ),
      safeOptionalSelect<LeaveType>(
        supabase.from("leave_types").select("id, name, is_paid, percentage_pay"),
      ),
      safeOptionalSelect<PayrollAdjustment>(
        supabase
          .from("payroll_adjustments")
          .select("id, employer_registration_id, amount")
          .eq("applied", false)
          .lte("reference_date", input.endDate),
      ),
    ]);

  if (employersError) throw employersError;
  if (logsError) throw logsError;

  const leaveTypeById = new Map((leaveTypes ?? []).map((t) => [t.id, t]));
  const attendanceByEmployeeDay = new Map<string, { firstIn?: AttendanceLog; lastOut?: AttendanceLog }>();
  for (const row of (logs as AttendanceLog[] | null) ?? []) {
    const parts = getManilaParts(row.timestamp);
    const key = `${row.employer_registration_id}:${parts.date}`;
    const current = attendanceByEmployeeDay.get(key) ?? {};
    if (row.type === "time_in" && !current.firstIn) current.firstIn = row;
    if (row.type === "time_out") current.lastOut = row;
    attendanceByEmployeeDay.set(key, current);
  }

  const breaksByEmployeeDay = new Map<string, BreakLog[]>();
  for (const brk of breaks ?? []) {
    const key = `${brk.employer_registration_id}:${brk.work_date}`;
    const list = breaksByEmployeeDay.get(key) ?? [];
    list.push(brk);
    breaksByEmployeeDay.set(key, list);
  }

  const leavesByEmployee = new Map<number, LeaveRequest[]>();
  for (const leave of leaves ?? []) {
    const list = leavesByEmployee.get(leave.employer_registration_id) ?? [];
    list.push(leave);
    leavesByEmployee.set(leave.employer_registration_id, list);
  }

  const adjustmentByEmployee = new Map<number, PayrollAdjustment[]>();
  for (const adj of adjustments ?? []) {
    const list = adjustmentByEmployee.get(adj.employer_registration_id) ?? [];
    list.push(adj);
    adjustmentByEmployee.set(adj.employer_registration_id, list);
  }

  const workingDays = enumerateWorkingDays(input.startDate, input.endDate);
  const generated: unknown[] = [];
  const appliedLeaveIds: number[] = [];
  const appliedAdjustmentIds: string[] = [];

  for (const employer of (employers as Employer[] | null) ?? []) {
    const monthlySalary = Number(employer.base_salary ?? 0);
    if (monthlySalary <= 0) continue;

    const dailyRate = monthlySalary / DEFAULTS.monthlyWorkDays;
    const hourlyRate = dailyRate / 8;
    const basePay = monthlySalary / 2;

    let lateMinutes = 0;
    let absentDays = 0;
    let overtimeMinutes = 0;
    let breakOverageMinutes = 0;

    const leaveEntries = leavesByEmployee.get(employer.id) ?? [];
    type DayLeaveUnits = { paid: number; unpaid: number };
    const leaveByDay = new Map<string, DayLeaveUnits>();

    const dayWeight = (leave: LeaveRequest) =>
      leave.duration === "HALF_DAY" ? 0.5 : 1;

    for (const leave of leaveEntries) {
      const days = overlapWorkingDays(
        input.startDate,
        input.endDate,
        leave.start_date,
        leave.end_date,
      );
      const w = dayWeight(leave);
      let paidPortion: number;
      let unpaidPortion: number;
      if (leave.leave_payment_kind === "PAID") {
        paidPortion = w;
        unpaidPortion = 0;
      } else if (leave.leave_payment_kind === "UNPAID") {
        paidPortion = 0;
        unpaidPortion = w;
      } else {
        const typeFromId = leave.leave_type_id ? leaveTypeById.get(leave.leave_type_id) : undefined;
        const fallbackUnpaid = (leave.leave_type ?? "").toLowerCase().includes("unpaid");
        const payPct = typeFromId
          ? typeFromId.is_paid
            ? typeFromId.percentage_pay / 100
            : 0
          : fallbackUnpaid
            ? 0
            : 1;
        paidPortion = w * payPct;
        unpaidPortion = w * (1 - payPct);
      }
      for (const day of days) {
        const cur = leaveByDay.get(day) ?? { paid: 0, unpaid: 0 };
        cur.paid += paidPortion;
        cur.unpaid += unpaidPortion;
        leaveByDay.set(day, cur);
      }
      appliedLeaveIds.push(leave.id);
    }

    let unpaidLeaveDayUnits = 0;
    let leavePay = 0;
    for (const day of workingDays) {
      const eff = leaveByDay.get(day);
      if (eff?.paid) leavePay += eff.paid * dailyRate;
    }

    for (const day of workingDays) {
      const attKey = `${employer.id}:${day}`;
      const att = attendanceByEmployeeDay.get(attKey);
      const eff = leaveByDay.get(day);

      if (!att?.firstIn || !att?.lastOut) {
        if (!eff) {
          absentDays += 1;
        } else {
          unpaidLeaveDayUnits += eff.unpaid;
        }
        continue;
      }

      const inDate = new Date(att.firstIn.timestamp);
      const outDate = new Date(att.lastOut.timestamp);
      const totalMinutes = Math.max(0, Math.round((outDate.getTime() - inDate.getTime()) / 60000));

      const breakRows = breaksByEmployeeDay.get(attKey) ?? [];
      let regularUnpaid = 0;
      let clientMeetingMinutes = 0;
      for (const br of breakRows) {
        const mins = Math.max(0, Math.round((new Date(br.end_time).getTime() - new Date(br.start_time).getTime()) / 60000));
        if (br.break_type === "client_meeting") {
          clientMeetingMinutes += mins;
          continue;
        }
        if (br.break_type === "regular" && br.is_paid === false) {
          regularUnpaid += mins;
        }
      }

      const overBreak = Math.max(0, regularUnpaid - breakAllowedMinutes);
      breakOverageMinutes += overBreak;

      const paidMinutes = Math.max(0, totalMinutes - regularUnpaid + clientMeetingMinutes);
      if (paidMinutes > standardWorkMinutesPerDay) {
        overtimeMinutes += paidMinutes - standardWorkMinutesPerDay;
      }

      const inParts = getManilaParts(att.firstIn.timestamp);
      const scheduledIn = 9 * 60;
      const actualIn = inParts.hour * 60 + inParts.minute;
      const late = Math.max(0, actualIn - (scheduledIn + lateGraceMinutes));
      lateMinutes += late;
    }

    const lateDeduction = (lateMinutes / 60) * hourlyRate;
    const absentDeduction = absentDays * dailyRate + unpaidLeaveDayUnits * dailyRate;
    const breakDeduction = (breakOverageMinutes / 60) * hourlyRate;
    const overtimePay = (overtimeMinutes / 60) * hourlyRate * overtimeMultiplier;
    const carryOver = (adjustmentByEmployee.get(employer.id) ?? []).reduce((sum, x) => sum + Number(x.amount ?? 0), 0);

    appliedAdjustmentIds.push(...(adjustmentByEmployee.get(employer.id) ?? []).map((x) => x.id));

    const grossPay = basePay + overtimePay + leavePay + allowances + carryOver;
    const totalDeduction = lateDeduction + absentDeduction + breakDeduction + deductions + loanDeduction;
    const netPay = Math.max(0, grossPay - totalDeduction);

    const payload = {
      employer_registration_id: employer.id,
      payroll_cutoff_id: cutoff?.id ?? null,
      full_name: employer.employer_name,
      position: employer.employer_position,
      base_salary: toAmount(basePay),
      gross_pay: toAmount(grossPay),
      overtime_pay: toAmount(overtimePay),
      leave_pay: toAmount(leavePay),
      allowances_adjustment: toAmount(allowances),
      carry_over_amount: toAmount(carryOver),
      late_deduction: toAmount(lateDeduction),
      absent_deduction: toAmount(absentDeduction),
      break_deduction: toAmount(breakDeduction),
      other_deductions: toAmount(deductions),
      loan_deduction: toAmount(loanDeduction),
      total_deduction: toAmount(totalDeduction),
      net_pay: toAmount(netPay),
      period: `${input.startDate} to ${input.endDate}`,
      late_count: Math.ceil(lateMinutes / 60),
      absent_count: Math.ceil(absentDays + unpaidLeaveDayUnits - 1e-9),
      status: "processed",
      processed_at: new Date().toISOString(),
    };

    const { data: existing } = await supabase
      .from("payroll_records")
      .select("id")
      .eq("employer_registration_id", employer.id)
      .eq("period", `${input.startDate} to ${input.endDate}`)
      .maybeSingle();

    if (existing?.id) {
      let { error } = await supabase.from("payroll_records").update(payload).eq("id", existing.id);
      if (error && isKnownDbError(error, ["42703"])) {
        const legacyPayload = {
          employer_registration_id: employer.id,
          full_name: employer.employer_name,
          position: employer.employer_position,
          base_salary: toAmount(basePay),
          gross_pay: toAmount(grossPay),
          net_pay: toAmount(netPay),
          period: `${input.startDate} to ${input.endDate}`,
          total_deduction: toAmount(totalDeduction),
          late_count: Math.ceil(lateMinutes / 60),
          absent_count: Math.ceil(absentDays + unpaidLeaveDayUnits - 1e-9),
          status: "processed",
          processed_at: new Date().toISOString(),
        };
        ({ error } = await supabase.from("payroll_records").update(legacyPayload).eq("id", existing.id));
      }
      if (error) throw error;
      generated.push({ id: existing.id, ...payload });
    } else {
      let { data, error } = await supabase.from("payroll_records").insert(payload).select("*").single();
      if (error && isKnownDbError(error, ["42703"])) {
        const legacyPayload = {
          employer_registration_id: employer.id,
          full_name: employer.employer_name,
          position: employer.employer_position,
          base_salary: toAmount(basePay),
          gross_pay: toAmount(grossPay),
          net_pay: toAmount(netPay),
          period: `${input.startDate} to ${input.endDate}`,
          total_deduction: toAmount(totalDeduction),
          late_count: Math.ceil(lateMinutes / 60),
          absent_count: Math.ceil(absentDays + unpaidLeaveDayUnits - 1e-9),
          status: "processed",
          processed_at: new Date().toISOString(),
        };
        ({ data, error } = await supabase.from("payroll_records").insert(legacyPayload).select("*").single());
      }
      if (error) throw error;
      generated.push(data);
    }
  }

  if (appliedLeaveIds.length > 0 && leaves.length > 0) {
    await supabase.from("leave_requests").update({ applied: true }).in("id", appliedLeaveIds);
  }
  if (appliedAdjustmentIds.length > 0 && adjustments.length > 0) {
    await supabase.from("payroll_adjustments").update({ applied: true }).in("id", appliedAdjustmentIds);
  }

  if (cutoff?.id) {
    await supabase
      .from("payroll_cutoffs")
      .update({ is_processed: true, processed_at: new Date().toISOString() })
      .eq("id", cutoff.id);
  }

  return {
    cutoff,
    records: generated,
    count: generated.length,
  };
}

