import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/utils/supabase/server';

function hasMissingComputationColumnError(error: unknown) {
  if (!error || typeof error !== 'object') return false;
  const e = error as { code?: string; message?: string };
  const msg = String(e.message ?? '').toLowerCase();
  return (
    e.code === '42703' ||
    e.code === 'PGRST204' ||
    msg.includes('break_allowed_minutes') ||
    msg.includes('standard_work_minutes') ||
    msg.includes('late_grace_minutes') ||
    msg.includes('overtime_multiplier')
  );
}

/** GET /api/deduction-settings — returns the latest deduction rule */
export async function GET() {
  const supabase = await createSupabaseServer();

  const { data, error } = await supabase
    .from('payroll_deduction_settings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

/** POST /api/deduction-settings — insert a new rule (keeps history) */
export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServer();
    const body = await req.json();

    const {
      late_deduction,
      absent_deduction,
      late_grace_minutes,
      standard_work_minutes,
      break_allowed_minutes,
      overtime_multiplier,
    } = body;

    // Support partial updates from frontend; backend resolves effective values.
    const { data: latest } = await supabase
      .from('payroll_deduction_settings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const resolvedLateDeduction = parseFloat(
      String(
        late_deduction ??
          latest?.late_deduction ??
          50,
      ),
    );
    const resolvedAbsentDeduction = parseFloat(
      String(
        absent_deduction ??
          latest?.absent_deduction ??
          100,
      ),
    );

    let { data, error } = await supabase
      .from('payroll_deduction_settings')
      .insert({
        late_deduction: resolvedLateDeduction,
        absent_deduction: resolvedAbsentDeduction,
        late_grace_minutes:
          late_grace_minutes === undefined
            ? Number(latest?.late_grace_minutes ?? 5)
            : parseInt(String(late_grace_minutes), 10),
        standard_work_minutes:
          standard_work_minutes === undefined
            ? Number(latest?.standard_work_minutes ?? 480)
            : parseInt(String(standard_work_minutes), 10),
        break_allowed_minutes:
          break_allowed_minutes === undefined
            ? Number(latest?.break_allowed_minutes ?? 60)
            : parseInt(String(break_allowed_minutes), 10),
        overtime_multiplier:
          overtime_multiplier === undefined
            ? Number(latest?.overtime_multiplier ?? 1.25)
            : parseFloat(String(overtime_multiplier)),
      })
      .select()
      .single();

    // Backward compatibility if new computation columns are not migrated yet.
    if (error && hasMissingComputationColumnError(error)) {
      ({ data, error } = await supabase
        .from('payroll_deduction_settings')
        .insert({
          late_deduction: resolvedLateDeduction,
          absent_deduction: resolvedAbsentDeduction,
        })
        .select()
        .single());
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
  }
}
