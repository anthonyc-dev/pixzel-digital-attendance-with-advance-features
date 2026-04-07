import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/utils/supabase/server";
import { sendMail } from "@/lib/email/mailer";
import { generatePayslipHtml } from "@/emails/PayslipEmail";

const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3";

interface CalendarEvent {
  summary: string;
  description: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{ method: string; minutes: number }>;
  };
}

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServer();
    const body = await req.json();
    const { date } = body;

    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: employees, error: empError } = await supabase
      .from("employer_registration")
      .select("id, employer_id, employer_name, employer_email, employer_position");

    if (empError) {
      return NextResponse.json({ error: empError.message }, { status: 500 });
    }

    const { data: attendanceLogs, error: logError } = await supabase
      .from("attendance_logs")
      .select("employer_registration_id, type, timestamp")
      .gte("timestamp", targetDate.toISOString())
      .lte("timestamp", endOfDay.toISOString())
      .eq("type", "time_in");

    if (logError) {
      return NextResponse.json({ error: logError.message }, { status: 500 });
    }

    const timeInIds = new Set(
      attendanceLogs?.map((log) => log.employer_registration_id) || []
    );

    const absentEmployees = employees?.filter(
      (emp) => !timeInIds.has(emp.id)
    ) || [];

    if (absentEmployees.length === 0) {
      return NextResponse.json({
        message: "No absent employees found",
        results: [],
      });
    }

    const results: Array<{
      employee: string;
      email: string;
      status: string;
      calendarEventId?: string;
      message?: string;
    }> = [];

    const calendarAccessToken = process.env.GOOGLE_CALENDAR_ACCESS_TOKEN;

    for (const employee of absentEmployees) {
      if (!employee.employer_email) {
        results.push({
          employee: employee.employer_name,
          email: "N/A",
          status: "failed",
          message: "No email address found",
        });
        continue;
      }

      const html = await generatePayslipHtml({
        employeeName: employee.employer_name,
        payPeriod: targetDate.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        netSalary: "0.00",
        baseSalary: "0.00",
        grossPay: "0.00",
        totalDeductions: "0.00",
        position: employee.employer_position || "",
      });

      const emailSent = await sendMail({
        to: employee.employer_email,
        subject: `Reminder: Please Time In - ${targetDate.toLocaleDateString()}`,
        html,
      });

      let calendarEventId: string | undefined;

      if (calendarAccessToken) {
        const reminderTime = new Date(targetDate);
        reminderTime.setHours(9, 0, 0, 0);

        const event: CalendarEvent = {
          summary: `Attendance Reminder - ${employee.employer_name}`,
          description: `Reminder for ${employee.employer_name} to time in. This is an automated reminder because no time-in was recorded for today.`,
          start: {
            dateTime: reminderTime.toISOString(),
            timeZone: "Asia/Manila",
          },
          end: {
            dateTime: new Date(reminderTime.getTime() + 30 * 60 * 1000).toISOString(),
            timeZone: "Asia/Manila",
          },
          reminders: {
            useDefault: false,
            overrides: [
              { method: "email", minutes: 0 },
              { method: "popup", minutes: 15 },
            ],
          },
        };

        try {
          const calendarResponse = await fetch(
            `${GOOGLE_CALENDAR_API}/calendars/primary/events`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${calendarAccessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(event),
            }
          );

          if (calendarResponse.ok) {
            const calendarData = await calendarResponse.json();
            calendarEventId = calendarData.id;
          }
        } catch (calendarError) {
          console.error("Calendar API error:", calendarError);
        }
      }

      results.push({
        employee: employee.employer_name,
        email: employee.employer_email,
        status: emailSent ? "sent" : "failed",
        calendarEventId,
        message: emailSent ? "Reminder sent" : "Failed to send reminder",
      });
    }

    const successCount = results.filter((r) => r.status === "sent").length;

    return NextResponse.json({
      message: `Sent ${successCount} reminders`,
      results,
    });
  } catch (err: unknown) {
    console.error("Attendance reminder error:", err);
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "POST to send reminders, GET to view instructions",
    usage: {
      send_reminders: "POST /api/attendance/reminder with { date: '2024-01-15' }",
    },
  });
}