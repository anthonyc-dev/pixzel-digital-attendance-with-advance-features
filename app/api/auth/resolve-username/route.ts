import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(request: Request) {
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: 'Server auth config is incomplete.' },
      { status: 500 },
    )
  }

  const body = (await request.json()) as { username?: string }
  const username = body.username?.trim()

  if (!username) {
    return NextResponse.json({ error: 'Username is required.' }, { status: 400 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  const { data, error } = await supabase
    .from('login_identities')
    .select('email')
    .eq('username', username)
    .maybeSingle()

  if (error) {
    return NextResponse.json(
      { error: 'Unable to resolve username.' },
      { status: 500 },
    )
  }

  if (!data?.email) {
    return NextResponse.json({ error: 'Username not found.' }, { status: 404 })
  }

  return NextResponse.json({ email: data.email }, { status: 200 })
}
