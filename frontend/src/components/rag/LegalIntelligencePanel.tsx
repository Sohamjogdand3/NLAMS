import { useState, useEffect } from 'react'
import {
  Sparkles,
  Send,
  BookOpen,
  Scale,
  ShieldCheck,
  AlertCircle,
  Layers,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react'
import { ragApi, type RagQueryResponse, type RagDocumentInfo } from '../../services/api'
import { useAuth } from '../../auth/AuthContext'

export default function LegalIntelligencePanel() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDomain, setSelectedDomain] = useState<string>('STATUTORY_LAW')
  const [result, setResult] = useState<RagQueryResponse | null>(null)
  const [authorizedDocs, setAuthorizedDocs] = useState<RagDocumentInfo[]>([])
  const [showDocsModal, setShowDocsModal] = useState(false)

  const quickPrompts = [
    'What is the statutory solatium under RFCTLARR Section 30?',
    'What are Schedule II rehabilitation entitlements for SC/ST families?',
    'Explain the procedure for Section 15 objection hearings and report submission.',
    'What are the market value determination criteria under Section 26?',
  ]

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const docs = await ragApi.listDocuments()
      setAuthorizedDocs(docs)
    } catch (err: any) {
      console.warn('Document list fetch error:', err)
    }
  }

  const handleSearch = async (queryText?: string) => {
    const q = queryText || query
    if (!q.trim() || loading) return

    setLoading(true)
    setError(null)

    try {
      const response = await ragApi.query(
        q,
        5,
        undefined,
        selectedDomain === 'ALL' ? undefined : selectedDomain
      )
      setResult(response)
      if (!queryText) setQuery('')
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve legal intelligence response.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden bg-slate-50">
      {/* Top Banner */}
      <div className="border-b border-slate-200 bg-white px-6 py-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-800 text-white shadow-sm ring-2 ring-indigo-100">
              <Scale className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900">
                  Legal & Statutory Intelligence Copilot
                </h1>
                <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700 border border-indigo-200">
                  Dual-Domain RAG
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Grounded statutory analysis over RFCTLARR 2013, State Gazette Notifications, and Cadastral Rules
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDocsModal(true)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <BookOpen className="h-3.5 w-3.5 text-indigo-600" />
              <span>Registered Acts & Gazettes ({authorizedDocs.length})</span>
            </button>

            <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>RBAC Verified: {user?.role || 'Officer'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace (Split View) */}
      <div className="flex flex-1 overflow-hidden p-6 gap-6">
        {/* Left Side: Interactive Search & Grounded Answer */}
        <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          {/* Domain Filter Bar */}
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3 bg-slate-50/70">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Target Domain:
              </span>
              {(['STATUTORY_LAW', 'PROJECT_DOSSIER', 'ALL'] as const).map((dom) => (
                <button
                  key={dom}
                  type="button"
                  onClick={() => setSelectedDomain(dom)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                    selectedDomain === dom
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {dom === 'STATUTORY_LAW' ? 'Statutory Acts & Rules' : dom === 'PROJECT_DOSSIER' ? 'Project Dossiers' : 'All Scope'}
                </button>
              ))}
            </div>

            <span className="text-[11px] text-slate-400 font-medium">
              Model: Gemini 3.6 Flash · BGE Embeddings
            </span>
          </div>

          {/* Chat / Results Output Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Quick Suggestion Chips (Shown when no result yet) */}
            {!result && !loading && !error && (
              <div className="space-y-4 my-auto py-8">
                <div className="text-center max-w-md mx-auto space-y-2">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">
                    Ask Statutory & Procedural Questions
                  </h3>
                  <p className="text-xs text-slate-500">
                    Answers are strictly grounded in verified Central Acts, State Multiplier matrices, and acquisition files.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-w-2xl mx-auto pt-2">
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSearch(prompt)}
                      className="flex items-start gap-2.5 rounded-xl border border-slate-200 p-3 text-left text-xs font-medium text-slate-700 bg-white hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-900 transition-all shadow-2xs group"
                    >
                      <Sparkles className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                      <span>{prompt}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1 text-xs">
                  <span className="font-bold text-sm block mb-0.5">Statutory Clearance / Query Notice</span>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="space-y-4 animate-pulse p-4 rounded-xl border border-indigo-100 bg-indigo-50/30">
                <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold">
                  <RefreshCw className="h-4 w-4 animate-spin text-indigo-600" />
                  <span>Retrieving verified vector chunks & synthesizing grounded legal response...</span>
                </div>
                <div className="h-4 bg-indigo-200/60 rounded w-3/4"></div>
                <div className="h-4 bg-indigo-200/40 rounded w-full"></div>
                <div className="h-4 bg-indigo-200/50 rounded w-5/6"></div>
              </div>
            )}

            {/* Active Result View */}
            {result && !loading && (
              <div className="space-y-5">
                {/* User Prompt */}
                <div className="flex items-start gap-3 rounded-xl bg-slate-100 p-4">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-white text-xs font-bold">
                    Q
                  </div>
                  <div className="flex-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Inquiry
                    </span>
                    <p className="text-sm font-semibold text-slate-900">{result.query}</p>
                  </div>
                </div>

                {/* AI Grounded Answer */}
                <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 text-white">
                        <Sparkles className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs font-bold text-slate-800">
                        Official Statutory Intelligence Analysis
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
                        {result.access_decision}
                      </span>
                      {result.audit_event_id && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          Audit Ref #{result.audit_event_id.slice(0, 8)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Formatted Answer */}
                  <div className="prose prose-sm max-w-none text-slate-800 text-sm leading-relaxed whitespace-pre-line font-normal">
                    {result.answer}
                  </div>

                  {/* Verified Notice Footer */}
                  <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-slate-500 border border-slate-200">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>
                      Grounded across {result.authorized_chunks_count} verified legal sources. Tamper-evident log registered.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Query Input Bar */}
          <div className="border-t border-slate-200 bg-white p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSearch()
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask any question regarding Section 11, 15, 19, 23 awards, Solatium, R&R, or Panchnama..."
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-100 disabled:opacity-60 transition-all pr-10"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    Clear
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={!query.trim() || loading}
                className="flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-40 transition-all shrink-0"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span>Consult Copilot</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Cited Verified Sources Pane */}
        <div className="w-80 lg:w-96 flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3.5 bg-slate-50">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-800">
                Cited Statutory Sources ({result?.sources?.length || 0})
              </span>
            </div>
            <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-200">
              ChromaDB Grounded
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {!result || !result.sources || result.sources.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                <Layers className="h-8 w-8 text-slate-300" />
                <p className="text-xs font-medium">No source citations loaded yet.</p>
                <p className="text-[11px] text-slate-400">
                  Execute a query to inspect semantic chunks retrieved from the statutory registry.
                </p>
              </div>
            ) : (
              result.sources.map((source, index) => (
                <div
                  key={source.chunk_id || index}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2 hover:border-indigo-300 hover:bg-white transition-all shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="rounded-md bg-indigo-100 px-1.5 py-0.5 text-[10px] font-extrabold text-indigo-800">
                      Source #{index + 1}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                      {source.jurisdiction || 'National'}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 leading-snug">
                    {source.title || source.filename || 'Statutory Provision'}
                  </h4>

                  <p className="text-[11px] text-slate-600 line-clamp-4 leading-relaxed font-mono bg-white p-2 rounded-lg border border-slate-200">
                    "{source.text}"
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                    <span>Page {source.page || 1}</span>
                    {source.distance !== undefined && source.distance !== null && (
                      <span className="font-mono text-indigo-600 font-semibold">
                        Score: {(1 - Math.min(source.distance, 1)).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Authorized Documents Modal */}
      {showDocsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <BookOpen className="h-5 w-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Authorized Legal & Regulatory Documents Registry
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDocsModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {authorizedDocs.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No registered documents found or indexing in progress.
                </div>
              ) : (
                authorizedDocs.map((doc) => (
                  <div
                    key={doc.document_id}
                    className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 p-3.5 bg-slate-50/50 hover:bg-white transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-extrabold text-blue-800">
                          {doc.type || 'ACT'}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900">{doc.title || doc.filename}</h4>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Authority: {doc.authority || 'National'} · Domain: {doc.domain || 'Statutory'} · Jurisdiction: {doc.jurisdiction || 'National'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowDocsModal(false)
                        handleSearch(`Explain summary and applicability of ${doc.title || doc.filename}`)
                      }}
                      className="rounded-lg bg-indigo-50 border border-indigo-200 px-2.5 py-1.5 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100 transition-colors shrink-0"
                    >
                      Consult
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-slate-200 px-6 py-3 bg-slate-50 text-right">
              <button
                type="button"
                onClick={() => setShowDocsModal(false)}
                className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
