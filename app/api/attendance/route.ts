import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: insertedData, error } = await supabase
      .from("employer_registration")
      .insert([
        {
          employer_id: data.employer_id,
          employer_name: data.employer_name,
          employer_position: data.employer_position,
          face_detected: data.face_detected,
          status: data.status,
          image: data.image,
        },
      ])
      .select();

    if (error) {
      console.error("Supabase Insert Error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log("Attendance recorded in Supabase:", insertedData);

    return NextResponse.json(
      {
        message: "Attendance recorded successfully",
        data: insertedData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Internal Server Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
