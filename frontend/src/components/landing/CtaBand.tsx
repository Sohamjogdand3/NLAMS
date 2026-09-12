export default function CtaBand() {
  return (
    <section className="border-b border-border bg-navy">
      <div className="mx-auto flex max-w-[1700px] w-full flex-col items-start justify-between gap-6 px-4 sm:px-8 lg:flex-row lg:items-center lg:px-12 py-14">
        <div>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Ready to check on a case?</h2>
          <p className="mt-2 max-w-md text-white/70">
            Officers, agencies, and landholders all sign in from the same page.
          </p>
        </div>
        <a
          href="/login"
          className="flex-none rounded-md bg-saffron px-7 py-3 text-sm font-semibold text-navy-dark shadow-sm transition-colors hover:bg-saffron-dark hover:text-white"
        >
          Sign in to NLAMS
        </a>
      </div>
    </section>
  )
}
