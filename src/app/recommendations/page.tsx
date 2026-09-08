'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Lightbulb, 
  Sparkles, 
  Flame, 
  TrendingDown, 
  CheckCircle, 
  ArrowRight, 
  RefreshCw, 
  Bot, 
  Camera, 
  ShieldCheck, 
  Zap, 
  DollarSign, 
  Filter,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';
import { getSavedCalculations, getUserBikes } from '@/lib/storage';
import { generateRecommendations, AeroTip, RecommendationEngineOutput } from '@/lib/recommendations/rules-engine';
import { calculateCdA } from '@/lib/physics/cda-formulas';
import { BikeCategory } from '@/lib/types/bike';

export default function RecommendationsPage() {
  const [activeTab, setActiveTab] = useState<'ALL' | 'QUICK_WINS' | 'BODY_POSITION' | 'EQUIPMENT' | 'APPAREL_ACCESSORIES'>('ALL');
  const [cdaValue, setCdaValue] = useState<number>(0.320);
  const [bikeName, setBikeName] = useState<string>('Sepeda Road Standar');
  const [bikeCategory, setBikeCategory] = useState<BikeCategory>('ROAD_ALLROUNDER');
  const [aiNarrative, setAiNarrative] = useState<string>('');
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [isAiGenerated, setIsAiGenerated] = useState<boolean>(false);

  // Load latest calculation or bike on mount
  useEffect(() => {
    const history = getSavedCalculations();
    const bikes = getUserBikes();

    if (history.length > 0) {
      const latest = history[0];
      setCdaValue(latest.result.cda);
      setBikeName(latest.bikeName);
      setBikeCategory(latest.bikeCategory);
    } else if (bikes.length > 0) {
      setBikeName(bikes[0].customName);
      setBikeCategory(bikes[0].category);
      setCdaValue(0.325);
    }
  }, []);

  // Run deterministic rule engine
  const recommendationsOutput: RecommendationEngineOutput = useMemo(() => {
    const mockCalc = calculateCdA({
      bikeCategory,
      speedKmh: 38,
      powerWatts: 275,
      riderWeightKg: 72,
      bikeWeightKg: 8,
      temperatureC: 28,
      altitudeM: 50,
      crr: 0.0040,
      drivetrainEfficiencyPct: 97.5
    });
    // Override with active cdaValue
    mockCalc.cda = cdaValue;

    return generateRecommendations(mockCalc, bikeCategory);
  }, [cdaValue, bikeCategory]);

  // Fetch AI Narrative
  const fetchNarrative = async () => {
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/recommendations/narrative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cda: cdaValue,
          bikeName,
          bikeCategory,
          recommendations: recommendationsOutput
        })
      });
      const data = await res.json();
      if (data.narrative) {
        setAiNarrative(data.narrative);
        setIsAiGenerated(data.isAiGenerated);
      }
    } catch (err) {
      console.error('Failed to load narrative', err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  useEffect(() => {
    fetchNarrative();
  }, [cdaValue, bikeCategory]);

  // Filtered tips
  const displayedTips = useMemo(() => {
    const tips = recommendationsOutput.tips;
    if (activeTab === 'QUICK_WINS') {
      return tips.filter(t => t.badge === 'Quick Win');
    }
    if (activeTab === 'BODY_POSITION') {
      return tips.filter(t => t.category === 'BODY_POSITION');
    }
    if (activeTab === 'EQUIPMENT') {
      return tips.filter(t => t.category === 'EQUIPMENT');
    }
    if (activeTab === 'APPAREL_ACCESSORIES') {
      return tips.filter(t => t.category === 'APPAREL_ACCESSORIES');
    }
    return tips;
  }, [recommendationsOutput.tips, activeTab]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Modul 3
            </span>
            <span className="text-xs text-slate-400">Rule-Based Tips & AI Performance Narrative</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Rekomendasi Optimasi Aerodinamika
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Saran terukur berbasis literatur ilmiah dan data sepeda Anda, diurutkan dari dampak tertinggi dengan biaya terendah (*Quick Wins*).
          </p>
        </div>

        {/* Current CdA indicator & Adjuster */}
        <div className="flex items-center gap-3 p-2 bg-slate-900/90 rounded-2xl border border-white/10">
          <div className="text-right pl-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">CdA Acuan Saat Ini</span>
            <span className="font-mono font-extrabold text-base text-cyan-300">{cdaValue.toFixed(4)} m²</span>
          </div>
          <Link
            href="/calculator"
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-white/10 transition"
          >
            Ubah
          </Link>
        </div>
      </div>

      {/* Top Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Potensi Pemangkasan CdA</span>
            <span className="text-2xl font-extrabold text-white font-mono">
              -{recommendationsOutput.summary.totalPotentialCdaReduction} <span className="text-xs text-slate-400">m²</span>
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Dari 4 tips prioritas teratas</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Potensi Penghematan Daya</span>
            <span className="text-2xl font-extrabold text-emerald-300 font-mono">
              ~{recommendationsOutput.summary.totalPotentialWattsSaved} <span className="text-xs text-slate-400">Watt</span>
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Pada kecepatan 40 km/h</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Quick Wins Gratis</span>
            <span className="text-2xl font-extrabold text-indigo-300 font-mono">
              {recommendationsOutput.summary.quickWinsCount} <span className="text-xs text-slate-400">tips</span>
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Perbaikan postur tanpa biaya tambahan</span>
          </div>
        </div>
      </div>

      {/* AI Narrative Layer Card (Gemini API) */}
      <div className="glass-panel-glow p-6 sm:p-8 rounded-3xl relative overflow-hidden border-cyan-500/30">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Analisis Naratif Coach AeroFit</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  {isAiGenerated ? 'Gemini 1.5 Flash' : 'AeroFit Engine'}
                </span>
              </div>
              <p className="text-xs text-slate-400">Dirangkai secara personal untuk {bikeName}</p>
            </div>
          </div>

          <button
            onClick={fetchNarrative}
            disabled={isLoadingAi}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-white/10 disabled:opacity-50"
            title="Refresh Narasi AI"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingAi ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>

        {/* Narrative Body */}
        <div className="mt-5 text-slate-200 text-sm leading-relaxed space-y-4">
          {isLoadingAi ? (
            <div className="py-8 flex flex-col items-center justify-center gap-3 text-slate-400 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
              <span>Menyusun narasi personal dari Gemini AI...</span>
            </div>
          ) : (
            <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {aiNarrative}
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
          <span>* Data numerik berasal dari kalkulasi fisika deterministik. Gemini API merangkai gaya bahasa rekomendasi.</span>
          <span className="font-semibold text-cyan-400">Resilient Cached Output</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900/80 rounded-2xl border border-white/10 w-fit">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'ALL' ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Semua Tips ({recommendationsOutput.tips.length})
          </button>
          <button
            onClick={() => setActiveTab('QUICK_WINS')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'QUICK_WINS' ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            ⚡ Quick Wins (Prioritas)
          </button>
          <button
            onClick={() => setActiveTab('BODY_POSITION')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'BODY_POSITION' ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Posisi Tubuh
          </button>
          <button
            onClick={() => setActiveTab('EQUIPMENT')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'EQUIPMENT' ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Komponen & Gear
          </button>
          <button
            onClick={() => setActiveTab('APPAREL_ACCESSORIES')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'APPAREL_ACCESSORIES' ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pakaian & Aksesoris
          </button>
        </div>

        {/* Tips Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedTips.map((tip) => {
            return (
              <div 
                key={tip.id}
                className="glass-panel p-6 rounded-2xl flex flex-col justify-between hover:border-cyan-500/40 transition-all duration-200 group"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      tip.badge === 'Quick Win'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : tip.badge === 'High Impact'
                          ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                          : tip.badge === 'Gear Upgrade'
                            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}>
                      {tip.badge}
                    </span>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span>Biaya: <strong className="text-slate-200">{tip.costLevel}</strong></span>
                      <span>•</span>
                      <span>Effort: <strong className="text-slate-200">{tip.effortLevel}</strong></span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors mb-2">
                    {tip.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {tip.description}
                  </p>
                </div>

                {/* Bottom Impact Metrics */}
                <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Potensi &Delta;CdA</span>
                    <span className="font-mono font-bold text-xs text-cyan-300">
                      {tip.estimatedCdaDeltaMin.toFixed(3)} s/d {tip.estimatedCdaDeltaMax.toFixed(3)} m²
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Penghematan @ 40km/h</span>
                    <span className="font-mono font-extrabold text-sm text-emerald-400">
                      ~{tip.estimatedWattsSavedAt40Kmh} Watt
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Box towards Module 4 (Bike Fitting via Camera) */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-indigo-950/60 border border-cyan-500/30 glass-panel relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Tahap Lanjutan (Modul 4)
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Ingin Analisis Postur yang Lebih Presisi & Personal?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Tips di atas bersifat umum. Masuklah ke <strong>Modul 4: Bike Fitting via Kamera (MediaPipe Pose Tracking)</strong> untuk memindai sudut lutut, torso, siku, dan drop stang Anda secara real-time dari video webcam.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/bike-fit"
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition"
            >
              <Camera className="w-4 h-4" />
              Mulai Bike Fitting Kamera
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
