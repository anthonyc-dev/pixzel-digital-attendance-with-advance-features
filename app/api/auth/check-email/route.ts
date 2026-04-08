import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.SUPABASE_SECRET_KEY ??
  process.env.SUPABASE_SERVICE_KEY

export async function POST(request: Request) {
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      {
        error:
          'Server auth config is incomplete. Missing NEXT_PUBLIC_SUPABASE_URL or service role key.',
      },
      { status: 500 },
    )
  }

  const body = (await request.json()) as { email?: string }
  const email = body.email?.trim().toLowerCase()

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  // First source of truth: Supabase Auth users via Admin API.
  let existsInAuthUsers = false
  let authUserError: string | null = null
  try {
    let page = 1
    const perPage = 200
    while (page <= 10 && !existsInAuthUsers) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
      if (error) {
        authUserError = error.message
        break
      }
      const users = data.users ?? []
      existsInAuthUsers = users.some((u) => (u.email ?? '').toLowerCase() === email)
      if (users.length < perPage) break
      page += 1
    }
  } catch (err) {
    authUserError = err instanceof Error ? err.message : 'Unknown auth admin error'
  }

  if (authUserError) {
    console.error('check-email auth admin query failed:', authUserError)
  }

  // Backward-compatible fallback: custom login_identities mapping table.
  const { data: identityData, error: identityError } = await supabase
    .from('login_identities')
    .select('email')
    .eq('email', email)
    .maybeSingle()

  if (identityError) {
    console.error('check-email login_identities query failed:', identityError.message)
  }

  if (authUserError && identityError) {
    return NextResponse.json({ error: 'Unable to verify email.' }, { status: 500 })
  }
  const existsInIdentityTable = Boolean(identityData?.email)

  if (!existsInAuthUsers && !existsInIdentityTable) {
    return NextResponse.json({ error: 'Email not found.' }, { status: 404 })
  }

  return NextResponse.json({ exists: true }, { status: 200 })
}

