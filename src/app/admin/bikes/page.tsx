'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Database, 
  Plus, 
  Trash2, 
  Edit3, 
  RotateCcw, 
  CheckCircle, 
  Search, 
  Bike, 
  Building2,
  Sliders,
  Filter
} from 'lucide-react';
import { Brand, BikeModel, BikeCategory, DEFAULT_BIKE_CATEGORIES } from '@/lib/types/bike';
import { 
  getBrands, 
  addBrand, 
  deleteBrand, 
  getBikeModels, 
  addBikeModel, 
  deleteBikeModel,
  saveBrands,
  saveBikeModels
} from '@/lib/storage';
import { INITIAL_BRANDS, INITIAL_BIKE_MODELS } from '@/lib/data/seed-bikes';

export default function AdminBikesPage() {
  const [activeTab, setActiveTab] = useState<'MODELS' | 'BRANDS'>('MODELS');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<BikeModel[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterBrandId, setFilterBrandId] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Form states for New Brand
  const [newBrandName, setNewBrandName] = useState<string>('');
  const [newBrandCountry, setNewBrandCountry] = useState<string>('');

  // Form states for New Model
  const [modelBrandId, setModelBrandId] = useState<string>('');
  const [modelName, setModelName] = useState<string>('');
  const [modelYearStart, setModelYearStart] = useState<number>(2022);
  const [modelYearEnd, setModelYearEnd] = useState<string>('');
  const [modelCategory, setModelCategory] = useState<BikeCategory>('AERO_ROAD');
  const [modelCustomArea, setModelCustomArea] = useState<string>('');
  const [modelCustomCrr, setModelCustomCrr] = useState<string>('');
  const [modelNotes, setModelNotes] = useState<string>('');

  const loadData = () => {
    setBrands(getBrands());
    setModels(getBikeModels());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;

    addBrand({
      name: newBrandName.trim(),
      country: newBrandCountry.trim() || undefined
    });

    setNewBrandName('');
    setNewBrandCountry('');
    loadData();
    setStatusMessage('Brand baru berhasil ditambahkan!');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleCreateModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelBrandId || !modelName.trim()) {
      alert('Silakan pilih brand dan isi nama model');
      return;
    }

    addBikeModel({
      brandId: modelBrandId,
      modelName: modelName.trim(),
      yearStart: modelYearStart,
      yearEnd: modelYearEnd ? parseInt(modelYearEnd, 10) : null,
      categoryId: modelCategory,
      customFrontalArea: modelCustomArea ? parseFloat(modelCustomArea) : null,
      customCrr: modelCustomCrr ? parseFloat(modelCustomCrr) : null,
      notes: modelNotes.trim() || null
    });

    setModelName('');
    setModelCustomArea('');
    setModelCustomCrr('');
    setModelNotes('');
    loadData();
    setStatusMessage('Model sepeda baru berhasil ditambahkan ke database!');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleDeleteBrand = (id: string, name: string) => {
    if (confirm(`Hapus brand "${name}" beserta semua seri modelnya?`)) {
      deleteBrand(id);
      loadData();
    }
  };

  const handleDeleteModel = (id: string, name: string) => {
    if (confirm(`Hapus model "${name}"?`)) {
      deleteBikeModel(id);
      loadData();
    }
  };

  const handleResetSeed = () => {
    if (confirm('Kembalikan database ke seed awal pabrikan bawaan?')) {
      saveBrands(INITIAL_BRANDS);
      saveBikeModels(INITIAL_BIKE_MODELS);
      loadData();
      setStatusMessage('Database sepeda berhasil di-reset ke seed awal.');
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  // Filtered models
  const filteredModels = useMemo(() => {
    return models.filter(m => {
      const matchesSearch = 
        m.modelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.brandName && m.brandName.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesBrand = !filterBrandId || m.brandId === filterBrandId;
      return matchesSearch && matchesBrand;
    });
  }, [models, searchQuery, filterBrandId]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Panel Admin
            </span>
            <span className="text-xs text-slate-400">Master Data CRUD Sepeda (Fase 1 & 2)</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Pengelolaan Database Sepeda
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Kelola katalog brand, seri/model, rentang tahun, dan parameter aerodinamika bawaan secara manual tanpa perlu mengubah kode sumber.
          </p>
        </div>

        <button
          onClick={handleResetSeed}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 border border-white/10 transition"
        >
          <RotateCcw className="w-4 h-4 text-amber-400" />
          Reset Seed Awal
        </button>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-1">
        <button
          onClick={() => setActiveTab('MODELS')}
          className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'MODELS' 
              ? 'text-cyan-400 border-cyan-400' 
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          <Bike className="w-4 h-4" />
          Daftar Model Sepeda ({models.length})
        </button>
        <button
          onClick={() => setActiveTab('BRANDS')}
          className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'BRANDS' 
              ? 'text-cyan-400 border-cyan-400' 
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Daftar Brand ({brands.length})
        </button>
      </div>

      {activeTab === 'MODELS' ? (
        /* MODELS TAB */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Add Model Form */}
          <div className="lg:col-span-4 space-y-4">
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                Tambah Model Sepeda Baru
              </h3>

              <form onSubmit={handleCreateModel} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Brand</label>
                  <select
                    value={modelBrandId}
                    onChange={(e) => setModelBrandId(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                    required
                  >
                    <option value="">-- Pilih Brand --</option>
                    {brands.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nama Model / Seri</label>
                  <input
                    type="text"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    placeholder="Contoh: S-Works Tarmac SL8"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Tahun Mulai</label>
                    <input
                      type="number"
                      value={modelYearStart}
                      onChange={(e) => setModelYearStart(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Tahun Akhir (opsional)</label>
                    <input
                      type="number"
                      value={modelYearEnd}
                      onChange={(e) => setModelYearEnd(e.target.value)}
                      placeholder="Kosong jika aktif"
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kategori Sepeda</label>
                  <select
                    value={modelCategory}
                    onChange={(e) => setModelCategory(e.target.value as BikeCategory)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  >
                    {Object.values(DEFAULT_BIKE_CATEGORIES).map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Frontal Area (m²)</label>
                    <input
                      type="number"
                      step="0.001"
                      placeholder="Contoh: 0.092"
                      value={modelCustomArea}
                      onChange={(e) => setModelCustomArea(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Crr Bawaan</label>
                    <input
                      type="number"
                      step="0.0001"
                      placeholder="Contoh: 0.0039"
                      value={modelCustomCrr}
                      onChange={(e) => setModelCustomCrr(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Catatan Geometri</label>
                  <textarea
                    rows={2}
                    value={modelNotes}
                    onChange={(e) => setModelNotes(e.target.value)}
                    placeholder="Fitur aerodinamika terintegrasi..."
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold tracking-wide transition shadow-md shadow-cyan-500/20"
                >
                  Simpan Model Sepeda
                </button>
              </form>
            </div>
          </div>

          {/* Models Table & Search */}
          <div className="lg:col-span-8 space-y-4">
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              
              {/* Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari model atau brand sepeda..."
                    className="w-full bg-slate-900/90 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>

                <select
                  value={filterBrandId}
                  onChange={(e) => setFilterBrandId(e.target.value)}
                  className="w-full sm:w-48 bg-slate-900/90 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="">Semua Brand</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-400 text-[10px] uppercase tracking-wider">
                      <th className="py-2.5 px-3">Brand & Model</th>
                      <th className="py-2.5 px-3">Rentang Tahun</th>
                      <th className="py-2.5 px-3">Kategori</th>
                      <th className="py-2.5 px-3">Area (m²)</th>
                      <th className="py-2.5 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredModels.map((m) => (
                      <tr key={m.id} className="hover:bg-white/[0.02] text-slate-300">
                        <td className="py-3 px-3">
                          <span className="font-semibold text-white block">{m.modelName}</span>
                          <span className="text-[10px] text-cyan-400">{m.brandName}</span>
                        </td>
                        <td className="py-3 px-3 font-mono">
                          {m.yearStart} – {m.yearEnd || 'Sekarang'}
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-900 border border-white/10">
                            {m.categoryId.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-cyan-300">
                          {m.customFrontalArea || 'Default'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleDeleteModel(m.id, m.modelName)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 transition rounded hover:bg-rose-500/10"
                            title="Hapus Model"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      ) : (
        /* BRANDS TAB */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Add Brand Form */}
          <div className="lg:col-span-4 space-y-4">
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                Tambah Brand Baru
              </h3>
              <form onSubmit={handleCreateBrand} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nama Brand</label>
                  <input
                    type="text"
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    placeholder="Contoh: Bianchi, Colnago, Factor"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Negara Asal (opsional)</label>
                  <input
                    type="text"
                    value={newBrandCountry}
                    onChange={(e) => setNewBrandCountry(e.target.value)}
                    placeholder="Contoh: Italia, Inggris"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold tracking-wide transition shadow-md shadow-cyan-500/20"
                >
                  Simpan Brand
                </button>
              </form>
            </div>
          </div>

          {/* Brands Table */}
          <div className="lg:col-span-8 space-y-4">
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <h3 className="font-bold text-sm text-white">Daftar Brand Terdaftar</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-400 text-[10px] uppercase tracking-wider">
                      <th className="py-2.5 px-3">Nama Brand</th>
                      <th className="py-2.5 px-3">Negara Asal</th>
                      <th className="py-2.5 px-3">Jumlah Model</th>
                      <th className="py-2.5 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {brands.map((b) => {
                      const count = models.filter(m => m.brandId === b.id).length;
                      return (
                        <tr key={b.id} className="hover:bg-white/[0.02] text-slate-300">
                          <td className="py-3 px-3 font-semibold text-white">{b.name}</td>
                          <td className="py-3 px-3 text-slate-400">{b.country || '—'}</td>
                          <td className="py-3 px-3 font-mono text-cyan-300">{count} model</td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => handleDeleteBrand(b.id, b.name)}
                              className="p-1.5 text-slate-500 hover:text-rose-400 transition rounded hover:bg-rose-500/10"
                              title="Hapus Brand"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
