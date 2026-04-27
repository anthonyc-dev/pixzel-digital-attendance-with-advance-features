import { NextResponse } from "next/server";
import {
  createSessionToken,
  CUSTOM_SESSION_COOKIE,
  roleFromPosition,
} from "@/lib/auth/custom-session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSupabaseServiceRole } from "@/utils/supabase/service-role";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };
  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 },
    );
  }

  const supabase = createSupabaseServiceRole();
  const { data, error } = await supabase
    .from("employer_registration")
    .select("id, employer_id, employer_position, email, password")
    .eq("email", email)
    .maybeSingle();

  if (error || !data?.password) {
    return NextResponse.json({ error: "Invalid login credentials." }, { status: 401 });
  }

  const storedHash = String(data.password);
  const isValidPassword = await verifyPassword(password, storedHash);
  if (!isValidPassword) {
    return NextResponse.json({ error: "Invalid login credentials." }, { status: 401 });
  }

  // Seamless migration: upgrade old sha256 hashes to bcrypt after successful login.
  if (!storedHash.startsWith("$2")) {
    const upgradedHash = await hashPassword(password);
    await supabase
      .from("employer_registration")
      .update({ password: upgradedHash })
      .eq("id", data.id);
  }

  const role = roleFromPosition(data.employer_position);
  const token = createSessionToken({
    employerId: Number(data.id),
    employerCode: String(data.employer_id),
    email,
    role,
  });

  const response = NextResponse.json({
    success: true,
    role,
    redirectTo: role === "employee" ? "/employee" : "/admin/adminDashboard",
  });

  response.cookies.set(CUSTOM_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return response;
}

