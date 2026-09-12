import { roles } from '../../data/landing'

export default function RolesSection() {
  return (
    <section id="roles" className="border-b border-border bg-bg py-20">
      <div className="mx-auto max-w-[1700px] w-full px-4 sm:px-8 lg:px-12">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold text-navy sm:text-3xl">One platform, nine workspaces</h2>
          <p className="mt-3 text-base leading-relaxed text-muted">
            Everyone signs in the same way. What they see afterward is
            scoped to their role, jurisdiction, and the cases assigned to them.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <div
              key={role.id}
              className="rounded-lg border border-border bg-surface p-6 transition-colors hover:border-navy/30"
            >
              <h3 className="font-semibold text-text">{role.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{role.description}</p>
              <p className="mt-4 border-t border-border pt-3 text-xs leading-relaxed text-navy/80">
                {role.journey}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
