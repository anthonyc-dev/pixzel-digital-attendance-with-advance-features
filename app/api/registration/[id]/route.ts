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

  // Cascade delete all related records first to avoid FK constraint violations

  const { error: attendanceError } = await supabase
    .from("attendance_logs")
    .delete()
    .eq("employer_registration_id", id);

  if (attendanceError) {
    console.error("Failed to delete attendance logs:", attendanceError.message);
    return NextResponse.json({ error: `Failed to delete related attendance records: ${attendanceError.message}` }, { status: 500 });
  }

  const { error: dtrError } = await supabase
    .from("dtr_records")
    .delete()
    .eq("employer_registration_id", id);

  if (dtrError) {
    console.error("Failed to delete DTR records:", dtrError.message);
    return NextResponse.json({ error: `Failed to delete related DTR records: ${dtrError.message}` }, { status: 500 });
  }

  const { error: payrollError } = await supabase
    .from("payroll_records")
    .delete()
    .eq("employer_registration_id", id);

  if (payrollError) {
    console.error("Failed to delete payroll records:", payrollError.message);
    return NextResponse.json({ error: `Failed to delete related payroll records: ${payrollError.message}` }, { status: 500 });
  }

  const { error: leaveError } = await supabase
    .from("leave_requests")
    .delete()
    .eq("employer_registration_id", id);

  if (leaveError) {
    console.error("Failed to delete leave records:", leaveError.message);
    return NextResponse.json({ error: `Failed to delete related leave records: ${leaveError.message}` }, { status: 500 });
  }

  // Now delete the employer itself
  const { error } = await supabase
    .from("employer_registration")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Failed to delete employer:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
