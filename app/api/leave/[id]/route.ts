import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/utils/supabase/server";
import { approveLeaveRequest, rejectLeaveRequest } from "@/lib/services/leaveCredits.service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServer();

    const { data, error } = await supabase
      .from("leave_requests")
      .select(`
        *,
        employer_registration (
          id,
          employer_id,
          employer_name,
          employer_position,
          image
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({
      id: data.id,
      employee_name: data.employer_registration?.employer_name || "Unknown",
      employer_id: data.employer_registration?.employer_id,
      leave_type: data.leave_type,
      reason: data.reason,
      start_date: data.start_date,
      end_date: data.end_date,
      created_at: data.created_at,
      image: data.employer_registration?.image,
      status: data.status,
      duration: data.duration ?? "FULL_DAY",
      leave_payment_kind: data.leave_payment_kind ?? null,
      approved_at: data.approved_at ?? null,
      credits_consumed: data.credits_consumed ?? 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch leave request", details: String(error) },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const leaveId = Number.parseInt(id, 10);
    if (Number.isNaN(leaveId)) {
      return NextResponse.json({ error: "Invalid leave id" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body?.action as string | undefined;
    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ error: "action must be approve or reject" }, { status: 400 });
    }

    const supabase = await createSupabaseServer();

    if (action === "reject") {
      const out = await rejectLeaveRequest(supabase, leaveId);
      if (!out.ok) {
        const status = out.error === "not_found" ? 404 : 409;
        return NextResponse.json({ error: out.error }, { status });
      }
      return NextResponse.json({ success: true, status: "rejected" });
    }

    const { result, leaveRow } = await approveLeaveRequest(supabase, leaveId);
    if (!result.ok) {
      if (result.error === "not_found") {
        return NextResponse.json({ error: result.error }, { status: 404 });
      }
      if (result.error === "already_resolved") {
        return NextResponse.json({ error: result.error, status: result.status }, { status: 409 });
      }
      return NextResponse.json({ error: result.error ?? "approve_failed" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      leave_payment_kind: result.leave_payment_kind,
      credits_consumed: result.credits_consumed,
      note: result.note ?? null,
      leave: leaveRow,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update leave request", details: String(error) },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServer();

    const { error } = await supabase
      .from("leave_requests")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete leave request", details: String(error) },
      { status: 500 }
    );
  }
}
