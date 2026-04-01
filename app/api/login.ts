import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/schemas/auth.schema";
import { db } from "@/lib/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: Request) {
  let body;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const { username, password } = parsed.data;

  try {
    const [rows]: any = await db.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    const user = rows[0];

    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // ✅ Create JWT
    const token = jwt.sign(
      { id: user.id, role: user.role }, // include role for later
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // ✅ Set cookie (this is the key part)
    const response = NextResponse.json({
      message: "Login successful",
    });

    response.cookies.set("token", token, {
      httpOnly: true,              // 🔐 no JS access
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",          // 🛡️ CSRF protection
      path: "/",
      maxAge: 60 * 60,             // 1 hour
    });

    return response;

  } catch (err) {
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}