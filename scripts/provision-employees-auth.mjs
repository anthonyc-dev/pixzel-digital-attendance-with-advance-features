/**
 * Bulk provision auth accounts for existing employees.
 *
 * What it does (for each matched employee row):
 *  - picks a login email (existing valid email, or optional placeholder)
 *  - creates/fetches Supabase Auth user
 *  - sets app_metadata.role (default: employee)
 *  - links employer_registration.auth_user_id to auth.users.id
 *  - optionally upserts login_identities(username=employer_id, email=loginEmail)
 *
 * Usage:
 *   npm run provision-employees-auth -- --dry-run
 *   npm run provision-employees-auth -- --status=active --limit=200
 *   npm run provision-employees-auth -- --allow-placeholder --placeholder-domain=internal.local
 *   npm run provision-employees-auth -- --send-invite
 */

import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { randomBytes } from "crypto";
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
    // For this provisioning script, .env values should win over stale terminal env vars.
    process.env[key] = val;
  }
}

function parseArgs(argv) {
  const out = {
    dryRun: false,
    status: "active",
    limit: 0,
    role: "employee",
    allowPlaceholder: false,
    placeholderDomain: "internal.local",
    sendInvite: false,
    includeLinked: false,
    syncLoginIdentities: true,
    debug: false,
    redirectTo: "",
    printTempPasswords: false,
  };

  for (const raw of argv) {
    const arg = String(raw || "").trim();
    if (!arg) continue;
    if (arg === "--dry-run") out.dryRun = true;
    else if (arg === "--allow-placeholder") out.allowPlaceholder = true;
    else if (arg === "--send-invite") out.sendInvite = true;
    else if (arg === "--include-linked") out.includeLinked = true;
    else if (arg === "--no-login-identities") out.syncLoginIdentities = false;
    else if (arg === "--debug") out.debug = true;
    else if (arg === "--print-temp-passwords") out.printTempPasswords = true;
    else if (arg.startsWith("--status=")) out.status = arg.slice("--status=".length).trim();
    else if (arg.startsWith("--limit=")) out.limit = Number(arg.slice("--limit=".length).trim() || "0");
    else if (arg.startsWith("--role=")) out.role = arg.slice("--role=".length).trim().toLowerCase();
    else if (arg.startsWith("--redirect-to=")) out.redirectTo = arg.slice("--redirect-to=".length).trim();
    else if (arg.startsWith("--placeholder-domain=")) {
      out.placeholderDomain = arg.slice("--placeholder-domain=".length).trim().toLowerCase();
    }
  }

  if (!Number.isFinite(out.limit) || out.limit < 0) out.limit = 0;
  return out;
}

