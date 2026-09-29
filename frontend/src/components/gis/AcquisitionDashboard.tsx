import { useState, useEffect } from "react";
import { acquisitionService, gisService } from "../../services/gisApi";
import type { CompensationResponse, NoticeResponse, ParcelResponse, LocationIntelligenceResponse, ParcelCompensation, InfrastructureItem, ProjectItem, NewsItem } from "../../types/gis";
import { X, Calculator, FileText, Printer, CheckCircle, AlertTriangle, Layers } from "lucide-react";

interface Props {
  selectedParcels: ParcelResponse[];
  district: string;
  state: string;
  onClose: () => void;
}

export function AcquisitionDashboard({ selectedParcels, district, state, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<"financial" | "legal" | "report">("financial");
  const [regionType, setRegionType] = useState<"Urban" | "Rural">("Urban");
  
  const [compensation, setCompensation] = useState<CompensationResponse | null>(null);
  const [notice, setNotice] = useState<NoticeResponse | null>(null);
  const [intel, setIntel] = useState<LocationIntelligenceResponse | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const parcelInputs = selectedParcels.map(p => ({
    parcel_id: p.parcel_id,
    survey_number: p.survey_number || "N/A",
    area_sqm: p.area_sqm,
    district: p.district || district,
    village: p.village || "N/A"
  }));

  useEffect(() => {
    fetchData();
  }, [regionType]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const lat = selectedParcels[0]?.geojson?.coordinates[0]?.[0]?.[1] || 19.0402;
      const lng = selectedParcels[0]?.geojson?.coordinates[0]?.[0]?.[0] || 73.0598;

      const [compRes, noticeRes, intelRes] = await Promise.all([
        acquisitionService.calculateCompensation(parcelInputs, regionType),
        acquisitionService.generateNotice(parcelInputs, district, state),
        gisService.analyzeLocation(lat, lng, district, state)
      ]);
      setCompensation(compRes);
      setNotice(noticeRes);
      setIntel(intelRes);
    } catch (err: any) {
      setError(err.message || "Failed to load acquisition data");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm print:static print:inset-auto print:block print:bg-white print:p-0">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden print:block print:w-full print:max-h-none print:shadow-none print:rounded-none">
        
        {/* Header - Hidden on Print */}
        <div className="bg-green-800 text-white p-4 flex justify-between items-center print:hidden">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-400" />
            <div>
              <h2 className="text-lg font-bold">Acquisition Engine</h2>
              <p className="text-xs text-green-200">Phase 3: Financials & Legal Notifications</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-green-700 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden print:block print:overflow-visible">
          
          {/* Sidebar - Hidden on Print */}
          <div className="w-56 bg-slate-50 border-r border-slate-200 p-3 flex flex-col gap-2 print:hidden">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Workflow</div>
            
            <button 
              onClick={() => setActiveTab("financial")} 
              className={`flex items-center gap-3 p-3 text-sm rounded font-medium transition-colors ${activeTab === "financial" ? "bg-green-100 text-green-800" : "text-slate-600 hover:bg-slate-200"}`}
            >
              <Calculator size={18} /> LARR Valuation
            </button>
            
            <button 
              onClick={() => setActiveTab("legal")} 
              className={`flex items-center gap-3 p-3 text-sm rounded font-medium transition-colors ${activeTab === "legal" ? "bg-green-100 text-green-800" : "text-slate-600 hover:bg-slate-200"}`}
            >
              <FileText size={18} /> Section 11 Notice
            </button>

            <button 
              onClick={() => setActiveTab("report")} 
              className={`flex items-center gap-3 p-3 text-sm rounded font-medium transition-colors ${activeTab === "report" ? "bg-green-100 text-green-800" : "text-slate-600 hover:bg-slate-200"}`}
            >
              <Layers size={18} /> Full PDF Report
            </button>

            <div className="mt-auto">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Region Type</div>
              <select 
                value={regionType} 
                onChange={(e) => setRegionType(e.target.value as "Urban" | "Rural")}
                className="w-full p-2 text-sm border rounded bg-white shadow-sm"
              >
                <option value="Urban">Urban (1x Multiplier)</option>
                <option value="Rural">Rural (2x Multiplier)</option>
              </select>
            </div>
            
            <button onClick={handlePrint} className="mt-4 flex items-center justify-center gap-2 w-full bg-slate-800 text-white p-2 rounded text-sm hover:bg-slate-700 transition-colors">
              <Printer size={16} /> Print Document
            </button>
          </div>

          {/* Main Area */}
          <div className="flex-1 overflow-y-auto bg-white print:block print:overflow-visible">
            
            {loading && <div className="flex items-center justify-center h-full text-slate-500 animate-pulse">Processing Acquisition Data...</div>}
            {error && <div className="p-8 text-center text-red-500 flex flex-col items-center gap-2"><AlertTriangle /> {error}</div>}

            {!loading && !error && (
              <div className="p-8 print:p-0">
                
                {/* Financial Tab */}
                {activeTab === "financial" && compensation && (
                  <div className="max-w-3xl mx-auto print:hidden">
                    <h3 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-2">LARR Act 2013 Compensation Estimate</h3>
                    
                    <div className="grid grid-cols-3 gap-4 mb-8">
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <div className="text-sm text-slate-500 uppercase">Total Area</div>
                        <div className="text-xl font-bold text-slate-800">{(compensation.total_area_sqm / 10000).toFixed(4)} Hectares</div>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <div className="text-sm text-slate-500 uppercase">Base Rate</div>
                        <div className="text-xl font-bold text-slate-800">₹{compensation.base_rate_per_sqm.toLocaleString()} / sqm</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="text-sm text-green-700 uppercase">Total Compensation</div>
                        <div className="text-2xl font-bold text-green-800">₹{compensation.grand_total.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                      </div>
                    </div>

                    <h4 className="font-bold text-slate-700 mb-4">Breakdown per Parcel</h4>
                    <div className="overflow-x-auto rounded border border-slate-200 mb-8">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-600 bg-slate-100 uppercase">
                          <tr>
                            <th className="px-4 py-3">Survey No.</th>
                            <th className="px-4 py-3">Area (sqm)</th>
                            <th className="px-4 py-3">Base Value</th>
                            <th className="px-4 py-3">x{compensation.multiplier_applied} Multiplier</th>
                            <th className="px-4 py-3">+100% Solatium</th>
                            <th className="px-4 py-3 bg-green-50">Final Payable</th>
                          </tr>
                        </thead>
                        <tbody>
                          {compensation.parcel_breakdown.map((p: ParcelCompensation, i: number) => (
                            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                              <td className="px-4 py-3 font-medium">{p.survey_number}</td>
                              <td className="px-4 py-3">{p.area_sqm.toFixed(1)}</td>
                              <td className="px-4 py-3">₹{p.base_value.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                              <td className="px-4 py-3">₹{(p.base_value * p.multiplier).toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                              <td className="px-4 py-3">₹{p.solatium.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                              <td className="px-4 py-3 bg-green-50/50 font-bold text-green-800">₹{p.total_compensation.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Legal Tab */}
                {activeTab === "legal" && notice && (
                  <div className="block print:block">
                    <div 
                      className="print-document"
                      dangerouslySetInnerHTML={{ __html: notice.document_html }}
                    />
                  </div>
                )}

                {/* Comprehensive Report Tab */}
                {activeTab === "report" && intel && compensation && (
                  <div className="block max-w-4xl mx-auto p-4 bg-white text-slate-800 font-sans print:p-0 print:max-w-full print:block">
                    {/* Report Content */}
                    <>
                        <div className="border-b-4 border-slate-900 pb-4 mb-6 text-center">
                          <h1 className="text-3xl font-bold uppercase tracking-wider mb-2">Comprehensive Land Acquisition Report</h1>
                          <p className="text-slate-600">Generated for {district}, {state} • {new Date().toLocaleDateString()}</p>
                        </div>

                        {/* AI Feasibility */}
                        <div className="mb-8 page-break-inside-avoid">
                          <h2 className="text-xl font-bold border-b border-slate-300 pb-2 mb-4 uppercase text-slate-700">1. Feasibility & AI Summary</h2>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded">
                              <div className="text-sm uppercase text-slate-500 mb-1">Connectivity Score</div>
                              <div className="text-3xl font-bold text-blue-600">{intel.ai_analysis.connectivity_score}/100</div>
                            </div>
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded">
                              <div className="text-sm uppercase text-slate-500 mb-1">Development Index</div>
                              <div className="text-3xl font-bold text-green-600">{intel.ai_analysis.development_index}/100</div>
                            </div>
                          </div>
                          <p className="text-slate-700 leading-relaxed mb-4">{intel.ai_analysis.summary}</p>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-bold text-green-700 mb-2">Strengths</h4>
                              <ul className="list-disc pl-5 text-sm space-y-1">
                                {intel.ai_analysis.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-bold text-red-700 mb-2">Weaknesses & Risks</h4>
                              <ul className="list-disc pl-5 text-sm space-y-1">
                                {intel.ai_analysis.weaknesses.map((s: string, i: number) => <li key={i}>{s}</li>)}
                                {intel.ai_analysis.threats.map((s: string, i: number) => <li key={i}>{s}</li>)}
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Infrastructure & Projects */}
                        <div className="mb-8 page-break-inside-avoid">
                          <h2 className="text-xl font-bold border-b border-slate-300 pb-2 mb-4 uppercase text-slate-700">2. Regional Infrastructure & Development</h2>
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <h3 className="font-bold mb-3 text-slate-600">Nearby Civic Amenities (3km)</h3>
                              <ul className="space-y-3">
                                {intel.infrastructure.slice(0, 5).map((item: InfrastructureItem) => (
                                  <li key={item.id} className="text-sm flex justify-between border-b border-slate-100 pb-2">
                                    <div>
                                      <span className="font-medium block">{item.name}</span>
                                      <span className="text-slate-500 text-xs">{item.type}</span>
                                    </div>
                                    <span className="text-slate-600">{Math.round(item.distance_m)}m</span>
                                  </li>
                                ))}
                                {intel.infrastructure.length === 0 && <li className="text-sm text-slate-500">None found within 3km.</li>}
                              </ul>
                            </div>
                            <div>
                              <h3 className="font-bold mb-3 text-slate-600">Major Ongoing Projects</h3>
                              <ul className="space-y-3">
                                {intel.projects.slice(0, 5).map((item: ProjectItem) => (
                                  <li key={item.id} className="text-sm flex justify-between border-b border-slate-100 pb-2">
                                    <div>
                                      <span className="font-medium block text-orange-700">{item.name}</span>
                                      <span className="text-slate-500 text-xs">{item.type}</span>
                                    </div>
                                    <span className="text-slate-600">{Math.round(item.distance_m)}m</span>
                                  </li>
                                ))}
                                {intel.projects.length === 0 && <li className="text-sm text-slate-500">No major projects detected nearby.</li>}
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* LARR Valuation */}
                        <div className="mb-8 page-break-inside-avoid">
                          <h2 className="text-xl font-bold border-b border-slate-300 pb-2 mb-4 uppercase text-slate-700">3. Financial Valuation (LARR Act 2013)</h2>
                          <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="p-3 border rounded">
                              <div className="text-xs text-slate-500 uppercase">Total Area</div>
                              <div className="font-bold text-lg">{(compensation.total_area_sqm / 10000).toFixed(4)} Ha</div>
                            </div>
                            <div className="p-3 border rounded">
                              <div className="text-xs text-slate-500 uppercase">Multiplier</div>
                              <div className="font-bold text-lg">{regionType} ({compensation.multiplier_applied}x)</div>
                            </div>
                            <div className="p-3 border bg-green-50 rounded">
                              <div className="text-xs text-green-700 uppercase">Total Compensation</div>
                              <div className="font-bold text-xl text-green-800">₹{compensation.grand_total.toLocaleString()}</div>
                            </div>
                          </div>
                          <table className="w-full text-xs text-left border">
                            <thead className="bg-slate-100 uppercase border-b">
                              <tr>
                                <th className="p-2">Survey No.</th>
                                <th className="p-2">Area (sqm)</th>
                                <th className="p-2">Base Value</th>
                                <th className="p-2">+Solatium</th>
                                <th className="p-2 font-bold">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {compensation.parcel_breakdown.map((p: ParcelCompensation, i: number) => (
                                <tr key={i} className="border-b">
                                  <td className="p-2">{p.survey_number}</td>
                                  <td className="p-2">{p.area_sqm.toFixed(1)}</td>
                                  <td className="p-2">₹{p.base_value.toLocaleString()}</td>
                                  <td className="p-2">₹{p.solatium.toLocaleString()}</td>
                                  <td className="p-2 font-bold">₹{p.total_compensation.toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* News Sentiments */}
                        <div className="page-break-inside-avoid">
                          <h2 className="text-xl font-bold border-b border-slate-300 pb-2 mb-4 uppercase text-slate-700">4. Regional Public Sentiment & News</h2>
                          <ul className="list-disc pl-5 text-sm space-y-2 text-slate-700">
                            {intel.news.slice(0, 4).map((n: NewsItem, i: number) => (
                              <li key={i}>
                                <strong>{n.source}</strong>: {n.title} <span className="text-slate-500 text-xs">({n.published_date})</span>
                              </li>
                            ))}
                            {intel.news.length === 0 && <li className="text-slate-500 text-sm">No recent regional infrastructure news found.</li>}
                          </ul>
                        </div>
                      </>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
