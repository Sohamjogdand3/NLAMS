import { CheckCircle2, ChevronRight, MapPin, Play } from 'lucide-react'
import type { FieldParcelTask } from '../../types/surveyor'

interface SurveyorHomeProps {
  parcels: FieldParcelTask[]
  onOpenSurvey: (parcelId: string) => void
  onNavigateToSurveys: () => void
  onNavigateToMap: () => void
  officerName?: string
  isOnline?: boolean
}

export default function SurveyorHome({
  parcels,
  onOpenSurvey,
  onNavigateToSurveys,
  onNavigateToMap,
  officerName = 'Ramesh Kadam',
  isOnline = true,
}: SurveyorHomeProps) {
  // Compute greeting based on time of day
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const todayParcels = parcels.filter((p) => p.scheduleDate === 'Today' || p.surveyStatus === 'Boundary_Walk_In_Progress')
  const completedToday = parcels.filter((p) => p.surveyStatus === 'Survey_Completed' || p.surveyStatus === 'Synced_To_State_Cloud').length
  const inProgressParcel = parcels.find((p) => p.surveyStatus === 'Boundary_Walk_In_Progress') || todayParcels[0]
  const upcomingParcels = parcels.filter((p) => p.id !== inProgressParcel?.id).slice(0, 3)

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Officer Greeting & Context */}
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Field Inspection Portal
          </span>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-full shadow-2xs">
            <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span>{isOnline ? 'GPS & Cloud Active' : 'Offline Mode'}</span>
          </div>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
          {greeting}, {officerName}
        </h1>
        <p className="text-sm text-slate-600 mt-0.5">
          Haveli Taluka Cadastral Division • Pune
        </p>
      </div>

      {/* 2. Today Summary Minimal Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Today's Assignment
          </span>
          <span className="text-xs font-semibold text-slate-600">
            {todayParcels.length} scheduled
          </span>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-black text-slate-900">{todayParcels.length}</span>
          <span className="text-sm font-bold text-slate-500">surveys assigned</span>
        </div>

        <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          <span>{completedToday} completed today</span>
        </div>
      </div>

      {/* 3. Primary Action: One Obvious Button */}
      {inProgressParcel && (
        <div className="rounded-2xl border-2 border-[#042A5E]/20 bg-gradient-to-br from-[#042A5E] to-[#0A3D7E] p-5 text-white shadow-md">
          <div className="flex items-center justify-between text-xs font-semibold text-white/80">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              Active Field Survey
            </span>
            <span className="font-mono text-white/90">{inProgressParcel.khasraGatNumber}</span>
          </div>

          <h3 className="text-xl font-black text-white mt-2">
            {inProgressParcel.ownerNameRecord}
          </h3>
          <p className="text-xs text-white/80 mt-0.5">
            {inProgressParcel.village} • {inProgressParcel.prescribedAreaHectares} Hectares
          </p>

          <button
            type="button"
            onClick={() => onOpenSurvey(inProgressParcel.id)}
            className="mt-4 w-full rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-[0.98] py-3 px-4 text-sm font-black text-slate-950 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="h-4 w-4 fill-slate-950" />
            <span>CONTINUE SURVEY</span>
          </button>
        </div>
      )}

      {/* 4. Upcoming Queue List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
            Upcoming Parcels
          </h3>
          <button
            type="button"
            onClick={onNavigateToSurveys}
            className="text-xs font-bold text-[#042A5E] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>View All</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {upcomingParcels.map((p) => (
            <div
              key={p.id}
              onClick={() => onOpenSurvey(p.id)}
              className="rounded-xl border border-slate-200 bg-white p-3.5 hover:border-slate-300 transition-all cursor-pointer shadow-2xs flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900 font-mono">
                    {p.khasraGatNumber}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {p.village}
                  </span>
                </div>
                <div className="text-xs text-slate-600 font-semibold mt-0.5">
                  {p.ownerNameRecord} • {p.prescribedAreaHectares} ha
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    p.surveyStatus === 'Survey_Completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : p.surveyStatus === 'Boundary_Walk_In_Progress'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {p.surveyStatus === 'Survey_Completed' ? 'Completed' : p.surveyStatus === 'Boundary_Walk_In_Progress' ? 'In Progress' : 'Assigned'}
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Quick Map & Sync Status Footer */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-[#042A5E]" />
          <span>Cadastral Map Ready</span>
        </div>
        <button
          type="button"
          onClick={onNavigateToMap}
          className="font-bold text-[#042A5E] hover:underline cursor-pointer"
        >
          Open Map View
        </button>
      </div>
    </div>
  )
}
