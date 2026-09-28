import {
  Users,
  Home,
  Building,
  FileCheck2,
  HeartHandshake,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react'
import type {
  AffectedFamilyRecord,
  CommunityAssetRecord,
  SiaReviewItem,
} from '../../types/rnr'

interface RnROverviewProps {
  families: AffectedFamilyRecord[]
  assets: CommunityAssetRecord[]
  siaReviews: SiaReviewItem[]
  onSelectTab: (tab: any) => void
}

export default function RnROverview({
  families,
  assets,
  siaReviews,
  onSelectTab,
}: RnROverviewProps) {
  const totalFamilies = families.length
  const approvedFamilies = families.filter(
    (f) => f.claimStatus === 'Entitlement Approved' || f.claimStatus === 'Package Disbursed'
  ).length
  const housedCount = families.filter((f) => f.eligibleEntitlements.housingUnitAllocated).length
  const vulnerableCount = families.filter((f) => f.vulnerabilityFlag !== 'General').length
  const totalAssetsCost = assets.reduce((acc, a) => acc + a.estimatedCostCr, 0)
  const commissionedAssets = assets.filter((a) => a.workStatus === 'Commissioned').length

  return (
    <div className="space-y-6">
      {/* R&R Header Banner */}
      <div className="rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 p-6 text-white shadow-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold tracking-wider text-amber-300 uppercase border border-amber-400/30">
                Rehabilitation &amp; Resettlement Administrator
              </span>
              <span className="text-xs text-purple-200">• Social Welfare &amp; Equity Desk</span>
            </div>
            <h1 className="text-xl font-black tracking-tight text-white sm:text-2xl">
              Social Impact &amp; Resettlement Ledger
            </h1>
            <p className="text-xs text-purple-100 max-w-2xl">
              Statutory execution of RFCTLARR Act 2013 Schedules II &amp; III. Providing equitable housing, subsistence grants, cattle shed replacement, and job training for non-owner tenants, sharecroppers, and vulnerable agricultural laborers.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onSelectTab('census')}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-purple-950 hover:bg-amber-300 transition-colors shadow-sm cursor-pointer"
            >
              <Users className="h-4 w-4" />
              PAF Census ({totalFamilies})
            </button>
            <button
              onClick={() => onSelectTab('community-assets')}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20 transition-colors border border-white/20 cursor-pointer"
            >
              <Building className="h-4 w-4" />
              Community Assets ({assets.length})
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Project Affected Families</span>
            <div className="rounded-lg bg-purple-50 p-2 text-purple-700">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalFamilies}</span>
            <span className="text-xs font-bold text-emerald-700">{approvedFamilies} Approved</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">100% Non-titleholder census</p>
        </div>

        {/* Metric 2 */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Housing Allocations</span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
              <Home className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{housedCount}</span>
            <span className="text-xs font-bold text-slate-600">PMAY Units</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">50 sq.m minimum statutory dwelling</p>
        </div>

        {/* Metric 3 */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Vulnerable Families</span>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-700">
              <HeartHandshake className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{vulnerableCount}</span>
            <span className="text-xs font-bold text-amber-700">Priority Support</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">SC/ST, BPL, Women-headed</p>
        </div>

        {/* Metric 4 */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Community Infrastructure</span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
              <Building className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">₹{totalAssetsCost.toFixed(2)}</span>
            <span className="text-xs font-bold text-slate-600">Cr Replaced</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {commissionedAssets} of {assets.length} sites commissioned
          </p>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Affected Families Roster (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-900" />
              Project Affected Families (PAF) Digital Census
            </h2>
            <button
              onClick={() => onSelectTab('census')}
              className="text-xs font-bold text-purple-900 hover:underline flex items-center gap-1 cursor-pointer"
            >
              View Full Census <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-3">
            {families.map((fam) => (
              <div
                key={fam.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-slate-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-purple-900">{fam.id}</span>
                      <span className="rounded-md bg-purple-100 text-purple-900 px-2 py-0.5 text-[10px] font-bold">
                        {fam.occupancyType}
                      </span>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          fam.vulnerabilityFlag === 'General'
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {fam.vulnerabilityFlag}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 mt-1">{fam.familyHeadName}</h3>
                  </div>

                  <div className="text-right sm:self-center">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        fam.claimStatus === 'Package Disbursed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : fam.claimStatus === 'Entitlement Approved'
                          ? 'bg-blue-100 text-blue-800'
                          : fam.claimStatus === 'Grievance Under Review'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {fam.claimStatus}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 text-[11px] text-slate-600">
                  <div className="flex items-center gap-3">
                    <span>
                      Village:{' '}
                      <strong className="text-slate-800">
                        {fam.village}, {fam.tehsil}
                      </strong>
                    </span>
                    <span>
                      Livelihood: <strong className="text-slate-800">{fam.primaryLivelihood}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Housing: {fam.eligibleEntitlements.housingUnitAllocated ? 'Allocated' : 'Pending'}
                    </span>
                    <span className="text-[10px] font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded">
                      Grant: ₹{(fam.eligibleEntitlements.subsistenceGrantAmount / 1000).toFixed(0)}k
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: SIA Clearances & Statutory Rules (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-purple-900" />
              SIA Section 7 Clearances
            </h2>
            <button
              onClick={() => onSelectTab('sia-clearance')}
              className="text-xs font-bold text-purple-900 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Dossier <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-3">
            {siaReviews.map((sia) => (
              <div
                key={sia.id}
                className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-purple-900">{sia.projectCode}</span>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[9.5px] font-bold ${
                      sia.section7ClearanceStatus === 'Clearance Issued'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {sia.section7ClearanceStatus}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 leading-tight">{sia.projectName}</h4>
                <div className="text-[11px] text-slate-500">
                  Agency: <strong>{sia.siaAgencyName}</strong>
                </div>
                <div className="text-[10.5px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  {sia.mitigationConditionsSummary}
                </div>
              </div>
            ))}
          </div>

          {/* Schedule II & III Legal Framework */}
          <div className="rounded-xl border border-purple-200 bg-purple-50/70 p-4 space-y-2">
            <div className="flex items-start gap-2">
              <ShieldCheck className="h-5 w-5 text-purple-900 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-purple-950">
                  RFCTLARR Act Non-Owner Safeguard
                </h4>
                <p className="text-[11px] text-purple-900 leading-relaxed">
                  Under Section 16 &amp; 31, non-landowning agricultural laborers and tenants residing in the affected zone for 3+ years are entitled to mandatory 50 sq.m housing, ₹50,000 relocation allowance, and 12 months subsistence allowance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
