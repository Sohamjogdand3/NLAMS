import { useState } from 'react'
import { ChevronRight, Search, CheckCircle2, Clock, Calendar } from 'lucide-react'
import type { FieldParcelTask } from '../../types/surveyor'

interface SurveyorListProps {
  parcels: FieldParcelTask[]
  onOpenSurvey: (parcelId: string) => void
}

export default function SurveyorList({ parcels, onOpenSurvey }: SurveyorListProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')

  const filtered = parcels.filter((p) => {
    const matchesSearch =
      p.khasraGatNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.ownerNameRecord.toLowerCase().includes(search.toLowerCase()) ||
      p.village.toLowerCase().includes(search.toLowerCase())

    if (!matchesSearch) return false
    if (filter === 'pending') return p.surveyStatus !== 'Survey_Completed' && p.surveyStatus !== 'Synced_To_State_Cloud'
    if (filter === 'completed') return p.surveyStatus === 'Survey_Completed' || p.surveyStatus === 'Synced_To_State_Cloud'
    return true
  })

  const todayList = filtered.filter((p) => p.scheduleDate === 'Today')
  const tomorrowList = filtered.filter((p) => p.scheduleDate === 'Tomorrow')
  const completedList = filtered.filter((p) => p.surveyStatus === 'Survey_Completed' || p.surveyStatus === 'Synced_To_State_Cloud')

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          My Surveys
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Tap any survey to open the guided inspection workflow.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Gat no, owner, or village..."
          className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#042A5E] focus:outline-hidden focus:ring-2 focus:ring-[#042A5E]/10"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
            filter === 'all' ? 'bg-[#042A5E] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All ({parcels.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('pending')}
          className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
            filter === 'pending' ? 'bg-[#042A5E] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Pending ({parcels.filter((p) => p.surveyStatus !== 'Survey_Completed').length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('completed')}
          className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
            filter === 'completed' ? 'bg-[#042A5E] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Completed ({completedList.length})
        </button>
      </div>

      {/* TODAY SECTION */}
      {todayList.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-500">
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            <span>Today</span>
          </div>

          <div className="space-y-2">
            {todayList.map((p) => (
              <SurveyItemCard key={p.id} parcel={p} onOpen={() => onOpenSurvey(p.id)} />
            ))}
          </div>
        </div>
      )}

      {/* TOMORROW SECTION */}
      {tomorrowList.length > 0 && (
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-500">
            <Calendar className="h-3.5 w-3.5 text-blue-600" />
            <span>Tomorrow</span>
          </div>

          <div className="space-y-2">
            {tomorrowList.map((p) => (
              <SurveyItemCard key={p.id} parcel={p} onOpen={() => onOpenSurvey(p.id)} />
            ))}
          </div>
        </div>
      )}

      {/* COMPLETED SECTION (When viewing all or completed) */}
      {filter !== 'pending' && completedList.length > 0 && (
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-500">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Completed</span>
          </div>

          <div className="space-y-2">
            {completedList.map((p) => (
              <SurveyItemCard key={p.id} parcel={p} onOpen={() => onOpenSurvey(p.id)} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SurveyItemCard({ parcel, onOpen }: { parcel: FieldParcelTask; onOpen: () => void }) {
  const isCompleted = parcel.surveyStatus === 'Survey_Completed' || parcel.surveyStatus === 'Synced_To_State_Cloud'
  const inProgress = parcel.surveyStatus === 'Boundary_Walk_In_Progress'

  return (
    <div
      onClick={onOpen}
      className="rounded-2xl border border-slate-200 bg-white p-4 hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between"
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-slate-900 font-mono">
            {parcel.khasraGatNumber}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
              isCompleted
                ? 'bg-emerald-100 text-emerald-800'
                : inProgress
                ? 'bg-purple-100 text-purple-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isCompleted ? 'bg-emerald-600' : inProgress ? 'bg-purple-600 animate-pulse' : 'bg-amber-600'
              }`}
            />
            {isCompleted ? 'Completed' : inProgress ? 'In Progress' : 'Assigned'}
          </span>
        </div>

        <div className="text-xs font-bold text-slate-700">{parcel.ownerNameRecord}</div>
        <div className="text-[11px] text-slate-500">
          {parcel.village} • {parcel.prescribedAreaHectares} ha
        </div>
      </div>

      <ChevronRight className="h-5 w-5 text-slate-400 shrink-0" />
    </div>
  )
}
