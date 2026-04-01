import { NextResponse } from "next/server";
import { createSupabaseServer } from "../../../../utils/supabase/server";

// UPDATE
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createSupabaseServer();
  const { id } = await params;

  const body = await req.json();

  const { data, error } = await supabase
    .from("employer_registration")
    .update({
      employer_id: body.employer_id,
      employer_name: body.employer_name,
      employer_position: body.employer_position,
      face_detected: body.face_detected,
      status: body.status,
      image: body.image,
    })
    .eq("id", id)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data[0]);
}

// DELETE
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createSupabaseServer();
  const { id } = await params;

  const { error } = await supabase
    .from("employer_registration")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
