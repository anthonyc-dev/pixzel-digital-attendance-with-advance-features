import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/utils/supabase/server';

/** GET /api/deduction-settings/history — returns all rules ordered newest first */
export async function GET() {
  const supabase = await createSupabaseServer();

  const { data, error } = await supabase
    .from('payroll_deduction_settings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
