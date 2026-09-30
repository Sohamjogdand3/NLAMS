import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap, useMapEvents, Circle, LayersControl, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import type { IdentifyLandResponse, ParcelResponse } from '../../types/gis';

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
  onMapClick?: (lat: number, lng: number) => void;
}

function MapClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
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
      data.nearby_parcels.forEach((p: ParcelResponse) => {
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

const getParcelStyle = (_landUse?: string | null, _isMain: boolean = false, isSelected: boolean = false) => {
  if (isSelected) {
    return {
      color: '#5b21b6', // Solid deep purple stroke
      weight: 3.5,
      fillColor: '#8b5cf6', // Vibrant bright purple fill matching reference screenshot
      fillOpacity: 0.75,
      dashArray: '0',
    };
  }

  // Clean cadastral boundary outline matching reference screenshot
  return {
    color: '#475569',
    weight: 1.5,
    fillColor: '#94a3b8',
    fillOpacity: 0.15,
    dashArray: '0',
  };
};

export function MapView({ latitude, longitude, data, radius, selectedParcels = [], onToggleParcel, onMapClick }: MapViewProps) {
  
  const isSelected = (id: string) => selectedParcels.some(p => p.parcel_id === id);

  const handleFeature = (parcel: ParcelResponse) => (_feature: any, layer: L.Layer) => {
    layer.on({
      click: (e: L.LeafletMouseEvent) => {
        if (e.originalEvent) {
          e.originalEvent.stopPropagation();
        }
        L.DomEvent.stopPropagation(e);
        if (onToggleParcel) {
          onToggleParcel(parcel);
        }
      },
      mouseover: (e: L.LeafletMouseEvent) => {
        const target: any = e.target;
        if (!isSelected(parcel.parcel_id)) {
          target.setStyle({
            fillOpacity: 0.35,
            weight: 2.5,
            color: '#334155'
          });
        }
      },
      mouseout: (e: L.LeafletMouseEvent) => {
        const target: any = e.target;
        if (!isSelected(parcel.parcel_id)) {
          target.setStyle(getParcelStyle(parcel.land_use, false, false));
        }
      }
    });
  };

  return (
    <div className="h-full w-full rounded-lg overflow-hidden shadow-inner border border-slate-300 blueprint-map relative isolate z-0">
      <MapContainer
        center={[latitude, longitude]}
        zoom={18}
        maxZoom={22}
        style={{ height: '100%', width: '100%' }}
      >
        <MapClickHandler onMapClick={onMapClick} />
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
        
        {data && data.nearby_parcels && data.nearby_parcels.map((p: ParcelResponse) => {
          const selected = isSelected(p.parcel_id);
          return (
            <GeoJSON 
              key={`nearby-${p.parcel_id}-${selected}`} 
              data={p.geojson} 
              style={getParcelStyle(p.land_use, false, selected)}
              onEachFeature={handleFeature(p)}
            >
              <Tooltip 
                direction="center" 
                permanent 
                className={`cadastral-tooltip ${selected ? 'cadastral-tooltip-selected' : ''}`}
              >
                {p.survey_number}
              </Tooltip>
            </GeoJSON>
          );
        })}

        {data && data.parcel && (
          <GeoJSON 
            key={`main-${data.parcel.parcel_id}-${isSelected(data.parcel.parcel_id)}`} 
            data={data.parcel.geojson} 
            style={getParcelStyle(data.parcel.land_use, true, isSelected(data.parcel.parcel_id))}
            onEachFeature={handleFeature(data.parcel)}
          >
            <Tooltip 
              direction="center" 
              permanent 
              className={`cadastral-tooltip font-extrabold ${isSelected(data.parcel.parcel_id) ? 'cadastral-tooltip-selected' : ''}`}
            >
              {data.parcel.survey_number}
            </Tooltip>
          </GeoJSON>
        )}
        
        <MapUpdater latitude={latitude} longitude={longitude} data={data} />
      </MapContainer>
    </div>
  );
}
