import { useState } from 'react';
import { MapView } from '../components/gis/MapView';
import { CoordinateInput } from '../components/gis/CoordinateInput';
import { ParcelInfo } from '../components/gis/ParcelInfo';
import { LocationIntelligence } from '../components/gis/LocationIntelligence';
import { AcquisitionDashboard } from '../components/gis/AcquisitionDashboard';
import { gisService } from '../services/gisApi';
import type { IdentifyLandResponse, ParcelResponse } from '../types/gis';
import { MapPin } from 'lucide-react';

export default function GisMappingApp() {
  const [mapCenter, setMapCenter] = useState<{lat: number, lng: number}>({ lat: 19.0328, lng: 72.8964 });
  const [data, setData] = useState<IdentifyLandResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedParcels, setSelectedParcels] = useState<ParcelResponse[]>([]);
  const [showIntelligence, setShowIntelligence] = useState(false);
  const [showAcquisition, setShowAcquisition] = useState(false);

  const handleIdentify = async (lat: number, lng: number, radius: number) => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await gisService.identifyLand({
        latitude: lat,
        longitude: lng,
        radius_m: radius
      });
      setData(result);
      setMapCenter({ lat, lng });
      if (result.parcel) {
        setSelectedParcels([result.parcel]);
      } else if (result.nearby_parcels && result.nearby_parcels.length > 0) {
        setSelectedParcels([result.nearby_parcels[0]]);
      } else {
        setSelectedParcels([]);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching land data');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleParcelSelection = (parcel: ParcelResponse) => {
    setSelectedParcels(prev => {
      const exists = prev.some(p => p.parcel_id === parcel.parcel_id);
      if (exists) {
        return prev.filter(p => p.parcel_id !== parcel.parcel_id);
      } else {
        return [...prev, parcel];
      }
    });
  };

  const handleSelectAll = () => {
    if (!data) return;
    const all: ParcelResponse[] = [];
    if (data.parcel) all.push(data.parcel);
    if (data.nearby_parcels) {
      data.nearby_parcels.forEach(p => {
        if (!all.some(existing => existing.parcel_id === p.parcel_id)) {
          all.push(p);
        }
      });
    }
    setSelectedParcels(all);
  };

  const handleDeselectAll = () => {
    setSelectedParcels([]);
  };

  const handleAnalyzeCart = () => {
    if (selectedParcels.length > 0) {
      setShowIntelligence(true);
    }
  };

  const handleAcquireCart = () => {
    if (selectedParcels.length > 0) {
      setShowAcquisition(true);
    }
  };

  const getLocalName = () => {
    if (data?.reverse_geocode) {
      if (data.reverse_geocode.village) return data.reverse_geocode.village;
      if (data.reverse_geocode.taluka) return data.reverse_geocode.taluka;
      if (data.reverse_geocode.district) return data.reverse_geocode.district;
      if (data.reverse_geocode.display_name) {
        const parts = data.reverse_geocode.display_name.split(',');
        return parts.length > 1 ? parts[1].trim() : parts[0].trim();
      }
    }
    const parcel = selectedParcels[0];
    if (parcel) {
      if (parcel.village && parcel.village !== 'Hypothetical Area') return parcel.village;
      if (parcel.district && parcel.district !== 'Local District') return parcel.district;
    }
    return 'Local Region';
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans">
      <header className="bg-slate-900 text-white p-3 shadow-md z-20 flex items-center gap-3">
        <MapPin className="text-blue-400" />
        <h1 className="text-xl font-extrabold tracking-wider text-amber-400">DHARAA</h1>
        <span className="text-slate-400 text-sm border-l border-slate-700 pl-3 ml-1">
          National Land Acquisition & Management System
        </span>
        <div className="ml-auto flex items-center gap-2">
          <span className="bg-purple-600/20 text-purple-300 text-xs px-2.5 py-1 rounded border border-purple-500/40 font-semibold">
            {selectedParcels.length} Selected
          </span>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <aside className="w-96 shrink-0 bg-slate-100 flex flex-col p-4 overflow-y-auto border-r border-slate-200 shadow-lg z-10">
          <CoordinateInput onIdentify={handleIdentify} isLoading={isLoading} />
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm border border-red-200">
              {error}
            </div>
          )}
          <ParcelInfo 
            data={data} 
            selectedParcels={selectedParcels}
            onToggleParcel={toggleParcelSelection}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            onAnalyze={handleAnalyzeCart}
            onAcquire={handleAcquireCart}
          />
        </aside>
        
        <section className="flex-1 relative isolate z-0">
          <MapView 
            latitude={mapCenter.lat} 
            longitude={mapCenter.lng} 
            data={data}
            selectedParcels={selectedParcels}
            onToggleParcel={toggleParcelSelection}
            onMapClick={(lat, lng) => handleIdentify(lat, lng, 150)}
          />
        </section>
      </main>

      {showIntelligence && data && selectedParcels.length > 0 && (
        <LocationIntelligence
          latitude={selectedParcels[0].geojson?.coordinates?.[0]?.[0]?.[1] || mapCenter.lat}
          longitude={selectedParcels[0].geojson?.coordinates?.[0]?.[0]?.[0] || mapCenter.lng}
          district={getLocalName()}
          state={data?.reverse_geocode?.state || selectedParcels[0].state || 'India'}
          onClose={() => setShowIntelligence(false)}
        />
      )}

      {showAcquisition && data && selectedParcels.length > 0 && (
        <AcquisitionDashboard
          selectedParcels={selectedParcels}
          district={getLocalName()}
          state={data?.reverse_geocode?.state || selectedParcels[0].state || 'India'}
          onClose={() => setShowAcquisition(false)}
        />
      )}
    </div>
  );
}
