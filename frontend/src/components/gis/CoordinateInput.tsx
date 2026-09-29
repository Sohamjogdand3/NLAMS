import React, { useState } from 'react';
import { MapPin, Loader2, Home, TreePine, Building2 } from 'lucide-react';

interface CoordinateInputProps {
  onIdentify: (lat: number, lng: number, radius: number) => void;
  isLoading: boolean;
}

const SCENARIOS = [
  { name: "Urban Layout", icon: Building2, lat: "19.076153", lng: "72.915444", color: "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-300" },
  { name: "Slum Settlement", icon: Home, lat: "19.032800", lng: "72.901000", color: "bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-300" },
  { name: "Forest Land", icon: TreePine, lat: "19.214700", lng: "72.910600", color: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-300" }
];

export function CoordinateInput({ onIdentify, isLoading }: CoordinateInputProps) {
  const [lat, setLat] = useState<string>('19.032800');
  const [lng, setLng] = useState<string>('72.901000');
  const [radius, setRadius] = useState<string>('300');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const l = parseFloat(lat);
    const n = parseFloat(lng);
    const r = parseFloat(radius);
    if (isNaN(l) || isNaN(n) || isNaN(r)) {
      setError('Invalid input values');
      return;
    }
    setError('');
    onIdentify(l, n, r);
  };

  const handleScenarioSelect = (clat: string, clng: string) => {
    setLat(clat);
    setLng(clng);
    onIdentify(parseFloat(clat), parseFloat(clng), parseFloat(radius));
  };

  return (
    <div className="bg-white p-4 shadow-md rounded-lg mb-4 border border-slate-200">
      <h2 className="text-xl font-bold text-slate-800 tracking-tight">NLAMS &mdash; LAND INTELLIGENCE</h2>
      <p className="text-sm text-slate-500 mb-4">GIS / Cadastral Foundation</p>
      
      <div className="mb-5">
        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Demo Scenarios</label>
        <div className="flex flex-col gap-2">
          {SCENARIOS.map(s => {
            const Icon = s.icon;
            return (
              <button
                key={s.name}
                type="button"
                onClick={() => handleScenarioSelect(s.lat, s.lng)}
                className={`flex items-center gap-2 w-full px-3 py-2 text-sm font-medium border rounded transition-colors ${s.color}`}
              >
                <Icon className="w-4 h-4" />
                Test {s.name}
              </button>
            )
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 pt-3 border-t border-slate-100">
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Latitude</label>
            <input
              type="number"
              step="0.000001"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Longitude</label>
            <input
              type="number"
              step="0.000001"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              required
            />
          </div>
        </div>

        <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Search Radius (m)</label>
            <input
              type="number"
              step="10"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              required
            />
        </div>
        
        {error && <p className="text-red-500 text-xs">{error}</p>}
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2.5 px-4 rounded transition-colors disabled:bg-slate-500 mt-2 shadow-sm"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5" />}
          Identify Location
        </button>
      </form>
    </div>
  );
}
