import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/utils/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServer();

    const { data, error } = await supabase
      .from("leave_requests")
      .select(`
        *,
        employer_registration (
          id,
          employer_id,
          employer_name,
          employer_position,
          image
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({
      id: data.id,
      employee_name: data.employer_registration?.employer_name || "Unknown",
      employer_id: data.employer_registration?.employer_id,
      leave_type: data.leave_type,
      reason: data.reason,
      start_date: data.start_date,
      end_date: data.end_date,
      created_at: data.created_at,
      image: data.employer_registration?.image,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch leave request", details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServer();

    const { error } = await supabase
      .from("leave_requests")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete leave request", details: String(error) },
      { status: 500 }
    );
  }
}
