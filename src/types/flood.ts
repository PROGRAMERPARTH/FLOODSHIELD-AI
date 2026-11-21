export type RiskLevel = 'safe' | 'warning' | 'severe' | 'impassable';

export type VehicleType = 'twoWheeler' | 'hatchback' | 'suv' | 'pedestrian';

export interface RoadSegment {
  id: string;
  name: string;
  nameMarathi: string;
  ward: string;
  wardMarathi: string;
  coordinates: [number, number][]; // [lat, lng] array
  elevationMeters: number; // elevation above mean sea level
  slopePercent: number;
  drainCapacityM3s: number;
  catchmentAreaKm2: number;
  proximityToWaterbodyM: number;
  waterbodyName: string;
  historicalJuly2026PeakDepthCm: number;
  baseElevationCategory: 'depression' | 'valley' | 'moderate' | 'elevated' | 'ridge';
  drainageCulvertStatus: 'optimal' | 'partially_silted' | 'severely_clogged' | 'overflowing';
  // Dynamic computed fields based on rainfall & dam discharge
  currentWaterDepthCm: number;
  riskLevel: RiskLevel;
  vehicleAccessibility: {
    twoWheeler: boolean;
    hatchback: boolean;
    suv: boolean;
    pedestrian: boolean;
  };
  hazards: string[];
  hazardsMarathi: string[];
  safeAlternativeRoadId?: string;
  safeAlternativeName?: string;
  safeAlternativeNameMarathi?: string;
  activeComplaintsCount: number;
  dewateringPumpDeployed: boolean;
}

export interface WaterwayChannel {
  id: string;
  name: string;
  nameMarathi: string;
  type: 'river' | 'nullah' | 'canal';
  coordinates: [number, number][];
  currentDischargeLevel: 'normal' | 'alert' | 'danger' | 'extreme';
  dischargeCusecs?: number;
}

export interface CitizenReport {
  id: string;
  roadSegmentId: string;
  roadName: string;
  roadNameMarathi: string;
  location: [number, number];
  timestamp: string;
  reportedBy: string;
  imageUrl: string;
  userEstimatedDepthCm: number;
  aiVerified: boolean;
  aiAnalysis?: {
    estimatedDepthCm: number;
    depthCategory: 'shallow' | 'moderate' | 'severe' | 'critical';
    confidenceScore: number;
    depthVisualIndicators: string[];
    accessibility: {
      twoWheeler: string;
      hatchback: string;
      suv: string;
      pedestrian: string;
    };
    hazards: string[];
    urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    aiObservationSummary: string;
    aiObservationSummaryMarathi: string;
  };
  status: 'verified' | 'investigating' | 'action_dispatched';
}

export interface SafeRouteOption {
  type: 'flooded_direct' | 'ai_flood_safe';
  title: string;
  titleMarathi: string;
  distanceKm: number;
  estimatedMinutes: number;
  maxWaterDepthCm: number;
  riskLevel: RiskLevel;
  passableForSelectedVehicle: boolean;
  averageElevationM: number;
  coordinates: [number, number][];
  segments: {
    name: string;
    nameMarathi: string;
    depthCm: number;
    elevationM: number;
    risk: RiskLevel;
    warning?: string;
    warningMarathi?: string;
  }[];
  turnGuidance: {
    instruction: string;
    instructionMarathi: string;
    distanceM: number;
    safetyNote?: string;
  }[];
}

export interface WeatherTelemetry {
  rainfallIntensityMmHr: number;
  forecastNext3HrMmHr: number;
  khadakwaslaDamDischargeCusecs: number;
  damStatus: 'safe' | 'alert_level' | 'danger_level' | 'flood_release';
  rainBandMovement: string;
  soilSaturationPercent: number;
  timeHorizon: 'now' | '+1h' | '+3h' | '+6h';
  cloudCoverPercent: number;
}

export interface MarathiAlertData {
  alertTitleMarathi: string;
  alertTitleEnglish: string;
  marathiMessage: string;
  englishMessage: string;
  safeRouteMarathi: string;
  safeRouteEnglish: string;
  wardName: string;
  timestamp: string;
  emergencyHelplines: {
    nameMarathi: string;
    name: string;
    number: string;
  }[];
  audioAnnouncementScriptMarathi: string;
}

export interface CivicComplaint {
  id: string;
  roadName: string;
  ward: string;
  type: 'waterlogging' | 'open_manhole' | 'fallen_tree' | 'drain_choked';
  reportedAt: string;
  status: 'open' | 'pump_dispatched' | 'resolved';
  depthCm: number;
  referenceToJuly2026: boolean;
}
