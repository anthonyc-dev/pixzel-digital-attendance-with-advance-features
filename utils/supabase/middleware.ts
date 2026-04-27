import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { defaultPostLoginPath, isEmployeeRoleUser, isPayrollStaffUser } from "@/lib/rbac/roles";
import { CUSTOM_SESSION_COOKIE, verifySessionToken } from "@/lib/auth/custom-session";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isConfigured = supabaseUrl && supabaseKey;

/**
 * Refreshes the Supabase auth session and forwards updated cookies on the response.
 * Call this from root middleware on every matched request.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  if (!isConfigured) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const customSession = verifySessionToken(request.cookies.get(CUSTOM_SESSION_COOKIE)?.value);
  const isAuthenticated = Boolean(user || customSession);

  const { pathname } = request.nextUrl;

  const isProtectedPath = 
    pathname.startsWith('/admin') || 
    pathname.startsWith('/employee') ||
    pathname.startsWith('/api/employers') ||
    (pathname.startsWith('/api/registration') && request.method !== 'GET');

  const isAuthPath = pathname.startsWith('/auth/login');

  if (isProtectedPath && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  if (isAuthPath && isAuthenticated) {
    const url = request.nextUrl.clone();
    if (user) {
      url.pathname = defaultPostLoginPath(user);
    } else {
      url.pathname = customSession?.role === "employee" ? "/employee" : "/admin/adminDashboard";
    }
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin")) {
    const blockedByUserRole = Boolean(user && isEmployeeRoleUser(user));
    const blockedByCustomRole = customSession?.role === "employee";
    if (!(blockedByUserRole || blockedByCustomRole)) {
      return supabaseResponse;
    }
    const url = request.nextUrl.clone();
    url.pathname = "/employee";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/employee")) {
    const blockedByUserRole = Boolean(user && isPayrollStaffUser(user));
    const blockedByCustomRole = customSession?.role === "admin";
    if (!(blockedByUserRole || blockedByCustomRole)) {
      return supabaseResponse;
    }
    const url = request.nextUrl.clone();
    url.pathname = "/admin/adminDashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
