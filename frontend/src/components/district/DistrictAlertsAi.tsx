import { useState } from 'react'
import {
  AlertTriangle,
  Send,
  Bot,
  User,
} from 'lucide-react'

export default function DistrictAlertsAi() {
  const [messages, setMessages] = useState<{ sender: 'ai' | 'user'; text: string; time: string }[]>([
    {
      sender: 'ai',
      text: 'Namaste! I am the NLAMS District AI Legal & Compliance Copilot (RAG + LLM). Ask me anything about RFCTLARR Act 2013 clauses, Section 11/19/23 SLAs, land schedule discrepancies, or Section 3D declaration compliance for Pune District projects.',
      time: '14:30',
    },
  ])
  const [inputQuery, setInputQuery] = useState('')

  const handleSendMessage = () => {
    if (!inputQuery.trim()) return

    const userQ = inputQuery.trim()
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    setMessages((prev) => [...prev, { sender: 'user', text: userQ, time: now }])
    setInputQuery('')

    setTimeout(() => {
      let aiAns = `Regarding "${userQ}": As per Section 23 of the RFCTLARR Act, 2013 read with State Compensation Guidelines, market value must be computed using recent registered sale deeds of adjacent land parcels within 3 years. Solatium of 100% and interest @ 12% p.a. from Section 4(1) date applies automatically.`

      if (userQ.toLowerCase().includes('ring road') || userQ.toLowerCase().includes('3d')) {
        aiAns = `For Pune Outer Ring Road (East Corridor Phase 1): Section 3D Declaration was published in Extraordinary Gazette #894 on 12 Apr 2025. Total acquired area verified: 215.0 Hectares across 14 villages in Haveli & Purandar Tehsils. Zero pending title objections remain.`
      }

      setMessages((prev) => [...prev, { sender: 'ai', text: aiAns, time: now }])
    }, 800)
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-gradient-to-r from-[#042A5E] to-blue-900 px-2.5 py-0.5 text-xs font-bold text-amber-400">
              RAG + LLM Artificial Intelligence
            </span>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Legal Compliance &amp; Delay Prediction Engine
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">
            District AI Assistant &amp; Statutory SLA Alerts
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time legal document queries, section delay predictions, and automated case summaries for District Collectorate
          </p>
        </div>
      </div>

      {/* 2-Column Grid: Left SLA Risk Alerts, Right AI RAG Assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: SLA Delays & Missing Documents Queue */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-red-800 border-b border-slate-100 pb-3">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider">
                Statutory SLA Delay Watch (3 Attention Items)
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 space-y-1">
                <div className="flex items-center justify-between font-bold text-red-900">
                  <span>MRIDC-PUN-NSK-04</span>
                  <span className="bg-red-700 text-white px-2 py-0.5 rounded text-[10px]">4 Days Remaining</span>
                </div>
                <p className="text-[11px] text-red-800 font-medium">
                  Section 4 Scrutiny Overdue: Forest Advisory Clearance copy missing from PIA submission.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                <div className="flex items-center justify-between font-bold text-amber-950">
                  <span>MSRDC-MH-EXP-12</span>
                  <span className="bg-amber-600 text-white px-2 py-0.5 rounded text-[10px]">24 Objections</span>
                </div>
                <p className="text-[11px] text-amber-900 font-medium">
                  Section 15 Objections: 24 title hearings scheduled before Special LAO tribunal.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
                <div className="flex items-center justify-between font-bold text-[#042A5E]">
                  <span>NHAI-PUN-RING-01</span>
                  <span className="bg-[#042A5E] text-amber-400 px-2 py-0.5 rounded text-[10px]">18 Days SLA</span>
                </div>
                <p className="text-[11px] text-blue-900 font-medium">
                  Section 3G Award: Wagholi village award valuation statement ready for Collector approval.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: RAG + LLM Interactive Chatbot */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between h-[550px]">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-[#042A5E]">
            <Bot className="h-5 w-5 text-amber-500" />
            <div>
              <h3 className="text-sm font-bold">NLAMS AI Legal &amp; Document Copilot</h3>
              <span className="text-[10px] text-slate-500">Trained on RFCTLARR Act 2013 &amp; Maharashtra Revenue Code</span>
            </div>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto space-y-3 py-4 pr-1 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#042A5E] text-amber-400">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`max-w-md rounded-2xl p-3.5 leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#042A5E] text-white rounded-br-none'
                      : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
                  }`}
                >
                  <p>{m.text}</p>
                  <span className="text-[9px] opacity-70 mt-1 block text-right">{m.time}</span>
                </div>
                {m.sender === 'user' && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-white">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="border-t border-slate-100 pt-3 flex gap-2">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask AI legal copilot about RFCTLARR clauses, 3D declarations, or Section SLAs..."
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 focus:border-[#042A5E] focus:bg-white focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSendMessage}
              className="rounded-xl bg-[#042A5E] px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <span>Ask AI</span>
              <Send className="h-3.5 w-3.5 text-amber-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
