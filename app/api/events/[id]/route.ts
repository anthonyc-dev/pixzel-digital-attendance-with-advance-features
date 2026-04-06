import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/utils/supabase/server";
import { eachDayOfInterval, format, parseISO } from "date-fns";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createSupabaseServer();

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServer();
    const body = await req.json();

    const { description, type, title, start_date, end_date } = body;

    // Fetch old event info to clean up
    const { data: oldEvent } = await supabase
      .from("events")
      .select("title")
      .eq("id", id)
      .single();

    const { data, error } = await supabase
      .from("events")
      .update({
        description,
        type,
        title,
        start_date,
        end_date,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // --- AUTOMATIC SYNC UPDATE ---
    try {
      // 1. Delete old ones from BOTH tables using old title
      if (oldEvent) {
        await supabase
          .from("attendance_logs")
          .delete()
          .eq("remarks", oldEvent.title)
          .in("status", ["holiday", "event"]);

        await supabase
          .from("dtr_records")
          .delete()
          .eq("excuse", oldEvent.title)
          .eq("status", "active");
      }

      // 2. Fetch all employees with required fields for dtr_records
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
              status: 'active',
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
      console.error("PUT Sync Err:", syncErr);
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServer();

    // Fetch event before deleting to clean up logs
    const { data: event } = await supabase
      .from("events")
      .select("title")
      .eq("id", id)
      .single();

    const { error } = await supabase.from("events").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Clean up associated logs in BOTH tables
    if (event) {
      await supabase
        .from("attendance_logs")
        .delete()
        .eq("remarks", event.title)
        .in("status", ["holiday", "event"]);

      await supabase
        .from("dtr_records")
        .delete()
        .eq("excuse", event.title)
        .eq("status", "active");
    }

    return NextResponse.json({ message: "Event deleted successfully" });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
