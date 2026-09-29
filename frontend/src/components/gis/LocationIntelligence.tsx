import React, { useState, useEffect } from "react";
import { gisService } from "../services/api";
import { LocationIntelligenceResponse } from "../types";
import { X, Activity, HardHat, Newspaper, Brain, Navigation, AlertTriangle } from "lucide-react";

interface Props {
  latitude: number;
  longitude: number;
  district: string;
  state: string;
  onClose: () => void;
}

export function LocationIntelligence({ latitude, longitude, district, state, onClose }: Props) {
  const [data, setData] = useState<LocationIntelligenceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"ai" | "infra" | "projects" | "news">("ai");

  useEffect(() => {
    gisService.analyzeLocation(latitude, longitude, district, state)
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [latitude, longitude, district, state]);

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-800 text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Brain className="text-blue-400" />
            <div>
              <h2 className="text-lg font-bold">Location Intelligence Dashboard</h2>
              <p className="text-xs text-slate-300">Phase 2 AI Analysis for {district}, {state}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Loading / Error */}
        {loading && <div className="p-12 text-center text-slate-500 animate-pulse">Running AI Analysis and fetching OpenStreetMap & News data...</div>}
        {error && <div className="p-8 text-center text-red-500">{error}</div>}

        {/* Content */}
        {!loading && data && (
          <div className="flex flex-1 overflow-hidden">
            
            {/* Sidebar Tabs */}
            <div className="w-48 bg-slate-50 border-r border-slate-200 p-2 flex flex-col gap-1">
              <button onClick={() => setActiveTab("ai")} className={`flex items-center gap-2 p-3 text-sm rounded font-medium transition-colors ${activeTab === "ai" ? "bg-blue-100 text-blue-700" : "text-slate-600 hover:bg-slate-200"}`}>
                <Activity size={16} /> AI Summary
              </button>
              <button onClick={() => setActiveTab("infra")} className={`flex items-center gap-2 p-3 text-sm rounded font-medium transition-colors ${activeTab === "infra" ? "bg-blue-100 text-blue-700" : "text-slate-600 hover:bg-slate-200"}`}>
                <Navigation size={16} /> Infrastructure <span className="ml-auto bg-slate-200 text-xs px-1.5 rounded">{data.infrastructure.length}</span>
              </button>
              <button onClick={() => setActiveTab("projects")} className={`flex items-center gap-2 p-3 text-sm rounded font-medium transition-colors ${activeTab === "projects" ? "bg-blue-100 text-blue-700" : "text-slate-600 hover:bg-slate-200"}`}>
                <HardHat size={16} /> Projects <span className="ml-auto bg-slate-200 text-xs px-1.5 rounded">{data.projects.length}</span>
              </button>
              <button onClick={() => setActiveTab("news")} className={`flex items-center gap-2 p-3 text-sm rounded font-medium transition-colors ${activeTab === "news" ? "bg-blue-100 text-blue-700" : "text-slate-600 hover:bg-slate-200"}`}>
                <Newspaper size={16} /> Recent News
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-white">
              
              {/* AI Tab */}
              {activeTab === "ai" && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-center">
                      <div className="text-4xl font-bold text-blue-600 mb-1">{data.ai_analysis.connectivity_score}</div>
                      <div className="text-sm font-medium text-blue-800 uppercase tracking-wide">Connectivity Score</div>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 text-center">
                      <div className="text-4xl font-bold text-emerald-600 mb-1">{data.ai_analysis.development_index}</div>
                      <div className="text-sm font-medium text-emerald-800 uppercase tracking-wide">Development Index</div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-2">AI Summary</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{data.ai_analysis.summary}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-bold text-green-700 mb-2 flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full"></div> Strengths</h4>
                      <ul className="text-sm space-y-2 text-slate-600">
                        {data.ai_analysis.strengths.map((s, i) => <li key={i}>• {s}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-red-700 mb-2 flex items-center gap-2"><div className="w-2 h-2 bg-red-500 rounded-full"></div> Weaknesses & Risks</h4>
                      <ul className="text-sm space-y-2 text-slate-600">
                        {data.ai_analysis.weaknesses.map((s, i) => <li key={i}>• {s}</li>)}
                        {data.ai_analysis.threats[0] && <li className="text-red-500 font-medium">• {data.ai_analysis.threats[0]}</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Infra Tab */}
              {activeTab === "infra" && (
                <div className="animate-in fade-in">
                  <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Nearby Civic Infrastructure (within 3km)</h3>
                  {data.infrastructure.length === 0 ? (
                    <p className="text-sm text-slate-500">No major infrastructure mapped nearby.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {data.infrastructure.map(inf => (
                        <div key={inf.id} className="p-3 border border-slate-100 bg-slate-50 rounded flex justify-between items-center">
                          <div>
                            <div className="font-medium text-sm text-slate-800">{inf.name}</div>
                            <div className="text-xs text-slate-500">{inf.type}</div>
                          </div>
                          <div className="text-xs font-bold text-slate-400">{inf.distance_m.toFixed(0)}m away</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Projects Tab */}
              {activeTab === "projects" && (
                <div className="animate-in fade-in">
                  <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Ongoing Construction & Projects</h3>
                  {data.projects.length === 0 ? (
                    <p className="text-sm text-slate-500">No active construction projects mapped nearby.</p>
                  ) : (
                    <div className="space-y-3">
                      {data.projects.map(proj => (
                        <div key={proj.id} className="p-3 border border-orange-200 bg-orange-50 rounded flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <AlertTriangle className="text-orange-500 w-5 h-5" />
                            <div>
                              <div className="font-bold text-sm text-orange-900">{proj.name}</div>
                              <div className="text-xs text-orange-700">{proj.type} • {proj.status}</div>
                            </div>
                          </div>
                          <div className="text-xs font-bold text-orange-600">{proj.distance_m.toFixed(0)}m away</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* News Tab */}
              {activeTab === "news" && (
                <div className="animate-in fade-in">
                  <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Recent Regional News</h3>
                  {data.news.length === 0 ? (
                    <p className="text-sm text-slate-500">No recent news found for this specific region.</p>
                  ) : (
                    <div className="space-y-4">
                      {data.news.map((item, i) => (
                        <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" className="block p-4 border border-slate-200 rounded hover:border-blue-300 hover:shadow-md transition-all group">
                          <h4 className="font-bold text-sm text-blue-700 group-hover:underline mb-1">{item.title}</h4>
                          <div className="flex justify-between text-xs text-slate-500">
                            <span>{item.source}</span>
                            <span>{new Date(item.published_date).toLocaleDateString()}</span>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
