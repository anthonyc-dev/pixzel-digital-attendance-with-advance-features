import { NextResponse } from "next/server";
import { createSupabaseServer } from "../../../../utils/supabase/server";

// UPDATE
export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  const supabase = await createSupabaseServer();

  const body = await req.json();

  const { data, error } = await supabase
    .from("attendance")
    .update({
      employer_id: body.employer_id,
      employer_name: body.employer_name,
      employer_position: body.employer_position,
      face_detected: body.face_detected,
      status: body.status,
      image: body.image,
    })
    .eq("id", params.id)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data[0]);
}

// DELETE
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  const supabase = await createSupabaseServer();

  const { error } = await supabase
    .from("attendance")
    .delete()
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// import { createSupabaseServer } from '@/lib/supabase-server';

// export default async function AttendancePage() {
//   const supabase = await createSupabaseServer();

//   const { data } = await supabase.from('attendance').select('*');

//   return (
//     <div>
//       <h1>Attendance</h1>

//       {data?.map((item) => (
//         <div key={item.id}>
//           <p>{item.employer_name}</p>
//           <p>{item.status}</p>
//         </div>
//       ))}
//     </div>
//   );
// }
// await fetch('/api/attendance', {
//     method: 'POST',
//     body: JSON.stringify({
//       employer_id: 'EMP001',
//       employer_name: 'John Doe',
//       employer_position: 'Developer',
//       face_detected: true,
//       status: 'present',
//       image: 'https://...'
//     }),
//   });
