const columns = [
  {
    title: 'Platform',
    links: ['How it works', 'Role workspaces', 'GIS & mapping', 'AI decision support'],
  },
  {
    title: 'Stakeholders',
    links: ['Citizens', 'Field officers', 'District administration', 'Project agencies'],
  },
  {
    title: 'Support',
    links: ['Help centre', 'Report an issue', 'Data & privacy', 'Accessibility statement'],
  },
]

export default function Footer() {
  return (
    <footer className="bg-navy-dark text-white/70">
      <div className="mx-auto max-w-[1700px] w-full px-4 sm:px-8 lg:px-12 py-14">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <div className="text-lg font-bold text-white">NLAMS</div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed">
              National Land Acquisition &amp; Management System. A shared,
              GIS-enabled record for every stage of public land acquisition.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-white">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm transition-colors hover:text-white">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 National Land Acquisition &amp; Management System. Prototype build for SIH26016.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-white">
              Terms
            </a>
            <a href="#" className="hover:text-white">
              Privacy
            </a>
            <a href="#" className="hover:text-white">
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
