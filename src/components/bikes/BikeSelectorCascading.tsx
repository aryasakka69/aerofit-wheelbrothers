'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Bike, 
  Calendar, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  Sparkles, 
  Plus, 
  HelpCircle, 
  ShieldAlert, 
  ArrowRight,
  Globe,
  Search,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { Brand, BikeModel, BikeCategory, DEFAULT_BIKE_CATEGORIES, UserBikeProfile } from '@/lib/types/bike';
import { getBrands, getBikeModels, addUserBike, addBrand, addBikeModel } from '@/lib/storage';
import { BikeSearchResult } from '@/app/api/bikes/search-web/route';

interface BikeSelectorProps {
  onBikeSelected?: (bike: UserBikeProfile) => void;
}

export default function BikeSelectorCascading({ onBikeSelected }: BikeSelectorProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [allModels, setAllModels] = useState<BikeModel[]>([]);

  useEffect(() => {
    setBrands(getBrands());
    setAllModels(getBikeModels());
  }, []);

  // Main Selector Mode: 'DATABASE' | 'WEB_SEARCH' | 'FALLBACK'
  const [selectorMode, setSelectorMode] = useState<'DATABASE' | 'WEB_SEARCH' | 'FALLBACK'>('DATABASE');

  // State for cascading steps in DATABASE mode
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [customCategory, setCustomCategory] = useState<BikeCategory>('AERO_ROAD');
  const [customBikeName, setCustomBikeName] = useState<string>('');
  const [bikeWeightKg, setBikeWeightKg] = useState<number>(8.0);
  const [notes, setNotes] = useState<string>('');

  // Fallback mode state
  const [fallbackCategory, setFallbackCategory] = useState<BikeCategory>('ROAD_ALLROUNDER');
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);

  // Web Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchingWeb, setIsSearchingWeb] = useState<boolean>(false);
  const [webSearchResult, setWebSearchResult] = useState<BikeSearchResult | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Generate years list: last 20 years
  const currentYear = new Date().getFullYear();
  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = currentYear; y >= currentYear - 20; y--) {
      list.push(y);
    }
    return list;
  }, [currentYear]);

  // Filter models by selected brand and year
  const availableModels = useMemo(() => {
    if (!selectedBrandId) return [];
    const brandModels = allModels.filter((m) => m.brandId === selectedBrandId);
    const yearMatches = brandModels.filter(
      (m) => m.yearStart <= selectedYear && (!m.yearEnd || m.yearEnd >= selectedYear)
    );
    return yearMatches.length > 0 ? yearMatches : brandModels;
  }, [allModels, selectedBrandId, selectedYear]);

  // Active chosen model object
  const activeModel = useMemo(() => {
    return allModels.find(m => m.id === selectedModelId);
  }, [allModels, selectedModelId]);

  // Selected brand object
  const activeBrand = useMemo(() => {
    return brands.find(b => b.id === selectedBrandId);
  }, [brands, selectedBrandId]);

  // When model changes, auto-set category and suggested name
  const handleModelSelect = (modelId: string) => {
    setSelectedModelId(modelId);
    const m = allModels.find(item => item.id === modelId);
    if (m) {
      setCustomCategory(m.categoryId);
      const bName = activeBrand?.name || '';
      setCustomBikeName(`${bName} ${m.modelName} (${selectedYear})`);
    }
  };

  // Perform Web / AI Search
  const handleSearchWeb = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearchingWeb(true);
    setSearchError(null);
    setWebSearchResult(null);

    try {
      const res = await fetch('/api/bikes/search-web', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery.trim() })
      });

      const data = await res.json();
      if (data.success && data.bike) {
        setWebSearchResult(data.bike);
        setCustomBikeName(`${data.bike.brandName} ${data.bike.modelName}`);
        setCustomCategory(data.bike.category);
        setBikeWeightKg(data.bike.estimatedWeightKg);
        setNotes(data.bike.notes);
      } else {
        setSearchError(data.error || 'Sepeda tidak ditemukan.');
      }
    } catch (err) {
      console.error('Search error', err);
      setSearchError('Terjadi kesalahan jaringan saat mencari di internet.');
    } finally {
      setIsSearchingWeb(false);
    }
  };

  // Aerodynamic properties preview
  const aeroProps = useMemo(() => {
    if (selectorMode === 'FALLBACK') {
      const def = DEFAULT_BIKE_CATEGORIES[fallbackCategory];
      return {
        categoryName: def.name,
        frontalArea: def.defaultFrontalArea,
        crr: def.defaultCrr,
        drivetrainLoss: def.defaultDrivetrainLoss,
        description: def.description,
        isCustom: true
      };
    }

    if (selectorMode === 'WEB_SEARCH' && webSearchResult) {
      const def = DEFAULT_BIKE_CATEGORIES[customCategory || webSearchResult.category];
      return {
        categoryName: def.name,
        frontalArea: webSearchResult.estimatedFrontalArea || def.defaultFrontalArea,
        crr: webSearchResult.estimatedCrr || def.defaultCrr,
        drivetrainLoss: def.defaultDrivetrainLoss,
        description: webSearchResult.notes || def.description,
        isCustom: true
      };
    }

    if (activeModel) {
      const def = DEFAULT_BIKE_CATEGORIES[customCategory || activeModel.categoryId];
      return {
        categoryName: def.name,
        frontalArea: activeModel.customFrontalArea || def.defaultFrontalArea,
        crr: activeModel.customCrr || def.defaultCrr,
        drivetrainLoss: def.defaultDrivetrainLoss,
        description: activeModel.notes || def.description,
        isCustom: !!activeModel.customFrontalArea
      };
    }

    const def = DEFAULT_BIKE_CATEGORIES[customCategory];
    return {
      categoryName: def.name,
      frontalArea: def.defaultFrontalArea,
      crr: def.defaultCrr,
      drivetrainLoss: def.defaultDrivetrainLoss,
      description: def.description,
      isCustom: false
    };
  }, [selectorMode, fallbackCategory, webSearchResult, activeModel, customCategory]);

  const handleSaveToGarage = (e: React.FormEvent) => {
    e.preventDefault();

    let newBike: UserBikeProfile;

    if (selectorMode === 'FALLBACK') {
      const def = DEFAULT_BIKE_CATEGORIES[fallbackCategory];
      newBike = addUserBike({
        customName: customBikeName || `Default ${def.name}`,
        isCustomOrFallback: true,
        category: fallbackCategory,
        estimatedFrontalArea: def.defaultFrontalArea,
        estimatedCrr: def.defaultCrr,
        weightKg: bikeWeightKg,
        notes: notes || 'Fallback/Generic bike configuration'
      });
    } else if (selectorMode === 'WEB_SEARCH') {
      if (!webSearchResult) {
        alert('Silakan cari sepeda di internet terlebih dahulu.');
        return;
      }

      // Add brand and model to local database if not exists
      let brandObj = brands.find(b => b.name.toLowerCase() === webSearchResult.brandName.toLowerCase());
      if (!brandObj) {
        brandObj = addBrand({ name: webSearchResult.brandName });
        setBrands(getBrands());
      }

      const newModel = addBikeModel({
        brandId: brandObj.id,
        brandName: brandObj.name,
        modelName: webSearchResult.modelName,
        yearStart: webSearchResult.year,
        categoryId: customCategory || webSearchResult.category,
        customFrontalArea: aeroProps.frontalArea,
        customCrr: aeroProps.crr,
        notes: webSearchResult.notes
      });
      setAllModels(getBikeModels());

      newBike = addUserBike({
        customName: customBikeName || `${webSearchResult.brandName} ${webSearchResult.modelName}`,
        brandId: brandObj.id,
        brandName: brandObj.name,
        modelId: newModel.id,
        modelName: newModel.modelName,
        year: webSearchResult.year,
        isCustomOrFallback: false,
        category: customCategory || webSearchResult.category,
        estimatedFrontalArea: aeroProps.frontalArea,
        estimatedCrr: aeroProps.crr,
        weightKg: bikeWeightKg,
        notes: notes || webSearchResult.notes
      });
    } else {
      if (!selectedBrandId || !selectedModelId) {
        alert('Silakan lengkapi pemilihan brand dan model terlebih dahulu.');
        return;
      }
      newBike = addUserBike({
        customName: customBikeName || `${activeBrand?.name} ${activeModel?.modelName}`,
        brandId: selectedBrandId,
        brandName: activeBrand?.name,
        modelId: selectedModelId,
        modelName: activeModel?.modelName,
        year: selectedYear,
        isCustomOrFallback: false,
        category: customCategory,
        estimatedFrontalArea: aeroProps.frontalArea,
        estimatedCrr: aeroProps.crr,
        weightKg: bikeWeightKg,
        notes: notes || activeModel?.notes || ''
      });
    }

    setSavedSuccess(`Sepeda "${newBike.customName}" berhasil ditambahkan ke garasi & siap untuk kalkulasi CdA!`);
    if (onBikeSelected) {
      onBikeSelected(newBike);
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form with 3 Modes */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Header Mode Switcher (Database vs AI Web Search vs Fallback) */}
          <div className="flex flex-col sm:flex-row items-center gap-1.5 p-1.5 bg-slate-900/90 rounded-2xl border border-white/10">
            <button
              type="button"
              onClick={() => setSelectorMode('DATABASE')}
              className={`flex-1 w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition ${
                selectorMode === 'DATABASE'
                  ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md shadow-cyan-600/20' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bike className="w-4 h-4" />
              Pilih dari Database Merk
            </button>

            <button
              type="button"
              onClick={() => setSelectorMode('WEB_SEARCH')}
              className={`flex-1 w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition ${
                selectorMode === 'WEB_SEARCH'
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md shadow-indigo-600/20' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-4 h-4 text-cyan-300" />
              Cari di Internet (AI)
            </button>

            <button
              type="button"
              onClick={() => setSelectorMode('FALLBACK')}
              className={`flex-1 w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition ${
                selectorMode === 'FALLBACK'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-600/20' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              Tipe Default
            </button>
          </div>

          {savedSuccess && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
              <span>{savedSuccess}</span>
            </div>
          )}

          {/* MODE 1: DATABASE SELECTION */}
          {selectorMode === 'DATABASE' && (
            <form onSubmit={handleSaveToGarage} className="glass-panel p-6 rounded-2xl space-y-5">
              
              {/* Step 1: Brand */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-center flex items-center justify-center text-[11px]">1</span>
                  Brand / Merk Sepeda ({brands.length} Merk)
                </label>
                <select
                  value={selectedBrandId}
                  onChange={(e) => {
                    setSelectedBrandId(e.target.value);
                    setSelectedModelId('');
                  }}
                  className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                  required
                >
                  <option value="">-- Pilih Brand Sepeda --</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} {b.country ? `(${b.country})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Year */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-center flex items-center justify-center text-[11px]">2</span>
                  Tahun Rilis Model (Rentang 20 Tahun Terakhir)
                </label>
                <div className="relative">
                  <select
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(Number(e.target.value));
                    }}
                    className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 transition appearance-none"
                  >
                    {years.map((yr) => (
                      <option key={yr} value={yr}>
                        Tahun {yr}
                      </option>
                    ))}
                  </select>
                  <Calendar className="w-4 h-4 text-slate-400 absolute right-4 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Step 3: Model / Seri */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-center flex items-center justify-center text-[11px]">3</span>
                  Seri / Model Sepeda
                </label>
                <select
                  value={selectedModelId}
                  onChange={(e) => handleModelSelect(e.target.value)}
                  disabled={!selectedBrandId}
                  className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  required
                >
                  <option value="">
                    {!selectedBrandId 
                      ? '-- Pilih Brand terlebih dahulu --' 
                      : availableModels.length === 0 
                        ? '-- Tidak ada model di database (Gunakan Tab Cari di Internet) --' 
                        : '-- Pilih Model Sepeda --'}
                  </option>
                  {availableModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.modelName} ({m.categoryId.replace('_', ' ')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 4: Kategori */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-center flex items-center justify-center text-[11px]">4</span>
                  Kategori Geometri Sepeda (Bisa disesuaikan)
                </label>
                <select
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value as BikeCategory)}
                  className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                >
                  {Object.values(DEFAULT_BIKE_CATEGORIES).map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Optional Custom Name & Bike Weight */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/5">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Nama Panggilan Sepeda</label>
                  <input
                    type="text"
                    value={customBikeName}
                    onChange={(e) => setCustomBikeName(e.target.value)}
                    placeholder="Contoh: Helios Balap Harian"
                    className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Berat Sepeda Saja (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="5"
                    max="20"
                    value={bikeWeightKg}
                    onChange={(e) => setBikeWeightKg(Number(e.target.value))}
                    className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/25 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Simpan & Gunakan Sepeda Ini
              </button>
            </form>
          )}

          {/* MODE 2: WEB / AI SEARCH */}
          {selectorMode === 'WEB_SEARCH' && (
            <div className="glass-panel p-6 rounded-2xl space-y-5 border-cyan-500/40">
              
              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-300 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-white">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span>Pencarian Spesifikasi Sepeda via Internet & AI</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Ketik nama merk dan seri sepeda Anda (misal: <em>"Cube Litening C:68X"</em>, <em>"Orbea Orca Aero 2023"</em>, <em>"Felt IA TT"</em>, atau <em>"Argon 18 E-119"</em>). Sistem akan mencari informasi spesifikasi, kategori, frontal area, dan Crr dari internet.
                </p>
              </div>

              {/* Search Form */}
              <form onSubmit={handleSearchWeb} className="space-y-3">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Ketik Merk / Seri Sepeda
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder='Contoh: "Cube Litening C:68X", "Orbea Orca Aero", "Felt IA"...'
                      className="w-full bg-slate-900/90 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                      required
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  </div>
                  <button
                    type="submit"
                    disabled={isSearchingWeb}
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-cyan-500/20 transition disabled:opacity-50"
                  >
                    {isSearchingWeb ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Mencari...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        Cari di Internet
                      </>
                    )}
                  </button>
                </div>

                {/* Quick query pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-slate-400">
                  <span className="text-[10px] uppercase font-bold text-slate-500 mr-1">Contoh Cepat:</span>
                  {['Cube Litening C:68X', 'Orbea Orca Aero', 'Felt IA FRD TT', 'Argon 18 E-119', 'Cinelli Vigorelli'].map((sugg) => (
                    <button
                      key={sugg}
                      type="button"
                      onClick={() => setSearchQuery(sugg)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 hover:text-cyan-300 text-slate-300 border border-white/5 transition"
                    >
                      {sugg}
                    </button>
                  ))}
                </div>
              </form>

              {searchError && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                  <span>{searchError}</span>
                </div>
              )}

              {/* Search Result Card */}
              {webSearchResult && (
                <form onSubmit={handleSaveToGarage} className="mt-4 p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/40 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div>
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">
                        Hasil Ditemukan di Internet
                      </span>
                      <h4 className="text-base font-extrabold text-white">
                        {webSearchResult.brandName} — {webSearchResult.modelName} ({webSearchResult.year})
                      </h4>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                      {webSearchResult.category.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {webSearchResult.notes}
                  </p>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
                      <span className="text-[10px] text-slate-400 block uppercase">Frontal Area</span>
                      <span className="font-mono font-bold text-cyan-300">{webSearchResult.estimatedFrontalArea} m²</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
                      <span className="text-[10px] text-slate-400 block uppercase">Crr Standar</span>
                      <span className="font-mono font-bold text-teal-300">{webSearchResult.estimatedCrr}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
                      <span className="text-[10px] text-slate-400 block uppercase">Estimasi Berat</span>
                      <span className="font-mono font-bold text-slate-200">{bikeWeightKg} kg</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Nama Panggilan Sepeda</label>
                      <input
                        type="text"
                        value={customBikeName}
                        onChange={(e) => setCustomBikeName(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Berat Sepeda Anda (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="5"
                        max="20"
                        value={bikeWeightKg}
                        onChange={(e) => setBikeWeightKg(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Simpan Sepeda Hasil Pencarian Ini ke Garasi Saya
                  </button>
                </form>
              )}

            </div>
          )}

          {/* MODE 3: FALLBACK DEFAULT */}
          {selectorMode === 'FALLBACK' && (
            <form onSubmit={handleSaveToGarage} className="glass-panel p-6 rounded-2xl space-y-5 border-amber-500/30">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
                <p>
                  <strong>Mekanisme Fallback:</strong> Jika Anda belum menemukan model spesifik, gunakan tipe arsitektur sepeda generik di bawah. Sistem akan menggunakan parameter aerodinamika estimasi standar yang teruji.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Pilih Tipe Sepeda Generik
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.values(DEFAULT_BIKE_CATEGORIES).map((cat) => {
                    const isSelected = fallbackCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setFallbackCategory(cat.id)}
                        className={`p-4 rounded-xl text-left border transition-all ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-400/60 shadow-md shadow-amber-500/10'
                            : 'bg-slate-900/60 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-semibold text-xs text-white">{cat.name}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2">{cat.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Beri Nama Sepeda Anda</label>
                  <input
                    type="text"
                    value={customBikeName}
                    onChange={(e) => setCustomBikeName(e.target.value)}
                    placeholder="Contoh: Sepeda Custom Road Saya"
                    className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Berat Sepeda (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="5"
                    max="20"
                    value={bikeWeightKg}
                    onChange={(e) => setBikeWeightKg(Number(e.target.value))}
                    className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-500/25 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Simpan Sepeda Fallback Ini
              </button>
            </form>
          )}

        </div>

        {/* Right Column: Live Aerodynamic Parameters & Silhouettes Preview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel-glow p-6 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-white tracking-wide">Parameter Aerodinamika Bawaan</h3>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                aeroProps.isCustom 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                  : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
              }`}>
                {aeroProps.isCustom ? 'Model Tuned' : 'Generic Baseline'}
              </span>
            </div>

            {/* Spec Cards */}
            <div className="grid grid-cols-2 gap-3.5 mt-5">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Frontal Area Sepeda</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-extrabold text-cyan-300">{aeroProps.frontalArea}</span>
                  <span className="text-xs text-slate-400">m²</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">Kontribusi frame & cockpit</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Rolling Resistance (Crr)</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-extrabold text-teal-300">{aeroProps.crr}</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">Asumsi ban kategori ini</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Drivetrain Loss</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-extrabold text-indigo-300">{(aeroProps.drivetrainLoss * 100).toFixed(1)}</span>
                  <span className="text-xs text-slate-400">%</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">Efisiensi rantai & pulley</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Siluet CFD Geometri</span>
                <span className="text-xs font-semibold text-white block truncate">{aeroProps.categoryName}</span>
                <span className="text-[10px] text-slate-500 mt-1 block">Basis visual Modul 5</span>
              </div>
            </div>

            {/* Description note */}
            <div className="mt-5 p-3.5 rounded-xl bg-slate-950/60 border border-white/5 text-xs text-slate-400">
              <span className="font-semibold text-slate-200 block mb-1">Karakteristik Desain:</span>
              <p className="text-[11px] leading-relaxed">{aeroProps.description}</p>
            </div>

            {/* Integration Note */}
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span>Akan otomatis diteruskan ke:</span>
              <span className="text-cyan-400 font-semibold">Modul 2 Kalkulator CdA &rarr;</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
