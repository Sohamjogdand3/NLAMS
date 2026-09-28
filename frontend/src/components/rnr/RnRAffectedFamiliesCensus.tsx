import { useState } from 'react'
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Plus,
  ShieldCheck,
} from 'lucide-react'
import type { AffectedFamilyRecord } from '../../types/rnr'

interface RnRAffectedFamiliesCensusProps {
  families: AffectedFamilyRecord[]
  onApproveFamily: (familyId: string) => void
  onDisbursePackage: (familyId: string) => void
  onAddFamily: (newFam: Omit<AffectedFamilyRecord, 'id' | 'lastUpdated'>) => void
}

export default function RnRAffectedFamiliesCensus({
  families,
  onApproveFamily,
  onDisbursePackage,
  onAddFamily,
}: RnRAffectedFamiliesCensusProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [occupancyFilter, setOccupancyFilter] = useState('ALL')
  const [vulnerabilityFilter, setVulnerabilityFilter] = useState('ALL')
  const [selectedFamily, setSelectedFamily] = useState<AffectedFamilyRecord | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  // New family form states
  const [headName, setHeadName] = useState('')
  const [contact, setContact] = useState('')
  const [village] = useState('Wagholi')
  const [tehsil] = useState('Haveli')
  const [district] = useState('Pune')
  const [occupancy, setOccupancy] = useState<AffectedFamilyRecord['occupancyType']>('Tenant Farmer')
  const [vulnerability, setVulnerability] =
    useState<AffectedFamilyRecord['vulnerabilityFlag']>('BPL (Below Poverty Line)')
  const [membersCount, setMembersCount] = useState(4)
  const [livelihood, setLivelihood] = useState('Agricultural Farm Labor')

  const filtered = families.filter((f) => {
    const matchesSearch =
      f.familyHeadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.village.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesOccupancy = occupancyFilter === 'ALL' || f.occupancyType === occupancyFilter
    const matchesVulnerability =
      vulnerabilityFilter === 'ALL' || f.vulnerabilityFlag === vulnerabilityFilter
    return matchesSearch && matchesOccupancy && matchesVulnerability
  })

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!headName.trim()) return

    onAddFamily({
      familyHeadName: headName,
      contactNumber: contact || '+91 98000 00000',
      village,
      tehsil,
      district,
      aadhaarMasked: 'XXXX-XXXX-' + Math.floor(1000 + Math.random() * 9000),
      occupancyType: occupancy,
      vulnerabilityFlag: vulnerability,
      familyMembersCount: membersCount,
      primaryLivelihood: livelihood,
      eligibleEntitlements: {
        housingUnitAllocated: true,
        housingSiteLocation: `R&R Colony Layout, ${village}`,
        subsistenceGrantAmount: 36000,
        resettlementAllowanceOneTime: 50000,
        cattleShedGrant: occupancy === 'Tenant Farmer' ? 25000 : 0,
        jobTrainingOpted: true,
      },
      biometricEkycVerified: true,
      claimStatus: 'Census Enrolled',
      assignedOfficer: 'Dr. Sunita Jagtap (R&R Admin)',
    })

    setShowAddModal(false)
    setHeadName('')
    setContact('')
    setLivelihood('')
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-900" />
              Project Affected Families (PAF) &amp; Vulnerable Group Census
            </h2>
            <p className="text-xs text-slate-500 max-w-3xl">
              Comprehensive social survey registry capturing landless tenants, sharecroppers, farm wage laborers, and traditional village artisans impacted by project alignment for statutory rehabilitation under RFCTLARR Section 16.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-purple-900 px-4 py-2 text-xs font-bold text-white hover:bg-purple-850 transition-colors shadow-xs shrink-0 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Enroll Affected Family
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by PAF ID, family head name, village..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-3 text-xs text-slate-800 focus:outline-none focus:border-purple-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={occupancyFilter}
              onChange={(e) => setOccupancyFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Occupancy Types</option>
              <option value="Tenant Farmer">Tenant Farmer</option>
              <option value="Agricultural Laborer">Agricultural Laborer</option>
              <option value="Sharecropper">Sharecropper</option>
              <option value="Artisan / Small Trader">Artisan / Small Trader</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <select
              value={vulnerabilityFilter}
              onChange={(e) => setVulnerabilityFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Vulnerability Classes</option>
              <option value="SC/ST Category">SC/ST Category</option>
              <option value="BPL (Below Poverty Line)">BPL Category</option>
              <option value="Women-Headed Household">Women-Headed</option>
              <option value="Elderly / Disabled">Elderly / Disabled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Census Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">PAF ID &amp; Head of Family</th>
                <th className="px-4 py-3">Village / Tehsil</th>
                <th className="px-4 py-3">Occupancy Category</th>
                <th className="px-4 py-3">Vulnerability</th>
                <th className="px-4 py-3 text-center">eKYC</th>
                <th className="px-4 py-3 text-center">Entitlement Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filtered.map((fam) => (
                <tr key={fam.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs font-black text-purple-950">{fam.id}</div>
                    <div className="font-bold text-slate-900">{fam.familyHeadName}</div>
                    <div className="text-[10px] text-slate-400">
                      Members: {fam.familyMembersCount} • Aadhaar: {fam.aadhaarMasked}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-800">{fam.village}</div>
                    <div className="text-[10px] text-slate-500">
                      {fam.tehsil}, {fam.district}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span className="rounded-md bg-purple-50 text-purple-900 font-bold px-2 py-0.5 text-[10px]">
                      {fam.occupancyType}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[140px]">
                      {fam.primaryLivelihood}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        fam.vulnerabilityFlag === 'General'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {fam.vulnerabilityFlag}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center">
                    {fam.biometricEkycVerified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                        Pending
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-center">
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
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedFamily(fam)}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                      >
                        Inspect Dossier
                      </button>

                      {fam.claimStatus === 'Census Enrolled' && (
                        <button
                          onClick={() => onApproveFamily(fam.id)}
                          className="rounded-lg bg-purple-900 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-purple-850 cursor-pointer"
                        >
                          Approve Entitlements
                        </button>
                      )}

                      {fam.claimStatus === 'Entitlement Approved' && (
                        <button
                          onClick={() => onDisbursePackage(fam.id)}
                          className="rounded-lg bg-emerald-700 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-800 cursor-pointer"
                        >
                          Disburse Package
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Dossier Modal */}
      {selectedFamily && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-purple-900" />
                <h3 className="text-sm font-black text-slate-900">
                  PAF Social Dossier &amp; Entitlements
                </h3>
              </div>
              <button
                onClick={() => setSelectedFamily(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-lg bg-purple-50 p-3 space-y-1">
                <div className="font-mono font-bold text-purple-950">{selectedFamily.id}</div>
                <div className="font-bold text-slate-900 text-sm">
                  {selectedFamily.familyHeadName}
                </div>
                <div className="text-slate-600">
                  {selectedFamily.village}, {selectedFamily.tehsil} • {selectedFamily.occupancyType}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Vulnerability</span>
                  <span className="font-bold text-slate-800">
                    {selectedFamily.vulnerabilityFlag}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Primary Trade</span>
                  <span className="font-bold text-slate-800">
                    {selectedFamily.primaryLivelihood}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Housing Unit</span>
                  <span className="font-bold text-emerald-700">
                    {selectedFamily.eligibleEntitlements.housingSiteLocation || 'PMAY Standard'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">
                    Subsistence Grant
                  </span>
                  <span className="font-bold text-purple-900">
                    ₹{selectedFamily.eligibleEntitlements.subsistenceGrantAmount} (1 Year)
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">
                    Relocation Allowance
                  </span>
                  <span className="font-bold text-slate-800">
                    ₹{selectedFamily.eligibleEntitlements.resettlementAllowanceOneTime}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Cattle Shed Grant</span>
                  <span className="font-bold text-slate-800">
                    ₹{selectedFamily.eligibleEntitlements.cattleShedGrant}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                onClick={() => setSelectedFamily(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Family Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleCreateSubmit}
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">
                Enroll New Affected Family (Census)
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Head of Household Full Name
                </label>
                <input
                  type="text"
                  required
                  value={headName}
                  onChange={(e) => setHeadName(e.target.value)}
                  placeholder="e.g. Rameshwar Kisan Thorat"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="+91 98..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Family Members Count
                  </label>
                  <input
                    type="number"
                    value={membersCount}
                    onChange={(e) => setMembersCount(Number(e.target.value))}
                    min={1}
                    max={20}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Occupancy Status
                  </label>
                  <select
                    value={occupancy}
                    onChange={(e) => setOccupancy(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    <option value="Tenant Farmer">Tenant Farmer</option>
                    <option value="Agricultural Laborer">Agricultural Laborer</option>
                    <option value="Sharecropper">Sharecropper</option>
                    <option value="Artisan / Small Trader">Artisan / Small Trader</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Vulnerability Category
                  </label>
                  <select
                    value={vulnerability}
                    onChange={(e) => setVulnerability(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    <option value="BPL (Below Poverty Line)">BPL (Below Poverty Line)</option>
                    <option value="SC/ST Category">SC/ST Category</option>
                    <option value="Women-Headed Household">Women-Headed Household</option>
                    <option value="Elderly / Disabled">Elderly / Disabled</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Primary Livelihood / Trade
                </label>
                <input
                  type="text"
                  value={livelihood}
                  onChange={(e) => setLivelihood(e.target.value)}
                  placeholder="e.g. Farm Labor, Carpentry, Dairy..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-purple-900 px-4 py-2 text-xs font-bold text-white hover:bg-purple-850 cursor-pointer shadow-xs"
              >
                Enroll in Census &rarr;
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
