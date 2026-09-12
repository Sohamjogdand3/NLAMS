

interface Project {
  id: number
  name: string
  status: string
  location: { lat: number; lng: number }
}

interface Props {
  projects: Project[]
}

export default function ProjectTable({ projects }: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-100">
          <tr>
            <th className="px-4 py-2 font-medium text-slate-600">ID</th>
            <th className="px-4 py-2 font-medium text-slate-600">Project</th>
            <th className="px-4 py-2 font-medium text-slate-600">Status</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.id} className="border-t border-slate-200 hover:bg-slate-50 transition-colors">
              <td className="px-4 py-2">{p.id}</td>
              <td className="px-4 py-2 font-medium text-slate-800">{p.name}</td>
              <td className="px-4 py-2 text-amber-600">{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
