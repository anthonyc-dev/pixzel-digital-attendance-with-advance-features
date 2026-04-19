/**
 * One-off: set app_metadata.role for payroll admin access (matches RLS + API guards).
 *
 * Usage (from project root):
 *   1. Put NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in `.env` or `.env.local`.
 *      (`.env.local` is loaded first if present; otherwise `.env` is used.)
 *   2. npm run set-payroll-admin -- your@email.com
 *
 * Or PowerShell (no .env file):
 *   $env:NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
 *   $env:SUPABASE_SERVICE_ROLE_KEY="eyJ..."
 *   node scripts/set-payroll-admin-role.mjs your@email.com
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY (never commit). Do not expose in client code.
 */

import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

function loadDotenvFile(name) {
  const p = resolve(process.cwd(), name);
  if (!existsSync(p)) return;
  const raw = readFileSync(p, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadDotenvFile(".env.local");
loadDotenvFile(".env");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const emailArg = process.argv[2]?.trim().toLowerCase();
const role = (process.argv[3] || "admin").trim().toLowerCase();

const allowed = ["admin", "payroll_admin", "payroll_manager"];
if (!allowed.includes(role)) {
  console.error(`Role must be one of: ${allowed.join(", ")}`);
  process.exit(1);
}

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  console.error("Add them to `.env` or `.env.local` (see .env.example), or set those env vars in your shell.");
  process.exit(1);
}

if (!emailArg || !emailArg.includes("@")) {
  console.error("Usage: node scripts/set-payroll-admin-role.mjs <email> [admin|payroll_admin|payroll_manager]");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserByEmail(targetEmail) {
  let page = 1;
  const perPage = 1000;
  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const users = data?.users ?? [];
    const hit = users.find((u) => (u.email || "").toLowerCase() === targetEmail);
    if (hit) return hit;
    if (users.length < perPage) return null;
    page += 1;
  }
}

async function main() {
  const user = await findUserByEmail(emailArg);
  if (!user) {
    console.error(`No user found with email: ${emailArg}`);
    process.exit(1);
  }

  const existing = user.app_metadata && typeof user.app_metadata === "object"
    ? user.app_metadata
    : {};

  const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
    app_metadata: {
      ...existing,
      role,
    },
  });

  if (error) {
    console.error(error.message);
    process.exit(1);
  }

  console.log("Updated user:", data.user?.email);
  console.log("app_metadata:", data.user?.app_metadata);
  console.log("\nAsk this user to sign out and sign back in so the JWT includes the new role.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
