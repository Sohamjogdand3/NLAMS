import { workflowStages } from '../../data/landing'

export default function WorkflowSection() {
  return (
    <section id="workflow" className="border-b border-border bg-bg py-16 sm:py-20">
      <div className="mx-auto max-w-[1700px] w-full px-4 sm:px-8 lg:px-12">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold text-navy sm:text-3xl">Land Acquisition Process</h2>
          <p className="mt-3 text-base leading-relaxed text-muted">
            Every acquisition follows these six statutory stages, in order:
            Identification → Notification → Objections → Compensation → R&amp;R → Possession.
          </p>
        </div>

        {/* Horizontal Timeline */}
        <div className="mt-12 relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-6 left-0 right-0 h-0.5 bg-navy/15" aria-hidden />

          <ol className="grid gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-6">
            {workflowStages.map((stage, i) => (
              <li key={stage.id} className="relative">
                {/* Step Number Circle */}
                <div className="flex items-center gap-3 lg:flex-col lg:items-start">
                  <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-navy bg-white text-base font-bold text-navy shadow-xs">
                    {i + 1}
                  </span>
                  <div className="lg:mt-4">
                    <h3 className="text-sm font-bold text-slate-900">{stage.label}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted">{stage.description}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
