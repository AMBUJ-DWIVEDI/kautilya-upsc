import { createClient } from '@/lib/supabase/server'
import { getResourceState } from '@/lib/resource/audit'
import ResourcesClient from './ResourcesClient'
import KautilyaErrorState from '@/components/kautilya/KautilyaErrorState'

export default async function ResourcesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let initialState
  try {
    initialState = await getResourceState(supabase, user!.id)
  } catch {
    return (
      <div className="flex-1 bg-parchment px-4 py-8 text-slate900 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <header className="mb-6">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-copper">Resource Audit</p>
            <h1 className="heading-cinzel mt-1 text-3xl font-black leading-tight text-indigo sm:text-4xl">
              Name your sources. Then reduce.
            </h1>
          </header>
          <KautilyaErrorState
            title="Resource audit unavailable."
            body="Could not load your source stack. Try again in a moment."
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-parchment px-4 py-8 text-slate900 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-copper">Resource Audit</p>
          <h1 className="heading-cinzel mt-1 text-3xl font-black leading-tight text-indigo sm:text-4xl">
            Name your sources. Then reduce.
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-inkdim">
            Integration score reflects your real stack and diagnosis — park a source and watch the map update.
          </p>
        </header>

        <ResourcesClient initialState={initialState} />
      </div>
    </div>
  )
}
