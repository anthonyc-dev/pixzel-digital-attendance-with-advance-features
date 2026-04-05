import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/utils/supabase/server";
import { eachDayOfInterval, format, parseISO } from "date-fns";

export async function GET() {
  const supabase = await createSupabaseServer();

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServer();
    const body = await req.json();

    const { description, type, title, start_date, end_date } = body;

    if (!start_date || !end_date || !title) {
      return NextResponse.json(
        { error: "start_date, end_date and title are required" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("events")
      .insert({
        description,
        type,
        title,
        start_date,
        end_date,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // --- AUTOMATIC SYNC TO ATTENDANCE LOGS AND DTR RECORDS ---
    try {
      // Fetch all employees with required fields for dtr_records
      const { data: employees } = await supabase
        .from("employer_registration")
        .select("id, employer_id, employer_name, employer_position, department");
      
      if (employees && employees.length > 0) {
        const start = parseISO(start_date);
        const end = parseISO(end_date);
        const days = eachDayOfInterval({ start, end });
        
        const syncLogs = [];
        const syncDtr = [];
        
        for (const day of days) {
          const dateStr = format(day, 'yyyy-MM-dd');
          for (const emp of employees) {
            // Raw Attendance Logs
            syncLogs.push({
              employer_registration_id: emp.id,
              type: type === 'holiday' ? 'holiday' : 'event',
              status: type === 'holiday' ? 'holiday' : 'event',
              timestamp: `${dateStr}T00:00:00+08:00`,
              remarks: title
            });

            // Consolidated DTR Records
            syncDtr.push({
              employer_registration_id: emp.id,
              employer_id: emp.employer_id,
              employer_name: emp.employer_name,
              employer_position: emp.employer_position,
              department: emp.department,
              date: dateStr,
              status: 'active', // Based on the check constraint IN ('active', 'inactive')
              excuse: title,
              total_hours: 0,
              overtime_minutes: 0,
              is_late: false
            });
          }
        }

        if (syncLogs.length > 0) {
          await supabase.from("attendance_logs").insert(syncLogs);
        }
        if (syncDtr.length > 0) {
          await supabase.from("dtr_records").insert(syncDtr);
        }
      }
    } catch (syncErr) {
      console.error("Failed to sync event to database tables:", syncErr);
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
