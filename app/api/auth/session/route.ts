import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { CUSTOM_SESSION_COOKIE, verifySessionToken } from "@/lib/auth/custom-session";

export async function GET() {
  const token = (await cookies()).get(CUSTOM_SESSION_COOKIE)?.value;
  const session = verifySessionToken(token);

  return NextResponse.json({
    authenticated: Boolean(session),
    role: session?.role ?? null,
    employerCode: session?.employerCode ?? null,
    employerId: session?.employerId ?? null,
    email: session?.email ?? null,
  });
}
