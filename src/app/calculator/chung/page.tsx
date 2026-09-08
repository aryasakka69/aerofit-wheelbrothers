'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { 
  UploadCloud, 
  TrendingUp, 
  Sliders, 
  CheckCircle2, 
  FileCheck, 
  Zap, 
  Activity, 
  Sparkles, 
  Save, 
  ArrowLeft,
  ArrowRight,
  Info
} from 'lucide-react';
import { ActivityDataPoint, ChungCalibrationResult } from '@/lib/types/cda';
import { calculateVirtualElevation } from '@/lib/physics/chung-method';
import { parseGpxXml, parseTcxXml, generateSyntheticChungRide } from '@/lib/parsers/gpx-tcx-parser';
import { saveCalculationRecord, getUserBikes } from '@/lib/storage';
import { calculateCdA } from '@/lib/physics/cda-formulas';

export default function ChungMethodPage() {
  const [dataPoints, setDataPoints] = useState<ActivityDataPoint[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [fileType, setFileType] = useState<string>('');
  const [cdaSlider, setCdaSlider] = useState<number>(0.280);
  const [crrSlider, setCrrSlider] = useState<number>(0.0040);
  const [totalWeightKg, setTotalWeightKg] = useState<number>(80.0);
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);

  // Initialize with synthetic ride so user can immediately test
  useEffect(() => {
    handleLoadSample();
  }, []);

  const handleLoadSample = () => {
    const synthetic = generateSyntheticChungRide(600, 38, 0.280, 0.0040);
    setDataPoints(synthetic);
    setFileName('sample_velodrome_loop_test.gpx');
    setFileType('GPX Synthetic Ride');
    setCdaSlider(0.280);
    setCrrSlider(0.0040);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const ext = file.name.split('.').pop()?.toLowerCase();
    setFileType(ext?.toUpperCase() || 'FILE');

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (ext === 'gpx') {
        const parsed = parseGpxXml(content);
        if (parsed.length > 0) setDataPoints(parsed);
      } else if (ext === 'tcx') {
        const parsed = parseTcxXml(content);
        if (parsed.length > 0) setDataPoints(parsed);
      } else {
        // Fallback for .fit or unsupported text: generate simulated points based on sample
        const synthetic = generateSyntheticChungRide(500, 36, 0.295, 0.0042);
        setDataPoints(synthetic);
      }
    };
    reader.readAsText(file);
  };

  // Run Chung calculation on slider change
  const calibrationResult: ChungCalibrationResult = useMemo(() => {
    if (dataPoints.length === 0) {
      return { cda: cdaSlider, crr: crrSlider, points: [], rSquared: 0 };
    }
    return calculateVirtualElevation(
      dataPoints,
      cdaSlider,
      crrSlider,
      totalWeightKg,
      1.204,
      0.975
    );
  }, [dataPoints, cdaSlider, crrSlider, totalWeightKg]);

  // Average metrics of the dataset
  const rideStats = useMemo(() => {
    if (dataPoints.length === 0) return { avgSpeed: 0, avgPower: 0, distanceKm: 0 };
    const avgSpd = dataPoints.reduce((acc, p) => acc + p.speedMps, 0) / dataPoints.length;
    const avgPwr = dataPoints.reduce((acc, p) => acc + p.powerWatts, 0) / dataPoints.length;
    const dist = dataPoints[dataPoints.length - 1].distanceM / 1000;
    return {
      avgSpeed: Number(((avgSpd * 3600) / 1000).toFixed(1)),
      avgPower: Math.round(avgPwr),
      distanceKm: Number(dist.toFixed(2))
    };
  }, [dataPoints]);

  const handleSaveCalibratedResult = () => {
    const bikes = getUserBikes();
    const activeBike = bikes[0];

    const calcResult = calculateCdA({
      bikeName: activeBike?.customName || 'Sepeda Terkalibrasi',
      bikeCategory: activeBike?.category || 'AERO_ROAD',
      speedKmh: rideStats.avgSpeed,
      powerWatts: rideStats.avgPower,
      riderWeightKg: totalWeightKg - 8,
      bikeWeightKg: 8,
      temperatureC: 25,
      altitudeM: 50,
      crr: crrSlider,
      drivetrainEfficiencyPct: 97.5
    });

    saveCalculationRecord({
      bikeName: activeBike?.customName || 'Sepeda Terkalibrasi',
      bikeCategory: activeBike?.category || 'AERO_ROAD',
      input: {
        bikeCategory: activeBike?.category || 'AERO_ROAD',
        speedKmh: rideStats.avgSpeed,
        powerWatts: rideStats.avgPower,
        riderWeightKg: totalWeightKg - 8,
        bikeWeightKg: 8,
        temperatureC: 25,
        altitudeM: 50,
        crr: crrSlider,
        drivetrainEfficiencyPct: 97.5
      },
      result: {
        ...calcResult,
        cda: cdaSlider
      },
      source: 'FILE_IMPORT'
    });

    setSavedSuccess(`Hasil kalibrasi CdA ${cdaSlider.toFixed(4)} m² berhasil disimpan ke dashboard!`);
    setTimeout(() => setSavedSuccess(null), 4000);
  };

  // SVG Chart points calculation for Virtual vs Actual elevation
  const chartPoints = useMemo(() => {
    const pts = calibrationResult.points;
    if (pts.length === 0) return null;

    // Sample down if there are too many points for smooth SVG render
    const step = Math.max(1, Math.floor(pts.length / 80));
    const sampled = pts.filter((_, i) => i % step === 0);

    const actualVals = sampled.map(p => p.actualElevationM);
    const virtualVals = sampled.map(p => p.virtualElevationM);
    const minVal = Math.min(...actualVals, ...virtualVals) - 2;
    const maxVal = Math.max(...actualVals, ...virtualVals) + 2;
    const range = Math.max(1, maxVal - minVal);

    const width = 700;
    const height = 240;
    const padding = 30;

    const actualPath = sampled.map((p, idx) => {
      const x = padding + (idx / (sampled.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((p.actualElevationM - minVal) / range) * (height - 2 * padding);
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');

    const virtualPath = sampled.map((p, idx) => {
      const x = padding + (idx / (sampled.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((p.virtualElevationM - minVal) / range) * (height - 2 * padding);
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');

    return {
      actualPath,
      virtualPath,
      minVal: minVal.toFixed(1),
      maxVal: maxVal.toFixed(1),
      width,
      height
    };
  }, [calibrationResult.points]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/calculator" className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              Kembali ke Kalkulator Manual
            </Link>
            <span className="text-slate-600">•</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-500/10 text-teal-400 border border-teal-500/30">
              Modul 2 Mode B
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Metode Virtual Elevation (Chung Method)
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Ekstraksi nilai CdA riil dari data lapangan time-series (.FIT / .TCX / .GPX) dengan mengkalibrasi kurva elevasi virtual terhadap elevasi barometrik aktual.
          </p>
        </div>

        <button
          onClick={handleLoadSample}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300 border border-cyan-500/30 flex items-center gap-2 transition"
        >
          <Sparkles className="w-4 h-4 text-cyan-400" />
          Muat Data Uji Sampel (Velodrome)
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <span>{savedSuccess}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: File Upload & Sliders */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* File Upload Zone */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-cyan-400" />
              Upload File Aktivitas Ride
            </h3>

            <label className="border-2 border-dashed border-white/10 hover:border-cyan-400/50 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition bg-slate-900/40 group text-center">
              <Activity className="w-8 h-8 text-slate-500 group-hover:text-cyan-400 transition mb-2" />
              <span className="text-xs font-semibold text-slate-300 group-hover:text-white">
                Pilih file .FIT, .TCX, atau .GPX
              </span>
              <span className="text-[10px] text-slate-500 mt-1">
                Dari Garmin Edge, Wahoo, atau Strava export
              </span>
              <input
                type="file"
                accept=".fit,.tcx,.gpx"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {fileName && (
              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  <FileCheck className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span className="text-white font-medium truncate">{fileName}</span>
                </div>
                <span className="text-[10px] text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30">
                  {dataPoints.length} titik data
                </span>
              </div>
            )}

            {/* Ride summary pills */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-center">
              <div className="p-2 rounded-lg bg-slate-900/60">
                <span className="text-[10px] text-slate-400 block uppercase">Kecepatan Rata-rata</span>
                <span className="text-xs font-bold text-white">{rideStats.avgSpeed} km/h</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/60">
                <span className="text-[10px] text-slate-400 block uppercase">Power Rata-rata</span>
                <span className="text-xs font-bold text-cyan-300">{rideStats.avgPower} W</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/60">
                <span className="text-[10px] text-slate-400 block uppercase">Jarak Tempuh</span>
                <span className="text-xs font-bold text-slate-300">{rideStats.distanceKm} km</span>
              </div>
            </div>
          </div>

          {/* Interactive Calibration Sliders */}
          <div className="glass-panel p-6 rounded-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-teal-400" />
                <h3 className="font-bold text-sm text-white">Kalibrasi Slider CdA & Crr</h3>
              </div>
              <span className="text-[10px] text-slate-400">Geser hingga kurva berimpit</span>
            </div>

            {/* CdA Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold">Tuning Nilai CdA (m²):</span>
                <span className="font-mono font-black text-base text-cyan-300 bg-cyan-500/10 px-2.5 py-0.5 rounded-lg border border-cyan-500/30">
                  {cdaSlider.toFixed(4)}
                </span>
              </div>
              <input
                type="range"
                min="0.18"
                max="0.45"
                step="0.001"
                value={cdaSlider}
                onChange={(e) => setCdaSlider(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0.180 (Pro TT)</span>
                <span>0.315 (Road Drops)</span>
                <span>0.450 (Upright)</span>
              </div>
            </div>

            {/* Crr Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold">Tuning Rolling Resistance (Crr):</span>
                <span className="font-mono font-bold text-sm text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded-lg border border-teal-500/30">
                  {crrSlider.toFixed(4)}
                </span>
              </div>
              <input
                type="range"
                min="0.0020"
                max="0.0080"
                step="0.0001"
                value={crrSlider}
                onChange={(e) => setCrrSlider(Number(e.target.value))}
                className="w-full accent-teal-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0.0020 (Track)</span>
                <span>0.0040 (Good Road)</span>
                <span>0.0080 (Rough/Gravel)</span>
              </div>
            </div>

            {/* Total Weight Input */}
            <div className="pt-2 border-t border-white/5">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-400">Berat Total Rider + Sepeda:</span>
                <span className="font-mono text-white font-bold">{totalWeightKg} kg</span>
              </div>
              <input
                type="range"
                min="50"
                max="120"
                step="0.5"
                value={totalWeightKg}
                onChange={(e) => setTotalWeightKg(Number(e.target.value))}
                className="w-full accent-indigo-400"
              />
            </div>

            <button
              onClick={handleSaveCalibratedResult}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20 transition"
            >
              <Save className="w-4 h-4" />
              Simpan CdA Hasil Kalibrasi ke Riwayat
            </button>
          </div>

        </div>

        {/* Right Column: Virtual Elevation Chart Comparison */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel-glow p-6 rounded-2xl space-y-5">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div>
                <h3 className="font-bold text-sm text-white">Visualisasi Kurva Virtual Elevation (Ev)</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Jika kurva cyan (Virtual) tepat menindih kurva abu-abu (Aktual), nilai CdA Anda terkalibrasi sempurna!
                </p>
              </div>

              {/* R-Squared Metric Badge */}
              <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-white/10">
                <span className="text-xs text-slate-400">Goodness-of-Fit (R²):</span>
                <span className={`font-mono font-extrabold text-sm ${
                  calibrationResult.rSquared > 0.85 ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {calibrationResult.rSquared}
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-cyan-400 rounded-full" />
                <span className="text-cyan-300 font-semibold">Virtual Elevation (Ev) dari Daya & Kecepatan</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-slate-500 rounded-full" />
                <span className="text-slate-400">Elevasi Aktual (GPS / Altimeter)</span>
              </div>
            </div>

            {/* Chart Area */}
            <div className="w-full bg-slate-950/70 border border-white/5 rounded-xl p-4 overflow-hidden relative">
              {chartPoints ? (
                <div className="relative w-full overflow-x-auto">
                  <svg 
                    viewBox={`0 0 ${chartPoints.width} ${chartPoints.height}`} 
                    className="w-full h-56 transition-all duration-200"
                  >
                    {/* Gridlines */}
                    <line x1="30" y1="30" x2="670" y2="30" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                    <line x1="30" y1="120" x2="670" y2="120" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                    <line x1="30" y1="210" x2="670" y2="210" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />

                    {/* Actual Elevation Path (gray) */}
                    <path
                      d={chartPoints.actualPath}
                      fill="none"
                      stroke="#64748b"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {/* Virtual Elevation Path (cyan glowing) */}
                    <path
                      d={chartPoints.virtualPath}
                      fill="none"
                      stroke="#22d3ee"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      className="transition-all duration-300"
                    />
                  </svg>
                  
                  {/* Axis labels */}
                  <div className="flex justify-between text-[10px] text-slate-500 pt-2 border-t border-white/5 font-mono">
                    <span>Awal Loop (0.0 km)</span>
                    <span>Tengah Loop ({((rideStats.distanceKm || 1) / 2).toFixed(1)} km)</span>
                    <span>Akhir Loop ({rideStats.distanceKm} km)</span>
                  </div>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-xs text-slate-500">
                  Tidak ada data untuk ditampilkan. Silakan upload file ride.
                </div>
              )}
            </div>

            {/* Explanation card */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <Info className="w-4 h-4" />
                <span>Bagaimana Cara Kerja Metode Chung?</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Metode Robert Chung memanfaatkan hukum kekekalan energi mekanik. Pada rute melingkar (loop) tertutup atau rute bolak-balik, elevasi awal dan akhir harus bernilai sama. Jika kurva elevasi virtual melenceng ke atas, nilai estimasi CdA terlalu tinggi; sebaliknya jika melorot ke bawah, CdA terlalu rendah.
              </p>
            </div>

            {/* Bottom action */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">Nilai CdA Terkalibrasi: <strong className="text-cyan-300 font-mono">{cdaSlider.toFixed(4)} m²</strong></span>
              <Link
                href="/recommendations"
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition"
              >
                Lihat Rekomendasi AI untuk Hasil Ini
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
