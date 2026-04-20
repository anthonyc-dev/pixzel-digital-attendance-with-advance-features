import type { User } from "@supabase/supabase-js";

/** Matches SQL `public.is_payroll_admin()` app_metadata checks. */
export const PAYROLL_ADMIN_ROLES = [
  "admin",
  "payroll_admin",
  "payroll_manager",
] as const;

export const EMPLOYEE_ROLE = "employee" as const;

type AppMetadata = {
  role?: string;
  roles?: string[];
};

function getAppMetadata(user: User | null): AppMetadata {
  const m = user?.app_metadata;
  if (!m || typeof m !== "object") return {};
  return m as AppMetadata;
}

/** Case-insensitive: `app_metadata.role` or membership in `app_metadata.roles`. */
export function hasAppRole(
  user: User | null,
  role: string,
): boolean {
  if (!user || !role.trim()) return false;
  const want = role.trim().toLowerCase();
  const { role: single, roles } = getAppMetadata(user);
  if (single && single.trim().toLowerCase() === want) return true;
  if (Array.isArray(roles)) {
    return roles.some((r) => String(r).trim().toLowerCase() === want);
  }
  return false;
}

/** Aligns with DB `public.is_payroll_admin()` for API route guards. */
export function isPayrollAdminUser(user: User | null): boolean {
  if (!user) return false;
  return PAYROLL_ADMIN_ROLES.some((r) => hasAppRole(user, r));
}

export function isEmployeeUser(user: User | null): boolean {
  return hasAppRole(user, EMPLOYEE_ROLE);
}
