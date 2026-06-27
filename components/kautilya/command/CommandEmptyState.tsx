import Link from 'next/link'

export default function CommandEmptyState() {
  return (
    <section className="card-calm copper-border p-8 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-copper">No command issued yet</p>
      <h2 className="heading-cinzel mx-auto mt-3 max-w-xl text-2xl font-black text-indigo">
        KAUTILYA cannot command a war it has not diagnosed.
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-inkdim">
        Begin the Long-War Diagnosis, then return here for the first Weekly Command Brief.
      </p>
      <Link href="/diagnosis" className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-copper px-6 text-sm font-bold text-ivory hover:bg-copperlight">
        Take Long-War Diagnosis
      </Link>
    </section>
  )
}
