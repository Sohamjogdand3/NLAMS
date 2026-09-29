export interface CoordinateInput {
  latitude: number;
  longitude: number;
}

export interface ReverseGeocodeResult {
  display_name: string;
  village: string | null;
  taluka: string | null;
  district: string | null;
  state: string | null;
  country: string | null;
}

export interface ParcelResponse {
  parcel_id: string;
  survey_number: string | null;
  cts_number: string | null;
  village: string;
  taluka: string;
  district: string;
  state: string;
  area_sqm: number;
  area_hectares: number;
  perimeter_m?: number;
  dimensions?: string;
  owner_name: string | null;
  land_use: string | null;
  source: string;
  ulpin: string | null;
  last_updated: string;
  confidence_note: string;
  geojson: any;
}

export interface IdentifyLandResponse {
  latitude: number;
  longitude: number;
  reverse_geocode: ReverseGeocodeResult | null;
  parcel: ParcelResponse | null;
  nearby_parcels: ParcelResponse[];
  message: string;
}

export interface InfrastructureItem {
  id: string;
  name: string;
  type: string;
  distance_m: number;
  coordinates: number[];
}

export interface ProjectItem {
  id: string;
  name: string;
  type: string;
  distance_m: number;
  status: string;
}

export interface NewsItem {
  title: string;
  link: string;
  published_date: string;
  source: string;
}

export interface AIAnalysis {
  connectivity_score: number;
  development_index: number;
  risk_profile: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  summary: string;
}

export interface LocationIntelligenceResponse {
  infrastructure: InfrastructureItem[];
  projects: ProjectItem[];
  news: NewsItem[];
  ai_analysis: AIAnalysis;
}

export interface ParcelInput {
  parcel_id: string;
  survey_number: string;
  area_sqm: number;
  district?: string;
  village?: string;
}

export interface ParcelCompensation {
  parcel_id: string;
  survey_number: string;
  area_sqm: number;
  base_value: number;
  multiplier: number;
  solatium: number;
  total_compensation: number;
}

export interface CompensationResponse {
  region_type: string;
  total_area_sqm: number;
  base_rate_per_sqm: number;
  multiplier_applied: number;
  solatium_percentage: number;
  total_base_value: number;
  total_solatium: number;
  grand_total: number;
  parcel_breakdown: ParcelCompensation[];
}

export interface NoticeResponse {
  document_html: string;
  document_markdown: string;
  generated_date: string;
  reference_number: string;
}
