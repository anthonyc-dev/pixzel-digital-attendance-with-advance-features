import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/utils/supabase/server";
import { generatePayslipHtml } from "@/emails/PayslipEmail";
import { sendMail } from "@/lib/email/mailer";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServer();
    const body = await req.json();
    const { payroll_id, send_all } = body;

    if (!payroll_id && !send_all) {
      return NextResponse.json(
        { error: "payroll_id or send_all is required" },
        { status: 400 }
      );
    }

    let query = supabase
      .from("payroll_records")
      .select(`
        *,
        employer_registration (
          employer_email,
          employer_name,
          employer_position
        )
      `);

    if (payroll_id) {
      query = query.eq("id", payroll_id);
    }

    const { data: payrollRecords, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!payrollRecords || payrollRecords.length === 0) {
      return NextResponse.json(
        { error: "No payroll records found" },
        { status: 404 }
      );
    }

    const results: Array<{
      employee: string;
      email: string;
      status: string;
      message?: string;
    }> = [];

    for (const record of payrollRecords) {
      const employer = record.employer_registration;
      const email = employer?.employer_email;
      const employeeName = record.full_name || employer?.employer_name || "Employee";
      const position = record.position || employer?.employer_position || "";

      if (!email) {
        results.push({
          employee: employeeName,
          email: email || "N/A",
          status: "failed",
          message: "No email address found",
        });
        continue;
      }

      const pdfBuffer = generatePayslipPdf(record);

      const html = await generatePayslipHtml({
        employeeName,
        payPeriod: record.period || "Current Period",
        netSalary: record.net_pay?.toFixed(2) || "0.00",
        baseSalary: record.base_salary?.toFixed(2) || "0.00",
        grossPay: record.gross_pay?.toFixed(2) || "0.00",
        totalDeductions: record.total_deduction?.toFixed(2) || "0.00",
        position,
      });

      const success = await sendMail({
        to: email,
        subject: `Payslip - ${record.period || "Current Period"}`,
        html,
        attachments: [
          {
            filename: `payslip_${employeeName.replace(/\s+/g, "_")}.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      });

      results.push({
        employee: employeeName,
        email,
        status: success ? "sent" : "failed",
        message: success ? "Email sent successfully" : "Failed to send email",
      });
    }

    const successCount = results.filter((r) => r.status === "sent").length;
    const failedCount = results.filter((r) => r.status === "failed").length;

    return NextResponse.json({
      message: `Sent ${successCount} emails, ${failedCount} failed`,
      results,
    });
  } catch (err: unknown) {
    console.error("Send payslip email error:", err);
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 }
    );
  }
}

function generatePayslipPdf(record: Record<string, unknown>): Buffer {
  const doc = new jsPDF();
  
  const employeeName = String(record.full_name || "Employee");
  const position = String(record.position || "");
  const period = String(record.period || "Current Period");
  const baseSalary = Number(record.base_salary || 0);
  const grossPay = Number(record.gross_pay || 0);
  const netPay = Number(record.net_pay || 0);
  const totalDeduction = Number(record.total_deduction || 0);
  const lateCount = Number(record.late_count || 0);
  const absentCount = Number(record.absent_count || 0);

  doc.setFontSize(20);
  doc.text("PAYSLIP", 105, 20, { align: "center" });

  doc.setFontSize(12);
  doc.text(`Pay Period: ${period}`, 14, 35);
  doc.text(`Employee: ${employeeName}`, 14, 42);
  doc.text(`Position: ${position}`, 14, 49);

  autoTable(doc, {
    startY: 60,
    head: [["Description", "Amount"]],
    body: [
      ["Base Salary", `₱${baseSalary.toFixed(2)}`],
      ["Gross Pay", `₱${grossPay.toFixed(2)}`],
      ["Total Deductions", `₱${totalDeduction.toFixed(2)}`],
      ["Late Count", lateCount.toString()],
      ["Absent Count", absentCount.toString()],
    ],
    foot: [["Net Pay", `₱${netPay.toFixed(2)}`]],
    theme: "striped",
    headStyles: { fillColor: [41, 128, 185] },
    footStyles: { fillColor: [39, 174, 96], textColor: 255 },
  });

  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  return pdfBuffer;
}