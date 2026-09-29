import { useState, useEffect } from "react";
import { gisService } from "../../services/gisApi";
import type { LocationIntelligenceResponse, InfrastructureItem, ProjectItem, NewsItem } from "../../types/gis";
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
    setLoading(true);
    setError("");
    gisService.analyzeLocation(latitude, longitude, district, state)
      .then((res: LocationIntelligenceResponse) => {
        setData(res);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message || "Failed to fetch intelligence data");
        setLoading(false);
      });
  }, [latitude, longitude, district, state]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Regional AI & Location Intelligence</h3>
              <p className="text-xs text-slate-500">Coordinates: {latitude.toFixed(4)}, {longitude.toFixed(4)} • {district}, {state}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 px-6 gap-2 bg-white">
          <button
            onClick={() => setActiveTab("ai")}
            className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === "ai" 
                ? "border-indigo-600 text-indigo-600" 
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Brain className="w-4 h-4" /> AI Strategic Insights
          </button>
          <button
            onClick={() => setActiveTab("infra")}
            className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === "infra" 
                ? "border-indigo-600 text-indigo-600" 
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Navigation className="w-4 h-4" /> Civic Infrastructure ({data?.infrastructure?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("projects")}
            className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === "projects" 
                ? "border-indigo-600 text-indigo-600" 
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <HardHat className="w-4 h-4" /> Nearby Mega Projects ({data?.projects?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("news")}
            className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === "news" 
                ? "border-indigo-600 text-indigo-600" 
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Newspaper className="w-4 h-4" /> News & Sentiments ({data?.news?.length || 0})
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-3">
              <Activity className="w-8 h-8 animate-spin text-indigo-600" />
              <p className="text-sm font-medium">Synthesizing satellite & open geospatial data...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && data && (
            <>
              {/* AI Strategic Insights Tab */}
              {activeTab === "ai" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl">
                      <div className="text-xs uppercase font-bold tracking-wider text-indigo-600 mb-1">Corridor Connectivity Score</div>
                      <div className="text-3xl font-extrabold text-indigo-900">{data.ai_analysis.connectivity_score} / 100</div>
                      <p className="text-xs text-indigo-600 mt-1">High arterial road and logistics proximity.</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl">
                      <div className="text-xs uppercase font-bold tracking-wider text-emerald-600 mb-1">Development Potential Index</div>
                      <div className="text-3xl font-extrabold text-emerald-900">{data.ai_analysis.development_index} / 100</div>
                      <p className="text-xs text-emerald-600 mt-1">Prime corridor suitable for multi-modal acquisition.</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Executive Summary</h4>
                    <p className="text-sm text-slate-700 leading-relaxed">{data.ai_analysis.summary}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700">Identified Strengths</h4>
                      <ul className="text-xs text-emerald-900 space-y-1.5 list-disc pl-4">
                        {data.ai_analysis.strengths.map((s: string, i: number) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700">Risks & Considerations</h4>
                      <ul className="text-xs text-amber-900 space-y-1.5 list-disc pl-4">
                        {data.ai_analysis.weaknesses.map((s: string, i: number) => (
                          <li key={i}>{s}</li>
                        ))}
                        {data.ai_analysis.threats.map((s: string, i: number) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Infrastructure Tab */}
              {activeTab === "infra" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {data.infrastructure.map((inf: InfrastructureItem) => (
                    <div key={inf.id} className="p-3.5 bg-white border border-slate-200 rounded-xl hover:shadow-sm transition-shadow flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-semibold text-slate-800 text-sm">{inf.name}</h4>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">{inf.type}</span>
                      </div>
                      <span className="text-xs font-bold px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg whitespace-nowrap">
                        {Math.round(inf.distance_m)}m away
                      </span>
                    </div>
                  ))}
                  {data.infrastructure.length === 0 && (
                    <div className="col-span-2 py-8 text-center text-slate-400 text-sm">No recorded civic infrastructure within 3km.</div>
                  )}
                </div>
              )}

              {/* Mega Projects Tab */}
              {activeTab === "projects" && (
                <div className="space-y-3">
                  {data.projects.map((proj: ProjectItem) => (
                    <div key={proj.id} className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{proj.name}</h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                          <span>{proj.type}</span>
                          <span>•</span>
                          <span className="text-emerald-600 font-medium">{proj.status}</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg whitespace-nowrap">
                        {Math.round(proj.distance_m)}m radius
                      </span>
                    </div>
                  ))}
                  {data.projects.length === 0 && (
                    <div className="py-8 text-center text-slate-400 text-sm">No concurrent corridor projects found.</div>
                  )}
                </div>
              )}

              {/* News Tab */}
              {activeTab === "news" && (
                <div className="space-y-3">
                  {data.news.map((item: NewsItem, i: number) => (
                    <div key={i} className="p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-200 transition-colors">
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span className="font-bold text-indigo-600">{item.source}</span>
                        <span>{item.published_date}</span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
                      {item.link && (
                        <a href={item.link} target="_blank" rel="noreferrer" className="inline-block mt-2 text-xs text-indigo-600 hover:underline">
                          Read full article →
                        </a>
                      )}
                    </div>
                  ))}
                  {data.news.length === 0 && (
                    <div className="py-8 text-center text-slate-400 text-sm">No recent regional land acquisition news articles indexed.</div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
