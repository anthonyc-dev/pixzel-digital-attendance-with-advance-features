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

  if (body.descriptor === undefined) {
    return NextResponse.json(
      { error: "Face descriptor is required for registration" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("employer_registration")
    .update({
      employer_id: body.employer_id,
      employer_name: body.employer_name,
      employer_position: body.employer_position,
      face_detected: body.face_detected,
      status: body.status,
      contact_no: body.contact_no,
      email: body.email,
      address: body.address,
      gender: body.gender,
      birth_day: body.birth_day,
      base_salary: body.base_salary,
      image: body.image,
      descriptor: body.descriptor,
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
