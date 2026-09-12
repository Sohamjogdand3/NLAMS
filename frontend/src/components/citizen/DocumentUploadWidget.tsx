import { useState } from 'react'
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Clock,
  X,
  Eye,
} from 'lucide-react'
import type { DocumentItem } from '../../types/citizen'

interface DocumentUploadWidgetProps {
  documents: DocumentItem[]
  onUploadSuccess?: (newDoc: DocumentItem) => void
}

export default function DocumentUploadWidget({
  documents,
  onUploadSuccess,
}: DocumentUploadWidgetProps) {
  const [docList, setDocList] = useState<DocumentItem[]>(documents)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<
    'Land Ownership' | 'Identity' | 'Bank Details' | 'Objection Proof'
  >('Land Ownership')
  const [docTitle, setDocTitle] = useState('')
  const [fileToUpload, setFileToUpload] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileToUpload(e.target.files[0])
    }
  }

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!docTitle || !fileToUpload) return

    setIsUploading(true)

    setTimeout(() => {
      const newDoc: DocumentItem = {
        id: `doc-${Date.now()}`,
        title: docTitle,
        category: selectedCategory,
        fileName: fileToUpload.name,
        fileSize: `${(fileToUpload.size / (1024 * 1024)).toFixed(2)} MB`,
        uploadedDate: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        status: 'Under Review',
        remarks: 'Uploaded via Citizen Portal — awaiting LAO verification',
      }

      setDocList([newDoc, ...docList])
      setIsUploading(false)
      setIsModalOpen(false)
      setDocTitle('')
      setFileToUpload(null)
      setUploadSuccessMsg(`Document "${newDoc.title}" uploaded successfully!`)

      if (onUploadSuccess) {
        onUploadSuccess(newDoc)
      }

      setTimeout(() => setUploadSuccessMsg(null), 4000)
    }, 1200)
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">Document Upload & Verification</h3>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
              4/5 Verified
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Mandatory supporting documents for Land Acquisition & Compensation Award
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Upload className="h-4 w-4" /> Upload New Document
        </button>
      </div>

      {uploadSuccessMsg && (
        <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{uploadSuccessMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setUploadSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Document List */}
      <div className="space-y-3">
        {docList.map((doc) => {
          const isVerified = doc.status === 'Verified'
          const isReview = doc.status === 'Under Review'
          const isRequired = doc.status === 'Required'

          return (
            <div
              key={doc.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 transition-all gap-3"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2.5 rounded-lg shrink-0 ${
                    isVerified
                      ? 'bg-emerald-100 text-emerald-800'
                      : isReview
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  <FileText className="h-5 w-5" />
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">{doc.title}</h4>
                    <span className="rounded bg-slate-200/80 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                      {doc.category}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                    {doc.fileName && <span>File: {doc.fileName}</span>}
                    {doc.fileSize && <span>• {doc.fileSize}</span>}
                    {doc.uploadedDate && <span>• Uploaded: {doc.uploadedDate}</span>}
                  </div>

                  {doc.remarks && (
                    <p className="text-[11px] text-slate-600 mt-1 italic bg-white/70 px-2 py-0.5 rounded border border-slate-100 inline-block">
                      {doc.remarks}
                    </p>
                  )}
                </div>
              </div>

              {/* Status Badge & Action Buttons */}
              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                    isVerified
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : isReview
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-rose-100 text-rose-800 border border-rose-200'
                  }`}
                >
                  {isVerified ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : isReview ? (
                    <Clock className="h-3.5 w-3.5" />
                  ) : (
                    <AlertTriangle className="h-3.5 w-3.5" />
                  )}
                  {doc.status}
                </span>

                <div className="flex items-center gap-1">
                  {doc.fileName ? (
                    <button
                      type="button"
                      className="p-1.5 text-slate-600 hover:text-navy hover:bg-slate-200 rounded cursor-pointer transition-colors"
                      title="Preview Document"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setDocTitle(doc.title)
                        setSelectedCategory(doc.category)
                        setIsModalOpen(true)
                      }}
                      className="text-xs font-bold text-amber-700 hover:underline cursor-pointer"
                    >
                      Upload Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Upload className="h-5 w-5 text-amber-600" />
                Upload Supporting Document
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Document Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e: any) => setSelectedCategory(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500/50"
                >
                  <option value="Land Ownership">Land Ownership (7/12, 8A, Sale Deed)</option>
                  <option value="Identity">Identity Proof (Aadhaar, PAN, Voter ID)</option>
                  <option value="Bank Details">Bank Account & Cancelled Cheque</option>
                  <option value="Objection Proof">Objection Proof / Valuation Certificate</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Document Title / Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Valuation Report for Trees / Well"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-800 focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select File (PDF, JPG, PNG - Max 10MB)
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="w-full rounded-lg border border-dashed border-slate-300 p-2.5 text-xs text-slate-600 bg-slate-50 cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 px-5 py-2 text-xs font-bold text-slate-950 cursor-pointer shadow-xs"
                >
                  {isUploading ? 'Uploading...' : 'Submit Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
