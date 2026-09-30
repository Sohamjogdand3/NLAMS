import { useState, useEffect, useCallback } from 'react'
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
import { rnrApi, proposalsApi } from '../services/api'
import WorkflowMatrixAuditComponent from '../components/common/WorkflowMatrixAuditComponent'
import { Loader2 } from 'lucide-react'

export default function RnRAdminDashboard() {
  const [activeTab, setActiveTab] = useState<RnRNavigationTab>('overview')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeProposalId, setActiveProposalId] = useState<number>(1)
  const [loading, setLoading] = useState(true)

  const [families, setFamilies] = useState<AffectedFamilyRecord[]>(MOCK_AFFECTED_FAMILIES)
  const [assets, setAssets] = useState<CommunityAssetRecord[]>(MOCK_COMMUNITY_ASSETS)
  const [siaReviews, setSiaReviews] = useState<SiaReviewItem[]>(MOCK_SIA_REVIEWS)

  const loadRnRData = useCallback(async () => {
    try {
      setLoading(true)
      const props = await proposalsApi.fetchProposals().catch(() => [])
      const propId = (props && props.length > 0 && props[0].id) ? Number(props[0].id) : 1
      setActiveProposalId(propId)

      try {
        const censusData = await rnrApi.fetchCensus(propId)
        if (Array.isArray(censusData) && censusData.length > 0) {
          const mappedFamilies: AffectedFamilyRecord[] = censusData.map((f, idx) => ({
            id: `PAF-MH-${String(f.id || idx + 1).padStart(3, '0')}`,
            familyHeadName: f.family_head_name || 'Khatedar Head',
            contactNumber: '+91 98220 44102',
            village: f.village_name || 'Wagholi',
            tehsil: 'Haveli',
            district: 'Pune',
            aadhaarMasked: 'XXXX-XXXX-8921',
            occupancyType: 'Tenant Farmer',
            vulnerabilityFlag: f.is_bpl ? 'BPL (Below Poverty Line)' : (f.caste_category === 'SC' || f.caste_category === 'ST' ? 'SC/ST Category' : 'General'),
            familyMembersCount: f.family_members_count || 4,
            primaryLivelihood: f.primary_livelihood_source || 'Agricultural Farm Labor',
            eligibleEntitlements: {
              housingUnitAllocated: f.is_scheduled_area_displacement || false,
              housingSiteLocation: 'Wagholi Resettlement Colony Plot 12',
              subsistenceGrantAmount: 3000,
              resettlementAllowanceOneTime: 50000,
              cattleShedGrant: 25000,
              jobTrainingOpted: true,
            },
            biometricEkycVerified: true,
            claimStatus: 'Census Enrolled',
            assignedOfficer: 'Smt. Pratibha Shinde (R&R Officer)',
            lastUpdated: f.created_at ? f.created_at.split('T')[0] : '2026-09-24',
          }))
          setFamilies(mappedFamilies)
        }
      } catch (cErr) {
        console.warn('Using default affected families data:', cErr)
      }

      try {
        const assetsData = await rnrApi.fetchCommunityAssets(propId)
        if (Array.isArray(assetsData) && assetsData.length > 0) {
          const mappedAssets: CommunityAssetRecord[] = assetsData.map((a, idx) => ({
            id: `ASSET-MH-0${idx + 1}`,
            assetName: a.asset_name || 'Public Amenity',
            village: a.village_name || 'Wagholi',
            district: 'Pune',
            assetType: (a.asset_category as any) || 'Temple / Religious Site',
            extentAreaSqm: 500,
            reconstructionPlan: 'Relocation & Reconstruction',
            estimatedCostCr: a.estimated_restoration_cost_inr ? +(a.estimated_restoration_cost_inr / 10000000).toFixed(2) : 0.85,
            gramPanchayatConsentSigned: true,
            workStatus: 'Under Construction',
          }))
          setAssets(mappedAssets)
        }
      } catch (aErr) {
        console.warn('Using default community assets data:', aErr)
      }
    } catch (err) {
      console.warn('Using fallback R&R data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRnRData()
  }, [loadRnRData])

  const pendingGrievances = families.filter((f) => f.claimStatus === 'Grievance Under Review').length

  const handleApproveFamily = async (familyId: string) => {
    try {
      await rnrApi.approvePackage(1, `Entitlement package approved for family ${familyId}`)
    } catch (e) {
      console.warn('Approve package API call handled:', e)
    }
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

  const handleDisbursePackage = async (familyId: string) => {
    try {
      await rnrApi.disburseRnrBenefit({
        proposal_id: activeProposalId,
        family_id: 1,
        entitlement_package_id: 1,
        amount_inr: 111000,
        benefit_type: 'MONTHLY_SUBSISTENCE_AND_RESETTLEMENT',
      })
    } catch (e) {
      console.warn('Disburse benefit API call handled:', e)
    }
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

  const handleAddFamily = async (newFam: Omit<AffectedFamilyRecord, 'id' | 'lastUpdated'>) => {
    const id = `PAF-MH-PUN-010${families.length + 1}`
    const lastUpdated = new Date().toISOString().split('T')[0]
    try {
      await rnrApi.registerFamily({
        proposal_id: activeProposalId,
        family_head_name: newFam.familyHeadName,
        village_name: newFam.village,
        category: newFam.occupancyType,
        primary_livelihood_source: newFam.primaryLivelihood,
        caste_category: newFam.vulnerabilityFlag,
        is_scheduled_area_displacement: newFam.eligibleEntitlements.housingUnitAllocated,
        is_bpl: newFam.vulnerabilityFlag.includes('BPL'),
        family_members_count: newFam.familyMembersCount,
        dependency_years: 15,
        associated_survey_number: 'Gat 104',
      })
    } catch (e) {
      console.warn('Register family API call handled:', e)
    }
    setFamilies((prev) => [{ ...newFam, id, lastUpdated }, ...prev])
  }

  const handleAddAsset = async (newAsset: Omit<CommunityAssetRecord, 'id'>) => {
    const id = `ASSET-MH-0${assets.length + 1}`
    try {
      await rnrApi.createCommunityAsset({
        proposal_id: activeProposalId,
        village_name: newAsset.village,
        asset_name: newAsset.assetName,
        asset_category: newAsset.assetType,
        affected_extent: newAsset.reconstructionPlan,
        estimated_restoration_cost_inr: (newAsset.estimatedCostCr || 0.5) * 10000000,
      })
    } catch (e) {
      console.warn('Create community asset API call handled:', e)
    }
    setAssets((prev) => [{ ...newAsset, id }, ...prev])
  }

  const handleUpdateAssetStatus = async (
    assetId: string,
    status: CommunityAssetRecord['workStatus']
  ) => {
    try {
      await rnrApi.updateCommunityAssetStatus(assetId, status)
    } catch (e) {
      console.warn('Update asset status API call handled:', e)
    }
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
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-3">
                <Loader2 className="h-8 w-8 text-purple-900 animate-spin" />
                <span className="text-xs font-bold text-slate-600">Loading RFCTLARR Social Welfare Records...</span>
              </div>
            ) : (
              <>
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
                  <WorkflowMatrixAuditComponent />
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
