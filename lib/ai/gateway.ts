// ============================================================
// KAUTILYA — AI Gateway
// One provider-agnostic entry point for every LLM call.
//
// Why this exists:
//  - Route by user tier (free → cheap/free model, paid → premium).
//  - Fail over automatically when a provider rate-limits or errors.
//  - Keep cost near-zero: free users ride Groq's free Llama tier;
//    the $20 OpenAI/Gemini budget is only ever touched as a fallback
//    or for paid users.
//
// All three providers (Groq, OpenAI, Gemini) speak the SAME
// OpenAI `/chat/completions` shape, so one fetch wrapper covers them.
//
// Prompt caching: Groq + OpenAI auto-cache identical prompt prefixes
// (>~1024 tokens); Gemini 2.5 caches implicitly. So callers MUST keep
// the `system` prompt stable and put per-user data in `user`. Do that
// and repeated input tokens cost ~10% of list price for free.
// ============================================================

export type Provider = 'groq' | 'openai' | 'gemini'
export type Tier = 'free' | 'paid'

interface ModelSpec {
  provider: Provider
  model: string
}

const PROVIDER_BASE_URL: Record<Provider, string> = {
  groq: 'https://api.groq.com/openai/v1',
  openai: 'https://api.openai.com/v1',
  gemini: 'https://generativelanguage.googleapis.com/v1beta/openai',
}

function providerKey(p: Provider): string | undefined {
  switch (p) {
    case 'groq':
      return process.env.GROQ_API_KEY
    case 'openai':
      return process.env.OPENAI_API_KEY
    case 'gemini':
      return process.env.GEMINI_API_KEY
  }
}

// Default routing. Primary model per tier is env-overridable so models can
// be swapped without a deploy. Each chain is tried in order until one works.
//
//  - free → Groq Llama 3.3 70B (free tier) → Gemini Flash (cheap fallback)
//  - paid → Gemini 2.5 Pro (quality) → GPT-4o-mini → Groq (last resort)
function chainForTier(tier: Tier): ModelSpec[] {
  if (tier === 'paid') {
    return [
      { provider: 'gemini', model: process.env.AI_MODEL_PAID ?? 'gemini-2.5-pro' },
      { provider: 'openai', model: 'gpt-4o-mini' },
      { provider: 'gemini', model: 'gemini-2.5-flash' },
      { provider: 'groq', model: 'llama-3.3-70b-versatile' },
    ]
  }
  return [
    { provider: 'groq', model: process.env.AI_MODEL_FREE ?? 'llama-3.3-70b-versatile' },
    { provider: 'gemini', model: 'gemini-2.0-flash' },
    { provider: 'openai', model: 'gpt-4o-mini' },
  ]
}

/** Keep only models whose provider has an API key configured, de-duped. */
function availableChain(tier: Tier): ModelSpec[] {
  const seen = new Set<string>()
  return chainForTier(tier).filter(spec => {
    if (!providerKey(spec.provider)) return false
    const id = `${spec.provider}:${spec.model}`
    if (seen.has(id)) return false
    seen.add(id)
    return true
  })
}

export interface GenerateOptions {
  /** Stable across users — keep it here so providers cache it. */
  system: string
  /** Per-user payload — never cached. */
  user: string
  tier: Tier
  maxTokens?: number
  temperature?: number
  /** Force JSON response mode + robust JSON extraction. Default true. */
  json?: boolean
  /** Caller abort signal; otherwise an internal 30s timeout applies. */
  signal?: AbortSignal
}

export interface GatewayResult<T> {
  data: T
  provider: Provider
  model: string
  raw: string
}

class GatewayError extends Error {
  constructor(message: string, readonly attempts: string[]) {
    super(message)
    this.name = 'GatewayError'
  }
}

/** Strip ```json fences / prose and parse the first JSON object found. */
function parseJsonLoose<T>(raw: string): T {
  const trimmed = raw.trim()
  try {
    return JSON.parse(trimmed) as T
  } catch {
    // fall through to fenced/embedded extraction
  }
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenced) {
    try {
      return JSON.parse(fenced[1].trim()) as T
    } catch {
      // continue
    }
  }
  const first = trimmed.indexOf('{')
  const last = trimmed.lastIndexOf('}')
  if (first !== -1 && last > first) {
    return JSON.parse(trimmed.slice(first, last + 1)) as T
  }
  throw new Error('No JSON object found in model response')
}

async function callModel(
  spec: ModelSpec,
  opts: GenerateOptions,
): Promise<{ content: string }> {
  const key = providerKey(spec.provider)
  if (!key) throw new Error(`${spec.provider}: no API key`)

  const body: Record<string, unknown> = {
    model: spec.model,
    messages: [
      { role: 'system', content: opts.system },
      { role: 'user', content: opts.user },
    ],
    temperature: opts.temperature ?? 0.7,
    max_tokens: opts.maxTokens ?? 4000,
  }
  if (opts.json !== false) {
    body.response_format = { type: 'json_object' }
  }

  // Internal timeout if the caller didn't supply one.
  const signal = opts.signal ?? AbortSignal.timeout(30_000)

  const res = await fetch(`${PROVIDER_BASE_URL[spec.provider]}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
    signal,
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`${spec.provider}/${spec.model} → ${res.status} ${detail.slice(0, 200)}`)
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error(`${spec.provider}/${spec.model} → empty response`)
  return { content }
}

/**
 * Generate a JSON object, trying each model in the tier's chain until one
 * succeeds. Throws GatewayError only if every provider fails.
 */
export async function generateJSON<T = unknown>(
  opts: GenerateOptions,
): Promise<GatewayResult<T>> {
  const chain = availableChain(opts.tier)
  if (chain.length === 0) {
    throw new GatewayError(
      'No AI provider configured. Set GROQ_API_KEY (and/or OPENAI_API_KEY, GEMINI_API_KEY).',
      [],
    )
  }

  const attempts: string[] = []
  for (const spec of chain) {
    try {
      const { content } = await callModel(spec, opts)
      const data = parseJsonLoose<T>(content)
      return { data, provider: spec.provider, model: spec.model, raw: content }
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err)
      attempts.push(`${spec.provider}/${spec.model}: ${reason}`)
      // try the next model in the chain
    }
  }

  throw new GatewayError(`All AI providers failed:\n${attempts.join('\n')}`, attempts)
}

/** Plain-text variant for non-JSON tasks (daily-log insights, etc.). */
export async function generateText(
  opts: Omit<GenerateOptions, 'json'>,
): Promise<{ text: string; provider: Provider; model: string }> {
  const chain = availableChain(opts.tier)
  if (chain.length === 0) {
    throw new GatewayError('No AI provider configured.', [])
  }
  const attempts: string[] = []
  for (const spec of chain) {
    try {
      const { content } = await callModel(spec, { ...opts, json: false })
      return { text: content, provider: spec.provider, model: spec.model }
    } catch (err) {
      attempts.push(`${spec.provider}/${spec.model}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }
  throw new GatewayError(`All AI providers failed:\n${attempts.join('\n')}`, attempts)
}

export { GatewayError }
