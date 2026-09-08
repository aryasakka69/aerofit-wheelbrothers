export type BikeCategory = 
  | 'ROAD_ALLROUNDER'
  | 'AERO_ROAD'
  | 'TT_TRIATHLON'
  | 'ENDURANCE_GRAVEL';

export interface BikeCategoryDefault {
  id: BikeCategory;
  name: string;
  description: string;
  defaultFrontalArea: number; // m²
  defaultCrr: number; // coefficient of rolling resistance
  defaultDrivetrainLoss: number; // decimal (e.g. 0.025 = 2.5%)
  silhouetteType: string;
}

export interface Brand {
  id: string;
  name: string;
  country?: string;
}

export interface BikeModel {
  id: string;
  brandId: string;
  brandName?: string;
  modelName: string;
  yearStart: number;
  yearEnd?: number | null;
  categoryId: BikeCategory;
  customFrontalArea?: number | null;
  customCrr?: number | null;
  notes?: string | null;
}

export interface UserBikeProfile {
  id: string;
  customName: string;
  brandId?: string;
  brandName?: string;
  modelId?: string;
  modelName?: string;
  year?: number;
  isCustomOrFallback: boolean;
  category: BikeCategory;
  estimatedFrontalArea: number;
  estimatedCrr: number;
  weightKg: number;
  notes?: string;
  createdAt: string;
}

export const DEFAULT_BIKE_CATEGORIES: Record<BikeCategory, BikeCategoryDefault> = {
  ROAD_ALLROUNDER: {
    id: 'ROAD_ALLROUNDER',
    name: 'Road Bike (All-Rounder / Climbing)',
    description: 'Frame tabung bulat/semi-aero standar, geometri tegak/lincah, setang drop-bar standar.',
    defaultFrontalArea: 0.115, // m² kontribusi sepeda saja
    defaultCrr: 0.0045, // Ban road 25-28c standar
    defaultDrivetrainLoss: 0.025, // 2.5% loss
    silhouetteType: 'road_allrounder'
  },
  AERO_ROAD: {
    id: 'AERO_ROAD',
    name: 'Aero Road Bike',
    description: 'Frame tabung pipih aerofoil terintegrasi, deep section wheels, cockpit aero terpadu.',
    defaultFrontalArea: 0.095, // m² kontribusi sepeda saja
    defaultCrr: 0.0040, // Ban road race cepat (GP5000 / tubeless)
    defaultDrivetrainLoss: 0.022,
    silhouetteType: 'aero_road'
  },
  TT_TRIATHLON: {
    id: 'TT_TRIATHLON',
    name: 'Time Trial (TT) / Triathlon Bike',
    description: 'Geometri sangat agresif, cockpit aerobar extensions, hidrasi & bento box terintegrasi.',
    defaultFrontalArea: 0.075, // m² kontribusi sepeda saja
    defaultCrr: 0.0035, // Ban TT ultra-low rolling resistance
    defaultDrivetrainLoss: 0.020,
    silhouetteType: 'tt_triathlon'
  },
  ENDURANCE_GRAVEL: {
    id: 'ENDURANCE_GRAVEL',
    name: 'Endurance / Gravel Bike',
    description: 'Geometri relaks lebih tegak, ban lebih lebar, clearance tinggi, fork lebih lebar.',
    defaultFrontalArea: 0.130, // m² kontribusi sepeda saja
    defaultCrr: 0.0060, // Ban gravel 35-42c
    defaultDrivetrainLoss: 0.028,
    silhouetteType: 'endurance_gravel'
  }
};
