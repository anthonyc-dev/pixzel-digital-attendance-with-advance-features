import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/utils/supabase/server";

/** POST /api/leave-credits/reset-year  body: { year?: number } */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const year =
      typeof body?.year === "number"
        ? body.year
        : typeof body?.year === "string"
          ? Number.parseInt(body.year, 10)
          : new Date().getFullYear();

    if (Number.isNaN(year) || year < 2000 || year > 2100) {
      return NextResponse.json({ error: "Invalid year" }, { status: 400 });
    }

    const supabase = await createSupabaseServer();
    const { data, error } = await supabase.rpc("reset_employee_leave_credits_year", {
      p_year: year,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, year, rows_affected: data ?? 0 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
