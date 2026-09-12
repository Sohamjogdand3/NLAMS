import { stats } from '../../data/landing'

export default function StatsStrip() {
  return (
    <section className="border-b border-border bg-bg py-10">
      <div className="mx-auto grid max-w-[1700px] w-full grid-cols-2 gap-8 px-4 sm:px-8 lg:grid-cols-4 lg:px-12">
        {stats.map((stat) => (
          <div key={stat.label}>
            <div className="text-2xl font-bold text-navy sm:text-3xl">{stat.value}</div>
            <div className="mt-1 text-sm text-muted">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
