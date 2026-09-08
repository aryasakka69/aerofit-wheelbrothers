import { BikeCategory } from './bike';

export interface CdaManualInput {
  bikeId?: string;
  bikeName?: string;
  bikeCategory: BikeCategory;
  speedKmh: number;
  powerWatts: number;
  riderWeightKg: number;
  bikeWeightKg: number;
  temperatureC: number;
  altitudeM: number;
  crr: number;
  drivetrainEfficiencyPct: number; // e.g. 97.5%
  slopePercent?: number; // % gradient (0 for flat)
  headwindKmh?: number; // relative headwind (+) or tailwind (-)
}

export interface PowerBreakdown {
  dragPower: number; // Watts
  dragPercent: number;
  rollingPower: number; // Watts
  rollingPercent: number;
  gravityPower: number; // Watts
  gravityPercent: number;
  drivetrainLoss: number; // Watts
  drivetrainPercent: number;
  netPower: number; // Total power minus losses
}

export interface PositionBenchmark {
  positionName: string;
  description: string;
  cdaRangeMin: number;
  cdaRangeMax: number;
  typicalRider: string;
}

export interface CdaCalculationResult {
  cda: number; // m²
  airDensityRho: number; // kg/m³
  breakdown: PowerBreakdown;
  speedKmh: number;
  powerWatts: number;
  totalWeightKg: number;
  positionEvaluation: {
    status: 'AGGRESSIVE_TT' | 'AERO_HOODS_DROPS' | 'STANDARD_ROAD' | 'UPRIGHT_CLIMB' | 'HIGH_DRAG';
    label: string;
    description: string;
  };
  impactEstimates: {
    speedIncreaseAtSamePowerKmh: number; // if CdA dropped by 0.02
    wattsSavedAtSameSpeed: number; // if CdA dropped by 0.02
    timeSaved40kmMinutes: number; // at 40km distance
  };
}

export interface ActivityDataPoint {
  timestamp: number; // ms
  distanceM: number;
  speedMps: number;
  powerWatts: number;
  altitudeM: number;
  cadenceRpm?: number;
  heartRateBpm?: number;
}

export interface ChungCalibrationResult {
  cda: number;
  crr: number;
  points: {
    distanceKm: number;
    actualElevationM: number;
    virtualElevationM: number;
  }[];
  rSquared: number;
}
