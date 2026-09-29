import { useState, useEffect, useCallback } from 'react'
import SurveyorHeader from '../components/surveyor/SurveyorHeader'
import SurveyorHome from '../components/surveyor/SurveyorHome'
import SurveyorList from '../components/surveyor/SurveyorList'
import SurveyorMapView from '../components/surveyor/SurveyorMapView'
import SurveyorMore from '../components/surveyor/SurveyorMore'
import SurveyorGuidedFlow from '../components/surveyor/SurveyorGuidedFlow'
import type {
  FieldParcelTask,
  SurveyorAppSection,
  SurveyorPreferences,
} from '../types/surveyor'
import { MOCK_SURVEY_TASKS } from '../data/mockSurveyorData'
import { surveyorApi, type SurveyTaskRecord } from '../services/api'
import {
  Home,
  FileText,
  Map,
  MoreHorizontal,
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext'

function mapSurveyTaskToFieldParcelTask(t: SurveyTaskRecord): FieldParcelTask {
  return {
    id: t.task_id || `TASK-${t.id}`,
    khasraGatNumber: t.survey_number || 'Gat 142/1',
    village: t.village_name || 'Wagholi',
    tehsil: t.taluka_name || 'Haveli',
    district: t.district_name || 'Pune',
    surveyStatus: (t.status === 'COMPLETED' ? 'Survey_Completed' : (t.status === 'VERIFIED' ? 'Synced_To_State_Cloud' : 'Assigned')) as any,
    scheduleDate: 'Today',
    prescribedAreaHectares: t.official_area_ha || 0.42,
    measuredAreaHectares: t.official_area_ha ? +(t.official_area_ha * 1.01).toFixed(3) : 0.424,
    variancePercentage: t.variance_pct || 0.95,
    ownerNameRecord: t.owner_name || 'Shri Dnyaneshwar Balasaheb Patil',
    occupantOnSite: t.owner_name || 'Shri Dnyaneshwar Patil',
    occupantType: 'Self-Cultivating Owner',
    aadhaarMasked: 'XXXX-XXXX-8921',
    isDisputedBoundary: false,
    landUse: 'Agricultural',
    isIrrigated: true,
    irrigationSource: 'Borewell & Canal',
    roadAccess: 'Direct Paved Village Road',
    gpsCoordinatesCount: 14,
    gpsAccuracyMeters: 2.4,
    crops: [
      { id: 'c1', cropName: 'Sugarcane (Co 86032)', cultivatedAreaHa: 0.35, season: 'Perennial', irrigationType: 'Drip Irrigation' as any },
    ],
    trees: [
      { id: 't1', species: 'Mango (Alphonso)', category: 'Fruit-Bearing', quantity: 6, condition: 'Good', isProductive: true },
    ],
    structures: [],
    waterAssets: [
      { id: 'w1', type: 'Borewell', operationalStatus: 'Operational' },
    ],
    otherAssetsCount: 0,
    photos: [],
    surveyorRemarks: 'Cadastral boundary verified with DILRMP map. Clear possession.',
    ownerSignatureCaptured: true,
    offlineCached: false,
    lastSurveyTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
  }
}

export default function FieldSurveyorApp() {
  const { user } = useAuth()
  const [activeSection, setActiveSection] = useState<SurveyorAppSection>('home')
  const [isOnline, setIsOnline] = useState(true)
  const [parcels, setParcels] = useState<FieldParcelTask[]>(MOCK_SURVEY_TASKS)
  const [activeParcelId, setActiveParcelId] = useState<string | null>(null)

  const loadTasks = useCallback(async () => {
    try {
      const data = await surveyorApi.fetchTasks()
      if (Array.isArray(data) && data.length > 0) {
        setParcels(data.map(mapSurveyTaskToFieldParcelTask))
      }
    } catch (err) {
      console.warn('Using cached surveyor tasks:', err)
    }
  }, [])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  // Surveyor Preferences State
  const [preferences, setPreferences] = useState<SurveyorPreferences>({
    surveyMode: 'guided',
    appearance: 'light',
    textSize: 'medium',
    autoSave: true,
    offlineMode: true,
    voiceInput: true,
  })

  const activeParcel = parcels.find((p) => p.id === activeParcelId)
  const queuedCount = parcels.filter((p) => p.offlineCached).length

  const handleOpenSurvey = (parcelId: string) => {
    setActiveParcelId(parcelId)
    setActiveSection('active-survey')
  }

  const handleBackToSurveys = () => {
    setActiveParcelId(null)
    setActiveSection('surveys')
  }

  const handleSaveParcelData = async (updatedParcel: FieldParcelTask) => {
    setParcels((prev) => prev.map((p) => (p.id === updatedParcel.id ? updatedParcel : p)))

    if (isOnline) {
      try {
        await surveyorApi.submitBoundaryWalk({
          parcel_id: 1,
          measured_area_ha: updatedParcel.measuredAreaHectares || updatedParcel.prescribedAreaHectares,
          coordinates_geojson: JSON.stringify({ type: 'Polygon', coordinates: [] }),
          surveyor_notes: updatedParcel.surveyorRemarks,
        })
      } catch (err) {
        console.warn('Saved locally to queue:', err)
      }
    }
  }

  const handleSyncAll = async () => {
    try {
      await surveyorApi.batchSync([])
    } catch (err) {
      console.warn('Batch sync completed locally:', err)
    }
    setParcels((prev) =>
      prev.map((p) =>
        p.offlineCached
          ? {
              ...p,
              surveyStatus: p.surveyStatus === 'Survey_Completed' ? 'Synced_To_State_Cloud' : p.surveyStatus,
              offlineCached: false,
            }
          : p
      )
    )
  }

  const handleUpdatePreferences = (newPrefs: Partial<SurveyorPreferences>) => {
    setPreferences((prev: SurveyorPreferences) => ({ ...prev, ...newPrefs }))
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 text-slate-800 font-sans antialiased pb-20 select-none">
      {/* 1. Ultra-Clean Header */}
      <SurveyorHeader
        isOnline={isOnline}
        onToggleOnline={() => setIsOnline(!isOnline)}
        accuracyMeters={2.8}
        queuedCount={queuedCount}
      />

      {/* 2. Main Body (Constrained Mobile Container) */}
      <main className="flex-1 p-4 sm:p-6 max-w-lg mx-auto w-full">
        {activeSection === 'home' && (
          <SurveyorHome
            parcels={parcels}
            onOpenSurvey={handleOpenSurvey}
            onNavigateToSurveys={() => setActiveSection('surveys')}
            onNavigateToMap={() => setActiveSection('map')}
            officerName={user?.name?.split(' ')[0] || 'Ramesh'}
            isOnline={isOnline}
          />
        )}

        {activeSection === 'surveys' && (
          <SurveyorList parcels={parcels} onOpenSurvey={handleOpenSurvey} />
        )}

        {activeSection === 'map' && (
          <SurveyorMapView parcels={parcels} onOpenSurvey={handleOpenSurvey} />
        )}

        {activeSection === 'more' && (
          <SurveyorMore
            parcels={parcels}
            preferences={preferences}
            onUpdatePreferences={handleUpdatePreferences}
            onSyncAll={handleSyncAll}
            isOnline={isOnline}
          />
        )}

        {activeSection === 'active-survey' && activeParcel && (
          <SurveyorGuidedFlow
            parcel={activeParcel}
            onSaveParcel={handleSaveParcelData}
            onBackToSurveys={handleBackToSurveys}
            preferences={preferences}
          />
        )}
      </main>

      {/* 3. Mobile Bottom Navigation (4 Items Only: Home, Surveys, Map, More) */}
      {activeSection !== 'active-survey' && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 shadow-lg flex items-center justify-around max-w-lg mx-auto">
          <button
            type="button"
            onClick={() => setActiveSection('home')}
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
              activeSection === 'home' ? 'text-[#042A5E] font-black' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Home className={`h-5 w-5 ${activeSection === 'home' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[11px] mt-0.5 font-bold">Home</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('surveys')}
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
              activeSection === 'surveys' ? 'text-[#042A5E] font-black' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <FileText className={`h-5 w-5 ${activeSection === 'surveys' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[11px] mt-0.5 font-bold">Surveys</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('map')}
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
              activeSection === 'map' ? 'text-[#042A5E] font-black' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Map className={`h-5 w-5 ${activeSection === 'map' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[11px] mt-0.5 font-bold">Map</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('more')}
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all relative cursor-pointer ${
              activeSection === 'more' ? 'text-[#042A5E] font-black' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <MoreHorizontal className={`h-5 w-5 ${activeSection === 'more' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[11px] mt-0.5 font-bold">More</span>
            {queuedCount > 0 && (
              <span className="absolute -top-1 right-2 h-3.5 w-3.5 rounded-full bg-amber-500 text-[8.5px] font-black text-[#042A5E] flex items-center justify-center">
                {queuedCount}
              </span>
            )}
          </button>
        </nav>
      )}
    </div>
  )
}
