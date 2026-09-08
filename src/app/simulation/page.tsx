'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Waves, 
  Wind, 
  SplitSquareVertical, 
  Bike, 
  Camera, 
  ArrowRight, 
  Sparkles, 
  Info, 
  TrendingDown, 
  Flame, 
  Layers,
  ChevronRight,
  ShieldAlert,
  RotateCcw
} from 'lucide-react';
import CfdCanvas from '@/components/cfd/CfdCanvas';
import { PoseLandmarks, SAMPLE_POSES } from '@/lib/fitting/angles';
import { getUserBikes, getLatestBikeFitScan, BikeFitScanRecord } from '@/lib/storage';
import { UserBikeProfile, BikeCategory, DEFAULT_BIKE_CATEGORIES } from '@/lib/types/bike';

export default function CfdSimulationPage() {
  const [viewLayout, setViewLayout] = useState<'SINGLE' | 'SIDE_BY_SIDE'>('SIDE_BY_SIDE');
  const [userBikes, setUserBikes] = useState<UserBikeProfile[]>([]);
  const [selectedBikeCategory, setSelectedBikeCategory] = useState<BikeCategory>('AERO_ROAD');
  const [activeScan, setActiveScan] = useState<BikeFitScanRecord | null>(null);

  // Landmarks for Single View
  const [singleLandmarks, setSingleLandmarks] = useState<PoseLandmarks>(SAMPLE_POSES.ROAD_AGGRESSIVE);

  // Before & After Landmarks for Side-by-Side Comparison
  const beforeLandmarks = SAMPLE_POSES.ROAD_UPRIGHT;
  const afterLandmarks = SAMPLE_POSES.ROAD_AGGRESSIVE;

  useEffect(() => {
    const bikes = getUserBikes();
    setUserBikes(bikes);
    if (bikes.length > 0) {
      setSelectedBikeCategory(bikes[0].category);
    }

    const latestFit = getLatestBikeFitScan();
    if (latestFit) {
      setActiveScan(latestFit);
      setSingleLandmarks(latestFit.landmarks);
      setSelectedBikeCategory(latestFit.bikeCategory);
    }
  }, []);

  const activeBikeDefault = DEFAULT_BIKE_CATEGORIES[selectedBikeCategory];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Modul 5
            </span>
            <span className="text-xs text-slate-400">Computational Fluid Dynamics (CFD) Visualization</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Simulasi CFD Aliran Udara & Geometri
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Visualisasikan pola aliran udara (*streamlines*), titik tekanan tinggi (*stagnation pressure*), dan zona turbulensi di belakang pesepeda berdasarkan hasil scan bike fitting Anda.
          </p>
        </div>

        {/* Layout Switcher */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-900/90 rounded-2xl border border-white/10 text-xs">
          <button
            onClick={() => setViewLayout('SIDE_BY_SIDE')}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition ${
              viewLayout === 'SIDE_BY_SIDE'
                ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            Komparasi Side-by-Side (Sebelum vs Sesudah)
          </button>
          <button
            onClick={() => setViewLayout('SINGLE')}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition ${
              viewLayout === 'SINGLE'
                ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            Tampilan Tunggal
          </button>
        </div>
      </div>

      {/* Geometry Context Controls */}
      <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0">
            <Bike className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Kategori Geometri Sepeda (Modul 1)</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">{activeBikeDefault.name}</span>
              <span className="text-xs text-cyan-400">({activeBikeDefault.defaultFrontalArea} m²)</span>
            </div>
          </div>
        </div>

        {/* Bike Category Selector Switch */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Ganti Geometri:</span>
          <select
            value={selectedBikeCategory}
            onChange={(e) => setSelectedBikeCategory(e.target.value as BikeCategory)}
            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
          >
            {Object.values(DEFAULT_BIKE_CATEGORIES).map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main CFD Viewport */}
      {viewLayout === 'SIDE_BY_SIDE' ? (
        /* SIDE BY SIDE COMPARISON VIEW */
        <div className="space-y-6">
          
          {/* Delta Impact Highlight Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-emerald-950/40 border border-cyan-500/30 glass-panel">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
              <div className="p-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Pemangkasan Area Wake Separasi</span>
                <span className="text-2xl font-black text-cyan-300 font-mono">-42% Lebih Ramping</span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">Vortex turbulensi di belakang punggung berkurang</span>
              </div>
              <div className="p-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Estimasi Penurunan CdA</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">0.355 &rarr; 0.285 m²</span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">Penurunan hambatan ~0.070 m²</span>
              </div>
              <div className="p-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Daya yang Dihemat @ 40km/h</span>
                <span className="text-2xl font-black text-white font-mono">~35 Watt</span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">Dapat dialokasikan untuk sprint akhir</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Side A: Before Fitting */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <h3 className="font-bold text-sm text-white">Posisi SEBELUM Fitting (Upright / Hoods)</h3>
                </div>
                <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/20">
                  CdA ~ 0.355 m²
                </span>
              </div>

              <CfdCanvas
                landmarks={beforeLandmarks}
                bikeCategory={selectedBikeCategory}
                speedKmh={40}
                label="Sebelum Penyesuaian"
                isComparisonSide={true}
              />

              <p className="text-[11px] text-slate-400 px-2 leading-relaxed">
                <strong className="text-rose-400">Karakteristik:</strong> Torso tegak ~48°, lengan lurus. Menghasilkan kantung vakum turbulen besar di belakang punggung dan pinggul yang menarik rider ke belakang (parasut drag).
              </p>
            </div>

            {/* Side B: After Fitting */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <h3 className="font-bold text-sm text-white">Posisi SESUDAH Fitting (Aero Optimized)</h3>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                  CdA ~ 0.285 m²
                </span>
              </div>

              <CfdCanvas
                landmarks={afterLandmarks}
                bikeCategory={selectedBikeCategory}
                speedKmh={40}
                label="Sesudah Penyesuaian"
                isComparisonSide={true}
              />

              <p className="text-[11px] text-slate-400 px-2 leading-relaxed">
                <strong className="text-emerald-400">Karakteristik:</strong> Torso merunduk ~32°, siku 90°, kepala rendah. Udara mengalir laminar mulus di atas helm dan punggung, meminimalkan boundary layer separation.
              </p>
            </div>

          </div>

        </div>
      ) : (
        /* SINGLE VIEW */
        <div className="space-y-6">
          <CfdCanvas
            landmarks={singleLandmarks}
            bikeCategory={selectedBikeCategory}
            speedKmh={42}
            label={activeScan ? `Data Scan: ${activeScan.bikeName}` : 'Simulasi Posisi Tunggal'}
          />
        </div>
      )}

      {/* High-Performance Solver Architecture Info */}
      <div className="p-6 rounded-3xl glass-panel border-white/5 space-y-3 text-xs text-slate-400">
        <div className="flex items-center gap-2 text-cyan-400 font-bold">
          <Info className="w-4 h-4" />
          <span>Arsitektur Simulasi Fluida & Masa Depan Cloud Solver:</span>
        </div>
        <p className="leading-relaxed text-slate-300">
          Modul simulasi CFD di atas beroperasi secara real-time di client (WebGL / Canvas) sebagai visualisasi indikatif untuk memetakan dinamika aliran partikel dan zona separasi udara. Sistem AeroFit telah dirancang modular dengan arsitektur berbasis antrian (*Queue-based / Redis BullMQ*) yang siap menghubungkan rekonstruksi mesh 3D rider ke *cloud solver* asinkron presisi tinggi (seperti OpenFOAM) pada pengembangan fase berikutnya.
        </p>
      </div>

    </div>
  );
}
