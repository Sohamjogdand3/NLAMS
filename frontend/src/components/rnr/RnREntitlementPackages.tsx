import { useState } from 'react'
import {
  Gift,
  Home,
  Coins,
  Truck,
  GraduationCap,
  CheckCircle2,
} from 'lucide-react'
import type { AffectedFamilyRecord } from '../../types/rnr'

interface RnREntitlementPackagesProps {
  families: AffectedFamilyRecord[]
}

export default function RnREntitlementPackages({ families }: RnREntitlementPackagesProps) {
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'HOUSED' | 'SUBSISTENCE'>(
    'ALL'
  )

  const filteredFamilies = families.filter((f) => {
    if (selectedCategory === 'HOUSED') return f.eligibleEntitlements.housingUnitAllocated
    if (selectedCategory === 'SUBSISTENCE')
      return f.eligibleEntitlements.subsistenceGrantAmount > 0
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Gift className="h-5 w-5 text-purple-900" />
              RFCTLARR Second Schedule Statutory Entitlements
            </h2>
            <p className="text-xs text-slate-500 max-w-3xl">
              Mandatory rehabilitation packages guaranteed by law for all displaced and project-affected families. Includes dwelling house construction, monthly subsistence support, cattle shed assistance, and livelihood skill grants.
            </p>
          </div>
          <span className="self-start sm:self-auto rounded-full bg-purple-100 px-3 py-1 text-xs font-black text-purple-950 border border-purple-200">
            Schedule II Act Enforced
          </span>
        </div>
      </div>

      {/* 4 Core Statutory Benefit Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Resettlement Housing</span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
              <Home className="h-4 w-4" />
            </div>
          </div>
          <div className="text-lg font-black text-slate-900">50 sq.m Dwelling</div>
          <p className="text-[11px] text-slate-500">
            Free of cost constructed dwelling unit under PMAY / State R&amp;R Colony.
          </p>
        </div>

        {/* Card 2 */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Subsistence Grant</span>
            <div className="rounded-lg bg-purple-50 p-2 text-purple-700">
              <Coins className="h-4 w-4" />
            </div>
          </div>
          <div className="text-lg font-black text-purple-950">₹3,000 / Month</div>
          <p className="text-[11px] text-slate-500">
            Guaranteed monthly allowance for 12 months (₹36,000 per affected family).
          </p>
        </div>

        {/* Card 3 */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Relocation Grant</span>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-700">
              <Truck className="h-4 w-4" />
            </div>
          </div>
          <div className="text-lg font-black text-slate-900">₹50,000 One-Time</div>
          <p className="text-[11px] text-slate-500">
            Transportation and transit assistance for shifting household materials.
          </p>
        </div>

        {/* Card 4 */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Livelihood &amp; Skills</span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
              <GraduationCap className="h-4 w-4" />
            </div>
          </div>
          <div className="text-lg font-black text-emerald-800">Skill Training</div>
          <p className="text-[11px] text-slate-500">
            Vocational certification via NSDC and state rural livelihood mission.
          </p>
        </div>
      </div>

      {/* Entitlement Beneficiary Roster */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs space-y-3">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
            Beneficiary Entitlement Packages Schedule
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                selectedCategory === 'ALL'
                  ? 'bg-purple-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedCategory('HOUSED')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                selectedCategory === 'HOUSED'
                  ? 'bg-purple-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              Housing Allocated
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">PAF Family</th>
                <th className="px-4 py-3">Housing Unit Location</th>
                <th className="px-4 py-3 text-center">Subsistence Grant</th>
                <th className="px-4 py-3 text-center">Relocation Grant</th>
                <th className="px-4 py-3 text-center">Cattle Shed Grant</th>
                <th className="px-4 py-3 text-center">Skill Training</th>
                <th className="px-4 py-3 text-right">Package Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredFamilies.map((fam) => (
                <tr key={fam.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">{fam.familyHeadName}</div>
                    <div className="font-mono text-[10px] text-purple-900">{fam.id}</div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-800">
                      {fam.eligibleEntitlements.housingSiteLocation || 'Standard Unit'}
                    </div>
                    <div className="text-[10px] text-slate-400">{fam.village}</div>
                  </td>

                  <td className="px-4 py-3 text-center font-bold text-purple-950">
                    ₹{fam.eligibleEntitlements.subsistenceGrantAmount.toLocaleString()}
                  </td>

                  <td className="px-4 py-3 text-center font-bold text-slate-800">
                    ₹{fam.eligibleEntitlements.resettlementAllowanceOneTime.toLocaleString()}
                  </td>

                  <td className="px-4 py-3 text-center font-bold text-slate-800">
                    ₹{fam.eligibleEntitlements.cattleShedGrant.toLocaleString()}
                  </td>

                  <td className="px-4 py-3 text-center">
                    {fam.eligibleEntitlements.jobTrainingOpted ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        <CheckCircle2 className="h-3 w-3" /> Opted
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">N/A</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        fam.claimStatus === 'Package Disbursed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {fam.claimStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
