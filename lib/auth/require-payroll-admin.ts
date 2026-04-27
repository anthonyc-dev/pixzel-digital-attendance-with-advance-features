import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { isPayrollAdminUser } from "./jwt-roles";
import { CUSTOM_SESSION_COOKIE, verifySessionToken } from "./custom-session";

/**
 * Guards API routes that use payroll-domain tables (RLS: public.is_payroll_admin()).
 * Must match JWT `app_metadata.role` / `app_metadata.roles` used in Postgres.
 */
export async function requirePayrollAdmin(
  supabase: SupabaseClient,
): Promise<{ user: User | null; response: null } | { user: null; response: NextResponse }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && isPayrollAdminUser(user)) {
    return { user, response: null };
  }

  const customSessionToken = (await cookies()).get(CUSTOM_SESSION_COOKIE)?.value;
  const customSession = verifySessionToken(customSessionToken);
  if (customSession?.role === "admin") {
    return { user, response: null };
  }

  if (!user) {
    return {
      user: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return {
    user: null,
    response: NextResponse.json(
      {
        error:
          "Forbidden: payroll access requires app_metadata.role (or roles[]) of admin, payroll_admin, or payroll_manager, or an active custom admin session",
      },
      { status: 403 },
    ),
  };
}
