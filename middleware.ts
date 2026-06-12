import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that DON'T require authentication
const PUBLIC_PATHS = ['/', '/login', '/auth']

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some(p =>
    pathname === p || pathname.startsWith(p + '/')
  )
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  // ── Create Supabase client that reads/writes cookies ──────────
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Write cookies to the request first (so server components see them)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          // Rebuild response so the updated cookies flow to the browser
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // ── CRITICAL: refresh session — also stores PKCE verifier ─────
  // Must be called here, before any redirect logic.
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // ── Guard protected routes ────────────────────────────────────
  if (!user && !isPublic(pathname)) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    // Preserve ?next= so user lands back where they were
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── Redirect logged-in users away from /login ─────────────────
  if (user && pathname === '/login') {
    const dest = request.nextUrl.clone()
    dest.pathname = '/dashboard'
    return NextResponse.redirect(dest)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Run on all paths except:
     * - _next/static  (static assets)
     * - _next/image   (image optimisation)
     * - favicon.ico
     * - public image/svg/font files
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
  ],
}
