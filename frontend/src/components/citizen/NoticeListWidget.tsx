import { useState } from 'react'
import {
  FileText,
  Download,
  Eye,
  Calendar,
  Building,
  Filter,
  Search,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Sparkles,
} from 'lucide-react'
import type { NoticeItem } from '../../types/citizen'

interface NoticeListWidgetProps {
  notices: NoticeItem[]
}

export default function NoticeListWidget({ notices }: NoticeListWidgetProps) {
  const [filterType, setFilterType] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredNotices = notices.filter((n) => {
    const matchesFilter = filterType === 'ALL' || n.type === filterType
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.noticeNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.section.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">Official Notices & Publications</h3>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800 border border-amber-200">
              {notices.filter((n) => n.isNew).length} Action Pending
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Public gazette notifications, hearings, and formal award letters issued for your land parcel
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          <div className="relative w-48">
            <input
              type="text"
              placeholder="Search Notice No..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-1.5 pl-8 pr-2 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-amber-500/50"
            />
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-lg border border-slate-300 py-1.5 px-2.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500/50 bg-slate-50"
          >
            <option value="ALL">All Notice Types</option>
            <option value="Award Copy">Award Copies</option>
            <option value="Section 19">Section 19 (DBT)</option>
            <option value="Section 15">Section 15 (Hearing)</option>
            <option value="Section 11">Section 11 (Prelim)</option>
          </select>
        </div>
      </div>

      {/* Notices List */}
      <div className="space-y-3">
        {filteredNotices.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs font-medium">
            No notices match your selected filter criteria.
          </div>
        ) : (
          filteredNotices.map((notice) => (
            <div
              key={notice.id}
              className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                notice.isNew
                  ? 'border-amber-300 bg-amber-50/40 hover:bg-amber-50/70 shadow-xs'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2.5 rounded-lg shrink-0 ${
                    notice.isNew ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  <FileText className="h-5 w-5" />
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {notice.noticeNo}
                    </span>
                    <span className="rounded-full bg-navy px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                      {notice.section}
                    </span>
                    {notice.isNew && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-black text-slate-950 animate-pulse">
                        <Sparkles className="h-3 w-3" /> Action Needed
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-1.5">{notice.title}</h4>

                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-600">
                    <div className="flex items-center gap-1">
                      <Building className="h-3.5 w-3.5 text-slate-400" />
                      <span>Issued By: {notice.issuedBy}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>Published: {notice.issueDate}</span>
                    </div>
                    {notice.lastDateToAct && (
                      <div className="flex items-center gap-1 text-amber-700 font-semibold sm:col-span-2">
                        <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                        <span>Last Date to respond/submit: {notice.lastDateToAct}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Download & View Actions */}
              <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 justify-end">
                <button
                  type="button"
                  onClick={() => alert(`Opening preview for ${notice.noticeNo}`)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5" /> Preview
                </button>
                <button
                  type="button"
                  onClick={() => alert(`Downloading Official PDF: ${notice.title} (${notice.fileSize})`)}
                  className="inline-flex items-center gap-1 rounded-lg bg-navy hover:bg-slate-800 px-3 py-1.5 text-xs font-bold text-white transition-colors cursor-pointer shadow-xs"
                >
                  <Download className="h-3.5 w-3.5" /> Download PDF ({notice.fileSize})
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
