import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function requireSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error(
      'Supabase env missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (local) or your host env vars (Netlify → Site configuration → Environment variables). Values: https://supabase.com/dashboard/project/_/settings/api',
    )
  }
  return { url, key }
}

export async function createClient() {
  const cookieStore = await cookies()
  const { url, key } = requireSupabaseEnv()

  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component — read-only cookie context, ignore
          }
        },
      },
    }
  )
}
