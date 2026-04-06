import { NextResponse } from "next/server";
import { createSupabaseServer } from "../../../utils/supabase/server";

// GET ALL (SSR)
export async function GET() {
  const supabase = await createSupabaseServer();

  const { data, error } = await supabase
    .from("employer_registration")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// CREATE
export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServer();

    const body = await req.json();

    // Check for descriptor
    if (!body.descriptor) {
      console.log("Missing descriptor field");
      return NextResponse.json(
        {
          error: "Face descriptor is required",
          receivedBody: body,
          hint: "Add 'descriptor' field to your request",
        },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("employer_registration")
      .insert({
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
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data[0] });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 },
    );
  }
}
