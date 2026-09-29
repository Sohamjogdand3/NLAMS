import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap, Circle, LayersControl, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { IdentifyLandResponse, ParcelResponse } from '../types';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface MapViewProps {
  latitude: number;
  longitude: number;
  data: IdentifyLandResponse | null;
  radius?: number;
  selectedParcels?: ParcelResponse[];
  onToggleParcel?: (p: ParcelResponse) => void;
}

function MapUpdater({ latitude, longitude, data }: MapViewProps) {
  const map = useMap();

  useEffect(() => {
    let allBounds = L.latLngBounds([latitude, longitude], [latitude, longitude]);
    let hasBounds = false;

    if (data?.parcel?.geojson) {
      const layer = L.geoJSON(data.parcel.geojson);
      allBounds.extend(layer.getBounds());
      hasBounds = true;
    }

    if (data?.nearby_parcels) {
      data.nearby_parcels.forEach(p => {
        const layer = L.geoJSON(p.geojson);
        allBounds.extend(layer.getBounds());
        hasBounds = true;
      });
    }

    if (hasBounds) {
      map.fitBounds(allBounds, { padding: [50, 50] });
    } else {
      map.setView([latitude, longitude], 15);
    }
  }, [latitude, longitude, data, map]);

  return null;
}

const getParcelStyle = (landUse: string | undefined | null, isMain: boolean = false, isSelected: boolean = false) => {
  if (isSelected) {
    return { color: '#7c3aed', weight: 4, fillColor: '#8b5cf6', fillOpacity: 0.8, dashArray: '0' }; // Purple for selected
  }

  if (landUse === 'Forest') {
    return isMain 
      ? { color: '#047857', weight: 4, fillColor: '#10b981', fillOpacity: 0.7, dashArray: '6,6' }
      : { color: '#059669', weight: 1, fillColor: '#34d399', fillOpacity: 0.2 };
  }
  if (landUse === 'Slum') {
    return isMain 
      ? { color: '#c2410c', weight: 4, fillColor: '#f97316', fillOpacity: 0.7, dashArray: '6,6' }
      : { color: '#ea580c', weight: 1, fillColor: '#fb923c', fillOpacity: 0.2 };
  }
  
  // Default (Residential/Commercial)
  return isMain 
    ? { color: '#1d4ed8', weight: 4, fillColor: '#3b82f6', fillOpacity: 0.7, dashArray: '6,6' }
    : { color: '#64748b', weight: 1, fillColor: '#e2e8f0', fillOpacity: 0.2 };
};

export function MapView({ latitude, longitude, data, radius, selectedParcels = [], onToggleParcel }: MapViewProps) {
  
  const isSelected = (id: string) => selectedParcels.some(p => p.parcel_id === id);

  return (
    <div className="h-full w-full rounded-lg overflow-hidden shadow-inner border border-slate-300">
      <MapContainer
        center={[latitude, longitude]}
        zoom={18}
        maxZoom={22}
        style={{ height: '100%', width: '100%' }}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Cadastral Base Map">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={22}
              maxNativeZoom={19}
              className="cadastral-map-tiles"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite Imagery">
            <TileLayer
              attribution='Tiles &copy; Esri'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={22}
              maxNativeZoom={19}
            />
          </LayersControl.BaseLayer>
        </LayersControl>
        
        <Marker position={[latitude, longitude]}>
          <Popup>
            Lat: {latitude.toFixed(6)}<br />
            Lng: {longitude.toFixed(6)}
          </Popup>
        </Marker>

        {radius && (
          <Circle 
            center={[latitude, longitude]} 
            radius={radius} 
            pathOptions={{ color: '#ef4444', fillColor: 'transparent', weight: 2, dashArray: '5,5' }} 
          />
        )}
        
        {data && data.nearby_parcels && data.nearby_parcels.map((p) => (
          <GeoJSON 
            key={p.parcel_id} 
            data={p.geojson} 
            style={getParcelStyle(p.land_use, false, isSelected(p.parcel_id))}
            eventHandlers={{
              click: () => onToggleParcel && onToggleParcel(p)
            }}
          >
            <Tooltip direction="center" permanent className="bg-transparent border-0 shadow-none font-bold text-[9px] text-slate-700 opacity-80">
              {p.survey_number}
            </Tooltip>
          </GeoJSON>
        ))}

        {data && data.parcel && (
          <GeoJSON 
            key={`main-${data.parcel.parcel_id}`} 
            data={data.parcel.geojson} 
            style={getParcelStyle(data.parcel.land_use, true, isSelected(data.parcel.parcel_id))}
            eventHandlers={{
              click: () => onToggleParcel && onToggleParcel(data.parcel!)
            }}
          >
            <Tooltip direction="center" permanent className="bg-transparent border-0 shadow-none font-bold text-[10px] text-blue-900">
              {data.parcel.survey_number}
            </Tooltip>
          </GeoJSON>
        )}
        
        <MapUpdater latitude={latitude} longitude={longitude} data={data} />
      </MapContainer>
    </div>
  );
}
