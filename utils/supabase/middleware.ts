import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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

  const { pathname } = request.nextUrl;

  // Define which paths are protected (require login)
  const isProtectedPath = 
    pathname.startsWith('/admin') || 
    pathname.startsWith('/employee') ||
    pathname.startsWith('/api/employers') ||
    pathname.startsWith('/api/registration');

  // Define which paths are auth-related (redirect if already logged in)
  const isAuthPath = pathname.startsWith('/auth/login');

  // Redirect to login if accessing protected path without session
  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  // Redirect to dashboard if logged in and accessing login page
  if (isAuthPath && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/adminDashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