function isValidEmail(email) {
  if (!email) return false;
  const value = String(email).trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function toPlaceholderEmail(emp, domain) {
  const safeDomain = (domain || "internal.local").replace(/[^a-z0-9.-]/gi, "").toLowerCase();
  const rawCode = String(emp.employer_id ?? emp.id ?? "emp").toLowerCase();
  const safeCode = rawCode.replace(/[^a-z0-9._-]/gi, "_");
  return `${safeCode}@${safeDomain}`;
}

function randomTempPassword() {
  return `Tmp#${randomBytes(10).toString("hex")}!`;
}

function decodeJwtPayload(jwt) {
  try {
    const part = String(jwt || "").split(".")[1] || "";
    if (!part) return null;
    return JSON.parse(Buffer.from(part, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

async function listAllUsersByEmail(supabase) {
  const byEmail = new Map();
  let page = 1;
  const perPage = 1000;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(`listUsers failed: ${error.message}`);
    const users = data?.users ?? [];
    for (const u of users) {
      const email = String(u.email || "").trim().toLowerCase();
      if (email) byEmail.set(email, u);
    }
    if (users.length < perPage) break;
    page += 1;
  }
  return byEmail;
}

async function safeUpsertLoginIdentity(supabase, employerId, email) {
  const payload = {
    username: String(employerId),
    email: String(email).toLowerCase(),
  };
  const { error } = await supabase
    .from("login_identities")
    .upsert(payload, { onConflict: "username" });
  if (!error) return;
  // missing table/column/constraint: skip silently (backward compatible)
  if (["42P01", "42703", "42P10"].includes(String(error.code || ""))) return;
  throw error;
}

async function main() {
  loadDotenvFile(".env.local");
  loadDotenvFile(".env");

  const options = parseArgs(process.argv.slice(2));
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
    process.exit(1);
  }

  const allowedRoles = ["employee", "admin", "hr", "payroll_admin", "payroll_manager"];
  if (!allowedRoles.includes(options.role)) {
    console.error(`Invalid --role. Allowed: ${allowedRoles.join(", ")}`);
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const urlHost = new URL(url).host;
  const jwtPayload = decodeJwtPayload(serviceKey);
  const keyRole = jwtPayload?.role ?? "unknown";
  const keyIss = typeof jwtPayload?.iss === "string" ? jwtPayload.iss : "";
  const projectRefFromIss = keyIss.split("https://")[1]?.split(".supabase.co")[0] ?? "unknown";

  if (options.debug) {
    console.log("Debug info");
    console.log("----------");
    console.log(`Supabase URL host: ${urlHost}`);
    console.log(`Service key role: ${keyRole}`);
    console.log(`Service key project ref: ${projectRefFromIss}`);
    console.log(`Status filter: ${options.status || "<none>"}`);
    console.log(`Include linked: ${options.includeLinked ? "yes" : "no"}`);
  }

  const { count: totalCount, error: totalCountError } = await supabase
    .from("employer_registration")
    .select("*", { count: "exact", head: true });
  if (!totalCountError && options.debug) {
    console.log(`Total employer_registration rows visible to key: ${totalCount ?? 0}`);
  }

  let q = supabase
    .from("employer_registration")
    .select("id, employer_id, employer_name, email, status, auth_user_id")
    .order("id", { ascending: true });

  if (options.status) q = q.eq("status", options.status);
  if (!options.includeLinked) q = q.is("auth_user_id", null);
  if (options.limit > 0) q = q.limit(options.limit);

  const { data: employees, error: employeesError } = await q;
  if (employeesError) {
    const code = String(employeesError.code || "");
    const message = String(employeesError.message || "");
    const missingAuthUserId =
      code === "42703" ||
      message.toLowerCase().includes("auth_user_id") ||
      message.toLowerCase().includes("column employer_registration.auth_user_id does not exist");

    if (missingAuthUserId) {
      throw new Error(
        [
          "Your database is missing employer_registration.auth_user_id.",
          "Run the migration first: supabase/migrations/20260420120000_rbac_employee_link_leave_payroll.sql",
          "After migration, rerun:",
          "  npm run provision-employees-auth -- --dry-run",
        ].join("\n"),
      );
    }

    throw new Error(`Failed to load employees: ${employeesError.message}`);
  }

  if (!employees || employees.length === 0) {
    console.log("No employees matched filters.");
    console.log(`Tip: rerun with --debug and --status= to disable status filtering.`);
    return;
  }

  const existingUsersByEmail = await listAllUsersByEmail(supabase);
  let created = 0;
  let linked = 0;
  let skippedInvalidEmail = 0;
  let reusedExisting = 0;
  let identityUpserts = 0;
  const tempPasswords = [];
  const failed = [];

  for (const emp of employees) {
    const currentEmail = String(emp.email ?? "").trim().toLowerCase();
    const loginEmail = isValidEmail(currentEmail)
      ? currentEmail
      : options.allowPlaceholder
        ? toPlaceholderEmail(emp, options.placeholderDomain)
        : "";

    if (!loginEmail) {
      skippedInvalidEmail += 1;
      console.log(`SKIP ${emp.employer_id}: invalid/missing email and placeholders disabled`);
      continue;
    }

    try {
      let user = existingUsersByEmail.get(loginEmail);

      if (!user) {
        if (options.dryRun) {
          console.log(`DRY create auth user for ${emp.employer_id} (${loginEmail})`);
          user = { id: `dry-run-${emp.id}` };
        } else if (options.sendInvite) {
          const invited = await supabase.auth.admin.inviteUserByEmail(loginEmail, {
            data: { employer_id: emp.employer_id, employer_registration_id: emp.id },
            ...(options.redirectTo ? { redirectTo: options.redirectTo } : {}),
          });
          if (invited.error) throw new Error(invited.error.message);
          user = invited.data?.user ?? null;
        } else {
          const tempPassword = randomTempPassword();
          const createdUser = await supabase.auth.admin.createUser({
            email: loginEmail,
            password: tempPassword,
            email_confirm: true,
            app_metadata: { role: options.role },
            user_metadata: { employer_id: emp.employer_id, employer_registration_id: emp.id },
          });
          if (createdUser.error) throw new Error(createdUser.error.message);
          user = createdUser.data?.user ?? null;
          if (options.printTempPasswords) {
            tempPasswords.push({
              employer_id: String(emp.employer_id),
              email: loginEmail,
              tempPassword,
            });
          }
        }

        if (user) {
          created += 1;
          if (!options.dryRun) {
            existingUsersByEmail.set(loginEmail, user);
          }
        }
      } else {
        reusedExisting += 1;
      }

      if (!user) {
        throw new Error("Auth user object missing after create/invite");
      }

      if (!options.dryRun) {
        const existingMeta =
          user.app_metadata && typeof user.app_metadata === "object" ? user.app_metadata : {};
        const updateRole = await supabase.auth.admin.updateUserById(user.id, {
          app_metadata: { ...existingMeta, role: options.role },
        });
        if (updateRole.error) throw new Error(updateRole.error.message);

        const link = await supabase
          .from("employer_registration")
          .update({ auth_user_id: user.id })
          .eq("id", emp.id);
        if (link.error) throw new Error(link.error.message);

        if (options.syncLoginIdentities) {
          await safeUpsertLoginIdentity(supabase, emp.employer_id, loginEmail);
          identityUpserts += 1;
        }
      } else {
        console.log(`DRY link ${emp.employer_id} -> ${user.id}`);
      }

      linked += 1;
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      failed.push({ employer_id: emp.employer_id, message });
      console.error(`FAIL ${emp.employer_id}: ${message}`);
    }
  }

  console.log("\nProvisioning summary");
  console.log("--------------------");
  console.log(`Matched employees: ${employees.length}`);
  console.log(`Linked: ${linked}`);
  console.log(`Created auth users: ${created}`);
  console.log(`Reused existing auth users: ${reusedExisting}`);
  console.log(`Skipped invalid/missing email: ${skippedInvalidEmail}`);
  console.log(`login_identities upserts: ${identityUpserts}`);
  console.log(`Failed: ${failed.length}`);
  if (options.sendInvite) {
    console.log("Provisioning mode: invite email (employees set their own password via Supabase invite link)");
  } else {
    console.log("Provisioning mode: generated temporary password");
  }
  if (options.printTempPasswords && tempPasswords.length > 0) {
    console.log("\nTemporary passwords (handle securely, send individually, then force reset):");
    for (const row of tempPasswords) {
      console.log(`- ${row.employer_id} (${row.email}) => ${row.tempPassword}`);
    }
  }
  if (failed.length > 0) {
    console.log("\nFailures:");
    for (const f of failed) {
      console.log(`- ${f.employer_id}: ${f.message}`);
    }
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
