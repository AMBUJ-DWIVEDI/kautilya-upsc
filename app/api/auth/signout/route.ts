import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  await supabase.auth.signOut()
  // Use the request origin so this works on any deployment URL (localhost, Netlify, custom domain)
  const origin = new URL(request.url).origin
  return NextResponse.redirect(new URL('/login', origin))
}
