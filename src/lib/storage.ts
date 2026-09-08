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

let memoryBrands: Brand[] = [...INITIAL_BRANDS];
let memoryModels: BikeModel[] = [...INITIAL_BIKE_MODELS];
let memoryUserBikes: UserBikeProfile[] = [];
let memoryCalculations: SavedCalculationRecord[] = [];

export function getBrands(): Brand[] {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(BRANDS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    saveBrands(INITIAL_BRANDS);
  }
  return INITIAL_BRANDS;
}

export function saveBrands(brands: Brand[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(BRANDS_KEY, JSON.stringify(brands));
  }
}

export function getBikeModels(): BikeModel[] {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(MODELS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    saveBikeModels(INITIAL_BIKE_MODELS);
  }
  return INITIAL_BIKE_MODELS;
}

export function saveBikeModels(models: BikeModel[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(MODELS_KEY, JSON.stringify(models));
  }
}

export function getUserBikes(): UserBikeProfile[] {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(USER_BIKES_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
  }
  return memoryUserBikes;
}

export function saveUserBikes(bikes: UserBikeProfile[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_BIKES_KEY, JSON.stringify(bikes));
  }
}

export function addUserBike(bike: Omit<UserBikeProfile, 'id' | 'createdAt'>): UserBikeProfile {
  const bikes = getUserBikes();
  const newBike: UserBikeProfile = {
    id: `bike-${Date.now()}`,
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

export function getSavedCalculations(): SavedCalculationRecord[] {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(CDA_HISTORY_KEY);
    if (saved) return JSON.parse(saved);
  }
  return memoryCalculations;
}

export function saveCalculationRecord(record: Omit<SavedCalculationRecord, 'id' | 'timestamp'>): SavedCalculationRecord {
  const history = getSavedCalculations();
  const newRecord = { id: `calc-${Date.now()}`, timestamp: new Date().toISOString(), ...record };
  localStorage.setItem(CDA_HISTORY_KEY, JSON.stringify([newRecord, ...history]));
  return newRecord;
}

export function saveBikeFitScan(scan: Omit<BikeFitScanRecord, 'id' | 'timestamp'>): BikeFitScanRecord {
  const scans = getBikeFitScans();
  const newRecord = { id: `fit-${Date.now()}`, timestamp: new Date().toISOString(), ...scan };
  localStorage.setItem(BIKE_FITS_KEY, JSON.stringify([newRecord, ...scans]));
  return newRecord;
}

export function getBikeFitScans(): BikeFitScanRecord[] {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(BIKE_FITS_KEY);
    if (saved) return JSON.parse(saved);
  }
  return [];
}

export function getLatestBikeFitScan(): BikeFitScanRecord | null {
  const scans = getBikeFitScans();
  return scans.length > 0 ? scans[0] : null;
}