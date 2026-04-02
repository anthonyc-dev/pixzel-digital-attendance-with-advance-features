import { NextResponse } from "next/server";
import { createSupabaseServer } from "../../../utils/supabase/server";

// GET ALL (SSR)
export async function GET() {
  const supabase = await createSupabaseServer();

  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// CREATE
export async function POST(req: Request) {
  const supabase = await createSupabaseServer();

  const body = await req.json();

  const { data, error } = await supabase
    .from("attendance")
    .insert({
      employer_id: body.employer_id,
      employer_name: body.employer_name,
      employer_position: body.employer_position,
      face_detected: body.face_detected,
      status: body.status,
      image: body.image,
    })
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data[0]);
}