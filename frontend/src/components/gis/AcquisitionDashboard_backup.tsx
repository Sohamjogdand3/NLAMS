import React, { useState, useEffect } from "react";
import { acquisitionService } from "../services/api";
import { CompensationResponse, NoticeResponse, ParcelResponse } from "../types";
import { X, Calculator, FileText, Printer, CheckCircle, AlertTriangle } from "lucide-react";

interface Props {
  selectedParcels: ParcelResponse[];
  district: string;
  state: string;
  onClose: () => void;
}

export function AcquisitionDashboard({ selectedParcels, district, state, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<"financial" | "legal">("financial");
  const [regionType, setRegionType] = useState<"Urban" | "Rural">("Urban");
  
  const [compensation, setCompensation] = useState<CompensationResponse | null>(null);
  const [notice, setNotice] = useState<NoticeResponse | null>(null);
  
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
      const [compRes, noticeRes] = await Promise.all([
        acquisitionService.calculateCompensation(parcelInputs, regionType),
        acquisitionService.generateNotice(parcelInputs, district, state)
      ]);
      setCompensation(compRes);
      setNotice(noticeRes);
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
    <div className="fixed inset-0 bg-slate-900/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm print:bg-white print:p-0">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden print:w-full print:max-h-none print:shadow-none print:rounded-none">
        
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
        <div className="flex flex-1 overflow-hidden print:overflow-visible">
          
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
          <div className="flex-1 overflow-y-auto bg-white print:overflow-visible">
            
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
                        <div className="text-xl font-bold text-slate-800">â‚¹{compensation.base_rate_per_sqm.toLocaleString()} / sqm</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="text-sm text-green-700 uppercase">Total Compensation</div>
                        <div className="text-2xl font-bold text-green-800">â‚¹{compensation.grand_total.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
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
                          {compensation.parcel_breakdown.map((p, i) => (
                            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                              <td className="px-4 py-3 font-medium">{p.survey_number}</td>
                              <td className="px-4 py-3">{p.area_sqm.toFixed(1)}</td>
                              <td className="px-4 py-3">â‚¹{p.base_value.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                              <td className="px-4 py-3">â‚¹{(p.base_value * p.multiplier).toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                              <td className="px-4 py-3">â‚¹{p.solatium.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                              <td className="px-4 py-3 bg-green-50/50 font-bold text-green-800">â‚¹{p.total_compensation.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Legal Tab */}
                {(activeTab === "legal" || true) && notice && (
                  <div className={activeTab === "legal" ? "block" : "hidden print:block"}>
                    <div 
                      className="print-document"
                      dangerouslySetInnerHTML={{ __html: notice.document_html }}
                    />
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
