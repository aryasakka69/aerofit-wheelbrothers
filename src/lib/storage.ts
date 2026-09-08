import { Brand, BikeModel, UserBikeProfile, BikeCategory, DEFAULT_BIKE_CATEGORIES } from './types/bike';
import { CdaCalculationResult, CdaManualInput } from './types/cda';
import { INITIAL_BRANDS, INITIAL_BIKE_MODELS } from './data/seed-bikes';

import { BiomechanicalAngles, AngleEvaluation, PoseLandmarks } from './fitting/angles';

const BRANDS_KEY = 'aerofit_brands_v1';
const MODELS_KEY = 'aerofit_bike_models_v1';
const USER_BIKES_KEY = 'aerofit_user_bikes_v1';
const CDA_HISTORY_KEY = 'aerofit_cda_history_v1';
const BIKE_FITS_KEY = 'aerofit_bike_fits_v1';

export interface BikeFitScanRecord {
  id: string;
  timestamp: string;
  bikeId?: string;
  bikeName: string;
  bikeCategory: BikeCategory;
  angles: BiomechanicalAngles;
  evaluations: AngleEvaluation[];
  landmarks: PoseLandmarks;
  aiSummary?: string;
}

export interface SavedCalculationRecord {
  id: string;
  timestamp: string;
  bikeName: string;
  bikeCategory: BikeCategory;
  input: CdaManualInput;
  result: CdaCalculationResult;
  source: 'MANUAL' | 'FILE_IMPORT';
  aiNarrative?: string;
}

// In-memory fallback if running on server side or SSR
let memoryBrands: Brand[] = [...INITIAL_BRANDS];
let memoryModels: BikeModel[] = [...INITIAL_BIKE_MODELS];
let memoryUserBikes: UserBikeProfile[] = [
  {
    id: 'ub-demo-1',
    customName: 'Sepeda Road Harian (Helios A9)',
    brandId: 'brand-polygon',
    brandName: 'Polygon',
    modelId: 'polygon-helios-a9',
    modelName: 'Helios A9 / A8 (Aero Road)',
    year: 2023,
    isCustomOrFallback: false,
    category: 'AERO_ROAD',
    estimatedFrontalArea: 0.095,
    estimatedCrr: 0.0040,
    weightKg: 7.9,
    notes: 'Wheelset 50mm carbon, tubeless 28c',
    createdAt: new Date().toISOString()
  },
  {
    id: 'ub-demo-2',
    customName: 'Specialized S-Works Tarmac SL8 (Race Day)',
    brandId: 'brand-specialized',
    brandName: 'Specialized',
    modelId: 'spz-tarmac-sl8',
    modelName: 'S-Works Tarmac SL8 (Speed Sniffer)',
    year: 2024,
    isCustomOrFallback: false,
    category: 'AERO_ROAD',
    estimatedFrontalArea: 0.089,
    estimatedCrr: 0.0038,
    weightKg: 6.8,
    notes: 'Roval Rapide CLX II, S-Works Turbo Cotton',
    createdAt: new Date().toISOString()
  },
  {
    id: 'ub-demo-3',
    customName: 'Trek Madone SLR Gen 8 (Criterium)',
    brandId: 'brand-trek',
    brandName: 'Trek',
    modelName: 'Madone SLR Gen 7 / Gen 8 (IsoFlow)',
    year: 2024,
    isCustomOrFallback: false,
    category: 'AERO_ROAD',
    estimatedFrontalArea: 0.088,
    estimatedCrr: 0.0038,
    weightKg: 7.2,
    notes: 'Bontrager Aeolus RSL 62, IsoFlow cockpit',
    createdAt: new Date().toISOString()
  },
  {
    id: 'ub-demo-4',
    customName: 'Cervélo P5 TT Machine (Time Trial & Tri)',
    brandId: 'brand-cervelo',
    brandName: 'Cervélo',
    modelName: 'P5 / P-Series TT Disc',
    year: 2023,
    isCustomOrFallback: false,
    category: 'TT_TRIATHLON',
    estimatedFrontalArea: 0.067,
    estimatedCrr: 0.0033,
    weightKg: 8.4,
    notes: 'Aerobars extensions, rear disc wheel, aerodynamic front 80mm',
    createdAt: new Date().toISOString()
  }
];
let memoryCalculations: SavedCalculationRecord[] = [];

export function getBrands(): Brand[] {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(BRANDS_KEY);
    if (saved) {
      try {
        const parsed: Brand[] = JSON.parse(saved);
        if (parsed.length >= INITIAL_BRANDS.length) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse brands from localStorage', e);
      }
    }
    // Auto sync with latest complete INITIAL_BRANDS
    saveBrands(INITIAL_BRANDS);
  }
  return INITIAL_BRANDS;
}

export function saveBrands(brands: Brand[]): void {
  memoryBrands = brands;
  if (typeof window !== 'undefined') {
    localStorage.setItem(BRANDS_KEY, JSON.stringify(brands));
  }
}

