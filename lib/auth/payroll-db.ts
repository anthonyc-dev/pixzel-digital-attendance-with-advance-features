import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServiceRole } from "@/utils/supabase/service-role";

/**
 * DB client for payroll routes after requirePayrollAdmin passes.
 * Uses service_role so RLS sees elevated access; authorization is enforced in API via session + app_metadata.
 * Avoids stale user JWT (metadata updated in dashboard but cookie token not refreshed yet).
 */
export function payrollAdminDb():
  | { client: SupabaseClient; error: null }
  | { client: null; error: NextResponse } {
  try {
    return { client: createSupabaseServiceRole(), error: null };
  } catch {
    return {
      client: null,
      error: NextResponse.json(
        {
          error:
            "Server missing SUPABASE_SERVICE_ROLE_KEY, or sign out and sign in so your session JWT includes app_metadata.role",
        },
        { status: 503 },
      ),
    };
  }
}
