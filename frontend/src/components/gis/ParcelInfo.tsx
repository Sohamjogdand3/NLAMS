import type { IdentifyLandResponse, ParcelResponse } from '../../types/gis';
import { AlertTriangle, CheckSquare, Square, X, Layers, CheckCircle2 } from 'lucide-react';

interface ParcelInfoProps {
  data: IdentifyLandResponse | null;
  selectedParcels?: ParcelResponse[];
  onToggleParcel?: (p: ParcelResponse) => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  onAnalyze?: () => void;
  onAcquire?: () => void;
}

export function ParcelInfo({
  data,
  selectedParcels = [],
  onToggleParcel,
  onSelectAll,
  onDeselectAll,
  onAnalyze,
  onAcquire,
}: ParcelInfoProps) {
  if (!data && selectedParcels.length === 0) return null;

  const { parcel, reverse_geocode, nearby_parcels = [] } = data || {};

  // Combine all available parcels uniquely
  const allAvailableParcels: ParcelResponse[] = [];
  if (parcel) allAvailableParcels.push(parcel);
  nearby_parcels.forEach(p => {
    if (!allAvailableParcels.some(existing => existing.parcel_id === p.parcel_id)) {
      allAvailableParcels.push(p);
    }
  });

  const isSelected = (id: string) => selectedParcels.some(p => p.parcel_id === id);
  const totalArea = selectedParcels.reduce((sum, p) => sum + p.area_sqm, 0);
  const totalHectares = totalArea / 10000;
  const estimatedValue = totalArea * 12000; // Rs 12,000 per sqm baseline rate

  return (
    <div className="flex flex-col gap-4 mb-4">
      {/* Multi-Parcel Selection Batch Controls */}
      {allAvailableParcels.length > 0 && (
        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-sm border border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-semibold text-slate-200">
              {selectedParcels.length} / {allAvailableParcels.length} Selected
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onSelectAll}
              className="text-xs bg-purple-600 hover:bg-purple-500 text-white font-medium px-2.5 py-1 rounded transition-colors"
              title="Select all available parcels"
            >
              Select All
            </button>
            <button
              onClick={onDeselectAll}
              className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium px-2.5 py-1 rounded transition-colors"
              title="Clear all selected parcels"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Selected Parcels Acquisition Cart */}
      {selectedParcels.length > 0 && (
        <div className="bg-purple-50 p-4 shadow-md rounded-lg border-2 border-purple-300 transition-all">
          <h3 className="text-xs font-bold text-purple-950 mb-3 uppercase tracking-wider border-b border-purple-200 pb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-purple-600" />
              Selected Parcels Cart
            </span>
            <span className="bg-purple-600 text-white font-bold py-0.5 px-2.5 rounded-full text-xs shadow-sm">
              {selectedParcels.length} {selectedParcels.length === 1 ? 'parcel' : 'parcels'}
            </span>
          </h3>
          
          <div className="grid grid-cols-2 gap-2 mb-3 bg-white p-2.5 rounded border border-purple-100 text-xs">
            <div>
              <span className="text-purple-700 font-medium block">Total Area</span>
              <span className="text-purple-950 font-bold text-sm">
                {totalArea.toLocaleString(undefined, { maximumFractionDigits: 1 })} sqm
              </span>
              <span className="text-purple-500 text-[10px] block">({totalHectares.toFixed(3)} Ha)</span>
            </div>
            <div>
              <span className="text-purple-700 font-medium block">Est. Base Value</span>
              <span className="text-purple-950 font-bold text-sm">₹{estimatedValue.toLocaleString()}</span>
              <span className="text-purple-500 text-[10px] block">@ ₹12,000/sqm</span>
            </div>
          </div>
          
          <div className="max-h-36 overflow-y-auto text-xs bg-white rounded border border-purple-200 mb-3 divide-y divide-purple-100">
            {selectedParcels.map(p => (
              <div key={p.parcel_id} className="p-2 flex items-center justify-between hover:bg-purple-50/60 transition-colors">
                <div className="flex flex-col">
                  <span className="font-bold text-purple-900 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-purple-600 inline-block"></span>
                    Survey #{p.survey_number}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {p.area_sqm.toLocaleString(undefined, { maximumFractionDigits: 1 })} sqm • {p.land_use || 'Land'}
                  </span>
                </div>
                {onToggleParcel && (
                  <button
                    onClick={() => onToggleParcel(p)}
                    className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                    title="Remove parcel from selection"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={onAnalyze}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded text-xs shadow transition-colors flex items-center justify-center gap-1.5"
            >
              Analyze Selected ({selectedParcels.length})
            </button>
            <button
              onClick={onAcquire}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-3 rounded text-xs shadow transition-colors flex items-center justify-center gap-1.5"
            >
              Acquire Selected ({selectedParcels.length})
            </button>
          </div>
        </div>
      )}

      {/* Discovered Parcels Interactive List */}
      {allAvailableParcels.length > 0 && (
        <div className="bg-white p-3 shadow-sm rounded-lg border border-slate-200">
          <h4 className="text-xs font-bold text-slate-800 mb-2 uppercase tracking-wider flex items-center justify-between">
            <span>Discovered Parcels</span>
            <span className="text-[11px] text-slate-400 font-normal">Click to toggle selection</span>
          </h4>
          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
            {allAvailableParcels.map(p => {
              const selected = isSelected(p.parcel_id);
              return (
                <div
                  key={p.parcel_id}
                  onClick={() => onToggleParcel && onToggleParcel(p)}
                  className={`p-2 rounded cursor-pointer border text-xs flex items-center justify-between transition-all ${
                    selected
                      ? 'bg-purple-100/70 border-purple-400 text-purple-950 font-medium'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {selected ? (
                      <CheckSquare className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                    <div>
                      <div className="font-semibold">{p.survey_number}</div>
                      <div className="text-[10px] text-slate-500">
                        {p.area_sqm.toFixed(1)} sqm • {p.land_use || 'Cadastral'}
                      </div>
                    </div>
                  </div>
                  {p.osm_id && (
                    <span className="text-[10px] bg-slate-200/80 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                      #{p.osm_id}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Parcel Attributes / Cadastre Details */}
      {data && (
        <div className="bg-white p-4 shadow rounded-lg border border-slate-200">
          <h3 className="text-xs font-bold text-slate-800 mb-3 uppercase tracking-wider border-b pb-2">
            Target Parcel Details
          </h3>
          
          {parcel ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-slate-500 font-medium">OSM Identification</div>
                <div className="text-slate-900 font-bold flex items-center gap-1">
                  {parcel.osm_id ? (
                    <a
                      href={`https://www.openstreetmap.org/${parcel.osm_type || 'way'}/${parcel.osm_id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1"
                      title="View live feature on OpenStreetMap"
                    >
                      OSM #{parcel.osm_id} ↗
                    </a>
                  ) : (
                    <span>OSM-{parcel.survey_number || 'N/A'}</span>
                  )}
                </div>

                <div className="text-slate-500 font-medium">Survey/CTS No.</div>
                <div className="text-slate-800 font-semibold">{parcel.survey_number || parcel.cts_number || 'N/A'}</div>
                
                <div className="text-slate-500 font-medium">Owner / Title</div>
                <div className="text-slate-800">{parcel.owner_name || 'Revenue Cadastre'}</div>

                <div className="text-slate-500 font-medium">Village</div>
                <div className="text-slate-800">{parcel.village}</div>
                
                <div className="text-slate-500 font-medium">Taluka / District</div>
                <div className="text-slate-800">{parcel.taluka}, {parcel.district}</div>
                
                <div className="text-slate-500 font-medium">State</div>
                <div className="text-slate-800">{parcel.state}</div>
                
                <div className="text-slate-500 font-medium">Real-World Area</div>
                <div className="text-slate-900 font-bold">
                  {parcel.area_sqm.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} sqm ({parcel.area_hectares.toFixed(4)} Ha)
                </div>
                
                <div className="text-slate-500 font-medium">Perimeter</div>
                <div className="text-slate-800">{parcel.perimeter_m ? `${parcel.perimeter_m.toFixed(2)} m` : 'N/A'}</div>

                <div className="text-slate-500 font-medium">Land Use</div>
                <div className="text-slate-800 font-semibold">{parcel.land_use || 'N/A'}</div>
              </div>
              
              {parcel.confidence_note && (
                <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded flex gap-2 items-start">
                  <AlertTriangle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-blue-900 font-medium">{parcel.confidence_note}</p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <p className="text-xs text-slate-700 mb-2">No direct cadastral parcel found exactly at this coordinate.</p>
              {reverse_geocode && (
                <div className="text-[11px] text-slate-500 mt-2 bg-slate-50 p-2 rounded">
                  <strong>Location info:</strong> {reverse_geocode.display_name}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
