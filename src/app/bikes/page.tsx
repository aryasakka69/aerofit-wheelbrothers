'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Calendar, ChevronRight, Info, Plus, Tag, Flag, Check } from 'lucide-react';

// Jalur import sudah disesuaikan dengan folder kamu
import { INITIAL_BRANDS, INITIAL_BIKE_MODELS } from '@/lib/data/seed-bikes';
import { BikeCategory } from '@/lib/types/bike';
import { addUserBike } from '@/lib/storage';

export default function BikeSelectorPage() {
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Daftar tahun 2010 - 2025
  const years = Array.from({ length: 16 }, (_, i) => 2010 + i);

  // LOGIKA FILTER DENGAN PENGAMAN TYPESCRIPT
  const filteredModels = useMemo(() => {
    if (!selectedBrandId) return [];

    return INITIAL_BIKE_MODELS.filter((model) => {
      const isBrandMatch = model.brandId === selectedBrandId;

      // Ambil tahun mulai, jika tidak ada anggap 2010
      const startYear = model.yearStart ?? 2010;

      // Cek ketersediaan tahun (mengatasi error "possibly undefined")
      const isAvailable = selectedYear >= startYear && (
        !model.yearEnd || selectedYear <= model.yearEnd
      );

      return isBrandMatch && isAvailable;
    });
  }, [selectedBrandId, selectedYear]);

  const activeModel = useMemo(() => {
    return INITIAL_BIKE_MODELS.find(m => m.id === selectedModelId) || null;
  }, [selectedModelId]);

  const handleSaveToProfile = () => {
    if (!activeModel) return;

    // Menambahkan default value (?? 0) untuk mengatasi error assignment
    addUserBike({
      customName: `${activeModel.brandName} ${activeModel.modelName} (${selectedYear})`,
      brandId: activeModel.brandId,
      brandName: activeModel.brandName,
      modelId: activeModel.id,
      modelName: activeModel.modelName,
      year: selectedYear,
      isCustomOrFallback: false,
      category: (activeModel.categoryId as BikeCategory) || 'ROAD_ALLROUNDER',
      estimatedFrontalArea: activeModel.customFrontalArea ?? 0.1, // Beri default jika kosong
      estimatedCrr: activeModel.customCrr ?? 0.004,             // Beri default jika kosong
      weightKg: 8.0,
      notes: activeModel.notes || ""
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      <h1 className="text-4xl font-black text-white text-center tracking-tight">
        Pilih <span className="text-cyan-400">Sepeda Anda</span>
      </h1>

      <div className="bg-slate-900/50 p-8 rounded-3xl border border-white/10 space-y-8 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">1. Pilih Tahun</label>
            <select
              value={selectedYear}
              onChange={(e) => { setSelectedYear(Number(e.target.value)); setSelectedModelId(''); }}
              className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">2. Pilih Merk</label>
            <select
              value={selectedBrandId}
              onChange={(e) => { setSelectedBrandId(e.target.value); setSelectedModelId(''); }}
              className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">-- Pilih Merk --</option>
              {INITIAL_BRANDS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        </div>

        <div className={`space-y-2 transition-opacity duration-300 ${selectedBrandId ? 'opacity-100' : 'opacity-30'}`}>
          <label className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">3. Pilih Model</label>
          <select
            value={selectedModelId}
            onChange={(e) => setSelectedModelId(e.target.value)}
            className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">-- Pilih Model --</option>
            {filteredModels.map(m => <option key={m.id} value={m.id}>{m.modelName}</option>)}
          </select>
        </div>

        {activeModel && (
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="space-y-2">
              <h4 className="text-xl font-bold text-white">{activeModel.modelName}</h4>
              <p className="text-xs text-slate-400 italic">"{activeModel.notes}"</p>
            </div>
            <button
              onClick={handleSaveToProfile}
              className={`w-full md:w-auto px-10 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 ${saveSuccess ? 'bg-emerald-500 text-slate-950' : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20'}`}
            >
              {saveSuccess ? <Check className="w-4 h-4 inline mr-2" /> : <Plus className="w-4 h-4 inline mr-2" />}
              {saveSuccess ? 'Berhasil Tersimpan' : 'Tambahkan'}
            </button>
          </div>
        )}
      </div>

      <div className="text-center">
        <Link href="/bike-fit" className="text-cyan-400 hover:text-cyan-300 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
          Lanjut ke Bike Fit Scan <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}