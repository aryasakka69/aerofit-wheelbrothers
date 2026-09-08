'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  Camera,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  Waves,
  Sparkles,
  Bot,
  RefreshCw,
  Save,
  Sliders,
  Bike,
  Activity,
  Check,
  ChevronRight
} from 'lucide-react';
import PoseTrackerCanvas from '@/components/fitting/PoseTrackerCanvas';
import {
  PoseLandmarks,
  BiomechanicalAngles,
  SAMPLE_POSES,
  extractBiomechanicalAngles,
  evaluateFitAngles,
  AngleEvaluation
} from '@/lib/fitting/angles';
import { getUserBikes, saveBikeFitScan, getLatestBikeFitScan } from '@/lib/storage';
import { UserBikeProfile, BikeCategory } from '@/lib/types/bike';

export default function BikeFitPage() {
  const [userBikes, setUserBikes] = useState<UserBikeProfile[]>([]);
  const [selectedBikeId, setSelectedBikeId] = useState<string>('');
  const [landmarks, setLandmarks] = useState<PoseLandmarks>(SAMPLE_POSES.ROAD_AGGRESSIVE);
  const [angles, setAngles] = useState<BiomechanicalAngles>(extractBiomechanicalAngles(SAMPLE_POSES.ROAD_AGGRESSIVE));
  const [aiNarrative, setAiNarrative] = useState<string>('');
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Load bikes on mount
  useEffect(() => {
    const bikes = getUserBikes();
    setUserBikes(bikes);
    if (bikes.length > 0) {
      setSelectedBikeId(bikes[0].id);
    }
  }, []);

  const activeBike = useMemo(() => {
    return userBikes.find(b => b.id === selectedBikeId) || userBikes[0] || null;
  }, [userBikes, selectedBikeId]);

  const activeCategory: BikeCategory = activeBike?.category || 'AERO_ROAD';

  // Evaluate angles against active bike category
  const angleEvaluations: AngleEvaluation[] = useMemo(() => {
    return evaluateFitAngles(angles, activeCategory);
  }, [angles, activeCategory]);

  // Handle pose updates from canvas
  const handlePoseAnalyzed = useCallback((newLandmarks: PoseLandmarks, newAngles: BiomechanicalAngles) => {
    setLandmarks(newLandmarks);
    setAngles(newAngles);
  }, []);

  // Fetch AI Narrative
  const fetchAiSummary = async () => {
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/bike-fit/narrative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          angles,
          evaluations: angleEvaluations,
          bikeName: activeBike?.customName || 'Sepeda Balap',
          bikeCategory: activeCategory
        })
      });
      const data = await res.json();
      if (data.narrative) {
        setAiNarrative(data.narrative);
      }
    } catch (err) {
      console.error('Error fetching bike fit narrative', err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  useEffect(() => {
    fetchAiSummary();
  }, [selectedBikeId]);

  // Save Scan to Storage
  const handleSaveScan = () => {
    saveBikeFitScan({
      bikeId: selectedBikeId,
      bikeName: activeBike?.customName || 'Sepeda Saya',
      bikeCategory: activeCategory,
      angles,
      evaluations: angleEvaluations,
      landmarks,
      aiSummary: aiNarrative
    });
    setSaveSuccessMsg('Hasil Bike Fit Scan berhasil disimpan! Data ini siap divisualisasikan pada Modul 5 (CFD).');
    setTimeout(() => setSaveSuccessMsg(null), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Modul 4
            </span>
            <span className="text-xs text-slate-400">Computer Vision Pose Tracking & Biomechanics</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Bike Fitting via Kamera & Analisis Postur
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Pindai sudut lutut, kemiringan torso, dan tekukan siku secara visual tanpa sensor mahal, lalu sesuaikan dengan standar ideal geometri sepeda Anda.
          </p>
        </div>

        {/* Bike Context Switcher */}
        <div className="flex items-center gap-3 p-2 bg-slate-900/90 rounded-2xl border border-white/10">
          <Bike className="w-4 h-4 text-cyan-400 ml-2" />
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Kategori Acuan</span>
            <span className="text-xs font-bold text-cyan-300">
              {activeCategory.replace('_', ' ')}
            </span>
          </div>
          <Link
            href="/bikes"
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-white/10 transition"
          >
            Ganti Sepeda
          </Link>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            <span>{saveSuccessMsg}</span>
          </div>
          <Link
            href="/simulation"
            className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-400 transition"
          >
            Buka Simulasi CFD &rarr;
          </Link>
        </div>
      )}

      {/* Main Layout: Canvas on Left, Evaluations & Table on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: Interactive Pose Canvas */}
        <div className="lg:col-span-7 space-y-6">
          <PoseTrackerCanvas
            bikeCategory={activeCategory}
            onPoseAnalyzed={handlePoseAnalyzed}
          />

          {/* Guidelines Box */}
          <div className="glass-panel p-5 rounded-2xl space-y-2 text-xs text-slate-400 border-white/5">
            <h4 className="font-bold text-slate-200 flex items-center gap-2">
              <Camera className="w-4 h-4 text-cyan-400" />
              Panduan Pengambilan Video/Kamera:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
              <li>Posisikan kamera/ponsel tegak lurus 90° tepat di sisi samping pesepeda (setinggi lutut atau crank).</li>
              <li>Pastikan kayuhan pedal berada di titik terendah (jam 6 / BDC) saat mengukur ekstensi sudut lutut.</li>
              <li>Kenakan pakaian pas badan (*jersey/bibs*) agar garis sendi panggul dan lutut terlihat jelas.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Angles Table, AI Summary & CFD Link */}
        <div className="lg:col-span-5 space-y-6">

          {/* Angles Comparison Table */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-white">Sudut Biomekanik vs Rentang Ideal</h3>
              </div>
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                {activeCategory.replace('_', ' ')}
              </span>
            </div>

            <div className="space-y-3">
              {angleEvaluations.map((item, idx) => {
                const isOptimal = item.status === 'OPTIMAL';
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border transition-all ${isOptimal
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : 'bg-amber-950/20 border-amber-500/30'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs text-white">{item.angleName}</span>
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${isOptimal
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        }`}>
                        {item.status === 'OPTIMAL' ? 'Optimal' : item.status === 'TOO_LOW' ? 'Terlalu Rendah' : 'Terlalu Tinggi'}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs mb-2">
                      <div>
                        <span className="text-slate-400">Sudut Aktual: </span>
                        <span className="font-mono font-black text-sm text-white">{item.actualDeg}°</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Rentang Ideal: </span>
                        <span className="font-mono font-semibold text-cyan-300">{item.idealMinDeg}° – {item.idealMaxDeg}°</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed pt-2 border-t border-white/5">
                      {item.recommendation}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Action Save */}
            <button
              onClick={handleSaveScan}
              className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/10 transition"
            >
              <Save className="w-4 h-4 text-cyan-400" />
              Simpan Hasil Bike Fit Scan Ini
            </button>
          </div>

          {/* AI Narrative Card (Gemini API) */}
          <div className="glass-panel-glow p-6 rounded-2xl space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-white">Ringkasan Naratif Bike Fitter AI</h3>
              </div>
              <button
                onClick={fetchAiSummary}
                disabled={isLoadingAi}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                title="Refresh Narasi AI"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAi ? 'animate-spin text-cyan-400' : ''}`} />
              </button>
            </div>

            {isLoadingAi ? (
              <div className="py-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Merangkai analisis fit...</span>
              </div>
            ) : (
              <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {aiNarrative}
              </div>
            )}
          </div>

          {/* Prominent CTA to Module 5 (CFD Airflow Simulation) */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/60 to-indigo-950/60 border border-cyan-500/40 glass-panel space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-extrabold uppercase tracking-widest">
              <Waves className="w-4 h-4" />
              Lanjut ke Modul 5
            </div>
            <h4 className="text-base font-bold text-white tracking-tight">
              Visualisasikan Hambatan Udara dari Posisi Ini
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Kirim siluet postur Anda dan geometri sepeda ke <strong>Simulasi CFD Aliran Udara</strong> untuk melihat garis streamlines dan turbulensi di belakang punggung secara langsung!
            </p>

            <Link
              href="/simulation"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition"
            >
              Mulai Simulasi CFD Aliran Udara
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>

      </div>

      {/* Biomechanical Disclaimer */}
      <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/5 text-[11px] text-slate-400 flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <p>
          <strong>Disclaimer Biomekanik:</strong> Fitur Bike Fitting via Kamera AeroFit adalah alat bantu estimasi visual berbasis trigonometri sudut. Untuk keluhan nyeri persendian kronis, cedera, atau penyesuaian cleat mikroskopis, selalu konsultasikan dengan bike fitter profesional bersertifikat medis.
        </p>
      </div>

    </div>
  );
}
