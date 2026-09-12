export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-navy">
      <div className="mx-auto grid max-w-[1700px] w-full items-center gap-10 px-4 sm:px-8 lg:px-12 py-14 lg:grid-cols-[1.1fr_1fr] lg:py-20">
        <div>
          <p className="text-sm font-medium text-saffron">SIH26016 · National platform prototype</p>
          <h1 className="mt-4 max-w-2xl text-3xl font-bold leading-[1.15] text-white sm:text-4xl lg:text-[2.75rem]">
            Land Acquisition Information &amp; Citizen Services
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
            Access information, procedures, notices, rights and services related to land acquisition.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="/login"
              className="rounded-md bg-saffron px-6 py-3 text-sm font-semibold text-navy-dark shadow-sm transition-colors hover:bg-saffron-dark hover:text-white"
            >
              Sign in to NLAMS
            </a>
            <a
              href="#info"
              className="rounded-md border border-white/25 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white/50 hover:bg-white/5"
            >
              Explore Information
            </a>
          </div>

          <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-white/10 pt-6">
            <div>
              <dt className="text-xs text-white/55">Process Stages</dt>
              <dd className="mt-1 text-xl font-semibold text-white">6</dd>
            </div>
            <div>
              <dt className="text-xs text-white/55">Role workspaces</dt>
              <dd className="mt-1 text-xl font-semibold text-white">9</dd>
            </div>
            <div>
              <dt className="text-xs text-white/55">GIS-linked parcels</dt>
              <dd className="mt-1 text-xl font-semibold text-white">86k+</dd>
            </div>
          </dl>
        </div>

        {/* Hero Image — Aerial GIS Acquisition Map */}
        <div className="relative mx-auto w-full max-w-2xl">
          <div className="absolute -inset-3 rounded-2xl bg-white/5" aria-hidden />
          <img
            src="/land-acquisition-hero.jpg"
            alt="Aerial view of land acquisition with GIS parcel overlay, survey numbers, project alignment corridor, and workflow status indicators"
            className="relative w-full rounded-xl border border-white/15 shadow-2xl object-cover aspect-[16/9]"
          />
          <div className="mt-4 flex items-center gap-5 text-xs text-white/55">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-red-500/60" /> Acquired Area
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-success" /> Compensation Paid
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-saffron" /> R&amp;R Pending
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
