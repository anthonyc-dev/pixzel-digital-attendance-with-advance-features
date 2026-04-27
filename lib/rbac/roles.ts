import type { User } from "@supabase/supabase-js";
import {
  EMPLOYEE_ROLE,
  hasAppRole,
  isEmployeeUser,
  isPayrollAdminUser,
  PAYROLL_ADMIN_ROLES,
} from "@/lib/auth/jwt-roles";

export { EMPLOYEE_ROLE, hasAppRole, isEmployeeUser, isPayrollAdminUser, PAYROLL_ADMIN_ROLES };

/** Alias for middleware / UI — same as payroll JWT staff roles. */
export const isPayrollStaffUser = isPayrollAdminUser;
export const isEmployeeRoleUser = isEmployeeUser;
export const PAYROLL_STAFF_ROLES = PAYROLL_ADMIN_ROLES;

export function getJwtAppRole(user: User | null): string {
  const m = user?.app_metadata;
  if (!m || typeof m !== "object") return "";
  const raw = (m as { role?: unknown }).role;
  return typeof raw === "string" ? raw.trim().toLowerCase() : "";
}

export function hasAppRoleInMetadata(user: User | null, role: string): boolean {
  return hasAppRole(user, role);
}

/**
 * After login, where to send the user. Staff roles win over `employee` if both are set.
 */
export function defaultPostLoginPath(user: User | null): "/admin/adminDashboard" | "/employee/employeeDashboard" {
  if (isPayrollAdminUser(user)) return "/admin/adminDashboard";
  if (isEmployeeUser(user)) return "/employee/employeeDashboard";
  return "/admin/adminDashboard";
}