export function addBrand(brand: Omit<Brand, 'id'>): Brand {
  const brands = getBrands();
  const id = `brand-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const newBrand: Brand = { id, ...brand };
  const updated = [...brands, newBrand];
  saveBrands(updated);
  return newBrand;
}

export function deleteBrand(brandId: string): void {
  const brands = getBrands().filter(b => b.id !== brandId);
  saveBrands(brands);
  const models = getBikeModels().filter(m => m.brandId !== brandId);
  saveBikeModels(models);
}

export function getBikeModels(): BikeModel[] {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(MODELS_KEY);
    if (saved) {
      try {
        const parsed: BikeModel[] = JSON.parse(saved);
        if (parsed.length >= INITIAL_BIKE_MODELS.length) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse bike models from localStorage', e);
      }
    }
    // Auto sync with latest complete INITIAL_BIKE_MODELS
    saveBikeModels(INITIAL_BIKE_MODELS);
  }
  return INITIAL_BIKE_MODELS;
}

export function saveBikeModels(models: BikeModel[]): void {
  memoryModels = models;
  if (typeof window !== 'undefined') {
    localStorage.setItem(MODELS_KEY, JSON.stringify(models));
  }
}

export function addBikeModel(model: Omit<BikeModel, 'id'>): BikeModel {
  const models = getBikeModels();
  const brands = getBrands();
  const brand = brands.find(b => b.id === model.brandId);
  const id = `model-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const newModel: BikeModel = {
    id,
    ...model,
    brandName: brand?.name || model.brandName || 'Unknown Brand'
  };
  const updated = [...models, newModel];
  saveBikeModels(updated);
  return newModel;
}

export function updateBikeModel(id: string, updates: Partial<BikeModel>): BikeModel | null {
  const models = getBikeModels();
  const index = models.findIndex(m => m.id === id);
  if (index === -1) return null;
  const updatedModel = { ...models[index], ...updates };
  models[index] = updatedModel;
  saveBikeModels(models);
  return updatedModel;
}

export function deleteBikeModel(id: string): void {
  const models = getBikeModels().filter(m => m.id !== id);
  saveBikeModels(models);
}

// User Bike Garage
export function getUserBikes(): UserBikeProfile[] {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(USER_BIKES_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse user bikes from localStorage', e);
      }
    }
  }
  return memoryUserBikes;
}

export function saveUserBikes(bikes: UserBikeProfile[]): void {
  memoryUserBikes = bikes;
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_BIKES_KEY, JSON.stringify(bikes));
  }
}

export function addUserBike(bike: Omit<UserBikeProfile, 'id' | 'createdAt'>): UserBikeProfile {
  const bikes = getUserBikes();
  const newBike: UserBikeProfile = {
    id: `bike-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
    ...bike
  };
  const updated = [newBike, ...bikes];
  saveUserBikes(updated);
  return newBike;
}

export function deleteUserBike(id: string): void {
  const bikes = getUserBikes().filter(b => b.id !== id);
  saveUserBikes(bikes);
}

// CdA Calculations History
export function getSavedCalculations(): SavedCalculationRecord[] {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(CDA_HISTORY_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse calculations from localStorage', e);
      }
    }
  }
  return memoryCalculations;
}

export function saveCalculationRecord(record: Omit<SavedCalculationRecord, 'id' | 'timestamp'>): SavedCalculationRecord {
  const history = getSavedCalculations();
  const newRecord: SavedCalculationRecord = {
    id: `calc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...record
  };
  const updated = [newRecord, ...history];
  memoryCalculations = updated;
  if (typeof window !== 'undefined') {
    localStorage.setItem(CDA_HISTORY_KEY, JSON.stringify(updated));
  }
  return newRecord;
}

export function deleteCalculationRecord(id: string): void {
  const history = getSavedCalculations().filter(c => c.id !== id);
  memoryCalculations = history;
  if (typeof window !== 'undefined') {
    localStorage.setItem(CDA_HISTORY_KEY, JSON.stringify(history));
  }
}

// Bike Fit Scans History
let memoryBikeFits: BikeFitScanRecord[] = [];

export function getBikeFitScans(): BikeFitScanRecord[] {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(BIKE_FITS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse bike fit scans from localStorage', e);
      }
    }
  }
  return memoryBikeFits;
}

export function getLatestBikeFitScan(): BikeFitScanRecord | null {
  const scans = getBikeFitScans();
  return scans.length > 0 ? scans[0] : null;
}

export function saveBikeFitScan(scan: Omit<BikeFitScanRecord, 'id' | 'timestamp'>): BikeFitScanRecord {
  const scans = getBikeFitScans();
  const newRecord: BikeFitScanRecord = {
    id: `fit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...scan
  };
  const updated = [newRecord, ...scans];
  memoryBikeFits = updated;
  if (typeof window !== 'undefined') {
    localStorage.setItem(BIKE_FITS_KEY, JSON.stringify(updated));
  }
  return newRecord;
}

