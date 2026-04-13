import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/utils/supabase/server";

/**
 * GET /api/leave-credits/:employeeId?year=2026
 * `employeeId` matches `employer_registration.employer_id` (public employee id string).
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ employeeId: string }> },
) {
  try {
    const { employeeId } = await params;
    const { searchParams } = new URL(req.url);
    const yearParam = searchParams.get("year");
    const year = yearParam ? Number.parseInt(yearParam, 10) : new Date().getFullYear();
    if (Number.isNaN(year) || year < 2000 || year > 2100) {
      return NextResponse.json({ error: "Invalid year" }, { status: 400 });
    }

    const supabase = await createSupabaseServer();
    const { data: reg, error: regError } = await supabase
      .from("employer_registration")
      .select("id")
      .eq("employer_id", employeeId)
      .maybeSingle();

    if (regError) {
      return NextResponse.json({ error: regError.message }, { status: 500 });
    }
    if (!reg) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const { data: row, error } = await supabase
      .from("employee_leave_credits")
      .select("year, total_credits, used_credits, remaining_credits")
      .eq("employer_registration_id", reg.id)
      .eq("year", year)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!row) {
      return NextResponse.json({
        employer_id: employeeId,
        year,
        total_credits: 10,
        used_credits: 0,
        remaining_credits: 10,
        note: "No row yet — defaults shown until first leave approval or reset.",
      });
    }

    return NextResponse.json({
      employer_id: employeeId,
      year: row.year,
      total_credits: Number(row.total_credits),
      used_credits: Number(row.used_credits),
      remaining_credits: Number(row.remaining_credits),
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
