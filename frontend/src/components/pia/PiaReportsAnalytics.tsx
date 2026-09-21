import { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts'
import {
  Download,
} from 'lucide-react'
import {
  MOCK_ACQUISITION_TRENDS,
  MOCK_STAGE_DISTRIBUTION,
  MOCK_SECTOR_PROGRESS,
} from '../../data/mockPiaData'
import type { PiaProject } from '../../types/pia'

interface PiaReportsAnalyticsProps {
  projects: PiaProject[]
}

export default function PiaReportsAnalytics({ projects }: PiaReportsAnalyticsProps) {
  const [reportPeriod, setReportPeriod] = useState<'Q1-2026' | 'FY2025-26'>('FY2025-26')

  // Prepare chart data for Land Acquired vs Target for projects
  const projectChartData = projects.slice(0, 6).map((p) => ({
    name: p.code.replace('NHAI-', '').replace('DFCCIL-', ''),
    fullName: p.name,
    required: p.landRequiredHa,
    acquired: p.landAcquiredHa,
  }))

  const handleExportReport = () => {
    alert(
      'Generating Consolidated Land Acquisition Progress Report (NLAMS-PIA-FY2026.pdf)... File ready for download!'
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Reports & Land Acquisition Analytics
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Executive progress summaries, compensation escrow disbursement, and statutory milestone turnaround
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={reportPeriod}
            onChange={(e) => setReportPeriod(e.target.value as any)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="FY2025-26">Financial Year 2025-26</option>
            <option value="Q1-2026">Q1 2026 (Jan - Mar)</option>
          </select>

          <button
            type="button"
            onClick={handleExportReport}
            className="flex items-center gap-1.5 rounded-xl bg-[#991B1B] hover:bg-[#7F1D1D] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Official Report</span>
          </button>
        </div>
      </div>

      {/* Row 1: Charts - Land Progress (Bar) & Stage Distribution (Pie) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Land Acquired vs Target (Bar chart) */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Land Acquisition Target vs Possession Acquired (Hectares)
              </h3>
              <p className="text-xs text-slate-500">Key corridor packages</p>
            </div>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
              Corridor Parcels
            </span>
          </div>

          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectChartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#64748B' }}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                  formatter={(value: any, name: any) => [
                    `${value} Ha`,
                    name === 'required' ? 'Target Land' : 'Acquired (Vested)',
                  ]}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  formatter={(val) => (val === 'required' ? 'Target Land (Ha)' : 'Acquired Land (Ha)')}
                />
                <Bar dataKey="required" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="acquired" fill="#991B1B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stage Distribution (Pie chart) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Statutory Stage Breakdown</h3>
            <p className="text-xs text-slate-500">Active project distribution</p>
          </div>

          <div className="h-56 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={MOCK_STAGE_DISTRIBUTION}
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {MOCK_STAGE_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                  formatter={(val, name) => [`${val} Projects`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-slate-900">28</span>
              <span className="text-[10px] text-slate-400">Total Proj</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
            {MOCK_STAGE_DISTRIBUTION.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-slate-600 truncate">{s.name}:</span>
                <strong className="text-slate-900 ml-auto">{s.count}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Monthly Compensation Disbursal Area Trend & Sector Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Monthly Compensation Disbursed (Area Chart) */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Compensation Disbursement vs Escrow Outlay Trend (₹ Crores)
              </h3>
              <p className="text-xs text-slate-500">
                Direct Benefit Transfer (PFMS) to verified Khatedars over past 6 months
              </p>
            </div>
            <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
              PFMS Integrated
            </span>
          </div>

          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_ACQUISITION_TRENDS} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                <defs>
                  <linearGradient id="disbursedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#991B1B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#991B1B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                  formatter={(val) => [`₹${val} Cr`, 'Disbursed (DBT)']}
                />
                <Area
                  type="monotone"
                  dataKey="disbursedCr"
                  stroke="#991B1B"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#disbursedGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sector Progress Cards */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Sector Progress Summary</h3>
            <p className="text-xs text-slate-500">Infrastructure acquisition targets</p>
          </div>

          <div className="space-y-3 text-xs">
            {MOCK_SECTOR_PROGRESS.map((item) => (
              <div key={item.sector} className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                <div className="flex justify-between font-bold text-slate-900 mb-1">
                  <span>{item.sector}</span>
                  <span className="text-[#991B1B]">{item.percentage}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden mb-1.5">
                  <div
                    className="h-full bg-[#991B1B]"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Target: {item.totalHa} Ha</span>
                  <span>Acquired: {item.acquiredHa} Ha</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
