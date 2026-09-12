import {
  Landmark,
  ArrowRightLeft,
  Banknote,
  Home,
  ShieldCheck,
  ScrollText,
  BellRing,
  Headset,
  MapPinned,
  HelpCircle,
} from 'lucide-react'
import { infoCards } from '../../data/landing'

const iconMap: Record<string, typeof Landmark> = {
  landmark: Landmark,
  workflow: ArrowRightLeft,
  banknote: Banknote,
  home: Home,
  shield: ShieldCheck,
  scroll: ScrollText,
  bell: BellRing,
  headset: Headset,
  map: MapPinned,
  help: HelpCircle,
}

const colorMap: Record<string, string> = {
  landmark: 'bg-blue-50 text-blue-700 border-blue-200',
  workflow: 'bg-amber-50 text-amber-700 border-amber-200',
  banknote: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  home: 'bg-violet-50 text-violet-700 border-violet-200',
  shield: 'bg-sky-50 text-sky-700 border-sky-200',
  scroll: 'bg-rose-50 text-rose-700 border-rose-200',
  bell: 'bg-orange-50 text-orange-700 border-orange-200',
  headset: 'bg-teal-50 text-teal-700 border-teal-200',
  map: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  help: 'bg-slate-100 text-slate-700 border-slate-300',
}

export default function InfoSection() {
  return (
    <section id="info" className="border-b border-border bg-surface py-16 sm:py-20">
      <div className="mx-auto max-w-[1700px] w-full px-4 sm:px-8 lg:px-12">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold text-navy sm:text-3xl">
            Information &amp; Services
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted">
            Everything you need to know about the land acquisition process — from the meaning
            of acquisition to your rights, compensation, rehabilitation, and how to use citizen services.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {infoCards.map((card) => {
            const Icon = iconMap[card.icon] || HelpCircle
            const colors = colorMap[card.icon] || colorMap.help
            return (
              <a
                key={card.id}
                href={`#${card.id}`}
                className="group rounded-xl border border-border bg-white p-5 shadow-xs transition-all hover:border-navy/30 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border ${colors}`}>
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-900 group-hover:text-navy transition-colors">
                  {card.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">
                  {card.description}
                </p>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
