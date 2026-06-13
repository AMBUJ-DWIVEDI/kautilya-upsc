import { createBrowserClient } from '@supabase/ssr'

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

export function createClient() {
  const { url, key } = requireSupabaseEnv()
  return createBrowserClient(url, key)
}
