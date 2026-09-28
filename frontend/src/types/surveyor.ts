export type SurveyorTab = 'parcels' | 'gps-walk' | 'asset-audit' | 'verification' | 'sync-queue'

export interface FieldParcelTask {
  id: string
  khasraGatNumber: string
  village: string
  tehsil: string
  district: string
  surveyStatus: 'Assigned' | 'Boundary_Walk_In_Progress' | 'Assets_Audited' | 'Survey_Completed' | 'Synced_To_State_Cloud'
  prescribedAreaHectares: number
  measuredAreaHectares?: number
  variancePercentage?: number
  ownerNameRecord: string
  occupantOnSite: string
  isDisputedBoundary: boolean
  gpsCoordinatesCount: number
  treesSurveyed: {
    timberTrees: number // Teak, Sal, Babool
    fruitBearingTrees: number // Mango, Guava, Coconut
  }
  structuresCount: {
    puccaStructures: number
    borewells: number
    farmPonds: number
    fencingMeters: number
  }
  photoCount: number
  offlineCached: boolean
  lastSurveyTimestamp?: string
}

export interface GeotaggedPhoto {
  id: string
  caption: string
  category: 'Boundary Marker' | 'Structure' | 'Crop / Trees' | 'Dispute'
  latitude: number
  longitude: number
  timestamp: string
  thumbnailUrl: string
}
