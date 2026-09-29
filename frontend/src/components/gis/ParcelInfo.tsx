import type { IdentifyLandResponse, ParcelResponse } from '../../types/gis';
import { AlertTriangle } from 'lucide-react';

interface ParcelInfoProps {
  data: IdentifyLandResponse | null;
  selectedParcels?: ParcelResponse[];
  onAnalyze?: () => void;
  onAcquire?: () => void;
}

export function ParcelInfo({ data, selectedParcels = [], onAnalyze, onAcquire }: ParcelInfoProps) {
  if (!data && selectedParcels.length === 0) return null;

  const { parcel, reverse_geocode } = data || {};

  const handleAnalyzeClick = () => {
    if (onAnalyze) onAnalyze();
  };

  const handleAcquireClick = () => {
    if (onAcquire) onAcquire();
  };

  const totalArea = selectedParcels.reduce((sum, p) => sum + p.area_sqm, 0);
  const estimatedValue = totalArea * 12000; // Mock Rate: Rs 12,000 per sqm

  return (
    <div className="flex flex-col gap-4 mb-4">
      {selectedParcels.length > 0 && (
        <div className="bg-purple-50 p-4 shadow-md rounded-lg border border-purple-200">
          <h3 className="text-sm font-bold text-purple-900 mb-3 uppercase tracking-wider border-b border-purple-200 pb-2 flex items-center justify-between">
            <span>Acquisition Cart</span>
            <span className="bg-purple-200 text-purple-800 py-0.5 px-2 rounded-full text-xs">{selectedParcels.length} parcels</span>
          </h3>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-purple-700 font-medium">Total Area:</span>
              <span className="text-purple-900 font-bold">{totalArea.toLocaleString(undefined, { maximumFractionDigits: 2 })} sqm</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-purple-700 font-medium">Est. Value (Base):</span>
              <span className="text-purple-900 font-bold">₹{estimatedValue.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="max-h-32 overflow-y-auto text-xs text-purple-800 bg-white rounded border border-purple-100 mb-3">
            {selectedParcels.map(p => (
              <div key={p.parcel_id} className="p-1.5 border-b border-purple-50 flex justify-between">
                <span className="font-medium">{p.survey_number}</span>
                <span>{p.area_sqm.toFixed(0)} sqm</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <button onClick={handleAnalyzeClick} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors text-sm shadow">
              Phase 2: Analyze Location
            </button>
            <button onClick={handleAcquireClick} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition-colors text-sm shadow flex items-center justify-center gap-2">
              Phase 3: Proceed to Acquisition
            </button>
          </div>
        </div>
      )}

      {data && (
      <div className="bg-white p-4 shadow rounded-lg border border-slate-200">
        <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider border-b pb-2">Parcel Information</h3>
        
        {parcel ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-slate-500 font-medium">Parcel ID</div>
              <div className="text-slate-800 truncate" title={parcel.parcel_id}>{parcel.parcel_id.substring(0, 8)}...</div>
              
              <div className="text-slate-500 font-medium">Survey/CTS No.</div>
              <div className="text-slate-800">{parcel.survey_number || parcel.cts_number || 'N/A'}</div>
              
              <div className="text-slate-500 font-medium">Village</div>
              <div className="text-slate-800">{parcel.village}</div>
              
              <div className="text-slate-500 font-medium">Taluka</div>
              <div className="text-slate-800">{parcel.taluka}</div>
              
              <div className="text-slate-500 font-medium">District</div>
              <div className="text-slate-800">{parcel.district}</div>
              
              <div className="text-slate-500 font-medium">State</div>
              <div className="text-slate-800">{parcel.state}</div>
              
              <div className="text-slate-500 font-medium">Area</div>
              <div className="text-slate-800">{parcel.area_sqm.toFixed(2)} sqm</div>
              
              <div className="text-slate-500 font-medium">Perimeter</div>
              <div className="text-slate-800">{parcel.perimeter_m ? `${parcel.perimeter_m.toFixed(2)} m` : 'N/A'}</div>

              <div className="text-slate-500 font-medium">Dimensions</div>
              <div className="text-slate-800">{parcel.dimensions || 'N/A'}</div>

              <div className="text-slate-500 font-medium">Land Use</div>
              <div className="text-slate-800">{parcel.land_use || 'N/A'}</div>
            </div>
            
            {parcel.confidence_note && (
              <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded flex gap-2 items-start">
                <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-800">{parcel.confidence_note}</p>
              </div>
            )}
            

          </div>
        ) : (
          <div>
            <p className="text-sm text-slate-700 mb-2">No direct cadastral parcel found exactly at this coordinate.</p>
            {reverse_geocode && (
              <div className="text-xs text-slate-500 mt-2 bg-slate-50 p-2 rounded">
                <strong>Location info:</strong> {reverse_geocode.display_name}
              </div>
            )}
          </div>
        )}

        {data.nearby_parcels && data.nearby_parcels.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 mb-2">Nearby Parcels ({data.nearby_parcels.length})</h4>
            <p className="text-xs text-slate-500 italic mb-2">Click parcels on the map to add them to your acquisition cart.</p>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
