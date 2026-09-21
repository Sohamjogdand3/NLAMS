import { useState } from 'react'
import {
  FileText,
  UploadCloud,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
  FileSpreadsheet,
  FileCode,
  FolderArchive,
  X,
} from 'lucide-react'
import type { PiaDocument, PiaProject } from '../../types/pia'

interface PiaDocumentsRepoProps {
  documents: PiaDocument[]
  projects: PiaProject[]
  onAddDocument: (doc: PiaDocument) => void
}

export default function PiaDocumentsRepo({
  documents,
  projects,
  onAddDocument,
}: PiaDocumentsRepoProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  // Upload Form State
  const [newTitle, setNewTitle] = useState('')
  const [newProjectId, setNewProjectId] = useState(projects[0]?.id || '')
  const [newCategory, setNewCategory] = useState<PiaDocument['category']>('Gazette Notification')
  const [newFileType, setNewFileType] = useState<'PDF' | 'DWG' | 'XLSX' | 'ZIP'>('PDF')
  const [newGazetteNo, setNewGazetteNo] = useState('')
  const [newRemarks, setNewRemarks] = useState('')

  const filteredDocs = documents.filter((doc) => {
    if (selectedCategory !== 'all' && doc.category !== selectedCategory) return false
    if (selectedStatus !== 'all' && doc.status !== selectedStatus) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        doc.title.toLowerCase().includes(q) ||
        doc.projectCode.toLowerCase().includes(q) ||
        doc.projectName.toLowerCase().includes(q) ||
        (doc.gazetteNumber && doc.gazetteNumber.toLowerCase().includes(q))
      )
    }
    return true
  })

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    const proj = projects.find((p) => p.id === newProjectId) || projects[0]

    const newDoc: PiaDocument = {
      id: `doc_${Date.now()}`,
      projectId: proj.id,
      projectCode: proj.code,
      projectName: proj.name,
      title: newTitle,
      category: newCategory,
      fileType: newFileType,
      fileSize: `${(Math.random() * 8 + 1).toFixed(1)} MB`,
      uploadDate: new Date().toISOString().slice(0, 10),
      uploadedBy: 'PIA Land Acquisition Unit',
      status: 'pending',
      gazetteNumber: newGazetteNo || undefined,
      remarks: newRemarks || 'Uploaded by PIA for verification',
    }

    onAddDocument(newDoc)
    setIsUploadModalOpen(false)
    setNewTitle('')
    setNewGazetteNo('')
    setNewRemarks('')
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'XLSX':
        return <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
      case 'DWG':
        return <FileCode className="h-5 w-5 text-blue-600" />
      case 'ZIP':
        return <FolderArchive className="h-5 w-5 text-amber-600" />
      default:
        return <FileText className="h-5 w-5 text-[#991B1B]" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Central Statutory Document Repository
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Official repository of gazette publications, revenue survey maps, sanctions & compensation valuations
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-[#991B1B] hover:bg-[#7F1D1D] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors self-start sm:self-auto"
        >
          <UploadCloud className="h-4 w-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Document Title, Gazette Number, Project Code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-1.5 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-[#991B1B] focus:bg-white focus:outline-none"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-[#991B1B] focus:outline-none w-full md:w-auto"
          >
            <option value="all">All Document Categories</option>
            <option value="Gazette Notification">Gazette Notifications (Sec 3A/3D)</option>
            <option value="Joint Measurement Survey">Joint Measurement Surveys (JMS)</option>
            <option value="Sanction Order">Sanction & Exemption Orders</option>
            <option value="Cadastral Map">Cadastral & Gata Schedules</option>
            <option value="Valuation Sheet">Valuation & Solatium Sheets</option>
            <option value="Forest Clearance">Forest & Environmental NOCs</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-[#991B1B] focus:outline-none w-full md:w-auto"
          >
            <option value="all">All Verification Statuses</option>
            <option value="verified">Verified Documents</option>
            <option value="pending">Pending Verification</option>
            <option value="action_required">Action / Re-upload Required</option>
          </select>
        </div>
      </div>

      {/* Document Table / List */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Document Details</th>
                <th className="px-4 py-3.5">Project</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Size & Format</th>
                <th className="px-4 py-3.5">Upload Date</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No statutory documents found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                    {/* Title and details */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 rounded-lg bg-slate-100 shrink-0">
                          {getFileIcon(doc.fileType)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-snug">{doc.title}</p>
                          {doc.gazetteNumber && (
                            <span className="font-mono text-[10px] font-semibold text-[#991B1B] block mt-0.5">
                              Gazette No: {doc.gazetteNumber}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            By {doc.uploadedBy}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Project */}
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-[10px] font-bold text-[#991B1B] block">
                        {doc.projectCode}
                      </span>
                      <span className="text-[11px] text-slate-600 block max-w-xs truncate">
                        {doc.projectName}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3.5">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                        {doc.category}
                      </span>
                    </td>

                    {/* Size */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="font-bold text-slate-800">{doc.fileType}</span>
                      <span className="text-[10px] text-slate-400 block">{doc.fileSize}</span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-600 text-[11px]">
                      {doc.uploadDate}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {doc.status === 'verified' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" />
                          Verified
                        </span>
                      ) : doc.status === 'action_required' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-bold text-red-800 border border-red-200">
                          <AlertTriangle className="h-3 w-3 text-[#991B1B]" />
                          Action Required
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                          <Clock className="h-3 w-3" />
                          Under Review
                        </span>
                      )}
                    </td>

                    {/* Download */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => alert(`Downloading verified record: ${doc.title}`)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#991B1B] transition-colors"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Document Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in-50">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <UploadCloud className="h-5 w-5 text-[#991B1B]" />
                <span>Upload Central Repository Document</span>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gazette Notification Sec 3D Final Declaration"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-[#991B1B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Associated Project *
                </label>
                <select
                  value={newProjectId}
                  onChange={(e) => setNewProjectId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-[#991B1B] focus:outline-none"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} - {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-[#991B1B] focus:outline-none"
                  >
                    <option value="Gazette Notification">Gazette Notification</option>
                    <option value="Joint Measurement Survey">Joint Measurement Survey</option>
                    <option value="Sanction Order">Sanction Order</option>
                    <option value="Cadastral Map">Cadastral Map</option>
                    <option value="Valuation Sheet">Valuation Sheet</option>
                    <option value="Forest Clearance">Forest Clearance</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">File Format *</label>
                  <select
                    value={newFileType}
                    onChange={(e) => setNewFileType(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-[#991B1B] focus:outline-none"
                  >
                    <option value="PDF">PDF (.pdf)</option>
                    <option value="DWG">CAD / DWG (.dwg)</option>
                    <option value="XLSX">Spreadsheet (.xlsx)</option>
                    <option value="ZIP">Archive (.zip)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Gazette / Dispatch Reference Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. CG-DL-E-18032026-5512"
                  value={newGazetteNo}
                  onChange={(e) => setNewGazetteNo(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-[#991B1B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Remarks / Note</label>
                <textarea
                  rows={2}
                  placeholder="Additional context or references..."
                  value={newRemarks}
                  onChange={(e) => setNewRemarks(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-[#991B1B] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#991B1B] hover:bg-[#7F1D1D] px-5 py-2 text-xs font-bold text-white shadow-xs"
                >
                  Upload & Verify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
