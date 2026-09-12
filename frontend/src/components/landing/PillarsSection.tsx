import { MapPinned, GitBranch, ShieldCheck, Sparkles } from 'lucide-react'
import { pillars } from '../../data/landing'

const icons = {
  gis: MapPinned,
  workflow: GitBranch,
  transparent: ShieldCheck,
  'decision-support': Sparkles,
}

export default function PillarsSection() {
  return (
    <section id="about" className="border-b border-border bg-surface py-20">
      <div className="mx-auto max-w-[1700px] w-full px-4 sm:px-8 lg:px-12">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold text-navy sm:text-3xl">Built for statutory work, not just status pages</h2>
          <p className="mt-3 text-base leading-relaxed text-muted">
            NLAMS is designed around what makes land acquisition hard: real
            geography, strict sequence, and decisions that carry legal weight.
          </p>
        </div>

        <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2">
          {pillars.map((pillar) => {
            const Icon = icons[pillar.id as keyof typeof icons]
            return (
              <div key={pillar.id} className="flex gap-4">
                <div className="flex h-11 w-11 flex-none items-center justify-center rounded-md bg-navy/5 text-navy">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="font-semibold text-text">{pillar.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{pillar.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
