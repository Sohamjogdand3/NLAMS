import { IdentifyLandResponse, CoordinateInput, LocationIntelligenceResponse, ParcelResponse, ParcelInput, CompensationResponse, NoticeResponse } from "../types";

const API_BASE_URL = "http://localhost:8000/api";

export const gisService = {
  async identifyLand(input: CoordinateInput): Promise<IdentifyLandResponse> {
    const response = await fetch(`${API_BASE_URL}/gis/identify-land`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    
    if (!response.ok) {
      throw new Error("Failed to identify land");
    }
    
    return response.json();
  },

  async analyzeLocation(latitude: number, longitude: number, district: string, state: string): Promise<LocationIntelligenceResponse> {
    const response = await fetch(`${API_BASE_URL}/intelligence/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ latitude, longitude, radius_m: 3000, district, state }),
    });
    
    if (!response.ok) {
      throw new Error("Failed to analyze location");
    }
    
    return response.json();
  }
};

export const acquisitionService = {
  async calculateCompensation(parcels: ParcelInput[], regionType: string): Promise<CompensationResponse> {
    const response = await fetch(`${API_BASE_URL}/acquisition/calculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parcels, region_type: regionType }),
    });
    if (!response.ok) throw new Error("Failed to calculate compensation");
    return response.json();
  },

  async generateNotice(parcels: ParcelInput[], district: string, state: string): Promise<NoticeResponse> {
    const response = await fetch(`${API_BASE_URL}/acquisition/generate-notice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parcels, district, state }),
    });
    if (!response.ok) throw new Error("Failed to generate notice");
    return response.json();
  }
};
