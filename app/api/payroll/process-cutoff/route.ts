import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/utils/supabase/server";
import { processPayrollCutoff } from "@/lib/payroll/processor";

type RequestBody = {
  start_date?: string;
  end_date?: string;
  allowances?: number;
  deductions?: number;
  loan_deduction?: number;
  overtime_multiplier?: number;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody;

    if (!body.start_date || !body.end_date) {
      return NextResponse.json(
        { error: "start_date and end_date are required" },
        { status: 400 },
      );
    }

    const supabase = await createSupabaseServer();
    const result = await processPayrollCutoff(supabase, {
      startDate: body.start_date,
      endDate: body.end_date,
      allowances: Number(body.allowances ?? 0),
      deductions: Number(body.deductions ?? 0),
      loanDeduction: Number(body.loan_deduction ?? 0),
      overtimeMultiplier:
        body.overtime_multiplier === undefined
          ? undefined
          : Number(body.overtime_multiplier),
    });

    return NextResponse.json({
      success: true,
      message: "Payroll cutoff processed successfully",
      data: result,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (typeof error === "object" && error !== null) {
      const e = error as {
        message?: string;
        details?: string;
        hint?: string;
        code?: string;
      };
      return NextResponse.json(
        {
          error: e.message ?? "Unknown error",
          code: e.code,
          details: e.details,
          hint: e.hint,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}

