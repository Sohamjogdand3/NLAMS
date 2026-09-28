import { useState } from 'react'
import RnRHeader from '../components/rnr/RnRHeader'
import RnRSidebar from '../components/rnr/RnRSidebar'
import RnROverview from '../components/rnr/RnROverview'
import RnRAffectedFamiliesCensus from '../components/rnr/RnRAffectedFamiliesCensus'
import RnREntitlementPackages from '../components/rnr/RnREntitlementPackages'
import RnRCommunityAssets from '../components/rnr/RnRCommunityAssets'
import SiaCommissioningPanel from '../components/rnr/SiaCommissioningPanel'
import type {
  RnRNavigationTab,
  AffectedFamilyRecord,
  CommunityAssetRecord,
  SiaReviewItem,
} from '../types/rnr'
import {
  MOCK_AFFECTED_FAMILIES,
  MOCK_COMMUNITY_ASSETS,
  MOCK_SIA_REVIEWS,
} from '../data/mockRnrData'

export default function RnRAdminDashboard() {
  const [activeTab, setActiveTab] = useState<RnRNavigationTab>('overview')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const [families, setFamilies] = useState<AffectedFamilyRecord[]>(MOCK_AFFECTED_FAMILIES)
  const [assets, setAssets] = useState<CommunityAssetRecord[]>(MOCK_COMMUNITY_ASSETS)
  const [siaReviews, setSiaReviews] = useState<SiaReviewItem[]>(MOCK_SIA_REVIEWS)

  const pendingGrievances = families.filter((f) => f.claimStatus === 'Grievance Under Review').length

  const handleApproveFamily = (familyId: string) => {
    setFamilies((prev) =>
      prev.map((f) =>
        f.id === familyId
          ? {
              ...f,
              claimStatus: 'Entitlement Approved' as const,
              lastUpdated: new Date().toISOString().split('T')[0],
            }
          : f
      )
    )
  }

  const handleDisbursePackage = (familyId: string) => {
    setFamilies((prev) =>
      prev.map((f) =>
        f.id === familyId
          ? {
              ...f,
              claimStatus: 'Package Disbursed' as const,
              lastUpdated: new Date().toISOString().split('T')[0],
            }
          : f
      )
    )
  }

  const handleAddFamily = (newFam: Omit<AffectedFamilyRecord, 'id' | 'lastUpdated'>) => {
    const id = `PAF-MH-PUN-010${families.length + 1}`
    const lastUpdated = new Date().toISOString().split('T')[0]
    setFamilies((prev) => [{ ...newFam, id, lastUpdated }, ...prev])
  }

  const handleAddAsset = (newAsset: Omit<CommunityAssetRecord, 'id'>) => {
    const id = `ASSET-MH-0${assets.length + 1}`
    setAssets((prev) => [{ ...newAsset, id }, ...prev])
  }

  const handleUpdateAssetStatus = (
    assetId: string,
    status: CommunityAssetRecord['workStatus']
  ) => {
    setAssets((prev) => prev.map((a) => (a.id === assetId ? { ...a, workStatus: status } : a)))
  }

  const handleIssueSiaClearance = (reviewId: string) => {
    setSiaReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? { ...r, section7ClearanceStatus: 'Clearance Issued' as const }
          : r
      )
    )
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 text-slate-800 font-sans antialiased">
      {/* Sidebar */}
      <RnRSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        pendingCensusCount={families.length}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <RnRHeader
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          pendingGrievancesCount={pendingGrievances}
          onNotificationClick={() => setActiveTab('census')}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {activeTab === 'overview' && (
              <RnROverview
                families={families}
                assets={assets}
                siaReviews={siaReviews}
                onSelectTab={setActiveTab}
              />
            )}

            {activeTab === 'census' && (
              <RnRAffectedFamiliesCensus
                families={families}
                onApproveFamily={handleApproveFamily}
                onDisbursePackage={handleDisbursePackage}
                onAddFamily={handleAddFamily}
              />
            )}

            {activeTab === 'entitlements' && (
              <RnREntitlementPackages families={families} />
            )}

            {activeTab === 'community-assets' && (
              <RnRCommunityAssets
                assets={assets}
                onAddAsset={handleAddAsset}
                onUpdateStatus={handleUpdateAssetStatus}
              />
            )}

            {activeTab === 'sia-clearance' && (
              <SiaCommissioningPanel
                reviews={siaReviews}
                onIssueClearance={handleIssueSiaClearance}
              />
            )}

            {activeTab === 'disbursals' && (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xs space-y-3">
                <h3 className="text-base font-black text-slate-900">
                  Direct Benefit Transfer (DBT) &amp; Resettlement Disbursals Ledger
                </h3>
                <p className="text-xs text-slate-500 max-w-xl mx-auto">
                  PFMS and Aadhaar-enabled payments bridge for monthly subsistence grants (₹3,000/mo), one-time shifting assistance (₹50,000), and cattle shed allowances disbursed directly into verified bank accounts.
                </p>
                <div className="pt-4 flex justify-center gap-3">
                  <button
                    onClick={() => alert('Generating PFMS DBT Disbursal Batch File...')}
                    className="rounded-xl bg-purple-900 px-4 py-2 text-xs font-bold text-white hover:bg-purple-850 transition-colors cursor-pointer"
                  >
                    Generate DBT Batch Export (XML)
                  </button>
                  <button
                    onClick={() => alert('Exporting Social Audit Ledger (CSV)...')}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Export Social Ledger (CSV)
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
