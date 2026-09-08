'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bike, 
  Trash2, 
  Check, 
  ArrowRight, 
  PlusCircle, 
  ShieldCheck, 
  Layers, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import BikeSelectorCascading from '@/components/bikes/BikeSelectorCascading';
import { getUserBikes, saveUserBikes, deleteUserBike } from '@/lib/storage';
import { UserBikeProfile } from '@/lib/types/bike';

export default function BikesPage() {
  const [userBikes, setUserBikes] = useState<UserBikeProfile[]>([]);
  const [activeBikeId, setActiveBikeId] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState<boolean>(true);

  const loadBikes = () => {
    const bikes = getUserBikes();
    setUserBikes(bikes);
    if (bikes.length > 0 && !activeBikeId) {
      setActiveBikeId(bikes[0].id);
    }
  };

  useEffect(() => {
    loadBikes();
  }, []);

  const handleSelectActive = (bikeId: string) => {
    setActiveBikeId(bikeId);
    // Move selected bike to first position in saved array
    const selected = userBikes.find(b => b.id === bikeId);
    if (selected) {
      const remaining = userBikes.filter(b => b.id !== bikeId);
      const reordered = [selected, ...remaining];
      setUserBikes(reordered);
      saveUserBikes(reordered);
    }
  };

  const handleDelete = (bikeId: string) => {
    if (confirm('Yakin ingin menghapus sepeda ini dari garasi Anda?')) {
      deleteUserBike(bikeId);
      loadBikes();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Modul 1
            </span>
            <span className="text-xs text-slate-400">Database & Garasi Sepeda Rider</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Pemilihan & Manajemen Sepeda
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Pilih brand, seri, dan tahun sepeda Anda atau gunakan tipe default untuk memperoleh estimasi parameter aerodinamika bawaan (frontal area, Crr, dan geometri CFD).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/calculator"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition"
          >
            Lanjut ke Kalkulator CdA
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Section 1: User's Bike Garage */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bike className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">Garasi Sepeda Anda ({userBikes.length})</h2>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition"
          >
            <PlusCircle className="w-4 h-4" />
            {showAddForm ? 'Tutup Form Tambah' : 'Tambah Sepeda Baru'}
          </button>
        </div>

        {userBikes.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl text-center space-y-3">
            <Bike className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-base font-semibold text-white">Belum Ada Sepeda di Garasi</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Silakan tambahkan sepeda pertama Anda melalui menu di bawah agar kalkulasi CdA dan visualisasi CFD memiliki referensi geometri yang tepat.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userBikes.map((bike) => {
              const isActive = activeBikeId === bike.id;
              return (
                <div
                  key={bike.id}
                  className={`p-5 rounded-2xl transition-all relative overflow-hidden flex flex-col justify-between ${
                    isActive
                      ? 'glass-panel-glow border-cyan-500/50 bg-slate-900/90'
                      : 'glass-panel hover:border-white/20'
                  }`}
                >
                  <div>
                    {/* Top status & badge */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        bike.isCustomOrFallback 
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                          : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                      }`}>
                        {bike.category.replace('_', ' ')}
                      </span>

                      {isActive && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          <Check className="w-3 h-3" /> Sepeda Aktif
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white mb-1">{bike.customName}</h3>
                    {bike.brandName && (
                      <p className="text-xs text-slate-400">
                        {bike.brandName} • {bike.modelName} {bike.year ? `(${bike.year})` : ''}
                      </p>
                    )}

                    {/* Specs Pills */}
                    <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/5 text-center">
                      <div className="p-2 rounded-lg bg-slate-950/50">
                        <span className="text-[9px] text-slate-400 block uppercase">Area</span>
                        <span className="text-xs font-bold text-cyan-300">{bike.estimatedFrontalArea} m²</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950/50">
                        <span className="text-[9px] text-slate-400 block uppercase">Crr</span>
                        <span className="text-xs font-bold text-teal-300">{bike.estimatedCrr}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950/50">
                        <span className="text-[9px] text-slate-400 block uppercase">Berat</span>
                        <span className="text-xs font-bold text-slate-200">{bike.weightKg} kg</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-2 mt-5 pt-3 border-t border-white/10">
                    {!isActive ? (
                      <button
                        onClick={() => handleSelectActive(bike.id)}
                        className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition py-1 px-2.5 rounded-lg hover:bg-cyan-500/10"
                      >
                        Jadikan Aktif
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">Siap untuk kalkulasi</span>
                    )}

                    <button
                      onClick={() => handleDelete(bike.id)}
                      className="text-slate-500 hover:text-rose-400 transition p-1.5 rounded-lg hover:bg-rose-500/10"
                      title="Hapus sepeda"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Cascading Selector (Add New Bike) */}
      <div className="space-y-4 pt-6">
        <div className="flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white tracking-tight">
            {showAddForm || userBikes.length === 0 ? 'Konfigurasi Sepeda Baru' : 'Tambah Sepeda Lain'}
          </h2>
        </div>

        {(showAddForm || userBikes.length === 0) && (
          <BikeSelectorCascading
            onBikeSelected={(newBike) => {
              loadBikes();
              setActiveBikeId(newBike.id);
              setShowAddForm(false);
            }}
          />
        )}
      </div>

      {/* Bottom info banner */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border-cyan-500/20 bg-gradient-to-r from-cyan-950/30 to-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0 text-cyan-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Sepeda Siap Digunakan untuk Analisis</h4>
            <p className="text-xs text-slate-400">
              Parameter sepeda aktif akan otomatis mengisi nilai frontal area dan Crr awal pada Kalkulator CdA (Modul 2).
            </p>
          </div>
        </div>

        <Link
          href="/calculator"
          className="whitespace-nowrap px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-md shadow-cyan-500/20"
        >
          Mulai Kalkulasi CdA
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
