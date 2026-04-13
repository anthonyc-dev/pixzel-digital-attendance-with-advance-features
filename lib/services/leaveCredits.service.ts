/**
 * Leave credits + approval orchestration (NestJS-style service layer for this Next.js app).
 * DB RPC `approve_leave_request_with_credits` enforces non-negative credits atomically.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  maybeCreateLatePaidLeaveAdjustment,
  type LeaveRowForAdjustment,
} from "@/lib/payroll/latePaidLeaveAdjustment";

export type ApproveLeaveRpcResult = {
  ok: boolean;
  error?: string;
  status?: string;
  leave_payment_kind?: string;
  credits_consumed?: number;
  note?: string;
  consumes_credits?: boolean;
};

export async function approveLeaveRequest(
  supabase: SupabaseClient,
  leaveId: number,
): Promise<{ result: ApproveLeaveRpcResult; leaveRow: LeaveRowForAdjustment | null }> {
  const { data: rpcData, error: rpcError } = await supabase.rpc("approve_leave_request_with_credits", {
    p_leave_id: leaveId,
  });

  if (rpcError) {
    return {
      result: { ok: false, error: rpcError.message },
      leaveRow: null,
    };
  }

  const result = rpcData as ApproveLeaveRpcResult;

  const { data: leaveRow } = await supabase
    .from("leave_requests")
    .select(
      "id, employer_registration_id, start_date, end_date, duration, approved_at, leave_payment_kind, payroll_adjustment_created",
    )
    .eq("id", leaveId)
    .maybeSingle();

  if (result.ok && leaveRow) {
    await maybeCreateLatePaidLeaveAdjustment(supabase, leaveRow as LeaveRowForAdjustment);
  }

  return { result, leaveRow: (leaveRow as LeaveRowForAdjustment | null) ?? null };
}

export async function rejectLeaveRequest(supabase: SupabaseClient, leaveId: number) {
  const { data: existing } = await supabase
    .from("leave_requests")
    .select("id, status")
    .eq("id", leaveId)
    .maybeSingle();

  if (!existing) return { ok: false as const, error: "not_found" as const };
  if (existing.status !== "pending") return { ok: false as const, error: "already_resolved" as const };

  const { error } = await supabase
    .from("leave_requests")
    .update({ status: "rejected" })
    .eq("id", leaveId)
    .eq("status", "pending");

  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}
