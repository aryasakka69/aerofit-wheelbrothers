'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Calculator, 
  Wind, 
  Bike, 
  Zap, 
  Gauge, 
  Thermometer, 
  Mountain, 
  TrendingUp, 
  CheckCircle, 
  ArrowRight, 
  Save, 
  SlidersHorizontal,
  Lightbulb,
  FileText,
  Clock,
  Flame,
  Info
} from 'lucide-react';
import { getUserBikes, saveCalculationRecord } from '@/lib/storage';
import { UserBikeProfile } from '@/lib/types/bike';
import { calculateCdA, calculateAirDensity } from '@/lib/physics/cda-formulas';
import { CdaManualInput, CdaCalculationResult } from '@/lib/types/cda';
import PowerBreakdownChart from '@/components/calculator/PowerBreakdownChart';
import PositionBenchmarkTable from '@/components/calculator/PositionBenchmarkTable';

export default function CalculatorPage() {
  const [userBikes, setUserBikes] = useState<UserBikeProfile[]>([]);
  const [selectedBikeId, setSelectedBikeId] = useState<string>('');

  // Physics Input Parameters
  const [speedKmh, setSpeedKmh] = useState<number>(38.0);
  const [powerWatts, setPowerWatts] = useState<number>(275);
  const [riderWeightKg, setRiderWeightKg] = useState<number>(72.0);
  const [bikeWeightKg, setBikeWeightKg] = useState<number>(8.2);
  const [temperatureC, setTemperatureC] = useState<number>(28.0);
  const [altitudeM, setAltitudeM] = useState<number>(50);
  const [crr, setCrr] = useState<number>(0.0040);
  const [drivetrainEfficiencyPct, setDrivetrainEfficiencyPct] = useState<number>(97.5);
  const [slopePercent, setSlopePercent] = useState<number>(0.0);
  const [headwindKmh, setHeadwindKmh] = useState<number>(0.0);

  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Load bikes on mount
  useEffect(() => {
    const bikes = getUserBikes();
    setUserBikes(bikes);
    if (bikes.length > 0) {
      const active = bikes[0];
      setSelectedBikeId(active.id);
      setCrr(active.estimatedCrr || 0.0040);
      setBikeWeightKg(active.weightKg || 8.0);
    }
  }, []);

  // When selected bike changes, auto-update Crr and weight
  const handleBikeChange = (bikeId: string) => {
    setSelectedBikeId(bikeId);
    const found = userBikes.find(b => b.id === bikeId);
    if (found) {
      setCrr(found.estimatedCrr);
      setBikeWeightKg(found.weightKg);
    }
  };

  const activeBike = useMemo(() => {
    return userBikes.find(b => b.id === selectedBikeId);
  }, [userBikes, selectedBikeId]);

  // Live air density
  const liveAirDensity = useMemo(() => {
    return calculateAirDensity(temperatureC, altitudeM);
  }, [temperatureC, altitudeM]);

  // Live calculation result
  const calculationResult: CdaCalculationResult = useMemo(() => {
    const input: CdaManualInput = {
      bikeId: selectedBikeId,
      bikeName: activeBike?.customName,
      bikeCategory: activeBike?.category || 'AERO_ROAD',
      speedKmh,
      powerWatts,
      riderWeightKg,
      bikeWeightKg,
      temperatureC,
      altitudeM,
      crr,
      drivetrainEfficiencyPct,
      slopePercent,
      headwindKmh
    };
    return calculateCdA(input);
  }, [
    selectedBikeId,
    activeBike,
    speedKmh,
    powerWatts,
    riderWeightKg,
    bikeWeightKg,
    temperatureC,
    altitudeM,
    crr,
    drivetrainEfficiencyPct,
    slopePercent,
    headwindKmh
  ]);

  const handleSaveCalculation = () => {
    saveCalculationRecord({
      bikeName: activeBike?.customName || 'Sepeda Default',
      bikeCategory: activeBike?.category || 'AERO_ROAD',
      input: {
        bikeId: selectedBikeId,
        bikeCategory: activeBike?.category || 'AERO_ROAD',
        speedKmh,
        powerWatts,
        riderWeightKg,
        bikeWeightKg,
        temperatureC,
        altitudeM,
        crr,
        drivetrainEfficiencyPct,
        slopePercent,
        headwindKmh
      },
      result: calculationResult,
      source: 'MANUAL'
    });

    setSaveSuccessMsg('Hasil kalkulasi CdA berhasil disimpan ke Riwayat / Dashboard!');
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Modul 2
            </span>
            <span className="text-xs text-slate-400">Power-Based Aerodynamic Drag Formula</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Kalkulator CdA (Coefficient of Drag)
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Hitung hambatan aerodinamika berdasarkan kecepatan, daya (power meter), dan parameter lingkungan fisik secara instan.
          </p>
        </div>

        {/* Mode switcher tabs */}
        <div className="flex items-center gap-2 p-1 bg-slate-900/90 rounded-xl border border-white/10">
          <button className="py-2 px-4 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold text-xs border border-cyan-500/30 shadow-sm flex items-center gap-2">
            <Zap className="w-3.5 h-3.5" />
            Mode A: Quick Estimate
          </button>
          <Link
            href="/calculator/chung"
            className="py-2 px-4 rounded-lg text-slate-400 hover:text-white font-medium text-xs transition flex items-center gap-2"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Mode B: File Import & Chung
          </Link>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Main Grid: Form on Left, Output & Visualizations on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Inputs Form */}
        <div className="lg:col-span-5 space-y-5">
          <div className="glass-panel p-6 rounded-2xl space-y-5">
            
            {/* Bike Context selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Bike className="w-4 h-4 text-cyan-400" />
                  Sepeda Yang Digunakan (Modul 1)
                </label>
                <Link href="/bikes" className="text-[11px] text-cyan-400 hover:underline">
                  Kelola Garasi &rarr;
                </Link>
              </div>

              {userBikes.length > 0 ? (
                <select
                  value={selectedBikeId}
                  onChange={(e) => handleBikeChange(e.target.value)}
                  className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  {userBikes.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.customName} ({b.category.replace('_', ' ')})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 text-xs text-slate-400 flex items-center justify-between">
                  <span>Menggunakan sepeda generik default</span>
                  <Link href="/bikes" className="text-cyan-400 font-semibold hover:underline">
                    Pilih Sepeda &rarr;
                  </Link>
                </div>
              )}
            </div>

            {/* Core Inputs: Speed & Power */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Kecepatan Rata-rata (km/h)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="15"
                    max="65"
                    value={speedKmh}
                    onChange={(e) => setSpeedKmh(Number(e.target.value))}
                    className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-cyan-400"
                  />
                  <Gauge className="w-4 h-4 text-slate-500 absolute right-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Power Rata-rata (Watts)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="5"
                    min="50"
                    max="600"
                    value={powerWatts}
                    onChange={(e) => setPowerWatts(Number(e.target.value))}
                    className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-bold text-cyan-300 focus:outline-none focus:border-cyan-400"
                  />
                  <Zap className="w-4 h-4 text-cyan-500 absolute right-3.5 top-3 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Weights: Rider & Bike */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Berat Badan Rider (kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="40"
                  max="130"
                  value={riderWeightKg}
                  onChange={(e) => setRiderWeightKg(Number(e.target.value))}
                  className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Berat Sepeda + Kit (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="5"
                  max="20"
                  value={bikeWeightKg}
                  onChange={(e) => setBikeWeightKg(Number(e.target.value))}
                  className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Environmental: Temp & Altitude */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                  Suhu Udara (°C)
                </label>
                <input
                  type="number"
                  step="1"
                  min="-5"
                  max="50"
                  value={temperatureC}
                  onChange={(e) => setTemperatureC(Number(e.target.value))}
                  className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1">
                  <Mountain className="w-3.5 h-3.5 text-indigo-400" />
                  Ketinggian / Elevasi (m)
                </label>
                <input
                  type="number"
                  step="25"
                  min="0"
                  max="3500"
                  value={altitudeM}
                  onChange={(e) => setAltitudeM(Number(e.target.value))}
                  className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Air density indicator badge */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs">
              <span className="text-slate-400">Densitas Udara Terhitung (&rho;):</span>
              <span className="font-mono font-bold text-cyan-300">{liveAirDensity} kg/m³</span>
            </div>

            {/* Advanced toggle */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1.5 transition py-1"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                {showAdvanced ? 'Sembunyikan Parameter Lanjutan' : 'Tampilkan Parameter Lanjutan (Crr, Angin, Slope)'}
              </button>

              {showAdvanced && (
                <div className="mt-3 p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-3.5">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-400">Koefisien Gesek Ban (Crr):</span>
                      <span className="font-mono font-bold text-teal-300">{crr}</span>
                    </div>
                    <input
                      type="range"
                      min="0.0025"
                      max="0.0080"
                      step="0.0001"
                      value={crr}
                      onChange={(e) => setCrr(Number(e.target.value))}
                      className="w-full accent-teal-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Kemiringan Jalan (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="-10"
                        max="15"
                        value={slopePercent}
                        onChange={(e) => setSlopePercent(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Angin Lawan (km/h)</label>
                      <input
                        type="number"
                        step="1"
                        min="-30"
                        max="40"
                        value={headwindKmh}
                        onChange={(e) => setHeadwindKmh(Number(e.target.value))}
                        placeholder="+ lawan, - dorong"
                        className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Efisiensi Drivetrain:</span>
                    <span className="font-mono text-slate-300">{drivetrainEfficiencyPct}%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <button
              onClick={handleSaveCalculation}
              className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 border border-white/10 transition"
            >
              <Save className="w-4 h-4 text-cyan-400" />
              Simpan Hasil ke Riwayat Ride
            </button>
          </div>
        </div>

        {/* Right Column: Calculated CdA Showcase & Deep Visual Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main CdA Card */}
          <div className="glass-panel-glow p-6 rounded-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-cyan-400 block mb-1">
                  Hasil Kalkulasi CdA Anda
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-white tracking-tight font-mono">
                    {calculationResult.cda.toFixed(4)}
                  </span>
                  <span className="text-sm font-semibold text-slate-400">m²</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="text-right sm:text-right">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 mb-1">
                  {calculationResult.positionEvaluation.label}
                </span>
                <p className="text-[11px] text-slate-400 max-w-xs">
                  {calculationResult.positionEvaluation.description}
                </p>
              </div>
            </div>

            {/* Impact Projection Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-5">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5">
                <div className="flex items-center gap-1 text-cyan-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Kenaikan Kecepatan
                </div>
                <div className="text-xl font-extrabold text-white">
                  +{calculationResult.impactEstimates.speedIncreaseAtSamePowerKmh} <span className="text-xs text-slate-400">km/h</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">Bila CdA turun 0.02 pada daya sama</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5">
                <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                  <Flame className="w-3.5 h-3.5" />
                  Penghematan Daya
                </div>
                <div className="text-xl font-extrabold text-emerald-300">
                  -{calculationResult.impactEstimates.wattsSavedAtSameSpeed} <span className="text-xs text-slate-400">Watt</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">Daya dihemat pada kecepatan ini</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5">
                <div className="flex items-center gap-1 text-indigo-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  Waktu 40 km
                </div>
                <div className="text-xl font-extrabold text-indigo-300">
                  -{calculationResult.impactEstimates.timeSaved40kmMinutes} <span className="text-xs text-slate-400">menit</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">Waktu terpangkas di rute flat 40km</span>
              </div>
            </div>

            {/* Direct CTA to Recommendations */}
            <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-300">
                Ingin menurunkan CdA ini menjadi <strong className="text-cyan-300">{(calculationResult.cda - 0.025).toFixed(4)} m²</strong>?
              </span>
              <Link
                href="/recommendations"
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20 transition"
              >
                <Lightbulb className="w-4 h-4" />
                Buka Tips Rekomendasi & AI
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Power Breakdown component */}
          <PowerBreakdownChart
            breakdown={calculationResult.breakdown}
            totalPower={powerWatts}
          />

          {/* Benchmark comparison table */}
          <PositionBenchmarkTable currentCda={calculationResult.cda} />

        </div>

      </div>

    </div>
  );
}
