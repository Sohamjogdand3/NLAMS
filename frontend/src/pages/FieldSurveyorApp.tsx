import { useState } from 'react'
import SurveyorHeader from '../components/surveyor/SurveyorHeader'
import SurveyorGpsTracker from '../components/surveyor/SurveyorGpsTracker'
import SurveyorAssetAudit from '../components/surveyor/SurveyorAssetAudit'
import SurveyorSpotVerification from '../components/surveyor/SurveyorSpotVerification'
import SurveyorSyncQueue from '../components/surveyor/SurveyorSyncQueue'
import type { FieldParcelTask, SurveyorTab } from '../types/surveyor'
import { MOCK_SURVEY_TASKS } from '../data/mockSurveyorData'
import {
  Layers,
  MapPin,
  Trees,
  UserCheck,
  CloudUpload,
  ChevronRight,
} from 'lucide-react'

export default function FieldSurveyorApp() {
  const [activeTab, setActiveTab] = useState<SurveyorTab>('parcels')
  const [isOnline, setIsOnline] = useState(true)
  const [parcels, setParcels] = useState<FieldParcelTask[]>(MOCK_SURVEY_TASKS)
  const [selectedParcelId, setSelectedParcelId] = useState<string>(MOCK_SURVEY_TASKS[0]?.id || '')

  const activeParcel = parcels.find((p) => p.id === selectedParcelId) || parcels[0]
  const queuedCount = parcels.filter((p) => p.offlineCached).length

  const handleSaveGps = (
    measuredArea: number,
    variance: number,
    coordsCount: number,
    isDisputed: boolean
  ) => {
    setParcels((prev) =>
      prev.map((p) =>
        p.id === activeParcel.id
          ? {
              ...p,
              measuredAreaHectares: measuredArea,
              variancePercentage: variance,
              gpsCoordinatesCount: coordsCount,
              isDisputedBoundary: isDisputed,
              surveyStatus: 'Boundary_Walk_In_Progress' as const,
              offlineCached: true,
              lastSurveyTimestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
            }
          : p
      )
    )
  }

  const handleSaveAssets = (
    trees: FieldParcelTask['treesSurveyed'],
    structures: FieldParcelTask['structuresCount'],
    photoCount: number
  ) => {
    setParcels((prev) =>
      prev.map((p) =>
        p.id === activeParcel.id
          ? {
              ...p,
              treesSurveyed: trees,
              structuresCount: structures,
              photoCount,
              surveyStatus: 'Assets_Audited' as const,
              offlineCached: true,
              lastSurveyTimestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
            }
          : p
      )
    )
  }

  const handleCompleteVerification = () => {
    setParcels((prev) =>
      prev.map((p) =>
        p.id === activeParcel.id
          ? {
              ...p,
              surveyStatus: 'Survey_Completed' as const,
              offlineCached: true,
              lastSurveyTimestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
            }
          : p
      )
    )
  }

  const handleSyncAll = () => {
    setParcels((prev) =>
      prev.map((p) =>
        p.offlineCached
          ? {
              ...p,
              surveyStatus: 'Synced_To_State_Cloud' as const,
              offlineCached: false,
            }
          : p
      )
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 text-slate-800 font-sans antialiased pb-20">
      {/* Mobile Header */}
      <SurveyorHeader
        isOnline={isOnline}
        onToggleOnline={() => setIsOnline(!isOnline)}
        accuracyMeters={3}
        queuedCount={queuedCount}
      />

      {/* Main Mobile Screen Body */}
      <main className="flex-1 p-3.5 sm:p-5 max-w-lg mx-auto w-full">
        {/* PARCEL SELECTION TAB */}
        {activeTab === 'parcels' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <h2 className="text-sm font-black text-slate-900">
                Assigned Joint Measurement Surveys ({parcels.length})
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Select a cadastral parcel to begin boundary walk, tree counting, and on-site farmer verification.
              </p>
            </div>

            <div className="space-y-3">
              {parcels.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedParcelId(p.id)
                    setActiveTab('gps-walk')
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-xs ${
                    selectedParcelId === p.id
                      ? 'border-[#042A5E] bg-white ring-2 ring-[#042A5E]/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-[#042A5E]">
                      {p.khasraGatNumber}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9.5px] font-bold ${
                        p.surveyStatus === 'Synced_To_State_Cloud'
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.surveyStatus === 'Survey_Completed'
                          ? 'bg-blue-100 text-blue-800'
                          : p.surveyStatus === 'Boundary_Walk_In_Progress'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {p.surveyStatus.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 mt-1">{p.ownerNameRecord}</h3>
                  <div className="text-[11px] text-slate-500">
                    {p.village}, {p.tehsil} • <strong>{p.prescribedAreaHectares} Ha</strong>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                    <span>GPS Pts: {p.gpsCoordinatesCount} • Photos: {p.photoCount}</span>
                    <span className="font-bold text-[#042A5E] flex items-center gap-0.5">
                      Open Survey <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GPS WALK TAB */}
        {activeTab === 'gps-walk' && (
          <SurveyorGpsTracker parcel={activeParcel} onSaveGpsData={handleSaveGps} />
        )}

        {/* ASSET AUDIT TAB */}
        {activeTab === 'asset-audit' && (
          <SurveyorAssetAudit parcel={activeParcel} onSaveAssets={handleSaveAssets} />
        )}

        {/* SPOT VERIFICATION TAB */}
        {activeTab === 'verification' && (
          <SurveyorSpotVerification
            parcel={activeParcel}
            onCompleteVerification={handleCompleteVerification}
          />
        )}

        {/* SYNC QUEUE TAB */}
        {activeTab === 'sync-queue' && (
          <SurveyorSyncQueue
            parcels={parcels}
            isOnline={isOnline}
            onSyncAll={handleSyncAll}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1.5 shadow-lg flex items-center justify-around max-w-lg mx-auto">
        <button
          type="button"
          onClick={() => setActiveTab('parcels')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'parcels' ? 'text-[#042A5E] font-bold' : 'text-slate-400'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span className="text-[10px] mt-0.5">Parcels</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('gps-walk')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'gps-walk' ? 'text-[#042A5E] font-bold' : 'text-slate-400'
          }`}
        >
          <MapPin className="h-4 w-4" />
          <span className="text-[10px] mt-0.5">GPS Walk</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('asset-audit')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'asset-audit' ? 'text-[#042A5E] font-bold' : 'text-slate-400'
          }`}
        >
          <Trees className="h-4 w-4" />
          <span className="text-[10px] mt-0.5">Assets</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('verification')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'verification' ? 'text-[#042A5E] font-bold' : 'text-slate-400'
          }`}
        >
          <UserCheck className="h-4 w-4" />
          <span className="text-[10px] mt-0.5">eKYC</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sync-queue')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors relative cursor-pointer ${
            activeTab === 'sync-queue' ? 'text-[#042A5E] font-bold' : 'text-slate-400'
          }`}
        >
          <CloudUpload className="h-4 w-4" />
          <span className="text-[10px] mt-0.5">Sync</span>
          {queuedCount > 0 && (
            <span className="absolute -top-1 right-1 h-3.5 w-3.5 rounded-full bg-amber-500 text-[8.5px] font-black text-[#042A5E] flex items-center justify-center">
              {queuedCount}
            </span>
          )}
        </button>
      </nav>
    </div>
  )
}
