import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/password";
import { requirePayrollAdmin } from "@/lib/auth/require-payroll-admin";
import { createSupabaseServer } from "@/utils/supabase/server";

type Body = {
  employerRegistrationId?: string;
  newPassword?: string;
};

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServer();
    const gate = await requirePayrollAdmin(supabase);
    if (gate.response) return gate.response;

    const body = (await req.json()) as Body;
    const employerRegistrationId = String(body.employerRegistrationId ?? "").trim();
    const newPassword = String(body.newPassword ?? "");

    if (!employerRegistrationId || !newPassword) {
      return NextResponse.json(
        { error: "employerRegistrationId and newPassword are required." },
        { status: 400 },
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 },
      );
    }

    const hashedPassword = await hashPassword(newPassword);
    const { data, error } = await supabase
      .from("employer_registration")
      .update({ password: hashedPassword })
      .eq("id", employerRegistrationId)
      .select("id")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Employee not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
