import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.redirect(`${origin}/login?error=supabase_not_configured`)
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    },
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  // Smart routing: unmapped aspirants go to the diagnosis; mapped ones to command.
  const { data: profile } = await supabase
    .from('aspirant_profiles')
    .select('anchor_generated')
    .eq('user_id', user.id)
    .single()

  const destination = !profile?.anchor_generated ? '/diagnosis' : next

  return NextResponse.redirect(`${origin}${destination}`)
}
