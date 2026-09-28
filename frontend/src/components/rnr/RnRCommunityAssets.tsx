import { useState } from 'react'
import {
  Building,
  Plus,
} from 'lucide-react'
import type { CommunityAssetRecord } from '../../types/rnr'

interface RnRCommunityAssetsProps {
  assets: CommunityAssetRecord[]
  onAddAsset: (asset: Omit<CommunityAssetRecord, 'id'>) => void
  onUpdateStatus: (assetId: string, status: CommunityAssetRecord['workStatus']) => void
}

export default function RnRCommunityAssets({
  assets,
  onAddAsset,
  onUpdateStatus,
}: RnRCommunityAssetsProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [name, setName] = useState('')
  const [village] = useState('Wagholi')
  const [district] = useState('Pune')
  const [type, setType] =
    useState<CommunityAssetRecord['assetType']>('Temple / Religious Site')
  const [area, setArea] = useState(500)
  const [cost, setCost] = useState(0.75)
  const [plan, setPlan] =
    useState<CommunityAssetRecord['reconstructionPlan']>('Relocation & Reconstruction')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    onAddAsset({
      assetName: name,
      village,
      district,
      assetType: type,
      extentAreaSqm: area,
      reconstructionPlan: plan,
      estimatedCostCr: cost,
      gramPanchayatConsentSigned: true,
      workStatus: 'Pending Tender',
    })

    setShowAddModal(false)
    setName('')
  }

  const totalCost = assets.reduce((acc, a) => acc + a.estimatedCostCr, 0)
  const commissioned = assets.filter((a) => a.workStatus === 'Commissioned').length

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Building className="h-5 w-5 text-purple-900" />
              RFCTLARR Third Schedule Public &amp; Community Infrastructure
            </h2>
            <p className="text-xs text-slate-500 max-w-3xl">
              Mandatory replacement and reconstruction of village commons, grazing grounds (Gauchar), religious shrines, public drinking water sources, schools, and health sub-centers affected by alignment.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-purple-900 px-4 py-2 text-xs font-bold text-white hover:bg-purple-850 transition-colors shadow-xs shrink-0 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Register Community Asset
          </button>
        </div>
      </div>

      {/* Summary KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-bold text-slate-500">Total Infrastructure Sites</span>
          <div className="mt-2 text-2xl font-black text-slate-900">{assets.length} Assets</div>
          <p className="mt-1 text-[11px] text-slate-400">Village commons across alignment</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-bold text-slate-500">Total Replacement Escrow</span>
          <div className="mt-2 text-2xl font-black text-purple-950">₹{totalCost.toFixed(2)} Cr</div>
          <p className="mt-1 text-[11px] text-slate-400">Deposited via PIA Social Escrow</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-bold text-slate-500">Commissioned &amp; Handed Over</span>
          <div className="mt-2 text-2xl font-black text-emerald-700">
            {commissioned} of {assets.length} Completed
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Gram Panchayat handover certified</p>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {assets.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-purple-900">{item.id}</span>
                  <span className="rounded-md bg-purple-50 text-purple-900 font-bold px-2 py-0.5 text-[10px]">
                    {item.assetType}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{item.assetName}</h3>
                <div className="text-xs text-slate-500">
                  Village: <strong>{item.village}</strong>, {item.district} • Area:{' '}
                  <strong>{item.extentAreaSqm} sq.m</strong>
                </div>
              </div>

              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold shrink-0 ${
                  item.workStatus === 'Commissioned'
                    ? 'bg-emerald-100 text-emerald-800'
                    : item.workStatus === 'Under Construction'
                    ? 'bg-blue-100 text-blue-800'
                    : item.workStatus === 'Site Handed Over'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {item.workStatus}
              </span>
            </div>

            <div className="rounded-lg bg-slate-50 p-3 text-xs space-y-1.5 border border-slate-200/80">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Reconstruction Plan:</span>
                <span className="font-bold text-slate-800">{item.reconstructionPlan}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Estimated Cost:</span>
                <span className="font-bold text-purple-950 font-mono">
                  ₹{item.estimatedCostCr.toFixed(2)} Cr
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Gram Panchayat Consent:</span>
                <span
                  className={`font-bold ${
                    item.gramPanchayatConsentSigned ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {item.gramPanchayatConsentSigned ? 'Signed & Gazetted' : 'Pending Resolution'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400">Schedule III Compliance Verified</span>
              {item.workStatus !== 'Commissioned' && (
                <button
                  onClick={() =>
                    onUpdateStatus(
                      item.id,
                      item.workStatus === 'Pending Tender'
                        ? 'Site Handed Over'
                        : item.workStatus === 'Site Handed Over'
                        ? 'Under Construction'
                        : 'Commissioned'
                    )
                  }
                  className="rounded-lg bg-purple-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-purple-850 cursor-pointer transition-colors"
                >
                  Advance Stage &rarr;
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">
                Register Schedule III Community Asset
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
                  Community Asset Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Gram Panchayat Community Well / Mandir"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Asset Classification
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    <option value="Temple / Religious Site">Temple / Religious Site</option>
                    <option value="Gauchar (Grazing Land)">Gauchar (Grazing Land)</option>
                    <option value="Public Drinking Well">Public Drinking Well</option>
                    <option value="Anganwadi / School">Anganwadi / School</option>
                    <option value="Cremation / Burial Ground">Cremation / Burial Ground</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Extent Area (sq.m)
                  </label>
                  <input
                    type="number"
                    value={area}
                    onChange={(e) => setArea(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Reconstruction Plan
                  </label>
                  <select
                    value={plan}
                    onChange={(e) => setPlan(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    <option value="Relocation & Reconstruction">Relocation &amp; Reconstruction</option>
                    <option value="Alternate Government Land Allotment">Alternate Govt Land</option>
                    <option value="Cash Escrow Disbursal to Gram Panchayat">Cash Escrow Disbursal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Estimated Cost (₹ Crores)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={cost}
                    onChange={(e) => setCost(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-900"
                  />
                </div>
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
                Register Asset &rarr;
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
