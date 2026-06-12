'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { track } from '@/lib/analytics'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import Seal from '@/components/brand/Seal'

type Mode = 'signup' | 'signin'

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const searchParams = useSearchParams()
  const next = searchParams.get('next')

  const [mode, setMode] = useState<Mode>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(
    searchParams.get('error') === 'auth_failed'
      ? 'Authentication failed. Try again, or use email and password.'
      : null,
  )

  async function goAfterAuth(supabase: ReturnType<typeof createClient>) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Signed in, but no session was created. Check Supabase email confirmation settings.')
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('aspirant_profiles')
      .select('anchor_generated')
      .eq('user_id', user.id)
      .single()

    const dest = !profile?.anchor_generated ? '/diagnosis' : (next || '/dashboard')
    window.location.href = dest
  }

  function friendly(msg: string): string {
    const m = msg.toLowerCase()
    if (m.includes('invalid login credentials')) return 'Wrong email or password. Try again, or create an account.'
    if (m.includes('already registered') || m.includes('already exists')) return 'This email is already registered. Switch to Sign In below.'
    if (m.includes('password should be')) return 'Password must be at least 6 characters.'
    if (m.includes('rate limit')) return 'Too many attempts. Wait a minute and try again.'
    if (m.includes('provider') || m.includes('oauth')) return 'Google sign-in is not configured yet in Supabase Auth.'
    return msg
  }

  function ensureSupabaseConfig() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setError('Supabase not configured. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.')
      return false
    }
    return true
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!ensureSupabaseConfig()) return
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    track(mode === 'signup' ? 'signup_attempt' : 'signin_attempt')

    try {
      const supabase = createClient()

      const authPromise = mode === 'signup'
        ? supabase.auth.signUp({ email, password })
        : supabase.auth.signInWithPassword({ email, password })

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out. Your Supabase project may be paused.')), 15_000),
      )

      const { error: authError } = await Promise.race([authPromise, timeoutPromise])

      if (authError) {
        setError(friendly(authError.message))
        track('auth_failed', { mode, reason: authError.message })
        setLoading(false)
        return
      }

      track(mode === 'signup' ? 'signup_succeeded' : 'signin_succeeded')
      await goAfterAuth(supabase)
    } catch (err) {
      console.error('auth threw:', err)
      setError(err instanceof Error ? friendly(err.message) : 'Unexpected error. Check console.')
      setLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    setError(null)
    if (!ensureSupabaseConfig()) return

    setGoogleLoading(true)
    track('google_auth_attempt')

    try {
      const supabase = createClient()
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (oauthError) {
        setError(friendly(oauthError.message))
        track('auth_failed', { mode: 'google', reason: oauthError.message })
        setGoogleLoading(false)
      }
    } catch (err) {
      console.error('google auth threw:', err)
      setError(err instanceof Error ? friendly(err.message) : 'Unexpected Google sign-in error.')
      setGoogleLoading(false)
    }
  }

  const isSignup = mode === 'signup'

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_420px] lg:items-center">
          <div className="hidden lg:block">
            <Link href="/" className="mb-8 flex items-center gap-3">
              <Seal variant="stamped" size={40} />
              <span className="heading-cinzel text-sm font-bold tracking-[0.24em] text-indigo">
                KAUTILYA
              </span>
            </Link>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-copper">
              Knowledge is not enough. Judgement selects.
            </p>
            <h1 className="heading-cinzel max-w-2xl text-5xl font-black leading-tight text-indigo">
              Your books were never the problem.
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-inkdim">
              Create your account. KAUTILYA studies how you prepare first, then tells you what
              to do next. No guilt loops. No content pile. One command a day.
            </p>
          </div>

          <div className="card-dark gold-border p-6 sm:p-8">
            <Link href="/" className="mb-8 flex items-center justify-center gap-3 lg:hidden">
              <span className="heading-cinzel text-lg font-bold tracking-[0.22em] text-indigo">
                KAUTILYA
              </span>
            </Link>

            <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-copper">
              {isSignup ? 'Start the diagnosis' : 'Return to command'}
            </p>
            <h1 className="heading-cinzel text-2xl font-bold text-slate900">
              {isSignup ? 'Begin Your Diagnosis' : 'Welcome back.'}
            </h1>
            <p className="mt-3 text-sm leading-6 text-inkdim">
              {isSignup
                ? 'Create your account to open the KAUTILYA command system.'
                : "Sign in to return to your dashboard and today's command."}
            </p>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="mt-7 flex w-full items-center justify-center gap-3 rounded-lg border border-chanakya-muted/60 px-4 py-3 text-sm font-semibold text-chanakya-text transition-colors hover:border-chanakya-gold/60 hover:text-chanakya-gold disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-xs font-black text-black">G</span>
              {googleLoading ? 'Opening Google...' : 'Continue with Google'}
            </button>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-chanakya-muted/40" />
              <span className="text-xs text-chanakya-text-dim">or use email</span>
              <div className="h-px flex-1 bg-chanakya-muted/40" />
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-xs uppercase tracking-wide text-chanakya-text-dim">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full rounded-lg border border-chanakya-muted bg-chanakya-bg px-4 py-3 text-sm text-chanakya-text placeholder-chanakya-text-dim transition-colors focus:border-chanakya-gold focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-xs uppercase tracking-wide text-chanakya-text-dim">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    required
                    minLength={6}
                    autoComplete={isSignup ? 'new-password' : 'current-password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={isSignup ? 'At least 6 characters' : 'Your password'}
                    className="w-full rounded-lg border border-chanakya-muted bg-chanakya-bg px-4 py-3 pr-11 text-sm text-chanakya-text placeholder-chanakya-text-dim transition-colors focus:border-chanakya-gold focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-chanakya-text-dim transition-colors hover:text-chanakya-gold"
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && <p className="rounded border border-clay/30 bg-clay/10 p-3 text-xs text-clay">{error}</p>}

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full rounded-lg bg-chanakya-gold py-3 text-sm font-bold text-chanakya-bg transition-colors hover:bg-chanakya-gold-light disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? (isSignup ? 'Creating account...' : 'Signing in...')
                  : (isSignup ? 'Create Account' : 'Sign In')}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => { setMode(isSignup ? 'signin' : 'signup'); setError(null) }}
                className="text-xs text-chanakya-text-dim transition-colors hover:text-chanakya-gold"
              >
                {isSignup ? 'Already mapped? Sign in' : 'New here? Create your account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
