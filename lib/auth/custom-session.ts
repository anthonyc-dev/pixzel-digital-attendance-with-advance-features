import { createHmac, timingSafeEqual } from "crypto";

export const CUSTOM_SESSION_COOKIE = "pixzel_custom_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours

export type CustomSessionPayload = {
  employerId: number;
  employerCode: string;
  email: string;
  role: "admin" | "employee";
  exp: number;
};

function getSessionSecret(): string {
  const secret = process.env.CUSTOM_AUTH_SESSION_SECRET;
  if (!secret) {
    throw new Error("Missing CUSTOM_AUTH_SESSION_SECRET environment variable");
  }
  return secret;
}

function toBase64Url(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

function fromBase64Url(input: string): string {
  return Buffer.from(input, "base64url").toString("utf8");
}

function sign(value: string): string {
  const hmac = createHmac("sha256", getSessionSecret());
  hmac.update(value);
  return hmac.digest("base64url");
}

export function createSessionToken(payload: Omit<CustomSessionPayload, "exp">): string {
  const fullPayload: CustomSessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const encodedPayload = toBase64Url(JSON.stringify(fullPayload));
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token: string | undefined): CustomSessionPayload | null {
  if (!token) return null;
  const [encodedPayload, providedSignature] = token.split(".");
  if (!encodedPayload || !providedSignature) return null;

  const expectedSignature = sign(encodedPayload);
  const validSignature =
    providedSignature.length === expectedSignature.length &&
    timingSafeEqual(Buffer.from(providedSignature), Buffer.from(expectedSignature));

  if (!validSignature) return null;

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as CustomSessionPayload;
    if (!payload?.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (!payload.role || (payload.role !== "admin" && payload.role !== "employee")) return null;
    return payload;
  } catch {
    return null;
  }
}

export function roleFromPosition(position: string | null | undefined): "admin" | "employee" {
  const value = (position ?? "").toLowerCase();
  if (
    value.includes("admin") ||
    value.includes("hr") ||
    value.includes("manager") ||
    value.includes("payroll")
  ) {
    return "admin";
  }
  return "employee";
}

