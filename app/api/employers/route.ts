import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('employer_registration')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase GET error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const totalCount = data?.length || 0;

    return NextResponse.json({
      success: true,
      data: data,
      count: totalCount
    }, { status: 200 });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
