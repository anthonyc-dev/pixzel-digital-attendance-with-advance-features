import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/utils/supabase/server';

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

    const { late_deduction, absent_deduction } = body;

    if (late_deduction === undefined || absent_deduction === undefined) {
      return NextResponse.json({ error: 'Missing late_deduction or absent_deduction' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('payroll_deduction_settings')
      .insert({
        late_deduction: parseFloat(late_deduction),
        absent_deduction: parseFloat(absent_deduction),
      })
      .select()
      .single();

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
