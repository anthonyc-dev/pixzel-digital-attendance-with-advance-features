import { NextResponse } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { isPayrollAdminUser } from "./jwt-roles";

/**
 * Guards API routes that use payroll-domain tables (RLS: public.is_payroll_admin()).
 * Must match JWT `app_metadata.role` / `app_metadata.roles` used in Postgres.
 */
export async function requirePayrollAdmin(
  supabase: SupabaseClient,
): Promise<{ user: User; response: null } | { user: null; response: NextResponse }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (!isPayrollAdminUser(user)) {
    return {
      user: null,
      response: NextResponse.json(
        {
          error:
            "Forbidden: payroll access requires app_metadata.role (or roles[]) of admin, payroll_admin, or payroll_manager",
        },
        { status: 403 },
      ),
    };
  }

  return { user, response: null };
}
