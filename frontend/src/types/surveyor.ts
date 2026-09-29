export type SurveyorAppSection = 'home' | 'surveys' | 'map' | 'more' | 'active-survey' | 'legal_guidance'

export type SurveyorTab = 'parcels' | 'gps-walk' | 'asset-audit' | 'verification' | 'sync-queue'

export type SurveyStage = 'site' | 'people' | 'assets' | 'evidence' | 'review'

export type LandUseType = 'Agricultural' | 'Residential' | 'Commercial' | 'Industrial' | 'Barren'

export interface CropRecord {
  id: string
  cropName: string
  cultivatedAreaHa: number
  season: 'Kharif' | 'Rabi' | 'Perennial'
  irrigationType: 'Canal' | 'Borewell' | 'Well' | 'Rainfed'
}

export interface TreeRecord {
  id: string
  species: string
  category: 'Fruit-Bearing' | 'Timber' | 'Medicinal' | 'Other'
  quantity: number
  girthClass?: string
  condition: 'Good' | 'Average' | 'Poor'
  isProductive: boolean
}

export interface StructureRecord {
  id: string
  type: 'Residential House' | 'Cattle Shed' | 'Farm Store' | 'Commercial Building' | 'Boundary Wall'
  constructionType: 'Pucca' | 'Semi-Pucca' | 'Kutcha'
  plinthAreaSqM: number
  floors: number
  condition: 'Good' | 'Average' | 'Dilapidated'
}

export interface WaterAssetRecord {
  id: string
  type: 'Open Well' | 'Borewell' | 'Farm Pond' | 'Drip Irrigation Network'
  depthMeters?: number
  operationalStatus: 'Operational' | 'Seasonal' | 'Defunct'
}

export interface GeotaggedPhoto {
  id: string
  caption: string
  category: 'Site Overview' | 'Boundary Marker' | 'Structure' | 'Crop / Trees' | 'Dispute'
  latitude: number
  longitude: number
  timestamp: string
  thumbnailUrl: string
}

export interface FieldParcelTask {
  id: string
  khasraGatNumber: string
  village: string
  tehsil: string
  district: string
  surveyStatus: 'Assigned' | 'Boundary_Walk_In_Progress' | 'Assets_Audited' | 'Survey_Completed' | 'Synced_To_State_Cloud'
  scheduleDate?: 'Today' | 'Tomorrow' | 'Upcoming' | 'Completed'
  prescribedAreaHectares: number
  measuredAreaHectares?: number
  variancePercentage?: number
  ownerNameRecord: string
  occupantOnSite: string
  occupantType?: 'Self-Cultivating Owner' | 'Tenant' | 'Sharecropper' | 'Caretaker' | 'Legal Heir'
  aadhaarMasked?: string
  isDisputedBoundary: boolean
  disputeNotes?: string
  landUse?: LandUseType
  isIrrigated?: boolean
  irrigationSource?: string
  roadAccess?: 'Direct Paved Village Road' | 'Kutcha Farm Track' | 'Enclosed / No Direct Access'
  gpsCoordinatesCount: number
  gpsAccuracyMeters?: number
  crops?: CropRecord[]
  trees?: TreeRecord[]
  structures?: StructureRecord[]
  waterAssets?: WaterAssetRecord[]
  otherAssetsCount?: number
  photos?: GeotaggedPhoto[]
  surveyorRemarks?: string
  ownerSignatureCaptured?: boolean
  treesSurveyed?: {
    timberTrees: number
    fruitBearingTrees: number
  }
  structuresCount?: {
    puccaStructures: number
    borewells: number
    farmPonds: number
    fencingMeters: number
  }
  photoCount?: number
  offlineCached: boolean
  lastSurveyTimestamp?: string
}

export interface SurveyorPreferences {
  surveyMode: 'guided' | 'compact'
  appearance: 'light' | 'dark' | 'contrast'
  textSize: 'medium' | 'large'
  autoSave: boolean
  offlineMode: boolean
  voiceInput: boolean
}
